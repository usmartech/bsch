CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  class_name text NOT NULL,
  subject text NOT NULL,
  education_level text NOT NULL DEFAULT '',
  term text NOT NULL DEFAULT '',
  assessment_type text NOT NULL DEFAULT 'Assignment',
  max_score numeric NOT NULL DEFAULT 100 CHECK (max_score > 0),
  due_date timestamptz NOT NULL,
  submission_mode text NOT NULL DEFAULT 'individual' CHECK (submission_mode IN ('individual', 'group')),
  submission_type text NOT NULL DEFAULT 'text' CHECK (submission_type IN ('text', 'file_link', 'offline')),
  allow_late boolean NOT NULL DEFAULT true,
  late_grace_hours numeric NOT NULL DEFAULT 0 CHECK (late_grace_hours >= 0),
  late_penalty_type text NOT NULL DEFAULT 'percentage_per_day' CHECK (late_penalty_type IN ('percentage_per_day', 'fixed_per_day', 'none')),
  late_penalty_value numeric NOT NULL DEFAULT 0 CHECK (late_penalty_value >= 0),
  max_late_penalty_percent numeric NOT NULL DEFAULT 100 CHECK (max_late_penalty_percent BETWEEN 0 AND 100),
  cutoff_date timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.assignment_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  group_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.assignment_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.assignment_groups(id) ON DELETE CASCADE,
  admission_id uuid NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignment_group_members_group_admission_unique UNIQUE (group_id, admission_id)
);
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  admission_id uuid REFERENCES public.admissions(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.assignment_groups(id) ON DELETE CASCADE,
  submission_text text NOT NULL DEFAULT '',
  attachment_url text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_late boolean NOT NULL DEFAULT false,
  late_hours numeric NOT NULL DEFAULT 0,
  raw_score numeric CHECK (raw_score IS NULL OR raw_score >= 0),
  late_penalty_applied numeric DEFAULT 0,
  final_score numeric CHECK (final_score IS NULL OR final_score >= 0),
  feedback text NOT NULL DEFAULT '',
  graded_at timestamptz,
  graded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assignments_class_subject_idx ON public.assignments(class_name, subject);
CREATE INDEX assignments_due_date_idx ON public.assignments(due_date);
CREATE INDEX assignment_groups_assignment_idx ON public.assignment_groups(assignment_id);
CREATE INDEX assignment_submissions_assignment_idx ON public.assignment_submissions(assignment_id);
CREATE INDEX assignment_submissions_admission_idx ON public.assignment_submissions(admission_id);
CREATE INDEX assignment_submissions_group_idx ON public.assignment_submissions(group_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_groups TO authenticated;
GRANT ALL ON public.assignment_groups TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_group_members TO authenticated;
GRANT ALL ON public.assignment_group_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_submissions TO authenticated;
GRANT ALL ON public.assignment_submissions TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins and staff manage assignments" ON public.assignments FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "everyone views assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins and staff manage assignment groups" ON public.assignment_groups FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "everyone views assignment groups" ON public.assignment_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins and staff manage group members" ON public.assignment_group_members FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "everyone views group members" ON public.assignment_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins and staff manage assignment submissions" ON public.assignment_submissions FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students submit assignments" ON public.assignment_submissions FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "family views assignment submissions" ON public.assignment_submissions FOR SELECT TO authenticated
  USING (
    private.is_admin(auth.uid())
    OR private.has_role(auth.uid(), 'staff'::app_role)
    OR (admission_id IS NOT NULL AND private.owns_admission(admission_id))
    OR submitted_by = auth.uid()
  );
CREATE TRIGGER assignments_set_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER assignment_submissions_set_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.exams_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  exam_type text NOT NULL DEFAULT 'exam' CHECK (exam_type IN ('exam', 'quiz')),
  class_name text NOT NULL DEFAULT '',
  subject text NOT NULL,
  term text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  total_marks numeric NOT NULL DEFAULT 100 CHECK (total_marks >= 0),
  pass_mark numeric NOT NULL DEFAULT 50 CHECK (pass_mark >= 0),
  shuffle_questions boolean NOT NULL DEFAULT false,
  show_results_immediately boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  start_time timestamptz,
  end_time timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams_quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  points numeric NOT NULL DEFAULT 1 CHECK (points >= 0),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL DEFAULT '',
  explanation text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exam_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams_quizzes(id) ON DELETE CASCADE,
  admission_id uuid REFERENCES public.admissions(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  total_score numeric NOT NULL DEFAULT 0,
  feedback text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.exam_submissions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL DEFAULT '',
  is_correct boolean,
  points_awarded numeric NOT NULL DEFAULT 0,
  feedback text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exams_quizzes_class_subject_idx ON public.exams_quizzes(class_name, subject);
CREATE INDEX exams_quizzes_created_idx ON public.exams_quizzes(created_at DESC);
CREATE INDEX exam_questions_exam_idx ON public.exam_questions(exam_id, order_index);
CREATE INDEX exam_submissions_exam_idx ON public.exam_submissions(exam_id);
CREATE INDEX exam_submissions_student_idx ON public.exam_submissions(student_id);
CREATE INDEX exam_submissions_admission_idx ON public.exam_submissions(admission_id);
CREATE INDEX exam_answers_submission_idx ON public.exam_answers(submission_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams_quizzes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_answers TO authenticated;
GRANT ALL ON public.exams_quizzes TO service_role;
GRANT ALL ON public.exam_questions TO service_role;
GRANT ALL ON public.exam_submissions TO service_role;
GRANT ALL ON public.exam_answers TO service_role;
ALTER TABLE public.exams_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage exams" ON public.exams_quizzes FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff create and read exams" ON public.exams_quizzes FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students read published exams" ON public.exams_quizzes FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'student'::app_role) AND status IN ('published', 'closed', 'archived'));
CREATE POLICY "admins and staff manage exam questions" ON public.exam_questions FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "admins manage submissions" ON public.exam_submissions FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff read and update submissions" ON public.exam_submissions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students manage own submissions" ON public.exam_submissions FOR ALL TO authenticated
  USING (student_id = auth.uid() OR private.owns_admission(admission_id))
  WITH CHECK (student_id = auth.uid() OR private.owns_admission(admission_id));
CREATE POLICY "admins manage answers" ON public.exam_answers FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage answers" ON public.exam_answers FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students manage answers via submission" ON public.exam_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exam_submissions s WHERE s.id = submission_id AND (s.student_id = auth.uid() OR private.owns_admission(s.admission_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exam_submissions s WHERE s.id = submission_id AND (s.student_id = auth.uid() OR private.owns_admission(s.admission_id))));
CREATE TRIGGER set_updated_at_exams_quizzes BEFORE UPDATE ON public.exams_quizzes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_exam_questions BEFORE UPDATE ON public.exam_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_exam_submissions BEFORE UPDATE ON public.exam_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_exam_answers BEFORE UPDATE ON public.exam_answers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.result_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  class_name text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'withheld')),
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  withheld_student_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT result_publications_term_class_key UNIQUE (term, class_name)
);
CREATE INDEX result_publications_term_class_idx ON public.result_publications(term, class_name);
CREATE INDEX result_publications_created_idx ON public.result_publications(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.result_publications TO authenticated;
GRANT ALL ON public.result_publications TO service_role;
ALTER TABLE public.result_publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins and staff manage publications" ON public.result_publications FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "all authenticated users read publications" ON public.result_publications FOR SELECT TO authenticated USING (true);
CREATE TRIGGER set_updated_at_result_publications BEFORE UPDATE ON public.result_publications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  class_name text NOT NULL,
  subject text NOT NULL,
  term text NOT NULL DEFAULT '',
  intro_video_url text NOT NULL DEFAULT '',
  quiz_id uuid REFERENCES public.exams_quizzes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  order_index integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admission_id uuid REFERENCES public.admissions(id) ON DELETE CASCADE,
  quiz_submission_id uuid REFERENCES public.exam_submissions(id) ON DELETE SET NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_student_unique UNIQUE (lesson_id, student_id)
);
CREATE INDEX lessons_class_subject_idx ON public.lessons(class_name, subject);
CREATE INDEX lessons_quiz_idx ON public.lessons(quiz_id);
CREATE INDEX lessons_created_idx ON public.lessons(created_at DESC);
CREATE INDEX lesson_completions_lesson_idx ON public.lesson_completions(lesson_id);
CREATE INDEX lesson_completions_student_idx ON public.lesson_completions(student_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_completions TO authenticated;
GRANT ALL ON public.lessons TO service_role;
GRANT ALL ON public.lesson_completions TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage lessons" ON public.lessons FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff create and manage lessons" ON public.lessons FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students read published lessons" ON public.lessons FOR SELECT TO authenticated
  USING (status IN ('published', 'archived'));
CREATE POLICY "admins manage completions" ON public.lesson_completions FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff read completions" ON public.lesson_completions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students manage own completions" ON public.lesson_completions FOR ALL TO authenticated
  USING (student_id = auth.uid() OR private.owns_admission(admission_id))
  WITH CHECK (student_id = auth.uid() OR private.owns_admission(admission_id));
CREATE TRIGGER set_updated_at_lessons BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_lesson_completions BEFORE UPDATE ON public.lesson_completions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  term text NOT NULL DEFAULT '',
  class_name text NOT NULL,
  subject text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  specific_date date,
  start_time text NOT NULL,
  end_time text NOT NULL,
  room_number text NOT NULL DEFAULT '',
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'class' CHECK (event_type IN ('class', 'quiz', 'exam', 'upcoming_event')),
  quiz_id uuid REFERENCES public.exams_quizzes(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX timetable_slots_class_day_idx ON public.timetable_slots(class_name, day_of_week);
CREATE INDEX timetable_slots_teacher_day_idx ON public.timetable_slots(teacher_id, day_of_week);
CREATE INDEX timetable_slots_quiz_idx ON public.timetable_slots(quiz_id);
CREATE INDEX timetable_slots_term_idx ON public.timetable_slots(term);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_slots TO authenticated;
GRANT ALL ON public.timetable_slots TO service_role;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage timetable" ON public.timetable_slots FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage timetable" ON public.timetable_slots FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "authenticated view timetable" ON public.timetable_slots FOR SELECT TO authenticated USING (true);
CREATE TRIGGER set_updated_at_timetable_slots BEFORE UPDATE ON public.timetable_slots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  isbn text NOT NULL DEFAULT '',
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  publisher text NOT NULL DEFAULT '',
  publication_year integer,
  call_number text NOT NULL DEFAULT '',
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'archived')),
  shelf_location text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.library_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  borrower_type text NOT NULL CHECK (borrower_type IN ('student', 'staff')),
  borrower_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  borrower_admission_id uuid REFERENCES public.admissions(id) ON DELETE SET NULL,
  borrower_name text NOT NULL,
  borrower_identifier text NOT NULL DEFAULT '',
  class_name text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  return_date date,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
  renewal_count integer NOT NULL DEFAULT 0,
  fine_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  fine_paid boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  issued_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.library_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  borrower_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  borrower_admission_id uuid REFERENCES public.admissions(id) ON DELETE CASCADE,
  borrower_name text NOT NULL,
  reservation_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX library_books_title_author_idx ON public.library_books(title, author);
CREATE INDEX library_books_category_idx ON public.library_books(category);
CREATE INDEX library_books_isbn_idx ON public.library_books(isbn);
CREATE INDEX library_loans_book_id_idx ON public.library_loans(book_id);
CREATE INDEX library_loans_borrower_profile_idx ON public.library_loans(borrower_profile_id);
CREATE INDEX library_loans_borrower_admission_idx ON public.library_loans(borrower_admission_id);
CREATE INDEX library_loans_status_idx ON public.library_loans(status);
CREATE INDEX library_reservations_book_id_idx ON public.library_reservations(book_id);
CREATE INDEX library_reservations_status_idx ON public.library_reservations(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_books TO authenticated;
GRANT ALL ON public.library_books TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_loans TO authenticated;
GRANT ALL ON public.library_loans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_reservations TO authenticated;
GRANT ALL ON public.library_reservations TO service_role;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage library_books" ON public.library_books FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage library_books" ON public.library_books FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "authenticated view library_books" ON public.library_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage library_loans" ON public.library_loans FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage library_loans" ON public.library_loans FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "users view own library_loans" ON public.library_loans FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role) OR borrower_profile_id = auth.uid());
CREATE POLICY "admins manage library_reservations" ON public.library_reservations FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage library_reservations" ON public.library_reservations FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "users manage own library_reservations" ON public.library_reservations FOR ALL TO authenticated
  USING (borrower_profile_id = auth.uid()) WITH CHECK (borrower_profile_id = auth.uid());
CREATE TRIGGER set_updated_at_library_books BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_library_loans BEFORE UPDATE ON public.library_loans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_library_reservations BEFORE UPDATE ON public.library_reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.publicity_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT 'new' CHECK (label IN ('coming_soon', 'urgent', 'new', 'deadline_approaching', 'general')),
  is_featured boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  image_url text NOT NULL DEFAULT '',
  attachment_url text NOT NULL DEFAULT '',
  attachment_name text NOT NULL DEFAULT '',
  read_more_link text NOT NULL DEFAULT '',
  publish_at timestamptz NOT NULL DEFAULT now(),
  expire_at timestamptz,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.publicity_circulars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  reference_number text NOT NULL DEFAULT '',
  title text NOT NULL,
  issuing_department text NOT NULL DEFAULT '',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  featured_image text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  document_url text NOT NULL DEFAULT '',
  document_name text NOT NULL DEFAULT '',
  external_link text NOT NULL DEFAULT '',
  deep_link text NOT NULL DEFAULT '',
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'restricted')),
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.publicity_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT 'landing_hero',
  auto_flip boolean NOT NULL DEFAULT true,
  transition_effect text NOT NULL DEFAULT 'slide' CHECK (transition_effect IN ('slide', 'fade', 'zoom')),
  slide_duration integer NOT NULL DEFAULT 5000,
  show_arrows boolean NOT NULL DEFAULT true,
  show_indicators boolean NOT NULL DEFAULT true,
  show_pause_controls boolean NOT NULL DEFAULT true,
  slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.publicity_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  short_summary text NOT NULL DEFAULT '',
  full_content text NOT NULL DEFAULT '',
  featured_image text NOT NULL DEFAULT '',
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  action_button_label text NOT NULL DEFAULT '',
  action_button_url text NOT NULL DEFAULT '',
  relevant_details_link text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  publication_date timestamptz NOT NULL DEFAULT now(),
  seo_title text NOT NULL DEFAULT '',
  seo_keywords text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.publicity_media_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  caption text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Events',
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'document')),
  media_url text NOT NULL,
  thumbnail_url text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX publicity_notices_status_idx ON public.publicity_notices(status, publish_at);
CREATE INDEX publicity_circulars_status_idx ON public.publicity_circulars(status, visibility);
CREATE INDEX publicity_banners_placement_idx ON public.publicity_banners(placement, status);
CREATE INDEX publicity_articles_status_idx ON public.publicity_articles(status, publication_date DESC);
CREATE INDEX publicity_gallery_category_idx ON public.publicity_media_gallery(category, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publicity_notices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publicity_circulars TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publicity_banners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publicity_articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publicity_media_gallery TO authenticated;
GRANT SELECT ON public.publicity_notices TO anon;
GRANT SELECT ON public.publicity_circulars TO anon;
GRANT SELECT ON public.publicity_banners TO anon;
GRANT SELECT ON public.publicity_articles TO anon;
GRANT SELECT ON public.publicity_media_gallery TO anon;
GRANT ALL ON public.publicity_notices TO service_role;
GRANT ALL ON public.publicity_circulars TO service_role;
GRANT ALL ON public.publicity_banners TO service_role;
GRANT ALL ON public.publicity_articles TO service_role;
GRANT ALL ON public.publicity_media_gallery TO service_role;
ALTER TABLE public.publicity_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicity_circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicity_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicity_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicity_media_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage publicity_notices" ON public.publicity_notices FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "admins manage publicity_circulars" ON public.publicity_circulars FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "admins manage publicity_banners" ON public.publicity_banners FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "admins manage publicity_articles" ON public.publicity_articles FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "admins manage publicity_media_gallery" ON public.publicity_media_gallery FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage publicity_notices" ON public.publicity_notices FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "staff manage publicity_circulars" ON public.publicity_circulars FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "staff manage publicity_banners" ON public.publicity_banners FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "staff manage publicity_articles" ON public.publicity_articles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "staff manage publicity_media_gallery" ON public.publicity_media_gallery FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "public read publicity_notices" ON public.publicity_notices FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "public read publicity_circulars" ON public.publicity_circulars FOR SELECT TO anon, authenticated USING (status = 'published' AND visibility <> 'restricted');
CREATE POLICY "public read publicity_banners" ON public.publicity_banners FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "public read publicity_articles" ON public.publicity_articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "public read publicity_media_gallery" ON public.publicity_media_gallery FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE TRIGGER set_updated_at_publicity_notices BEFORE UPDATE ON public.publicity_notices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_publicity_circulars BEFORE UPDATE ON public.publicity_circulars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_publicity_banners BEFORE UPDATE ON public.publicity_banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_publicity_articles BEFORE UPDATE ON public.publicity_articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_publicity_media_gallery BEFORE UPDATE ON public.publicity_media_gallery FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.finance_billing_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  period text NOT NULL,
  target_scope text NOT NULL DEFAULT 'all',
  target_value text,
  student_count integer NOT NULL DEFAULT 0,
  total_amount_billed numeric(14,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_billing_runs TO authenticated;
GRANT ALL ON public.finance_billing_runs TO service_role;
ALTER TABLE public.finance_billing_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_billing_runs_admin" ON public.finance_billing_runs FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE INDEX finance_billing_runs_school_period_idx ON public.finance_billing_runs (school_id, period);
CREATE TRIGGER finance_billing_runs_updated_at BEFORE UPDATE ON public.finance_billing_runs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.messaging_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT 'Everyone',
  target_role text NOT NULL DEFAULT '',
  target_class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  channels jsonb NOT NULL DEFAULT '["In-app"]'::jsonb,
  attachment_url text NOT NULL DEFAULT '',
  attachment_name text NOT NULL DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT false,
  publish_at timestamptz NOT NULL DEFAULT now(),
  expire_at timestamptz,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.messaging_announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.messaging_announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, user_id)
);
CREATE TABLE public.messaging_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  is_group boolean NOT NULL DEFAULT false,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_preview text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.messaging_conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.messaging_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  last_read_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
CREATE OR REPLACE FUNCTION private.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.messaging_conversation_participants WHERE conversation_id = _conversation_id AND user_id = _user_id);
$$;
REVOKE ALL ON FUNCTION private.is_conversation_participant(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_conversation_participant(uuid, uuid) TO authenticated, service_role;
CREATE TABLE public.messaging_direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.messaging_conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text NOT NULL DEFAULT '',
  attachment_url text NOT NULL DEFAULT '',
  attachment_name text NOT NULL DEFAULT '',
  is_edited boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messaging_announcements_status_idx ON public.messaging_announcements(status, publish_at DESC);
CREATE INDEX messaging_announcements_school_idx ON public.messaging_announcements(school_id);
CREATE INDEX messaging_announcement_reads_user_idx ON public.messaging_announcement_reads(user_id, announcement_id);
CREATE INDEX messaging_conversations_school_idx ON public.messaging_conversations(school_id, last_message_at DESC);
CREATE INDEX messaging_participants_user_idx ON public.messaging_conversation_participants(user_id, conversation_id);
CREATE INDEX messaging_direct_messages_conv_idx ON public.messaging_direct_messages(conversation_id, created_at ASC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messaging_announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messaging_announcement_reads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messaging_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messaging_conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messaging_direct_messages TO authenticated;
GRANT ALL ON public.messaging_announcements TO service_role;
GRANT ALL ON public.messaging_announcement_reads TO service_role;
GRANT ALL ON public.messaging_conversations TO service_role;
GRANT ALL ON public.messaging_conversation_participants TO service_role;
GRANT ALL ON public.messaging_direct_messages TO service_role;
ALTER TABLE public.messaging_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated view announcements" ON public.messaging_announcements FOR SELECT TO authenticated
  USING (status = 'published' OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "admins manage messaging_announcements" ON public.messaging_announcements FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage messaging_announcements" ON public.messaging_announcements FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "users manage own announcement reads" ON public.messaging_announcement_reads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins view all announcement reads" ON public.messaging_announcement_reads FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));
CREATE POLICY "participants view conversations" ON public.messaging_conversations FOR SELECT TO authenticated
  USING (private.is_conversation_participant(id, auth.uid()) OR created_by = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "authenticated create conversations" ON public.messaging_conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "participants manage conversations" ON public.messaging_conversations FOR UPDATE TO authenticated
  USING (private.is_conversation_participant(id, auth.uid()) OR private.is_admin(auth.uid()));
CREATE POLICY "view participants in my conversations" ON public.messaging_conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_conversation_participant(conversation_id, auth.uid()) OR private.is_admin(auth.uid()));
CREATE POLICY "create participants" ON public.messaging_conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    private.is_admin(auth.uid())
    OR private.is_conversation_participant(conversation_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.messaging_conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );
CREATE POLICY "manage participants" ON public.messaging_conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "delete participants" ON public.messaging_conversation_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "view direct messages in conversation" ON public.messaging_direct_messages FOR SELECT TO authenticated
  USING (private.is_conversation_participant(conversation_id, auth.uid()) OR private.is_admin(auth.uid()));
CREATE POLICY "send direct messages to joined conversation" ON public.messaging_direct_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND (private.is_conversation_participant(conversation_id, auth.uid()) OR private.is_admin(auth.uid())));
CREATE TRIGGER set_updated_at_messaging_announcements BEFORE UPDATE ON public.messaging_announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_messaging_conversations BEFORE UPDATE ON public.messaging_conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_messaging_direct_messages BEFORE UPDATE ON public.messaging_direct_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id uuid NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  term text NOT NULL DEFAULT '',
  academic_year text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  risk_indicators text[] NOT NULL DEFAULT '{}',
  baseline_performance numeric DEFAULT 0,
  baseline_attendance numeric DEFAULT 0,
  identified_need text NOT NULL DEFAULT '',
  strategy text NOT NULL DEFAULT 'Targeted remedial lessons',
  responsible_staff_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  responsible_staff_name text NOT NULL DEFAULT '',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  review_date date NOT NULL DEFAULT CURRENT_DATE,
  target_outcome text NOT NULL DEFAULT '',
  progress_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  follow_up_results text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('risk_detected', 'under_review', 'active', 'escalated', 'closed')),
  closure_reason text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interventions_admission_idx ON public.interventions(admission_id);
CREATE INDEX interventions_status_idx ON public.interventions(status);
CREATE INDEX interventions_created_idx ON public.interventions(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interventions TO authenticated;
GRANT ALL ON public.interventions TO service_role;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage interventions" ON public.interventions FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "staff manage interventions" ON public.interventions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "family views own student interventions" ON public.interventions FOR SELECT TO authenticated
  USING (private.owns_admission(admission_id));
CREATE TRIGGER interventions_set_updated_at BEFORE UPDATE ON public.interventions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.assignment_regrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  teacher_response text NOT NULL DEFAULT '',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignment_regrade_requests_submission_student_unique UNIQUE (submission_id, student_id)
);
CREATE INDEX assignment_regrade_requests_submission_idx ON public.assignment_regrade_requests(submission_id);
CREATE INDEX assignment_regrade_requests_student_idx ON public.assignment_regrade_requests(student_id);
CREATE INDEX assignment_regrade_requests_status_idx ON public.assignment_regrade_requests(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_regrade_requests TO authenticated;
GRANT ALL ON public.assignment_regrade_requests TO service_role;
ALTER TABLE public.assignment_regrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins and staff manage regrade requests" ON public.assignment_regrade_requests FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role));
CREATE POLICY "students submit own regrade requests" ON public.assignment_regrade_requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "students view own regrade requests" ON public.assignment_regrade_requests FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'staff'::app_role) OR student_id = auth.uid());
CREATE TRIGGER assignment_regrade_requests_set_updated_at BEFORE UPDATE ON public.assignment_regrade_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS library_books_school_idx ON public.library_books (school_id);
CREATE INDEX IF NOT EXISTS library_loans_school_idx ON public.library_loans (school_id);
CREATE INDEX IF NOT EXISTS library_reservations_school_idx ON public.library_reservations (school_id);
CREATE INDEX IF NOT EXISTS publicity_articles_school_idx ON public.publicity_articles (school_id);
CREATE INDEX IF NOT EXISTS publicity_banners_school_idx ON public.publicity_banners (school_id);
CREATE INDEX IF NOT EXISTS publicity_circulars_school_idx ON public.publicity_circulars (school_id);
CREATE INDEX IF NOT EXISTS publicity_media_gallery_school_idx ON public.publicity_media_gallery (school_id);
CREATE INDEX IF NOT EXISTS publicity_notices_school_idx ON public.publicity_notices (school_id);
CREATE INDEX IF NOT EXISTS subjects_school_idx ON public.subjects (school_id);
CREATE INDEX IF NOT EXISTS school_branding_school_idx ON public.school_branding (school_id);
CREATE INDEX IF NOT EXISTS tenant_settings_school_idx ON public.tenant_settings (school_id);
CREATE INDEX IF NOT EXISTS numbering_settings_school_idx ON public.numbering_settings (school_id);
CREATE INDEX IF NOT EXISTS numbering_counters_school_idx ON public.numbering_counters (school_id);
CREATE INDEX IF NOT EXISTS timetable_slots_school_idx ON public.timetable_slots (school_id);
CREATE INDEX IF NOT EXISTS student_fees_admission_idx ON public.student_fees (admission_id);
CREATE INDEX IF NOT EXISTS student_attendance_admission_idx ON public.student_attendance (admission_id);
CREATE INDEX IF NOT EXISTS student_performance_admission_idx ON public.student_performance (admission_id);
CREATE INDEX IF NOT EXISTS finance_payroll_staff_idx ON public.finance_payroll (staff_id);
CREATE INDEX IF NOT EXISTS interventions_created_by_idx ON public.interventions (created_by);
CREATE INDEX IF NOT EXISTS interventions_responsible_staff_idx ON public.interventions (responsible_staff_id);
CREATE INDEX IF NOT EXISTS lessons_created_by_idx ON public.lessons (created_by);
CREATE INDEX IF NOT EXISTS lesson_completions_admission_idx ON public.lesson_completions (admission_id);
CREATE INDEX IF NOT EXISTS lesson_completions_quiz_sub_idx ON public.lesson_completions (quiz_submission_id);
CREATE INDEX IF NOT EXISTS messaging_announcements_created_by_idx ON public.messaging_announcements (created_by);
CREATE INDEX IF NOT EXISTS messaging_announcements_target_class_idx ON public.messaging_announcements (target_class_id);
CREATE INDEX IF NOT EXISTS messaging_conversations_created_by_idx ON public.messaging_conversations (created_by);
CREATE INDEX IF NOT EXISTS messaging_direct_messages_sender_idx ON public.messaging_direct_messages (sender_id);
CREATE INDEX IF NOT EXISTS publicity_articles_created_by_idx ON public.publicity_articles (created_by);
CREATE INDEX IF NOT EXISTS publicity_banners_created_by_idx ON public.publicity_banners (created_by);
CREATE INDEX IF NOT EXISTS publicity_circulars_created_by_idx ON public.publicity_circulars (created_by);
CREATE INDEX IF NOT EXISTS publicity_media_gallery_created_by_idx ON public.publicity_media_gallery (created_by);
CREATE INDEX IF NOT EXISTS publicity_notices_created_by_idx ON public.publicity_notices (created_by);
CREATE INDEX IF NOT EXISTS result_publications_published_by_idx ON public.result_publications (published_by);
CREATE INDEX IF NOT EXISTS staff_performance_staff_idx ON public.staff_performance (staff_id);
CREATE INDEX IF NOT EXISTS staff_schedules_staff_idx ON public.staff_schedules (staff_id);
CREATE INDEX IF NOT EXISTS user_roles_user_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS password_reset_requests_handled_by_idx ON public.password_reset_requests (handled_by);
CREATE INDEX IF NOT EXISTS library_loans_issued_by_idx ON public.library_loans (issued_by);
CREATE INDEX IF NOT EXISTS library_reservations_borrower_admission_idx ON public.library_reservations (borrower_admission_id);
CREATE INDEX IF NOT EXISTS library_reservations_borrower_profile_idx ON public.library_reservations (borrower_profile_id);