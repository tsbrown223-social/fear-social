ALTER TABLE users ADD COLUMN verified_badge INTEGER NOT NULL DEFAULT 0;

UPDATE users
SET verified_badge = 1
WHERE lower(email) = 'tsbrown223@gmail.com'
   OR lower(handle) = '@taylorbrown'
   OR lower(name) = 'taylor brown';
