---
title: Personal Context Agent — Plan: Raw Capture Stream (mem.ai-style memory)
date: 2026-05-20
status: planning
supersedes: —
related:
  - STATE.md (§10 "Honest Gaps", §11 Arc 1)
  - prd-mvp.md
  - plan-linking.md
  - code/packages/core/src/schema/migrations/
  - code/packages/skill-ctx-add/SKILL.md
---

# Plan — Raw Capture Stream

> **One-line:** Add a `captures` primitive that persists every `/ctx-add`
> input verbatim with timestamp, even when no entity is saved, and trace
> which entities/links each capture produced. Foundation for a chronological
> "memory journal" and future long-term-memory consolidation.

---

## 0. Why this exists

Today, `/ctx-add` passes the user's raw text through the SKILL.md classifier
and persists only the post-classification per-entity sentences. The user's
original literal input is lost — especially destructive when a single input
splits into 3-4 entities, each rewritten by the LLM.

This breaks three things we already care about:

1. **Input fidelity** (commit `e0b8a0b`, memory entry
   `feedback_ctx_add_fidelity`) — the rule says "persist only what's literal".
   The natural bedrock for that rule is *keeping the literal input*.
2. **Provenance traceability** — given entity `#abc`, there's no clean way to
   answer "what did the user actually type that produced this?".
3. **Memory continuity** — captures the user *considered* and abandoned
   (`Accept? [Y/n] → n`) leave zero trace. Those near-misses are signal.

The capture stream is also the natural unit for a future long-term-memory
layer (embeddings, periodic syntheses, mem.ai-style chronological recall).

This is **Arc 1 follow-on work** (STATE.md §11) — adds infrastructure that
makes the demo loop more honest without replacing it.

---

## 1. Goals

- Persist every `/ctx-add` raw input with timestamp, verbatim, regardless of
  whether the user accepts the proposed entities.
- Trace which entities and links resulted from each capture.
- Provide a chronological read surface (`ctx log` CLI + `list_captures` MCP
  tool) that reads like a journal.
- Keep changes additive and retrocompatible — current `/ctx-add` keeps
  working even before SKILL.md is updated; old `record_observation` calls
  without `capture_id` still succeed.
- Lay foundation for long-term-memory consolidation (Phase D, deferred).

## 2. Non-goals (this plan)

- **Reprocess** (`ctx reprocess <capture_id>`) — deferred. Powerful but
  needs careful semantics around superseding old entities; revisit after
  Phases A–C are live for ≥2 weeks.
- **Embeddings / semantic search** over captures — stays in PRD Val 3.
- **Web UI / visualization** for the journal — terminal-first is enough.
- **Cross-device sync** — single local file (`~/.pca/store.db`) remains the
  model. SaaS-arc concern (STATE.md §11 Arc 3).
- **Export to Faber wiki** — useful eventually but not part of this plan.
  Will fit naturally once the data exists.

## 3. Design decisions (confirmed with Narcis 2026-05-20)

| # | Decision | Rationale |
|---|---|---|
| D1 | **No TTL on aborted captures.** Raw text is kept indefinitely regardless of status. | What the user *almost* saved is the richest signal. Deleting it defeats the purpose of a memory stream. |
| D2 | **`session_id` is optional.** Populated when we have a clean source (e.g. MCP context exposes a conversation id), null otherwise. Never blocks a capture. | Keeps the writer simple. We can backfill the column when the upstream surface exposes it. |
| D3 | **No `ctx reprocess` in this plan.** Captures are write-once; downstream re-classification is a Phase E concern, not Phase A-D. | Avoids superseded-entity semantics until basic loop is validated. |
| D4 | **`record_capture` is open to any source, not just `/ctx-add`.** `source` field is a free string; future skills (`/ctx-mirror`, `/ctx-recall`, an importer) can log their own captures. | One memory stream for all user-originated input. Mem.ai convergence point. |

## 4. Architecture

### 4.1 Schema (new primitive)

The `captures` table sits beside `entities`, `links`, `events` — a fourth
top-level primitive. Justification: it's the only table whose source is the
user verbatim, before any interpretation.

```sql
-- Migration 0003_captures.sql

CREATE TABLE captures (
  id                     TEXT PRIMARY KEY,                -- ulid
  occurred_at            TEXT NOT NULL,                   -- ISO 8601, time of capture
  raw_text               TEXT NOT NULL,                   -- VERBATIM user input
  source                 TEXT NOT NULL DEFAULT 'claude-code:ctx-add',
  actor                  TEXT NOT NULL,                   -- same convention as events.actor
  session_id             TEXT,                            -- optional, NULL OK
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

-- Provenance joins
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

-- FTS5 over raw_text (journal search)
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
```

```sql
-- Migration 0004_event_op_capture.sql

-- SQLite cannot ALTER a CHECK constraint. Recreate the table per migration
-- pattern already used in 0002_link_invalidate_op.sql. New constraint adds
-- 'capture' and 'capture-update' operations.
--
-- New allowed ops: 'capture', 'capture-update'
```

### 4.2 `classification_summary` JSON shape

Written by `update_capture_status` after entity persistence completes:

```json
{
  "types_proposed":  ["person", "event", "place"],
  "types_saved":     ["person", "event"],
  "entity_ids":      ["01J...", "01J..."],
  "link_ids":        ["01J..."],
  "entity_count":    2,
  "link_count":      1,
  "aborted_reason":  null,
  "skipped_links":   [
    {"src": "01J...", "dst": "01J...", "relation": "subject-of", "reason": "BAD_PAIR"}
  ]
}
```

Aborted captures carry `aborted_reason: "user declined" | "clarification timeout" | <free text>`.

### 4.3 MCP changes (additive)

**New tool: `record_capture`**

```ts
input: {
  raw_text:   string,                                // required, verbatim
  source?:    string,                                // default 'claude-code:ctx-add'
  session_id?: string,
  scope?:     string,                                // default 'general'
  meta?:      Record<string, unknown>
}
output: {
  capture_id:  string,
  occurred_at: string
}
```

Side-effect: also writes an `events` row with `operation='capture'`,
`payload={raw_text_length, source, session_id}` (full text NOT duplicated in
event payload — captures table is source of truth).

**New tool: `update_capture_status`**

```ts
input: {
  capture_id: string,
  status: 'processed' | 'aborted',
  classification_summary?: object   // see §4.2
}
output: { ok: true }
```

Writes `events` row with `operation='capture-update'`.

**New tool: `list_captures`**

```ts
input: {
  since?:  string,                                   // ISO date
  until?:  string,
  status?: 'pending' | 'processed' | 'aborted' | 'reprocess',
  source?: string,
  fts?:    string,                                   // FTS5 query over raw_text
  limit?:  number                                    // default 50, cap 500
}
output: Capture[]
```

**Extended on existing tools (optional, retrocompatible):**

- `record_observation` gains `capture_id?: string` → insert into
  `capture_entities` after successful entity create. If `capture_id`
  references a non-existent capture, return `INVALID_CAPTURE` (don't silently
  drop the link).
- `link_entities` gains `capture_id?: string` → insert into `capture_links`
  after successful link create. Same error semantics.

### 4.4 SKILL.md changes

One new step, two touch-ups in existing steps. All other behavior unchanged.

**New Step 0.4 — Open the capture (before Step 0.5a "Read before write")**

> Call `record_capture({raw_text: <user input literal>, source: "claude-code:ctx-add"})`.
> Hold the returned `capture_id` in local state for the rest of the pipeline.
> This is non-destructive — the capture row persists even if the user later
> aborts at Step 4.

**Step 4 update — Abort path**

When user answers `n`:
```
update_capture_status(capture_id, 'aborted', {aborted_reason: "user declined"})
```
Then report to user: nothing was saved as entities; capture #<prefix>... is
in your journal.

**Step 5a/5b update — Pass `capture_id`**

Every `record_observation` and `link_entities` call passes `capture_id` from
Step 0.4.

**Step 6 update — Close the capture**

After all persistence succeeds (or partially succeeds with skipped links):
```
update_capture_status(capture_id, 'processed', {
  types_saved:    [...],
  entity_ids:     [...],
  link_ids:       [...],
  entity_count:   N,
  link_count:     M,
  skipped_links:  [...]
})
```

Add a trailing line to user-facing output:
```
📓 Capture #<prefix> in journal — run `ctx log --capture <prefix>` to see it.
```

### 4.5 CLI — `ctx log` command

New subcommand under `ctx` (runtime CLI):

```bash
ctx log                              # last 20 captures, chronological (newest first)
ctx log --since=7d                   # relative
ctx log --since=2026-05-01 --until=2026-05-15
ctx log --search="razvan"            # FTS5 over raw_text
ctx log --status=aborted             # only abandoned considerations
ctx log --source=...                 # filter by source
ctx log --capture <id-prefix>        # one capture + everything it produced
ctx log --export=markdown            # dump as markdown journal to stdout
ctx log --limit=100
```

Default format (compact, scannable):

```
2026-05-20 18:42  #01J7K2x...  [processed → 2 ent, 1 link]
  > Mihai a luat 9.50 la simulare la mate, mai are 2 luni până la admitere

2026-05-20 09:15  #01J7Hzz...  [aborted: user declined]
  > maybe should look into Turso for the sync story

2026-05-19 22:10  #01J7G1a...  [processed → 1 ent]
  > prefer să public joi dimineața pe Substack
```

`--capture <id>` expanded format:

```
Capture #01J7K2x... [processed]
  When:    2026-05-20 18:42:13 EEST
  Source:  claude-code:ctx-add
  Scope:   general
  Lang:    ro

Raw input:
  Mihai a luat 9.50 la simulare la mate, mai are 2 luni până la admitere

Produced:
  ✓ person  #01J7K30... "Mihai Brindusescu"
  ✓ event   #01J7K31... "Mihai 9.50 simulare mate (2026-05-19)"
  ✓ link    subject-of: person → event
```

---

## 5. Phased delivery

Each phase is independently ship-able. Atomic commits per phase, no big bang.

### Phase A — Storage + writer (foundation)

**Definition of done:** raw captures can be persisted via MCP; nothing else
changes.

Tasks:
1. `code/packages/core/src/schema/migrations/0003_captures.sql` — captures
   table, capture_entities, capture_links, fts_captures + triggers.
2. `code/packages/core/src/schema/migrations/0004_event_op_capture.sql` —
   extend events.operation CHECK to include `capture`, `capture-update`.
   (Follow pattern from 0002.)
3. `code/packages/core/src/types.ts` — `Capture`, `CaptureStatus`,
   `ClassificationSummary` types.
4. `code/packages/core/src/store.ts` — `recordCapture()`, `getCapture()`,
   `listCaptures()`, `updateCaptureStatus()`, `linkCaptureToEntity()`,
   `linkCaptureToLink()`. Each writes its `events` row.
5. `code/packages/mcp-server/src/tool-defs.ts` — zod shapes for
   `record_capture`, `update_capture_status`, `list_captures`.
6. `code/packages/mcp-server/src/handlers.ts` — handlers.
7. `code/packages/mcp-server/src/server.ts` — register tools.
8. Tests (`code/packages/core/test/captures.test.ts`):
   - record_capture round-trip (id, occurred_at, raw_text fidelity).
   - status transitions (pending → processed, pending → aborted).
   - list_captures: filters (since/until/status/source).
   - FTS5 search over raw_text.
   - Migration applies cleanly on existing 0001+0002 DB.
9. Tests (`code/packages/mcp-server/test/handlers.captures.test.ts`):
   - record_capture handler validates input.
   - list_captures pagination.
   - update_capture_status rejects invalid transitions
     (e.g. `aborted` → `processed`).

Risk: low. Schema additions are isolated, no existing query touches the new
tables. Local DB has 0 entities — migration is free.

### Phase B — Wire `/ctx-add` to the capture stream

**Definition of done:** every `/ctx-add` invocation produces a capture row;
entities and links know which capture they came from.

Tasks:
1. Extend `recordObservationShape` and `linkEntitiesShape` with optional
   `capture_id`. Validate (string, ulid-shaped) but don't require.
2. Update `recordObservation()` and `linkEntities()` in core to call
   `linkCaptureToEntity` / `linkCaptureToLink` when `capture_id` is provided.
3. Add `INVALID_CAPTURE` error code (HandlerError) when `capture_id`
   references a missing capture.
4. Update `code/packages/skill-ctx-add/SKILL.md`:
   - New Step 0.4 (open capture).
   - Step 4 abort path → `update_capture_status('aborted')`.
   - Step 5a/5b examples updated with `capture_id`.
   - New Step 6 close (`update_capture_status('processed', summary)`).
   - Add capture-id line to Step 6 user confirmation output.
5. Update `code/packages/cli/src/pca-commands/doctor.ts` if it checks skill
   version (bump if applicable).
6. Tests:
   - `record_observation({capture_id})` inserts into `capture_entities`.
   - `record_observation({capture_id: 'missing'})` returns `INVALID_CAPTURE`.
   - `link_entities({capture_id})` inserts into `capture_links`.
   - Skill-level integration test: simulate full /ctx-add flow with
     1 input → 2 entities → 1 link → verify all three table relationships.
7. Hand-test on the actual local DB: do `/ctx-add` 3 times (1 simple, 1
   split, 1 aborted), then run a SQL query to verify the rows exist.

Risk: low-medium. The skill change is observable in real use — must not
regress the existing happy path. Backwards-compat is guaranteed by
`capture_id` being optional everywhere.

### Phase C — Read surface (`ctx log`)

**Definition of done:** Narcis can browse the journal end-to-end from the
shell. The journal is genuinely useful for "what did I capture this week?"
type questions.

Tasks:
1. `code/packages/cli/src/ctx-commands/log.ts` — new subcommand with all
   flags from §4.5.
2. Register in `code/packages/cli/src/ctx.ts` router.
3. Date parsing helper (`--since=7d`, `--since=2026-05-01`) — reuse if
   exists, else add to `code/packages/cli/src/util/dates.ts`.
4. `--export=markdown` formatter: one markdown file, captures as `##`
   headings ordered by date, raw_text in quoted block.
5. Tests:
   - `ctx log` outputs in expected format.
   - `ctx log --search` returns FTS5 matches.
   - `ctx log --capture <prefix>` expands provenance correctly.
   - `--export=markdown` produces valid markdown.
6. Update `code/packages/cli/README.md` (or wherever ctx commands are
   documented) with `ctx log` examples.
7. Hand-test: after a week of real `/ctx-add` use, run `ctx log` and verify
   it reads like a usable journal.

Risk: low. Pure read path, no schema or skill changes.

### Phase D — Long-term memory consolidation (DEFERRED — needs ≥2 weeks of A-C live data first)

**Definition of done:** Narcis can ask "what have I been thinking about for
the last month?" and get a useful synthesis, optionally promoted to an entity.

This phase is sketched here so future-Narcis knows the direction, but
**don't implement until A-C have produced real journal data for 2+ weeks**.
The shape of the consolidation will be informed by what the actual capture
stream looks like — premature commitment here is exactly the trap STATE.md
§11 warns about.

Tentative tasks (revisit when phase opens):

1. `ctx consolidate --since=30d` — markdown report covering:
   - Capture volume per day, per layer (frequency table).
   - Top recurring topics (FTS5 clustering — simple TF over raw_text).
   - Aborted captures that recur ≥3 times → "you keep thinking about this
     but never save it".
   - Captures that produced 0 entities but were `processed` (clarification
     failures? signal of LLM mismatch?).
2. Optional: `ctx consolidate --as-synthesis` → creates an `event` entity
   (kind: 'synthesis' in attrs) that links to N representative capture ids
   via a new `captures_referenced` attr OR a new join `synthesis_captures`.
   Mirror Faber `wiki/syntheses/` pattern.
3. Long-term (PRD Val 3 territory): captures become the natural unit for
   embeddings — short text, time-ordered, dedup-able. Semantic recall over
   the capture stream is more nuanced than over entities (entities are
   already LLM-compressed; captures preserve the texture).

Decisions to make at Phase D start (not now):
- Synthesis entity type — reuse `event` or introduce `synthesis` as 13th
  type? (Schema change, weigh against utility.)
- Auto-consolidation cadence? (Cron-like, manual, both?)
- Mem.ai parity goals — surface "related captures" in `get_self_summary`?

---

## 6. Testing strategy summary

| Surface | Test file(s) | What |
|---|---|---|
| Schema | `code/packages/core/test/migrations.test.ts` | 0003 + 0004 apply cleanly on a fresh DB AND on a DB with existing 0001+0002 data |
| Store | `code/packages/core/test/captures.test.ts` | recordCapture, getCapture, listCaptures, updateCaptureStatus, capture↔entity join, capture↔link join, FTS5 |
| MCP handlers | `code/packages/mcp-server/test/handlers.captures.test.ts` | record_capture, list_captures, update_capture_status, INVALID_CAPTURE on bad capture_id |
| Skill (integration) | Manual run + log inspection | Full /ctx-add flow with capture_id passed through |
| CLI | `code/packages/cli/test/log.test.ts` | ctx log default, filters, --capture, --export |

Existing 2,300 LOC of tests stay green — capture work is purely additive
and the new optional `capture_id` param has explicit "no-op when missing"
semantics.

---

## 7. Open issues (for the implementing session to resolve)

1. **`raw_lang` auto-detection** — heuristic (count Romanian-distinctive
   characters: `ă/â/î/ș/ț`)? Or call a tiny detect lib? Decide at Phase A.
   Cheap fallback: leave NULL.
2. **`meta` field convention** — what does the skill put in it? Suggest at
   minimum `{cwd, claude_version}` if accessible from the MCP server side.
   Define a small schema in `types.ts`.
3. **Doctor check** — should `pca doctor` warn if there are
   `status='pending'` captures older than 1h (skill crashed mid-flow)?
   Suggest: yes, add as 5th check, but only after Phase B is live.
4. **MCP read tool for capture provenance** — do agents need
   `get_capture_for_entity(entity_id)`? Probably yes eventually, but not in
   this plan; agents can use `list_captures` for now.
5. **Skill output verbosity** — Step 6's new capture-id line is one more
   line of output. Maybe gate behind a verbose flag if it gets noisy.

---

## 8. Sequencing & estimates

| Phase | Estimate | When |
|---|---|---|
| A — Storage + writer | 2–3h | Next session |
| B — `/ctx-add` wiring | 2h | Session after A merges |
| C — `ctx log` CLI | 2–3h | Session after B is hand-validated |
| D — Consolidation | 4h+ design | After 2+ weeks of A-C live use |

**Do not bundle A+B+C into one session.** Each phase is genuinely small;
the win of separate sessions is each phase gets clean hand-testing on the
local DB before the next starts.

---

## 9. Appendix — file references

| File | Why relevant |
|---|---|
| `code/packages/core/src/schema/migrations/0001_initial.sql` | Pattern for table + index + FTS5 + trigger conventions |
| `code/packages/core/src/schema/migrations/0002_link_invalidate_op.sql` | Pattern for re-creating events CHECK constraint (needed for 0004) |
| `code/packages/core/src/store.ts` | Where new capture store methods land |
| `code/packages/core/src/types.ts` | Where Capture types land |
| `code/packages/mcp-server/src/tool-defs.ts` | Where new tool shapes land |
| `code/packages/mcp-server/src/handlers.ts` | Where new handlers land |
| `code/packages/skill-ctx-add/SKILL.md` | Step 0.4 / 4 / 5 / 6 edits in Phase B |
| `code/packages/cli/src/ctx.ts` + `ctx-commands/` | Where `log` command lands |
| `STATE.md` | Refresh §10 "Honest Gaps" table after Phase B (capture stream closes the "what did I literally say" gap) |

---

*Plan authored 2026-05-20 from a brainstorming session. Decisions D1–D4
confirmed by Narcis. Implementation scheduled for future sessions, phase by
phase, with hand-validation between phases.*
