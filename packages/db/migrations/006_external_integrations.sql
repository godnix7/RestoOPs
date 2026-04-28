-- External Integrations Schema

CREATE TABLE external_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- plaid, square, quickbooks
    external_id TEXT NOT NULL, -- item_id for plaid, etc.
    access_token TEXT NOT NULL, -- SECURE AT REST IN PROD
    refresh_token TEXT,
    settings JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active', -- active, error, disconnected
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique per restaurant per provider
CREATE UNIQUE INDEX idx_integrations_unique ON external_integrations (restaurant_id, provider);

-- RLS
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY external_integrations_access ON external_integrations
    FOR ALL TO public
    USING (restaurant_id IN (SELECT restaurant_id FROM user_restaurants WHERE user_id = get_user_id()) OR is_admin());
