---
title: "Dynamic Save Offer"
type: concept
category: pattern
sources: [lifecycle-retention-skills-suite]
entities: []
related: [voluntary-vs-involuntary-churn, churn-health-score, value-before-ask, friction-cost, encoded-judgment]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Dynamic Save Offer

Principiul central al oricărui cancel flow eficient: **offer-ul prezentat în momentul cancel trebuie să corespundă motivului pentru cancel**. Un discount nu salvează pe cineva care nu folosește produsul. O roadmap de feature nu salvează pe cineva care nu-și permite planul. Același "save offer" aplicat uniform tuturor lasă între 50-80% din save-uri pe masă.

## Formularea principiului

Cancel-ul nu e un eveniment omogen. Este capătul vizibil al unor nemulțumiri diferite — price sensitivity, lipsă de engagement, lipsă de feature, concurență mai bună, probleme tehnice, context temporar sau închidere de business. Fiecare din acestea **are o intervenție naturală** care poate schimba decizia; aplicarea unei intervenții greșite nu doar că eșuează, dar și confirmă utilizatorului că produsul nu îl înțelege.

Suite-ul [[lifecycle-retention-skills-suite|Lifecycle & Retention]] materializează principiul prin cancel flow-ul cu exit survey → dynamic offer bazat pe reason selectat.

## Mapping-ul standard reason → offer

| Cancel Reason | Primary Offer | Fallback Offer | De ce funcționează |
|---|---|---|---|
| Too expensive | Discount 20-30% / 2-3 luni | Downgrade la plan mai mic | Adresează direct price sensitivity; timeframe limitat evită trainingul de "cancel for deal" |
| Not using it enough | Pause 1-3 luni | Free onboarding session | Respectă realitatea — nu au nevoie acum sau nu știu să-l folosească; discount ar fi insult |
| Missing a feature | Roadmap preview + timeline | Workaround guide | Oferă vizibilitate în roadmap — transformă "missing" în "coming"; dacă nu e pe roadmap, workaround |
| Switching to competitor | Comparison + discount | Feedback session | Arată conștientizare competitivă, oferă motiv de recalibrare |
| Technical issues | Escalate to support immediately | Credit + priority fix | Problema e serviciul livrat, nu price — fix-ul și acknowledgment-ul salvează mai mult decât offer |
| Temporary / seasonal | Pause | Downgrade temporar | User-ul va reveni natural — pause păstrează data și relația |
| Business closed | Skip offer — respect situation | — | Presiune aici damage brand; win-ul e bunăvoința pentru viitor |

## De ce e judgment, nu flow chart

Mapping-ul de mai sus pare mecanic, dar judgment-ul este:
1. **Exit survey trebuie să dea reason-ul fără guilt trip** — framing-ul "Help us improve" > "Why are you leaving?"
2. **Offer-urile fallback există pentru că primul offer poate fi refuzat sau irelevant** pentru sub-segmente (ex: cineva "too expensive" pe planul cel mai mic nu poate downgrade)
3. **Offer-ul nu trebuie să fie atât de generos încât să creeze adverse selection** — 50%+ discount trainează utilizatori să anuleze periodic pentru deal-uri
4. **LTV-ul post-save contează** — un "saved" customer care pleacă 30 zile mai târziu n-a fost salvat; tracking save-cohort LTV distinge win-urile reale
5. **Respectarea cancel-ului e la fel de importantă** — "continue cancelling" vizibil, fără dark patterns (FTC Click-to-Cancel rule în SUA)

## Sweet spots calibrate empiric

- **Discount**: 20-30% pentru 2-3 luni este optimul. Sub 20% se simte simbolic; peste 30% creează precedent de "cancel-to-discount". Show dollar amount saved, nu doar procent.
- **Pause**: 1-3 luni max. 60-80% dintre cei care pauzează revin. Pauze >3 luni rareori reactivează — lock-in-ul mental dispare.
- **Downgrade**: framing "right-size your plan", nu "downgrade". Show ce păstrează vs. ce pierde. Path clar înapoi sus.

## Benchmarks associated

Cu un dynamic save offer bine construit:
- Cancel flow save rate: **25-35%** (vs. 0% fără flow, 10-15% cu single-offer generic)
- Offer acceptance rate (din cei care văd offer-ul): **15-25%**
- Pause reactivation rate: **60-80%**

## Anti-patterns

- **Un singur offer pentru toate reason-urile** — același discount 20% trimis unui user care nu folosește produsul și unui user price-sensitive. Primul nu se convinge, al doilea accepta oricum cu mai puțin.
- **Offer absent** — cancel instant fără intervenție. Lasă pe masă 10-35% save rate — dar și semnal că founderul nu vede churn-ul ca problemă.
- **Offer care se simte manipulativ** — pop-up-uri succesive, "Are you sure? Really sure?" damage brand mai mult decât churn-ul prevenit.
- **Discount prea mare** — 50%+ creează adverse selection și trainează comportament
- **Save offer pentru "business closed"** — presiune pe context inevitabil; win-ul real e graceful exit pentru bunăvoința viitoare
- **Ignoring involuntary churn în timp ce optimizezi voluntary** — vezi [[voluntary-vs-involuntary-churn]] și [[dunning-stack]]; involuntary e adesea mai recuperabil

## Legătura cu Alteramens

Pentru un solo builder cu 10h/săptămână, un dynamic save offer corect e **cel mai mare ROI per oră** în retention. Un cancel flow cu exit survey + 3 offer-uri mapate poate fi construit într-o zi, rulează pentru totdeauna, și salvează 25%+ din revenue-ul care s-ar fi pierdut — valoare compounding.

Relația cu [[value-before-ask]]: save offer e inversul. La signup, livrezi valoare înainte de cerere. La cancel, oferi intervenție înainte de a lăsa pe user să plece — dar **doar dacă intervenția e relevantă**, altfel confirmă că nu-l înțelegi.

Pattern-ul `reason → response` e generalizabil dincolo de churn. Este încă un caz de [[encoded-judgment]] aplicat: regula nu e "oferă discount", ci "diagnostichează cauza și intervine specific". Acest tip de decision tree, encodat într-un skill invocabil, este literal ce propovăduiește [[skill-era]].

## Contexte în care se aplică diferit

- **B2B enterprise high-touch**: dynamic save offer devine "route to CSM" pentru top 10-20% MRR — customer success face o conversație în loc de un modal
- **Hardware / physical products**: reason-urile diferă (shipping, product defect); offer-urile includ replacement, nu doar discount
- **Free tier products**: nu există "cancel" propriu-zis — pattern-ul devine re-engagement ([[viral-artifacts]] pt că userul plecat poate reveni organic)
