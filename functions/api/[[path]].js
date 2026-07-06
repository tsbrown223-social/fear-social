const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });

const readJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};

const readForm = async (request) => {
  try {
    const text = await request.text();
    return Object.fromEntries(new URLSearchParams(text));
  } catch {
    return {};
  }
};

const createId = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const CONTACT_EMAIL = "contact@fear.social";
const DEFAULT_EMAIL_FROM = `fear.social <${CONTACT_EMAIL}>`;
const NOTIFICATION_EMAIL = CONTACT_EMAIL;
const SESSION_TTL_DAYS = 30;
const TERMS_VERSION = "2026-07-06";
const FEAR_GROUP_ID = "fear-official";

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
    return toHex(bits) === digest;
  }
  const [scheme, salt, digest] = parts;
  if (scheme === "sha256" && salt && digest) return (await sha256(`${salt}:${password}`)) === digest;
  return false;
}

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

const requireDb = (env) => {
  if (!env.DB) {
    throw new Response(JSON.stringify({ error: "D1 database binding DB is missing" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return env.DB;
};

const normalizeProfile = (profile = {}) => {
  const name = String(profile.name || "Your Name").trim().slice(0, 80) || "Your Name";
  const username = normalizeUsername(profile.username || profile.handle, name);
  const handle = `@${username}`;
  const website = String(profile.website || "").trim().slice(0, 180);
  return {
    id: String(profile.id || "").trim(),
    name,
    username,
    handle,
    email: String(profile.email || "").trim().slice(0, 120),
    location: String(profile.location || "").trim().slice(0, 80),
    industry: String(profile.industry || "Exploring").trim().slice(0, 40),
    stage: String(profile.stage || "I'm actively building").trim().slice(0, 80),
    bio: String(profile.bio || "Building in public, meeting ambitious founders, and turning fear into useful momentum.").trim().slice(0, 400),
    privacy: ["public", "private"].includes(profile.privacy) ? profile.privacy : "public",
    avatarUrl: String(profile.avatarUrl || profile.avatar_url || "").trim().slice(0, 250000),
    coverUrl: String(profile.coverUrl || profile.cover_url || "").trim().slice(0, 250000),
    headline: String(profile.headline || "").trim().slice(0, 140),
    website: /^https?:\/\//i.test(website) ? website : website ? `https://${website}` : "",
    lookingFor: String(profile.lookingFor || profile.looking_for || "").trim().slice(0, 160),
    goal: String(profile.goal || "").trim().slice(0, 160),
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
  const normalizedEmail = String(email || "").trim().toLowerCase().slice(0, 120);
  if (!normalizedEmail || !normalizedEmail.includes("@")) return null;

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
  const normalizedEmail = String(email || "").trim().toLowerCase().slice(0, 120);
  if (!normalizedEmail || !normalizedEmail.includes("@")) return null;
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
  const normalizedEmail = String(email || "").trim().toLowerCase().slice(0, 120);
  if (!normalizedEmail || !normalizedEmail.includes("@")) return null;

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
  const existing = await db.prepare("SELECT * FROM users WHERE token = ?").bind(token).first();
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
  const email = String(profile.email || "").trim().toLowerCase().slice(0, 120);
  if (!email || !email.includes("@")) return { error: `${providerLabel} account did not provide a valid email`, status: 400 };
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
        String(profile.picture || "").slice(0, 500)
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
      String(profile.picture || "").slice(0, 500),
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
    return parsed
      .map((item) => ({
        id: String(item?.id || createId("media")),
        kind: item?.kind === "video" ? "video" : "image",
        url: String(item?.url || "").trim(),
        alt: String(item?.alt || "").slice(0, 160),
      }))
      .filter((item) => item.url && item.url.length <= 5500000 && (/^https:\/\//.test(item.url) || /^data:(image|video)\//.test(item.url)))
      .slice(0, 4);
  } catch {
    return [];
  }
};

async function getPosts(db, userId) {
  const posts = await db
    .prepare(
      `SELECT p.*, u.id AS user_id, u.name AS user_name, u.handle, u.avatar_url AS user_avatar_url,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.kind = 'like') AS likes,
        EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = ? AND pr.kind = 'like') AS liked,
        EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = ? AND pr.kind = 'save') AS saved,
        EXISTS(SELECT 1 FROM user_connections c WHERE c.user_id = ? AND c.target_user_id = p.user_id) AS following_author
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY datetime(p.created_at) DESC`
    )
    .bind(userId, userId, userId)
    .all();

  const comments = await db
    .prepare(
      `SELECT c.*, u.id AS user_id, u.name AS user_name, u.handle, u.avatar_url AS user_avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       ORDER BY datetime(c.created_at) ASC`
    )
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
  }));
}

async function profileWithFollowerCount(db, user) {
  const row = await db
    .prepare("SELECT COUNT(*) AS followers FROM user_connections WHERE target_user_id = ?")
    .bind(user.id)
    .first();
  return { ...normalizeProfile(user), followers: Number(row?.followers || 0) };
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
      `SELECT n.*, u.name AS actor_name, u.handle AS actor_handle, u.avatar_url AS actor_avatar_url
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
        }
      : null,
  }));
}

async function getBootstrap(db, user) {
  const userId = user.id;
  const [posts, people, events, mentors, conversations, stats, notifications, groups] = await Promise.all([
    getPosts(db, userId),
    db
      .prepare(
        `SELECT u.id, u.name, u.handle, u.stage, u.industry, u.location AS loc, u.bio, u.avatar_url, u.cover_url,
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
          other.avatar_url AS other_avatar_url, other.last_seen_at AS other_last_seen_at
         FROM conversations c
         LEFT JOIN users other ON other.id = CASE
           WHEN c.user_a_id = ? THEN c.user_b_id
           WHEN c.user_b_id = ? THEN c.user_a_id
           ELSE NULL
         END
         WHERE c.user_a_id IS NULL OR c.user_b_id IS NULL OR c.user_a_id = ? OR c.user_b_id = ?
         ORDER BY datetime(COALESCE(c.updated_at, '1970-01-01')) DESC, c.id DESC`
      )
      .bind(userId, userId, userId, userId)
      .all(),
    getStats(db),
    getNotifications(db, userId),
    getGroups(db, user),
  ]);

  const messages = await db
    .prepare(
      `SELECT m.*
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_a_id IS NULL OR c.user_b_id IS NULL OR c.user_a_id = ? OR c.user_b_id = ?
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
      online: Boolean(conversation.online),
      thread: messageGroups.get(conversation.id) || [],
      draft: "",
    })),
    stats,
    notifications,
    groups,
    unreadNotifications: notifications.filter((notification) => !notification.read).length,
  };
}

async function completeVerification(db, email, code, purpose = "") {
  const normalizedEmail = String(email || "").trim().toLowerCase().slice(0, 120);
  const normalizedCode = String(code || "").trim();
  if (!normalizedEmail || !normalizedEmail.includes("@") || !/^\d{6}$/.test(normalizedCode)) return null;
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
  const normalizedEmail = String(email || "").trim().toLowerCase().slice(0, 120);
  const normalizedCode = String(code || "").trim();
  if (!normalizedEmail || !normalizedEmail.includes("@") || !/^\d{6}$/.test(normalizedCode)) return null;
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
  const clean = String(identifier || "").trim().toLowerCase().replace(/^@/, "").slice(0, 120);
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

  if (method === "GET" && path === "/stats") {
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
    const identifier = String(body.identifier || body.email || "").trim().toLowerCase().replace(/^@/, "").slice(0, 120);
    const identifiedUser = !String(body.email || "").includes("@") ? await findUserByIdentifier(db, identifier) : null;
    const email = String(body.email || identifiedUser?.email || "").trim().toLowerCase().slice(0, 120);
    const username = normalizeUsername(body.username || email.split("@")[0], "founder");
    if (!email || !email.includes("@")) return json({ error: "Valid email required" }, { status: 400 });
    const existing = await db.prepare("SELECT handle FROM users WHERE id <> 'demo-user' AND lower(email) = lower(?)").bind(email).first();
    const purpose = ["login", "password"].includes(body.purpose) ? body.purpose : "login";
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

  if (method === "POST" && path === "/auth/login") {
    const limited = await enforceRateLimit(db, request, "auth-login", 8, 600);
    if (limited) return limited;
    const identifier = String(body.identifier || "").trim().toLowerCase().replace(/^@/, "").slice(0, 120);
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
    const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
    const password = String(body.password || "");
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
    const identifier = String(body.identifier || body.email || "").trim().toLowerCase().replace(/^@/, "").slice(0, 120);
    const user = await findUserByIdentifier(db, identifier);
    const email = String(body.email || user?.email || "").trim().toLowerCase().slice(0, 120);
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
    const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
    const username = normalizeUsername(body.username || email.split("@")[0], "founder");
    const handle = `@${username}`;
    if (!email || !email.includes("@")) return json({ error: "Valid email required" }, { status: 400 });
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
    if (duplicate) {
      const mergedProfile = normalizeProfile({ ...duplicate, ...profile });
      await db
        .prepare(
          `UPDATE users SET name = ?, handle = ?, email = ?, location = ?, industry = ?, stage = ?, bio = ?, privacy = ?, avatar_url = ?, cover_url = ?, headline = ?, website = ?, looking_for = ?, goal = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .bind(
          mergedProfile.name,
          mergedProfile.handle,
          mergedProfile.email,
          mergedProfile.location,
          mergedProfile.industry,
          mergedProfile.stage,
          mergedProfile.bio,
          mergedProfile.privacy,
          mergedProfile.avatarUrl,
          mergedProfile.coverUrl,
          mergedProfile.headline,
          mergedProfile.website,
          mergedProfile.lookingFor,
          mergedProfile.goal,
          duplicate.id
        )
        .run();
      if (!user.email && user.id !== duplicate.id) {
        await db.prepare("DELETE FROM users WHERE id = ?").bind(user.id).run();
      }
      return json({ token: duplicate.token, profile: await profileWithFollowerCount(db, { ...duplicate, ...mergedProfile }) });
    }

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
    const content = String(body.content || "").trim().slice(0, 1200);
    const media = parseMediaList(body.media);
    if (!content && media.length === 0) return json({ error: "Write something or attach media before posting" }, { status: 400 });
    const id = createId("post");
    const tag = String(body.tag || user.industry || "Exploring").slice(0, 40);
    const type = String(body.type || "Update").slice(0, 40);
    const stage = String(body.stage || "Building").slice(0, 40);
    await db
      .prepare("INSERT INTO posts (id, user_id, type, tag, stage, content, media) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, user.id, type, tag, stage, content, JSON.stringify(media))
      .run();
    return json({ posts: await getPosts(db, user.id) }, { status: 201 });
  }

  const segments = path.split("/").filter(Boolean);

  if (method === "POST" && path === "/groups") {
    const limited = await enforceRateLimit(db, request, "groups", 10, 600);
    if (limited) return limited;
    const name = String(body.name || "").trim().slice(0, 80);
    const description = String(body.description || "").trim().slice(0, 500);
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
    const groupId = segments[1];
    const group = await db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first();
    if (!group) return json({ error: "Group not found" }, { status: 404 });
    await db.prepare("INSERT OR REPLACE INTO group_members (group_id, user_id, role, status) VALUES (?, ?, COALESCE((SELECT role FROM group_members WHERE group_id = ? AND user_id = ?), 'member'), 'active')").bind(groupId, user.id, groupId, user.id).run();
    await safeRun(db, "UPDATE group_invites SET status = 'accepted', responded_at = CURRENT_TIMESTAMP WHERE group_id = ? AND invitee_user_id = ?", [groupId, user.id]);
    return json({ groups: await getGroups(db, user) });
  }

  if (method === "POST" && segments[0] === "groups" && segments[2] === "invite") {
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
    const groupId = segments[1];
    const group = await db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first();
    if (!group) return json({ error: "Group not found" }, { status: 404 });
    const membership = await db.prepare("SELECT role, status FROM group_members WHERE group_id = ? AND user_id = ?").bind(groupId, user.id).first();
    const member = membership?.status === "active";
    const official = group.id === FEAR_GROUP_ID || group.kind === "official";
    const canAnnounce = member && (official ? isAdminUser(user) : membership.role === "admin" || group.owner_user_id === user.id || isAdminUser(user));
    if (!canAnnounce) return json({ error: "Only group admins can post announcements" }, { status: 403 });
    const title = String(body.title || "").trim().slice(0, 100);
    const text = String(body.body || body.text || "").trim().slice(0, 1200);
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
    const text = String(body.text || "").trim().slice(0, 600);
    if (!text) return json({ error: "Comment text required" }, { status: 400 });
    await db
      .prepare("INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?)")
      .bind(createId("comment"), segments[1], user.id, text)
      .run();
    const postOwner = await db.prepare("SELECT user_id FROM posts WHERE id = ?").bind(segments[1]).first();
    if (postOwner?.user_id && postOwner.user_id !== user.id) {
      await safeRun(
        db,
        "INSERT INTO user_notifications (id, user_id, actor_user_id, type, body, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [createId("notification"), postOwner.user_id, user.id, "comment", `${user.name} commented on your post.`, "post", segments[1]]
      );
    }
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "PUT" && segments[0] === "posts" && segments[1]) {
    const postId = segments[1];
    const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(postId).first();
    if (!post) return json({ error: "Post not found" }, { status: 404 });
    if (post.user_id !== user.id) return json({ error: "You can only edit your own posts" }, { status: 403 });
    const content = String(body.content || "").trim().slice(0, 1200);
    const media = body.media === undefined ? parseMediaList(post.media) : parseMediaList(body.media);
    if (!content && media.length === 0) return json({ error: "Post needs text or media" }, { status: 400 });
    const type = String(body.type || post.type || "Update").slice(0, 40);
    const tag = String(body.tag || post.tag || user.industry || "Exploring").slice(0, 40);
    const stage = String(body.stage || post.stage || "Building").slice(0, 40);
    await db
      .prepare("UPDATE posts SET content = ?, type = ?, tag = ?, stage = ?, media = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
      .bind(content, type, tag, stage, JSON.stringify(media), postId, user.id)
      .run();
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "DELETE" && segments[0] === "posts" && segments[1]) {
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
    const kind = segments[2] === "like" ? "like" : "save";
    const existing = await db
      .prepare("SELECT 1 FROM post_reactions WHERE post_id = ? AND user_id = ? AND kind = ?")
      .bind(segments[1], user.id, kind)
      .first();
    if (existing) {
      await db.prepare("DELETE FROM post_reactions WHERE post_id = ? AND user_id = ? AND kind = ?").bind(segments[1], user.id, kind).run();
    } else {
      await db.prepare("INSERT INTO post_reactions (post_id, user_id, kind) VALUES (?, ?, ?)").bind(segments[1], user.id, kind).run();
    }
    return json({ posts: await getPosts(db, user.id) });
  }

  if (method === "POST" && segments[0] === "people" && segments[2] === "connect") {
    const targetUserId = segments[1];
    if (!targetUserId || targetUserId === user.id) return json({ error: "Invalid user" }, { status: 400 });
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
    const targetUserId = segments[1];
    if (!targetUserId || targetUserId === user.id) return json({ error: "Invalid user" }, { status: 400 });
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
    const targetUserId = segments[1];
    const text = String(body.text || "").trim().slice(0, 800);
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
    const targetType = String(body.targetType || "").trim().slice(0, 40);
    const targetId = String(body.targetId || "").trim().slice(0, 120);
    const reason = String(body.reason || "").trim().slice(0, 600);
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
    });
    return json({ ok: true });
  }

  if (method === "POST" && path === "/media") {
    const url = String(body.url || "").trim().slice(0, 500);
    const kind = String(body.kind || "image").trim().slice(0, 40);
    const alt = String(body.alt || "").trim().slice(0, 240);
    if (!/^https:\/\//.test(url)) return json({ error: "A secure media URL is required" }, { status: 400 });
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
    await toggleRow(db, "event_rsvps", user.id, "event_id", Number(segments[1]));
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "mentors" && segments[2] === "request") {
    await toggleRow(db, "mentor_requests", user.id, "mentor_id", segments[1]);
    return json(await getBootstrap(db, user));
  }

  if (method === "POST" && segments[0] === "messages" && segments[2] === "send") {
    const text = String(body.text || "").trim().slice(0, 800);
    if (!text) return json({ error: "Message text required" }, { status: 400 });
    const conversation = await db.prepare("SELECT * FROM conversations WHERE id = ?").bind(Number(segments[1])).first();
    if (!conversation) return json({ error: "Conversation not found" }, { status: 404 });
    if (conversation.user_a_id && conversation.user_b_id && conversation.user_a_id !== user.id && conversation.user_b_id !== user.id) {
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
  try {
    return await handleRequest(context);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unhandled API error", error);
    return json({ error: "Server error" }, { status: 500 });
  }
};
