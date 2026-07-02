ALTER TABLE posts ADD COLUMN updated_at TEXT;

UPDATE posts SET updated_at = created_at WHERE updated_at IS NULL;
