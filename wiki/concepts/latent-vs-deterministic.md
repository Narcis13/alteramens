---
title: "Latent vs Deterministic — Put Each Task in the Right Machine"
type: concept
category: mental-model
sources: [skillify-agents-same-mistakes]
entities: [garry-tan]
related: [skillify, thin-harness-fat-skills, encoded-judgment, skill-era, judgment]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Latent vs Deterministic — Put Each Task in the Right Machine

A mental model named by [[garry-tan]] in [[skillify-agents-same-mistakes]] that explains why most agent reliability bugs aren't "wrong answers" — they're **wrong-side** errors.

## The Distinction

Every task the agent handles is either:

| Latent work | Deterministic work |
|---|---|
| Requires judgment | Requires precision |
| Same input, different outputs depending on context | Same input, same output, every time |
| LLM handles it | Code handles it |
| "Summarize this in the user's voice" | "Grep local calendar files for 'Singapore'" |
| "Decide which skill to route to" | "Convert UTC to Pacific Time" |

## The Core Bug

> "That's the bug. Not a wrong answer. A wrong side."

Failures happen when the agent does **deterministic work in latent space** — doing in the model's head what a three-line script could do instantly. Garry's two failure stories illustrate this exactly:

- **Calendar lookup** (deterministic): agent called live APIs, searched email, retried APIs with different params — five minutes of latent reasoning. The answer was one grep away. Sub-millisecond. Zero LLM calls.
- **Timezone math** (deterministic): agent did UTC→PT subtraction in its head, off by exactly an hour. A 50ms script had the correct answer.

In both cases the agent had the right tool and **chose cleverness instead of discipline**. The wrong thing happened in the wrong machine space.

## The Critical Loop

This is how [[thin-harness-fat-skills]] uses the distinction to self-correct:

> "The latent space builds the deterministic tool, then the deterministic tool constrains the latent space."

The agent uses *judgment* (latent) to recognize a task as deterministic and write a script for it. The skill file then *forces the agent* to run the script instead of reasoning about the same problem again. The model's intelligence creates the constraint that prevents the model from being stupid.

## Heuristic for Classifying a Task

Ask: **"Same input, same output, every time?"**
- Yes → deterministic → code
- No → latent → model

Further test: "Can a three-line script give me the answer?" If yes and you still used an LLM call, you lit money on fire and added a failure path.

## Why This Matters in the Skill Era

[[encoded-judgment]] says skills encode a way of thinking. Latent vs deterministic says: **even inside a skill, keep judgment-work in the LLM and precision-work in code.** Skills without this discipline use LLMs for everything — slow, expensive, unreliable, and fragile against model drift.

> "In a normal AI setup, the AI will apologize, promise to do better, and two weeks later the same thing happens with a different query or a different timezone. The agent has no memory of the bug, no test for the bug, nothing stops it from recurring."

The latent/deterministic split is the structural fix. [[skillify]] is the discipline that enforces it.

## Common Misclassifications (Things Usually Done in Latent Space That Should Be Deterministic)

- Date/time math (any of it — DST, timezone, duration)
- File system queries (grep, find, glob)
- Structured parsing (JSON, CSV, YAML extraction)
- String transformations with known rules (slugify, case conversion, URL normalization)
- Counting, summing, aggregating numeric data
- URL/endpoint validation (curl to check a tunnel works)
- Regex-expressible pattern matching

Anything that textbook programming handles perfectly, is where agents reliably fail.

## Genuinely Latent Work

- Choosing which skill to invoke
- Interpreting user intent from ambiguous phrasing
- Writing prose in a specific voice
- Summarizing with taste
- Generating creative variants
- Deciding whether to challenge or accept an input
- Calling judgment between conflicting constraints

## Application to Alteramens

Narcis's skills are already structured around latent work (writing variants, summarizing, aligning to pillars). But several have deterministic sub-steps that currently live in-prompt:

- **semnal-draft** — pillar-alignment check could be deterministic (lookup against `wiki/self_pillars`); constraint-check (hook length, post length) is purely deterministic
- **faber-ingest** — duplicate detection via SQL is already deterministic (good); slug generation is deterministic in-prompt (candidate for extraction)
- **to-content** — format-specific length limits and hashtag counts are deterministic

Lifting deterministic sub-tasks into scripts would speed up skills, reduce LLM cost, and make them more reliable across model versions.

## Connections

- [[skillify]] — enforces this split via the 10-step checklist (step 2 is "deterministic code")
- [[thin-harness-fat-skills]] — the architecture where this distinction lives
- [[encoded-judgment]] — judgment is the *latent* side; this concept says don't contaminate it with work that's really deterministic
- [[skill-era]] — the reason this distinction matters now: cheap execution makes the misclassification expensive in aggregate
- [[judgment]] — the latent side made explicit as a concept of its own
