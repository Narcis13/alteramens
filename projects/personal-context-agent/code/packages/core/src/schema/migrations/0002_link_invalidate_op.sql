-- Extend events.operation CHECK constraint with 'link-invalidate'.
-- SQLite cannot ALTER a CHECK constraint; rebuild the table with the new one.
-- Runs inside the migration runner's transaction. No table references events
-- via FK, so dropping/renaming is safe.

CREATE TABLE events_new (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at   TEXT NOT NULL,
  actor         TEXT NOT NULL,
  operation     TEXT NOT NULL
                  CHECK (operation IN (
                    'create','update','observe','invalidate',
                    'confirm','confirm-modify','expire',
                    'link','link-invalidate','annotate','tag','source'
                  )),
  entity_id     TEXT REFERENCES entities(id),
  link_id       TEXT,
  annotation_id TEXT,
  payload       TEXT,
  source_ref    TEXT
);

INSERT INTO events_new
  (id, occurred_at, actor, operation, entity_id, link_id, annotation_id, payload, source_ref)
SELECT
   id, occurred_at, actor, operation, entity_id, link_id, annotation_id, payload, source_ref
FROM events;

DROP TABLE events;
ALTER TABLE events_new RENAME TO events;

CREATE INDEX idx_events_entity     ON events(entity_id);
CREATE INDEX idx_events_actor_time ON events(actor, occurred_at DESC);
