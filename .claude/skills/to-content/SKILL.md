---
name: to-content
description: |
  Turn a topic, idea, draft, or vault/wiki page into five ready-to-publish content pieces — a YouTube
  script, a LinkedIn post, a Substack newsletter issue, an X thread, and an SEO-optimized blog article
  — all aligned with the Alteramens second-brain (Faber wiki) and Narcis's personal voice. Always
  invokes /faber-query first to ground the content in accumulated knowledge, cited concepts, entities,
  and past syntheses so output never drifts from the builder's taste.

  Use this skill whenever the user says "write content about X", "turn this into content",
  "make me a LinkedIn post", "blog article about", "newsletter issue on", "YouTube script for",
  "tweet thread about", "content pack", "repurpose this idea", "to content", "scrie conținut despre",
  "fă un articol despre", "fă o postare LinkedIn", "fă un thread pe X", "script YouTube pentru",
  "newsletter despre", or any request to produce social / blog / newsletter / video content from a
  topic or source. Trigger even if the user names only one platform — the skill still produces all five
  pieces so nothing is left on the table, but leads with the requested one.

  Do NOT use this skill for: content strategy planning (use content-strategy), editing existing copy
  (use copy-editing), ad creative variations (use ad-creative), or raw idea brainstorming with no
  intent to publish.
metadata:
  version: 1.0.0
---

# to-content — Topic → Five Aligned Content Pieces

You turn one topic, one idea, or one existing wiki/vault document into a bundle of five
ready-to-publish content pieces. Each piece is platform-native and carries Narcis's voice and the
accumulated judgment from the Faber wiki, not generic LLM slop.

**Why the Faber grounding matters.** Narcis has spent months encoding his worldview into `wiki/`:
concepts like [[skill-era]], [[productize-yourself]], [[encoded-judgment]], [[authentic-creation]],
[[distribution-over-product]]; entities like [[nbrain]], [[alteramens]], [[mihai-brindusescu]]; and
syntheses that already decided his positioning ([[personal-brand-strategy]],
[[content-copy-framework-alteramens]]). Content produced without consulting those would contradict
his own documented positions. That is unacceptable — the whole point is a **compounding voice**, not
one-off posts. The skill therefore **always** runs /faber-query before writing.

**Why all five formats in one shot.** Repurposing is core to Narcis's strategy — see the "one pillar
→ many atoms" flow in `social-content` references and [[content-pillars]]. Producing them together
forces consistency across channels and lets him pick what to ship today vs. queue for later.

---

## Inputs

Parse `$ARGUMENTS` for the topic. It can be:

1. **A free-form topic phrase** — e.g. "cum construiesc cu AI în 4 ore pe zi", "the skill era for solo
   builders", "why I killed my SaaS idea after 2 weeks"
2. **A wiki slug** — e.g. `skill-era`, `productize-yourself`, `personal-brand-strategy`
3. **A vault path** — e.g. `workshop/drafts/articol-interesant.md`,
   `wiki/syntheses/personal-brand-strategy.md`
4. **"last query" / "ultima interogare"** — use the most recent synthesis page as the seed
5. **Nothing** — ask one short question: "Despre ce subiect? (topic, slug, sau cale către fișier)"

Also scan `$ARGUMENTS` for **platform hints** ("for linkedin", "blog doar", "doar un tweet thread",
"in engleza", "in romana"). These don't narrow output — you still generate all five pieces — but
they determine:
- **Language** — Romanian unless the user asks English (default: detect from topic string; if mixed,
  default RO; see Language Rules below)
- **Which piece to present first** in your response (the one the user asked about)
- **Primary length tier** — if they say "short"/"scurt", bias every piece toward the short end

---

## Workflow

### Step 1 — Ground in the wiki via /faber-query

This is the non-negotiable first step. Do NOT start writing before it runs.

Invoke /faber-query with a focused question assembled from the topic. Choose the phrasing that will
pull the most relevant concepts, entities, and syntheses:

- For broad topics: `"what does faber know about <topic>?"`
- For positioning questions: `"what is Narcis's position on <topic>?"`
- For vault seeds: `"synthesize <slug> for a public-facing piece"`

Run it as a real skill invocation (so the SQL/FTS happens and citations are real). The query should
return: relevant concept pages, related entities, past syntheses, key claims, and contradictions.
Capture these — they're your raw material and your guardrails.

**If /faber-query returns nothing useful** (truly novel topic with no wiki coverage): proceed, but
flag this in your final output: "⚠️ Faber has no prior coverage of this topic — consider
`/faber-ingest` after publishing so future content compounds on it." Then use the voice guide
(below) as the primary anchor, since the wiki can't.

### Step 2 — Extract the five inputs

From the /faber-query result, extract and hold onto these in memory before drafting:

| Element | What to extract | Used for |
|---|---|---|
| **Core claim** | The single most provocative, defensible thing the wiki says on this topic | Hook of every piece |
| **2-3 supporting concepts** | Wiki concept pages that back the claim | Evidence, backlinks in the blog |
| **1-2 relevant entities** | People/companies/tools that matter (Naval, nbrAIn, Mihai, etc.) | Proof-of-specificity |
| **1 personal angle** | Narcis-specific detail: the 4h/day constraint, the son's exam, the hospital job, the wife's accounting firm, or an in-flight project | The thing nobody else can write |
| **1 contradicted view** | What the mainstream/competitor position is, which the wiki challenges | Contrarian hook |

If any of these are missing after /faber-query, ask yourself whether you're truly grounded or
inventing. If inventing → re-query with a narrower phrasing instead of bluffing.

### Step 3 — Read the voice guide

Read `references/voice-guide.md` (always). It distills Narcis's tone, his Yes/No list, his anti-slop
rules, and the RO/EN switch. The output must pass the quick voice checks at the bottom of that file.

For the blog article, also read `references/seo-blog-template.md` (article structure, AEO
optimization, schema-markup hints).

For platform specs (character limits, format rules, hook formulas), read `references/platforms.md`.
Don't memorize — consult as you draft each piece.

### Step 4 — Draft all five pieces

Produce them in this fixed order (regardless of what the user asked for — you'll reorder in
presentation):

1. **Blog article** — the anchor, SEO+AEO-optimized, ~1200-2000 words
2. **Substack newsletter** — essayistic version of the same core claim, ~700-1200 words, personal and
   conversational
3. **LinkedIn post** — 1200-1800 characters, one big idea + one concrete proof + soft CTA
4. **X thread** — 6-10 posts, each ≤280 chars, strong hook, claim-evidence-claim rhythm
5. **YouTube script** — 3-6 min video (~450-900 spoken words), with timestamps, B-roll cues, and a
   hook in the first 15 seconds

Write the blog first because it forces you to organize the argument. The other four are
compressions/adaptations of that argument. This matches the hub-and-spoke pattern in
[[hub-and-spoke-architecture]] and [[content-pillars]].

**Every piece must cite or allude to at least one wiki concept** — not by raw URL, but woven in:
"as Naval calls it, specific knowledge", "I've written before that distribution beats product", etc.
For the blog article specifically, include real markdown links to the vault-published version of
those concepts if they exist on a public site (Narcis will publish wiki pages selectively — if
unsure, leave as `[[slug]]` placeholder and note in the output that links need swapping).

### Step 5 — Output format

Write all five pieces to a single markdown file at
`workshop/content/{YYYY-MM-DD}/{slug}.md` — one dated subfolder per day, one file per content pack.
Create both `workshop/content/` and the dated subfolder if missing (`mkdir -p`). Multiple packs on
the same day coexist as sibling files in that day's folder. This way the pack itself becomes a vault
doc that `/faber-ingest` can later pick up, and the date folder makes it easy to see what shipped
on a given day at a glance.

**Example paths:**
- `workshop/content/2026-04-20/skill-era-solo-builders.md`
- `workshop/content/2026-04-20/4h-per-day-constraint.md` (second pack same day)
- `workshop/content/2026-04-21/productize-yourself-devs.md`

File structure — use this exact template:

```markdown
---
type: content-pack
topic: "{one-line topic}"
seed: "{wiki slug or vault path or 'free-form'}"
language: "{ro|en}"
created: {YYYY-MM-DD}
faber_concepts: [list of slugs cited]
faber_entities: [list of slugs cited]
status: draft
---

# Content Pack — {Topic}

> Grounded via /faber-query on {date}. Core claim: {one sentence}.

## Faber alignment
- Core claim: {...}
- Supporting concepts: [[slug]], [[slug]]
- Personal angle: {...}
- Contradicted view: {...}

---

## 1. Blog article (SEO+AEO)
**Target keyword:** {primary keyword}
**Title:** {60 chars max, includes keyword}
**Slug:** {kebab-case}
**Meta description:** {155 chars max}

{full article, ~1200-2000 words, with H2/H3 structure}

---

## 2. Substack newsletter
**Subject line:** {40-60 chars}
**Preview text:** {under 100 chars}

{full newsletter, ~700-1200 words}

---

## 3. LinkedIn post
{full post, 1200-1800 chars, with line breaks for scan-ability}

---

## 4. X thread
1/ {hook, ≤280 chars}
2/ {...}
...
N/ {CTA or wrap, ≤280 chars}

---

## 5. YouTube script (~{N} min)
**Hook (0:00-0:15):** {...}
**Intro (0:15-0:45):** {...}
**Main beat 1 (0:45-...):** {...}
...
**Outro + CTA (last 20s):** {...}

**B-roll cues:** {list}
```

After writing the file, reply to the user with:

1. A one-line confirmation including the file path
2. The piece they asked about inlined in the chat (so they can read/edit immediately)
3. A short "What to ship first" suggestion — which piece has the highest ROI given the topic (e.g.
   contrarian takes → X + LinkedIn first; technical deep-dives → blog + YouTube first)
4. An offer: "Want me to also draft an Instagram carousel, a TikTok short, or a cold-email pitch from
   this? I can chain into the respective skill."

### Step 6 — Offer to log and cross-link

Ask: "Should I append an entry to `wiki/log.md` (operation: `content-pack`) and/or run `/faber-link`
to cross-reference this pack with the concepts it cites?" If yes, run `/faber-link` on the new
content file.

---

## Language Rules

- **Default: Romanian.** Narcis's audience is bilingual but his "authentic voice" registers stronger
  in RO per [[authentic-creation]] and [[personal-brand-strategy]].
- **Exceptions (use EN):**
  - User explicitly asks for EN ("in English", "în engleză")
  - Topic targets global builder audience (e.g. "the skill era", "productize yourself") — those
    compounding games need reach
  - Blog article targeting international AEO — discuss with user if unclear
- **Mixed is fine** for the blog meta + technical terms (e.g. RO body with EN code comments / product
  names / skills).
- **Consistency within a piece is mandatory** — never RO/EN code-switched paragraphs unless the
  bilingual tone is the point (rare).
- **Voice guide has RO-specific rules** (avoid corporate RO buzzwords like "soluții inovatoare",
  prefer conversational constructions). Read it even when writing in EN — the discipline translates.

---

## Quality Gates

Before handing off, each piece must pass:

1. **Faber gate** — at least one wiki concept woven in naturally (not "As the wiki says..." — woven,
   like "what Naval calls specific knowledge").
2. **Specificity gate** — at least one piece of Narcis-only detail: the 4h/day, the son's exam, the
   hospital job, Workscript, the accounting firm with 20 clients, the Pitești hospital. No anonymous
   "I'm a builder" content.
3. **Voice gate** — passes the checklist in `references/voice-guide.md` (no buzzwords, no corporate
   platitudes, no "10 tips" listicle energy unless explicitly requested).
4. **Anti-slop gate** — no "In today's fast-paced world", no "Let's dive in", no emoji walls, no
   "game-changer", no "revolutionary". If you caught yourself writing one, rewrite.
5. **Platform gate** — each piece obeys the length, format, and hook rules in
   `references/platforms.md`. An X thread that's actually 3 posts is a fail.
6. **Honesty gate** — no fabricated stats, no invented case studies, no fake testimonials. If a
   number isn't in the wiki, either leave it out or mark it `{ADD REAL NUMBER}`.

If any gate fails, fix silently before output. Don't waste Narcis's review time on obvious misses.

---

## Anti-patterns

- **Starting to write before /faber-query.** You will produce generic slop. Don't.
- **Summarizing the wiki instead of using it.** The wiki is fuel, not the content. Narcis wrote the
  concepts to *apply* them, not to recite them.
- **Giving all five pieces the same hook.** Each platform rewards a different angle — contrarian on
  X, personal on LinkedIn, framework on blog, story on Substack, demo on YouTube. Same core claim,
  five different opening moves.
- **Listicle template fatigue** — "7 ways to...", "5 mistakes...". Unless the topic is genuinely a
  list, don't force it. Narcis's voice is essayistic, not Buzzfeed.
- **Over-hashtagging.** LinkedIn: 3-5 targeted. X: 0-2, only if it's a community tag. No hashtag
  spam.
- **Emoji walls.** One or two max per LinkedIn post, zero in Substack body, zero in blog body, spare
  in X thread if it serves rhythm.
- **Generic CTAs** — "Follow for more". Instead: "Reply with the thing you're stuck on, I'll answer
  when I'm off shift at 15:00" (authenticity cue).

---

## Example invocations

**Romanian topic, no slug:**
> "fă-mi conținut despre de ce nu construiesc în public tot timpul"

You run /faber-query with "what does faber know about building in public and accountability?",
pull [[building-in-public]], [[authentic-creation]], [[accountability]], the
[[personal-brand-strategy]] synthesis, draft all five in RO, save to
`workshop/content/{today}/{slug}.md`, inline the LinkedIn piece because it's the obvious first-ship.

**English, targeting global builder audience:**
> "/to-content the skill era for solo developers"

You run /faber-query on [[skill-era]], [[productize-yourself]], [[encoded-judgment]],
[[specific-knowledge]], draft in EN, lead with the X thread (global builder audience lives there),
save the pack, offer to chain into `/ad-creative` for a promotion angle.

**From a specific synthesis:**
> "turn wiki/syntheses/personal-brand-strategy.md into content"

You read that synthesis directly (it's already curated), still run /faber-query to pull adjacent
concepts not in the synthesis, draft all five with the "umbrella brand, two products" angle, lead
with the blog (the synthesis is blog-length material already).

---

## Related skills

- **/faber-query** — always invoked first. Non-negotiable.
- **/faber-ingest** — run after the user decides this content pack is worth promoting to the wiki
  (e.g. its core claim matures).
- **/faber-link** — optional post-step, cross-link the content file with cited concepts.
- **copywriting** — for a single high-stakes piece (landing page) rather than a multi-channel pack.
- **copy-editing** — run after the user decides which pieces to actually ship, for a final polish
  pass.
- **content-strategy** — if the user is asking "what should I write about" rather than "write
  this" — redirect there.
- **social-content** — for ongoing calendar management once pieces are produced.
- **ai-seo** — for deeper AEO optimization on the blog article specifically.
