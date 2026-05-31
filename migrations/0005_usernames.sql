ALTER TABLE waitlist ADD COLUMN username TEXT;

UPDATE waitlist
SET username = lower(replace(replace(substr(email, 1, instr(email, '@') - 1), '.', '_'), '-', '_'))
WHERE username IS NULL OR username = '';

UPDATE registration_emails
SET handle = '@' || lower(replace(replace(substr(email, 1, instr(email, '@') - 1), '.', '_'), '-', '_'))
WHERE (handle IS NULL OR handle = '') AND email IS NOT NULL AND email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_username_unique ON waitlist(username) WHERE username IS NOT NULL AND username <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle_unique ON users(handle) WHERE id <> 'demo-user';
