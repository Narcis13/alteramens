---
title: "Marketing Skills Catalog — Local Agent Expertise"
type: synthesis
trigger: insight
question: "What marketing expertise is already available as Claude Code skills in this workspace, and when should each one be invoked?"
sources_consulted: []
concepts_involved: [encoded-judgment, specific-knowledge, skill-era, leverage, distribution-over-product]
entities_involved: [alteramens]
created: 2026-04-14
updated: 2026-04-14
maturity: developing
---

# Marketing Skills Catalog

A pointer-only catalog of the **35 marketing skills** installed in `.claude/skills/`. This is a **lightweight index**, not a deep ingest — each entry links to the actual `SKILL.md` file (the source of truth) and captures the trigger surface so `/faber-query` can route marketing questions to the right skill.

## Why this page exists

These skills are already *[[encoded-judgment]]* — productized expertise from marketing practitioners, encoded for agent invocation. Re-ingesting their full content into wiki concepts would duplicate what SKILL.md already states cleanly. Instead, Faber remembers **what exists, where it lives, when to invoke it**. Deep extraction happens lazily — only when a skill gets applied to a real project and produces learnings worth filing as a concept.

This is the [[skill-era]] pattern applied internally: treat local skills as callable expertise, not as material to paraphrase.

## How to use this catalog

- **Stuck on a marketing problem?** Scan clusters below, find the closest skill, invoke it via `/<skill-name>` in Claude Code.
- **Querying Faber?** `/faber-query "why is my pricing page not converting"` will surface this page → points you to `page-cro`, `copywriting`, `pricing-strategy`.
- **Deep ingest?** Only when a skill is applied on a project and generates non-obvious learnings worth a [[concepts/encoded-judgment|concept page]].

All paths below are relative to vault root: `.claude/skills/{name}/SKILL.md`.

---

## Cluster 1 — Conversion Rate Optimization (CRO) ✅ *deep-ingested 2026-04-14*

Optimizing specific surfaces where users act (or fail to act).

**Status:** Deep ingest complete. See [[cro-skills-suite]] for consolidated source + [[cro-framework-alteramens]] for applied synthesis. Six cross-cutting concepts extracted: [[value-before-ask]], [[friction-cost]], [[progressive-commitment]], [[aha-moment]], [[escape-hatch-principle]], [[context-aware-interrupt]].

| Skill | Trigger | When to invoke |
|---|---|---|
| **page-cro** | "this page isn't converting," "CRO," bounce rate, low conversion | Generic page optimization (homepage, landing, pricing, feature, blog) |
| **signup-flow-cro** | signup dropoff, registration friction, trial conversion | Signup/registration/account creation flows specifically |
| **onboarding-cro** | activation rate, aha moment, time-to-value, first-run experience | Post-signup — users sign up but don't stick |
| **form-cro** | lead form, contact form, demo request, form abandonment | Non-signup forms (lead capture, contact, application) |
| **popup-cro** | exit intent, modal, overlay, sticky bar, email popup | Any interrupt-style conversion element |
| **paywall-upgrade-cro** | upgrade screen, feature gate, free-to-paid, trial expiration | In-product upgrade moments (not public pricing pages) |

## Cluster 2 — SEO & Discoverability ✅ *deep-ingested 2026-04-14*

Getting found in search (traditional + AI).

**Status:** Deep ingest complete. See [[seo-skills-suite]] for consolidated source + [[seo-framework-alteramens]] for applied synthesis. Five new concepts extracted: [[extractable-content]], [[third-party-signal]], [[machine-readable-structure]], [[hub-and-spoke-architecture]], [[agent-readable-web]]. Two existing concepts upgraded: [[answer-engine-optimization]] (seed → developing), [[programmatic-seo]] (seed → developing).

| Skill | Trigger | When to invoke |
|---|---|---|
| **seo-audit** | "my SEO is bad," rankings dropped, technical SEO, Core Web Vitals | Start here for any vague SEO complaint |
| **ai-seo** | AEO, GEO, LLMO, optimize for ChatGPT/Perplexity, AI citations | Optimizing for AI search engines and LLM answers |
| **schema-markup** | JSON-LD, rich snippets, structured data, FAQ schema | Adding/fixing schema.org markup |
| **programmatic-seo** | pSEO, template pages, pages at scale, directory/location pages | Generating many similar pages targeting long-tail keywords |
| **site-architecture** | sitemap, page hierarchy, URL structure, internal linking, IA | Planning what pages a site should have and how they connect |

## Cluster 3 — Content & Copy

Writing the actual words that persuade.

| Skill | Trigger | When to invoke |
|---|---|---|
| **copywriting** | write copy, headline, CTA, value proposition, hero section | Writing/rewriting marketing page copy from scratch |
| **copy-editing** | edit this, polish, tighten, proofread, content refresh | Improving or refreshing existing copy (not rewriting) |
| **content-strategy** | what should I write about, topic clusters, editorial calendar | Deciding what content to produce (not writing it) |
| **lead-magnets** | gated content, ebook, checklist, content upgrade, opt-in | Planning downloadable lead capture assets |

## Cluster 4 — Paid Acquisition

Spending money to acquire customers.

| Skill | Trigger | When to invoke |
|---|---|---|
| **paid-ads** | PPC, ROAS, CPA, Google/Meta/LinkedIn ads, audience targeting | Campaign strategy, targeting, bidding, budget |
| **ad-creative** | ad variations, RSA headlines, bulk ad copy, creative testing | Generating/iterating ad copy at scale |
| **ab-test-setup** | A/B test, split test, hypothesis, statistical significance, ICE | Designing and running growth experiments |

## Cluster 5 — Lifecycle & Retention ✅ *deep-ingested 2026-04-14*

Turning signups into engaged customers, preventing churn.

**Status:** Deep ingest complete. See [[lifecycle-retention-skills-suite]] for consolidated source + [[lifecycle-retention-framework-alteramens]] for applied synthesis. Six cross-cutting concepts extracted: [[dynamic-save-offer]], [[voluntary-vs-involuntary-churn]], [[dunning-stack]], [[churn-health-score]], [[referral-loop]], [[peer-voice-outreach]]. Reuses existing concepts: [[value-before-ask]] (email sequences), [[aha-moment]] (referral trigger moments), [[friction-cost]] (cold email CTAs, dunning UX).

| Skill | Trigger | When to invoke |
|---|---|---|
| **email-sequence** | drip campaign, welcome series, nurture, lifecycle emails | Multi-email automated flows (any lifecycle stage) |
| **cold-email** | cold outreach, prospecting, SDR, outbound | B2B cold emails + follow-up sequences (not lifecycle) |
| **churn-prevention** | cancel flow, save offer, dunning, win-back, retention | Reducing churn, cancellation flows, failed payment recovery |
| **referral-program** | refer a friend, affiliate, viral loop, ambassador | Getting existing users/partners to bring new customers |

## Cluster 6 — Strategy & Foundations ✅ *deep-ingested 2026-04-15*

Upstream decisions that shape everything else.

**Status:** Deep ingest complete. See [[strategy-foundations-skills-suite]] for consolidated source + [[strategy-foundations-framework-alteramens]] for applied synthesis. Seven cross-cutting concepts extracted: [[product-marketing-context]], [[jobs-to-be-done]], [[orb-channel-framework]], [[phased-launch]], [[value-based-pricing]], [[good-better-best-pricing]]. Existing concept upgraded: [[voice-of-customer]] (developing → mature, cross-linked from 2 suites).

| Skill | Trigger | When to invoke |
|---|---|---|
| **product-marketing-context** | positioning, ICP, target audience, set up context | **Run first** on any new project — creates `.agents/product-marketing-context.md` that all other skills reference |
| **marketing-psychology** | cognitive bias, persuasion, anchoring, social proof, framing | Applying mental models and behavioral science to marketing |
| **customer-research** | ICP research, VOC, review mining, JTBD, customer interviews | Gathering or analyzing research about customers |
| **pricing-strategy** | pricing tiers, freemium, packaging, Van Westendorp, WTP | Deciding what to charge or how to structure plans |
| **launch-strategy** | Product Hunt, GTM, beta launch, waitlist, announcement | Planning a product or feature launch |
| **marketing-ideas** | how to market, growth ideas, brainstorm, stuck | Starting point when uncertain — routes to more specific skills |

## Cluster 7 — Distribution Channels

Where customers discover you (beyond search and ads).

| Skill | Trigger | When to invoke |
|---|---|---|
| **social-content** | LinkedIn post, Twitter thread, content calendar, repurposing | Social media content creation, scheduling, optimization |
| **community-marketing** | Discord/Slack community, forum, ambassadors, community-led growth | Building and leveraging online communities |

## Cluster 8 — Sales & Revenue Operations ✅ *deep-ingested 2026-04-15*

Connecting marketing to closed revenue.

**Status:** Deep ingest complete. See [[sales-revenue-ops-skills-suite]] for consolidated source + [[sales-revenue-ops-framework-alteramens]] for applied synthesis. Seven cross-cutting concepts extracted: [[speed-to-lead]], [[lead-lifecycle-funnel]], [[fit-plus-engagement-scoring]], [[engineering-as-marketing]], [[honest-competitive-positioning]], [[tracking-plan-as-contract]], [[revenue-attribution-loop]].

| Skill | Trigger | When to invoke |
|---|---|---|
| **sales-enablement** | pitch deck, one-pager, objection handling, demo script, battle card | Sales collateral and deal-closing assets |
| **revops** | lead scoring, MQL/SQL, lead routing, pipeline stages, CRM | Systems connecting marketing to sales (lead lifecycle, handoff) |
| **analytics-tracking** | GA4, GTM, event tracking, UTMs, attribution | Measurement — knowing if something is working |
| **competitor-alternatives** | vs page, alternative page, comparison, battle card | Pages positioning your product against competitors |
| **free-tool-strategy** | engineering as marketing, calculator, generator, ROI tool | Free interactive tools for lead gen / SEO / brand |

---

## Invocation patterns

**Starting a new marketing-driven project:**
1. `/product-marketing-context` — foundation (ICP, positioning)
2. `/site-architecture` — plan the pages
3. `/copywriting` per page
4. `/seo-audit` + `/schema-markup` for discoverability
5. `/analytics-tracking` before launch
6. `/launch-strategy` when shipping

**Diagnosing weak performance:**
- Traffic low → `seo-audit`, `ai-seo`, `content-strategy`
- Traffic high, conversions low → `page-cro`, `copywriting`, `customer-research`
- Signups high, activation low → `onboarding-cro`, `email-sequence`
- Paid channel broken → `paid-ads`, `ad-creative`, `ab-test-setup`
- Users leaving → `churn-prevention`, `customer-research`

## Relationship to wiki philosophy

This catalog respects two Faber principles:

1. **Source of truth lives in the canonical place.** SKILL.md files ARE the encoded judgment — Faber indexes them, doesn't paraphrase them. (See [[faber-sqlite-index|Faber SQLite Index]] for the same pattern applied to wiki content.)
2. **Deep work only when justified.** Paying the cost of full concept extraction makes sense when a skill is applied, produces learnings, and those learnings connect to existing wiki concepts ([[leverage]], [[distribution-over-product]], [[encoded-judgment]]). Otherwise, the pointer is enough.

When any skill is invoked on a real project and produces a non-obvious pattern — *that* is when the relevant concept(s) get created or extended in [[wiki/concepts/]].

## Open questions for future sessions

- Which skills get used most on real projects? (Track via `/faber-link` when applied.)
- Where are the gaps? What marketing expertise is missing from this set?
- Does the cluster taxonomy above match how problems actually present, or does it need revision after 3 months of use?
