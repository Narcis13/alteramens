---
title: "Longitudinal User Model — Psychometric Moat"
type: concept
category: technical-playbook
sources: [brainstorm-ai-tutor-medicina]
entities: [carol-davila-umf, mihai-brindusescu]
related: [data-compounding-moat, world-model, encoded-judgment, calibration-over-content, agentic-curriculum]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Longitudinal User Model — Psychometric Moat

A product that accumulates a deep, multi-month behavioral and cognitive model of each individual user creates a moat the user cannot easily abandon, because abandoning means losing the model. This is [[data-compounding-moat]] applied at the **per-user** level instead of the per-company level.

## What "Longitudinal" Means Here

Not just "we store usage data." The longitudinal model captures things the user does not know about themselves:

- **Faked understanding signals:** correct answers with abnormal latency, plus weak or wrong free-text explanation when asked to elaborate
- **Time-of-day retention curves:** when this specific user actually retains material vs only feels productive
- **Personal forgetting curve per topic:** decay rates differ by domain and by individual
- **Click metaphors:** which analogy or example finally made a concept stick for this user
- **Failure pattern signatures:** which categories of confusion this user repeats (e.g., systematically confuses chromosomes with chromatids)
- **Confidence calibration:** the gap between subjective certainty and actual correctness, tracked over time

After 4-6 months, the model holds a richer picture of the user's cognition than the user has of themselves.

## Why It Is a Moat

A competitor can:
- Copy the LLM stack
- Copy the agent prompts
- Copy the curriculum content
- Copy the UI

A competitor cannot:
- Reproduce 4-6 months of one specific user's daily interaction history
- Skip the calibration period that produces useful predictions
- Transfer the model — it is built from this user's mistakes, not from a generic dataset

A user who switches loses everything the product knows about them and starts the calibration clock from zero. Switching cost is **structural**, not contractual. No fine print required.

## Why It Is Encoded Judgment, Not Just Data

A passive log of clicks is not a longitudinal user model. The model is the **interpretation** of the log: which signals matter, how to weight latency vs accuracy, when a confidence drop indicates fatigue vs gap, how to translate the model into curriculum decisions. This interpretation is [[encoded-judgment]] — the founder's pedagogical judgment, expressed as the rules that turn behavior data into adaptive instruction.

## Application: AI Tutor for Medical Admission

In the AI tutor for Carol Davila admission product (see [[brainstorm-ai-tutor-medicina]]), the longitudinal user model is the central moat. Each student's daily session feeds the model. By month 3 the agent is making decisions ("today we focus on genetics problems, not respiratory") that no chatbot can match. By month 6, the parent dashboard reports based on the model become the artifact parents pay for.

[[mihai-brindusescu]] is the first longitudinal record. His daily usage from late 2026 through July 2027 is both proof point and the seed dataset for tuning model interpretation rules.

## Connection to World Model

[[world-model]] is the company-level memory that compounds across customers and projects. Longitudinal user model is the same idea applied **per user** — each user has their own world model, owned and operated by the product on their behalf. Both compound; the per-user version creates per-user switching cost.

## Risk

The model is only as good as the founder's pedagogical interpretation rules. A naive implementation that just stores logs and asks an LLM to "personalize" achieves none of this — it is back to chatbot levels. The judgment must be deliberate, encoded, and refined through real use.
