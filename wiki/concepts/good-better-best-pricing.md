---
title: "Good-Better-Best Pricing — Trei Tier-uri cu Decoy Middle"
type: concept
category: pattern
sources: [strategy-foundations-skills-suite]
entities: [alteramens]
related: [value-based-pricing, bootcamp-pricing]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Good-Better-Best Pricing

Trei tier-uri unde **middle-ul e ținta**. Expensive-ul ancorează percepția; cheap-ul oferă entry point; middle-ul convertește.

## Structura de bază

| Tier | Rol | Preț relativ | Feature scope |
|---|---|---|---|
| **Good** (Entry) | Entry-point, filter de serios | Low | Core features, limited usage |
| **Better** (Recommended) | **Target conversion** | Anchor | Full features, limite rezonabile |
| **Best** (Premium) | Anchor top + capture enterprise | 2–3× Better | Everything + advanced |

**Regula**: Better e tier-ul "best for most". Expensive-ul face Better să pară reasonable; cheap-ul face Better să pară deserving de upgrade.

## De ce funcționează psihologic

Trei forțe cognitive acționează simultan:

### 1. Anchoring effect
Primul preț văzut ancorează percepția. Dacă user-ul vede first $500/mo (Best), atunci $150/mo (Better) pare reasonable. Fără ancora Best, Better ar părea scump.

### 2. Decoy effect
Best-ul funcționează ca "decoy" — rar cumpărat în sine, dar face Better să pară optim. Asymmetric dominance: Better bate Good pe features, iar Best bate Better **puțin** pe features dar **mult** pe preț → Better = "sweet spot".

### 3. Contrast / price relativity
Oamenii judecă preț **relativ la opțiunile prezentate**. Three tiers creează un range; middle-ul pare "standard".

## Cum diferențiezi tier-urile

Patru axe de diferentation (alegi 2–3):

### a. Feature gating
Basic features vs. advanced features. Ex: Better primește API access, analytics custom, integrări premium.

### b. Usage limits
Aceleași features, limite diferite. Ex: 1K contacte (Good), 10K (Better), unlimited (Best).

### c. Support level
Email (Good) → Priority email (Better) → Dedicated CSM (Best).

### d. Access / customization
API, SSO, custom branding, multi-workspace → premium tiers only.

**Best practice**: combină **usage limits** + **feature gating**. Usage limits singure creează tier-uri care par identice în features (cumpărătorul ezită). Feature gating singur creează friction (cumpărător rugat să plătească pentru ceea ce vede că deja există).

## Când NU e 3 tiers

- **Enterprise custom**: al 4-lea tier "Contact us" pentru deal-uri mari (SSO, SLA, volume discounts)
- **Freemium**: tier 0 gratuit **în plus** de Good-Better-Best → 4 tiers efectiv. Nu înlocuiește Good-ul.
- **Bootcamp / time-bounded**: paradigmă complet diferită — vezi [[bootcamp-pricing]]. Nu 3 tiers; cohort-based one-time fee.
- **Very early stage**: single price e OK până găsești product-market fit. 3 tiers premature = complexity fără semnal.

## Anti-patterns

1. **Mai mult de 3 tiers vizibile** (5+ plans): paradox of choice → decision paralysis → no purchase. Paradox of choice e mental model bine-documentat.
2. **Tiere indistinguibile**: Good și Better arată la fel în comparison table → user confuz ce să aleagă. Fiecare tier trebuie să aibă **1–2 diferențiatori absolut clari**.
3. **Best prea departe de Better**: dacă Best e 10× Better, nu ancorează — user-ul îl ignoră ca "nu pentru mine". 2–3× e sweet spot. Dacă ai un enterprise real de 10×, fă-l "Contact us" fără preț afișat.
4. **Decoy prea transparent**: dacă Best pare clar un trick (features inutile, preț absurd), încrederea se erodează. Best trebuie să fie o valoare reală pentru segmentul lui, chiar dacă mic.
5. **Recommended tier highlight pe Good** ("Most Popular" pe tier-ul cel mai ieftin): pierzi intenționalitate. Highlight-ul merge pe **Better** (tier-ul pe care vrei să-l alegă).

## Tactici de enforcement vizual

- **Badge "Recommended" / "Most Popular"** pe Better — umbrelă/border/backdrop culoare diferită
- **Monthly/annual toggle** cu annual evidențiat (17–20% discount standard)
- **Side-by-side comparison table** dedesubt pentru decision fatigue cases
- **Charm pricing pentru Good** ($19, $29), **round pricing pentru Best** ($500, $1000) → Good pare value, Best pare premium

## Legătura cu [[value-based-pricing]]

Good-Better-Best e **arhitectura** care operaționalizează value-based pricing. Fiecare tier captură un segment diferit de willingness-to-pay:

- **Good**: low-WTP, serios filter
- **Better**: sweet spot — majoritatea volumului
- **Best**: high-WTP, enterprise/power users

Fără research (Van Westendorp, MaxDiff), plasezi Better arbitrar. Cu research, plasezi Better unde zona de "expensive but acceptable" începe (intersecția între curbele Van Westendorp).

## De ce contează pentru Alteramens

- **Solo operator**: 3 tiers vs. 1 tier = 2–3× MRR per customer mediu (upgrade path încorporat în produs)
- **Timp limitat pentru sales**: tier-urile self-serve fac decizie de vânzare **a clientului**, nu a ta. Eliminezi conversații individuale de pricing.
- **Compounding via upgrade**: Good → Better → Best e traseu natural pe măsură ce clientul crește. Acumularea de Best-tier customers compoundează fără effort marginal de sales
