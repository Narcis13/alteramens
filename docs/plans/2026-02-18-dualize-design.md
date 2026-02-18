# Dualize - Dual Interface Library for Bun+Hono

**Date:** 2026-02-18
**Status:** Approved
**Type:** Reusable library (npm package)
**Stack:** Bun, Hono, Zod, TypeScript

## Problem

Multiple Alteramens projects (BunBase, DavidUp, Contzo, Robun, Forma) share the same Bun+Hono+TypeScript stack. Each needs both API endpoints and CLI commands that perform the same operations. Currently these are built separately, duplicating logic or creating tight coupling between transport and business logic.

## Solution

A library that lets you define business logic once as **actions** and automatically exposes them as both HTTP API routes (Hono) and CLI commands.

## Core Concepts

### Action = Unit of Business Logic

One file = one action. Transport-agnostic. Input validated with Zod, output is JSON.

```ts
// actions/product/create.ts
import { z } from "zod"
import type { ActionMeta, ActionContext } from "dualize"

export const meta: ActionMeta = {
  description: "Create a new product",
  auth: "admin",
  // Optional overrides:
  // api: { method: "PUT", path: "/custom/path" },
  // cli: false,
}

export const input = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

export default async function(ctx: ActionContext<typeof input>) {
  const { name, price } = ctx.input
  const product = await ctx.db.insert("products", { name, price })
  return { product }
}
```

### Flow

```
actions/product/create.ts
        |
        v
   ActionRegistry (scan + validate at startup)
        |
        +---> HonoAdapter  -> POST /api/product/create (JSON in/out)
        |
        +---> CLIAdapter   -> myapp product create (args -> JSON in, JSON out)
```

## File Scanning & Conventions

### Directory Structure

```
src/actions/
  product/
    create.ts           -> product.create
    list.ts             -> product.list
    [id]/
      get.ts            -> product.get (param :id)
      update.ts         -> product.update (param :id)
      delete.ts         -> product.delete (param :id)
  auth/
    login.ts            -> auth.login
    register.ts         -> auth.register
  _health.ts            -> health (no namespace)
```

### Route Mapping

| File path | Action name | API Route | CLI Command |
|-----------|-------------|-----------|-------------|
| `product/create.ts` | `product.create` | `POST /api/product/create` | `myapp product create` |
| `product/list.ts` | `product.list` | `GET /api/product/list` | `myapp product list` |
| `product/[id]/get.ts` | `product.get` | `GET /api/product/:id` | `myapp product get --id xxx` |
| `product/[id]/delete.ts` | `product.delete` | `DELETE /api/product/:id` | `myapp product delete --id xxx` |

### HTTP Method Inference

| Action name contains | Inferred method |
|---------------------|----------------|
| `create` | POST |
| `list`, `get` | GET |
| `update` | PATCH |
| `delete` | DELETE |
| anything else | POST (safe default) |

Override with `meta.api.method` when needed.

### Registry

Eager scan at startup. Fail-fast on invalid files. Enables help/docs generation at init.

```ts
const registry = await scanActions("./src/actions")
// Map<string, LoadedAction>
```

## Adapters

### Hono Adapter

Mounts actions as Hono routes:

```ts
import { Hono } from "hono"
import { createHonoAdapter } from "dualize"

const app = new Hono()
const adapter = createHonoAdapter(registry, {
  prefix: "/api",
  authResolver: honoAuthResolver,
})

adapter.mount(app)
// Developer can add custom Hono routes alongside
app.get("/custom", (c) => c.text("hello"))
```

Per action: parse body/query -> Zod validate -> build ActionContext -> call handler -> return JSON. Validation errors -> 400. Auth failures -> 401/403.

### CLI Adapter

Mounts actions as subcommands:

```ts
import { createCLIAdapter } from "dualize"

const cli = createCLIAdapter(registry, {
  name: "myapp",
  version: "1.0.0",
  authResolver: cliAuthResolver,
})

cli.run(process.argv)
```

Per action: parse args -> Zod validate -> build ActionContext -> call handler -> JSON to stdout. Auto-generates `--help` from meta + Zod schema.

Output: JSON by default. `--pretty` flag for human-friendly formatting.

### Auth Resolvers

Common interface, different sources:

```ts
type AuthResolver = (source: "api" | "cli", raw: any) => Promise<AuthContext | null>

// API: extracts JWT from Authorization header
// CLI: reads token from ~/.myapp/config.json
```

### Unified Entry Point

```ts
import { createDualApp } from "dualize"

const dual = await createDualApp({
  actionsDir: "./src/actions",
  name: "myapp",
  version: "1.0.0",
  context: { db, email, storage },  // DI
})

// Auto-detect: "./myapp serve" -> server, "./myapp product create" -> CLI action
```

## Error Handling

Actions throw typed errors, adapters translate:

```ts
import { ActionError } from "dualize"

throw new ActionError("NOT_FOUND", "Product not found")
throw new ActionError("FORBIDDEN", "Admin only")
throw new ActionError("VALIDATION", "Invalid price", details)
throw new ActionError("CONFLICT", "Already exists")
```

| Error code | HTTP status | CLI behavior |
|-----------|-------------|--------------|
| NOT_FOUND | 404 | stderr + exit 1 |
| FORBIDDEN | 403 | stderr + exit 1 |
| VALIDATION | 400 | stderr + exit 1 |
| CONFLICT | 409 | stderr + exit 1 |
| INTERNAL | 500 | stderr + exit 1 |

## Context & Dependency Injection

Services injected via config, available in all actions:

```ts
const dual = await createDualApp({
  actionsDir: "./src/actions",
  context: { db: database, email: emailService },
})

// In action:
export default async function(ctx: ActionContext<typeof input>) {
  ctx.input    // validated input
  ctx.auth     // AuthContext | null
  ctx.db       // injected
  ctx.email    // injected
  ctx.meta     // action metadata
}
```

Type safety: context types inferred from config automatically.

## Introspection & DX

### Auto-generated help

```bash
$ myapp --help
myapp v1.0.0
Commands:
  product create    Create a new product
  product list      List all products
  ...

$ myapp product create --help
Create a new product
Options:
  --name     string (required)
  --price    number (required)
  --pretty   Format output for humans
Auth: admin
```

### Meta-commands

```bash
$ myapp actions
# Lists all available actions with methods, paths, auth requirements
# Useful for AI agents discovering app capabilities

$ myapp login --url http://localhost:3000 --email admin@test.com --password secret
# Saves token to ~/.myapp/config.json
```

### OpenAPI generation (optional)

```ts
const spec = dual.openapi()  // OpenAPI 3.1 from registry
```

## Consumers

- **Developers** (admin/management tooling)
- **AI Agents / Automation** (machine-readable JSON output, action discovery via `myapp actions`)

## Design Decisions

1. **Convention over config** - File structure determines routing, minimal boilerplate
2. **Full auto with manual override** - Everything auto-registered, developers can override via `meta`
3. **JSON by default** - CLI output is machine-readable, `--pretty` for humans
4. **Unified auth layer** - Same AuthContext regardless of transport
5. **Zod for everything** - Input validation, help generation, OpenAPI spec, CLI arg parsing
6. **Eager scanning** - Fail fast at startup, not at first request
7. **No heavy dependencies** - Minimal CLI parser (custom or citty), Hono, Zod
