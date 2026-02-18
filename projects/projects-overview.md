---
type: index
updated: 2026-02-18
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

## Clasificare

### Per Tip
- **DevTools:** [[bunbase/bunbase|BunBase]], [[forma-mono/forma-mono|Forma]], [[robun/robun|Robun]]
- **SaaS:** [[davidup/davidup|DavidUp]], [[contzo/contzo|Contzo]]
- **Digital Product:** [[cct2/cct2|CCT2]]

### Per Maturitate
- **Active development:** BunBase (v0.3), DavidUp (v0.2), Robun (v1.0)
- **Planning:** Contzo (0% code, 200KB docs)
- **Prototype/MVP:** Forma (v0.1, 1 day old), CCT2 (2 commits)

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

## Legături Rapide

- [[../CLAUDE|CLAUDE.md - Framework colaborare]]
- [[workscript/workscript|WorkScript]] (proiect existent)
