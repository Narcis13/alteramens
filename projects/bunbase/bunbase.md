---
status: active
type: devtools
repo: https://github.com/Narcis13/bunbase
stack: Bun, TypeScript, SQLite, React, Tailwind CSS v4, shadcn/ui
version: v0.3
tags: [saas, devtools, baas, open-source]
created: 2026-01-24
updated: 2026-02-15
---

# BunBase

**PocketBase-like Backend-as-a-Service built with Bun runtime.**

## Ce este

BunBase este un BaaS (Backend-as-a-Service) care compilează într-un **singur binar executabil** (~60MB). Oferă API REST auto-generat, admin UI, autentificare JWT, real-time SSE, file storage și hook system - totul powered by Bun și SQLite.

Inspirat de PocketBase, dar scris de la zero în TypeScript cu Bun runtime.

## Value Proposition

- **Zero config backend** - un singur binar, un singur fișier SQLite
- **Developer-friendly** - schema-in-database, API auto-generat, admin UI built-in
- **Extensibil** - hook system (before/after CRUD), custom routes, middleware
- **Performant** - Bun runtime + SQLite = fast & lightweight

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun (compile to single binary) |
| Database | bun:sqlite (SQLite embedded) |
| Frontend | React + Tailwind CSS v4 + shadcn/ui |
| Auth | JWT (jose) + argon2 |
| Validation | Zod |
| Email | Nodemailer |
| Real-time | SSE (Server-Sent Events) |

## Arhitectură

```
src/
├── api/        # HTTP server, routes, auth endpoints, realtime
├── auth/       # Admin/user CRUD, JWT, middleware, rules
├── core/       # Database, schema, records, validation, hooks, query
├── email/      # SMTP configuration, email sending, templates
├── storage/    # File uploads, validation, cleanup hooks
├── realtime/   # SSE manager, topics, broadcasting
├── admin/      # React admin UI components
└── cli.ts      # CLI entry point
```

## Stare Curentă

- **~20,300 linii TypeScript**
- **470 teste automate**
- **v0.2 shipped** (API, Auth, Admin UI, Hooks, SSE, Storage)
- **v0.3 complete** (Custom Routes system - 17 faze livrate)
- Schema-in-database pattern (collections definite la runtime)
- nanoid pentru IDs

## Cum se folosește

```bash
bun run build        # produce binary `bunbase` (~60MB)
./bunbase --port 8090 --db app.db
# Admin: http://localhost:8090/_/
```

## Legături

- [[bunbase/docs/architecture|Arhitectură detaliată]]
- [[bunbase/decisions/decisions|Log decizii]]
- [[bunbase/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Definire v0.4 milestone
- [ ] Fix test isolation issues (4 teste fail la parallel execution)
- [ ] Documentație publică / README complet
- [ ] Publicare npm / binary release
