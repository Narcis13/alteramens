---
title: "Semnal — Sistem personal de creștere organică pe X"
type: source
format: article
origin: vault
source_ref: "workshop/drafts/semnal-x-growth-system.md"
ingested: 2026-04-21
guided: true
entities: [alteramens]
concepts: [voice-preservation, capture-at-source, human-in-loop-publishing, dogfood-as-content, friction-cost, content-pillars, building-in-public, authentic-creation, skill-era, productize-yourself]
key_claims:
  - "The bottleneck to growing an X audience is not lack of content — it is friction at shipping (activation energy from idea to published post)"
  - "Bot armies solve volume-fake; the real problem is emitting the authentic signal that already exists in the builder's head"
  - "LLM-translated output must preserve voice and accent (Romglish when authentic) — sterilized fluency is worse than imperfect authenticity"
  - "Hard rule: human in the loop before every publish — zero tolerance for auto-posting, auto-reply, or follow automation"
  - "Capture must happen where thought happens (terminal, Obsidian, browser) — not in a dedicated app that imposes context switching"
  - "Three content pillars proposed: AI agents for solo builders; 51yo builder from Romanian public hospital; Skill Era craftsmanship"
  - "Building the growth tool publicly IS content for pillar 1 — the meta-loop solves the cold-start chicken-egg problem"
  - "Bookmark ratio is a higher-signal metric than like ratio — measure what drives long-term retention of your output, not dopamine"
  - "Consecutive weeks with ≥5 posts is the master metric — consistency beats intensity for compounding audiences"
  - "n-of-1 target user (Narcis himself) until 500+ followers — productize only after the dogfood run proves the system"
confidence: high
---

# Semnal — Sistem personal de creștere organică pe X

## Origin

Draft PRD written by Narcis on 2026-04-21, living in `workshop/drafts/semnal-x-growth-system.md`. Directly motivated by the confession in `owner/Who am i.md`: Narcis has the raw material for an authentic X presence — 30 years of code, hybrid public-hospital/tech/AI background, age 51 as memorable angle, passion for the agent zeitgeist — but keeps postponing actually posting.

The draft reframes the problem: this is not a content problem, it is a **shipping friction** problem. Bot armies and AI content farms solve for volume; Semnal solves for *emission of real signal that already exists*. Hence the name.

## The Reframe

| Common framing | Semnal reframing |
|---|---|
| "I don't know what to post" | "I know what to post; I postpone it" |
| Growth = volume | Growth = consistency + authenticity |
| AI writes posts | AI reduces friction; human ships |
| Tools automate posting | Tools amplify capture + drafting; human in loop at publish |
| Optimize for likes / viral | Optimize for bookmark ratio + consecutive posting weeks |
| Broad audience | n-of-1 user (builder himself) until system is validated |

## Design Principles (non-negotiable)

1. **Capture where thought happens** — terminal → CLI, Obsidian → hotkey plugin, browser (X + any site) → Chrome extension. No dedicated capture app, no context switch. Operationalizes [[capture-at-source]].
2. **Human always in the loop before publish** — AI drafts, translates, suggests angles; human presses publish. Operationalizes [[human-in-loop-publishing]].
3. **Voice preservation > fluency** — English with Narcis's authentic accent > LLM-sterilized English. Romglish preserved when intentional. Operationalizes [[voice-preservation]].
4. **Bias spre shipping, nu spre perfecționare** — target <60s from "I have an idea" to "it's in the queue". Activation energy is the enemy. Extends [[friction-cost]] into the personal-publishing domain.
5. **Pillars over randomness** — 2-3 clear themes; random posting is amnesic for algorithm and followers. Applies [[content-pillars]].
6. **Measure, then double down** — bookmarks > likes; weekly synthesis filed in `wiki/syntheses/semnal-week-NN.md` so learning compounds in Faber.
7. **Dogfood public** — building Semnal IS content on pillar 1. The meta-loop solves cold-start. Crystallized as [[dogfood-as-content]].

## The Three Pillars (draft)

| Pillar | Angle | Why only Narcis can write this |
|---|---|---|
| **AI agents for solo builders** | How to build as a one-man-team using Claude Code + skills | 30 years of code + real AI hobby + actual build experience ≠ influencer without code |
| **Building as a 51yo from a Romanian public hospital** | Solopreneur journal — post-career, not pre-career | Complete inversion of the 22-yo-SF-founder narrative. Rarity = memorability. |
| **Skill Era craftsmanship** | Patterns, judgment, opinions — not tutorials | Direct application of [[skill-era]] thesis. Long-game [[compounding-games]]. |

These are draft pillars to be refined, not final. See [[content-pillars]] for the 4-lens validation methodology.

## MVP Feature Set

### Capture Layer (week 1)
- **Obsidian hotkey** (`Cmd+Shift+X`): selection → seed post → `workshop/x-queue/inbox.md` with metadata (source path, timestamp, suggested pillar)
- **CLI** (`semnal capture "text rapid"`): one-line append to `x-queue/inbox.md` from terminal
- **Chrome extension**: on X or any site, select text → "riff on this" → captures quote + URL + Narcis's thought

### Draft Layer (week 1)
Skill `/semnal-draft`:
- Takes a seed from inbox
- Asks: pillar? format (single / thread / long-form)? language?
- Generates 3 variants with distinct voices (plain, spicy, reflective)
- **Preserves Romglish where authentic** — does not sterilize
- Output: `workshop/x-queue/ready/YYYY-MM-DD-slug.md` with frontmatter (pillar, format, hook, scheduled_for)

### Review & Queue (week 1)
- `semnal queue` — list `ready/`
- `semnal schedule <slug> <time>` — move to `scheduled/`
- **Does not post autonomously.** Generates a macOS notification at scheduled time with copy-paste-ready text + post-creation link. Optional future: [[typefully]]/Hypefury bridge for real scheduling — but always with manual confirmation.

### Reply Radar (weeks 2-3)
- Chrome extension scans timeline while Narcis is on X
- Highlights posts from pillars that meet: <50 replies, >100 likes in first hour, author has 5k-50k followers (discovery sweet spot)
- "Draft reply" panel offers 3 value-adding variants (not "great post!")
- Narcis chooses, edits, posts manually

### Learning Loop (weeks 3-4)
- `semnal sync` — pull metrics (impressions, bookmarks, replies, attributed follows) for last week's posts via X API or local scraper
- `semnal reflect` — skill that analyzes pillar performance, hook patterns, optimal posting hours, format performance
- Weekly synthesis filed in `wiki/syntheses/semnal-week-NN.md` — knowledge compounds in Faber

## Anti-Features (positioning boundary)

Explicitly rejected, today and if Semnal ever becomes a public product:

- Auto-posting at optimal times
- Auto-reply with GPT to comments
- Automated follow/unfollow
- Engagement pods / organized reciprocity
- Thread generators from scraped articles (commodity slop)
- "Viral template" generators

Public positioning: **"anti-slop tool for builders with something real to say."**

## Success Metrics

For Narcis (not for the product — n-of-1 target):

| Metric | T0 (today) | 90 days | 180 days |
|---|---|---|---|
| Followers | ~current | 300+ | **1000+** |
| Posts/week | ~0-1 | 5-7 | 7-14 |
| Valuable replies/week | 0 | 10 | 25 |
| Posts with >500 impressions | n/a | 20% | 40% |
| Avg bookmark ratio | n/a | 2% | 5% |

**Master metric:** consecutive weeks with ≥5 posts. Consistency > intensity.

## Roadmap

- **Week 1:** CLI + `x-queue/` structure + `/semnal-draft` skill + 10 seeds + **first post within 48h** (action bias)
- **Weeks 2-3:** Obsidian hotkey plugin + Chrome extension + Reply radar MVP
- **Weeks 4-6:** X API metrics sync + `/semnal-reflect` + first weekly synthesis
- **Weeks 7-12:** Iterate on learning loop. If >500 followers → consider productization (public skill + template vault + open-source extension) and meta-content ("how I built the tool that took me from 0 to 1000 without bots")

## Why This Solves the Real Problem

Narcis's problem is not ideation. It is the unfortunate tendency to postpone posting. Semnal attacks that directly:

- **Postponement** = friction → Semnal cuts friction to <60s from idea to queue
- **Perfectionism** = paralysis → Semnal offers 3 variants immediately, forcing a pick-and-ship loop
- **"Prefer the building experiment over posting"** = perfect → building Semnal IS the experiment, and sharing the build IS pillar-1 content

Meta-observation (Narcis's own): this project is the most authentic marketing possible for himself — it embodies [[skill-era]] (skills that encode judgment) plus [[productize-yourself]] (code and content as permissionless leverage). If built publicly, the tool and the story become the same asset.

## Connections

- Directly addresses the confession in `owner/Who am i.md` ("tendința nefericită să tot amân, să postez")
- Applies [[content-pillars]] methodology with a concrete 3-pillar proposal
- Concrete variant of [[building-in-public]] where the tool being built is the growth tool itself
- Extends [[friction-cost]] from form/conversion optimization into personal publishing
- Introduces four new concepts: [[voice-preservation]], [[capture-at-source]], [[human-in-loop-publishing]], [[dogfood-as-content]]
- Philosophical anchor: [[authentic-creation]] — nobody else is a 51yo Romanian hospital IT admin + economist + 30yr coder + AI builder posting about the craft
