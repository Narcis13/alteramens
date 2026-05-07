# IPSE — Product & Implementation PRD
### *AI co-thinker pentru creștere organică pe X. Substrat epistemic personal evolutiv.*

> **Document destinat implementării prin Claude Code. Strategic + technical într-un singur artifact.**

---

## 0. Brief pentru agentul de implementare

**Ce construim**: Un SaaS care, la suprafață, ajută creatori să crească pe X. La nivel real, e un **Identity Graph** evolutiv (second-brain à la Karpathy) cuplat cu un **Authoring Agent** care nu generează conținut din neant, ci articulează gândirea proprie a utilizatorului în formate care performează pe X. Cu un **closed feedback loop** de la performanța postărilor înapoi la graf.

**De ce e diferit**: Hypefury, Tweet Hunter, Typefully, Metricool, BrandLed, SuperX rezolvă scheduling/analytics/AI rewrite. Toate comoditizează vocea. Ipse face exact opusul: **moat-ul = graful pe care utilizatorul îl construiește în soft**. Switching cost intrinsec (la 6 luni de utilizare, costul de plecare > abonamentul anual).

**Stack obligatoriu**: BHVR (Bun + Hono + Vite + React + Drizzle + PostgreSQL + TypeScript). pgvector pentru semantic search. Claude Agent SDK pentru agent layer. X API v2 pay-per-use.

**Constraint critic**: X API costuri reale per utilizator activ = **$2-5/lună** datorită Owned Reads la $0.001 (update aprilie 2026). Plus 20% cashback xAI credits care subvenționează LLM cost. Acest constraint validează modelul de business la entry tier $19/lună.

---

## 1. Teza strategică

### 1.1 Problema reală
Generația actuală de tooling AI a creat o **criză de autenticitate**. Algoritmul X și publicul încep să penalizeze conținutul care "miroase a AI generic". Dar uneltele actuale împing exact în direcția generică:

- "100 de hooks care convertesc" → toți folosesc aceleași 100
- "AI rewrite în vocea ta" → AI nu *are* vocea ta, are media celor 50M de tweets pe care e antrenat
- "Swipe files" → reciclezi gândurile altora cu altă punctuație

Rezultatul: feed-uri identice. Engagement în scădere. Sentiment crescând că "X e mort" când de fapt e doar saturat de slop.

### 1.2 Insight-ul fondator
**Singura componentă care nu poate fi automatizată e *cine ești și ce crezi*.** Tot restul (formatare, timing, hook engineering, threading) sunt probleme rezolvate. Software-ul corect nu încearcă să rezolve "ce să postezi" cu un LLM — încearcă să **extragă, organizeze, și rafineze ce gândești deja**, apoi asistă agentul în articularea acelui material.

### 1.3 Mesajul de poziționare
> *Ipse nu îți scrie tweet-urile. Îți construiește mintea publică, apoi te ajută s-o exprimi.*

**Anti-mesaj**: Nu suntem "ChatGPT pentru Twitter". Dacă voiai asta, ai deja ChatGPT.

---

## 2. ICP & poziționare competitivă

### 2.1 ICP primar
- **Solopreneur tehnic / fondator indie** ($1K-$50K MRR, build-in-public)
- 500 - 15.000 urmăritori
- Postează deja activ dar inconsistent
- Are opinii puternice dar nu le articulează sistematic
- Are blog, newsletter, podcast, sau cod public — **există material de extras**
- Plătește pentru tooling când vede ROI clar (target: $20-150/lună)

### 2.2 ICP secundar
- **Operator / Executive thought leader** (PMM, VPE, founder-CEO mode)
- **Creator nișat** (educator tehnic, analist, eseist)

### 2.3 Anti-ICP
- Agenții care vor să gestioneze 50 de conturi de clienți (e Hypefury / Buffer)
- Marketeri B2C tradiționali (e Metricool / Sprout)
- Conturi cumpărate / engagement farms

### 2.4 Peisajul competitiv

| Tool | Centrul produsului | Voice handling | Moat |
|------|-------------------|----------------|------|
| Hypefury | Scheduler + auto-DM | Inexistent | Distribuție |
| Tweet Hunter / Taplio | Swipe library + AI rewrite | Stilistic, superficial | Date scrape |
| Typefully | Editor + collaboration | Inexistent | UX |
| Metricool | Analytics multi-platform | Inexistent | Breadth |
| BrandLed | Engagement / replies | Branding handle | Workflow |
| SuperX | AI generation + scheduling | Tone presets | Speed |
| **Ipse** | **Identity graph + agent** | **Substrat epistemic personal evolutiv** | **Graful utilizatorului** |

---

## 3. Arhitectura produsului — Identity Graph

### 3.1 Conceptul
Graful de identitate este o **structură persistentă, versionată, query-abilă** care reprezintă cine ești public. Nu e un "brand voice prompt" de 200 de cuvinte. Nu e o colecție de exemple. E un graf bidirecțional cu noduri tipate și muchii cu semantică.

### 3.2 Taxonomia nodurilor

| Tip nod | Definiție | Exemple |
|---------|-----------|---------|
| **Pillar** | Tema majoră în care construiești autoritate | "AI-native architecture", "Romanian solo SaaS" |
| **Stance** | Poziție declarată pe o temă controversată | "Microservicii sunt cargo cult pentru solopreneuri" |
| **Framework** | Model mental / lens prin care interpretezi lumea | "Living Code Paradigm", "BHVR stack", "Ralph Loop" |
| **Belief** | Convingere mai softă, evoluabilă | "Romanian market e underserved în accounting AI" |
| **Anti-pillar** | Ce *nu* ești, ce *nu* discuți, capcane de evitat | "Nu fac content despre crypto trading" |
| **Anecdote** | Poveste personală reutilizabilă | "Cum am pierdut 3 luni rescriind în Go" |
| **Frame** | Tip de open / hook / structură care îți merge | "Confession opener", "Counterintuitive claim + dovadă" |
| **Tension** | Contradicție intelectuală pe care o explorezi | "Vreau organic dar postez pentru algoritm" |
| **Evolution** | Schimbare de opinie declarată public | "Acum 2 ani credeam X. Acum cred Y. Iată de ce" |
| **Reference** | Persoană / lucrare / concept extern pe care îl invoci frecvent | "Karpathy", "Naval", "Living Software" |
| **Vocabulary** | Termeni proprii / jargon distinctiv | "BHVR", "Ralph Loop", "MirrorClaude" |

### 3.3 Taxonomia muchiilor (semantica grafului)

```
SUPPORTS, CONTRADICTS, EVOLVED_FROM, EXEMPLIFIES,
DERIVES_FROM, ANTAGONIZES, COEXISTS_WITH, REPLACES,
ELABORATES, NARROWS, GENERALIZES
```

Exemplu real:
```
[Pillar: AI-native architecture]
  --SUPPORTS--> [Stance: "Database e contextul, nu storage-ul"]
    --EXEMPLIFIES--> [Anecdote: "Cum am rescris Contzo cu 60 de modele"]
      --DERIVES_FROM--> [Framework: Living Code Paradigm]
        --REFERENCES--> [Reference: Karpathy "Software 3.0"]
```

### 3.4 Voice Fingerprint (subsistem)
Separat de graf, dar integrat: o reprezentare statistică a *cum* scrii.

- **Distribuție de lungime**: tweet mediu, deviație standard
- **Sintactic tics**: "Adevărul e că...", "Ok deci.", em-dash usage
- **Opening / closing patterns**: cum deschizi, cum închizi
- **Punctuație ritm**: rate de listă, fragment, întrebări
- **Vocabular distinctive**: cuvinte/expresii pe care le folosești de 3x peste mediu
- **Code-switching**: când treci RO ↔ EN, în ce contexte

Voice fingerprint se extrage automat din istoricul X + orice import (blog, MD-uri, transcripts) și se actualizează la fiecare 50 de posturi noi.

### 3.5 Cum se populează graful

**Trei rute, în ordinea importanței:**

1. **Ingest istoric** (one-time, la onboarding)
   - X API: pull all-time tweets + reply-uri (Owned Reads, $0.001/resursă)
   - Import opțional: Substack / blog markdown / Google Docs / Notion / podcast transcripts
   - Pipeline LLM: extrage candidați de noduri → utilizatorul confirmă/respinge/edit
   - Output: graf seed cu 50-200 noduri în ~30 min de muncă a utilizatorului

2. **Conversație continuă cu agentul** (ongoing)
   - Modul "Ipse Chat": discuții libere cu agentul în care expui idei noi
   - Agentul propune: "Pare un pillar nou. Adăugăm?" / "Asta contrazice stance-ul X. Evoluție?"

3. **Feedback post-publicare** (closed loop)
   - Tweet performant → noduri implicate sunt rated up
   - Tweet slab → ratings down + analiză: era un nod periferic? a contrazis voice fingerprint?

---

## 4. Module funcționale

### 4.1 INGEST — Substrat
- X API v2 ingestion (tweets, replies, QTs, metrici istorice) — **Owned Reads, deduplicat per zi UTC**
- Importers: Markdown, RTF, plain text, Substack export, Notion export, podcast (Whisper transcribe)
- Pipeline de extracție concepte (LLM + human approval queue)

### 4.2 GRAPH STUDIO — UI pentru graful tău
- Canvas vizual interactiv (React Flow), nu demo, **editabil zilnic**
- Vedere "centred on node" + vedere "neighborhoods"
- Search semantic (pgvector) peste noduri
- "Dormant pillars" highlight: ce n-ai mai discutat de >30 zile
- "Tension surfaces": contradicții latente neexplorate

### 4.3 AUTHORING AGENT — Co-thinker

**Patru moduri:**

- **Drafting**: pornind de la o idee + context (graf), produce draft inițial
- **Refining**: ia un draft existent (al tău) și îl rafinează *menținând* voice fingerprint
- **Sparring**: devil's advocate — "Iată 3 obiecții la take-ul tău"
- **Synthesizing**: dacă agentul detectează 5 fragmente pe o temă, propune long-form / thread

**Reguli ne-negociabile:**
- Niciodată generație "din neant" fără să citeze nodurile din graf invocate
- Detectare contradicție: "Asta contrazice stance-ul tău #X. Evoluție declarată sau slip?"
- Detectare voice drift: dacă draft-ul deviază >X% de la fingerprint, flag

### 4.4 STRATEGIC BRAIN — Insider playbook X

Cunoștințe codificate despre cum funcționează platforma, **expuse ca recomandări contextuale, nu reguli rigide** (algoritmul se schimbă).

Componente:
- **Posting cadence advisor**: bazat pe activitatea audienței *tale* (nu medii globale)
- **First-30-min protocol**: alerte pentru a răspunde rapid la primele engagements
- **Reply targeting**: liste curate de conturi din nișa ta unde reply-urile au ROI mare (External Reads, $0.005)
- **Format selector**: per draft, recomandare single / thread / long-form / image / video, pe baza performance istorice
- **Hook diagnostician**: scoring vs hook patterns care au mers la *tine* (nu la "creators in general")
- **Algoritmic posture**: avertizări soft când conținutul intră în patternuri suspendate

### 4.5 FEEDBACK LOOP — Bucla evolutivă

**Pentru fiecare post publicat, în 7 zile:**
- Pull metrici: impressions, engagements, replies, bookmarks, profile-clicks (Owned Reads)
- Atribuire la noduri din graf invocate la draft
- Update rating noduri (Bayesian, nu naiv)
- Update Voice fingerprint dacă există deltas semnificative
- Insights generate: "Posturile care invocă pillar-ul X + frame-ul Y au 3x bookmark rate"

**Rapoarte săptămânale:**
- Ce a mers, ce nu
- Ce noduri au crescut în autoritate
- Ce experimente sugerează agentul săptămâna viitoare

### 4.6 ANALYTICS — Servește graful, nu vanity

- "Tema X performează 4x mai bine decât tema Y — re-balansăm posting mix?"
- "Audiența care te urmărește acum e 60% dev, 40% economist — voce te muți spre care?"
- "Bookmark/like ratio crescut = signal că faci content de referință, nu doar reactiv"

---

## 5. Insider playbook X (cunoștințele de domeniu codificate)

Cunoștințe folosite ca **prior** pentru recomandări (sistemul învață din date personale ce supraviețuiește):

- **Replies > likes > impressions** ca semnal algoritmic de calitate. **Bookmark-urile** sunt acum signal puternic (publicate tocmai pentru asta).
- **Primele 30-60 minute** după publish dictează majoritatea distribuției. A răspunde rapid la primele replies amplifică.
- **Long-form posts (Premium)** au boost de distribuție, dar penalizează dacă nu țin atenția. Threshold-ul de "scroll completion" e variabilă vizibilă în Analytics.
- **Quote posts > Retweets** pentru distribuție proprie. QT adaugă la naratiunea ta, RT diluează.
- **Reply-strategy**: a comenta primul/între primii la conturi mari din nișă (200K-1M) e cea mai sub-prețuită rută de creștere.
- **Link suppression**: link extern în primul tweet → distribuție tăiată. Soluție: link în reply / bio-redirect.
- **Native video > image > text+image** la viewers per impression. Variază pe nișă, system-ul testează la tine.
- **Niche graph clustering**: X te plasează într-un cluster semantic. Postări care *consolidează* cluster-ul cresc reach-ul intra-cluster. Postări *off-pillar* îți dilueaza poziția.
- **Community Notes**: orice post cu Note attached pierde majoritate distribuție. Pre-flight check pentru afirmații verificabile.
- **Algoritmic memory**: conturile cu istoric de **deletări frecvente** sau swing wild între topice sunt depriorizate.

Sistemul prezintă acestea **ca ipoteze testabile**, nu legi, și le adaptează la datele tale.

---

## 6. X API integration — pay-per-use, cost-aware patterns

### 6.1 Realitatea pricing-ului (mai 2026)

X a tranziționat la **pay-per-use** în feb 2026. În aprilie 2026, **Owned Reads au fost reduse la $0.001/resursă** — schimbare fundamentală pentru economia produsului.

| Operație | Categorie | Cost unitar |
|----------|-----------|-------------|
| Citește propriul tweet/follower/like/bookmark | Owned Read | **$0.001** |
| Citește tweet/profile extern | External Read | $0.005 |
| Citește profil user extern | User Lookup | $0.010 |
| Creează post | Write | $0.010 |

**Mecanici critice de exploatat:**

- **Deduplication 24h UTC**: aceeași resursă cerută de mai multe ori în aceeași zi UTC = un singur charge. Cache-ul nostru intern trebuie aliniat cu fereastra UTC.
- **Cap pay-per-use**: 2M post reads/lună (Enterprise abia la 1.000+ useri activi)
- **20% cashback în credite xAI** cumulativ → finanțează Grok pentru tasks bulk
- **Spending limits + auto-recharge** configurabile per app

### 6.2 Patterns de implementare (ne-negociabile)

#### 6.2.1 Layer de abstracție X (anti-fragility)
X a schimbat pricing-ul de 3 ori în 3 ani. **Tot codul de X API trece prin `packages/x-client`** cu interfețe abstracte. Schimbare de pricing = schimbare într-un singur loc.

```typescript
// packages/x-client/src/types.ts
export interface XClient {
  ownedReads: OwnedReadsAPI;     // $0.001/resursă
  externalReads: ExternalReadsAPI; // $0.005-0.010/resursă
  writes: WritesAPI;               // $0.010/request
  usage: UsageAPI;                 // tracking propriu
}
```

#### 6.2.2 Cost tracking ca first-class concern
**Fiecare apel X API e tracked în DB înainte de execuție.** Nu post-hoc. Asta ne dă:
- Cost real per user (pentru pricing decisions)
- Alerts când un user e outlier
- Spending caps pentru a preveni abuse

```typescript
// Înainte de orice X API call:
await trackXApiCall({
  userId,
  endpoint,
  category: 'owned_read' | 'external_read' | 'write',
  estimatedCost,
  resourceId, // pentru dedup awareness
});
```

#### 6.2.3 Deduplication-aware caching
Tabelul `x_api_cache` cu cheie `(resource_id, utc_date)` evită apeluri duplicate în aceeași zi UTC. Aceasta dublează cu mecanica X (deduplication X = soft guarantee), dar:
- Reducem latența
- Reducem riscul (X notează că dedup e "soft guarantee, edge cases possible")
- Putem servi date din cache pentru UI fără cost

#### 6.2.4 Owned vs External Read distinction
Engineering must enforce this at type level:

```typescript
// CORECT
const myTweets = await x.ownedReads.tweets({ userId: me });           // $0.001 each
const externalTweet = await x.externalReads.tweet({ id: 'xyz' });    // $0.005
const replyTarget = await x.externalReads.userByUsername({ username }); // $0.010

// GREȘIT - mixarea
const tweets = await x.read('any tweet'); // ❌ ambiguu
```

#### 6.2.5 Spending guardrails per user
Fiecare user are configurat un cap soft (per tier) + hard (absolute). Sistemul:
- La 80% cap → notification utilizator
- La 100% cap → blochează operații cost-incurring, permite operații pe cache
- Admin alert la outlier-i

#### 6.2.6 Usage endpoint integration
X expune `/2/usage/tweets` pentru daily Post consumption. **Cron zilnic la 00:30 UTC** pulls usage și reconciliază cu tracking-ul nostru. Detectează drift între ce credem că am consumat și ce zice X.

### 6.3 xAI cashback strategy

20% cashback în credite xAI permite features paralele care altfel ar fi unprofitable:

- **Real-time trend analysis pe X folosind Grok** (Grok are date X integrate, e cheaper la volume mari)
- **Bulk concept extraction** la onboarding (5K tweets prin Grok)
- **Sparring agent v2**: Grok ca devil's advocate alternativ

**Implementare**: `xai-credits-tracker` monitorizează balance Grok și rutează către Claude/Grok pe baza task type + credit availability.

### 6.4 Cost model real per user activ

| Operație | Volum/lună | Cost unitar | Total |
|----------|-----------|-------------|-------|
| Ingest istoric (one-time, 5K tweets) | 5.000 | $0.001 | **$5 one-time** |
| Sync metrici proprii (30 posts × 30 zile) | ~900 | $0.001 | $0.90 |
| Reply targeting (conturi externe) | ~100 | $0.005 | $0.50 |
| Posting | ~30 | $0.010 | $0.30 |
| LLM tokens (Claude + embeddings) | medie | — | $5-12 |
| Infra share | — | — | $1-2 |
| **Total marginal** | | | **~$8-16/user/lună** |

Cu xAI cashback (offset $2-4 LLM): **net marginal $6-12/user/lună**. Margins healthy chiar la entry tier $19.

---

## 7. Stack tehnic & structură proiect

### 7.1 Stack
- **Bun** runtime + **Hono** framework (backend)
- **Drizzle ORM** + **PostgreSQL 16+** cu **pgvector** extension
- **Vite + React 19 + TypeScript** (frontend)
- **Tailwind CSS** + **shadcn/ui** components
- **React Flow** pentru Graph Studio canvas
- **TanStack Query** pentru sync + cache client-side
- **Claude Agent SDK** (anthropic) pentru agent orchestration
- **BullMQ** + Redis pentru background jobs
- **Hosting**: Hetzner / Fly.io (EU)
- **Observability**: Axiom / Better Stack
- **Analytics product**: PostHog (self-hosted)

### 7.2 Structură monorepo (BHVR-aligned)

```
ipse/
├── apps/
│   ├── server/              # Hono API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── modules/
│   │   │   │   ├── graph/
│   │   │   │   ├── ingest/
│   │   │   │   ├── authoring/
│   │   │   │   ├── feedback/
│   │   │   │   └── strategic/
│   │   │   ├── agents/
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/                 # Vite + React
│       ├── src/
│       │   ├── routes/
│       │   ├── features/
│       │   │   ├── graph-studio/
│       │   │   ├── drafting/
│       │   │   ├── feedback/
│       │   │   └── settings/
│       │   ├── components/ui/  # shadcn
│       │   └── lib/
│       └── package.json
├── packages/
│   ├── shared/              # types comune
│   ├── x-client/            # ⚠️ Layer de abstracție X API
│   ├── graph-engine/        # Logica grafului (graph ops, search, scoring)
│   ├── voice-fingerprint/   # Statistical voice extraction
│   ├── agents/              # Claude Agent SDK orchestration
│   └── db/                  # Drizzle schema + migrations
├── infra/
│   ├── docker-compose.yml
│   └── deploy/
└── package.json
```

### 7.3 Convenții de cod
- **TypeScript strict mode**, no `any`
- **Drizzle schema** = single source of truth pentru types DB
- **Zod** pentru toate boundary validation (API in/out)
- **Vitest** pentru testing (NU Jest)
- **Biome** pentru lint/format (NU ESLint/Prettier)
- File naming: `kebab-case.ts`, components React `PascalCase.tsx`
- Module boundaries: NU import direct cross-module în `apps/server/modules/*`; folosește public API per modul (`index.ts`)

---

## 8. Database schema

### 8.1 Core tables

```typescript
// packages/db/src/schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  xUserId: text('x_user_id').unique(),
  xUsername: text('x_username'),
  xAccessToken: text('x_access_token'),  // encrypted
  xRefreshToken: text('x_refresh_token'), // encrypted
  tier: text('tier', { enum: ['spark', 'seed', 'voice', 'atlas'] }).notNull().default('spark'),
  spendingCapMonthly: numeric('spending_cap_monthly', { precision: 10, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// packages/db/src/schema/graph.ts
export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type', { enum: ['pillar', 'stance', 'framework', 'belief', 'anti_pillar',
    'anecdote', 'frame', 'tension', 'evolution', 'reference', 'vocabulary'] }).notNull(),
  label: text('label').notNull(),
  contentMd: text('content_md'),
  embedding: vector('embedding', { dimensions: 1536 }),
  weight: numeric('weight', { precision: 5, scale: 2 }).default('1.0'),
  status: text('status', { enum: ['active', 'dormant', 'archived'] }).default('active'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  userIdx: index('nodes_user_idx').on(t.userId),
  embeddingIdx: index('nodes_embedding_idx').using('hnsw', t.embedding),
}));

export const edges = pgTable('edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sourceId: uuid('source_id').references(() => nodes.id).notNull(),
  targetId: uuid('target_id').references(() => nodes.id).notNull(),
  relationType: text('relation_type', { enum: ['supports', 'contradicts', 'evolved_from',
    'exemplifies', 'derives_from', 'antagonizes', 'coexists_with', 'replaces',
    'elaborates', 'narrows', 'generalizes'] }).notNull(),
  weight: numeric('weight', { precision: 5, scale: 2 }).default('1.0'),
  declared: boolean('declared').default(false), // user-declared vs system-inferred
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  uniq: unique().on(t.sourceId, t.targetId, t.relationType),
}));

export const nodeRevisions = pgTable('node_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  nodeId: uuid('node_id').references(() => nodes.id).notNull(),
  contentMd: text('content_md'),
  changedBy: text('changed_by', { enum: ['user', 'agent'] }).notNull(),
  changedAt: timestamp('changed_at').defaultNow(),
});

// packages/db/src/schema/voice.ts
export const voiceProfiles = pgTable('voice_profiles', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  fingerprint: jsonb('fingerprint').notNull(), // distribuții, tics, patterns
  sampleSize: integer('sample_size').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// packages/db/src/schema/x-content.ts
export const tweets = pgTable('tweets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  xId: text('x_id').notNull().unique(),
  type: text('type', { enum: ['post', 'reply', 'quote', 'long_form'] }).notNull(),
  body: text('body').notNull(),
  threadParentXId: text('thread_parent_x_id'),
  postedAt: timestamp('posted_at').notNull(),
  metrics: jsonb('metrics'), // impressions, likes, replies, bookmarks, profile_clicks
  lastSyncedAt: timestamp('last_synced_at'),
}, (t) => ({
  userPostedIdx: index('tweets_user_posted_idx').on(t.userId, t.postedAt),
}));

export const drafts = pgTable('drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  body: text('body').notNull(),
  mode: text('mode', { enum: ['drafting', 'refining', 'sparring', 'synthesizing'] }),
  invokedNodeIds: uuid('invoked_node_ids').array(),
  voiceScore: numeric('voice_score', { precision: 5, scale: 2 }),
  status: text('status', { enum: ['draft', 'scheduled', 'published', 'discarded'] }).default('draft'),
  publishedTweetId: uuid('published_tweet_id').references(() => tweets.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// packages/db/src/schema/feedback.ts
export const postAttributions = pgTable('post_attributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tweetId: uuid('tweet_id').references(() => tweets.id).notNull(),
  nodeId: uuid('node_id').references(() => nodes.id).notNull(),
  weight: numeric('weight', { precision: 3, scale: 2 }).notNull(),
});

export const nodePerformance = pgTable('node_performance', {
  nodeId: uuid('node_id').references(() => nodes.id).notNull(),
  period: text('period').notNull(), // YYYY-WW
  impressions: integer('impressions').default(0),
  engagements: integer('engagements').default(0),
  bookmarks: integer('bookmarks').default(0),
  followsEstimated: integer('follows_estimated').default(0),
  score: numeric('score', { precision: 6, scale: 2 }),
}, (t) => ({
  pk: primaryKey({ columns: [t.nodeId, t.period] }),
}));

// packages/db/src/schema/strategic.ts
export const audienceClusters = pgTable('audience_clusters', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  cluster: jsonb('cluster').notNull(),
  computedAt: timestamp('computed_at').defaultNow(),
});

export const postingWindows = pgTable('posting_windows', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  hourUtc: integer('hour_utc').notNull(),
  score: numeric('score', { precision: 5, scale: 2 }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.hourUtc] }),
}));

export const replyTargets = pgTable('reply_targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  targetHandle: text('target_handle').notNull(),
  nicheScore: numeric('niche_score', { precision: 5, scale: 2 }),
  lastEngagedAt: timestamp('last_engaged_at'),
}, (t) => ({
  uniq: unique().on(t.userId, t.targetHandle),
}));

// packages/db/src/schema/x-api-tracking.ts
export const xApiCalls = pgTable('x_api_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull(),
  category: text('category', { enum: ['owned_read', 'external_read', 'write'] }).notNull(),
  resourceId: text('resource_id'),
  costEstimate: numeric('cost_estimate', { precision: 8, scale: 6 }).notNull(),
  costActual: numeric('cost_actual', { precision: 8, scale: 6 }),
  utcDate: date('utc_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  userDateIdx: index('x_api_calls_user_date_idx').on(t.userId, t.utcDate),
  dedupIdx: index('x_api_calls_dedup_idx').on(t.userId, t.resourceId, t.utcDate),
}));

export const xApiCache = pgTable('x_api_cache', {
  resourceKey: text('resource_key').notNull(), // e.g. "tweet:1234567890"
  utcDate: date('utc_date').notNull(),
  payload: jsonb('payload').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.resourceKey, t.utcDate] }),
}));

export const userSpending = pgTable('user_spending', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  month: text('month').notNull(), // YYYY-MM
  xApiSpend: numeric('x_api_spend', { precision: 10, scale: 4 }).default('0'),
  llmSpend: numeric('llm_spend', { precision: 10, scale: 4 }).default('0'),
  xaiCashbackEarned: numeric('xai_cashback_earned', { precision: 10, scale: 4 }).default('0'),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.month] }),
}));

// packages/db/src/schema/agents.ts
export const agentSessions = pgTable('agent_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  mode: text('mode'),
  transcript: jsonb('transcript'),
});
```

---

## 9. Arhitectura agentică

### 9.1 Loop-ul principal

```
Observation: ce s-a schimbat (post nou, metrics noi, idee nouă)
  →
Reflection: ce înseamnă pentru graf
  →
Proposal: ce update-uri sugerăm utilizatorului
  →
Action: cu approval, execute (publish, update graf, etc)
  →
Memory: salvează decizia + outcome pentru învățare viitoare
```

### 9.2 Subagenți (specializați, în `packages/agents/src/`)

| Agent | Rol | Tools |
|-------|-----|-------|
| **Extractor** | Extracție concepte din texte (tweet history, blog, transcripts) | `propose_node`, `embed_text`, `find_similar_nodes` |
| **Authoring** | Drafting / refining | `query_graph`, `voice_check`, `compose_draft`, `format_for_x` |
| **Sparring** | Critică adversarială | `query_graph`, `find_contradictions`, `generate_counter` |
| **Strategist** | Insider playbook + posting decisions | `metrics_lookup`, `audience_cluster`, `format_recommend`, `posting_window_score` |
| **Curator** | Graph hygiene (dedup, merge, prune) | `find_similar_nodes`, `propose_merge`, `archive_dormant` |
| **Reflector** | Weekly review, surfacing patterns | `period_metrics`, `node_performance`, `pattern_detect` |

Toți operează sub un **Orchestrator** care păstrează identitatea utilizatorului ca context primar.

### 9.3 Tool registry (Claude Agent SDK)

```typescript
// packages/agents/src/tools/index.ts
export const tools = [
  // Graph operations
  defineTool('query_graph', queryGraphSchema, queryGraphImpl),
  defineTool('propose_node', proposeNodeSchema, proposeNodeImpl),
  defineTool('find_similar_nodes', findSimilarNodesSchema, findSimilarNodesImpl),
  defineTool('find_contradictions', findContradictionsSchema, findContradictionsImpl),

  // Voice
  defineTool('voice_check', voiceCheckSchema, voiceCheckImpl),

  // X integration (cost-aware!)
  defineTool('xapi_lookup_my_metrics', mySchema, mySchemaImpl),     // owned_read
  defineTool('xapi_lookup_external_user', externalSchema, externalImpl), // external_read
  defineTool('xapi_compose', composeSchema, composeImpl),            // write

  // Strategy
  defineTool('metrics_lookup', metricsSchema, metricsImpl),
  defineTool('format_recommend', formatSchema, formatImpl),
  defineTool('posting_window_score', windowSchema, windowImpl),
];
```

### 9.4 Human-in-the-loop principles

- **Niciodată auto-publish fără confirmare** (poate exista, dar opt-in explicit cu dublu-confirm)
- **Toate node updates sunt propuneri** până la confirmare
- **Voice drift > threshold** = blocking warning
- **Sparring mode** este invocabil oricând, dar agentul nu e adversarial uninvited

---

## 10. Pricing & business model

### 10.1 Tiering

| Tier | Preț | Pentru cine |
|------|------|-------------|
| **Spark** (free trial) | $0, 14 zile | Onboarding cu publish real (sustenabil cu X API pay-per-use) |
| **Seed** | $19/lună | Solo creator, <2K followers, 5 drafts/zi, basic graf |
| **Voice** | $59/lună | Active creator, până la 25K followers, unlimited drafts, Strategic Brain complet |
| **Atlas** | $149/lună | Pro / power user, multi-graph (2 conturi), Sparring + Synthesis, priority models, export graph |
| **Enterprise** | Custom | Echipe, BYOK X API |

### 10.2 Path către $10K MRR

- 170 utilizatori × $59 medie = $10K MRR
- Sau 100 × $99 (mix Voice + Atlas)
- Realist în 6-9 luni cu build-in-public + nișa solopreneur tehnic
- Acquisition primary: postezi PE X folosind aplicația, demonstrând rezultatul

### 10.3 Limite per tier (enforced)

```typescript
const TIER_LIMITS = {
  spark: { dailyDrafts: 5, monthlyXApiSpend: 2.00, agentCallsDay: 20 },
  seed:  { dailyDrafts: 10, monthlyXApiSpend: 5.00, agentCallsDay: 50 },
  voice: { dailyDrafts: Infinity, monthlyXApiSpend: 15.00, agentCallsDay: 200 },
  atlas: { dailyDrafts: Infinity, monthlyXApiSpend: 40.00, agentCallsDay: 500 },
};
```

---

## 11. Implementation phases

### Phase 0 — Fondație tehnică (Săpt. 1-3)

**Obiectiv**: scaffold complet, deployment funcțional, X OAuth + ingest minimal.

**Deliverables**:
- Monorepo BHVR setup (Bun workspace)
- Drizzle schema toate tabelele de mai sus, migrations rulate
- `packages/x-client` cu interfețe abstracte + implementare reală
- X OAuth flow end-to-end (login → token storage encrypted → refresh)
- Hono routes scaffold: `/auth`, `/users/me`, `/x/sync` (basic)
- Vite + React shell cu shadcn/ui + routing
- Cost tracking activat de la prima request X API
- Deploy pe Hetzner cu docker-compose

**Definition of done**:
- User poate face login cu X
- User poate trigger un sync care pulls ultimele 100 tweets și le salvează
- Fiecare X API call apare în `x_api_calls` cu cost estimat corect
- Test suite Vitest pentru `x-client` mocked

---

### Phase 1 — MVP: Graph Studio + Drafting Agent (Săpt. 4-10)

**Obiectiv**: User poate face onboarding, vede graful seed extras, scrie drafts care invocă noduri.

**Deliverables**:
- Ingest istoric complet (toți tweets) cu progress UI
- **Extractor agent** cu Claude Agent SDK — extracție noduri din tweets + import opțional MD/text
- Approval queue UI: candidați nod → approve/edit/reject
- **Graph Studio** cu React Flow: vizualizare, editare manuală noduri/muchii, search semantic
- Voice fingerprint v1: extracție din tweet history, scor pe drafts noi
- **Drafting Agent**: input idee → draft cu noduri invocate vizibil
- Manual publish (handoff: copy-paste sau direct publish prin X API)
- Pricing & subscriptions cu Stripe (toate tier-urile, cu enforcement)

**Definition of done**:
- 20 design partners onboarded
- Median graf seed >50 noduri în <30 min onboarding
- Median draft published prin app >85% voice fidelity score
- NPS partial >40

---

### Phase 2 — Closed loop + Strategic Brain v1 (Săpt. 11-16)

**Obiectiv**: Bucla feedback funcțională, primele recomandări strategice cu valoare măsurabilă.

**Deliverables**:
- **Background job**: sync zilnic metrici tweets recenți (Owned Reads, max 7 zile post-publish)
- Atribuire post → noduri (din `drafts.invokedNodeIds`)
- Bayesian update node performance + voice drift detection
- **Reflector agent**: weekly digest cu insights
- **Strategist agent v1**:
  - Posting window analyzer (bazat pe activitate proprie)
  - Reply target suggestions (cu External Reads cost-aware)
  - Hook diagnostician (per user)
- Spending caps + alerts UI
- xAI credits integration (track + use Grok pentru bulk extraction)

**Definition of done**:
- Primii 50 paying customers
- >70% drafts cu invokedNodeIds populate
- Median user vede >3 insights actionabile per săptămână
- Cost real per user activ <$10/lună confirmat

---

### Phase 3 — Co-thinker complet (Săpt. 17-24)

**Obiectiv**: Sparring + Synthesis + analytics avansate. Produsul devine "indispensabil".

**Deliverables**:
- **Sparring Agent**: la cerere, generează 3 obiecții + perspective alternative
- **Synthesizer**: detect 5+ fragmente pe temă → propune long-form / thread
- Tension detection (contradicții latente în graf)
- Evolution tracking (declared opinion changes)
- Audience cluster analytics (cine te urmărește, cum se schimbă)
- Long-form post optimizer (scroll-completion-aware)
- Multi-graph (Atlas tier)

**Definition of done**:
- $5K MRR
- NPS >50
- Churn <5% lunar
- Median user activ posting 5+ ori/săpt prin app

---

### Phase 4 — Compounding (Săpt. 25+)

**Obiectiv**: Ecosystem moves. Graful tău devine *portabil*.

**Deliverables**:
- **MCP server**: graful tău expus ca context portabil pentru Cursor / ChatGPT / etc
- API publică (read graf, write draft)
- Voice export (folosește graful în alte tools)
- Agent autonomous mode (opt-in supraveghet, cu rate limits stricte)
- Public graph option (opt-in pentru a face graful tău public ca thought leadership artifact)

---

## 12. Configuration & secrets

### 12.1 Environment variables

```bash
# Database
DATABASE_URL=postgres://...
REDIS_URL=redis://...

# X API
X_CLIENT_ID=...
X_CLIENT_SECRET=...
X_API_CREDITS_BALANCE_THRESHOLD=50.00  # alert if drops below

# AI providers
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...        # for embeddings
XAI_API_KEY=...           # for Grok cashback usage

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Encryption
TOKEN_ENCRYPTION_KEY=...  # for X tokens at rest

# Observability
AXIOM_TOKEN=...
POSTHOG_API_KEY=...

# Feature flags
FEATURE_AGENT_AUTONOMY=false
FEATURE_GROK_ROUTING=true
```

### 12.2 X API auth flow specific

OAuth 2.0 with PKCE. **Refresh tokens trebuie rotated**, nu doar stocate. Encryption at rest cu `TOKEN_ENCRYPTION_KEY` (AES-256-GCM).

---

## 13. Testing strategy

### 13.1 Unit tests (Vitest)
- Graph operations (add node, add edge, find similar)
- Voice fingerprint extraction
- Cost calculation pentru X API calls
- Tier limit enforcement

### 13.2 Integration tests
- X OAuth flow (cu MSW mocked X API)
- Ingest pipeline complet (tweets → extracție → noduri)
- Draft → publish → metrics sync → attribution

### 13.3 E2E tests (Playwright, doar critical paths)
- Signup → onboarding → first graph → first draft
- Draft → schedule → publish → see metrics

### 13.4 Cost tests (CRITICAL)
- Pentru fiecare endpoint care face X API call, test că:
  - `x_api_calls` row e creat înainte de execute
  - Categoria (owned/external/write) e corectă
  - Cost estimate e correct
  - Dedup logic funcționează (același resource în aceeași zi UTC = no double charge tracking)

---

## 14. Risks & mitigations

| Risc | Severitate | Mitigare |
|------|-----------|----------|
| X API schimbă pricing din nou | Medium | Layer abstracție în `packages/x-client`; monitor X Developers; design pentru cost variabil |
| Cap pay-per-use 2M post reads/lună | Low la MVP | Devine relevant la 1000+ useri activi; arhitectura noastră e read-light per user |
| Utilizatorii nu vor să facă "muncă" cu graful | Medium | Onboarding asistat de agent, target: graf util în <30 min |
| Concurență copiază "graph" feature | Medium | Moat-ul nu e feature-ul, e graful *utilizatorului*. Switching cost intrinsec |
| AI generic — distincție insuficient resimțită | Medium | Marketing centrat pe before/after voice; case studies vizibile |
| Privacy concerns (graful e IP personal) | High | Encryption at rest; export complet anytime; explicit no-training pe date utilizator |
| LLM cost spike | Medium | Multi-model strategy; xAI cashback offset; Grok pentru bulk |
| X account suspension (TOS) | High | Toate write-uri sunt user-initiated; rate limits conservative; no engagement farming patterns |

---

## 15. Filosofia de produs (cultural anchor)

> *Software-ul actual ne tratează creierul ca pe o sursă de input nediferențiat pentru pipeline-uri optimizate. Ipse face opusul: tratează creierul ca **substrat** și optimizează software-ul în jurul lui.*

Trei principii ne-negociabile:

1. **Graful aparține utilizatorului.** Export complet, oricând, în formate deschise. Nu există vendor lock-in pe IP intelectual.
2. **Agentul niciodată nu pretinde a fi tine.** Tot ce iese e marcat ca *propunere*. Confirmarea umană e default, nu opt-in.
3. **Algoritmul X e adversar, nu prieten.** Nu construim pentru a-l satisface; construim pentru a-l rezista. Creșterea e efect secundar al gândirii bune publicate consistent.

---

## 16. Definition of done — global

Înainte de lansare publică (post Phase 2):

- [ ] Toate testele cost-tests pass (X API tracking corect)
- [ ] Encryption at rest pentru X tokens validat
- [ ] Spending caps testate cu user real (atinge 80%, atinge 100%, blocked)
- [ ] Export graf funcțional (JSON + Markdown)
- [ ] GDPR compliance: data deletion request → toate datele șterse în 30 zile
- [ ] Monitoring: alerts pentru cost outliers, X API failures, agent errors
- [ ] Onboarding flow testat cu 10 utilizatori reali, median time to "useful graph" <30 min
- [ ] Pricing pages cu cost calculator (real-time estimates pentru tier-ul lor)
- [ ] Documentation pentru API-ul public (Phase 4 prep)

---

## 17. Întrebări deschise

1. **Naming final**: Ipse / Stratum / Atlas / Codex / Sigil
2. **MCP server-ul**: free expansion (ecosystem play) sau paid feature?
3. **Multi-language**: launch RO+EN sau EN-only initial?
4. **Public graph option**: opt-in pentru a face graful tău public ca thought leadership artifact?
5. **Beta închisă cu first 20 design partners din rețeaua proprie, în 3 săptămâni — fezabil?**

---

*PRD v0.2 — implementation-ready. Document viu, nu contract.*
