-- Payroll Details Schema

-- 1. Staff (Employees)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL, -- server, chef, manager, etc.
    pay_type TEXT NOT NULL, -- hourly, salary
    pay_rate DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payroll Line Items
CREATE TABLE payroll_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    hours_worked DECIMAL(6, 2) DEFAULT 0,
    gross_pay DECIMAL(12, 2) NOT NULL,
    net_pay DECIMAL(12, 2) NOT NULL,
    deductions JSONB DEFAULT '[]',
    overtime_hours DECIMAL(6, 2) DEFAULT 0,
    tips DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Exceptions (The "Review Queue")
CREATE TABLE ai_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- payroll_anomaly, invoice_mismatch, etc.
    severity TEXT NOT NULL, -- info, warning, critical
    entity_type TEXT NOT NULL, -- payroll_run, payroll_line_item, invoice
    entity_id UUID NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, resolved, ignored
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_access ON staff
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

CREATE POLICY payroll_line_items_access ON payroll_line_items
    FOR ALL TO public
    USING (payroll_run_id IN (SELECT id FROM payroll_runs WHERE restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id())) OR is_admin());

CREATE POLICY ai_exceptions_access ON ai_exceptions
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());
