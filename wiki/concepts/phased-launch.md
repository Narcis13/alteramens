---
title: "Phased Launch — Lansezi de Multe Ori, Nu o Dată"
type: concept
category: pattern
sources: [strategy-foundations-skills-suite]
entities: [alteramens]
related: [orb-channel-framework, validate-before-build, kill-fast, aha-moment]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Phased Launch

Un launch nu este un moment — este un **proces în 5 faze**, fiecare cu goal și tactici distincte. Companiile puternice nu lansează o dată; lansează **din nou și din nou** (fiecare feature / improvement devine oportunitate de atenție).

## Core philosophy

> "The best companies don't just launch once—they launch again and again."

Implicații:
- "Lansare" nu = "ship + dashboard + speranță"
- Fiecare feature major = mini-launch
- Updates regulate semnalează produsul e viu (retention signal)

## Cele 5 faze

### Faza 1 — Internal Launch

Feedback de la users friendly înainte să mergi public.

**Acțiuni**:
- Recrutează early users unu-la-unu (free testing)
- Collect feedback pe usability gaps
- Prototype trebuie să fie funcțional pentru demo (nu production-ready)

**Goal**: validezi core functionality cu users favorabili.

### Faza 2 — Alpha Launch

Product în fața users externi, în mod controlat.

**Acțiuni**:
- Landing page + early access signup
- Anunț că produsul există
- Invite users individual pentru testing
- MVP working în production (chiar dacă încă evoluează)

**Goal**: prima validare externă + waitlist building.

### Faza 3 — Beta Launch

Scale-up early access + generare buzz extern.

**Acțiuni**:
- Work through early access list (some free, some paid)
- Marketing cu teasers despre probleme rezolvate
- Recrutează friends, investors, influenceri pentru test + share

**Touchpoints**:
- Coming soon landing / waitlist
- "Beta" sticker în dashboard nav
- Email invites
- Early access toggle pentru experimental features

**Goal**: build buzz + refine cu broader feedback.

### Faza 4 — Early Access Launch

Trecere de la small-scale testing la expansion controlată.

**Acțiuni**:
- Leak product details: screenshots, feature GIFs, demos
- Gather quantitative usage + qualitative feedback
- User research cu engaged users (incentivize cu credits)
- Optional: product/market fit survey

**Expansion**:
- Option A: throttle invites în batch-uri (5–10%)
- Option B: invite all users sub "early access" framing

**Goal**: validezi la scale + preparezi full launch.

### Faza 5 — Full Launch

Deschizi porțile.

**Acțiuni**:
- Open self-serve signups
- Start charging (dacă nu deja)
- Anunț general availability pe toate canalele

**Touchpoints**:
- Customer emails
- In-app popups + product tours
- Website banner
- "New" sticker în dashboard nav
- Blog post announcement
- Social posts cross-platform
- Product Hunt, BetaList, HN etc.

**Goal**: maximum visibility + conversion to paying users.

## Product Hunt — specific notes

PH e util pentru audiență tech-savvy early adopter, dar NU e magic — cere preparare serioasă.

**Pros**: exposure, credibility bump (mai ales Product of the Day), PR/backlinks potential.
**Cons**: very competitive, short-lived traffic spikes, pre-launch planning intensive.

**Before launch day**:
1. Build relationships cu influencial supporters, communities, content hubs
2. Optimize listing: tagline, visuals, demo video
3. Study successful launches
4. Engage in communities (provide value before pitching)
5. Pregătește echipa pentru all-day engagement

**On launch day**:
1. Treat as all-day event
2. Respond la fiecare comment real-time
3. Engage audiența existentă
4. Funnel traffic spre site pentru capture signups ([[orb-channel-framework|rented → owned]])

**Case**: Reform ajunsese #1 Product of the Day studiind launch-uri succes, craftând tagline + visuals + demo clean, engage-uind în comunități înainte cu valoare, tratând launch-ul ca event all-day, și funnel-uind traffic la capture signups.

## Post-launch ≠ gata

Launch-ul continuă:
- **Educate new users**: onboarding email sequence
- **Reinforce**: anunț include în roundup email săptămânal/lunar
- **Differentiate**: publică comparison pages vs. competiție
- **Update web pages**: secțiuni dedicate feature-ului
- **Interactive demo**: Navattic sau similar pentru hands-on preview

## Ongoing launch prioritization

| Update type | Marketing investment |
|---|---|
| **Major** (features majore, overhauls) | Full campaign: blog post, email, in-app, social |
| **Medium** (integrations, UI) | Targeted: email segmentat + in-app banner |
| **Minor** (bug fixes, tweaks) | Changelog / release notes only |

**Space out releases**: nu shipa tot o dată. Stagger pentru momentum continuu.

## De ce contează pentru Alteramens

- **Timp limitat + solo**: full launch dintr-o singură dată eșuează dacă faza 1–4 au fost sărite. 5 faze = 5 oportunități de a descoperi probleme înainte de momentul public
- **[[validate-before-build]]**: fazele 1–2 sunt validare; nu poți sări la faza 5 dacă n-ai trecut prin ele
- **[[kill-fast]]**: fazele timpurii sunt și checkpoint-uri pentru kill — dacă alpha/beta nu capătă tracțiune, nu turni bani în full launch
- **Multiplicatorul AI**: full-launch marketing (email sequences, comparison pages, demo videos, onboarding flows) poate fi bătut rapid cu AI — bottleneck-ul rămâne decisional, nu execuție

## Anti-patterns

- **"Big bang" launch**: săriți direct la faza 5 fără 1–4; product bugs + confused users + PR flop
- **Launch once mentality**: lansezi, apoi niciodată nu mai capitalizezi pe atenție; compete crește zgomot mai repede decât tine
- **Product Hunt fără preparation**: 2 zile pe listing, zero relații construite; rank în afara top 20, spike de 200 vizite, zero retention
