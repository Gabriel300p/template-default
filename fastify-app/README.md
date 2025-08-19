# Barbershop Backend MVT

Minimal viable technical backend focusing on:

- Supabase Auth integration (JWT verification only)
- Users (domain profile extension of Supabase auth users)
- Barbershop ownership
- Staff onboarding (to be added)

## Scripts

- `pnpm dev:mvt` Start development server (MVT folder)
- `pnpm prisma:migrate` Apply / create migrations for MVT schema
- `pnpm prisma:generate` Generate Prisma client

## Development Flow

1. Install deps: `pnpm install`
2. Run migration: `pnpm prisma:migrate`
3. Start server: `pnpm dev:mvt`
4. Test health: GET /health

## Next Steps

- Implement /onboarding/barbershop route
- Implement /staff creation route
- Add RLS SQL scripts (ownership)
- Add test suite (Vitest)

---

Generated initial scaffold. Update as needed.
