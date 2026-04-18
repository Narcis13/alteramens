---
status: active
type: devtools
repo: https://github.com/Narcis13/docraftr
stack: Bun, TypeScript, Hono, SQLite, Drizzle ORM, Zod, Loom UI
version: v0.1.0
tags: [devtools, document-engine, forms, reports, schema-driven, romanian, invoice, agent-tools, dual-interface]
license: MIT
created: 2026-04-04
updated: 2026-04-18
---

# docraftr

**Schema-driven document engine pentru reports, forms și hybrid documents, cu rendering Loom UI.**

## Ce este

docraftr transformă definiții JSON de documente în HTML complet randat folosind design system-ul Loom UI. Suportă trei tipuri de documente: **reports** (read-only, ex: facturi), **forms** (interactive, ex: formulare de contact) și **hybrids** (mix read/input). Gândit cu documente business românești în minte — include componente specializate pentru facturi, company blocks, validare CUI/CNP, IBAN.

```
JSON Definition  →  docraftr engine  →  Loom UI HTML
                         |
                  +----- + -----+
                  |             |
              HTTP (Hono)    CLI (Bun)
```

## Ce NU este

- Nu e WYSIWYG builder — documentele sunt definite ca JSON, nu prin UI
- Nu e PDF generator direct — output-ul principal e HTML (PDF e downstream)
- Nu e headless form library — livrează stiluri prin Loom UI embedded
- Nu e template engine generic — scop îngust: documente business cu contract strict

## Value Proposition

- **Single source of truth** — o definiție JSON, randată identic prin HTTP și CLI
- **Dual interface** — fiecare action e simultan HTTP endpoint (Hono) și CLI command
- **Agent-ready** — toolkit dedicat pentru Claude (`createDocraftrTools()`) + prompts pentru generare documente
- **Romanian-first** — CUI, CNP, IBAN cu checksum validation; invoice + company blocks native
- **Multi-tenant by default** — fiecare query DB e scoped pe `tenantId`
- **Condition system** — `skip_when` / `visible_when` / `required_when` cu AND/OR recursiv
- **Data binding** — dot-notation paths (`"invoice.lines.0.total"`) rezolvate automat
- **Schema-driven** — Zod validation la fiecare nivel (action, component, document)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun (TypeScript strict, ESNext) |
| HTTP | Hono |
| Database | SQLite + Drizzle ORM |
| Validation | Zod |
| UI | Loom UI (vendored în `vendor/loom/`) |
| Testing | Bun test runner |

## Arhitectura

Layer stack strict — fiecare layer depinde doar de cele inferioare:

```
bin/docraftr.ts (CLI entry)
        │
  ┌─────┼──────┬────────┬────────┬──────┐
  ▼     ▼      ▼        ▼        ▼      ▼
 DUAL ACTIONS SERVICES AGENT    DB
 (Hono+CLI)  (business)(Claude) (SQLite)
  │     │      │
  └─────┴──────┤
               ▼
           ENGINE (rendering pipeline)
               │
        ┌──────┼──────────┐
        ▼      ▼          ▼
   COMPONENTS LOOM   VALIDATORS
   (70+ types) (CSS/JS) (CUI/CNP/IBAN)
        │
        ▼
      CORE (types, schemas, registry)
```

## Layere

| # | Layer | Scop |
|---|-------|------|
| 1 | `core/` | Browser-safe primitives: types, Zod schemas, component registry, condition evaluator |
| 2 | `components/` | 70+ `ComponentTypeDefinition` (read-only + interactive/input) |
| 3 | `engine/` | `renderDocument()` — iterează sections, evaluează conditions, resolve bindings |
| 4 | `loom/` | Loom UI asset loader + theme token mapper (CSS custom properties) |
| 5 | `db/` | Drizzle + SQLite: `docraftrTemplates`, `docraftrSubmissions`, `docraftrRenders` |
| 6 | `services/` | CRUD business logic, tenant-scoped |
| 7 | `actions/` | `defineAction(meta, zodSchema, handler)` — unified endpoint definitions |
| 8 | `dual/` | Hono adapter + CLI adapter dintr-o singură sursă |
| 9 | `agent/` | API client, Claude tool definitions, document generation prompts |
| 10 | `validators/` | Romanian business identifiers cu checksum |

## Document Definition

```typescript
interface DocumentDefinition {
  id: string
  version: number
  title: string
  kind: 'report' | 'form' | 'hybrid'
  theme?: DocumentTheme
  sections: DocumentSection[]
  settings?: DocumentSettings
}
```

Sections conțin components cu `mode: 'read' | 'input'`, `bind` pentru data paths, `visible_when` / `required_when` conditions.

## CLI Reference

```bash
bun run bin/docraftr.ts serve --port=3003 --db=docraftr.db --tenant=default
bun run bin/docraftr.ts template.list
bun run bin/docraftr.ts render.render --json '{"definition": {...}, "data": {...}}'
```

Format dual adapter: `action:subaction key=value`.

## Stare Curentă

- **v0.1.0 alpha** — 8 commits, init în 2026-04-04
- Engine de rendering funcțional (reports + forms + hybrids)
- 70+ componente înregistrate
- Agent toolkit + reference templates
- Showcase: `showcase-report.html` (226KB) + `showcase-form.json` demonstrează capabilități
- Loom UI vendored — zero runtime dependency pe assets externe

## Interconexiuni Alteramens

- **Loom UI** — dependință directă (vendored). docraftr e primul consumer real al Loom.
- **Forma** — validatorii CUI/CNP din Forma au același scop; potențial merge sau shared package.
- **Contzo** — documente business românești (facturi, contracte) sunt exact target-ul docraftr; candidat imediat pentru integrare.
- **Dualize** — docraftr implementează deja pattern-ul dual HTTP+CLI; Dualize ar putea extrage abstracția.
- **Agent toolkit** — modelul `createDocraftrTools()` poate deveni pattern pentru alte proiecte Alteramens ca agent-native tools.

## Filtru Fundament

- **Skill Era?** Da — documentele sunt encoded judgment (ce secțiuni, ce validări, ce conditions). Agent toolkit-ul face docraftr invocabil direct din Claude.
- **Specific Knowledge?** Da — Romanian business docs, invoice patterns, CUI/CNP validation — nișă cu barieră de intrare.
- **Leverage?** Da — o definiție JSON → HTTP + CLI + agent, multiplicator 3x pe fiecare feature.
- **Compound?** Da — fiecare componentă adăugată e disponibilă tuturor documentelor existente.

## Legături

- [[docraftr/docs/architecture|Arhitectură detaliată]]
- [[docraftr/decisions/decisions|Log decizii]]
- [[docraftr/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] PDF rendering downstream (puppeteer / playwright)
- [ ] Integrare directă cu Contzo (facturi românești din workflow contabil)
- [ ] Publicare npm package (`docraftr`)
- [ ] Template marketplace / reference library extinsă
- [ ] Agent skill pentru generare documente din prompt natural
- [ ] Consolidare validators cu Forma (shared Romanian validators package)
