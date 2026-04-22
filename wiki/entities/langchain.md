---
title: "LangChain"
type: entity
category: company
aliases: ["langchain"]
first_seen: skillify-agents-same-mistakes
sources: [skillify-agents-same-mistakes]
related_entities: [langsmith]
related_concepts: [skillify, encoded-judgment]
vault_refs: []
status: active
---

# LangChain

Agent/LLM framework company. Per [[skillify-agents-same-mistakes|Garry Tan's account]]: raised **$160M**, three years of development, billion-dollar valuation. Author of [[langsmith]], a genuinely sophisticated testing platform (trajectory evals, trace-to-dataset pipelines, LLM-as-judge, regression suites, unit test frameworks for tools).

## Why It Appears in the Wiki

Used by [[garry-tan]] as the canonical example of **"pieces but not a practice"** — a framework that shipped the testing primitives but never the opinionated workflow telling users what to test, in what order, or when done. This lands on Narcis's *judgment-over-functionality* stance: primitives without opinions = no moat in the skill era.

## Open Question

Whether LangChain's strategy is to stay primitive-layer and let opinionated workflows emerge elsewhere ([[gbrain]], Skillify), or whether they eventually ship their own loop. The former is a defensible positioning if distribution holds; the latter is the [[encoded-judgment]] bet.
