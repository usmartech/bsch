# Roadmap — Import schdata archive modules

- [ ] Inspect archive modules for compliance with project rules (currency, CSV, print, config domains, branding, RLS/grants)
- [ ] Copy missing lib/component/test files for the 12 new modules
- [ ] Register new modules in the portal module registry
- [ ] Build database: apply new tables via Lovable migration tool (GRANTs + RLS, no seed-on-load)
- [ ] Run tests + typecheck, fix errors in parallel
- [ ] Verify build OK and portal renders new modules
