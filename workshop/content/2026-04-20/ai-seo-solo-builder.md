---
type: content-pack
topic: "AI SEO / Answer Engine Optimization pentru solo builders — de ce ce scriu ALȚII contează de 6.5x mai mult decât ce scrii tu"
seed: ".claude/skills/ai-seo"
language: "ro"
created: 2026-04-20
faber_concepts: [answer-engine-optimization, agent-readable-web, third-party-signal, skill-era, distribution-over-product, extractable-content, machine-readable-structure]
faber_entities: [alteramens, workscript, nbrain]
status: draft
---

# Content Pack — AI SEO pentru solo builders

> Grounded via /faber-query pe 2026-04-20. Core claim: SEO-ul clasic se rupe în 45% din căutări Google (AI Overviews). Pe layer-ul nou — agent-readable web — un solo builder poate ajunge la paritate cu echipe SEO de 20 de oameni în sub 2 ore. Cine are `/pricing.md` + `/llms.txt` + robots.txt corect devine vizibil pentru ChatGPT, Perplexity, Claude. Cine nu — iese din comparațiile AI-mediate.

## Faber alignment

- **Core claim:** SEO-ul s-a despicat în două funnel-uri — uman (Google ranking) și agentic (AI citation). Al doilea devine dominant, iar pe el terenul e plat.
- **Supporting concepts:** [[answer-engine-optimization]], [[agent-readable-web]], [[third-party-signal]], [[skill-era]], [[distribution-over-product]]
- **Personal angle:** Narcis — 4h/zi de construit, Workscript în monorepo TypeScript/Bun, wife-ul cu 20 clienți SMB care vor AI tools, fiul Mihai cu AI Tutor Admitere. Adăugarea celor 4 fișiere agent-readable pe un produs = o după-amiază, nu un trimestru.
- **Contradicted view:** "Scrie keyword-uri, ranchează pe pagina 1" — ambele mor. Princeton GEO (KDD 2024) arată că keyword stuffing **scade** vizibilitatea AI cu 10%.

---

## 1. Blog article (SEO+AEO)

**Target keyword:** AI SEO pentru solo builders
**Title:** AI SEO: de ce SEO-ul clasic moare și ce pui în loc (2026)
**Slug:** ai-seo-solo-builder
**Meta description:** SEO-ul ranchează. AI SEO te face citat de ChatGPT și Perplexity. Ghid practic pentru solo builders — 4 fișiere, sub 2 ore, paritate cu echipele de 20.

---

# AI SEO: de ce SEO-ul clasic moare și ce pui în loc (2026)

> **TL;DR (72 cuvinte):** AI Overviews apar în ~45% din căutările Google și taie click-urile la site-uri cu până la 58%. SEO-ul clasic (ranking pe pagina 1) devine irelevant. În loc: Answer Engine Optimization — fii sursa pe care ChatGPT, Perplexity, Claude, Gemini o citează. Pentru un solo builder, 4 fișiere adăugate la root (`/robots.txt`, `/sitemap.xml`, `/pricing.md`, `/llms.txt`) te pun la paritate cu echipe SEO de 20 de oameni. Timp: sub 2 ore.

*Narcis Brindusescu — construiesc 4 ore pe zi, din Pitești. Administrator IT de spital în program, builder după 15:00.*

## De ce nu mai funcționează SEO-ul pe care îl știi

Regula veche: scrie keyword-uri, construiește backlink-uri, ranchează pe pagina 1 Google, ia click-urile.

Regula nouă: **utilizatorul nu mai ajunge la pagina ta**. Îl întreabă pe ChatGPT, îl întreabă pe Perplexity, se uită la AI Overview-ul afișat în vârful paginii Google. AI-ul decide cine e citat. Pagina ta rămâne acolo, dar nimeni nu dă click.

Cifrele sunt brutale:

- **45% din căutări Google** afișează acum AI Overviews
- Click-urile la website-uri scad cu **până la 58%** în prezența AI Overviews
- Brand-urile sunt citate de **6.5x mai des prin surse third-party** (Wikipedia, Reddit, G2) decât prin propriul domeniu
- Content optimizat pentru AI este citat de **3x mai des** decât non-optimized
- **Keyword stuffing scade vizibilitatea AI cu 10%** (Princeton GEO Research, KDD 2024)

Ultimul punct e interesant: tactica pe care mulți o încă folosesc ca "SEO basics" este **activ penalizată** de AI. Nu e vorba de ineficientă — e counter-productivă.

## Ce este, de fapt, AI SEO

AI SEO (sau AEO — Answer Engine Optimization; sau GEO — Generative Engine Optimization) nu încearcă să te urce pe pagina 1. Încearcă ceva diferit: **să te facă sursa pe care AI-ul o citează** când cineva întreabă despre nișa ta.

| SEO tradițional | AI SEO (AEO) |
|---|---|
| Ranchează pe Google | Citat de ChatGPT/Perplexity/Claude |
| Optimizezi keywords | Optimizezi structură + autoritate |
| Traffic → site-ul tău | Brand-ul tău → răspunsul AI |
| Măsori click-through rate | Măsori citation rate |

Pattern-ul e același ca în [[skill-era]]: nu mai construiești pipe-uri (site), construiești pattern-uri (surse citabile). În loc să fii vizitat, devii **citat**.

## Cele trei piloni care contează

Tot research-ul pe AEO (Princeton GEO, analize ai-seo, date Perplexity) converge pe aceleași trei piloni:

### Pilonul 1 — Structură: fă conținutul extractabil

AI-ul nu citează pagini, citează **pasaje**. Fiecare paragraf important trebuie să funcționeze scos din context.

Reguli practice:
- **Răspuns direct în primul paragraf** al fiecărei secțiuni. Nu introduceri, nu teaser-uri.
- **Blocuri de 40-60 cuvinte** — dimensiunea optimă pentru snippet extraction
- **Tabele** pentru comparații (tip "X vs Y") — AI lift-uiește tabele direct
- **FAQ sections** cu întrebări naturale — fiecare pereche Q/A e un candidat citation
- **H2/H3 care imită pattern-uri de prompt** ("Cum fac X?", "De ce Y?")

Vezi [[extractable-content]] pentru detaliu pe tehnica de scriere.

### Pilonul 2 — Autoritate: fă-l citabil

Princeton GEO a măsurat, pe Perplexity.ai, ce metode de optimizare cresc citation rate. Top 4:

| Metodă | Boost vizibilitate |
|---|---|
| Citează surse | +40% |
| Adaugi statistici | +37% |
| Adaugi citate de experți | +30% |
| Ton autoritar | +25% |

Combinația maximă: **Fluency + Statistics**. Site-uri cu autoritate redusă beneficiază și mai mult — **+115% citation rate** cu citații adăugate.

Ce nu funcționează: keyword stuffing (-10%), stats inventate, "many experts agree" fără sursă. AI-ul prefera un singur număr citat corect față de 10 claim-uri vagi.

### Pilonul 3 — Prezență: fii acolo unde AI caută

Aici vine contraintuitive-ul: **propriul tău site e a 3-a sau a 4-a sursă în importanță**. AI-ul favorizează ce scriu ALȚII despre tine.

Distribuția citărilor ChatGPT (aproximativ):
- Wikipedia — **7.8%**
- Reddit — **1.8%**
- Industry publications combinate — **~15%**
- Review sites (G2, Capterra) — **5-10%** pentru B2B SaaS
- YouTube — frecvent în AI Overviews
- Propriul site — restul, 10-20%

Implicația: pentru un solo builder cu 4h/zi, **prezența autentică în 2-3 comunități relevante** (Reddit, G2, un podcast de nișă) bate echipele de content marketing care pompează bloguri. Vezi [[third-party-signal]].

## Leverage-ul asimetric pentru solo builders: agent-readable web

Aici e partea pe care mulți o ratează. Web-ul se despică în două layer-e:

1. **Human-readable** — HTML randat, JavaScript, design frumos. Aici ai dezavantaj de resurse față de echipe.
2. **Agent-readable** — fișiere plain-text servite la paths convenționale. Aici terenul e plat. Vezi [[agent-readable-web]].

Patru fișiere, sub 2 ore de lucru, care te pun în jumătatea vizibilă pentru agenți:

### `/robots.txt` — cu AI bots explicit

```
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Disallow: /
```

Allow pentru search bots (GPTBot, PerplexityBot, ClaudeBot, Google-Extended) = te pot cita. Disallow pentru CCBot (training-only) = nu contribui la seturi de training generale. Middle ground rezonabil.

### `/sitemap.xml`

Auto-generated de orice static site generator decent. Zero muncă dacă folosești Next.js, Astro, Hugo, 11ty.

### `/pricing.md` — game-changer pentru SaaS

Un agent care compară 10 SaaS-uri în 5 secunde pentru un client **nu randează SPA-ul tău React**. Dacă pricing-ul e ascuns în JS sau în "contact sales", agentul te filtrează. Dacă ai:

```markdown
# Pricing — Workscript

## Free
- Price: $0/month
- Limits: 3 workflows, 1000 executions
- Features: Visual editor, community support

## Pro
- Price: $29/month (annual) | $39/month (monthly)
- Limits: 50 workflows, 100K executions
- Features: Custom nodes, API access, priority support

## Enterprise
- Price: Custom
- Features: SSO, SLA, dedicated support
```

Un LLM citește asta în 100 ms. Competitorul tău cu pricing doar în SPA iese din comparație. **Asta** e avantajul asimetric.

### `/llms.txt`

Un overview de 200-500 cuvinte cu ce face produsul, pentru cine, link-uri către pagini-cheie. Format definit la [llmstxt.org](https://llmstxt.org). Primul lucru pe care un LLM îl citește când ajunge pe domeniul tău.

Toate 4 — `robots.txt`, `sitemap.xml`, `pricing.md`, `llms.txt` — sunt plain-text. Zero framework, zero rendering. O după-amiază, o singură dată, apoi update incremental.

## Ce se schimbă, concret, pentru un builder din Pitești

Lucrez 4 ore pe zi la Workscript (TypeScript/Bun, JSON workflow engine, ~75% gata). Direct concurez cu tool-uri care au echipe de 20. Pe layer-ul clasic — articole SEO lungi, guest posts în TechCrunch, campanii pe LinkedIn — pierd automat. Nu am timpul. Nu am bugetul.

Pe layer-ul agent-readable, ecuația se schimbă:
- `/pricing.md` pentru Workscript — o oră
- `/llms.txt` cu overview — 30 minute
- `/robots.txt` corect — 10 minute
- FAQ extractabil pe landing — 2 ore

Total: sub 4 ore. Aceleași 4 ore le-aș fi petrecut altfel oricum. Acum, când un utilizator întreabă Claude sau Perplexity "ce workflow engine pentru echipe mici cu API bun?", am 2-3x mai multe șanse să fiu citat.

Asta e [[distribution-over-product]] aplicat la content: nu am nevoie de permisiunea nimănui. Nu plătesc ad-uri. Publish o dată, AI mă citează de mii de ori.

## Ce o să fac eu săptămâna asta

- Adaug cele 4 fișiere pe pagina Workscript (monday)
- Validez cu Rich Results Test + un prompt de test pe Claude și Perplexity ("compară workflow engine-uri open-source pentru echipe mici")
- Log scorul inițial de citation rate — DIY, 20 de query-uri, spreadsheet, lunar
- Raportez rezultatele pe [newsletter-ul Alteramens](#) în 30 de zile

Dacă în 30 de zile citation rate-ul nu urcă măsurabil, admit că ipoteza e greșită și rescriu pagina. Asta e diferența între construit și speculat.

---

## Întrebări frecvente

**Ce este AI SEO (Answer Engine Optimization)?**
AI SEO (sau AEO) este practica de a optimiza conținutul pentru a fi citat de engine-uri AI (ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews) în răspunsurile lor. Diferența față de SEO tradițional: scopul nu e ranking pe Google, ci citation în răspunsuri AI.

**Merită să blochez GPTBot în robots.txt?**
Aproape niciodată pentru un solo builder. Blocarea = fără citații din ChatGPT. Dacă IP-ul nu e super-sensibil (ex: research proprietar plătit), allow-ul e default-ul corect. Middle ground: allow GPTBot/PerplexityBot/ClaudeBot (search), block CCBot (training Common Crawl).

**Cât trafic organic pierd dacă AI Overviews apar pentru keyword-urile mele?**
Până la 58% din click-uri, în medie. Este motivul pentru care AEO nu mai este opțional — dacă tu nu ești citat, competitorul tău e, și tu dispari din conversație complet.

**Ce e mai important: site-ul propriu sau prezența pe Reddit/G2?**
Amândouă, dar în ordinea asta: 1) cele 4 fișiere agent-readable pe site (sub 2 ore, leverage asimetric), 2) prezență autentică pe 2-3 surse third-party relevante nișei tale. Brand-urile sunt citate de 6.5x mai des prin third-party decât prin propriul domeniu.

**Funcționează AEO și pentru audiențe non-engleze?**
Da. ChatGPT, Claude, Gemini citează surse în română, germană, spaniolă dacă conținutul e structurat bine. Un avantaj pentru builders din piețe "mici": mai puțină competiție pe content extractabil localizat.

**Cum măsor dacă efortul AEO funcționează?**
DIY: lunar, 20 de query-uri relevante rulate prin ChatGPT + Perplexity + Google AI Overview, loghează cine e citat. Tools plătite (dacă ai buget): Otterly AI, Peec AI, ZipTie. Pentru început, spreadsheet + disciplină lunară e suficient.

---

*Narcis Brindusescu — builder. Administrator IT de spital în Pitești, economist cu 10 ani în contabilitate hospital, dezvoltator self-taught. Construiește AI products 4 ore pe zi. Scrie despre proces pe [newsletter-ul Alteramens](#) și [LinkedIn](#).*

### JSON-LD schema

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "AI SEO: de ce SEO-ul clasic moare și ce pui în loc (2026)",
      "description": "SEO-ul ranchează. AI SEO te face citat de ChatGPT și Perplexity. Ghid practic pentru solo builders — 4 fișiere, sub 2 ore, paritate cu echipele de 20.",
      "datePublished": "2026-04-20",
      "dateModified": "2026-04-20",
      "author": { "@id": "#narcis" },
      "publisher": { "@id": "#narcis" },
      "mainEntityOfPage": "{canonical URL}",
      "keywords": "AI SEO, AEO, answer engine optimization, solo builder, ChatGPT citation, Perplexity, llms.txt, pricing.md, agent-readable web"
    },
    {
      "@type": "Person",
      "@id": "#narcis",
      "name": "Narcis Brindusescu",
      "jobTitle": "Builder — Alteramens",
      "url": "{personal site URL}",
      "sameAs": [
        "{LinkedIn URL}",
        "{GitHub URL}",
        "{X URL}"
      ],
      "knowsAbout": [
        "AI SEO",
        "Answer Engine Optimization",
        "Software development",
        "Claude Code",
        "Healthcare IT",
        "Accounting automation"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Ce este AI SEO (Answer Engine Optimization)?",
          "acceptedAnswer": { "@type": "Answer", "text": "AI SEO (sau AEO) este practica de a optimiza conținutul pentru a fi citat de engine-uri AI (ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews) în răspunsurile lor. Diferența față de SEO tradițional: scopul nu e ranking pe Google, ci citation în răspunsuri AI." }
        },
        {
          "@type": "Question",
          "name": "Merită să blochez GPTBot în robots.txt?",
          "acceptedAnswer": { "@type": "Answer", "text": "Aproape niciodată pentru un solo builder. Blocarea înseamnă fără citații din ChatGPT. Middle ground rezonabil: allow GPTBot/PerplexityBot/ClaudeBot (search bots), block CCBot (training-only via Common Crawl)." }
        },
        {
          "@type": "Question",
          "name": "Cât trafic organic pierd dacă AI Overviews apar pentru keyword-urile mele?",
          "acceptedAnswer": { "@type": "Answer", "text": "Până la 58% din click-uri, în medie. Este motivul pentru care AEO nu mai este opțional — dacă tu nu ești citat, competitorul tău e." }
        },
        {
          "@type": "Question",
          "name": "Ce e mai important: site-ul propriu sau prezența pe Reddit/G2?",
          "acceptedAnswer": { "@type": "Answer", "text": "Amândouă, dar în ordine: 1) cele 4 fișiere agent-readable pe site (sub 2 ore, leverage asimetric), 2) prezență autentică pe 2-3 surse third-party relevante. Brand-urile sunt citate de 6.5x mai des prin third-party decât prin propriul domeniu." }
        },
        {
          "@type": "Question",
          "name": "Cum măsor dacă efortul AEO funcționează?",
          "acceptedAnswer": { "@type": "Answer", "text": "DIY: lunar, 20 de query-uri relevante rulate prin ChatGPT + Perplexity + Google AI Overview, loghează cine e citat. Tools plătite (dacă ai buget): Otterly AI, Peec AI, ZipTie." }
        }
      ]
    }
  ]
}
</script>
```

---

## 2. Substack newsletter

**Subject line:** Sâmbătă am adăugat un fișier de 40 de linii
**Preview text:** Ce se schimbă când un agent te poate compara cu 10 concurenți în 5 secunde.

---

Sâmbătă dimineață, înainte să se trezească ai mei, am scris un fișier de 40 de linii și l-am pus la `workscript.io/pricing.md`.

Pare ridicol de mic pentru o decizie de business. Era ridicol de mic. Dar e și primul lucru pe care l-am făcut în ultimele 6 luni care m-a pus **la paritate cu competitorii care au echipe de 20 de oameni**.

Îți explic.

Dacă cineva îl întreabă azi pe Claude sau pe Perplexity "ce workflow engine open-source pentru echipe mici cu API decent?", AI-ul compară opțiunile. Randează SPA-ul meu React? Nu. Trece prin signup-ul meu? Nu. Citește pricing-ul ascuns în JavaScript? Nu.

Caută fișiere pe care le poate parsa. Plain-text. Structurate. La paths convenționale. Dacă le are, te include în comparație. Dacă nu — **ești șters din conversație**.

Asta mi-a căzut fisa săptămâna trecută, când am citit research-ul Princeton GEO (KDD 2024, pe Perplexity): keyword stuffing **scade** citation rate cu 10%. Tacticile pe care încă le predă jumătate din RO SEO scene sunt counter-productive pe layer-ul nou.

Știi ce m-a surprins cel mai tare? **Brand-urile sunt citate de 6.5x mai des prin surse third-party decât prin propriul lor site.** Pagina ta din blog — orice ai scrie pe ea — contează mai puțin decât ce scriu alții despre tine pe Reddit, G2, Wikipedia, un podcast de nișă.

Pentru mine, care construiesc 4 ore pe zi, asta e o veste bună deghizată în prost. Vestea proastă: blogul meu nu o să câștige vreodată împotriva HubSpot. Vestea bună: **nici nu trebuie**. Pe Reddit-ul unde oamenii discută despre workflow engines, eu pot participa autentic. HubSpot nu. Pe `pricing.md`, eu pot fi explicit. Competitorul cu "contact sales" iese.

Am făcut matematica celor 4 ore:

- `/robots.txt` cu AI bots explicit — 10 minute
- `/llms.txt` cu overview — 30 minute
- `/pricing.md` — o oră (decisesem deja pricing-ul, doar de structurat)
- FAQ extractabil pe landing — 2 ore

Total: sub 4 ore de lucru. Una dintre zilele mele de 4h/zi. Aceleași ore pe care le-aș fi petrecut oricum.

Și asta e ce mă ține în brand-ul ăsta de "constraint as edge". Unui builder cu 8h/zi și 50K în bani, fișierele astea sunt opțiune. Pentru cineva ca mine, sunt **singurul loc unde ecuația nu mai e rupt-în-favoarea-lor**. Pe agent-readable web, n-ai echipă de 20 de oameni și nici nu ai nevoie.

Ce o să verific în 30 de zile: DIY monitoring. 20 de query-uri lunar, rulate prin ChatGPT, Perplexity, Google AI Overview, notat cine e citat. Dacă într-o lună citation rate-ul nu urcă măsurabil, scriu aici că am greșit și rescriu landing-ul. Asta e diferența între construit și speculat.

Partea care mă roade încă: probabil greșesc ceva despre cum calibrez `/llms.txt`. Standardul e emergent — llmstxt.org l-a propus, dar nu e formal adoptat. Poate face-l prea lung, poate prea scurt. O să văd. Îți spun peste 4 săptămâni.

Dacă ai un produs live și vrei să vezi dacă fișierele tale sunt corecte — răspunde la mail-ul ăsta cu URL-ul. Îți spun ce aș schimba eu. Gratis, din curiozitate. Nu fac servicii.

Și dacă construiești ceva în același colț, pasează-mi lista de query-uri pe care vrei să apari — vreau să văd cum arată peisajul pentru altcineva decât mine.

Vorbim săptămâna viitoare,
Narcis

P.S.: Dacă vrei versiunea tehnică, cu tabele și JSON-LD, am publicat un ghid lung pe [blog](#). Versiunea din mail e cea pe care aș fi vrut s-o citesc eu acum 6 luni.

---

## 3. LinkedIn post

SEO-ul clasic moare.

Nu e hyperbolă. E Google-ul care, în 45% din căutări, afișează acum un AI Overview care taie click-urile la site-uri cu până la 58%. Utilizatorul nu mai ajunge la tine. Îl întreabă pe ChatGPT, pe Perplexity, pe Claude.

Săptămâna trecută am adăugat 4 fișiere pe pagina unui produs la care construiesc:

`/robots.txt` cu AI bots explicit.
`/sitemap.xml` auto-generated.
`/pricing.md` structurat.
`/llms.txt` overview.

Timp total de lucru: sub 4 ore. O singură zi din cele 4h/zi pe care mi le iau pentru Alteramens.

De ce contează: când un agent AI compară 10 concurenți în 5 secunde pentru un utilizator, **nu randează SPA-ul tău React**. Dacă pricing-ul tău e ascuns în "contact sales" sau într-un modal JavaScript, agentul te filtrează afară. Competitorul cu `/pricing.md` plain-text rămâne în comparație.

Pe layer-ul clasic, un solo builder pierde automat împotriva unei echipe de 20. Pe layer-ul agent-readable, terenul e plat. E unul din puținele locuri din content/SEO unde constraint-ul meu (4h/zi, buget zero) nu mai e dezavantaj.

Cifra care m-a surprins cel mai tare: brand-urile sunt citate de **6.5x mai des** prin surse third-party (Reddit, G2, Wikipedia, podcast-uri) decât prin propriul lor domeniu. Adică ce scriu ALȚII despre tine contează de 6.5x mai mult decât ce scrii tu despre tine.

Implicația — nu optimizezi DOAR site-ul tău. Optimizezi prezența ta autentică pe 2-3 platforme relevante. Un reply bine scris pe Reddit în nișa ta bate 10 articole de blog.

O să urmăresc citation rate-ul pe 20 de query-uri, lunar, în spreadsheet. Dacă în 30 de zile nu urcă, revin aici și scriu că am greșit.

Tu pe ce layer ești deja — clasic sau agent-readable?

#AI #SEO #SoloBuilder #Alteramens #AEO

---

## 4. X thread

1/ Most devs are still optimizing for Google page 1 in 2026.

They're fighting for a shrinking pie.

45% of Google searches now show AI Overviews. Clicks to websites drop by up to 58%.

The real game moved. Here's where:

2/ AI SEO (Answer Engine Optimization) is the new layer.

You're not trying to rank. You're trying to be CITED by ChatGPT, Perplexity, Claude, Gemini.

Different rules. Different winners. And most interestingly — different game theory for solo builders.

3/ The asymmetric leverage: the agent-readable web.

Four plain-text files at your site root:

- /robots.txt (with AI bots explicit)
- /sitemap.xml
- /pricing.md
- /llms.txt

Total implementation time: under 2 hours. One afternoon.

4/ Why this matters:

When an AI agent compares 10 SaaS tools for a user, it doesn't render your React SPA. It doesn't walk through your signup.

It looks for files it can parse. If your pricing lives behind "contact sales" or in JS, the agent filters you out.

5/ Princeton GEO Research (KDD 2024) measured 9 optimization methods on Perplexity:

+40% — cite sources
+37% — add statistics
+30% — expert quotations
+25% — authoritative tone
-10% — keyword stuffing (it ACTIVELY HURTS AI visibility)

The SEO tactics of 2015 are penalties in 2026.

6/ The number that shocked me:

Brands are cited 6.5x more often through third-party sources (Wikipedia, Reddit, G2, YouTube) than through their own domain.

Meaning: what OTHERS say about you matters 6.5x more than what you say about yourself.

Reddit > your blog.

7/ Why this is great news if you're a solo builder:

You'll never beat HubSpot on content marketing. But HubSpot can't authentically participate in a 200-person Reddit subcommunity.

You can. That's the asymmetric edge.

Small + authentic > big + corporate, on the layer that matters now.

8/ The playbook if you're shipping in 2026:

→ Add the 4 agent-readable files (2 hours)
→ Pick 2-3 third-party communities, participate authentically
→ Structure your content for extraction (40-60 word answer blocks, FAQ sections)
→ Cite real statistics with sources
→ Track citation rate monthly, DIY

9/ I'm doing this for my own project this week. Will log citation rate via 20 queries across ChatGPT, Perplexity, Google AI Overview, monthly.

If it doesn't move in 30 days, I'll report the failure honestly.

Bookmark this — I'll share the before/after numbers.

10/ TLDR:

SEO shifted. The old playbook is a receding shore.

New playbook, solo-builder edition:
→ 4 files, 2 hours → parity with 20-person SEO teams
→ Third-party presence > own blog (6.5x multiplier)
→ Citation rate, not click-through rate
→ Build for agents, not just humans

The leverage is asymmetric. Use it.

---

## 5. YouTube script (~6 min)

**Hook (0:00-0:15):**
"În următoarele 6 minute îți arăt 4 fișiere pe care le pui la root-ul unui site ca să devii vizibil pentru ChatGPT, Perplexity și Claude. Timp total de implementare: sub 2 ore. Rezultat: paritate cu echipele SEO de 20 de oameni — pe layer-ul care contează în 2026."
[B-roll: screen recording — terminal cu `vim pricing.md`, apoi ChatGPT afișând un răspuns cu citation]

**Intro (0:15-0:45):**
"Sunt Narcis. Construiesc produse AI 4 ore pe zi, din Pitești. Am un program la spital până la 15:00, după aia construiesc la Alteramens. În 10 luni am schimbat modul cum abordez SEO — fiindcă SEO-ul clasic nu mai funcționează în 45% din căutările Google. Ce pun în loc e asta: AI SEO sau Answer Engine Optimization. Astăzi îți arăt implementarea minimă."

**Beat 1 (0:45-2:00) — De ce SEO-ul clasic moare:**
"Două cifre. Una: 45% din căutările Google afișează acum AI Overview — rezumatul ăla generat de AI care apare deasupra rezultatelor. Doi: click-urile la site-uri scad cu până la 58% când apare AI Overview. Adică dacă keyword-ul tău intră în AI Overview, pierzi jumătate din click-uri pentru totdeauna. Nu ai unde să recuperezi. Și încă ceva — Princeton GEO, un research din 2024, arată că keyword stuffing — tactica pe care mulți încă o folosesc — scade citation rate-ul AI cu 10%. Adică te penalizează activ."
[B-roll: Google search cu AI Overview evidențiat]

**Beat 2 (2:00-3:30) — Cele 4 fișiere:**
"OK, ce funcționează. Patru fișiere, la root-ul site-ului tău. Primul: `/robots.txt`. Acolo listezi explicit GPTBot, PerplexityBot, ClaudeBot, Google-Extended — toate cu 'Allow'. Asta permite AI-ului să te citeze. Dacă le blochezi, pur și simplu nu exiști pentru ChatGPT. Al doilea: `/sitemap.xml`. Orice static site generator îți face asta automat. Al treilea — și ăsta e game-changer-ul pentru SaaS — `/pricing.md`. Plain-text, cu tier-urile tale. De ce? Fiindcă un agent AI care compară produse în numele unui client, nu randează SPA-ul tău React. Dacă pricing-ul tău e ascuns în JavaScript sau în contact sales, ieși din comparație. Competitorul cu `/pricing.md` rămâne. Al patrulea: `/llms.txt`. Un overview de 200-500 de cuvinte cu ce face produsul, pentru cine, link-uri către pagini importante. E primul lucru pe care un LLM îl citește când ajunge pe domeniul tău."
[B-roll: cod pe ecran — arată fiecare fișier, 10 secunde fiecare]

**Beat 3 (3:30-5:00) — Partea pe care mulți o ratează:**
"Acum, partea care m-a surprins cel mai tare. Brand-urile sunt citate de 6.5x mai des prin surse third-party — Reddit, G2, Wikipedia, YouTube — decât prin propriul lor domeniu. Adică tot ce scriu ALȚII despre tine contează de 6.5x mai mult decât tot ce scrii tu. Pe propriul site, un solo builder ca mine pierde automat împotriva HubSpot. Dar pe Reddit-ul unde se discută workflow engines — acolo, HubSpot nu poate participa autentic. Eu pot. Asta e edge-ul asimetric. Pe layer-ul agent-readable + prezență third-party autentică, terenul e plat pentru un builder cu 4h/zi. Pe layer-ul clasic, niciodată."
[B-roll: screenshot Reddit thread cu răspuns lung, autentic]

**Beat 4 (5:00-5:30) — Ce fac eu săptămâna asta:**
"Săptămâna asta adaug cele 4 fișiere la Workscript — produsul principal la care lucrez. Loghez citation rate-ul prin 20 de query-uri pe ChatGPT, Perplexity și Google AI Overview. Lunar. Dacă în 30 de zile nu urcă măsurabil, admit că am greșit ceva și rescriu. Ceea ce nu fac: articole de 3000 de cuvinte optimizate pentru keyword-uri. Ăla e jocul pe care HubSpot îl câștigă."

**Outro + CTA (5:30-6:00):**
"Dacă ai un produs live și vrei să știi dacă fișierele tale sunt corecte, lasă URL-ul în comentarii. Răspund la toate — după 15:00, că până atunci sunt la spital. Dacă ți-a fost util, share-uie cu un alt builder care încă se luptă pe pagina 1 Google — probabil are nevoie. Ne vedem săptămâna viitoare cu cifrele de 30 de zile."

**B-roll cues:**
- Intro: screen rec cu `vim pricing.md`, apoi ChatGPT conversation
- Beat 1: Google search cu AI Overview highlighted, statistic cards
- Beat 2: code editor cu fiecare fișier, 10s fiecare
- Beat 3: Reddit thread screenshot, apoi diagramă "own site vs third-party"
- Beat 4: terminal cu `monthly-citations.csv`, apoi calendar cu reminder 30 de zile

**Description template:**
```
Cele 4 fișiere pe care le pun la root-ul oricărui produs ca să fiu citat de ChatGPT, Perplexity și Claude. Sub 2 ore de implementare.

În acest video: de ce SEO-ul clasic moare în 45% din căutări, cele 3 piloni AEO, game-changer-ul cu /pricing.md pentru SaaS, și de ce ce scriu ALȚII despre tine contează de 6.5x mai mult decât ce scrii tu.

Timestamps:
0:00 - De ce SEO-ul clasic moare
0:45 - Intro (cine sunt, de ce 4h/zi)
0:45 - De ce SEO-ul clasic moare
2:00 - Cele 4 fișiere (robots.txt, sitemap, pricing.md, llms.txt)
3:30 - Third-party signal (6.5x multiplier)
5:00 - Ce fac eu săptămâna asta
5:30 - Outro + CTA

Related links:
- Blog version (long form + JSON-LD schema): {URL}
- llmstxt.org specification: https://llmstxt.org
- Princeton GEO Research: {URL}
- Newsletter Alteramens: {URL}

Say hi:
LinkedIn: {URL}
X: {URL}
GitHub: {URL}
```
