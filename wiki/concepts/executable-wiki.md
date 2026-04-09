---
title: "Executable Wiki — Code as Derivative of Knowledge"
type: concept
category: pattern
sources: []
entities: [alteramens]
related: [world-model, internal-to-product, knowledge-first-development, emergent-schema, skill-era]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Executable Wiki — Code as Derivative of Knowledge

The principle that a structured knowledge base (wiki) can serve as the living specification from which code is derived — inverting the traditional relationship between documentation and implementation.

## The Inversion

```
Traditional:  Code → Documentation    (docs decay, become stale)
Agile:        User Stories → Code     (specs become stale after sprint)
Executable:   Wiki → Skills → Code    (wiki IS the specification)
```

In an executable wiki, the knowledge base isn't describing the software — it IS the source of truth from which software is generated or derived.

## How It Works

1. **Entities in wiki** map to entities in code (data models, types)
2. **Relations in wiki** map to data model relationships
3. **Concepts in wiki** map to business logic and rules
4. **Decisions in wiki** map to architecture choices
5. **Skills** bridge the gap — they encode judgment about how to translate knowledge into action

The wiki evolves through ingestion and discussion. Code follows as a derivative artifact.

## Faber as Proto-Example

Faber already exhibits executable wiki properties:
- `faber_sync.py` generates a SQLite database FROM the markdown pages — the DB is a "compiled" artifact
- Skills like `/faber-query` execute against wiki knowledge — they're code driven by wiki content
- Page frontmatter is machine-parseable — it's simultaneously documentation and data schema
- `index.md` is auto-generated — wiki structure drives output artifacts

The next step: a skill that reads wiki pages and generates application code scaffolds.

## Connection to [[internal-to-product]]

The executable wiki accelerates the internal-to-product pattern. Your internal knowledge base doesn't just document your product — it generates it. When you productize, you're shipping the compiled output of your accumulated judgment.

## What It's NOT

- Not literate programming (code with embedded docs)
- Not code generation from specs (specs are static, wiki evolves)
- Not documentation-driven development (docs follow code)

It's knowledge-driven development: the wiki is alive, the code follows.
