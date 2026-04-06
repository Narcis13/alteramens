---
title: "Seven Critics Loop — Hostile Persona QA"
type: concept
category: pattern
sources: [severino-claude-sales-system]
entities: [simon-severino]
related: [deliver-dont-promise, ai-collaborator-army, encoded-judgment]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Seven Critics Loop — Hostile Persona QA

A quality control pattern: before sending any copy (email, landing page, pitch), run it through 7 simulated hostile reader personas. Each persona catches different failure modes.

## The Seven Personas

1. **The Burned Skeptic** — "I've been scammed by gurus before. This sounds too good."
2. **The Time-Crunched** — "I have 3 seconds. Say it faster or I'm gone."
3. **The AI-Allergic** — "This reads like AI slop. I don't trust automated anything."
4. **The Lurker** — "I watch everything but never buy. What would make me actually act?"
5. **The Visual Learner** — "I need to see it, not read it. Where are the visuals?"
6. **The Lead-Seller Detector** — "Oh great, another person trying to sell me leads/consulting."
7. **The Detail Critic** — "Where's the proof? Show me numbers, specifics, case studies."

## Why It Works

Each persona catches failures invisible to the writer:
- Skeptic catches unsubstantiated claims
- Time-crunched catches verbosity
- AI-allergic catches generic/templated language
- Lurker reveals missing CTAs or urgency
- Visual learner flags walls of text
- Lead-seller detector catches salesy framing
- Detail critic catches vagueness

**21 failure modes** caught across 7 personas before anything goes out.

## Implementation

Can be a single Claude prompt or a Claude Code skill:

```
Run this copy through 7 hostile reader personas. For each persona:
1. What is their immediate reaction?
2. What specific line/phrase triggers that reaction?
3. Suggested improvement.
```

[[simon-severino]] runs this as an automatic quality control loop — every outgoing piece of copy passes through it.

## Connection to Encoded Judgment

This is [[encoded-judgment]] applied to copy quality. The 7 personas encode marketing intuition that normally lives in an experienced marketer's head. Once built as a skill, it runs consistently at scale — every email gets the same rigorous review.

## Applicability

Any outbound communication:
- Cold emails
- Landing page copy
- Product announcements
- Ad copy
- Newsletter content
- PR pitches
