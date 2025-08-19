# Feature: Staff Management (Add Barber)

## Goal

Owner creates staff (BARBER) user with initial password (supplied or generated) and links to barbershop.

## Endpoint

POST /staff

## Request Body

{
"barbershopId": "string",
"user": {
"email": "string",
"password": "string?", // optional
"firstName": "string?",
"lastName": "string?"
},
"status": "ACTIVE|INACTIVE|SUSPENDED|TERMINATED?"
}

## Response (201)

{
"staff": {"id": "...", "userId": "...", "roleInShop": "BARBER", "status": "ACTIVE"},
"generatedPassword": "string?" // only if auto-generated
}

## Authorization

- Requesting user must own the specified barbershop OR be SUPER_ADMIN.

## Validation

- barbershopId exists and owned by caller.
- Email unused in users.

## Logic Steps

1. Check ownership (select barbershop.ownerUserId = requester.id OR requester.role=SUPER_ADMIN).
2. Create Supabase auth user (password provided or generated).
3. Insert domain User (role=BARBER) if not exists.
4. Insert BarbershopStaff row.
5. Set mustResetPassword=true when password generated.

## Edge Cases

- Duplicate staff for same barbershop → 409.
- User exists but already staff of barbershop → 409.
- Supabase failure after domain insert → rollback domain row if possible.

## Future

- Email invite template (PHASE 2).
- Staff role expansion (MANAGER).
