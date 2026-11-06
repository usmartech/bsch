CREATE OR REPLACE FUNCTION public.write_school_configuration(_school_id uuid, _key text, _incoming jsonb, _columns jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_features jsonb; stored_version integer; next_value jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.has_role(auth.uid(), 'super_admin'::public.app_role) THEN RAISE EXCEPTION 'Forbidden: Super Admin access required.' USING ERRCODE='42501'; END IF;
  IF _key IS NULL OR _key NOT IN ('__academic_calendar','__academic_rules','__people_rules','__operations_rules') THEN RAISE EXCEPTION 'Unknown configuration domain.'; END IF;
  IF jsonb_typeof(_incoming) IS DISTINCT FROM 'object' OR jsonb_typeof(_incoming->'version') IS DISTINCT FROM 'number' OR (_incoming->>'version') !~ '^[0-9]+$' OR jsonb_typeof(_columns) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid configuration contract.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(_columns) k WHERE NOT ((_key='__academic_rules' AND k IN ('grading_system','academic_year_start_month')) OR (_key='__people_rules' AND k IN ('positions','departments','schedule_types')))) THEN RAISE EXCEPTION 'Configuration columns belong to another domain.'; END IF;
  PERFORM 1 FROM public.schools WHERE id=_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown school.'; END IF;
  INSERT INTO public.tenant_settings(school_id) VALUES (_school_id) ON CONFLICT(school_id) DO NOTHING;
  SELECT features INTO current_features FROM public.tenant_settings WHERE school_id=_school_id FOR UPDATE;
  stored_version := COALESCE((current_features->_key->>'version')::integer,0);
  IF stored_version <> (_incoming->>'version')::integer THEN RAISE EXCEPTION 'These settings were changed by someone else. Reload and try again.' USING ERRCODE='40001'; END IF;
  next_value := _incoming || jsonb_build_object('version',stored_version+1);
  IF _columns ? 'grading_system' AND (_columns->>'grading_system') NOT IN ('letter','percentage','gpa','points') THEN RAISE EXCEPTION 'Invalid grading system.'; END IF;
  IF _columns ? 'academic_year_start_month' AND ((_columns->>'academic_year_start_month')::integer NOT BETWEEN 1 AND 12) THEN RAISE EXCEPTION 'Invalid year start month.'; END IF;
  UPDATE public.tenant_settings SET
    features=jsonb_set(COALESCE(current_features,'{}'::jsonb),ARRAY[_key],next_value,true),
    grading_system=CASE WHEN _columns ? 'grading_system' THEN _columns->>'grading_system' ELSE grading_system END,
    academic_year_start_month=CASE WHEN _columns ? 'academic_year_start_month' THEN (_columns->>'academic_year_start_month')::integer ELSE academic_year_start_month END,
    positions=CASE WHEN _columns ? 'positions' THEN ARRAY(SELECT jsonb_array_elements_text(_columns->'positions')) ELSE positions END,
    departments=CASE WHEN _columns ? 'departments' THEN ARRAY(SELECT jsonb_array_elements_text(_columns->'departments')) ELSE departments END,
    schedule_types=CASE WHEN _columns ? 'schedule_types' THEN ARRAY(SELECT jsonb_array_elements_text(_columns->'schedule_types')) ELSE schedule_types END,
    updated_at=now() WHERE school_id=_school_id;
  RETURN next_value;
END; $$;
REVOKE ALL ON FUNCTION public.write_school_configuration(uuid,text,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.write_school_configuration(uuid,text,jsonb,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.write_school_module_policy(_school_id uuid, _features jsonb, _week_starts_on text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_features jsonb; preserved jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.has_role(auth.uid(),'super_admin'::public.app_role) THEN RAISE EXCEPTION 'Forbidden: Super Admin access required.' USING ERRCODE='42501'; END IF;
  IF jsonb_typeof(_features) IS DISTINCT FROM 'object' OR _week_starts_on IS NULL OR _week_starts_on NOT IN ('monday','sunday') THEN RAISE EXCEPTION 'Invalid module policy.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_each(_features) e WHERE left(e.key,2)='__' OR jsonb_typeof(e.value)<>'boolean') THEN RAISE EXCEPTION 'Module policy cannot overwrite configuration domains.'; END IF;
  PERFORM 1 FROM public.schools WHERE id=_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown school.'; END IF;
  INSERT INTO public.tenant_settings(school_id) VALUES (_school_id) ON CONFLICT(school_id) DO NOTHING;
  SELECT features INTO current_features FROM public.tenant_settings WHERE school_id=_school_id FOR UPDATE;
  SELECT COALESCE(jsonb_object_agg(key,value),'{}'::jsonb) INTO preserved FROM jsonb_each(COALESCE(current_features,'{}'::jsonb)) WHERE left(key,2)='__';
  UPDATE public.tenant_settings SET features=_features||preserved,week_starts_on=_week_starts_on,updated_at=now() WHERE school_id=_school_id;
END; $$;
REVOKE ALL ON FUNCTION public.write_school_module_policy(uuid,jsonb,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.write_school_module_policy(uuid,jsonb,text) TO authenticated;