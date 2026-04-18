---
type: index
updated: 2026-04-18
---

# Portofoliu Proiecte

Overview-ul tuturor proiectelor active din Alteramens.

## Proiecte Active

| Proiect | Tip | Status | Stack | Versiune |
|---------|-----|--------|-------|----------|
| [[bunbase/bunbase\|BunBase]] | DevTools/BaaS | Active (v0.3) | Bun, SQLite, React | 20K+ LOC |
| [[davidup/davidup\|DavidUp/GameMotion]] | SaaS/Video | Active (v0.2) | Bun, Hono, Canvas, FFmpeg | 10K LOC |
| [[contzo/contzo\|Contzo]] | SaaS/B2B | Planning (0%) | Bun, Hono, React 19, PostgreSQL | Docs only |
| [[forma-mono/forma-mono\|Forma]] | DevTools/Library | Prototype (v0.1) | Bun, TypeScript, Hono | MVP |
| [[cct2/cct2\|CCT2]] | Digital Product | Prototype | Next.js, Remotion | 2 commits |
| [[robun/robun\|Robun]] | DevTools/AI Agent | Active (v1.0) | Bun, Hono, grammy, MCP SDK | v1.0.0 |
| [[dualize/dualize\|Dualize]] | DevTools/Library | Active (v0.1) | Bun, Hono, Zod, citty | Design + Plan ready |
| [[glyphrail/glyphrail\|Glyphrail]] | DevTools/Workflow | Active (v0.1) | Bun, TypeScript | MVP Slice 6 |
| [[loom-ui/loom-ui\|Loom UI]] | DevTools/UI Framework | Active (v0.1) | Bun, TypeScript, HTML/CSS | Spec + partial impl |
| [[docraftr/docraftr\|docraftr]] | DevTools/Document Engine | Active (v0.1 alpha) | Bun, Hono, SQLite, Drizzle, Zod, Loom UI | 10-layer arch |
| [[takt/takt\|Takt]] | SaaS/Kanban | Active (v0.1) | Bun, Hono, React 19, SQLite, Nanoid | CLI + Web, event-driven |

## Clasificare

### Per Tip
- **DevTools:** [[bunbase/bunbase|BunBase]], [[forma-mono/forma-mono|Forma]], [[robun/robun|Robun]], [[dualize/dualize|Dualize]], [[glyphrail/glyphrail|Glyphrail]], [[loom-ui/loom-ui|Loom UI]], [[docraftr/docraftr|docraftr]]
- **SaaS:** [[davidup/davidup|DavidUp]], [[contzo/contzo|Contzo]], [[takt/takt|Takt]]
- **Digital Product:** [[cct2/cct2|CCT2]]

### Per Maturitate
- **Active development:** BunBase (v0.3), DavidUp (v0.2), Robun (v1.0), Glyphrail (v0.1 MVP Slice 6), docraftr (v0.1 alpha), Takt (v0.1)
- **Planning:** Contzo (0% code, 200KB docs)
- **Ready to build:** [[dualize/dualize|Dualize]] (design + TDD implementation plan, 37 tests planned)
- **Prototype/MVP:** Forma (v0.1), CCT2 (2 commits), Loom UI (spec complet + partial impl)

### Per Revenue Potential
- **High (B2B SaaS):** Contzo - contabili romani, pain real, piata definita
- **Medium (API/Tool):** DavidUp - video API, Forma - agent forms
- **Medium (AI Infra):** Robun - personal AI agent framework, multi-channel
- **Experimental:** BunBase (open-source BaaS), CCT2 (subliminal videos)

## Tech Stack Comun

Toate proiectele folosesc **Bun** ca runtime (excepție: CCT2 pe Next.js/Node). TypeScript everywhere. Hono.js preferat pentru API-uri noi.

## Interconexiuni

- **Forma** a fost creat cu gândul la **Contzo** (format validators pentru CUI, CNP românești)
- **BunBase** poate servi ca backend rapid pentru prototipuri viitoare
- **Robun** poate folosi **BunBase** ca persistence backend; ambele share Bun + Hono + Zod stack
- **Robun** poate automatiza workflow-uri Alteramens via Telegram/Discord + MCP tools
- Experiența din **DavidUp** (Hono + Zod + API design) se aplică direct la **Contzo**
- **Dualize** va fi folosit în toate proiectele Bun+Hono pentru dual API+CLI interface
- **Glyphrail** poate fi folosit de **Robun** pentru workflow orchestration cu bounded agent steps
- **Loom UI** va fi folosit în proiectele cu UI (DavidUp, Contzo, BunBase) pentru componente agent-generabile
- **Glyphrail** și **Loom UI** au ambele "agent-native CLI" ca design constraint — pattern comun cu restul Alteramens
- **docraftr** e primul consumer real al **Loom UI** (vendored); împarte domeniul "Romanian business" cu **Forma** (validatori CUI/CNP) și cu **Contzo** (facturi); implementează deja pattern-ul dual HTTP+CLI pe care îl abstractizează **Dualize**
- **Takt** partajează repo-ul cu framework-ul BRN (autonomous coding agent) — takt e testbed-ul; împarte stack-ul Bun+Hono+SQLite cu **BunBase** (potențial backend) și **docraftr**; candidat pentru integrare cu **Robun** (Telegram → create card)

## Legături Rapide

- [[../CLAUDE|CLAUDE.md - Framework colaborare]]
- [[workscript/workscript|WorkScript]] (proiect existent)
