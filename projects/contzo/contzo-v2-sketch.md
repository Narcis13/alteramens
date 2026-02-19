---
status: sketch
type: strategy
version: v2 (agent-first pivot)
created: 2026-02-18
context: Sesiune strategie - pivotare de la dashboard SaaS la agent-first platform
next: brainstorming detaliat pe baza acestui document
---

# Contzo v2 - Agent-First Accounting Platform

## Teză

Contabilii independenți din România primesc GRATUIT un agent AI (Robun) care comunică pe WhatsApp/Telegram. Agentul devine valoros prin skills plătite care se conectează la platforma Contzo Cloud - un backend contabil care sincronizează automat date din ANAF și permite interogări și operațiuni prin conversație.

**Interfața principală NU e un dashboard. E o conversație.**

## De ce (context strategic)

- **OpenClaw/ClawdBot** a demonstrat adopția masivă a agenților AI prin messaging (145K+ GitHub stars)
- Contabilii deja folosesc WhatsApp pentru comunicare cu clienții
- Un dashboard React complex (Contzo v1: 10 faze, 49 planuri, 88 requirements) = over-engineering pentru problema reală
- Skill Era: agentul e gratuit (distribuție), skills-urile encodează judgment (valoare), platforma deține datele (moat)

## Ce se schimbă față de Contzo v1

| Aspect | v1 (dashboard SaaS) | v2 (agent-first) |
|--------|---------------------|-------------------|
| Interfață principală | React SPA complex | WhatsApp/Telegram via Robun |
| Frontend | Dashboard multi-client, shadcn/ui | Web minimal (onboarding + config) |
| AI | Modul intern (Claude SDK) | Robun extern + Skills |
| Messaging | Modul intern contabil-client | WhatsApp E canalul |
| Client portal | Feature dedicat | Clientul vorbește cu agentul |
| Complexitate | 10 faze, 49 planuri, ~15K LOC | Monorepo lean, incremental |
| Time to market | 10-12 săptămâni | ~8 săptămâni MVP |

## Arhitectura de ansamblu

```
┌─────────────────────────────────────────────────┐
│          CONTABIL (utilizator final)             │
│          WhatsApp / Telegram / Web              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              ROBUN (gratuit)                     │
│  AI Agent · Multi-channel · Memory · Skills     │
│  + Gmail integration · + Google Calendar        │
└──────────────────┬──────────────────────────────┘
                   │ folosește
┌──────────────────▼──────────────────────────────┐
│           CONTZO SKILLS (plătite)                │
│  declaratii · sold-cont · old · inregistrare    │
│  alerte · rapoarte · cartare-automata           │
└──────────┬───────────┬──────────────────────────┘
           │           │
      API calls    MCP tools
           │           │
           ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────────────┐
│  CONTZO API  │ │  FORMA   │ │   REPORTCRAFT    │
│  (Hono)      │ │          │ │                  │
│              │ │ validare │ │ template + JSON  │
│ ANAF OAuth2  │ │ CUI, CNP │ │ → PDF, Excel,   │
│ plan conturi │ │ facturi  │ │   HTML           │
│ tranzacții   │ │ date     │ │                  │
│ declarații   │ │          │ │                  │
└──────────────┘ └──────────┘ └──────────────────┘
     server        package       package
                  reutilizabil   reutilizabil
```

## Monorepo - structură

```
contzo/
├── packages/
│   ├── forma/                  @contzo/forma
│   │   ├── src/
│   │   │   ├── validators/     CUI, CNP, IBAN, cod fiscal
│   │   │   ├── fields/         tipuri de câmpuri
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── reportcraft/            @contzo/reportcraft
│   │   ├── src/
│   │   │   ├── engine/         combină template + data → output
│   │   │   ├── formats/        pdf, excel, html renderers
│   │   │   └── index.ts
│   │   ├── templates/          template-uri predefinite
│   │   │   ├── balanta-verificare.ts
│   │   │   ├── registru-casa.ts
│   │   │   ├── jurnal-incasari.ts
│   │   │   ├── situatie-old.ts
│   │   │   ├── fisa-sintetica.ts
│   │   │   └── factura.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── contzo-api/             @contzo/api (server principal)
│       ├── src/
│       │   ├── routes/         Hono route handlers
│       │   ├── anaf/           ANAF OAuth2 + sync engine
│       │   ├── skills/         endpoints consumate de Robun
│       │   ├── db/             schema + migrations (Drizzle)
│       │   └── index.ts
│       ├── tests/
│       └── package.json
│
├── apps/
│   └── landing/                contzo.ro (Astro)
│       ├── src/pages/
│       └── package.json
│
├── bun.workspace.ts
├── package.json
├── docker-compose.yml
└── CLAUDE.md
```

## Tech Stack

| Layer | Tehnologie | Motivare |
|-------|-----------|----------|
| Runtime | Bun | Consistent cu Robun, fast, native TS |
| API framework | Hono.js | Lightweight, typed, middleware ecosystem |
| Database | PostgreSQL | Relational data, robust, accounting needs ACID |
| ORM | Drizzle | Type-safe, lightweight, migrations |
| Validation | Zod | Shared cu Robun, schema-first |
| ANAF integration | OAuth2 + fast-xml-parser | UBL XML parsing, JWT signing |
| Report generation | @contzo/reportcraft | PDF via puppeteer/playwright, Excel via exceljs |
| Landing page | Astro | Static, fast, Cloudflare Pages |
| Deploy | Docker Compose | PostgreSQL + API |
| Packages | Bun workspaces | Monorepo management |

## Packages reutilizabile

### @contzo/forma
Librărie de validare pentru date românești și formulare contabile.
- Validatori: CUI, CNP, IBAN RO, cod fiscal, serie/nr factură
- Field types: text, number, date, select, currency (RON)
- Framework-agnostic, zero-dependency core
- Folosit intern de contzo-api, expus și ca MCP tool pentru agenți AI
- Publishable pe npm independent

### @contzo/reportcraft
Engine de generare rapoarte: template predefinit + date JSON → output formatat.
- Input: template ID + JSON data
- Output: PDF, Excel (.xlsx), HTML
- Templates contabile predefinite (balanță, jurnal, registru casă, situație old)
- Templates generice (factură, raport tabelar, fișă analitică)
- API simplă: `reportcraft.generate({ template, format, data })`
- Folosit intern de contzo-api, expus și ca MCP tool pentru agenți AI
- Publishable pe npm independent

## Data Model (minimal, entități core)

```
Tenant (firma de contabilitate)
  │
  ├── Client (firma client a contabilului)
  │     ├── CUI, denumire, tip (SRL/PFA/micro/...)
  │     ├── ANAF OAuth2 credentials
  │     └── regim fiscal (TVA/non-TVA, micro, etc.)
  │
  ├── ChartOfAccounts (plan de conturi)
  │     └── Account (cont contabil)
  │           ├── cod, denumire, tip (activ/pasiv/cheltuială/venit)
  │           └── standard RO preîncărcat + customizabil
  │
  ├── Transaction (înregistrare contabilă)
  │     ├── data, descriere, sumă
  │     ├── debit account → Account
  │     ├── credit account → Account
  │     ├── client → Client
  │     └── sursa (manual/anaf-sync/import)
  │
  ├── Invoice (factură - din ANAF sync)
  │     ├── tip (primită/emisă)
  │     ├── furnizor/client, CUI
  │     ├── total, TVA, data
  │     ├── status ANAF (validă/eroare/procesare)
  │     └── XML UBL raw (referință)
  │
  ├── Declaration (declarație fiscală)
  │     ├── tip (D300, D100, D112, D390, etc.)
  │     ├── client → Client
  │     ├── perioadă, termen limită
  │     └── status (pending/depusă/expirată)
  │
  └── FiscalCalendar (calendar fiscal)
        ├── tip declarație × tip firmă → termene
        └── pre-populat, actualizat anual
```

## Robun Integration

Robun (v1.0) se conectează la Contzo prin:

1. **Contzo Skills** - fișiere markdown în Robun care definesc capabilități contabile
2. **MCP Tools** - Forma și ReportCraft expuse ca MCP servers
3. **API Authentication** - Robun se autentifică la Contzo API cu token per contabil

### Skills planificate (MVP)

| Skill | Ce face | Endpoint Contzo |
|-------|---------|-----------------|
| `declaratii` | Ce declarații sunt de depus, termene, status | GET /skills/declarations |
| `sold-cont` | Sold curent pentru un cont și client | GET /skills/balance |
| `old` | Aged receivables/payables pentru un client | GET /skills/aging |
| `inregistrare` | Înregistrează tranzacție prin conversație | POST /skills/transaction |
| `raport` | Generează raport PDF/Excel | POST /skills/report |
| `alerte` | Configurează alerte proactive (termene) | POST /skills/alerts |

### Robun additions needed
- Gmail integration (trimite rapoarte pe email)
- Google Calendar integration (sincronizează termene declarații)

## Revenue Model

| Tier | Preț estimat | Include |
|------|-------------|---------|
| Free | 0 RON/lună | Robun agent + 1 client + skills de bază (declarații, sold) |
| Pro | ~80 RON/lună | Clienți nelimitați + ANAF sync + toate skills + alerte + rapoarte |
| Firmă | ~200 RON/lună | Multi-contabil + skills avansate + API access + suport prioritar |

**Target: 1K MRR = ~13 contabili Pro**

România: ~30.000 contabili independenți/firme mici. 13 = 0.04% penetrare.

## Portofoliu - decizii

| Proiect | Status | Relație cu Contzo |
|---------|--------|-------------------|
| Robun | FOCUS | Delivery channel, business box |
| Contzo | FOCUS | Prima verticală |
| Forma | ABSORBIT | → @contzo/forma package |
| ReportCraft | NOU | → @contzo/reportcraft package |
| BunBase | PARKED | Nu e pe critical path |
| DavidUp | PARKED | Piață diferită |
| Dualize | PARKED | Nice-to-have |
| CCT2 | PARKED | Experimental |
| WorkScript | PARKED | Legacy |

## Riscuri moștenite din v1

1. **ANAF OAuth2** - single-use refresh tokens, race conditions, USB token fizic
2. **ANAF API instability** - silent failures, 200 OK cu body gol
3. **XML UBL** - diferențe de rotunjire TVA (0.01 RON)
4. **Adopție** - contabilii sunt conservatori, trebuie demonstrat trust

## Riscuri noi v2

1. **Dependency pe Robun** - dacă agent-ul nu funcționează bine, totul cade
2. **WhatsApp Business API** - costuri și limitări la scale
3. **Skills UX** - conversația trebuie să fie naturală, nu CLI-like
4. **Data accuracy** - erori de înregistrare prin conversație pot fi costisitoare (contabilitatea nu tolerează erori)

## Sequencing estimativ

```
Săpt 1-3:   Contzo API (ANAF OAuth2 + sync + data model + DB)
Săpt 4-5:   @contzo/forma + @contzo/reportcraft (packages)
Săpt 6-7:   Contzo Skills + Robun integration
Săpt 8:     Landing page Astro + Web onboarding minimal
Săpt 9:     Gmail + Calendar în Robun
Săpt 10+:   Beta cu contabili reali
```

---

**Acest document este un sketch strategic. Următorul pas: brainstorming detaliat pentru fiecare componentă.**
