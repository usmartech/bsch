# School Hub consolidation plan

**Status:** AppDeploy baseline re-synchronized; security/engineering baseline remains in a draft PR; module integration continues incrementally.  
**Live application:** School Hub Enterprise, AppDeploy app \`school-hub-enterprise-iruutw\` — https://school-hub-enterprise-iruutw.v2.appdeploy.ai/  
**Source repository:** \`usmartech/bsch\`, default branch \`main\`; integration review branch \`integration/school-hub-enterprise-consolidation\`.

## Governing decisions

1. The existing AppDeploy project is the sole current runtime, authentication authority, authorization authority and persistence authority. Preserve its live URL, existing source, records and contracts.
2. The GitHub repository is a reference/source of domain workflows, UI behavior and validation rules. Integrate selectively into AppDeploy; do not deploy the GitHub application wholesale.
3. No Supabase project is provisioned for this application. Do not introduce Supabase Auth, Supabase persistence, direct Supabase clients, service-role access or another competing runtime into the live application.
4. Keep the enterprise PostgreSQL SQL package in AppDeploy as future design scaffolding only. No SQL migration is considered executed or PostgreSQL-validated without a real PostgreSQL test environment and an approved future migration decision.
5. Preserve tenant and school IDs, membership records, dynamic roles and policies, explicit-deny precedence, record-derived ABAC scope, table names, key formats, schemas, audit/event names, workflow transitions, validation and existing business rules. Map source behavior to the central AppDeploy services; do not create duplicate registries or authorities.
6. Never read, copy or migrate environment-file contents. Use AppDeploy's approved secret manager for any future secrets. Do not rewrite published Git history without explicit owner approval.
7. Keep source changes reviewable on branches/PRs. Do not deploy AppDeploy runtime changes until they have been tested through a safe staging path; preserve the current healthy deployment.

## Re-synchronized baseline — 11 November 2026

- AppDeploy deployment: snapshot \`1794388390428\`, status \`ready\`, live URL unchanged.
- AppDeploy source inventory: 65 files. It includes the platform, enterprise, governance, role/scope, school, student, academic and admissions backends; current UI components; PostgreSQL design migrations; architecture documentation; and test specifications.
- AppDeploy validation reports \`valid: true\` with no validation errors. The QA snapshot reported no frontend or network errors. The current test suite has seven scenarios and a validation warning recommending a focused 3–5 test suite. This is not evidence that adversarial multi-tenant API tests or PostgreSQL tests have run.
- GitHub default branch: \`main\`, head \`3dfcd6888e519d528d360b3452d1287ac92f22e6\` (7 November 2026). The source is a TanStack Start/React application with Supabase-specific server functions and separate Drizzle/Supabase migration histories.
- Draft PR #1 remains open on \`integration/school-hub-enterprise-consolidation\`. It contains the initial security hygiene, CI and consolidation documents; it is not an AppDeploy runtime staging environment.
- AppDeploy's available source interface in this run supports source inspection and deployment updates, but no separate AppDeploy source branch or preview-edit operation was available. No live AppDeploy source was changed or deployed in this run.

## Security and CI baseline

- The GitHub \`main\` tree contains a tracked root \`.env\`; the current \`.gitignore\` does not exclude \`.env\` files. The environment file was not directly fetched or copied.
- PR #1 removes the tracked root file from its proposed branch and adds \`.env\`, \`.env.*\`, and \`!.env.example\` ignore rules. This does not remove historical Git blobs. Privately review the file's history and rotate/revoke any private or privileged credentials that were actually present; do not expose values in issues, commits, logs or reports.
- PR #1's first GitHub Actions run failed during the Node setup step; dependency installation, typecheck, lint, tests and build were skipped. The workflow uses npm caching/install commands while the repository provides \`bun.lock\` and no npm lockfile. The workflow is being aligned to Bun's frozen-lockfile install before interpreting CI as a code failure.
- GitHub CI validates the GitHub source branch only. It does not validate the AppDeploy runtime or authorize a production deployment.

## Evidence-based integration matrix

| GitHub source area | Current AppDeploy counterpart | Compatibility decision / status |
|---|---|---|
| \`src/integrations/supabase/*\`, \`src/lib/access.ts\`, \`src/lib/admin.server.ts\` | \`backend/platform.ts\`, \`backend/request-security.ts\`, \`backend/roles.ts\`, \`backend/scopes.ts\`, AppDeploy \`requireAuth()\` | Incompatible identity/policy implementations. Do not port Supabase auth middleware, profile-role checks or a second user registry. Reuse AppDeploy identity, membership, dynamic RBAC/ABAC and deny precedence. |
| \`src/lib/students.functions.ts\`, schemas and student UI | \`backend/students.ts\`, \`backend/academic.ts\`, \`src/components/StudentManagement.tsx\` | AppDeploy student API and UI already exist. Preserve server-issued IDs, registration intents, tenant partitions, optimistic versions, school scope and existing routes. Extend only after parity tests identify a real gap. |
| \`src/lib/admissions.functions.ts\`, schemas and admissions UI | \`backend/admissions.ts\`, \`src/components/AdmissionsManagement.tsx\` | AppDeploy admissions intake/review, decision history, document storage and link-to-existing-student flow exist. Do not create another student or enrolment registry. API security execution remains pending. |
| \`src/lib/academic-calendar.ts\`, \`academic-rules.ts\`, configuration modules | \`backend/academic.ts\`, central configuration APIs and \`src/components/AcademicConfiguration.tsx\` | AppDeploy academic-year/term/class/section/subject catalog exists. Reconcile calendar, grading-band and attendance-rule semantics with the single AppDeploy configuration authority before adding consumers; no module-local settings copies. |
| \`src/lib/attendance.functions.ts\`, \`attendance.schemas.ts\` | Attendance navigation item exists in \`src/App.tsx\`; no AppDeploy attendance backend or operational component is present in the current 65-file inventory | Highest-value next vertical slice. GitHub functions depend on Supabase \`profiles\`, \`admissions\`, \`class_teachers\` and \`student_attendance\`, and use class names/static roles. Adapt to AppDeploy student IDs, school-scoped academic class IDs, \`teaching_assignments\`, \`tenantAccessFromRequest\`, \`authorizeRecord\`, shared academic rules, audit and domain events. Never port direct Supabase calls or trust client-supplied class scope. |
| \`src/lib/staff.functions.ts\`, staff UI and \`people-rules.ts\` | HR configuration definitions exist; no complete AppDeploy staff domain route/component is present | Later vertical slice. Staff employment records must remain distinct from login identities. Reuse AppDeploy memberships for user linkage, central configuration, authorization, audit and workflow; do not use \`profiles.role\` as a second identity authority. |
| Assessment, exams, results, reporting and timetable modules | Academic catalog and shared platform services; no complete operational route set evidenced | Later dependency-ordered adapters. Reuse one grading/rules authority, academic references, workflow and audit services. |
| Fees, invoices, finance and payroll modules | Central finance configuration only; no complete runtime finance domain route set evidenced | Later stage after ledger, approval, idempotency and reconciliation contracts are designed. No direct Supabase writes. |
| Library, messaging, publicity, archives, lessons, assignments and campus services | Shared platform/storage/notification foundations; module coverage incomplete or unverified | Later adapters using shared storage, notification, reporting, audit and tenant-scope services. |
| Drizzle schema and Supabase migrations | AppDeploy \`database/postgresql/001..008\` and \`900_validation.sql\` | Reference material only. Reconcile schema semantics into the single AppDeploy-owned future SQL chain; do not run GitHub migration histories or claim SQL execution. |
| GitHub Actions, Vitest and Vite | AppDeploy deployment/QA process | Adopt source CI after its own run passes. Keep AppDeploy release as the only live deployment path; GitHub CI is not AppDeploy runtime QA. |

## Integration sequence

1. Maintain the single AppDeploy platform boundary: identity, membership, RBAC/ABAC, tenant/school scope, configuration, data access, audit, workflow and event helpers.
2. Complete the Attendance vertical slice against AppDeploy contracts: bounded class roster reads, one register per school/class/date, duplicate and roster validation, idempotent/concurrency-safe saves, server-derived scope, correction workflow where supported, audit/domain events, and cross-tenant/cross-school/teacher-assignment tests.
3. Add Staff/People only after defining an employee record model separate from AppDeploy login identities and mapping the existing HR configuration keys.
4. Continue with grading/assessment, examinations/results/reporting, finance, communications and campus services in dependency order.
5. Update the integration matrix and tests at each stage. Do not call a module complete because a screen, route, SQL file or test specification exists; require executed behavior and authorization evidence.

## Release and verification gates

- Test changed code before release: typecheck, lint, focused unit tests, backend route tests, tenant-isolation/RBAC/ABAC tests, validation and regression checks.
- Verify server-derived tenant/school/record scope, explicit deny precedence, inactive membership, expired delegation, cross-tenant IDOR, cross-school access, teacher assignment scope, idempotency and concurrency.
- Run AppDeploy frontend/backend/network/e2e QA and verify the resulting deployment status before claiming release success.
- Keep the current healthy deployment untouched while a safe AppDeploy staging/preview route is unavailable. A GitHub draft PR is source review, not a substitute for an AppDeploy staging runtime.
- Maintain PostgreSQL install/upgrade/RLS/restore test plans in the SQL scaffolding, but do not claim PostgreSQL validation until a real database test environment runs.

## Current blockers and next stage

- The AppDeploy runtime is healthy, but a separate safe staging/preview path for AppDeploy source edits was not available in this run. No runtime change was made.
- Fix and rerun the GitHub PR CI workflow using the repository's Bun lockfile.
- Next implementation target: Attendance adapter and UI, beginning with a complete contract review of AppDeploy student, academic and teaching-assignment records. Do not port the source module's Supabase data access or static role model.
- Continue to preserve the existing AppDeploy deployment and do not introduce Supabase Auth or persistence.
