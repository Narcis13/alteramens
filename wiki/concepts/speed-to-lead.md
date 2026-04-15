---
title: "Speed-to-Lead — 5 Minute Rule"
type: concept
category: pattern
sources: [sales-revenue-ops-skills-suite]
entities: [alteramens]
related: [lead-lifecycle-funnel, fit-plus-engagement-scoring, revenue-attribution-loop, context-aware-interrupt, friction-cost]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Speed-to-Lead

**Timpul de răspuns la un lead e cel mai mare factor în conversie.** Nu messaging-ul, nu canal-ul, nu scoring-ul — **timpul**.

## Legea numerelor

Din Lead Connect data citată în skill-ul [revops]:
- **<5 minute**: 21× mai mari șanse de a califica lead-ul vs baseline
- **>30 minute**: conversia scade de 10×
- **>24 ore**: lead-ul e efectiv cold

Aceste numere sunt atât de extreme încât invalidează majoritatea "sales process" debates. Dacă răspunzi în 4h în loc de 5min, nu pierzi "ceva conversie" — pierzi **aproape toată conversia posibilă**.

## De ce funcționează așa

1. **Intent decays exponential** — utilizatorul a completat un formular pentru că era in-the-moment (researching, evaluating). După 30min face alte 5 lucruri și contextul tău e pierdut.
2. **Competitive window** — dacă e B2B, au completat formularele pe 3–5 site-uri. Primul care răspunde credibil câștigă atenția.
3. **Signal of seriousness** — răspunsul rapid = semnal că firma ta e serioasă și responsive. Plantează impresii pentru restul cycle-ului.

## Cum se operaționalizează

### Alert-uri instant
- MQL alert trimis automat spre rep-ul assigned (push notification, Slack, email)
- Context inclus: sursă, pagini vizitate, download-uri, scor
- Rep poate acționa fără să se loghe-ze în CRM

### SLA explicit
- Rep contactează în 4h business (pentru work-hours leads)
- Rep qualifică sau respinge în 48h
- Rejected → recycling nurture cu reason code

### Fallback routing
- Dacă rep primary nu răspunde în X min, escalează la backup
- Dacă nimeni nu e available, leadul merge la coadă high-priority
- **Never unassigned** — unassigned leads devin instant stale

### Calendar scheduling integration
- Meeting link în auto-reply → lead bookuiește imediat în window-ul lor de intent
- Round-robin scheduling distribuie meetings
- Pre-meeting enrichment auto-populates CRM

## Connection to other concepts

- **[[lead-lifecycle-funnel]]** — speed-to-lead e SLA-ul specific la MQL→SQL handoff
- **[[fit-plus-engagement-scoring]]** — scoring-ul identifică CARE leads merită speed; nu toate leads justifică 5min response
- **[[friction-cost]]** — speed-to-lead e speed *inversă* pe latura vendor: reducing friction pentru vendor să răspundă cât timp user-ul era în flow
- **[[context-aware-interrupt]]** — rep-ul intervenes în fereastra de intent a user-ului, nu mai târziu când contextul s-a schimbat
- **[[revenue-attribution-loop]]** — speed-to-lead e o metrică trackabilă care leagă analytics (form submit timestamp) de revops (first contact timestamp) la revenue (close rate)

## Aplicare la Alteramens

Pentru un 1-persoană/small-team operation (ca Alteramens), speed-to-lead înseamnă:

1. **Automated alerting** — form submit → notification push direct pe telefon (nu email delay)
2. **Calendar auto-reply** — link Calendly/SavvyCal în confirmarea de submit → lead self-serves booking
3. **AI-augmented triage** — Claude citește contextul și propune un talking point înainte de call
4. **Low-friction first touch** — primul contact nu trebuie să fie perfect, trebuie să fie **rapid**. Short Loom video, email cu un link specific, SMS dacă e opt-in.

Pentru Alteramens-style products targeting 1K MRR: dacă ai 5–10 MQLs pe lună, fiecare e prețios. Pierderea unui lead pentru 30min delay = ~1% lunar din goal.

## Ce invalidează această regulă

- **Low-intent leads** (newsletter subs, ebook downloads) nu necesită 5min — sunt lifecycle nurture territory, NU MQL yet
- **Self-serve SaaS cu trial instant** — user-ul deja "a răspuns" propriei întrebări; speed applies la in-product activation, nu la sales outreach
- **Enterprise ABM cycles** — timelines de săptămâni-luni unde un response în ziua următoare poate fi OK. Dar chiar și acolo, rapid > lent.

## Indicatori că legea e activă în procesul tău

- Track: "minutes from form submit to first rep contact" ca metrică primară
- Benchmark: medie <15min, p90 <30min, p99 <4h
- Correlate: speed-to-lead × win rate pe ultimele 90 zile — vezi pattern-ul
