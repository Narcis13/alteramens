#!/usr/bin/env python3
"""
faber_sync.py — Parse all wiki/*.md files and populate faber.db (SQLite index).

The .md files are ALWAYS the source of truth. The .db is a derived index
that can be deleted and rebuilt at any time.

Usage:
    python3 wiki/faber_sync.py [--wiki-dir wiki/] [--generate-index]
"""

import argparse
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
META_FILES = {"FABER.md", "index.md", "log.md"}
WIKILINK_RE = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")

SCHEMA_SQL = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS pages (
    slug            TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL
                    CHECK(type IN ('source','entity','concept','synthesis','meta')),
    file_path       TEXT NOT NULL,
    format          TEXT,
    origin          TEXT,
    source_ref      TEXT,
    ingested        TEXT,
    guided          INTEGER,
    category        TEXT,
    first_seen      TEXT,
    status          TEXT
                    CHECK(status IS NULL OR status IN ('active','historical','deprecated')),
    maturity        TEXT
                    CHECK(maturity IS NULL OR maturity IN ('seed','developing','mature','challenged','draft')),
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

CREATE TABLE IF NOT EXISTS sync_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    synced_at       TEXT DEFAULT (datetime('now')),
    pages_synced    INTEGER,
    relations_synced INTEGER,
    wikilinks_synced INTEGER,
    duration_ms     INTEGER
);
"""

INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_claims_source ON key_claims(source_slug);
CREATE INDEX IF NOT EXISTS idx_aliases_alias ON aliases(alias);
CREATE INDEX IF NOT EXISTS idx_relations_to ON page_relations(to_slug);
CREATE INDEX IF NOT EXISTS idx_relations_type ON page_relations(relation_type);
CREATE INDEX IF NOT EXISTS idx_wikilinks_from ON prose_wikilinks(from_slug);
CREATE INDEX IF NOT EXISTS idx_wikilinks_target ON prose_wikilinks(target);
"""

FTS_SQL = """
CREATE VIRTUAL TABLE IF NOT EXISTS fts_content USING fts5(
    slug UNINDEXED,
    title,
    type UNINDEXED,
    category,
    prose,
    tokenize='porter unicode61'
);
"""

VIEWS_SQL = """
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

CREATE VIEW IF NOT EXISTS v_thin_pages AS
SELECT p.slug, p.type, p.title, COUNT(DISTINCT pr.from_slug) as source_count
FROM pages p
LEFT JOIN page_relations pr ON (
    (pr.to_slug = p.slug AND pr.relation_type IN ('has_source','consulted_source'))
    OR (pr.from_slug = p.slug AND pr.relation_type IN ('has_entity','has_concept'))
)
WHERE p.type IN ('entity', 'concept')
GROUP BY p.slug HAVING source_count <= 1;

CREATE VIEW IF NOT EXISTS v_confidence AS
SELECT confidence, type, COUNT(*) as count FROM pages
WHERE confidence IS NOT NULL GROUP BY confidence, type;
"""


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_md_file(filepath: Path) -> dict | None:
    """Parse a markdown file into frontmatter dict + prose body."""
    text = filepath.read_text(encoding="utf-8")

    # Split frontmatter from prose
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
    """Extract all [[target|display]] wikilinks from prose."""
    results = []
    for m in WIKILINK_RE.finditer(prose):
        target = m.group(1).strip()
        display = m.group(2).strip() if m.group(2) else None
        is_vault = 1 if "/" in target else 0
        results.append({"target": target, "display_text": display, "is_vault_link": is_vault})
    return results


# ---------------------------------------------------------------------------
# Database population
# ---------------------------------------------------------------------------

def create_db(db_path: Path) -> sqlite3.Connection:
    """Create a fresh database with the full schema."""
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(str(db_path))
    conn.executescript(SCHEMA_SQL)
    conn.executescript(INDEX_SQL)
    conn.executescript(FTS_SQL)
    conn.executescript(VIEWS_SQL)
    return conn


def insert_page(conn: sqlite3.Connection, fm: dict):
    """Insert a page row from parsed frontmatter."""
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

    # FTS
    conn.execute(
        "INSERT INTO fts_content (slug, title, type, category, prose) VALUES (?,?,?,?,?)",
        (slug, fm.get("title", slug), ptype, fm.get("category", ""), fm["_prose"]),
    )


def insert_arrays(conn: sqlite3.Connection, fm: dict):
    """Insert key_claims, aliases, vault_refs."""
    slug = fm["_slug"]

    # key_claims (source pages)
    for i, claim in enumerate(fm.get("key_claims") or []):
        conn.execute(
            "INSERT INTO key_claims (source_slug, claim, position) VALUES (?,?,?)",
            (slug, str(claim), i),
        )

    # aliases (entity pages)
    for alias in fm.get("aliases") or []:
        conn.execute(
            "INSERT OR IGNORE INTO aliases (entity_slug, alias) VALUES (?,?)",
            (slug, str(alias)),
        )

    # vault_refs
    for ref in fm.get("vault_refs") or []:
        conn.execute(
            "INSERT OR IGNORE INTO vault_refs (page_slug, vault_path, ref_type) VALUES (?,?,?)",
            (slug, str(ref), "vault_ref"),
        )

    # applications (concept pages)
    for app in fm.get("applications") or []:
        conn.execute(
            "INSERT OR IGNORE INTO vault_refs (page_slug, vault_path, ref_type) VALUES (?,?,?)",
            (slug, str(app), "application"),
        )

    # images (source pages)
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
    """Insert page_relations based on frontmatter arrays. Returns count."""
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
    """Insert prose wikilinks. Returns count."""
    links = extract_wikilinks(prose)
    for lnk in links:
        conn.execute(
            "INSERT INTO prose_wikilinks (from_slug, target, display_text, is_vault_link) VALUES (?,?,?,?)",
            (slug, lnk["target"], lnk["display_text"], lnk["is_vault_link"]),
        )
    return len(links)


# ---------------------------------------------------------------------------
# Index generation
# ---------------------------------------------------------------------------

def generate_index(conn: sqlite3.Connection, wiki_dir: Path):
    """Generate a compact index.md from the database."""

    # Dashboard counts
    rows = conn.execute("SELECT * FROM v_dashboard ORDER BY type").fetchall()
    total = sum(r[1] for r in rows)

    # Recent sources (last 5 ingested)
    recent = conn.execute(
        """SELECT slug, title, format, origin FROM pages
           WHERE type = 'source' ORDER BY ingested DESC LIMIT 5"""
    ).fetchall()

    # Top entities by connectivity
    top_entities = conn.execute(
        "SELECT slug, title, connections FROM v_entity_connectivity LIMIT 5"
    ).fetchall()

    # Maturity distribution
    maturity = conn.execute("SELECT * FROM v_maturity").fetchall()

    # Confidence distribution
    confidence = conn.execute(
        "SELECT confidence, SUM(count) as total FROM v_confidence GROUP BY confidence"
    ).fetchall()

    # Image count
    image_count = conn.execute("SELECT COUNT(*) FROM images").fetchone()[0]

    # Build index content
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

    # Recent ingests
    lines += ["", "## Recent Sources", ""]
    for slug, title, fmt, origin in recent:
        lines.append(f"- [[{slug}]] — {title} [{fmt}, {origin}]")

    # Top entities
    lines += ["", "## Top Entities (by connections)", ""]
    for slug, title, conns in top_entities:
        lines.append(f"- [[{slug}]] — {title} ({conns} connections)")

    # Maturity
    lines += ["", "## Concept Maturity", ""]
    mat_dict = {m: c for m, c, _ in maturity}
    for level in ("seed", "developing", "mature", "challenged"):
        lines.append(f"- **{level.title()}:** {mat_dict.get(level, 0)}")

    # Confidence
    lines += ["", "## Confidence Distribution", ""]
    conf_dict = {c: t for c, t in confidence}
    for level in ("high", "medium", "low"):
        lines.append(f"- **{level.title()}:** {conf_dict.get(level, 0)}")

    # Images
    if image_count > 0:
        lines += ["", f"## Images: {image_count}", ""]

    lines += [
        "",
        "---",
        "",
        "*For full page listings, query `faber.db` or use `/faber-query`.*",
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

    # Find all .md files in wiki subdirectories
    md_files = []
    for subdir in ("sources", "entities", "concepts", "syntheses"):
        d = wiki_dir / subdir
        if d.exists():
            md_files.extend(d.glob("*.md"))

    pages_synced = 0
    relations_synced = 0
    wikilinks_synced = 0

    for filepath in sorted(md_files):
        fm = parse_md_file(filepath)
        if fm is None:
            print(f"  SKIP: {filepath.name} (no valid frontmatter)")
            continue

        insert_page(conn, fm)
        insert_arrays(conn, fm)
        relations_synced += insert_relations(conn, fm)
        wikilinks_synced += insert_wikilinks(conn, fm["_slug"], fm["_prose"])
        pages_synced += 1

    # Sync log entry
    duration_ms = int((time.time() - start) * 1000)
    conn.execute(
        "INSERT INTO sync_log (pages_synced, relations_synced, wikilinks_synced, duration_ms) VALUES (?,?,?,?)",
        (pages_synced, relations_synced, wikilinks_synced, duration_ms),
    )

    conn.commit()

    # Generate compact index.md
    if generate_index_flag:
        generate_index(conn, wiki_dir)

    conn.close()

    print(f"  Synced: {pages_synced} pages, {relations_synced} relations, {wikilinks_synced} wikilinks")
    print(f"  Duration: {duration_ms}ms")
    return pages_synced, relations_synced, wikilinks_synced


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync Faber wiki to SQLite index")
    parser.add_argument("--wiki-dir", type=Path, default=WIKI_DIR_DEFAULT, help="Path to wiki/ directory")
    parser.add_argument("--no-index", action="store_true", help="Skip index.md generation")
    args = parser.parse_args()

    sync(args.wiki_dir, generate_index_flag=not args.no_index)
