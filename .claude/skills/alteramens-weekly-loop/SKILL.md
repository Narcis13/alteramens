---
name: alteramens-weekly-loop
composition_level: compound
description: |
  Weekly content production compound for X. Orchestrates faber-brief (week's evidence) +
  inbox audit (pillar coverage) + semnal-draft mechanics (batch variant generation) +
  scheduling (concrete date/time slots) + a single weekly artifact. Output: 5 ready/ posts
  with scheduled_for filled, plus weeks/YYYY-Www.md summary, plus copy-paste-ready text in
  chat for Monday's post. Anti-postpone bias by design. Closes last week's loop (planned vs
  shipped). First skill at composition_level: compound — experimental.
  Trigger on /alteramens-weekly-loop, "plan săptămâna pe X", "weekly post planning",
  "weekly loop", "production loop", "săptămâna asta pe X", "queue the week".
---

# Alteramens Weekly Loop — Compound for X Production

You orchestrate Narcis's weekly X production session. The point is **not** to generate clever
posts — `/semnal-draft` already does that one-by-one. The point is to **collapse the activation
energy** for shipping a full week of content into one ~30-minute session, on Sunday or Monday.

## Why this skill exists

Per `workshop/drafts/semnal-x-growth-system.md` §10:

> *"Problema ta nu e 'nu știu ce să postez'. Problema ta e: 'Am tendința nefericită să tot
> amân, să postez.'"*

Existing molecules already solve the *drafting* problem. What's still manual: pillar rotation
across the week, slot scheduling, batching, and the moment-of-shipping copy-paste.
This compound encodes all of that, **once**.

### Experiment hypothesis

This is the first skill tagged `composition_level: compound` (per Faber log 2026-04-27).
It is **explicitly experimental**: the test is whether encoding this workflow as a compound
*reduces brain-RAM* over 4 weeks of use, or just shifts complexity sideways.

Each run logs measurements (timestamps, slots planned, slots overridden, last-week ship rate)
to `wiki/log.md` and `workshop/x-queue/weeks/YYYY-Www.md`. After 4 runs, `/faber-mirror`
should be able to answer: *did the compound earn its keep?*

If the honest answer at week 4 is "no" — kill it, don't massage it.

## Vault Discovery

At the start of every bash block, resolve the vault root via walk-up:

```bash
VAULT_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$(dirname $d)"; break; }
  d=$(dirname "$d")
done)
[ -z "$VAULT_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
XQUEUE="$VAULT_ROOT/workshop/x-queue"
WIKI_DB="$VAULT_ROOT/wiki/faber.db"
WEEKS_DIR="$XQUEUE/weeks"
mkdir -p "$WEEKS_DIR"
```

## Self Context Loading (first step, always)

Load active voice rules + pillars + stances + commitments from `faber.db`. Same source of
truth as `/semnal-draft` and `/semnal-reply`. **No fallback to MD** — if the DB is missing or
the view returns empty, stop and tell Narcis.

```bash
sqlite3 -json "$WIKI_DB" "SELECT pillars_json, voice_rules_json, stances_json, constraints_json FROM v_self_active_context;"
```

Treat `voice_rules_json` as hard constraints for every variant generated below.
`pillars_json` lists active personal pillars (separate from the 3 X content pillars defined
in `wiki/concepts/x-content-pillars.md` — both must be respected).

## Required Reading (once per invocation)

1. **`$VAULT_ROOT/wiki/concepts/x-content-pillars.md`** — canonical 3 pillars + rotation rule
2. **`$XQUEUE/pillars.md`** — operational working copy (latest day-to-day framing)
3. **`$XQUEUE/inbox.md`** — available seeds, organized by pilon
4. **`$VAULT_ROOT/wiki/concepts/voice-preservation.md`** — strategic voice framing

Skip reading `voice-preservation.md` if `voice_rules_json` from the DB is non-empty —
the operational rules win over strategic framing for generation.

## Input

Parse `$ARGUMENTS`:

- **Empty** — default plan: 5 posts, Mon-Fri, 19:30 Europe/Bucharest, pilon rotation 1-2-3-1-2
  (or whichever rotation the inbox + last-4-weeks distribution suggests)
- **`--cadence N`** — override post count (3-7 valid; outside this range, refuse)
- **`--start YYYY-MM-DD`** — override week start (default: next Monday relative to today)
- **`--fast`** — skip review questions, write everything with defaults, output the chat-summary.
  This is the **highest-leverage anti-postpone move**: when Narcis is short on time, no questions.
  Use only when inbox is healthy (≥1 seed per pilon) — else fast-mode degrades to standard.
- **`--reflect`** — only run Phase 0 (close last week's loop) and stop. Use mid-week.
- **`--dry-run`** — generate plan + drafts, but don't write any files. Outputs preview only.

## Workflow

### Phase 0 — Close last week's loop (measurement)

If `$WEEKS_DIR/$(prev_iso_week).md` exists, parse it and compare planned slots against
`$XQUEUE/published/` files:

```bash
THIS_WEEK=$(date '+%G-W%V')                              # ISO week, e.g., 2026-W18
PREV_WEEK=$(date -v-7d '+%G-W%V' 2>/dev/null || date -d '7 days ago' '+%G-W%V')
PREV_FILE="$WEEKS_DIR/${PREV_WEEK}.md"
test -f "$PREV_FILE" && PREV_EXISTS=1 || PREV_EXISTS=0
```

If `PREV_EXISTS=1`:

1. Extract planned slots from `PREV_FILE` (look for `slot_NN: scheduled_for:` blocks)
2. For each planned slot, check if a matching file exists in `$XQUEUE/published/` (match by
   slug or scheduled_for date)
3. Compute: `shipped_count / planned_count` = ship rate
4. Note pilon coverage: which planned pilons made it, which didn't
5. Output (terminal):

```
Last week (PREV_WEEK): X/Y planned posts shipped (Z% ship rate)
  ✓ Pilon 1: A planned, B shipped
  ✓ Pilon 2: A planned, B shipped
  ✗ Pilon 3: A planned, 0 shipped — under-served 2 weeks running
```

Append a one-line entry to `$VAULT_ROOT/wiki/log.md` under a `## [TODAY] weekly-loop | Close PREV_WEEK` header recording the ship rate (this lets `/faber-mirror` and `/faber-brief` see the compound's
track record over time).

If `PREV_EXISTS=0`: print "no prior week to close — first run" and continue.

If `$ARGUMENTS` includes `--reflect`: stop here.

### Phase 1 — Week's evidence brief (signal harvest)

Run a single SQL pass to surface what happened this week — material that can fuel new seeds:

```bash
sqlite3 -header -column "$WIKI_DB" "
SELECT '=== last 7d events ===';
SELECT event_date, operation, substr(title,1,55) AS title
  FROM v_recent_activity
  WHERE event_date >= date('now','-7 days')
  ORDER BY event_date DESC LIMIT 20;
SELECT '=== sources ingested last 7d ===';
SELECT slug, title, created
  FROM pages
  WHERE type='source' AND created >= date('now','-7 days')
  ORDER BY created DESC;
SELECT '=== concepts touched last 7d ===';
SELECT slug, COALESCE(updated, created) AS dt, maturity
  FROM pages
  WHERE type='concept' AND COALESCE(updated, created) >= date('now','-7 days')
  ORDER BY dt DESC LIMIT 15;
SELECT '=== open commitments ===';
SELECT slug, description FROM self_commitments WHERE status='active' LIMIT 10;
"
```

Then read the last 3 files in `$XQUEUE/published/` (most recent posts) — extract their pilon
and hook from frontmatter. This avoids the trap of "this week reads the same as last week".

**Output to user (terminal):** a 5-7 line summary — *what's the signal of the week*.
Concise, factual, no editorial.

### Phase 2 — Inbox audit & pillar coverage

```bash
# Count seeds per pilon in inbox
SEEDS_P1=$(grep -c '^### S' <(awk '/## Pilonul 1/,/## Pilonul 2/' "$XQUEUE/inbox.md"))
SEEDS_P2=$(grep -c '^### S' <(awk '/## Pilonul 2/,/## Pilonul 3/' "$XQUEUE/inbox.md"))
SEEDS_P3=$(grep -c '^### S' <(awk '/## Pilonul 3/,/^---$/' "$XQUEUE/inbox.md"))

# Count published per pilon last 28 days
PUB_P1=$(grep -lE '^pilon: 1$' "$XQUEUE/published/"*.md 2>/dev/null | xargs -I {} sh -c 'awk -v cutoff=$(date -v-28d +%Y-%m-%d 2>/dev/null || date -d "28 days ago" +%Y-%m-%d) "/^created:/ { gsub(/[^0-9-]/,\"\",\$2); if (\$2 >= cutoff) print FILENAME }" {}' | wc -l | tr -d ' ')
# (analogous for P2, P3 — see Implementation note below)
```

**Implementation note for the agent:** if the awk dance above proves brittle, fall back to
reading frontmatter via a simple Python one-liner or `yq` — the goal is two numbers per pilon
(seeds available, posts shipped last 28d), not awk virtuosity. Use whatever works on macOS
default tools.

Compute coverage gap:
- Each pilon's "deficit" = last-4-weeks shipped target (`8`, since target is 2/pilon/week ×
  4 weeks) minus actual shipped
- Pilons with the largest deficit get bias toward inclusion this week

**Output (terminal):**

```
Inbox: P1=N, P2=M, P3=K seeds available
Last 4 weeks shipped: P1=A, P2=B, P3=C (target: 8 each)
Bias this week: prioritize Pilon X (deficit Y)
```

### Phase 3 — Plan proposal (single AskUserQuestion gate)

Compose a candidate plan: `cadence` slots, each with `(weekday, time, pilon, seed_or_evidence)`.

Default slots (Europe/Bucharest, hits US afternoon peak ≈ 14:00 EST):

| Slot | Default day | Default time | Default pilon |
|---|---|---|---|
| 1 | Monday | 19:30 | Pilon 1 (AI craft — start sharp) |
| 2 | Tuesday | 19:30 | Pilon 2 (51yo reflective — mid-week shift) |
| 3 | Wednesday | 19:30 | Pilon 3 (unsexy — punchy observation) |
| 4 | Thursday | 19:30 | Pilon 1 (AI craft — ride the algorithm) |
| 5 | Friday | 19:30 | Pilon 2 or 3 — fill the deficit pilon |

Override the rotation if Phase 2 deficit analysis dictates a different distribution. Honor the
**hard rules** from `wiki/concepts/x-content-pillars.md`:
- Min 1 post per pilon per week
- No 3 consecutive same-pilon
- Rotation may shift but never violate the above

**Seed assignment per slot:**

For each slot, prefer this order:
1. Existing seed in `inbox.md` matching the slot's pilon — pick the one with the strongest hook
   potential (look at the "Unghiul tău" line)
2. If no inbox match for that pilon: propose a **new seed** drawn from this week's evidence —
   recent ingest, recent concept update, recent log event with friction or insight
3. If still nothing: ask Narcis for a one-liner seed via AskUserQuestion (last resort)

Build a single `AskUserQuestion` with up to 4 questions (use 4 max, batched):

1. "Approve plan?" — options: `approve all` / `swap pilon for one slot` / `swap seed` /
   `change cadence`
2. "Posting time?" — options: `19:30 RO (default — US afternoon)` / `09:00 RO (EU morning)` /
   `21:00 RO (US peak)` / `custom`
3. "Include thread proposal?" — options: `no, all singles` / `yes, Friday thread` /
   `yes, weekend thread (off-cadence)`
4. "Reply quota?" — options: `default 4/posting day` / `aggressive 6/day` / `none, just posts`

If `--fast` was passed: skip the questions, take all defaults, proceed.

### Phase 4 — Batch draft generation

For each approved slot, generate 3 variants using the **same mechanics as `/semnal-draft`**.
Do **not** invoke `/semnal-draft` as a sub-skill (it has its own AskUserQuestion phase that
would re-litigate decisions made in Phase 3). Instead, replicate its core generation logic
inline — it is the same author (you), the same DB-loaded voice rules, the same canonical
pillars file. Compound = collapsed conversation, not duplicated judgment.

For each slot:

- **Hook:** first 7 words must carry the claim (no preambles, no `Thread 🧵` labels)
- **Length:** single 180-260 chars, thread tweets ≤280 each, long-form no cap
- **Structural rules:** no link in tweet 1, no hashtag walls, no emoji as punctuation
- **Voice:** apply `voice_rules_json` from the DB as hard constraints
- **Forbidden openers / LLM-isms:** see `/semnal-draft` "X format mechanics" — same blocklist
- **3 distinct variants:** plain / spicy / reflective (label each based on actual register)
- **Pilon-register match:** Pilon 1 → plain dominant; Pilon 2 → reflective dominant;
  Pilon 3 → spicy dominant

Track for each slot:
- recommended variant (you choose, defending the choice in 1 line)
- char count per variant
- lint pass/fail per variant

### Phase 5 — Review & approve (single batched gate)

Present all `cadence` slots × 3 variants in chat, in a compact table-of-blocks format:

```
═══ SLOT 1 — Mon 2026-04-28 19:30 — Pilon 1 (AI craft) ═══
Seed: S007 — "Skill-urile care rămân în capul tău nu compound-ează..."
Recommended: Variant B (spicy, 232 chars)

[A — plain, 198 chars]
{full text}

[B — spicy, 232 chars]   ← recommended
{full text}

[C — reflective, 244 chars]
{full text}

Lint: 7/8 passed (warning: hook is 8 words, target ≤7)
─────────────────────────────────────────────────────────
═══ SLOT 2 — Tue 2026-04-29 19:30 — Pilon 2 (51yo) ═══
...
```

Then one batched `AskUserQuestion`:

- Per-slot decision: `accept recommended` / `pick A` / `pick B` / `pick C` / `edit slot N` /
  `kill slot N`

If `--fast`: auto-accept recommended on every slot, skip the question.

If Narcis says `edit slot N`: enter a brief inline edit loop for that slot only (show the
recommended text, ask what to change, regenerate that one variant). Do not regenerate others.

### Phase 6 — Write `ready/` files + weekly artifact

For each accepted slot, compute:

```bash
SCHEDULED_DATE   # YYYY-MM-DD of the slot
SCHEDULED_TIME   # HH:MM
SCHEDULED_FOR    # ISO 8601 with timezone, e.g., 2026-04-28T19:30:00+03:00
SLUG             # 3-5 kebab-case words from the chosen variant's hook
PILON            # 1, 2, or 3
PILON_NAME       # "AI-native craft" | "51-year-old builder" | "Unsexy problems"
LANG             # accented | standard-en | romglish (per Phase 4 decision)
FORMAT           # single | thread | long-form
PATH="$XQUEUE/ready/${SCHEDULED_DATE}-${SLUG}.md"
```

**File path uses `SCHEDULED_DATE`, not today's date.** This is a deliberate divergence from
`/semnal-draft`'s convention — the weekly loop pre-stages files for future days.

Write each file with the exact frontmatter + body skeleton from `/semnal-draft` Phase 3
(see that skill for the canonical template), with these fields filled:

```yaml
---
type: draft
status: ready
pilon: {1|2|3}
pilon_name: "..."
source_seed: {S### or "weekly-loop-evidence"}
source_faber: null
format: {single|thread|long-form}
language: {accented|standard-en|romglish}
hook: "{first ≤7 words of recommended variant}"
scheduled_for: {ISO datetime}
published_url: null
created: {TODAY}
weekly_loop_run: {THIS_WEEK}     # NEW field — links back to weekly artifact
tags:
  - semnal
  - ready
  - pilon-{N}
  - weekly-loop
---
```

Body identical to `/semnal-draft` (Variants A/B/C + lint pass/fail + Notes). The `tags:
weekly-loop` makes these files greppable later for measurement.

**Then write the weekly artifact** at `$WEEKS_DIR/${THIS_WEEK}.md`:

```markdown
---
type: weekly-loop-plan
status: planned
week: {THIS_WEEK}
week_start: {Monday YYYY-MM-DD}
week_end: {Sunday YYYY-MM-DD}
cadence: {N}
generated_at: {ISO datetime}
generation_seconds: {duration}
pilon_distribution:
  p1: {count}
  p2: {count}
  p3: {count}
prev_week_ship_rate: {percent or null}
tags:
  - weekly-loop
  - x-queue
---

# Week {THIS_WEEK} — {N} posts queued

> Compound run on {TODAY}. Anti-postpone reminder: posts are pre-staged in `ready/`.
> When the day arrives, **copy-paste from this file or from the matching ready/ file. No new decisions.**

## Last week's close
{ship rate summary, pilon coverage, one-line lesson}

## This week's plan

| Slot | When | Pilon | Slug | Hook | Status |
|---|---|---|---|---|---|
| 1 | Mon Apr 28 19:30 | 1 | turbo-pascal-claude | "Primul meu calculator: 386." | ready |
| 2 | Tue Apr 29 19:30 | 2 | ... | ... | ready |
| ... |

## Slot 1 — {weekday} {date} {time} — Pilon {N}

**Recommended variant ({A|B|C} — {plain|spicy|reflective}, {N} chars):**

```
{full text — copy this exact block on posting day}
```

[Alternative variants in: `ready/{date}-{slug}.md`]

## Slot 2 — ...

(repeat for all slots)

## Reply quota for the week
Target: {N} replies (~{M}/day). Use `/semnal-reply` against `targets.md` accounts.

## Experiment journal
- Time to generate plan: {generation_seconds}s
- User overrides during review: {count}
- How this run felt (fill at end of week, 1-3 sentences):
  > _______
```

### Phase 7 — Log compound run to Faber

Append to `$VAULT_ROOT/wiki/log.md`:

```markdown
## [{TODAY}] weekly-loop | Plan {THIS_WEEK}
- Cadence: {N} posts queued, distribution P1={a}/P2={b}/P3={c}
- Slots: {Mon Apr 28 19:30, Tue Apr 29 19:30, ...}
- Seeds used: {S007, S009, evidence:concept-X, ...}
- Last week close: {prev_shipped}/{prev_planned} shipped ({pct}%)
- Generation cost: {generation_seconds}s, {user_overrides} overrides
- Artifact: `workshop/x-queue/weeks/{THIS_WEEK}.md`
```

This entry will be picked up by `/faber-sync` on next rebuild and made queryable via
`/faber-query "weekly loop"`. After 4 runs, `/faber-mirror` can compare declared cadence
target (5/week) against shipped reality.

### Phase 8 — Output (terminal — anti-postpone bias)

The terminal output is the most important user-facing artifact. It must obliterate the
"what do I post today" friction. Format:

```
✓ Week {THIS_WEEK} queued. {N} posts ready.

Files:
  workshop/x-queue/weeks/{THIS_WEEK}.md          (single-source weekly view)
  workshop/x-queue/ready/{date}-{slug}.md × {N}   (per-post detail)

──────────────────────────────────────────────
SHIP MONDAY {date} AT 19:30 — copy this exact text:

{full text of Slot 1's recommended variant}

──────────────────────────────────────────────

Tue Apr 29 19:30 — Pilon 2 — "{first 7 words}..."
Wed Apr 30 19:30 — Pilon 3 — "{first 7 words}..."
Thu May 1  19:30 — Pilon 1 — "{first 7 words}..."
Fri May 2  19:30 — Pilon 2 — "{first 7 words}..."

After publishing, move file: ready/ → published/ (manual, see /semnal-draft).
Reply quota this week: {N} replies via /semnal-reply.

Last week: {prev_shipped}/{prev_planned} shipped. {one-line nudge if shipped < 80%}
```

The block "SHIP MONDAY ... copy this exact text" is non-negotiable — Narcis on his phone,
Monday morning, must be able to find that text in <10 seconds. Inline in chat AND inline in
the weekly artifact.

## Idempotency

Re-running `/alteramens-weekly-loop` for the same `THIS_WEEK`:

- If `$WEEKS_DIR/{THIS_WEEK}.md` exists with `status: planned` — load it, identify which
  slots already have `ready/` files, only generate what's missing.
- If a slot's `ready/` file already exists and matches `weekly_loop_run: {THIS_WEEK}` — keep
  it, do not overwrite. (User may have edited it.)
- If a `ready/` file's status moved to `published` (file was renamed/moved) — mark that slot
  as shipped in the artifact, do not regenerate.

This means the compound is safe to re-run mid-week to fill gaps or swap a single slot
without touching others.

## Failure modes

| Situation | Behavior |
|---|---|
| `faber.db` missing or `v_self_active_context` empty | **Stop.** Tell Narcis to run `/faber-sync` first. Do not fall back to MD-only voice. |
| `inbox.md` empty | Generate all 5 seeds from week's evidence. Use AskUserQuestion to confirm before drafting. |
| One pilon has no inbox seed AND no evidence-derived candidate | Reduce cadence to skip that slot rather than ship a weak post. Tell Narcis why. |
| `published/` empty (cold start, no prior week) | Skip Phase 0 close, proceed normally. |
| `--cadence N` outside [3,7] | Refuse with: "3-7 posts/week is the sustainable range per pillars rotation rule". |
| User says `kill slot N` for all slots | Don't write the weekly artifact. Output: "Plan rejected. No drafts written." |
| WebFetch / external deps needed | None — this skill is fully local. |

## Out of scope (yet)

- **Auto-posting.** Forever anti-feature per `semnal-x-growth-system.md` §7.
- **Replies execution.** Set the quota; replies happen via `/semnal-reply` daily, not here.
- **Metrics ingestion.** That's `/semnal-reflect` (future).
- **Thread auto-splitting.** Long-form / threads are generated as text; no split-into-tweets
  helper. v2 if needed.
- **Multi-platform.** This is X-only. LinkedIn / blog go through `/to-content`, not here.

## Forbidden actions

- ❌ Auto-post (no X / Twitter API call, ever)
- ❌ Sterilize voice — re-load `voice_rules_json` if you catch yourself smoothing
- ❌ Fabricate biographical facts not in pillars + voice + seeds
- ❌ Skip Phase 7 logging — the experiment depends on this measurement layer
- ❌ Write to `published/` — that's Narcis's manual move after he ships
- ❌ Generate >7 posts in a week without explicit `--cadence` override

## Measurement (the experiment)

After 4 runs, this skill should be evaluable. The signals to watch in `wiki/log.md`:

1. **Ship rate trend** — week-over-week `prev_shipped/prev_planned`. Target ≥80% by week 4.
2. **Generation time trend** — should drop run-over-run as the inbox stabilizes and defaults
   prove right. If it grows, the compound is shifting complexity into questions, not collapsing it.
3. **User overrides per run** — high overrides = compound's defaults are wrong.
   Stable low overrides = compound is internalizing Narcis's judgment.
4. **Pilon distribution variance** — should converge to 2/2/1 + wildcard pattern. High variance
   means rotation logic is broken or inbox is unbalanced.
5. **Subjective friction** — the "How this run felt" line in each weekly artifact. Brutal honesty.

If at week 4: ship rate <50%, generation time growing, override rate >50% — kill the compound.
The honest lesson is "this workflow doesn't compress — keep it conversational".
If ship rate ≥70%, override rate <30%, generation under 5 minutes — the compound earned its keep.

## One last thing

The whole point of this is: when Narcis opens his phone Monday morning, he should not think.
He should copy. The compound's job is to make next-week-Narcis's life mechanical at the
moment of shipping — because that's where the postponing happens.

If at any point during a run you feel "I'm asking too many questions" — you are. Default
harder. The user asked for less brain-RAM, not for a more polite interrogation.
