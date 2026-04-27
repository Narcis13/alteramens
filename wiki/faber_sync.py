#!/usr/bin/env python3
"""
faber_sync.py — Parse all wiki/*.md files and populate faber.db (SQLite index).

The .md files are ALWAYS the source of truth. The .db is a derived index
that can be deleted and rebuilt at any time — EXCEPT sync_log history,
which is preserved across rebuilds for time-series analysis.

Two data layers are indexed:
  1. Knowledge graph: pages (sources/entities/concepts/syntheses) + relations
  2. Temporal layer:  log_events + log_event_pages (parsed from log.md)

Usage:
    python3 wiki/faber_sync.py [--wiki-dir wiki/] [--no-index]
"""

import argparse
import json
import os
import re
import sqlite3
import time
from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

WIKI_DIR_DEFAULT = Path(__file__).parent
DB_NAME = "faber.db"
LOG_FILENAME = "log.md"
WIKILINK_RE = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
# Matches fenced code blocks (``` ... ```), inline code (` ... `), and indented
# 4-space code blocks. These are stripped before wikilink extraction so that
# examples of the [[syntax]] inside documentation don't get indexed as real links.
FENCED_BLOCK_RE = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")

# Log.md header contract: `## [YYYY-MM-DD] operation | Title`
# `operation` may be multi-word (e.g. "query → synthesis")
LOG_HEADER_RE = re.compile(r"^##\s*\[(\d{4}-\d{2}-\d{2})\]\s*([^|]+?)\s*\|\s*(.+?)\s*$")
SLUG_RE = re.compile(r"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")


SCHEMA_SQL = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- =========================================================================
-- Knowledge graph layer (pages + relations)
-- =========================================================================

CREATE TABLE IF NOT EXISTS pages (
    slug            TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL
                    CHECK(type IN ('source','entity','concept','synthesis','meta','self','agent','moc')),
    file_path       TEXT NOT NULL,
    format          TEXT,
    origin          TEXT,
    source_ref      TEXT,
    ingested        TEXT,
    guided          INTEGER,
    category        TEXT,
    first_seen      TEXT,
    status          TEXT
                    CHECK(status IS NULL OR status IN ('active','historical','deprecated','retired','challenged')),
    maturity        TEXT
                    CHECK(maturity IS NULL OR maturity IN ('seed','developing','mature','challenged','draft','archived')),
    confidence      TEXT
                    CHECK(confidence IS NULL OR confidence IN ('low','medium','high')),
    trigger_type    TEXT
                    CHECK(trigger_type IS NULL OR trigger_type IN ('query','lint','insight','comparison')),
    question        TEXT,
    created         TEXT,
    updated         TEXT,
    prose           TEXT,
    word_count      INTEGER,
    last_synced     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS key_claims (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source_slug     TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    claim           TEXT NOT NULL,
    position        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS aliases (
    entity_slug     TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    alias           TEXT NOT NULL,
    PRIMARY KEY (entity_slug, alias)
);

CREATE TABLE IF NOT EXISTS vault_refs (
    page_slug       TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    vault_path      TEXT NOT NULL,
    ref_type        TEXT NOT NULL DEFAULT 'vault_ref',
    PRIMARY KEY (page_slug, vault_path, ref_type)
);

CREATE TABLE IF NOT EXISTS page_relations (
    from_slug       TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    to_slug         TEXT NOT NULL,
    relation_type   TEXT NOT NULL,
    PRIMARY KEY (from_slug, to_slug, relation_type)
);

CREATE TABLE IF NOT EXISTS prose_wikilinks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    from_slug       TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    target          TEXT NOT NULL,
    display_text    TEXT,
    is_vault_link   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS images (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source_slug     TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    path            TEXT NOT NULL,
    description     TEXT,
    UNIQUE(source_slug, path)
);

-- =========================================================================
-- Temporal layer (log.md → structured events)
-- =========================================================================

CREATE TABLE IF NOT EXISTS log_events (
    id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    event_date                 TEXT NOT NULL,          -- YYYY-MM-DD
    operation                  TEXT NOT NULL,          -- init|seed|ingest|build|link|query|lint|...
    title                      TEXT NOT NULL,
    source_origin              TEXT,                   -- URL, conversation:DATE, vault path, ...
    guided                     INTEGER,                -- 0 / 1 / NULL
    body                       TEXT NOT NULL,          -- full raw body of the entry (verbatim)
    position                   INTEGER NOT NULL,       -- position in file (0 = first entry)
    claimed_sources_created    INTEGER,
    claimed_entities_created   INTEGER,
    claimed_concepts_created   INTEGER,
    claimed_syntheses_created  INTEGER,
    claimed_pages_updated      INTEGER,
    touched_page_count         INTEGER DEFAULT 0       -- derived: COUNT of junction rows
);

-- Junction: which pages each event created/updated/consulted/involved.
-- page_slug is NOT a foreign key — it may reference vault docs (non-wiki)
-- or pages that were later deleted. Integrity is checked via v_log_mismatches.
CREATE TABLE IF NOT EXISTS log_event_pages (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id      INTEGER NOT NULL REFERENCES log_events(id) ON DELETE CASCADE,
    page_slug     TEXT NOT NULL,
    action        TEXT NOT NULL,
                  -- created | updated | consulted | involved | skipped | pivoted
    page_type     TEXT,
                  -- source | entity | concept | synthesis | vault_doc | NULL
    UNIQUE(event_id, page_slug, action, page_type)
);

CREATE TABLE IF NOT EXISTS sync_log (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    synced_at         TEXT DEFAULT (datetime('now')),
    pages_synced      INTEGER,
    relations_synced  INTEGER,
    wikilinks_synced  INTEGER,
    log_events_synced INTEGER,
    duration_ms       INTEGER
);

-- =========================================================================
-- Self + Agent layer (first-class citizens: Narcis & Claude)
-- =========================================================================

-- Narcis's active pillars (long-arc identity anchors).
CREATE TABLE IF NOT EXISTS self_pillars (
    slug              TEXT PRIMARY KEY,
    title             TEXT NOT NULL,
    since             TEXT,
    status            TEXT CHECK(status IN ('active','retired','challenged')),
    evidence_events   INTEGER DEFAULT 0,
    page_slug         TEXT REFERENCES pages(slug) ON DELETE SET NULL,
    last_synced       TEXT DEFAULT (datetime('now'))
);

-- Stances: positions on specific sub-topics (shipping > perfection, etc.).
CREATE TABLE IF NOT EXISTS self_stances (
    slug              TEXT PRIMARY KEY,
    on_topic          TEXT NOT NULL,
    position          TEXT NOT NULL,
    confidence        TEXT CHECK(confidence IN ('high','medium','low')),
    status            TEXT CHECK(status IN ('active','retired','challenged')),
    last_reaffirmed   TEXT,
    page_slug         TEXT REFERENCES pages(slug) ON DELETE SET NULL,
    last_synced       TEXT DEFAULT (datetime('now'))
);

-- Measurable commitments with deadlines + progress marker.
CREATE TABLE IF NOT EXISTS self_commitments (
    slug              TEXT PRIMARY KEY,
    title             TEXT NOT NULL,
    due_date          TEXT,
    status            TEXT CHECK(status IN ('active','met','missed','revised')),
    progress_marker   TEXT,
    page_slug         TEXT REFERENCES pages(slug) ON DELETE SET NULL,
    last_synced       TEXT DEFAULT (datetime('now'))
);

-- Constraints: time / habit / weakness / resource boundaries.
CREATE TABLE IF NOT EXISTS self_constraints (
    slug              TEXT PRIMARY KEY,
    description       TEXT NOT NULL,
    kind              TEXT,
    status            TEXT CHECK(status IN ('active','retired','resolved')),
    page_slug         TEXT REFERENCES pages(slug) ON DELETE SET NULL,
    last_synced       TEXT DEFAULT (datetime('now'))
);

-- First-class voice rules (populated from self/narcis-voice.md).
CREATE TABLE IF NOT EXISTS voice_rules (
    slug              TEXT PRIMARY KEY,
    rule              TEXT NOT NULL,
    category          TEXT,
    examples_yes      TEXT,
    examples_no       TEXT,
    status            TEXT CHECK(status IN ('active','retired','challenged')),
    page_slug         TEXT REFERENCES pages(slug) ON DELETE SET NULL,
    last_synced       TEXT DEFAULT (datetime('now'))
);

-- Claude's heuristics about how to work in Alteramens.
CREATE TABLE IF NOT EXISTS agent_heuristics (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    slug              TEXT UNIQUE,
    rule              TEXT NOT NULL,
    first_observed    TEXT,
    evidence_events   TEXT,
    confidence        TEXT CHECK(confidence IN ('high','medium','low')),
    status            TEXT CHECK(status IN ('active','retired','challenged')),
    dispute_reason    TEXT,
    page_slug         TEXT REFERENCES pages(slug) ON DELETE SET NULL,
    last_synced       TEXT DEFAULT (datetime('now'))
);

-- Alignment between any page and a pillar (reinforces / weakens / contradicts).
CREATE TABLE IF NOT EXISTS self_alignment (
    page_slug         TEXT NOT NULL,
    pillar_slug       TEXT NOT NULL,
    relation          TEXT CHECK(relation IN ('reinforces','weakens','contradicts','neutral')),
    source_event      TEXT,
    PRIMARY KEY (page_slug, pillar_slug),
    FOREIGN KEY (pillar_slug) REFERENCES self_pillars(slug) ON DELETE CASCADE
);

-- Snapshot of every self/ page at each /faber-meet.
CREATE TABLE IF NOT EXISTS self_snapshots (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    taken_at          TEXT NOT NULL,
    meet_event_id     TEXT,
    page_slug         TEXT NOT NULL,
    frontmatter_json  TEXT NOT NULL,
    body_hash         TEXT NOT NULL,
    body              TEXT NOT NULL
);
"""

INDEX_SQL = """
-- Knowledge graph indexes
CREATE INDEX IF NOT EXISTS idx_claims_source ON key_claims(source_slug);
CREATE INDEX IF NOT EXISTS idx_aliases_alias ON aliases(alias);
CREATE INDEX IF NOT EXISTS idx_relations_to ON page_relations(to_slug);
CREATE INDEX IF NOT EXISTS idx_relations_type ON page_relations(relation_type);
CREATE INDEX IF NOT EXISTS idx_wikilinks_from ON prose_wikilinks(from_slug);
CREATE INDEX IF NOT EXISTS idx_wikilinks_target ON prose_wikilinks(target);

-- Temporal indexes on existing date columns (enable fast range queries)
CREATE INDEX IF NOT EXISTS idx_pages_updated   ON pages(updated);
CREATE INDEX IF NOT EXISTS idx_pages_created   ON pages(created);
CREATE INDEX IF NOT EXISTS idx_pages_ingested  ON pages(ingested);
CREATE INDEX IF NOT EXISTS idx_pages_type      ON pages(type);
CREATE INDEX IF NOT EXISTS idx_pages_maturity  ON pages(maturity);

-- Log layer indexes
CREATE INDEX IF NOT EXISTS idx_log_events_date      ON log_events(event_date);
CREATE INDEX IF NOT EXISTS idx_log_events_operation ON log_events(operation);
CREATE INDEX IF NOT EXISTS idx_lep_slug             ON log_event_pages(page_slug);
CREATE INDEX IF NOT EXISTS idx_lep_action           ON log_event_pages(action);
CREATE INDEX IF NOT EXISTS idx_lep_event            ON log_event_pages(event_id);
CREATE INDEX IF NOT EXISTS idx_lep_page_type        ON log_event_pages(page_type);

-- Self + agent indexes
CREATE INDEX IF NOT EXISTS idx_self_pillars_status      ON self_pillars(status);
CREATE INDEX IF NOT EXISTS idx_self_stances_status      ON self_stances(status);
CREATE INDEX IF NOT EXISTS idx_self_commitments_status  ON self_commitments(status);
CREATE INDEX IF NOT EXISTS idx_self_commitments_due     ON self_commitments(due_date);
CREATE INDEX IF NOT EXISTS idx_self_constraints_status  ON self_constraints(status);
CREATE INDEX IF NOT EXISTS idx_voice_rules_status       ON voice_rules(status);
CREATE INDEX IF NOT EXISTS idx_voice_rules_category     ON voice_rules(category);
CREATE INDEX IF NOT EXISTS idx_agent_heuristics_status  ON agent_heuristics(status);
CREATE INDEX IF NOT EXISTS idx_self_alignment_pillar    ON self_alignment(pillar_slug);
CREATE INDEX IF NOT EXISTS idx_self_alignment_relation  ON self_alignment(relation);
CREATE INDEX IF NOT EXISTS idx_self_snapshots_page      ON self_snapshots(page_slug, taken_at);
CREATE INDEX IF NOT EXISTS idx_self_snapshots_meet      ON self_snapshots(meet_event_id);
"""

FTS_SQL = """
-- Pages prose FTS (existing)
CREATE VIRTUAL TABLE IF NOT EXISTS fts_content USING fts5(
    slug UNINDEXED,
    title,
    type UNINDEXED,
    category,
    prose,
    tokenize='porter unicode61'
);

-- Key claims FTS (new — enables contradiction-scan queries across all claims)
CREATE VIRTUAL TABLE IF NOT EXISTS fts_claims USING fts5(
    source_slug UNINDEXED,
    claim,
    tokenize='porter unicode61'
);

-- Log events FTS (new — enables "what did I work on about X last week" queries)
CREATE VIRTUAL TABLE IF NOT EXISTS fts_log USING fts5(
    event_id UNINDEXED,
    event_date UNINDEXED,
    operation UNINDEXED,
    title,
    body,
    tokenize='porter unicode61'
);
"""

VIEWS_SQL = """
-- =========================================================================
-- Knowledge graph views (existing)
-- =========================================================================

CREATE VIEW IF NOT EXISTS v_dashboard AS
SELECT type, COUNT(*) as page_count, SUM(word_count) as total_words
FROM pages WHERE type != 'meta' GROUP BY type;

CREATE VIEW IF NOT EXISTS v_maturity AS
SELECT maturity, COUNT(*) as count, GROUP_CONCAT(slug, ', ') as slugs
FROM pages WHERE type = 'concept' AND maturity IS NOT NULL GROUP BY maturity;

CREATE VIEW IF NOT EXISTS v_entity_connectivity AS
SELECT p.slug, p.title,
       COUNT(DISTINCT pr.to_slug) + COUNT(DISTINCT pr2.from_slug) as connections
FROM pages p
LEFT JOIN page_relations pr ON pr.from_slug = p.slug
LEFT JOIN page_relations pr2 ON pr2.to_slug = p.slug
WHERE p.type = 'entity'
GROUP BY p.slug ORDER BY connections DESC;

CREATE VIEW IF NOT EXISTS v_orphans AS
SELECT p.slug, p.type, p.title FROM pages p
LEFT JOIN page_relations pr ON pr.to_slug = p.slug
LEFT JOIN prose_wikilinks pw ON pw.target = p.slug
WHERE pr.from_slug IS NULL AND pw.from_slug IS NULL AND p.type NOT IN ('meta');

CREATE VIEW IF NOT EXISTS v_phantoms AS
SELECT DISTINCT pw.from_slug, pw.target FROM prose_wikilinks pw
LEFT JOIN pages p ON p.slug = pw.target
WHERE p.slug IS NULL AND pw.is_vault_link = 0;

-- Thin pages: concept/entity pages related to <=1 source/synthesis.
-- "Related" means either direction:
--   • the page declares `sources:` / `sources_consulted:` (outbound has_source / consulted_source)
--   • a source/synthesis cites the page via `concepts:` / `entities:` / `*_involved:`
--     (inbound has_concept / has_entity / involves_concept / involves_entity)
-- Counts distinct related pages across both directions.
CREATE VIEW IF NOT EXISTS v_thin_pages AS
SELECT p.slug, p.type, p.title,
       COUNT(DISTINCT CASE
         WHEN pr.from_slug = p.slug
              AND pr.relation_type IN ('has_source','consulted_source')
           THEN pr.to_slug
         WHEN pr.to_slug = p.slug
              AND pr.relation_type IN ('has_concept','has_entity',
                                        'involves_concept','involves_entity')
           THEN pr.from_slug
       END) AS source_count
FROM pages p
LEFT JOIN page_relations pr ON (
    (pr.from_slug = p.slug
     AND pr.relation_type IN ('has_source','consulted_source'))
    OR
    (pr.to_slug = p.slug
     AND pr.relation_type IN ('has_concept','has_entity',
                               'involves_concept','involves_entity'))
)
WHERE p.type IN ('entity', 'concept')
GROUP BY p.slug HAVING source_count <= 1;

CREATE VIEW IF NOT EXISTS v_confidence AS
SELECT confidence, type, COUNT(*) as count FROM pages
WHERE confidence IS NOT NULL GROUP BY confidence, type;

CREATE VIEW IF NOT EXISTS v_backlinks AS
SELECT target AS slug,
       COUNT(*) AS backlink_count,
       GROUP_CONCAT(DISTINCT from_slug) AS linked_from
FROM prose_wikilinks
WHERE is_vault_link = 0
GROUP BY target;

-- =========================================================================
-- Temporal layer views (new)
-- =========================================================================

-- Most recent log events with pages-created/updated counts.
CREATE VIEW IF NOT EXISTS v_recent_activity AS
SELECT
    le.id,
    le.event_date,
    le.operation,
    le.title,
    le.source_origin,
    le.guided,
    COALESCE((SELECT COUNT(*) FROM log_event_pages lep
              WHERE lep.event_id = le.id AND lep.action = 'created'), 0) AS pages_created,
    COALESCE((SELECT COUNT(*) FROM log_event_pages lep
              WHERE lep.event_id = le.id AND lep.action = 'updated'), 0) AS pages_updated,
    le.touched_page_count
FROM log_events le
ORDER BY le.event_date DESC, le.position DESC;

-- Log integrity: compare claimed totals (from log prose) vs actual junction counts.
CREATE VIEW IF NOT EXISTS v_log_integrity AS
SELECT
    le.id,
    le.event_date,
    le.operation,
    le.title,
    le.claimed_sources_created,
    (SELECT COUNT(*) FROM log_event_pages
     WHERE event_id = le.id AND action = 'created' AND page_type = 'source') AS actual_sources_created,
    le.claimed_entities_created,
    (SELECT COUNT(*) FROM log_event_pages
     WHERE event_id = le.id AND action = 'created' AND page_type = 'entity') AS actual_entities_created,
    le.claimed_concepts_created,
    (SELECT COUNT(*) FROM log_event_pages
     WHERE event_id = le.id AND action = 'created' AND page_type = 'concept') AS actual_concepts_created,
    le.claimed_syntheses_created,
    (SELECT COUNT(*) FROM log_event_pages
     WHERE event_id = le.id AND action = 'created' AND page_type = 'synthesis') AS actual_syntheses_created
FROM log_events le
WHERE le.claimed_sources_created IS NOT NULL
   OR le.claimed_entities_created IS NOT NULL
   OR le.claimed_concepts_created IS NOT NULL
   OR le.claimed_syntheses_created IS NOT NULL;

-- Only rows where claimed != actual — actionable mismatches.
CREATE VIEW IF NOT EXISTS v_log_mismatches AS
SELECT * FROM v_log_integrity
WHERE (claimed_sources_created   IS NOT NULL AND claimed_sources_created   != actual_sources_created)
   OR (claimed_entities_created  IS NOT NULL AND claimed_entities_created  != actual_entities_created)
   OR (claimed_concepts_created  IS NOT NULL AND claimed_concepts_created  != actual_concepts_created)
   OR (claimed_syntheses_created IS NOT NULL AND claimed_syntheses_created != actual_syntheses_created);

-- Page activity: every page with log-touch counts + first/last touch dates.
CREATE VIEW IF NOT EXISTS v_page_activity AS
SELECT
    p.slug, p.type, p.title, p.maturity, p.confidence, p.updated,
    COALESCE(s.touch_count, 0) AS times_touched,
    s.last_touched,
    s.first_touched
FROM pages p
LEFT JOIN (
    SELECT
        lep.page_slug,
        COUNT(*) AS touch_count,
        MAX(le.event_date) AS last_touched,
        MIN(le.event_date) AS first_touched
    FROM log_event_pages lep
    JOIN log_events le ON le.id = lep.event_id
    GROUP BY lep.page_slug
) s ON s.page_slug = p.slug
WHERE p.type != 'meta';

-- Pages ordered by most-recent log touch (for "what did I just work on").
CREATE VIEW IF NOT EXISTS v_recently_touched_pages AS
SELECT slug, type, title, maturity, times_touched, last_touched
FROM v_page_activity
WHERE last_touched IS NOT NULL
ORDER BY last_touched DESC, times_touched DESC;

-- Pages ordered by their frontmatter `updated` field.
CREATE VIEW IF NOT EXISTS v_recent_pages AS
SELECT slug, type, title, maturity, confidence, updated
FROM pages
WHERE type != 'meta' AND updated IS NOT NULL
ORDER BY updated DESC;

-- Concepts/entities not touched by any log event in the last 30 days (or ever).
CREATE VIEW IF NOT EXISTS v_stale_concepts AS
SELECT
    slug, type, title, maturity,
    last_touched,
    CASE
        WHEN last_touched IS NULL THEN NULL
        ELSE CAST(julianday('now') - julianday(last_touched) AS INTEGER)
    END AS days_since_touch
FROM v_page_activity
WHERE type IN ('concept','entity')
  AND (last_touched IS NULL OR julianday('now') - julianday(last_touched) > 30)
ORDER BY last_touched ASC;

-- Per-week ingest / build / link velocity.
CREATE VIEW IF NOT EXISTS v_ingest_velocity AS
SELECT
    strftime('%Y-W%W', event_date) AS week,
    operation,
    COUNT(*) AS event_count,
    SUM((SELECT COUNT(*) FROM log_event_pages lep
         WHERE lep.event_id = le.id AND lep.action = 'created')) AS pages_created_total,
    SUM((SELECT COUNT(*) FROM log_event_pages lep
         WHERE lep.event_id = le.id AND lep.action = 'updated')) AS pages_updated_total
FROM log_events le
GROUP BY week, operation
ORDER BY week DESC, operation;

-- Daily summary across all operations.
CREATE VIEW IF NOT EXISTS v_daily_activity AS
SELECT
    event_date,
    COUNT(*) AS events,
    GROUP_CONCAT(DISTINCT operation) AS operations,
    SUM((SELECT COUNT(*) FROM log_event_pages lep
         WHERE lep.event_id = le.id AND lep.action = 'created')) AS pages_created
FROM log_events le
GROUP BY event_date
ORDER BY event_date DESC;

-- Phantom log references: pages cited in log_event_pages that don't exist in pages table.
-- Filter out vault_doc (expected to live outside pages) and items containing "/"  or "."
-- (paths, not slugs).
CREATE VIEW IF NOT EXISTS v_phantom_log_refs AS
SELECT DISTINCT lep.page_slug, lep.page_type, lep.action
FROM log_event_pages lep
LEFT JOIN pages p ON p.slug = lep.page_slug
WHERE p.slug IS NULL
  AND lep.page_type != 'vault_doc'
  AND lep.page_slug NOT LIKE '%/%'
  AND lep.page_slug NOT LIKE '%.%';

-- =========================================================================
-- Self + agent views
-- =========================================================================

-- Alignment matrix: every pillar with pages reinforcing/weakening/contradicting it.
CREATE VIEW IF NOT EXISTS v_narcis_alignment AS
SELECT
    p.slug            AS pillar,
    p.title           AS pillar_title,
    p.status          AS pillar_status,
    sa.page_slug,
    sa.relation,
    sa.source_event,
    COUNT(*) OVER (PARTITION BY p.slug, sa.relation) AS cnt
FROM self_pillars p
LEFT JOIN self_alignment sa ON sa.pillar_slug = p.slug;

-- Declared stance vs. observed log behaviour (last 30 days).
CREATE VIEW IF NOT EXISTS v_declaration_vs_observation AS
SELECT
    s.slug,
    s.on_topic,
    s.position,
    s.confidence,
    s.status,
    s.last_reaffirmed,
    (SELECT COUNT(*)
       FROM self_alignment sa
       JOIN log_events le ON le.id = CAST(NULLIF(sa.source_event,'') AS INTEGER)
      WHERE sa.page_slug = s.slug
        AND sa.relation = 'reinforces'
        AND julianday('now') - julianday(le.event_date) <= 30) AS aligned_cnt,
    (SELECT COUNT(*)
       FROM self_alignment sa
       JOIN log_events le ON le.id = CAST(NULLIF(sa.source_event,'') AS INTEGER)
      WHERE sa.page_slug = s.slug
        AND sa.relation IN ('weakens','contradicts')
        AND julianday('now') - julianday(le.event_date) <= 30) AS misaligned_cnt
FROM self_stances s;

-- Heuristics + evidence count (heuristics with 0 evidence → flag).
CREATE VIEW IF NOT EXISTS v_agent_heuristics_evidence AS
SELECT
    id,
    slug,
    rule,
    confidence,
    status,
    dispute_reason,
    CASE
        WHEN evidence_events IS NULL OR evidence_events = '' THEN 0
        ELSE json_array_length(evidence_events)
    END AS evidence_count
FROM agent_heuristics;

-- Open commitments sorted by urgency.
CREATE VIEW IF NOT EXISTS v_open_commitments AS
SELECT
    slug,
    title,
    due_date,
    progress_marker,
    CASE
        WHEN due_date IS NULL OR due_date = '' THEN NULL
        ELSE CAST(julianday(due_date) - julianday('now') AS INTEGER)
    END AS days_left
FROM self_commitments
WHERE status = 'active'
ORDER BY
    CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END,
    due_date ASC;

-- Self history: chronological snapshots per page, with previous body_hash for diff.
CREATE VIEW IF NOT EXISTS v_self_history AS
SELECT
    page_slug,
    taken_at,
    meet_event_id,
    body_hash,
    LAG(body_hash)  OVER (PARTITION BY page_slug ORDER BY taken_at) AS prev_hash,
    LAG(taken_at)   OVER (PARTITION BY page_slug ORDER BY taken_at) AS prev_taken_at
FROM self_snapshots;

-- Active self context: the bundle read by skills at startup.
-- Four sections packed as JSON arrays so a single SELECT covers the whole context.
CREATE VIEW IF NOT EXISTS v_self_active_context AS
SELECT
    (SELECT json_group_array(json_object(
        'slug', slug, 'title', title, 'since', since))
       FROM self_pillars WHERE status = 'active')       AS pillars_json,
    (SELECT json_group_array(json_object(
        'slug', slug, 'on_topic', on_topic, 'position', position,
        'confidence', confidence))
       FROM self_stances WHERE status = 'active')       AS stances_json,
    (SELECT json_group_array(json_object(
        'slug', slug, 'description', description, 'kind', kind))
       FROM self_constraints WHERE status = 'active')   AS constraints_json,
    (SELECT json_group_array(json_object(
        'slug', slug, 'rule', rule, 'category', category,
        'examples_yes', examples_yes, 'examples_no', examples_no))
       FROM voice_rules WHERE status = 'active')        AS voice_rules_json;
"""


# ---------------------------------------------------------------------------
# Parsing — pages
# ---------------------------------------------------------------------------

def parse_md_file(filepath: Path) -> dict | None:
    """Parse a markdown file into frontmatter dict + prose body."""
    text = filepath.read_text(encoding="utf-8")

    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None

    try:
        fm = yaml.safe_load(parts[1])
    except yaml.YAMLError:
        print(f"  WARN: bad YAML in {filepath.name}")
        return None

    if not isinstance(fm, dict) or "type" not in fm:
        return None

    prose = parts[2].strip()
    fm["_prose"] = prose
    fm["_word_count"] = len(prose.split())
    fm["_file_path"] = str(filepath.relative_to(filepath.parent.parent))
    fm["_slug"] = filepath.stem
    return fm


def extract_wikilinks(prose: str) -> list[dict]:
    """Extract all [[target|display]] wikilinks from prose.

    Strips fenced code blocks and inline code first so `[[example]]` tokens
    inside schema documentation or query snippets don't get indexed as links.
    Splits `target#anchor` into `target` + anchor (anchor stored in display_text
    when no explicit display label is given) so the phantom-check is driven by
    the page slug, not the heading.
    """
    cleaned = FENCED_BLOCK_RE.sub("", prose)
    cleaned = INLINE_CODE_RE.sub("", cleaned)

    results = []
    for m in WIKILINK_RE.finditer(cleaned):
        raw_target = m.group(1).strip()
        display = m.group(2).strip() if m.group(2) else None

        # Split off heading anchor so the phantom check compares page slugs.
        if "#" in raw_target:
            target, anchor = raw_target.split("#", 1)
            target = target.strip()
            anchor = anchor.strip()
            if display is None and anchor:
                display = f"#{anchor}"
        else:
            target = raw_target

        is_vault = 1 if "/" in target else 0
        results.append({"target": target, "display_text": display, "is_vault_link": is_vault})
    return results


# ---------------------------------------------------------------------------
# Parsing — log.md → structured events
# ---------------------------------------------------------------------------

def _split_top_level_commas(text: str) -> list[str]:
    """Split on commas at paren-depth 0. Handles nested parens."""
    result = []
    depth = 0
    current = []
    for ch in text:
        if ch == "(":
            depth += 1
            current.append(ch)
        elif ch == ")":
            depth = max(0, depth - 1)
            current.append(ch)
        elif ch == "," and depth == 0:
            result.append("".join(current).strip())
            current = []
        else:
            current.append(ch)
    if current:
        result.append("".join(current).strip())
    return [p for p in result if p]


def _extract_slugs_from_list(text: str) -> list[str]:
    """
    Extract slugs from text like:
      'skill-era, leverage, validate-before-build'
      'skill-era (added distribution section), leverage (...)'
      '(none — skipped per user direction)'
      '7 (alteramens-manifest, naval-framework, ...)'
    Returns [] for "(none)" / "(none — ...)".
    """
    text = text.strip()
    if not text:
        return []

    # Handle "N (a, b, c)" form — extract list from parens.
    count_list = re.match(r"^\d+\s*\((.+)\)\s*$", text)
    if count_list:
        text = count_list.group(1)

    # Handle "(none ...)" form — empty list.
    if text.lower().startswith("(none"):
        return []

    parts = _split_top_level_commas(text)
    slugs: list[str] = []
    for p in parts:
        # Strip ALL parenthetical annotations: "foo (bar (baz))" → "foo"
        cleaned = re.sub(r"\([^)]*\)", "", p).strip()
        # Normalize remaining whitespace
        cleaned = re.sub(r"\s+", "-", cleaned).strip("-")
        if SLUG_RE.match(cleaned):
            slugs.append(cleaned)
    return slugs


def _parse_totals(text: str) -> dict:
    """
    Parse a Totals line. Examples:
      'Totals: 6 sources, 5 entities, 14 concepts, 2 syntheses = 27 pages'
      'Totals: 1 source, 5 concepts = 6 new pages + 3 pages updated'
      'Totals: 2 entities, 1 wiki source updated, 1 synthesis updated, 2 vault docs updated'
    Returns dict with keys: sources_created, entities_created, concepts_created,
    syntheses_created, pages_updated (when extractable).
    """
    result: dict = {}
    text = text.strip().strip("*").strip()
    if not text.lower().startswith("totals:"):
        return result
    text = text[len("Totals:"):].strip()

    # Split at first '=' to isolate the breakdown from the summary.
    left = text.split("=", 1)[0]
    parts = _split_top_level_commas(left)

    for p in parts:
        m = re.match(r"^\s*(\d+)\s+(\w+)(.*)$", p)
        if not m:
            continue
        count = int(m.group(1))
        word = m.group(2).lower()
        rest = m.group(3).lower()

        if word in ("source", "sources"):
            if "updated" in rest:
                continue  # "1 wiki source updated" — don't count as created
            result.setdefault("sources_created", count)
        elif word in ("entity", "entities"):
            if "updated" in rest:
                continue
            result.setdefault("entities_created", count)
        elif word in ("concept", "concepts"):
            if "updated" in rest:
                continue
            result.setdefault("concepts_created", count)
        elif word in ("synthesis", "syntheses"):
            if "updated" in rest:
                continue
            result.setdefault("syntheses_created", count)

    # Try to extract "+ N pages updated" from right side
    right = text.split("=", 1)[1] if "=" in text else ""
    m = re.search(r"(\d+)\s+(?:pages|concepts)\s+updated", right.lower())
    if m:
        result["pages_updated"] = int(m.group(1))

    return result


LABEL_ACTION_MAP = [
    # (label prefix, action, page_type)
    ("Sources created",      "created",  "source"),
    ("Source page created",  "created",  "source"),
    ("Sources updated",      "updated",  "source"),
    ("Source updated",       "updated",  "source"),
    ("Entities created",     "created",  "entity"),
    ("Entities updated",     "updated",  "entity"),
    ("Entity updated",       "updated",  "entity"),
    ("Concepts created",     "created",  "concept"),
    ("Concepts updated",     "updated",  "concept"),
    ("Concept updated",      "updated",  "concept"),
    ("Syntheses created",    "created",  "synthesis"),
    ("Syntheses updated",    "updated",  "synthesis"),
    ("Synthesis created",    "created",  "synthesis"),
    ("Synthesis updated",    "updated",  "synthesis"),
    ("Sources consulted",    "consulted","source"),
    ("Concepts involved",    "involved", "concept"),
    ("Entities involved",    "involved", "entity"),
]


def _process_bullet(ev: dict, content: str):
    """Process one bullet line of a log entry, mutating ev in place."""
    bare = content.strip().strip("*").strip()

    # Source: <origin>
    if ev.get("source_origin") is None:
        m = re.match(r"^Source:\s*(.+)$", content, re.IGNORECASE)
        if m:
            origin = m.group(1).strip()
            # If origin has an annotation in parens at the end, strip it
            origin = re.sub(r"\s*\([^)]*\)\s*$", "", origin).strip()
            ev["source_origin"] = origin
            return

    # Guided ingest / seeded: guided: false
    lower = content.lower()
    if lower.startswith("guided ingest"):
        ev["guided"] = 1
        return
    if "guided: false" in lower or "all seeded pages marked" in lower:
        ev["guided"] = 0
        return

    # Totals
    if bare.lower().startswith("totals:"):
        totals = _parse_totals(bare)
        if totals.get("sources_created") is not None:
            ev["claimed_sources_created"] = totals["sources_created"]
        if totals.get("entities_created") is not None:
            ev["claimed_entities_created"] = totals["entities_created"]
        if totals.get("concepts_created") is not None:
            ev["claimed_concepts_created"] = totals["concepts_created"]
        if totals.get("syntheses_created") is not None:
            ev["claimed_syntheses_created"] = totals["syntheses_created"]
        if totals.get("pages_updated") is not None:
            ev["claimed_pages_updated"] = totals["pages_updated"]
        return

    # Labelled slug lists
    for label, action, ptype in LABEL_ACTION_MAP:
        prefix = label + ":"
        if content.startswith(prefix):
            value = content[len(prefix):].strip()
            slugs = _extract_slugs_from_list(value)
            for slug in slugs:
                ev["page_refs"].append((slug, action, ptype))
            return

    # Vault doc created/updated: path
    m = re.match(r"^Vault (?:project )?doc (created|updated):\s*(.+)$", content, re.IGNORECASE)
    if m:
        action = m.group(1).lower()
        path = m.group(2).strip()
        ev["page_refs"].append((path, action, "vault_doc"))
        return

    # "Query: ..." → store as question on the event
    m = re.match(r'^Query:\s*"?(.+?)"?$', content, re.IGNORECASE)
    if m and ev.get("question") is None:
        ev["question"] = m.group(1).strip()
        return


def parse_log_md(log_path: Path) -> list[dict]:
    """Parse log.md into a list of structured event dicts."""
    if not log_path.exists():
        return []

    text = log_path.read_text(encoding="utf-8")
    # Strip frontmatter
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2]

    lines = text.split("\n")
    events: list[dict] = []
    current: dict | None = None
    current_body: list[str] = []
    position = 0

    def finalize(ev: dict, body: list[str]):
        ev["body"] = "\n".join(body).strip()
        for line in body:
            stripped = line.strip()
            if not stripped.startswith("-"):
                continue
            content = stripped[1:].strip()
            if not content:
                continue
            _process_bullet(ev, content)

    for line in lines:
        m = LOG_HEADER_RE.match(line)
        if m:
            if current is not None:
                finalize(current, current_body)
                events.append(current)
            current = {
                "event_date": m.group(1),
                "operation": m.group(2).strip(),
                "title": m.group(3).strip(),
                "source_origin": None,
                "guided": None,
                "question": None,
                "claimed_sources_created": None,
                "claimed_entities_created": None,
                "claimed_concepts_created": None,
                "claimed_syntheses_created": None,
                "claimed_pages_updated": None,
                "page_refs": [],  # list of (slug, action, page_type)
                "position": position,
            }
            current_body = []
            position += 1
        elif current is not None:
            current_body.append(line)

    if current is not None:
        finalize(current, current_body)
        events.append(current)

    return events


# ---------------------------------------------------------------------------
# Database population
# ---------------------------------------------------------------------------

def create_db(db_path: Path) -> sqlite3.Connection:
    """Create a fresh database.

    Preserves two tables across rebuilds because they hold history that cannot
    be reconstructed from the markdown source of truth:
      - sync_log       — time-series of past sync runs
      - self_snapshots — pre-edit snapshots taken at each /faber-meet
    """
    preserved_sync: list = []
    preserved_snapshots: list = []
    if db_path.exists():
        try:
            existing = sqlite3.connect(str(db_path))
            preserved_sync = existing.execute(
                "SELECT synced_at, pages_synced, relations_synced, "
                "wikilinks_synced, duration_ms FROM sync_log"
            ).fetchall()
            try:
                preserved_snapshots = existing.execute(
                    "SELECT taken_at, meet_event_id, page_slug, "
                    "frontmatter_json, body_hash, body FROM self_snapshots"
                ).fetchall()
            except sqlite3.Error:
                preserved_snapshots = []
            existing.close()
        except sqlite3.Error:
            preserved_sync = []
            preserved_snapshots = []
        db_path.unlink()

    conn = sqlite3.connect(str(db_path))
    conn.executescript(SCHEMA_SQL)
    conn.executescript(INDEX_SQL)
    conn.executescript(FTS_SQL)
    conn.executescript(VIEWS_SQL)

    for row in preserved_sync:
        conn.execute(
            "INSERT INTO sync_log (synced_at, pages_synced, relations_synced, "
            "wikilinks_synced, duration_ms) VALUES (?,?,?,?,?)",
            row,
        )

    for row in preserved_snapshots:
        conn.execute(
            "INSERT INTO self_snapshots "
            "(taken_at, meet_event_id, page_slug, frontmatter_json, body_hash, body) "
            "VALUES (?,?,?,?,?,?)",
            row,
        )

    conn.commit()
    return conn


def insert_page(conn: sqlite3.Connection, fm: dict):
    slug = fm["_slug"]
    ptype = fm.get("type", "meta")

    conn.execute(
        """INSERT OR REPLACE INTO pages
           (slug, title, type, file_path, format, origin, source_ref, ingested,
            guided, category, first_seen, status, maturity, confidence,
            trigger_type, question, created, updated, prose, word_count)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            slug,
            fm.get("title", slug),
            ptype,
            fm["_file_path"],
            fm.get("format"),
            fm.get("origin"),
            fm.get("source_ref"),
            str(fm["ingested"]) if fm.get("ingested") else None,
            1 if fm.get("guided") else (0 if fm.get("guided") is not None else None),
            fm.get("category"),
            fm.get("first_seen"),
            fm.get("status"),
            fm.get("maturity"),
            fm.get("confidence"),
            fm.get("trigger") if ptype == "synthesis" else fm.get("trigger_type"),
            fm.get("question"),
            str(fm["created"]) if fm.get("created") else None,
            str(fm["updated"]) if fm.get("updated") else None,
            fm["_prose"],
            fm["_word_count"],
        ),
    )

    conn.execute(
        "INSERT INTO fts_content (slug, title, type, category, prose) VALUES (?,?,?,?,?)",
        (slug, fm.get("title", slug), ptype, fm.get("category", ""), fm["_prose"]),
    )


def insert_arrays(conn: sqlite3.Connection, fm: dict):
    slug = fm["_slug"]

    for i, claim in enumerate(fm.get("key_claims") or []):
        conn.execute(
            "INSERT INTO key_claims (source_slug, claim, position) VALUES (?,?,?)",
            (slug, str(claim), i),
        )
        # Mirror into fts_claims
        conn.execute(
            "INSERT INTO fts_claims (source_slug, claim) VALUES (?,?)",
            (slug, str(claim)),
        )

    for alias in fm.get("aliases") or []:
        conn.execute(
            "INSERT OR IGNORE INTO aliases (entity_slug, alias) VALUES (?,?)",
            (slug, str(alias)),
        )

    for ref in fm.get("vault_refs") or []:
        conn.execute(
            "INSERT OR IGNORE INTO vault_refs (page_slug, vault_path, ref_type) VALUES (?,?,?)",
            (slug, str(ref), "vault_ref"),
        )

    for app in fm.get("applications") or []:
        conn.execute(
            "INSERT OR IGNORE INTO vault_refs (page_slug, vault_path, ref_type) VALUES (?,?,?)",
            (slug, str(app), "application"),
        )

    for img in fm.get("images") or []:
        if isinstance(img, dict):
            conn.execute(
                "INSERT OR IGNORE INTO images (source_slug, path, description) VALUES (?,?,?)",
                (slug, img.get("path", ""), img.get("description", "")),
            )
        elif isinstance(img, str):
            conn.execute(
                "INSERT OR IGNORE INTO images (source_slug, path, description) VALUES (?,?,?)",
                (slug, img, ""),
            )


def insert_relations(conn: sqlite3.Connection, fm: dict) -> int:
    slug = fm["_slug"]
    ptype = fm.get("type", "")
    count = 0

    relation_map = {
        "source": {
            "entities": "has_entity",
            "concepts": "has_concept",
        },
        "entity": {
            "sources": "has_source",
            "related_entities": "related_entity",
            "related_concepts": "related_concept",
        },
        "concept": {
            "sources": "has_source",
            "entities": "has_entity",
            "related": "related_to",
            "contradictions": "contradicts",
        },
        "synthesis": {
            "sources_consulted": "consulted_source",
            "concepts_involved": "involves_concept",
            "entities_involved": "involves_entity",
        },
    }

    for field, rel_type in (relation_map.get(ptype) or {}).items():
        for target in fm.get(field) or []:
            conn.execute(
                "INSERT OR IGNORE INTO page_relations (from_slug, to_slug, relation_type) VALUES (?,?,?)",
                (slug, str(target), rel_type),
            )
            count += 1

    return count


def insert_wikilinks(conn: sqlite3.Connection, slug: str, prose: str) -> int:
    links = extract_wikilinks(prose)
    for lnk in links:
        conn.execute(
            "INSERT INTO prose_wikilinks (from_slug, target, display_text, is_vault_link) VALUES (?,?,?,?)",
            (slug, lnk["target"], lnk["display_text"], lnk["is_vault_link"]),
        )
    return len(links)


# ---------------------------------------------------------------------------
# Self + agent aux-table population
# ---------------------------------------------------------------------------

def _json_or_none(value) -> str | None:
    """Serialize a list/dict to JSON; return None for empty/None."""
    if value is None:
        return None
    if isinstance(value, (list, dict)) and not value:
        return None
    return json.dumps(value, ensure_ascii=False)


def insert_self_aux(conn: sqlite3.Connection, fm: dict) -> int:
    """Populate self_* / voice_rules / agent_heuristics from a self/agent page.

    Recognized frontmatter top-level keys (all optional lists of dicts):
      pillars, stances, commitments, constraints, voice_rules, heuristics

    Each item's `slug` is its primary key. Items missing a slug are skipped with a warning.
    Returns the number of aux rows inserted.

    Alignment entries are handled by `insert_alignment_fm` and accepted on ANY page type.
    """
    page_slug = fm["_slug"]
    ptype = fm.get("type")
    if ptype not in ("self", "agent"):
        return 0

    inserted = 0

    for p in fm.get("pillars") or []:
        if not isinstance(p, dict) or not p.get("slug"):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO self_pillars
               (slug, title, since, status, evidence_events, page_slug, last_synced)
               VALUES (?,?,?,?,?,?, datetime('now'))""",
            (
                p["slug"],
                p.get("title", p["slug"]),
                str(p["since"]) if p.get("since") else None,
                p.get("status", "active"),
                int(p.get("evidence_events", 0) or 0),
                page_slug,
            ),
        )
        inserted += 1

    for s in fm.get("stances") or []:
        if not isinstance(s, dict) or not s.get("slug"):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO self_stances
               (slug, on_topic, position, confidence, status, last_reaffirmed, page_slug, last_synced)
               VALUES (?,?,?,?,?,?,?, datetime('now'))""",
            (
                s["slug"],
                s.get("on_topic", ""),
                s.get("position", ""),
                s.get("confidence"),
                s.get("status", "active"),
                str(s["last_reaffirmed"]) if s.get("last_reaffirmed") else None,
                page_slug,
            ),
        )
        inserted += 1

    for c in fm.get("commitments") or []:
        if not isinstance(c, dict) or not c.get("slug"):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO self_commitments
               (slug, title, due_date, status, progress_marker, page_slug, last_synced)
               VALUES (?,?,?,?,?,?, datetime('now'))""",
            (
                c["slug"],
                c.get("title", c["slug"]),
                str(c["due_date"]) if c.get("due_date") else None,
                c.get("status", "active"),
                c.get("progress_marker"),
                page_slug,
            ),
        )
        inserted += 1

    for k in fm.get("constraints") or []:
        if not isinstance(k, dict) or not k.get("slug"):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO self_constraints
               (slug, description, kind, status, page_slug, last_synced)
               VALUES (?,?,?,?,?, datetime('now'))""",
            (
                k["slug"],
                k.get("description", ""),
                k.get("kind"),
                k.get("status", "active"),
                page_slug,
            ),
        )
        inserted += 1

    for v in fm.get("voice_rules") or []:
        if not isinstance(v, dict) or not v.get("slug"):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO voice_rules
               (slug, rule, category, examples_yes, examples_no, status, page_slug, last_synced)
               VALUES (?,?,?,?,?,?,?, datetime('now'))""",
            (
                v["slug"],
                v.get("rule", ""),
                v.get("category"),
                _json_or_none(v.get("examples_yes")),
                _json_or_none(v.get("examples_no")),
                v.get("status", "active"),
                page_slug,
            ),
        )
        inserted += 1

    for h in fm.get("heuristics") or []:
        if not isinstance(h, dict):
            continue
        hslug = h.get("slug")
        if not hslug:
            continue
        conn.execute(
            """INSERT OR REPLACE INTO agent_heuristics
               (slug, rule, first_observed, evidence_events, confidence, status,
                dispute_reason, page_slug, last_synced)
               VALUES (?,?,?,?,?,?,?,?, datetime('now'))""",
            (
                hslug,
                h.get("rule", ""),
                str(h["first_observed"]) if h.get("first_observed") else None,
                _json_or_none(h.get("evidence_events")),
                h.get("confidence"),
                h.get("status", "active"),
                h.get("dispute_reason"),
                page_slug,
            ),
        )
        inserted += 1

    return inserted


def insert_alignment_fm(conn: sqlite3.Connection, fm: dict) -> int:
    """Populate `self_alignment` from any page's `alignment:` frontmatter.

    Accepted on every page type (source / entity / concept / synthesis / self / agent).
    Each entry is a dict with:
      - pillar_slug  (alias: pillar)   — REQUIRED
      - relation                       — REQUIRED: reinforces | weakens | contradicts | neutral
      - page_slug                      — OPTIONAL; defaults to the page declaring the alignment
      - source_event                   — OPTIONAL; log event id / ISO date / free text trail
    """
    own_slug = fm["_slug"]
    inserted = 0

    for a in fm.get("alignment") or []:
        if not isinstance(a, dict):
            continue
        tgt = a.get("page_slug") or own_slug
        pillar = a.get("pillar_slug") or a.get("pillar")
        rel = a.get("relation")
        if not (tgt and pillar and rel):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO self_alignment
               (page_slug, pillar_slug, relation, source_event)
               VALUES (?,?,?,?)""",
            (tgt, pillar, rel, a.get("source_event")),
        )
        inserted += 1

    return inserted


def insert_log_events(conn: sqlite3.Connection, events: list[dict]) -> tuple[int, int]:
    """Insert parsed log events + junction rows. Returns (events, junction_rows).

    Performs source-slug reconciliation: ingest events that mention a Source URL
    but don't list the source slug explicitly get matched against pages.source_ref.
    Same for source_ref by exact match against page.title for the source page.
    """
    event_count = 0
    junction_count = 0

    # Build origin → source-slug index from already-loaded pages.
    origin_to_slug: dict[str, str] = {}
    for slug, source_ref in conn.execute(
        "SELECT slug, source_ref FROM pages WHERE type = 'source' AND source_ref IS NOT NULL"
    ).fetchall():
        origin_to_slug[source_ref] = slug

    # Also build a title → source-slug index for fallback matching.
    title_to_slug: dict[str, str] = {}
    for slug, title in conn.execute(
        "SELECT slug, title FROM pages WHERE type = 'source'"
    ).fetchall():
        if title:
            title_to_slug[title.strip().lower()] = slug

    for ev in events:
        # Reconciliation pass for ingest events.
        if ev["operation"] == "ingest" and ev.get("source_origin"):
            has_source_created = any(
                action == "created" and ptype == "source"
                for _, action, ptype in ev["page_refs"]
            )
            if not has_source_created:
                origin = ev["source_origin"]
                slug = origin_to_slug.get(origin)
                if not slug:
                    # Try fuzzy: ingest title may match a source page title.
                    slug = title_to_slug.get(ev["title"].strip().lower())
                if slug:
                    ev["page_refs"].append((slug, "created", "source"))

        cur = conn.execute(
            """INSERT INTO log_events
               (event_date, operation, title, source_origin, guided, body, position,
                claimed_sources_created, claimed_entities_created, claimed_concepts_created,
                claimed_syntheses_created, claimed_pages_updated, touched_page_count)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                ev["event_date"],
                ev["operation"],
                ev["title"],
                ev.get("source_origin"),
                ev.get("guided"),
                ev["body"],
                ev["position"],
                ev.get("claimed_sources_created"),
                ev.get("claimed_entities_created"),
                ev.get("claimed_concepts_created"),
                ev.get("claimed_syntheses_created"),
                ev.get("claimed_pages_updated"),
                len(ev["page_refs"]),
            ),
        )
        event_id = cur.lastrowid
        event_count += 1

        # Mirror into FTS
        conn.execute(
            "INSERT INTO fts_log (event_id, event_date, operation, title, body) VALUES (?,?,?,?,?)",
            (event_id, ev["event_date"], ev["operation"], ev["title"], ev["body"]),
        )

        for slug, action, ptype in ev["page_refs"]:
            try:
                conn.execute(
                    "INSERT OR IGNORE INTO log_event_pages (event_id, page_slug, action, page_type) "
                    "VALUES (?,?,?,?)",
                    (event_id, slug, action, ptype),
                )
                junction_count += 1
            except sqlite3.Error as e:
                print(f"  WARN: log junction insert failed for {slug}/{action}: {e}")

    return event_count, junction_count


# ---------------------------------------------------------------------------
# Index generation
# ---------------------------------------------------------------------------

def generate_index(conn: sqlite3.Connection, wiki_dir: Path):
    """Generate a compact index.md from the database."""

    rows = conn.execute("SELECT * FROM v_dashboard ORDER BY type").fetchall()
    total = sum(r[1] for r in rows)

    recent = conn.execute(
        """SELECT slug, title, format, origin FROM pages
           WHERE type = 'source' ORDER BY ingested DESC LIMIT 5"""
    ).fetchall()

    top_entities = conn.execute(
        "SELECT slug, title, connections FROM v_entity_connectivity LIMIT 5"
    ).fetchall()

    maturity = conn.execute("SELECT * FROM v_maturity").fetchall()

    confidence = conn.execute(
        "SELECT confidence, SUM(count) as total FROM v_confidence GROUP BY confidence"
    ).fetchall()

    image_count = conn.execute("SELECT COUNT(*) FROM images").fetchone()[0]

    # NEW: recent temporal activity
    recent_events = conn.execute(
        """SELECT event_date, operation, title, pages_created, pages_updated
           FROM v_recent_activity LIMIT 5"""
    ).fetchall()

    # NEW: top recently-touched pages (last 14 days)
    recently_touched = conn.execute(
        """SELECT slug, type, title, times_touched, last_touched
           FROM v_recently_touched_pages
           WHERE julianday('now') - julianday(last_touched) <= 14
           LIMIT 5"""
    ).fetchall()

    lines = [
        "---",
        "title: Faber Index",
        "type: meta",
        f"updated: {time.strftime('%Y-%m-%d')}",
        f"total_pages: {total}",
        "generated: true",
        "---",
        "",
        "# Faber Index",
        "",
        f"Auto-generated by `faber-sync`. **{total} pages** in the wiki.",
        "",
        "| Type | Count | Words |",
        "|------|-------|-------|",
    ]
    for ptype, count, words in rows:
        lines.append(f"| {ptype.title()} | {count} | {words or 0:,} |")
    lines.append(f"| **Total** | **{total}** | **{sum(r[2] or 0 for r in rows):,}** |")

    lines += ["", "## Recent Sources", ""]
    for slug, title, fmt, origin in recent:
        lines.append(f"- [[{slug}]] — {title} [{fmt}, {origin}]")

    lines += ["", "## Top Entities (by connections)", ""]
    for slug, title, conns in top_entities:
        lines.append(f"- [[{slug}]] — {title} ({conns} connections)")

    lines += ["", "## Concept Maturity", ""]
    mat_dict = {m: c for m, c, _ in maturity}
    for level in ("seed", "developing", "mature", "challenged"):
        lines.append(f"- **{level.title()}:** {mat_dict.get(level, 0)}")

    lines += ["", "## Confidence Distribution", ""]
    conf_dict = {c: t for c, t in confidence}
    for level in ("high", "medium", "low"):
        lines.append(f"- **{level.title()}:** {conf_dict.get(level, 0)}")

    if image_count > 0:
        lines += ["", f"## Images: {image_count}", ""]

    if recent_events:
        lines += ["", "## Recent Activity", ""]
        for event_date, operation, title, created, updated in recent_events:
            lines.append(
                f"- **{event_date}** `{operation}` — {title} "
                f"(+{created} created, ~{updated} updated)"
            )

    if recently_touched:
        lines += ["", "## Recently Touched Pages (last 14d)", ""]
        for slug, ptype, title, touches, last in recently_touched:
            lines.append(f"- [[{slug}]] — {title} [{ptype}, {touches}× touched, last {last}]")

    lines += [
        "",
        "---",
        "",
        "*For full page listings, query `faber.db` or use `/faber-query`. "
        "For a session wake-up briefing, use `/faber-brief`.*",
        "",
    ]

    index_path = wiki_dir / "index.md"
    index_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  Generated index.md ({total} pages)")


# ---------------------------------------------------------------------------
# Main sync
# ---------------------------------------------------------------------------

def sync(wiki_dir: Path, generate_index_flag: bool = True):
    """Main sync: parse all .md → populate faber.db → optionally regenerate index.md."""
    start = time.time()
    db_path = wiki_dir / DB_NAME

    print(f"Faber Sync: {wiki_dir}")
    print(f"  Database: {db_path}")

    conn = create_db(db_path)

    # --- Pages layer ---
    md_files = []
    for subdir in ("sources", "entities", "concepts", "syntheses", "self", "agent", "mocs"):
        d = wiki_dir / subdir
        if d.exists():
            md_files.extend(d.glob("*.md"))

    pages_synced = 0
    relations_synced = 0
    wikilinks_synced = 0
    self_aux_synced = 0
    alignment_synced = 0

    parsed_pages: list[dict] = []

    # Pass 1: insert all pages (so self_pillars is populated before alignment FK checks).
    for filepath in sorted(md_files):
        fm = parse_md_file(filepath)
        if fm is None:
            print(f"  SKIP: {filepath.name} (no valid frontmatter)")
            continue

        insert_page(conn, fm)
        insert_arrays(conn, fm)
        relations_synced += insert_relations(conn, fm)
        wikilinks_synced += insert_wikilinks(conn, fm["_slug"], fm["_prose"])
        self_aux_synced += insert_self_aux(conn, fm)
        parsed_pages.append(fm)
        pages_synced += 1

    # Pass 2: alignment — runs after self_pillars is fully populated.
    for fm in parsed_pages:
        alignment_synced += insert_alignment_fm(conn, fm)

    # --- Temporal layer ---
    log_path = wiki_dir / LOG_FILENAME
    log_events = parse_log_md(log_path)
    log_events_synced, log_junction_synced = insert_log_events(conn, log_events)

    # --- Sync record ---
    duration_ms = int((time.time() - start) * 1000)
    conn.execute(
        "INSERT INTO sync_log (pages_synced, relations_synced, wikilinks_synced, "
        "log_events_synced, duration_ms) VALUES (?,?,?,?,?)",
        (pages_synced, relations_synced, wikilinks_synced, log_events_synced, duration_ms),
    )

    conn.commit()

    if generate_index_flag:
        generate_index(conn, wiki_dir)

    conn.close()

    print(
        f"  Synced: {pages_synced} pages, {relations_synced} relations, "
        f"{wikilinks_synced} wikilinks, {log_events_synced} log events "
        f"({log_junction_synced} page refs), {self_aux_synced} self/agent rows, "
        f"{alignment_synced} alignment rows"
    )
    print(f"  Duration: {duration_ms}ms")
    return pages_synced, relations_synced, wikilinks_synced, log_events_synced


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync Faber wiki to SQLite index")
    parser.add_argument("--wiki-dir", type=Path, default=WIKI_DIR_DEFAULT, help="Path to wiki/ directory")
    parser.add_argument("--no-index", action="store_true", help="Skip index.md generation")
    args = parser.parse_args()

    sync(args.wiki_dir, generate_index_flag=not args.no_index)
