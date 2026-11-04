# Roadmap — Import schdata archive modules

- [x] Inspect archive modules for compliance with project rules (currency, CSV, print, config domains, branding, RLS/grants)
- [x] Copy missing lib/component/test files for the 12 new modules
- [x] Register new modules in the portal module registry
- [x] Build database: apply new tables via Lovable migration tool (GRANTs + RLS, no seed-on-load)
- [x] Run tests + typecheck, fix errors in parallel (198/198 tests, 0 type errors)
- [x] Verify build OK and portal renders new modules (landing page verified in browser)
