---
parent: "[[dualize/dualize|Dualize]]"
type: doc
---

# Dualize - Arhitectura

## Overview

Dualize este o librarie care transforma un director de action files intr-un registry central, apoi il expune prin doua adaptoare: Hono (HTTP) si CLI. Totul e scanat la startup, fail-fast.

## Flow Principal

```
src/actions/**/*.ts
        |
        v
   scanActions() (Bun.Glob)
        |
        v
   ActionRegistry (Map<string, LoadedAction>)
        |
        +---> HonoAdapter.mount(app)  -> POST/GET/PATCH/DELETE /api/...
        |
        +---> CLIAdapter.run(argv)    -> myapp [namespace] [action] --args
```

## Module Principale

| Modul | Responsabilitate |
|-------|-----------------|
| `types.ts` | Core types: ActionMeta, ActionContext, AuthResolver, LoadedAction, DualAppOptions |
| `errors.ts` | ActionError - erori tipizate cu error code → HTTP status mapping |
| `scanner.ts` | Bun.Glob file scanner, path-to-name conversion, param extraction, HTTP method inference |
| `hono-adapter.ts` | Monteaza actions ca Hono routes via `app.on(method, path, handler)` |
| `cli-adapter.ts` | Parseaza argv, matcheaza actiuni, executa cu Zod validation |
| `zod-bridge.ts` | Converteste Zod schemas in citty arg definitions + type coercion din string |
| `app.ts` | `createDualApp()` - compune scanner + adapters + DI intr-un singur API |
| `index.ts` | Barrel exports |

## Action Anatomy

Fiecare action file exporta:

```ts
export const meta: ActionMeta = {    // required - description, auth, overrides
  description: "What this does",
  auth: "admin",                     // "public" | "admin" | "user" | custom fn
  api: { method: "PUT" },           // optional override
  cli: false,                        // optional - exclude from CLI
}

export const input = z.object({...}) // optional - Zod schema for validation

export default async function(ctx) { // required - handler
  return { result: "..." }           // return JSON-serializable data
}
```

## Scanner Detail

```
1. Bun.Glob("**/*.ts").scan(actionsDir)
2. Filter: skip .test.ts, .spec.ts
3. For each file:
   a. import() module
   b. Validate: must have default fn + meta.description
   c. Extract action name from path (product/create.ts → product.create)
   d. Extract params from [param] dirs ([id] → params: ["id"])
   e. Store in Map<name, LoadedAction>
4. Return registry
```

## Path Convention

| File path | Action name | API Route | CLI Command |
|-----------|-------------|-----------|-------------|
| `product/create.ts` | `product.create` | `POST /api/product/create` | `myapp product create` |
| `product/[id]/get.ts` | `product.get` | `GET /api/product/:id` | `myapp product get --id x` |
| `_health.ts` | `health` | `POST /api/health` | `myapp health` |

## HTTP Method Inference

| Keyword in name | Method |
|----------------|--------|
| `create` | POST |
| `list`, `get` | GET |
| `update` | PATCH |
| `delete` | DELETE |
| (anything else) | POST |

Override cu `meta.api.method` cand e nevoie.

## Hono Adapter Flow

```
Request → parse body/query → merge route params → Zod validate → resolve auth → build ActionContext → call handler → return JSON
                                                     |
                                              validation fail → 400
                                              auth fail → 401/403
                                              ActionError → mapped status
                                              unknown error → 500
```

## CLI Adapter Flow

```
argv → strip binary+script → parse flags/args → match action name → Zod coerce+validate → resolve auth → build ActionContext → call handler → JSON to stdout
                                                                        |
                                                                  --help → show help
                                                                  --pretty → formatted JSON
                                                                  "actions" → list all actions
```

## Zod Bridge

Converteste Zod schema in arg definitions pentru CLI:
- `z.string()` → `{ type: "string" }`
- `z.number()` → `{ type: "string" }` (coerced la parse)
- `z.boolean()` → `{ type: "boolean" }`
- `.optional()` → `required: false`
- `.default(val)` → `required: false, default: String(val)`

## ActionContext (shared)

```ts
interface ActionContext<TInput> {
  input: TInput        // validated input
  auth: AuthContext     // resolved auth (or null)
  meta: ActionMeta     // action metadata
  source: "api"|"cli"  // transport source
  // + injected services from DualAppOptions.context
}
```

## Error System

```ts
ActionError("NOT_FOUND", msg)     → HTTP 404 | CLI exit 1
ActionError("FORBIDDEN", msg)     → HTTP 403 | CLI exit 1
ActionError("VALIDATION", msg)    → HTTP 400 | CLI exit 1
ActionError("CONFLICT", msg)      → HTTP 409 | CLI exit 1
ActionError("UNAUTHORIZED", msg)  → HTTP 401 | CLI exit 1
ActionError("INTERNAL", msg)      → HTTP 500 | CLI exit 1
```

## Dependency Injection

Services injectate la creare, disponibile in ctx:

```ts
createDualApp({
  context: { db, email, storage }
})
// In action: ctx.db, ctx.email, ctx.storage
```
