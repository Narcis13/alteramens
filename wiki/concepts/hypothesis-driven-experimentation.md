---
title: "Hypothesis-Driven Experimentation — Ipoteză Falsifiabilă Înainte de Cheltuială"
type: concept
category: decision-framework
sources: [paid-acquisition-skills-suite]
entities: []
related: [ice-prioritization, performance-data-loop, angle-diversification, validate-before-build, kill-fast, encoded-judgment]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Hypothesis-Driven Experimentation

Principiul fundamental al oricărei cheltuieli de acquisition (bani, timp, atenție): **nicio cheltuială înainte de o ipoteză falsifiabilă**. "Let's see what happens" nu e strategie — e ruletă plătită.

## Formularea ipotezei

Structura canonică, non-negociabilă:

```
Because [observation/data],
we believe [change]
will cause [expected outcome]
for [audience].
We'll know this is true when [metrics].
```

Fiecare piesă are rol:

- **Because** — ancorezi ipoteza în realitate observată (nu presupusă). Dacă nu ai date, nu ai ipoteză; ai speranță.
- **We believe** — schimbarea specifică, testabilă. O singură variabilă.
- **Will cause** — efectul așteptat, în direcție și magnitudine.
- **For** — audiența relevantă (nu "toți"; toți = nimeni în acquisition).
- **We'll know when** — metrica pe care o vei măsura ca să validezi sau să infirmi.

### Weak vs Strong

**Weak**: "Changing the button color might increase clicks."

Ce lipsește: datele observate, mărimea așteptată, audiența, metrica — adică tot.

**Strong**: "Because users report difficulty finding the CTA (heatmaps show hesitation + session recordings show 12s scroll-up), we believe making the button larger and contrasting will increase CTA clicks by 15%+ for new visitors. We'll measure CTR from page view to signup start."

## De ce contează, în cifre

**Ipoteză slabă** = test fără criteriu de succes clar → oricare rezultat poate fi "interpretat favorabil" → înveți nimic → repeți variațiile aceleiași greșeli.

**Ipoteză puternică** = criteriu binar → rezultatul e validat sau infirmat → înveți în ambele cazuri → învățările compound în playbook.

Win rate-ul normal într-un program de experimentare matur e **20-30%** (vezi [[performance-data-loop]]). Asta înseamnă **70-80% dintre teste sunt "losers"**. Fără ipoteză clară, losers sunt pierderi totale. Cu ipoteză clară, losers dezvăluie ce **nu** e cauza — și asta e date la fel de valoroase ca winners.

## Aplicarea în cele 3 skill-uri

### paid-ads
Înainte de a lansa o campanie: "Because [audience X] has [pain Y] surfaced în [source Z], we believe campaign with [creative angle] will achieve [CPA target] on [platform] for [audience segment]." Dacă nu poți completa blank-urile, nu ești gata să cheltui.

### ad-creative
Fiecare angle e o ipoteză în sine: "Because [VoC fragment] indică [motivație], angle-ul [pain/outcome/social proof/...] va genera CTR mai mare decât alternativa." Angles-uri diferite sunt ipoteze diferite, nu variații cosmetice.

### ab-test-setup
Structura ipotezei **este** skill-ul. Fără hypothesis, testul e un sondaj.

## Anti-pattern-uri

1. **"Let's see what happens"** — cheltuială fără ipoteză; rezultatul e ambiguu oricum
2. **Hypothesis care nu poate fi infirmată** — "our brand will improve" nu e ipoteză, e dorință
3. **Multi-variable testing fără factorial design** — nu știi ce a cauzat ce; lecție pierdută
4. **Hypothesis post-hoc** — inventezi ipoteza după ce vezi datele pentru a justifica rezultatul; auto-înșelare
5. **Ignorarea datelor care infirma** — "acele metrici nu contau de fapt"; adaptarea criteriului retroactiv invalidează întreaga disciplină

## Legătura cu validarea

Hypothesis-driven experimentation e **același mecanism** ca [[validate-before-build]], aplicat la layer-ul de acquisition în loc de product:

- Validate-before-build: "Care e problema? Ce dovadă am? Cum știu că am rezolvat-o?"
- Hypothesis-driven acquisition: "Care e mesajul? Ce dovadă am că rezonează? Cum știu dacă a funcționat?"

Ambele refuză execuția fără criteriu de succes măsurabil.

[[kill-fast]] e corolarul: dacă o ipoteză a fost infirmată clar, **retire-uiește variantă / campanie / test**, nu "mai încearcă o lună să vezi". Disciplina infirmării e la fel de importantă ca disciplina formulării.

## Legătura cu Skill Era

Ipoteza ca contract structural transformă o **abilitate** (experiență senior în ads) într-un **artefact** (template care forțează structura corectă). `/ab-test-setup` o face automat — întreabă pentru fiecare câmp până are ipoteza completă.

Ăsta e [[encoded-judgment]] în formă pură: judgmentul "trebuie să ai ipoteză clară" e extras din capul unui growth expert și devine un workflow reproductibil care nu depinde de cine îl invocă.

## Checklist rapid — înainte de orice experiment

- [ ] Am completat toate 5 câmpurile (Because / We believe / Will cause / For / We'll know when)?
- [ ] Am observat concret datele în "Because"? (nu "cred că...")
- [ ] Schimbarea e o singură variabilă?
- [ ] Efectul e în magnitudine, nu doar direcție?
- [ ] Audiența e un segment specific, nu "all traffic"?
- [ ] Metrica e măsurabilă cu instrumentele existente?
- [ ] Aș accepta rezultatul chiar dacă infirma ipoteza?

Dacă ultimul e "nu" — ai o ipoteză motivată, nu una științifică. Reformulează.
