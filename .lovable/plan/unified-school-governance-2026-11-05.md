# Unified school governance

## Audited baseline

- All 198 existing tests pass across 29 test files. These mostly cover schemas and calculations, not authenticated integration or tenant-isolation workflows.
- The connected database currently has zero schools, profiles, admissions, assignments, exams and tenant configuration rows. No existing school records need speculative tenant allocation.
- Six central configuration domains already exist. Preserve those owners, the shared academic calendar, teaching assignments, financial currency, printing and CSV services.
- Confirmed gaps: the shared school resolver selects the earliest school rather than a caller's membership; profiles and admissions have no school ownership; roles and database policies are predominantly global; academic detail endpoints can bypass enrollment checks; several modules use profile roles rather than protected role records; configuration updates can lose concurrent changes across domains.
- Existing deployment logs supplied no current error entries. A passing test suite does not establish complete governance.

## Intended result

Assignments, exams, results, lessons, timetable, library, publicity, billing runs, messaging, interventions and regrade requests operate as parts of one school system. Each consumes its registered configuration owner, shared authorization, authoritative records and explicit integration contracts. School-specific records and settings cannot be read or changed across tenants.

## 1. Establish tenant and authorization foundations

- Add protected school membership and school-scoped role assignments, retaining an explicit platform Super Admin boundary. Never derive privilege from profile fields or editable session storage.
- Resolve tenant context from authenticated membership. An explicitly requested school must be authorized; missing or ambiguous membership fails closed instead of selecting an arbitrary school.
- Add school ownership to school-specific root records and inherit/validate it across child records. Replace school-local global uniqueness where needed and validate class, subject and learner relationships within the same school.
- Update existing provisioning and account-management flows to assign memberships intentionally, with atomic school configuration initialization.
- Enforce tenant isolation in the database as well as server handlers. Existing permissive policies must be replaced or constrained; adding another permissive policy alone does not restrict access.
- Preserve intentionally public published publicity reads, scoped to the public school's identity. Do not expose private settings or broaden anonymous access.

## 2. Make shared configuration reads and writes safe

- Route calendar, academic, people, operations, finance and module availability reads through the trusted school context.
- Make versioned configuration updates atomic, preserving unrelated domain keys and rejecting stale versions, including first writes. Protect ordinary feature-toggle saves from overwriting concurrent versioned-domain changes.
- Validate known operational rules and settings contracts centrally. Add new sections with backward-compatible defaults; preserve deleted-rule semantics instead of silently restoring local fallback rules.
- Publish one shared configuration-change contract and refresh dependent queries after successful saves. Configuration changes must take effect without module edits.
- Preserve the distinction between academic lifecycle and versioned finance activation; document their contracts rather than creating a second lifecycle owner.

## 3. Integrate the requested modules

### Academic workflows
- Use canonical student/guardian admission links, not names, emails or phone matching, for assignments, lessons, exam access and results.
- Authorize both the existing record and proposed replacement scope on updates. Check class/subject teaching assignments and centrally governed period rules on every applicable dated mutation.
- Protect exam attempts and answers using the authenticated learner, owning attempt and exam contract; prevent answer-key disclosure before authorized release and submission/answer identifier substitution.
- Share assessment synchronization between assignments, exams, results and regrades so repeated syncs do not create duplicated authoritative marks. Validate configured assessment types and use the shared weighted-total calculation.
- Require timetable periods or an explicitly centrally governed periodless contract; no empty-string bypass of lifecycle checks.
- Integrate interventions through the existing performance tracker and central academic rules. Confirm actual implementation before extending it; the initial academic audit did not establish its workflow coverage.

### Operations and finance workflows
- Apply central library loan, renewal, fine and borrower policies server-side. Remove module-local fallback values and verify borrower/book ownership.
- Enforce configured messaging channels, audiences, direct-message availability and length limits in shared validation, with authorized conversation participation and same-school recipients.
- Apply publicity retention, banner limits and gallery visibility through Operations Configuration, with shared access checks for private management and published-only public reads.
- Keep invoice/payment/billing rules in Financial Configuration, scope referenced students and fees to the same school, and prevent repeated billing or partial writes from producing duplicate or inconsistent financial records.

## 4. Shared integration layer

- Build reusable tenant context, configuration readers, authorization evaluators and record-contract validators; modules call them rather than defining their own policies.
- Extend existing services wherever possible instead of introducing parallel abstractions. The module registry remains the single ownership/dependency catalogue.
- Use durable, tenant-scoped domain events for transactional cross-module changes that require downstream work. Do not use in-memory server events or create duplicate authoritative records.
- Keep audit records for configuration and privileged changes, with tenant scope and actor identity. Never log credentials or private record payloads unnecessarily.
- Paginate operational lists and index tenant/relationship filters; avoid unrestricted whole-school reads where a selected or paged contract is appropriate.

## 5. Regression and workflow verification

- Add tests for cross-school denial, absent/ambiguous membership, role-source integrity, feature availability, existing/new record authorization, canonical family relationships and child-record substitution.
- Add concurrency tests for same-domain stale saves and independent-domain saves, plus backward-compatible payloads and deleted-rule behavior.
- Exercise configured changes in library, messaging, publicity, assessment sync, calendar locks, billing idempotency and regrade propagation.
- Apply schema changes only through the Lovable migration tool, with explicit grants, RLS and verified migration status. Inspect live policies and run the database linter afterward.
- Run applicable unit/integration/regression suites and inspect the automatically generated build diagnostics; do not substitute compilation for workflow verification.
- Verify public rendering on desktop and the current mobile viewport. Authenticated real-user checks require a populated school/account and an available session; the connected external Supabase currently has neither school nor profile rows, and managed browser sessions may not be available. Report that limitation explicitly rather than claiming signed-in flows are verified.

## Technical implementation boundaries

- TanStack authenticated server functions remain the app-internal API. Keep generated authentication files intact; compose app-owned tenant/authorization middleware around the existing authentication mechanism.
- Use the migration tool as the single schema apply path. Do not edit generated database types or repository metadata.
- Record new shared service and contract rules in AGENTS.md. Keep an implementation roadmap and a verification report with commands, results, migration status and incomplete workflows.
- Work foundation-first, then independent academic and operations/finance changes, then integration verification. Do not enable isolated module fixes before their shared tenant and policy dependencies exist.

## Scope and acceptance

No new marketing pages, visual redesign, speculative school records or unrelated security-setting changes. Preserve existing behavior unless it violates the requested central governance or isolation guarantees. Completion requires evidence for each module and boundary above; otherwise report precisely which phase or workflow remains incomplete.