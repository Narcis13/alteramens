---
title: "Ambient Computation — Systems That Work While You Don't"
type: concept
category: technical-playbook
sources: []
entities: [alteramens]
related: [conversational-interface, agent-fleet-architecture, skill-era, world-model, knowledge-first-development]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Ambient Computation — Systems That Work While You Don't

A computation model where processing happens in response to environmental changes (events, time, data mutations) rather than explicit user commands. The system works continuously; the user inspects and intervenes when needed.

## The Shift

| Request-Response (SaaS) | Ambient Computation |
|--------------------------|---------------------|
| User initiates action | System reacts to environment |
| Click → process → display | Change → detect → process → notify |
| User drives the workflow | Events drive the workflow |
| Idle between interactions | Always processing |
| App as tool you use | App as environment you inhabit |

## Trigger Taxonomy

Ambient computation responds to diverse triggers:

- **Temporal**: cron jobs, scheduled checks, time-based rules
- **Data mutations**: new document ingested, field updated, threshold crossed
- **External signals**: webhooks, API callbacks, email received
- **System events**: deployment, error spike, resource change
- **UI micro-events**: mouse patterns, focus changes, idle detection (for hybrid systems)

Each trigger can initiate deterministic workflows, AI-driven processes, or hybrid chains.

## Beyond [[conversational-interface]]

Conversational interface removes forms: user asks → system answers.
Ambient computation removes the asking: system anticipates → user sees result.

```
Forms          →  "Fill this in"           (user does work)
Conversational →  "Ask me anything"        (user directs)
Ambient        →  "Here's what changed"    (system works)
```

The user's role shifts from operator to supervisor. Like the difference between driving (request-response) and being a passenger in a self-driving car (ambient + intervention).

## Implementation Pattern

```
Event Source  →  Detector  →  Workflow Engine  →  Effect
  (webhook)      (filter)     (deterministic     (notify user,
  (cron)         (classify)    or AI-driven)      update data,
  (mutation)     (prioritize)                     trigger next)
```

[[workscript]] is a natural fit — a JSON workflow engine that executes automations triggered by events. Combined with a [[world-model]] that provides context, ambient computation becomes personalized and intelligent.

## Connection to [[agent-fleet-architecture]]

Each agent in a fleet can be an ambient processor — Oracle continuously monitors SEO signals, Arrow watches for lead patterns, Flash generates content when gaps are detected. The fleet doesn't wait for commands; it operates on the world model continuously.

## Why Now

- LLMs make classification and response generation cheap
- Event infrastructure (webhooks, pub/sub) is commodity
- Edge computing enables local ambient processing
- Agent frameworks (Claude Code skills, MCP) provide the execution layer
