import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workerPath = new URL("../functions/api/[[path]].js", import.meta.url);
const migrationPath = new URL("../migrations/0031_retire_legacy_session_tokens.sql", import.meta.url);
const aiMigrationPath = new URL("../migrations/0033_fear_ai.sql", import.meta.url);
const aiControlsMigrationPath = new URL("../migrations/0034_ai_generation_controls.sql", import.meta.url);
const aiBudgetMigrationPath = new URL("../migrations/0035_ai_free_tier_guard.sql", import.meta.url);
const appPath = new URL("../src/App.jsx", import.meta.url);
const [worker, migration, aiMigration, aiControlsMigration, aiBudgetMigration, app] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(migrationPath, "utf8"),
  readFile(aiMigrationPath, "utf8"),
  readFile(aiControlsMigrationPath, "utf8"),
  readFile(aiBudgetMigrationPath, "utf8"),
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
  /FEAR_AI_DAILY_NEURON_BUDGET\s*=\s*Math\.floor\(FEAR_AI_FREE_DAILY_NEURONS \* 0\.8\)/,
  "The application AI budget must remain below the 10,000-neuron free daily allocation."
);
assert.match(
  worker,
  /reserved_neurons \+ \? <= \?/,
  "AI budget reservations must use an atomic conditional update."
);
assert.match(
  worker,
  /AI_FREE_DAILY_LIMIT/,
  "AI generation must fail closed when the shared daily budget is exhausted."
);
assert.match(
  worker,
  /`fear-ai-chat:\$\{user\.id\}`,\s*12,\s*86400/,
  "Each user must have a daily AI generation ceiling."
);
assert.match(
  aiBudgetMigration,
  /CREATE TABLE IF NOT EXISTS ai_daily_budget[\s\S]*usage_date TEXT PRIMARY KEY[\s\S]*reserved_neurons INTEGER NOT NULL/,
  "The account-wide AI free-tier budget must be persisted in D1."
);
assert.match(
  worker,
  /await env\.AI\.run\(/,
  "AI inference must run on the server through the Cloudflare binding."
);
assert.match(
  worker,
  /env\.AI\.run\(model,\s*\{\s*\.\.\.modelInput,\s*stream:\s*true\s*\}\)/,
  "AI responses must stream from the server binding rather than expose a provider credential to the browser."
);
assert.match(
  worker,
  /UPDATE ai_conversations SET title = \?, updated_at = \? WHERE id = \? AND user_id = \?/,
  "Conversation renames must remain scoped to the authenticated owner."
);
assert.match(
  worker,
  /JOIN ai_conversations c ON c\.id = m\.conversation_id[\s\S]{0,180}c\.user_id = \?[\s\S]{0,180}m\.role = 'user'/,
  "AI message edits and retries must verify conversation ownership and message role."
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
assert.match(
  worker,
  /UPDATE ai_generations SET status = 'stopped'[^;]+WHERE id = \? AND user_id = \? AND status = 'running'/,
  "Stopping an AI generation must remain scoped to the authenticated owner."
);
assert.match(
  aiControlsMigration,
  /CREATE TABLE IF NOT EXISTS ai_generations[\s\S]*user_id TEXT NOT NULL[\s\S]*conversation_id TEXT NOT NULL/,
  "AI generation controls must be scoped to both a user and conversation."
);
assert.match(
  app,
  /\/ai\/generations\/\$\{encodeURIComponent\(generationId\)\}\/stop/,
  "The Stop control must signal the authenticated server before aborting the browser stream."
);
assert.doesNotMatch(
  app,
  /(OPENAI_API_KEY|CLOUDFLARE_API_TOKEN|authorization:\s*["'`]Bearer)/i,
  "The browser bundle must not contain model-provider credentials."
);
assert.match(
  app,
  /accept:"application\/x-ndjson"/,
  "The browser must consume the authenticated first-party AI stream."
);

console.log("Security regression checks passed.");
