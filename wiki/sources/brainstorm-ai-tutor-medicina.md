---
title: "Brainstorm — AI Tutor pentru Admitere Carol Davila"
type: source
format: transcript
origin: conversation
source_ref: "conversation:2026-04-07"
ingested: 2026-04-07
guided: true
entities: [carol-davila-umf, mihai-brindusescu, alteramens]
concepts: [bounded-problem-wedge, longitudinal-user-model, calibration-over-content, agentic-curriculum, bootcamp-pricing, reverse-time-planning, building-in-public, authentic-creation, specific-knowledge, data-compounding-moat, compounding-games, productize-yourself]
key_claims:
  - "An AI tutor product wins by being narrowly bounded (Carol Davila biology 2027), not by being a generic personalized learning platform"
  - "The defensible moat is not the AI — it is the longitudinal psychometric model accumulated per student, which a competitor cannot fast-forward"
  - "At advanced levels, students do not lack information; they lack calibration — the ability to distinguish real from fake understanding"
  - "Parents are the buyers, students are the users — pricing, dashboards, and trust signals must address parents"
  - "Time-bounded bootcamp pricing (e.g. 600-900 EUR for a 10-month admission package) matches the meditation mental model better than perpetual SaaS"
  - "The product should be an agent that owns the curriculum schedule, not a chatbot that answers questions"
  - "Plan backwards from a fixed exam date, not forward from current state"
  - "A founder building publicly with their own child as user-zero creates an authenticity moat competitors cannot replicate"
  - "Carol Davila is the wedge; the compounding play extends to all UMF Romania, then Hungarian/Bulgarian medical schools, eventually USMLE/MIR"
  - "Romanian parents already pay 5,000-10,000 EUR for admission meditation — willingness to pay is pre-validated"
confidence: high
---

# Brainstorm — AI Tutor pentru Admitere Carol Davila

## Origin

Conversational brainstorming session between Narcis and Claude on 2026-04-07. Initial seed from Narcis: a personalized AI learning platform inspired by Faber wiki patterns, motivated by his son Mihai's upcoming application to UMF Carol Davila Bucharest. Initial framing was vague ("personalized AI learning, biology textbook the Faber way, SaaS or local Electron"). The conversation reframed it into a sharply bounded product.

This brainstorm is a **pivot** from the earlier exploration in [[concepts/ai-learning-platform|concepts/ai-learning-platform.md]] (Jan 2025), which considered generic AI learning across multiple segments. The pivot replaces "AI personalized learning" with "AI tutor for Romanian medical school admission" — bounded problem, identified buyer, validated willingness to pay.

## The Reframe

| Initial framing | Reframed product |
|---|---|
| "Personalized AI learning platform" | "AI tutor for Carol Davila admission" |
| Open-ended segment | ~10,000 candidates/year for ~600 spots |
| SaaS or Electron (delivery question) | Bootcamp pricing (business model question) |
| Generic textbook coverage | Manual de Biologie XI-XII + barem Carol Davila |
| Compete with information delivery | Compete with calibration and accountability |

The reframe is the most important output. Vagueness was the enemy; bounded scope is the wedge.

## Strategic Pillars (six insights)

### 1. Bounded problem wins
See [[bounded-problem-wedge]]. "AI tutor for Carol Davila biology 2027" has a specific manual, format (grilă, complement simplu/multiplu), barem, deadline, and existing buyer pool (parents already paying for meditation). Vague "personalized learning" has none of these. Bounded scope creates pricing power, marketing clarity, and feasible content scope.

### 2. Longitudinal model is the moat
See [[longitudinal-user-model]]. After 4-6 months of usage, the system holds a richer model of the student than the student has of themselves: which concepts they fake, which time of day they retain best, which analogies clicked, their personal forgetting curve per topic. This is **encoded judgment** ([[encoded-judgment]]) applied to learning. A student migrating to a competitor loses all calibration — switching cost is structural, not contractual. This is [[data-compounding-moat]] applied to a psychometric domain.

### 3. Calibration over content
See [[calibration-over-content]]. At admission level, students do not lack information — the manual is 30 lei, YouTube is free. They lack the ability to distinguish "I know this" from "I think I know this." The product must make students *worse* at self-deception. Mechanisms: confidence-weighted scoring (Brier penalties on overconfidence), forced explanation prompts, interleaved practice, exam-date-aligned spaced repetition. Generic chatbots do none of these.

### 4. Parent is buyer, student is user
Romanian parents pay 5,000-10,000 EUR for admission meditation. They are anxious, comparison-driven, and crave data. The product surface area must include a parent dashboard with weekly reports, predicted percentile vs admission threshold, identified gaps, and concrete action plans. Trust signals must be Romanian: former Carol Davila admits, validation by UMF medical students, not Y Combinator logos.

### 5. Bootcamp pricing, not SaaS
See [[bootcamp-pricing]]. "20 EUR/month forever" collides with the meditation mental model. The natural framing is **"Pachet Admitere Carol Davila 2027"** at 600-900 EUR for 10 months, paid in 2-3 installments. A success-fee variant ("400 EUR upfront + 400 EUR if admitted in top 600") creates trust signal, filters serious users, and generates testimonials with proof. Math: 10,000 candidates × 5% conversion × 700 EUR ≈ 350,000 EUR/year — but cliff business (one cohort/year), which changes cash flow planning.

### 6. Agentic curriculum, not chatbot
See [[agentic-curriculum]]. The product must be an **agent that owns the schedule**, not a Q&A interface. Concrete daily standup pattern: "Yesterday you missed 3 questions on alveolar gas exchange. Today: 15 min focused review on gas diffusion, then circulator. Friday I'm reserving 90 min for genetics-problems, your weakest topic. T-minus 287 days. You're tracking percentile 78. Let's accelerate." This pattern combines pedagogy, sequencing, motivation, and accountability into encoded judgment.

## Supporting tactics

### Reverse-time planning
See [[reverse-time-planning]]. Start from exam day (~July 2027). Map every concept in barem. Reverse-engineer prerequisite chain. Schedule mastery dates per concept. Run agent toward a fixed destination, not from current state. This makes the schedule defensible to parents and gives the agent a clear optimization target.

### Personal stake as moat
Narcis confirmed willingness to bet publicly that Mihai uses the tool as primary preparation method. This is [[authentic-creation]] + [[accountability]] at maximum: a father building publicly the instrument his own child uses for high-stakes admission. No competitor can replicate this. Build-in-public via Romanian newsletter, weekly progress posts, real metrics (with Mihai's permission).

### Compounding game
Wedge: Carol Davila biology 2027. Then chemistry. Then all UMF Romania (Cluj, Iași, Timișoara, Tg Mureș). Then admiteri stomatologie/farmacie (same base manual). Then pre-med Romanian students applying to Hungarian/Bulgarian English-language med schools. Eventually USMLE Step 1 / MIR Spain. Each extension reuses calibration engine, longitudinal model, agent, parent dashboard. Content is what doesn't reuse — and that's why Carol Davila content is the primary moat for the first 18 months.

### Content moat: validated answer key
Build the calibrated, explained question bank from public past Carol Davila exams. Multiple AI-generated explanations per question, validated by a UMF student reviewer. Tagged by concept, difficulty, common confusables. This bank is licensable B2B to coaching centers later (compound revenue).

## Decisions made in this session

Three explicit confirmations from Narcis:

1. **Public stake = "very much"** → build-in-public is mandatory, not optional. Mihai is named user-zero with permission.
2. **Medical validation = a UMF student** (paid). Format to be defined: review checklist + SLA on response time.
3. **Identity = founder of an ed-tech startup**, not "father building a tool for his son." This means: legal entity, separate brand from Alteramens (or sub-brand), product decisions optimize for product, Mihai is user-zero not raison d'être.

## Open questions deferred to next session

- Product name and brand
- Legal entity structure (SRL nou? sub-brand Alteramens?)
- LLM cost economics and credit-vs-package monetization split
- UMF student reviewer recruitment and contract
- Build-in-public channel choice (newsletter, LinkedIn RO, X RO, mix)
- MVP scope: smallest version that lets Mihai actually study by autumn 2026
- Whether Electron offline + sync vs pure web matters for parent trust
- Pricing experiment plan: who to charge first, when, at what price

## Risk flagged

Long validation cycle. Cannot sell to 2027 cohort until summer 2026. Proof that it works arrives July 2027. This collides with Narcis's stated 1K MRR / 6-month goal. Two honorable paths:
- **A:** Accept this is an 18-24 month horizon project, decouple from MRR goal, play compounding, Mihai is proof point.
- **B:** 30% of time on this, 70% on something that ships and sells now (Skills, devtools), use this as specific knowledge vehicle and 18-month plan B.

Decision deferred — but flagged as the most important question, more important than SaaS-vs-Electron.

## See also

- Vault: [[concepts/ai-learning-platform|concepts/ai-learning-platform.md]] — earlier generic exploration this brainstorm pivots from
- Concepts: all six new concepts referenced above
- Synthesis: [[ai-tutor-admitere-strategic-frame]] — strategic frame derived from this brainstorm
