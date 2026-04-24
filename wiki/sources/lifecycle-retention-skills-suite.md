---
title: "Lifecycle & Retention Skills Suite — Activare, Prevenție Churn, Viralitate"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-14
guided: true
entities: [alteramens]
concepts: [dynamic-save-offer, voluntary-vs-involuntary-churn, dunning-stack, churn-health-score, referral-loop, peer-voice-outreach, value-before-ask, aha-moment, friction-cost, encoded-judgment, skill-era]
key_claims:
  - "Voluntary churn (user cancel) e 50-70% din total; involuntary (failed payment) e 30-50% — și ultima e adesea mai recuperabilă (churn-prevention)"
  - "Dynamic save offer: match offer la cancel reason — discount nu salvează pe cineva care nu folosește produsul, feature roadmap nu salvează pe cineva care nu-și permite (churn-prevention)"
  - "Dunning stack: pre-dunning (card expiry alerts, backup method, card updaters) → smart retry (24h/3d/5d/7d) → dunning emails escalating → grace period → hard cancel. Recovery benchmark bun: 60%+ (churn-prevention)"
  - "Cel mai bun save e înainte de click-ul Cancel: 8 leading signals (login drop 50% = 2-4 săpt, data export = zile) agregate într-un health score 0-100 cu intervenții gradate (churn-prevention)"
  - "Discount sweet spot 20-30% pentru 2-3 luni; >50% trainează utilizatori să anuleze pentru deal-uri. Pause 1-3 luni max, 60-80% reactivare (churn-prevention)"
  - "Cold email: write like a peer, not a vendor. Dacă scoți personalizarea și emailul are sens, personalizarea nu funcționează — trebuie să conducă natural în problemă (cold-email)"
  - "Subject lines cold email: 2-4 cuvinte, lowercase, internal-looking ('reply rates', 'hiring ops') — job-ul e doar să fie deschis, nu să vândă (cold-email)"
  - "Follow-ups cold email: 3-5 emailuri, gap-uri crescătoare, fiecare cu unghi nou (nu 'just checking in'). Fiecare stand-alone — poate nu l-au citit pe precedentul (cold-email)"
  - "Email sequence: one email, one job, one CTA. Welcome 5-7 emails / Nurture 6-8 / Re-engage 3-4. Email 1 imediat, apoi 1-2 zile / 2-4 zile / săptămânal (email-sequence)"
  - "Referral loop: Trigger Moment → Share → Convert → Reward → Loop. Trigger moments eficiente: imediat după aha, după milestone, după support excepțional, după renewal (referral-program)"
  - "Referred customers: 16-25% LTV mai mare, 18-37% churn mai mic, refer la rata 2-3x comparativ cu customers din alte canale (referral-program)"
  - "Double-sided rewards (ambii primesc) au conversie mai mare decât single-sided; framing win-win. Tiered rewards gamifică și cresc engagement-ul (referral-program)"
  - "Cancel flow UI: păstrează 'continue cancelling' vizibil (no dark patterns) — ascunderea anulării breed resentment și violează FTC Click-to-Cancel (churn-prevention)"
confidence: high
---

# Lifecycle & Retention Skills Suite

Un set de 4 skill-uri coordonate care guvernează **ce se întâmplă după signup**: activarea prin email-uri automatizate (email-sequence), achiziția proactivă prin outreach (cold-email), prevenția pierderii de revenue (churn-prevention) și amplificarea organică prin utilizatori existenți (referral-program). Skill-urile trăiesc în `.claude/skills/` și sunt invocabile prin `/<nume-skill>`.

## Cele 4 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **email-sequence** | `.claude/skills/email-sequence/SKILL.md` | Multi-email automated flows — welcome, nurture, onboarding, re-engage, win-back, dunning |
| **cold-email** | `.claude/skills/cold-email/SKILL.md` | B2B outbound — cold emails + follow-up sequences care primesc replies |
| **churn-prevention** | `.claude/skills/churn-prevention/SKILL.md` | Cancel flows + save offers + dunning + health scores pentru voluntary și involuntary churn |
| **referral-program** | `.claude/skills/referral-program/SKILL.md` | Customer referrals + affiliate programs — ciclu viral și ROI de amplificare |

## Principiile fundamentale pe care le împărtășesc

Cele 4 skill-uri, deși aplicate pe momente diferite din lifecycle, derivă din pattern-uri cross-cutting. Acestea au fost extrase ca pagini de concepts separate:

- **[[dynamic-save-offer]]** — match offer la cancel reason; un discount nu salvează pe cineva care nu folosește produsul
- **[[voluntary-vs-involuntary-churn]]** — taxonomie de bază: 50-70% voluntary vs 30-50% involuntary, strategii diferite
- **[[dunning-stack]]** — pipeline failed payment recovery: pre-dunning → smart retry → emails → grace period
- **[[churn-health-score]]** — intervenție proactivă: leading signals agregați în score 0-100 cu acțiuni gradate per bucket
- **[[referral-loop]]** — Trigger → Share → Convert → Reward → Loop; trigger moments sunt momentele de aha / milestone
- **[[peer-voice-outreach]]** — scrie ca un peer care a observat ceva, nu ca un vendor — aplicabil la cold email, dar și la orice outreach human-to-human

Concepte existente care revin aici:
- [[value-before-ask]] — "Value Before Ask" e literal primul principiu în email-sequence; "lead with usefulness, earn the right to sell"
- [[aha-moment]] — trigger moment principal pentru referrals; "right after first aha moment"
- [[friction-cost]] — "one ask, low friction" în cold email; "make it easy to say yes with a one-line reply"

## Afirmații-cheie per skill

### email-sequence
**One Email, One Job, One CTA.** Fiecare email are un singur scop primar, un singur CTA principal. "Value Before Ask" ca principiu fundamental — build trust prin content, earn the right to sell.

**Sequence Length as Judgment**:
- Welcome: 5-7 emails / 12-14 zile (welcome → quick win → story → social proof → objection → feature → conversion)
- Nurture: 6-8 emails / 2-3 săptămâni
- Re-engage: 3-4 emails / 2 săptămâni (check-in → value reminder → incentive → last chance)
- Onboarding: 5-7 emails / 14 zile — **coordonează cu in-app onboarding, nu duplica**
- Dunning: 4 emails (Day 0 → 3 → 7 → 10)

**Copy guidelines**: 50-125 cuvinte transactional, 150-300 educational, 300-500 story-driven. Short paragraphs, mobile-first, read aloud for humanness.

**Subject lines**: Clear > Clever; 40-60 char; emoji polarizant (test).

### cold-email
**Write like a peer, not a vendor.** Smart colleague care a observat ceva relevant și împărtășește. Dacă sună ca marketing copy, rescrie.

**Personalization must connect to the problem** — dacă scoți opening-ul personalizat și emailul încă are sens, personalizarea nu funcționează. Observația trebuie să conducă natural în why you're reaching out.

**Lead with their world, not yours** — "you/your" domină peste "I/we"; nu deschide cu cine ești sau ce face compania ta.

**Subject lines**: 2-4 cuvinte, lowercase, internal-looking ("reply rates", "hiring ops", "Q2 forecast"). NU product pitches, NU urgency, NU emoji, NU first name.

**Frameworks** (toate valide, alege pe baza situației):
- Observation → Problem → Proof → Ask
- Question → Value → Ask
- Trigger → Insight → Ask (congrats on X, which creates Y challenge...)
- Story → Bridge → Ask

**Follow-ups**: 3-5 emailuri, gap-uri crescătoare, fiecare cu unghi nou (nu "just checking in"). Fiecare stand-alone. Breakup email e ultimul — honor it.

**Ruthless short rule**: fiecare propoziție trebuie să-și câștige locul. The best cold emails feel like they could have been shorter.

**Avoid**: "I hope this email finds you well", "leverage/synergy/best-in-class", feature dumps, HTML/images, fake "Re:"/"Fwd:", identical templates cu {{FirstName}} swap, 30-min calls în first touch.

### churn-prevention
**Voluntary vs Involuntary** ca taxonomie de bază ([[voluntary-vs-involuntary-churn]]):
- Voluntary (50-70%): cancel flows, save offers, exit surveys
- Involuntary (30-50%): dunning emails, smart retries, card updaters

**Cancel Flow Structure**: Trigger → Survey → Dynamic Offer → Confirmation → Post-Cancel

**Exit Survey**: 1 întrebare, single-select, 5-8 reason options. "Help us improve" framing > "Why are you leaving?". Reason-urile determină offer-ul.

**Dynamic Save Offers** ([[dynamic-save-offer]]) — mapping reason→offer:
| Reason | Primary | Fallback |
|---|---|---|
| Too expensive | Discount 20-30% / 2-3 luni | Downgrade |
| Not using enough | Pause 1-3 luni | Free onboarding session |
| Missing feature | Roadmap + timeline | Workaround guide |
| Switching competitor | Comparison + discount | Feedback session |
| Technical issues | Escalate support | Credit + priority fix |
| Temporary / seasonal | Pause | Downgrade temporar |
| Business closed | Skip offer (respect) | — |

**Save offer sweet spots**:
- Discount: 20-30% / 2-3 luni (50%+ trainează utilizatori să anuleze pt deal)
- Pause: 1-3 luni max (60-80% reactivare; >3 luni rareori revin)
- Downgrade: framing "right-size your plan", nu "downgrade"

**Proactive retention** ([[churn-health-score]]) — 8 risk signals cu leading timeframes:
| Signal | Risk | Timeframe |
|---|---|---|
| Login frequency drops 50%+ | High | 2-4 săpt |
| Key feature usage stops | High | 1-3 săpt |
| Support tickets spike apoi stop | High | 1-2 săpt |
| Email open rate decline | Medium | 2-6 săpt |
| Billing page visits increase | High | Zile |
| Team seats removed | High | 1-2 săpt |
| Data export initiated | Critical | Zile |
| NPS <6 | Medium | 1-3 luni |

Health Score = 0.30×login + 0.25×usage + 0.15×support + 0.15×billing + 0.15×engagement.

**Dunning Stack** ([[dunning-stack]]):
- Pre-dunning: card expiry alerts (30/15/7 zile), backup payment method, card updaters (reduc 30-50% hard declines)
- Smart retry: 24h → 3z → 5z → 7z; retry în ziua lunii care a funcționat înainte
- Dunning emails (4): Day 0 friendly → Day 3 reminder → Day 7 urgency → Day 10 final. Plain text > designed.
- Decline type-aware: soft (retry 3-5×), hard (ask new card), auth required (SCA flow)

**Benchmarks recovery**: soft 70%+, hard 40%+, overall 60%+, pre-dunning prevention 20-30%.

**Benchmarks churn flow**: save rate 25-35%, offer acceptance 15-25%, pause reactivation 60-80%.

**UI principles**: păstrează "continue cancelling" vizibil (no dark patterns; FTC Click-to-Cancel rule), one primary offer + one fallback (nu wall of options), arată dollar savings concrete, mobile-friendly.

**Tools**: Churnkey (34% avg save rate), ProsperStack, Raaft, Chargebee Retention.

### referral-program
**Referral vs Affiliate** — nu sunt același lucru:
- Referral: customer existent recomandă în network-ul lui; one-time/limited rewards; higher trust, lower volume
- Affiliate: creator/influencer care poate nu e customer; ongoing commission; higher volume, variable trust

**Referral Loop** ([[referral-loop]]): Trigger Moment → Share Action → Convert Referred → Reward → Loop

**Trigger Moments high-intent** (cheia unui program care pornește):
1. Imediat după primul "aha" moment
2. După atingerea unui milestone
3. După support excepțional
4. După renewal sau upgrade

**Share mechanisms, rank by effectiveness**:
1. In-product sharing (highest conversion)
2. Personalized link
3. Email invitation
4. Social sharing
5. Referral code (works offline)

**Incentive structures**:
- Single-sided: simplu, works pt high-value products
- Double-sided: higher conversion, win-win framing
- Tiered: gamifică, crește engagement pe termen lung

**Typical findings** (proof că referrals compensează CAC-ul):
- Referred customers: 16-25% higher LTV
- Referred customers: 18-37% lower churn
- Referred customers: 2-3x rate de a referi alții

**Common problems & fixes**:
- Low awareness → in-app prompts prominente
- Low share rate → simplify la one click
- Low conversion → optimizează landing page pt referred user
- Fraud/abuse → verification, limits
- One-time referrers → tiered/gamified rewards

**Tools**: Rewardful (Stripe-native), Tolt (SaaS), Dub.co (link tracking), Mention Me (enterprise), PartnerStack, Introw.

## De ce am ingerat ca suite, nu separat

Cele 4 skill-uri partajează un vocabular comun și se cross-referențiază masiv:
- email-sequence ↔ churn-prevention (win-back, dunning emails)
- email-sequence ↔ referral-program (referral nurture sequences)
- email-sequence ↔ onboarding-cro (activation emails, nu duplicate)
- cold-email ↔ copywriting (landing pages pt unde link-uiește)
- churn-prevention ↔ paywall-upgrade-cro (trial expiration, upgrade moments)
- churn-prevention ↔ onboarding-cro (activation ca prevention la early churn)
- referral-program ↔ launch-strategy (viralitate la launch)

Extragerea celor 6 concepts cross-cutting permite querying-ul pattern-urilor fără duplicare.

## Conexiunea cu Skill Era — esența ingerării

Cele 4 skill-uri nu sunt checklist-uri — sunt **[[encoded-judgment|judgment encodat]]** în `.md`-uri invocabile:

- **Înainte**: angajai un retention specialist, un SDR, un referral program manager — sau citeai 3 cărți și improvizai. Distribuția cunoașterii era **oameni scumpi**.
- **Skill Era**: același judgment e compresat într-un SKILL.md executabil. Distribuția devine **invocare**. `/churn-prevention` rulează o decizie tree pe care 95% dintre founderii SaaS n-o știu sau o ignoră.

**Pentru un solo builder cu 10 ore/săptămână** ([[productize-yourself|Naval]]: timpul = constraint principal), asta e existențial. Nu trebuie să devii expert în dunning ca să ai un dunning stack corect. Nu trebuie să citești "Tiny Habits" ca să înțelegi trigger moments pentru referral.

**Implicația pentru Alteramens**: patterns-urile care emerg din aplicarea acestor skill-uri pe proiecte reale (nbrAIn, BunBase etc.) devin candidate pentru [[encoded-judgment]] propriu — skill-uri scrise de tine pentru agenții care vor avea aceeași problemă pe alt produs. Vezi [[lifecycle-retention-framework-alteramens]] pentru aplicare.

## Suite-uri înrudite

- **[[cro-skills-suite]]** (6 skill-uri) — conversie la momentul acțiunii; lifecycle începe unde CRO termină (post-signup)
- **[[content-copy-skills-suite]]** (4 skill-uri) — mesajul; email-sequence și cold-email sunt **canale** pentru copy-ul scris acolo
- **[[seo-skills-suite]]** (5 skill-uri) — descoperire; referral-program e alternativa low-CAC la SEO pentru achiziție
- **[[paid-acquisition-skills-suite]]** (3 skill-uri) — achiziție plătită; churn-prevention e pairing-ul natural (paid CAC fără retention = găleată cu gaură)

**Poziția Lifecycle & Retention în stiva Alteramens**: ultimul layer al funnel-ului — unde revenue-ul care intră fie se pierde (churn), fie se multiplică (referrals), fie se aprofundează (nurture / expansion).

Vezi [[lifecycle-retention-framework-alteramens]] pentru framework-ul aplicat pe proiecte Alteramens.
