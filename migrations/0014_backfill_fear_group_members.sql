INSERT OR IGNORE INTO group_members (group_id, user_id, role, status)
SELECT
  'fear-official',
  id,
  CASE
    WHEN lower(COALESCE(email, '')) IN ('tsbrown223@gmail.com', 'contact@fear.social')
      OR lower(COALESCE(role, '')) = 'admin'
    THEN 'admin'
    ELSE 'member'
  END,
  'active'
FROM users
WHERE id <> 'demo-user';

UPDATE group_members
SET role = 'admin', status = 'active'
WHERE group_id = 'fear-official'
  AND user_id IN (
    SELECT id
    FROM users
    WHERE lower(COALESCE(email, '')) IN ('tsbrown223@gmail.com', 'contact@fear.social')
       OR lower(COALESCE(role, '')) = 'admin'
  );
