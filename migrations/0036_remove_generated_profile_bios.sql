UPDATE users
SET bio = '',
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(TRIM(COALESCE(bio, ''))) IN (
  'signed in with google.',
  'signed in with google',
  'signed in with apple.',
  'signed in with apple',
  'signed in with oauth.',
  'signed in with oauth',
  'figuring out what comes next.',
  'figuring out what comes next'
);
