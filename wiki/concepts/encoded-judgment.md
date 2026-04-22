---
title: "Encoded Judgment — Skills vs Functions"
type: concept
category: mental-model
sources: [skill-era-article, eric-siu-world-intelligence, skillify-agents-same-mistakes]
entities: [alteramens, single-grain, eric-siu, garry-tan, langchain]
related: [skill-era, judgment, leverage, agent-fleet-architecture, world-model, internal-to-product, knowledge-first-development, emergent-schema, skillify, thin-harness-fat-skills, latent-vs-deterministic]
maturity: developing
confidence: high
contradictions: []
applications: ["CLAUDE.md", "workshop/drafts/ai-learning-platform.md"]
---

# Encoded Judgment — Skills vs Functions

The distinction between APIs (functions) and Skills (judgment) is the defining characteristic of the [[skill-era]].

## API vs Skill

| API (Function) | Skill (Judgment) |
|----------------|-----------------|
| "Here's how to send an email" | "Here's how to audit a landing page like a growth operator" |
| "Here's how to process a payment" | "Here's how to structure legal intake to catch real risk" |
| "Here's how to fetch data" | "Here's how to clean messy data so it becomes revenue" |

Functions are precise, mechanical, bounded. Skills encode a **way of thinking** — the accumulated expertise of someone who has done this hundreds of times.

## Why This Matters

When execution is compressed by LLMs, what remains scarce is the pattern recognition, the judgment calls, the "this is what a senior person would do" knowledge. This is what's worth encoding and distributing.

## Evaluation Filter for Alteramens

Every product/project should be tested: **"Where is the judgment?"**

If a project does only what a generic API does (send email, process payment, fetch data), it has no moat in the Skill Era. The judgment must be encoded — the opinions, the patterns, the "how a senior does it."

## Examples in Alteramens Portfolio

- **Forma:** Not just form validation — agent-native forms with Romanian-specific formats (CUI, CNP) and LLM tool schema generation
- **Loom UI:** Not just components — audit + repair engine that knows what good UI looks like
- **Robun:** Not just a chatbot — workspace identity (SOUL.md, USER.md) + skill system for encoded behaviors
- **nbrAIn:** Not just data access — conversational interface that understands what accountants and entrepreneurs actually need to know

## Agents as Judgment Carriers

[[eric-siu]]'s agent fleet demonstrates encoded judgment at organizational scale. Each agent doesn't just execute functions — it encodes the company's accumulated expertise:

- **Oracle** doesn't just fetch keywords — she knows which recommendations from Month 1 actually moved rankings, making Month 3 recommendations smarter
- **Arrow** doesn't just score leads — he correlates prospect language patterns with close rates, surfacing a 3x pattern no human noticed
- **World Agent** doesn't just coordinate — it holds the full organizational context that would otherwise require a leadership meeting to surface

The [[world-model]] is what makes this possible. Without proprietary context, agents are generic. With it, they encode the specific judgment of this company, this market, this team. This is [[internal-to-product]] at the judgment level.

## Encoded Judgment Needs a Verification Discipline

[[skillify-agents-same-mistakes|Garry Tan's Skillify essay]] sharpens this concept with a hard question: **once judgment is encoded, how do you keep it honest?** His answer reframes the "API vs Skill" table above — encoded judgment isn't safe just because it exists. Without tests, resolver evals, DRY audits, and `check-resolvable` meta-tests, skills:
- Rot silently when upstream APIs shift shape
- Collide with duplicate variants created from different conversations
- Become dark (unreachable from the resolver) — capability exists, LLM can't call it

Garry's framing lands directly on this page: his critique of [[langchain]] is that they shipped *primitives without opinions* — and opinions without verification decay back into vibes. The full chain is:

```
API  →  Skill (encoded judgment)  →  Skillified skill (judgment + verification)
```

[[skillify]] is the 10-step promotion that moves a skill from "code that happens to work today" to durable infrastructure. Inside every skill, [[latent-vs-deterministic]] splits the work correctly: judgment to the LLM, precision to code. [[thin-harness-fat-skills]] is the architecture where this all fits.

**Implication for the "Where is the judgment?" filter:** the question is no longer just *whether* judgment is encoded. It's also *whether it's tested, routed, and kept alive*. An untested skill has no more moat than an API.
