CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Opportunity',
  tag TEXT NOT NULL DEFAULT 'Exploring',
  budget TEXT NOT NULL DEFAULT 'Open',
  location TEXT NOT NULL DEFAULT 'Remote',
  level TEXT NOT NULL DEFAULT 'First step',
  skills TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_opportunities_status_created ON opportunities(status, created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_user ON opportunities(user_id);
