---
title: "Dual Orchestrator Pattern — Runtime Agent + Dev-Time Agent Sharing State"
type: concept
category: pattern
sources: []
entities: [alteramens]
related: [skill-era, ai-collaborator-army, agent-fleet-architecture, knowledge-first-development, ambient-computation, encoded-judgment, executable-wiki]
maturity: seed
confidence: medium
contradictions: []
applications: ["workshop/ideas/altera-os.md"]
---

# Dual Orchestrator Pattern — Runtime Agent + Dev-Time Agent Sharing State

Un pattern arhitectural pentru produse agent-native construite de solo/tiny teams: **doi agenți cu roluri diferite operează pe același sistem, share-uind DB, skills și context**. Runtime Agent servește utilizatorii finali conversational. Dev-Time Agent servește builder-ul — scrie cod, migrează schema, debug-uiește, extinde produsul.

## Inversiunea

| Pattern tradițional | Dual Orchestrator |
|---|---|
| Dev folosește IDE + CLI, users folosesc app | Dev și users folosesc agenți diferiți peste aceeași platformă |
| Coduri în afara sistemului, apoi deploy | Dev-Time Agent operează pe sistemul live, cu acces la runtime state |
| Logica produsului hardcoded de developer | Skills ca primitive comune — aceleași skills invocate de ambii orchestratori |
| Onboarding feature nou = cycle dev → deploy → user | Onboarding = dev-time agent adaugă skill → runtime agent îl poate invoca imediat |

## Structura

```
         ┌────────────────────────────────┐
         │       Shared State Layer       │
         │  - DB (tenants, entities, ...) │
         │  - Skills registry             │
         │  - Memory / world model        │
         │  - Event bus                   │
         └──────┬──────────────────┬──────┘
                │                  │
      ┌─────────▼───────┐  ┌───────▼──────────┐
      │  RUNTIME AGENT  │  │ DEV-TIME AGENT   │
      │  (e.g. robun)   │  │ (e.g. Claude     │
      │                 │  │      Code)       │
      │ Scope:          │  │ Scope:           │
      │ - Conversație   │  │ - Build features │
      │ - Invocări      │  │ - Migrare schema │
      │   skills        │  │ - Write skills   │
      │ - Workflows     │  │ - Debug runtime  │
      │ - End-user IO   │  │ - Refactor       │
      └────────┬────────┘  └─────────┬────────┘
               │                     │
      ┌────────▼────────┐   ┌────────▼─────────┐
      │   End users     │   │     Builder      │
      │   (chat, CLI)   │   │  (terminal, IDE) │
      └─────────────────┘   └──────────────────┘
```

Punct cheie: **skill-urile sunt primitivul comun**. Un skill scris de Dev-Time Agent devine invocabil imediat de Runtime Agent. Nu există deploy. Nu există "release process" între cei doi.

## De ce funcționează acum (și nu înainte)

Condiții preliminare care au apărut în 2024-2026:
- **LLM-uri capabile să manipuleze coduri și baze de date reale** (Claude Code, Cursor, etc.)
- **Skills as first-class primitives** ([[skill-era]]) — markdown + frontmatter ca interfață minimală
- **Baze de date structurate citibile de LLM** (SQLite inspect + FTS, wiki în markdown)
- **Contexte lungi** care permit dev-time agent să înțeleagă întreg produsul dintr-un `CLAUDE.md` + reading
- **1-operator products** unde nu există overhead de permisioning between dev și runtime

Înainte, dev-time "agent" era doar autocompletare. Acum e un partener cu acces la runtime state.

## Distincția față de [[ai-collaborator-army]] și [[agent-fleet-architecture]]

- [[ai-collaborator-army]] = N agenți specializați pentru un singur user
- [[agent-fleet-architecture]] = N agenți specializați într-o companie, fiecare cu domeniu
- **Dual orchestrator** = exact 2 agenți, cu **roluri structural diferite** (user-facing vs builder-facing), pe **aceeași platformă de produs**

E o formă minimalistă a fleet pattern-ului: fleet-ul de 2 este cazul limită unde 1 operator = 1 builder + N users, iar cei 2 agenți împart state-ul complet.

## Ce îl face defensabil

1. **Compounding în skills:** fiecare skill scris de Dev-Time Agent îmbogățește ce poate face Runtime Agent. Runtime devine mai puternic fără deploy.
2. **Feedback loop strâns:** user întreabă ceva, Runtime nu știe, builder vede log-ul, cere Dev-Time să adauge skill-ul, next query merge. Cycle: minute, nu sprint-uri.
3. **Encoded judgment cu revisiting:** [[encoded-judgment]] din skills poate fi refactat de Dev-Time Agent când noi cazuri apar, fără a rupe compatibilitatea (skill-urile sunt versionate în DB).
4. **Knowledge layer share-uit:** wiki-ul intern ([[executable-wiki]]) e vizibil ambilor — Dev-Time citește context când construiește, Runtime citește când răspunde.

## Cazuri de eșec

- **Același sistem folosit pentru dev și runtime = blast radius mare la greșeli.** Un skill buggy adăugat de Dev-Time afectează immediat users. Mitigare: staging tenant separat, skill `enabled: false` by default, audit log detaliat
- **Context-window pollution:** Dev-Time Agent cu prea mult context runtime devine lent/inexact. Mitigare: contexts dedicate, nu share automatic tot
- **Runtime Agent care scrie skills:** tentația de a lăsa Runtime să-și scrie propriile skills duce la drift necontrolat. Separă rolurile explicit: Runtime NU scrie skills în producție
- **Permissioning la multi-user:** când platforma crește peste 1 operator, cine are Dev-Time access? Pattern-ul e natural pentru solo/tiny teams; peste ~5 builder-i cere guardrails noi

## Aplicabilitate

Pattern-ul se potrivește:
- ✅ Solo builders cu produs agent-native (Altera OS = caz model)
- ✅ Tiny teams (2-5 pers) unde dev și ops sunt aceiași oameni
- ✅ Internal tools care evoluează zilnic ([[internal-to-product]] stage)
- ✅ [[knowledge-first-development]] setups unde codul e derivativ

Pattern-ul nu se potrivește:
- ❌ Enterprise cu compliance dev/prod separation mandated
- ❌ Echipe unde dev nu are domain fluency (Dev-Time Agent scrie skills greșite)
- ❌ Produse mature unde viteza de iterație contează mai puțin decât stabilitatea

## Open Questions

- Care e graniță corectă între ce face Runtime (doar invocă skills existente) și Dev-Time (le scrie)? Poate Runtime să propună skill-uri noi pe care Dev-Time să le review-uiască?
- Cum versionezi skills astfel încât un update să nu rupă conversații în curs?
- Se poate ca cei doi orchestratori să fie **același model** cu prompt-uri diferite, sau merită modele diferite pentru rolurile diferite?
- Cum se extinde la 3+ agenți (ex: adăugarea unui Audit Agent care verifică ce fac ceilalți doi) fără a pierde simplitatea pattern-ului?
- E pattern-ul generalizabil la **end-users power-users** (user-ul însuși are rol dev-time pentru tenant-ul lui), sau rămâne restricted la operator?
