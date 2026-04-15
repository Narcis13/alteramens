---
title: "Context-Aware Interrupt"
type: concept
category: pattern
sources: [cro-skills-suite]
entities: []
related: [aha-moment, escape-hatch-principle, value-before-ask, friction-cost]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Context-Aware Interrupt

Orice intervenție (popup, modal, upgrade prompt, tooltip, banner, paywall) trebuie să apară la **momentul de relevanță maximă + disruption minimă**. Trigger-urile bazate doar pe timp sau doar pe frecvență ignoră contextul și produc sau fricțiune inutilă, sau ratează fereastra de conversie.

Principiul: **nu întrerupe pe baza cronometrului, întrerupe pe baza semnalului**.

## Dimensiunile contextului

Orice trigger optim combină mai multe dintre:

1. **User state**: vizitator nou vs. revenit, engaged vs. bouncing, converted vs. not-yet
2. **Page context**: pricing vs. blog vs. checkout vs. feature page
3. **Action context**: scroll depth, page count, cart state, feature click
4. **Temporal context**: după momentul [[aha-moment|aha]], înainte de frustrare, exit intent
5. **Referral context**: paid ad vs. organic vs. direct vs. email
6. **Relevance**: ce încearcă să facă acum utilizatorul

## Spectrul trigger-urilor (de la rău la bun)

Din [[cro-skills-suite|popup-cro]] și [[paywall-upgrade-cro]]:

| Trigger | Calitate | Când se folosește |
|---|---|---|
| Timp fix < 30s | ❌ Rău — annoyance | Aproape niciodată |
| Timp > 30-60s | ⚠️ Acceptabil | General site visitors, doar dacă fără opțiuni mai bune |
| Scroll 25-50% | ✅ Bun — engagement signal | Blog posts, long-form content |
| Page count | ✅ Bun — comparison behavior | Multi-page journeys, research |
| Exit intent | ✅ Bun — last chance | E-commerce, lead gen (desktop) |
| Behavior-based | ✅✅ Excelent — high-intent | Cart abandonment, pricing page visit |
| Click-triggered | ✅✅✅ Cel mai bun — self-initiated | Lead magnets, demos, upgrade buttons |
| Usage limit hit | ✅✅ Excelent — genuine barrier | Paywalls la limit |
| După aha moment | ✅✅✅ Excelent — value delivered | Paywall prompts, upsell |

Benchmark-uri reale: click-triggered converteasc 10%+, în timp ce timp-bazat stă la 2-5%.

## Cele două erori clasice

### Eroarea 1: Prea devreme (disruption fără relevanță)
- Popup la 2 secunde după load — utilizatorul încă identifică ce e pagina
- Newsletter signup înainte ca utilizatorul să vadă content
- Upgrade prompt în onboarding înainte de [[aha-moment|aha]]
- "Would you like to chat?" înainte ca utilizatorul să fi scrollat

Efect: enervare, bounce imediat, damage la brand.

### Eroarea 2: Prea târziu (oportunitate ratată)
- Exit intent popup la utilizatori care deja au decis să plece
- Paywall după frustrare (utilizatorul a lovit limita și a plecat)
- Upsell după churn
- Newsletter la utilizatori care nu mai revin

Efect: conversii lăsate pe masă, costuri sunt de acquisition.

## Regulile aplicate

1. **Exclude fluxurile de conversie**: niciun popup, niciun modal, niciun banner pe checkout sau în signup. Angajamentul e deja în curs — nu-l distrage.
2. **Match offer-ul cu contextul paginii**: popup cu 10% discount pe blog (fără CTA de cumpărare) e deplasat; același popup pe product page are sens.
3. **Segmentează după sursă**: paid ad → match messaging cu ad-ul; organic → offer general; email → diferit, utilizatorul deja e warm.
4. **Exclude converted / recently dismissed**: nu arăta popup email capture unui utilizator care deja a dat email.
5. **Cool-down periods**: zile, nu ore, după un dismiss.

## Aplicații per skill

### popup-cro
Spectrul trigger-urilor de mai sus e în primul rând formulat aici. Mobile nu are exit intent — folosește back button detection sau scroll up.

### paywall-upgrade-cro
Timing: după value moment, înainte de frustrare. Niciodată în onboarding, niciodată în flow activ. Usage limits = trigger legitim pentru că utilizatorul a experimentat valoarea (a atins limita = a folosit feature-ul).

### page-cro
Intrusive interstitials penalizează SEO (Google guidelines). Banner-ele de top (cookie, anunțuri) sunt acceptabile; full-screen overlays pe mobil înainte de content — nu.

### onboarding-cro
Tooltips și guided tours au tot context — doar când un feature e non-evident, doar în primele sesiuni, doar dacă nu a fost dismissed anterior.

### signup-flow-cro
Context-awareness aici înseamnă trigger-uri de re-engagement: verification reminders la 24h dacă n-a verificat, "are you still signing up?" la 72h.

### form-cro
Scroll-triggered forms (apar pe măsură ce utilizatorul arată intenție) > forms care blochează pagina.

## Legătura cu Alteramens

La nivel de produs: înainte de a implementa orice întrerupere în UI, pune-ți cele 2 întrebări:
1. **De ce acum?** (contextul justifică)
2. **De ce pentru acest utilizator?** (segmentarea e corectă)

Dacă răspunsul la oricare e slab, întreruperea nu e gata.

La nivel de [[distribution-over-product|distribuție]]: același principiu se aplică la când-întrerupi-o-persoană-pe-Twitter vs. când-postezi-un-thread. Cel mai bun marketing e cel care apare exact când există nevoie, nu pe bază de calendar.

## Legătura cu alte concepte

- **[[aha-moment]]**: cel mai bun context pentru prompt-uri majore (upgrade, share) e după aha
- **[[escape-hatch-principle]]**: contextul bun nu scutește de escape hatch — ambele sunt necesare
- **[[friction-cost]]**: întreruperile rau-trigger-uite sunt fricțiune negativă (reduc conversia inclusiv pentru utilizatorii viitori care nici n-au văzut popup-ul)
- **[[longitudinal-user-model]]**: modelarea utilizatorului pe termen lung permite context-aware interrupts sofisticate (nu a mai intrat de 30 zile → re-engagement; tocmai a atins aha → upsell)
