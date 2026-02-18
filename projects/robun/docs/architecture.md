---
parent: "[[robun/robun|Robun]]"
type: doc
---

# Robun - Arhitectură

## Overview

Robun este un AI agent framework single-process. Un MessageBus central conectează canalele de mesagerie cu AgentLoop-ul. Totul rulează pe Bun runtime.

## Flow Principal

```
[Telegram/Discord/...] → InboundMessage → MessageBus → AgentLoop → LLM Provider
                                                            ↓
                                                      Tool Execution
                                                            ↓
                                              OutboundMessage → MessageBus → [Channel]
```

## Module Principale

| Modul | Responsabilitate |
|-------|-----------------|
| `agent/loop.ts` | Core agent loop - procesează mesaje, execută tool calls iterativ (max 20) |
| `agent/context.ts` | ContextBuilder - asamblează system prompt din workspace files + memory + skills |
| `agent/memory.ts` | MemoryStore - MEMORY.md (always loaded) + HISTORY.md (append-only) |
| `agent/skills.ts` | SkillsLoader - descoperă SKILL.md files, parsează frontmatter |
| `agent/subagent.ts` | SubagentManager - background tasks cu tool registry izolat |
| `bus/queue.ts` | MessageBus - in-memory pub/sub, inbound queue + outbound dispatcher |
| `channels/` | 9 adapters, fiecare extinde BaseChannel (start/stop/send + allowFrom filtering) |
| `providers/` | LLM abstraction - MultiProvider (OpenAI-compatible) + CodexProvider (OAuth) |
| `tools/` | ToolRegistry + 7 tool types (fs, shell, web, message, spawn, cron, mcp) |
| `config/` | Zod schema tree pentru ~/.robun/config.json + env var overrides (ROBUN_*) |
| `session/` | JSONL persistence per channel:chatId |
| `cron/` | CronService - JSON store scheduler |
| `heartbeat/` | HeartbeatService - periodic check every 30min |

## Agent Loop Detail

```
while (iteration < maxIterations):
    response = provider.chat(messages, tools)
    if response has tool_calls:
        execute each tool sequentially
        add results to messages
        add reflection prompt
    else:
        return final content
```

## Memory System

- **MEMORY.md** - long-term facts, preferences. Always in context (system prompt).
- **HISTORY.md** - append-only event log. Searchable via grep.
- **Session JSONL** - full conversation per channel:chatId.
- **Consolidation** - la >50 mesaje, LLM sumarizează → history_entry + memory_update.

## Provider System

14 providers, 2 clase:
- **MultiProvider** - handles all OpenAI-compatible APIs (Anthropic, OpenAI, Google, Groq, etc.)
- **CodexProvider** - OAuth flow special pentru ChatGPT Codex

Fallback chain: direct API → gateway (OpenRouter, AiHubMix, Custom).

## Channel Architecture

Fiecare channel extinde `BaseChannel`:
- `start()` - conectare la platformă
- `stop()` - deconectare
- `send(OutboundMessage)` - trimite mesaj
- `allowFrom` - whitelist sender IDs (opțional)

Dynamic import: doar canalele enabled sunt încărcate.

## MCP Integration

`connectMcpServers()` conectează la MCP servers (stdio/HTTP) și înregistrează tool-urile ca `mcp_{server}_{tool}` în ToolRegistry. Extensibilitate nelimitată.
