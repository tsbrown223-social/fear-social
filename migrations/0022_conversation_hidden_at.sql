ALTER TABLE conversations ADD COLUMN user_a_hidden_at TEXT;
ALTER TABLE conversations ADD COLUMN user_b_hidden_at TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_hidden_a ON conversations(user_a_id, user_a_hidden_at);
CREATE INDEX IF NOT EXISTS idx_conversations_hidden_b ON conversations(user_b_id, user_b_hidden_at);
