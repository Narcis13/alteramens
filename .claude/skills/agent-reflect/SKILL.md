---
name: agent-reflect
description: |
  End-of-session reflection for Claude's working model. Reviews recent log
  evidence, proposes updates to agent/claude.md — heuristics confirmed,
  new heuristics detected, anti-patterns observed, open questions for
  Narcis — gets approval, applies edits, logs an agent-reflect event.
  Trigger manual initially (end of long session / > 3 ingests); auto on
  observed heuristics later. Use when the user invokes /agent-reflect,
  "agent reflect", "reflect agent", "reflectează", "update agent/claude".
---

# Agent Reflect — Update Claude's Working Model

You are producing a **mini-update to `wiki/agent/claude.md`** at the end of a
substantive working session. Unlike `/faber-meet` (monthly, scoped to
`self/`), this skill is scoped to the agent page — Claude's declared
heuristics about how to work with Narcis in Alteramens. Unlike `/faber-mirror`
(weekly, confrontational), this is **introspective and additive** —
observations from the session become heuristics, anti-patterns, or open
questions; existing heuristics get reaffirmed or challenged against log
reality.

Framing: `/agent-reflect` is Faza 5 in
`workshop/drafts/faber-self-agent-citizens.md`. Each heuristic needs **at
least one log event ID** as evidence (strict rule from the spec). Narcis
**cannot delete** heuristics — only mark `challenged` (with
`dispute_reason`) or `retired`.

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

## Reflect ID Resolution

Each `/agent-reflect` run generates a single `REFLECT_ID` used to tag the
log event. Same pattern as `/faber-meet`'s `MEET_ID`, but scoped to the
agent page.

```bash
REFLECT_DATE=$(date +%Y-%m-%d)
REFLECT_TIME=$(date +%H%M%S)
REFLECT_ID="reflect-${REFLECT_DATE}-${REFLECT_TIME}"
echo "Reflect ID: $REFLECT_ID"
```

## Pre-check

```bash
python3 "$WIKI_ROOT/faber_sync.py"
```

Sync first so the DB reflects the current state of `agent/claude.md`. The
proposals in Step 3 read from the DB; stale DB → bad proposals.

Also verify the agent page exists — this skill refuses to run otherwise.

```bash
test -f "$WIKI_ROOT/agent/claude.md" || {
  echo "ERROR: $WIKI_ROOT/agent/claude.md missing. Run Faza 2 first." >&2
  exit 1
}
```

## Workflow

The skill runs strictly in this order. Do **not** propose or apply edits
that cannot cite an event ID from the DB.

### Step 1 — Resolve the reflect window

Scan since the **last `/agent-reflect` run**. Fall back to 14 days if no
prior reflect exists. The window is what Step 2 pulls evidence from.

```bash
LAST_REFLECT_DATE=$(sqlite3 "$WIKI_ROOT/faber.db" "
  SELECT COALESCE(MAX(event_date), date('now','-14 day'))
  FROM log_events
  WHERE operation = 'agent-reflect';
")
echo "Scanning evidence since: $LAST_REFLECT_DATE"
```

### Step 2 — Show current heuristics state

Read from the DB, not from the MD file (already synced).

```bash
echo "=== ACTIVE HEURISTICS ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, confidence, status,
         substr(rule,1,60) AS rule,
         evidence_events, first_observed
  FROM agent_heuristics
  WHERE status = 'active'
  ORDER BY confidence DESC, slug;
" && \
echo "" && \
echo "=== CHALLENGED / RETIRED / LOW-CONFIDENCE HEURISTICS ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, confidence, status,
         substr(rule,1,55) AS rule,
         substr(COALESCE(dispute_reason,''),1,40) AS dispute
  FROM agent_heuristics
  WHERE status IN ('challenged','retired') OR confidence = 'low';
" && \
echo "" && \
echo "=== HEURISTICS WITH ZERO EVIDENCE (must be challenged or re-evidenced) ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, confidence, status, substr(rule,1,60) AS rule
  FROM v_agent_heuristics_evidence
  WHERE evidence_count = 0 AND status = 'active';
"
```

### Step 3 — Pull log evidence from the window

```bash
echo "=== EVENTS SINCE LAST REFLECT ($LAST_REFLECT_DATE → today) ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT id, event_date, operation, substr(title,1,60) AS title
  FROM log_events
  WHERE event_date > '$LAST_REFLECT_DATE'
  ORDER BY event_date, id;
" && \
echo "" && \
echo "=== OPERATION MIX IN WINDOW ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT operation, COUNT(*) AS n
  FROM log_events
  WHERE event_date > '$LAST_REFLECT_DATE'
  GROUP BY operation ORDER BY n DESC;
" && \
echo "" && \
echo "=== PAGES TOUCHED MOST (candidates for pattern detection) ===" && \
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT lep.page_slug, COUNT(*) AS touches, MAX(le.event_date) AS last_touch
  FROM log_event_pages lep
  JOIN log_events le ON le.id = lep.event_id
  WHERE le.event_date > '$LAST_REFLECT_DATE'
  GROUP BY lep.page_slug
  ORDER BY touches DESC
  LIMIT 15;
"
```

### Step 4 — Read the current agent page prose

Read `agent/claude.md` to see existing anti-patterns and open questions.
Needed because the frontmatter lists heuristics but anti-patterns and
open questions live in prose sections.

```bash
cat "$WIKI_ROOT/agent/claude.md"
```

### Step 5 — Draft proposals

Synthesize Steps 2–4 into a concrete, bounded proposal list. Four
categories; each proposal is a one-line entry with enough detail to
approve or reject.

**5a. Heuristic status changes (reaffirm / challenge / retire):**

- For each active heuristic, decide based on window evidence:
  - **Reaffirm:** ≥ 1 new event in window matches the rule. Add the new
    event IDs to `evidence_events`. Optional: bump confidence.
  - **Challenge:** at least one clear counter-example in the window
    (rule predicted one thing, log shows another). Set `dispute_reason`
    with the counter-event IDs.
  - **Retire:** rule no longer applies because context changed
    (e.g. workflow replaced). Needs Narcis's explicit confirmation.
  - **No change:** no window evidence, but rule not contradicted →
    leave alone. Note it for the open-questions list only if the zero-
    evidence streak crosses 2 reflect cycles.

**5b. New heuristic candidates:**

- Pattern must appear in ≥ 2 distinct log events in the window (or 1
  event + 1 prior event already in `evidence_events` of a retired/
  challenged heuristic). Single-event "insights" do not qualify.
- Draft inline: slug + rule + confidence + evidence event IDs.
  Example: `"guided-ingest-before-deep-write" — rule="..." — confidence=high — events=[41,43,44]`.

**5c. Anti-pattern candidates:**

- An anti-pattern is **what NOT to do** that the session surfaced.
  Must also cite ≥ 1 event (usually the event where the anti-pattern
  was avoided or corrected).
- Examples: "Don't rewrite concept pages on update — append dated
  sections." The matching positive heuristic may already exist; an
  anti-pattern is the negative framing for the same insight, used
  when the negative frame is more operationally useful.

**5d. New open questions for Narcis:**

- Genuine ambiguity Claude observed but didn't resolve in-session.
  Each question points to one concrete decision it would unblock.
- Do **not** invent questions to fill the section. If there are none,
  say so.

**5e. Understanding-of-Narcis refresh (optional):**

- If the session surfaced something new about pillars / stances /
  constraints that isn't reflected in the top prose block of
  `agent/claude.md`, draft a one-line update. Do **not** edit
  `self/*.md` from here — that's `/faber-meet`'s job. Only update
  the *understanding-snapshot section inside `agent/claude.md`*.

**Hard evidence rule:** every proposal that adds or modifies a heuristic
or anti-pattern MUST cite concrete `log_events.id` values from Step 3.
If a proposal cannot cite evidence, drop it and move it to 5d (open
question) instead.

Present the proposal list in a single message, numbered, grouped by
category (5a / 5b / 5c / 5d / 5e). Ask Narcis to approve, reject, or
edit each one. Hold — do NOT proceed until he has responded for every
item.

### Step 6 — Record the approved plan

Before editing, write out the approved plan as a plain list. For each
approved proposal, note:

- Target location: frontmatter `heuristics:` item (by slug), prose
  section (by H2/H3 heading), or understanding block.
- Change type: add / update field / append prose section.
- Exact new values (slug, rule, confidence, status, evidence_events
  as JSON list, dispute_reason if challenged).

This list is the contract for Step 7. Do not add anything not
approved; do not skip anything approved.

### Step 7 — Apply edits to `agent/claude.md`

Use `Edit` with narrow old_string / new_string pairs. Keep edits
small and reviewable.

**For heuristic status changes (5a):**

- The heuristic is a dict item in `frontmatter.heuristics`. Edit
  `status:`, `confidence:`, `evidence_events:`, and
  `dispute_reason:` fields in place. Preserve indentation.
- For a `challenged` item, set `dispute_reason` to a one-line
  explanation citing the counter-event IDs. Keep the original rule
  text untouched (the rule stays citable).
- When adding event IDs to `evidence_events`, merge into the existing
  JSON-style list. Do not duplicate IDs.
- If the heuristic has a matching prose H3 section, append one
  dated evidence line under it (do not rewrite). Example:
  `- 2026-04-22: reaffirmed — evidence #41, #43 (ingest sessions).`

**For new heuristics (5b):**

- Append a new item to the `heuristics:` list in frontmatter. Keep
  alphabetical-by-slug or append-at-end — match the style already
  used in the file.
- Append a matching prose H3 under "Heuristici active" with the
  same slug, a short explanation, and the evidence events.

**For new anti-patterns (5c):**

- Append under the "Anti-pattern-uri" H2 section. Use an H3 with a
  slug-style heading (e.g. `### don't-rewrite-on-concept-update`).
  Body: one-line rule + evidence event IDs.
- If the section currently contains a placeholder like
  `(Populare progresivă la /agent-reflect.)`, replace that
  placeholder with the first anti-pattern section.

**For open questions (5d):**

- Append bullet(s) under "Deschis pentru revizie". Do not delete
  existing bullets unless Narcis explicitly resolved them in Step 5.
  If he resolved one, move it out of the open-questions section
  and fold the answer into the relevant heuristic or anti-pattern.

**For understanding-of-Narcis refresh (5e):**

- Edit the prose block "Ce înțelege Claude despre Narcis (snapshot
  YYYY-MM-DD)". Bump the date in the heading to today. Update the
  bullets. Keep this block short — 3–5 bullets max.

**Always:**

- Bump the file-level `updated:` frontmatter field to today's date.
- Bump `heuristics_count:` if you added/retired heuristics so it
  matches the list length.
- Do not touch the `scope:` or `type:` frontmatter fields.
- Do not edit any file under `self/` — scope is `agent/` only.
- Do not edit any file under `syntheses/` — mirror pages are owned
  by `/faber-mirror`.

### Step 8 — Log the reflect

Append to `$WIKI_ROOT/log.md`. Operation is `agent-reflect` so future
reflects can filter by it (Step 1's window query relies on this).

```
## [YYYY-MM-DD] agent-reflect | Agent Reflect — REFLECT_ID
- Scope: agent/claude.md update since LAST_REFLECT_DATE
- Reflect ID: REFLECT_ID
- Heuristics reaffirmed: N (slugs: ...)
- Heuristics challenged: N (slugs: ...)
- Heuristics retired: N (slugs: ...)
- New heuristics: N (slugs: ...)
- New anti-patterns: N (slugs: ...)
- Open questions added: N
- Understanding snapshot refreshed: yes|no
- Window events scanned: N (from event IDs X..Y)
- **Totals: 0 sources, 0 entities, 0 concepts, 0 syntheses = 0 new + 1 updated**
```

The "1 updated" at the end refers to `agent/claude.md`. Keep the
totals line exact — mirrors and lint read this format.

### Step 9 — Sync

```bash
python3 "$WIKI_ROOT/faber_sync.py"
```

This re-parses the updated `agent/claude.md` frontmatter and updates
`agent_heuristics` rows. Verify:

```bash
sqlite3 -header -column "$WIKI_ROOT/faber.db" "
  SELECT slug, confidence, status,
         json_array_length(COALESCE(evidence_events,'[]')) AS ev_count
  FROM agent_heuristics
  ORDER BY status, slug;
"
```

### Step 10 — Final report

Report to Narcis in one compact message:

- Reflect ID + timestamp.
- Counts per category (reaffirmed / challenged / retired / new
  heuristics / new anti-patterns / open questions / understanding
  refreshed).
- Current `agent_heuristics` row count by status (from the verify
  query above).
- Any heuristic still at `evidence_count = 0` — flag for next reflect.

## Rules

- **Evidence-anchored.** Every heuristic add/change cites ≥ 1
  `log_events.id` from the window (or prior evidence already in the
  row for a reaffirm). No ID → no edit. This is the spec's strict
  rule from `faber-self-agent-citizens.md#propunerea-2`.
- **Narcis cannot delete.** Per decision 2 in the spec. If he asks
  to delete a heuristic slug, push back once — "mark retired
  instead?" — and only proceed with delete if he insists. A deleted
  heuristic loses its history; retired keeps the row citable.
- **Scope is `agent/` only.** Never edit `self/*.md`, `sources/`,
  `entities/`, `concepts/`, or `syntheses/` from here.
  - For `self/` revisions → `/faber-meet`.
  - For confrontational reflection → `/faber-mirror`.
  - For new sources → `/faber-ingest`.
- **Constructive tone.** This is introspective, not confrontational.
  Save the procrastination attack for `/faber-mirror`. Note: if the
  session surfaced a pattern that Narcis himself should confront
  (e.g. declared stance vs log drift), propose an open question
  pointing at the next `/faber-mirror` or `/faber-meet`, don't
  write the confrontation here.
- **One `REFLECT_ID` per run.** Do not regenerate mid-run. The log
  event uses it as the anchor.
- **No snapshot table.** Unlike `/faber-meet`, this skill does not
  write to `self_snapshots`. Heuristics evolve fluidly; git gives
  the diff on `agent/claude.md`. If `agent_snapshots` is added
  later, extend this skill — do not improvise a table here.
- **Never auto-retire.** Retirement requires Narcis's explicit
  approval in Step 5. A challenged heuristic with no resolution
  after N cycles can become a Step 5 candidate for retirement,
  but the skill proposes — the user decides.
- **One file, one edit per slug.** Do not touch the same heuristic
  in two separate `Edit` calls — combine into one.

## Edge cases

- **No `agent/claude.md`.** Pre-check exits with an error. Run
  Faza 2 (create the initial agent page with 3–5 seed heuristics)
  first.
- **Zero events in the window.** Still run Steps 2 and 5 — there
  may be existing zero-evidence heuristics to flag. If nothing
  to propose, log a no-op reflect (`all counts = 0`). The log
  entry confirms the reflect happened; the next window starts
  from today.
- **Fresh install, no prior reflect.** Step 1 falls back to
  `date('now','-14 day')`. First reflect treats the last two
  weeks as the window. Subsequent reflects chain correctly.
- **Heuristic already `challenged` still drifting.** If a
  challenged heuristic gets more counter-events, update its
  `dispute_reason` to cite the new IDs. Do not flip it back to
  active silently — that requires a Step 5 proposal + approval.
- **Duplicate slug proposal.** If Narcis proposes a new slug that
  already exists (active or retired), error in Step 6 — do not
  overwrite. Rename the new proposal, or update the existing
  row via 5a instead.
- **Proposal has no log evidence.** Drop it from 5a/5b/5c and
  surface as an open question in 5d ("pattern noticed but no
  log citation — should we log a retro event?").
- **User invokes twice the same day.** Each run has its own
  `REFLECT_ID` (includes HHMMSS). Window shrinks to today-only
  on the second run (since the first reflect's event is now
  `LAST_REFLECT_DATE`). That's fine — usually the second run
  is a no-op.
- **Sync fails after log append.** `log.md` is source of truth.
  Re-run `python3 faber_sync.py` — idempotent.

## Tone rules

- **First person singular.** Per `voice_rules.first-person-singular`.
  "Observ că…", not "noi observăm".
- **Romglish natural.** Per `voice_rules.romglish-when-natural` and
  `technical-terms-en`. Don't translate `slug`, `commit`, `ingest`,
  `event`.
- **Numbers always.** "3 ingest events in window" beats "activitate
  crescută". Per `voice_rules.specific-numbers-concrete-examples`.
- **No hedging.** Per `voice_rules.no-corporate-hedging`. A
  proposal is either evidence-backed or dropped — no "might
  maybe consider".
- **Zero emoji.** Per `voice_rules.no-emojis-in-prose`.
- **Cite event IDs inline.** `evidence: #41, #43, #47`. Without
  IDs, the claim is not citable.

## Why this exists

`agent/claude.md` drifts silently. A heuristic observed once can
quietly become stale as workflows change; a pattern observed
twice but never declared stays tribal knowledge. `/agent-reflect`
is the mechanism that turns session-level observation into
citable, queryable, revisable entries in `agent_heuristics`.

Without it, the agent page is either a static CLAUDE.md clone
(useless — that file already exists) or an ungrounded journal
(spec-violating — the strict evidence rule exists for a reason).
With it, Claude's working model of Alteramens compounds the same
way the wiki does: sourced, linked, dateable, and contestable by
Narcis via `status: challenged`.
