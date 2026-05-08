---
title: "Open-Core Day-One Distribution"
type: concept
category: pattern
sources: [kanwas-competitive-teardown]
entities: [kanwas, alteramens]
related: [distribution-over-product, mcp-as-distribution, media-plus-agents-distribution, bounded-problem-wedge]
maturity: seed
confidence: medium
contradictions: []
applications:
  - "[[wiki/syntheses/kanwas-vs-faber-analysis|Kanwas vs Faber analysis]]"
  - "[[workshop/drafts/faber-framework-vision]]"
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-05-08 ingest | Kanwas Competitive Teardown"
  - pillar: building-as-51yo-from-ro-public-hospital
    relation: reinforces
    source_event: "2026-05-08 ingest | Kanwas Competitive Teardown"
---

# Open-Core Day-One Distribution

The distribution pattern where an AI-native product launches as **open-source code AND hosted SaaS AND customer-logo-bearing landing page — all on the same day**. No "build in public for 6 months before showing." No "polish then launch." The public artifact and the commercial offering ship together.

## The Pattern (as observed in Kanwas)

On **2026-04-22**, [[kanwas]] simultaneously:

- Pushed full repo public under Apache 2.0 (frontend/backend/CLI/yjs-server/execenv all present)
- Made hosted SaaS available at kanwas.ai with free signup
- Published landing with **6 customer logos** (Veed, Wix, Softpay, TheFork, Grammarly, Quanos)
- Published a closing-€4.6M-pre-seed testimonial

Result by 2026-05-08 (16 days later): **543 stars, 75 forks, 49 subscribers**. Open repo created the credibility that the hosted SaaS converted on. Customer logos pre-empted the "is this real?" filter. Testimonial converted the "does it actually work?" filter.

## Why It Works

Three filters get satisfied simultaneously instead of sequentially:

| Filter | Old answer | Day-one answer |
|---|---|---|
| "Is this real code?" | Wait for repo to mature | Open repo immediately, code already substantial |
| "Does anyone use it?" | Wait for customer interviews | Logos published with launch |
| "Does it work for serious cases?" | Wait for case studies | Testimonial published with launch |

The sequential approach optimizes for *risk reduction*. The day-one approach optimizes for *attention compression*. In a market where the operating thesis (context = moat) is being validated by multiple players in parallel, attention compression beats risk reduction.

## Why It's Hard for Solo Operators

The pattern requires three things that are expensive solo:

1. **Substantial code at open** — not a README, real implementation. For Kanwas this implies pre-public development of months, kept private until launch day.
2. **Customer logos at open** — pre-launch design partner program. Requires a sales motion that begins long before the public launch.
3. **Testimonial at open** — at least one customer must hit a milestone using the product before launch.

Solo operators (single founder, evenings-and-weekends cadence, no dedicated sales) typically lack #2 and #3. The mitigation: **do the public-repo step day-one even without #2 and #3**, accepting weaker conversion until the customer story develops. This converts the declared weakness `postpone-publishing` (see Narcis's stances) into structural pressure for the next 30-60 days.

## Tension with "Local-First" Philosophy

This pattern requires hosted SaaS to be a *peer* of the open-source local install, not a *secondary* to it. For products where the marketing claim is "local-first, your files are yours," the hosted version must be framed as **convenience-not-compromise** — same data model, same files, same exit path, just with managed sync + execenv.

Kanwas resolves this with markdown-as-truth + git-backed + CLI sync. The user can leave at any time with their files intact. Faber's framework-vision P7 (*"local-first, cloud-optional"*) needs the same resolution to ship hosted-as-first-class without violating the philosophy.

## Connection to Other Concepts

- [[distribution-over-product]] — the meta-pattern this is a specific instance of
- [[mcp-as-distribution]], [[media-plus-agents-distribution]] — alternative distribution patterns for AI-native tools
- [[bounded-problem-wedge]] — open-core day-one works best when the wedge is sharply bounded (Kanwas: "team context brain," not "general productivity")
