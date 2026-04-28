-- AI Conversations Schema

-- 1. Conversations
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    context_summary TEXT, -- LLM-generated summary of the conversation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- user, assistant, system, tool
    content TEXT NOT NULL,
    tool_calls JSONB, -- If assistant called tools
    tool_outputs JSONB, -- If role is tool
    metadata JSONB, -- UI hints, emotional tone, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for AI tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_conversations_access ON ai_conversations
    FOR ALL TO public
    USING (user_id = get_user_id() OR is_admin());

CREATE POLICY ai_messages_access ON ai_messages
    FOR ALL TO public
    USING (conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = get_user_id()) OR is_admin());
