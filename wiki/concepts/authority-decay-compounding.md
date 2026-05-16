---
title: "Authority-Decay Compounding"
type: concept
category: pattern
sources: []
entities: [personal-context-agent-project]
related: [twelve-layers-of-context, identity-first-storage, declared-vs-observed-gap, context-decay-heuristics, compounding-games, encoded-judgment]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Authority-Decay Compounding

> Authority + decay sunt cele două axe care fac diferența între un context-store care *compound-ează* și unul care devine *zgomot*.

Fără ele, sistemul:
- Se umple cu fapte care nu mai sunt adevărate
- Tratează toate inserările egal (declared = observed = inferred)
- Devine cu cât mai mare, cu atât mai puțin util

Cu ele:
- Fiecare fapt are o sursă de încredere atașată
- Fiecare fapt are un orizont de relevanță
- Sistemul *îmbătrânește activ* — nu doar acumulează

## Authority: sursă de încredere

Câmp tipizat pe fiecare item de context:

| Authority | Cine a scris | Trust default |
|---|---|---|
| `self-declared` | User direct | High |
| `observed` | Inferit din log/comportament agregat | Medium-high |
| `inferred` | Propus de agent (probabilist) | Low |

Distincția schimbă cum agentul folosește faptul. Două items conflictuale nu se șterg unul pe altul — coexistă, dar agentul știe care e declarat și care e observat. Asta deschide [[declared-vs-observed-gap|gap-tracking]] ca disciplină.

## Decay: orizont de relevanță

Vezi [[context-decay-heuristics]] pentru TTL per strat. Esența: fiecare fapt are `expires_at`, `confidence` scade fără refresh, și `invalidated_at` permite soft-delete păstrând history.

## De ce împreună

Authority singur, fără decay → un fapt declarat acum 2 ani rămâne `self-declared` și greu. Înșelător.

Decay singur, fără authority → toate faptele decad la fel, dar un fapt `observed` (validat de comportament) nu ar trebui să decadă la fel ca un `inferred` (probabilist).

Împreună → un fapt `self-declared` cu vârsta 18 luni și fără re-confirmare devine *low-confidence self-declared* — vizibil, dar marcat ca posibil stale. Un fapt `observed` reconfirmat săptămânal rămâne high-confidence. Sistemul construiește o ierarhie de încredere temporală.

## Compounding mechanic

```
new fact → authority(declared|observed|inferred) → confidence(low|med|high) → expires_at(per layer TTL)
              ↓
         time passes
              ↓
   no refresh → confidence drops
              ↓
   re-confirm → confidence restored + new expires_at
              ↓
   contradiction → soft-invalidate, history preserved
              ↓
   observed pattern → promotes provisional → working → load-bearing
```

Maturity ladder (provisional → working → load-bearing) e ortogonal pe authority și decay. Promovarea e *learned* — un fapt `self-declared` poate ajunge load-bearing doar dacă observed-ul îl confirmă repetat.

## Faber a dovedit jumătate din pattern

Faber are deja maturity ladder pe pages (`seed → developing → mature`) și log-ul ca temporal substrate. Ce-i lipsește: authority field-uri explicite per fapt și decay TTL per layer. [[personal-context-agent-project|Personal Context Agent]] reia maturity ladder și adaugă explicit authority + decay ca prim-clasă.

## De ce e load-bearing pentru Skill Era

Skills ([[encoded-judgment|encoded judgment]]) au nevoie de context care e *cunoscut adevărat acum*, nu adevărat la un moment dat în trecut. Fără authority+decay, skills cu context personal devin un instrument de auto-amăgire — răspund pe baza unei imagini stale. Cu authority+decay, skills răspund pe baza unei imagini *cu disclaimer epistemic* — știu ce e high-confidence și ce e probabil-stale.

Asta face skills cu context personal *trustworthy at scale*, nu doar *personal*.

## Related concepts

- [[twelve-layers-of-context]] — straturile peste care authority+decay se aplică
- [[identity-first-storage]] — arhitectura care face authority+decay câmpuri tipizate
- [[declared-vs-observed-gap]] — disciplina alimentată de authority field
- [[context-decay-heuristics]] — partea de decay detaliată
- [[compounding-games]] — versiunea game-theoretică: ce jocuri compound-ează?
- [[encoded-judgment]] — skills cu context au nevoie de authority+decay pentru a rămâne trustworthy
