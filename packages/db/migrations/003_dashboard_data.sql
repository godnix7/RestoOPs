-- Dashboard Data Schema

-- 1. Transactions (Accounting)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- plaid, manual, square, etc.
    source_reference TEXT, -- external ID
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL, -- revenue, expense
    category TEXT,
    subcategory TEXT,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_confidence DECIMAL(3, 2), -- 0.00 to 1.00
    is_reconciled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_transactions_dedupe ON transactions (source, source_reference) WHERE source_reference IS NOT NULL;

-- 2. Payroll Runs
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, pending, approved, processing, completed, rejected
    total_gross DECIMAL(12, 2) DEFAULT 0,
    total_net DECIMAL(12, 2) DEFAULT 0,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- variance, alert, recommendation
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    severity TEXT DEFAULT 'info', -- info, warning, critical
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_access ON transactions
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

CREATE POLICY payroll_runs_access ON payroll_runs
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());

CREATE POLICY ai_insights_access ON ai_insights
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());
