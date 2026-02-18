---
parent: "[[robun/robun|Robun]]"
type: learnings
---

# Robun - Ce am învățat

## Technical

- jsonrepair e essential pentru cheap LLMs care produc JSON malformat în tool calls
- Bun runtime permite TypeScript direct fără build step, dar trebuie atenție la node:* compatibility
- Dynamic import() pentru channels reduce startup time semnificativ (nu se încarcă baileys/grammy dacă nu sunt needed)
- JSONL per session e simplu dar rewrite-ul complet la fiecare save poate fi bottleneck la sesiuni mari
- Memory consolidation (sumarizare la >50 msgs) e critică pentru a menține context window manageable

## Architecture

- MessageBus pattern decuplează complet channels de agent loop - adăugarea unui nou channel nu afectează nimic
- Workspace files (SOUL.md, USER.md) permit personalizare profundă fără a atinge codul
- MCP integration transformă orice MCP server în tools disponibile - extensibilitate practică nelimitată
- Subagent spawning cu tool registry izolat previne side effects (fără message/spawn/cron tools)

## Process

- Migrarea Python → TypeScript a fost făcută wholesale (1 commit initial), nu incremental
- Documentația extensivă (32KB guide) a fost scrisă odată cu codul - bun pattern pentru proiecte complexe
- Skills system adaptat din OpenClaw - reutilizare open source inteligentă
