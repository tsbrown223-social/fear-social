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

const createId = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const NOTIFICATION_EMAIL = "tsbrown223@gmail.com";

const createVerificationCode = () => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
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
  return {
    name,
    username,
    handle,
    email: String(profile.email || "").trim().slice(0, 120),
    location: String(profile.location || "Denver, CO").trim().slice(0, 80),
    industry: String(profile.industry || "Tech").trim().slice(0, 40),
    stage: String(profile.stage || "I'm actively building").trim().slice(0, 80),
    bio: String(profile.bio || "Building in public, meeting ambitious founders, and turning fear into useful momentum.").trim().slice(0, 400),
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
    `Bio: ${profile.bio || ""}`,
  ].join("\n");

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

async function sendOwnerNotification(db, env, type, subject, payload) {
  const recipient = env.NOTIFICATION_EMAIL || NOTIFICATION_EMAIL;
  const logId = await recordNotification(db, type, recipient, subject, payload);

  if (!env.RESEND_API_KEY) {
    await updateNotification(db, logId, "queued", "", "RESEND_API_KEY is not configured in Cloudflare Pages secrets.");
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
      from: env.EMAIL_FROM || "fear.social <notifications@fear.social>",
      to: recipient,
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

  const notification = await sendOwnerNotification(db, env, "email_verification", "fear.social email verification code", {
    event: "Email verification requested",
    purpose,
    email: normalizedEmail,
    username: handle,
    verificationCode: code,
    expiresAt,
  });

  if (notification?.logId) {
    try {
      await db
        .prepare("UPDATE email_verifications SET notification_id = ? WHERE id = ?")
        .bind(notification.logId, id)
        .run();
    } catch (err) {
      console.warn("email verification notification link failed", err);
    }
  }

  return { id, code, expiresAt, notification };
}

async function getOrCreateUser(db, env, request, body = {}) {
  const token = request.headers.get("x-fear-token") || body.token || crypto.randomUUID();
  const existing = await db.prepare("SELECT * FROM users WHERE token = ?").bind(token).first();
  if (existing) return { user: existing, token, created: false };

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
  await db
    .prepare(
      `INSERT INTO users (id, token, name, handle, email, location, industry, stage, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, token, profile.name, profile.handle, profile.email, profile.location, profile.industry, profile.stage, profile.bio)
      .run();

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
    token,
    created: true,
  };
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

async function getPosts(db, userId) {
  const posts = await db
    .prepare(
      `SELECT p.*, u.name AS user_name, u.handle,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.kind = 'like') AS likes,
        EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = ? AND pr.kind = 'like') AS liked,
        EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = ? AND pr.kind = 'save') AS saved
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY datetime(p.created_at) DESC`
    )
    .bind(userId, userId)
    .all();

  const comments = await db
    .prepare(
      `SELECT c.*, u.name AS user_name
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
      user: comment.user_name,
      av: initials(comment.user_name),
      text: comment.text,
      time: timeAgo(comment.created_at),
    });
    grouped.set(comment.post_id, list);
  }

  return (posts.results || []).map((post) => ({
    id: post.id,
    user: post.user_name,
    handle: post.handle,
    av: initials(post.user_name),
    tag: post.tag,
    stage: post.stage,
    type: post.type,
    time: timeAgo(post.created_at),
    content: post.content,
    likes: post.likes,
    comments: grouped.get(post.id) || [],
    saved: Boolean(post.saved),
    liked: Boolean(post.liked),
  }));
}

async function getStats(db) {
  const count = async (sql) => {
    const row = await db.prepare(sql).first();
    return Number(row?.value || 0);
  };

  return {
    profiles: await count("SELECT COUNT(*) AS value FROM users WHERE id <> 'demo-user' AND email <> ''"),
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

async function getBootstrap(db, userId) {
  const [posts, people, events, mentors, conversations, stats] = await Promise.all([
    getPosts(db, userId),
    db
      .prepare(
        `SELECT u.id, u.name, u.handle, u.stage, u.industry, u.location AS loc, u.bio,
          0 AS mutual,
          (SELECT COUNT(*) FROM user_connections c2 WHERE c2.target_user_id = u.id) AS followers,
          EXISTS(SELECT 1 FROM user_connections c WHERE c.target_user_id = u.id AND c.user_id = ?) AS connected
         FROM users u
         WHERE u.id <> 'demo-user' AND u.id <> ? AND u.email IS NOT NULL AND u.email <> ''
         ORDER BY datetime(u.created_at) DESC`
      )
      .bind(userId, userId)
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
    db.prepare("SELECT * FROM conversations ORDER BY id").all(),
    getStats(db),
  ]);

  const messages = await db.prepare("SELECT * FROM messages ORDER BY datetime(created_at), id").all();
  const messageGroups = new Map();
  for (const message of messages.results || []) {
    const list = messageGroups.get(message.conversation_id) || [];
    list.push({
      id: message.id,
      text: message.text,
      author: message.author,
      time: timeAgo(message.created_at),
    });
    messageGroups.set(message.conversation_id, list);
  }

  return {
    posts,
    people: (people.results || []).map((person) => ({
      ...person,
      av: initials(person.name),
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
      name: conversation.name,
      av: conversation.av,
      online: Boolean(conversation.online),
      thread: messageGroups.get(conversation.id) || [],
      draft: "",
    })),
    stats,
  };
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

  const body = method === "GET" ? {} : await readJson(request);

  if (method === "POST" && path === "/waitlist") {
    const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
    const username = normalizeUsername(body.username || email.split("@")[0], "founder");
    const handle = `@${username}`;
    if (!email || !email.includes("@")) return json({ error: "Valid email required" }, { status: 400 });
    const existingWaitlist = await db.prepare("SELECT username FROM waitlist WHERE email = ?").bind(email).first();
    if (existingWaitlist) {
      const existingUsername = existingWaitlist.username || username;
      const verification = await createEmailVerification(db, env, "early_access", email, {
        username: existingUsername,
        handle: `@${existingUsername}`,
      });
      return json({
        ok: true,
        username: `@${existingUsername}`,
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
      const verification = await createEmailVerification(db, env, "early_access", email, { username, handle });
      return json({
        ok: true,
        username: handle,
        verificationSent: Boolean(verification?.notification?.sent),
        verificationQueued: Boolean(verification?.notification?.queued),
      });
    }
    const verification = await createEmailVerification(db, env, "early_access", email, { username, handle });
    return json({
      ok: true,
      username: handle,
      verificationSent: Boolean(verification?.notification?.sent),
      verificationQueued: Boolean(verification?.notification?.queued),
    });
  }

  const auth = await getOrCreateUser(db, env, request, body);
  if (auth.error) return json({ error: auth.error }, { status: 409 });
  const { user, token } = auth;

  if (method === "GET" && path === "/bootstrap") {
    return json({ token, profile: normalizeProfile(user), ...(await getBootstrap(db, user.id)) });
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
          `UPDATE users SET name = ?, handle = ?, email = ?, location = ?, industry = ?, stage = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
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
          duplicate.id
        )
        .run();
      if (!user.email && user.id !== duplicate.id) {
        await db.prepare("DELETE FROM users WHERE id = ?").bind(user.id).run();
      }
      return json({ token: duplicate.token, profile: mergedProfile });
    }

    await db
      .prepare(
        `UPDATE users SET name = ?, handle = ?, email = ?, location = ?, industry = ?, stage = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(profile.name, profile.handle, profile.email, profile.location, profile.industry, profile.stage, profile.bio, user.id)
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
    return json({ token, profile });
  }

  if (method === "POST" && path === "/posts") {
    const content = String(body.content || "").trim().slice(0, 1200);
    if (!content) return json({ error: "Post content required" }, { status: 400 });
    const id = createId("post");
    const tag = String(body.tag || user.industry || "Tech").slice(0, 40);
    const type = String(body.type || "Update").slice(0, 40);
    const stage = String(body.stage || "Building").slice(0, 40);
    await db
      .prepare("INSERT INTO posts (id, user_id, type, tag, stage, content) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, user.id, type, tag, stage, content)
      .run();
    return json({ posts: await getPosts(db, user.id) }, { status: 201 });
  }

  const segments = path.split("/").filter(Boolean);
  if (method === "POST" && segments[0] === "posts" && segments[2] === "comments") {
    const text = String(body.text || "").trim().slice(0, 600);
    if (!text) return json({ error: "Comment text required" }, { status: 400 });
    await db
      .prepare("INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?)")
      .bind(createId("comment"), segments[1], user.id, text)
      .run();
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
    await toggleRow(db, "user_connections", user.id, "target_user_id", targetUserId);
    return json(await getBootstrap(db, user.id));
  }

  if (method === "POST" && segments[0] === "events" && segments[2] === "rsvp") {
    await toggleRow(db, "event_rsvps", user.id, "event_id", Number(segments[1]));
    return json(await getBootstrap(db, user.id));
  }

  if (method === "POST" && segments[0] === "mentors" && segments[2] === "request") {
    await toggleRow(db, "mentor_requests", user.id, "mentor_id", segments[1]);
    return json(await getBootstrap(db, user.id));
  }

  if (method === "POST" && segments[0] === "messages" && segments[2] === "send") {
    const text = String(body.text || "").trim().slice(0, 800);
    if (!text) return json({ error: "Message text required" }, { status: 400 });
    await db
      .prepare("INSERT INTO messages (id, conversation_id, user_id, text, author) VALUES (?, ?, ?, ?, 'you')")
      .bind(createId("message"), Number(segments[1]), user.id, text)
      .run();
    return json(await getBootstrap(db, user.id));
  }

  return json({ error: "Not found" }, { status: 404 });
}

export const onRequest = async (context) => {
  try {
    return await handleRequest(context);
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "Server error", detail: error.message }, { status: 500 });
  }
};
