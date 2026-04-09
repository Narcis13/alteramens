---
title: "Agent Fleet Architecture — Specialized Agents + Coordinator"
type: concept
category: technical-playbook
sources: [eric-siu-world-intelligence]
entities: [single-grain, eric-siu]
related: [ai-native-org-design, world-model, encoded-judgment, dri-with-agents, ambient-computation]
maturity: seed
confidence: medium
contradictions:
  - "Eric Siu notes the trend toward fewer, more capable agents as models improve — the fleet pattern may be transitional"
applications: []
---

# Agent Fleet Architecture — Specialized Agents + Coordinator

A pattern for deploying AI agents in a company: multiple specialized agents, each mapped to a business function, coordinated by a meta-agent that holds the full picture.

## The Pattern

```
World Agent (coordinator)
├── Alfred (CEO ops)
├── Arrow (sales)
├── Oracle (SEO)
├── Flash (content)
├── Cyborg (recruiting)
├── AutoResearch (continuous)
└── AutoGrowth (continuous)
```

Each agent queries the same [[world-model]]. The coordinator resolves conflicts and maintains coherence.

## Why Specialize

- Each agent accumulates domain-specific context and judgment
- Clear ownership: one agent per function = clear accountability
- Teams learn to work with "their" agent
- Easier to debug when something goes wrong

## Known Challenges

1. **Conflict resolution** — Sales agent promises what SEO agent says can't be delivered
2. **Security** — Agents find creative ways to access data they shouldn't (one almost emailed financial data to wrong contact)
3. **Scheduling collisions** — Multiple agents claiming the same time slots
4. **Stale coordination** — Content agent using deprioritized keywords because the update hasn't propagated

## Consolidation Trend

Eric Siu notes that as models improve, the trend is toward fewer, more capable agents. One agent with the right context can replace several specialists. The fleet architecture may be a transitional pattern that makes sense now but consolidates over time.

## Relevance

For small operations like Alteramens, the lesson isn't "build 7 agents." It's: map your business functions, decide which benefit most from persistent context, and start with 1-2 agents that compound. The coordinator pattern matters more than the fleet size.
