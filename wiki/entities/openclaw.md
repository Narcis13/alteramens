---
title: "OpenClaw"
type: entity
category: platform
aliases: ["openclaw", "openclaw.ai"]
first_seen: skillify-agents-same-mistakes
sources: [skillify-agents-same-mistakes]
related_entities: [garry-tan, gbrain, gstack, hermes-agent]
related_concepts: [thin-harness-fat-skills, skillify, latent-vs-deterministic]
vault_refs: []
status: active
---

# OpenClaw

Personal agent harness built by [[garry-tan]] (openclaw.ai). The environment where Skillify and thin-harness/fat-skills were developed as a working practice, not theory. Also described as where "my GBrain" lives — suggesting OpenClaw is the harness layer, [[gbrain]] is the knowledge/skills layer beneath it.

## Architectural Role

In Garry's framing, a **thin harness** is the runtime that loads skills and routes intents. OpenClaw is his harness. The `AGENTS.md` resolver lives here. The skills it loads come from SkillPacks (including [[gbrain]]'s).

OpenClaw + GBrain is the full stack: OpenClaw handles execution/routing, GBrain handles durable knowledge + verification.

## Relevance to Narcis

Analogous to Narcis's setup: Claude Code + `.claude/skills/` is the harness+skills pair. The OpenClaw model suggests that Alteramens skills (`semnal-*`, `faber-*`, `to-content`) are candidates for the same 10-step Skillify treatment — the harness already exists; the durability discipline is what's missing.
