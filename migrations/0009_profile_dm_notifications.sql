ALTER TABLE users ADD COLUMN headline TEXT;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN looking_for TEXT;
ALTER TABLE users ADD COLUMN goal TEXT;
ALTER TABLE users ADD COLUMN cover_url TEXT;

ALTER TABLE conversations ADD COLUMN user_a_id TEXT;
ALTER TABLE conversations ADD COLUMN user_b_id TEXT;
ALTER TABLE conversations ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

UPDATE users SET industry = 'Exploring' WHERE id = 'demo-user' AND industry = 'Tech';
