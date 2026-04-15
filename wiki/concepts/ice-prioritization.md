---
title: "ICE Prioritization — Impact + Confidence + Ease"
type: concept
category: decision-framework
sources: [paid-acquisition-skills-suite]
entities: []
related: [hypothesis-driven-experimentation, performance-data-loop, kill-fast, validate-before-build, judgment, reverse-time-planning]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# ICE Prioritization

Framework standalon pentru a decide **ce să faci următor** când ai mai multe opțiuni decât timp. Fiecare opțiune e scorată pe 3 dimensiuni (1-10), iar prioritatea = media lor.

## Formula

```
ICE Score = (Impact + Confidence + Ease) / 3
```

| Dimensiune | Întrebarea |
|---|---|
| **Impact** | Dacă asta funcționează, cât de mult va muta metrica primară? |
| **Confidence** | Cât de sigur sunt că va funcționa? (Pe baza datelor, nu a intuiției) |
| **Ease** | Cât de rapid și ieftin pot livra și măsura? |

Scorezi fiecare dimensiune 1-10, calculezi media, și rulezi highest-score prima.

## De ce funcționează

ICE rezolvă două probleme ale prioritizării intuitive:

1. **Conflictul impact vs. ease** — impact mare + ease scăzut (moonshots) vs. impact mic + ease mare (quick wins) — ICE forțează să-i compari pe același scale.
2. **Bias-ul "idea frumoasă"** — ideile excitante primesc atenție disproporționată față de munca necesară. ICE scoate emoția din ecuație; scorul decide, nu entuziasmul.

**Re-scoring lunar**: contextul se schimbă — confidence urcă după date noi, ease scade dacă o dependență dispare. Scorul trebuie refresh-uit.

## Cele 3 dimensiuni în detaliu

### Impact (1-10)
Cât de mult va muta metrica dacă funcționează?

- **10**: 10x+ din baseline-ul curent (transformațional)
- **7-8**: 2-3x (major)
- **5-6**: 20-50% lift (substanțial)
- **3-4**: 5-10% lift (incremental)
- **1-2**: <5% lift (cosmetic)

**Nuanță**: impact absolut, nu relativ. Un 50% lift pe o pagină cu 10 vizitatori/lună e sub un 5% lift pe o pagină cu 10k/lună. Gândește în **expected value**, nu în procente.

### Confidence (1-10)
Cât de sigur sunt că va funcționa?

- **10**: Date directe dintr-un experiment anterior identic (replicare)
- **7-8**: Pattern validat în industrie + aliniat cu data proprie
- **5-6**: Pattern validat dar fără date proprii (transfer learning)
- **3-4**: Ipoteză plauzibilă, fără date de sprijin
- **1-2**: "Intuiție"/speculație

**Red flag**: dacă toate ideile tale au confidence 7+, probabil suprascorezi. Confidence-ul onest e greu — majoritatea ideilor sunt speculații.

### Ease (1-10)
Cât de rapid poți ship și măsura?

- **10**: Ore (ex: swap CTA copy, launch ad variant)
- **7-8**: Zile (ex: rescrie landing page, build lead magnet)
- **5-6**: 1-2 săptămâni (ex: integrare tool, flow nou)
- **3-4**: Săptămâni (ex: feature nou cu backend)
- **1-2**: Luni (ex: rewrite arhitectural)

**Include și costul măsurării**: un test care durează 8 săptămâni să atingă sample size e mai puțin "easy" decât unul care atinge în 1 săptămână, chiar dacă implementarea e la fel.

## Pattern-uri de scor și ce înseamnă

| Pattern | Interpretare | Acțiune |
|---|---|---|
| Impact 9 + Confidence 3 + Ease 2 = 4.7 | Moonshot incert, costisitor | Amână; validează ieftin înainte |
| Impact 4 + Confidence 8 + Ease 9 = 7.0 | Quick win sigur | Ship today |
| Impact 8 + Confidence 7 + Ease 7 = 7.3 | Sweet spot | Do next |
| Impact 3 + Confidence 9 + Ease 10 = 7.3 | Polish | Skip dacă există 7.3+ cu Impact mai mare |
| Impact 9 + Confidence 8 + Ease 3 = 6.7 | High-stakes bet | Break down în sub-experimente mai easy |

**Rule of thumb**: la ICE 8+, execută. ICE 6-7, backlog. ICE <6, kill unless it rises după validare.

## Aplicare dincolo de A/B testing

ICE a apărut în growth experimentation (ab-test-setup), dar aplică la orice context cu multe opțiuni și timp limitat:

- **Backlog de features** (ce să construiesc next în nbrAIn?)
- **Portfolio de proiecte Alteramens** (pe care să focusez din 10 proiecte?)
- **Marketing tactics** (care canal de acquisition să testez prima?)
- **Content strategy** (care pillar să acopăr primul?)
- **Technical debt** (ce refactoring merită acum?)

Pentru Alteramens cu 10h/săpt, ICE e un filtru operațional care previne ceea ce Naval numește "high-speed indecision": toate ideile par bune, nimic nu avansează.

## Anti-pattern-uri

1. **Scoruri inflate sistematic** — tot e 8+; framework-ul devine inutil. Forțează spread: dacă ai 10 idei, scorurile să varieze de la 3 la 9.
2. **Confidence bazat pe "îmi place"** — orice scor peste 5 trebuie să aibă dată ancoră. "Intuiție expertă" >5 doar dacă ai track record verificabil în domeniul specific.
3. **Ignore Impact în favoarea Ease** — cultură de "quick wins" pură produce 20+ wins × 3% lift = rezultat nesemnificativ agregat. Alege mix.
4. **Ignore Ease în favoarea Impact** — "big bets" numai produce 1 bet terminat în 6 luni, fără validare intermediară. Compounding lent.
5. **ICE statică** — scorată odată, niciodată re-scorată. Contextul se schimbă lunar; scorurile trebuie să se miște cu el.
6. **Scoring collective fără criterii comune** — în echipă, un "8" la impact pentru o persoană e "5" pentru alta. Definiți scale-ul împreună.

## Legătura cu alte concepte

- **[[hypothesis-driven-experimentation]]**: ICE te ajută să alegi **care** ipoteză să testezi; hypothesis te ajută **cum** să o testezi
- **[[kill-fast]]**: ICE-ul unei idei scade în timp dacă Confidence-ul nu urcă după validare; sub un prag, kill
- **[[judgment]]**: ICE e judgment cuantificat. Reducere de 15 decizii intuitive la 15 scoruri comparabile
- **[[reverse-time-planning]]**: dacă ai deadline fix, ICE-ul ideilor cu Ease scăzut scade brusc — timpul devine factorul limitant

## Legătura cu Skill Era

ICE e **judgment encodat în formă numerică**. În loc să plătești un senior să-ți spună "astea 3 merg, alea 7 nu", ai o procedură standard care forțează aceeași disciplină:

- Impact e cât mai bine măsurabil (se rafinează cu data)
- Confidence e cât mai bine ancorat (scoruri mari cer justificare)
- Ease include timpul de măsurare, nu doar implementarea

Invocarea `/ab-test-setup` cu ICE înseamnă că fiecare decizie "ce testăm next" trece prin același filtru, indiferent de cine invoca — **consistența deciziei** e la fel de valoroasă ca și decizia însăși.

## Template rapid

Pentru orice backlog, construiește acest tabel:

| Idee | Impact (1-10) | Confidence (1-10) | Ease (1-10) | ICE |
|---|---|---|---|---|
| [A] | | | | |
| [B] | | | | |
| [C] | | | | |

Sortat descrescător. Execută top 3. Re-score lunar.

Dacă scorurile sunt toate în 6-8, forțează diferențiere prin **comparație pairwise**: "între A și B, care are Impact mai mare? De ce?". Spread-ul va apărea.
