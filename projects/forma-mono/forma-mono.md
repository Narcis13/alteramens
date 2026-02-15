---
status: prototype
type: devtools
repo: https://github.com/Narcis13/forma-mono
stack: Bun, TypeScript, Hono.js
version: v0.1.0
tags: [devtools, ai, agents, forms, open-source]
license: MIT
created: 2026-02-14
updated: 2026-02-15
---

# Forma

**Agent-native form builder - "Forms for agents"**

## Ce este

Forma este o librărie TypeScript care permite definirea, validarea și consumarea formularelor structurate, optimizate pentru **AI agents** (nu pentru UI uman). Killer feature: auto-generare de tool schemas pentru Claude `tool_use` și OpenAI function calling din aceeași definiție de form.

## Value Proposition

- **Zero-dependency core** - `@forma/core` fără niciun npm dependency
- **Automatic LLM tool schemas** - un form = un tool pentru Claude sau OpenAI
- **Agent-oriented** - instructions, examples (few-shot), error codes machine-readable
- **Rich validation** - types, regex, min/max, formats, nested groups, arrays
- **Pluggable formats** - registry pattern cu locale packs (include formate românești: CUI, CNP)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict, ESNext) |
| Runtime | Bun |
| HTTP | Hono v4 (doar `@forma/server`) |
| Testing | bun:test |
| Module System | ESM, Bun workspaces |

## Arhitectură (Monorepo)

```
forma-mono/
├── packages/
│   ├── core/                 # @forma/core (zero deps)
│   │   ├── schema.ts         # FormSchema, FieldDefinition types
│   │   ├── builder.ts        # Fluent FormBuilder API
│   │   ├── validator.ts      # FormValidator (sync)
│   │   ├── introspect.ts     # Agent-readable descriptions
│   │   ├── formats/          # Format registry + builtins + ro locale
│   │   └── generators/       # Claude & OpenAI tool schema generators
│   └── server/               # @forma/server (Hono)
│       ├── routes/forms.ts   # CRUD + describe + tool-schema endpoints
│       ├── routes/submissions.ts  # validate, submit, list
│       └── storage/          # StorageAdapter interface + InMemory
└── examples/
    └── basic/                # Romanian client onboarding form example
```

## API (Server Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/forms` | List forms |
| POST | `/forms` | Create form |
| GET | `/forms/:id/describe` | Agent introspection |
| GET | `/forms/:id/tool-schema?format=claude` | Auto tool definition |
| POST | `/forms/:id/validate` | Dry-run validation |
| POST | `/forms/:id/submit` | Validate + persist |

## Field Types (15)

`text`, `textarea`, `number`, `boolean`, `email`, `phone`, `url`, `date`, `datetime`, `select`, `multi-select`, `group` (nested), `array` (list), `file-ref`, `computed`

## Stare Curentă

- **v0.1.0 MVP** - built in 1 day (2026-02-14)
- Core + Server + Tests funcționale
- Doar InMemoryStorage (no persistence)
- No auth, no npm publish
- `@forma/agent-sdk` planned but deferred

## Legături

- [[forma-mono/docs/architecture|Arhitectură detaliată]]
- [[forma-mono/decisions/decisions|Log decizii]]
- [[forma-mono/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Persistent storage adapter (SQLite sau PostgreSQL)
- [ ] Auth middleware
- [ ] `@forma/agent-sdk` - high-level SDK for agent integration
- [ ] npm publish
- [ ] Documentație și README complet
