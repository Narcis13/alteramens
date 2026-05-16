---
title: "Context Decay Heuristics"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project, mem-ai, notion]
related: [twelve-layers-of-context, identity-first-storage, authority-decay-compounding, declared-vs-observed-gap]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Context Decay Heuristics

Orice fapt despre o persoană are o *durată de relevanță*. Fără decay, un context-store se umple cu fapte care nu mai sunt adevărate, iar agenții care le citesc dau răspunsuri tot mai stale. Decay heuristics = regulile prin care fapte expiră, decad în confidence, sau cer re-confirmare.

## Decay nu e ștergere

A șterge un fapt vechi pierde semantica „asta era adevărat acum 2 ani". Decay-ul corect e:
- **TTL** — câmp `expires_at` care marchează când faptul devine `stale` (vizibil, dar marcat)
- **Soft invalidation** — `invalidated_at` setat dacă utilizatorul sau un agent îl marchează ca neadevărat
- **Re-validation prompts** — UI ce întreabă periodic „mai e adevărat că X?" și log-uiește răspunsul
- **Authority decay** — `confidence` scade automat după N zile fără refresh

History rămâne (append-only); doar *current state* se schimbă.

## TTL per strat (sketch inițial)

Fiecare din [[twelve-layers-of-context|cele 12 straturi]] are propria volatilitate, deci propriul TTL default:

| Layer | Default TTL | Reasoning |
|---|---|---|
| 1 Identity (Person, core values) | None | Lent natural; se schimbă rar |
| 1 Identity (Role) | 90 zile | Rolurile pot fi paused/restarted |
| 2 Temporal | Auto-rolling | Recent → past după N zile |
| 3 Spatial (location current) | 24h | Volatile |
| 4 Goal (short-term) | Until status change | Marker explicit |
| 4 Goal (long-term) | 6 luni | Re-confirmare necesară |
| 5 Knowledge (skill declarat) | 1 an | Skills decad fără folosire |
| 6 Relational (active contacts) | 1 an | Relațiile decad în relevanță fără interacțiune |
| 7 Resources (budget, capacity) | 30 zile | Schimbă des |
| 8 Constraints | Until invalidated | Persistent până spui altceva |
| 9 State (mood, energie) | 7 zile | Foarte volatile |
| 10 History | Permanent | Append-only |
| 11 Aesthetic | 6 luni | Lent, dar se rafinează |
| 12 Epistemic stance | 6 luni | Rar, dar important să fie revisited |

Tabelul de mai sus e schiță, nu adevăr. TTL real e *learned* din pattern-ul de update al fiecărui user.

## Decay vs invalidare

- **Decay** = trece timpul, nimic nu confirmă. Confidence scade gradual.
- **Invalidare** = ceva explicit contrazice. Faptul rămâne în history, dar `invalidated_at` se setează.

Cele două nu se confundă. Un Goal `provisional` care expiră fără să fie atins nu e *invalidated* — e *abandoned-by-decay*. Distincția e load-bearing pentru pattern recognition: pattern-ul „abandonezi goal-uri short-term la 2 săptămâni" e diferit de „le invalidezi explicit la 1 lună".

## Re-validation cadence

UI design rule: re-confirmation prompts trebuie să fie:
- **Punctuale** (un fapt per prompt, nu un batch overwhelming)
- **Cu opt-out cheap** („skip, ask again later" nu „forced answer")
- **Cu auto-decay safety net** (dacă utilizatorul ignoră N prompts → confidence drops, nu cerș la nesfârșit)

## Why this differs from notes-first

Într-un sistem notes-first ([[mem-ai|Mem.ai]], [[notion|Notion]]), decay-ul e *implicit* — un fapt vechi într-o notă veche pierde relevanță în retrieval, dar fără semaforică explicită. Agentul nu știe că faptul e stale, doar că nu se mai matchează puternic la query-uri recente.

Într-un sistem [[identity-first-storage|identity-first]], decay e *prim-clasă* — câmpuri tipizate, view-uri SQL dedicate (`v_stale_entities`), TTL versionat. Asta înseamnă că agentul *poate ști* că nu mai poate avea încredere într-un fapt anume.

## Related concepts

- [[twelve-layers-of-context]] — fiecare strat are propriul profil de decay
- [[authority-decay-compounding]] — perechea (authority, decay) e ce face sistemul să compound-eze
- [[identity-first-storage]] — decay built-in e una dintre diferențele cu notes-first
- [[declared-vs-observed-gap]] — decay-ul fără re-confirmare crește gap-ul (declared rămâne, observed se mută)
