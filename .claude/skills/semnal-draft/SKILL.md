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

## Required Reading (once per invocation)

Before generating anything, read these files:

1. **`$VAULT_ROOT/wiki/concepts/x-voice-rules.md`** — **canonical** format & voice rules for X
   (hook, length, structure, variants, lint, forbidden openers/LLM-isms). Single source of truth —
   if anything below contradicts this file, the file wins.
2. **`$VAULT_ROOT/wiki/concepts/x-content-pillars.md`** — canonical pilon definitions (3 pillars +
   voice register per pilon + rotation rule).
3. **`$XQUEUE/pillars.md`** — operational working copy of the pillars (mirrors the wiki, evolves
   faster via `/semnal-reflect`). Read this for the latest day-to-day pilon framing; if it diverges
   from the wiki copy, prefer this one for *operational* decisions but flag the drift.
4. **`$VAULT_ROOT/wiki/concepts/voice-preservation.md`** — the Romglish / accent rules referenced
   from `x-voice-rules`.
5. **The seed itself** (see Input parsing below).

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

**Mandatory constraints — see [[x-voice-rules]] for the full canonical list.** It defines: hook
(first 7 words), length tiers (single 180-260, thread 3-8, long-form), no-link in tweet #1,
voice preservation (Romglish per [[voice-preservation]]), pilon-specific registers, forbidden
openers, forbidden LLM-isms, lint checklist.

This file inherits all of those rules. Do not duplicate them here. If you need a refresher mid-draft,
re-read `$VAULT_ROOT/wiki/concepts/x-voice-rules.md`.

**Flow-specific reminders** (not rules, just things that apply specifically to the draft phase):

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

## Lint pass/fail (per [[x-voice-rules]] checklist)

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
- **When in doubt on voice or format:** re-read `wiki/concepts/x-voice-rules.md` (canonical) and
  `wiki/concepts/voice-preservation.md` (referenced from x-voice-rules). Fluency is the ceiling,
  not the floor.
- **When invoked from `/to-content`:** `seed_ref` is a Faber concept slug — embed it in frontmatter
  as `source_faber: [[concept-slug]]` so the X draft can be cross-linked back to the content-pack.

## Out of scope (yet)

- Translating from other platforms (LinkedIn, blog) — semnal is X-first
- Auto-scheduling — handled by future `semnal schedule`
- Lint with hard fail — see `/semnal-lint` (future) per PRD §5.7
- Metrics prediction — future `/semnal-reflect`
