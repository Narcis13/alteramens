---
status: active
type: devtools
repo: https://github.com/Narcis13/dualize
stack: Bun, TypeScript, Hono, Zod, citty
version: v0.1.0
tags: [devtools, library, dual-interface, api, cli, convention-over-config]
created: 2026-02-18
updated: 2026-02-18
---

# Dualize

**Dual interface library - definesti business logic o singura data, obtii automat API routes (Hono) si CLI commands.**

## Ce este

Dualize este o librarie refolosibila pentru Bun+Hono care scaneaza un director de actions si genereaza automat rute HTTP (Hono) si comenzi CLI din aceeasi sursa. Fiecare action e o functie pura cu Zod schema pentru input validation, metadata pentru routing si un handler transport-agnostic.

Convention-over-config: structura de fisiere determina routing-ul, fara boilerplate.

## Value Proposition

- **Write once, run both** - un singur handler devine API endpoint + CLI command
- **Convention-over-config** - file path → route name → HTTP method, automat
- **Zod everywhere** - input validation, CLI arg parsing, help generation, OpenAPI spec
- **File-based scanning** - `Bun.Glob` la startup, fail-fast pe fisiere invalide
- **Transport-agnostic** - ActionContext identic indiferent daca vine din HTTP sau CLI
- **DI simplu** - services injectate prin config, disponibile in toate actions
- **Machine-friendly** - JSON output default, `--pretty` pentru humans, `myapp actions` pentru discovery

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Language | TypeScript (strict) |
| HTTP | Hono v4 |
| Validation | Zod v3 |
| CLI parsing | citty (UnJS) |
| Build | Bun bundler |

## Arhitectura

```
packages/dualize/src/
├── types.ts          # ActionMeta, ActionContext, AuthResolver, LoadedAction, DualAppOptions
├── errors.ts         # ActionError cu HTTP status mapping
├── scanner.ts        # Bun.Glob file scanner, path→name conversion, HTTP method inference
├── hono-adapter.ts   # Monteaza actions ca Hono routes (app.on())
├── cli-adapter.ts    # Monteaza actions ca CLI subcommands cu arg parsing
├── zod-bridge.ts     # Zod schema → citty args conversion + type coercion
├── app.ts            # createDualApp - unified entry point
└── index.ts          # Barrel exports
```

## Core Concept: Action

Un fisier = o actiune. Transport-agnostic.

```
src/actions/
  product/
    create.ts         → POST /api/product/create  |  myapp product create
    list.ts           → GET  /api/product/list     |  myapp product list
    [id]/
      get.ts          → GET  /api/product/:id      |  myapp product get --id xxx
      delete.ts       → DELETE /api/product/:id    |  myapp product delete --id xxx
  _health.ts          → POST /api/health           |  myapp health
```

## Key Patterns

- **ActionRegistry** - `Map<string, LoadedAction>` scanat la startup cu `Bun.Glob`
- **Dual Adapters** - HonoAdapter si CLIAdapter consuma acelasi registry
- **Zod Bridge** - schema → citty arg definitions + string→type coercion
- **ActionError** - erori tipizate cu cod → HTTP status mapping automat
- **Auth resolvers** - interfata comuna, surse diferite (JWT din header vs token din config)
- **HTTP method inference** - `create`→POST, `list/get`→GET, `update`→PATCH, `delete`→DELETE

## Stare Curenta

- **v0.1.0** - design complet, implementation plan cu 10 tasks TDD
- Repo initializat pe GitHub (empty, doar plans)
- Design doc: [[../docs/plans/2026-02-18-dualize-design|Design complet]]
- Implementation plan: [[../docs/plans/2026-02-18-dualize-implementation|Plan TDD cu 37 teste]]
- Monorepo structure: `packages/dualize/`

## Cum se va folosi

```ts
import { createDualApp } from "dualize"

const app = await createDualApp({
  actionsDir: "./src/actions",
  name: "myapp",
  version: "1.0.0",
  context: { db, email },
})

// API mode
app.serve({ port: 3000 })

// CLI mode
app.run(process.argv)
```

## Consumatori interni

Toate proiectele Bun+Hono din Alteramens:
- **BunBase** - admin CLI + API management
- **DavidUp** - video processing actions
- **Contzo** - contabilitate actions
- **Robun** - agent management commands
- **Forma** - form builder operations

## Legaturi

- [[dualize/docs/architecture|Arhitectura detaliata]]
- [[dualize/decisions/decisions|Log decizii]]
- [[dualize/learnings/learnings|Ce am invatat]]
- [[../ideas/API + CLI|Ideea originala]]
- [[../docs/plans/2026-02-18-dualize-design|Design doc]]
- [[../docs/plans/2026-02-18-dualize-implementation|Implementation plan]]

## Next Steps

- [ ] Implementare Task 1-3: scaffold, types, errors
- [ ] Implementare Task 4: scanner (componenta core)
- [ ] Implementare Task 5-7: adapters (Hono + CLI)
- [ ] Implementare Task 8-9: createDualApp + wiring
- [ ] Task 10: example app + manual testing
- [ ] Publish pe npm ca `dualize`
- [ ] Integrare in BunBase ca primul consumator real
