-- Captures: the raw-input memory stream. Every `/ctx-add` (and any future
-- skill) lands here verbatim before classification. Foundation for Arc 1
-- input-fidelity rule and a future long-term-memory layer.
-- Source of truth: plan-captures.md §4.1.

CREATE TABLE captures (
  id                     TEXT PRIMARY KEY,                -- ulid
  occurred_at            TEXT NOT NULL,                   -- ISO 8601
  raw_text               TEXT NOT NULL,                   -- VERBATIM user input
  source                 TEXT NOT NULL DEFAULT 'claude-code:ctx-add',
  actor                  TEXT NOT NULL,
  session_id             TEXT,                            -- optional
  scope                  TEXT NOT NULL DEFAULT 'general',
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','processed','aborted','reprocess')),
  processed_at           TEXT,
  classification_summary TEXT,                            -- JSON, see §4.2
  raw_lang               TEXT,                            -- 'ro'|'en'|'mixed'|NULL
  meta                   TEXT                             -- JSON, freeform
);

CREATE INDEX idx_captures_time   ON captures(occurred_at DESC);
CREATE INDEX idx_captures_status ON captures(status);
CREATE INDEX idx_captures_actor  ON captures(actor, occurred_at DESC);
CREATE INDEX idx_captures_source ON captures(source);

-- Provenance joins: which entities/links did each capture produce?
CREATE TABLE capture_entities (
  capture_id TEXT NOT NULL REFERENCES captures(id),
  entity_id  TEXT NOT NULL REFERENCES entities(id),
  PRIMARY KEY (capture_id, entity_id)
);
CREATE INDEX idx_capture_entities_entity ON capture_entities(entity_id);

CREATE TABLE capture_links (
  capture_id TEXT NOT NULL REFERENCES captures(id),
  link_id    TEXT NOT NULL REFERENCES links(id),
  PRIMARY KEY (capture_id, link_id)
);
CREATE INDEX idx_capture_links_link ON capture_links(link_id);

-- FTS5 over raw_text — the journal search surface.
CREATE VIRTUAL TABLE fts_captures USING fts5(
  raw_text, content='captures', content_rowid='rowid'
);
CREATE TRIGGER captures_ai AFTER INSERT ON captures BEGIN
  INSERT INTO fts_captures(rowid, raw_text) VALUES (new.rowid, new.raw_text);
END;
CREATE TRIGGER captures_ad AFTER DELETE ON captures BEGIN
  INSERT INTO fts_captures(fts_captures, rowid, raw_text) VALUES('delete', old.rowid, old.raw_text);
END;
CREATE TRIGGER captures_au AFTER UPDATE ON captures BEGIN
  INSERT INTO fts_captures(fts_captures, rowid, raw_text) VALUES('delete', old.rowid, old.raw_text);
  INSERT INTO fts_captures(rowid, raw_text) VALUES (new.rowid, new.raw_text);
END;
