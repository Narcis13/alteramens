---
title: "Faber vs IPSE Identity Graph — Analiză tehnică și conceptuală"
type: analysis
created: 2026-05-07
authors: [claude, narcis]
trigger: ultrathink-comparison
question: "Ce relație există între Faber (tehnologia existentă) și IPSE Identity Graph (PRD propus)? Ar trebui Faber să devină un graf orientat ponderat? Ar trebui IPSE să fie implementat ca Faber?"
status: draft
maturity: developing
sources_consulted:
  - "wiki/FABER.md"
  - "wiki/.faber.toml"
  - "wiki/faber.db schema (full)"
  - "wiki/faber_sync.py (1639 LOC)"
  - "wiki/self/narcis-pillars.md"
  - "wiki/self/narcis-stances.md"
  - "wiki/self/narcis-voice.md"
  - "wiki/agent/claude.md"
  - "wiki/syntheses/semnal-vs-superx-strategic-analysis.md"
  - "wiki/syntheses/alteramens-thesis.md"
  - "wiki/concepts/skill-era.md"
  - "wiki/concepts/specific-knowledge.md"
  - ".claude/skills/faber-ingest/SKILL.md"
  - ".claude/skills/faber-query/SKILL.md"
  - "workshop/experiments/IPSE-Implementation-PRD.md"
---

# Faber vs IPSE Identity Graph

> **TL;DR.** Faber e deja 70% din IPSE Identity Graph — implementat, populat (210 pagini, 1968 muchii, 43 entrii de aliniere, 8 reguli de voce executabile, 10 stance-uri active), fără embeddings și fără weights numerice. IPSE descrie un graf ponderat cu pgvector, voice fingerprint statistic și closed loop de la X. Comparat tehnic și conceptual, întrebarea "care e mai bun" e o eroare de categorie: Faber e personal compounder, IPSE e SaaS multi-tenant. **Decizia interesantă:** dacă vrei să construiești IPSE, **construiește-l peste Faber** (Faber-ca-MCP-server, nu Faber rescris în Postgres). Faber, la rândul lui, ar câștiga din `weight NUMERIC` pe `page_relations` și `self_alignment.intensity` — schimbare de schema pe ~30 LOC, zero migration cost (drop-and-recreate). Embeddings? Nu încă — măsoară gap-ul FTS5 întâi.

---

## 0. Cadrul comparației

Ce încercăm să răspundem, în ordine:

1. **Ce e fiecare sistem, anatomic.** Tabela completă, nu impresie.
2. **Unde se suprapun și unde diferă cu adevărat.** Faber are deja Identity Graph în formă embrionică.
3. **Ar fi Faber mai bun cu graf orientat ponderat?** Răspuns scurt: da, în 5 locuri concrete. Răspuns lung: cu o condiție.
4. **Ar fi IPSE mai bun construit ca Faber?** Răspuns scurt: da, ca *engine*. Multi-tenant rămâne Postgres.
5. **Care e jocul corect.** Trei opțiuni de implementare, cu o recomandare.

Stilul: română analitică + termeni tehnici în engleză, conform [[wiki/self/narcis-voice]]. Numere concrete > vagueness.

---

## 1. Anatomia Faber

### 1.1 Cele patru straturi

```
LAYER 1 — Markdown (sursa de adevăr, git-versionat)
  wiki/{sources,entities,concepts,syntheses,self,agent,mocs}/*.md
  + wiki/log.md (append-only, parseable)

LAYER 2 — SQLite derived (drop-and-recreate)
  pages, key_claims, aliases, vault_refs, page_relations, prose_wikilinks, images
  log_events, log_event_pages       ← parsed from log.md
  self_pillars, self_stances, self_constraints, voice_rules,
  self_commitments, agent_heuristics ← parsed from self/* and agent/*
  self_alignment                     ← universal frontmatter field on ANY page
  self_snapshots                     ← preserved across rebuilds (audit trail)
  + 13 views (v_self_active_context, v_narcis_alignment, v_log_mismatches, ...)
  + 3 FTS5 tables (fts_content, fts_claims, fts_log)

LAYER 3 — Skill runtime (Claude e procesul)
  /faber-ingest, /faber-query, /faber-link, /faber-lint, /faber-status,
  /faber-brief, /faber-sync, /faber-seed, /faber-mirror, /faber-meet,
  /faber-slides, /agent-reflect

LAYER 4 — Surrounding vault (decuplat de wiki via .faber.toml)
  inbox/ workshop/ projects/ archive/ slides/
```

**Regula de aur:** `.md` e adevărul, `faber.db` e derivat. Șterge DB, rulezi `python3 wiki/faber_sync.py`, același rezultat (~120ms target, măsurat în `sync_log`).

### 1.2 Identity layer — ce nu se vede din afară

Faber NU e doar wiki. Are deja un **identity store** complet, separat de stratul de cunoaștere:

| Tabela | Ce conține | Sursa | Cum e folosit |
|--------|------------|-------|---------------|
| `self_pillars` | 3 ancore de identitate (skill-era, ai-agents-for-solo-builders, building-as-51yo) | `self/narcis-pillars.md` | Self context loading la fiecare `/faber-ingest` și `/faber-query` |
| `self_stances` | 10 poziții declarate (shipping > perfecționare, romglish autentic, judgment > funcționalitate, ...) | `self/narcis-stances.md` | **Executabile** — `/semnal-draft`, `/semnal-reply` le citesc și le injectează în prompt |
| `self_constraints` | Slăbiciuni declarate (amânarea postării e cea load-bearing) | `self/narcis-constraints.md` | `/faber-mirror` le confruntă cu observed log |
| `voice_rules` | 8 reguli prescriptive cu `examples_yes`/`examples_no` | `self/narcis-voice.md` | Toate skills-urile generative (semnal-*, to-content) citesc din DB la startup |
| `self_commitments` | Comitmente cu `due_date` și `progress_marker` | `self/narcis-commitments.md` | `v_open_commitments` returnează ce e activ acum |
| `agent_heuristics` | **Teoria lui Claude despre Narcis** — 5 reguli observate cu `evidence_events` (id-uri de log) | `agent/claude.md` | `/agent-reflect` actualizează după sesiuni; `/faber-lint` flag drift |
| `self_alignment` | 43 entrii: page → pillar cu `relation` ∈ {reinforces, weakens, contradicts, neutral} | Frontmatter `alignment:` pe ORICE pagină | `v_narcis_alignment` agregat pentru rapoarte; `/faber-mirror` confrunt |
| `self_snapshots` | Append-only audit trail luat înainte de fiecare `/faber-meet` | Skill-uri externe (NU sync) | Rollback și diff structurat în `v_self_history` |

**Ceva esențial despre acest layer:** Faber separă fizic *identitatea declarată* (`self/`) de *cunoașterea descrisă* (`concepts/`, `entities/`, `syntheses/`). IPSE le împachetează pe toate într-un singur `nodes` table cu `type` enum. Discutăm asta în §5.

### 1.3 Engine-ul de sinc — forensics

`faber_sync.py` (1639 LOC) are 7 faze, în ordine:

1. **`create_db()`** — drop & recreate `faber.db`, **preserved**: `sync_log` history + `self_snapshots`.
2. **Pages Pass 1** — parse markdown → `pages` + `key_claims` + `aliases` + `vault_refs` + `page_relations` + `prose_wikilinks` + `insert_self_aux` (doar pentru type ∈ {self, agent}).
3. **Pages Pass 2** — `insert_alignment_fm` (universal pe ORICE pagină — sources, concepts, syntheses pot declara `alignment:`).
4. **Temporal layer** — `parse_log_md` cu regex `^##\s*\[(\d{4}-\d{2}-\d{2})\]\s*([^|]+?)\s*\|\s*(.+?)\s*$` + `_process_bullet` pe etichete strict (`Sources created`, `Entities updated`, `Totals`, `Source: <url>`, etc.). Reconciliation pass: ingest events fără `Sources created` se mapează din `Source: <url>` la `pages.source_ref`.
5. **`sync_log`** — un row per run cu `duration_ms`.
6. **`generate_index()`** — overwrites `wiki/index.md`.
7. Single `commit()` la final → atomicitate.

**Două canale separate de muchii care nu se intersectează:**

```
frontmatter relation arrays  →  page_relations (typed, declared)
prose [[wikilinks]]          →  prose_wikilinks (typed by side)
```

`page_relations` are 10 tipuri de relații, dar **fără weight, fără numeric, fără score**. Aproape de weight: `agent_heuristics.evidence_events` (JSON array → count derived prin `json_array_length`). Dar pe muchii — nimic.

Edge types-urile **nu sunt normalizate** la o set canonic — aceeași relație semantică apare sub nume diferite pe baza părții care declară: `has_source` (de pe entity) vs `consulted_source` (de pe synthesis). PK `(from_slug, to_slug, relation_type)` previne duplicates exacte, nu sinonime.

### 1.4 Ce face Faber azi — date live (2026-05-07)

**Distribuție pagini (210 total):**
- `concept` — 110 pagini, avg 728 cuvinte → **centrul gravitațional**
- `entity` — 42, avg 230 cuvinte (noduri subțiri)
- `source` — 25, avg 900 cuvinte
- `synthesis` — 23, avg **1379 cuvinte** (densă, decision-driven)
- `self` — 6, avg 261 cuvinte
- `moc` — 2, avg 1595 cuvinte
- `agent` — 1 (claude.md, 405 cuvinte)

**1968 muchii typed în `page_relations`.** Top tipuri: `related_to` (684), `involves_concept` (293), `has_source` (218), `has_entity` (211), `has_concept` (163). **Doar 3 `contradicts`** — wiki-ul e în mod overwhelming în synthesis-mode, nu pressure-test-mode.

**Activitate:** ~1 event/zi de 4 săptămâni, mixed operations (ingest + lint + build + weekly-loop + query→synthesis). Nu e doar dump pipeline.

**Alignment table:** 43 entrii populate, dar **toate `reinforces`, zero `weakens`/`contradicts`**. Schema suportă, practica nu folosește. Confrontation muscle subexercitat.

**Bug găsit pe parcurs:** `self_pillars.evidence_events = 0` pentru toți cei 3 piloni, deși `v_narcis_alignment` arată clar 43 entrii. Linkajul de la log events la `self_pillars.evidence_events` nu e wired în sync. Reparable, nu existential.

### 1.5 Verdict pe Faber ca sistem viu

Faber e un **personal knowledge compounder care funcționează**. Concepts și syntheses sunt centrul gravitațional, nu sources — adică e dincolo de etapa "save articles" și în "synthesize and apply". Stance-urile sunt **policy executabilă** (loaded de skills la runtime). Agent self-page (`claude.md`) cu heuristici falsifiabile legate de log_event IDs — pattern unic, IPSE nu are. Confruntare slabă (alignment one-way, pillars.evidence_events ne-implementat) e gap-ul real, nu schema.

---

## 2. Anatomia IPSE Identity Graph

### 2.1 Stratul 1 — Identity Graph (PostgreSQL + pgvector)

**11 tipuri de noduri:**

```
Pillar, Stance, Framework, Belief, Anti-pillar,
Anecdote, Frame, Tension, Evolution, Reference, Vocabulary
```

**11 tipuri de muchii cu `weight NUMERIC` și `declared BOOL`:**

```
SUPPORTS, CONTRADICTS, EVOLVED_FROM, EXEMPLIFIES,
DERIVES_FROM, ANTAGONIZES, COEXISTS_WITH, REPLACES,
ELABORATES, NARROWS, GENERALIZES
```

**Schema cheie (din PRD §8):**
```typescript
nodes: {
  id, userId, type, label, contentMd,
  embedding vector(1536),           // ← HNSW index
  weight numeric(5,2) default 1.0,  // ← node-level weight
  status active|dormant|archived,
  version, createdAt, updatedAt
}

edges: {
  id, userId, sourceId, targetId, relationType,
  weight numeric(5,2) default 1.0,  // ← edge-level weight
  declared boolean default false,    // ← user vs system-inferred
  createdAt
}

nodeRevisions: { ... }              // ← append-only history
```

### 2.2 Voice Fingerprint (statistic)

PRD §3.4: distribuție de lungime, syntactic tics, opening/closing patterns, punctuație ritm, vocabular distinctiv, code-switching. Stocat ca `voiceProfiles.fingerprint JSONB`. Recomputat la fiecare 50 posturi.

**Esența:** statistic. Învață ce *este* vocea ta.

### 2.3 Closed feedback loop (§4.5)

```
Tweet publicat
  → 7 zile waiting
  → Pull metrici (Owned Reads, $0.001/resursă)
  → Atribuire la noduri (drafts.invokedNodeIds → post_attributions)
  → Bayesian update node performance + voice fingerprint
  → Insights săptămânale
```

Aceasta e **moat-ul real al IPSE**, nu graful. Discutat în §5.

### 2.4 Agentic layer (§9)

6 subagenți specializați:
- **Extractor** — concept extraction din ingest
- **Authoring** — drafting / refining (4 moduri)
- **Sparring** — devil's advocate
- **Strategist** — playbook X codificat
- **Curator** — graph hygiene
- **Reflector** — weekly review

Toți operează sub un **Orchestrator** care păstrează identitatea ca primary context.

### 2.5 Layer-e adiacente

- **X content** — `tweets`, `drafts`, `post_attributions`
- **Strategic** — `audience_clusters`, `posting_windows`, `reply_targets`
- **X API tracking** (cost-aware) — `x_api_calls`, `x_api_cache`, `user_spending`
- **Agents** — `agent_sessions` cu transcript JSONB

---

## 3. Comparație directă

| Dimensiune | Faber | IPSE |
|------------|-------|------|
| **Sursa de adevăr** | Markdown files (git) | Postgres rows |
| **Layer derivat** | SQLite (drop & recreate) | nimic — DB e adevărul |
| **Editing UX** | Orice editor + ingest skills | Doar prin UI / API |
| **Multi-tenant** | Nu (single user) | Da |
| **Cost ongoing** | $0 | $19-149/user/lună |
| **Edge typing** | Da, 10+ tipuri | Da, 11 tipuri |
| **Edge weight** | **Nu** | **Da (numeric, 0-1)** |
| **Edge inference** | Manual (frontmatter) | Auto + manual (`declared` flag) |
| **Node embedding** | Nu | Da (1536-d HNSW) |
| **Search** | FTS5 (BM25 + porter) | Vector + FTS |
| **Identity declaration** | 7 tabele dedicate (self_*) | Tipuri de noduri (Pillar, Stance, Anti-pillar) |
| **Identity vs cunoaștere** | **Separare fizică** | Single `nodes` table cu `type` enum |
| **Voice rules** | 8 prescriptive cu examples_yes/no | Statistical fingerprint (JSON) |
| **Voice drift detection** | Lint + mirror manual | Auto-flag vs fingerprint |
| **Temporal layer** | log.md → log_events + log_event_pages + 4 views | node_revisions; performance per period |
| **Performance feedback** | **None** | **X metrics → node_performance** |
| **Source/citation** | First-class (`sources/` + `key_claims`) | Compactat în Reference nodes |
| **Synthesis ca artefact** | First-class (`syntheses/`, 23 pagini live) | Lipsește — există doar drafts |
| **Snapshots** | Înainte de mutație (`/faber-meet`) | După mutație (`node_revisions`) |
| **Append-only philosophy** | Strong (mark contradictions, don't delete) | Strong (revisions + status flags) |
| **Publishing path** | None (Faber e knowledge tool) | First-class (drafts → tweets) |
| **Closing the loop** | `/faber-mirror` (declarat vs log) | Performance metrics → graph |
| **Reply targeting** | None | Da (`reply_targets`) |
| **Strategic/algo brain** | None | Da (Strategist agent + Insider Playbook) |
| **Numărul de agenți** | 1 (Claude prin skills) | 6 (Extractor, Authoring, Sparring, Strategist, Curator, Reflector) |
| **Approval queue** | Conversational (în guided ingest) | Explicit UI |
| **Privacy/IP** | Local files, completamente owned | Encrypted at rest, exportabil |
| **Failure mode** | Drift uncatched dacă mirror nu rulează | 200-item approval queue → user nu triagează |

---

## 4. Suprapuneri și diferențe reale

### 4.1 Faber are deja 70% din IPSE Identity Graph

Mapează unul la altul:

| IPSE node type | Faber echivalent | Comentariu |
|----------------|-------------------|------------|
| **Pillar** | `self_pillars` | Direct match. Faber: 3 piloni cu evidence_events (ne-wired). |
| **Stance** | `self_stances` | Direct match. Faber: 10 stance-uri executabile. **Faber e superior aici** — stance-urile lui sunt încărcate runtime în `/semnal-*`, IPSE nu specifică așa ceva. |
| **Framework** | `concepts/` cu `category: mental-model` | Same shape, prose mai densă în Faber (avg 728 cuvinte). |
| **Belief** | `concepts/` cu `category: pattern` sau `confidence: medium` | Match. |
| **Anti-pillar** | `self_constraints` (parțial) sau implicit în stances | Faber face explicit "ce *nu* sunt" prin `self_stances` cu `position` negative ("zero boți, zero auto-reply"). |
| **Reference** | `entities/` (avg 230 cuvinte) | Match exact. Faber: 42 entities. |
| **Vocabulary** | Implicit în concept slugs ("BHVR", "MirrorClaude") | Faber nu are tipul, dar concepts cu titluri scurte îl emulează. |
| **Anecdote** | **Lipsește în Faber** | IPSE wins. Stories despre "cum am pierdut 3 luni rescriind în Go" merită tip propriu. |
| **Frame** | **Lipsește în Faber** | Specific creator-output. Hook patterns, opening structures. |
| **Tension** | **Lipsește în Faber** ca tip explicit | În spirit: `contradictions` field pe concepts (3 doar înregistrate). |
| **Evolution** | `self_snapshots` (temporal, nu structural) | Diferite cuts, ambele valide. |

**Verdict:** 7/11 tipuri IPSE sunt deja în Faber sub alte nume. Cele 4 unice IPSE — Anecdote, Frame, Tension, Evolution — sunt creator-output specifice. Anecdote e cel mai universal — Faber ar trebui să-l fure.

### 4.2 Ce lipsește din Faber (aproape sigur prețios)

1. **Anecdote ca tip** — povestea "Cum am pierdut 3 luni rescriind în Go" e cea mai mare leverage unitate de conținut pe X. Merită tip propriu, nu să se piardă în concepts.
2. **Numeric weights pe muchii** — discutat în §5.
3. **Closed feedback loop** — nimic nu pull-uiește metrice și nu alimentează scoring-ul. Faber nu e cuplat la X (nici nu trebuie să fie pentru rolul lui de personal compounder).
4. **Embeddings semantice** — FTS5 ratează parafraze. Cât de mult contează pentru 210 pagini? Necunoscut. Probably underused.

### 4.3 Ce lipsește din IPSE (Faber are, ar trebui să fure)

1. **Markdown ca sursă de adevăr** — fundamental. Editor-agnostic, git-versionat, exportabil prin definiție.
2. **Sources ca first-class** — IPSE colapsează surse în Reference nodes. Pierzi `key_claims` (FTS5 in Faber: 218 rânduri), `confidence` per claim, citation-by-claim.
3. **Synthesis ca artefact persistent** — IPSE are Reflector cu weekly digests. Insights mor în chat. Faber are 23 syntheses cu maturity și updated dates.
4. **Voice rules prescriptive** — discutat în §6.2.
5. **Snapshots **înainte** de mutație** — Faber's `/faber-meet` ia snapshot la START. IPSE's `node_revisions` se ia DUPĂ. Prima dă rollback session-level; a doua dă diff per-node. Faber's e mai puternică pentru "ups, sesiunea asta a corupt 8 noduri, restore the lot".
6. **Log integrity views** — `v_log_mismatches` catch când agent-ul a zis "am creat 5 surse" dar a creat 3. IPSE n-are echivalent pentru `agent_sessions`.
7. **Confrontation skill (`/faber-mirror`)** — design pattern: comparați declared self vs observed log, raportează drift. PRD-ul IPSE menționează "voice drift detection" dar nu confruntare structurală pe pillars/stances/constraints.
8. **Agent self-page (`agent/claude.md`)** — Claude maintain-uiește **propria teorie despre user**, cu heuristici falsifiabile legate de log_event IDs. Asta e meta-level pe care IPSE nu-l atinge. Pattern transferabil.

### 4.4 Asumpția mărit-load-bearing din PRD-ul IPSE

PRD-ul argumentează: **moat = graful tău**. Switching cost intrinsec.

**Analiza arată că asumpția se rupe la export.** Phase 4 promite "Voice export" + "MCP server". Dacă graful e exportabil clean, NU e moat — e portable artifact. **Moat-ul real e closed feedback loop antrenat pe graf**, plus Strategic Brain coupled cu istoricul user-ului. PRD-ul nu spune asta clar.

Implicația: dacă graful e portable (and it should be, conform "Phase 4: Compounding"), atunci IPSE-ca-Faber-on-Postgres pierde moat-ul. **IPSE-ca-shell-around-Faber-MCP păstrează moat-ul în loop, nu în graf.**

---

## 5. Faber ar câștiga din graf orientat ponderat?

**Da, cu o condiție: weights să fie *derived*, nu *manually maintained*.** Dacă cer user-ului să scrie weight numeric la fiecare muchie de frontmatter, kill switch — nimeni nu o face. Dacă weights sunt derivate din co-citation, recency, alignment intensity — fit perfect.

### 5.1 Cinci locuri concrete unde weights plătesc

#### 5.1.1 `self_alignment.intensity NUMERIC` (semnată, [-1, 1])

Curent: enum `{reinforces, weakens, contradicts, neutral}`. Aggregare prin COUNT.

Propus: păstrează `relation` (semn), adaugă `intensity NUMERIC` cu default 1.0. Pentru o sursă care 70% reinforces pillar-ul X, scrii `intensity: 0.7`. Aggregarea devine `SUM(intensity * sign(relation))` — exprimă "cât de tare suport are pillar-ul în săptămâna asta", nu doar "câte pagini ating".

**Plată:** `/faber-mirror` poate distinge "20 pagini reinforce slab" de "5 pagini reinforce dur". Confruntare mai bună.

#### 5.1.2 `page_relations.weight NUMERIC` (default 1.0)

Curent: PK `(from, to, type)` — multiplicitatea ratată. O concept poate fi citată în 5 sources cu același edge type și apare ca o singură muchie.

Propus: `weight = co_citation_count / max_co_citation`, derived la sync. Existing views (`v_thin_pages`, `v_entity_connectivity`) nu se rup — folosesc COUNT, nu SUM. Se adaugă `v_strong_neighbors`:

```sql
SELECT from_slug, to_slug, weight
FROM page_relations
WHERE from_slug = ?
ORDER BY weight DESC
LIMIT 5;
```

**Plată:** `/faber-query` returnează "top-3 cele mai conectate concepts" în loc de "primele 3 in ordine alfabetică". Nu e dramatic, dar accumulează.

#### 5.1.3 Temporal decay pe `pages` salience

Curent: `last_touched` din `v_page_activity` e timestamp. Nu e weight.

Propus: o view `v_page_salience` care calculează `EXP(-(julianday('now') - julianday(last_touched)) / 30)` — half-life 21 zile. Folosit de `/faber-brief` să ranking "ce e fierbinte săptămâna asta".

**Plată:** Briefing-ul de wake-up (mentionat in `/faber-brief`) ranking-uiește pagini după salience reală, nu după ultim touch.

#### 5.1.4 `self_stances.confidence_score NUMERIC` (0-100)

Curent: enum `{high, medium, low}`. Nu reflectă drift.

Propus: derivat la sync din:
- bază: 80 dacă `last_reaffirmed` e mai nou de 30 zile, decay liniar până la 50 la 90 zile
- bonus: +10 per `reinforces` event în ultimele 30 zile
- penalty: -20 per `contradicts` event

**Plată:** `/faber-mirror` și `v_declaration_vs_observation` (deja există dar folosește COUNT) câștigă semnificativ. Stance-uri care decay sub 60 → flag pentru `/faber-meet`.

#### 5.1.5 `agent_heuristics.confidence_score` derived din `evidence_events`

Curent: enum + `evidence_events` JSON array. `v_agent_heuristics_evidence` numără.

Propus: confidence derivat = `tanh(log(1 + evidence_count) * recency_factor)`. Tunable.

**Plată:** Claude poate ranking propriile reguli "high confidence: 5 events recent" vs "low confidence: 1 event acum 60 zile".

### 5.2 Unde NU câștigă weights

- **Pe `page_relations` cu derivare manuală în frontmatter** — dacă schimbarea forțează `entities: [{slug: foo, weight: 0.8}]` în loc de `entities: [foo]`, e adoption killer. Sync engine actualmente face `str(target)` fără verificare — ar corupe silent. **Trebuie derivat la sync, nu scris de mână.**
- **Pe `self_pillars`** — pilonii sunt declared identity. Weight pe ei e oxymoron — ori sunt activi, ori nu. `evidence_events INTEGER` (count derived) e suficient.
- **Înainte să măsori gap-ul FTS** — dacă user-ul nu raportează "search-ul ratează lucruri evidente", nu adaugi embeddings. 210 pagini, ~150K cuvinte total prose — FTS5 cu Porter stemmer e probabil over-spec.

### 5.3 Plan minim — ~30 LOC, zero migration cost

Faber's drop-and-recreate idempotency e magic aici: **NU EXISTĂ migration**. Schimbare de schema = update la `SCHEMA_SQL` în `faber_sync.py`.

Pași concreți:

1. **Schema additions:**
   ```sql
   -- în SCHEMA_SQL
   ALTER TABLE page_relations ADD COLUMN weight REAL DEFAULT 1.0;
   ALTER TABLE self_alignment ADD COLUMN intensity REAL DEFAULT 1.0;
   ```

2. **Derivation rule în `insert_relations`:** Pentru fiecare relation type, weight derived din co-citation count în `prose_wikilinks` sau din `key_claims` overlap. Fallback 1.0.

3. **Three new views:**
   ```sql
   CREATE VIEW v_strong_relations AS ...
   CREATE VIEW v_page_salience AS ...
   CREATE VIEW v_stance_drift AS ...
   ```

4. **Skill updates:** `/faber-query` adăugă opțional `ORDER BY weight DESC`; `/faber-mirror` folosește `v_stance_drift`.

5. **Bug fix:** `self_pillars.evidence_events` populare din log scan + alignment join. ~10 LOC.

**Estimare:** 1-2 zile de muncă, plus 1 zi de testat că views-urile produc rezultate care îți sună plauzibil.

---

## 6. IPSE ar fi mai bun construit ca Faber?

**Întrebarea trebuie despachetată.** "Construit ca Faber" poate să însemne:
- (a) Markdown source of truth + SQLite derivat — *unfeasible pentru SaaS multi-tenant*
- (b) Aceleași design patterns (separare identity vs cunoaștere, append-only, snapshots-before-mutation, voice_rules prescriptive, sources first-class) — *foarte feasible și recomandat*
- (c) Faber-as-engine cu IPSE-as-shell — *cel mai interesant*

### 6.1 Avantajele filozofiei Faber pentru IPSE

1. **Markdown layer pentru identitate** — chiar dacă nodes sunt în Postgres, fișierele de pillars/stances/voice să fie generate `.md` exportabile-zilnic, plus user-ul poate `git pull` pe ele. Switching cost crește pentru că user-ul are graful local pe disk; SaaS gate-uiește loop-ul, nu graful. Aliniat cu Phase 4 din PRD ("Voice export").

2. **Sources ca tabel separat** cu key_claims și confidence per claim — nu colapsa în Reference nodes. Când user-ul ingest-ează un podcast transcript, vrei să-l păstrezi cu citations. IPSE actualmente îl pierde.

3. **Synthesis ca artefact persistent** — Reflector să producă `wiki/syntheses/`-style pages, nu doar weekly digests în chat. User-ul revine la ele, le actualizează, le citează în drafts.

4. **Voice rules prescriptive** ALĂTURI de Voice Fingerprint statistic. Statistic detect drift; rules prevent drift. Faber's 8 reguli cu examples_yes/no merg direct în prompt-ul Authoring agent — debug-abile, editabile, falsifiabile. Voice fingerprint singur duce la regression to mean (orice variance de la JSON statistics e flagged ca drift, user învață să scrie average).

5. **Confrontation skill** — `/faber-mirror` design pattern. Săptămânal compară declared identity (pillars/stances/anti-pillars) vs published posts. Flag-uiește drift cu evidence. PRD-ul IPSE menționează drift dar nu structurează confruntarea.

6. **Snapshots înainte de mutație** — pentru sesiuni Authoring care modifică multe noduri, snapshot session-level. Rollback ieftin.

7. **Log integrity views** — `agent_sessions.transcript` JSONB e foundation, dar fără `v_log_mismatches` (claimed vs actual) nu prinzi când agent halucinează "am invocat 5 noduri" și de fapt 3.

8. **Agent self-model** — `agent_heuristics` table. Authoring agent să mențină **propria teorie despre user**, cu evidence events. Asta e meta — IPSE poate fi al doilea soft din lume care o face explicit (după Faber).

### 6.2 Voice fingerprint vs voice_rules — comparație directă

PRD-ul IPSE: voice fingerprint statistic. JSON cu length distribution, em-dash usage, code-switching frequency, etc. Update-ed la fiecare 50 posturi.

Faber: 8 voice_rules prescriptive cu examples concrete. Skills le citesc din DB la startup.

| Capacity | Statistical fingerprint | Prescriptive rules | Both |
|----------|--------------------------|---------------------|------|
| Detect drift în output existent | **Da** | Nu direct | **Da** |
| Prevent drift la generare | Slab (penalty after-the-fact) | **Da** (injectat în prompt) | **Da** |
| Encode "ce REFUZ să fac" (no-corporate-hedging, no-emojis) | **Nu** | **Da** | **Da** |
| Capture nuance subtilă (em-dash rate) | **Da** | Greu | **Da** |
| Debug-abil de user | Greu (JSON cu numere) | **Trivial** (citește examples_yes/no) | **Da** |
| Falsifiabil (când greșește, vezi de ce) | Slab | **Da** (rule status: challenged + dispute_reason) | **Da** |
| Regression to mean risk | **Da, mare** | Mic | Mic |

**Verdict:** ambele sunt necesare. Statistical fingerprint singur duce la regression to mean — exact failure mode-ul pe care IPSE pretinde că-l combate. PRD-ul ratează contract layer-ul. Faber's `voice_rules` cu `examples_yes`/`examples_no` sunt direct portabile la IPSE — implementare 2 zile.

### 6.3 Numeric edge weights în IPSE — closed loop trace

Dacă urmărești PRD-ul:
- **Write path:** Extractor scrie weight 1.0 default; Feedback module update Bayesian din `nodePerformance`.
- **Read path:** ... unde? Section 4.3 (Authoring) zice "noduri invocate vizibil". Section 4.4 (Strategist) vorbește format selector. **`query_graph` tool semnătura nu e specificată.** Bayesian update fără consumer = vanity metric.

**Verdict:** weights sunt aspirational în PRD. Schema are coloana, update job-ul scrie, dar Authoring agent nu specific cum read-uiește weighted retrieval. **Faber being unweighted e DEFENSIBIL** — fără closed loop, weights sunt zgomot. IPSE wins doar dacă §4.5 ship-uiește **și** Authoring conditionează retrieval pe weight. Sub-claim: 50 posturi minim pentru ca per-node performance să separeze de noise. Bayesian update cu < 30 posturi e premature optimization.

### 6.4 Hidden killer: 200-item approval queue la onboarding

PRD §3.5: ingest istoric LLM extracție → 200 candidate noduri → user approve. Asta e adopție-killer documentat (Readwise highlights, Pocket, Roam imports — toate au această boală).

**Mitigare nu e UI mai bun. E inversare:** node creation ca side-effect al primului draft, nu prerequisite. User scrie un draft, agent zice "Văd că invoci ideea X — confirm să o salvez ca Pillar?". 5 candidate per session, nu 200 upfront.

Faber demonstrează asta empiric — `/faber-ingest` e guided, conversational, nu queue-based. Discuți takeaways înainte să creezi pagini. IPSE ar trebui să fure modelul, nu să-și păstreze approval queue-ul.

---

## 7. Cele trei opțiuni de implementare pentru IPSE

### Opțiunea A — IPSE construit independent, ca PRD-ul

Postgres + pgvector + tot ce zice PRD-ul. Multi-tenant from day one. Ignor complet Faber.

**Pro:** Clean slate. Niciun design constraint din existing.
**Con:** Reimplementezi 70% din ce Faber are deja gândit. Voice fingerprint statistic singur va eșua. Confrontation muscle nu va exista. Sources și syntheses vor lipsi din schema. Onboarding queue va omori adopția.

### Opțiunea B — IPSE construit pe filozofia Faber (în Postgres)

Postgres + pgvector + filozofie Faber-shaped (separare identity vs knowledge, voice_rules prescriptive, sources first-class, syntheses ca artefacte, snapshots-before-mutation, agent self-model, log integrity).

**Pro:** Best of both. SaaS-feasible. Toată învățarea din Faber portabilă.
**Con:** Tot trebuie să scrii multi-tenant infra de la zero. Faber-as-engine nu e folosit, doar conceptele.

### Opțiunea C — IPSE shell + Faber MCP server (recomandat)

```
┌──────────────────────────────────────────────────────────┐
│ IPSE SaaS (Postgres + Hono + Vite + Stripe)             │
│ - Multi-tenant ce e necesar: billing, X API tracking,   │
│   tweets cache, audience clusters, posting windows      │
│ - Authoring/Strategist/Reflector agents                  │
│ - X API integration + closed feedback loop              │
└────────────────┬─────────────────────────────────────────┘
                 │ MCP protocol
                 ▼
┌──────────────────────────────────────────────────────────┐
│ Faber MCP server (per-user, local-first)                │
│ - User's wiki: sources, concepts, entities, syntheses,  │
│   self/, agent/                                         │
│ - SQLite faber.db (sync from .md)                       │
│ - Tools exposed: query_graph, propose_node, voice_check,│
│   snapshot, mirror, get_active_self_context             │
│ - Markdown source of truth → user owns the artefact     │
└──────────────────────────────────────────────────────────┘
```

**Pro:**
- User owns the moat: graful e local files, exportabil prin definiție, git-versionable
- IPSE servs the loop: closed feedback, X API, multi-tenant infra — exact bucket-ul care chiar trebuie să fie SaaS
- Faber MCP e re-usable: same server lucrează cu Cursor, ChatGPT, alte tools (PRD §11 Phase 4 deja prevede asta)
- Switching cost e în loop-ul antrenat pe user's history, nu în lock-in pe graf
- Build incremental: faza 0-2 doar publishing/loop, faza 3+ adăugă Faber MCP

**Con:**
- Asume Faber MCP server există (nu există încă, deși Faber actualmente are toate datele necesare)
- Performance: MCP roundtrips la fiecare draft? Cache locally; or run Faber inside IPSE backend per user în mod transparent
- Onboarding: user trebuie să accept faza de seed local

**Recomandare:** **C**. Aliniat cu thesis-ul Skill Era (graful = skill encodat de user; IPSE = compound skill peste atomi Faber); aliniat cu thesis-ul Productize Yourself (judgment-ul user-ului în software user-ul controlează); aliniat cu Phase 4 din PRD (MCP era oricum acolo).

---

## 8. Recomandare operațională

### 8.1 Pentru Faber (acum)

**Sprintul "weighted Faber" — 1-2 zile.** Atomic:

1. Adaugă `page_relations.weight REAL DEFAULT 1.0`
2. Adaugă `self_alignment.intensity REAL DEFAULT 1.0`
3. Derive logic în `insert_relations` (co-citation + recency)
4. Trei views noi: `v_strong_relations`, `v_page_salience`, `v_stance_drift`
5. Bug fix: populare `self_pillars.evidence_events` din log scan + alignment join
6. Skip embeddings — măsoară FTS gap întâi (run `/faber-query` pe paraphrases și vezi ratări)

**Steal de la IPSE:**
- Anecdote ca tip — adaugă în `SCHEMA_SQL` la `CHECK(type IN ...)`. Move 2-3 stories existente din `concepts/` în `anecdotes/`.
- `nodes.status: dormant` analog — adaugă view `v_dormant_concepts` (concept neatins de 60+ zile) ca să stii ce să resurrect-ezi.

### 8.2 Pentru IPSE (înainte să scrii cod)

**Decide structural:** vrei B (filozofie Faber în Postgres) sau C (shell + Faber MCP)? Răspunsul determină schema phase 0.

Dacă **B**: împrumută din Faber:
- Sources cu key_claims first-class
- Syntheses cu maturity + filed-from-query trigger
- Voice rules table cu examples_yes/no PE LÂNGĂ statistical fingerprint
- Snapshots-before-mutation
- Confrontation skill design (`/voice-mirror`)
- Agent self-model table

Dacă **C**: faza 0 e Faber MCP server (Python wrapper peste existing `faber.db` + new MCP tool surface). Faza 1 e IPSE shell care call-uiește MCP.

**Killer mitigation pentru ambele:** node creation ca side-effect al primului draft, NU 200-item approval queue.

### 8.3 Pentru testarea thesisului IPSE

**Înainte de cod, testează pe Narcis cu Faber existing:**
- `/semnal-draft` deja folosește pillars + stances + voice_rules
- Adaugă manual atribuire post → pagini (vault page `workshop/x-queue/published/{date}-{slug}.md` cu frontmatter `invokes_concepts: [...]`)
- După 30 zile, query manual: care concepts apar des în posturi performante? Care în slabe?
- Dacă Narcis găsește valoare în asta, plausibly altul similar va plăti pentru automatizat.

**Costă:** 0$. Durează: 30 zile de hand-attribution.

---

## 9. Răspuns scurt la întrebările explicite

**Q: Care e mai bun?**
**A:** Eroare de categorie. Faber e personal compounder; IPSE e SaaS multi-tenant. Faber e mai *real* (există, e populat, e folosit zilnic). IPSE e mai *ambițios* dar nepopulat de date reale.

**Q: Ar putea Faber să fie mai bun ca graf orientat ponderat?**
**A:** Da, în 5 locuri concrete (alignment intensity, page_relations weight, page salience decay, stance confidence score, agent_heuristics confidence). Schimbare de schema ~30 LOC. Zero migration cost (drop-and-recreate). **Condiție: weights derived la sync, nu manually maintained în frontmatter.** Embeddings? Nu încă — măsoară gap FTS5 întâi.

**Q: IPSE ar fi mai bun implementat ca Faber?**
**A:** Da, ca *engine*. Nu ca SaaS. Cea mai bună implementare e **IPSE shell peste Faber MCP server** — multi-tenant infra în Postgres pentru billing/X API/closed loop, identity graph în per-user Faber files. User owns the moat (filele lui pe disk), IPSE owns the loop (cum se învață din metrics).

**Q: Concret, ce face Narcis acum?**
**A:**
1. Sprint weighted Faber — 1-2 zile, immediate.
2. Steal Anecdote tip de la IPSE — 30 minute schema + relocare 2-3 stories.
3. Testează thesis IPSE manual pe Narcis cu Faber existing — 30 zile hand-attribution. Cost $0.
4. **Dacă thesis IPSE valid empiric:** decide B vs C. Recomandat C.
5. Productize Faber separat — "personal compounder for Claude Code users" e un produs cu market mai mic decât IPSE dar mai aproape de ready (Faber e built, IPSE e PRD).

---

## 10. Apendix — schema diff pentru weighted Faber

```sql
-- ── ADITIONS la SCHEMA_SQL în faber_sync.py ────────────────

ALTER TABLE page_relations ADD COLUMN weight REAL DEFAULT 1.0;
ALTER TABLE self_alignment ADD COLUMN intensity REAL DEFAULT 1.0;

CREATE VIEW v_strong_relations AS
SELECT pr.from_slug, pr.to_slug, pr.relation_type, pr.weight,
       p1.title AS from_title, p2.title AS to_title
FROM page_relations pr
LEFT JOIN pages p1 ON p1.slug = pr.from_slug
LEFT JOIN pages p2 ON p2.slug = pr.to_slug
ORDER BY pr.weight DESC;

CREATE VIEW v_page_salience AS
SELECT
    p.slug, p.type, p.title,
    pa.last_touched,
    EXP(-(julianday('now') - julianday(COALESCE(pa.last_touched, p.created))) / 30.0)
        AS salience
FROM pages p
LEFT JOIN v_page_activity pa ON pa.slug = p.slug
WHERE p.type NOT IN ('meta')
ORDER BY salience DESC;

CREATE VIEW v_stance_drift AS
SELECT
    s.slug, s.on_topic, s.confidence AS declared_confidence,
    (CAST(julianday('now') - julianday(s.last_reaffirmed) AS INTEGER))
        AS days_since_reaffirmed,
    CASE
        WHEN s.last_reaffirmed IS NULL THEN 50
        WHEN julianday('now') - julianday(s.last_reaffirmed) <= 30 THEN 80
        WHEN julianday('now') - julianday(s.last_reaffirmed) <= 90 THEN 65
        ELSE 50
    END +
    COALESCE((SELECT COUNT(*) * 10 FROM self_alignment sa
              JOIN log_events le ON le.id = CAST(NULLIF(sa.source_event,'') AS INTEGER)
              WHERE sa.page_slug = s.slug AND sa.relation = 'reinforces'
                AND julianday('now') - julianday(le.event_date) <= 30), 0) -
    COALESCE((SELECT COUNT(*) * 20 FROM self_alignment sa
              JOIN log_events le ON le.id = CAST(NULLIF(sa.source_event,'') AS INTEGER)
              WHERE sa.page_slug = s.slug AND sa.relation = 'contradicts'
                AND julianday('now') - julianday(le.event_date) <= 30), 0)
        AS confidence_score
FROM self_stances s
WHERE s.status = 'active'
ORDER BY confidence_score ASC;  -- cele cu cel mai mic scor primele = candidate pentru meet
```

```python
# ── DERIVATION rule în insert_relations() ──────────────────

def compute_relation_weight(from_slug, to_slug, relation_type, conn):
    """Derived la sync. Combinație de co-citation + recency."""
    co_cite = conn.execute("""
        SELECT COUNT(*) FROM prose_wikilinks
        WHERE from_slug = ? AND target = ?
    """, (from_slug, to_slug)).fetchone()[0]

    weight = min(1.0, 0.5 + 0.1 * co_cite)  # base 0.5, +0.1 per co-citation, cap 1.0

    # Recency boost: dacă target a fost touched în ultimele 14 zile
    recent_touch = conn.execute("""
        SELECT MAX(le.event_date) FROM log_event_pages lep
        JOIN log_events le ON le.id = lep.event_id
        WHERE lep.page_slug = ?
    """, (to_slug,)).fetchone()[0]

    if recent_touch:
        days_since = (datetime.now() - datetime.fromisoformat(recent_touch)).days
        if days_since <= 14:
            weight = min(1.0, weight + 0.1)

    return round(weight, 3)
```

```python
# ── BUG FIX: populare self_pillars.evidence_events ─────────

def update_pillars_evidence_count(conn):
    """Run la finalul sync, după log_events + self_alignment populate."""
    conn.execute("""
        UPDATE self_pillars
        SET evidence_events = (
            SELECT COUNT(DISTINCT sa.source_event)
            FROM self_alignment sa
            WHERE sa.pillar_slug = self_pillars.slug
              AND sa.relation IN ('reinforces', 'weakens', 'contradicts')
        )
    """)
```

---

*Documentul ăsta e draft, propice pentru iterație. Maturity: developing. Confidence: medium-high pe analiza tehnică, medium pe recomandarea operațională (C peste B), low pe estimări de timp pentru IPSE.*

*Filed by Claude under `ultrathink-comparison` trigger. Aliniat cu pillar-ul `[[wiki/self/narcis-pillars#skill-era-craftsmanship]]` (graful = skill encodat) și stance-ul `[[wiki/self/narcis-stances#judgment-encodat--funcționalitate-mecanică]]`.*
