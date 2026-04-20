# SEO + AEO Blog Template

Template and rules for the blog article piece in `/to-content`. Consult when drafting piece #1
(the blog article). Distilled from the `ai-seo`, `seo-audit`, and `schema-markup` skills, tuned for
Narcis's stack: long-form posts on a personal/company blog, targeting both Google and AI engines
(ChatGPT, Perplexity, AI Overviews, Claude, Gemini).

---

## Keyword & intent

Before writing, decide in your head (write it in the frontmatter):

1. **Primary keyword** — the exact phrase someone would type or prompt. Prefer long-tail (4+ words)
   over short, high-volume, high-competition.
   - Good: `how to build AI skills for small teams`
   - Bad: `AI skills`
2. **Search intent type** — informational, navigational, commercial, transactional. Match your
   structure to it:
   - Informational → teaching structure, H2s as questions, depth
   - Commercial → comparisons, tradeoffs, decision framework
   - Transactional → clear CTA, proof, pricing or next step
3. **AEO candidate question** — the natural-language question this article should answer when
   someone prompts an LLM. One sentence.

If Narcis's wiki doesn't support a claim strong enough to answer that AEO question, widen the
/faber-query or pick a different topic.

---

## Template (use this exact order)

```markdown
# {Title: ≤60 chars, primary keyword near front}

> **TL;DR (50-80 words):** {The direct answer to the AEO candidate question. This is what AI
> engines lift as a citation — make it stand alone, no pronouns that refer to earlier text, no
> "as discussed above". Contains the keyword once, naturally.}

{Optional: one-line byline — "Narcis Brindusescu — builds in 4h/day from Pitești, RO"}

## {H2 #1 — frames the problem, often a "why"-question}

{2-4 paragraphs. Lead with the sharp claim. Reference one wiki concept.}

## {H2 #2 — introduces the angle / framework / counter-position}

{Body. Pull in the wiki concept that grounds this. Cite via `[[slug]]` or real URL.}

### {Optional H3 — a sub-beat under H2 #2, only if it genuinely helps scan}

{...}

## {H2 #3 — the meat: concrete proof, example, case, code snippet}

{This is where specificity lives. A commit, a conversation, a workflow, a number.}

## {H2 #4 — implication / tradeoff / what this means for the reader}

{Tie back to the reader's situation. Not "you should", but "here's what this changes if you're
building X".}

## {H2 #5 (optional) — next step / what I'm doing with this}

{Narcis in motion. "This week I'm testing X. Will report back in issue {N}."}

---

## Frequently asked questions

**{Q1 — natural-language question, matches how people prompt}**
{A1 — 2-3 sentence self-contained answer. AI engines pick these up.}

**{Q2}**
{A2}

**{Q3-5, more if natural, never forced}**

---

*{Optional author block — 2-3 lines about Narcis + links to newsletter/LinkedIn}*
```

### Why this structure works for AEO

- **TL;DR directly under H1** — ChatGPT, Perplexity, and AI Overviews lift it as a standalone
  citation block. If it can't be read in isolation, it won't be cited.
- **Question-phrased H2s** — match LLM prompt patterns. "Why does X work?" H2 → AI picks this H2's
  body as the answer to any similar prompt.
- **FAQ section** — double win: FAQ schema markup gives Google AI Overviews extraction candidates,
  and ChatGPT/Perplexity cite Q→A pairs easily.
- **Concrete proof in H2 #3** — AI engines favor articles with verifiable specifics over floaty
  thought pieces. A commit link or a real number increases citation odds.
- **Author block with link to profile** — Google's E-E-A-T signals and AI entity disambiguation both
  reward clear authorship.

---

## Schema markup — include in the output

Provide a JSON-LD block at the end of the article file (to be placed in `<head>` or after the
content, depending on Narcis's stack). Use these two minimum schemas:

### Article + Person (always)

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "{Article title}",
      "description": "{Meta description, same as frontmatter}",
      "datePublished": "{YYYY-MM-DD}",
      "dateModified": "{YYYY-MM-DD}",
      "author": { "@id": "#narcis" },
      "publisher": { "@id": "#narcis" },
      "mainEntityOfPage": "{canonical URL}",
      "keywords": "{comma-separated relevant keywords}"
    },
    {
      "@type": "Person",
      "@id": "#narcis",
      "name": "Narcis Brindusescu",
      "jobTitle": "Builder — Alteramens",
      "url": "{personal site URL}",
      "sameAs": [
        "{LinkedIn URL}",
        "{GitHub URL}",
        "{X URL}"
      ],
      "knowsAbout": [
        "Software development",
        "AI engineering",
        "Claude Code",
        "Healthcare IT",
        "Accounting automation"
      ]
    }
  ]
}
</script>
```

### FAQPage (if the article has an FAQ section)

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Q1}",
      "acceptedAnswer": { "@type": "Answer", "text": "{A1 plain text, no markdown}" }
    }
    // ... one object per FAQ pair
  ]
}
</script>
```

Leave placeholders (`{canonical URL}`, `{LinkedIn URL}`) for Narcis to fill — the skill doesn't
guess URLs.

---

## Checklist before handing off

- [ ] Title ≤60 chars, primary keyword in the first 40 chars
- [ ] Meta description 150-160 chars, includes keyword, has a verb + promise
- [ ] TL;DR directly under H1, 50-80 words, answers the AEO question, works standalone
- [ ] Each H2 answers a distinct question; at least 2 H2s are phrased as questions
- [ ] Primary keyword appears: title, URL slug, first 100 words, at least one H2, meta
      description. 1-2% density. Never stuffed.
- [ ] 3-8 internal vault/wiki links (as `[[slug]]` if pub URL unknown)
- [ ] 2-5 external links to authoritative sources (only if they earn their spot)
- [ ] At least one concrete proof point (commit, number, example, case)
- [ ] FAQ section with 3-7 Q&As (unless topic truly doesn't warrant it)
- [ ] JSON-LD Article + Person block present; FAQPage if FAQ exists
- [ ] No AI slop phrases (see voice-guide.md's anti-slop sweep)
- [ ] Reading time: if long (1800+ words), add "~N min read" under the TL;DR
- [ ] Closing isn't "conclusion" — it's "what I'm doing next"

---

## Content patterns that get cited by AI (in priority order)

1. **Definitional paragraphs.** "X is {clear definition} — distinct from {adjacent concept} because
   {crisp differentiator}." LLMs love lifting these.
2. **Numbered lists with clear items.** 3-7 items max, each 1-2 sentences.
3. **Tables with comparable cells.** "Option A vs Option B" tables rank well.
4. **Direct question → direct answer pairs** (FAQ).
5. **Quoted stats with source in the same sentence.** "~45% of Google searches now show AI
   Overviews (Pew, 2025)."

## Content patterns AI tends to skip

- Long abstract paragraphs with no anchors.
- Unsourced "studies show" claims.
- Listicles with filler items ("7. You might also consider...").
- Clickbait titles that don't match the content.

Match the high-citation patterns. Skip the low-citation ones.

---

## Narcis-specific calibrations

- **Language:** If publishing to his personal site targeting international builders, EN is default.
  If targeting Romanian SMB / accounting audience (nbrAIn), RO. If unsure, draft EN and note RO
  version as a follow-up (translation drafts don't rank — they need localized examples).
- **Internal links:** Reference the wiki concepts he owns. `[[skill-era]]`, `[[productize-yourself]]`,
  `[[specific-knowledge]]`, `[[encoded-judgment]]`, `[[compounding-games]]`. These build topic
  authority clusters.
- **Author block line:** "Narcis Brindusescu — builder. Hospital IT admin by day, shipping AI
  products 4 hours at a time from Pitești, Romania. Previously 10 years in hospital accounting."
  That specificity is the bio advantage — keep it.
- **Honest caveats:** If a claim is still being validated (most of the Alteramens wiki is), say so
  inline: "This has worked twice; I'll know if it's a pattern after the third attempt." Search
  engines now reward honesty signals.
