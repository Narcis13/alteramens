---
title: "Identity-First Storage"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project, mem-ai, notion, tana, anytype, obsidian, logseq, rewind-ai, limitless-ai]
related: [twelve-layers-of-context, authority-decay-compounding, encoded-judgment, knowledge-first-development, product-marketing-context, executable-wiki, inverted-polarity-sister-system, entity-types-to-layers-mapping]
maturity: seed
confidence: medium
contradictions: []
applications: []
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-05-16 ingest | Personal Context Agent — extracting concepts & entities"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-05-16 ingest | Personal Context Agent — extracting concepts & entities"
---

# Identity-First Storage

A design pattern for personal data systems where **Identity, Roles, Goals, Stances, and State** sunt entity types de prim rang — nu metadata derivată din note. Note, capture-uri și referințe devin *derivative* ale identității, nu invers.

Aceasta e arhitectura care diferențiază [[personal-context-agent-project|Personal Context Agent]] de notes-first competitors.

## Two architectural poles

| Notes-first (current default) | Identity-first |
|---|---|
| Primitive de stocare: nota (Markdown, block, page) | Primitive de stocare: entitate tipizată (Person, Role, Goal, State, Stance) |
| Identitatea = mențiune incidentală în content | Identitatea = schema-level, queryable |
| Agentul scanează full corpus pentru relevanță | Agentul cere „active roles" → primește rândul respectiv |
| Lock-in via format proprietar de note | Lock-in via valoare acumulată, format exportabil |
| Builder-uri tipice: [[mem-ai]], [[notion]], [[obsidian]], [[logseq]], [[tana]], [[anytype]] | [[personal-context-agent-project|Personal Context Agent]] |

Capture-first systems ([[rewind-ai]], [[limitless-ai]]) sunt al treilea pol: ele capturează passive (audio/screen) dar nu modelează persoana — output-ul rămâne brut.

## Why the inversion matters

Un agent care primește, la query time, full-dump de note pentru „cine e user-ul" face inferență din *content textual* despre identitate. Asta e:

- **Lent** — embeddings + ranking pe toate notele
- **Stale** — note vechi despre roluri vechi diluează prezentul
- **Fragil** — depinde de cât de bine ai scris note-ul „eu sunt X"
- **Untyped** — nu poți spune programatic „toate Goals active care expiră în 30 zile"

Cu identity-first storage:

- `SELECT * FROM entities WHERE type='role' AND status='active'` — O(rows) cu index
- Schema migrations versionate
- Decay built-in (vezi [[context-decay-heuristics]])
- Authority tracked per câmp (vezi [[authority-decay-compounding]])

## The architectural unlock

Identity-first nu e o decorație — e ce face *agent-first* funcțional. Un agent fără protocol stabil pentru „cine e user-ul" caută în zadar; un agent cu un singur tool MCP `get_self_summary` primește răspunsul ancorat de un join SQL, nu de un retrieval probabilistic.

Asta face și diferența de business: cu notes-first, valoarea utilizatorului pleacă cu el când exportă MD-urile. Cu identity-first + export MD permanent, valoarea acumulează în *coerența modelului*, nu în formatul fișierelor.

## Implications for product design

1. **Schema înainte de UI.** Dacă entitățile sunt clar tipizate, UI-urile (mobile, web, CLI) sunt skin-uri peste același DB.
2. **Capture poate fi free-form, modelarea NU.** Un capture rapid se propune ca entity-of-type-X — confirmarea îi atribuie tipul.
3. **Maturity per entity, nu per file.** O entitate de tip Role poate fi `provisional` chiar dacă fișierul ei a fost editat ieri.
4. **Multi-tenant din ziua zero.** Schema generic înseamnă orice user e o instanță; multi-tenancy e un câmp `user_id`, nu o re-arhitecturare.

## Relation to Faber

Faber e [[executable-wiki|MD-first]] — corect pentru *human-curator, slow velocity, single owner*. Identity-first storage e răspunsul opus, optimizat pentru *agent-curator, continuous capture, multi-tenant*. Cele două nu se contrazic — sunt [[inverted-polarity-sister-system|sister-systems cu polaritate inversată]], fiecare cu use case-ul lui legitim.

## Related concepts

- [[twelve-layers-of-context]] — straturile peste care entity types se aplică; Identity (layer 1) capătă tratament prim-clasă
- [[encoded-judgment]] — decizia de a face Identity first-class e ea însăși judgment encodat la nivel de arhitectură
- [[knowledge-first-development]] — analog: cunoaștere înainte de cod; aici, identitate înainte de note
- [[product-marketing-context]] — vărul „business": positioning ca primitivă persistentă, nu re-derivată per skill
- [[authority-decay-compounding]] — proprietățile care țin schema vie după ce e tipizată
