---
name: semnal-draft
description: |
  Transform a raw seed (thought, note, Romanian draft) into 3 publish-ready X post variants
  in English — plain, spicy, reflective — preserving Narcis's authentic voice (Romglish when
  intentional). Pillar-aware, constraint-checked (hook, length, no-link-in-tweet-1). Writes
  draft to workshop/x-queue/ready/YYYY-MM-DD-slug.md with frontmatter. Use on /semnal-draft,
  "draft post din seed X", "fă 3 variante pentru S005", "draftează postul ăsta pe X".
---

# Semnal Draft — Seed → 3 Ready Variants

You transform a raw seed into 3 publish-ready X post variants in English, preserving
Narcis's authentic voice. Human stays in the loop: you draft, he ships.

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
```

Use `"$XQUEUE/inbox.md"`, `"$XQUEUE/pillars.md"`, `"$XQUEUE/ready/"` throughout.

## Self Context Loading (first step, always)

Before any generation, load Narcis's active self-context from `faber.db` — **voice rules come from the DB, not from MD files.** The `v_self_active_context` view returns pillars, stances, constraints, and voice rules as JSON, all `status='active'`.

```bash
WIKI_DB="$VAULT_ROOT/wiki/faber.db"
sqlite3 -json "$WIKI_DB" "SELECT voice_rules_json, pillars_json FROM v_self_active_context;"
```

Treat the returned `voice_rules_json` array as **hard constraints** for every draft — each `rule` is an active discipline; `examples_yes` / `examples_no` show the line. `pillars_json` lists the active pillars (slug + title + since) — the Pilon declared in each draft must correspond to one of them (or the X-content-pillars mapping, below).

If the DB is missing or the view returns empty, stop and tell Narcis — do not fall back to hard-coded voice rules.

## Required Reading (once per invocation)

Before generating anything, read these files:

1. **`$VAULT_ROOT/wiki/concepts/x-content-pillars.md`** — canonical pilon definitions (3 pillars +
   voice register per pilon + rotation rule).
2. **`$XQUEUE/pillars.md`** — operational working copy of the pillars (mirrors the wiki, evolves
   faster via `/semnal-reflect`). Read this for the latest day-to-day pilon framing; if it diverges
   from the wiki copy, prefer this one for *operational* decisions but flag the drift.
3. **`$VAULT_ROOT/wiki/concepts/voice-preservation.md`** — Romglish / accent rules (strategic
   framing; the operational discipline lives in the `voice_rules` table loaded above).
4. **The seed itself** (see Input parsing below).

**Hard rule:** you do not invent pillars, you do not sterilize voice, you do not auto-post.

## Input

Parse `$ARGUMENTS`:
- **`S###`** (e.g., `S005`) — find the seed in `$XQUEUE/inbox.md` under its pillar section
- **Raw text** (longer than ~10 words) — treat as inline seed
- **Empty** — list the available seeds (both structured S### blocks and "## Raw captures (CLI)" entries), ask Narcis to pick one
- **Structured invocation from `/to-content`** — when invoked from `/to-content` Step 4b, the input
  carries: `core_claim`, `pilon`, `language`, `voice`, and `seed_ref` (a Faber concept slug like
  `[[skill-era]]`). Use these to skip Phase 1 questions; `seed_ref` lands in frontmatter as
  `source_faber`.

## Workflow

### Phase 1 — Clarify (single batched message)

Ask up to 3 questions in ONE AskUserQuestion call. Defaults are heuristic — propose them:

1. **Pilon?**
   - Default: deduce from the inbox section containing the seed (1, 2, or 3).
   - If free-text seed: infer from content; confirm.
   - Options: "1 — AI-native craft", "2 — 51yo builder", "3 — Unsexy problems".
2. **Format?**
   - Default: `single` if seed < 500 chars and contains ≤2 distinct points; `thread` otherwise.
   - Options: single / thread (3-8 tweets) / long-form (Premium, 500+ chars, one unit).
3. **Voice knob?**
   - Default: `accented` — EN with authentic Romanian cadence, idioms preserved when load-bearing.
   - Options: standard EN / accented / full romglish (only for pilon 3 usually).

**Skip the questions if `$ARGUMENTS` already specifies them inline** (e.g., "S005 thread accented").

### Phase 2 — Generate 3 Variants

Produce three distinct drafts, each honoring the constraints below. Drafts are *text only*
at this stage — you'll write the file in Phase 3.

**Voice variants (pick the label that matches each draft's actual register):**

| Variant | Register | Best for pilon | Hook style |
|---|---|---|---|
| **Plain** | Clear, direct, zero ornament | 1 (craft) | Fact → insight |
| **Spicy** | Opinion-forward, contrarian hook, confidence-high | 3 (unsexy) or pilon 1 when taking a stance | Challenge → evidence |
| **Reflective** | Narrative, personal, temporal contrast | 2 (51yo builder) | Scene → meaning |

If the seed is strongly pilon-2, you can still produce three *reflective-adjacent* variants
with different beats, or widen — use judgment. The point is 3 genuinely different takes,
not three near-synonyms.

**X format mechanics — canonical, absorbed here from the retired `x-voice-rules.md`.** Voice rules are loaded from the DB (`v_self_active_context`); format rules live in this skill.

### Hook

- **First 7 words carry the hook.** No "Something I've been thinking about...", no meta-preambles, no "Thread 🧵" label.
- **The hook stands alone.** A reader who only sees post 1 must understand the claim.
- **Hook patterns that work** (rotate across posts):
  - **Stat hook:** `{Specific surprising number}. Here's what it changes:`
  - **Hot take:** `Most {builders/devs/founders} think {X}. They're wrong.`
  - **Story hook:** `Last week I killed a SaaS idea after 14 days.`
  - **Constraint flex:** `I build 4h/day. Here's what I had to cut.`
  - **Flashback (pilon 2):** `My first computer: 386, 4MB RAM. Today {contrast}.`
  - **Field note (pilon 3):** `20 years in a Romanian public hospital. {observation}.`

### Length

| Format | Length | Notes |
|---|---|---|
| Single | 180-260 chars | Safe zone — avoids preview auto-truncation |
| Thread | 3-8 tweets | Tweet #1 ≤ 260 chars; each subsequent ≤ 280 |
| Long-form (Premium) | No hard cap | Density must stay high |

Threads of 9-12 allowed when the topic deserves them; >12 is usually an essay miscast as a thread.

### Structural rules

1. **No external links in tweet #1 of a thread.** Algorithm penalizes link-leading posts. Put links in the first reply.
2. **No hashtag walls.** Max 0-1 hashtag per post, only if load-bearing (`#buildinpublic` when participating in a real conversation).
3. **No emoji as punctuation.** Max 1 per post if it's doing real work (arrow, pointer); usually skip.
4. **No numbered "filler" posts** in threads.
5. **Pilon declared in frontmatter.** Every X draft declares pilon 1, 2, or 3 — see `x-content-pillars`.

### Pilon-specific registers

- **Pilon 1 — AI-native craft:** avoid tutorial-speak. State the pattern/judgment. Concrete commit/skill/workflow > generic advice.
- **Pilon 2 — 51-year-old builder:** flashback → reframe → punchy landing. Specific tech reference (386, Turbo Pascal, DOS 3.1) > "back in my day".
- **Pilon 3 — Unsexy problems:** specific observation > generic critique. Name the unsexy thing (ANAF report, Excel reconciliation, hospital procurement form).

### Forbidden openers

- `Great post!` / `Thanks for sharing` / `Here's a thread on...`
- `Hot take:` / `Unpopular opinion:` (overused → signals the opposite)
- `Thread 🧵` as the only hook
- `Just a quick thought...` / `Random thought...`
- `Something I've been thinking about...`

### Forbidden LLM-isms (zero tolerance)

`dive deep`, `let's dive in`, `let's unpack`, `unlock`, `supercharge`, `turbocharge`, `elevate your`, `in today's fast-paced world`, `game-changer`, `revolutionary`, `disruptive`, `transform`, `seamless`, `holistic`, `robust`, `scalable` (when imprecise), `leverage` as a verb, `it's not just X, it's Y`, `at the end of the day`, `when push comes to shove`, `synergy`, moralizing closers (`remember, anyone can do it!`, `the future is now`, `we're all in this together`).

**Flow-specific reminders** (apply to the draft phase):

- The 3 variants must be genuinely different angles, not paraphrases. If you find yourself producing
  near-synonyms, widen the register (e.g., make Spicy more contrarian, make Reflective more narrative).
- Voice anchors that make it sound like Narcis (re-applied here for emphasis):
  - Short declarative sentences ending in a beat ("It's here now." / "Use it.")
  - Occasional Romanian loanword where English has no clean equivalent, *italicized* or in quotes
  - Timestamps of experience ("30 years of code", "since DOS 3.1", "20 years in public healthcare IT")
  - Dry pragmatism over inspiration

### Phase 3 — Write Draft File

Compute:
- `TODAY=$(date '+%Y-%m-%d')`
- `SLUG` = 3-5 kebab-case words capturing the strongest variant's hook (e.g., `turbo-pascal-to-claude-code`)
- `PATH="$XQUEUE/ready/${TODAY}-${SLUG}.md"`

Write the file with this exact frontmatter + body skeleton:

```markdown
---
type: draft
status: ready
pilon: {1|2|3}
pilon_name: "AI-native craft" | "51-year-old builder" | "Unsexy problems"
source_seed: {S### or "inline" or "to-content"}
source_faber: {[[concept-slug]] if invoked from /to-content; else null}
format: {single|thread|long-form}
language: {accented|standard-en|romglish}
hook: "{first ≤7 words of recommended variant}"
scheduled_for: null
published_url: null
created: {TODAY}
tags:
  - semnal
  - ready
  - pilon-{N}
---

# {Slug, human-readable}

> Source seed: `$XQUEUE/inbox.md` § {S###} — Pilon {N}
> Recommended variant: **{plain|spicy|reflective}** — {one-line why}

## Variant A — Plain ({char count} chars, {single|thread})

{full text — if thread, number tweets 1/n, 2/n, ...}

## Variant B — Spicy ({char count} chars, {single|thread})

{full text}

## Variant C — Reflective ({char count} chars, {single|thread})

{full text}

## Lint pass/fail (per the X format mechanics above + `voice_rules` from DB)

- [{x|✗}] Hook in first 7 words: "{first 7 words}"
- [{x|✗}] Length in safe zone: {actual}/{target-range}
- [{x|✗}] No link in tweet #1
- [{x|✗}] Pilon declared (1, 2, or 3)
- [{x|✗}] 3 distinct variants (not paraphrases)
- [{x|✗}] Voice preservation — no sterilization detected
- [{x|✗}] No forbidden opener / LLM-ism
- [{x|✗}] No emoji wall, no hashtag wall

## Notes

{optional: any tension between pilon and format, suggested posting time based on pilon
audience, cross-link to related seeds or published posts}
```

### Phase 4 — Report

Output to the user (terminal/chat, not to a file):

```
✓ draft → workshop/x-queue/ready/{TODAY}-{slug}.md

Recommended: Variant {A|B|C} ({plain|spicy|reflective})
{char-count} chars, {format}

Copy-paste ready:
──────────────────────────────
{full text of recommended variant}
──────────────────────────────

Lint: {N}/5 passed
{list any failures with 1-line fix suggestion}

Next:
- to ship: copy above → paste on X → manual publish (human in loop)
- to switch variants: `cat {path}` and pick B or C
- after publishing: move file to workshop/x-queue/published/ and fill published_url
```

Optionally suggest: `pbcopy < <(sed -n '/^## Variant A — Plain/,/^## Variant B/p' {path} | sed '1d;$d')` — but this is fragile; a cleaner UX is simply showing the text inline (above) and letting Narcis select-copy from chat.

## Rules

- **Never auto-post.** The skill produces text files, full stop.
- **Never sterilize.** If you catch yourself "smoothing out" Narcis's phrasing for fluency, undo it.
- **Never invent biographical facts.** Stay within the seed + pillars file + voice-preservation concept. If you need a detail that's not there, ask.
- **Always write to `ready/`, never to `scheduled/` or `published/`.** Those are Narcis's to move.
- **One invocation = one draft file.** Batch-generation of many posts is out of scope for v1.
- **When in doubt on voice:** re-select `voice_rules_json` from `v_self_active_context` — it's the
  single source of truth. Strategic framing lives in `wiki/concepts/voice-preservation.md`.
  Fluency is the ceiling, not the floor.
- **When in doubt on X format:** re-read the "X format mechanics" section above.
- **When invoked from `/to-content`:** `seed_ref` is a Faber concept slug — embed it in frontmatter
  as `source_faber: [[concept-slug]]` so the X draft can be cross-linked back to the content-pack.

## Out of scope (yet)

- Translating from other platforms (LinkedIn, blog) — semnal is X-first
- Auto-scheduling — handled by future `semnal schedule`
- Lint with hard fail — see `/semnal-lint` (future) per PRD §5.7
- Metrics prediction — future `/semnal-reflect`
