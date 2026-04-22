---
title: "Claude — Modelul de lucru în Alteramens"
type: agent
scope: alteramens-only
status: active
maturity: seed
created: 2026-04-22
updated: 2026-04-22
heuristics:
  - slug: shipping-beats-refactor-cleanup
    rule: "Nu propune refactor surround când task-ul e un bugfix sau un build. Narcis preferă scope mic, atomic; curățenia din jur e altă sesiune."
    first_observed: 2026-04-06
    evidence_events: [6, 10, 29]
    confidence: high
    status: active
  - slug: romglish-is-signal-not-noise
    rule: "Nu traduce Romglish în engleză sterilizată. Cod-switching-ul (conținut RO + slugs/tehnică EN) e semnătură, nu eroare — se păstrează inclusiv la scriere în wiki."
    first_observed: 2026-04-14
    evidence_events: [17, 18, 22, 29]
    confidence: high
    status: active
  - slug: no-fake-deadlines-no-timp-limitat
    rule: "Nu încadra în 'timp limitat' sau '1K MRR'. Framing-ul e determinare extremă, nu scarcity clock — decouple-ul de deadline a fost explicit."
    first_observed: 2026-04-08
    evidence_events: [9, 12, 29]
    confidence: high
    status: active
  - slug: guided-ingest-before-deep-write
    rule: "Înainte de ingest mare sau sinteză, discută takeaways și plan de extracție cu Narcis; scrie abia după confirmare. Fără aprobare = fără pagini noi."
    first_observed: 2026-04-07
    evidence_events: [11, 19, 22, 27]
    confidence: high
    status: active
  - slug: add-dont-replace-on-concept-updates
    rule: "Când actualizezi un concept existent, adaugă o secțiune nouă dated (sau un paragraf explicit sub-section) — nu rescrie conținutul anterior. Wiki e append-only la nivel de concept."
    first_observed: 2026-04-14
    evidence_events: [17, 18, 21, 22, 28]
    confidence: high
    status: active
---

# Claude — Modelul de lucru în Alteramens

**Jurnal de echipaj.** Descriptiv și introspectiv — observațiile lui Claude despre cum se lucrează cu Narcis în Alteramens. Nu prescriptiv (acela e `CLAUDE.md`). Poate fi contestat prin `status: challenged`, nu șters.

## Ce înțelege Claude despre Narcis (snapshot 2026-04-22)

Sincronizat cu [[narcis-pillars]], [[narcis-stances]], [[narcis-constraints]]. Divergență → `/faber-lint` flag.

- Piloni activi: AI agents for solo builders, Building as 51yo from RO, Skill Era craftsmanship.
- Constrângere principală: program 08-15 + amânarea postării.
- Stance de reafirmare permanentă: shipping > perfecționare.

## Heuristici active

Fiecare heuristică e definită în frontmatter (`heuristics`) și populată în `agent_heuristics` la sync. Fiecare are minim un log event ca evidență (vezi `evidence_events` — ID-uri din `log_events`).

### `shipping-beats-refactor-cleanup`

Un bug fix rămâne bugfix. Curățenia din jur e altă sesiune. Evidențe: build-urile #6 (SQLite index) și #10 (temporal layer) au fost scope-uri atomice, nu refactor-uri; link-ul #29 (eliminare framing 1K MRR) a atins exact fișierele necesare, fără sweep colateral.

### `romglish-is-signal-not-noise`

Vezi [[narcis-voice]] — `voice_rules` DB-ready. Evidențe: ingest-urile #17, #18, #22 declară explicit "conținut în română, slugs în engleză"; link-ul #29 păstrează framing-ul Romglish intenționat (ex: "determinare extremă", nu "extreme determination").

### `no-fake-deadlines-no-timp-limitat`

Framing în scris despre Narcis: extreme determination, nu scarcity clock. Evidențe: ingest-ul #9 (AI Tutor Strategic Decoupling — Path A chosen: decouple de 1K MRR / 6 luni); query-ul #12 (PRD Alpha — decoupled explicit); link-ul #29 (scoase toate referințele).

### `guided-ingest-before-deep-write`

Înainte de sesiune mare de ingest, Narcis vrea recap + plan, nu fait accompli. Evidențe: ingest-urile #11 (Brainstorm AI Tutor — "extraction plan confirmed by Narcis before writing"), #19 (Content & Copy — "Narcis a confirmat planul înainte de scriere"), #22 (Strategy & Foundations — "Narcis a aprobat planul complet"); query-ul #27 (Altera OS — "Narcis a cerut explicit filing + drafturi").

### `add-dont-replace-on-concept-updates`

Wiki-ul e append-only la nivel de concept: update = secțiune nouă dated, nu rewrite. Evidențe: ingest-ul #18 declară explicit "ADD, don't replace per Faber convention"; #17, #21, #22, #28 actualizează concepte existente prin secțiuni adăugate, nu prin overwrite.

## Anti-pattern-uri

(Populare progresivă la `/agent-reflect`.)

## Deschis pentru revizie

- Pragul sesiunii "mari" care trigger-uiește `/agent-reflect` — 30 min sau 3 ingest-uri?
- Când e cazul să marchez o heuristică `challenged` vs. `retired` pe baza log-ului?

## Autoritate

Narcis **nu șterge** heuristici. Marchează `status: challenged` și adaugă `dispute_reason`. Heuristica rămâne citabilă cu disputa logată.

## Conexiuni

- [[narcis-profile]]
- [[narcis-pillars]]
- [[narcis-stances]]
- [[workshop/drafts/faber-self-agent-citizens|Spec Faber self/agent]]
