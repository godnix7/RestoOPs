-- RLS Policies Migration

-- Helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    SELECT current_setting('app.user_role', true) = 'super_admin';
$$ LANGUAGE sql STABLE;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION get_user_id() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- 1. Organizations Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_admin_all ON organizations
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY organizations_owner_read ON organizations
    FOR SELECT TO public
    USING (id = (SELECT organization_id FROM users WHERE id = get_user_id()));

-- 2. Restaurants Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY restaurants_admin_all ON restaurants
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY restaurants_user_access ON restaurants
    FOR SELECT TO public
    USING (id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()));

-- 3. Users Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_admin_all ON users
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY users_self_read ON users
    FOR SELECT TO public
    USING (id = get_user_id());

-- 4. Audit Log Policies
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_admin_read ON audit_log
    FOR SELECT TO public
    USING (is_admin());

CREATE POLICY audit_log_insert ON audit_log
    FOR INSERT TO public
    WITH CHECK (TRUE); -- App layer ensures user_id is set correctly

-- 5. Policies (Legal)
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY policies_read_all ON policies
    FOR SELECT TO public
    USING (is_published = TRUE OR is_admin());

CREATE POLICY policies_admin_all ON policies
    FOR ALL TO public
    USING (is_admin());
