-- Draft RLS policies for new schema
-- Assumes PostgreSQL with Supabase; enable RLS on tables then apply policies.

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershop_staff ENABLE ROW LEVEL SECURITY;

-- Users: a user can select/update itself. Super admin can do anything.
CREATE POLICY users_self ON users FOR SELECT USING (id = auth.uid() OR EXISTS (SELECT 1 FROM users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));
CREATE POLICY users_self_update ON users FOR UPDATE USING (id = auth.uid() OR EXISTS (SELECT 1 FROM users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

-- Barbershops: owner can select/update its shops; staff can select. Super admin full.
CREATE POLICY barbershop_owner_select ON barbershops FOR SELECT USING (owner_user_id = auth.uid() OR EXISTS (SELECT 1 FROM barbershop_staff bs WHERE bs.barbershop_id = barbershops.id AND bs.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));
CREATE POLICY barbershop_owner_update ON barbershops FOR UPDATE USING (owner_user_id = auth.uid() OR EXISTS (SELECT 1 FROM users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

-- Barbershop staff: row visible if user is the staff member, the owner of the shop, or super admin.
CREATE POLICY staff_visibility ON barbershop_staff FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM barbershops b WHERE b.id = barbershop_staff.barbershop_id AND b.owner_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

-- Future: Insert/update/delete policies to be refined with invitation flow.
