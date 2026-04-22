---
title: "Garry Tan"
type: entity
category: person
aliases: ["@garrytan", "garrytan"]
first_seen: skillify-agents-same-mistakes
sources: [skillify-agents-same-mistakes]
related_entities: [langchain, openclaw, gbrain, hermes-agent, gstack]
related_concepts: [skillify, thin-harness-fat-skills, latent-vs-deterministic, encoded-judgment]
vault_refs: []
status: active
---

# Garry Tan

Author of the "How to really stop your agents from making the same mistakes" essay (2026-04-22). Publishes on X as [@garrytan](https://x.com/garrytan). Author and maintainer of [[gbrain]] (open-source knowledge engine for agents) and [[gstack]] (CLI speedups for Claude Code), and builder of [[openclaw]] (personal harness where he developed the Skillify pattern).

## What He Argues

Agent reliability is a software engineering problem, not a prompting problem. The fix is discipline: every bug becomes a skill, every skill has tests, every test runs daily. He formalizes this as [[skillify]] — a 10-step promotion checklist that turns ad-hoc fixes into permanent structural guarantees.

Parallel to this: the [[thin-harness-fat-skills]] architecture. Harnesses stay minimal; skills (markdown procedures) carry the opinionated process. Within skills, work is split by [[latent-vs-deterministic]] — judgment goes to the LLM, precision goes to code.

## Stance vs the LangChain School

Frames [[langchain]]'s $160M/3-year arc as "pieces but not a practice" — great testing primitives ([[langsmith]]) but no opinionated workflow. His critique is not of the tools themselves but of frameworks shipping capabilities without the loop that compounds them.

## Relation to Narcis's Thesis

Strong alignment. Operationalizes [[encoded-judgment]] for agent skills specifically, and reinforces the [[skill-era]] thesis by giving it a testing discipline. His "prototype → skillify → permanent" workflow is the same shape as Narcis's Alteramens workflow (vault → wiki → application).
