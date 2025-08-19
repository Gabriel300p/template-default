# Feature: Onboarding (Create Barbershop + Owner User)

## Goal

Create a barbershop and its owner (SUPER_ADMIN may also provision). Returns JWT-authenticated context on next request.

## Endpoint

POST /onboarding/barbershop

## Request Body (JSON)

{
"owner": {
"email": "string (email)",
"password": "string | optional (if omitted, system generates)",
"firstName": "string?",
"lastName": "string?"
},
"barbershop": {
"name": "string",
"description": "string?",
"phone": "string?",
"website": "string?"
}
}

## Response (201)

{
"barbershop": {"id": "...", "name": "..."},
"owner": {"id": "...", "email": "...", "role": "BARBERSHOP_OWNER"},
"generatedPassword": "string?" // only if system generated
}

## Validation Rules

- Email must not already exist in users table.
- If password provided: meets min complexity (>=8, 1 upper, 1 lower, 1 digit, 1 symbol)
- Name required.

## Business Logic

1. (Service role) Create Supabase auth user (email + password) or generated password.
2. Upsert domain User row with role=BARBERSHOP_OWNER.
3. Create Barbershop row linking owner.
4. Mark mustResetPassword=true if generated or if explicitly flagged.

## Edge Cases

- Email already present → 409.
- Supabase create race (email reused) → translate to 409.
- Partial failure after auth user created but before DB commit → attempt cleanup (best effort) or log for manual reconciliation.

## Future

- Audit log entry (PHASE 2).
- Optional email verification enforcement.
