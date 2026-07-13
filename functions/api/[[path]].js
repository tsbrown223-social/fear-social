const SECURITY_RESPONSE_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "cross-origin-resource-policy": "same-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...SECURITY_RESPONSE_HEADERS,
      ...(init.headers || {}),
    },
  });

const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
const MAX_FORM_BODY_BYTES = 64 * 1024;
const MAX_MEDIA_URL_BYTES = 900000;
const MAX_TOTAL_MEDIA_URL_BYTES = 1800000;

const assertBodySize = (request, maxBytes) => {
  const length = Number(request.headers.get("content-length") || 0);
  if (length && length > maxBytes) {
    throw json({ error: "Request body is too large" }, { status: 413 });
  }
};

const readJson = async (request) => {
  try {
    assertBodySize(request, MAX_JSON_BODY_BYTES);
    const text = await request.text();
    if (text.length > MAX_JSON_BODY_BYTES) {
      throw json({ error: "Request body is too large" }, { status: 413 });
    }
    return text ? JSON.parse(text) : {};
  } catch (err) {
    if (err instanceof Response) throw err;
    return {};
  }
};

const readForm = async (request) => {
  try {
    assertBodySize(request, MAX_FORM_BODY_BYTES);
    const text = await request.text();
    if (text.length > MAX_FORM_BODY_BYTES) {
      throw json({ error: "Request body is too large" }, { status: 413 });
    }
    return Object.fromEntries(new URLSearchParams(text));
  } catch (err) {
    if (err instanceof Response) throw err;
    return {};
  }
};

const createId = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const CONTACT_EMAIL = "contact@fear.social";
const DEFAULT_EMAIL_FROM = `fear.social <${CONTACT_EMAIL}>`;
const NOTIFICATION_EMAIL = CONTACT_EMAIL;
const SESSION_TTL_DAYS = 30;
const TERMS_VERSION = "2026-07-13-safety";
const FEAR_GROUP_ID = "fear-official";
const OFFICIAL_USER_ID = "fear-social-official";
const OFFICIAL_AVATAR_URL = "https://fear.social/fear-official-avatar.png";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const VERIFIED_HANDLES = new Set(["@taylorbrown", "@fear.social"]);
const VERIFIED_EMAILS = new Set(["tsbrown223@gmail.com", "official@fear.social"]);
const VERIFIED_NAMES = new Set(["taylor brown", "fear.social"]);
const OBJECTIONABLE_PATTERNS = [
  { label: "hate or slur", pattern: /\b(nigger|faggot|kike|chink|spic|wetback|tranny|retard)\b/i },
  { label: "violent threat", pattern: /\b(kill yourself|kys|i will kill|i'm going to kill|shoot up|bomb threat)\b/i },
  { label: "explicit sexual content", pattern: /\b(porn|onlyfans|nude|nudes|blowjob|handjob|cumshot|deepthroat|hardcore sex)\b/i },
  { label: "sexual exploitation", pattern: /\b(child porn|cp\b|underage sex|minor sex)\b/i },
  { label: "harassment", pattern: /\b(doxx|dox|swat you|leak your address)\b/i },
];
const moderationIssue = (value = "") => {
  const text = String(value || "");
  const hit = OBJECTIONABLE_PATTERNS.find((entry) => entry.pattern.test(text));
  return hit?.label || "";
};
async function queueModerationReview(db, userId, targetType, targetId, reason) {
  await safeRun(
    db,
    "INSERT INTO content_reports (id, reporter_user_id, target_type, target_id, reason, status) VALUES (?, ?, ?, ?, ?, 'open')",
    [createId("report"), userId || OFFICIAL_USER_ID, targetType, targetId, reason]
  );
}
async function rejectObjectionableContent(db, userId, targetType, text) {
  const issue = moderationIssue(text);
  if (!issue) return null;
  await queueModerationReview(db, userId, targetType, createId("auto_review"), `Automated content filter flagged ${issue}. Review within 24 hours.`);
  return json({ error: "This content was flagged by the safety filter and was not published. Edit it or contact contact@fear.social if you think this was a mistake." }, { status: 422 });
}

const isValidEmail = (value) => EMAIL_PATTERN.test(String(value || "").trim()) && String(value || "").length <= 120;
const isSafeHttpUrl = (value, { allowHttp = false, max = 500 } = {}) => {
  const url = String(value || "").trim();
  if (!url || url.length > max) return false;
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return false;
    if (parsed.protocol === "https:") return true;
    return allowHttp && parsed.protocol === "http:";
  } catch {
    return false;
  }
};
const isSafeDataMediaUrl = (value, kind = "image") => {
  const url = String(value || "").trim();
  if (!url || url.length > MAX_MEDIA_URL_BYTES) return false;
  if (kind === "video") return /^data:video\/(mp4|webm|quicktime);base64,[a-z0-9+/=\s]+$/i.test(url);
  return /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(url);
};

const cleanText = (value, max = 120) =>
  String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

const isVerifiedAccount = (user = {}) =>
  Boolean(user.verified || user.verified_badge) ||
  VERIFIED_HANDLES.has(String(user.handle || "").toLowerCase()) ||
  VERIFIED_EMAILS.has(String(user.email || "").toLowerCase()) ||
  VERIFIED_NAMES.has(String(user.name || "").trim().toLowerCase());

const createVerificationCode = () => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
};

const sha256 = async (value) => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const textEncoder = new TextEncoder();
const base64UrlEncode = (value) => {
  const bytes = typeof value === "string" ? textEncoder.encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const base64UrlDecode = (value = "") => {
  const base64 = String(value).replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const decodeJwtPayload = (token = "") => {
  const [, payload] = String(token).split(".");
  if (!payload) return null;
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  } catch {
    return null;
  }
};

const randomHex = (bytes = 16) => {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return [...values].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const fromHex = (hex) => {
  const clean = String(hex || "").replace(/[^a-f0-9]/gi, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
};

const toHex = (bytes) => [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

async function hashPassword(password) {
  const salt = randomHex(16);
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: fromHex(salt), iterations: 210000 },
      key,
      256
    );
    return `pbkdf2-sha256:210000:${salt}:${toHex(bits)}`;
  } catch (err) {
    console.warn("pbkdf2 password hashing failed, falling back to sha256", err);
    return `sha256:${salt}:${await sha256(`${salt}:${password}`)}`;
  }
}

async function verifyPassword(password, stored = "") {
  const parts = String(stored || "").split(":");
  if (parts[0] === "pbkdf2-sha256") {
    const [, iterations, salt, digest] = parts;
    if (!salt || !digest || !Number(iterations)) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: fromHex(salt), iterations: Number(iterations) },
      key,
      256
    );
    return timingSafeEqualHex(toHex(bits), digest);
  }
  const [scheme, salt, digest] = parts;
  if (scheme === "sha256" && salt && digest) return timingSafeEqualHex(await sha256(`${salt}:${password}`), digest);
  return false;
}

const timingSafeEqualHex = (a = "", b = "") => {
  const left = fromHex(a);
  const right = fromHex(b);
  if (!left.length || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
};

const addDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

const getCookie = (request, name) => {
  const cookie = request.headers.get("cookie") || "";
  const pair = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
};

const getAuthToken = (request, body = {}) =>
  request.headers.get("x-fear-token") || getCookie(request, "fear-session-token") || body.token || "";

const sessionCookie = (token, maxAge = SESSION_TTL_DAYS * 86400) =>
  `fear-session-token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`;

const getClientKey = (request) => {
  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0].trim() || "local";
};

const normalizeUsername = (value, fallback = "founder") => {
  const base = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._]+/g, "_")
    .replace(/[._]{2,}/g, "_")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 30);
  return base || "founder";
};

const cleanMediaUrl = (value, kind = "image", max = MAX_MEDIA_URL_BYTES) => {
  const url = String(value || "").trim();
  if (!url || url.length > max) return "";
  if (isSafeHttpUrl(url, { max })) return url;
  if (isSafeDataMediaUrl(url, kind)) return url;
  return "";
};

const requireDb = (env) => {
  if (!env.DB) {
    throw json({ error: "D1 database binding DB is missing" }, { status: 500 });
  }
  return env.DB;
};

const normalizeProfile = (profile = {}) => {
  const name = cleanText(profile.name || "Your Name", 80) || "Your Name";
  const username = normalizeUsername(profile.username || profile.handle, name);
  const handle = `@${username}`;
  const website = cleanText(profile.website || "", 180);
  const email = cleanText(profile.email || "", 120).toLowerCase();
  return {
    id: cleanText(profile.id || "", 120),
    name,
    username,
    handle,
    email: isValidEmail(email) ? email : "",
    location: cleanText(profile.location || "", 80),
    industry: cleanText(profile.industry || "Exploring", 40),
    stage: cleanText(profile.stage || "I'm actively building", 80),
    bio: cleanText(profile.bio || "Building in public, meeting ambitious founders, and turning fear into useful momentum.", 400),
    privacy: ["public", "private"].includes(profile.privacy) ? profile.privacy : "public",
    avatarUrl: cleanMediaUrl(profile.avatarUrl || profile.avatar_url || "", "image", 700000),
    coverUrl: cleanMediaUrl(profile.coverUrl || profile.cover_url || "", "image", 900000),
    headline: cleanText(profile.headline || "", 140),
    website: website ? (isSafeHttpUrl(/^https?:\/\//i.test(website) ? website : `https://${website}`, { allowHttp: false, max: 180 }) ? (/^https?:\/\//i.test(website) ? website : `https://${website}`) : "") : "",
    lookingFor: cleanText(profile.lookingFor || profile.looking_for || "", 160),
    goal: cleanText(profile.goal || "", 160),
  };
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatProfileSummary = (profile = {}) =>
  [
    `Name: ${profile.name || "Unknown"}`,
    `Username: ${profile.username ? `@${profile.username}` : profile.handle || ""}`,
    `Handle: ${profile.handle || ""}`,
    `Email: ${profile.email || ""}`,
    `Location: ${profile.location || ""}`,
    `Industry: ${profile.industry || ""}`,
    `Stage: ${profile.stage || ""}`,
    `Headline: ${profile.headline || ""}`,
    `Looking for: ${profile.lookingFor || profile.looking_for || ""}`,
    `Goal: ${profile.goal || ""}`,
    `Website: ${profile.website || ""}`,
    `Bio: ${profile.bio || ""}`,
  ].join("\n");

async function safeRun(db, sql, bindings = []) {
  try {
    return await db.prepare(sql).bind(...bindings).run();
  } catch (err) {
    console.warn("database write failed", err);
    return null;
  }
}

async function enforceRateLimit(db, request, key, limit = 12, windowSeconds = 300) {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const id = `${key}:${getClientKey(request)}:${bucket}`;
  try {
    const existing = await db.prepare("SELECT count FROM api_rate_limits WHERE id = ?").bind(id).first();
    if (existing && Number(existing.count) >= limit) {
      return json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
    }
    if (existing) {
      await db.prepare("UPDATE api_rate_limits SET count = count + 1 WHERE id = ?").bind(id).run();
    } else {
      await db
        .prepare("INSERT INTO api_rate_limits (id, route, client_key, bucket, count, expires_at) VALUES (?, ?, ?, ?, 1, ?)")
        .bind(id, key, getClientKey(request), String(bucket), new Date(Date.now() + windowSeconds * 1000).toISOString())
        .run();
    }
  } catch (err) {
    console.warn("rate limit failed", err);
  }
  return null;
}

async function recordRegistrationEmail(db, source, email, details = {}) {
  const normalizedEmail = cleanText(email, 120).toLowerCase();
  if (!isValidEmail(normalizedEmail)) return null;

  const id = createId("registration_email");
  try {
    await db
      .prepare(
        `INSERT INTO registration_emails (id, email, source, user_id, name, handle, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        normalizedEmail,
        source,
        details.userId || "",
        details.name || "",
        details.handle || (details.username ? `@${details.username}` : ""),
        JSON.stringify(details.metadata || {})
      )
      .run();
  } catch (err) {
    console.warn("registration email log failed", err);
  }

  return id;
}

async function recordNotification(db, type, recipient, subject, payload, status = "queued", providerId = "", error = "") {
  const id = createId("email");
  try {
    await db
      .prepare(
        `INSERT INTO email_notifications (id, type, recipient, subject, payload, status, provider_id, error)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, type, recipient, subject, JSON.stringify(payload), status, providerId, error)
      .run();
  } catch (err) {
    console.warn("email notification log failed", err);
  }
  return id;
}

async function updateNotification(db, id, status, providerId = "", error = "") {
  if (!id) return;
  try {
    await db
      .prepare(
        "UPDATE email_notifications SET status = ?, provider_id = ?, error = ?, sent_at = CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END WHERE id = ?"
      )
      .bind(status, providerId, error, status, id)
      .run();
  } catch (err) {
    console.warn("email notification update failed", err);
  }
}

function emailDeliveryError(notification) {
  if (notification?.sent) return "";
  if (notification?.queued) return "Verification email is not available yet. Please contact contact@fear.social for access.";
  return "Verification email could not be sent right now. Please try again shortly.";
}

const publicProfile = (user = {}) => {
  const profile = normalizeProfile(user);
  return {
    id: cleanText(user.id || profile.id || "", 120),
    name: profile.name,
    username: profile.username,
    handle: profile.handle,
    location: profile.location,
    industry: profile.industry,
    stage: profile.stage,
    bio: profile.bio,
    privacy: profile.privacy,
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl,
    headline: profile.headline,
    website: profile.website,
    lookingFor: profile.lookingFor,
    goal: profile.goal,
    verified: isVerifiedAccount(user),
  };
};

async function sendEmailNotification(db, env, type, recipient, subject, payload) {
  const logId = await recordNotification(db, type, recipient, subject, payload);

  if (!env.RESEND_API_KEY) {
    await updateNotification(db, logId, "failed", "", "RESEND_API_KEY is not configured in Cloudflare Pages secrets.");
    return { sent: false, queued: true, logId };
  }

  const lines = Object.entries(payload).map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</p>`).join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || DEFAULT_EMAIL_FROM,
      to: recipient,
      reply_to: CONTACT_EMAIL,
      subject,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#111318"><h2>${escapeHtml(subject)}</h2>${lines}</div>`,
      text: `${subject}\n\n${Object.entries(payload).map(([key, value]) => `${key}: ${value}`).join("\n")}`,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    await updateNotification(db, logId, "failed", "", JSON.stringify(result).slice(0, 800));
    return { sent: false, queued: false, logId, error: result };
  }

  await updateNotification(db, logId, "sent", result.id || "");
  return { sent: true, queued: false, logId, providerId: result.id || "" };
}

async function sendOwnerNotification(db, env, type, subject, payload) {
  return sendEmailNotification(db, env, type, env.NOTIFICATION_EMAIL || NOTIFICATION_EMAIL, subject, payload);
}

async function sendSignupReceivedEmail(db, env, email, details = {}) {
  const normalizedEmail = cleanText(email, 120).toLowerCase();
  if (!isValidEmail(normalizedEmail)) return null;
  const username = details.handle || (details.username ? `@${details.username}` : "");
  return sendEmailNotification(db, env, "signup_received", normalizedEmail, "We received your fear.social signup", {
    message: "Your fear.social signup was received.",
    email: normalizedEmail,
    username,
    status: details.status || "Received",
    nextStep: details.nextStep || "We will keep you posted as access opens.",
    contact: CONTACT_EMAIL,
  });
}

async function createEmailVerification(db, env, purpose, email, details = {}) {
  const normalizedEmail = cleanText(email, 120).toLowerCase();
  if (!isValidEmail(normalizedEmail)) return null;

  const username = normalizeUsername(details.username || details.handle || normalizedEmail.split("@")[0], "founder");
  const handle = details.handle || `@${username}`;
  const code = createVerificationCode();
  const id = createId("verification");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  try {
    await db
      .prepare(
        `INSERT INTO email_verifications (id, email, username, code, purpose, status, expires_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(id, normalizedEmail, username, code, purpose, expiresAt)
      .run();
  } catch (err) {
    console.warn("email verification log failed", err);
  }

  const userNotification = await sendEmailNotification(db, env, "email_verification", normalizedEmail, "Your fear.social verification code", {
    event: "Email verification requested",
    purpose,
    email: normalizedEmail,
    username: handle,
    verificationCode: code,
    expiresAt,
  });
  const ownerNotification = await sendOwnerNotification(db, env, "owner_email_verification", "fear.social email verification requested", {
    event: "Email verification requested",
    purpose,
    email: normalizedEmail,
    username: handle,
    verificationCode: code,
    expiresAt,
  });

  if (userNotification?.logId) {
    try {
      await db
        .prepare("UPDATE email_verifications SET notification_id = ? WHERE id = ?")
        .bind(userNotification.logId, id)
        .run();
    } catch (err) {
      console.warn("email verification notification link failed", err);
    }
  }

  return { id, code, expiresAt, notification: userNotification, ownerNotification };
}

async function getOrCreateUser(db, env, request, body = {}) {
  const token = getAuthToken(request, body);
  if (!token && !body.profile) {
    return { error: "Authentication required", status: 401 };
  }
  const existing = await db.prepare("SELECT * FROM users WHERE id <> 'demo-user' AND token = ?").bind(token).first();
  if (existing) return { user: existing, token, created: false };
  const session = token
    ? await db
        .prepare(
          `SELECT u.*
           FROM user_sessions s
           JOIN users u ON u.id = s.user_id
           WHERE s.token_hash = ? AND s.revoked_at IS NULL AND datetime(s.expires_at) > datetime('now')`
        )
        .bind(await sha256(token))
        .first()
    : null;
  if (session) {
    await safeRun(db, "UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?", [session.id]);
    return { user: session, token, created: false };
  }

  if (!body.profile) {
    return { error: "Authentication required", status: 401 };
  }

  const profile = normalizeProfile(body.profile);
  if (profile.email) {
    const existingEmailUser = await db
      .prepare("SELECT * FROM users WHERE id <> 'demo-user' AND lower(email) = lower(?)")
      .bind(profile.email)
      .first();
    if (existingEmailUser) return { user: existingEmailUser, token: existingEmailUser.token, created: false };
  }
  const handleOwner = await db
    .prepare("SELECT id FROM users WHERE id <> 'demo-user' AND lower(handle) = lower(?)")
    .bind(profile.handle)
    .first();
  if (handleOwner) return { error: "Username is already taken", token, created: false };

  const id = createId("user");
  const sessionToken = token || crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO users (id, token, name, handle, email, location, industry, stage, bio, privacy, avatar_url, cover_url, headline, website, looking_for, goal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, sessionToken, profile.name, profile.handle, profile.email, profile.location, profile.industry, profile.stage, profile.bio, profile.privacy, profile.avatarUrl, profile.coverUrl, profile.headline, profile.website, profile.lookingFor, profile.goal)
      .run();
  await createSession(db, id, sessionToken, request);

  if (profile.email) {
    await recordRegistrationEmail(db, "account_created", profile.email, {
      userId: id,
      name: profile.name,
      handle: profile.handle,
      username: profile.username,
      metadata: {
        location: profile.location,
        industry: profile.industry,
        stage: profile.stage,
      },
    });
    await sendOwnerNotification(db, env, "account_created", "New fear.social account created", {
      event: "Account creation",
      ...profile,
      summary: formatProfileSummary(profile),
    });
    await createEmailVerification(db, env, "account_created", profile.email, profile);
  }

  return {
    user: { id, token, ...profile },
    token: sessionToken,
    created: true,
  };
}

async function createSession(db, userId, token, request) {
  const sessionToken = token || crypto.randomUUID();
  await safeRun(
    db,
    `INSERT INTO user_sessions (id, user_id, token_hash, user_agent, ip_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      createId("session"),
      userId,
      await sha256(sessionToken),
      String(request.headers.get("user-agent") || "").slice(0, 300),
      await sha256(getClientKey(request)),
      addDays(SESSION_TTL_DAYS),
    ]
  );
  await safeRun(db, "UPDATE users SET token = ?, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?", [sessionToken, userId]);
  return sessionToken;
}

const oauthErrorRedirect = (message) => {
  const params = new URLSearchParams({ oauth: "error", message: String(message || "Sign-in failed").slice(0, 160) });
  return new Response(null, { status: 302, headers: { location: `/#login?${params.toString()}` } });
};

const pemToArrayBuffer = (pem = "") => {
  const clean = String(pem)
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

async function createAppleClientSecret(env) {
  if (!env.APPLE_TEAM_ID || !env.APPLE_KEY_ID || !env.APPLE_CLIENT_ID || !env.APPLE_PRIVATE_KEY) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "ES256", kid: env.APPLE_KEY_ID, typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: env.APPLE_TEAM_ID,
      iat: now,
      exp: now + 86400 * 30,
      aud: "https://appleid.apple.com",
      sub: env.APPLE_CLIENT_ID,
    })
  );
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.APPLE_PRIVATE_KEY),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, textEncoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function verifyAppleIdentityToken(idToken, clientId) {
  const [headerPart, payloadPart, signaturePart] = String(idToken || "").split(".");
  if (!headerPart || !payloadPart || !signaturePart) return null;
  let header;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerPart)));
  } catch {
    return null;
  }
  const jwksResponse = await fetch("https://appleid.apple.com/auth/keys", { headers: { accept: "application/json" } });
  const jwks = await jwksResponse.json().catch(() => ({}));
  if (!jwksResponse.ok || !Array.isArray(jwks.keys)) return null;
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const verified = await crypto.subtle.verify(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    base64UrlDecode(signaturePart),
    textEncoder.encode(`${headerPart}.${payloadPart}`)
  );
  if (!verified) return null;
  const payload = decodeJwtPayload(idToken);
  const now = Math.floor(Date.now() / 1000);
  if (payload?.iss !== "https://appleid.apple.com") return null;
  if (payload?.aud !== clientId) return null;
  if (Number(payload?.exp || 0) < now) return null;
  return payload;
}

async function createOrLinkOAuthUser(db, request, profile) {
  const provider = String(profile.provider || "oauth").trim().toLowerCase();
  const providerLabel = provider === "apple" ? "Apple" : provider === "google" ? "Google" : "OAuth";
  const email = cleanText(profile.email || "", 120).toLowerCase();
  if (!isValidEmail(email)) return { error: `${providerLabel} account did not provide a valid email`, status: 400 };
  let user = await db.prepare("SELECT * FROM users WHERE id <> 'demo-user' AND lower(email) = lower(?)").bind(email).first();
  if (!user) {
    const username = normalizeUsername(profile.username || email.split("@")[0], "founder");
    const handle = `@${username}`;
    const handleOwner = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND lower(handle) = lower(?)").bind(handle).first();
    const finalHandle = handleOwner ? `@${username}_${randomHex(3)}` : handle;
    const id = createId("user");
    const sessionToken = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO users (id, token, name, handle, email, location, industry, stage, bio, email_verified_at, oauth_provider, oauth_subject, avatar_url)
         VALUES (?, ?, ?, ?, ?, '', 'Exploring', 'I''m actively building', ?, CURRENT_TIMESTAMP, ?, ?, ?)`
      )
      .bind(
        id,
        sessionToken,
        String(profile.name || email.split("@")[0]).slice(0, 80),
        finalHandle,
        email,
        `Signed in with ${providerLabel}.`,
        provider,
        profile.subject || "",
        cleanMediaUrl(profile.picture || "", "image", 500)
      )
      .run();
    await recordRegistrationEmail(db, `${provider}_account_created`, email, {
      userId: id,
      name: profile.name || "",
      handle: finalHandle,
      username: finalHandle.replace(/^@/, ""),
    });
    user = { id, token: sessionToken, name: profile.name || email.split("@")[0], handle: finalHandle, email };
  } else {
    await safeRun(db, "UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), oauth_provider = ?, oauth_subject = ?, avatar_url = COALESCE(NULLIF(?, ''), avatar_url), last_seen_at = CURRENT_TIMESTAMP WHERE id = ?", [
      provider,
      profile.subject || "",
      cleanMediaUrl(profile.picture || "", "image", 500),
      user.id,
    ]);
  }
  const token = await createSession(db, user.id, crypto.randomUUID(), request);
  return { user, token };
}

const timeAgo = (createdAt) => {
  const diff = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const initials = (name) =>
  String(name || "YO")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "YO";

const parseMediaList = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value || "[]") : value;
    if (!Array.isArray(parsed)) return [];
    let totalUrlBytes = 0;
    return parsed
      .map((item) => {
        const kind = item?.kind === "video" ? "video" : "image";
        const url = cleanMediaUrl(item?.url || "", kind, kind === "video" ? MAX_MEDIA_URL_BYTES : 700000);
        totalUrlBytes += url.length;
        return {
          id: cleanText(item?.id || createId("media"), 80),
          kind,
          url,
          alt: cleanText(item?.alt || "", 160),
        };
      })
      .filter(
        (item) =>
          item.url &&
          totalUrlBytes <= MAX_TOTAL_MEDIA_URL_BYTES
      )
      .slice(0, 4);
  } catch {
    return [];
  }
};

async function getPosts(db, userId) {
  const posts = await db
    .prepare(
      `SELECT p.*, u.id AS user_id, u.name AS user_name, u.handle, u.avatar_url AS user_avatar_url, u.verified_badge AS user_verified_badge,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.kind = 'like') AS likes,
        EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = ? AND pr.kind = 'like') AS liked,
        EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = ? AND pr.kind = 'save') AS saved,
        EXISTS(SELECT 1 FROM user_connections c WHERE c.user_id = ? AND c.target_user_id = p.user_id) AS following_author
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id <> 'demo-user' AND u.id <> 'demo-user'
         AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE b.user_id = ? AND b.blocked_user_id = p.user_id)
       ORDER BY datetime(p.created_at) DESC`
    )
    .bind(userId, userId, userId, userId)
    .all();

  const comments = await db
    .prepare(
      `SELECT c.*, u.id AS user_id, u.name AS user_name, u.handle, u.avatar_url AS user_avatar_url, u.verified_badge AS user_verified_badge
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.user_id <> 'demo-user' AND u.id <> 'demo-user'
         AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE b.user_id = ? AND b.blocked_user_id = c.user_id)
       ORDER BY datetime(c.created_at) ASC`
    )
    .bind(userId)
    .all();

  const grouped = new Map();
  for (const comment of comments.results || []) {
    const list = grouped.get(comment.post_id) || [];
    list.push({
      id: comment.id,
      userId: comment.user_id,
    user: comment.user_name,
    handle: comment.handle,
    av: initials(comment.user_name),
    avatarUrl: comment.user_avatar_url || "",
    verified: isVerifiedAccount({ name: comment.user_name, handle: comment.handle, verified_badge: comment.user_verified_badge }),
    text: comment.text,
    time: timeAgo(comment.created_at),
    });
    grouped.set(comment.post_id, list);
  }

  return (posts.results || []).map((post) => ({
    id: post.id,
    userId: post.user_id,
    user: post.user_name,
    handle: post.handle,
    av: initials(post.user_name),
    avatarUrl: post.user_avatar_url || "",
    verified: isVerifiedAccount({ name: post.user_name, handle: post.handle, verified_badge: post.user_verified_badge }),
    tag: post.tag,
    stage: post.stage,
    type: post.type,
    time: timeAgo(post.created_at),
    content: post.content,
    media: parseMediaList(post.media),
    edited: Boolean(post.updated_at && post.created_at && post.updated_at !== post.created_at),
    likes: post.likes,
    comments: grouped.get(post.id) || [],
    saved: Boolean(post.saved),
    liked: Boolean(post.liked),
    followingAuthor: Boolean(post.following_author),
    officialFear: post.user_id === OFFICIAL_USER_ID || post.handle === "@fear.social",
  }));
}

const DAILY_REEL_TEMPLATES = [
  {
    tag: "Exploring",
    title: "Your First Move Lives Here",
    feature: "Create a profile, say what you are trying to become, and let the app turn that first step into something visible.",
    beats: ["Post what you are exploring.", "Save one opportunity in Deals.", "Find one person building near your lane."],
    cta: "Open fear.social and make your first move public today.",
  },
  {
    tag: "Mindset",
    title: "Quote Of The Day",
    quote: "You do not have to be fearless. You have to be willing.",
    feature: "fear.social gives that willingness somewhere to go with profiles, posts, DMs, groups, and first-step opportunities.",
    beats: ["Write the move you have been avoiding.", "Post it or send it to one person.", "Let action become the proof."],
    cta: "Use fear.social to turn today’s nerve into one visible action.",
  },
  {
    tag: "Networking",
    title: "Find People Before You Feel Ready",
    feature: "Discover founders, creators, mentors, students, operators, and first-time builders who are also figuring it out.",
    beats: ["Search by field.", "Open a profile.", "Send one real message."],
    cta: "Use Discover to find one person who makes your next step feel possible.",
  },
  {
    tag: "Opportunities",
    title: "Deals Is Your Opportunity Board",
    feature: "fear.social matches opportunities to your field, goals, skills, and location so the next door is easier to spot.",
    beats: ["Check For You in Deals.", "Save the best fit.", "Post an opportunity if you have one."],
    cta: "Go to Deals and find one opening worth chasing.",
  },
  {
    tag: "Mentors",
    title: "Ask The Question",
    feature: "fear.social helps you find people, start useful conversations, and ask for the kind of guidance that creates motion.",
    beats: ["Write the thing you are stuck on.", "Ask for one piece of advice.", "Keep the next action small."],
    cta: "Use Mentors or DMs to ask one better question today.",
  },
  {
    tag: "Prompts",
    title: "Daily Prompt: Name The Next Step",
    feature: "fear.social works best when members post honest first-step prompts that other people can respond to, support, and build on.",
    beats: ["Finish this sentence: I need help with...", "Add one deadline or blocker.", "Invite one useful reply from the community."],
    cta: "Post today’s prompt and let someone meet you where you are.",
  },
  {
    tag: "Creative",
    title: "Post The Progress",
    feature: "The fear.social feed is for updates, asks, milestones, hiring notes, launches, photos, videos, and honest first steps.",
    beats: ["Share what you tried.", "Add what you learned.", "Tell people what you need next."],
    cta: "Publish one update so your momentum has a place to live.",
  },
  {
    tag: "Finance",
    title: "Make The Idea Concrete",
    feature: "Use fear.social to track your idea, find feedback, meet collaborators, and turn loose ambition into actual motion.",
    beats: ["Name the offer.", "Ask for feedback.", "Find one possible customer or collaborator."],
    cta: "Post the rough version. The polished version can come later.",
  },
  {
    tag: "Product",
    title: "Your Profile Should Open Doors",
    feature: "fear.social profiles let members show what they are building, what they need, where they are headed, and how to start a real conversation.",
    beats: ["Update your headline.", "Add what you are looking for.", "Make your goal specific enough to answer."],
    cta: "Tighten your profile so your next intro has context.",
  },
  {
    tag: "Community",
    title: "Join The fear. Group",
    feature: "The fear. group is where product updates, prompts, feature drops, and community announcements live inside the app.",
    beats: ["Read the latest announcement.", "React to the prompt.", "Bring one person into the conversation."],
    cta: "Open Groups and check the official fear. room today.",
  },
  {
    tag: "DMs",
    title: "Send The First DM",
    quote: "The right conversation can change your week faster than another hour of overthinking.",
    feature: "fear.social DMs are there for warm intros, follow-ups, mentor asks, opportunity questions, and honest first outreach.",
    beats: ["Open one profile you respect.", "Send one clear sentence.", "Ask for the smallest useful next response."],
    cta: "Send the message before you rewrite it into silence.",
  },
  {
    tag: "Updates",
    title: "What fear.social Is Posting For",
    feature: "That means a mix of product updates, prompts, quotes, group nudges, profile tips, opportunity reminders, and first-step momentum inside the app.",
    beats: ["Check what landed today.", "Use one feature right away.", "Come back tomorrow for a different angle."],
    cta: "Follow @fear.social for daily momentum, not just announcements.",
  },
];

const officialReelContent = (dateKey) => {
  const dayMs = Date.parse(`${dateKey}T00:00:00.000Z`);
  const index = Number.isFinite(dayMs) ? Math.floor(dayMs / 86400000) % DAILY_REEL_TEMPLATES.length : 0;
  const reel = DAILY_REEL_TEMPLATES[index];
  return {
    ...reel,
    content: [
      `Daily fear.social Reel: ${reel.title}`,
      "",
      ...(reel.quote ? [`Quote: ${reel.quote}`, ""] : []),
      `Why fear.social: ${reel.feature}`,
      "",
      "Reel beats:",
      ...reel.beats.map((beat, beatIndex) => `${beatIndex + 1}. ${beat}`),
      "",
      `CTA: ${reel.cta}`,
    ].join("\n"),
  };
};

const OFFICIAL_EVERGREEN_POSTS = [
  {
    id: "fear-official-start-here",
    type: "Update",
    tag: "Exploring",
    stage: "Official",
    content:
      "What fear.social is: a social platform for people taking their first real step into business, careers, projects, and professional relationships.\n\nBuild a profile, post what you are working toward, find people in your lane, message them, join groups, and turn the scary first move into visible momentum.",
  },
  {
    id: "fear-official-opportunities",
    type: "Update",
    tag: "Opportunities",
    stage: "Official",
    content:
      "Deals is built for jobs, gigs, volunteer roles, internships, collabs, and early opportunities.\n\nThe goal is simple: help members find openings that match their field, goals, location, and first-step ambition instead of scrolling through generic listings.",
  },
  {
    id: "fear-official-community",
    type: "Update",
    tag: "Community",
    stage: "Official",
    content:
      "The fear. group, DMs, profiles, posts, and activity feed are here to make business feel less intimidating.\n\nYou do not need to already feel like a founder. You need a place to start, ask, learn, connect, and keep moving.",
  },
];

async function ensureOfficialDailyReelPost(db) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const postId = `fear-reel-${dateKey}`;
  const reel = officialReelContent(dateKey);
  await db
    .prepare(
      `INSERT OR IGNORE INTO users (id, token, name, handle, email, location, industry, stage, bio, privacy, avatar_url, role, headline, website, looking_for, goal, verified_badge, email_verified_at)
       VALUES (?, ?, 'fear.social', '@fear.social', 'official@fear.social', 'Remote', 'Community', 'Building', 'Official fear.social account for daily prompts, product updates, and first-step momentum.', 'public', ?, 'admin', 'Official fear.social daily reels and platform notes.', 'https://fear.social', 'People ready to take their first business or career step.', 'Turn fear into momentum.', 1, CURRENT_TIMESTAMP)`
    )
    .bind(OFFICIAL_USER_ID, `official-${OFFICIAL_USER_ID}`, OFFICIAL_AVATAR_URL)
    .run();
  await db
    .prepare(
      `UPDATE users
       SET name = 'fear.social',
           handle = '@fear.social',
           email = 'official@fear.social',
           location = 'Remote',
           industry = 'Community',
           stage = 'Building',
           bio = 'Official fear.social account for daily prompts, product updates, and first-step momentum.',
           privacy = 'public',
           avatar_url = ?,
           role = 'admin',
           headline = 'Official fear.social daily reels and platform notes.',
           website = 'https://fear.social',
           looking_for = 'People ready to take their first business or career step.',
           goal = 'Turn fear into momentum.',
           verified_badge = 1,
           email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(OFFICIAL_AVATAR_URL, OFFICIAL_USER_ID)
    .run();
  await db
    .prepare("INSERT OR IGNORE INTO posts (id, user_id, type, tag, stage, content, media, created_at) VALUES (?, ?, 'Reel', ?, 'Daily', ?, '[]', CURRENT_TIMESTAMP)")
    .bind(postId, OFFICIAL_USER_ID, reel.tag, reel.content)
    .run();
  await db
    .prepare("UPDATE posts SET type = 'Reel', tag = ?, stage = 'Daily', content = ?, media = '[]', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
    .bind(reel.tag, reel.content, postId, OFFICIAL_USER_ID)
    .run();
  for (const post of OFFICIAL_EVERGREEN_POSTS) {
    await db
      .prepare("INSERT OR IGNORE INTO posts (id, user_id, type, tag, stage, content, media, created_at) VALUES (?, ?, ?, ?, ?, ?, '[]', CURRENT_TIMESTAMP)")
      .bind(post.id, OFFICIAL_USER_ID, post.type, post.tag, post.stage, post.content)
      .run();
    await db
      .prepare("UPDATE posts SET type = ?, tag = ?, stage = ?, content = ?, media = '[]', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
      .bind(post.type, post.tag, post.stage, post.content, post.id, OFFICIAL_USER_ID)
      .run();
  }
}

async function profileWithFollowerCount(db, user) {
  const row = await db
    .prepare("SELECT COUNT(*) AS followers FROM user_connections WHERE target_user_id = ?")
    .bind(user.id)
    .first();
  return { ...publicProfile(user), followers: Number(row?.followers || 0) };
}

const isAdminUser = (user = {}) =>
  String(user.role || "").toLowerCase() === "admin" ||
  ["tsbrown223@gmail.com", CONTACT_EMAIL].includes(String(user.email || "").toLowerCase());

async function ensureFearGroupMembership(db, user) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO groups (id, name, slug, description, kind, visibility, owner_user_id)
       VALUES (?, 'fear.', 'fear', 'Official fear.social updates, feature drops, founder notes, and internal announcements from the team.', 'official', 'public', NULL)`
    )
    .bind(FEAR_GROUP_ID)
    .run();
  await db
    .prepare("INSERT OR IGNORE INTO group_members (group_id, user_id, role, status) VALUES (?, ?, ?, 'active')")
    .bind(FEAR_GROUP_ID, user.id, isAdminUser(user) ? "admin" : "member")
    .run();
}

async function getGroups(db, user) {
  await ensureFearGroupMembership(db, user);
  const groups = await db
    .prepare(
      `SELECT g.*,
        gm.role AS member_role,
        gm.status AS member_status,
        EXISTS(SELECT 1 FROM group_invites gi WHERE gi.group_id = g.id AND gi.invitee_user_id = ? AND gi.status = 'pending') AS invited,
        (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.status = 'active') AS member_count,
        (SELECT COUNT(*) FROM group_invites gi2 WHERE gi2.group_id = g.id AND gi2.status = 'pending') AS invite_count
       FROM groups g
       LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
       WHERE g.visibility = 'public' OR gm.user_id IS NOT NULL OR EXISTS(SELECT 1 FROM group_invites gi3 WHERE gi3.group_id = g.id AND gi3.invitee_user_id = ? AND gi3.status = 'pending')
       ORDER BY CASE WHEN g.id = ? THEN 0 ELSE 1 END, datetime(g.created_at) DESC`
    )
    .bind(user.id, user.id, user.id, FEAR_GROUP_ID)
    .all();
  const announcements = await db
    .prepare(
      `SELECT ga.*, u.name AS author_name, u.handle AS author_handle
       FROM group_announcements ga
       JOIN groups g ON g.id = ga.group_id
       LEFT JOIN users u ON u.id = ga.user_id
       LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
       WHERE g.visibility = 'public' OR gm.user_id IS NOT NULL
       ORDER BY datetime(ga.created_at) DESC
       LIMIT 120`
    )
    .bind(user.id)
    .all();
  const byGroup = new Map();
  for (const row of announcements.results || []) {
    const list = byGroup.get(row.group_id) || [];
    if (list.length < 5) {
      list.push({
        id: row.id,
        title: row.title,
        body: row.body,
        author: row.author_name || "fear.social",
        handle: row.author_handle || "",
        time: timeAgo(row.created_at),
      });
    }
    byGroup.set(row.group_id, list);
  }
  return (groups.results || []).map((group) => {
    const role = group.member_role || "";
    const member = group.member_status === "active";
    const admin = role === "admin" || group.owner_user_id === user.id || isAdminUser(user);
    const official = group.id === FEAR_GROUP_ID || group.kind === "official";
    return {
      id: group.id,
      name: group.name,
      slug: group.slug,
      desc: group.description,
      kind: group.kind,
      member,
      invited: Boolean(group.invited),
      role: role || (Boolean(group.invited) ? "invited" : ""),
      memberCount: Number(group.member_count || 0),
      inviteCount: Number(group.invite_count || 0),
      canInvite: member && (admin || group.owner_user_id === user.id),
      canAnnounce: member && (official ? isAdminUser(user) : admin),
      official,
      active: `${Number(group.member_count || 0).toLocaleString()} members · ${Number(group.invite_count || 0).toLocaleString()} pending invites`,
      announcements: byGroup.get(group.id) || [],
    };
  });
}

async function getStats(db) {
  const count = async (sql) => {
    const row = await db.prepare(sql).first();
    return Number(row?.value || 0);
  };

  return {
    profiles: await count("SELECT COUNT(*) AS value FROM users WHERE id <> 'demo-user' AND email <> ''"),
    verifiedProfiles: await count("SELECT COUNT(*) AS value FROM users WHERE id <> 'demo-user' AND email <> '' AND email_verified_at IS NOT NULL"),
    waitlist: await count("SELECT COUNT(*) AS value FROM waitlist"),
    emails: await count("SELECT COUNT(*) AS value FROM registration_emails"),
    posts: await count("SELECT COUNT(*) AS value FROM posts WHERE user_id <> 'demo-user'"),
    comments: await count("SELECT COUNT(*) AS value FROM comments WHERE user_id <> 'demo-user'"),
    likes: await count("SELECT COUNT(*) AS value FROM post_reactions WHERE kind = 'like' AND user_id <> 'demo-user'"),
    saves: await count("SELECT COUNT(*) AS value FROM post_reactions WHERE kind = 'save' AND user_id <> 'demo-user'"),
    connections: await count("SELECT COUNT(*) AS value FROM user_connections WHERE user_id <> 'demo-user'"),
    rsvps: await count("SELECT COUNT(*) AS value FROM event_rsvps WHERE user_id <> 'demo-user'"),
    mentorRequests: await count("SELECT COUNT(*) AS value FROM mentor_requests WHERE user_id <> 'demo-user'"),
    messages: await count("SELECT COUNT(*) AS value FROM messages WHERE author = 'you' AND user_id <> 'demo-user'"),
    events: await count("SELECT COUNT(*) AS value FROM events"),
    mentors: await count("SELECT COUNT(*) AS value FROM mentors"),
  };
}

async function getNotifications(db, userId) {
  const rows = await db
    .prepare(
      `SELECT n.*, u.name AS actor_name, u.handle AS actor_handle, u.avatar_url AS actor_avatar_url, u.verified_badge AS actor_verified_badge
       FROM user_notifications n
       LEFT JOIN users u ON u.id = n.actor_user_id
       WHERE n.user_id = ?
       ORDER BY datetime(n.created_at) DESC
       LIMIT 80`
    )
    .bind(userId)
    .all();
  return (rows.results || []).map((notification) => ({
    id: notification.id,
    type: notification.type,
    body: notification.body,
    targetType: notification.target_type || "",
    targetId: notification.target_id || "",
    read: Boolean(notification.read_at),
    time: timeAgo(notification.created_at),
    actor: notification.actor_user_id
      ? {
          id: notification.actor_user_id,
          name: notification.actor_name || "Member",
          handle: notification.actor_handle || "",
          av: initials(notification.actor_name),
          avatarUrl: notification.actor_avatar_url || "",
          verified: isVerifiedAccount({ name: notification.actor_name, handle: notification.actor_handle, verified_badge: notification.actor_verified_badge }),
        }
      : null,
  }));
}

const parseJsonArray = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const normalizeOpportunity = (body = {}, user = {}) => {
  const skills = Array.isArray(body.skills)
    ? body.skills
    : String(body.skills || "")
        .split(/[,\n]+/)
        .map((item) => item.trim())
        .filter(Boolean);
  return {
    title: cleanText(body.title || "", 120),
    company: cleanText(body.company || "", 100),
    type: cleanText(body.type || "Opportunity", 40),
    tag: cleanText(body.tag || user.industry || "Exploring", 60),
    budget: cleanText(body.budget || "Open", 80),
    location: cleanText(body.location || "Remote", 80),
    level: cleanText(body.level || "First step", 80),
    skills: skills.map((skill) => cleanText(skill, 40)).filter(Boolean).slice(0, 8),
    desc: cleanText(body.desc || body.description || "", 900),
  };
};

async function getOpportunities(db) {
  try {
    const rows = await db
      .prepare(
        `SELECT o.*, u.name AS poster_name, u.handle AS poster_handle
         FROM opportunities o
         LEFT JOIN users u ON u.id = o.user_id
         WHERE COALESCE(o.status, 'open') = 'open'
         ORDER BY datetime(o.created_at) DESC
         LIMIT 120`
      )
      .all();
    return (rows.results || []).map((opportunity) => {
      const skills = parseJsonArray(opportunity.skills);
      return {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        type: opportunity.type,
        tag: opportunity.tag,
        budget: opportunity.budget,
        location: opportunity.location,
        level: opportunity.level,
        skills,
        desc: opportunity.description,
        fit: [opportunity.tag, opportunity.type, opportunity.level, opportunity.location, ...skills, opportunity.title, opportunity.company, opportunity.description].filter(Boolean),
        postedBy: opportunity.poster_name || "fear.social member",
        postedByHandle: opportunity.poster_handle || "",
        userPosted: true,
      };
    });
  } catch {
    return [];
  }
}

async function getConnectionDirectory(db) {
  const rows = await db
    .prepare(
      `SELECT c.user_id, c.target_user_id,
        follower.id AS follower_id, follower.name AS follower_name, follower.handle AS follower_handle,
        follower.avatar_url AS follower_avatar_url, follower.industry AS follower_industry, follower.location AS follower_location,
        follower.bio AS follower_bio, follower.verified_badge AS follower_verified_badge,
        target.id AS target_id, target.name AS target_name, target.handle AS target_handle,
        target.avatar_url AS target_avatar_url, target.industry AS target_industry, target.location AS target_location,
        target.bio AS target_bio, target.verified_badge AS target_verified_badge
       FROM user_connections c
       JOIN users follower ON follower.id = c.user_id
       JOIN users target ON target.id = c.target_user_id
       WHERE follower.id <> 'demo-user'
         AND target.id <> 'demo-user'
         AND COALESCE(follower.privacy, 'public') = 'public'
         AND COALESCE(target.privacy, 'public') = 'public'
       ORDER BY datetime(COALESCE(target.created_at, '1970-01-01')) DESC
       LIMIT 800`
    )
    .all();
  const followersByUserId = {};
  const followingByUserId = {};
  const toPerson = (row, prefix) => ({
    id: row[`${prefix}_id`],
    name: row[`${prefix}_name`] || "Member",
    handle: row[`${prefix}_handle`] || "",
    av: initials(row[`${prefix}_name`]),
    avatarUrl: row[`${prefix}_avatar_url`] || "",
    industry: row[`${prefix}_industry`] || "Exploring",
    loc: row[`${prefix}_location`] || "",
    bio: row[`${prefix}_bio`] || "",
    verified: isVerifiedAccount({
      name: row[`${prefix}_name`],
      handle: row[`${prefix}_handle`],
      verified_badge: row[`${prefix}_verified_badge`],
    }),
  });
  for (const row of rows.results || []) {
    const follower = toPerson(row, "follower");
    const target = toPerson(row, "target");
    followersByUserId[row.target_user_id] ||= [];
    followingByUserId[row.user_id] ||= [];
    if (followersByUserId[row.target_user_id].length < 100) followersByUserId[row.target_user_id].push(follower);
    if (followingByUserId[row.user_id].length < 100) followingByUserId[row.user_id].push(target);
  }
  return { followersByUserId, followingByUserId };
}

async function getBootstrap(db, user) {
  const userId = user.id;
  await ensureOfficialDailyReelPost(db);
  const [posts, people, events, mentors, conversations, stats, notifications, groups, opportunities, connections] = await Promise.all([
    getPosts(db, userId),
    db
      .prepare(
        `SELECT u.id, u.name, u.handle, u.stage, u.industry, u.location AS loc, u.bio, u.avatar_url, u.cover_url, u.verified_badge,
          u.headline, u.website, u.looking_for, u.goal,
          0 AS mutual,
          (SELECT COUNT(*) FROM user_connections c2 WHERE c2.target_user_id = u.id) AS followers,
          EXISTS(SELECT 1 FROM user_connections c WHERE c.target_user_id = u.id AND c.user_id = ?) AS connected
         FROM users u
         WHERE u.id <> 'demo-user' AND u.id <> ? AND u.email IS NOT NULL AND u.email <> ''
           AND COALESCE(u.privacy, 'public') = 'public'
           AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE b.user_id = ? AND b.blocked_user_id = u.id)
         ORDER BY datetime(u.created_at) DESC`
      )
      .bind(userId, userId, userId)
      .all(),
    db
      .prepare(
        `SELECT e.*,
          (SELECT COUNT(*) FROM event_rsvps r2 WHERE r2.event_id = e.id) AS attending,
          EXISTS(SELECT 1 FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = ?) AS going
         FROM events e
         ORDER BY e.id`
      )
      .bind(userId)
      .all(),
    db
      .prepare(
        `SELECT m.*,
          0 AS rating,
          (SELECT COUNT(*) FROM mentor_requests r2 WHERE r2.mentor_id = m.id) AS sessions,
          EXISTS(SELECT 1 FROM mentor_requests r WHERE r.mentor_id = m.id AND r.user_id = ?) AS requested
         FROM mentors m
         ORDER BY m.name`
      )
      .bind(userId)
      .all(),
    db
      .prepare(
        `SELECT c.*, other.id AS other_id, other.name AS other_name, other.handle AS other_handle,
          other.avatar_url AS other_avatar_url, other.verified_badge AS other_verified_badge, other.last_seen_at AS other_last_seen_at
         FROM conversations c
         LEFT JOIN users other ON other.id = CASE
           WHEN c.user_a_id = ? THEN c.user_b_id
           WHEN c.user_b_id = ? THEN c.user_a_id
           ELSE NULL
         END
         WHERE (c.user_a_id = ? OR c.user_b_id = ?)
         ORDER BY datetime(COALESCE(c.updated_at, '1970-01-01')) DESC, c.id DESC`
      )
      .bind(userId, userId, userId, userId)
      .all(),
    getStats(db),
    getNotifications(db, userId),
    getGroups(db, user),
    getOpportunities(db),
    getConnectionDirectory(db),
  ]);

  const messages = await db
    .prepare(
      `SELECT m.*
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.user_a_id = ? OR c.user_b_id = ?)
       ORDER BY datetime(m.created_at), m.id`
    )
    .bind(userId, userId)
    .all();
  const messageGroups = new Map();
  for (const message of messages.results || []) {
    const list = messageGroups.get(message.conversation_id) || [];
    list.push({
      id: message.id,
      text: message.text,
      author: message.user_id === userId ? "you" : message.user_id ? "them" : message.author,
      time: timeAgo(message.created_at),
    });
    messageGroups.set(message.conversation_id, list);
  }

  return {
    posts,
    people: (people.results || []).map((person) => ({
      ...person,
      av: initials(person.name),
      avatarUrl: person.avatar_url || "",
      coverUrl: person.cover_url || "",
      headline: person.headline || "",
      website: person.website || "",
      lookingFor: person.looking_for || "",
      goal: person.goal || "",
      verified: isVerifiedAccount(person),
      online: Boolean(person.online),
      connected: Boolean(person.connected),
    })),
    events: (events.results || []).map((event) => ({
      ...event,
      going: Boolean(event.going),
    })),
    mentors: (mentors.results || []).map((mentor) => ({
      ...mentor,
      tags: mentor.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      requested: Boolean(mentor.requested),
    })),
    messages: (conversations.results || []).map((conversation) => ({
      id: conversation.id,
      userId: conversation.other_id || "",
      name: conversation.other_name || conversation.name,
      handle: conversation.other_handle || "",
      av: initials(conversation.other_name || conversation.name || conversation.av),
      avatarUrl: conversation.other_avatar_url || "",
      verified: isVerifiedAccount({ name: conversation.other_name || conversation.name, handle: conversation.other_handle, verified_badge: conversation.other_verified_badge }),
      online: Boolean(conversation.online),
      thread: messageGroups.get(conversation.id) || [],
      draft: "",
    })),
    stats,
    notifications,
    groups,
    opportunities,
    connections,
    unreadNotifications: notifications.filter((notification) => !notification.read).length,
  };
}

async function completeVerification(db, email, code, purpose = "") {
  const normalizedEmail = cleanText(email, 120).toLowerCase();
  const normalizedCode = String(code || "").trim();
  if (!isValidEmail(normalizedEmail) || !/^\d{6}$/.test(normalizedCode)) return null;
  const verification = await db
    .prepare(
      `SELECT * FROM email_verifications
       WHERE lower(email) = lower(?) AND code = ? AND status = 'pending'
         AND datetime(expires_at) > datetime('now')
         ${purpose ? "AND purpose = ?" : ""}
       ORDER BY datetime(created_at) DESC
       LIMIT 1`
    )
    .bind(...(purpose ? [normalizedEmail, normalizedCode, purpose] : [normalizedEmail, normalizedCode]))
    .first();
  if (!verification) return null;
  await db.prepare("UPDATE email_verifications SET status = 'verified', verified_at = CURRENT_TIMESTAMP WHERE id = ?").bind(verification.id).run();
  await safeRun(db, "UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE lower(email) = lower(?)", [normalizedEmail]);
  await safeRun(db, "UPDATE waitlist SET verified_at = CURRENT_TIMESTAMP WHERE lower(email) = lower(?)", [normalizedEmail]);
  return verification;
}

async function findPasswordVerification(db, email, code) {
  const normalizedEmail = cleanText(email, 120).toLowerCase();
  const normalizedCode = String(code || "").trim();
  if (!isValidEmail(normalizedEmail) || !/^\d{6}$/.test(normalizedCode)) return null;
  return db
    .prepare(
      `SELECT * FROM email_verifications
       WHERE lower(email) = lower(?) AND code = ? AND purpose = 'password'
         AND (
           (status = 'pending' AND datetime(expires_at) > datetime('now'))
           OR (status = 'verified' AND datetime(verified_at) > datetime('now', '-15 minutes'))
         )
       ORDER BY datetime(created_at) DESC
       LIMIT 1`
    )
    .bind(normalizedEmail, normalizedCode)
    .first();
}

async function findUserByIdentifier(db, identifier = "") {
  const clean = cleanText(identifier, 120).toLowerCase().replace(/^@/, "");
  if (!clean) return null;
  return db
    .prepare(
      `SELECT * FROM users
       WHERE id <> 'demo-user'
         AND (lower(email) = lower(?) OR lower(replace(handle, '@', '')) = lower(?))
       LIMIT 1`
    )
    .bind(clean, clean)
    .first();
}

async function toggleRow(db, table, userId, column, value) {
  const existing = await db.prepare(`SELECT 1 FROM ${table} WHERE user_id = ? AND ${column} = ?`).bind(userId, value).first();
  if (existing) {
    await db.prepare(`DELETE FROM ${table} WHERE user_id = ? AND ${column} = ?`).bind(userId, value).run();
    return false;
  }
  await db.prepare(`INSERT INTO ${table} (user_id, ${column}) VALUES (?, ?)`).bind(userId, value).run();
  return true;
}

async function handleRequest({ request, env, params }) {
  const db = requireDb(env);
  const method = request.method;
  const rawPath = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const path = `/${rawPath}`;

  if (method === "OPTIONS") return new Response(null, { status: 204 });
  if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
    return json({ error: "Method not allowed" }, { status: 405, headers: { allow: "GET, POST, PUT, DELETE, OPTIONS" } });
  }

  if (method !== "GET") {
    const limited = await enforceRateLimit(db, request, `global-${method.toLowerCase()}`, 120, 600);
    if (limited) return limited;
  }

  if (method === "GET" && path === "/stats") {
    await ensureOfficialDailyReelPost(db);
    return json({ stats: await getStats(db) });
  }

  if (method === "GET" && path === "/admin/emails") {
    const adminKey = env.ADMIN_API_KEY;
    const suppliedKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!adminKey || suppliedKey !== adminKey) return json({ error: "Unauthorized" }, { status: 401 });
    const rows = await db
      .prepare(
        `SELECT id, email, source, user_id, name, handle, metadata, created_at
         FROM registration_emails
         ORDER BY datetime(created_at) DESC, id DESC
         LIMIT 500`
      )
      .all();
    return json({ emails: rows.results || [] });
  }

  if (method === "GET" && path === "/admin/summary") {
    const adminKey = env.ADMIN_API_KEY;
    const suppliedKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!adminKey || suppliedKey !== adminKey) return json({ error: "Unauthorized" }, { status: 401 });
    const [stats, verifications, notifications, reports, sessions] = await Promise.all([
      getStats(db),
      db.prepare("SELECT status, COUNT(*) AS count FROM email_verifications GROUP BY status").all(),
      db.prepare("SELECT status, COUNT(*) AS count FROM email_notifications GROUP BY status").all(),
      db.prepare("SELECT status, COUNT(*) AS count FROM content_reports GROUP BY status").all(),
      db.prepare("SELECT COUNT(*) AS count FROM user_sessions WHERE revoked_at IS NULL AND datetime(expires_at) > datetime('now')").first(),
    ]);
    return json({
      stats,
      verifications: verifications.results || [],
      notifications: notifications.results || [],
      reports: reports.results || [],
      activeSessions: Number(sessions?.count || 0),
    });
  }

  const body = method === "GET" ? {} : method === "POST" && path === "/auth/apple/callback" ? await readForm(request) : await readJson(request);

  if (method === "POST" && path === "/auth/request-code") {
    const limited = await enforceRateLimit(db, request, "auth-request-code", 5, 600);
    if (limited) return limited;
    const identifier = cleanText(body.identifier || body.email || "", 120).toLowerCase().replace(/^@/, "");
    const bodyEmail = cleanText(body.email || "", 120).toLowerCase();
    const identifiedUser = !isValidEmail(bodyEmail) ? await findUserByIdentifier(db, identifier) : null;
    const email = cleanText(bodyEmail || identifiedUser?.email || "", 120).toLowerCase();
    const username = normalizeUsername(body.username || email.split("@")[0], "founder");
    if (!isValidEmail(email)) return json({ error: "Valid email required" }, { status: 400 });
    const existing = await db.prepare("SELECT handle FROM users WHERE id <> 'demo-user' AND lower(email) = lower(?)").bind(email).first();
    const purpose = ["signup", "login", "password"].includes(body.purpose) ? body.purpose : "login";
    if (purpose === "signup") {
      if (existing) return json({ error: "That email already has an account. Log in instead, or reset your password." }, { status: 409 });
      const handle = `@${username}`;
      const handleOwner = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND lower(handle) = lower(?)").bind(handle).first();
      if (handleOwner) return json({ error: "That username is already taken. Try a different username." }, { status: 409 });
    }
    const verification = await createEmailVerification(db, env, purpose, email, {
      username: existing?.handle || username,
      handle: existing?.handle || `@${username}`,
    });
    if (!verification?.notification?.sent) {
      return json(
        {
          error: emailDeliveryError(verification?.notification),
          verificationSent: false,
          verificationQueued: Boolean(verification?.notification?.queued),
        },
        { status: 503 }
      );
    }
    return json({
      ok: true,
      verificationSent: Boolean(verification?.notification?.sent),
      verificationQueued: Boolean(verification?.notification?.queued),
    });
  }

  if (method === "POST" && path === "/auth/signup") {
    const limited = await enforceRateLimit(db, request, "auth-signup", 8, 600);
    if (limited) return limited;
    const email = cleanText(body.email || body.profile?.email || "", 120).toLowerCase();
    const password = String(body.password || "");
    if (!isValidEmail(email)) return json({ error: "Enter a valid email address." }, { status: 400 });
    if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (body.acceptedTerms !== true) return json({ error: "You must accept the Terms and Conditions to create an account." }, { status: 400 });

    const profile = normalizeProfile({
      ...(body.profile || {}),
      email,
      username: body.username || body.profile?.username || email.split("@")[0],
    });
    const existingEmail = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND lower(email) = lower(?)").bind(email).first();
    if (existingEmail) return json({ error: "That email already has an account. Log in instead, or reset your password." }, { status: 409 });
    const handleOwner = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND lower(handle) = lower(?)").bind(profile.handle).first();
    if (handleOwner) return json({ error: "That username is already taken. Try a different username." }, { status: 409 });

    const id = createId("user");
    const sessionToken = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    try {
      await db
        .prepare(
          `INSERT INTO users (id, token, name, handle, email, location, industry, stage, bio, privacy, avatar_url, cover_url, headline, website, looking_for, goal, password_hash, terms_accepted_at, terms_version)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
        )
        .bind(id, sessionToken, profile.name, profile.handle, email, profile.location, profile.industry, profile.stage, profile.bio, profile.privacy, profile.avatarUrl, profile.coverUrl, profile.headline, profile.website, profile.lookingFor, profile.goal, passwordHash, TERMS_VERSION)
        .run();
    } catch (err) {
      console.warn("signup insert failed", err);
      return json({ error: "Account could not be created. Try a different username or email." }, { status: 409 });
    }

    try {
      await createSession(db, id, sessionToken, request);
    } catch (err) {
      console.warn("session record failed during signup", err);
    }
    await recordRegistrationEmail(db, "account_created", email, {
      userId: id,
      name: profile.name,
      handle: profile.handle,
      username: profile.username,
      metadata: { source: "direct_signup", termsVersion: TERMS_VERSION },
    });
    let signupEmail = null;
    let verification = null;
    try {
      [signupEmail, verification] = await Promise.all([
        sendSignupReceivedEmail(db, env, email, {
          username: profile.username,
          handle: profile.handle,
          status: "Account created",
          nextStep: "Your account is ready. You can log in with your email or username and password.",
        }),
        createEmailVerification(db, env, "signup_verify", email, profile),
      ]);
    } catch (err) {
      console.warn("signup email notifications failed", err);
    }
    const user = { id, token: sessionToken, ...profile, password_hash: passwordHash, terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION };

    return json(
      {
        ok: true,
        token: sessionToken,
        profile: { ...publicProfile({ ...user, id }), followers: 0 },
        emailStatus: {
          signupConfirmationSent: Boolean(signupEmail?.sent),
          verificationSent: Boolean(verification?.notification?.sent),
        },
      },
      { status: 201, headers: { "set-cookie": sessionCookie(sessionToken) } }
    );
  }

  if (method === "POST" && path === "/auth/login") {
    const limited = await enforceRateLimit(db, request, "auth-login", 8, 600);
    if (limited) return limited;
    const identifier = cleanText(body.identifier || "", 120).toLowerCase().replace(/^@/, "");
    const password = String(body.password || "");
    if (!identifier || !password) return json({ error: "Username or email and password required" }, { status: 400 });
    const user = await findUserByIdentifier(db, identifier);
    if (user && !user.password_hash) {
      return json({ error: "This account needs a password. Use set or reset password to create one." }, { status: 409 });
    }
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: "Invalid username/email or password" }, { status: 401 });
    }
    if (String(user.password_hash).startsWith("sha256:")) {
      await safeRun(db, "UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(password), user.id]);
    }
    const token = await createSession(db, user.id, crypto.randomUUID(), request);
    return json(
      { ok: true, token, profile: await profileWithFollowerCount(db, user), ...(await getBootstrap(db, user)) },
      { headers: { "set-cookie": sessionCookie(token) } }
    );
  }

  if (method === "POST" && path === "/auth/verify") {
    const limited = await enforceRateLimit(db, request, "auth-verify", 10, 600);
    if (limited) return limited;
    const email = cleanText(body.email || "", 120).toLowerCase();
    const password = String(body.password || "");
    if (!isValidEmail(email)) return json({ error: "Valid email required" }, { status: 400 });
    if (password && password.length < 8) return json({ error: "Password must be at least 8 characters" }, { status: 400 });
    let user = await db.prepare("SELECT * FROM users WHERE id <> 'demo-user' AND lower(email) = lower(?)").bind(email).first();
    if (!user && body.acceptedTerms !== true) {
      return json({ error: "You must accept the Terms and Conditions to create an account" }, { status: 400 });
    }
    const passwordHash = password ? await hashPassword(password) : "";
    const verification = await completeVerification(db, email, body.code, body.purpose || "");
    if (!verification) return json({ error: "Invalid or expired verification code" }, { status: 400 });
    const profile = normalizeProfile({
      ...(body.profile || {}),
      email,
      username: verification.username || body.username || email.split("@")[0],
    });
    if (!user) {
      const id = createId("user");
      const sessionToken = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO users (id, token, name, handle, email, location, industry, stage, bio, privacy, avatar_url, cover_url, headline, website, looking_for, goal, password_hash, email_verified_at, terms_accepted_at, terms_version)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`
        )
        .bind(id, sessionToken, profile.name, profile.handle, email, profile.location, profile.industry, profile.stage, profile.bio, profile.privacy, profile.avatarUrl, profile.coverUrl, profile.headline, profile.website, profile.lookingFor, profile.goal, passwordHash, TERMS_VERSION)
        .run();
      await recordRegistrationEmail(db, "verified_account_created", email, {
        userId: id,
        name: profile.name,
        handle: profile.handle,
        username: profile.username,
      });
      await sendSignupReceivedEmail(db, env, email, {
        username: profile.username,
        handle: profile.handle,
        status: "Account created",
        nextStep: "Your account is ready. You can now log in with your email and password.",
      });
      user = { id, token: sessionToken, ...profile, password_hash: passwordHash, email_verified_at: new Date().toISOString() };
    } else {
      if (passwordHash) {
        await safeRun(db, "UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP) WHERE id = ?", [passwordHash, user.id]);
        user = { ...user, password_hash: passwordHash, email_verified_at: user.email_verified_at || new Date().toISOString() };
      }
      if (body.acceptedTerms === true && !user.terms_accepted_at) {
        await safeRun(db, "UPDATE users SET terms_accepted_at = CURRENT_TIMESTAMP, terms_version = ? WHERE id = ?", [TERMS_VERSION, user.id]);
        user = { ...user, terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION };
      }
    }
    const token = await createSession(db, user.id, crypto.randomUUID(), request);
    return json(
      { ok: true, token, profile: await profileWithFollowerCount(db, user), ...(await getBootstrap(db, user)) },
      { headers: { "set-cookie": sessionCookie(token) } }
    );
  }

  if (method === "POST" && path === "/auth/password") {
    const limited = await enforceRateLimit(db, request, "auth-password", 5, 600);
    if (limited) return limited;
    const identifier = cleanText(body.identifier || body.email || "", 120).toLowerCase().replace(/^@/, "");
    const user = await findUserByIdentifier(db, identifier);
    const email = cleanText(body.email || user?.email || "", 120).toLowerCase();
    if (!isValidEmail(email)) return json({ error: "Valid email required" }, { status: 400 });
    const code = String(body.code || "").trim();
    const password = String(body.password || "");
    if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, { status: 400 });
    if (!user) return json({ error: "Create the account before setting a password" }, { status: 404 });
    const verification = await findPasswordVerification(db, email, code);
    if (!verification) return json({ error: "Invalid or expired verification code" }, { status: 400 });
    const passwordHash = await hashPassword(password);
    await db
      .prepare("UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(passwordHash, user.id)
      .run();
    if (verification.status !== "verified") {
      await db.prepare("UPDATE email_verifications SET status = 'verified', verified_at = CURRENT_TIMESTAMP WHERE id = ?").bind(verification.id).run();
    }
    return json({ ok: true });
  }

  if (method === "GET" && path === "/auth/google/start") {
    if (!env.GOOGLE_CLIENT_ID) {
      return json({ error: "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Cloudflare Pages." }, { status: 501 });
    }
    const url = new URL(request.url);
    const redirectUri = env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;
    const state = randomHex(16);
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      state,
    });
    await safeRun(db, "INSERT INTO oauth_states (state, provider, redirect_uri, expires_at) VALUES (?, 'google', ?, ?)", [state, redirectUri, new Date(Date.now() + 10 * 60 * 1000).toISOString()]);
    return json({ ok: true, redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  }

  if (method === "GET" && path === "/auth/google/callback") {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return json({ error: "Google sign-in is not configured" }, { status: 501 });
    const url = new URL(request.url);
    const code = url.searchParams.get("code") || "";
    const state = url.searchParams.get("state") || "";
    const oauthState = await db
      .prepare("SELECT * FROM oauth_states WHERE state = ? AND provider = 'google' AND datetime(expires_at) > datetime('now') AND used_at IS NULL")
      .bind(state)
      .first();
    if (!code || !oauthState) return json({ error: "Invalid Google sign-in state" }, { status: 400 });
    await safeRun(db, "UPDATE oauth_states SET used_at = CURRENT_TIMESTAMP WHERE state = ?", [state]);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: oauthState.redirect_uri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenData.access_token) return json({ error: "Google token exchange failed" }, { status: 400 });
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleProfile = await profileResponse.json().catch(() => ({}));
    if (!profileResponse.ok) return json({ error: "Google profile lookup failed" }, { status: 400 });
    const linked = await createOrLinkOAuthUser(db, request, {
      provider: "google",
      subject: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      picture: googleProfile.picture,
    });
    if (linked.error) return json({ error: linked.error }, { status: linked.status || 400 });
    return new Response(null, {
      status: 302,
      headers: {
        location: "/#app",
        "set-cookie": sessionCookie(linked.token),
      },
    });
  }

  if (method === "GET" && path === "/auth/apple/start") {
    if (!env.APPLE_CLIENT_ID) {
      return json({ error: "Apple sign-in is not configured yet. Add APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY in Cloudflare Pages." }, { status: 501 });
    }
    const url = new URL(request.url);
    const redirectUri = env.APPLE_REDIRECT_URI || `${url.origin}/api/auth/apple/callback`;
    const state = randomHex(16);
    const params = new URLSearchParams({
      client_id: env.APPLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      response_mode: "form_post",
      scope: "name email",
      state,
    });
    await safeRun(db, "INSERT INTO oauth_states (state, provider, redirect_uri, expires_at) VALUES (?, 'apple', ?, ?)", [state, redirectUri, new Date(Date.now() + 10 * 60 * 1000).toISOString()]);
    return json({ ok: true, redirectUrl: `https://appleid.apple.com/auth/authorize?${params.toString()}` });
  }

  if ((method === "POST" || method === "GET") && path === "/auth/apple/callback") {
    if (!env.APPLE_CLIENT_ID || !env.APPLE_TEAM_ID || !env.APPLE_KEY_ID || !env.APPLE_PRIVATE_KEY) {
      return oauthErrorRedirect("Apple sign-in is not configured");
    }
    const url = new URL(request.url);
    const code = body.code || url.searchParams.get("code") || "";
    const state = body.state || url.searchParams.get("state") || "";
    const error = body.error || url.searchParams.get("error") || "";
    if (error) return oauthErrorRedirect(`Apple sign-in failed: ${error}`);
    const oauthState = await db
      .prepare("SELECT * FROM oauth_states WHERE state = ? AND provider = 'apple' AND datetime(expires_at) > datetime('now') AND used_at IS NULL")
      .bind(state)
      .first();
    if (!code || !oauthState) return oauthErrorRedirect("Invalid Apple sign-in state");
    await safeRun(db, "UPDATE oauth_states SET used_at = CURRENT_TIMESTAMP WHERE state = ?", [state]);
    const clientSecret = await createAppleClientSecret(env);
    if (!clientSecret) return oauthErrorRedirect("Apple sign-in is missing a client secret");
    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.APPLE_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: oauthState.redirect_uri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenData.id_token) return oauthErrorRedirect("Apple token exchange failed");
    const appleProfile = await verifyAppleIdentityToken(tokenData.id_token, env.APPLE_CLIENT_ID);
    if (!appleProfile?.sub) return oauthErrorRedirect("Apple identity token could not be verified");
    let appleUser = {};
    if (body.user) {
      try {
        appleUser = JSON.parse(body.user);
      } catch {
        appleUser = {};
      }
    }
    const appleName = [appleUser?.name?.firstName, appleUser?.name?.lastName].filter(Boolean).join(" ");
    const linked = await createOrLinkOAuthUser(db, request, {
      provider: "apple",
      subject: appleProfile.sub,
      email: appleProfile.email || appleUser.email,
      name: appleName || appleProfile.email?.split("@")[0],
      picture: "",
    });
    if (linked.error) return oauthErrorRedirect(linked.error);
    return new Response(null, {
      status: 302,
      headers: {
        location: "/#app",
        "set-cookie": sessionCookie(linked.token),
      },
    });
  }

  if (method === "POST" && path === "/verify-email") {
    const limited = await enforceRateLimit(db, request, "verify-email", 10, 600);
    if (limited) return limited;
    const verification = await completeVerification(db, body.email, body.code, body.purpose || "");
    if (!verification) return json({ error: "Invalid or expired verification code" }, { status: 400 });
    return json({ ok: true, email: verification.email, purpose: verification.purpose });
  }

  if (method === "POST" && path === "/waitlist") {
    const limited = await enforceRateLimit(db, request, "waitlist", 8, 600);
    if (limited) return limited;
    const email = cleanText(body.email || "", 120).toLowerCase();
    const username = normalizeUsername(body.username || email.split("@")[0], "founder");
    const handle = `@${username}`;
    if (!isValidEmail(email)) return json({ error: "Valid email required" }, { status: 400 });
    const existingWaitlist = await db.prepare("SELECT username FROM waitlist WHERE email = ?").bind(email).first();
    if (existingWaitlist) {
      const existingUsername = existingWaitlist.username || username;
      const confirmation = await sendSignupReceivedEmail(db, env, email, {
        username: existingUsername,
        handle: `@${existingUsername}`,
        status: "Already received",
        nextStep: "You are already on the access list. We will keep you posted as access opens.",
      });
      const verification = await createEmailVerification(db, env, "early_access", email, {
        username: existingUsername,
        handle: `@${existingUsername}`,
      });
      return json({
        ok: true,
        username: `@${existingUsername}`,
        confirmationSent: Boolean(confirmation?.sent),
        confirmationQueued: Boolean(confirmation?.queued),
        verificationSent: Boolean(verification?.notification?.sent),
        verificationQueued: Boolean(verification?.notification?.queued),
      });
    }
    const taken = await db
      .prepare(
        `SELECT 1 FROM waitlist WHERE lower(username) = lower(?)
         UNION ALL
         SELECT 1 FROM users WHERE lower(handle) = lower(?)`
      )
      .bind(username, handle)
      .first();
    if (taken) return json({ error: "Username is already taken" }, { status: 409 });
    const result = await db.prepare("INSERT OR IGNORE INTO waitlist (email, username) VALUES (?, ?)").bind(email, username).run();
    if (result.meta?.changes) {
      await recordRegistrationEmail(db, "early_access", email, { username, handle });
      await sendOwnerNotification(db, env, "early_access", "New fear.social early access signup", {
        event: "Early access signup",
        email,
        username: handle,
      });
      const confirmation = await sendSignupReceivedEmail(db, env, email, {
        username,
        handle,
        status: "Received",
        nextStep: "You are on the access list. We will keep you posted as access opens.",
      });
      const verification = await createEmailVerification(db, env, "early_access", email, { username, handle });
      return json({
        ok: true,
        username: handle,
        confirmationSent: Boolean(confirmation?.sent),
        confirmationQueued: Boolean(confirmation?.queued),
        verificationSent: Boolean(verification?.notification?.sent),
        verificationQueued: Boolean(verification?.notification?.queued),
      });
    }
    const confirmation = await sendSignupReceivedEmail(db, env, email, {
      username,
      handle,
      status: "Received",
      nextStep: "You are on the access list. We will keep you posted as access opens.",
    });
    const verification = await createEmailVerification(db, env, "early_access", email, { username, handle });
    return json({
      ok: true,
      username: handle,
      confirmationSent: Boolean(confirmation?.sent),
      confirmationQueued: Boolean(confirmation?.queued),
      verificationSent: Boolean(verification?.notification?.sent),
      verificationQueued: Boolean(verification?.notification?.queued),
    });
  }

  const auth = await getOrCreateUser(db, env, request, body);
  if (auth.error) return json({ error: auth.error }, { status: auth.status || 409 });
  const { user, token } = auth;

  if (method === "GET" && path === "/bootstrap") {
    return json(
      { token, profile: await profileWithFollowerCount(db, user), ...(await getBootstrap(db, user)) },
      { headers: { "set-cookie": sessionCookie(token) } }
    );
  }

  if (method === "GET" && path === "/notifications") {
    const rows = await db
      .prepare(
        `SELECT id, actor_user_id, type, body, target_type, target_id, read_at, created_at
         FROM user_notifications
         WHERE user_id = ?
         ORDER BY datetime(created_at) DESC
         LIMIT 100`
      )
      .bind(user.id)
      .all();
    return json({ notifications: rows.results || [] });
  }

  if (method === "POST" && path === "/notifications/read") {
    await db.prepare("UPDATE user_notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL").bind(user.id).run();
    return json({ ok: true });
  }

  if (method === "PUT" && path === "/profile") {
    const limited = await enforceRateLimit(db, request, "profile-update", 20, 600);
    if (limited) return limited;
    const profile = normalizeProfile(body.profile);
    const shouldNotify = profile.email && profile.email !== user.email;
    const duplicate = profile.email
      ? await db.prepare("SELECT * FROM users WHERE id <> ? AND id <> 'demo-user' AND lower(email) = lower(?)").bind(user.id, profile.email).first()
      : null;
    const handleOwner = await db
      .prepare("SELECT id FROM users WHERE id <> ? AND id <> 'demo-user' AND lower(handle) = lower(?)")
      .bind(user.id, profile.handle)
      .first();
    if (handleOwner && (!duplicate || handleOwner.id !== duplicate.id)) {
      return json({ error: "Username is already taken" }, { status: 409 });
    }
    if (duplicate) return json({ error: "That email already belongs to another account" }, { status: 409 });
    const profileSafety = await rejectObjectionableContent(db, user.id, "profile", [profile.name, profile.headline, profile.bio, profile.lookingFor, profile.goal].join("\n"));
    if (profileSafety) return profileSafety;

    await db
      .prepare(
        `UPDATE users SET name = ?, handle = ?, email = ?, location = ?, industry = ?, stage = ?, bio = ?, privacy = ?, avatar_url = ?, cover_url = ?, headline = ?, website = ?, looking_for = ?, goal = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(profile.name, profile.handle, profile.email, profile.location, profile.industry, profile.stage, profile.bio, profile.privacy, profile.avatarUrl, profile.coverUrl, profile.headline, profile.website, profile.lookingFor, profile.goal, user.id)
      .run();
    if (shouldNotify) {
      await recordRegistrationEmail(db, "account_email_added", profile.email, {
        userId: user.id,
        name: profile.name,
        handle: profile.handle,
        username: profile.username,
        metadata: {
          location: profile.location,
          industry: profile.industry,
          stage: profile.stage,
        },
      });
      await sendOwnerNotification(db, env, "account_email_added", "New fear.social account email", {
        event: "Account email added",
        ...profile,
        userId: user.id,
        summary: formatProfileSummary(profile),
      });
      await createEmailVerification(db, env, "account_email_added", profile.email, profile);
    }
    return json({ token, profile: await profileWithFollowerCount(db, { ...user, ...profile }) });
  }

  if (method === "POST" && path === "/posts") {
    const limited = await enforceRateLimit(db, request, "posts", 20, 600);
    if (limited) return limited;
    const content = cleanText(body.content || "", 1200);
    const media = parseMediaList(body.media);
    if (!content && media.length === 0) return json({ error: "Write something or attach media before posting" }, { status: 400 });
    const postSafety = await rejectObjectionableContent(db, user.id, "post", content);
    if (postSafety) return postSafety;
    const id = createId("post");
    const tag = cleanText(body.tag || user.industry || "Exploring", 40);
    const type = cleanText(body.type || "Update", 40);
    const stage = cleanText(body.stage || "Building", 40);
    await db
      .prepare("INSERT INTO posts (id, user_id, type, tag, stage, content, media) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, user.id, type, tag, stage, content, JSON.stringify(media))
      .run();
    return json({ posts: await getPosts(db, user.id) }, { status: 201 });
  }

  if (method === "POST" && path === "/opportunities") {
    const limited = await enforceRateLimit(db, request, "opportunities", 12, 600);
    if (limited) return limited;
    const opportunity = normalizeOpportunity(body, user);
    if (opportunity.title.length < 4) return json({ error: "Opportunity title is required" }, { status: 400 });
    if (opportunity.company.length < 2) return json({ error: "Company or project name is required" }, { status: 400 });
    if (opportunity.desc.length < 18) return json({ error: "Opportunity description is too short" }, { status: 400 });
    const id = createId("opportunity");
    try {
      await db
        .prepare(
          `INSERT INTO opportunities (id, user_id, title, company, type, tag, budget, location, level, skills, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          id,
          user.id,
          opportunity.title,
          opportunity.company,
          opportunity.type,
          opportunity.tag,
          opportunity.budget,
          opportunity.location,
          opportunity.level,
          JSON.stringify(opportunity.skills),
          opportunity.desc
        )
        .run();
      return json({ opportunities: await getOpportunities(db) }, { status: 201 });
    } catch {
      return json({ error: "Opportunity storage is not ready yet" }, { status: 503 });
    }
  }

  const segments = path.split("/").filter(Boolean);

  if (method === "POST" && path === "/groups") {
    const limited = await enforceRateLimit(db, request, "groups", 10, 600);
    if (limited) return limited;
    const name = cleanText(body.name || "", 80);
    const description = cleanText(body.description || "", 500);
    if (name.length < 2) return json({ error: "Group name required" }, { status: 400 });
    const baseSlug = normalizeUsername(name, "group");
    const existing = await db.prepare("SELECT id FROM groups WHERE slug = ?").bind(baseSlug).first();
    const slug = existing ? `${baseSlug}-${crypto.randomUUID().slice(0, 6)}` : baseSlug;
    const id = createId("group");
    await db
      .prepare("INSERT INTO groups (id, name, slug, description, kind, visibility, owner_user_id) VALUES (?, ?, ?, ?, 'member', 'public', ?)")
      .bind(id, name, slug, description || `A focused room for ${name}.`, user.id)
      .run();
    await db.prepare("INSERT INTO group_members (group_id, user_id, role, status) VALUES (?, ?, 'admin', 'active')").bind(id, user.id).run();
    return json({ groups: await getGroups(db, user) }, { status: 201 });
  }

  if (method === "POST" && segments[0] === "groups" && segments[2] === "join") {
    const limited = await enforceRateLimit(db, request, "groups-join", 30, 600);
    if (limited) return limited;
    const groupId = segments[1];
    const group = await db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first();
    if (!group) return json({ error: "Group not found" }, { status: 404 });
    await db.prepare("INSERT OR REPLACE INTO group_members (group_id, user_id, role, status) VALUES (?, ?, COALESCE((SELECT role FROM group_members WHERE group_id = ? AND user_id = ?), 'member'), 'active')").bind(groupId, user.id, groupId, user.id).run();
    await safeRun(db, "UPDATE group_invites SET status = 'accepted', responded_at = CURRENT_TIMESTAMP WHERE group_id = ? AND invitee_user_id = ?", [groupId, user.id]);
    return json({ groups: await getGroups(db, user) });
  }

  if (method === "POST" && segments[0] === "groups" && segments[2] === "leave") {
    const limited = await enforceRateLimit(db, request, "groups-leave", 30, 600);
    if (limited) return limited;
    const groupId = segments[1];
    const group = await db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first();
    if (!group) return json({ error: "Group not found" }, { status: 404 });
    await db.prepare("UPDATE group_members SET status = 'left' WHERE group_id = ? AND user_id = ?").bind(groupId, user.id).run();
    await safeRun(db, "UPDATE group_invites SET status = 'declined', responded_at = CURRENT_TIMESTAMP WHERE group_id = ? AND invitee_user_id = ?", [groupId, user.id]);
    return json({ groups: await getGroups(db, user) });
  }

  if (method === "POST" && segments[0] === "groups" && segments[2] === "invite") {
    const limited = await enforceRateLimit(db, request, "groups-invite", 15, 600);
    if (limited) return limited;
    const groupId = segments[1];
    const group = await db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first();
    if (!group) return json({ error: "Group not found" }, { status: 404 });
    const membership = await db.prepare("SELECT role, status FROM group_members WHERE group_id = ? AND user_id = ?").bind(groupId, user.id).first();
    const canInvite = membership?.status === "active" && (membership.role === "admin" || group.owner_user_id === user.id || isAdminUser(user));
    if (!canInvite) return json({ error: "Only group admins can invite members" }, { status: 403 });
    const userIds = Array.isArray(body.userIds) ? body.userIds : [body.userId].filter(Boolean);
    const uniqueIds = [...new Set(userIds.map((id) => String(id || "").trim()).filter((id) => id && id !== user.id))].slice(0, 12);
    if (uniqueIds.length === 0) return json({ error: "Choose at least one person to invite" }, { status: 400 });
    for (const inviteeId of uniqueIds) {
      const invitee = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND id = ?").bind(inviteeId).first();
      if (!invitee) continue;
      await safeRun(db, "INSERT OR IGNORE INTO group_invites (id, group_id, inviter_user_id, invitee_user_id, status) VALUES (?, ?, ?, ?, 'pending')", [createId("group_invite"), groupId, user.id, inviteeId]);
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), inviteeId, user.id, "group_invite", `${user.name} invited you to ${group.name}.`, "group", groupId]
      );
    }
    return json({ groups: await getGroups(db, user), notifications: await getNotifications(db, user.id) });
  }

  if (method === "POST" && segments[0] === "groups" && segments[2] === "announcements") {
    const limited = await enforceRateLimit(db, request, "groups-announcements", 12, 600);
    if (limited) return limited;
    const groupId = segments[1];
    const group = await db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first();
    if (!group) return json({ error: "Group not found" }, { status: 404 });
    const membership = await db.prepare("SELECT role, status FROM group_members WHERE group_id = ? AND user_id = ?").bind(groupId, user.id).first();
    const member = membership?.status === "active";
    const official = group.id === FEAR_GROUP_ID || group.kind === "official";
    const canAnnounce = member && (official ? isAdminUser(user) : membership.role === "admin" || group.owner_user_id === user.id || isAdminUser(user));
    if (!canAnnounce) return json({ error: "Only group admins can post announcements" }, { status: 403 });
    const title = cleanText(body.title || "", 100);
    const text = cleanText(body.body || body.text || "", 1200);
    if (!title || !text) return json({ error: "Announcement title and body required" }, { status: 400 });
    await db.prepare("INSERT INTO group_announcements (id, group_id, user_id, title, body) VALUES (?, ?, ?, ?, ?)").bind(createId("group_announcement"), groupId, user.id, title, text).run();
    const members = await db.prepare("SELECT user_id FROM group_members WHERE group_id = ? AND status = 'active' AND user_id <> ? LIMIT 200").bind(groupId, user.id).all();
    for (const memberRow of members.results || []) {
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), memberRow.user_id, user.id, "group_announcement", `${group.name}: ${title}`, "group", groupId]
      );
    }
    return json({ groups: await getGroups(db, user), notifications: await getNotifications(db, user.id) });
  }

  if (method === "POST" && segments[0] === "posts" && segments[2] === "comments") {
    const limited = await enforceRateLimit(db, request, "comments", 30, 600);
    if (limited) return limited;
    const postId = cleanText(segments[1] || "", 120);
    const postOwner = await db.prepare("SELECT user_id FROM posts WHERE id = ?").bind(postId).first();
    if (!postOwner) return json({ error: "Post not found" }, { status: 404 });
    const text = cleanText(body.text || "", 600);
    if (!text) return json({ error: "Comment text required" }, { status: 400 });
    const commentSafety = await rejectObjectionableContent(db, user.id, "comment", text);
    if (commentSafety) return commentSafety;
    await db
      .prepare("INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?)")
      .bind(createId("comment"), postId, user.id, text)
      .run();
    if (postOwner?.user_id && postOwner.user_id !== user.id) {
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), postOwner.user_id, user.id, "comment", `${user.name} commented on your post.`, "post", postId]
      );
    }
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "PUT" && segments[0] === "posts" && segments[1]) {
    const limited = await enforceRateLimit(db, request, "posts-edit", 30, 600);
    if (limited) return limited;
    const postId = segments[1];
    const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(postId).first();
    if (!post) return json({ error: "Post not found" }, { status: 404 });
    if (post.user_id !== user.id) return json({ error: "You can only edit your own posts" }, { status: 403 });
    const content = cleanText(body.content || "", 1200);
    const media = body.media === undefined ? parseMediaList(post.media) : parseMediaList(body.media);
    if (!content && media.length === 0) return json({ error: "Post needs text or media" }, { status: 400 });
    const editSafety = await rejectObjectionableContent(db, user.id, "post", content);
    if (editSafety) return editSafety;
    const type = cleanText(body.type || post.type || "Update", 40);
    const tag = cleanText(body.tag || post.tag || user.industry || "Exploring", 40);
    const stage = cleanText(body.stage || post.stage || "Building", 40);
    await db
      .prepare("UPDATE posts SET content = ?, type = ?, tag = ?, stage = ?, media = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
      .bind(content, type, tag, stage, JSON.stringify(media), postId, user.id)
      .run();
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "DELETE" && segments[0] === "posts" && segments[1]) {
    const limited = await enforceRateLimit(db, request, "posts-delete", 20, 600);
    if (limited) return limited;
    const postId = segments[1];
    const post = await db.prepare("SELECT user_id FROM posts WHERE id = ?").bind(postId).first();
    if (!post) return json({ error: "Post not found" }, { status: 404 });
    if (post.user_id !== user.id) return json({ error: "You can only delete your own posts" }, { status: 403 });
    await safeRun(db, "DELETE FROM comments WHERE post_id = ?", [postId]);
    await safeRun(db, "DELETE FROM post_reactions WHERE post_id = ?", [postId]);
    await safeRun(db, "DELETE FROM user_notifications WHERE target_type = 'post' AND target_id = ?", [postId]);
    await db.prepare("DELETE FROM posts WHERE id = ? AND user_id = ?").bind(postId, user.id).run();
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "POST" && segments[0] === "posts" && (segments[2] === "like" || segments[2] === "save")) {
    const limited = await enforceRateLimit(db, request, "posts-react", 90, 600);
    if (limited) return limited;
    const postId = cleanText(segments[1] || "", 120);
    const post = await db.prepare("SELECT user_id FROM posts WHERE id = ?").bind(postId).first();
    if (!post) return json({ error: "Post not found" }, { status: 404 });
    const kind = segments[2] === "like" ? "like" : "save";
    const existing = await db
      .prepare("SELECT 1 FROM post_reactions WHERE post_id = ? AND user_id = ? AND kind = ?")
      .bind(postId, user.id, kind)
      .first();
    if (existing) {
      await db.prepare("DELETE FROM post_reactions WHERE post_id = ? AND user_id = ? AND kind = ?").bind(postId, user.id, kind).run();
    } else {
      await db.prepare("INSERT INTO post_reactions (post_id, user_id, kind) VALUES (?, ?, ?)").bind(postId, user.id, kind).run();
      if (kind === "like" && post.user_id && post.user_id !== user.id) {
        await safeRun(
          db,
          "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [createId("notification"), post.user_id, user.id, "like", `${user.name} liked your post.`, "post", postId]
        );
      }
    }
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "POST" && segments[0] === "people" && segments[2] === "connect") {
    const limited = await enforceRateLimit(db, request, "people-connect", 60, 600);
    if (limited) return limited;
    const targetUserId = segments[1];
    if (!targetUserId || targetUserId === user.id) return json({ error: "Invalid user" }, { status: 400 });
    const target = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND id = ? AND COALESCE(privacy, 'public') = 'public'").bind(targetUserId).first();
    if (!target) return json({ error: "User not found" }, { status: 404 });
    const connected = await toggleRow(db, "user_connections", user.id, "target_user_id", targetUserId);
    if (connected) {
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), targetUserId, user.id, "follow", `${user.name} followed you.`, "user", user.id]
      );
    }
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "people" && segments[2] === "block") {
    const limited = await enforceRateLimit(db, request, "people-block", 30, 600);
    if (limited) return limited;
    const targetUserId = segments[1];
    if (!targetUserId || targetUserId === user.id) return json({ error: "Invalid user" }, { status: 400 });
    const target = await db.prepare("SELECT id FROM users WHERE id <> 'demo-user' AND id = ?").bind(targetUserId).first();
    if (!target) return json({ error: "User not found" }, { status: 404 });
    await db.prepare("INSERT OR IGNORE INTO user_blocks (user_id, blocked_user_id) VALUES (?, ?)").bind(user.id, targetUserId).run();
    await safeRun(db, "DELETE FROM user_connections WHERE (user_id = ? AND target_user_id = ?) OR (user_id = ? AND target_user_id = ?)", [
      user.id,
      targetUserId,
      targetUserId,
      user.id,
    ]);
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "people" && segments[2] === "message") {
    const limited = await enforceRateLimit(db, request, "people-message", 30, 600);
    if (limited) return limited;
    const targetUserId = segments[1];
    const text = cleanText(body.text || "", 800);
    if (!targetUserId || targetUserId === user.id) return json({ error: "Invalid user" }, { status: 400 });
    const target = await db.prepare("SELECT id, name FROM users WHERE id <> 'demo-user' AND id = ?").bind(targetUserId).first();
    if (!target) return json({ error: "User not found" }, { status: 404 });
    let conversation = await db
      .prepare(
        `SELECT id FROM conversations
         WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)
         LIMIT 1`
      )
      .bind(user.id, targetUserId, targetUserId, user.id)
      .first();
    if (!conversation) {
      const result = await db
        .prepare("INSERT INTO conversations (name, av, online, user_a_id, user_b_id, updated_at) VALUES (?, ?, 0, ?, ?, CURRENT_TIMESTAMP)")
        .bind(target.name, initials(target.name), user.id, targetUserId)
        .run();
      const created = await db
        .prepare(
          `SELECT id FROM conversations
           WHERE user_a_id = ? AND user_b_id = ?
           ORDER BY id DESC LIMIT 1`
        )
        .bind(user.id, targetUserId)
        .first();
      conversation = { id: result?.meta?.last_row_id || created?.id };
    }
    if (text) {
      const messageSafety = await rejectObjectionableContent(db, user.id, "message", text);
      if (messageSafety) return messageSafety;
      await db
        .prepare("INSERT INTO messages (id, conversation_id, user_id, text, author) VALUES (?, ?, ?, ?, 'you')")
        .bind(createId("message"), Number(conversation.id), user.id, text)
        .run();
      await safeRun(db, "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [Number(conversation.id)]);
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), targetUserId, user.id, "message", `${user.name} sent you a message.`, "conversation", String(conversation.id)]
      );
    }
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && path === "/reports") {
    const limited = await enforceRateLimit(db, request, "reports", 15, 600);
    if (limited) return limited;
    const targetType = cleanText(body.targetType || "", 40);
    const targetId = cleanText(body.targetId || "", 120);
    const reason = cleanText(body.reason || "", 600);
    const allowedReportTargets = new Set(["post", "comment", "user", "media", "message", "chat_thread", "group", "opportunity", "auto_filter"]);
    if (!allowedReportTargets.has(targetType)) return json({ error: "Unsupported report target" }, { status: 400 });
    if (!targetType || !targetId || !reason) return json({ error: "Report target and reason required" }, { status: 400 });
    await db
      .prepare("INSERT INTO content_reports (id, reporter_user_id, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)")
      .bind(createId("report"), user.id, targetType, targetId, reason)
      .run();
    await sendOwnerNotification(db, env, "content_report", "fear.social content report", {
      reporter: user.handle,
      targetType,
      targetId,
      reason,
      priority: "Review and act within 24 hours",
    });
    return json({ ok: true, moderationSlaHours: 24 });
  }

  if (method === "POST" && path === "/media") {
    const limited = await enforceRateLimit(db, request, "media", 20, 600);
    if (limited) return limited;
    const kind = body.kind === "video" ? "video" : "image";
    const url = cleanMediaUrl(body.url || "", kind, MAX_MEDIA_URL_BYTES);
    const alt = cleanText(body.alt || "", 240);
    if (!url || !isSafeHttpUrl(url, { max: MAX_MEDIA_URL_BYTES })) return json({ error: "A secure hosted media URL is required" }, { status: 400 });
    const id = createId("media");
    await db.prepare("INSERT INTO media_assets (id, user_id, kind, url, alt) VALUES (?, ?, ?, ?, ?)").bind(id, user.id, kind, url, alt).run();
    return json({ ok: true, media: { id, kind, url, alt } }, { status: 201 });
  }

  if (method === "POST" && path === "/notifications/read") {
    const id = String(body.id || "").trim();
    if (id) {
      await safeRun(db, "UPDATE user_notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", [id, user.id]);
    } else {
      await safeRun(db, "UPDATE user_notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL", [user.id]);
    }
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "events" && segments[2] === "rsvp") {
    const limited = await enforceRateLimit(db, request, "events-rsvp", 60, 600);
    if (limited) return limited;
    const eventId = Number(segments[1]);
    if (!Number.isFinite(eventId)) return json({ error: "Invalid event" }, { status: 400 });
    const event = await db.prepare("SELECT id FROM events WHERE id = ?").bind(eventId).first();
    if (!event) return json({ error: "Event not found" }, { status: 404 });
    await toggleRow(db, "event_rsvps", user.id, "event_id", eventId);
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "mentors" && segments[2] === "request") {
    const limited = await enforceRateLimit(db, request, "mentors-request", 30, 600);
    if (limited) return limited;
    const mentorId = cleanText(segments[1] || "", 120);
    const mentor = await db.prepare("SELECT id FROM mentors WHERE id = ?").bind(mentorId).first();
    if (!mentor) return json({ error: "Mentor not found" }, { status: 404 });
    await toggleRow(db, "mentor_requests", user.id, "mentor_id", mentorId);
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "messages" && segments[2] === "send") {
    const limited = await enforceRateLimit(db, request, "messages-send", 40, 600);
    if (limited) return limited;
    const text = cleanText(body.text || "", 800);
    if (!text) return json({ error: "Message text required" }, { status: 400 });
    const messageSafety = await rejectObjectionableContent(db, user.id, "message", text);
    if (messageSafety) return messageSafety;
    const conversation = await db.prepare("SELECT * FROM conversations WHERE id = ?").bind(Number(segments[1])).first();
    if (!conversation) return json({ error: "Conversation not found" }, { status: 404 });
    if (!conversation.user_a_id || !conversation.user_b_id || (conversation.user_a_id !== user.id && conversation.user_b_id !== user.id)) {
      return json({ error: "Conversation access denied" }, { status: 403 });
    }
    await db
      .prepare("INSERT INTO messages (id, conversation_id, user_id, text, author) VALUES (?, ?, ?, ?, 'you')")
      .bind(createId("message"), Number(segments[1]), user.id, text)
      .run();
    await safeRun(db, "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [Number(segments[1])]);
    const targetUserId = conversation.user_a_id === user.id ? conversation.user_b_id : conversation.user_a_id;
    if (targetUserId) {
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), targetUserId, user.id, "message", `${user.name} sent you a message.`, "conversation", String(segments[1])]
      );
    }
    return json(await getBootstrap(db, user));
  }

  return json({ error: "Not found" }, { status: 404 });
}

export const onRequest = async (context) => {
  const requestId = crypto.randomUUID();
  try {
    return await handleRequest(context);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unhandled API error", { requestId, message: error?.message, stack: error?.stack });
    return json({ error: "Server error", requestId }, { status: 500 });
  }
};
