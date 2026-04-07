---
title: AI Tutor Admitere — Decision Log
project: ai-tutor-admitere
status: ideation
created: 2026-04-07
tags: [project, ed-tech, decisions]
---

# AI Tutor Admitere — Decision Log

Append-only log of major decisions for the AI tutor for Romanian medical school admission product. Born from the 2026-04-07 brainstorm session.

> **Wiki references:** strategic frame in [[wiki/syntheses/ai-tutor-admitere-strategic-frame|Strategic Frame]], origin source in [[wiki/sources/brainstorm-ai-tutor-medicina|Brainstorm Source]].

---

## 2026-04-07 — Project ideation session

Brainstorm with Claude reframed the project from "personalized AI learning platform" (vague) to "AI tutor for Carol Davila admission, biology, 2027 cohort" (bounded). See [[wiki/sources/brainstorm-ai-tutor-medicina|brainstorm source page]].

### Decision 1 — Wedge: Carol Davila biology 2027
**Decided:** the first market is UMF Carol Davila București, biology subject, 2027 cohort. Romanian language. Manual de Biologie XI-XII + barem Carol Davila as scope.

**Reasoning:** all the properties of a bounded problem (named buyer, real deadline, validated alternative, finite content, binary outcome) are present and identifiable. Vague alternatives ("AI personalized learning") fail every test.

**Reference:** [[wiki/concepts/bounded-problem-wedge|Bounded Problem Wedge]].

### Decision 2 — Identity: founder of an ed-tech startup
**Decided:** Narcis's role on this project is "founder of an ed-tech startup," not "father building a tool for his son." Product decisions optimize for product viability. Mihai is user zero, not raison d'être.

**Reasoning:** the frame determines every downstream decision. "Father building a tool" produces a hobby. "Founder building a product" produces a startup with brand, legal entity, pricing discipline, and a path to scale beyond the first user.

**Implication:** legal entity structure (SRL nou or sub-brand under existing structure) is a near-term decision. Brand is separate from Alteramens (or at least a clearly distinct sub-brand).

### Decision 3 — Mihai is user zero, with public stake at maximum
**Decided:** Mihai Brîndușescu is the named user-zero. Build-in-public stake is "very much" — Narcis is willing to bet publicly that Mihai uses the tool as primary preparation method for the actual 2027 admission.

**Reasoning:** [[wiki/concepts/authentic-creation|authenticity]] at maximum produces the strongest possible marketing moat. A father building publicly the instrument his own child uses for an irreversible exam outcome cannot be replicated by a competitor.

**Constraints:**
- Mihai's consent is explicit and revocable
- Public narrative cannot become surveillance
- Personal data shared in public is sanitized; parent dashboard data stays private
- The eventual exam result will be reported honestly regardless of outcome

**Reference:** [[wiki/concepts/building-in-public|Building in Public]].

### Decision 4 — Medical content validation: a UMF student
**Decided:** medical content quality (AI explanations of biology answers) will be validated by a UMF student reviewer. Likely paid arrangement (~500 lei/month order of magnitude, to be confirmed).

**Reasoning:** the founder is not a medical professional. Without subject-matter validation, the product risks shipping confidently wrong explanations — fatal for trust in an exam-prep product. A UMF student is cheap enough to recruit, qualified enough to catch errors, and brings credibility.

**Open:** specific recruitment, contract format (review checklist + SLA on response time), legal arrangement, scaling path as content volume grows.

---

## Open decisions

These were raised in the brainstorm but **not** decided. Listed here so they are not forgotten.

- **Product name and brand**
- **Legal entity:** new SRL? sub-brand of existing structure?
- **LLM cost model:** credit-based vs included in package, given heavy daily usage over 10 months
- **MVP scope:** smallest version that lets Mihai actually study by autumn 2026
- **Build-in-public channel mix:** newsletter (RO), LinkedIn RO, X RO, Facebook groups for parents, mix?
- **Pricing experiment plan:** test 700 EUR package with ≥5 real parents before building product
- **Local (Electron) vs web:** does offline access matter for parent trust? does it matter for Mihai's commute studying?
- **Time allocation:** full-time on this (18-24 month horizon, conflicts with 1K MRR / 6 month goal) vs 30% time alongside something that ships and sells now. **This is flagged as the most important open question.**

---

## Decision template (for future entries)

```
### YYYY-MM-DD — Decision N — short label
**Decided:** what was decided in one sentence.
**Reasoning:** why this and not the alternatives.
**Implication:** what this forces or unblocks.
**Reference:** [[wiki/...]] or [[other vault doc]] if applicable.
```
