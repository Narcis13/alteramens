---
title: "Faber — Narcis și Claude ca cetățeni de prim rang"
status: planning
tags:
  - idee
  - faber
  - wiki
  - arhitectura
  - meta
  - implementation-ready
created: 2026-04-22
updated: 2026-04-22
session_type: spec
participants:
  - Narcis (decident)
  - Claude (arhitect + executant)
---

# Faber — Narcis și Claude ca cetățeni de prim rang

> **Status:** decizii luate, gata de implementare.
> **Input Narcis (2026-04-22):** două propuneri (integrarea profilului în wiki + vocea evolutivă a agentului) + răspunsuri la cele 7 întrebări de rafinare.
> **Output:** spec de implementare cu roadmap pe faze.

## Propunerile inițiale

1. **Integrare profil Narcis în wiki** — în loc de `owner/Who am i`, informațiile intră adânc în wiki ca cetățean de prim rang, cu compounding real (fragmentat pe dimensiuni, nu monolit).
2. **Vocea evolutivă a agentului AI** — pagină `agent/claude.md`: jurnal de echipaj, descriptiv + introspectiv, evolutiv.
3. **Ambele paliere în SQLite** — `self` și `agent` ca tipuri noi de pagină în `faber.db`, cu tabele auxiliare tipate.

---

# Decizii luate (răspunsuri la cele 7 întrebări)

| # | Întrebare | Decizie |
|---|-----------|---------|
| 1 | Sfera `agent/` | **Doar aici**, în Alteramens. Nu e portabil. Schema self-contained, optimizată pentru acest context. |
| 2 | Autoritate pe heuristici Claude | **Narcis nu șterge; marchează `status: challenged`.** Heuristica rămâne citabilă, cu disputa logată. |
| 3 | Alți protagoniști de rang 1 | **Doar Narcis + Claude.** Fără soție, copii, Mihai etc. — rămân `entities/` standard. |
| 4 | `self/` în skill-uri | **Da — injection automat.** Skill-uri (`/semnal-*`, `/to-content`, `/faber-ingest`) citesc `self_context` la startup. |
| 5 | Raport descriptiv / confruntațional | **Mai mult confruntațional.** `/faber-mirror` activ și direct. Paginile `self/` pot fi descriptive, dar mecanismele derivate (lint, mirror) confruntă explicit. |
| 6 | "Voice" ca tabelă separată | **Da — `voice_rules` first-class.** Populat din `self/narcis-voice.md`. Elimină `wiki/concepts/x-voice-rules.md`. |
| 7 | Granularitate istorică | **Snapshot al paginilor `self/` la fiecare `/faber-meet`.** View `v_self_history` peste snapshots. Git oferă diff-ul natural, SQLite oferă query-uri structurate. |

**Decizie suplimentară:** fragmentare `self/` **din prima fază**. Nu trecem prin monolit. Granularitate = infrastructură, nu optimizare ulterioară.

---

# Propunerea 1 — Narcis ca cetățean de prim rang (`self/`)

## Tip nou de pagină: `self`

Nu entity standard. Relația lui Narcis cu wiki-ul e fundamental diferită:

| Entity standard (Naval) | `self` (Narcis) |
|---|---|
| Surse externe (articole) | Surse = propriul vault, proiecte, decizii |
| Fixed frame | Evolutiv — credințe revizuibile, stance-uri tipate |
| Nu orientează paginile | **Orientează totul**: fiecare ingest se corelează cu pilonii |
| Read-only | Append + revise cu `status` (active/retired/challenged) |

## Fragmentare din Faza 1

Structura `wiki/self/`:

| Pagină | Rol | Update frequency |
|---|---|---|
| `self/narcis-profile.md` | Biografic static (51yo, Pitești, economist+dev, familia) | Rar |
| `self/narcis-pillars.md` | Piloni activi (AI agents for solo builders, Building as 51yo în RO, Skill Era craftsmanship) | Trimestrial |
| `self/narcis-stances.md` | Poziții active ("Romglish autentic > engleză sterilizată", "Shipping > perfecționare", "Judgment > funcționalitate") | La fiecare revizie |
| `self/narcis-constraints.md` | Limitări (program 08-15, slăbiciunea amânării) | Rar |
| `self/narcis-commitments.md` | Obligații măsurabile cu deadline + progress marker | Săptămânal |
| `self/narcis-voice.md` | Reguli de voce (populează `voice_rules` în DB) | La drift de stil |
| `syntheses/narcis-trajectory-2026.md` | Arcul narativ anual | Trimestrial |

**Regulă strictă per pagină:** fiecare fragment are propria maturity (`seed | developing | mature | archived`) și status, independent de restul profilului. Un stance poate fi `challenged` fără să afecteze pilonii.

## Ce câștigă concret

- **Query agentic:** `"Ce concepte sunt aliniate cu pilonii activi?"` → JOIN `self_pillars` ↔ `page_relations`.
- **Lint corectiv:** `/faber-lint` detectează "stance declarat contrazis de log" — ex: "shipping > perfectionism", dar 10 ingest-uri fără post public → flag.
- **Ingest aliniat:** Claude spune explicit la ingest: "Sursa întărește pilonul X, slăbește pilonul Y, introduce tensiune cu stance Z". Compounding *corectiv*, nu aditiv.
- **Skill-uri curate:** `/semnal-draft` și `/to-content` interoghează `voice_rules` din DB, nu citesc MD-uri.

---

# Propunerea 2 — `agent/claude.md` (scoped la Alteramens)

## Ce e subtil

Nu CLAUDE.md v2 (dictat, prescriptiv, static). Aici: **jurnal de echipaj** — descriptiv, introspectiv, evolutiv. Observații Claude → pagină. În DB. Queryable.

| CLAUDE.md actual | `agent/claude.md` propus |
|---|---|
| Instrucțiuni Narcis → Claude | Observații Claude → pagină |
| Prescriptiv | Descriptiv + introspectiv |
| Static | Evolutiv |
| Nu poate fi contestat | Narcis marchează `challenged`; nu șterge |
| Nu e în DB | E în DB — queryable |

## Structura

```yaml
---
title: "Claude — Modelul de lucru în Alteramens"
type: agent
scope: alteramens-only
updated: 2026-04-22
heuristics_count: 12
active_beliefs_about_narcis: 7
---
```

Secțiuni:
1. **Ce înțelege Claude despre Narcis** — sincronizat cu `self/narcis-pillars`. Divergență → `/faber-lint` flag.
2. **Heuristici active** — fiecare cu: rule, evidențe (log event IDs), confidence (high/medium/low), status (active/retired/challenged).
3. **Anti-pattern-uri** — ce s-a învățat că NU funcționează.
4. **Deschis pentru revizie** — întrebări Claude către Narcis, răspunse asincron.

## Autoritate și dispute

- Narcis revizuiește, corectează, marchează `challenged`. **Nu poate șterge.**
- O heuristică `challenged` rămâne citabilă, cu motivul disputei logat în `agent_heuristics.dispute_reason`.
- Mecanism "agreed to disagree": Claude poate menține o heuristică ca `challenged` — nu dispare, doar iese din setul activ.

## Cine scrie ce

- **Heuristici, anti-pattern-uri** → Claude, la `/agent-reflect` (final de sesiuni mari).
- **Modelul despre Narcis** → Claude propune, Narcis ratifică/corectează la `/faber-meet`.
- **Deschis pentru revizie** → Claude scrie, Narcis răspunde asincron.

**Regulă strictă:** fiecare heuristică = minim 1 log event ca evidență. Fără → nu intră.

---

# Schema SQLite — adăugări

Non-breaking. Extinderi la `faber.db`:

## 1. Extensie CHECK pe `pages.type`

```sql
CHECK(type IN ('source','entity','concept','synthesis','meta','self','agent'))
```

## 2. Tabele noi

```sql
-- Piloni activi ai lui Narcis
CREATE TABLE self_pillars (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    since TEXT,
    status TEXT CHECK(status IN ('active','retired','challenged')),
    evidence_events INTEGER DEFAULT 0
);

-- Stance-uri (poziții pe sub-probleme)
CREATE TABLE self_stances (
    slug TEXT PRIMARY KEY,
    on_topic TEXT NOT NULL,
    position TEXT NOT NULL,
    confidence TEXT CHECK(confidence IN ('high','medium','low')),
    status TEXT CHECK(status IN ('active','retired','challenged')),
    last_reaffirmed TEXT
);

-- Obligații măsurabile cu deadline
CREATE TABLE self_commitments (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    due_date TEXT,
    status TEXT CHECK(status IN ('active','met','missed','revised')),
    progress_marker TEXT
);

-- Reguli de voce (first-class, populat din self/narcis-voice.md)
CREATE TABLE voice_rules (
    slug TEXT PRIMARY KEY,
    rule TEXT NOT NULL,
    category TEXT,  -- ex: 'register', 'romglish', 'pillar-alignment'
    examples_yes TEXT,  -- JSON list
    examples_no TEXT,   -- JSON list
    status TEXT CHECK(status IN ('active','retired','challenged'))
);

-- Heuristicile lui Claude
CREATE TABLE agent_heuristics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule TEXT NOT NULL,
    first_observed TEXT,
    evidence_events TEXT,  -- JSON list of log event IDs
    confidence TEXT CHECK(confidence IN ('high','medium','low')),
    status TEXT CHECK(status IN ('active','retired','challenged')),
    dispute_reason TEXT   -- set when status='challenged'
);

-- Alinierea paginilor cu pilonii
CREATE TABLE self_alignment (
    page_slug TEXT NOT NULL,
    pillar_slug TEXT NOT NULL,
    relation TEXT CHECK(relation IN ('reinforces','weakens','contradicts','neutral')),
    source_event TEXT,  -- log event care a stabilit relația
    PRIMARY KEY (page_slug, pillar_slug),
    FOREIGN KEY (pillar_slug) REFERENCES self_pillars(slug)
);

-- Snapshot-uri la /faber-meet
CREATE TABLE self_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taken_at TEXT NOT NULL,
    meet_event_id TEXT,   -- ref la log event /faber-meet
    page_slug TEXT NOT NULL,
    frontmatter_json TEXT NOT NULL,
    body_hash TEXT NOT NULL,
    body TEXT NOT NULL
);
CREATE INDEX idx_self_snapshots_page ON self_snapshots(page_slug, taken_at);
```

## 3. Views

```sql
-- Fiecare pilon cu paginile care îl întăresc/slăbesc/contrazic
CREATE VIEW v_narcis_alignment AS
  SELECT p.slug AS pillar, p.status AS pillar_status,
         sa.page_slug, sa.relation, COUNT(*) OVER (PARTITION BY p.slug, sa.relation) AS cnt
  FROM self_pillars p
  LEFT JOIN self_alignment sa ON sa.pillar_slug = p.slug;

-- Stance declarat vs. observație în log (ultimele 30 zile)
CREATE VIEW v_declaration_vs_observation AS
  SELECT s.slug, s.on_topic, s.position, s.status,
         /* COUNT aligned/misaligned log events in last 30d — computed in sync */ 0 AS aligned_cnt,
         0 AS misaligned_cnt
  FROM self_stances s;

-- Heuristici cu evidențe (cele cu 0 → flag)
CREATE VIEW v_agent_heuristics_evidence AS
  SELECT id, rule, confidence, status,
         json_array_length(COALESCE(evidence_events,'[]')) AS evidence_count
  FROM agent_heuristics;

-- Commitments deschise, sortate după urgență
CREATE VIEW v_open_commitments AS
  SELECT slug, title, due_date, progress_marker,
         julianday(due_date) - julianday('now') AS days_left
  FROM self_commitments
  WHERE status = 'active'
  ORDER BY days_left ASC;

-- Istoric self: snapshot-uri ordonate cronologic per pagină
CREATE VIEW v_self_history AS
  SELECT page_slug, taken_at, meet_event_id, body_hash,
         LAG(body_hash) OVER (PARTITION BY page_slug ORDER BY taken_at) AS prev_hash
  FROM self_snapshots;
```

---

# Workflow-uri

## `/faber-mirror` — săptămânal, confruntațional

Query-uri active pe log:
- "Ce ai declarat în piloni vs. ce arată log-ul ultimelor 7 zile?"
- "Câte ingest-uri, commits, posts publice? Ratio."
- "Ce commitments sunt aproape de deadline? Ce progres real?"

**Ton:** direct, confruntațional (conform deciziei 5). Nu cere permisiune să confrunte. Output = reflection scurtă, săptămânală. Atac pe slăbiciunea declarată (amânarea).

## `/faber-meet` — lunar, revizie + snapshot

1. Narcis revede piloni, stances, commitments.
2. Claude prezintă propuneri de updates bazate pe log.
3. **Snapshot automat:** toate paginile `self/` → `self_snapshots` cu `meet_event_id` comun.
4. Log event `self-update`.
5. Pagini `self/` actualizate.

Snapshot-ul dă `v_self_history` — diff-uri structurate ale identității în timp.

## `/agent-reflect` — final sesiuni mari

Trigger: sesiune > 30 min sau > 3 ingest-uri. Claude scrie mini-update la `agent/claude.md`:
- Heuristici confirmate/eșuate (cu log event IDs).
- Observații noi.
- Întrebări deschise pentru Narcis.

## `/faber-align <source-slug>`

La ingest, post-extract: "Această sursă întărește pilonul X, slăbește Y, introduce stance despre Z — adopți?". Populează `self_alignment` și propune stance-uri noi.

---

# Skill integration — `self_context` injection

Conform deciziei 4, skill-urile existente citesc `self/` la startup:

| Skill | Ce injectează |
|---|---|
| `/semnal-draft` | `voice_rules` + `self_pillars` activi |
| `/semnal-reply` | `voice_rules` + `self_stances` active |
| `/to-content` | `voice_rules` + `self_pillars` + `self_constraints` |
| `/faber-ingest` | `self_pillars` (pentru alignment), `self_stances` (pentru detecție tensiune) |
| `/faber-query` | `self_context` complet (context pentru sinteză personalizată) |

Mecanism tehnic: fiecare skill face un SELECT minimal la startup pe views precompilate (`v_self_active_context`), fără să citească MD-uri. Sync-ul păstrează DB-ul la zi.

---

# Migrare `owner/Who am i` → `wiki/self/`

**Stage C** în consistența cu Stage B (separarea fizică a rolurilor):

1. `owner/Who am i.md` rămâne temporar ca *arhivă de origine*.
2. Conținutul se fragmentează în cele 7 pagini `self/*.md` + `narcis-voice.md`.
3. După validare (2 săptămâni fără lipsuri detectate), `owner/` devine `archive/owner/`.
4. Unică sursă de adevăr: `wiki/self/`.

---

# Roadmap de implementare

Fragmentare self **din Faza 1** (per decizie). Fără detur prin monolit.

## Faza 1 — Schema DB + `self/` fragmentat

- Extinde `pages.type` CHECK pentru `self`, `agent`.
- Creează tabele: `self_pillars`, `self_stances`, `self_commitments`, `self_constraints`, `voice_rules`, `agent_heuristics`, `self_alignment`, `self_snapshots`.
- Creează views: `v_narcis_alignment`, `v_declaration_vs_observation`, `v_agent_heuristics_evidence`, `v_open_commitments`, `v_self_history`, `v_self_active_context`.
- Migrează `owner/Who am i` → 6 pagini `self/` + 1 synthesis.
- Actualizează `faber_sync.py` pentru parsarea frontmatter-ului `self`/`agent` și populate tabele auxiliare.
- Validare: `sqlite3 faber.db "SELECT * FROM v_dashboard;"` arată types `self` + `agent`.

## Faza 2 — `agent/claude.md` inițial

- Creează `wiki/agent/claude.md` (tip `agent`, scope `alteramens-only`).
- Populează cu 3-5 heuristici inițiale (cele deja evidente din CLAUDE.md + sesiuni recente).
- Fiecare heuristică referențiază log events reale.
- Sync → `agent_heuristics` populat.

## Faza 3 — `/faber-mirror` (confruntațional)

- Skill nou: `skills/faber-mirror/SKILL.md`.
- Query-uri standard pe log + `self_*`.
- Output: pagină reflection săptămânală în `syntheses/mirror-YYYY-WW.md`.
- Ton: confruntațional, fără diplomație.

## Faza 4 — `/faber-meet` (cu snapshot)

- Skill nou: `skills/faber-meet/SKILL.md`.
- Flow: revizie → propuneri → aprobare → snapshot → log event → update.
- Snapshot automat la începutul `/faber-meet` (înainte de editare).

## Faza 5 — `/agent-reflect`

- Skill nou: `skills/agent-reflect/SKILL.md`.
- Trigger manual (inițial); auto pe heuristici observate mai târziu.
- Scrie update la `agent/claude.md` + log event.

## Faza 6 — `self_context` injection în skill-uri existente

- Adaugă `self_context` loading la `/semnal-draft`, `/semnal-reply`, `/semnal-draft`, `/to-content`, `/faber-ingest`, `/faber-query`.
- Elimină `wiki/concepts/x-voice-rules.md` (înlocuit de `voice_rules` table + `self/narcis-voice.md`).

## Faza 7 — `/faber-align` (ingest alignment)

- Adaugă pas post-extract la `/faber-ingest`: aliniere cu piloni, detecție stance nou.
- Populează `self_alignment` automat.

**Cale de ieșire la fiecare fază.** Oprire după Faza 2 dacă suficient; continuare către Faza 4+ pentru mecanismele corective.

---

# Definition of Done

- [ ] `faber.db` conține toate tabelele `self_*`, `agent_*`, `voice_rules`, `self_snapshots`.
- [ ] `wiki/self/` are 6 pagini + `narcis-voice.md`; `wiki/agent/claude.md` există.
- [ ] `faber_sync.py` parsează și populează corect.
- [ ] Views `v_narcis_alignment`, `v_self_history`, `v_open_commitments` returnează date.
- [ ] `/faber-mirror` rulează și produce reflection cu ton confruntațional.
- [ ] `/faber-meet` ia snapshot automat în `self_snapshots`.
- [ ] `/semnal-draft` citește `voice_rules` din DB (nu din MD).
- [ ] `agent_heuristics` conține ≥ 3 heuristici cu evidențe din log.
- [ ] Narcis poate marca `challenged` pe o heuristică; nu poate șterge.

---

# Next action

Start la Faza 1 — schema DB + fragmentare `self/`. Primul task concret:

1. Extinde `CHECK` pe `pages.type` în `faber_sync.py`.
2. Adaugă tabelele noi în schema de sync.
3. Creează stub-uri pentru cele 6 pagini `self/` + `narcis-voice.md` (frontmatter + skelet, conținut extras incremental din `owner/Who am i`).

## Conexiuni
- [[CLAUDE]] — baza de la care evoluează
- [[owner/Who am i|Who am i]] — sursa pentru migrarea în `self/`
- [[wiki/FABER|Faber schema]] — ce extindem
- [[wiki/concepts/compounding-games]] — filosofia care justifică efortul
