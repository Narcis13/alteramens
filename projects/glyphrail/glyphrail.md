---
status: active
type: devtools
repo: https://github.com/Narcis13/glyphrail
stack: Bun, TypeScript
version: v0.1.0
tags: [devtools, cli, workflow, orchestration, agent, deterministic]
license: MIT
created: 2026-03-17
updated: 2026-03-17
---

# Glyphrail

**Bun-native, CLI-first workflow engine pentru orchestrare deterministă și execuție bounded a agent steps.**

## Ce este

Glyphrail este un runtime local pentru workflow-uri deterministe, inspectabile, cu bounded structured agent steps. Nu este un chat agent framework și nu este un autonomous loop runner.

Are:
- un YAML workflow DSL
- un JSON runtime state model
- un TypeScript tool registry
- un deterministic execution engine
- un structured agent interface
- persisted run artifacts (inspect + resume)

**Principiu arhitectural central:**
- engine-ul deține control flow, persistence, budgets, safety
- tools dețin typed side effects
- agent steps dețin bounded judgment într-un shell determinist
- CLI-ul este un contract machine-operable, nu doar human UX

## Value Proposition

- **CLI-first, machine-operable** - un agent extern poate opera Glyphrail complet prin CLI (capabilities, validate, run, inspect, resume)
- **Deterministic + inspectable** - run artifacts persistate, trace JSONL, resume din persisted state (nu din prompt history)
- **Bounded agent steps** - agentul nu deține workflow-ul, engine-ul controlează retry, schema validation, timeout, state write
- **Zero runtime dependencies** - no npm dependencies în package.json
- **Structured output repair** - extrage JSON valid din răspunsuri cu markdown fencing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun >= 1.3.0 |
| Language | TypeScript (strict) |
| CLI | Bun direct execution |
| Testing | Bun test runner |
| Dependencies | Zero (runtime) |

## Arhitectura

```
src/
├── cli/        # command registry, parser, JSON envelopes
├── core/       # execution engine, trace types, run storage
├── dsl/        # workflow normalization, schema, validation/linting
├── tools/      # tool contracts, registry, policy enforcement
├── agent/      # adapter contracts, mock adapter, output repair
├── config/     # project config discovery
templates/      # init, workflow, tool scaffolding
playground/mvp/ # manual verification project
test/           # integration + unit coverage
```

## Step Kinds Implementate

| Kind | Status |
|------|--------|
| `assign` | implementat |
| `tool` | implementat |
| `agent` (structured mode) | implementat |
| `if`, `for_each`, `while` | implementate |
| `parallel` | declared, neexecutabil |
| `return`, `fail`, `noop` | implementate |

## CLI Commands

- `capabilities`, `schema`, `init`, `check`
- `workflow create/validate/explain/lint`
- `tool list/show/call/validate/scaffold`
- `run`, `resume`
- `runs list/show/state/output/trace/step/explain`

## Stare Curenta

- **v0.1.0 MVP** - Slice 6 implementat
- Workflow authoring, validation, linting, execution completă
- Persisted run artifacts + resume funcțional
- Mock agent adapter (no live LLM providers yet)
- `parallel` + `agent.mode=tool-use` - deferred
- Disponibil pe npm: `glyphrail`

## Workflow DSL (exemplu)

```yaml
version: "1.0"
name: hello-world
inputSchema:
  type: object
  properties:
    name: { type: string }
  required: [name]
steps:
  - id: greet
    kind: tool
    tool: makeGreeting
    input:
      name: ${input.name}
    save: state.greeting
  - id: done
    kind: return
    output:
      greeting: ${state.greeting}
```

## Run Lifecycle

Fiecare run produce artefacte în `.glyphrail/runs/run_<id>/`:
- `meta.json` - status, cursor, retry counters
- `state.latest.json` - ultimul state persistent
- `trace.jsonl` - execution trace append-only
- `checkpoints/` - snapshot după fiecare step

## Legaturi

- [[glyphrail/docs/architecture|Arhitectura detaliata]]
- [[glyphrail/decisions/decisions|Log decizii]]
- [[glyphrail/learnings/learnings|Ce am invatat]]

## Next Steps

- [ ] Live provider adapters (Claude, OpenAI)
- [ ] `agent.mode=tool-use` execution
- [ ] `parallel` step execution
- [ ] Workflow imports și packaging
- [ ] Integrare cu alte proiecte Alteramens (Robun, BunBase)
