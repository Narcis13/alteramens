---
title: "Thin Harness, Fat Skills — Markdown Procedures Over Framework Code"
type: concept
category: technical-playbook
sources: [skillify-agents-same-mistakes]
entities: [garry-tan, openclaw, gbrain, hermes-agent]
related: [skillify, latent-vs-deterministic, encoded-judgment, skill-era, executable-wiki, agent-fleet-architecture]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Thin Harness, Fat Skills — Markdown Procedures Over Framework Code

An agent-architecture pattern named by [[garry-tan]]. Introduced in passing in [[skillify-agents-same-mistakes]], referenced as "the framework I've been writing about ([thin harness, fat skills](https://x.com/garrytan/status/2042925773300908103))." The Skillify essay operates entirely inside this pattern.

## The Shape

- **Thin harness** — minimal runtime that loads skills, routes intents via a resolver (AGENTS.md), executes scripts, manages context.
- **Fat skills** — markdown procedures (SKILL.md files) that teach the model *how* to approach a task. Not *what* to do — the user supplies the what. The skill supplies the process.

> "Think of it like a method call: same procedure, radically different outputs depending on what you pass in."

## Skill as Markdown

A skill is a markdown file living in latent space. It's read into context when the resolver decides its trigger matches. Example structure (from Garry's `calendar-recall`):

```
name: calendar-recall
description: "Brain-first historical calendar lookup. ALWAYS use this before any live API for any event not in the future or the last 48 hours."

# Hard rule
Live calendar APIs are ONLY for events in the FUTURE or the LAST 48 HOURS.
Everything historical goes through the local knowledge base first.
```

The skill doesn't implement the lookup. It *constrains* the agent to use the right path. The implementation is in the deterministic script the skill forces the agent to call.

## The Critical Loop

This is what makes the architecture compound:

> "The latent space builds the deterministic tool, then the deterministic tool constrains the latent space."

1. Agent (latent) encounters a failure
2. Agent uses judgment (latent) to write a deterministic script that would have prevented it
3. Skill (markdown in latent space) forces all future agents to run that script
4. The old failure path becomes structurally unreachable

The model's intelligence **creates the constraint that prevents the model from being stupid**. Latent builds deterministic; deterministic constrains latent.

## Why This Beats "Big Framework + Bigger Prompts"

[[langchain]]-style frameworks push capability into framework code. Thin-harness-fat-skills pushes capability into markdown + scripts. Three consequences:

1. **Diffable, reviewable, versionable** — skills are markdown. Git handles them perfectly.
2. **Agent-authorable** — agents can write new skills from failures ([[hermes-agent]] exploits this).
3. **Progressive disclosure** — load a skill *index* first, pull the full SKILL.md only when the resolver selects it. Context stays tight even with hundreds of skills.

## The Resolver as Architectural Keystone

With hundreds of skills, routing becomes the bottleneck. A **resolver** (`AGENTS.md` in Garry's stack) is a routing table from intent → skill. This is what makes thin-harness-fat-skills scalable — without it, all skills load every turn and context overflows.

Resolver failure modes ([[skillify]] catches all three):
- Dark skills (no resolver entry) → capability exists, LLM can't reach it
- Overlapping triggers → ambiguous routing, wrong skill fires
- Drifted descriptions → trigger was right when written, rot produced false negatives

## Reference Implementations

- [[openclaw]] — Garry's personal harness
- [[gbrain]] — the knowledge + verification layer beneath it
- [[hermes-agent]] — different harness, same shape, adds agent-written skill creation

## Application to Alteramens

Narcis's Claude Code setup matches this pattern already:
- **Harness** = Claude Code runtime
- **Fat skills** = `.claude/skills/*/SKILL.md` (semnal-draft, faber-ingest, to-content, etc.)
- **Resolver** = the skill descriptions Claude Code uses to route invocations

What's missing (the [[skillify]] discipline):
- No resolver eval — no check that `/faber-ingest` vs `/faber-seed` triggers don't overlap
- No DRY audit across skills
- No check-resolvable pass to find dark skills

These are mechanical improvements that preserve the existing architecture. The architecture is already correct; the verification layer is the gap.

## Connections

- [[skillify]] — the discipline that keeps fat skills durable
- [[latent-vs-deterministic]] — the mental model inside every skill
- [[encoded-judgment]] — skills are the encoding format
- [[skill-era]] — fat skills are the skill-era artifact
- [[executable-wiki]] — same general shape (LLM-maintained structured knowledge that agents consume)
- [[agent-fleet-architecture]] — the org-scale analog: specialist agents with their own skills
