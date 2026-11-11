# School Hub consolidation plan

**Status:** Stage 0 audit complete; Stage 1 security hygiene and architecture baseline in progress.  
**Primary runtime:** Existing School Hub Enterprise AppDeploy app `school-hub-enterprise-iruutw`.  
**Source repository:** `usmartech/bsch`, default branch `main`.  
**Integration branch:** `integration/school-hub-enterprise-consolidation`.

## Governing decisions

1. Preserve the existing AppDeploy app, URL, route contracts, user-visible workflows and existing records. No replacement app or wholesale repository overwrite.
2. Treat the GitHub project as a source of domain capabilities and UI workflows to port selectively, not as a second runtime architecture.
3. Target one Supabase PostgreSQL database and one Supabase Auth identity provider for the eventual production data/authentication plane, subject to environment provisioning, migration rehearsal and explicit cutover approval. AppDeploy remains the deployment/runtime host for the existing application; its key-value store is a transitional persistence source only and must not remain a competing domain source of truth after cutover.
4. Do not run two identity providers, parallel role registries, parallel tenant/school registries, or dual-write domain records. A temporary read-only migration/verification window is allowed; writes switch once at a controlled cutover.
5. Preserve existing tenant, school, membership, role, permission, ABAC, audit, event and domain record semantics. Map identifiers explicitly; never regenerate IDs merely because the storage technology changes.
6. All PostgreSQL DDL is reviewed and versioned. No SQL in either project is considered applied merely because it exists in source control.

## Stage 0 — source and deployment baseline (complete)

- AppDeploy deployment checked: snapshot `1794307845954`, status `ready`, live URL https://school-hub-enterprise-iruutw.v2.appdeploy.ai/.
- Existing AppDeploy source inventory: 52 files, including platform, enterprise, governance, roles, schools, scopes, students, academic, security, PostgreSQL design migrations and tests.
- GitHub repository confirmed: public `usmartech/bsch`, default branch `main`; TanStack Start/React, Supabase Auth/PostgreSQL, Drizzle and a broad set of school-domain modules and tests.
- Repository contains six Supabase SQL migration files plus a separate Drizzle migration history. These histories must be reconciled before selecting a single migration authority.
- The latest school-membership migration performs a guarded backfill that requires exactly one existing school. It is not safe to apply as a generic multi-school production migration without reviewing actual target data and rewriting the backfill.
- The repository's role model and school-scoped membership model differ from the AppDeploy platform's tenant membership and dynamic RBAC/ABAC contracts. They must be mapped, not copied as competing authorization systems.

## Stage 1 — security and architecture baseline

- Remove the tracked root `.env` from the integration branch and ignore local environment files. The file was not opened or copied.
- This does not erase prior Git history. Treat any credentials ever committed in that file as potentially exposed: rotate/revoke them with their providers, inspect repository history privately, and arrange history cleanup if required.
- Establish one written migration authority, identity authority, tenant hierarchy and domain-service ownership map before moving application modules.
- Keep this work on an integration branch and submit as a draft pull request. Do not merge to `main` or deploy unverified code.

## Stage 2 — contract and schema reconciliation

Produce a reviewed mapping for:
- Identity: Supabase Auth user ID as canonical principal; one profile projection; one membership source; one role-grant/permission/ABAC evaluator. Existing AppDeploy user IDs must be mapped and preserved where compatible; conflicts require an explicit mapping table and reconciliation report.
- Organisation: tenant → school → campus → branch → department → unit → location, with parent-child integrity, tenant ownership and lifecycle constraints. Existing school IDs and tenant IDs remain stable.
- Configuration: one versioned tenant/school configuration registry for academic year/calendar, grading, finance, locale/timezone, numbering and integrations. Domain modules consume typed configuration services.
- Domain data: one canonical schema and one repository/data-access boundary. Do not retain Supabase table access alongside AppDeploy KV domain stores after cutover.
- Governance: one actor attribution model, audit append path, workflow state machine, transactional outbox, idempotency and retry contract.
- Existing Supabase RLS policies, grants, SECURITY DEFINER functions, triggers and indexes must be tested against tenant and school membership edge cases. Client-side role/module visibility is never an authorization boundary.

Deliverables: canonical schema, data dictionary, migration matrix, compatibility adapters, API contract map, data-quality report and rollback/recovery plan.

## Stage 3 — persistence and identity migration

1. Provision the target Supabase project and confirm region, backup/PITR options, connection pooling, Auth settings, redirect URLs and operational owner.
2. Store credentials only in AppDeploy secret storage; never in source, chat, client bundles or logs.
3. Create a staging environment with representative sanitized data and apply one consolidated migration chain from a clean database.
4. Reconcile the repository's Drizzle and Supabase migration histories into one authoritative ordered migration chain; do not run both histories blindly.
5. Export AppDeploy KV records by bounded, checkpointed tenant pages. Preserve IDs, tenant ownership, versions, timestamps, actor IDs, audit history and event IDs. Validate counts, checksums, references and uniqueness.
6. Backfill into PostgreSQL in dependency order with idempotent import receipts. Quarantine invalid/orphaned rows; never silently discard or coerce them.
7. Run a read-only comparison and adversarial tenant/RLS test suite. Keep production writes on the old store until the cutover gate passes.
8. Freeze writes for the cutover window, take a recoverable backup/export, apply final delta, verify invariants, then switch all application data access and auth to the single Supabase-backed path.
9. Retain a time-bounded, access-controlled rollback export. Do not resume writes to the old store after cutover; rollback is a coordinated restore/cutback, not dual-write.

## Stage 4 — module porting and centralization

Port in dependency order, adapting the GitHub UI and workflows to existing enterprise contracts:
1. Shared server data-access, validation, error mapping, pagination and authorization boundary.
2. Organisation, identity, membership, role and configuration consumers.
3. Students/admissions and staff/people.
4. Academic calendar, classes, subjects, teaching assignments, attendance, lessons and timetable.
5. Assessment, examinations, results and termly reporting.
6. Finance configuration, fees, invoices, receipts, income/expenses and payroll.
7. Library, messaging, parent communication, archives, publicity and analytics/reporting.

Each module must use shared repositories/services and server-derived tenant/school/record scope. Preserve established public API and UI behavior through compatibility adapters until callers are migrated. Remove old implementations only after usage and data parity are demonstrated.

## Stage 5 — verification and release

Required gates:
- TypeScript type-check, lint and production build for the complete frontend/server application.
- Unit, integration and migration tests, including clean install and upgrade from a representative prior schema.
- Authorization matrix tests for every route/action; deny precedence, inactive membership, expired delegation, cross-tenant IDOR, cross-school access, teacher assignment scope and parent/student self-scope.
- RLS tests for anon/authenticated/service roles, table grants, function execution and tenant/school isolation.
- End-to-end tests for login, admin password reset, setup, school switching, module access, student/staff lifecycle, academic operations, exams/results, finance, audit and approval workflows.
- Performance tests for bounded pagination, indexes, tenant-scale reads, concurrency, idempotency and outbox delivery.
- Security checks for secrets, dependency vulnerabilities, CSRF/origin, session expiry, upload validation and privilege escalation.
- Backup restore drill, monitoring/alerts, SLO/RTO/RPO, incident and rollback runbooks.
- Deployment preview and smoke tests before production release; one approved release pipeline with immutable artifacts and a documented rollback target.

## Current blockers / inputs required

- Rotate any secrets that may have been present in the tracked `.env`; the file's history has not been rewritten.
- Provision/identify the intended Supabase project and authorize secure entry of its URL and publishable key (plus server-only credentials if a service-role operation is genuinely required).
- Confirm a migration window and the accountable data owner for production cutover.
- Confirm the actual current AppDeploy KV dataset and tenant count before designing irreversible backfills.

## Non-goals

- No blind source copy, framework rewrite, second auth system, duplicate registry, parallel domain database, or production SQL execution during source reconciliation.
- No claim of production readiness until every release gate is evidenced.
