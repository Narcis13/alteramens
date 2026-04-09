---
title: "Knowledge-First Development — Build Understanding Before Building Code"
type: concept
category: methodology
sources: []
entities: [alteramens]
related: [executable-wiki, world-model, internal-to-product, validate-before-build, emergent-schema, skill-era, encoded-judgment, compounding-games]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Knowledge-First Development — Build Understanding Before Building Code

A development methodology where the primary artifact is a compounding knowledge base, and code emerges as a derivative once understanding is sufficient.

## The Three Methodologies

| | Primary artifact | Code appears | Knowledge fate |
|---|---|---|---|
| **Code-first** | Source code | Day 1 | Docs written after (and decay) |
| **Agile** | User stories | Sprint 1 | Specs become stale after implementation |
| **Knowledge-first** | Wiki / knowledge graph | After validation | Knowledge IS the specification (lives) |

## The Process

```
1. Seed knowledge base     (ingest sources, extract entities/concepts)
2. Accumulate judgment      (discuss, cross-reference, synthesize)
3. Discover schema          (patterns emerge → emergent-schema crystallizes)
4. Sculpt with skills       (prototype pieces using agent skills)
5. Extract to code          (promote validated pieces to application code)
6. Continue the loop        (code feeds back into knowledge base)
```

Code doesn't appear until step 5. Steps 1-4 can take weeks — and that's the point. The knowledge accumulated in those weeks IS the competitive advantage.

## Why This Works for Solopreneurs

- **No wasted code**: you don't build features that fail validation
- **Compound context**: every session makes the next session smarter ([[compounding-games]])
- **AI leverage maximized**: Claude Code with deep wiki context > Claude Code with no context
- **Validation built-in**: the knowledge base forces you to articulate what you know and don't know
- **Sanity preserved**: exploring in a wiki feels like thinking, not like gambling on code

## The Vault + Wiki + Code Structure

A concrete implementation of knowledge-first development:

```
vault/              ← Working memory (drafts, ideas, experiments)
  inbox/            ← Raw material awaiting ingestion
  workshop/         ← Exploration, brainstorms, prototypes
  projects/         ← Applied work (decisions, learnings)
wiki/               ← Compiled knowledge (structured, queryable)
  sources/          ← Ingested material
  entities/         ← Recurring nouns
  concepts/         ← Patterns and frameworks
  syntheses/        ← Cross-cutting analyses
code/               ← Application code (derivative of wiki knowledge)
```

The wiki is the bridge between raw exploration (vault) and production code. Knowledge flows: `vault → wiki → code`. Each layer has different fidelity and permanence.

## Connection to [[validate-before-build]]

Knowledge-first IS validate-before-build, implemented as a methodology. You can't accumulate knowledge about a domain without discovering whether the problem is real and whether people will pay.

## Connection to [[encoded-judgment]]

The knowledge base doesn't just store facts — it stores judgment. Decisions, tradeoffs, "why we chose X over Y." When code is derived from this, the judgment is baked in. This is [[encoded-judgment]] at the development process level, not just the product level.

## Risk

The methodology fails if knowledge accumulation becomes an end in itself. The promotion gate matters: knowledge must eventually become customer-facing value. See [[validate-before-build]] — the market is the ultimate test.
