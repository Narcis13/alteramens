---
status: planning
type: saas
repo: https://github.com/Narcis13/contzo
stack: Bun, Hono.js, React 19, PostgreSQL, Drizzle ORM, Claude Agent SDK
version: v0.0 (pre-implementation)
tags: [saas, b2b, accounting, romania, anaf, e-factura, ai]
created: 2026-02-09
updated: 2026-02-15
---

# Contzo

**SaaS pentru firme de contabilitate din Romania - management e-Factura cu AI agent.**

## Ce este

Contzo este o aplicație web B2B pentru contabili români care gestionează facturarea electronică (e-Factura) pentru clienții lor. Centralizează managementul mai multor clienți într-un singur dashboard și include un agent AI (Claude) care asistă cu rezolvarea erorilor ANAF.

**Target:** Firme de contabilitate (1-5 contabili) cu 10-100 clienți.

## Value Proposition

- **Multi-client e-Factura management** - toate firmele clienților într-un singur loc
- **AI agent** cu context awareness - explică erori ANAF, asistă validare facturi
- **Client portal** - clienții contabilului pot vedea status facturi și upload documente
- **Mesagerie internă** - înlocuiește WhatsApp/email ad-hoc

## Diferentiatori vs Competiție

SmartBill, Oblio, Cassa.ro, Facturis nu au:
- AI chat agent cu context (niciun competitor român nu are asta)
- Management multi-client dintr-un dashboard
- Portal self-service pentru clienții firmei de contabilitate
- Mesagerie integrată contabil-client

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun 1.3.9 |
| API | Hono.js 4.11.x |
| Frontend | React 19, TanStack Router/Query/Table, shadcn/ui, Tailwind 4 |
| Database | PostgreSQL 17 + pgvector |
| ORM | Drizzle 0.45.x |
| AI | Claude Agent SDK 0.2.37 (pinned) |
| Storage | MinIO (S3-compatible) |
| ANAF | OAuth2 + jose (RS512 JWT) + fast-xml-parser (UBL) |
| Deploy | Docker Compose (5 services) + Nginx |
| Marketing | Astro 5.x pe Cloudflare Pages |

## Arhitectură

**Modular monolith** - un singur proces Bun.js/Hono.js + cron worker separat.

```
contzo.com (Cloudflare Pages)     app.contzo.com (Docker)
├── Marketing site (Astro)        ├── React 19 SPA
├── Blog (MDX)                    ├── Dashboard, Invoices
└── Waitlist API                  └── Settings

api.contzo.com (Docker)
├── Auth Module (JWT, RBAC)
├── Client Module (CRUD, CUI lookup)
├── ANAF Integration (OAuth2, retry, rate limit)
├── Invoice Module (upload, validate, status)
├── AI Agent Module (Claude SDK, MCP, SSE)
├── Document Module (MinIO, versioning)
├── Messaging Module (threaded, attachments)
└── Notification Module (priority-based)
```

## Stare Curentă

- **0% implementare** - doar documentație de planificare (~200KB markdown)
- Phase 1 of 10, Plan 0 of 49
- 88 requirements total
- Estimare: 55-60 sesiuni, 15K-20K LOC, 10-12 săptămâni

## Roadmap (10 Faze)

| Faza | Nume | Plans | Depinde de |
|------|------|-------|------------|
| 1 | Foundation & Auth | 6 | - |
| 2 | Client Management | 4 | Faza 1 |
| 3 | ANAF Integration | 5 | Faza 2 |
| 4 | Invoice Management | 7 | Faza 3 |
| 5 | Document Management | 4 | Faza 1 |
| 6 | AI Agent | 6 | Faze 3, 4 |
| 7 | Messaging | 5 | Faza 5 |
| 8 | Client Portal | 4 | Faze 4, 5, 7 |
| 9 | Notifications | 3 | Faze 3, 4 |
| 10 | UI Polish | 5 | Faze 1-9 |

## Riscuri Critice

1. **ANAF OAuth2 race condition** - single-use refresh tokens cu "family" parameter
2. **ANAF API instability** - silent failures, 200 OK cu body gol
3. **XML UBL rounding** - diferențe TVA de 0.01 RON cauzează rejecții
4. **Claude API costs** - fără prompt caching, costuri de $450+/lună
5. **USB token re-auth** - token fizic necesar pentru OAuth inițial

## Legături

- [[contzo/docs/architecture|Arhitectură detaliată]]
- [[contzo/decisions/decisions|Log decizii]]
- [[contzo/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Start Phase 1: Scaffolding monorepo + Docker Compose
- [ ] Setup Bun + Hono.js + PostgreSQL + Drizzle
- [ ] Auth module (JWT, RBAC, httpOnly cookies)
- [ ] Marketing site (Astro pe Cloudflare Pages) - parallel cu app
