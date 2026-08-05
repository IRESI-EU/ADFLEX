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

-- --------------------------------------------------------------------------
-- Multiple images per entry                                    (5 August 2026)
-- --------------------------------------------------------------------------
-- `findings.image_id` and `news_items.image_id` held exactly one image each.
-- These tables replace that with an ordered set.
--
-- Two tables rather than one polymorphic table with an `item_type` column. A
-- polymorphic `item_id` cannot carry a foreign key, so deleting a finding would
-- leave its image rows behind as orphans to be cleaned up by hand. Separate
-- tables get `ON DELETE CASCADE` for free, and that is worth the duplication.
CREATE TABLE IF NOT EXISTS finding_images (
  id         SERIAL PRIMARY KEY,
  finding_id INTEGER NOT NULL REFERENCES findings(id)  ON DELETE CASCADE,
  media_id   INTEGER NOT NULL REFERENCES media(id)     ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS news_images (
  id       SERIAL PRIMARY KEY,
  news_id  INTEGER NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id)      ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0
);

-- Real pixel dimensions, read from the file header on upload. Null for anything
-- uploaded before this existed, or whose header could not be parsed; the
-- renderer falls back to a 3:2 box in that case.
ALTER TABLE media ADD COLUMN IF NOT EXISTS width  INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS height INTEGER;

-- How large the images should be drawn on the public page. See `ImageSize` in
-- src/lib/repo.ts for what each value means.
ALTER TABLE findings   ADD COLUMN IF NOT EXISTS image_size TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS image_size TEXT NOT NULL DEFAULT 'medium';

-- Carries anything stored under the old single-image columns into the new
-- tables. Guarded by NOT EXISTS so re-running db:setup cannot duplicate a row.
--
-- `image_id` is deliberately **not dropped**. Dropping a column is irreversible,
-- and making the drop safely re-runnable needs a dollar-quoted DO block, which
-- the statement splitter in scripts/db-setup.mjs does not parse. It is dead
-- weight and nothing reads it; leave it unless you also teach that splitter
-- about `$$`.
INSERT INTO finding_images (finding_id, media_id, position)
SELECT f.id, f.image_id, 0 FROM findings f
WHERE f.image_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM finding_images fi WHERE fi.finding_id = f.id);

INSERT INTO news_images (news_id, media_id, position)
SELECT n.id, n.image_id, 0 FROM news_items n
WHERE n.image_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM news_images ni WHERE ni.news_id = n.id);

CREATE INDEX IF NOT EXISTS finding_images_idx ON finding_images (finding_id, position);
CREATE INDEX IF NOT EXISTS news_images_idx    ON news_images (news_id, position);

CREATE INDEX IF NOT EXISTS findings_live_idx     ON findings (published, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS publications_live_idx ON publications (published, sort_order, year DESC);
CREATE INDEX IF NOT EXISTS news_live_idx         ON news_items (published, published_on DESC);
CREATE INDEX IF NOT EXISTS messages_recent_idx   ON messages (created_at DESC);
