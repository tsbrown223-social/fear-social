import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workerPath = new URL("../functions/api/[[path]].js", import.meta.url);
const migrationPath = new URL("../migrations/0031_retire_legacy_session_tokens.sql", import.meta.url);
const [worker, migration] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(migrationPath, "utf8"),
]);

assert.doesNotMatch(
  worker,
  /SELECT\s+\*\s+FROM\s+users[\s\S]{0,120}\btoken\s*=\s*\?/i,
  "Authentication must not accept the legacy plaintext users.token value."
);
assert.match(
  worker,
  /FROM user_sessions s[\s\S]{0,300}s\.revoked_at IS NULL[\s\S]{0,200}datetime\(s\.expires_at\) > datetime\('now'\)/,
  "Authentication must require an unexpired, non-revoked session."
);
assert.doesNotMatch(
  worker,
  /password hashing failed,\s+falling back|return `sha256:\$\{salt\}/i,
  "Password hashing must never fall back to fast SHA-256."
);
assert.match(
  worker,
  /throw new Error\("SECURE_PASSWORD_HASHING_UNAVAILABLE"\)/,
  "PBKDF2 failure must stop password processing."
);
assert.doesNotMatch(
  worker,
  /UPDATE users SET token = \?/,
  "Session creation must not persist plaintext tokens on users."
);
assert.match(
  migration,
  /UPDATE users\s+SET token = 'retired:' \|\| id;/i,
  "Existing plaintext legacy tokens must be retired."
);

console.log("Security regression checks passed.");
