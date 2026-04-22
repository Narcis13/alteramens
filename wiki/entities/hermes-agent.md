---
title: "Hermes Agent"
type: entity
category: tool
aliases: ["hermes-agent", "hermes"]
first_seen: skillify-agents-same-mistakes
sources: [skillify-agents-same-mistakes]
related_entities: [gbrain, openclaw]
related_concepts: [skillify, thin-harness-fat-skills, encoded-judgment]
vault_refs: []
status: active
---

# Hermes Agent

Open-source agent framework from Nous Research (github.com/NousResearch/hermes-agent).

## What It Does Well (per [[garry-tan]])

- **`skill_manage` tool** — lets the agent itself create, patch, and delete skills based on what it learns. When it finishes a complex task or recovers from an error, it proposes a skill and writes it to disk. This is **procedural memory the agent earns on its own**.
- **Progressive disclosure** — load a skill index first, pull the full SKILL.md only when selected. Keeps context tight.
- **Bounded memory** — MEMORY.md capped at 2,200 characters. Prevents unbounded growth.
- **Conditional activation** — skills auto-hide when required tools aren't available.

## What It Doesn't Do

Doesn't test its skills. No unit tests on deterministic code. No resolver evals to verify routing. No `check-resolvable` to find dark skills. No DRY audit. No daily health check that goes red when something drifts.

## Why This Matters

Autonomous skill creation without verification produces three failure modes:
1. **Name collisions** — agent creates `deploy-k8s` Monday, then `kubernetes-deploy` Thursday; both exist, ambiguous routing
2. **Silent rot** — skill works when written; upstream API changes shape six weeks later; skill returns garbage until a human notices
3. **Orphans** — autonomously-created skill gets a weak trigger that never matches; eats index tokens, never runs, slowly rots

## The Complement

[[gbrain]] supplies the verification layer Hermes is missing. Creation (Hermes) + verification (GBrain) = the full picture. This is also Narcis's potential bridge: if Alteramens moves toward agent-written skills, the [[skillify]] discipline becomes mandatory — otherwise skills accumulate without quality gates.
