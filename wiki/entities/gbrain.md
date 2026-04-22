---
title: "GBrain"
type: entity
category: tool
aliases: ["gbrain", "github.com/garrytan/gbrain"]
first_seen: skillify-agents-same-mistakes
sources: [skillify-agents-same-mistakes]
related_entities: [garry-tan, openclaw, hermes-agent, gstack]
related_concepts: [skillify, thin-harness-fat-skills, encoded-judgment, executable-wiki]
vault_refs: []
status: active
---

# GBrain

Open-source knowledge engine authored by [[garry-tan]] (github.com/garrytan/gbrain). Sits underneath whatever agent harness you use ([[openclaw]], others). Manages the brain repo (knowledge base), runs evals, and enforces the quality gates that make skills durable.

## Core Mechanism: `gbrain doctor`

`gbrain doctor` is the reification of the [[skillify]] 10-step checklist. It's not a suggestion — it's what the binary actually checks:
- SKILL.md contract shape
- Deterministic scripts exist and are callable
- Unit + integration tests pass
- LLM evals green
- Resolver trigger registered in AGENTS.md
- Resolver eval confirms routing
- `check-resolvable` finds no dark skills
- DRY audit finds no overlapping triggers
- E2E smoke passes
- Brain filing rules consulted

`gbrain doctor --fix` auto-repairs DRY violations, replaces duplicated blocks with convention references — guarded by git working-tree checks so nothing gets clobbered.

## SkillPacks

A GBrain SkillPack is a portable bundle of skills + resolver triggers + deterministic scripts + tests. Installable into any agent setup ([[openclaw]] / [[hermes-agent]]) by asking the agent to add it. This is how skills written for one OpenClaw auto-install into another — packaged with the full 10-step Skillify output.

## Relation to Faber

Structurally close to Faber (this wiki). Both are append-only, LLM-maintained knowledge systems that compound over time. Differences:
- GBrain emphasizes **skill durability + resolver routing** (the testing/verification layer)
- Faber emphasizes **knowledge structure + cross-referencing** (the synthesis layer)
- They could coexist — Faber as the library, GBrain as the skill-verification discipline applied to `.claude/skills/`.

## Complement to Hermes

[[hermes-agent]] creates skills autonomously (procedural memory the agent earns). GBrain verifies them. **Creation + verification = both needed.**

Garry's framing: "This is the 'without tests, any codebase rots' problem that software engineering solved in 2005. Agent skills are no different. Hermes handles creation beautifully. GBrain handles verification. You need both."
