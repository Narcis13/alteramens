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

Before generating anything, read these three files:
1. `$XQUEUE/pillars.md` — the locked 3 pillars (voice per pilon, audience, post types)
2. `$VAULT_ROOT/wiki/concepts/voice-preservation.md` — the Romglish / accent rules
3. The seed itself (see Input parsing below)

**Hard rule:** you do not invent pillars, you do not sterilize voice, you do not auto-post.

## Input

Parse `$ARGUMENTS`:
- **`S###`** (e.g., `S005`) — find the seed in `$XQUEUE/inbox.md` under its pillar section
- **Raw text** (longer than ~10 words) — treat as inline seed
- **Empty** — list the available seeds (both structured S### blocks and "## Raw captures (CLI)" entries), ask Narcis to pick one

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

**Mandatory constraints on every variant:**

1. **Hook within first 7 words.** No "Something I've been thinking about...", no meta-preambles.
2. **Length:**
   - `single`: 180-260 chars (safe-zone, avoids auto-truncation in previews)
   - `thread`: 3-8 tweets, each ≤ 280 chars, tweet #1 ≤ 260 chars
   - `long-form` (Premium): one block, no arbitrary cap, but keep density high
3. **No external links in tweet #1 of a thread.** Links go in the first reply (2026 algorithm pattern).
4. **Preserve voice** per `voice-preservation.md`:
   - Keep Romanian-cadenced English when the seed has it
   - Romglish OK when intentional ("am prins vreo 5-6 astfel de shift-uri" → "I've caught maybe 5-6 of these shifts" preserves the counting cadence; compare to sterilized "I've experienced several such shifts")
   - Do NOT translate idioms to their nearest-English equivalent when that kills specificity
5. **Voice anchors** (these make it sound like Narcis):
   - Short declarative sentences ending in a beat ("It's here now." / "Use it.")
   - Occasional Romanian loanword where English has no clean equivalent, *italicized* or in quotes
   - Timestamps of experience ("30 years of code", "since DOS 3.1", "20 years in public healthcare IT")
   - Dry pragmatism over inspiration
6. **Pilon 1 registers:** avoid tutorial-speak. State the pattern/judgment, show you live with it.
7. **Pilon 2 registers:** flashback → reframe → punchy landing. Don't overdo nostalgia.
8. **Pilon 3 registers:** specific observation > generic critique. Name the unsexy thing.

**Forbidden:**
- "Great post!" / "Thanks for sharing" / "Here's a thread on..." opener
- Hashtag walls (max 0-1 hashtag, and only if load-bearing)
- Emoji as punctuation (max 1 if truly needed)
- LLM tells: "dive deep", "unlock", "in today's fast-paced world", "game-changer", "at the end of the day"
- Moralizing at the end ("remember, anyone can do it!")

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
source_seed: {S### or "inline"}
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

## Lint pass/fail

- [{x|✗}] Hook in first 7 words: "{first 7 words}"
- [{x|✗}] Length in safe zone: {actual}/{target-range}
- [{x|✗}] No link in tweet #1
- [{x|✗}] Pilon declared
- [{x|✗}] Voice preservation (no sterilization detected)

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
- **When in doubt on voice:** read `wiki/concepts/voice-preservation.md` again before drafting. Fluency is the ceiling, not the floor.

## Out of scope (yet)

- Translating from other platforms (LinkedIn, blog) — semnal is X-first
- Auto-scheduling — handled by future `semnal schedule`
- Lint with hard fail — see `/semnal-lint` (future) per PRD §5.7
- Metrics prediction — future `/semnal-reflect`
