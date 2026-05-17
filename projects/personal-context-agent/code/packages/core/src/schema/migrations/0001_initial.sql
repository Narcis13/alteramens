-- PCA schema v1 — all 12 entity types + 5 primitives
-- Source of truth: PRD §8.3

-- ============================================================================
-- ENTITY MAIN TABLE
-- ============================================================================
CREATE TABLE entities (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL CHECK (type IN (
                    'self','place','goal','knowledge','person','resource',
                    'constraint','state','event','preference','stance','role'
                  )),
  title           TEXT NOT NULL,
  body            TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','archived','invalidated')),
  authority       TEXT NOT NULL
                    CHECK (authority IN ('self-declared','observed','inferred')),
  confidence      TEXT NOT NULL DEFAULT 'medium'
                    CHECK (confidence IN ('low','medium','high')),
  maturity        TEXT NOT NULL DEFAULT 'provisional'
                    CHECK (maturity IN ('provisional','working','load-bearing')),
  scope           TEXT NOT NULL DEFAULT 'general',
  source_ref      TEXT,
  attrs           TEXT,                         -- JSON-encoded
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  expires_at      TEXT,
  invalidated_at  TEXT
);

CREATE INDEX idx_entities_type_status ON entities(type, status);
CREATE INDEX idx_entities_expires    ON entities(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_entities_scope      ON entities(scope);
CREATE INDEX idx_entities_updated    ON entities(updated_at DESC);

-- Singleton constraint on Self (only one active self at a time)
CREATE UNIQUE INDEX idx_self_singleton
  ON entities(type) WHERE type='self' AND status='active';

-- ============================================================================
-- EVENTS (append-only history)
-- ============================================================================
CREATE TABLE events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at   TEXT NOT NULL,
  actor         TEXT NOT NULL,
  operation     TEXT NOT NULL
                  CHECK (operation IN (
                    'create','update','observe','invalidate',
                    'confirm','confirm-modify','expire',
                    'link','annotate','tag','source'
                  )),
  entity_id     TEXT REFERENCES entities(id),
  link_id       TEXT,
  annotation_id TEXT,
  payload       TEXT,                          -- JSON-encoded
  source_ref    TEXT
);
CREATE INDEX idx_events_entity      ON events(entity_id);
CREATE INDEX idx_events_actor_time  ON events(actor, occurred_at DESC);

-- ============================================================================
-- LINKS (typed relations between entities)
-- ============================================================================
CREATE TABLE links (
  id              TEXT PRIMARY KEY,
  src_id          TEXT NOT NULL REFERENCES entities(id),
  dst_id          TEXT NOT NULL REFERENCES entities(id),
  relation        TEXT NOT NULL,
  weight          REAL DEFAULT 1.0,
  authority       TEXT NOT NULL
                    CHECK (authority IN ('self-declared','observed','inferred')),
  created_at      TEXT NOT NULL,
  invalidated_at  TEXT
);
CREATE INDEX idx_links_src      ON links(src_id);
CREATE INDEX idx_links_dst      ON links(dst_id);
CREATE INDEX idx_links_relation ON links(relation);

-- ============================================================================
-- ANNOTATIONS (free notes on any entity)
-- ============================================================================
CREATE TABLE annotations (
  id          TEXT PRIMARY KEY,
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  body        TEXT NOT NULL,
  authority   TEXT NOT NULL
                CHECK (authority IN ('self-declared','observed','inferred')),
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_annotations_entity ON annotations(entity_id);

-- ============================================================================
-- TAGS (free categorization)
-- ============================================================================
CREATE TABLE tags (
  slug        TEXT PRIMARY KEY,
  description TEXT
);
CREATE TABLE entity_tags (
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  tag_slug    TEXT NOT NULL REFERENCES tags(slug),
  PRIMARY KEY (entity_id, tag_slug)
);

-- ============================================================================
-- SOURCES (citations: conversation_id, URL, file path)
-- ============================================================================
CREATE TABLE sources (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('conversation','url','file','other')),
  identifier  TEXT NOT NULL,
  excerpt     TEXT,
  created_at  TEXT NOT NULL
);
CREATE TABLE entity_sources (
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  source_id   TEXT NOT NULL REFERENCES sources(id),
  PRIMARY KEY (entity_id, source_id)
);

-- ============================================================================
-- PROJECTS (scope container)
-- ============================================================================
CREATE TABLE projects (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at  TEXT NOT NULL
);

-- ============================================================================
-- FTS5 over entities (title + body)
-- ============================================================================
CREATE VIRTUAL TABLE fts_entities USING fts5(
  title, body, content='entities', content_rowid='rowid'
);
CREATE TRIGGER entities_ai AFTER INSERT ON entities BEGIN
  INSERT INTO fts_entities(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;
CREATE TRIGGER entities_ad AFTER DELETE ON entities BEGIN
  INSERT INTO fts_entities(fts_entities, rowid, title, body) VALUES('delete', old.rowid, old.title, old.body);
END;
CREATE TRIGGER entities_au AFTER UPDATE ON entities BEGIN
  INSERT INTO fts_entities(fts_entities, rowid, title, body) VALUES('delete', old.rowid, old.title, old.body);
  INSERT INTO fts_entities(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;

-- (schema_migrations table is owned by the migration runner, not migrations)

-- ============================================================================
-- VIEWS
-- ============================================================================
CREATE VIEW v_current_self AS
  SELECT * FROM entities WHERE type='self' AND status='active' LIMIT 1;

CREATE VIEW v_active_places AS SELECT * FROM entities
  WHERE type='place' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_goals AS SELECT * FROM entities
  WHERE type='goal' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_knowledge AS SELECT * FROM entities
  WHERE type='knowledge' AND status='active'
  ORDER BY updated_at DESC;

-- importance ordered high → med → low (PRD intent; alphabetical DESC sorts wrong)
CREATE VIEW v_active_persons AS SELECT * FROM entities
  WHERE type='person' AND status='active'
  ORDER BY CASE json_extract(attrs,'$.importance')
              WHEN 'high' THEN 0
              WHEN 'med'  THEN 1
              WHEN 'low'  THEN 2
              ELSE 3
           END,
           updated_at DESC;

CREATE VIEW v_active_resources AS SELECT * FROM entities
  WHERE type='resource' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_constraints AS SELECT * FROM entities
  WHERE type='constraint' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_states AS SELECT * FROM entities
  WHERE type='state' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC LIMIT 5;

CREATE VIEW v_recent_state AS SELECT * FROM v_active_states LIMIT 1;

CREATE VIEW v_active_events AS SELECT * FROM entities
  WHERE type='event' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_preferences AS SELECT * FROM entities
  WHERE type='preference' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_stances AS SELECT * FROM entities
  WHERE type='stance' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_roles AS SELECT * FROM entities
  WHERE type='role' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_stale_entities AS SELECT * FROM entities
  WHERE status='active'
    AND ((expires_at IS NOT NULL AND expires_at < datetime('now'))
      OR (expires_at IS NULL AND julianday('now') - julianday(updated_at) > 90));
