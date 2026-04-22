---
title: "LangSmith"
type: entity
category: tool
aliases: ["langsmith"]
first_seen: skillify-agents-same-mistakes
sources: [skillify-agents-same-mistakes]
related_entities: [langchain]
related_concepts: [skillify, encoded-judgment]
vault_refs: []
status: active
---

# LangSmith

[[langchain]]'s testing platform for LLM applications. Per [[skillify-agents-same-mistakes|Garry Tan]]: trajectory evals, trace-to-dataset pipelines, LLM-as-judge, regression suites, unit test frameworks for tools. Technically sophisticated — "they have the pieces. Credit where it's due."

## Significance

Used in the Skillify essay as the test case for the "primitives vs practice" critique. The argument is not that LangSmith's capabilities are weak — they're strong — but that capabilities without an opinionated workflow decay into vibes-based testing. The [[skillify]] 10-step checklist is offered as the missing loop that LangSmith's primitives could plug into but don't ship with.

## Contrast With GBrain

[[gbrain]] is narrower in scope but opinionated: it implements the Skillify checklist as default behavior. LangSmith is broader but neutral. This is the classic primitive-vs-opinion tradeoff — primitives compose, opinions compound.
