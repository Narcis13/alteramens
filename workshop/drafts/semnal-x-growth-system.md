---
type: draft
status: researching
tags:
  - idee
  - saas
  - devtools
  - x-twitter
  - growth
  - solopreneur
date: 2026-04-21
updated: 2026-04-21
---

# Semnal — Sistem personal de creștere organică pe X

> *Draft PRD. Plecat de la confesiunea din [[owner/Who am i]]: vreau să cresc autentic pe X ca solopreneur, fără boți, fără automatizări de porcărie. Am cunoaștere, am ce spune, dar amin postarea.*

## 1. Problema reală (brutally honest)

**Nu e lipsă de conținut. E friction la shipping.**

Am:
- 30 de ani de programare (de pe 386) → stories, analogii, pattern-uri
- experiență hibrid public/tech/AI → unghi rar
- pasiune pentru agenți AI + skills → zeitgeist 2026
- 51 de ani → memorabilitate într-un spațiu dominat de juniori

Nu am:
- obiceiul zilnic de a posta
- un sistem care să transforme gândurile mele (care curg în RO, în vault, în Claude Code, în terminal) în posturi EN pe X
- un feedback loop care să îmi spună ce funcționează
- radar pentru conversații în care ar merita să intru

**Bot-armatele nu rezolvă asta.** Bot-armatele rezolvă "volum fals". Problema mea e "emiterea semnalului real care exist deja în capul meu". De aceea se numește **Semnal**.

## 2. Cine sunt eu ca utilizator (target = n of 1 deocamdată)

- Obsidian-native (trăiesc în `alteramens/` vault)
- Terminal-native (Claude Code e extensia mea a creierului)
- Chrome pentru X
- Timp disponibil: după 15:00, ferestre de 30-90 min
- RO fluent și creativ, EN decent dar nu idiomatic
- Tolerez 0 auto-postare. Omul în loop la fiecare push.

## 3. Principii de design (nu-negociabile)

1. **Capture where thought happens.** Ideea apare în terminal? Captez în terminal. În Obsidian? În Obsidian. În browser citind un thread? În browser.
2. **Human always in the loop before publish.** AI ajută la draft, traducere, unghi — nu apasă butonul.
3. **Voice preservation > fluency.** Engleză cu accent autentic > engleză sterilizată de LLM. Romglish e OK când e intenționat.
4. **Bias spre shipping, nu spre perfecționare.** Sistemul trebuie să reducă activation energy la <60 secunde de la "am o idee" la "e în coadă".
5. **Pillars over randomness.** 2-3 teme clare. Random = amnezic pentru algoritm și pentru urmăritori.
6. **Measure, then double down.** Ce primește bookmarks > ce primește likes. Learning loop documentat în vault.
7. **Dogfood public.** Construirea Semnal-ului e ea însăși content. Meta-loop.

## 4. Cei 3 piloni de conținut (draft, de rafinat)

| Pilon | Unghi | De ce doar tu poți scrie asta |
|-------|-------|------------------------------|
| **AI agents for solo builders** | Cum folosești Claude Code + skills pentru a construi ca un one-man-team | 30 ani de cod + hobby AI + build real ≠ influencer fără cod |
| **Building as a 51yo from a public hospital in Romania** | Jurnal de solopreneur atipic — post-career, not pre-career | Complet invers față de narativul 22-yo-SF-founder. Raritate = memorabilitate. |
| **Skill Era craftsmanship** | Pattern-uri, judgment, opinii — nu tutoriale | CLAUDE.md-ul tău spune exact asta. Aici-i drumul lung. |

## 5. Feature set — MVP (săptămâna 1-2)

### 5.1 Capture Layer
- **Obsidian hotkey** (`Cmd+Shift+X`): selectezi text din orice notă → "seed post" → se duce într-un fișier `workshop/x-queue/inbox.md` cu metadata (sursă, timestamp, pilon sugerat)
- **CLI tool** (`semnal capture "text rapid"`): din terminal, o linie în `x-queue/inbox.md`
  - Flag `--shot` (sau `-s`) → atașează screenshot al ferestrei active (macOS `screencapture`) → salvat în `x-queue/attachments/YYYY-MM-DD-slug.png`, referențiat în seed-ul respectiv. Util după un experiment reușit: textul brut + dovada vizuală a codului/output-ului merg împreună către draft.
- **Browser extension** (Chromium): pe X sau orice site, selectezi text → "riff on this" → captezi citatul + URL + gândul tău

### 5.2 Draft Layer (skill pentru Claude Code)
Skill `/semnal-draft`:
- Ia un seed din inbox
- Întreabă: pilon? format (single / thread / long-form)? limbă?
- Generează 3 variante cu voci diferite (plain, spicy, reflective)
- **Păstrează Romglish-ul** când e autentic. Nu sterilizează.
- Output: `workshop/x-queue/ready/YYYY-MM-DD-slug.md` cu frontmatter (pilon, format, hook, scheduled_for)

### 5.3 Review & Queue
- `semnal queue` — vezi ce e în `ready/`
- `semnal schedule <slug> <time>` — mutare în `scheduled/`
- **Nu postează singur.** Genera un reminder (push / macOS notification) la ora X cu textul gata de copy-paste + link de creare post
- Alternativă pro: integrare cu Typefully / Hypefury API pentru scheduling real, dar cu confirmare manuală

### 5.4 Reply Radar (săptămâna 1 — MVP manual, săptămâna 2-3 — extensie)

> *Reprioritizat din săptămâna 2-3 în săptămâna 1. Motiv: la 0 followers, reply-urile pe conturi din sweet-spot sunt mai eficiente decât posturile originale. Discovery vine prin comentariul valoros sub un post cu trafic, nu prin postul tău fără audiență. ~80% din creșterea inițială vine pe această cale.*

**MVP săptămâna 1 (zero cod, doar disciplină + skill):**
- Listă curată de 10-15 conturi din sweet-spot (5k-50k followers) în `workshop/x-queue/targets.md` — cu nișa, de ce sunt relevanți pentru pilonii tăi, timezone
- Skill `/semnal-reply`: input = URL-ul postului + gândul tău brut în RO → output = 3 variante de reply valoroase în EN, scurte, care adaugă context/experiență/contra-argument (nu "great post!")
- Rutină zilnică: 20-30 min la început de sesiune, 3-5 reply-uri țintite pe zi
- Captură manuală: fiecare reply postat → linie în `x-queue/replies-log.md` (URL post, reply, ora, follow-ups primite) pentru learning loop

**v2 săptămâna 2-3 (extensie browser):**
- Extensia de browser scanează timeline-ul tău când ești pe X
- Highlight posturi din piloni care au: <50 replies, >100 likes în prima oră, autor cu 5k-50k followers
- "Draft reply" → deschide un panou lateral cu cele 3 variante generate de `/semnal-reply`
- Tu alegi, editezi, postezi manual

### 5.5 Learning Loop (săptămâna 3-4)
- `semnal sync` — trage metrici (impressions, bookmarks, replies, follows atribuite) pentru posturile ultimei săptămâni via X API sau scraper local
- `semnal reflect` — skill care analizează: ce pilon performează, ce hook-uri prind, la ce oră, ce format
- Raport săptămânal în `wiki/syntheses/semnal-week-NN.md` (compound-ează!)

### 5.6 Post-Publish Companion (critic pentru algoritm)

> *Prima fereastră de 30-60 min după publish = semnalul algoritmic #1 în 2026. Reply velocity bate aproape orice altceva pentru conturi mici.*

- `semnal publish <slug>` — marchează un post ca trimis, setează timestamp, pornește un timer de 60 min
- Notificări macOS la T+5, T+15, T+30, T+60 min: "Verifică replies la [slug]"
- `semnal engage <slug>` — deschide tabul X al postului + panou lateral cu draft-uri de răspuns pentru fiecare reply primit
- La T+24h: snapshot inițial de metrici în `published/YYYY-MM-DD-slug.md` (impressions, bookmarks, replies, follows)
- La T+72h: snapshot final — curba s-a stabilizat, se poate învăța din ea

**Anti-pattern de evitat:** răspunsuri AI-generate. Draft-urile sunt doar schelet; scrii tu, ca și până acum. Viteza vine din reducerea friction-ului de context-switch, nu din automatizare.

### 5.7 Pre-publish Lint (`/semnal-lint`)

Skill care rulează pe un draft din `ready/` înainte de publish. Ieșire = checklist pass/fail + sugestii:

- [ ] **Fără link extern în tweet 1?** (link-urile se pun în primul reply — pattern obligatoriu în 2026)
- [ ] **Hook în primele 7 cuvinte?** Verifică dacă prima propoziție stoppează scrolling-ul
- [ ] **Format corect declarat?** Dacă `format: thread` — fiecare tweet ≤280 char, CTA / întrebare în ultimul
- [ ] **Media nativă, nu linkată?** Upload direct > link YouTube / imgur
- [ ] **Lungime optimă?**
  - Single tweet: 180-260 char (loc pentru ca X să nu-l trunchieze în preview)
  - Thread: 3-8 tweet-uri (sub 3 = single, peste 8 = long-form)
- [ ] **Pilon declarat în frontmatter?** Fără pilon → refuză publish-ul (forțează disciplina)
- [ ] **Thread sau single?** Heuristic: dacă draft-ul depășește ~270 char SAU conține 3+ puncte distincte → propune thread cu split sugerat

**Output format:**
```
✓ 5/7 checks passed
✗ Hook: primele 7 cuvinte sunt slabe ("Something I've been thinking about...")
  → Sugerat: "Primul meu calculator a fost un 386."
⚠ Lungime: 312 chars. Propun split în thread (2 tweet-uri).
```

Tu decizi dacă aplici sugestiile. Lint-ul nu blochează nimic, doar semnalizează.

## 6. Arhitectură tehnică (propunere)

```
alteramens/
├── tools/semnal/
│   ├── cli.ts              # CLI (bun/node)
│   ├── capture.ts          # scriu în x-queue/inbox.md
│   ├── metrics.ts          # pull X API
│   └── schedule.ts         # optional Typefully bridge
├── .claude/skills/
│   ├── semnal-draft/       # seed → 3 drafturi
│   ├── semnal-reply/       # context → reply valoros
│   └── semnal-reflect/     # săptămânal, ce-a mers
├── workshop/x-queue/
│   ├── inbox.md            # seeds brute
│   ├── ready/              # drafturi gata
│   ├── scheduled/          # cu timestamp
│   └── published/          # arhivă
├── .obsidian/plugins/semnal-capture/  # hotkey plugin simplu
└── chrome-extension/semnal/
    ├── manifest.json
    ├── content.ts          # inject pe x.com
    └── capture.ts          # pe orice site
```

**Stack:** TypeScript + Bun pentru CLI, Obsidian Plugin API, Chrome Extension MV3, SQLite pentru metrici (`semnal.db` — același pattern ca `faber.db`).

**Zero backend.** Totul local, local-first, versionat în git. X API se accesează direct cu token personal.

## 7. Anti-features (ce NU construim)

- ❌ Auto-posting la ore optime
- ❌ Auto-reply cu GPT la comentarii
- ❌ Follow/unfollow automat
- ❌ Engagement pods / reciprocitate organizată
- ❌ Generare de thread-uri din articole scrapate (commodity slop)
- ❌ "Viral template" generator

Dacă mâine Semnal devine produs public, acestea rămân anti-features. Poziționarea e "anti-slop tool for builders cu ceva real de spus".

## 8. Metrici de succes (pentru Narcis, nu pentru produs)

| Metric | T0 (azi) | 90 zile | 180 zile |
|--------|----------|---------|----------|
| Followers | ~X | 300+ | **1000+** |
| Posturi/săptămână | ~0-1 | 5-7 | 7-14 |
| Reply-uri valoroase/săpt | 0 | 10 | 25 |
| Posturi cu >500 impressions | n/a | 20% | 40% |
| Bookmark ratio mediu | n/a | 2% | 5% |

Și un metric calitativ: **numărul de săptămâni consecutive cu ≥5 posturi.** Consecvența bate intensitatea.

## 9. Roadmap

**Săptămâna 1:**
- CLI `semnal capture` (cu `--shot`) + structura `x-queue/`
- Skill `/semnal-draft` (MVP)
- Skill `/semnal-reply` (MVP) + `x-queue/targets.md` cu 10-15 conturi din sweet-spot
- Definire finală piloni + 10 seeds inițiale
- **Primul post în 48h** + **3 reply-uri valoroase în prima săptămână** (bias pentru acțiune, nu pentru tooling)

**Săptămâna 2-3:**
- Obsidian hotkey plugin
- Chrome extension: capture de pe orice site + Reply Radar cu highlighting pe timeline

**Săptămâna 4-6:**
- Metrics sync (X API)
- Skill `/semnal-reflect` săptămânal
- Prima sinteză în wiki

**Săptămâna 7-12:**
- Iterații pe baza learning loop
- Dacă depășești 500 followers cu sistemul tău → considerăm productizarea (Skill publicat + template vault + extensie open-source)
- Meta-content: "How I built a tool that helped me go from 0 to 1000 followers without bots"

## 10. De ce asta rezolvă problema reală

Problema ta nu e "nu știu ce să postez". Problema ta e:

> *"Am tendința nefericită să tot amân, să postez."*

Semnal atacă asta direct:
- **Amânarea** = friction. Semnal reduce friction la <60s "idee → în coadă".
- **Perfecționismul** = paralizie. Semnal îți dă 3 variante imediate, alegi, trimiți. Perfect = enemy.
- **Preferi experimentul postării** = perfect. Construirea Semnal-ului E experimentul. Plus, a-ți împărtăși construirea lui = content organic pe pilonul 1.

**Meta-observație:** construirea acestui sistem este în sine un proiect care îți încarnează filozofia din [[MANIFEST]]: Skill Era (skills care encodează judgment) + Productize Yourself (code ca leverage, content ca leverage, ambele compound). Dacă îl construiești public, devine cel mai autentic marketing posibil pentru tine.

## 11. Primul pas concret (diseară)

1. Alege 3 piloni (îți propun pe cei de mai sus — rafinăm împreună)
2. Scrie 10 seeds brute în RO, în 20 min, fără filtru: "lucruri pe care aș vrea să le spun"
3. Folosește Claude Code să transformi 3 dintre ele în posturi EN
4. **Postează cel puțin 1 diseară.** Nu mâine. Diseară.
5. Mâine construim CLI-ul.

---

## Legături
- [[owner/Who am i]] — contextul personal care justifică ungihul
- [[MANIFEST]] — Skill Era + Productize Yourself
- [[CLAUDE]] — convențiile de colaborare
- [[workshop/drafts/Articol interesant]] — teza despre skills vs APIs
- [[Foundation]] — Naval's framework aplicat
