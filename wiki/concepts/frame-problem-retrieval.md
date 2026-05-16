---
title: "Frame Problem Retrieval"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project]
related: [twelve-layers-of-context, identity-first-storage, context-aware-interrupt, knowledge-first-development, brain-ram-leverage]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Frame Problem Retrieval

> Ce e relevant pentru un query e *în sine* contextual.

Frame problem e o problemă clasică din AI symbolică (McCarthy & Hayes): un sistem nu poate enumera toate condițiile irelevante pentru o acțiune; trebuie să infere ce contează *raportat la situație*. Aceeași problemă apare la retrieval-ul din context personal — ce subset de context e relevant la o întrebare depinde de *intent-ul* întrebării, nu doar de cuvintele ei.

## Punctul critic

Pentru [[personal-context-agent-project|Personal Context Agent]], `get_relevant_context(query, max_items)` e *critical path*. Calitatea acestei funcții face/sparge produsul. Sub-întrebări:

1. **Ce înțelege „relevant"?** Aceleași cuvinte → context diferit (Wittgenstein).
2. **Pe ce strat să filtreze?** Întrebare despre planul săptămânii cere Goals + Constraints + State. Aceeași întrebare seara cere mai mult State (oboseală) decât dimineața.
3. **Cum să balanseze recall vs precision?** Prea puțin context → răspuns generic. Prea mult → noise + cost.

## De ce embeddings singure nu sunt suficiente

Embedding similarity pe full corpus prinde *similaritate semantică* dar nu *relevanță operațională*. Exemple unde eșuează:

- Query: „cum să-mi structurez săptămâna" — embeddings recuperează note despre time management. Dar relevanța reală cere *active Roles* + *active Goals* + *current State*, indiferent de match-ul textual.
- Query: „ce să răspund clientului X" — embeddings recuperează mențiuni X. Dar relevanța cere și *Stances* + *Voice rules* + *Constraint-uri legale*.

## Hybrid retrieval ca răspuns probabil

| Layer | Mecanism | Întrebare |
|---|---|---|
| Intent classification | LLM rouge | „ce strat din [[twelve-layers-of-context]] cere asta?" |
| Tag/type filter | SQL | dă-mi `type IN (Role, Goal, Constraint)` |
| Recency filter | SQL | exclude `expires_at < now()` |
| Embedding within candidates | Vector search | rankează 100 candidate finale după similaritate textuală |
| Graph traversal | SQL recursive | include vecini direcți pe links typed |

Asta e și ce diferențiază *agent-first storage* de notes-first: poți face SQL filtering înainte de embedding, ceea ce schimbă fundamental costul și calitatea. Vezi [[identity-first-storage]].

## The intent inference problem

Aici e tensiunea grea: dacă agentul trebuie să clasifice intent ca să retrieveze contextul, dar intent-ul *depinde* de context, ai un loop. Soluții parțiale:

- **Fast first pass cu intent generic** (ex: „personal task planning") urmat de retrieval grosier, apoi *refine* cu un al doilea apel după ce LLM-ul a văzut un sample.
- **Tool-level intent** — fiecare tool MCP expune un schema de intent (planning, research, communication, ...) și agentul alege tool-ul, primind subset deja filtrat.
- **User explicit intent** — UI permite tag-ul query-ului (ex: „rolul X / proiectul Y") la write time.

Nu e rezolvată; e o problemă centrală.

## Filtrul anti-overload

Per-query filtering esențial. Full-dump al context-ului în window-ul agentului e *anti-pattern*:

- Cost balon
- Noise dilutează signal
- Token limit lovește repede
- [[brain-ram-leverage|Brain RAM-ul operatorului]] e ars pe revizia output-ului noisy

Default rezonabil: `max_items=20-50`, ranked, cu metadata vizibilă (authority, confidence, last_updated). Agentul vede explicit ce și *de unde*.

## Related concepts

- [[twelve-layers-of-context]] — straturile peste care filtrarea operează
- [[identity-first-storage]] — tipizarea face filtering pre-embedding posibil
- [[context-aware-interrupt]] — versiunea UI a aceleiași discipline: ce context face întreruperea relevantă acum
- [[knowledge-first-development]] — analog la nivel epistemic: înțelege înainte să cauți
- [[brain-ram-leverage]] — de ce overload-ul de context e o pierdere economică pentru solo operatori
