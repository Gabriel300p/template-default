# Backend Roadmap & Execution Playbook

This document drives implementation. Each phase produces:

1. Code changes (feature slice)
2. Migration(s) if needed
3. A short completion report doc: `docs/reports/<phase-or-feature>-REPORT.md`
4. Roadmap update (checkboxes + any scope adjustments)
5. Approval checkpoint before moving to next phase

---

## Phase 0 (Bootstrap) – COMPLETE

- [x] Fastify + TS + Prisma scaffold
- [x] Supabase JWT verification plugin (basic upsert)
- [x] Minimal domain schema (User, Barbershop, BarbershopStaff)
- [x] Path aliases
- [x] Feature folder structure (`src/features/*`)
- [x] Onboarding docs skeleton
- [x] Removed transitional `/mvt` usage

Exit Criteria Met: Server boots, health endpoint works, schema migrated, basic auth decoration works.

---

## Phase 1 (Core Auth & Ownership) – ✅ COMPLETE

Objective: Enable creation and introspection of ownership + staff identities with secure password flow.

Scope Checklist:

- [x] Onboarding route POST /onboarding/barbershop
- [x] Password generation utility
- [x] Staff route POST /staff (creation only)
- [x] GET /me expanded (owned shops + staff memberships)
- [x] Global error handler + AppError taxonomy
- [x] Zod validation centralization (`src/shared/validation`)
- [x] mustResetPassword enforcement strategy (423 middleware) implemented
- [x] SUPER_ADMIN seed script integration
- [x] Feature report: Phase1-REPORT.md

Exit Criteria Met: ✅ All endpoints functional + compilation green + comprehensive error handling + report completed.

---

## Phase 2 (Security & RLS Foundation)

Objective: Establish minimal RLS parity with app logic.

Scope:

- [ ] RLS policy draft refined & applied (SELECT + INSERT/UPDATE basics)
- [ ] Logging enrichment (requestId, userId)
- [ ] Email abstraction (no-op + interface)
- [ ] Add change password / reset endpoints skeleton (optional)
- [ ] Report: Phase2-REPORT.md

Exit Criteria: Policies enabled without breaking Phase 1 tests.

---

## Phase 3 (Operational Hardening)

Objective: Improve reliability, observability, and test coverage.

Scope:

- [ ] Automated tests (unit & integration for onboarding, staff, me)
- [ ] Metrics endpoint (/metrics) stub (Prometheus style placeholder)
- [ ] Rate limit policy & plugin (configurable bursts per role)
- [ ] Basic audit log (DB table or event emitter stub)
- [ ] Report: Phase3-REPORT.md

---

## Phase 4 (Extensibility)

Objective: Add domain expansion primitives.

Scope:

- [ ] Barbershop Units model + endpoints
- [ ] Services catalog (service definitions) skeleton
- [ ] Scheduling primitives (Appointment model + minimal create/list)
- [ ] Role system future-proofing (enum → table migration assessment)
- [ ] Report: Phase4-REPORT.md

---

## Phase 5 (Advanced Security & Performance)

Objective: Harden security and scale performance.

Scope:

- [ ] Fine-grained RLS per entity & staff role variants
- [ ] Permission matrix (resource/action) if justified
- [ ] Redis caching for user + barbershop context
- [ ] Optional analytics / token/session instrumentation
- [ ] Report: Phase5-REPORT.md

---

## Documentation Workflow

Files:

- Feature specs: `docs/FEATURE_<NAME>.md`
- Reports: `docs/reports/*-REPORT.md`
- Roadmap updates inline here with checkboxes

Each feature PR / commit updates its spec (if changed) and adds a short section to the corresponding phase report draft.

---

## Engineering Conventions

- Validation via Zod; parse early at route boundary.
- Errors use AppError subclass taxonomy; map to consistent JSON shape `{ error, message?, details? }`.
- Password generation: 12 chars, complexity guaranteed.
- Middleware order: prisma → auth → error handler (set at root) → feature routes.
- Transactions wrap multi-entity writes (onboarding, staff creation).
- RLS: Keep policies minimal; enforce ownership semantics first.

---

## Open Questions / Future Decisions

- When to introduce email provider & templates.
- Whether to enforce password reset via 423 or blocked login (currently leaning middleware returning 423 for protected routes until reset completes).
- Strategy for role expansion (MANAGER, RECEPTION) timing.

---

Living document – update at each iteration.
