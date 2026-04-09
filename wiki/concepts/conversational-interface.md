---
title: "Conversational Interface — Questions Over Forms"
type: concept
category: technical-playbook
sources: [nbrain-concept, workscript-decisions]
entities: [nbrain, anaf]
related: [encoded-judgment, skill-era, ambient-computation, emergent-schema]
maturity: developing
confidence: medium
contradictions: []
applications: ["workshop/drafts/agentic-business-platform.md"]
---

# Conversational Interface — Questions Over Forms

The paradigm shift from rigid forms and preset reports to natural language interaction with data.

## The Insight

Users (especially non-technical ones like accountants and SME owners) don't want to learn complex software interfaces. They want to ask questions and get answers.

**Old:** Fill form → Generate report → Interpret results
**New:** Ask "How much do I owe ANAF?" → Get answer with context

## Why This Is a Differentiator for nbrAIn

Romanian accounting software is all forms and reports. Nobody offers conversational access to financial data. The AI paradigm shift makes this possible now (Anthropic Agent SDK, Claude API).

## Validated Pain Points

From wife interview:
- "How much do I owe the government?" (most common client question)
- "How much can I take as dividends?" (second most common)
- Accountant's pain: constant interruptions from clients asking these questions

A conversational interface answers these questions 24/7 without the accountant being involved.

## Technical Requirements

- Natural language understanding (LLM)
- Structured data access (accounting database)
- Context awareness (which firm, which period)
- Romanian language support
- Agent SDK for tool use (query DB, calculate, explain)

## Open Questions

- Is "nice to have" or "must have"? (needs more validation)
- What questions will users ACTUALLY ask? (beyond the two confirmed ones)
- How accurate does it need to be? (accounting requires precision)
