# School Hub contract ownership map

This file defines the initial ownership boundary for the consolidation. It is a migration map, not proof that every capability is complete.

| Concern | Canonical owner after cutover | GitHub source to adapt | Existing AppDeploy contract to preserve |
|---|---|---|---|
| Identity | Supabase Auth + canonical profile projection | `src/hooks/useSession.tsx`, `src/integrations/supabase/*` | Stable authenticated principal, actor attribution |
| Membership / tenant | Central platform organisation service and one PostgreSQL membership model | `src/lib/school.server.ts`, membership migrations | `tenantContext`, `tenantAccessFromRequest`, tenant and school scope |
| RBAC / ABAC | One server-side policy evaluator and normalized grants | `src/lib/access.ts`, `src/lib/user-management.ts`, RLS functions | `authorize`, `authorizeRecord`, deny precedence, teaching scope |
| Organisation hierarchy | One parent-child organisation registry | school setup and school membership migrations | `organisation_nodes`, hierarchy governance API |
| Configuration | One versioned configuration service | `src/lib/config*`, finance/academic config modules | `configuration.v1`, version/concurrency/audit contract |
| Student/admissions | Shared student and admissions domain services | `src/lib/students*`, `src/lib/admissions*` | Existing student API, tenant partitioning, IDs and audit/events |
| Staff/people | Shared people and staff services | `src/lib/staff*`, `src/lib/people-rules.ts` | Membership identity linkage and school scope |
| Academics | Shared calendar, class, subject, teaching and attendance services | academic, teaching, attendance, timetable modules | Academic configuration and ABAC teaching assignment |
| Assessment/exams/results | Shared assessment and result services | assessment, exams, results, reports modules | Approval workflows, grading config, audit/events |
| Finance | Shared finance ledger/configuration services | finance, fees, invoices, payroll modules | Currency/numbering/config authority, maker-checker and audit |
| Audit/workflow/events | Shared governance and outbox services | audit logs and workflow consumers | Actor-attributed audit, workflow state and versioned domain events |
| Release | One pipeline and immutable release artifact | GitHub Actions, Vitest, Vite | Existing AppDeploy deployment and rollback history |

## Known incompatibilities to resolve

- AppDeploy currently authenticates requests using AppDeploy `requireAuth()`; GitHub server functions validate Supabase JWT claims. Both cannot remain active as independent user identity authorities after cutover.
- AppDeploy persistence uses tenant-partitioned key-value tables. GitHub modules query Supabase tables directly through generated clients. The target must be one PostgreSQL schema behind a shared server-side repository boundary.
- AppDeploy dynamic tenant RBAC/ABAC policies and GitHub's role enum, access-level/module lists and SQL role helpers are not equivalent. Normalize grants and preserve explicit deny and record-derived scope; do not translate to a broad static role allowlist.
- GitHub's migration history includes both `drizzle/migrations` and `supabase/migrations`. Choose one source of truth and reconcile all SQL in order before provisioning.
- GitHub's latest school-membership SQL includes a one-school-only backfill guard. Treat it as a bespoke historical migration, not a reusable bootstrap for an existing multi-tenant database.
- The GitHub repository's root `.env` was tracked. Its contents were deliberately not read. Removing the current branch copy and ignoring future local environment files does not remove the blob from prior Git history.
