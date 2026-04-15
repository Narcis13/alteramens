---
title: "Strategy & Foundations Skills Suite — Upstream Decisions Care Modelează Tot Restul"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-15
guided: true
entities: [alteramens]
concepts: [product-marketing-context, jobs-to-be-done, voice-of-customer, orb-channel-framework, phased-launch, value-based-pricing, good-better-best-pricing]
key_claims:
  - "product-marketing-context este root-skill-ul — fișierul `.agents/product-marketing-context.md` e citit de toate celelalte 30+ skills ca primul pas (product-marketing-context)"
  - "Jobs to be Done au trei dimensiuni: functional + emotional + social — Features vând rar, outcome-uri combinate vând mult (marketing-psychology, customer-research)"
  - "JTBD Four Forces: Pull > (Habit + Anxiety) — marketing bun reduce Habit și Anxiety la fel de mult cât amplifică Pull (product-marketing-context)"
  - "Verbatim customer language bate parafrazele: 'We were drowning in spreadsheets' > 'manual process inefficiency' (customer-research)"
  - "Confidence tiers pentru research: 3+ surse independente = High; 2 surse = Medium; single source = Low (customer-research)"
  - "Recency window: favorizează sursele din ultimele 12 luni; markets se schimbă (customer-research)"
  - "ORB framework: Owned (compoundează) + Rented (reach rapid) + Borrowed (shortcut credibility) — toate trebuie să funnel-ueze spre Owned (launch-strategy)"
  - "Product Hunt nu e magic: cere relații construite ÎNAINTE + all-day engagement pe launch day (launch-strategy)"
  - "Companiile puternice lansează din nou și din nou — fiecare feature major = mini-launch (launch-strategy)"
  - "Value-based pricing: prețul stă între next best alternative și perceived value — NU deriva din cost (pricing-strategy)"
  - "Good value metric: 'pe măsură ce clientul folosește mai mult, primește mai multă valoare?' (pricing-strategy)"
  - "Van Westendorp 4 întrebări: too expensive / too cheap / expensive but consider / a bargain — intersecția curbelor = zona optimă (pricing-strategy)"
  - "Good-Better-Best: middle e țintă, expensive ancorează, cheap filtrează. 2–3× diferență între Better și Best e sweet spot (pricing-strategy)"
  - "55 mental models organizate în 6 categorii: Foundational Thinking, Buyer Psychology, Persuasion, Pricing Psychology, Design/Delivery, Growth/Scaling (marketing-psychology)"
  - "Loss aversion: pierderile simt ~2× mai tare decât câștigurile echivalente — 'Don't miss out' bate 'You could gain' (marketing-psychology)"
  - "Minimum viable sample: 5+ data points independenți per segment înainte de a construi personas sau a trage concluzii de messaging (customer-research)"
confidence: high
---

# Strategy & Foundations Skills Suite

6 skill-uri upstream care configurează contextul strategic pe care operează celelalte 5 clustere de marketing. **Nu sunt tactici — sunt decizii care modelează tacticile.** Rula-te înainte ca orice alt cluster să aibă input corect.

## Cele 6 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **product-marketing-context** | `.claude/skills/product-marketing-context/SKILL.md` | **Root skill** — creează `.agents/product-marketing-context.md` citit de toate celelalte |
| **marketing-psychology** | `.claude/skills/marketing-psychology/SKILL.md` | 55 mental models aplicate la marketing (behavioral science) |
| **customer-research** | `.claude/skills/customer-research/SKILL.md` | ICP research, VOC, JTBD extraction, digital watering hole mining |
| **pricing-strategy** | `.claude/skills/pricing-strategy/SKILL.md` | Value-based pricing, tier structures, Van Westendorp, pricing psychology |
| **launch-strategy** | `.claude/skills/launch-strategy/SKILL.md` | ORB framework + 5-phase launch + Product Hunt specifics |
| **marketing-ideas** | `.claude/skills/marketing-ideas/SKILL.md` | 139-idea library indexat pe stage/budget/timeline/use-case — router |

## Principiile fundamentale pe care le împărtășesc

Aceste 6 skill-uri nu fac **execuție** — fac **configurație**. Toate referențiază aceleași principii, extrase ca pagini de concepts:

- **[[product-marketing-context]]** — context persistent ca primitivă: scrie o dată, citit de toate skills (encoded-judgment recursiv)
- **[[jobs-to-be-done]]** — frameworks-ul care leagă toate skill-urile: oameni angajează produse pentru outcome-uri, nu features. JTBD Four Forces (Push/Pull/Habit/Anxiety) operaționalizează switching dynamics
- **[[voice-of-customer]]** — verbatim > paraphrase; digital watering hole mining când n-ai date proprii; confidence tiers + recency window ca guardrails
- **[[orb-channel-framework]]** — Owned/Rented/Borrowed cu regula "all roads lead to Owned"
- **[[phased-launch]]** — 5 faze (Internal → Alpha → Beta → Early Access → Full) + "launch again and again" ca core philosophy
- **[[value-based-pricing]]** — prețul între alternative și perceived value (NU cost-plus); 3 axe (packaging × metric × price point)
- **[[good-better-best-pricing]]** — arhitectura care operaționalizează value-based pricing: middle e țintă, expensive ancorează, cheap filtrează

## Afirmații-cheie per skill

### product-marketing-context

**Root skill-ul tuturor skill-urilor de marketing.** Creează `.agents/product-marketing-context.md` cu 12 secțiuni (Product Overview, Target Audience, Personas, Problems, Competitive Landscape, Differentiation, Objections, Switching Dynamics, Customer Language, Brand Voice, Proof Points, Goals). Toate celelalte skills îl citesc PRIMUL și sar peste întrebări deja acoperite.

**Două moduri de creare**: auto-draft din codebase (recomandat — AI citește README/landing/package.json și propune V1) sau from scratch conversațional. **Regulă de captură**: push for verbatim customer language — cuvintele exacte ale clienților bat descrieri polished.

### marketing-psychology

55 mental models în 6 categorii:

1. **Foundational Thinking** (13): First Principles, JTBD, Circle of Competence, Inversion, Occam's Razor, 80/20, Local vs Global Optima, Theory of Constraints, Opportunity Cost, Diminishing Returns, Second-Order Thinking, Map ≠ Territory, Probabilistic Thinking, Barbell Strategy
2. **Buyer Psychology** (20): Fundamental Attribution Error, Mere Exposure, Availability Heuristic, Confirmation Bias, Lindy Effect, Mimetic Desire, Sunk Cost, Endowment, IKEA, Zero-Price, Hyperbolic Discounting, Status-Quo Bias, Default Effect, Paradox of Choice, Goal-Gradient, Peak-End Rule, Zeigarnik, Pratfall, Curse of Knowledge, Mental Accounting, Regret Aversion, Bandwagon
3. **Persuasion** (13): Reciprocity, Commitment & Consistency, Authority, Liking/Similarity, Unity, Scarcity/Urgency, Foot-in-Door, Door-in-Face, Loss Aversion (~2× pain vs. gain), Anchoring, Decoy, Framing, Contrast
4. **Pricing Psychology** (5): Charm pricing (.99), Rounded pricing (premium), Rule of 100, Good-Better-Best, Mental Accounting pricing
5. **Design/Delivery** (9): Hick's Law, AIDA, Rule of 7, Nudge Theory, BJ Fogg (B = MAP), EAST (Easy/Attractive/Social/Timely), COM-B, Activation Energy, North Star, Cobra Effect
6. **Growth/Scaling** (8): Feedback Loops, Compounding, Network Effects, Flywheel, Switching Costs, Exploration vs Exploitation, Critical Mass, Survivorship Bias

**Quick reference challenge → model**:
- Low conversions → Hick's Law, Activation Energy, BJ Fogg, Friction
- Price objections → Anchoring, Framing, Mental Accounting, Loss Aversion
- Building trust → Authority, Social Proof, Reciprocity, Pratfall
- Increasing urgency → Scarcity, Loss Aversion, Zeigarnik
- Retention/churn → Endowment, Switching Costs, Status-Quo Bias
- Growth stalling → Theory of Constraints, Local vs Global, Compounding

### customer-research

**Două moduri distincte**:
- **Mode 1 — Analiză de asset-uri existente**: interviews, sales transcripts, surveys, support tickets, win/loss, NPS. Framework de extracție cu 6 elemente: JTBD (functional/emotional/social), Pain Points, Trigger Events, Desired Outcomes, Language, Alternatives Considered
- **Mode 2 — Digital watering hole mining**: unde vorbesc prospecții fără filtru. Maparea ICP → surse: B2B tech (Reddit role-subs, G2, HN, LinkedIn, SparkToro), SMB (r/entrepreneur, Indie Hackers, Product Hunt), Developer (r/devops, HN, Stack Overflow, Discord), B2C (app store 1–3 stele reviews, Reddit hobby subs), Enterprise (LinkedIn, analyst reports, job postings)

**Quick decision guide**:
- Categorie produs clar → G2/Capterra (tău + competiție)
- Audiență necunoscută → SparkToro
- Raw language → Reddit + YouTube comments
- Trigger events → LinkedIn posts, job postings, "Ask HN"
- Competitive intel → **4-star reviews** pe G2 (3★ = zgomot, 5★ = fan, 4★ = critică constructivă)

**Guardrails**: Confidence tiers (High/Medium/Low), 12-month recency window, minim 5 data points per segment pentru personas. Sample bias recunoscut explicit: reviewers = power users, tickets = probleme, Reddit = technical/skeptical.

### pricing-strategy

**Filozofie**: value-based pricing. Prețul stă între **next best alternative** (floor pentru diferențiere) și **perceived value** (ceiling). Costul e doar baseline, NU basis.

**Trei axe** care se decid împreună:
1. Packaging (ce include fiecare tier)
2. Pricing metric / value metric (la ce se referă prețul)
3. Price point (cât costă efectiv)

**Value metric test**: "Pe măsură ce clientul folosește mai mult [metric], primește mai multă valoare?" Dacă da → metric bun (per-seat pentru collaboration, per-usage pentru consumption, per-transaction pentru payments). Dacă nu → prețul nu aliniază cu valoarea → churn.

**Tier structure**: Good-Better-Best cu **Better ca target**, 2–3× între Better și Best. Decoy effect + anchoring + contrast lucrează simultan.

**Research**: Van Westendorp (4 întrebări, găsești zona acceptabilă), MaxDiff (ranking features pentru tier packaging).

**Semnale pentru price increase**: competiții au ridicat, prospects don't flinch, conversion >40%, churn <3% lunar, unit economics puternice.

### launch-strategy

**Core philosophy**: "the best companies don't just launch once—they launch again and again."

**ORB framework** — 3 tipuri de canale:
- **Owned** (email, blog, community, site): tu deții, compoundează, zero platform risk
- **Rented** (social, YouTube, Reddit, marketplaces): reach rapid dar dependent de platformă
- **Borrowed** (podcast interviews, guest posts, influencers, webinars): shortcut credibility

**Regula centrală**: **all roads lead to Owned**. Rented și Borrowed dau atenție; doar Owned o păstrează.

**5-phase launch**:
1. **Internal** — feedback de la users friendly, prototype funcțional pentru demo
2. **Alpha** — controlled external, landing page + early access signup, MVP în producție
3. **Beta** — scale early access, marketing cu teasers, recrutează influenceri
4. **Early Access** — leak screenshots/demos/GIFs, user research cu engaged users, optional PMF survey
5. **Full Launch** — self-serve signups, charging, anunț GA pe toate canalele (email, in-app, site banner, blog, social, PH/BetaList/HN)

**Product Hunt specifics**: pros (tech early adopter audience, credibility bump), cons (foarte competitiv, spike scurt). Before launch day: relationships + listing optimization + study succese + engage în comunități cu valoare. On launch day: all-day event, respond real-time, funnel spre site pentru capture signups.

**Post-launch**: onboarding email sequence, roundup inclusion, comparison pages vs competiție, interactive demo (Navattic).

**Ongoing priorități**: Major updates → full campaign; Medium → targeted email + in-app banner; Minor → changelog only.

### marketing-ideas

**139 idei** indexate în 17 categorii (Content/SEO, Competitor, Free Tools, Paid Ads, Social/Community, Email, Partnerships, Events, PR/Media, Launches, Product-Led, Content Formats, Unconventional, Platforms, International, Developer, Audience-Specific).

**Filtre de selecție**:
- **By stage**: pre-launch (waitlists, PH prep), early (content/SEO, community, founder-sales), growth (paid, partnerships, events), scale (brand, international, acquisitions)
- **By budget**: free (content, community, comment marketing), low (targeted ads, sponsorships, free tools), medium (events, partnerships, PR), high (acquisitions, conferences, brand)
- **By timeline**: quick wins (ads, email, social), medium (content, SEO, community), long-term (brand, thought leadership, platform effects)
- **By use case**: leads fast (Google/LinkedIn Ads, Engineering as Marketing), authority (conferences, books, podcasts), low budget (keywords, Reddit, comment), product-led (viral loops, powered-by, upsells), enterprise (investor marketing, expert networks)

Rol: **router de inspirație**, NU executor. Din cele 139 idei, celelalte skills execută specificul.

## De ce am ingerat ca suite

Cluster-ul 6 e diferit de Clusters 1–5 pe un plan critic: nu face execuție, face **configurație care afectează toate celelalte clustere**. Ingestul ca suite permite:

1. Cross-cutting concepts reutilizabile de toate celelalte 5 framework-uri deja existente ([[cro-framework-alteramens]], [[seo-framework-alteramens]], [[content-copy-framework-alteramens]], [[paid-acquisition-framework-alteramens]], [[lifecycle-retention-framework-alteramens]])
2. Un framework aplicat unic ([[strategy-foundations-framework-alteramens]]) care ordonează folosirea skill-urilor strategice pentru un proiect nou
3. Cross-references cu concepts existente (bootcamp-pricing, voice-of-customer) sunt îmbogățite în loc să fie duplicate

## Cum se leagă de filosofia Alteramens

- **[[skill-era]]**: `product-marketing-context` e pattern-ul skill-era aplicat intern — un skill al cărui output e input pentru toate celelalte skills. Expertiză ca infrastructură partajată.
- **[[productize-yourself]]**: value-based pricing + good-better-best operaționalizează "specific knowledge + judgment" ca preț diferit de cost. Prețul exprimă judgment-ul, nu costul de a livra.
- **[[distribution-over-product]]**: ORB framework e arhitectura de distribuție; fără Owned nu există compounding; fără Borrowed nu există shortcut de atenție când n-ai audiență.
- **[[validate-before-build]]**: customer-research (mode 2, digital watering hole) e metoda de validare înainte de cod. JTBD e framework-ul de validare corectă ("există job real neacoperit?").
- **[[compounding-games]]**: launching again and again + ORB owned channels = compounding. One-shot launches nu se califică.

Vezi [[strategy-foundations-framework-alteramens]] pentru framework-ul aplicat la un proiect Alteramens cu timp limitat și AI-augmented execution.
