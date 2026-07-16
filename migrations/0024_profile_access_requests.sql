CREATE TABLE IF NOT EXISTS profile_access_requests (
  id TEXT PRIMARY KEY,
  requester_user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (requester_user_id, target_user_id),
  FOREIGN KEY (requester_user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_profile_access_requests_target_status ON profile_access_requests(target_user_id, status);
