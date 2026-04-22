---
name: faber-meet
description: |
  Monthly self-review — Narcis revises pillars, stances, commitments,
  constraints, voice rules based on log evidence. Flow: review → proposals →
  approval → snapshot (before any edits) → log event → update → sync.
  Snapshot is captured automatically at the START, before editing, into
  self_snapshots with a shared meet_event_id. Use when the user invokes
  /faber-meet, "faber meet", "revizie self", "întâlnire de revizie self",
  "meet lunar", "self review".
---

# Faber Meet — Monthly Self Review with Pre-Edit Snapshot

You are running a **monthly revision ceremony** for the `wiki/self/*` pages.
Unlike `/faber-mirror` (weekly, confrontational), `/faber-meet` is
**constructive and collaborative**: review what reality (the log) says
happened, propose updates, get Narcis's approval, **snapshot the current
state BEFORE editing**, then apply changes.

Framing: `/faber-meet` is described in
`workshop/drafts/faber-self-agent-citizens.md` as the revision-and-snapshot
ceremony. The snapshot in `self_snapshots` is what powers `v_self_history` —
structured diffs of the declared self over time.

## Wiki Discovery

Resolve the wiki root at the start of every bash block (fresh subshell per
tool call):

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
```

All SQL uses `"$WIKI_ROOT/faber.db"`; sync uses `python3 "$WIKI_ROOT/faber_sync.py"`.

## Meet ID Resolution

Each `/faber-meet` run generates a single `MEET_ID` used to tag every
snapshot row and the log event, so the whole meet is recoverable later as
one atomic revision ceremony.

```bash
MEET_DATE=$(date +%Y-%m-%d)
MEET_TIME=$(date +%H%M%S)
MEET_ID="meet-${MEET_DATE}-${MEET_TIME}"
echo "Meet ID: $MEET_ID"
```

Keep `MEET_ID` for the whole run. Do **not** regenerate it between steps.

## Pre-check

```bash
python3 "$WIKI_ROOT/faber_sync.py"
```

Sync first so the DB reflects the current state of `self/*.md`. The
proposals in Step 2 read from the DB views; stale DB → bad proposals.

## Workflow

The skill runs strictly in this order. Do **not** reorder — the snapshot
(Step 3) MUST happen before any edit to `self/*.md` (Step 5).

### Step 1 — Show the current declared state

Read the current state from the DB (not from MD files — the DB is already
synced in pre-check).

```bash
echo "=== ACTIVE PILLARS ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, title, since, evidence_events
  FROM self_pillars
  WHERE status = 'active'
  ORDER BY since;
" && \
echo "" && \
echo "=== ACTIVE STANCES ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, substr(on_topic,1,30) AS on_topic, substr(position,1,60) AS position,
         confidence, last_reaffirmed
  FROM self_stances
  WHERE status = 'active'
  ORDER BY last_reaffirmed;
" && \
echo "" && \
echo "=== OPEN COMMITMENTS ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, substr(title,1,55) AS title, due_date, days_left,
         substr(progress_marker,1,40) AS progress
  FROM v_open_commitments;
" && \
echo "" && \
echo "=== ACTIVE CONSTRAINTS ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, kind, substr(description,1,70) AS description
  FROM self_constraints
  WHERE status = 'active'
  ORDER BY kind;
" && \
echo "" && \
echo "=== ACTIVE VOICE RULES ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, category, substr(rule,1,65) AS rule
  FROM voice_rules
  WHERE status = 'active'
  ORDER BY category, slug;
" && \
echo "" && \
echo "=== CHALLENGED ITEMS (carry-over) ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT 'stance' AS kind, slug, substr(position,1,55) AS item
    FROM self_stances WHERE status = 'challenged'
  UNION ALL
  SELECT 'pillar' AS kind, slug, substr(title,1,55)
    FROM self_pillars WHERE status = 'challenged'
  UNION ALL
  SELECT 'voice' AS kind, slug, substr(rule,1,55)
    FROM voice_rules WHERE status = 'challenged';
"
```

### Step 2 — Gather log evidence since last meet

Resolve the `last_meet_date` from `self_snapshots` (or fall back to 30 days
if no prior meet exists):

```bash
LAST_MEET_DATE=$(sqlite3 "$WIKI_ROOT/faber.db" "
  SELECT COALESCE(MAX(date(taken_at)), date('now','-30 day'))
  FROM self_snapshots;
")
echo "Scanning evidence since: $LAST_MEET_DATE"
```

Then pull the evidence:

```bash
echo "=== OPERATIONS SINCE LAST MEET ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT operation, COUNT(*) AS n
  FROM log_events
  WHERE event_date > '$LAST_MEET_DATE'
  GROUP BY operation ORDER BY n DESC;
" && \
echo "" && \
echo "=== PUBLIC-FACING SIGNAL ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT event_date, operation, substr(title,1,55) AS title
  FROM log_events
  WHERE event_date > '$LAST_MEET_DATE'
    AND (lower(body) LIKE '%posted%'
      OR lower(body) LIKE '%published%'
      OR lower(body) LIKE '%release%'
      OR lower(body) LIKE '%linkedin%'
      OR lower(body) LIKE '% on x %'
      OR lower(body) LIKE '%tweet%'
      OR lower(body) LIKE '%substack%');
" && \
echo "" && \
echo "=== MOST-TOUCHED PAGES SINCE LAST MEET ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT lep.page_slug, COUNT(*) AS touches, MAX(le.event_date) AS last_touch
  FROM log_event_pages lep
  JOIN log_events le ON le.id = lep.event_id
  WHERE le.event_date > '$LAST_MEET_DATE'
  GROUP BY lep.page_slug
  ORDER BY touches DESC
  LIMIT 15;
" && \
echo "" && \
echo "=== STANCE DRIFT (30-day window) ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, on_topic, status, aligned_cnt, misaligned_cnt, last_reaffirmed
  FROM v_declaration_vs_observation
  WHERE status = 'active'
  ORDER BY misaligned_cnt DESC, aligned_cnt ASC;
" && \
echo "" && \
echo "=== PILLARS WITH ZERO EVIDENCE THIS CYCLE ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT p.slug, p.title
  FROM self_pillars p
  WHERE p.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM self_alignment sa
      JOIN log_events le ON le.id = CAST(NULLIF(sa.source_event,'') AS INTEGER)
      WHERE sa.pillar_slug = p.slug
        AND le.event_date > '$LAST_MEET_DATE'
    );
"
```

### Step 3 — Propose updates and get Narcis's approval

Synthesize Steps 1–2 into a **concrete, bounded list** of proposed edits.
Each proposal is a single line with enough detail to approve or reject:

- **Pillar `skill-era-craftsmanship`:** reaffirm. Evidence: 4 skill pages
  touched since last meet.
- **Stance `shipping-over-perfection`:** mark `challenged`. Evidence: 0
  public-facing events in window, 7 internal builds. Conflict with log.
- **Commitment `weekly-public-shipping`:** update `progress_marker` to
  "3/4 weeks shipped since last meet".
- **Voice rule `romglish-when-natural`:** reaffirm, bump `last_synced`.
- **Pillar `building-as-51yo-from-ro-public-hospital`:** confirm active,
  add new `since_reaffirmed: YYYY-MM-DD` marker.
- **New stance proposal:** `sqlite-over-orm` — evidence from 3 recent
  decisions. Draft position, ask Narcis.

Rules for proposals:

- **Anchor every proposal to evidence.** Either a count from Step 2, a
  view row (`v_declaration_vs_observation`, `v_open_commitments`), or a
  concrete log event date + title. If you cannot cite evidence, do not
  propose.
- **Prefer reaffirm over churn.** If a stance's `last_reaffirmed` is stale
  but the log behaviour matches, reaffirm (bump `last_reaffirmed`). Do
  not invent new stances just to have something to change.
- **Propose `challenged` before `retired`.** Narcis keeps things citable
  (decision 2 in `faber-self-agent-citizens.md`). Only propose `retired`
  when he has confirmed the item no longer applies.
- **New items need a slug.** Draft the slug inline so approval is one word:
  "`sqlite-over-orm` — reject/approve/edit?".

Present the proposal list in a single message, numbered, and ask Narcis
to approve, reject, or edit each one. Hold — do NOT proceed until he has
responded for every item.

**Carry-over rule.** If Narcis says "skip" or "none" to all proposals,
you still run Steps 4–7 (snapshot + log + sync). The meet is the
boundary; even a no-op meet creates the history row that future diffs
depend on. Say so explicitly before snapshotting.

### Step 4 — Record the approved edits

Before touching any file, write down the approved plan as a plain list.
For each approved proposal, note:

- Target file (`self/narcis-pillars.md`, `self/narcis-stances.md`, …).
- Field to change (frontmatter key, prose section).
- Exact new value (status → `challenged`, `last_reaffirmed` → today, etc.).

This list is the contract for Step 5. Do not add edits that were not
approved in Step 3. Do not skip approved edits.

### Step 5 — Snapshot ALL self/ pages (BEFORE any edit)

This step runs **before** any `Edit` / `Write` tool call to `self/*.md`.
The snapshot captures the pre-edit state so `v_self_history` has the
starting point for the diff.

Use Python because the body_hash + JSON frontmatter serialization need
structured handling.

```bash
python3 - "$WIKI_ROOT" "$MEET_ID" <<'PY'
import hashlib, json, sqlite3, sys, datetime, pathlib
try:
    import yaml
except ImportError:
    print("ERROR: pyyaml required for snapshot", file=sys.stderr); sys.exit(1)

wiki = pathlib.Path(sys.argv[1])
meet_id = sys.argv[2]
taken_at = datetime.datetime.now().isoformat(timespec="seconds")
db = wiki / "faber.db"
self_dir = wiki / "self"

if not self_dir.exists():
    print(f"ERROR: {self_dir} not found"); sys.exit(1)

conn = sqlite3.connect(str(db))

# Refuse to double-snapshot the same meet_id (idempotency guard).
existing = conn.execute(
    "SELECT COUNT(*) FROM self_snapshots WHERE meet_event_id = ?",
    (meet_id,),
).fetchone()[0]
if existing:
    print(f"ERROR: meet_event_id {meet_id} already has {existing} snapshots. "
          f"Refusing to snapshot twice.", file=sys.stderr)
    sys.exit(2)

snapped = 0
for path in sorted(self_dir.glob("*.md")):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        print(f"  SKIP: {path.name} — no frontmatter"); continue
    parts = text.split("---", 2)
    if len(parts) < 3:
        print(f"  SKIP: {path.name} — malformed frontmatter"); continue
    try:
        fm = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as e:
        print(f"  SKIP: {path.name} — yaml error: {e}"); continue
    body = parts[2]
    body_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()
    fm_json = json.dumps(fm, ensure_ascii=False, sort_keys=True, default=str)
    conn.execute(
        "INSERT INTO self_snapshots "
        "(taken_at, meet_event_id, page_slug, frontmatter_json, body_hash, body) "
        "VALUES (?,?,?,?,?,?)",
        (taken_at, meet_id, path.stem, fm_json, body_hash, body),
    )
    snapped += 1

conn.commit()
conn.close()
print(f"Snapshotted {snapped} self/ pages under meet_event_id={meet_id} at {taken_at}")
PY
```

**Hard rule:** if this step fails (non-zero exit, or snapped == 0), stop.
Do not edit any `self/*.md` files until the snapshot row set exists. The
whole point of the snapshot is to have the pre-edit state in the DB.

Verify snapshots landed:

```bash
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT meet_event_id, COUNT(*) AS snapshots, MAX(taken_at) AS taken_at
  FROM self_snapshots WHERE meet_event_id = '$MEET_ID'
  GROUP BY meet_event_id;
"
```

### Step 6 — Apply the approved edits

Only now do you edit the `self/*.md` files. For each approved change
from Step 4:

- Use `Edit` for narrow field changes (e.g., `status: active` →
  `status: challenged`, or `last_reaffirmed: YYYY-MM-DD`).
- Use `Edit` with a larger block for prose changes (e.g., reworded stance
  explanations).
- Bump the file-level `updated:` frontmatter field to today's date on
  every file that was edited.
- For stance reaffirmation without content change: bump
  `last_reaffirmed: YYYY-MM-DD` on that stance item. That alone counts
  as an edit — bump `updated:` too.

If Narcis approved creating a new pillar / stance / commitment / voice
rule / constraint, add the item to the relevant list in the frontmatter
of the matching `self/*.md` file. Add a matching prose section if the
page has prose sections for existing items.

### Step 7 — Log the meet

Append to `$WIKI_ROOT/log.md`. The header uses the `self-update`
operation so mirrors / queries can filter by it.

```
## [YYYY-MM-DD] self-update | Faber Meet — MEET_ID
- Scope: self/ review since LAST_MEET_DATE
- Meet ID: MEET_ID
- Snapshotted: N self/ pages (pre-edit state → self_snapshots)
- Edits applied: M (pillars: p, stances: s, commitments: c, constraints: k, voice: v)
- Items marked `challenged`: list of slugs (if any)
- New items: list of slugs (if any)
- Reaffirmed without content change: list of slugs (if any)
- Files touched: list of self/*.md files
- **Totals: 0 sources, 0 entities, 0 concepts, 0 syntheses = 0 new + M updated**
```

Do **not** create a synthesis page for the meet. The synthesis artifact
for the meet is the snapshot set in `self_snapshots` plus the log entry.
If a `mirror-YYYY-WW.md` or other synthesis is wanted alongside, that's
a separate skill invocation.

### Step 8 — Sync

```bash
python3 "$WIKI_ROOT/faber_sync.py"
```

`faber_sync.py` preserves `self_snapshots` across rebuilds (alongside
`sync_log`), so the snapshots from Step 5 survive. The new log event
from Step 7 lands in `log_events` and the edited `self/*.md` files land
in `pages` + the `self_*` aux tables.

### Step 9 — Final report

Report to Narcis in one compact message:

- Meet ID + timestamp.
- Number of snapshots taken.
- Number of edits applied per category (pillars/stances/commitments/
  constraints/voice).
- Items marked `challenged` (by slug).
- New items created (by slug).
- Next meet suggestion (default: +30 days).

Then show the diff from the previous snapshot, if any:

```bash
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT page_slug, taken_at, meet_event_id, body_hash,
         CASE WHEN prev_hash IS NULL THEN 'first snapshot'
              WHEN prev_hash = body_hash THEN 'no change'
              ELSE 'changed' END AS diff
  FROM v_self_history
  WHERE meet_event_id = '$MEET_ID'
  ORDER BY page_slug;
"
```

## Rules

- **Snapshot BEFORE edits. Non-negotiable.** If Step 5 fails, Step 6
  does not run. There is no "try again after editing" — the snapshot
  must reflect the pre-edit state.
- **One `MEET_ID` per run.** Do not regenerate it between steps. All
  snapshots from one meet must share the same `meet_event_id` so they
  can be queried as a set.
- **Evidence-anchored proposals.** Never propose a change without a log
  count, view row, or event citation. If evidence is missing, say so
  and hold the proposal for next meet.
- **Narcis cannot delete.** Per decision 2 in the spec: items go
  `challenged` or `retired`, never removed. If Narcis explicitly asks
  to delete a slug entirely, push back once — "mark retired instead?" —
  and only proceed with delete if he insists.
- **Never edit `agent/claude.md` from here.** Agent heuristics revisions
  run through `/agent-reflect` (Faza 5). `/faber-meet` is scoped to
  `self/` only.
- **Never write a mirror synthesis from here.** `/faber-mirror` owns
  `syntheses/mirror-YYYY-WW.md`. Meet just snapshots + edits + logs.
- **Positive tone allowed.** `/faber-meet` is constructive — "you shipped
  3/4 weeks, reaffirm the stance" is fair. Save confrontation for
  `/faber-mirror`. Wins are recorded here.

## Edge cases

- **No `self/` pages.** Error out with "run Faza 1 first — `self/`
  fragmentation missing". Do not create empty snapshots.
- **Fresh install (no prior meet).** Step 2 uses `date('now','-30 day')`
  as fallback. First meet still runs, first snapshot is the baseline,
  `v_self_history.prev_hash = NULL` is expected.
- **Narcis rejects all proposals (no-op meet).** Still run Steps 5–8.
  The snapshot marks the boundary; future meets diff from this one.
  The log entry records zero edits but confirms the review happened.
- **Sync fails after log append but before completion.** The log.md is
  the source of truth. Re-run `python3 faber_sync.py` — idempotent.
- **User re-invokes `/faber-meet` same day.** Each run gets its own
  `MEET_ID` (includes HHMMSS). Snapshots stack cleanly. The idempotency
  guard in Step 5 blocks only double-snapshotting within the *same*
  `MEET_ID`, not across runs.
- **`pyyaml` missing.** Step 5 exits non-zero with a clear message.
  Install with `pip install pyyaml` and retry — `faber_sync.py` already
  requires it, so a working wiki has it.

## Why this exists

The `self/*` pages are Narcis's declared identity anchors. They drift.
`/faber-mirror` confronts drift weekly; `/faber-meet` is the monthly
ceremony where drift becomes a revision. Without a pre-edit snapshot
in `self_snapshots`, there is no structured history — only git, which
does not answer "what did the pillars look like at meet N?" in SQL.

The snapshot is the payload. The edits are secondary. A meet with zero
edits still produces value because the snapshot set becomes the
baseline for the next mirror.
