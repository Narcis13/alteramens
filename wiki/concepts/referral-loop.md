---
title: "Referral Loop"
type: concept
category: pattern
sources: [lifecycle-retention-skills-suite]
entities: []
related: [aha-moment, viral-artifacts, value-before-ask, distribution-over-product]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Referral Loop

Structura fundamentală a oricărui program de referral care funcționează: **un ciclu cu 4 etape (Trigger Moment → Share → Convert → Reward) care, corect calibrat, se închide în el însuși — fiecare referred customer devenind un potențial referrer**. Mare parte din diferența între programele de referral care explodează și cele care mor e în **calibrarea trigger moment-ului**.

## Diagrama

```
  ┌──────────────────┐
  │  Trigger Moment  │◄──┐
  └────────┬─────────┘   │
           │             │
           ▼             │
  ┌──────────────────┐   │
  │   Share Action   │   │
  └────────┬─────────┘   │
           │             │
           ▼             │
  ┌──────────────────┐   │
  │ Convert Referred │   │
  └────────┬─────────┘   │
           │             │
           ▼             │
  ┌──────────────────┐   │
  │      Reward      │───┘
  └──────────────────┘
```

Loop-ul se închide pentru că referred customer, odată ajuns la propriul trigger moment, re-intră în ciclu. Empiric: referred customers refer alții la **rata 2-3× mai mare** decât customers din alte canale.

## Etapa 1 — Trigger Moment

Cea mai importantă decizie de design. Timing-ul cererii determină dacă cererea e **întâmpinată cu entuziasm sau cu iritare**. Trigger moments high-intent:

1. **Imediat după primul [[aha-moment]]** — user-ul tocmai a experimentat valoarea; motivația de a împărtăși e maximă
2. **După atingerea unui milestone** — (ex: "ai publicat 10 posts", "ai atins 100 utilizatori în organizația ta") — user-ul e mândru și conștient de progres
3. **După support excepțional** — user-ul tocmai a fost ajutat; reciprocity bias activ
4. **După renewal sau upgrade** — act de commitment proaspăt; context perfect pentru "știi pe cineva care ar beneficia?"

**Anti-trigger moments**:
- Imediat după signup (înainte de aha) — user-ul nu știe dacă produsul merită recomandat
- În timpul support ticket unresolved — context negativ, damage relationship
- La random timing în email newsletter — conversion rate poor, dilute brand
- La churn trigger (billing page visits, engagement drop) — fix-ul e retention, nu referral

**Regula de aur**: **cere referral doar când user-ul tocmai a primit valoare**. Dacă nu poți identifica un moment recent de valoare, nu e momentul.

## Etapa 2 — Share Action

Mecanismele de share, ranked by effectiveness:

1. **In-product sharing** (highest conversion) — "Invite team member" built-in la produs
2. **Personalized link** (unique per referrer, trackable)
3. **Email invitation** — template pre-filled cu personal touch
4. **Social sharing** (LinkedIn, Twitter) — vizibilitate publică, trust variable
5. **Referral code** (works offline, lowest tracking fidelity)

**Principiul de design**: minimize friction la share. **One click ideally**. Dacă user-ul trebuie să copy-paste, scrii email manual, sau să-și amintească un cod, rata scade dramatic.

## Etapa 3 — Convert Referred

Cea mai ignorată etapă. Un referral funcționează doar dacă **persoana referred convertește**. Variabile care contează:

- **Landing experience pentru referred user** — ajunge pe o pagină care acknowledge referral-ul ("Maria recommended this")? Sau pe homepage generic?
- **Endorsement visibility** — vede user-ul referred numele referrer-ului? Testimonialul lui? Contextul recomandării?
- **Incentive for new user** — double-sided rewards (ambii primesc ceva) au conversie **mai mare decât single-sided**
- **Reduced friction pentru referred** — pot skip credit card? Obțin trial extins? Au priority support?

Un referral program cu **landing page generic** pierde 40-60% din conversii posibile vs. un program cu landing personalizat.

## Etapa 4 — Reward

Structurile de reward:

- **Single-sided** (doar referrer) — simplu, works pentru high-value products unde referrer-ul nu are nevoie de motivație extra (word-of-mouth natural)
- **Double-sided** (ambii) — higher conversion, win-win framing; "you both get X"
- **Tiered** — reward-uri care cresc cu numărul de referrals (1 = $10, 3 = $50, 10 = $200). Gamifică, crește engagement pe termen lung

**Calibrare incentive**: reward-ul trebuie să fie **suficient ca să motiveze, insuficient ca să atragă adverse selection** (oameni care vin doar pentru cash, nu pentru produs).

Exemple empirice:
- Dropbox: 500MB pe referrer + 500MB pe referred (double-sided, intrinsic la produs)
- Airbnb: $25 credit pe ambele părți (double-sided, monetar)
- Notion: 3 luni Pro pe referrer (single-sided, product value)

**Regula empirică**: reward-ul să fie ~10-20% din LTV-ul expected al referred customer. Sub asta, nu motivează. Peste asta, ROI negativ.

## Typical findings (de ce investiția în referral merită)

- Referred customers au **16-25% LTV mai mare** decât customers din alte canale
- Referred customers au **18-37% churn mai mic**
- Referred customers refer alții la **rata 2-3×** (self-reinforcing loop)

Asta înseamnă că CAC-ul prin referral program e adesea **3-5× mai mic decât paid acquisition**, iar LTV-ul e mai mare — economia e superioară indiferent de channel alternative.

## Referral vs Affiliate — distincție

| | Referral | Affiliate |
|---|---|---|
| Referrer | Customer existent | Creator/influencer, poate nu e customer |
| Reward | One-time or limited | Ongoing commission |
| Trust | Higher | Variable |
| Volume | Lower | Higher |
| Product fit | Natural word-of-mouth | Higher-ticket, justifică commission |

Referral loop-ul e pentru customers. Affiliate e un pattern similar dar cu motivație diferită (comisioane recurente) și profil diferit (content creators, nu users).

## Common problems & fixes

| Problem | Fix |
|---|---|
| Low awareness | In-app prompts prominente la trigger moments |
| Low share rate | Simplify la one click |
| Low conversion (referred) | Optimize landing page pentru referred user |
| Fraud/abuse (fake referrals) | Verification, limits per account |
| One-time referrers | Tiered/gamified rewards |

## Launch checklist rapid

### Before
- Define metrici (target referral rate, target CAC per referral)
- Design incentive structure
- Build tool / configure platform (Rewardful, Tolt, Dub.co)
- Create landing page dedicat pentru referred users
- Setup tracking și attribution
- Define fraud prevention rules
- Write T&C

### Launch
- Announce la existing customers (email)
- Add in-app prompts la trigger moments
- Update site cu program details
- Brief support team

### Post-launch (30 zile)
- Review conversion funnel (trigger → share → click → convert)
- Identify top referrers (pot fi transformați în case studies / advocates)
- Gather feedback de la referrers
- Fix friction points
- Send reminder emails la non-referrers

## Anti-patterns

- **Reward-ul la share, nu la conversion** — plătești pentru share-ul link-ului, nu pentru user nou. Invite spam.
- **Cerere de referral prea devreme** — înainte de aha moment, user-ul nu are conviction să recomande
- **Landing page generic pentru referred** — pierzi 40-60% conversion posibilă
- **Single-sided reward pentru produs comoditate** — nu ai diferențiere, ai nevoie de motivație extra pentru ambele părți
- **Discount 50%+ ca reward** — adverse selection (oameni vin pentru deal, nu pentru produs), LTV scăzut
- **Manual manual tracking** — spreadsheets cu referral-uri se strică la scale; folosește tool dedicat

## Legătura cu Alteramens

Referral loop e **alternativa low-CAC la paid acquisition** — critică pentru un solo builder cu 10h/săptămână unde bugetul de ads e limitat. Pentru orice proiect Alteramens, referral loop e **candidate Fază 3** (după primii 100-500 users reali).

**Timing pentru nbrAIn / BunBase**:
1. Fază 1 (0-100 users): nu referral — prea devreme, nu ai încă aha moment clar definit
2. Fază 2 (100-500 users): identifică trigger moment-ul natural din produs, testează manual (ask-uri directe de la founder)
3. Fază 3 (500+ users): build programul formal cu Rewardful/Tolt + landing page + attribution

Relația cu [[aha-moment]]: trigger moment principal pentru referral e imediat după aha. Fără aha moment bine definit, referral program eșuează.

Relația cu [[value-before-ask]]: cererea de referral e o **ask** — trebuie să vină după delivered value substantial, nu ca prima interacțiune.

Relația cu [[viral-artifacts]]: referral loop e **un tip de** mecanism viral (opt-in, conștient). Viral artifacts sunt forma passive (produsul însuși răspândește prin usage). Cele mai bune produse au ambele.

Relația cu [[distribution-over-product]]: product distribution care se întâmplă **prin users existenți** (nu prin paid channels) e core la thesis-ul Alteramens — leverage permissionless, compounding, inexpensive. Referral loop e unul dintre puținele mecanisme care realizează asta.
