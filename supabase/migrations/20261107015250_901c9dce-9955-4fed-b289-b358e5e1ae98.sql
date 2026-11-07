CREATE TABLE public.school_memberships (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,school_id));
GRANT SELECT ON public.school_memberships TO authenticated;
GRANT ALL ON public.school_memberships TO service_role;
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read own school membership" ON public.school_memberships FOR SELECT TO authenticated USING (user_id=auth.uid() OR private.has_role(auth.uid(),'super_admin'::public.app_role));
CREATE TRIGGER school_memberships_updated_at BEFORE UPDATE ON public.school_memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION private.current_school_id() RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid; memberships integer;
BEGIN
 SELECT count(*),(array_agg(m.school_id))[1] INTO memberships,result FROM public.school_memberships m JOIN public.profiles p ON p.id=m.user_id JOIN public.schools s ON s.id=m.school_id WHERE m.user_id=auth.uid() AND p.status='active' AND s.active;
 IF memberships<>1 THEN RETURN NULL; END IF;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION private.current_school_id() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.current_school_id() TO authenticated,service_role;

DO $$ DECLARE t text; only_school uuid; BEGIN
 IF (SELECT count(*) FROM public.schools)<>1 THEN RAISE EXCEPTION 'Ownership backfill requires exactly one confirmed school.'; END IF;
 SELECT id INTO only_school FROM public.schools;
 FOREACH t IN ARRAY ARRAY['profiles','user_roles','admissions','assignments','assignment_groups','assignment_group_members','assignment_submissions','assignment_regrade_requests','exams_quizzes','exam_questions','exam_submissions','exam_answers','lessons','lesson_completions','interventions','result_publications','teaching_assignments','student_assessments','student_attendance','student_exeat','student_fees','student_performance','staff_performance','staff_schedules','offer_letters','class_teachers','finance_income','finance_expenses','finance_payroll','audit_logs','messaging_direct_messages','messaging_announcement_reads','messaging_conversation_participants'] LOOP
 EXECUTE format('ALTER TABLE public.%I ADD COLUMN school_id uuid REFERENCES public.schools(id)',t);
 IF t='user_roles' THEN EXECUTE 'UPDATE public.user_roles SET school_id=$1 WHERE role<>''super_admin''' USING only_school;
 ELSE EXECUTE format('UPDATE public.%I SET school_id=$1',t) USING only_school; END IF;
 EXECUTE format('CREATE INDEX %I ON public.%I(school_id)',t||'_tenant_idx',t);
 END LOOP;
 INSERT INTO public.school_memberships(user_id,school_id) SELECT id,only_school FROM public.profiles;
END; $$;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role AND ((_role='super_admin' AND school_id IS NULL) OR school_id=private.current_school_id()))
$$;
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.has_role(_user_id,'super_admin') OR private.has_role(_user_id,'school_manager')
$$;

CREATE OR REPLACE FUNCTION public.resolve_school_context() RETURNS uuid LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE result uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required.' USING ERRCODE='42501'; END IF;
 result:=private.current_school_id();
 IF result IS NULL THEN RAISE EXCEPTION 'An active, unambiguous school membership is required.' USING ERRCODE='42501'; END IF;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.resolve_school_context() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.resolve_school_context() TO authenticated;

CREATE OR REPLACE FUNCTION private.enforce_school_contract() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE payload jsonb; parent record; parent_school uuid; linked_id uuid; role_value text;
BEGIN
 payload:=to_jsonb(NEW);
 role_value:=payload->>'role';
 IF TG_OP='UPDATE' AND NEW.school_id IS DISTINCT FROM OLD.school_id THEN RAISE EXCEPTION 'School ownership cannot be changed.' USING ERRCODE='42501'; END IF;
 IF TG_TABLE_NAME='user_roles' AND role_value='super_admin' THEN
   IF NEW.school_id IS NOT NULL THEN RAISE EXCEPTION 'Platform roles must be global.'; END IF;
   RETURN NEW;
 END IF;
 IF NEW.school_id IS NULL THEN NEW.school_id:=private.current_school_id(); END IF;
 IF NEW.school_id IS NULL THEN RAISE EXCEPTION 'Explicit school ownership is required.' USING ERRCODE='42501'; END IF;
 IF auth.uid() IS NOT NULL AND NEW.school_id IS DISTINCT FROM private.current_school_id() AND NOT private.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'School access denied.' USING ERRCODE='42501'; END IF;
 FOR parent IN SELECT a.attname column_name,rc.relname table_name FROM pg_constraint c JOIN pg_class rc ON rc.oid=c.confrelid JOIN pg_namespace rn ON rn.oid=rc.relnamespace JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=c.conkey[1] WHERE c.contype='f' AND c.conrelid=TG_RELID AND array_length(c.conkey,1)=1 AND rn.nspname='public' AND a.attname<>'school_id' AND EXISTS(SELECT 1 FROM pg_attribute pa WHERE pa.attrelid=c.confrelid AND pa.attname='school_id' AND NOT pa.attisdropped) LOOP
   linked_id:=(payload->>parent.column_name)::uuid;
   IF linked_id IS NULL THEN CONTINUE; END IF;
   EXECUTE format('SELECT school_id FROM public.%I WHERE id=$1',parent.table_name) INTO parent_school USING linked_id;
   IF parent_school IS DISTINCT FROM NEW.school_id THEN RAISE EXCEPTION 'Linked records must belong to the same school.' USING ERRCODE='23503'; END IF;
 END LOOP;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION private.enforce_school_contract() FROM PUBLIC,anon,authenticated;

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['profiles','user_roles','admissions','assignments','assignment_groups','assignment_group_members','assignment_submissions','assignment_regrade_requests','exams_quizzes','exam_questions','exam_submissions','exam_answers','lessons','lesson_completions','interventions','result_publications','teaching_assignments','student_assessments','student_attendance','student_exeat','student_fees','student_performance','staff_performance','staff_schedules','offer_letters','class_teachers','finance_income','finance_expenses','finance_payroll','audit_logs','messaging_direct_messages','messaging_announcement_reads','messaging_conversation_participants','library_books','library_loans','library_reservations','messaging_announcements','messaging_conversations','publicity_articles','publicity_banners','publicity_circulars','publicity_media_gallery','publicity_notices','timetable_slots','finance_billing_runs','subjects','school_classes','tenant_settings','school_branding','numbering_settings','numbering_counters','finance_config_sections','finance_reference_items','finance_rules','finance_config_audit'] LOOP
 EXECUTE format('CREATE TRIGGER tenant_contract BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION private.enforce_school_contract()',t);
 IF t IN ('user_roles','tenant_settings','school_branding','numbering_settings','numbering_counters','finance_config_sections','finance_reference_items','finance_rules','finance_config_audit','subjects','school_classes','audit_logs') THEN
   EXECUTE format('CREATE POLICY tenant_boundary ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (school_id=private.current_school_id() OR private.has_role(auth.uid(),''super_admin'')) WITH CHECK (school_id=private.current_school_id() OR private.has_role(auth.uid(),''super_admin''))',t);
 ELSE
   EXECUTE format('CREATE POLICY tenant_boundary ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (school_id=private.current_school_id()) WITH CHECK (school_id=private.current_school_id())',t);
 END IF;
 END LOOP;
END; $$;
CREATE POLICY school_membership_boundary ON public.schools AS RESTRICTIVE FOR SELECT TO authenticated USING (id=private.current_school_id() OR private.has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE FUNCTION private.assign_profile_membership() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.school_id IS NOT NULL THEN INSERT INTO public.school_memberships(user_id,school_id) VALUES(NEW.id,NEW.school_id) ON CONFLICT(user_id,school_id) DO NOTHING; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION private.assign_profile_membership() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER assign_profile_school_membership AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.assign_profile_membership();