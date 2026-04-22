---
title: "X Voice Rules — Canonical Format & Voice for Platform X"
type: concept
category: pattern
sources: [semnal-x-growth-system]
entities: []
related: [voice-preservation, x-content-pillars, content-pillars, authentic-creation, dogfood-as-content]
maturity: developing
confidence: high
contradictions: []
applications: ["workshop/x-queue/", ".claude/skills/semnal-draft/", ".claude/skills/semnal-reply/", ".claude/skills/to-content/"]
---

# X Voice Rules

**This is the single canonical source for format and voice rules on platform X (Twitter).** Every skill that writes for X reads this file: `/semnal-draft`, `/semnal-reply`, and `/to-content` (when producing the X piece). Do not duplicate these rules elsewhere — link here.

Voice on X is governed by [[voice-preservation]] (no sterilization, accent over fluency). Topic and angle are governed by [[x-content-pillars]] (which pilon does this post serve).

This file defines the mechanics: hook, length, structure, variants, lint.

---

## Why a single source

The same rules used to live in three places: `to-content/references/platforms.md`, `semnal-draft/SKILL.md` (lines 84-110), and implicitly in `semnal-reply`. They drifted: thread length 6-10 vs 3-8, Romglish sterilized vs preserved, pilon mandatory vs absent. A single canonical file removes that drift permanently. Modifying X behavior across the system = editing this file.

---

## Hook

- **First 7 words must carry the hook.** No "Something I've been thinking about...", no meta-preambles, no "Thread 🧵" label.
- **The hook stands alone.** A reader who only sees post 1 must understand the claim. If post 1 only makes sense after reading post 2, the hook fails.
- **Hook patterns that work** (pick one per post; rotate across posts):
  - **Stat hook:** `{Specific surprising number}. Here's what it changes:`
  - **Hot take:** `Most {builders/devs/founders} think {X}. They're wrong.`
  - **Story hook:** `Last week I killed a SaaS idea after 14 days.`
  - **Constraint flex:** `I build 4h/day. Here's what I had to cut.`
  - **Flashback (pilon 2):** `My first computer: 386, 4MB RAM. Today {contrast}.`
  - **Field note (pilon 3):** `20 years in a Romanian public hospital. {observation}.`

---

## Length

| Format | Length | Notes |
|---|---|---|
| **Single** | 180-260 chars | Safe zone — avoids preview auto-truncation |
| **Thread** | 3-8 tweets | Tweet #1 ≤ 260 chars; each subsequent ≤ 280 |
| **Long-form** (Premium) | No hard cap | Density must stay high; scannability still matters |

Threads of 9-12 tweets are allowed when the topic genuinely deserves them; >12 is rare and usually an essay miscast as a thread.

---

## Structural rules

1. **No external links in tweet #1 of a thread.** Algorithm penalizes link-leading posts. Put links in the first reply.
2. **No hashtag walls.** Max 0-1 hashtag per post, and only if load-bearing (an active community tag like `#buildinpublic` only when participating in a real conversation).
3. **No emoji as punctuation.** Max 1 per post if it's doing real work (an arrow, a pointer); usually skip.
4. **No numbered "filler" posts.** If posts 3-7 of a thread are just `3.`, `4.`, `5.` with no incremental insight, compress them.
5. **Pilon declared in frontmatter.** Every X draft declares which pilon (1, 2, or 3) it serves. See [[x-content-pillars]].

---

## Variants — always 3, genuinely different

For every seed/topic, drafts produce **3 variants**, not three near-synonyms:

| Variant | Register | Best for | Hook style |
|---|---|---|---|
| **Plain** | Clear, direct, zero ornament | Pilon 1 (craft) | Fact → insight |
| **Spicy** | Opinion-forward, contrarian, confidence-high | Pilon 3 (unsexy), pilon 1 when taking a stance | Challenge → evidence |
| **Reflective** | Narrative, personal, temporal contrast | Pilon 2 (51yo builder) | Scene → meaning |

If the seed is strongly pilon-2, three reflective-adjacent variants with different beats are acceptable, or widen the register — but they must be 3 distinct angles, not paraphrases.

---

## Voice — Romglish & accent (preserve, don't sterilize)

**Authoritative reference:** [[voice-preservation]].

- **Keep Romanian-cadenced English** when the seed has it. Example: `am prins vreo 5-6 astfel de shift-uri` → `I've caught maybe 5-6 of these shifts` preserves the counting cadence; the sterilized `I've experienced several such shifts` destroys it.
- **Romglish OK when intentional.** Especially for pilon 3 (field observations) and pilon 2 (flashbacks).
- **Do NOT translate idioms** to their nearest-English equivalent when that kills specificity.
- **Italicize Romanian loanwords** where English has no clean equivalent, or quote them.
- **Timestamps of experience** are voice anchors: "30 years of code", "since DOS 3.1", "20 years in public healthcare IT".
- **Short declarative sentences ending in a beat** ("It's here now." / "Use it.") — Narcis's signature rhythm.
- **Dry pragmatism over inspiration.** No motivational landings.

This rule **inverts** the default in `to-content/references/voice-guide.md` (which sterilizes Romglish for blog/Substack/LinkedIn/YouTube). On X, the brand is the accent. Do not apply the to-content voice-guide to X drafts.

---

## Pilon-specific registers

(These complement [[x-content-pillars]], which defines the topical scope of each pilon.)

- **Pilon 1 — AI-native craft:** avoid tutorial-speak. State the pattern/judgment, show you live with it. Concrete commit/skill/workflow > generic advice.
- **Pilon 2 — 51-year-old builder:** flashback → reframe → punchy landing. Don't overdo nostalgia. Specific tech reference (386, Turbo Pascal, DOS 3.1) > "back in my day".
- **Pilon 3 — Unsexy problems:** specific observation > generic critique. Name the unsexy thing (ANAF report, Excel reconciliation, hospital procurement form) — abstraction kills the angle.

---

## Forbidden openers

- `Great post!` / `Thanks for sharing` / `Here's a thread on...`
- `Hot take:` / `Unpopular opinion:` (overused → signals the opposite)
- `Thread 🧵` as the only hook (2020 era)
- `Just a quick thought...` / `Random thought...`
- `Something I've been thinking about...`

For replies (`/semnal-reply`):
- `Great point!` / `Love this!` / `This resonates...`
- `I've been thinking about this...`
- Any variation of `+1` / `100%!` / `This!`

---

## Forbidden LLM-isms (zero tolerance)

- `dive deep` / `let's dive in` / `let's unpack`
- `unlock` / `supercharge` / `turbocharge` / `elevate your`
- `in today's fast-paced world` (and any variant)
- `game-changer` / `revolutionary` / `disruptive` / `transform` / `seamless` / `holistic` / `robust` / `scalable` (when imprecise)
- `leverage` as a verb (noun is fine — it's a real concept)
- `it's not just X, it's Y`
- `at the end of the day` / `when push comes to shove`
- `synergy`
- Moralizing closers: `remember, anyone can do it!` / `the future is now` / `we're all in this together`

---

## Lint checklist (every draft must pass)

Each draft file in `workshop/x-queue/ready/` ends with this checklist. The skill marks each box `[x]` if passed, `[✗]` if failed, with a 1-line fix suggestion.

```
- [ ] Hook in first 7 words: "{first 7 words}"
- [ ] Length in safe zone: {actual}/{target-range}
- [ ] No link in tweet #1
- [ ] Pilon declared (1, 2, or 3)
- [ ] 3 distinct variants (not paraphrases)
- [ ] Voice preservation — no sterilization detected
- [ ] No forbidden opener / LLM-ism
- [ ] No emoji wall, no hashtag wall
```

A draft with any `[✗]` is presented to the human with the failure highlighted; the human decides whether to ship as-is or regenerate.

---

## Reply-specific constraints

For `/semnal-reply` output (replies to other accounts, not original posts):

- ≤ 250 chars (ideally 180-230 — short replies perform on X)
- ≤ 3 sentences
- English only (even if Narcis's thought was in Romanian)
- Must add something the original author doesn't already know or hadn't said
- 3 variants: **context** (extend with Narcis-specific experience), **contrarian** (gentle, evidence-anchored), **question** (specific, only makeable if you read carefully)

Reply rejection bar (self-check before presenting): reject internally if any variant is sycophantic, attack-register contrarian, claims expertise Narcis doesn't have, or is a yes/no question with no engagement payoff.

---

## What is NOT in this file

- **Topical scope per pilon:** see [[x-content-pillars]].
- **Why voice preservation matters strategically:** see [[voice-preservation]].
- **Reply targets / sweet-spot accounts:** see `workshop/x-queue/targets.md`.
- **Capture flow / inbox seeds:** see `tools/semnal/README.md` and `workshop/x-queue/inbox.md`.
- **Multi-platform format rules** (blog, Substack, LinkedIn, YouTube): those live in `.claude/skills/to-content/references/platforms.md`. This file is X-only.

---

## Maintenance

When a rule needs to change (e.g., X tweaks the algorithm, a new failure mode emerges from `/semnal-reflect`):

1. Edit this file.
2. The 3 skills (`/semnal-draft`, `/semnal-reply`, `/to-content`) read it on every invocation — change propagates immediately.
3. Bump the date in the changelog below.
4. Run `/faber-sync` to re-index if structure changed.

### Changelog

- **2026-04-22** — Initial extraction from `semnal-draft/SKILL.md`, `to-content/references/platforms.md`, and inline comments in `voice-preservation.md`. Resolved the Romglish (preserve) vs sterilize (to-content) contradiction in favor of preserve. Standardized thread length to 3-8 (was 6-10 in to-content).
