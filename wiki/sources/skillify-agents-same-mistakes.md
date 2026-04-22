---
title: "How to really stop your agents from making the same mistakes"
type: source
format: article
origin: vault
source_ref: "https://x.com/garrytan/status/2046876981711769720"
ingested: 2026-04-22
guided: true
entities: [garry-tan, langchain, langsmith, openclaw, gbrain, hermes-agent, gstack]
concepts: [skillify, thin-harness-fat-skills, latent-vs-deterministic, encoded-judgment, skill-era]
key_claims:
  - "Pieces aren't a practice — LangChain raised $160M and shipped great primitives (LangSmith, trajectory evals, LLM-as-judge, regression suites) but no opinionated workflow telling you what to test, in what order, or when you're done."
  - "Most AI agent reliability is vibes-based: prompt tweaks, bigger system messages, 'please don't hallucinate' incantations — decays the moment complexity arrives."
  - "Every failure is either latent (needs judgment) or deterministic (needs precision). The bug isn't a wrong answer; it's a wrong side — doing deterministic work in latent space."
  - "Skills work in a loop: latent space builds the deterministic tool, then the deterministic tool constrains the latent space. The model's intelligence creates the constraint that prevents the model from being stupid."
  - "Skillify is a 10-step promotion: SKILL.md → deterministic code → unit tests → integration tests → LLM evals → resolver trigger → resolver eval → check-resolvable + DRY audit → E2E smoke test → brain filing rules. A feature missing any step is just code that happens to work today."
  - "Resolver (AGENTS.md) is a routing table from intent → skill. On a 40-skill system, 15% of capabilities were dark (unreachable) until check-resolvable caught them — capabilities exist but the LLM can't reach them."
  - "The most honest eval heuristic: search your conversation history for 'fucking shit' or 'wtf' — those are the test cases you're missing."
  - "Hermes Agent (Nous Research) lets agents create skills autonomously (skill_manage tool, progressive disclosure, bounded MEMORY.md). But Hermes doesn't test skills. Creation + verification = both needed; GBrain supplies the verification layer."
  - "Prototype in conversation → see it work → say 'skillify' → agent writes SKILL.md + deterministic code + tests + resolver entry. One word turns an ad-hoc session into permanent infrastructure."
  - "In a healthy software engineering team, every bug gets a test. That test lives forever. Agent skills are no different — this is the 'without tests, any codebase rots' problem that software engineering solved in 2005."
confidence: high
images: []
---

# How to really stop your agents from making the same mistakes

Published 2026-04-22 by [[garry-tan]] (X: [@garrytan](https://x.com/garrytan/status/2046876981711769720)). Framed as a takedown of [[langchain]]'s $160M/3-year arc with [[langsmith]] — "they have the pieces. Pieces aren't a practice." The constructive core is **Skillify**, a 10-step promotion ritual that turns every agent failure into structural, test-backed permanence.

## The LangChain Indictment

LangChain has raised $160M, spent three years, carries a billion-dollar valuation, and shipped a genuinely sophisticated testing platform (LangSmith — trajectory evals, trace-to-dataset pipelines, LLM-as-judge, regression suites, unit test frameworks for tools).

Garry's argument: **"Pieces aren't a practice."** LangChain gives you testing tools but never tells you what to test, in what order, or when you're done. No opinionated workflow. A gym membership without a workout plan.

> "Most AI agent 'reliability' is vibes-based. Prompt tweaks. Bigger system messages. 'Please don't hallucinate' incantations. That stuff decays the moment the conversation gets complex."

This lands directly on Narcis's *judgment-over-functionality* stance: the $160M didn't miss the *primitives* — it missed the *workflow*. The moment where a human says "that worked, now make it permanent" and the system knows exactly what "permanent" means.

## Failure 1: The Trip Already in the Database

Garry asks his [[openclaw]] about a ten-year-old business trip. The agent:
1. Calls live calendar API → blocked (too far back)
2. Searches email → noisy, inconclusive
3. Retries calendar API with different params → still blocked
4. Five minutes later, searches local knowledge base → finds it instantly

3,146 calendar files, already indexed, already local. One grep away. **The bug wasn't a wrong answer. It was a wrong side.** Deterministic work (grep over local files) performed in [[latent-vs-deterministic|latent space]].

The fix: a skill file (`calendar-recall`) with the hard rule *"Live calendar APIs are ONLY for events in the FUTURE or the LAST 48 HOURS. Everything historical goes through the local knowledge base first."* The agent itself then wrote the deterministic script — sub-millisecond grep, zero LLM calls, zero network.

> "The latent space builds the deterministic tool, then the deterministic tool constrains the latent space. The agent used judgment to write calendar-recall.mjs. Now the skill forces the agent to run that script instead of reasoning about calendar data. The model's intelligence created the constraint that prevents the model from being stupid."

This is the [[thin-harness-fat-skills]] loop made concrete.

## Failure 2: "28 Minutes"

Same day. Agent answers "your next meeting is in 28 minutes" — reality was 88 minutes. UTC→PT math done in its head, off by exactly an hour.

A script (`context-now.mjs`) already existed, outputting:
```json
{ "now": "2026-04-21T07:38:12-07:00", "upcomingEvents": [{ "summary": "App Ops Sprint Planning", "minutesUntil": 88 }] }
```

Same shape as failure 1: subtracting timestamps is deterministic work, the agent did it in latent space. Fix: a `context-now` skill with the rule *"ALWAYS-ON discipline: run context-now.mjs before making ANY time-sensitive claim. Never do UTC→PT conversion in your head."*

## Skillify — The 10-Step Promotion

Every agent failure gets promoted to permanent infrastructure. A feature that doesn't pass all ten isn't a skill; it's just code that happens to work today:

1. **SKILL.md** — the contract (name, triggers, rules)
2. **Deterministic code** — `scripts/*.mjs` (no LLM for what code can do)
3. **Unit tests** — vitest on pure functions
4. **Integration tests** — live endpoints, real data, bugs fixtures don't expose (Windows line endings, missing tz fields, midnight-spanning events)
5. **LLM evals** — LLM-as-judge for quality/correctness; tests whether the agent runs the script or tries mental math
6. **Resolver trigger** — entry in AGENTS.md routing intent → skill
7. **Resolver eval** — verifies the trigger actually routes (both deterministic table checks AND LLM routing tests)
8. **Check-resolvable + DRY audit** — meta-test: every SKILL.md has a resolver entry; no two skills overlap
9. **E2E smoke test** — end-to-end pipeline, last line of defense when pieces don't connect
10. **Brain filing rules** — where does this skill write? people/, companies/, civic/? Consults a resolver instead of hardcoding paths

Garry reports 179 unit tests across 5 suites running under 2 seconds, 35 evals daily on context-now alone, 50+ resolver eval cases.

## Skillify as a Verb

Beyond incident response, the checklist becomes the way Garry builds everything:

> **Garry:** hot damn it worked. can you remember this as a webhook skill and skillify it, next time we need to do some webhooks? why was this so hard to get right? anyway it's good now. DRY it up too

One word — *"skillify"* — turns a working one-hour prototype into a durable skill with tests, a resolver entry, and documentation. The pattern: prototype in conversation → see it work → say "skillify" → prototype becomes permanent infrastructure. No specs. No tickets.

> "I talk to my agent, we solve the problem together, and then the solution becomes a skill that the agent can use forever without me."

## Check-Resolvable: The Dark-Skill Problem

After a month, Garry had 40+ skills. Some created by hand, others spawned by sub-agents on crons. First run of `check-resolvable` found **6 unreachable skills** — 15% of capabilities were dark. A flight tracker nobody could invoke by asking about flights. A content-ideas generator locked to cron. A citation fixer living in the skills directory but not listed in the resolver at all.

The audit now runs weekly and checks three things:
1. Every SKILL.md has a resolver entry
2. Every referenced script is actually callable
3. No two skills have overlapping trigger descriptions

## Hermes + GBrain Complementarity

[[hermes-agent]] (Nous Research) has a `skill_manage` tool that lets the agent itself create, patch, and delete skills from lessons learned — procedural memory the agent earns on its own. Progressive disclosure (load a skill index first, pull the full SKILL.md only when selected), bounded memory (MEMORY.md capped at 2,200 chars), conditional activation (skills auto-hide when required tools aren't available). Smart design.

But Hermes doesn't test skills. No unit tests on deterministic code. No resolver evals. No dark-skill detection. No DRY audit. No daily health check.

[[gbrain]] supplies verification. **Creation + verification = both needed.** This is the "without tests, any codebase rots" problem that software engineering solved in 2005, applied to agent skills.

## Failure Modes Without Tests

- Agent creates `deploy-k8s` Monday. Thursday it creates `kubernetes-deploy` from a different conversation. Both exist, both trigger on similar phrases, ambiguous routing, nobody notices until the wrong one fires at the wrong time.
- Skill works when written. Six weeks later the upstream API changes shape. The skill silently returns garbage until a human spots it.
- An autonomously-created skill has a weak trigger that never matches. It becomes an orphan — eating index tokens, never running, slowly rotting.

## The Big Idea

> "In a healthy software engineering team, every bug gets a test. That test lives forever. The bug becomes structurally impossible to recur. AI agents should work the same way. Every failure becomes a skill. Every skill has evals. Every eval runs daily. The agent's judgment improves permanently, not just for the current session, not just while the context window holds."

## Alignment with Narcis's Declared Self

- **Reinforces pillar `skill-era-craftsmanship`:** this is skill-era craftsmanship applied to agent skills. The article *is* the thesis made operational.
- **Reinforces pillar `ai-agents-for-solo-builders`:** "I talk to my agent, we solve the problem together" — this is the solo-builder workflow with AI as partner, not dashboard.
- **Reinforces stance `judgment-over-functionality`:** "$160M in framework funding missed... the workflow." Primitives without opinions = no moat.
- **Reinforces stance `pragmatic-over-elegant`:** deterministic code > LLM for what code can do. Three-line script > trajectory eval dashboard.
- **No contradictions** — article is fully aligned, extends Narcis's directions into agent-reliability territory.

## Connections

- [[skillify]] — the central concept extracted
- [[thin-harness-fat-skills]] — the framework Skillify operates inside
- [[latent-vs-deterministic]] — the mental model that explains why most agent bugs are misplacements, not wrong answers
- [[encoded-judgment]] — Skillify is how encoded judgment gets tested and kept honest
- [[skill-era]] — this article is the skill era's testing-and-compounding discipline
- [[compounding-games]] — "every bug gets a test that lives forever" is a compounding game
- [[performance-data-loop]] — related compounding pattern, but about measurement; Skillify is about prevention

## Vault relevance

Directly applicable to how Narcis builds Alteramens skills (`.claude/skills/`): `semnal-draft`, `semnal-reply`, `faber-ingest`, `faber-query`, `to-content` etc. are skill-files; the 10-step checklist is a durability standard for them. Strongest candidate for immediate experiment: add a resolver-eval layer over `.claude/skills/` to detect dark skills and overlapping triggers.
