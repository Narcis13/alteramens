---
title: "Declared vs Observed Gap"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project]
related: [twelve-layers-of-context, identity-first-storage, authority-decay-compounding, judgment, knowledge-first-development]
maturity: seed
confidence: high
contradictions: []
applications: ["wiki/self/narcis-pillars.md", "wiki/self/narcis-stances.md"]
---

# Declared vs Observed Gap

> **Oamenii se descriu inaccurat.** Sistemul *trebuie* să tracking-uiască gap-ul dintre ce zici despre tine și ce arăți; altfel devine o oglindă măgulitoare.

Pattern-ul cere ca orice sistem de context personal să modeleze două layere paralele:

1. **Declared** — ce spune utilizatorul despre sine (roluri, goals, valori, voice rules).
2. **Observed** — ce demonstrează prin comportament agregat (frecvența activităților, sources consumate, decizii reale, decizii ratate).

Și apoi *gap-ul* dintre ele să fie un câmp de prim rang, nu o constatare incidentală.

## De ce contează

Fără gap-tracking, sistemul:
- Confirmă identitatea declarată indiferent dacă e adevărată azi
- Recomandă pe baza unei imagini de sine învechite
- Devine instrument de confort, nu de craftsmanship
- Lasă „drift-ul" silent: cine ai devenit ≠ cine te declari

Cu gap-tracking, sistemul:
- Spune „ai zis că X e pilon, n-ai făcut nimic în direcția lui de 6 săptămâni"
- Forțează revizie disciplinată periodică
- Devine *corrective compounding*, nu archive

## Faber ca prior

Faber a operationalizat deja parțial acest pattern:
- `wiki/self/*.md` capturează declared (pillars, stances, voice rules, commitments).
- `wiki/log.md` capturează observed (activitate, ingest, build events).
- `/faber-mirror` confruntă declared cu observed săptămânal și produce o reflexie no-diplomacy.

În Faber, mirror-ul e un skill periodic. În [[personal-context-agent-project|Personal Context Agent]], gap-tracking devine **prim-clasă** — un view permanent (`v_authority_gap` în schema sketch), nu o pagină săptămânală.

## Authority field ca mecanism

Pe fiecare item de context se atașează un câmp `authority`:

| Value | Înțeles |
|---|---|
| `self-declared` | Spus de utilizator |
| `observed` | Inferit din comportament agregat (log, frecvență, sources) |
| `inferred` | Propus de un agent (probabilist, nu de încredere singur) |

Două entități cu același title dar `authority` diferit nu se contradic — coexistă. Gap-ul iese din comparare:

```sql
-- Items unde declared și observed nu se aliniază
SELECT d.title AS declared_role, o.title AS observed_role
FROM entities d JOIN entities o ON d.title = o.title
WHERE d.authority='self-declared' AND o.authority='observed'
  AND d.status != o.status;
```

## Filtrul anti-nudge (rule de design important)

Sistemul te oglindește; oglindirea te schimbă (Karpathy: „you become what you measure"). Fără filtru, identity-first storage devine self-fulfilling — adopți declared-ul tău chiar dacă observed-ul tău spunea altceva.

Soluții parțiale:
- Mirror-ul rămâne confrontational by design (vezi `/faber-mirror`)
- UI separates declared și observed vizual — nu le merge într-un singur „tu"
- Promovarea declared → load-bearing trebuie să fie *validată de observed*, nu doar de timp

## Aplicații explicite

- **Productize-yourself audit** — ești cu adevărat *productizat* sau doar declarat? Gap-ul observat (cât content shipat / cât revenue) e răspunsul.
- **Stance integrity** — un stance declarat „shipping > perfection" e contrazis dacă logul arată drafturi nefinalizate de 3 săptămâni. Sistemul ridică flag-ul.
- **Identity decay** — un rol declarat „builder" stagnant 2 luni e candidat de re-validare.

## Related concepts

- [[twelve-layers-of-context]] — gap-ul există pe fiecare strat, dar e cel mai action-changing pe layer 1 (Identity) și layer 12 (Epistemic stance)
- [[identity-first-storage]] — fundamentul care face gap-tracking posibil (schema separă declared/observed la nivel de field)
- [[authority-decay-compounding]] — authority e una dintre cele două axe care fac sistemul corectiv în loc de stale
- [[judgment]] — direction over speed; declared-vs-observed gap e instrumentul de auto-corecție de direcție
- [[knowledge-first-development]] — versiunea epistemică: ce *zici* că știi vs ce demonstrezi că știi
