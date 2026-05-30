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
  rating REAL NOT NULL DEFAULT 5,
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

INSERT OR IGNORE INTO users (id, token, name, handle, email, location, industry, stage, bio)
VALUES ('demo-user', 'demo-token', 'Your Name', '@yourhandle', '', 'Denver, CO', 'Tech', 'I''m actively building', 'Building in public, meeting ambitious founders, and turning fear into useful momentum.');

INSERT OR IGNORE INTO people (id, name, handle, av, stage, industry, mutual, loc, bio, followers, online) VALUES
  (1, 'Sofia R.', '@sofiabuilds', 'SR', 'Building', 'Food', 3, 'Austin, TX', 'Building the future of artisan food delivery.', 892, 1),
  (2, 'Ethan M.', '@ethanmakes', 'EM', 'Launched', 'Tech', 7, 'San Francisco, CA', 'Shipped 4 apps. Obsessed with AI tooling.', 2104, 0),
  (3, 'Aisha P.', '@aishapriya', 'AP', 'Idea', 'Health', 2, 'New York, NY', 'Ex-nurse building tech to fix mental health.', 445, 1),
  (4, 'Leo C.', '@leocreates', 'LC', 'Building', 'Fashion', 5, 'Los Angeles, CA', 'Sustainable fashion marketplace.', 1230, 0);

INSERT OR IGNORE INTO events (id, title, host, date, time, type, tag, spots, attending, desc) VALUES
  (1, 'Founder Fireside: From Idea to First $10K', 'Alexis Chen', 'Apr 26', '7:00 PM EST', 'Virtual', 'Finance', 48, 12, 'A candid conversation about the messy first steps.'),
  (2, 'fear.social Meetup - Denver, CO', 'fear.social Team', 'May 3', '6:30 PM MT', 'In-Person', 'Networking', 30, 24, 'IRL founder night. Good people, no pitch decks.'),
  (3, 'Build in Public: Live Product Teardown', 'Marcus Webb', 'May 10', '5:00 PM EST', 'Virtual', 'Tech', 200, 89, 'We will dissect 3 live products on stream.');

INSERT OR IGNORE INTO mentors (id, name, role, av, sessions, rating, tags, bio) VALUES
  ('alexis-chen', 'Alexis Chen', '3x Founder - VC Partner', 'AC', 142, 4.9, 'SaaS,Fundraising', 'Exited two companies. Now backing the next generation.'),
  ('marcus-webb', 'Marcus Webb', 'E-commerce Operator', 'MW', 89, 4.8, 'DTC,Shopify', 'Scaled 4 brands past $1M.'),
  ('destiny-okafor', 'Destiny Okafor', 'Head of Growth, Google', 'DO', 203, 5.0, 'Growth,Brand', 'Obsessed with sustainable distribution.');

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
  ('seed-post-1', 'demo-user', 'Update', 'Tech', 'Launched', 'Hit 1,000 users in 30 days with zero ad spend. Here is the exact playbook - drop a comment if you want it.', '2026-05-29T09:00:00Z'),
  ('seed-post-2', 'demo-user', 'Update', 'Finance', 'Building', 'Raised my first $10K from people I knew without making things awkward. One conversation changed everything.', '2026-05-29T06:00:00Z'),
  ('seed-post-3', 'demo-user', 'Milestone', 'Fashion', 'Launched', 'My first business failed. I am posting this because no one talks about what comes after: the grief, the clarity, and how I rebuilt.', '2026-05-29T03:00:00Z'),
  ('seed-post-4', 'demo-user', 'Milestone', 'Health', 'Launched', 'We just crossed $50K ARR. 18 months ago I had nothing but a Notion doc and a lot of fear.', '2026-05-27T09:00:00Z');

INSERT OR IGNORE INTO comments (id, post_id, user_id, text, created_at) VALUES
  ('seed-comment-1', 'seed-post-1', 'demo-user', 'Need this!', '2026-05-29T10:00:00Z'),
  ('seed-comment-2', 'seed-post-1', 'demo-user', 'How did you handle retention?', '2026-05-29T10:15:00Z'),
  ('seed-comment-3', 'seed-post-2', 'demo-user', 'This is the post I needed today.', '2026-05-29T08:00:00Z');
