---
parent: "[[robun/robun|Robun]]"
type: decisions
---

# Robun - Decizii

| Decizie | Rațiune | Outcome |
|---------|---------|---------|
| Bun runtime (nu Node) | Speed, native TS, align cu restul proiectelor Alteramens | Good |
| Migrare din Python → TypeScript | Type safety, ecosystem mai bun pentru web, Bun compatibility | Good |
| Hono v4 pentru HTTP | Lightweight, fast, familiar din alte proiecte | Good |
| MessageBus pub/sub in-memory | Simplu, suficient pentru single-process | Good |
| MultiProvider (un singur class) | Un handler pentru toate OpenAI-compatible APIs, reduce duplicare | Good |
| jsonrepair pentru tool call args | Cheap LLMs produc JSON malformat, fallback safe | Good |
| Workspace markdown files pentru identity | AGENTS.md, SOUL.md, USER.md - configurabil fără cod | Good |
| Skills ca markdown cu frontmatter | Extensibil, gray-matter parsing, pattern familiar | Good |
| JSONL session persistence | Append-friendly, human readable, simplu | Good |
| Dynamic channel import() | Evită loading deps grele pentru canale nefolosite | Good |
| Zod validation pe tool params | Consistent cu restul stack-ului, type-safe | Good |
| allowFrom whitelist pe channels | Security - doar sender-ii autorizați procesați | Good |
| OAuth flow local pentru Codex | Leverages ChatGPT subscription fără API key | Good |
| MCP ca extensibility mechanism | Standard protocol, orice MCP server devine tool | Good |
| Subagent spawning cu registry izolat | Fire-and-forget tasks fără risk de side effects | Good |
