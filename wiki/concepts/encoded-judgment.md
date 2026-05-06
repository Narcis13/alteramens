---
title: "Encoded Judgment — Skills vs Functions"
type: concept
category: mental-model
sources: [skill-era-article, eric-siu-world-intelligence, skillify-agents-same-mistakes, skill-graphs-2-heinrich, reply-guy-growth-engine-framework]
entities: [alteramens, single-grain, eric-siu, garry-tan, langchain, heinrich, grok-ai]
related: [skill-era, judgment, leverage, agent-fleet-architecture, world-model, internal-to-product, knowledge-first-development, emergent-schema, skillify, thin-harness-fat-skills, latent-vs-deterministic, atoms-molecules-compounds, skill-graphs, brain-ram-leverage, value-amplifier-mindset, value-amplifier-template]
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

## Judgment Bounded vs Open ([[heinrich]])

[[skill-graphs-2-heinrich|heinrich's atoms/molecules/compounds]] adaugă o axă orthogonală pe acest concept: **gradul de judgment delegat agentului per skill**. Encoded judgment nu e binar — există un spectru.

| Nivel | Tip de judgment encodat | Determinism |
|---|---|---|
| **Atom** | Bounded judgment — decizia e îngustă, aproape mecanică | Aproape determinist |
| **Molecule** | Composed judgment — agentul decide *cum* să cheme atoms-urile, dar within explicit instructions | Reliable |
| **Compound** | Open judgment — agentul orkestrează multiple molecules cu autonomie | Less deterministic by design |

Asta extinde tabela de "API vs Skill" cu un al treilea pol: **API = no judgment; Atom = bounded judgment; Compound = open judgment**.

**Filtrul "Where is the judgment?" se rafinează:**
- Pentru atoms — judgment-ul e *în alegerea de scope-ul îngust și în calitatea procedurii deterministe*
- Pentru molecules — judgment-ul e *în composition explicită* (în what order, with what fallbacks)
- Pentru compounds — judgment-ul e *în orchestration autonomy* (când să devieze de la playbook, când să escaleze la operator)

Pentru Alteramens, asta înseamnă că **fiecare skill din `.claude/skills/` ar trebui să aibă un nivel declarat** — și judgment-ul encodat trebuie evaluat *la nivelul respectiv*. Un atom "judgment-ful" e suspicious (probabil are scope prea larg). Un compound fără judgment e degenerate (probabil e doar molecule renamed). Vezi [[atoms-molecules-compounds]] și [[faber-as-skill-graph]].

## Encoded Judgment în Social — Grok Co-Pilot Prompts

[[reply-guy-growth-engine-framework]] aduce un exemplar instructiv pentru concept: trei prompt-uri ([[grok-ai|Grok]] Fast Reply Generator, UltraThink Deep Dive, Batch Mode) care nu execută o funcție mecanică ("write a reply") ci **encodează procedura unui operator de reply** — gate de mindset ([[value-amplifier-mindset]]), template structural ([[value-amplifier-template]]), engagement-hook discipline.

Asta confirmă filtrul "Where is the judgment?" pe terenul social-media:

- **API echivalent** — "given a tweet, generate 3 replies." No opinion. Just text.
- **Skill-level** — "given a tweet + brand voice, run the Value Amplifier 4-question gate; if it passes, generate 3 variants slot-mapped (counter / story / reframe), each enforcing 2-3 sentence cap and ending with an engagement hook." Opinion. Procedure.

Diferența nu e cosmetică — e diferența între un tool care produce content slop și unul care produce distribution. Aceleași model-uri în spate, judgment-ul diferit la suprafață.

**Implicație pentru Alteramens:** [[.claude/skills/semnal-reply/SKILL.md|/semnal-reply]] e candidat direct să încorporeze acest pattern — atom-ul ([[value-amplifier-template]]) e deja crystallized; molecula (variant generation) și compound-ul (full daily reply session cu target list și tracking) sunt deasupra.
