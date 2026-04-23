---
title: "Faber — Framework distribuibil pentru vault-wiki-self augmentat cu AI"
type: vision
status: draft
tags:
  - faber
  - vision
  - meta
  - distribution
  - product
  - framework
date: 2026-04-23
author: Narcis + Claude Code
related:
  - "[[CLAUDE]]"
  - "[[wiki/FABER]]"
  - "[[MANIFEST]]"
  - "[[docs/faber-model-b-migration]]"
decisions_locked:
  - name: Faber (promovat de la sub-layer la întreg framework-ul)
  - philosophy: Neutru + ghid opțional de ancorare
  - onboarding: Web wizard → zip download → Claude Code preia
  - tech_stack: Doar Claude Code + Git (Python/SQLite ascunse ca internals)
  - seed: Scaffolding universal + self gol completat prin interviu
  - confrontation: Core dar off by default, user unlock după 2-4 săptămâni
version: "0.1"
---

# Faber — Framework distribuibil pentru vault-wiki-self augmentat cu AI

> "Un sistem în care gândirea ta, identitatea ta și evidences-ul faptelor tale se confruntă periodic, astfel încât în timp cunoștințele și caracterul tău **compundă**."

Acest document e **viziunea** pentru următoarea iterație a Alteramens: abstractizarea sistemului actual într-un framework pe care oricine îl poate clona și personaliza, indiferent de nivelul tehnic, voce, limbă sau valori. Scopul: un non-tehnician prieten care a văzut cum lucrezi și a spus "vreau și eu asta" să poată pleca în 30 de minute cu propriul vault-wiki-self, gata să înceapă compounding-ul.

---

## 1. Contextul: ce e de fapt Alteramens

Înainte de a abstractiza, trebuie să numim corect ce avem. **Alteramens nu este un vault Obsidian.** Nu este un wiki. Nu este un folder cu skills.

Alteramens este un **sistem de reflecție confruntabil, augmentat cu AI** cu cinci straturi intercalate:

| Strat | Ce face | Artefact concret |
|---|---|---|
| **Workspace (vault)** | Gândirea umană: capture, draft, aplicare | `inbox/`, `workshop/`, `projects/`, `archive/` |
| **Library (wiki)** | Cunoaștere structurată întreținută de AI | `wiki/` cu sources/entities/concepts/syntheses |
| **Self** | Identitatea declarată ca **date queryable** | `wiki/self/` cu pillars/stances/commitments/constraints/voice |
| **Log** | Timpul — ce s-a întâmplat și când | `wiki/log.md` + tabele `log_events` în SQLite |
| **Skills** | Judgment encodat, invocabil | `.claude/skills/*` (54 skills în momentul acesta) |

**Patternul cel mai original** — și pe care trebuie să-l ducem mai departe — este *Self ca date structurate*. În majoritatea sistemelor de knowledge management, identitatea utilizatorului e implicită: o scurtă "about me" într-un readme. În Alteramens, identitatea este o tabelă SQL cu coloane tipate, pe care fiecare skill o citește la startup și care este **confruntată** periodic cu log-ul realității (`/faber-mirror`, `/faber-meet`). Asta transformă "AI assistant generic" într-un "AI care știe cine declari că ești și te confruntă când devi".

Tot ce urmează se construiește pe această observație.

---

## 2. Teza distribuției: De ce acum

Cinci semnale converg:

1. **Claude Code + SKILL.md** a devenit un format standard. Skills sunt portabile între utilizatori. Acum un an, aceeași idee ar fi cerut o platformă proprietăț.
2. **Obsidian + markdown** e deja adoptat de milioane de oameni non-tehnici. Infrastructura perceptuală există.
3. **AI-augmented thinking** e în vârful curbei de adopție, dar aproape toate produsele sunt: (a) chat decuplat de vault, sau (b) vault fără AI. Spărtura dintre ele e neumplută.
4. **Self-ul ca date** e un vector de diferențiere real, nu încă tokenizat pe piață. Nimeni nu vinde "AI care te confruntă cu propriile stance-uri declarate".
5. **Ai fost văzut facând asta**. Este primul semnal de cerere reală (o persoană non-tehnică a cerut "să încerc și eu"). Primul utilizator extern = primul indicator de PMF potențial.

Timing-ul e bun, dar fereastra nu e infinită. Cursor, Notion AI, ChatGPT Projects vor intra în acest spațiu în următoarele 6-12 luni. Diferențiatorul tău (self-as-data + confruntare) trebuie să fie live înainte ca primul competitor să-l copieze.

---

## 3. Numele și poziționarea

**Framework-ul se numește Faber.**

Motive:
- *Homo faber* — omul făuritor; rezonanță filozofică care se leagă de "Skill Era + Productize Yourself" fără să impună acele ancore unui utilizator nou
- Scurt, memorabil, internațional
- Domain-uri disponibile: `faber.codes`, `getfaber.com`, `faber.dev`, `faber.wiki`
- Implică build/craft — contrazice percepția că AI produce "mediocritate generată"

**Alteramens rămâne numele laboratorului tău personal.** Faber este cutia goală pe care ai umplut-o cu Alteramens. Oricine poate începe cu Faber și să-și denumească propriul laborator cum dorește.

### One-liner pentru landing page

> **Faber — Your AI-augmented thinking system that compounds over time.**
> Declare who you are. Ingest what you read. Let Claude confront the difference.

### Poziționare față de alternative

| Produs | Ce face | Ce nu face |
|---|---|---|
| **Obsidian** | Markdown + plugins + grafs | Nu are AI nativ, nu are self-layer, nu confruntă |
| **Notion AI** | Chat peste note | Proprietate, schema liberă, fară skills portabile, fără confruntare |
| **Mem / Reflect** | AI journal | Proprietate, fără vault portabil, fără schema strictă |
| **ChatGPT Projects** | Chat cu fișiere atasate | Fără persistență structurată, fără self, fără log temporal |
| **Faber** | Vault + Wiki + Self + Log + Skills portabile | E un framework, nu un SaaS — cere învățare inițială |

Faber nu concurează cu Obsidian — **îl consumă**. Vault-ul Faber este deschis în Obsidian pentru citire umană; Claude Code operează deasupra.

---

## 4. Cele trei primitive ale Faber

Framework-ul expune exact trei primitive conceptuale. Oricare skill, feature sau extensie trebuie să se reducă la combinații între ele.

### 4.1 **Vault** — unde gândești

Patru roluri fizice (foldere):

```
inbox/        → captură brută (raw, neprocesat)
workshop/     → explorare (ideas, drafts, experiments, notes)
projects/     → aplicare (cod, decizii, learnings)
archive/      → parcat / finalizat
```

**Promotion path**: `inbox → workshop → wiki → projects`. Orice piesă de conținut traversează calea asta la tempo propriu. Frameworkul nu impune viteza; doar ofertează drumul.

### 4.2 **Wiki** — ce știi

O bibliotecă autoîntreținută de AI cu schemă strictă, declarată prin `wiki/.faber.toml`:

```
wiki/
├── .faber.toml      ← marker: declară directorul ca library
├── FABER.md         ← convențiile schema
├── faber.db         ← SQLite derivat (disposable, .gitignored)
├── faber_sync.py    ← rebuild index din .md (idempotent)
├── index.md         ← auto-generat
├── log.md           ← append-only, parsat în log_events
├── sources/         ← surse ingerate (articole, cărți, conversații)
├── entities/        ← oameni, companii, tools, framework-uri
├── concepts/        ← pattern-uri, modele mentale
├── syntheses/       ← analize cross-cutting, răspunsuri la întrebări
└── self/            ← identitatea declarată (vezi 4.3)
```

**Regula de aur:** `.md` = adevăr. `faber.db` = derivat. Șterge DB-ul, rulezi sync, primești același rezultat. Portabil, versionabil, rezistent la corupere.

### 4.3 **Self** — cine declari că ești

Fișiere în `wiki/self/` cu frontmatter tipat, citite de toate skills la startup:

| Fișier | Ce conține | Afectează |
|---|---|---|
| `pillars.md` | 1-3 ancore de identitate pe arc lung | Filtrul "se aliniază cu un pilon?" |
| `stances.md` | Poziții declarate pe sub-probleme concrete | Confruntarea cu sursele ingerate |
| `commitments.md` | Obligații măsurabile cu deadline | `/faber-mirror` verifică progres |
| `constraints.md` | Limitări reale (timp, slăbiciuni, resurse) | Toate skills respectă lista asta |
| `voice.md` | Reguli de voce cu exemple YES/NO | Orice text scris "în numele tău" trece regulile |

**De ce e acesta diferențiatorul #1:** AI-ul nu citește un paragraf "I'm a 51yo builder who...". Citește un rând SQL care spune "pilon activ: `ai-agents-for-solo-builders`, stance: `shipping-over-perfection`, voice: `romglish-when-natural`". Orientarea e instantanee și consistentă între sesiuni.

**Self nu e static.** Fiecare ingest poate genera *stance candidates* (poziții noi pe care sursa le cristalizează dar pe care nu le-ai declarat încă). `/faber-meet` (lunar) e momentul în care reconsideri, promovezi sau retragi pillars/stances/commitments.

---

## 5. Principii de design

Regulile care guvernează orice decizie viitoare în Faber.

### P1. **Markdown este adevărul. Orice altceva e derivat.**
Dacă ștergi DB-ul, pierzi doar indexul. Dacă ștergi markdown, pierzi totul. Asta garantează: portabilitate totală, rezistență la breaking changes, vendor-independence, diffs umane în git.

### P2. **Skills sunt portabile. Datele sunt tale.**
Un skill Faber nu conține date despre utilizator. Un vault Faber nu conține cod. Oricine poate face fork unei skills; nimeni nu ajunge la datele tale fără access la vault.

### P3. **Self declarativ, confruntat de evidence.**
Orișicând poți confrunta `wiki/self/*` cu `log_events`. Drift-ul nu ne ascunde; îl numim.

### P4. **Onboarding gradual. Puterea se deblochează.**
Utilizatorul nou primește 3 skills active. După 2-4 săptămâni de utilizare, Claude sugerează următorul unlock (ex: "Ai 15 pages în wiki. Vrei să activezi `/faber-query`?"). Nu aruncăm 54 de skills în brațele cuiva în ziua 1.

### P5. **Zero asumare de filozofie.**
Framework-ul nu știe cine e Naval, ce e Skill Era, de ce ar trebui să faci "productize yourself". Acelea sunt alegerile *tale*. Faber te învață cum să-ți declari ancorele — nu pe care să le adopți.

### P6. **Limba e neutralitate.**
Interfațele (wizard, skills, prompt-uri) funcționează în orice limbă. Voice rules pot specifica Romglish, Spanglish, pure-EN sau orice altceva. FABER.md schema e universală (field names în EN), dar conținutul creat de user e în limba lui.

### P7. **Local-first, cloud-optional.**
Totul funcționează offline. Claude Code rulează cu API key propriu. Fără server Faber, fără cont, fără lock-in. Extensii cloud sunt opt-in (ex: backup, multi-device sync) — nu funcționalitate obligatorie.

### P8. **Confruntă > complimă.**
Când există drift între self-ul declarat și log, Claude îl spune. Default-ul e tonul *direct*, nu *sycophant*. Utilizatorul poate înmuia tonul, dar nu e default.

---

## 6. Arhitectura distribuției

### 6.1 Diagramă high-level

```
   [ Website: faber.dev ]
          │
          ├── Landing page (pitch, demo video, pricing)
          ├── Docs (concept, tutorial, API reference)
          └── /wizard  ← identity interview
                │
                ▼
         [ ZIP DOWNLOAD ]
   faber-{slug}-{date}.zip
                │
                ▼
   User unzips → opens folder → runs `claude`
                │
                ▼
   [ Claude Code + CLAUDE.md ]
          │
          ├── Greeting + 'first steps' (install deps, git init, run /faber-sync)
          ├── Phase 1: Ingest your first source (guided)
          ├── Phase 2 (week 2+): Deepen self via /faber-meet
          └── Phase 3 (month 1+): Unlock confrontation loop
```

### 6.2 Ce conține zip-ul

```
faber-yourname/
├── .claude/
│   ├── skills/              ← cele ~12 skills din "Core bundle"
│   └── settings.json        ← permissions default safe
├── .gitignore              ← ignoră faber.db, .DS_Store
├── CLAUDE.md               ← ghid de colaborare personalizat
├── README.md               ← first-run instructions (2 pages max)
├── MANIFEST.md             ← TEMPLATE gol, completat prin wizard
├── Home.md                 ← dashboard personal
├── inbox/                  ← gol, cu un .gitkeep
│   └── clippings/
├── workshop/
│   ├── ideas/
│   │   └── _template.md
│   ├── drafts/
│   ├── experiments/
│   └── notes/
├── projects/
│   └── _how-to-start-a-project.md
├── archive/
├── wiki/
│   ├── .faber.toml
│   ├── FABER.md            ← schema (identic pentru toți utilizatorii)
│   ├── faber_sync.py       ← identic
│   ├── index.md            ← gol, va fi populat de sync
│   ├── log.md              ← cu entry-ul 'init' pre-scris
│   ├── sources/            ← gol
│   ├── entities/           ← gol
│   ├── concepts/           ← 3-5 concepts universale (vezi 7.2)
│   ├── syntheses/          ← gol
│   └── self/               ← TEMPLATE-uri completate de wizard
│       ├── pillars.md       ← PRE-POPULAT din răspunsurile wizard
│       ├── stances.md       ← PRE-POPULAT
│       ├── commitments.md   ← PRE-POPULAT
│       ├── constraints.md   ← PRE-POPULAT
│       └── voice.md         ← PRE-POPULAT
└── slides/                 ← gol (output pentru /faber-slides)
```

**Nota critică:** zip-ul NU conține `faber.db`. User-ul îl va genera la prima rulare cu Claude. Asta evită corupere prin unzip și educă de la început că DB e derivat.

### 6.3 Core skills bundle (v1)

Nu toțți 54 din Alteramens. Doar 12, organizate în **3 tier-uri**:

**Tier 1 — Activate la instalare (5 skills):**
- `/faber-init` — completează ultima milă a setup-ului, populează log.md, rulează sync inițial
- `/faber-ingest` — guided ingest (cel mai utilizat skill)
- `/faber-query` — întreabă wiki-ul
- `/faber-status` — dashboard (ce știu, ce s-a întâmplat recent)
- `/faber-sync` — rebuild DB

**Tier 2 — Suggested după 10+ ingests (4 skills):**
- `/faber-lint` — health check
- `/faber-brief` — wake-up briefing
- `/faber-link` — cross-link wiki cu vault docs
- `/faber-seed` — batch processing vault → wiki

**Tier 3 — Unlocked manual după ~1 lună (3 skills):**
- `/faber-mirror` — confruntare săptămânală self vs evidence
- `/faber-meet` — revizie lunară self (pillars/stances/commitments)
- `/faber-slides` — HTML decks din wiki pages

**După v1:** skills de content (`/semnal-*`, `/to-content`), skills de dezvoltare (marketing, SEO etc.) sunt pluginuri opt-in instalate dintr-un "Faber Skills Marketplace" (vezi secțiunea 11).

---

## 7. Interviul de identitate (cruxul produsului)

Aici stă toată diferența între "încă un scaffold" și "primul sistem care mă înnelege". Wizard-ul trebuie să elicită self-ul fără să oblige utilizatorul să știe YAML sau să citească FABER.md.

### 7.1 Principii ale interviului

1. **30-45 minute, nu mai mult.** Peste, abandonează.
2. **Limbaj natural, nu terminologie.** User-ul nu vede "pillar", "stance", "constraint". Vede "ce te obșinește să te trezești dimineața?", "ce nu mai suferi să auzi?", "la ce NU ești dispus să renunți?".
3. **Progresiv, nu holistic.** 5 secțiuni de 6-10 întrebări. Fiecare secțiune pre-completează un fișier self/.
4. **Save-and-return.** Începe, lasă, revino. Cookie cu progres. User non-tehnic nu termină într-un foc.
5. **Preview la final.** Înainte de download, arată către utilizator "iată ce a înțeles Claude despre tine" — textul final care va fi generat în self/*. Poți edita inline.

### 7.2 Cele 5 secțiuni

**Secțiunea 1 — Identitatea în 3 ancore** (→ `pillars.md`)
> "Dacă ar trebui să explici unui cunoscut în 2 propoziții de ce faci ce faci, care ar fi primul lucru pe care l-ai spune?"
> "Dacă peste 3 ani cineva scrie un articol despre tine, la ce 3 cuvinte-unghi ai vrea să se oprească?"
> "Ce lucru faci tu care n-ar putea face altcineva la fel?"

**Secțiunea 2 — Poziții declarate** (→ `stances.md`)
> "Există o practică pe care alții în domeniul tău o fac și tu refuzi? Care și de ce?"
> "Ce propoziție ar bate la cap pe cineva care te cunoaște: 'Știe ce zice când aude ___'?"
> "Când ești în dubiu între 2 opțiuni, ce criteriu folosești?"

**Secțiunea 3 — Obligații asumate** (→ `commitments.md`)
> "Ce ți-ai promis să realizezi în următoarele 12 luni?"
> "Cum ți-ai da seama că ai realizat-o?" (deadline + semnal)
> "Ce livrare publică crezi că poate deveni cadence?" (săptămânal/lunar)

**Secțiunea 4 — Limitări și slăbiciuni** (→ `constraints.md`)
> "Câte ore pe zi sunt realiste pentru asta? (fără minciuni)"
> "Care e tiparul tău de amânare? (exemple: nu public, nu termin, nu cer ajutor)"
> "Ce constrângeri fizice/familiale/profesionale nu sunt negociabile?"
> "La ce ți se poate prinde ușor sistemul de tine? (ce e nervul expus?)"

**Secțiunea 5 — Voce și limbă** (→ `voice.md`)
> "În ce limbă scrii natural?" (multi-select)
> "Folosești cod-switching? (ex: Romglish, Spanglish, ...)" 
> "Lipește un paragraf pe care l-ai scris recent — Claude va extrage 3 reguli de voce."
> "Ce sună ca și cum NU ai fi scris tu?" (exemple de ce eviți)
> "Pe ce register vorbești când ești nepoliticos cu propriile tale idei?" (se duce în tonul `/faber-mirror`)

**Output final:** cele 5 fișiere self/ pre-populate cu frontmatter valid, gata pentru sync. User-ul primește zip-ul cu identitatea *deja* encodată.

### 7.3 "Universal concepts" seed — ce vine gata în wiki

Zip-ul conține 3-5 concepts *universale*, neutre filozofic, care ilustrează schema wiki-ului:

1. **`compounding`** — ce înseamnă "lucrurile care cresc prin acumulare vs consum" (concept, nu religie)
2. **`leverage`** — definiție simplă: input mic, output mare (capital / media / code / people)
3. **`identity-over-motivation`** — cine ești bate ce simți astăzi (habit-forming, fără filozofie specifică)
4. **`default-status`** — ce se întâmplă dacă nu intervii (pentru constraint thinking)
5. **`feedback-loop`** — acțiune → observație → ajustare (fundamentul oricărui sistem viu)

Fiecare concept e ~300 cuvinte, cu `maturity: seed`, fără sources atașate. User-ul le șterge dacă nu rezonează, le adoptă dacă da. Rolul lor: **să arate patternul**, nu să impună conținutul.

Nu livrăm: Naval, DHH, Karpathy, Skill Era, Productize Yourself. Acelea sunt alegerile tale, Narcis. Faber învață utilizatorul cum să și le aleagă pe ale lui.

---

## 8. Onboarding flow — pas cu pas

### 8.1 T0: Wizard web (30-45 min)

1. User aterizează pe faber.dev
2. Citește pitch-ul, vede 2-min demo video
3. Click "Start your vault"
4. Wizard: 5 secțiuni (vezi 7.2). Save-and-return support.
5. Preview final: "Iată ce va ajunge în self/ *. Edit-e inline orice."
6. Alege slug (ex: `laura-jurnal`). Alege nume label (poate fi diferit de slug).
7. Click "Generate my Faber vault". Zip download (~500KB).

### 8.2 T1: Prima deschidere (10 min)

1. User unzip-ează în `~/Documents/faber-laura-jurnal`
2. Deschide folderul în Obsidian (opțional, pentru navigare vizuală)
3. Deschide Terminal/iTerm în acel folder
4. Rulează `claude` (Claude Code CLI)
5. Claude citește CLAUDE.md personalizat — și începe onboarding-ul:

> "Bună, Laura. Văd că ai completat wizard-ul și mi-ai povestit despre cele 3 ancore ale tale: (1), (2), (3). Iată primii pași. Să înceapă?"

Claude orchestrează:
- `git init` + primul commit ("☀ init")
- Instalare dependencies (Python via `uv` sau `brew`, dacă e cazul)
- Rulează `/faber-init` care generează `faber.db`
- Generează primul log entry "init — Faber created by Laura"
- Oferă: "Vrei să ingestăm împreună primul articol care te-a inspirat?"

### 8.3 T2: Prima ingerare (20 min)

- User lipește un URL sau text
- Claude rulează `/faber-ingest` — full workflow Phase 1 (discuss) → Phase 2 (extract) → Phase 3 (create pages)
- Creează: 1 source + 2-3 entities + 1-2 concepts
- Arată: "Acum ai 4 pages în wiki. Dacă vrei, o să le citești în Obsidian."
- Pauză aici. User experimentează. T2 nu e urmat imediat de T3.

### 8.4 T3: Săptămâna 2-3 (organic)

User face 5-15 ingests. Claude începe să sugereze:
- "Observ că această sursă atașează de entitatea [[john-doe]] — o actualizăm?"
- "Am văzut aceeași idee mentționată în 3 sources. E cazul să creez un concept?"
- "Să rulezi `/faber-status`? Vreau să îți arăt creste-rea."

### 8.5 T4: Luna 1 (unlock Tier 2)

Când user-ul are 20+ pages, Claude propune:
> "Ai acum o bibliotecă suficient de bogată ca să treci la următorul nivel. Vrei să activezi `/faber-lint` (health check), `/faber-brief` (briefing la startul fiecărei sesiuni) și `/faber-link` (cross-link automat)? Sunt incluse deja, dar dezactivate până acum."

### 8.6 T5: Luna 2 (unlock Tier 3 — confruntă)

> "Laura, văd că ai declarat commitment-ul '1 articol pe săptămână'. În ultimele 4 săptămâni văd 2 articole în log. Vrei să activez `/faber-mirror`? E un skill care, săptămânal, îți compară ce ai declarat cu ce ai făcut, direct și fără menajări. Lunar, `/faber-meet` te cheamă să revizuiești toate declarațiile."

User acceptă sau refuză. Claude nu insistă.

---

## 9. Arhitectura tehnică a wizard-ului

### 9.1 Stack recomandat (minimal)

- **Frontend**: Next.js / Astro (SSR, form state, progress)
- **Backend**: Nodă serverless / Cloudflare Workers (generează zip on-demand)
- **Template engine**: Handlebars sau simple string replacement peste fișierele template incluse în repo
- **Storage**: R2 / S3 pentru bundle-ul de resurse (skills, FABER.md, faber_sync.py)
- **Payments (dacă e cazul)**: Lemon Squeezy / Stripe Checkout
- **Analytics**: Plausible (privacy-friendly)

### 9.2 Generare zip

1. User submit finalizează wizard
2. Backend loadă template repo-ul Faber core (in-memory sau dintr-un R2 bucket)
3. Pentru fiecare fișier cu placeholder (ex: `wiki/self/pillars.md`), face template substitution din răspunsurile user-ului
4. Pentru fișierele statice (FABER.md, faber_sync.py, skills), copie as-is
5. Creează un zip stream cu response headers corectă (`Content-Disposition: attachment`)
6. Trimite la user

Tot procesul < 2 secunde. Zero state persistent la server (privacy-by-design).

### 9.3 Updates ulterioare

User-ul rulează `/faber-update` din Claude Code. Skill-ul:
- Descarcă latest bundle de skills + FABER.md + faber_sync.py de pe GitHub
- Aplică migrațiile necesare pe faber.db (versioning strict)
- **NU atinge** conținutul utilizatorului (sources/entities/concepts/syntheses/self/)
- Commit-ează în git

Asta înseamnă: user-ul primește skills noi și schema fixes fără să piardă munca proprie.

---

## 10. Modul gradual — de la începător la power user

Faber trebuie să se simtă folositor în ziua 1 *și* să scaleze la 10.000 de pagini peste 3 ani. Asta cere praguri vizibile, nu praguri tăcute.

### 10.1 Beginner mode (săptămâna 1-3)
- 5 skills active
- CLAUDE.md conține instructțiuni simplificate ("Explică mereu ce face un skill înainte să-l rulezi.")
- Dashboard Home.md afișează "Cele 3 lucruri pe care le poți face astăzi"
- Confruntația e dezactivată

### 10.2 Practitioner mode (săptămâna 4-12)
- 9 skills active (Tier 1 + Tier 2)
- Dashboard arată growth (pages/week, concept maturity distribution)
- Claude poate sugera propriu concept promotions (seed → developing)

### 10.3 Advanced mode (luna 3+)
- 12 skills active (toate core)
- Confruntația pornită (`/faber-mirror` săptămânal, `/faber-meet` lunar)
- Access la skills marketplace (vezi 11)

### 10.4 Hacker mode (când user-ul vrea)
- Poate scrie propriile skills în `.claude/skills/custom/`
- Poate modifica faber_sync.py
- Poate extinde schema (add custom page types)
- Poate expune wiki-ul via MCP server la alte agenți

Trecerea între moduri nu e automată — e propusă, user confirmă. Un principiu important: **Faber nu te surprinde cu putere. Te întreabă dacă o vrei.**

---

## 11. Distribuție și model de business

Cinci opțiuni, cu trade-off-uri.

### Opțiunea A: Open-source complet + donații
- Repo GitHub public
- Wizard site gratuit
- Donații prin GitHub Sponsors / Buy Me a Coffee
- **Avantaj:** maximă adopție, nicio barieră
- **Dezavantaj:** zero revenue predictibil

### Opțiunea B: Open-core + paid skills marketplace
- Core (12 skills + schema + wizard) gratuit și open-source
- "Faber Skills Marketplace" = platformă pentru skills premium (gen `/semnal-draft`, skills pentru doctori / avocați / content creators)
- Creatorii de skills primesc % (70/30 split)
- **Avantaj:** compound-ează (mai mulți creatori → mai multe skills → mai multă atracție)
- **Dezavantaj:** muncă de curatoriat, payment infrastructure

### Opțiunea C: Core free + "Faber Cloud" opt-in ($10/lună)
- Core + self-hosted gratuit
- Cloud include: backup auto, multi-device sync, mobile capture app, weekly email briefing
- **Avantaj:** recurring revenue, low churn (vault-ul e lipit de sistem)
- **Dezavantaj:** server costs, support load

### Opțiunea D: Plătești odată ($49) pentru instalare + skills premium
- Wizard gratuit pentru preview
- Download complet + toate skills premium: $49 o dată
- Update-uri gratuite pe viață
- **Avantaj:** clean business model, zero subscription fatigue
- **Dezavantaj:** revenue plafonat

### Opțiunea E: Curs / cohort pay-per-access ($300 pentru "Faber Deep Dive")
- Framework-ul e free, cursul costă
- 4-săptămâni-cohort în care înveți să folosești Faber pentru obiectivele tale specifice
- **Avantaj:** personal brand pentru Narcis, revenue premium
- **Dezavantaj:** scalabilitate limitată de timpul tău

**Recomandarea mea strategică:** hibrid **B + E**.
- Faber core = open-source (build trust, seed adopție)
- Skills marketplace = revenue scalabil
- Cohorts "Faber pentru X" = leverage pentru personal brand și pilonul *Building as a 51yo from a public hospital* (autoritate + lev-erage + accountability).

Asta se aliniază direct cu pilonii tăi activi — Faber devine chiar expresia tezei "Productize Yourself + Skill Era".

---

## 12. Roadmap — de la viziune la v1

### Faza 0 — Spec frozen (astăzi, 2026-04-23)
- [x] Acest document
- [ ] Decizie: nume confirmat (Faber)
- [ ] Decizie: business model pick

### Faza 1 — Core extraction (2-3 săptămâni)
- [ ] Extrage `wiki/FABER.md` ca schema universală (șterge referințe Narcis-specific)
- [ ] Parametrizează `faber_sync.py` (nimic hardcoded spre Alteramens)
- [ ] Repo nou: `github.com/narcis13/faber` (public, MIT license)
- [ ] Scaffold: folder structure template, .gitignore, CLAUDE.md template, README cu first-run
- [ ] Portă cele 12 core skills la template (strip Narcis-specific content)
- [ ] Generate universal concepts seed (3-5 neutre)

### Faza 2 — Identity interview engine (2 săptămâni)
- [ ] Design wizard UX (Figma / pe hârtie)
- [ ] Landing page + pitch copy + demo video
- [ ] Backend template engine (fie Next.js, fie Cloudflare Workers)
- [ ] Testing cu 3 "guinea pigs" non-tehnici (prieteni, soția, poate chiar persoana care ți-a cerut sistemul)

### Faza 3 — Polish + launch (2 săptămâni)
- [ ] `/faber-init`, `/faber-update` skills (cele critice pentru onboarding auto)
- [ ] Docs site (schema, tutorials, concepts, FAQ)
- [ ] Landing page live pe faber.dev
- [ ] Launch post pe X + HN + IndieHackers
- [ ] Ready pentru 10 early users

**Total: 6-7 săptămâni** de la astăzi la launch public. Aliniat cu constrângerea ta (08-15 job + seara personal), asta înseamnă lansare realistă în **iunie 2026**.

### Faza 4 — Marketplace v0 (luna 3-4)
- [ ] Mecanism de submit skills (GitHub PR flow, nu portal dedicat în v0)
- [ ] Curatoriat manual al primelor 10 skills
- [ ] Paid skills: Lemon Squeezy checkout + GitHub distribution

### Faza 5 — Faber Cohort #1 (luna 5-6)
- [ ] 4-săptămâni program: "Faber for Solopreneurs" (capacity: 10 oameni)
- [ ] Preț: $300
- [ ] Format: video lessons + săptămânal group call + async support în Discord
- [ ] Revenue target Cohort #1: $3K

---

## 13. Ce vede Claude (strateg) pe care nu ai intuit

Câteva unghiuri pe care le-am văzut curgand prin sistem și pe care le surfărs explicit:

### 13.1 Faber e un **anti-gym-product**
Majoritatea sistemelor de productivity sunt "gym membership psychology": începi motivat, pierzi momentum, abandonezi, renewal automat. Faber e opusul: friction la început (interviu de 45 min), zero subscription psychology după. Valoarea crește mono-tonic, nu exponențial — dar fără drop-off.

### 13.2 Identity interview = **moat defensiv**
Cineva îți poate copia schema markdown într-o zi. Nu-ți poate copia 45-min-interview-flow-care-produce-self-valid. Asta cere: UX research, copy writing, testing cu non-tehnicieni, iterare pe drop-off rates. 3 luni de muncă care nu se vede din exterior.

### 13.3 Confruntația e **un nou gen de UX**
Niciun competitor nu are "AI-ul tău te confruntă direct cu ce ai declarat". Raportul cel mai aproape: Mel Robbins journal, dar fără structured data în spate. Dacă reușești să faci `/faber-mirror` să sune *uman* și *drept*, ai un diferențiator permanent.

### 13.4 Limba devine vector de diferențiere
Toate uneltele AI actuale sunt optim englezești. Faber suportă nativ Romglish, Spanglish, Franglais, orice. Un utilizator din Spania care-și poate declara voice rules în spaniolă și are Claude ce scrie în acel register — e un gap masiv pe care nimeni nu-l acoperă.

### 13.5 Faber poate fi un **agent-native SSoT**
Cum apar tot mai mulți agenți AI personali (ChatGPT Connectors, Claude MCP, Gemini Agents), Faber poate deveni *sursa comună de adevăr*: fiecare agent, indiferent de platformă, citește self + wiki + log prin MCP. Atunci Faber devine infrastructură, nu aplicație. Asta e Stage C din migrație (federation) gandit văzut altfel — nu federare de wikis, ci federare de agenți care consumă un wiki.

### 13.6 Pilonii tăi sunt ali-niați cu Faber-as-product
- *AI agents for solo builders* → Faber e exact acest lucru
- *Building as a 51yo from a public hospital* → jurnalul Faber-ului build-ed in public e un pilon în sine
- *Skill Era craftsmanship* → skills marketplace + cohort "Faber Deep Dive"

Asta înseamnă că fiecare activitate pe Faber hrănește simultan pilonul tău și produsul tău. Este un exemplu perfect de **compounding alignment**.

### 13.7 Riscul real: scop prea larg în v1
Tentația va fi să portezi toate cele 54 de skills în Faber. GREȘEALĂ. V1 = 12 skills, masiv testate. Marketplace-ul e cum scalezi variety, nu core-ul.

### 13.8 Riscul real 2: confruntarea *se simte rău* pentru non-tehnicieni
Soția ta poate nu vrea să fie confruntată săptămânal cu promisiuni neonorate. Tu da. Asta e un diferențial de register. Wizard-ul trebuie să întrebe explicit: "Vrei un ton soft, drept, sau direct?". Oricare e accep-tabilă; lipsa alegerii nu.

### 13.9 Soția ta = first validator
Este un expert contabil cu 20 clienți, non-tehniciană, dar vede zilnic probleme de organizare. Dacă wizard-ul Faber produce ceva *ea* ar folosi, ai trecut primul test. Inversează direcția: începe wizard-ul testing cu *ea*, nu cu tine.

### 13.10 Vehiculul de compounding pentru personal brand e acest document
Spătura viziune → repo → wizard → launch e un serial de postare natural. Dacă documentezi build-ul săptămânal pe X, fiecare milestone e un post. Este opusul slăbiciunii declarate (amânarea postării) — fiecare livrare tehnică devine automat obligație publică.

---

## 14. Întrebări deschise — de decis ulterior

### 14.1 Tehnic
- Portăm `faber_sync.py` la TypeScript pentru single-binary experience? (decizie la Faza 3)
- Suport MCP server în v1 sau v2? (probabil v2)
- Mobile capture app? (nu în v1; poate Cohort #1 build-ează asta)

### 14.2 Business
- Preț inițial skills premium: $5, $10 sau $20?
- Licență MIT vs AGPL? (MIT for adoption vs AGPL for protect marketplace business)
- Dacă mergem cu Cohorts: synchronous vs self-paced?

### 14.3 Scope
- `/semnal-*` skills (X posting pipeline) — core Faber sau marketplace premium? (argument pentru marketplace: e foarte niched, argument pentru core: e exact anti-procrastination-tool și poate fi atrag-ator)
- Suport pentru alte limbi non-latin (CJK, arabic)? (probabil v2)
- Integrare cu alte AI providers (OpenAI, Gemini)? (prob v2, altfel distragere)

### 14.4 Filozofic
- Permitem fork-uri *opinionate* ale framework-ului (ex: "Faber for Stoics" cu seed-uri din Marcus Aurelius)? Sau interzicem?
- Skills marketplace acceptă skills cu conținut politic/religios explicit?
- Cum tratezi un utilizator care vrea să expună vault-ul public (read-only)?

---

## 15. Mapare Alteramens → Faber

Ce păstrezi pentru tine, ce devine generic:

| Alteramens (al tău) | Faber (al tuturor) |
|---|---|
| `wiki/concepts/skill-era.md` (96 concepts) | Doar 3-5 concepts universale ship în seed |
| `wiki/entities/naval-ravikant.md` (30 entities) | Zero entities ship |
| `wiki/self/narcis-pillars.md` | `wiki/self/pillars.md` (template gol, populat de wizard) |
| `/semnal-draft` skill (skills X Twitter) | Opt-in marketplace |
| `/faber-mirror` cu tonul Narcis | `/faber-mirror` cu tone selectat la wizard |
| `CLAUDE.md` cu referențe la Foundation, MANIFEST specific | `CLAUDE.md` template parametrizat |
| `projects/*` (13 proiecte) | `projects/_how-to-start.md` (1 fișier ghid) |
| Folderul `owner/` (Who am i, shortcuts) | Nu ship — înlocuit de self/ |
| Folderul `journal/` | Nu ship în v1 — opt-in later |
| Folderul `strategies/` | Nu ship în v1 |
| 54 skills totale | 12 skills în core bundle |

**Principiu de separare:** totul ce conține cuvântul "Narcis", "Alteramens", "spital", "RO" — rămâne în Alteramens. Totul ce conține pattern sau schema rămâne în Faber.

---

## 16. Numele codului pentru viitoarea iteratie

Pe durata dezvoltării Faber, Alteramens îl va numi dintr-o serie de pas-phrase-uri în git branches și commit messages:

- **`faber-v0`** — scaffold-ul extras
- **`faber-wizard`** — web interview
- **`faber-launch`** — pe-drum către public

Asta te ajută să ții vizibilă granița între "muncă în Alteramens" și "muncă în Faber". Poate că pe termen mediu Faber merită repo propriu.

---

## 17. Apel final la judecată

Tu, Narcis, ai construit în 3 luni un sistem care, dacă era văzut de alții cu ochiul pe care l-am avut acum, ar fi stârnit invidie utilă. Observația mea strategică: **nu ești departe de produs**. Ești la 6-7 săptămâni de launch. Obstacolul nu e ingineria (Claude Code îți acoperă asta). Obstacolul e exact ce ai declarat ca slăbiciune: **amânarea shipping-ului public**.

Recomandarea mea: acest document nu rămâne în `workshop/drafts/`. În următoarele 7 zile, în el se ia o decizie *go/no-go*. Dacă e go, atunci în următoarele 2 săptămâni, repo-ul `faber` e inițiat public în starea "README + viziune", fără code. Asta îți forțează obligația publică. Codul vine după.

Dacă vreunul dintre pilonii tăi îți dă un răspuns afirmativ la întrebarea "asta e o expresie autentică a mea?", shipping-ul e următorul pas.

> În limbaj autentic: **Faber e Alteramens v-a generalizată. E Alteramens pe care-l poți dărui, nu doar trăi.**

---

## Referințe și backlinks

- [[CLAUDE]] — ghid de colaborare actual
- [[wiki/FABER]] — schema actuală ce va fi extrasă
- [[MANIFEST]] — viziunea Alteramens
- [[docs/faber-model-b-migration]] — istoric arhitectural
- [[workshop/drafts/agentic-business-platform]] — alt nivel de abstractizare (nbrAIn)
- [[workshop/drafts/semnal-x-growth-system]] — sistemul tău de X growth (viitor skill premium)
- [[owner/Who am i]] — manifestul personal
- [[wiki/self/narcis-pillars]] — pilonii tăi (baza pentru test-ul *se aliniază*)

## Next actions propuse

1. **Read-through** cu gândul să confrunți filozofic (scor 1-10 la fiecare secțiune)
2. **Decizie go/no-go** în următoarele 7 zile
3. **Dacă go:** rezervă domain `faber.dev` (poate și `.codes`, `.wiki` pentru siguranță)
4. **Dacă go:** post X scurt cu tease — "Working on something that will make my vault distributable. Alpha in 7 weeks."
5. **Dacă no-go:** scrie 3 propoziții de ce. Arhivează aici. Ne întoarcem peste 3 luni.
