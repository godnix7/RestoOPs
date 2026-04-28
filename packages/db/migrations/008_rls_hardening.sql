-- Hardening RLS for all tenant tables
-- 6. Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_access ON transactions
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

-- 7. Payroll Runs
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY payroll_runs_access ON payroll_runs
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

-- 8. AI Insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_insights_access ON ai_insights
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

-- 9. Staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_access ON staff
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

-- 10. AI Exceptions
ALTER TABLE ai_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_exceptions_access ON ai_exceptions
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());
