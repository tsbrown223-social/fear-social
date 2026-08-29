CREATE TABLE IF NOT EXISTS career_paths (
  user_id TEXT PRIMARY KEY,
  field TEXT NOT NULL DEFAULT '',
  target_role TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'Exploring',
  weekly_time TEXT NOT NULL DEFAULT '2-4 hours',
  work_style TEXT NOT NULL DEFAULT 'Open',
  configured INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_career_paths_updated
  ON career_paths(updated_at DESC);
