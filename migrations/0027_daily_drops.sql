UPDATE posts
SET type = 'Daily Drop',
    content = REPLACE(REPLACE(content, 'Daily fear.social Reel:', 'Daily fear.social Drop:'), 'Reel beats:', 'Daily beats:'),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 'fear-social-official'
  AND type = 'Reel';

UPDATE users
SET headline = 'Official fear.social Daily Drops and platform notes.',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'fear-social-official';
