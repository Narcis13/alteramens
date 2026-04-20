# Platform Specs for `/to-content`

Per-platform format rules, length tiers, hook patterns, and failure modes. Consult as you draft
each piece.

---

## 1. Blog article (hub)

**Purpose:** SEO + AEO anchor. Compounding asset. Everything else links back here.

| Parameter | Value |
|---|---|
| Length | 1200-2000 words (short: 800-1200, long: 2000-3000) |
| Title | ≤60 chars (Google truncation), includes primary keyword near front |
| Meta description | 150-160 chars, promise + proof, action verb |
| URL slug | kebab-case, 3-6 words, keyword-forward |
| H1 | One only, matches title (or close variant) |
| H2 | 4-8, each answering a distinct sub-question |
| H3 | Under H2 where useful; don't force |
| Paragraphs | 2-4 sentences each — scannable |
| Internal links | 3-8 to related vault/wiki pages (real URLs or `[[slug]]` placeholders) |
| External links | 2-5 to authoritative sources (don't inflate; only if they add signal) |
| Images / diagrams | Optional. If included, must have alt text with keyword context. |

**Opening (first 100 words):**
- State the problem in one sentence.
- Reveal your angle in the next.
- Promise what the reader will leave with.
- No "In this article we will explore..." — trust the reader.

**Middle:**
- Each H2 should deliver a self-contained answer. Reader bounces to a specific H2 via search →
  finds the answer → stays.
- Use tables, numbered lists, and pull quotes where they earn their place. Not for decoration.
- Quote one wiki concept per ~400 words, minimum. Links or `[[wikilinks]]`.

**Closing:**
- A 2-3 sentence "what I'm doing next" — not "conclusion". Narcis is mid-build, show it.
- One CTA only (newsletter, or "reply on LinkedIn", never a generic "share this").

**AEO rules** (Answer Engine Optimization — see `/ai-seo` skill for depth):
- Include a short **TL;DR (50-80 words)** directly under the H1 — AI systems lift this as citation
  fodder.
- Use **question-phrased H2s** where natural ("Why does the Skill Era favor small teams?") —
  matches how people prompt LLMs.
- Include at least one **clean definition** in a short paragraph (concept → 1-sentence
  definition). Easy to extract.
- Add **FAQ schema** section at the end (5-7 Q&As) when the topic has natural questions. Mark up
  with JSON-LD (see `seo-blog-template.md`).
- Use structured data: `Article` + `Person` (author=Narcis) + optional `FAQPage`. Template in
  `seo-blog-template.md`.

**Failure modes:**
- Keyword stuffed. 1-2% density is plenty.
- H2s that are just section labels ("Background", "Context") — waste of ranking real estate.
- Closing with a generic "What are your thoughts?" — dead CTA.

---

## 2. Substack newsletter

**Purpose:** Relationship. Subscribers chose this. Reward them with a personal voice.

| Parameter | Value |
|---|---|
| Subject line | 40-60 chars, curiosity > clickbait, no ALL CAPS, no emoji spam |
| Preview text | Under 100 chars, doesn't repeat the subject |
| Length | 700-1200 words typical (long-form day: up to 2000) |
| Paragraph length | 1-4 sentences. Frequent line breaks. |
| Opening | Personal, context-specific. "It's Sunday evening in Pitești..." > "Hello readers!" |

**Structure (the "letter" pattern):**
1. **Hook (1-2 short paragraphs)** — a specific moment, question, or observation from this week
2. **The thing (body, 4-8 paragraphs)** — the argument / story / learning, paced with the
   reader
3. **A concrete proof** — a commit, a conversation, a number, a screenshot caption (describe it
   even if you won't attach)
4. **Implication / where it's going next** — 2-3 sentences
5. **Sign-off** — casual, signed as Narcis, no corporate sig block

**Voice:**
- Contractions, yes.
- "You and I" framing — more than blog or X.
- Allowed: small detours, a parenthetical aside, a note about life (the job, the kids, the
  hospital) — these are the texture.

**CTA:**
- One soft CTA, usually at the end: "reply and tell me what you'd do", "if you want a second
  part, hit reply", "forward to one builder who's stuck".
- NOT: "subscribe to upgrade", "tap the heart if you liked this".

**Failure modes:**
- Reads like a repurposed blog post. If you can paste it into WordPress without touching a word,
  rewrite.
- Too polished — it should feel written at 22:00, not run through three editors.
- No "you" — a newsletter without "you" is just a diary.

---

## 3. LinkedIn post

**Purpose:** Reach the builder/entrepreneur audience. One big idea. One specific proof.

| Parameter | Value |
|---|---|
| Character count | 1200-1800 chars (absolute max ~3000, but rarely justified) |
| Line breaks | Frequent — each "line" is 1-2 sentences, blank line between |
| Hook | First 3 lines — visible before "see more" — must earn the click |
| CTA | Soft, at the end: a question inviting replies, or "thoughts?" (only if genuinely curious) |
| Hashtags | 3-5 targeted. At the end only. No `#entrepreneur` — too broad. |
| External links | NOT in the body (LinkedIn suppresses reach). Put in first comment or skip. |
| Emojis | 0-2 total, never decorative |

**Hook patterns (pick one):**
- **Contrarian:** "Everyone says {common advice}. I tried it for 6 months. Here's what actually
  worked."
- **Story beat:** "A week ago, my {son/wife/client/colleague} asked me a question I couldn't
  answer."
- **Constraint flex:** "I build software 4 hours a day. Last {month/quarter} I shipped {X}. Here's
  what I had to cut."
- **Specific number:** "3 lines of code saved us ~4 hours a month across the team. Worth
  examining why."

**Body pattern (the "one idea + one proof + one lesson" structure):**
```
{Hook line 1}
{Hook line 2 that pays off the curiosity}

{Context — 2-3 lines}

{The core idea — 2-3 lines, quotable}

{The proof — specific: a project, a commit, a conversation, a number}

{The lesson / implication — 2-3 lines}

{Soft question to invite replies}

{3-5 hashtags}
```

**Voice on LinkedIn:**
- Professional but human. First-person singular.
- No "We at [Company]..." unless Narcis is posting for nbrAIn specifically.
- Romanian LinkedIn audience is bilingual — default to the language of the topic, but personal
  posts lean RO, technical/global posts lean EN.

**Failure modes:**
- The classic "broetry" with every sentence on its own line. A 1200-char post with 40 line breaks
  looks spammy now. Use paragraphs.
- Hook promises big, payoff is small.
- "This might sound cheesy, but..." — never.

---

## 4. X / Twitter thread

**Purpose:** Global builder-tech audience. Contrarian or highly specific claims spread best.

| Parameter | Value |
|---|---|
| Posts per thread | 6-10 typical (short: 4-6, long: 10-15; >15 rare) |
| Per-post character limit | 280 (count carefully, emoji and URLs count) |
| Hook (post 1) | Must stand alone. Bold claim, contrarian take, or specific number. |
| CTA (last post) | Usually a bookmark cue ("bookmark this for the next time...") or a "follow for..." ONLY if it ties to the thread topic |
| Hashtags | 0-2 max, and only if they're active community tags |
| Media | A screenshot, GIF, or diagram in post 1 massively boosts reach. Include if relevant. |

**Thread structure:**
```
1/ {Hook — bold claim or contrarian take, stands alone}
2/ {Context / why most people get this wrong}
3/ {The core insight or framework}
4/ {Proof point 1 — concrete}
5/ {Proof point 2 — concrete}
6/ {Implication — zoom out}
7/ {Quotable line — this is the one people screenshot}
8/ {Recap + CTA}
```

**Hook patterns that work (pick one):**
- **Hot take lead:** "Most {builders/founders/devs} think {X}. They're wrong. Here's why."
- **List promise:** "After {6 months / N attempts / building X}, here are the {3/5/7} things that
  mattered:"
- **Story hook:** "Last week I killed a SaaS idea after 14 days. What I learned:"
- **Stat hook:** "{Specific surprising number}. Here's what it changes:"

**Voice on X:**
- Punchy, no throat-clearing. Every post earns its spot.
- Short sentences. Period. Period.
- Allowed: strategic line breaks within a post for rhythm.
- Allowed: a single emoji in the hook if it's doing real work (an arrow, a pointer). Usually skip.

**Failure modes:**
- Hook requires reading post 2 to make sense. Fail.
- Thread reads like a blog post chopped arbitrarily. Each post should reward standalone reading.
- "Thread 🧵" as the only hook — that's 2020. Just start with the claim.
- Numbered without adding value — if posts 3-7 are "3.", "4.", "5." with no incremental insight,
  compress to 3 posts.

---

## 5. YouTube script

**Purpose:** Spoken content. Screen recordings, talking-head (face-on-camera constraint respected —
Narcis defaults to screen-rec + voiceover per [[personal-brand-strategy]]), or hybrid.

| Parameter | Value |
|---|---|
| Length | 3-6 min for short-form, 8-15 min for tutorial, 15-25 min for deep dive |
| Words per minute | ~150 spoken. 3 min ≈ 450 words. 6 min ≈ 900. |
| Hook | First 15 seconds — viewer decides whether to stay. Say the payoff upfront. |
| Structure | Hook → intro → 2-4 main beats → outro + CTA |
| B-roll cues | Bracketed in the script: `[screen rec of Claude Code running]`, `[diagram of skill architecture]` |
| Timestamps | Include in script — makes description-writing trivial later |

**Script format (use this template):**
```
[0:00-0:15] Hook
"{Spoken hook, 2-3 sentences max}"
[Cue: dramatic zoom on code / result]

[0:15-0:45] Intro
"{Name the specific promise of this video. 'In the next 6 minutes I'll show you...'}"
"{Quick context: who you are, why you're the right person to explain this}"

[0:45-2:30] Beat 1 — {Title}
"{Spoken content}"
[B-roll: screen rec of X]

[2:30-4:00] Beat 2 — {Title}
...

[4:00-5:30] Beat 3 — {Title}
...

[5:30-6:00] Outro + CTA
"{Recap in one sentence}"
"{CTA — specific and authentic. 'Comment with the thing you'd automate next, I answer every comment within 24h.'}"
"{Subscribe ask — only if natural}"
```

**Spoken-voice rules:**
- Write contractions: "I'm", "you're", "here's".
- Read every line aloud. If you stumble, rewrite.
- Short sentences. Spoken sentences are shorter than written ones.
- Repeat key phrases — live listeners miss things.
- Signpost: "Here's the thing...", "Back to the main point...".
- Allow pauses. `[beat]` or `...` for rhythm.

**CTAs that work (vs. don't):**
- ✅ "Comment with the dumbest part of your current workflow — I'll suggest a 30-second fix."
- ✅ "If you've built something similar, drop a link — I'll study it."
- ❌ "Smash that like button and subscribe for more!"
- ❌ "Let me know in the comments!" (generic)

**Description template (include in output):**
```
{1-sentence hook from the video}

{3-4 sentence summary of what's covered}

Timestamps:
0:00 - Hook
0:15 - Intro
0:45 - {Beat 1 title}
2:30 - {Beat 2 title}
4:00 - {Beat 3 title}
5:30 - Outro

Related links:
- {Blog version of this topic}: {URL}
- {Referenced tool/project}: {URL}
- Newsletter: {URL}

Say hi:
LinkedIn: {URL}
X: {URL}
```

**Failure modes:**
- Written like a blog post, not spoken. Test: read aloud. If you sound like you're reading a
  paper, rewrite.
- Hook that doesn't pay off by the 45-second mark.
- Too much setup, too little meat. The first real insight should land by 1:00.

---

## Cross-platform length cheat sheet

| Platform | Short | Standard | Long |
|---|---|---|---|
| Blog | 800 words | 1200-1800 | 2500+ |
| Substack | 500 words | 800-1200 | 1800+ |
| LinkedIn | 600 chars | 1200-1800 | 2500 (rare) |
| X thread | 4-5 posts | 7-9 | 12-15 (rare) |
| YouTube | 3 min | 5-7 min | 10-15 min |

Default to "standard" unless the topic genuinely deserves more. More length is not more value.

---

## Hook cheat sheet (one per piece)

Never reuse the same hook across all five pieces. Each platform wants a different opening move.

| Platform | Strongest hook type |
|---|---|
| Blog | **Problem statement + angle** — "The skill era breaks the SaaS distribution playbook. Here's why." |
| Substack | **Personal moment** — "I was debugging at 22:30 last Thursday when it hit me..." |
| LinkedIn | **Contrarian claim** or **constraint flex** — "I build 4h a day. Here's what I had to give up to ship." |
| X thread | **Bold, standalone claim** — "Most devtools will be unbundled into skills by 2027." |
| YouTube | **Payoff upfront** — "By the end of this video, you'll have an AI tutor that costs <$2/user/month." |

---

## One more rule: no duplicated phrasing

If you reuse the same sentence across pieces, the reader/viewer who catches two of them thinks
"bot". Paraphrase aggressively. Same argument, different words.
