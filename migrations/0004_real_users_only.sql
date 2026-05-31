CREATE TABLE IF NOT EXISTS user_connections (
  user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

DELETE FROM messages WHERE id LIKE 'seed-msg-%' OR user_id IS NULL;
DELETE FROM conversations;
DELETE FROM comments WHERE user_id = 'demo-user' OR post_id IN (SELECT id FROM posts WHERE user_id = 'demo-user');
DELETE FROM post_reactions WHERE user_id = 'demo-user' OR post_id IN (SELECT id FROM posts WHERE user_id = 'demo-user');
DELETE FROM posts WHERE user_id = 'demo-user';
DELETE FROM connections;
DELETE FROM people;
DELETE FROM event_rsvps;
DELETE FROM events;
DELETE FROM mentor_requests;
DELETE FROM mentors;
DELETE FROM users
WHERE id <> 'demo-user'
  AND email IS NOT NULL
  AND email <> ''
  AND id NOT IN (
    SELECT id
    FROM users keep
    WHERE keep.id <> 'demo-user'
      AND keep.email IS NOT NULL
      AND keep.email <> ''
      AND datetime(keep.created_at) = (
        SELECT MAX(datetime(candidate.created_at))
        FROM users candidate
        WHERE candidate.id <> 'demo-user'
          AND lower(candidate.email) = lower(keep.email)
      )
  );
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL AND email <> '';
