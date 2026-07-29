CREATE TABLE IF NOT EXISTS user_oauth_identities (
  provider TEXT NOT NULL,
  subject TEXT NOT NULL,
  user_id TEXT NOT NULL,
  email_at_link TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider, subject),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_oauth_identities_user
  ON user_oauth_identities(user_id);

INSERT OR IGNORE INTO user_oauth_identities (provider, subject, user_id, email_at_link)
SELECT lower(oauth_provider), oauth_subject, id, lower(email)
FROM users
WHERE oauth_provider IS NOT NULL
  AND trim(oauth_provider) <> ''
  AND oauth_subject IS NOT NULL
  AND trim(oauth_subject) <> '';

ALTER TABLE oauth_states ADD COLUMN intent TEXT NOT NULL DEFAULT 'login';
ALTER TABLE oauth_states ADD COLUMN accepted_terms INTEGER NOT NULL DEFAULT 0;
