UPDATE users
SET email = (
  SELECT lower(trim(r.email))
  FROM registration_emails r
  WHERE r.user_id = users.id
    AND trim(COALESCE(r.email, '')) <> ''
    AND instr(r.email, '@') > 1
  ORDER BY datetime(r.created_at) DESC
  LIMIT 1
)
WHERE id <> 'demo-user'
  AND trim(COALESCE(email, '')) = ''
  AND EXISTS (
    SELECT 1
    FROM registration_emails r
    WHERE r.user_id = users.id
      AND trim(COALESCE(r.email, '')) <> ''
      AND instr(r.email, '@') > 1
  )
  AND NOT EXISTS (
    SELECT 1
    FROM users owner
    WHERE owner.id <> users.id
      AND lower(owner.email) = (
        SELECT lower(trim(r2.email))
        FROM registration_emails r2
        WHERE r2.user_id = users.id
          AND trim(COALESCE(r2.email, '')) <> ''
          AND instr(r2.email, '@') > 1
        ORDER BY datetime(r2.created_at) DESC
        LIMIT 1
      )
  );
