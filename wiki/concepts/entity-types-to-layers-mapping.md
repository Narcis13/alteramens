---
title: "Entity Types ↔ Twelve Layers — Mapping (v0.1 → v0.2)"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project]
related: [twelve-layers-of-context, identity-first-storage, declared-vs-observed-gap, context-decay-heuristics, authority-decay-compounding, frame-problem-retrieval, inverted-polarity-sister-system]
maturity: seed
confidence: medium
contradictions: []
applications: []
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-05-17 build | Entity types ↔ 12 layers mapping (v0.2)"
---

# Entity Types ↔ Twelve Layers — Mapping

Schema-ul de stocare al [[personal-context-agent-project|Personal Context Agent]] e schițat ca *entity types* tipizate (Person, Role, Goal, ...) — vezi draft v0.1 din [[personal-context-agent|foundation synthesis]] Partea VII. Ontologia conceptuală e [[twelve-layers-of-context|cele 12 straturi]]. **Întrebarea critică:** se muleaza entity types peste straturi 1:1?

**Răspuns scurt:** nu — și asta arată unde schema trebuie ajustată.

## v0.1 — mapping observat (entity types așa cum sunt în draft)

| # | Strat | Entity type(s) primar(e) | Notă |
|---|---|---|---|
| 1 | Identity | **Role** + **Person**(self) + **Stance** | Identitatea e compusă din 3 entități, nu un tip propriu |
| 2 | Temporal | *(niciunul — implicit)* | Trăiește în `created_at` / `expires_at` / `occurred_at` |
| 3 | Spatial / mediu | **State.attrs.location** | Nu există SpatialEntity; e câmp pe State |
| 4 | Goals | **Goal** + **Project** | Două entități pentru un strat |
| 5 | Knowledge | **Knowledge** + **Source** | Source e folosit și ca citation cross-cutting |
| 6 | Relational | **Person** (alții) + **Link** | Person re-folosit pentru self ȘI alții |
| 7 | Resources | **Resource** | 1:1 curat |
| 8 | Constraints | **Constraint** | 1:1 curat |
| 9 | State | **State** | 1:1 curat (volatile, TTL scurt) |
| 10 | History | **Event** | 1:1 curat (append-only) |
| 11 | Aesthetic | **Preference** | 1:1 curat |
| 12 | Epistemic stance | **Stance** | 1:1 curat |

## Pattern-ul care iese din v0.1

**Acoperire 1:1 curată (7 straturi):** Resources, Constraints, State, History, Aesthetic, Epistemic, (Knowledge parțial). Astea sunt sănătoase arhitectural.

**Acoperire compusă (3 straturi cu multiple entități):**
- **Identity** ← Role + Person(self) + Stance — *compusă, nu colapsabilă*
- **Goals** ← Goal + Project — *Project e scope-container, nu goal mare*
- **Relational** ← Person + Link — *Link tipizează stratul*

**Straturi fără entity dedicat (2):**
- **Temporal** — corect implicit (timpul e *axă*, nu lucru)
- **Spatial** — colapsat în `State.attrs.location`; **slăbiciune** dacă "unde" (hospital vs home) schimbă material răspunsuri

**Entități care nu sunt straturi (2):**
- **Event** — infrastructure pentru History layer + audit transversal
- **Source** — citation cross-cutting; mai aproape de primitive (Link/Annotation/Tag)

## Diagnostic

Trei probleme structurale în v0.1:

1. **Person are double-duty.** Self vs alții cer atribute disjuncte (pillars/voice/narativă pentru self; relație + rol-în-viața-mea pentru alții). Un singur tip forțează `attrs` să crească eteroclit.
2. **Project nu e strat — e scope-container.** Apare în schema ca `scope = 'project:X'` și se comportă ca namespace peste alte entități. Listarea lui lângă Goal e o eroare de categorie.
3. **Source e mai aproape de Annotation.** Citation pentru orice fapt, nu doar pentru cunoaștere. Tipizarea ca entity îl face să concureze artificial cu Knowledge.

## v0.2 — re-mapare propusă

**Entity types per strat (1 entity = 1 strat, cu excepții justificate):**

| # | Strat | Entity type | Schimbare față de v0.1 |
|---|---|---|---|
| 1 | Identity | **Self** | *Nou — split din Person*. Singleton. Pillars, voice, narativă |
| 2 | Temporal | *(axă, nu entity)* | Confirmat — timpul stă pe câmpuri meta |
| 3 | Spatial | **Place** | *Nou — extras din State.attrs*. Contexte fizice/digitale predictibile |
| 4 | Goals | **Goal** | Project promovat în primitive transversale |
| 5 | Knowledge | **Knowledge** | Source promovat în primitive transversale |
| 6 | Relational | **Person** | Doar alții, nu user-ul; user-ul = Self |
| 7 | Resources | **Resource** | Neschimbat |
| 8 | Constraints | **Constraint** | Neschimbat |
| 9 | State | **State** | Pierde `location` (mutat pe Place sau pe link Self→Place) |
| 10 | History | **Event** | Neschimbat |
| 11 | Aesthetic | **Preference** | Neschimbat |
| 12 | Epistemic | **Stance** | Neschimbat |

**Primitive transversale (nu sunt straturi — sunt infrastructure):**
- **Link** — relație tipizată între entități
- **Annotation** — note libere atașate la orice entity
- **Tag** — categorizare liberă
- **Source** *(promovat din v0.1)* — citation pentru orice fapt
- **Project** *(promovat din v0.1)* — scope-container / namespace

## De ce v0.2 e mai bună

1. **1:1 layer↔entity** pentru 11 din 12 straturi (Temporal rămâne axă). View-urile SQL devin triviale: `v_current_self`, `v_active_goals`, `v_active_places` cad direct pe câte un tip.
2. **Self vs Person** — schemă curată: `Self` are pillars/voice; `Person` are relation + role-in-my-life. Nu mai sunt câmpuri "uneori-prezente".
3. **Spatial devine prim-clasă** — admin spital (hospital) ≠ builder seara (home). Place e entity stabil, nu câmp volatil în State; State referă Place prin link.
4. **Project = scope, nu entity de drept** — `scope` field-ul din schema-ul SQLite era deja `general | project:X | role:Y`. Re-clasificarea aliniază schema cu intent-ul.
5. **Source = annotation specializată** — citation se atașează prin link, nu prin entity competitor cu Knowledge.

## Trade-off-uri acceptate în v0.2

- **One more entity type to maintain** (Place). Justificat doar dacă layer 3 (Spatial) e capturat material în MVP — altfel rămâne câmp pe State până validezi.
- **Self ca singleton** introduce un caz special. Acceptabil — singletoanele sunt clare în schema, nu ambigue ca "Person where is_self=true".
- **Source ca primitive** rupe simetria cu Event (ambele "infrastructure"). Acceptabil pentru că rolurile lor sunt diferite: Event = timeline, Source = provenance.

## Open question care decide v0.2 → v0.3

**Spatial merită entity dedicat în MVP?** Validare prin observație: în prima săptămână de capture, câte capture-uri menționează material un loc fizic/digital care schimbă răspunsul? Dacă >20%, Place merită entity. Dacă <5%, rămâne câmp pe State și layer 3 e capturat implicit.

## Implications

- `/ctx-capture` flow: la "Person" propus, întreabă *self sau altcineva* înainte de a confirma tipul.
- View-uri SQLite revizuite: adaugă `v_active_places`, dropează `v_current_self` din "snapshot identity" și remap pe Self singleton.
- MVP slice (`get_self_summary`) devine literal `SELECT * FROM entities WHERE type='self' LIMIT 1` + JOIN-uri pe Role, Goal, Constraint active.

## Related primitives

- [[twelve-layers-of-context]] — ontologia peste care se aplică maparea
- [[identity-first-storage]] — de ce Identity / Self e prim-clasă (nu derivat)
- [[authority-decay-compounding]] — proprietățile cross-cutting care țin schema vie după ce e tipizată
- [[frame-problem-retrieval]] — entity types curate fac `get_relevant_context` mai ieftin (filter by type înainte de embedding)
- [[declared-vs-observed-gap]] — Self e ținta primară a mirror-ului: declared (în Self) vs observed (din Event log)
