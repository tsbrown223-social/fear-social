UPDATE users
SET bio = 'Figuring out what comes next.',
    updated_at = CURRENT_TIMESTAMP
WHERE TRIM(COALESCE(bio, '')) IN (
  'Building in public, meeting ambitious founders, and turning fear into useful momentum.',
  'Building in public, meeting ambitious people, and turning fear into useful momentum.',
  'Building in public, meeting ambitious people, and turning fear into momentum.'
);
