---
parent: "[[dualize/dualize|Dualize]]"
type: decisions
---

# Dualize - Decizii

| Decizie | Ratiune | Outcome |
|---------|---------|---------|
| Convention-over-config (file path = route) | Elimina boilerplate, pattern familiar (Next.js, Hono file routes) | Pending |
| Bun.Glob pentru scanning | Native Bun API, rapid, simplu - fara dependente extra | Pending |
| Eager scan la startup (fail-fast) | Detecteaza erori la init, nu la prima cerere - DX mai bun | Pending |
| Zod pentru tot (validation, CLI args, help, OpenAPI) | Un singur schema = 4 outputs, DRY maxim | Pending |
| Hono ca peer dependency | Nu forteaza versiune specifica, consumatorii aleg | Pending |
| citty (UnJS) pentru CLI parsing | Lightweight, TypeScript native, fara magic | Pending |
| JSON output default in CLI | Machine-readable = AI agent friendly, `--pretty` pentru humans | Pending |
| ActionError cu error codes | Uniform error handling cross-transport, status mapping automat | Pending |
| Auth resolvers ca interfata comuna | Acelasi AuthContext indiferent de source (JWT header vs local token) | Pending |
| HTTP method inference din action name | `create`→POST, `list`→GET e intuitiv, override disponibil cand trebuie | Pending |
| `[param]` dirs pentru route params | Pattern familiar din Next.js/file-based routing | Pending |
| `_prefix` pentru no-namespace actions | `_health.ts` → `health` (nu `_.health`), simplu | Pending |
| Monorepo structure (`packages/dualize/`) | Permite development alaturi de alte proiecte, easy npm publish | Pending |
| TDD implementation plan (37 teste) | Fiecare componenta testata inainte de integrare | Pending |
| DI prin config object | Simplu, type-safe, fara container complex | Pending |
