---
title: "CRO Skills Suite — Expertiză Coordonată pentru Optimizarea Conversiilor"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-14
guided: false
entities: [alteramens]
concepts: [value-before-ask, friction-cost, progressive-commitment, aha-moment, escape-hatch-principle, context-aware-interrupt]
key_claims:
  - "Fiecare câmp dintr-un formular costă conversii: 3 câmpuri = baseline, 4-6 = -10-25%, 7+ = -25-50% (form-cro)"
  - "Momentul aha — acțiunea care corelează cel mai puternic cu retenția — este unitatea operațională a onboarding-ului, nu signup-ul (onboarding-cro)"
  - "Paywall-ul trebuie să apară după momentul de valoare, nu înainte de frustrare — orice altceva e conversion killer (paywall-upgrade-cro)"
  - "Popup-urile declanșate prin click (self-selected) converteasc 10%+ vs. 2-5% pentru popup-uri bazate pe timp (popup-cro)"
  - "Placeholders nu sunt labels — când utilizatorul începe să tasteze, textul dispare și rămâne nesigur ce completează (form-cro, signup-flow-cro)"
  - "Intrusive interstitials (popup-uri full-screen pe mobil) penalizează SEO conform ghidurilor Google (popup-cro)"
  - "Guest checkout-ul ar trebui să fie default pentru e-commerce — crearea contului poate fi post-cumpărare sau SSO cu un click (signup-flow-cro)"
confidence: high
---

# CRO Skills Suite

Un set de 6 skill-uri coordonate pentru optimizarea conversiilor, fiecare cu un focus diferit, dar bazate pe aceleași principii fundamentale. Această pagină documentează suite-ul ca un singur corp de expertiză — nu ca 6 surse independente — pentru că skill-urile se referă reciproc și formează un vocabular coerent.

Skill-urile live în `.claude/skills/` și sunt invocabile direct prin `/<nume-skill>` în Claude Code.

## Cele 6 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **page-cro** | `.claude/skills/page-cro/SKILL.md` | Orice pagină de marketing (homepage, landing, pricing, feature, blog) |
| **signup-flow-cro** | `.claude/skills/signup-flow-cro/SKILL.md` | Fluxul de înregistrare / activare trial |
| **onboarding-cro** | `.claude/skills/onboarding-cro/SKILL.md` | First-run experience după signup până la momentul aha |
| **form-cro** | `.claude/skills/form-cro/SKILL.md` | Formulare non-signup (lead capture, contact, demo, survey) |
| **popup-cro** | `.claude/skills/popup-cro/SKILL.md` | Popup-uri, modaluri, overlay-uri, bannere |
| **paywall-upgrade-cro** | `.claude/skills/paywall-upgrade-cro/SKILL.md` | Paywall in-app, upgrade screens, upsell, feature gates |

## Principiile fundamentale pe care le împărtășesc

Toate 6 skill-urile, deși aplicate la surfețe diferite, derivă din același set de principii. Aceste principii au fost extrase ca pagini de [[concepts]] separate:

- **[[value-before-ask]]** — demonstrează valoare înainte de a cere angajament (date, signup, plată)
- **[[friction-cost]]** — fiecare punct de fricțiune are cost cuantificabil în conversii
- **[[progressive-commitment]]** — arhitectează fluxurile în pași escaladați, fiecare mai ușor după cel anterior
- **[[aha-moment]]** — identifică acțiunea care corelează cu retenția și orchestrează totul în jurul ei
- **[[escape-hatch-principle]]** — orice întrerupere trebuie să ofere o ieșire demnă, non-punitivă
- **[[context-aware-interrupt]]** — intervenții la momentul de relevanță maximă + disruption minimă

## Afirmații-cheie per skill

### page-cro
Analiza unei pagini se face în 7 dimensiuni, ordonate după impact: (1) claritatea propunerii de valoare, (2) eficacitatea headline-ului, (3) CTA (placement, copy, ierarhie), (4) ierarhia vizuală, (5) trust signals, (6) gestionarea obiecțiilor, (7) puncte de fricțiune. Output-ul se structurează în Quick Wins, High-Impact Changes, Test Ideas.

### signup-flow-cro
Fiecare câmp reduce conversia. Priorități tipice: Email + Password = esențial; Name = des necesar; Company, Role, Team size, Phone = aproape întotdeauna amânabile prin progressive profiling. Social auth (Google, Microsoft) deseori convertesc mai bine decât email+password. Magic links și passwordless sunt alternative viabile.

### onboarding-cro
Patru principii: (1) Time-to-value is everything, (2) Un singur obiectiv per sesiune, (3) Do, don't show (interactiv > tutorial), (4) Progresul creează motivație. Empty states sunt oportunități de onboarding, nu capete de drum. Checklist-urile de onboarding ar trebui să aibă 3-7 items, ordonate după valoare, cu opțiune de dismiss.

### form-cro
Regula cost/câmp: 3 câmpuri = baseline, 4-6 = 10-25% reducere completare, 7+ = 25-50%+ reducere. Pentru fiecare câmp: "este strict necesar înainte să-i putem ajuta?" Single column > multi-column. Labels vizibile > placeholder-only (textul dispare la tastare). Copy CTA: "[Acțiune] + [Ce primesc]" bate "Submit".

### popup-cro
Trigger-uri, ordonate de la cel mai rău la cel mai bun: < 30s fix (evitare), timp > 30s (acceptabil), scroll 25-50% (engagement signal), exit intent (ultima șansă), click-triggered (self-initiated, 10%+ conversie). Niciodată popup-uri în fluxurile de checkout/conversie. Benchmarks: email popup 2-5%, exit intent 3-10%, click-triggered 10%+.

### paywall-upgrade-cro
Trigger-uri validate: feature gates (click pe feature paid), usage limits (limită atinsă), trial expiration (early warnings 7/3/1 zile), prompts bazate pe timp după aha moment. Componente: headline cu beneficiu, preview valoare, comparație planuri, pricing clar, social proof, CTA specific, escape hatch clar. Anti-pattern: "A cere înainte de valoare livrată" este cel mai frecvent conversion killer.

## De ce am ingerat ca suite, nu separat

Skill-urile partajează un vocabular comun (friction, aha moment, progressive commitment, value-first, escape hatch) și se cross-referențiază în secțiunile "Related Skills". Extragerea celor 6 concepts cross-cutting permite querying-ul pattern-urilor fără a duplica conținutul în 6 pagini de source.

Când un skill individual va fi aplicat pe un proiect real (ex: paywall-ul pentru un SaaS Alteramens) și va produce learnings non-evidente, se va crea o pagină de concept specifică sau se va adăuga o secțiune într-un concept existent — dar nu preventiv.

## Cum se leagă de filosofia Alteramens

- Aceste skill-uri SUNT [[encoded-judgment]] — expertiză productizată, invocabilă prin command, exact ce propovăduiește [[skill-era]]
- Complementare cu [[validate-before-build]]: CRO-ul intervine DUPĂ validare (nu ai nevoie de paywall optimization dacă nu ai utilizatori)
- În context de solo builder cu timp limitat, regula "fiecare câmp are cost" se extinde și la [[productize-yourself|propriul produs]]: nu construi ce nu e necesar pentru a ajunge la primul payment

Vezi [[cro-framework-alteramens]] pentru framework-ul aplicat pe proiecte Alteramens.
