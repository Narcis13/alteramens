---
title: "Inverted-Polarity Sister System"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project, alteramens]
related: [identity-first-storage, executable-wiki, encoded-judgment]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Inverted-Polarity Sister System

A design meta-pattern: când construiești un sistem similar cu unul existent, **inversează polaritatea storage-ului primar** ca să optimizezi pentru un set diferit de use cases — chiar dacă pattern-ul general rămâne același.

Exemplul concret: [[personal-context-agent-project|Personal Context Agent]] e sister al [[executable-wiki|Faber]], dar:

| Dimension | Faber | Personal Context Agent |
|---|---|---|
| Source of truth | MD files | SQLite |
| MD role | Primary read/write | Optional export (derived) |
| Editor target | Obsidian / text editor | Mobile + web client custom |
| Velocity | Slow, deliberate curation | Continuous capture + periodic curate |
| Multi-tenancy | Single (un vault) | Multi-user din ziua zero |
| Sync mechanism | Git | DB replication (libsql/Turso/CRDT) |

Same compounding primitives (maturity, decay, declared-vs-observed), inversate polarități.

## De ce inversezi

Polaritatea storage-ului decide:
- **Editing UX** — MD bun pentru desktop+keyboard; DB bun pentru mobile+structured-input
- **Concurrency** — git e single-writer; DB e ACID multi-writer
- **Distribution** — file sync vs DB replication
- **Schema rigor** — file conventions vs migrations versionate
- **Audience** — human-readable vs agent-readable

Dacă use case-ul tău e *agent-first, mobile-native, multi-tenant*, MD-as-source nu mai are sens. Dacă use case-ul tău e *deliberate human curation, slow velocity, single owner*, DB-as-source e overkill.

## Sister, nu copie

Inverted-polarity nu înseamnă fork. Înseamnă:
1. **Recunoști primitivele care funcționează** (maturity, decay, append-only history, declared/observed)
2. **Le păstrezi**
3. **Schimbi storage-ul primar** ca să optimizezi pentru *another* set of constraints
4. **Accepți trade-off-urile inversate** (pierzi editing-direct-în-Obsidian; câștigi multi-agent concurrent writes)

Asta e diferit de:
- **Fork** — același pattern, ușoare variații
- **Reimplementare** — nimic comun cu originalul
- **Generalization** — un substrate care le subsume pe ambele

Sister-systems sunt *paralele*, nu *generalizări*. Trăiesc independent, dar împart vocabularul.

## When applicable

Inversion candidate când vezi:
1. Un sistem existent ai cărui *use cases secundari* sunt prost serviți
2. Primitivele de compounding ale lui sunt corecte, dar polaritate-storage limitează deployment
3. Ai un alt audience (mobile vs desktop, multi-tenant vs single, agent vs human)
4. Refactor în loc de inversion ar însemna prea multă schimbare în system-ul existent

Inversion *nu e* candidate când:
- Primitivele sunt încă instabile (inversezi ceva ce nu funcționează)
- Use case-urile sunt similare (un singur sistem ajunge)
- Costul de a menține două sisteme paralele depășește câștigul

## Riscul cunoscut

Două sisteme paralele = două mental models, două set-uri de skill-uri, două perimetre de mentenanță. Dacă vocabularul nu rămâne aliniat, drift-ul apare. Sister-systems funcționează doar dacă schema-conceptelor împărtășite (pillars, stances, decay, authority) rămâne sincronizat prin proces explicit, nu prin coincidență.

## Related concepts

- [[identity-first-storage]] — inversion concretă pentru personal data
- [[executable-wiki]] — pattern-ul original (Faber)
- [[encoded-judgment]] — meta: decizia de a inversa polaritatea e ea însăși judgment encodat
