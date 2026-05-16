---
title: "MCP — Model Context Protocol"
type: entity
category: framework
aliases: ["MCP", "Model Context Protocol"]
first_seen: personal-context-agent
sources: []
related_entities: [personal-context-agent-project, alteramens]
related_concepts: [mcp-as-distribution, encoded-judgment, leverage, identity-first-storage, agent-readable-web]
vault_refs: []
status: active
---

# MCP — Model Context Protocol

Open protocol initiated by Anthropic pentru ca agenții LLM să se conecteze la tool/context providers externi. Servește ca *distribution layer* pentru capabilități și pentru date.

## Why it matters for Alteramens

MCP e cel mai matur candidat de *protocol public* care permite construcția unui sistem peste care orice LLM se conectează — fără vendor lock-in. Pentru [[personal-context-agent-project|Personal Context Agent]], MCP e *layer 1 distribution*: un singur server (local sau cloud) expune tools (`get_relevant_context`, `record_observation`, `get_self_summary`, ...) la orice client compatibil (Claude Desktop, Claude Code, Cline, ChatGPT-cu-MCP, alți agenți).

## Strategic implications

- Permissionless distribution (vezi [[leverage]])
- Distribution-over-product pentru solo builders (vezi [[mcp-as-distribution]])
- Permite *un singur context store* citit de Claude, GPT, Gemini — nu N integrări vendor
- Pune o presiune competitivă pe „memory features" proprietare (OpenAI Memories, Anthropic auto-memory): cu MCP, user-ul aduce *propriul store*

## Position in Alteramens stack

| Layer | Component | Protocol |
|---|---|---|
| Storage | SQLite per-user | local DB |
| Server | Python/Node MCP server | MCP |
| Client | Claude Code, Claude Desktop, ChatGPT-cu-MCP, custom mobile | MCP |
| User UI | Web + mobile native | REST API peste același store |

## Related

- Faber are deja `faber.db` pe care un viitor MCP server l-ar putea expune (`/faber-query` over MCP)
- [[personal-context-agent-project|Personal Context Agent]] adoptă MCP ca strategic, nu opțional — *„fără un standard public, ești captiv într-un vendor."*
- [[agent-readable-web]] — MCP e una dintre direcțiile prin care web-ul devine agent-readable
