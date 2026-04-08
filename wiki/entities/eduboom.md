---
title: "Eduboom"
type: entity
category: company
aliases: ["Eduboom.ro", "EduBoom"]
first_seen: brainstorm-ai-tutor-medicina
sources: [brainstorm-ai-tutor-medicina]
related_entities: [carol-davila-umf]
related_concepts: [bounded-problem-wedge, calibration-over-content, agentic-curriculum, longitudinal-user-model, bootcamp-pricing]
vault_refs: ["projects/ai-tutor-admitere/decisions.md"]
status: active
---

# Eduboom

Romanian e-learning platform focused on high-school content delivery, including preparation for **Bacalaureat** and university admission exams. One of the most recognizable Romanian-language ed-tech brands in the high-school prep market — and therefore a relevant competitor for the AI tutor for Carol Davila admission product.

## What They Do

Eduboom packages structured video lessons by Romanian high-school subject and class (clasa IX-XII), taught by Romanian teachers, mapped roughly to the national curriculum. Subjects include math, physics, chemistry, biology, romanian, history. They explicitly market admission-prep tracks alongside Bac prep.

Distribution and monetization model (as observed in market):
- **Video-on-demand** lessons organized as courses or "abonament" subscriptions
- **Subscription pricing** — monthly or yearly, far below the cost of meditații
- **Free + paid tiers** — some content gated to drive conversion
- Web-first delivery, mobile-friendly

## Why They Are Relevant to the Wedge

Eduboom is a **content competitor**, not a calibration competitor. They sell access to high-quality video lessons. They do **not** (as of writing) ship:
- A [[longitudinal-user-model]] of the individual student
- [[calibration-over-content|Calibration mechanisms]] (Brier scoring, forced explanation, fake-understanding detection)
- An [[agentic-curriculum]] that owns the daily schedule against an exam date
- A parent dashboard with predicted percentile vs. admission threshold
- Personal stake authenticity ([[building-in-public]] with a named user-zero)

This is the gap the AI tutor product is structured to exploit. Eduboom answers "where do I get good lessons?" The AI tutor answers "am I actually ready, and what should I do today?"

## Competitive Position

| Dimension | Eduboom | AI Tutor for Carol Davila |
|---|---|---|
| Content scope | All RO high-school subjects | Carol Davila biology only (then chemistry) |
| Pricing model | Subscription (low monthly) | Bootcamp package (600-900 EUR / 10 months), see [[bootcamp-pricing]] |
| Teaching mode | Pre-recorded video | Agentic, adaptive, daily standup |
| Personalization | None / minimal | Longitudinal psychometric model |
| Buyer mental model | "Cheaper meditații" / "Khan Academy RO" | "Pachet admitere" (replaces meditații directly) |
| Trust signal | Brand + teacher CVs | Founder + named user-zero ([[mihai-brindusescu]]) |
| Moat | Content library + brand | Encoded judgment + per-student data + authenticity |

The two products are **not in the same category for the parent buyer** if positioning is done correctly. Eduboom is "supplemental learning content." The AI tutor is "the thing that replaces meditații for Carol Davila admission." A parent comparing 700 EUR/package against a 30 EUR/month subscription is not comparing like-for-like — and that's the entire point of the [[bounded-problem-wedge]].

## What to Watch

- If Eduboom adds an admission-prep AI agent or personalized track for Carol Davila specifically, the calibration moat must be visibly stronger by then
- If Eduboom partners with a UMF center or a known admission tutor, that's a trust-signal escalation
- Their content library is licensable in principle — could be acquisition target or partner, not just competitor

## Open Verification

The following claims about Eduboom should be verified before they appear in marketing comparisons:
- Exact subscription pricing tiers (current as of 2026)
- Whether they offer a Carol Davila-specific track or just generic biology
- Whether they have any AI/personalization features in 2026
- User counts, churn, and admission outcome statistics (almost certainly not public)

Treat the table above as **directional**, not as a sourced competitive analysis. A real teardown is a separate task before any public head-to-head comparison.

## See Also

- [[centrul-excelenta-carol-davila]] — institutional competitor (different category)
- [[carol-davila-umf]] — the admission target both products serve
- [[bounded-problem-wedge]] — why content-library competitors do not block a calibration product
- [[brainstorm-ai-tutor-medicina]] — origin source for the AI tutor product strategy
- [[projects/ai-tutor-admitere/decisions|projects/ai-tutor-admitere/decisions.md]] — decision log
