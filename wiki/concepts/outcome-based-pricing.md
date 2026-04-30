---
title: "Outcome-Based Pricing — Pay When Revenue Hits the Account"
type: concept
category: decision-framework
sources: [pat-walls-agent-first-1t-thread]
entities: []
related: [value-based-pricing, agent-native-startup, headless-saas-thesis, jobs-to-be-done, good-better-best-pricing, bootcamp-pricing]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Outcome-Based Pricing — Pay When Revenue Hits the Account

A pricing model where the customer pays for **outcomes the agent produces** (revenue won, deals closed, claims processed, leases renewed) rather than seats, calls, or features.

From [[pat-walls-agent-first-1t-thread]]: *"Nobody pays per seat when the 'seat' is an agent making 10,000 API calls a minute. You pay when revenue hits your account."*

## Why Seat Pricing Breaks

Per-seat pricing was coherent when:
- One seat = one person's work capacity
- Adding seats was a proxy for expanding value
- Usage was bounded by human-scale constraints (hours in a day, meetings per week)

It breaks when:
- A "seat" is an agent making 10k API calls per minute
- Usage scales with agent activity, not human activity
- The customer doesn't care how many agents you use — only what gets done

Charging per seat in an agent-native product is asking the wrong question: *"how many entities are using it?"* when the real question is *"what value was produced?"*

## Relationship to Value-Based Pricing

Outcome-based pricing is a **specialization** of [[value-based-pricing]] for the agent-native era — not a new pricing philosophy. Value-based says *"price on perceived value, not cost."* Outcome-based says *"the cleanest proxy for perceived value in an agent-native product is the outcome the agent directly causes."*

| Value-Based Pricing | Outcome-Based Pricing |
|---|---|
| Price on perceived value | Price on the outcome itself |
| Value metric can be usage, seats, features, etc. | Value metric IS the outcome (revenue, closed deals, processed claims) |
| Applies to any product | Applies when the agent's work maps directly to a business KPI |
| The customer might still pay when value isn't delivered | The customer only pays on delivery |

Outcome-based is the sharpest form because it aligns incentives perfectly: the vendor only wins when the customer wins.

## When It Fits

1. **The outcome is measurable and attributable.** Revenue booked, leases renewed, invoices collected, claims adjudicated.
2. **The agent owns the workflow end-to-end.** If a human is in the middle deciding most outcomes, attribution is murky and the model breaks.
3. **The customer agrees on baseline.** Without a baseline, you fight attribution forever.
4. **The vendor can tolerate payment lag.** Outcome payments arrive after the work — shorter runway pain.

## When It Fails

- **Long outcome horizon** (annual sales cycles): cash flow punishes the vendor.
- **Shared attribution** (agent + human + other tools): fights over who caused the outcome.
- **Baseline disputes**: "leases were going to renew anyway."
- **Customer fraud/disputes**: customer denies outcomes to avoid paying.
- **Value without revenue attribution** (internal ops improvements): hard to price even though real.

## Pricing-Metric Implementations

Different outcome metrics for different agent types:

| Agent does | Outcome metric | Example |
|---|---|---|
| Closes sales | % of closed-won revenue | 5-15% of deal size |
| Collects receivables | % of recovered money | 10-25% of collected amount |
| Processes claims | Per-claim fee | Fixed $X per adjudicated claim |
| Schedules appointments | Per-confirmed-appointment fee | Fixed $X per kept appointment |
| Renews contracts | % of renewed ARR | 3-10% of renewed contract value |
| Generates leads | Per-qualified-lead fee | $X per SQL meeting "Definition Y" |

## Hybrid Shapes (Realistic Starting Point)

Pure outcome pricing is operationally risky for a small team. Most agent-native startups will ship with a **hybrid**:

- **Base platform fee** (covers infrastructure cost floor) + **outcome share** (the value proposition)
- **Minimum commitment** (ensures vendor doesn't burn cash on customers who don't generate outcomes) + **outcome upside**
- **Per-usage floor** + **outcome kicker**

The pure "only pay when revenue hits the account" model is a rhetorical endpoint — the practical shape is usually a hybrid for the first 12-24 months.

## Relevance for Alteramens

[[nbrain-concept]] currently plans flat 50 EUR/month. The thread challenges this:
- Could nBrain price on **hours-saved-for-accountant**? (Measurable if we track firm throughput before/after.)
- Could nBrain price on **[[anaf|ANAF]] deadlines never missed**? (Outcome the accountant cares about.)
- Could nBrain price on **new clients the accountant takes on because time was freed**? (Growth-tied outcome.)

Probable first step: keep flat pricing for speed-to-revenue, but **design the measurement infrastructure** from day one so outcome-based pricing is a switchable pricing axis later. This is cheap to add early, expensive to add late.

## Open Questions

- What's the cleanest outcome metric for a Romanian accounting agent?
- Is outcome pricing a competitive weapon against incumbent SaaS (who can't credibly offer it)?
- How do you sell outcome pricing to an operator who has never paid that way? Likely: side-by-side comparison with current seat-pricing reality.
