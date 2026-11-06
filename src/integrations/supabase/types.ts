export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          address: string | null
          admission_number: string | null
          alt_contact: string | null
          assistance_needed: string | null
          city: string | null
          class_admitted: string
          community: string | null
          created_at: string
          created_by: string | null
          digital_address: string | null
          disability_status: string
          disability_type: string | null
          dob: string | null
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          emergency_residence: string | null
          emergency_residence_district: string | null
          gender: string
          hometown: string | null
          hometown_district: string | null
          id: string
          last_attendance: string | null
          parent_email: string
          parent_name: string
          parent_phone: string | null
          parent_profile_id: string | null
          place_of_birth: string | null
          previous_class: string | null
          previous_school: string | null
          reason_for_leaving: string | null
          relationship: string | null
          residence: string | null
          residence_district: string | null
          status: string
          student_login_email: string | null
          student_name: string
          student_profile_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_number?: string | null
          alt_contact?: string | null
          assistance_needed?: string | null
          city?: string | null
          class_admitted: string
          community?: string | null
          created_at?: string
          created_by?: string | null
          digital_address?: string | null
          disability_status?: string
          disability_type?: string | null
          dob?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          emergency_residence?: string | null
          emergency_residence_district?: string | null
          gender?: string
          hometown?: string | null
          hometown_district?: string | null
          id?: string
          last_attendance?: string | null
          parent_email: string
          parent_name: string
          parent_phone?: string | null
          parent_profile_id?: string | null
          place_of_birth?: string | null
          previous_class?: string | null
          previous_school?: string | null
          reason_for_leaving?: string | null
          relationship?: string | null
          residence?: string | null
          residence_district?: string | null
          status?: string
          student_login_email?: string | null
          student_name: string
          student_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_number?: string | null
          alt_contact?: string | null
          assistance_needed?: string | null
          city?: string | null
          class_admitted?: string
          community?: string | null
          created_at?: string
          created_by?: string | null
          digital_address?: string | null
          disability_status?: string
          disability_type?: string | null
          dob?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          emergency_residence?: string | null
          emergency_residence_district?: string | null
          gender?: string
          hometown?: string | null
          hometown_district?: string | null
          id?: string
          last_attendance?: string | null
          parent_email?: string
          parent_name?: string
          parent_phone?: string | null
          parent_profile_id?: string | null
          place_of_birth?: string | null
          previous_class?: string | null
          previous_school?: string | null
          reason_for_leaving?: string | null
          relationship?: string | null
          residence?: string | null
          residence_district?: string | null
          status?: string
          student_login_email?: string | null
          student_name?: string
          student_profile_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assignment_group_members: {
        Row: {
          admission_id: string
          created_at: string
          group_id: string
          id: string
        }
        Insert: {
          admission_id: string
          created_at?: string
          group_id: string
          id?: string
        }
        Update: {
          admission_id?: string
          created_at?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_group_members_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "assignment_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_groups: {
        Row: {
          assignment_id: string
          created_at: string
          group_name: string
          id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          group_name: string
          id?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          group_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_groups_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_regrade_requests: {
        Row: {
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          student_id: string
          submission_id: string
          teacher_response: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id: string
          submission_id: string
          teacher_response?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id?: string
          submission_id?: string
          teacher_response?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_regrade_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_regrade_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_regrade_requests_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          admission_id: string | null
          assignment_id: string
          attachment_url: string
          created_at: string
          feedback: string
          final_score: number | null
          graded_at: string | null
          graded_by: string | null
          group_id: string | null
          id: string
          is_late: boolean
          late_hours: number
          late_penalty_applied: number | null
          raw_score: number | null
          submission_text: string
          submitted_at: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          assignment_id: string
          attachment_url?: string
          created_at?: string
          feedback?: string
          final_score?: number | null
          graded_at?: string | null
          graded_by?: string | null
          group_id?: string | null
          id?: string
          is_late?: boolean
          late_hours?: number
          late_penalty_applied?: number | null
          raw_score?: number | null
          submission_text?: string
          submitted_at?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          assignment_id?: string
          attachment_url?: string
          created_at?: string
          feedback?: string
          final_score?: number | null
          graded_at?: string | null
          graded_by?: string | null
          group_id?: string | null
          id?: string
          is_late?: boolean
          late_hours?: number
          late_penalty_applied?: number | null
          raw_score?: number | null
          submission_text?: string
          submitted_at?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "assignment_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          allow_late: boolean
          assessment_type: string
          class_name: string
          created_at: string
          created_by: string | null
          cutoff_date: string | null
          description: string
          due_date: string
          education_level: string
          id: string
          late_grace_hours: number
          late_penalty_type: string
          late_penalty_value: number
          max_late_penalty_percent: number
          max_score: number
          subject: string
          submission_mode: string
          submission_type: string
          term: string
          title: string
          updated_at: string
        }
        Insert: {
          allow_late?: boolean
          assessment_type?: string
          class_name: string
          created_at?: string
          created_by?: string | null
          cutoff_date?: string | null
          description?: string
          due_date: string
          education_level?: string
          id?: string
          late_grace_hours?: number
          late_penalty_type?: string
          late_penalty_value?: number
          max_late_penalty_percent?: number
          max_score?: number
          subject: string
          submission_mode?: string
          submission_type?: string
          term?: string
          title: string
          updated_at?: string
        }
        Update: {
          allow_late?: boolean
          assessment_type?: string
          class_name?: string
          created_at?: string
          created_by?: string | null
          cutoff_date?: string | null
          description?: string
          due_date?: string
          education_level?: string
          id?: string
          late_grace_hours?: number
          late_penalty_type?: string
          late_penalty_value?: number
          max_late_penalty_percent?: number
          max_score?: number
          subject?: string
          submission_mode?: string
          submission_type?: string
          term?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          description: string
          details: Json
          id: string
          target_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          description?: string
          details?: Json
          id?: string
          target_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          description?: string
          details?: Json
          id?: string
          target_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      class_teachers: {
        Row: {
          class_name: string
          created_at: string
          id: string
          teacher_email: string
          teacher_id: string | null
          teacher_name: string
          teacher_phone: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          teacher_email?: string
          teacher_id?: string | null
          teacher_name?: string
          teacher_phone?: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          teacher_email?: string
          teacher_id?: string | null
          teacher_name?: string
          teacher_phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education_levels: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          max_age: number | null
          min_age: number | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          max_age?: number | null
          min_age?: number | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          max_age?: number | null
          min_age?: number | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      exam_answers: {
        Row: {
          answer_text: string
          created_at: string
          feedback: string
          id: string
          is_correct: boolean | null
          points_awarded: number
          question_id: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          answer_text?: string
          created_at?: string
          feedback?: string
          id?: string
          is_correct?: boolean | null
          points_awarded?: number
          question_id: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          feedback?: string
          id?: string
          is_correct?: boolean | null
          points_awarded?: number
          question_id?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "exam_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          correct_answer: string
          created_at: string
          exam_id: string
          explanation: string
          id: string
          options: Json
          order_index: number
          points: number
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          correct_answer?: string
          created_at?: string
          exam_id: string
          explanation?: string
          id?: string
          options?: Json
          order_index?: number
          points?: number
          question_text: string
          question_type?: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          exam_id?: string
          explanation?: string
          id?: string
          options?: Json
          order_index?: number
          points?: number
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_submissions: {
        Row: {
          admission_id: string | null
          created_at: string
          exam_id: string
          feedback: string
          id: string
          started_at: string
          status: string
          student_id: string | null
          submitted_at: string | null
          total_score: number
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          created_at?: string
          exam_id: string
          feedback?: string
          id?: string
          started_at?: string
          status?: string
          student_id?: string | null
          submitted_at?: string | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          created_at?: string
          exam_id?: string
          feedback?: string
          id?: string
          started_at?: string
          status?: string
          student_id?: string | null
          submitted_at?: string | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams_quizzes: {
        Row: {
          class_name: string
          created_at: string
          created_by: string | null
          description: string
          duration_minutes: number
          end_time: string | null
          exam_type: string
          id: string
          pass_mark: number
          show_results_immediately: boolean
          shuffle_questions: boolean
          start_time: string | null
          status: string
          subject: string
          term: string
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number
          end_time?: string | null
          exam_type?: string
          id?: string
          pass_mark?: number
          show_results_immediately?: boolean
          shuffle_questions?: boolean
          start_time?: string | null
          status?: string
          subject: string
          term?: string
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number
          end_time?: string | null
          exam_type?: string
          id?: string
          pass_mark?: number
          show_results_immediately?: boolean
          shuffle_questions?: boolean
          start_time?: string | null
          status?: string
          subject?: string
          term?: string
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_quizzes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_billing_runs: {
        Row: {
          academic_year: string
          created_at: string
          created_by: string | null
          id: string
          metadata: Json | null
          notes: string | null
          period: string
          school_id: string | null
          student_count: number
          target_scope: string
          target_value: string | null
          total_amount_billed: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          period: string
          school_id?: string | null
          student_count?: number
          target_scope?: string
          target_value?: string | null
          total_amount_billed?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          period?: string
          school_id?: string | null
          student_count?: number
          target_scope?: string
          target_value?: string | null
          total_amount_billed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_billing_runs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_billing_runs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_config_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          description: string
          details: Json
          id: string
          school_id: string | null
          section_key: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          description?: string
          details?: Json
          id?: string
          school_id?: string | null
          section_key: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          description?: string
          details?: Json
          id?: string
          school_id?: string | null
          section_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_config_audit_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_config_sections: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          area_key: string
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          notes: string
          payload: Json
          school_id: string
          section_key: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          area_key: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          notes?: string
          payload?: Json
          school_id: string
          section_key: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          area_key?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          notes?: string
          payload?: Json
          school_id?: string
          section_key?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_config_sections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_income: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_payroll: {
        Row: {
          allowances: number
          basic_salary: number
          created_at: string
          created_by: string | null
          deductions: number
          employee_id: string | null
          employee_name: string
          id: string
          net_salary: number | null
          period: string | null
          position: string | null
          staff_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          created_by?: string | null
          deductions?: number
          employee_id?: string | null
          employee_name: string
          id?: string
          net_salary?: number | null
          period?: string | null
          position?: string | null
          staff_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          created_by?: string | null
          deductions?: number
          employee_id?: string | null
          employee_name?: string
          id?: string
          net_salary?: number | null
          period?: string | null
          position?: string | null
          staff_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_payroll_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_reference_items: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          id: string
          list_key: string
          metadata: Json
          name: string
          parent_code: string | null
          school_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string
          id?: string
          list_key: string
          metadata?: Json
          name: string
          parent_code?: string | null
          school_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          id?: string
          list_key?: string
          metadata?: Json
          name?: string
          parent_code?: string | null
          school_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_reference_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_rules: {
        Row: {
          actions: Json
          active: boolean
          conditions: Json
          created_at: string
          description: string
          effective_from: string | null
          effective_to: string | null
          id: string
          name: string
          priority: number
          rule_key: string
          school_id: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          active?: boolean
          conditions?: Json
          created_at?: string
          description?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          name: string
          priority?: number
          rule_key: string
          school_id: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          active?: boolean
          conditions?: Json
          created_at?: string
          description?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          name?: string
          priority?: number
          rule_key?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_rules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          academic_year: string
          admission_id: string
          baseline_attendance: number | null
          baseline_performance: number | null
          closure_reason: string
          created_at: string
          created_by: string | null
          follow_up_results: string
          id: string
          identified_need: string
          progress_notes: Json
          responsible_staff_id: string | null
          responsible_staff_name: string
          review_date: string
          risk_indicators: string[]
          start_date: string
          status: string
          strategy: string
          subject: string
          target_outcome: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          admission_id: string
          baseline_attendance?: number | null
          baseline_performance?: number | null
          closure_reason?: string
          created_at?: string
          created_by?: string | null
          follow_up_results?: string
          id?: string
          identified_need?: string
          progress_notes?: Json
          responsible_staff_id?: string | null
          responsible_staff_name?: string
          review_date?: string
          risk_indicators?: string[]
          start_date?: string
          status?: string
          strategy?: string
          subject?: string
          target_outcome?: string
          term?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          admission_id?: string
          baseline_attendance?: number | null
          baseline_performance?: number | null
          closure_reason?: string
          created_at?: string
          created_by?: string | null
          follow_up_results?: string
          id?: string
          identified_need?: string
          progress_notes?: Json
          responsible_staff_id?: string | null
          responsible_staff_name?: string
          review_date?: string
          risk_indicators?: string[]
          start_date?: string
          status?: string
          strategy?: string
          subject?: string
          target_outcome?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_responsible_staff_id_fkey"
            columns: ["responsible_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          admission_id: string | null
          completed_at: string
          created_at: string
          id: string
          lesson_id: string
          quiz_submission_id: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id: string
          quiz_submission_id?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id?: string
          quiz_submission_id?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_quiz_submission_id_fkey"
            columns: ["quiz_submission_id"]
            isOneToOne: false
            referencedRelation: "exam_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          class_name: string
          content: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          intro_video_url: string
          order_index: number
          quiz_id: string | null
          status: string
          subject: string
          term: string
          title: string
          updated_at: string
        }
        Insert: {
          class_name: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          intro_video_url?: string
          order_index?: number
          quiz_id?: string | null
          status?: string
          subject: string
          term?: string
          title: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          intro_video_url?: string
          order_index?: number
          quiz_id?: string | null
          status?: string
          subject?: string
          term?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "exams_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string
          available_copies: number
          call_number: string
          category: string
          cover_url: string
          created_at: string
          description: string
          id: string
          isbn: string
          publication_year: number | null
          publisher: string
          school_id: string | null
          shelf_location: string
          status: string
          title: string
          total_copies: number
          updated_at: string
        }
        Insert: {
          author: string
          available_copies?: number
          call_number?: string
          category?: string
          cover_url?: string
          created_at?: string
          description?: string
          id?: string
          isbn?: string
          publication_year?: number | null
          publisher?: string
          school_id?: string | null
          shelf_location?: string
          status?: string
          title: string
          total_copies?: number
          updated_at?: string
        }
        Update: {
          author?: string
          available_copies?: number
          call_number?: string
          category?: string
          cover_url?: string
          created_at?: string
          description?: string
          id?: string
          isbn?: string
          publication_year?: number | null
          publisher?: string
          school_id?: string | null
          shelf_location?: string
          status?: string
          title?: string
          total_copies?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_books_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_loans: {
        Row: {
          book_id: string
          borrower_admission_id: string | null
          borrower_identifier: string
          borrower_name: string
          borrower_profile_id: string | null
          borrower_type: string
          class_name: string
          created_at: string
          department: string
          due_date: string
          fine_amount: number
          fine_paid: boolean
          id: string
          issue_date: string
          issued_by: string | null
          notes: string
          renewal_count: number
          return_date: string | null
          school_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          book_id: string
          borrower_admission_id?: string | null
          borrower_identifier?: string
          borrower_name: string
          borrower_profile_id?: string | null
          borrower_type: string
          class_name?: string
          created_at?: string
          department?: string
          due_date: string
          fine_amount?: number
          fine_paid?: boolean
          id?: string
          issue_date?: string
          issued_by?: string | null
          notes?: string
          renewal_count?: number
          return_date?: string | null
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          borrower_admission_id?: string | null
          borrower_identifier?: string
          borrower_name?: string
          borrower_profile_id?: string | null
          borrower_type?: string
          class_name?: string
          created_at?: string
          department?: string
          due_date?: string
          fine_amount?: number
          fine_paid?: boolean
          id?: string
          issue_date?: string
          issued_by?: string | null
          notes?: string
          renewal_count?: number
          return_date?: string | null
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_borrower_admission_id_fkey"
            columns: ["borrower_admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_borrower_profile_id_fkey"
            columns: ["borrower_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_reservations: {
        Row: {
          book_id: string
          borrower_admission_id: string | null
          borrower_name: string
          borrower_profile_id: string | null
          created_at: string
          id: string
          reservation_date: string
          school_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          book_id: string
          borrower_admission_id?: string | null
          borrower_name: string
          borrower_profile_id?: string | null
          created_at?: string
          id?: string
          reservation_date?: string
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          borrower_admission_id?: string | null
          borrower_name?: string
          borrower_profile_id?: string | null
          created_at?: string
          id?: string
          reservation_date?: string
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_reservations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_reservations_borrower_admission_id_fkey"
            columns: ["borrower_admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_reservations_borrower_profile_id_fkey"
            columns: ["borrower_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_reservations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "messaging_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_announcements: {
        Row: {
          attachment_name: string
          attachment_url: string
          audience: string
          channels: Json
          content: string
          created_at: string
          created_by: string | null
          expire_at: string | null
          id: string
          is_pinned: boolean
          priority: string
          publish_at: string
          school_id: string | null
          status: string
          summary: string
          target_class_id: string | null
          target_role: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string
          attachment_url?: string
          audience?: string
          channels?: Json
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          is_pinned?: boolean
          priority?: string
          publish_at?: string
          school_id?: string | null
          status?: string
          summary?: string
          target_class_id?: string | null
          target_role?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string
          attachment_url?: string
          audience?: string
          channels?: Json
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          is_pinned?: boolean
          priority?: string
          publish_at?: string
          school_id?: string | null
          status?: string
          summary?: string
          target_class_id?: string | null
          target_role?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_announcements_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "messaging_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean
          last_message_at: string
          last_message_preview: string
          school_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string
          last_message_preview?: string
          school_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string
          last_message_preview?: string
          school_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_conversations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_direct_messages: {
        Row: {
          attachment_name: string
          attachment_url: string
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_edited: boolean
          sender_id: string | null
          updated_at: string
        }
        Insert: {
          attachment_name?: string
          attachment_url?: string
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          is_edited?: boolean
          sender_id?: string | null
          updated_at?: string
        }
        Update: {
          attachment_name?: string
          attachment_url?: string
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_edited?: boolean
          sender_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "messaging_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      numbering_counters: {
        Row: {
          kind: string
          last_value: number
          school_id: string
          updated_at: string
          year_key: string
        }
        Insert: {
          kind: string
          last_value?: number
          school_id: string
          updated_at?: string
          year_key: string
        }
        Update: {
          kind?: string
          last_value?: number
          school_id?: string
          updated_at?: string
          year_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "numbering_counters_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      numbering_settings: {
        Row: {
          admission_format: string
          admission_sequence_digits: number
          admission_sequence_start: number
          admission_total_digits: number
          admission_year_digits: number
          created_at: string
          employee_allocation_mode: string
          employee_format: string
          employee_sequence_digits: number
          employee_sequence_start: number
          employee_total_digits: number
          employee_year_digits: number
          id: string
          school_code: string
          school_id: string
          updated_at: string
        }
        Insert: {
          admission_format?: string
          admission_sequence_digits?: number
          admission_sequence_start?: number
          admission_total_digits?: number
          admission_year_digits?: number
          created_at?: string
          employee_allocation_mode?: string
          employee_format?: string
          employee_sequence_digits?: number
          employee_sequence_start?: number
          employee_total_digits?: number
          employee_year_digits?: number
          id?: string
          school_code?: string
          school_id: string
          updated_at?: string
        }
        Update: {
          admission_format?: string
          admission_sequence_digits?: number
          admission_sequence_start?: number
          admission_total_digits?: number
          admission_year_digits?: number
          created_at?: string
          employee_allocation_mode?: string
          employee_format?: string
          employee_sequence_digits?: number
          employee_sequence_start?: number
          employee_total_digits?: number
          employee_year_digits?: number
          id?: string
          school_code?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "numbering_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_letters: {
        Row: {
          candidate_email: string
          candidate_name: string
          created_at: string
          created_by: string | null
          id: string
          position: string
          salary: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_email: string
          candidate_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          position: string
          salary?: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_email?: string
          candidate_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          position?: string
          salary?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_requests: {
        Row: {
          created_at: string
          email: string
          handled_at: string | null
          handled_by: string | null
          id: string
          note: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          note?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          note?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          admission_number: string | null
          avatar_url: string | null
          class_name: string | null
          created_at: string
          department: string | null
          email: string
          employee_id: string | null
          force_password_change: boolean
          full_name: string
          gender: string | null
          id: string
          last_login: string | null
          password_reset_at: string | null
          permissions: Json
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["app_role"]
          salary: number | null
          start_date: string | null
          status: string
          two_factor_enabled: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          admission_number?: string | null
          avatar_url?: string | null
          class_name?: string | null
          created_at?: string
          department?: string | null
          email?: string
          employee_id?: string | null
          force_password_change?: boolean
          full_name?: string
          gender?: string | null
          id: string
          last_login?: string | null
          password_reset_at?: string | null
          permissions?: Json
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salary?: number | null
          start_date?: string | null
          status?: string
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          admission_number?: string | null
          avatar_url?: string | null
          class_name?: string | null
          created_at?: string
          department?: string | null
          email?: string
          employee_id?: string | null
          force_password_change?: boolean
          full_name?: string
          gender?: string | null
          id?: string
          last_login?: string | null
          password_reset_at?: string | null
          permissions?: Json
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salary?: number | null
          start_date?: string | null
          status?: string
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      publicity_articles: {
        Row: {
          action_button_label: string
          action_button_url: string
          attachments: Json
          author_name: string
          author_role: string
          category: string
          created_at: string
          created_by: string | null
          featured_image: string
          full_content: string
          gallery_images: Json
          headline: string
          id: string
          is_featured: boolean
          is_pinned: boolean
          publication_date: string
          relevant_details_link: string
          school_id: string | null
          seo_keywords: string
          seo_title: string
          short_summary: string
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          action_button_label?: string
          action_button_url?: string
          attachments?: Json
          author_name?: string
          author_role?: string
          category?: string
          created_at?: string
          created_by?: string | null
          featured_image?: string
          full_content?: string
          gallery_images?: Json
          headline?: string
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          publication_date?: string
          relevant_details_link?: string
          school_id?: string | null
          seo_keywords?: string
          seo_title?: string
          short_summary?: string
          slug?: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          action_button_label?: string
          action_button_url?: string
          attachments?: Json
          author_name?: string
          author_role?: string
          category?: string
          created_at?: string
          created_by?: string | null
          featured_image?: string
          full_content?: string
          gallery_images?: Json
          headline?: string
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          publication_date?: string
          relevant_details_link?: string
          school_id?: string | null
          seo_keywords?: string
          seo_title?: string
          short_summary?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "publicity_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicity_articles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      publicity_banners: {
        Row: {
          auto_flip: boolean
          created_at: string
          created_by: string | null
          description: string
          id: string
          placement: string
          school_id: string | null
          show_arrows: boolean
          show_indicators: boolean
          show_pause_controls: boolean
          slide_duration: number
          slides: Json
          status: string
          title: string
          transition_effect: string
          updated_at: string
        }
        Insert: {
          auto_flip?: boolean
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          placement?: string
          school_id?: string | null
          show_arrows?: boolean
          show_indicators?: boolean
          show_pause_controls?: boolean
          slide_duration?: number
          slides?: Json
          status?: string
          title: string
          transition_effect?: string
          updated_at?: string
        }
        Update: {
          auto_flip?: boolean
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          placement?: string
          school_id?: string | null
          show_arrows?: boolean
          show_indicators?: boolean
          show_pause_controls?: boolean
          slide_duration?: number
          slides?: Json
          status?: string
          title?: string
          transition_effect?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicity_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicity_banners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      publicity_circulars: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          deep_link: string
          document_name: string
          document_url: string
          external_link: string
          featured_image: string
          id: string
          is_featured: boolean
          issue_date: string
          issuing_department: string
          reference_number: string
          school_id: string | null
          status: string
          summary: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          deep_link?: string
          document_name?: string
          document_url?: string
          external_link?: string
          featured_image?: string
          id?: string
          is_featured?: boolean
          issue_date?: string
          issuing_department?: string
          reference_number?: string
          school_id?: string | null
          status?: string
          summary?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          deep_link?: string
          document_name?: string
          document_url?: string
          external_link?: string
          featured_image?: string
          id?: string
          is_featured?: boolean
          issue_date?: string
          issuing_department?: string
          reference_number?: string
          school_id?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicity_circulars_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicity_circulars_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      publicity_media_gallery: {
        Row: {
          caption: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_featured: boolean
          media_type: string
          media_url: string
          school_id: string | null
          status: string
          tags: string[]
          thumbnail_url: string
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_featured?: boolean
          media_type?: string
          media_url: string
          school_id?: string | null
          status?: string
          tags?: string[]
          thumbnail_url?: string
          title: string
          updated_at?: string
        }
        Update: {
          caption?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_featured?: boolean
          media_type?: string
          media_url?: string
          school_id?: string | null
          status?: string
          tags?: string[]
          thumbnail_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicity_media_gallery_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicity_media_gallery_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      publicity_notices: {
        Row: {
          attachment_name: string
          attachment_url: string
          content: string
          created_at: string
          created_by: string | null
          expire_at: string | null
          id: string
          image_url: string
          is_featured: boolean
          is_pinned: boolean
          label: string
          publish_at: string
          read_more_link: string
          school_id: string | null
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string
          attachment_url?: string
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean
          is_pinned?: boolean
          label?: string
          publish_at?: string
          read_more_link?: string
          school_id?: string | null
          status?: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string
          attachment_url?: string
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean
          is_pinned?: boolean
          label?: string
          publish_at?: string
          read_more_link?: string
          school_id?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicity_notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicity_notices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      result_publications: {
        Row: {
          class_name: string
          created_at: string
          id: string
          notes: string
          published_at: string
          published_by: string | null
          status: string
          term: string
          updated_at: string
          withheld_student_ids: Json
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          notes?: string
          published_at?: string
          published_by?: string | null
          status?: string
          term: string
          updated_at?: string
          withheld_student_ids?: Json
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          notes?: string
          published_at?: string
          published_by?: string | null
          status?: string
          term?: string
          updated_at?: string
          withheld_student_ids?: Json
        }
        Relationships: [
          {
            foreignKeyName: "result_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_branding: {
        Row: {
          accent_color: string
          created_at: string
          currency: string
          date_format: string
          display_name: string
          established_year: string
          id: string
          language: string
          locale: string
          logo_url: string | null
          motto: string
          primary_color: string
          school_id: string
          show_powered_by: boolean
          tagline: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          currency?: string
          date_format?: string
          display_name?: string
          established_year?: string
          id?: string
          language?: string
          locale?: string
          logo_url?: string | null
          motto?: string
          primary_color?: string
          school_id: string
          show_powered_by?: boolean
          tagline?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          currency?: string
          date_format?: string
          display_name?: string
          established_year?: string
          id?: string
          language?: string
          locale?: string
          logo_url?: string | null
          motto?: string
          primary_color?: string
          school_id?: string
          show_powered_by?: boolean
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_branding_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_classes: {
        Row: {
          active: boolean
          created_at: string
          id: string
          level_code: string
          name: string
          school_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          level_code: string
          name: string
          school_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          level_code?: string
          name?: string
          school_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_types: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          active: boolean
          code: string
          community: string
          country: string
          created_at: string
          currency: string
          district: string
          gps_address: string
          id: string
          level_codes: string[]
          locale: string
          name: string
          postal_address: string
          region: string
          timezone: string
          town: string
          type_code: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          community?: string
          country?: string
          created_at?: string
          currency?: string
          district?: string
          gps_address?: string
          id?: string
          level_codes?: string[]
          locale?: string
          name: string
          postal_address?: string
          region?: string
          timezone?: string
          town?: string
          type_code?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          community?: string
          country?: string
          created_at?: string
          currency?: string
          district?: string
          gps_address?: string
          id?: string
          level_codes?: string[]
          locale?: string
          name?: string
          postal_address?: string
          region?: string
          timezone?: string
          town?: string
          type_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          allowed_ips: string
          created_at: string
          id: string
          lockout_duration: number
          max_concurrent_sessions: number
          max_login_attempts: number
          session_timeout: number
          singleton: boolean
          updated_at: string
        }
        Insert: {
          allowed_ips?: string
          created_at?: string
          id?: string
          lockout_duration?: number
          max_concurrent_sessions?: number
          max_login_attempts?: number
          session_timeout?: number
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          allowed_ips?: string
          created_at?: string
          id?: string
          lockout_duration?: number
          max_concurrent_sessions?: number
          max_login_attempts?: number
          session_timeout?: number
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      staff_performance: {
        Row: {
          comments: string
          created_at: string
          id: string
          rating: string
          rating_score: number
          review_period: string
          reviewer_id: string | null
          staff_id: string
          updated_at: string
        }
        Insert: {
          comments?: string
          created_at?: string
          id?: string
          rating: string
          rating_score?: number
          review_period: string
          reviewer_id?: string | null
          staff_id: string
          updated_at?: string
        }
        Update: {
          comments?: string
          created_at?: string
          id?: string
          rating?: string
          rating_score?: number
          review_period?: string
          reviewer_id?: string | null
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_performance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          schedule_date: string
          schedule_type: string
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          schedule_date: string
          schedule_type: string
          staff_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          schedule_date?: string
          schedule_type?: string
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_assessments: {
        Row: {
          admission_id: string
          assessment_type: string
          class_name: string
          created_at: string
          id: string
          out_of: number
          remark: string
          score: number
          subject: string
          term: string
          updated_at: string
        }
        Insert: {
          admission_id: string
          assessment_type?: string
          class_name?: string
          created_at?: string
          id?: string
          out_of?: number
          remark?: string
          score?: number
          subject: string
          term?: string
          updated_at?: string
        }
        Update: {
          admission_id?: string
          assessment_type?: string
          class_name?: string
          created_at?: string
          id?: string
          out_of?: number
          remark?: string
          score?: number
          subject?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assessments_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          admission_id: string
          attendance_date: string
          created_at: string
          id: string
          note: string
          status: string
        }
        Insert: {
          admission_id: string
          attendance_date?: string
          created_at?: string
          id?: string
          note?: string
          status?: string
        }
        Update: {
          admission_id?: string
          attendance_date?: string
          created_at?: string
          id?: string
          note?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exeat: {
        Row: {
          admission_id: string
          created_at: string
          departed_at: string | null
          destination: string
          id: string
          reason: string
          return_at: string | null
          returned_at: string | null
          signed_by_id: string | null
          signed_by_name: string
          status: string
          updated_at: string
        }
        Insert: {
          admission_id: string
          created_at?: string
          departed_at?: string | null
          destination?: string
          id?: string
          reason?: string
          return_at?: string | null
          returned_at?: string | null
          signed_by_id?: string | null
          signed_by_name?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admission_id?: string
          created_at?: string
          departed_at?: string | null
          destination?: string
          id?: string
          reason?: string
          return_at?: string | null
          returned_at?: string | null
          signed_by_id?: string | null
          signed_by_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_exeat_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          admission_id: string
          amount_due: number
          amount_paid: number
          created_at: string
          due_date: string | null
          id: string
          status: string
          term: string
          updated_at: string
        }
        Insert: {
          admission_id: string
          amount_due?: number
          amount_paid?: number
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          term: string
          updated_at?: string
        }
        Update: {
          admission_id?: string
          amount_due?: number
          amount_paid?: number
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_performance: {
        Row: {
          admission_id: string
          assessment_type: string
          grade: string
          id: string
          recorded_at: string
          remarks: string
          score: number
          subject: string
          term: string
        }
        Insert: {
          admission_id: string
          assessment_type?: string
          grade?: string
          id?: string
          recorded_at?: string
          remarks?: string
          score?: number
          subject: string
          term: string
        }
        Update: {
          admission_id?: string
          assessment_type?: string
          grade?: string
          id?: string
          recorded_at?: string
          remarks?: string
          score?: number
          subject?: string
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_performance_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          active: boolean
          code: string
          created_at: string
          credits: number | null
          elective: boolean
          id: string
          level_code: string
          name: string
          school_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          credits?: number | null
          elective?: boolean
          id?: string
          level_code: string
          name: string
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          credits?: number | null
          elective?: boolean
          id?: string
          level_code?: string
          name?: string
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teaching_assignments: {
        Row: {
          class_name: string
          created_at: string
          id: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          academic_year_start_month: number
          created_at: string
          departments: string[]
          features: Json
          grading_system: string
          id: string
          positions: string[]
          rating_scale: Json
          schedule_types: string[]
          school_id: string
          updated_at: string
          week_starts_on: string
        }
        Insert: {
          academic_year_start_month?: number
          created_at?: string
          departments?: string[]
          features?: Json
          grading_system?: string
          id?: string
          positions?: string[]
          rating_scale?: Json
          schedule_types?: string[]
          school_id: string
          updated_at?: string
          week_starts_on?: string
        }
        Update: {
          academic_year_start_month?: number
          created_at?: string
          departments?: string[]
          features?: Json
          grading_system?: string
          id?: string
          positions?: string[]
          rating_scale?: Json
          schedule_types?: string[]
          school_id?: string
          updated_at?: string
          week_starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          class_name: string
          created_at: string
          created_by: string | null
          day_of_week: string
          description: string
          end_time: string
          event_type: string
          id: string
          quiz_id: string | null
          room_number: string
          school_id: string | null
          specific_date: string | null
          start_time: string
          subject: string
          teacher_id: string | null
          term: string
          title: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          created_by?: string | null
          day_of_week: string
          description?: string
          end_time: string
          event_type?: string
          id?: string
          quiz_id?: string | null
          room_number?: string
          school_id?: string | null
          specific_date?: string | null
          start_time: string
          subject: string
          teacher_id?: string | null
          term?: string
          title?: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          day_of_week?: string
          description?: string
          end_time?: string
          event_type?: string
          id?: string
          quiz_id?: string | null
          room_number?: string
          school_id?: string | null
          specific_date?: string | null
          start_time?: string
          subject?: string
          teacher_id?: string | null
          term?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_slots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "exams_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_branding: {
        Args: never
        Returns: {
          logo_url: string
          name: string
          tagline: string
        }[]
      }
      get_public_branding_full: {
        Args: never
        Returns: {
          accent_color: string
          established_year: string
          language: string
          logo_url: string
          motto: string
          name: string
          primary_color: string
          tagline: string
        }[]
      }
      next_generated_number: { Args: { _kind: string }; Returns: string }
      write_school_configuration: {
        Args: {
          _columns?: Json
          _incoming: Json
          _key: string
          _school_id: string
        }
        Returns: Json
      }
      write_school_module_policy: {
        Args: { _features: Json; _school_id: string; _week_starts_on: string }
        Returns: undefined
      }
    }
    Enums: {
      access_level:
        | "super_administrator"
        | "administrator"
        | "standard"
        | "basic"
      app_role:
        | "super_admin"
        | "school_manager"
        | "staff"
        | "student"
        | "parent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: [
        "super_administrator",
        "administrator",
        "standard",
        "basic",
      ],
      app_role: ["super_admin", "school_manager", "staff", "student", "parent"],
    },
  },
} as const
