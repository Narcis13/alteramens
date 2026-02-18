---
status: active
type: devtools
repo: https://github.com/Narcis13/robun.git
stack: Bun, TypeScript, Hono, grammy, Zod, pino, MCP SDK
version: v1.0.0
tags: [ai-agent, devtools, telegram, discord, multi-channel, mcp]
created: 2026-02-18
updated: 2026-02-18
---

# Robun

**Personal AI agent framework - conectează LLM-uri la canale de mesagerie cu tools, memorie și skill-uri.**

## Ce este

Robun este un framework de AI agent care rulează pe Bun. Conectează modele LLM (Claude, GPT, Gemini, etc.) la multiple canale de comunicare (Telegram, Discord, WhatsApp, Slack, Email, etc.) și le dă acces la tools (filesystem, shell, web, MCP), memorie persistentă și un sistem de skill-uri extensibil.

Migrat din Python, rescris complet în TypeScript.

## Value Proposition

- **Multi-channel** - un singur agent, 9 canale (Telegram, Discord, WhatsApp, Slack, Email, Feishu, DingTalk, QQ, Mochat)
- **Multi-provider** - 14 LLM providers (Anthropic, OpenAI, Google, Groq, DeepSeek, OpenRouter, etc.)
- **Tool system** - filesystem, shell, web search/fetch, message, spawn subagents, cron scheduling
- **MCP integration** - orice MCP server devine tool disponibil agentului
- **Memorie persistentă** - MEMORY.md (long-term) + HISTORY.md (event log) + session JSONL
- **Skill system** - markdown-based skills cu frontmatter, extensibil
- **Workspace identity** - AGENTS.md, SOUL.md, USER.md configurează personalitatea fără cod

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Language | TypeScript (strict) |
| HTTP | Hono v4 |
| Validation | Zod + zod-to-json-schema |
| Telegram | grammy |
| Discord | Custom WebSocket |
| WhatsApp | @whiskeysockets/baileys |
| Slack | @slack/socket-mode |
| Email | imapflow + nodemailer |
| MCP | @modelcontextprotocol/sdk |
| Web scraping | @mozilla/readability + linkedom |
| Logging | pino |
| Linting | Biome |
| Deploy | Docker (Alpine + Bun) |

## Arhitectură

```
src/
├── agent/       # AgentLoop, ContextBuilder, MemoryStore, SkillsLoader, SubagentManager
├── bus/         # MessageBus (pub/sub) - inbound queue + outbound dispatcher
├── channels/    # 9 channel adapters (Telegram, Discord, WhatsApp, Slack, Email, etc.)
├── providers/   # LLM providers (MultiProvider pentru OpenAI-compatible, CodexProvider)
├── tools/       # ToolRegistry + tools (filesystem, shell, web, message, spawn, cron, mcp)
├── skills/      # Markdown-based skills (cron, github, memory, summarize, tmux, weather)
├── config/      # Zod schema + loader cu env var override
├── session/     # JSONL session persistence per channel:chatId
├── cron/        # CronService - JSON store scheduler (at/every/cron-expr)
├── heartbeat/   # HeartbeatService - periodic HEARTBEAT.md check (30min)
├── cli.ts       # CLI command handlers (chat, gateway, onboard, etc.)
├── server.ts    # Hono HTTP gateway
└── index.ts     # Entry point
```

## Key Patterns

- **Message Bus** - canale push InboundMessage, AgentLoop consume, agent push OutboundMessage, canale primesc
- **Agent Loop** - standard agentic loop cu tool calling (max 20 iterații)
- **Tool Registry** - Zod validation pe params, tools registered ca Map
- **Provider fallback** - direct API key → gateway (OpenRouter, AiHubMix)
- **Workspace files** - AGENTS.md, SOUL.md, USER.md injectate în system prompt
- **Two-layer memory** - MEMORY.md (always in context) + HISTORY.md (searchable)
- **Dynamic channel loading** - doar canalele enabled sunt importate
- **Subagent spawning** - fire-and-forget background tasks cu tool registry izolat

## Stare Curentă

- **v1.0.0** - feature-complete initial release
- Repo proaspăt (3 commits, 18 feb 2026)
- Migrat din Python → TypeScript/Bun
- 4 fișiere de teste (unit + integration)
- Documentație completă (README + NANOBOT_TS_GUIDE 32KB + PROVIDER_GUIDE)
- Docker-ready (port 18790)
- CLI: `robun chat`, `robun gateway`, `robun onboard`

## Cum se folosește

```bash
cd ~/projects/robun
bun install
bun run dev          # CLI interactive mode
bun run gateway      # HTTP gateway mode (port 18790)
bun run onboard      # Setup wizard
```

## Legături

- [[robun/docs/architecture|Arhitectură detaliată]]
- [[robun/decisions/decisions|Log decizii]]
- [[robun/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Configurare și test pe Telegram personal
- [ ] Definire skills custom pentru workflow-ul Alteramens
- [ ] Integrare cu BunBase ca backend pentru persistence?
- [ ] Explorare MCP servers utile
