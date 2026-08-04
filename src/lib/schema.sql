-- ADFLEX admin schema.
--
-- Applied by `npm run db:setup`, which is idempotent — every statement here is
-- `IF NOT EXISTS` so it can be re-run against a live database without dropping
-- anything. There is no migration tool: this file IS the schema, and a change
-- to it needs a matching `ALTER` added below rather than an edit in place once
-- the database is real.

-- Editors. Seeded by `npm run db:user`; never created through the web UI,
-- because a publicly reachable sign-up form on an admin surface is a way in.
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uploaded images, stored as bytes rather than in an object store.
--
-- This keeps DATABASE_URL the only secret the deployment needs. It is the right
-- trade at this scale — a project site with tens of images, not thousands — and
-- the wrong one past roughly a few hundred megabytes, because database storage
-- costs more than object storage and every backup carries the images. The swap
-- point is `src/lib/repo/media.ts`; nothing else reads `data` directly.
CREATE TABLE IF NOT EXISTS media (
  id          SERIAL PRIMARY KEY,
  filename    TEXT        NOT NULL,
  mime        TEXT        NOT NULL,
  byte_size   INTEGER     NOT NULL,
  data        BYTEA       NOT NULL,
  alt         TEXT        NOT NULL DEFAULT '',
  uploaded_by INTEGER     REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project findings, shown on /outputs.
CREATE TABLE IF NOT EXISTS findings (
  id         SERIAL PRIMARY KEY,
  title      TEXT        NOT NULL,
  summary    TEXT        NOT NULL DEFAULT '',
  body       TEXT        NOT NULL DEFAULT '',
  image_id   INTEGER     REFERENCES media(id) ON DELETE SET NULL,
  published  BOOLEAN     NOT NULL DEFAULT false,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Publications, shown on /outputs.
--
-- `doi` holds the bare DOI ("10.1234/abcd"), never a URL. The resolver prefix
-- is added at render time by `doiUrl()` so a stored value cannot drift between
-- doi.org, dx.doi.org and a bare string.
CREATE TABLE IF NOT EXISTS publications (
  id         SERIAL PRIMARY KEY,
  title      TEXT        NOT NULL,
  authors    TEXT        NOT NULL DEFAULT '',
  venue      TEXT        NOT NULL DEFAULT '',
  year       INTEGER,
  doi        TEXT,
  url        TEXT,
  published  BOOLEAN     NOT NULL DEFAULT false,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- News and events share one table because they share one route. `kind` is what
-- separates them; `event_date` and `location` are only meaningful for events
-- and are left null for news.
CREATE TABLE IF NOT EXISTS news_items (
  id           SERIAL PRIMARY KEY,
  kind         TEXT        NOT NULL CHECK (kind IN ('news', 'event')),
  title        TEXT        NOT NULL,
  summary      TEXT        NOT NULL DEFAULT '',
  body         TEXT        NOT NULL DEFAULT '',
  image_id     INTEGER     REFERENCES media(id) ON DELETE SET NULL,
  published_on DATE        NOT NULL DEFAULT CURRENT_DATE,
  event_date   DATE,
  location     TEXT,
  published    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact form submissions.
--
-- This table holds personal data — name, email and free text — supplied by
-- members of the public. Maynooth University is the data controller named in
-- the privacy policy. Do not add analytics on it, do not export it casually,
-- and honour deletion requests by deleting the row.
CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  subject    TEXT        NOT NULL DEFAULT '',
  message    TEXT        NOT NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS findings_live_idx     ON findings (published, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS publications_live_idx ON publications (published, sort_order, year DESC);
CREATE INDEX IF NOT EXISTS news_live_idx         ON news_items (published, published_on DESC);
CREATE INDEX IF NOT EXISTS messages_recent_idx   ON messages (created_at DESC);
