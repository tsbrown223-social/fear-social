INSERT OR IGNORE INTO user_connections (user_id, target_user_id)
SELECT id, 'fear-social-official'
FROM users
WHERE id <> 'demo-user'
  AND id <> 'fear-social-official';
