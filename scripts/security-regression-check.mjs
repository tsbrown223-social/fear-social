import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workerPath = new URL("../functions/api/[[path]].js", import.meta.url);
const migrationPath = new URL("../migrations/0031_retire_legacy_session_tokens.sql", import.meta.url);
const aiMigrationPath = new URL("../migrations/0033_fear_ai.sql", import.meta.url);
const appPath = new URL("../src/App.jsx", import.meta.url);
const [worker, migration, aiMigration, app] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(migrationPath, "utf8"),
  readFile(aiMigrationPath, "utf8"),
  readFile(appPath, "utf8"),
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
assert.match(
  worker,
  /getAiConversation\(db,\s*user\.id,\s*conversationId\)/,
  "AI conversations must be loaded through an authenticated ownership check."
);
assert.match(
  worker,
  /enforceRateLimit\(db,\s*request,\s*`fear-ai-chat:\$\{user\.id\}`/,
  "AI generation must be rate limited per authenticated user."
);
assert.match(
  worker,
  /await env\.AI\.run\(/,
  "AI inference must run on the server through the Cloudflare binding."
);
assert.match(
  aiMigration,
  /CREATE TABLE IF NOT EXISTS ai_conversations[\s\S]*user_id TEXT NOT NULL/,
  "AI conversation history must be scoped to a user."
);
assert.match(
  aiMigration,
  /FOREIGN KEY \(conversation_id\) REFERENCES ai_conversations\(id\) ON DELETE CASCADE/,
  "Deleting a conversation must remove its messages."
);
assert.doesNotMatch(
  app,
  /(OPENAI_API_KEY|CLOUDFLARE_API_TOKEN|authorization:\s*["'`]Bearer)/i,
  "The browser bundle must not contain model-provider credentials."
);

console.log("Security regression checks passed.");
