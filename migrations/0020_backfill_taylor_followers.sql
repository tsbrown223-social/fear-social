INSERT OR IGNORE INTO user_connections (user_id, target_user_id)
SELECT users.id, 'user_5c1278eb-8894-4f13-9dfa-9847f26ac0dc'
FROM users
WHERE users.id <> 'demo-user'
  AND users.id <> 'user_5c1278eb-8894-4f13-9dfa-9847f26ac0dc'
  AND EXISTS (
    SELECT 1
    FROM users taylor
    WHERE taylor.id = 'user_5c1278eb-8894-4f13-9dfa-9847f26ac0dc'
      AND lower(taylor.email) = 'tsbrown223@gmail.com'
  );
