CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  email TEXT,
  location TEXT,
  industry TEXT,
  stage TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Update',
  tag TEXT NOT NULL DEFAULT 'Tech',
  stage TEXT NOT NULL DEFAULT 'Building',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS post_reactions (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('like', 'save')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id, kind),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  av TEXT NOT NULL,
  stage TEXT NOT NULL,
  industry TEXT NOT NULL,
  mutual INTEGER NOT NULL DEFAULT 0,
  loc TEXT NOT NULL,
  bio TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  online INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS connections (
  user_id TEXT NOT NULL,
  person_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, person_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  host TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  tag TEXT NOT NULL,
  spots INTEGER NOT NULL,
  attending INTEGER NOT NULL DEFAULT 0,
  desc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS mentors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  av TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  tags TEXT NOT NULL,
  bio TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mentor_requests (
  user_id TEXT NOT NULL,
  mentor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, mentor_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  av TEXT NOT NULL,
  online INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  user_id TEXT,
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'them',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT
);

INSERT OR IGNORE INTO users (id, token, name, handle, email, location, industry, stage, bio)
VALUES ('demo-user', 'demo-token', 'Your Name', '@yourhandle', '', 'Denver, CO', 'Tech', 'I''m actively building', 'Building in public, meeting ambitious founders, and turning fear into useful momentum.');

INSERT OR IGNORE INTO people (id, name, handle, av, stage, industry, mutual, loc, bio, followers, online) VALUES
  (1, 'Sofia R.', '@sofiabuilds', 'SR', 'Building', 'Food', 0, 'Austin, TX', 'Founder profile placeholder for the live directory.', 0, 1),
  (2, 'Ethan M.', '@ethanmakes', 'EM', 'Launched', 'Tech', 0, 'San Francisco, CA', 'Founder profile placeholder for the live directory.', 0, 0),
  (3, 'Aisha P.', '@aishapriya', 'AP', 'Idea', 'Health', 0, 'New York, NY', 'Founder profile placeholder for the live directory.', 0, 1),
  (4, 'Leo C.', '@leocreates', 'LC', 'Building', 'Fashion', 0, 'Los Angeles, CA', 'Founder profile placeholder for the live directory.', 0, 0);

INSERT OR IGNORE INTO events (id, title, host, date, time, type, tag, spots, attending, desc) VALUES
  (1, 'Founder Fireside', 'fear.social Team', 'Apr 26', '7:00 PM EST', 'Virtual', 'Finance', 0, 0, 'Event placeholder. RSVP totals update from the live database.'),
  (2, 'fear.social Meetup - Denver, CO', 'fear.social Team', 'May 3', '6:30 PM MT', 'In-Person', 'Networking', 0, 0, 'Event placeholder. RSVP totals update from the live database.'),
  (3, 'Build in Public: Product Teardown', 'fear.social Team', 'May 10', '5:00 PM EST', 'Virtual', 'Tech', 0, 0, 'Event placeholder. RSVP totals update from the live database.');

INSERT OR IGNORE INTO mentors (id, name, role, av, sessions, rating, tags, bio) VALUES
  ('alexis-chen', 'Alexis Chen', 'Mentor profile', 'AC', 0, 0, 'SaaS,Fundraising', 'Mentor listing. Request counts update from the live database.'),
  ('marcus-webb', 'Marcus Webb', 'Mentor profile', 'MW', 0, 0, 'DTC,Shopify', 'Mentor listing. Request counts update from the live database.'),
  ('destiny-okafor', 'Destiny Okafor', 'Mentor profile', 'DO', 0, 0, 'Growth,Brand', 'Mentor listing. Request counts update from the live database.');

INSERT OR IGNORE INTO conversations (id, name, av, online) VALUES
  (1, 'Sofia R.', 'SR', 1),
  (2, 'Ethan M.', 'EM', 0),
  (3, 'Aisha P.', 'AP', 1);

INSERT OR IGNORE INTO messages (id, conversation_id, text, author, created_at) VALUES
  ('seed-msg-1', 1, 'Loved your build-in-public post.', 'them', '2026-05-29T10:00:00Z'),
  ('seed-msg-2', 1, 'Want to compare launch notes this week?', 'them', '2026-05-29T10:03:00Z'),
  ('seed-msg-3', 2, 'I saw your post about fundraising.', 'them', '2026-05-29T11:00:00Z'),
  ('seed-msg-4', 2, 'Happy to send over our angel update template.', 'them', '2026-05-29T11:04:00Z'),
  ('seed-msg-5', 3, 'That mentor session was excellent.', 'them', '2026-05-29T12:00:00Z'),
  ('seed-msg-6', 3, 'I booked Alexis next week too.', 'them', '2026-05-29T12:02:00Z');

INSERT OR IGNORE INTO posts (id, user_id, type, tag, stage, content, created_at) VALUES
  ('seed-post-1', 'demo-user', 'Update', 'Tech', 'Launched', 'Sharing a build note from the demo feed. Replace this with a real post once you publish from your profile.', '2026-05-29T09:00:00Z'),
  ('seed-post-2', 'demo-user', 'Update', 'Finance', 'Building', 'Looking for feedback on founder onboarding flows and the first profile setup experience.', '2026-05-29T06:00:00Z'),
  ('seed-post-3', 'demo-user', 'Milestone', 'Fashion', 'Launched', 'Posting a founder reflection without claiming revenue, traction, or outcomes that have not been verified.', '2026-05-29T03:00:00Z'),
  ('seed-post-4', 'demo-user', 'Milestone', 'Health', 'Launched', 'Use this space for real launches, asks, and lessons once community members start posting.', '2026-05-27T09:00:00Z');
