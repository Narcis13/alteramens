---
parent: "[[bunbase/bunbase|BunBase]]"
type: doc
---

# BunBase - Arhitectură

## Overview

BunBase este un BaaS single-binary care compilează cu `bun build --compile`. Totul este embedded: server HTTP, SQLite database, admin UI (React SSR inline), file storage.

## Schema-in-Database Pattern

Colecțiile (tabele) sunt definite la runtime, nu la compile time. Metadata colecțiilor și câmpurilor este stocată în tabele SQLite speciale. Când creezi o colecție prin admin UI, BunBase:

1. Creează tabela SQLite fizică
2. Salvează schema în tabela de metadata
3. Auto-generează endpoints REST (CRUD + list + search)
4. Aplică auth rules definite per colecție

## Module

| Modul | Responsabilitate |
|-------|-----------------|
| `core/` | Database layer, schema management, records CRUD, validation (Zod), hooks, query builder, expand (relations) |
| `api/` | HTTP server (Bun.serve), route matching, request context, auth endpoints, SSE |
| `auth/` | Admin/user management, JWT (jose), middleware, auth rules (null=admin, ''=public) |
| `storage/` | File upload/download, validation, cleanup hooks on delete |
| `realtime/` | SSE connection manager, topic subscriptions, permission-filtered broadcasting |
| `email/` | SMTP via Nodemailer, template system |
| `admin/` | React components for admin dashboard (inline, no separate build) |

## Key Patterns

- **Hook middleware** - PocketBase-style: `beforeCreate`, `afterCreate`, `beforeUpdate`, etc. Cancellable.
- **Auth rules** - Per-collection: `null` = admin only, `''` = public, expression string = custom rule
- **Token rotation** - On JWT refresh, old token is immediately revoked
- **Expand** - Relation fields can be expanded in API responses (like PocketBase `?expand=field`)
- **Custom routes** - User-defined routes merged alongside system routes

## Deploy

```bash
bun run build     # → bunbase binary (~60MB)
./bunbase --port 8090 --db app.db
```

Single file, zero runtime dependencies, portable.
