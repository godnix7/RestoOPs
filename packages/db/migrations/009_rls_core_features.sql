-- RLS policies for core feature tables

-- 1. Transactions Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_admin_all ON transactions
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY transactions_tenant_access ON transactions
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()));

-- 2. Payroll Runs Policies
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY payroll_runs_admin_all ON payroll_runs
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY payroll_runs_tenant_access ON payroll_runs
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()));

-- 3. AI Insights Policies
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_insights_admin_all ON ai_insights
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY ai_insights_tenant_access ON ai_insights
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()));

-- 4. Staff Policies
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_admin_all ON staff
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY staff_tenant_access ON staff
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()));

-- 5. AI Exceptions Policies
ALTER TABLE ai_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_exceptions_admin_all ON ai_exceptions
    FOR ALL TO public
    USING (is_admin());

CREATE POLICY ai_exceptions_tenant_access ON ai_exceptions
    FOR SELECT TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()));
