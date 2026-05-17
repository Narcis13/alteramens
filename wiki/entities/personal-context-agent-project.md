---
title: "Personal Context Agent — Alteramens Project"
type: entity
category: project
aliases: ["Personal Context Agent", "PCA"]
first_seen: personal-context-agent
sources: []
related_entities: [alteramens, mcp-protocol, mem-ai, notion, tana, anytype, obsidian, logseq, rewind-ai, limitless-ai, dex, clay]
related_concepts: [twelve-layers-of-context, identity-first-storage, declared-vs-observed-gap, context-decay-heuristics, frame-problem-retrieval, authority-decay-compounding, inverted-polarity-sister-system, productize-yourself, encoded-judgment, leverage, mcp-as-distribution, executable-wiki, entity-types-to-layers-mapping]
vault_refs: ["wiki/syntheses/personal-context-agent.md"]
status: active
---

# Personal Context Agent

A new Alteramens project (seeded 2026-05-16). An AI agent that builds and maintains a *compounding personal context* exposed via [[mcp-protocol|MCP]] to any LLM — Claude, GPT, Gemini, others. Sister-system al [[executable-wiki|Faber]], with **inverted polarity**: SQLite as source of truth, MD as optional export.

## Status

- **2026-05-16** — Foundation synthesis filed at [[personal-context-agent|wiki/syntheses/personal-context-agent.md]].
- **Next step**: `#validate` (5 conversations) înainte de orice cod.

## Core pitch

Orice agent AI răspunde generic pentru că nu are *contextul tău*. Re-explicația manuală nu compound-ează. Pariul: un agent dedicat care construiește contextul personal o singură dată, îl menține fresh prin [[authority-decay-compounding|authority+decay]], și-l expune standardizat oricărui alt agent prin MCP.

## Differentiated from

- **OpenAI Memories / Anthropic auto-memory** — vendor-locked, no public protocol, no mobile
- **[[mem-ai|Mem.ai]] / [[notion|Notion]] / [[tana|Tana]] / [[anytype|Anytype]]** — notes-first; identity = mențiune incidentală
- **[[rewind-ai|Rewind]] / [[limitless-ai|Limitless]]** — passive capture; nu modelează persoana
- **[[dex|Dex]] / [[clay|Clay]]** — acoperă doar layer 6 (Relational)

Differentiator: [[identity-first-storage]] + multi-agent protocol (MCP) + compounding mechanics built-in (maturity, decay, declared-vs-observed). Vezi [[inverted-polarity-sister-system]] pentru relația cu Faber.

## MVP slice

Un singur tool MCP — `get_self_summary` — returnează identity + active roles + active goals + active constraints + current state. Loop minim: write → context activ → răspuns ancorat.

## Architectural pillars

1. [[twelve-layers-of-context]] — ontologia de 12 straturi peste care entity types se aplică
2. [[entity-types-to-layers-mapping]] — maparea v0.1 → v0.2 entity types ↔ straturi (Self split, Place adăugat, Project/Source ca primitive transversale)
3. [[identity-first-storage]] — Self, Role, Goal, State, Stance ca cetățeni de prim rang
4. [[authority-decay-compounding]] — perechea care face sistemul să compound-eze, nu să devină noise
5. [[context-decay-heuristics]] — TTL per strat, re-validation cadence
6. [[declared-vs-observed-gap]] — corrective compounding ca disciplină
7. [[frame-problem-retrieval]] — critical path pentru `get_relevant_context`

## Open questions

Numire (Persona / Anchor / Cocon / Aether / Plinta / Sigil / Vade / Atlas / Lume / Loam), schema rigidity, encryption boundary, GDPR vs append-only, frame-problem retrieval strategy. Vezi [[personal-context-agent|foundation synthesis]] Partea X.

## Strategic fit

- [[productize-yourself]] — Narcis are nevoie acut (admin spital + builder + părinte). Build pentru tine → vinde altora.
- [[encoded-judgment]] / Skill Era — Skills cu context personal sunt skills cu *judgment*. Skills fără context sunt funcții. PCA e infrastructura.
- [[leverage]] — Permissionless layer *peste* LLM-uri, nu sub. User aduce contextul, alege agentul.
- [[mcp-as-distribution]] — distribuția se face prin protocolul MCP, fără vendor lock-in.

## Vault refs

- [[personal-context-agent|Foundation synthesis]] — decompoziție filozofică + blueprint inițial (Partea I–XI)
