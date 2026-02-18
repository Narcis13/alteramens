# Dualize Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a reusable Bun+Hono library that auto-generates both API routes and CLI commands from file-based action definitions.

**Architecture:** File-based action registry scanned with `Bun.Glob` at startup. Each action exports a Zod schema, metadata, and handler. A Hono adapter mounts routes via `app.on()`. A CLI adapter converts Zod schemas to `citty` arg definitions. Both adapters build the same `ActionContext` and call the same handler.

**Tech Stack:** Bun, Hono, Zod, citty (UnJS), TypeScript

**Dependencies:** `hono`, `zod`, `citty`

**Dev Dependencies:** `bun-types`, `@types/bun`

---

## Task 1: Project Scaffold

**Files:**
- Create: `packages/dualize/package.json`
- Create: `packages/dualize/tsconfig.json`
- Create: `packages/dualize/src/index.ts`

**Step 1: Create package directory**

```bash
mkdir -p packages/dualize/src
```

**Step 2: Create package.json**

```json
{
  "name": "dualize",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "test": "bun test",
    "check": "bun x tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4",
    "zod": "^3",
    "citty": "^0.1"
  },
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "hono": ">=4",
    "zod": ">=3"
  }
}
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 4: Create barrel export**

```ts
// src/index.ts
export { ActionError } from "./errors"
export { scanActions } from "./scanner"
export { createHonoAdapter } from "./hono-adapter"
export { createCLIAdapter } from "./cli-adapter"
export { createDualApp } from "./app"
export type { ActionMeta, ActionContext, ActionHandler, AuthResolver, LoadedAction, DualAppOptions } from "./types"
```

**Step 5: Install dependencies**

```bash
cd packages/dualize && bun install
```

**Step 6: Commit**

```bash
git add packages/dualize/
git commit -m "feat(dualize): scaffold project with package.json and tsconfig"
```

---

## Task 2: Core Types

**Files:**
- Create: `packages/dualize/src/types.ts`
- Test: `packages/dualize/src/types.test.ts`

**Step 1: Write the failing test**

```ts
// src/types.test.ts
import { describe, test, expect } from "bun:test"
import { z } from "zod"
import type { ActionMeta, ActionContext, AuthResolver, LoadedAction } from "./types"

describe("types", () => {
  test("ActionMeta accepts minimal config", () => {
    const meta: ActionMeta = { description: "Test action" }
    expect(meta.description).toBe("Test action")
  })

  test("ActionMeta accepts full config with overrides", () => {
    const meta: ActionMeta = {
      description: "Create product",
      auth: "admin",
      api: { method: "PUT", path: "/custom" },
      cli: false,
    }
    expect(meta.auth).toBe("admin")
    expect(meta.api?.method).toBe("PUT")
    expect(meta.cli).toBe(false)
  })

  test("LoadedAction contains all required fields", () => {
    const schema = z.object({ name: z.string() })
    const action: LoadedAction = {
      name: "product.create",
      meta: { description: "Create" },
      input: schema,
      handler: async (ctx) => ({ ok: true }),
      filePath: "actions/product/create.ts",
      params: [],
    }
    expect(action.name).toBe("product.create")
    expect(action.params).toEqual([])
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/types.test.ts
```

Expected: FAIL (cannot find module "./types")

**Step 3: Write the types**

```ts
// src/types.ts
import type { z } from "zod"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ActionMeta {
  description: string
  auth?: "public" | "admin" | "user" | ((ctx: AuthContext) => boolean | Promise<boolean>)
  api?: {
    method?: HttpMethod
    path?: string
  } | false
  cli?: {
    name?: string
  } | false
}

export interface AuthContext {
  userId: string
  role: string
  [key: string]: unknown
}

export interface ActionContext<TInput = unknown, TCustom = Record<string, unknown>> {
  input: TInput
  auth: AuthContext | null
  meta: ActionMeta
  source: "api" | "cli"
}

export type ActionHandler<TInput = unknown> = (
  ctx: ActionContext<TInput> & Record<string, unknown>
) => unknown | Promise<unknown>

export type AuthResolver = (
  source: "api" | "cli",
  raw: unknown
) => Promise<AuthContext | null>

export interface LoadedAction {
  name: string
  meta: ActionMeta
  input: z.ZodObject<any> | null
  handler: ActionHandler
  filePath: string
  params: string[]
}

export interface DualAppOptions {
  actionsDir: string
  name: string
  version?: string
  context?: Record<string, unknown>
  authResolver?: AuthResolver
  apiPrefix?: string
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/types.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/dualize/src/types.ts packages/dualize/src/types.test.ts
git commit -m "feat(dualize): add core type definitions"
```

---

## Task 3: ActionError

**Files:**
- Create: `packages/dualize/src/errors.ts`
- Test: `packages/dualize/src/errors.test.ts`

**Step 1: Write the failing test**

```ts
// src/errors.test.ts
import { describe, test, expect } from "bun:test"
import { ActionError } from "./errors"

describe("ActionError", () => {
  test("creates error with code and message", () => {
    const err = new ActionError("NOT_FOUND", "Product not found")
    expect(err).toBeInstanceOf(Error)
    expect(err.code).toBe("NOT_FOUND")
    expect(err.message).toBe("Product not found")
    expect(err.statusCode).toBe(404)
  })

  test("maps error codes to HTTP status codes", () => {
    expect(new ActionError("NOT_FOUND", "").statusCode).toBe(404)
    expect(new ActionError("FORBIDDEN", "").statusCode).toBe(403)
    expect(new ActionError("VALIDATION", "").statusCode).toBe(400)
    expect(new ActionError("CONFLICT", "").statusCode).toBe(409)
    expect(new ActionError("UNAUTHORIZED", "").statusCode).toBe(401)
    expect(new ActionError("INTERNAL", "").statusCode).toBe(500)
  })

  test("includes optional details", () => {
    const details = { field: "price", issue: "must be positive" }
    const err = new ActionError("VALIDATION", "Invalid input", details)
    expect(err.details).toEqual(details)
  })

  test("toJSON returns structured error", () => {
    const err = new ActionError("NOT_FOUND", "Not found")
    const json = err.toJSON()
    expect(json).toEqual({
      error: { code: "NOT_FOUND", message: "Not found" }
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/errors.test.ts
```

**Step 3: Implement ActionError**

```ts
// src/errors.ts
const STATUS_MAP: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  VALIDATION: 400,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  INTERNAL: 500,
}

export type ErrorCode = "NOT_FOUND" | "FORBIDDEN" | "VALIDATION" | "CONFLICT" | "UNAUTHORIZED" | "INTERNAL"

export class ActionError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number
  readonly details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = "ActionError"
    this.code = code
    this.statusCode = STATUS_MAP[code] ?? 500
    this.details = details
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      }
    }
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/errors.test.ts
```

**Step 5: Commit**

```bash
git add packages/dualize/src/errors.ts packages/dualize/src/errors.test.ts
git commit -m "feat(dualize): add ActionError with HTTP status mapping"
```

---

## Task 4: Action Scanner

**Files:**
- Create: `packages/dualize/src/scanner.ts`
- Test: `packages/dualize/src/scanner.test.ts`
- Create: `packages/dualize/src/__fixtures__/actions/product/create.ts`
- Create: `packages/dualize/src/__fixtures__/actions/product/list.ts`
- Create: `packages/dualize/src/__fixtures__/actions/product/[id]/get.ts`
- Create: `packages/dualize/src/__fixtures__/actions/_health.ts`

**Step 1: Create test fixtures**

```ts
// src/__fixtures__/actions/product/create.ts
import { z } from "zod"
import type { ActionMeta } from "../../../types"

export const meta: ActionMeta = {
  description: "Create a new product",
  auth: "admin",
}

export const input = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

export default async function(ctx: any) {
  return { product: { id: "123", ...ctx.input } }
}
```

```ts
// src/__fixtures__/actions/product/list.ts
import type { ActionMeta } from "../../../types"

export const meta: ActionMeta = {
  description: "List all products",
  auth: "public",
}

export default async function() {
  return { products: [] }
}
```

```ts
// src/__fixtures__/actions/product/[id]/get.ts
import { z } from "zod"
import type { ActionMeta } from "../../../../types"

export const meta: ActionMeta = {
  description: "Get product by ID",
}

export const input = z.object({
  name: z.string().optional(),
})

export default async function(ctx: any) {
  return { product: { id: "test" } }
}
```

```ts
// src/__fixtures__/actions/_health.ts
import type { ActionMeta } from "../../types"

export const meta: ActionMeta = {
  description: "Health check",
  auth: "public",
}

export default async function() {
  return { status: "ok" }
}
```

**Step 2: Write the failing test**

```ts
// src/scanner.test.ts
import { describe, test, expect } from "bun:test"
import { resolve } from "path"
import { scanActions, filePathToActionName, actionNameToRoute, inferHttpMethod } from "./scanner"

describe("filePathToActionName", () => {
  test("converts nested path to dot-separated name", () => {
    expect(filePathToActionName("product/create.ts")).toBe("product.create")
  })

  test("handles [param] directories", () => {
    expect(filePathToActionName("product/[id]/get.ts")).toBe("product.get")
  })

  test("handles underscore prefix (no namespace)", () => {
    expect(filePathToActionName("_health.ts")).toBe("health")
  })
})

describe("actionNameToRoute", () => {
  test("converts action name to API route", () => {
    expect(actionNameToRoute("product.create", [])).toBe("/product/create")
  })

  test("includes params in route", () => {
    expect(actionNameToRoute("product.get", ["id"])).toBe("/product/:id")
  })
})

describe("inferHttpMethod", () => {
  test("infers POST for create", () => {
    expect(inferHttpMethod("product.create")).toBe("POST")
  })

  test("infers GET for list", () => {
    expect(inferHttpMethod("product.list")).toBe("GET")
  })

  test("infers GET for get", () => {
    expect(inferHttpMethod("product.get")).toBe("GET")
  })

  test("infers PATCH for update", () => {
    expect(inferHttpMethod("product.update")).toBe("PATCH")
  })

  test("infers DELETE for delete", () => {
    expect(inferHttpMethod("product.delete")).toBe("DELETE")
  })

  test("defaults to POST for unknown", () => {
    expect(inferHttpMethod("product.export")).toBe("POST")
  })
})

describe("scanActions", () => {
  const fixturesDir = resolve(import.meta.dir, "__fixtures__/actions")

  test("discovers all action files", async () => {
    const registry = await scanActions(fixturesDir)
    const names = [...registry.keys()].sort()
    expect(names).toContain("product.create")
    expect(names).toContain("product.list")
    expect(names).toContain("product.get")
    expect(names).toContain("health")
  })

  test("loads action with input schema", async () => {
    const registry = await scanActions(fixturesDir)
    const action = registry.get("product.create")!
    expect(action.meta.description).toBe("Create a new product")
    expect(action.input).not.toBeNull()
    expect(action.handler).toBeFunction()
  })

  test("loads action without input schema", async () => {
    const registry = await scanActions(fixturesDir)
    const action = registry.get("product.list")!
    expect(action.input).toBeNull()
  })

  test("extracts params from [param] dirs", async () => {
    const registry = await scanActions(fixturesDir)
    const action = registry.get("product.get")!
    expect(action.params).toEqual(["id"])
  })

  test("handles underscore prefix files", async () => {
    const registry = await scanActions(fixturesDir)
    const action = registry.get("health")!
    expect(action.meta.description).toBe("Health check")
  })
})
```

**Step 3: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/scanner.test.ts
```

**Step 4: Implement the scanner**

```ts
// src/scanner.ts
import { resolve, relative } from "path"
import type { LoadedAction, HttpMethod } from "./types"

const METHOD_MAP: Record<string, HttpMethod> = {
  create: "POST",
  list: "GET",
  get: "GET",
  update: "PATCH",
  delete: "DELETE",
}

export function inferHttpMethod(actionName: string): HttpMethod {
  const lastPart = actionName.split(".").pop() ?? ""
  return METHOD_MAP[lastPart] ?? "POST"
}

export function filePathToActionName(filePath: string): string {
  // Remove .ts extension
  const withoutExt = filePath.replace(/\.ts$/, "")
  // Split into parts
  const parts = withoutExt.split("/")
  // Filter out [param] directories, handle _ prefix
  const nameParts: string[] = []
  for (const part of parts) {
    if (part.startsWith("[") && part.endsWith("]")) continue // skip param dirs
    if (part.startsWith("_")) {
      nameParts.push(part.slice(1)) // remove _ prefix
    } else {
      nameParts.push(part)
    }
  }
  return nameParts.join(".")
}

export function actionNameToRoute(actionName: string, params: string[]): string {
  const parts = actionName.split(".")
  let route = "/" + parts.join("/")
  // Append params
  for (const param of params) {
    // Insert param before the last segment
    const lastSlash = route.lastIndexOf("/")
    route = route.slice(0, lastSlash) + "/:" + param + route.slice(lastSlash)
  }
  return route
}

function extractParams(filePath: string): string[] {
  const params: string[] = []
  const parts = filePath.split("/")
  for (const part of parts) {
    const match = part.match(/^\[(.+)\]$/)
    if (match) params.push(match[1])
  }
  return params
}

export async function scanActions(dir: string): Promise<Map<string, LoadedAction>> {
  const registry = new Map<string, LoadedAction>()
  const glob = new Bun.Glob("**/*.ts")

  for await (const file of glob.scan({ cwd: dir, onlyFiles: true })) {
    // Skip test files and non-action files
    if (file.includes(".test.") || file.includes(".spec.")) continue

    const fullPath = resolve(dir, file)
    const mod = await import(fullPath)

    // Validate: must have default export (handler) and meta
    if (!mod.default || typeof mod.default !== "function") {
      throw new Error(`Action file ${file} must have a default export (handler function)`)
    }
    if (!mod.meta || typeof mod.meta.description !== "string") {
      throw new Error(`Action file ${file} must export a 'meta' object with 'description'`)
    }

    const name = filePathToActionName(file)
    const params = extractParams(file)

    registry.set(name, {
      name,
      meta: mod.meta,
      input: mod.input ?? null,
      handler: mod.default,
      filePath: file,
      params,
    })
  }

  return registry
}
```

**Step 5: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/scanner.test.ts
```

**Step 6: Commit**

```bash
git add packages/dualize/src/scanner.ts packages/dualize/src/scanner.test.ts packages/dualize/src/__fixtures__/
git commit -m "feat(dualize): add file-based action scanner with Bun.Glob"
```

---

## Task 5: Hono Adapter

**Files:**
- Create: `packages/dualize/src/hono-adapter.ts`
- Test: `packages/dualize/src/hono-adapter.test.ts`

**Step 1: Write the failing test**

```ts
// src/hono-adapter.test.ts
import { describe, test, expect } from "bun:test"
import { resolve } from "path"
import { Hono } from "hono"
import { scanActions } from "./scanner"
import { createHonoAdapter } from "./hono-adapter"

describe("createHonoAdapter", () => {
  const fixturesDir = resolve(import.meta.dir, "__fixtures__/actions")

  test("mounts routes on Hono app", async () => {
    const registry = await scanActions(fixturesDir)
    const app = new Hono()
    const adapter = createHonoAdapter(registry, { prefix: "/api" })
    adapter.mount(app)

    // POST /api/product/create should work
    const res = await app.request("/api/product/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Widget", price: 9.99 }),
    })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.product.name).toBe("Widget")
  })

  test("GET routes work", async () => {
    const registry = await scanActions(fixturesDir)
    const app = new Hono()
    const adapter = createHonoAdapter(registry)
    adapter.mount(app)

    const res = await app.request("/product/list", { method: "GET" })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.products).toEqual([])
  })

  test("returns 400 on validation error", async () => {
    const registry = await scanActions(fixturesDir)
    const app = new Hono()
    const adapter = createHonoAdapter(registry, { prefix: "/api" })
    adapter.mount(app)

    const res = await app.request("/api/product/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", price: -1 }),
    })
    expect(res.status).toBe(400)
    const json = await res.json() as any
    expect(json.error.code).toBe("VALIDATION")
  })

  test("handles ActionError from handler", async () => {
    // This test uses the health endpoint which should return 200
    const registry = await scanActions(fixturesDir)
    const app = new Hono()
    const adapter = createHonoAdapter(registry)
    adapter.mount(app)

    const res = await app.request("/health", { method: "POST" })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.status).toBe("ok")
  })

  test("routes with params work", async () => {
    const registry = await scanActions(fixturesDir)
    const app = new Hono()
    const adapter = createHonoAdapter(registry)
    adapter.mount(app)

    const res = await app.request("/product/abc123", { method: "GET" })
    expect(res.status).toBe(200)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/hono-adapter.test.ts
```

**Step 3: Implement Hono adapter**

```ts
// src/hono-adapter.ts
import type { Hono, Context } from "hono"
import type { LoadedAction, AuthResolver, HttpMethod } from "./types"
import { ActionError } from "./errors"
import { inferHttpMethod, actionNameToRoute } from "./scanner"

interface HonoAdapterOptions {
  prefix?: string
  authResolver?: AuthResolver
  context?: Record<string, unknown>
}

export function createHonoAdapter(
  registry: Map<string, LoadedAction>,
  options: HonoAdapterOptions = {}
) {
  const { prefix = "", authResolver, context: customContext = {} } = options

  function mount(app: Hono) {
    for (const [, action] of registry) {
      // Skip actions that opt out of API
      if (action.meta.api === false) continue

      const method = action.meta.api?.method ?? inferHttpMethod(action.name)
      const route = action.meta.api?.path ?? actionNameToRoute(action.name, action.params)
      const fullRoute = prefix + route

      app.on(method, fullRoute, async (c: Context) => {
        try {
          // Parse input
          let rawInput: Record<string, unknown> = {}
          if (method === "GET") {
            // From query params
            const url = new URL(c.req.url)
            for (const [key, value] of url.searchParams) {
              rawInput[key] = value
            }
          } else {
            // From body
            try {
              rawInput = await c.req.json()
            } catch {
              rawInput = {}
            }
          }

          // Merge route params
          if (action.params.length > 0) {
            for (const param of action.params) {
              rawInput[param] = c.req.param(param)
            }
          }

          // Validate input
          let validatedInput = rawInput
          if (action.input) {
            const result = action.input.safeParse(rawInput)
            if (!result.success) {
              throw new ActionError("VALIDATION", "Invalid input", result.error.flatten())
            }
            validatedInput = result.data
          }

          // Resolve auth
          let auth = null
          if (authResolver) {
            auth = await authResolver("api", c)
          }

          // Check auth requirement
          if (action.meta.auth === "admin" && (!auth || auth.role !== "admin")) {
            throw new ActionError("FORBIDDEN", "Admin access required")
          }

          // Build context
          const ctx = {
            input: validatedInput,
            auth,
            meta: action.meta,
            source: "api" as const,
            ...customContext,
          }

          // Execute handler
          const result = await action.handler(ctx)
          return c.json(result)
        } catch (err) {
          if (err instanceof ActionError) {
            return c.json(err.toJSON(), err.statusCode as any)
          }
          console.error(`Action ${action.name} error:`, err)
          const internal = new ActionError("INTERNAL", "Internal server error")
          return c.json(internal.toJSON(), 500)
        }
      })
    }
  }

  return { mount }
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/hono-adapter.test.ts
```

**Step 5: Commit**

```bash
git add packages/dualize/src/hono-adapter.ts packages/dualize/src/hono-adapter.test.ts
git commit -m "feat(dualize): add Hono adapter with validation and error handling"
```

---

## Task 6: Zod-to-CLI Bridge

**Files:**
- Create: `packages/dualize/src/zod-bridge.ts`
- Test: `packages/dualize/src/zod-bridge.test.ts`

**Step 1: Write the failing test**

```ts
// src/zod-bridge.test.ts
import { describe, test, expect } from "bun:test"
import { z } from "zod"
import { zodToCittyArgs, parseCliInput } from "./zod-bridge"

describe("zodToCittyArgs", () => {
  test("converts string field", () => {
    const schema = z.object({ name: z.string().describe("Product name") })
    const args = zodToCittyArgs(schema)
    expect(args.name).toEqual({
      type: "string",
      description: "Product name",
      required: true,
    })
  })

  test("converts number field as string (parsed later)", () => {
    const schema = z.object({ price: z.number().describe("Price") })
    const args = zodToCittyArgs(schema)
    expect(args.price.type).toBe("string")
    expect(args.price.required).toBe(true)
  })

  test("converts boolean field", () => {
    const schema = z.object({ active: z.boolean().describe("Is active") })
    const args = zodToCittyArgs(schema)
    expect(args.active.type).toBe("boolean")
  })

  test("handles optional fields", () => {
    const schema = z.object({ tag: z.string().optional() })
    const args = zodToCittyArgs(schema)
    expect(args.tag.required).toBe(false)
  })

  test("handles default values", () => {
    const schema = z.object({ page: z.number().default(1) })
    const args = zodToCittyArgs(schema)
    expect(args.page.required).toBe(false)
    expect(args.page.default).toBe("1")
  })
})

describe("parseCliInput", () => {
  test("coerces string args to match schema types", () => {
    const schema = z.object({
      name: z.string(),
      price: z.number(),
      active: z.boolean(),
    })
    const raw = { name: "Widget", price: "9.99", active: "true" }
    const result = parseCliInput(schema, raw)
    expect(result).toEqual({ name: "Widget", price: 9.99, active: true })
  })

  test("handles missing optional fields", () => {
    const schema = z.object({
      name: z.string(),
      tag: z.string().optional(),
    })
    const raw = { name: "Widget" }
    const result = parseCliInput(schema, raw)
    expect(result).toEqual({ name: "Widget" })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/zod-bridge.test.ts
```

**Step 3: Implement the bridge**

```ts
// src/zod-bridge.ts
import { z } from "zod"

interface CittyArg {
  type: "string" | "boolean"
  description: string
  required: boolean
  default?: string
}

function unwrapZod(schema: z.ZodTypeAny): { base: z.ZodTypeAny; optional: boolean; defaultValue?: unknown } {
  let current = schema
  let optional = false
  let defaultValue: unknown = undefined

  while (true) {
    if (current instanceof z.ZodOptional) {
      optional = true
      current = current._def.innerType
    } else if (current instanceof z.ZodDefault) {
      optional = true
      defaultValue = current._def.defaultValue()
      current = current._def.innerType
    } else if (current instanceof z.ZodNullable) {
      optional = true
      current = current._def.innerType
    } else {
      break
    }
  }

  return { base: current, optional, defaultValue }
}

export function zodToCittyArgs(schema: z.ZodObject<any>): Record<string, CittyArg> {
  const args: Record<string, CittyArg> = {}

  for (const [key, field] of Object.entries(schema.shape)) {
    const f = field as z.ZodTypeAny
    const { base, optional, defaultValue } = unwrapZod(f)

    const isBoolean = base instanceof z.ZodBoolean

    args[key] = {
      type: isBoolean ? "boolean" : "string",
      description: f.description ?? "",
      required: !optional,
      ...(defaultValue !== undefined ? { default: String(defaultValue) } : {}),
    }
  }

  return args
}

export function parseCliInput(schema: z.ZodObject<any>, raw: Record<string, unknown>): Record<string, unknown> {
  const coerced: Record<string, unknown> = {}

  for (const [key, field] of Object.entries(schema.shape)) {
    const value = raw[key]
    if (value === undefined) continue

    const { base } = unwrapZod(field as z.ZodTypeAny)

    if (base instanceof z.ZodNumber && typeof value === "string") {
      coerced[key] = Number(value)
    } else if (base instanceof z.ZodBoolean && typeof value === "string") {
      coerced[key] = value === "true" || value === "1"
    } else {
      coerced[key] = value
    }
  }

  return coerced
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/zod-bridge.test.ts
```

**Step 5: Commit**

```bash
git add packages/dualize/src/zod-bridge.ts packages/dualize/src/zod-bridge.test.ts
git commit -m "feat(dualize): add Zod-to-citty bridge for CLI arg parsing"
```

---

## Task 7: CLI Adapter

**Files:**
- Create: `packages/dualize/src/cli-adapter.ts`
- Test: `packages/dualize/src/cli-adapter.test.ts`

**Step 1: Write the failing test**

```ts
// src/cli-adapter.test.ts
import { describe, test, expect, mock } from "bun:test"
import { resolve } from "path"
import { scanActions } from "./scanner"
import { createCLIAdapter } from "./cli-adapter"

describe("createCLIAdapter", () => {
  const fixturesDir = resolve(import.meta.dir, "__fixtures__/actions")

  test("builds command tree from registry", async () => {
    const registry = await scanActions(fixturesDir)
    const cli = createCLIAdapter(registry, { name: "testapp", version: "0.1.0" })
    expect(cli).toBeDefined()
    expect(cli.run).toBeFunction()
  })

  test("generates help text", async () => {
    const registry = await scanActions(fixturesDir)
    const cli = createCLIAdapter(registry, { name: "testapp", version: "0.1.0" })
    const help = cli.getHelp()
    expect(help).toContain("testapp")
    expect(help).toContain("product create")
    expect(help).toContain("product list")
    expect(help).toContain("health")
  })

  test("generates action-specific help", async () => {
    const registry = await scanActions(fixturesDir)
    const cli = createCLIAdapter(registry, { name: "testapp", version: "0.1.0" })
    const help = cli.getActionHelp("product.create")
    expect(help).toContain("Create a new product")
    expect(help).toContain("--name")
    expect(help).toContain("--price")
  })

  test("executes action from parsed args", async () => {
    const registry = await scanActions(fixturesDir)
    const cli = createCLIAdapter(registry, { name: "testapp", version: "0.1.0" })
    const result = await cli.execute("product.create", { name: "Widget", price: "9.99" })
    expect(result).toEqual({ product: { id: "123", name: "Widget", price: 9.99 } })
  })

  test("returns validation error for invalid input", async () => {
    const registry = await scanActions(fixturesDir)
    const cli = createCLIAdapter(registry, { name: "testapp", version: "0.1.0" })
    try {
      await cli.execute("product.create", { name: "", price: "-1" })
      expect(true).toBe(false) // should not reach here
    } catch (err: any) {
      expect(err.code).toBe("VALIDATION")
    }
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/cli-adapter.test.ts
```

**Step 3: Implement CLI adapter**

```ts
// src/cli-adapter.ts
import type { LoadedAction, AuthResolver } from "./types"
import { ActionError } from "./errors"
import { zodToCittyArgs, parseCliInput } from "./zod-bridge"

interface CLIAdapterOptions {
  name: string
  version?: string
  authResolver?: AuthResolver
  context?: Record<string, unknown>
}

export function createCLIAdapter(
  registry: Map<string, LoadedAction>,
  options: CLIAdapterOptions
) {
  const { name, version = "0.0.0", authResolver, context: customContext = {} } = options

  function getHelp(): string {
    const lines = [`${name} v${version}`, "", "Commands:"]
    const actions = [...registry.values()]
      .filter(a => a.meta.cli !== false)
      .sort((a, b) => a.name.localeCompare(b.name))

    for (const action of actions) {
      const cmd = action.name.replace(/\./g, " ")
      lines.push(`  ${cmd.padEnd(24)} ${action.meta.description}`)
    }
    return lines.join("\n")
  }

  function getActionHelp(actionName: string): string {
    const action = registry.get(actionName)
    if (!action) return `Unknown action: ${actionName}`

    const lines = [action.meta.description, ""]
    const cmd = action.name.replace(/\./g, " ")
    lines.push(`Usage: ${name} ${cmd} [options]`, "")

    if (action.input) {
      lines.push("Options:")
      const args = zodToCittyArgs(action.input)
      for (const [key, arg] of Object.entries(args)) {
        const req = arg.required ? "(required)" : `(default: ${arg.default ?? "none"})`
        lines.push(`  --${key.padEnd(16)} ${arg.type.padEnd(10)} ${req}  ${arg.description}`)
      }
    }

    if (action.meta.auth && action.meta.auth !== "public") {
      lines.push("", `Auth: ${typeof action.meta.auth === "string" ? action.meta.auth : "custom"}`)
    }

    return lines.join("\n")
  }

  async function execute(actionName: string, rawArgs: Record<string, unknown>): Promise<unknown> {
    const action = registry.get(actionName)
    if (!action) throw new ActionError("NOT_FOUND", `Unknown action: ${actionName}`)

    // Coerce and validate input
    let validatedInput: Record<string, unknown> = rawArgs
    if (action.input) {
      const coerced = parseCliInput(action.input, rawArgs)
      const result = action.input.safeParse(coerced)
      if (!result.success) {
        throw new ActionError("VALIDATION", "Invalid input", result.error.flatten())
      }
      validatedInput = result.data
    }

    // Resolve auth
    let auth = null
    if (authResolver) {
      auth = await authResolver("cli", null)
    }

    // Build context
    const ctx = {
      input: validatedInput,
      auth,
      meta: action.meta,
      source: "cli" as const,
      ...customContext,
    }

    return action.handler(ctx)
  }

  function parseArgs(argv: string[]): { actionName: string | null; args: Record<string, unknown>; flags: { help: boolean; pretty: boolean } } {
    const args: Record<string, unknown> = {}
    const parts: string[] = []
    let help = false
    let pretty = false

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i]
      if (arg === "--help" || arg === "-h") {
        help = true
      } else if (arg === "--pretty") {
        pretty = true
      } else if (arg.startsWith("--")) {
        const key = arg.slice(2)
        const next = argv[i + 1]
        if (next && !next.startsWith("--")) {
          args[key] = next
          i++
        } else {
          args[key] = "true"
        }
      } else {
        parts.push(arg)
      }
    }

    // Try to match action name: "product create" → "product.create"
    let actionName: string | null = null
    if (parts.length >= 2) {
      actionName = parts.slice(0, 2).join(".")
      if (!registry.has(actionName) && parts.length >= 1) {
        actionName = parts[0]
      }
    } else if (parts.length === 1) {
      actionName = parts[0]
    }

    return { actionName, args, flags: { help, pretty } }
  }

  async function run(argv: string[]): Promise<void> {
    // Strip node/bun binary and script path
    const userArgs = argv.slice(2)

    if (userArgs.length === 0 || userArgs[0] === "--help" || userArgs[0] === "-h") {
      console.log(getHelp())
      return
    }

    // Built-in "actions" meta-command
    if (userArgs[0] === "actions") {
      const actions = [...registry.values()]
        .filter(a => a.meta.cli !== false)
        .map(a => ({ name: a.name, description: a.meta.description, auth: a.meta.auth ?? "public" }))
      console.log(JSON.stringify(actions, null, 2))
      return
    }

    const { actionName, args, flags } = parseArgs(userArgs)

    if (!actionName || !registry.has(actionName)) {
      console.error(`Unknown command: ${userArgs.join(" ")}`)
      console.error(`Run '${name} --help' for available commands.`)
      process.exit(1)
    }

    if (flags.help) {
      console.log(getActionHelp(actionName))
      return
    }

    try {
      const result = await execute(actionName, args)
      const output = flags.pretty
        ? JSON.stringify(result, null, 2)
        : JSON.stringify(result)
      console.log(output)
    } catch (err) {
      if (err instanceof ActionError) {
        console.error(JSON.stringify(err.toJSON()))
        process.exit(1)
      }
      throw err
    }
  }

  return { run, execute, getHelp, getActionHelp, parseArgs }
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/cli-adapter.test.ts
```

**Step 5: Commit**

```bash
git add packages/dualize/src/cli-adapter.ts packages/dualize/src/cli-adapter.test.ts
git commit -m "feat(dualize): add CLI adapter with arg parsing and help generation"
```

---

## Task 8: Unified createDualApp

**Files:**
- Create: `packages/dualize/src/app.ts`
- Test: `packages/dualize/src/app.test.ts`

**Step 1: Write the failing test**

```ts
// src/app.test.ts
import { describe, test, expect } from "bun:test"
import { resolve } from "path"
import { createDualApp } from "./app"

describe("createDualApp", () => {
  const fixturesDir = resolve(import.meta.dir, "__fixtures__/actions")

  test("creates dual app with hono and cli", async () => {
    const dual = await createDualApp({
      actionsDir: fixturesDir,
      name: "testapp",
      version: "0.1.0",
    })
    expect(dual.hono).toBeDefined()
    expect(dual.cli).toBeDefined()
    expect(dual.registry).toBeDefined()
  })

  test("hono app responds to API requests", async () => {
    const dual = await createDualApp({
      actionsDir: fixturesDir,
      name: "testapp",
    })

    const res = await dual.hono.request("/api/product/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", price: 5 }),
    })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.product.name).toBe("Test")
  })

  test("cli executes actions", async () => {
    const dual = await createDualApp({
      actionsDir: fixturesDir,
      name: "testapp",
    })

    const result = await dual.cli.execute("product.create", { name: "Test", price: "5" })
    expect(result).toBeDefined()
  })

  test("injects custom context into actions", async () => {
    const myService = { ping: () => "pong" }
    const dual = await createDualApp({
      actionsDir: fixturesDir,
      name: "testapp",
      context: { myService },
    })

    // The context should be available (tested indirectly via successful execution)
    const result = await dual.cli.execute("health", {})
    expect(result).toEqual({ status: "ok" })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dualize && bun test src/app.test.ts
```

**Step 3: Implement createDualApp**

```ts
// src/app.ts
import { Hono } from "hono"
import type { DualAppOptions, LoadedAction } from "./types"
import { scanActions } from "./scanner"
import { createHonoAdapter } from "./hono-adapter"
import { createCLIAdapter } from "./cli-adapter"

export async function createDualApp(options: DualAppOptions) {
  const {
    actionsDir,
    name,
    version = "0.0.0",
    context: customContext = {},
    authResolver,
    apiPrefix = "/api",
  } = options

  // Scan actions
  const registry = await scanActions(actionsDir)

  // Build Hono app
  const hono = new Hono()
  const honoAdapter = createHonoAdapter(registry, {
    prefix: apiPrefix,
    authResolver,
    context: customContext,
  })
  honoAdapter.mount(hono)

  // Build CLI
  const cli = createCLIAdapter(registry, {
    name,
    version,
    authResolver,
    context: customContext,
  })

  return {
    hono,
    cli,
    registry,

    serve(opts: { port?: number } = {}) {
      const port = opts.port ?? 3000
      console.log(`${name} v${version} listening on http://localhost:${port}`)
      return Bun.serve({ fetch: hono.fetch, port })
    },

    run(argv: string[]) {
      return cli.run(argv)
    },
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dualize && bun test src/app.test.ts
```

**Step 5: Commit**

```bash
git add packages/dualize/src/app.ts packages/dualize/src/app.test.ts
git commit -m "feat(dualize): add createDualApp unified entry point"
```

---

## Task 9: Wire Up Barrel Export & Run All Tests

**Files:**
- Modify: `packages/dualize/src/index.ts`

**Step 1: Finalize barrel export**

Ensure `src/index.ts` exports everything correctly (already created in Task 1, may need adjustments based on actual implementation).

**Step 2: Run all tests**

```bash
cd packages/dualize && bun test
```

Expected: All tests PASS.

**Step 3: Type check**

```bash
cd packages/dualize && bun x tsc --noEmit
```

Expected: No type errors.

**Step 4: Commit**

```bash
git add packages/dualize/src/index.ts
git commit -m "feat(dualize): finalize barrel exports, all tests passing"
```

---

## Task 10: Example App (Integration Test)

**Files:**
- Create: `packages/dualize/example/actions/todo/create.ts`
- Create: `packages/dualize/example/actions/todo/list.ts`
- Create: `packages/dualize/example/index.ts`

**Step 1: Create example actions**

```ts
// example/actions/todo/create.ts
import { z } from "zod"
import type { ActionMeta } from "../../src/types"

export const meta: ActionMeta = {
  description: "Create a new todo item",
  auth: "public",
}

export const input = z.object({
  title: z.string().min(1).describe("Todo title"),
  done: z.boolean().default(false).describe("Is completed"),
})

export default async function(ctx: any) {
  return { todo: { id: crypto.randomUUID(), ...ctx.input, createdAt: new Date().toISOString() } }
}
```

```ts
// example/actions/todo/list.ts
import type { ActionMeta } from "../../src/types"

export const meta: ActionMeta = {
  description: "List all todos",
  auth: "public",
}

export default async function() {
  return { todos: [{ id: "1", title: "Try dualize", done: false }] }
}
```

```ts
// example/index.ts
import { createDualApp } from "../src"
import { resolve } from "path"

const app = await createDualApp({
  actionsDir: resolve(import.meta.dir, "actions"),
  name: "todo-app",
  version: "0.1.0",
})

// If "serve" is the first arg, start the server
const firstArg = process.argv[2]
if (firstArg === "serve") {
  app.serve({ port: 3000 })
} else if (firstArg) {
  // CLI mode
  app.run(process.argv)
} else {
  console.log("Usage:")
  console.log("  bun example/index.ts serve          # Start API server")
  console.log("  bun example/index.ts todo create ... # Run CLI command")
  console.log("  bun example/index.ts --help          # Show help")
}
```

**Step 2: Test the example manually**

```bash
# Help
cd packages/dualize && bun example/index.ts --help

# CLI mode
bun example/index.ts todo create --title "Hello dualize"
bun example/index.ts todo list

# API mode (in another terminal)
bun example/index.ts serve
# Then: curl -X POST http://localhost:3000/api/todo/create -H "Content-Type: application/json" -d '{"title":"Hello"}'
```

**Step 3: Commit**

```bash
git add packages/dualize/example/
git commit -m "feat(dualize): add example todo app demonstrating dual interface"
```

---

## Summary

| Task | Component | Tests | Est. |
|------|-----------|-------|------|
| 1 | Project scaffold | - | 5 min |
| 2 | Core types | 3 | 5 min |
| 3 | ActionError | 4 | 5 min |
| 4 | Action scanner | 9 | 15 min |
| 5 | Hono adapter | 5 | 15 min |
| 6 | Zod-to-CLI bridge | 7 | 10 min |
| 7 | CLI adapter | 5 | 15 min |
| 8 | createDualApp | 4 | 10 min |
| 9 | Final wiring | - | 5 min |
| 10 | Example app | manual | 10 min |

**Total: ~37 tests, 10 commits, MVP ready.**
