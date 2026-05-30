CREATE TABLE IF NOT EXISTS registration_emails (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  user_id TEXT,
  name TEXT,
  handle TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registration_emails_email ON registration_emails(email);
CREATE INDEX IF NOT EXISTS idx_registration_emails_created_at ON registration_emails(created_at);

INSERT INTO registration_emails (id, email, source, user_id, name, handle, metadata, created_at)
SELECT 'backfill_waitlist_' || lower(hex(randomblob(16))), email, 'early_access_backfill', '', '', '', '{}', created_at
FROM waitlist
WHERE email IS NOT NULL AND email <> ''
  AND NOT EXISTS (
    SELECT 1 FROM registration_emails re
    WHERE re.email = waitlist.email AND re.source = 'early_access_backfill'
  );

INSERT INTO registration_emails (id, email, source, user_id, name, handle, metadata, created_at)
SELECT 'backfill_account_' || lower(hex(randomblob(16))), email, 'account_backfill', id, name, handle, '{}', created_at
FROM users
WHERE id <> 'demo-user' AND email IS NOT NULL AND email <> ''
  AND NOT EXISTS (
    SELECT 1 FROM registration_emails re
    WHERE re.email = users.email AND re.source = 'account_backfill'
  );
