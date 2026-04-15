---
title: "Tracking Plan as Contract — Events as Decisions"
type: concept
category: technical-playbook
sources: [sales-revenue-ops-skills-suite]
entities: [alteramens]
related: [fit-plus-engagement-scoring, revenue-attribution-loop, hypothesis-driven-experimentation, performance-data-loop, encoded-judgment]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Tracking Plan as Contract

**Track for decisions, not data.** Tracking plan-ul nu e un document IT — e un **contract între marketing, product, data, și engineering**: fiecare event track-uit *trebuie să informeze o decizie specifică*. Dacă nimeni nu va lua o decizie bazată pe un event, nu-l tracka.

## De ce "ca contract"

Un tracking plan fără discipline devine un dump de events:
- `button_clicked` peste tot, fără context
- Naming inconsistent (`sign_up_completed` vs `signupSuccessful` vs `user_registered`)
- Fără property standards
- Fără owner → când un event se strică, nimeni nu știe

Tracking plan-ul ca contract:
- **Decision-first** — pentru fiecare event, rândul "ce decizie informează" e mandatory
- **Naming convention** explicit documentată (object_action, lowercase, underscores)
- **Properties** standardizate la nivel de platformă (Page, User, Campaign, Product)
- **Owner** per event — cine răspunde dacă event-ul se strică
- **Version** — schema evoluează, trackat

## Event naming: object_action

**Format**: `[object]_[action]`, lowercase, underscores, no spaces.

**Examples good**:
- `signup_completed`
- `cta_hero_clicked`
- `form_submitted`
- `article_read`
- `checkout_payment_completed`
- `subscription_cancelled`

**Examples bad**:
- `button_clicked` (too generic — context lost)
- `Sign Up` (spaces, caps)
- `userSignedUp` (camelCase inconsistent with SQL)
- `signup` (no action, just object)

**Rules**:
- Lowercase cu underscores (DB-friendly, URL-safe)
- Be specific: `cta_hero_clicked` > `button_clicked`
- Context in properties, NOT in event name (don't create `cta_hero_blue_clicked_v2` — put `color`, `variant` ca properties)
- Avoid spaces și caractere speciale

## Essential properties

### Page properties
- `page_title`
- `page_location` (URL)
- `page_referrer`

### User properties
- `user_id` (canonical, stable across sessions)
- `user_type` (free, trial, paid, admin)
- `account_id`
- `plan_type`

### Campaign properties (UTM cascade)
- `source` (utm_source)
- `medium` (utm_medium)
- `campaign` (utm_campaign)
- `content` (utm_content)
- `term` (utm_term)

### Product properties
- `product_id`
- `product_name`
- `category`
- `price`

### Best practices
- Property names **consistent across events** (nu `userId` într-un event și `user_id` în altul)
- **Include relevant context** în properties, nu în event name
- **No PII** în analytics (emails, phone, addresses) — separe acestea în CRM/billing
- **Avoid duplicating** ce deja capturează automat tool-ul (GA4 trimite page_location by default)

## Tracking plan structure

```
# [Site/Product] Tracking Plan

## Overview
- Tools: GA4 + GTM + Mixpanel
- Owner: [person/team]
- Last updated: [date]

## Events

| Event Name | Decision it informs | Description | Properties | Trigger |
|---|---|---|---|---|
| signup_completed | Activation rate calc, MQL scoring | User completes signup flow | method, plan, source | On success redirect |
| pricing_page_viewed | MQL engagement scoring | User visits pricing page | plan_hovered, time_on_page | Page load + exit intent |
| demo_requested | SQL alert trigger | User requests demo | form_source, company_size | Form submit success |

## Custom Dimensions
| Name | Scope | Parameter |
|---|---|---|
| user_type | User | user_type |
| plan_type | User | plan_type |

## Conversions
| Conversion | Event | Counting |
|---|---|---|
| Signup | signup_completed | Once per session |
| Demo request | demo_requested | Each |
```

## UTM strategy

### Standard parameters
| Parameter | Purpose | Example |
|---|---|---|
| utm_source | Traffic source | google, newsletter, twitter |
| utm_medium | Marketing medium | cpc, email, social, organic |
| utm_campaign | Campaign name | spring_sale, launch_v2 |
| utm_content | Differentiate versions | hero_cta, footer_cta |
| utm_term | Paid search keywords | running_shoes |

### Conventions
- Lowercase everywhere
- Consistent separator (pick underscore OR hyphen, stick with it)
- Specific but concise (`blog_footer_cta` > `cta1`)
- Documented central (spreadsheet cu toate UTMs used)

## Validation și debugging

### Testing tools
| Tool | Use |
|---|---|
| GA4 DebugView | Real-time event monitoring în dev |
| GTM Preview Mode | Test triggers înainte de publish |
| Browser extensions | Tag Assistant, DataLayer Inspector |

### Validation checklist
- [ ] Events firing pe trigger corect
- [ ] Property values populează corect (not empty, not "undefined")
- [ ] No duplicate events (multiple containers, triggere dublu)
- [ ] Works cross-browser și mobile
- [ ] Conversions recorded correctly
- [ ] **No PII leaking** (emails, phones în parameters)

### Common failure modes

| Issue | Root cause |
|---|---|
| Events not firing | Trigger config greșit, GTM nu s-a încărcat |
| Wrong values | Variable path greșit, dataLayer structure diferă |
| Duplicate events | Multiple containers, trigger firing twice |
| PII leaked | Form fields auto-captured fără filtering |

## Privacy și compliance

- **Cookie consent** required în EU/UK/CA — consent mode "wait for consent"
- **IP anonymization** activat
- **No PII** în analytics properties
- **Retention settings** configured
- **User deletion** capabilities (GDPR Article 17)

## Connection to other concepts

- **[[fit-plus-engagement-scoring]]** — scoring-ul depinde direct de event-urile trackate. Fără tracking, no scoring.
- **[[revenue-attribution-loop]]** — tracking plan-ul e input-ul fundamental în loop-ul de attribution. Nothing else works fără asta.
- **[[hypothesis-driven-experimentation]]** — A/B tests require tracking events pe variants → tracking plan e prerequisite
- **[[performance-data-loop]]** — data-ul trackat alimentează loop-ul de optimizare
- **[[encoded-judgment]]** — tracking plan-ul e judgment encodat: "aceste events matter pentru business-ul nostru, restul sunt zgomot"

## Aplicare la Alteramens

Pentru product-uri mici (1K MRR target), tracking plan-ul e **mai important**, nu mai puțin:

### De ce small-team has mai mult nevoie
- **Pierderi mici doar ating** — un lead pierdut pentru că nu l-ai tracked = 1% lunar impact
- **Can't afford rework** — GA4 re-implementation în 6 luni = săptămâni pierdute
- **AI-augmented analysis** — Claude poate query data direct din tracking dacă e structured; unstructured data nu-ți scalează insights

### Minimal tracking plan pentru Alteramens
```
# Alteramens Tracking Plan v1

## Essential events (must have)
- signup_completed (method, plan, source)
- onboarding_step_completed (step_number, step_name)
- aha_moment_reached (feature_used, time_to_aha_minutes)
- subscription_started (plan, mrr_value)
- subscription_cancelled (plan, reason, tenure_days)

## Secondary events (nice to have)
- cta_clicked (location, text)
- pricing_page_viewed (plan_hovered, time_on_page)
- feature_used (feature_name, first_use_bool)
- email_clicked (email_id, link_location)

## UTMs standard: source, medium, campaign
```

### Discipline
- **Before implementing event, answer**: "what decision does this inform?" Dacă nu e claritate, nu track-uit.
- **Version schema**: tracking plan v1, v2, v3. Document-ează changes.
- **One owner per product surface** — in Alteramens context, usually Narcis solo, dar document-ează decisions.

### Tool stack pentru small team
- **GA4** (free, sufficient pentru marketing site)
- **PostHog self-hosted** sau **Mixpanel free tier** (pentru product analytics)
- **GTM** pentru orchestration
- **UTM spreadsheet** (Google Sheets) — single source of truth for campaign tagging
