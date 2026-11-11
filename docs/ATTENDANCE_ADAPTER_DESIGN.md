# Attendance adapter design — AppDeploy-first

**Status:** Evidence-based design only; no attendance runtime code or database migration has been deployed.  
**AppDeploy source snapshot inspected:** \`1794388390428\` (deployment \`ready\`).  
**GitHub source revision inspected:** \`3dfcd6888e519d528d360b3452d1287ac92f22e6\` on \`main\`.

## 1. Current implementation evidence

### AppDeploy

- The navigation already exposes **Attendance**, but \`src/App.tsx\` routes it to the generic planned-module placeholder. There is no Attendance backend file or operational Attendance component in the current 65-file AppDeploy source inventory.
- \`backend/academic.ts\` owns the school-scoped academic-year, term, class, section and subject catalog.
- \`backend/students.ts\` owns the tenant-partitioned student master records. The stable fields include \`schoolId\`, \`classId\`, \`sectionId\`, \`academicYearId\`, \`admissionStatus\`, \`status\` and \`version\`.
- \`backend/scopes.ts\` owns the current \`teaching_assignments\` registry. It records \`teacherUserId\`, \`schoolId\`, \`classId\`, \`subjectId\`, \`academicYearId\`, optional \`termId\` and lifecycle status.
- \`backend/platform.ts\` provides \`tenantAccessFromRequest\`, \`hasSchoolScope\`, \`authorize\`, \`authorizeRecord\`, tenant partitions, audit/domain-event helpers and central configuration.
- Existing central configuration includes \`school.timezone\`, \`academic.calendar\`, \`attendance.mode\` and \`attendance.correctionApproval\`. It does not currently expose the source module's backdate-days, late-after, absence-alert or minimum-attendance settings.

### GitHub source

- \`src/lib/attendance.functions.ts\` and \`attendance.schemas.ts\` implement a daily class register, status updates and recent history.
- The source functions query Supabase \`profiles\`, \`admissions\`, \`class_teachers\` and \`student_attendance\`; use static profile roles and class-name/email matching; and pass admission IDs to writes.
- The source UI at \`src/components/modules/AttendanceManagement.tsx\` uses \`useServerFn\`, class names and admission records. It also renders parent/guardian contact fields that are not part of the current AppDeploy student API.
- The source migration \`0015_scope_staff_access_to_assigned_classes.sql\` adds assignment checks to Supabase RLS. The UI's access pre-check is not a substitute for server-side enforcement in AppDeploy.
- No dedicated Attendance unit-test file was found in the current GitHub tree.

**Decision:** Treat the source as a workflow reference only. Do not port Supabase clients, table names, profile roles, admission IDs, class-name authorization or parent fields.

## 2. Reuse the existing AppDeploy and future SQL contracts

The AppDeploy-owned future PostgreSQL design already defines:

- \`attendance_sessions\` in \`database/postgresql/004_people_admissions_academics.sql\`, with tenant/school, class, optional section/subject, academic year, optional term, date, session type, period label, lifecycle status, opener and optimistic version.
- \`attendance_records\` in the same migration, with tenant/school, session, student, status, check-in time, remarks, actor/time, correction metadata and optimistic version.
- A uniqueness rule for one record per \`(tenant_id, session_id, student_id)\`.
- Attendance tables are included in the table-coverage list in \`007_rls_coverage.sql\` and the schema validation list in \`900_validation.sql\`.

The AppDeploy key-value runtime adapter should reuse the same logical partition names through \`tenantTable('attendance_sessions', tenantId)\` and \`tenantTable('attendance_records', tenantId)\` if/when implemented. These names are not permission to execute SQL or to create a second store. Do not introduce a separate \`student_attendance\` registry.

### Schema hardening before any future PostgreSQL execution

The SQL uniqueness constraint on \`attendance_sessions\` includes nullable \`period_label\`. PostgreSQL permits multiple NULL values in a normal unique constraint, so daily sessions with a NULL period label may not be unique as intended. Before a future migration is executed, make the period label non-null with a defined empty/default value or add an expression/partial unique index that enforces the intended key. This is a design finding, not a claim that SQL has been run.

The RLS migration comment also calls for equivalent assignment-join policies on attendance, marks, results and reports. The presence of attendance table names in the coverage list is not, by itself, proof that the required record-level assignment policies are complete. Review and test those policies in a provisioned PostgreSQL environment before any future use.

## 3. Proposed AppDeploy API boundary

These are proposed new endpoints, not existing public contracts. Final route names must be checked against the latest AppDeploy source immediately before implementation.

| Proposed route | Purpose | Required server-side boundary |
|---|---|---|
| \`GET /api/attendance/roster\` | Bounded roster for one school/class/year/date, with pagination | Authenticated tenant membership, active school, school scope, active/admitted student records and attendance read permission |
| \`POST /api/attendance/sessions\` | Open or resolve a daily/period session | Server-generated session ID; validate school/class/section/subject/year/term relationships; idempotent request receipt; attendance create permission |
| \`GET /api/attendance/sessions/:sessionId\` | Read session and its records | Load through tenant partition first, verify tenant/school, then call \`authorizeRecord\` |
| \`PUT /api/attendance/sessions/:sessionId/records\` | Save a bounded page of student statuses | Validate every student against the server-loaded roster and session; reject duplicate/foreign student IDs; optimistic version; attendance update permission |
| \`POST /api/attendance/sessions/:sessionId/submit\` | Submit a complete register | Verify roster completeness and current session version; enforce period and workflow rules; append audit/domain events |
| \`POST /api/attendance/records/:recordId/corrections\` | Request or apply a correction | Server-loaded record scope; reason; correction approval workflow when centrally configured; preserve prior value and actor |
| \`GET /api/attendance/history\` | Bounded school/class/date-range summaries | Tenant/school scope, read authorization, pagination and server-derived aggregates |

The implementation must preserve AppDeploy's established query-first tenant contract where the target route requires it. Never treat a client-supplied tenant, school, class, subject, student or teacher ID as authorization evidence.

## 4. Domain and validation rules

1. Resolve the authenticated principal with AppDeploy \`requireAuth()\`, then resolve active membership through \`tenantAccessFromRequest\`.
2. Resolve the active school from the tenant-scoped school registry and enforce \`hasSchoolScope\`.
3. Resolve class, section, academic year and term through the existing school-scoped academic catalog. Reject inactive, foreign-school or mismatched references.
4. Resolve the roster from AppDeploy \`students\`, not admissions. At minimum require matching tenant, school, class, academic year, active status and admitted lifecycle state. Confirm any exception for registered learners before implementation.
5. Use stable class/student IDs in all API payloads. The UI may display names, but class names and admission numbers must never be record keys or authorization context.
6. Load each session/record through its tenant partition before invoking \`authorizeRecord\`. Use the central resource/action policy and record-derived school/class/subject/year/term context. Preserve explicit-deny precedence.
7. Teachers must be scoped through the existing \`teaching_assignments\` registry and the shared authorization service. Do not create a parallel \`class_teachers\` registry or fall back to matching email addresses.
8. The current teaching-assignment create route requires a subject ID. If a class-teacher-only responsibility must grant daily attendance access without a subject assignment, resolve that gap within the existing assignment/policy model before implementation; do not invent a second assignment source.
9. Validate ISO calendar dates, school-local date interpretation, configured school days, academic-period write windows, status enum, remarks length, session type, period label, duplicate student IDs, roster membership and maximum page size.
10. Use optimistic concurrency for session and record updates. Retries must be idempotent and must not create duplicate sessions, records, audit entries or domain events.
11. Support paged rosters and bounded writes. Before submission, verify that the complete eligible roster is accounted for; do not silently submit a partially loaded class.
12. Keep the initial UI statuses compatible with the source workflow (\`present\`, \`absent\`, \`late\`, \`excused\`). The future SQL schema also allows \`sick\` and \`authorised_absence\`; expose those only when the school policy and UI are explicitly mapped.
13. Do not render parent/guardian contact columns until a supported AppDeploy guardian relationship/read API exists. Never synthesize missing contact data.

## 5. Configuration ownership

Use the AppDeploy central configuration registry only:

- Existing: \`attendance.mode\`, \`attendance.correctionApproval\`, \`academic.calendar\`, \`school.timezone\`.
- Source rules needing a central mapping before use: backdate window, late-after cutoff, consecutive-absence alert threshold and minimum attendance percentage.

If these rules are approved, add validated definitions to the existing central registry and its versioned write/history path. Do not import \`tenant_settings.features.__academic_rules\` as another runtime store. Date checks must use the school's configured timezone and the shared academic calendar; do not add module-local calendar logic.

## 6. Audit, workflow and event handling

Reuse \`auditRecord\`, \`domainEvent\`, \`authorizeRecord\` and the existing governance workflow service. Proposed new event names should be finalized once and then kept stable, for example:

- \`attendance.session.opened\`
- \`attendance.records.saved\`
- \`attendance.session.submitted\`
- \`attendance.correction.requested\`
- \`attendance.correction.approved\`
- \`attendance.session.locked\`

A correction must retain the original status in correction metadata and record the reason and actor. If \`attendance.correctionApproval\` is true, a correction to a submitted/locked register must enter the shared approval workflow rather than directly overwrite the record. Do not claim immutable audit or transactional outbox delivery beyond what the current AppDeploy store actually guarantees.

## 7. UI integration

- Add an operational Attendance component to the existing AppDeploy React app and connect it through \`@appdeploy/client\`; do not import \`@appdeploy/sdk\` into frontend code.
- Mount it in the existing \`src/App.tsx\` Attendance branch, replacing only the generic planned-module placeholder for that item.
- Reuse the current authenticated tenant session, authorised school list, academic catalog, shared error handling and existing design system. Keep the current navigation, route names and surrounding UI intact.
- Provide daily/period register, class/date selection, status entry, notes, summary, save/update, history and safe export. Do not add Supabase \`useServerFn\` calls.
- The source CSV helper is not present in the current AppDeploy inventory. Use an existing AppDeploy-safe export utility if one exists at implementation time; otherwise add one shared formula-injection-safe utility rather than a module-local CSV implementation.

## 8. Required tests before a release

- Anonymous requests and inactive tenant memberships are denied.
- Cross-tenant and cross-school session/record IDs return safe not-found/denial responses without data disclosure.
- Explicit deny overrides any matching allow policy.
- A teacher with an active matching assignment can read/write only the assigned school/class/year and, where applicable, subject/term.
- A teacher without an assignment, with an expired delegation or with an assignment in another school/year cannot read or mutate the register.
- A school administrator cannot submit records for a foreign school or inactive class/year.
- Foreign, inactive, withdrawn or non-admitted students cannot be added to a register.
- Duplicate student IDs, unsupported statuses, malformed dates, oversized notes, invalid pagination and stale versions are rejected.
- Retrying a session or records request does not create duplicates or duplicate audit/events.
- Concurrent updates conflict safely; a submitted/locked session cannot be edited outside the correction workflow.
- Backdate, future-date, school-day and academic-period rules use central configuration and the school timezone.
- A session cannot be submitted while eligible roster records are missing.
- Pagination works beyond one page; history summaries do not leak records across school/tenant scope.
- UI covers save/reload persistence, edit, error handling, mobile register interaction and export formula-injection protection.

## 9. Release gate

This document is a design artifact only. Do not mark Attendance implemented until backend routes, UI, tenant/RBAC/ABAC tests, validation, persistence/idempotency tests and regression checks have executed against a safe AppDeploy staging environment. The current live deployment must remain unchanged until that gate is available and passed. No PostgreSQL SQL has been executed or validated.
