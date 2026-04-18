---
title: "Value-Based Pricing — Prețul Între Alternative și Valoarea Percepută"
type: concept
category: decision-framework
sources: [strategy-foundations-skills-suite, pat-walls-agent-first-1t-thread]
entities: [alteramens]
related: [good-better-best-pricing, jobs-to-be-done, bootcamp-pricing, voice-of-customer, outcome-based-pricing, agent-native-startup]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Value-Based Pricing

Prețul **nu** derivă din costul de a livra. Derivă din valoarea pe care clientul percepe că o primește, ancorată de alternativele lui. Cost-plus pricing (cost × markup) = bani lăsați pe masă sau un produs prea scump.

## Cele patru ancore de preț

Orice preț se poziționează între 4 nivele:

```
┌───────────────────────────────┐
│ Customer's perceived value    │  ← Tavanul (maxim posibil)
├───────────────────────────────┤
│ Your price                    │  ← Aici te poziționezi
├───────────────────────────────┤
│ Next best alternative         │  ← Podeaua pentru diferențiere
├───────────────────────────────┤
│ Your cost to serve            │  ← Doar baseline, NU basis
└───────────────────────────────┘
```

**Key insight**: prețul tău stă **între alternative și valoarea percepută** — nu deasupra valorii (pierzi clienți), nu sub alternative (pierzi marje și transmiți semnal greșit despre calitate).

**Costul** apare doar ca **constrângere inferioară absolută** (nu poți vinde cu pierdere sustenabil) — dar nu ca punct de pornire pentru decizia de preț.

## Cele trei axe pe care le decizi

Pricing NU e "câți dolari?". E o decizie pe 3 axe care interacționează:

### 1. Packaging
Ce e inclus la fiecare tier?
- Features / limits / support level
- Cum diferă tier-urile între ele

### 2. Pricing Metric (value metric)
La ce se referă prețul?
- Per user, per usage, flat fee, per transaction, per feature

### 3. Price Point
Cât costă efectiv?
- Dollar amounts reale
- Perceived value vs. cost

**Cele 3 axe se decid împreună.** Nu poți optimiza una fără consecințe pe celelalte.

## Value metric — principiul operațional

**Întrebare test**: "Pe măsură ce clientul folosește mai mult din [metric], primește mai multă valoare?"

- Da → good value metric (scalează cu valoarea)
- Nu → prețul nu aliniază cu valoarea; vei avea conflict (client care plătește mult dar primește puțin → churn)

| Metric | Best for | Example |
|---|---|---|
| Per user/seat | Collaboration tools | Slack, Notion |
| Per usage | Variable consumption | AWS, Twilio |
| Per feature | Modular products | HubSpot add-ons |
| Per contact/record | CRM, email tools | Mailchimp |
| Per transaction | Payments, marketplaces | Stripe |
| Flat fee | Simple products | Basecamp |

**Good value metric** = (1) aliniază preț cu valoare, (2) easy to understand, (3) scalează pe măsură ce clientul crește, (4) hard to game.

## Research methods pentru willingness-to-pay

### Van Westendorp Price Sensitivity Meter

4 întrebări deschise către clienți țintă:
1. La ce preț l-ai considera **too expensive** (wouldn't consider)?
2. La ce preț l-ai considera **too cheap** (question quality)?
3. La ce preț e **expensive but might consider**?
4. La ce preț e **a bargain**?

Analizează intersecțiile → găsești zona de preț acceptabilă (range) + punctul optim.

### MaxDiff analysis

Identifici ce **features** clienții value most pentru tier packaging:
- Arată sets de features
- Întreabă: most important? least important?
- Rezultatele informează ce feature merge în ce tier.

## Când (și cum) ridici prețul

### Semnale că e timpul

**Market**:
- Competiții au ridicat
- Prospects nu flinch la preț actual
- Feedback "it's so cheap!"

**Business**:
- Conversion rate foarte mare (>40%)
- Churn foarte mic (<3% lunar)
- Unit economics puternice

**Product**:
- Valoare semnificativă adăugată de la last pricing
- Produs mai matur/stabil

### Strategii concrete

1. **Grandfather existing**: preț nou doar pentru clienți noi (zero churn risk)
2. **Delayed increase**: anunță 3–6 luni în avans (opportunity to lock in)
3. **Tied to value**: ridici preț dar adaugi features (narative pozitivă)
4. **Plan restructure**: schimbi planurile complet (reset, ok mai rar)

## Pricing page — elemente non-negociabile

- Tier comparison table clar
- Recommended tier evidențiat ([[good-better-best-pricing]])
- Monthly/annual toggle + annual discount 17–20%
- CTA primar per tier
- Feature comparison matrix
- Who each tier is for (personas)
- FAQ secțiune
- Money-back guarantee (reduce anxiety)
- Customer logos / trust signals

## Legătură cu alte concepte

- **[[jobs-to-be-done]]**: "perceived value" se măsoară prin **cât de bine faci JOB-ul** vs. alternative, nu prin features. Pricing-ul high-end justifică doar când job-ul e făcut better/faster/safer decât next best alternative
- **[[good-better-best-pricing]]**: arhitectura de tier-uri care operaționalizează "price between alternatives and perceived value"
- **[[bootcamp-pricing]]**: caz particular — time-bounded packaging ca alternativă la perpetual SaaS; valoarea percepută e ancorată de transformare, nu acces continuu
- **[[voice-of-customer]]**: frazele clienților despre "cât le-a costat până acum problema" = ancoră directă pentru WTP

## De ce contează pentru Alteramens

- **Solo + timp limitat**: nu poți face 50 de interviuri Van Westendorp. Folosește 5–10 interviuri + watering hole mining (comp reviews) ca proxy
- **Next best alternative** pentru produsele Alteramens (nbrAIn, etc.) e rareori zero — de obicei e Excel + ChatGPT manual sau un competitor local cu UX prost. Asta ancorează **floor-ul** tău
- **[[productize-yourself]]**: prețul care exprimă specific knowledge + judgment diferențiat nu concurează pe costul de a livra. Concurează pe valoarea percepută a expertizei encodate

## Anti-patterns

1. **Cost-plus pricing** (costul meu × 2): nu ține cont de value percepută → prea ieftin sau prea scump, depinde de alternative
2. **Copy competitor pricing**: ignori că ai alt cost structure și altă valoare percepută
3. **One-size-fits-all** (single price): pierzi segment-ul high-WTP (nu extractezi suficient) și low-WTP (aliniază sub perceived value)
4. **Value metric wrong**: per-seat când valoarea e per-automation → clientul auto-regulează usage pentru a păstra seat-count jos, churn crește

## Agent-Native Era: outcome-based ca specializare

[[pat-walls-agent-first-1t-thread]] argumentează că în era agent-native, per-seat devine incoherent pentru că un "seat" e un agent care face 10k calls/minute. Soluția pe care o propune (și care e deja validată în startup-uri ca Decagon, 11x) e [[outcome-based-pricing]] — plătești când hit-uiește revenue în cont.

Outcome-based pricing e o **specializare** a value-based pricing-ului pentru produse agent-native, nu o filosofie nouă. Principiul rămâne același ("prețul = valoarea percepută, nu costul"). Ce se schimbă e că în agent-native, cel mai curat proxy pentru valoarea percepută e outcome-ul agentului însuși. Vezi [[outcome-based-pricing]] pentru când se aplică, când nu, și implicațiile pentru [[nbrain-concept]] (care momentan are 50 EUR/month flat).
