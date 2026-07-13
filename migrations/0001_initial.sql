CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  email TEXT,
  location TEXT,
  industry TEXT,
  stage TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Update',
  tag TEXT NOT NULL DEFAULT 'Tech',
  stage TEXT NOT NULL DEFAULT 'Building',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS post_reactions (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('like', 'save')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id, kind),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  av TEXT NOT NULL,
  stage TEXT NOT NULL,
  industry TEXT NOT NULL,
  mutual INTEGER NOT NULL DEFAULT 0,
  loc TEXT NOT NULL,
  bio TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  online INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS connections (
  user_id TEXT NOT NULL,
  person_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, person_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS user_connections (
  user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  host TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  tag TEXT NOT NULL,
  spots INTEGER NOT NULL,
  attending INTEGER NOT NULL DEFAULT 0,
  desc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS mentors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  av TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  tags TEXT NOT NULL,
  bio TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mentor_requests (
  user_id TEXT NOT NULL,
  mentor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, mentor_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  av TEXT NOT NULL,
  online INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  user_id TEXT,
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'them',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT
);

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

CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notification_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  verified_at TEXT
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  client_key TEXT NOT NULL,
  bucket TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_blocks (
  user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, blocked_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (blocked_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  actor_user_id TEXT,
  type TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_registration_emails_email ON registration_emails(email);
CREATE INDEX IF NOT EXISTS idx_registration_emails_created_at ON registration_emails(created_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_status ON email_verifications(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON api_rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, read_at, created_at);
CREATE INDEX IF NOT EXISTS idx_media_assets_user ON media_assets(user_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle_unique ON users(handle);
