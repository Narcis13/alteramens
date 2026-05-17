---
title: "Personal Context Agent — PRD MVP v0.3"
project: personal-context-agent
status: mvp-locked
version: 0.3
created: 2026-05-17
updated: 2026-05-17
authors: [Narcis Brindusescu, Claude]
horizon: 2-3 weekend-uri pentru MVP funcțional (demo loop), 4-6 weekend-uri pentru hardening
working_name: PCA (Personal Context Agent — codename, ne-ratificat)
stack: TypeScript + SQLite (local) + MCP TS SDK + `/ctx-add` Claude Code skill + read-only `ctx` CLI
changelog:
  v0.3 (2026-05-17): Major refactor — toate cele 12 entity types din synthesis v0.2 + capture mutat de pe CLI pe `/ctx-add` Claude Code skill (elimină API key în CLI).
  v0.2 (2026-05-17): Lock pe cele 7 open questions. Q5 deviation — LLM classification.
  v0.1 (2026-05-17): Initial draft.
---

# Personal Context Agent — PRD MVP v0.3

> **Ce este acest document.** Specificația MVP a Personal Context Agent — un MCP server TypeScript care expune Layer 1 (6 tool-uri) către orice agent MCP-compatible, schema cu **toate cele 12 entity types** din synthesis v0.2, și o **Claude Code skill `/ctx-add`** ca singur UI de capture. PRD locked — toate deciziile arhitecturale blocate înainte de cod.
>
> **Ce nu este.** Nu e produs comercial, nu e multi-user, nu e cloud sync, nu e mobile, nu e API REST, nu e zero-knowledge encryption.
>
> **Două shift-uri vs v0.2:**
> 1. **12 entity types** (nu 5) — toate cele din [[wiki/syntheses/personal-context-agent#partea-vii-blueprint-architectural-iniial|sinteză Partea VII]] și [[wiki/concepts/entity-types-to-layers-mapping|entity-types-to-layers-mapping]] v0.2.
> 2. **Capture via Claude Code skill `/ctx-add`** (nu CLI `ctx add` cu API key). Skill-ul rulează în Claude Code, folosește LLM-ul existent pentru clasificare, apoi apelează MCP tool `record_observation`. **Zero API key în CLI.**
>
> **Ancore.** [[wiki/syntheses/personal-context-agent|Sinteza fondatoare]]. [[wiki/concepts/twelve-layers-of-context|Twelve Layers of Context]]. [[wiki/concepts/entity-types-to-layers-mapping|Entity Types ↔ Layers v0.2]]. [[wiki/concepts/inverted-polarity-sister-system|Inverted Polarity vs Faber]].

---

## 0. TL;DR

Construim **un sistem cu trei artefacte**:
1. **MCP server TypeScript** (binar `pca-mcp-server`) — stdio transport, 6 tool-uri Layer 1, fără LLM, fără API key, fără rețea.
2. **`/ctx-add` Claude Code skill** — singur UI de capture. Skill-ul folosește LLM-ul din Claude Code pentru clasificare, apoi apelează MCP tool `record_observation`. Skill-ul trăiește la `.claude/skills/ctx-add/SKILL.md` (project-scoped) sau `~/.claude/skills/ctx-add/SKILL.md` (user-scoped).
3. **`ctx` CLI read-only** (binar `ctx`) — `list`, `show`, `summary`, `review`, `confirm`. **Nu** `add`. Plus `pca` binar pentru admin (`init`, `install-mcp`, `doctor`).

**Toate 12 entity types din v0.2 prim-clasă:** `self`, `place`, `goal`, `knowledge`, `person`, `resource`, `constraint`, `state`, `event`, `preference`, `stance`, `role`. Plus 5 transversale primitives: `link`, `annotation`, `tag`, `source`, `project`.

**Demo-loop pe care MVP-ul îl validează:**

```
Narcis (în Claude Code): /ctx-add lucrez la admin spital Pitești dimineața, builder Alteramens după-amiaza
Skill: [LLM reasoning] → propune type=role, attrs={schedule: "08-15", domain: "defensive"}
Skill: confirm cu user → call MCP tool record_observation(text, type='role', attrs)
Narcis (în Claude Code): /ctx-add obiectiv: 1K MRR Alteramens în 6 luni
Skill: → type=goal, attrs={timeframe: "mid"}, expires_at=+90d → record_observation
Narcis: "Cum mă recomanzi să-mi structurez săptămâna?"
Claude: [apelează automat get_self_summary + list_active("goal") + list_active("constraint")]
Claude: răspuns ancorat în identitate + roluri + goals + constraints — nu generic.
```

---

## 1. Problema (MVP scope)

> **Eu, Narcis, am nevoie ca agenții pe care îi folosesc zilnic (Claude Code în primul rând, Claude Desktop secundar) să răspundă consistent ca și cum mă cunosc — fără să le re-explic de fiecare dată cine sunt, ce fac dimineața vs după-amiaza, ce obiective am, ce constrângeri, ce locuri îmi schimbă starea, cine contează din relațiile mele, ce resurse am la dispoziție, ce gusturi am.**

Sub-probleme rezolvate de MVP:

| Sub-problemă | Layer | Rezolvare MVP |
|---|---|---|
| Re-prompting plictisitor („sunt admin spital + builder...") | 1 Identity | `get_self_summary()` |
| Sugestii care ignoră programul de spital | 8 Constraints | `list_active('constraint')` |
| Goal-uri uitate sau stale | 4 Goals | `list_active('goal')` + decay |
| Răspuns generic care nu știe că sunt obosit dimineața | 9 State | `list_active('state')` cu TTL scurt |
| Nu recunoaște persoane recurente (Mihai = fiu, fiecare context diferit) | 6 Relational | `list_active('person')` |
| Recomandări fără să știe ce skills am | 5 Knowledge | `list_active('knowledge')` |
| Nu folosește tools/subscriptions pe care le am | 7 Resources | `list_active('resource')` |
| Voice/aesthetic generic | 11 Aesthetic | `list_active('preference')` |
| Răspuns argumentat la nivelul greșit (evidence vs convingere) | 12 Epistemic | `list_active('stance')` |
| Capture rapid din Claude Code | — | `/ctx-add` skill |
| Stale entități | — | `confirm_entity` + `ctx review --stale` |

---

## 2. Viziune (one-liner)

> **Un MCP server local și o skill `/ctx-add` în Claude Code. Capturezi în limbaj natural, skill-ul clasifică prin LLM-ul deja activ, datele stau într-un SQLite local cu schema completă pentru cele 12 straturi de context. Orice agent MCP-compatible îți răspunde ancorat — nu generic.**

---

## 3. Wedge & non-goals

### 3.1 Wedge [Decis v0.3]

- **User zero:** Narcis Brindusescu. Single-user, single-device, macOS.
- **Use case prim:** `get_self_summary` + `list_active` ancorează răspunsurile Claude Code din vault-ul Alteramens.
- **Capture UI unic:** `/ctx-add` Claude Code skill. Singura intrare scrisă în store.
- **CLI:** `ctx` (read-only) + `pca` (admin). Niciun `ctx add`.
- **MCP transport:** stdio local.
- **Stack:** TypeScript (Node 22+), SQLite via `better-sqlite3`, MCP via `@modelcontextprotocol/sdk` TS.
- **Persistență:** un fișier `~/.pca/store.db`.
- **Entity types:** toate 12 prime-clasă, plus 5 primitive transversale.
- **Zero API key în CLI sau MCP server.** LLM-ul rulează în Claude Code (deja activ).

### 3.2 Non-goals (MVP)

NU livrăm:

1. **NU UI web/mobile/desktop GUI.**
2. **NU sync cloud / multi-device.**
3. **NU multi-user / multi-tenancy.**
4. **NU encryption at rest** (FileVault e responsabilitatea OS-ului).
5. **NU REST API / HTTP transport pentru MCP.**
6. **NU embeddings / semantic search** — FTS5 + filtre tipizate.
7. **NU skill `/ctx-mirror`** (declared-vs-observed audit) — roadmap.
8. **NU import bulk din Obsidian / Apple Notes.**
9. **NU MD export.**
10. **NU auth.**
11. **NU `ctx add` în CLI** — capture only via Claude Code skill.
12. **NU API key în CLI sau MCP server.**

---

## 4. Audiență (MVP)

User zero: Narcis. Detalii ca în v0.2 — macOS Darwin, zsh, Claude Code instalat, lucrează din `/Users/narcisbrindusescu/projects/alteramens`. Restul ICP — post-MVP.

---

## 5. User journeys (MVP)

### 5.1 Bootstrap (one-time, ~15 minute)

```bash
# 1. Install global
npm install -g @alteramens/pca

# 2. Init DB
pca init                      # creates ~/.pca/store.db with schema v1

# 3. Install skill în user-scope (.claude/skills global)
pca install-skill ctx-add     # copiază skill la ~/.claude/skills/ctx-add/SKILL.md

# 4. Conectează MCP la Claude Code
pca install-mcp claude-code   # patches ~/.claude/mcp.json

# 5. Verifică
pca doctor                    # checks: DB, MCP config, skill install, schema version
```

### 5.2 Capture (recurent, în Claude Code)

```
> /ctx-add lucrez la admin spital Pitești dimineața, builder Alteramens după-amiaza

Skill analyzes the text...
Proposed:
  Type: role
  Title: "Admin IT spital Pitești (dimineața) + Builder Alteramens (după-amiaza)"
  Attrs: { schedule: "08-15 mon-fri", domain: "mixed" }
  Authority: self-declared
  Confidence: high
  Reasoning: present-tense activity + schedule pattern + dual role identification

Accept? [Y/n/edit/split]
> Y

✓ Saved as role (id: 01HX...)
```

### 5.3 Auto-classify cu propunere de split

```
> /ctx-add Mihai (fiul meu, 18 ani) se pregătește pentru admitere la UMF Carol Davila iulie 2027

Skill analyzes...
Proposed split (2 entities):
  1. person: "Mihai Brindusescu" — { relation: "family/son", importance: "high" }
  2. event: "Mihai prepares for UMF Carol Davila admission" — { related_person: "Mihai", deadline: "2027-07" }

Accept all? [Y / n / pick]
> Y

✓ Saved 2 entities + 1 link (person → event: subject-of)
```

### 5.4 Read (în terminal sau Claude Code)

```bash
# Terminal
ctx list goal
ctx show 01HX...
ctx summary
ctx review --stale

# Sau în Claude Code (via MCP tool calls automat):
> What goals do I have active?
Claude: [calls list_active('goal')]
       → 1. 1K MRR Alteramens — mid, expires 2026-08-17
       → 2. ...
```

### 5.5 Confirmare / decay (săptămânal)

```bash
ctx review --stale

[1/4] goal — "Lansez landing page PCA"
       expires_at: 2026-04-30 (acum 17 zile)
       [s]till-true / [n]o-longer-true / [m]odify / [k]eep stale / skip ?
```

---

## 6. Architecture overview (MVP)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Claude Code  (user types /ctx-add ... and other prompts)            │
│                                                                       │
│   ┌────────────────────────────┐                                     │
│   │  /ctx-add SKILL.md          │  (LLM reasoning happens here,      │
│   │  - reads input text         │   no external API needed)          │
│   │  - proposes type+attrs+TTL  │                                     │
│   │  - confirms with user       │                                     │
│   │  - calls MCP tool below ────┼───┐                                 │
│   └────────────────────────────┘   │                                 │
│                                     │                                 │
│   Claude (during any conversation)  │                                 │
│   automatically calls MCP tools ────┤                                 │
│                                     │                                 │
└─────────────────────────────────────┼─────────────────────────────────┘
                                      │ MCP stdio (JSON-RPC)
                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│  pca-mcp-server  (TypeScript, NO LLM, NO API key)                    │
│  Tools: get_relevant_context, record_observation, update_entity,     │
│         confirm_entity, list_active, get_self_summary                │
└─────────────────────────────────────┬────────────────────────────────┘
                                      │ better-sqlite3 (sync, in-process)
                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ~/.pca/store.db  (SQLite, WAL mode, FTS5)                           │
│  Entity types (12): self, place, goal, knowledge, person, resource,  │
│    constraint, state, event, preference, stance, role                │
│  Primitives (5): link, annotation, tag, source, project              │
└─────────────────────────────────────▲────────────────────────────────┘
                                      │ same DB handle (different process)
                                      │
┌──────────────────────────────────────────────────────────────────────┐
│  ctx CLI  (read-only: list, show, summary, review, confirm)          │
│  pca CLI  (admin: init, install-mcp, install-skill, doctor, migrate) │
└──────────────────────────────────────────────────────────────────────┘
```

**Monorepo TypeScript** (pnpm workspaces):

```
pca/
├── packages/
│   ├── core/                          # shared store, schema, queries, zod schemas
│   │   └── src/
│   │       ├── store.ts               # openStore, transactions
│   │       ├── schema/migrations/0001_initial.sql
│   │       ├── entities/
│   │       │   ├── self.ts            # type-specific helpers + zod
│   │       │   ├── place.ts
│   │       │   ├── goal.ts
│   │       │   ├── knowledge.ts
│   │       │   ├── person.ts
│   │       │   ├── resource.ts
│   │       │   ├── constraint.ts
│   │       │   ├── state.ts
│   │       │   ├── event.ts
│   │       │   ├── preference.ts
│   │       │   ├── stance.ts
│   │       │   └── role.ts
│   │       └── primitives/
│   │           ├── link.ts
│   │           ├── annotation.ts
│   │           ├── tag.ts
│   │           ├── source.ts
│   │           └── project.ts
│   ├── mcp-server/                    # pca-mcp-server binary
│   │   └── src/
│   │       ├── index.ts               # stdio bootstrap
│   │       └── tools/                 # 6 tools, one file each
│   ├── cli/                           # ctx + pca binaries
│   │   └── src/
│   │       ├── ctx.ts                 # read-only: list/show/summary/review/confirm
│   │       └── pca.ts                 # admin: init/install-mcp/install-skill/doctor
│   ├── skill-ctx-add/                 # the Claude Code skill (markdown + bash helpers)
│   │   ├── SKILL.md
│   │   └── classify-examples.md       # few-shot examples for the skill
│   └── shared-types/                  # zod schemas, types comune
├── package.json
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

**Trei artefacte distribuite:**
- `pca` binary (admin)
- `ctx` binary (read-only)
- `pca-mcp-server` binary (invocat de MCP client)
- `SKILL.md` instalat în `~/.claude/skills/ctx-add/` (copied de `pca install-skill`)

---

## 7. Functional requirements — MCP Layer 1 (6 tools)

Toate 6 tool-urile pe schema completă (12 entity types). Toate input/output validate cu `zod`.

### 7.1 `get_self_summary(scope?)` — punch-card identity

**Input:**
```ts
{ scope?: string }  // 'general' default | 'project:X' | 'role:Y'
```

**Output:**
```ts
{
  self: { title, body, attrs: { pillars, voice_rules, narrative }, updated_at } | null,
  active_roles: Role[],
  active_goals: Goal[],
  active_constraints: Constraint[],
  recent_state: State | null,
  top_people: Person[],          // importance='high', limit 5
  active_stances: Stance[],
  active_preferences: Preference[],
  resources_summary: { count, sample: Resource[] },     // doar count + 3 sample
  knowledge_summary: { count, sample: Knowledge[] },
  places_summary: { count, sample: Place[] },
  last_updated: string
}
```

**Behavior:** SELECT peste view-uri (`v_current_self`, `v_active_roles`, etc.). Tot agregat într-un singur tool call.

**Token budget:** ≤ 2500 tokens. Sample-uri trunchiate la 3-5 items per categorie cu indicator de truncare.

---

### 7.2 `get_relevant_context(query, max_items?, types?)`

**Input:**
```ts
{
  query: string,
  max_items?: number,    // default 10
  types?: Array<EntityType>,   // filter, dacă specificat
  scope?: string
}
```

**Output:**
```ts
{
  items: Array<{ id, type, title, body, attrs, scope, authority, confidence, expires_at, relevance, why }>,
  total_matched: number,
  retrieval_strategy: 'fts5+type-filter'
}
```

**Behavior:** FTS5 match pe `title + body`, BM25 ranking, filtre `status='active'` și TTL. Cu `types` filter, restrânge la subset. Returnează `attrs` complet pentru type-specific reasoning în client.

---

### 7.3 `record_observation(text, type?, attrs?, source?, scope?, expires_at?)`

**Input:**
```ts
{
  text: string,                    // title + body inline (skill split-uiește înainte)
  type?: EntityType,               // dacă lipsește: 'event' default
  attrs?: Record<string, unknown>, // type-specific
  source?: string,                 // 'claude-code:ctx-add' | 'claude-code:conv-id' | 'cli'
  scope?: string,                  // 'general' default
  expires_at?: string,             // ISO 8601, override pe TTL default
  authority?: 'self-declared' | 'observed' | 'inferred'   // default 'observed' pentru agent calls
}
```

**Output:**
```ts
{
  id: string,
  type: EntityType,
  status: 'created',
  authority: string,
  expires_at: string | null,
  applied_default_ttl: boolean
}
```

**Behavior:** INSERT cu validare zod pe `attrs` per tip. Eveniment în `events` cu `actor=<MCP client>`, `operation='observe'`.

**Guards:**
- `type='self'` permis doar dacă nu există self deja active (singleton). Altfel eroare: „Self already exists. Use update_entity to modify."
- `attrs` validate cu zod per tip; eroare clară dacă schema-ul nu match.
- Dacă `authority='self-declared'` + actor != 'cli' + actor != 'claude-code:ctx-add' → downgrade la `observed` cu warning în event payload (only the skill + user CLI may write self-declared).

---

### 7.4 `update_entity(id, changes)`

**Input:**
```ts
{
  id: string,
  changes: {
    title?, body?, attrs?, status?: 'active'|'archived'|'invalidated',
    expires_at?: string | null, scope?
  }
}
```

**Output:**
```ts
{ id, previous: snapshot, current: snapshot, event_id }
```

**Behavior:** UPDATE + event log. Authority pe entitate stays as-is decât dacă target era `observed/inferred` și actor face self-declared change.

**Guards:**
- Dacă entitate are `authority='self-declared'` și actor e agent → permite update pe `attrs` și `body`, **nu** pe `title`.
- Validare zod pe `attrs` dacă schimbat.

---

### 7.5 `confirm_entity(id, decision, modify?, note?)`

**Input:**
```ts
{
  id: string,
  decision: 'still-true' | 'no-longer-true' | 'modify',
  modify?: { title?, body?, attrs? },
  note?: string
}
```

**Output:**
```ts
{ id, outcome: 'extended'|'invalidated'|'modified', new_expires_at?, event_id }
```

**Behavior:**
- `still-true` → `expires_at = now() + default_ttl(type)`, event `confirm`.
- `no-longer-true` → `status='invalidated'`, `invalidated_at=now()`, event `invalidate`.
- `modify` → UPDATE + extend TTL, event `confirm-modify`.

---

### 7.6 `list_active(type, scope?, limit?)`

**Input:**
```ts
{
  type: EntityType,        // any of 12
  scope?: string,
  limit?: number           // default 50
}
```

**Output:**
```ts
{ items: Entity[], count, type }
```

**Behavior:** SELECT pe view-ul corespondent (`v_active_<type>`). Ordonat `updated_at DESC`.

---

## 8. Data model — Schema SQLite (MVP, all 12 types)

### 8.1 Entity types complete

| # | Type | Layer | TTL default | Singleton? | attrs shape |
|---|---|---|---|---|---|
| 1 | `self` | 1 Identity | ∞ | ✅ | `{ pillars: string[], voice_rules: string[], narrative: string }` |
| 2 | `place` | 3 Spatial | ∞ | — | `{ kind: 'physical'\|'digital'\|'social', address?: string, recurring?: boolean }` |
| 3 | `goal` | 4 Goals | 90d | — | `{ timeframe: 'long'\|'mid'\|'short', parent_id?: string, success_criteria?: string }` |
| 4 | `knowledge` | 5 Knowledge | ∞ (manual confirm) | — | `{ domain: string, depth: 'novice'\|'practitioner'\|'expert', gaps?: string[] }` |
| 5 | `person` | 6 Relational | ∞ | — | `{ relation: string, importance: 'high'\|'med'\|'low', tags?: string[] }` |
| 6 | `resource` | 7 Resources | 180d | — | `{ kind: 'tool'\|'subscription'\|'asset'\|'access'\|'budget', cost_per_month?: number }` |
| 7 | `constraint` | 8 Constraints | 180d | — | `{ kind: 'time'\|'ethical'\|'legal'\|'cognitive'\|'capacity', hard_or_soft: 'hard'\|'soft' }` |
| 8 | `state` | 9 State | 7d | — | `{ mood?, energy?: 'low'\|'med'\|'high', focus?, stress?, place_id?: string }` |
| 9 | `event` | 10 History | ∞ | — | `{ related_entity_ids?: string[] }` |
| 10 | `preference` | 11 Aesthetic | ∞ | — | `{ register: 'voice'\|'aesthetic'\|'taste', strength?: 'mild'\|'strong' }` |
| 11 | `stance` | 12 Epistemic | ∞ | — | `{ reason: string, evidence_sources?: string[] }` |
| 12 | `role` | cross-cutting | 180d | — | `{ schedule?: string, domain?: 'defensive'\|'offensive'\|'mixed', priority?: number }` |

### 8.2 Transversale primitives (separate tables, NOT entity types)

| Primitive | Table | Purpose |
|---|---|---|
| `link` | `links` | Relație tipizată între două entități (self↔role, role↔project, person↔event, ...) |
| `annotation` | `annotations` | Note libere atașate la orice entity |
| `tag` | `tags` + `entity_tags` | Categorizare liberă (kebab-case slugs) |
| `source` | `sources` + `entity_sources` | Citation pentru orice entity (conversation_id, URL, file) |
| `project` | `projects` | Scope-container (apare ca `scope='project:X'` pe entități) |

### 8.3 DDL (Migration 0001)

```sql
-- ENTITY MAIN TABLE
CREATE TABLE entities (
  id              TEXT PRIMARY KEY,           -- ulid
  type            TEXT NOT NULL CHECK (type IN (
                    'self','place','goal','knowledge','person','resource',
                    'constraint','state','event','preference','stance','role'
                  )),
  title           TEXT NOT NULL,
  body            TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','archived','invalidated')),
  authority       TEXT NOT NULL
                    CHECK (authority IN ('self-declared','observed','inferred')),
  confidence      TEXT NOT NULL DEFAULT 'medium'
                    CHECK (confidence IN ('low','medium','high')),
  maturity        TEXT NOT NULL DEFAULT 'provisional'
                    CHECK (maturity IN ('provisional','working','load-bearing')),
  scope           TEXT NOT NULL DEFAULT 'general',
  source_ref      TEXT,
  attrs           JSON,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  expires_at      TEXT,
  invalidated_at  TEXT
);

CREATE INDEX idx_entities_type_status ON entities(type, status);
CREATE INDEX idx_entities_expires ON entities(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_entities_scope ON entities(scope);
CREATE INDEX idx_entities_updated ON entities(updated_at DESC);

-- Singleton constraint pe Self
CREATE UNIQUE INDEX idx_self_singleton
  ON entities(type) WHERE type='self' AND status='active';

-- EVENTS (append-only history)
CREATE TABLE events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at   TEXT NOT NULL,
  actor         TEXT NOT NULL,
  operation     TEXT NOT NULL
                  CHECK (operation IN ('create','update','observe','invalidate','confirm','confirm-modify','expire','link','annotate','tag','source')),
  entity_id     TEXT REFERENCES entities(id),
  link_id       TEXT,
  annotation_id TEXT,
  payload       JSON,
  source_ref    TEXT
);
CREATE INDEX idx_events_entity ON events(entity_id);
CREATE INDEX idx_events_actor_time ON events(actor, occurred_at DESC);

-- LINKS (typed relations between entities)
CREATE TABLE links (
  id          TEXT PRIMARY KEY,
  src_id      TEXT NOT NULL REFERENCES entities(id),
  dst_id      TEXT NOT NULL REFERENCES entities(id),
  relation    TEXT NOT NULL,   -- 'works-with', 'parent-of', 'subject-of', 'located-at', ...
  weight      REAL DEFAULT 1.0,
  authority   TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  invalidated_at TEXT
);
CREATE INDEX idx_links_src ON links(src_id);
CREATE INDEX idx_links_dst ON links(dst_id);
CREATE INDEX idx_links_relation ON links(relation);

-- ANNOTATIONS (free notes on any entity)
CREATE TABLE annotations (
  id          TEXT PRIMARY KEY,
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  body        TEXT NOT NULL,
  authority   TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_annotations_entity ON annotations(entity_id);

-- TAGS (free categorization)
CREATE TABLE tags (
  slug        TEXT PRIMARY KEY,             -- kebab-case
  description TEXT
);
CREATE TABLE entity_tags (
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  tag_slug    TEXT NOT NULL REFERENCES tags(slug),
  PRIMARY KEY (entity_id, tag_slug)
);

-- SOURCES (citations: conversation_id, URL, file path)
CREATE TABLE sources (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('conversation','url','file','other')),
  identifier  TEXT NOT NULL,                -- conv-id / URL / file path
  excerpt     TEXT,
  created_at  TEXT NOT NULL
);
CREATE TABLE entity_sources (
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  source_id   TEXT NOT NULL REFERENCES sources(id),
  PRIMARY KEY (entity_id, source_id)
);

-- PROJECTS (scope container)
CREATE TABLE projects (
  slug        TEXT PRIMARY KEY,             -- 'alteramens', 'pca', ...
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at  TEXT NOT NULL
);

-- FTS5 over entities (title + body)
CREATE VIRTUAL TABLE fts_entities USING fts5(
  title, body, content='entities', content_rowid='rowid'
);
CREATE TRIGGER entities_ai AFTER INSERT ON entities BEGIN
  INSERT INTO fts_entities(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;
CREATE TRIGGER entities_ad AFTER DELETE ON entities BEGIN
  INSERT INTO fts_entities(fts_entities, rowid, title, body) VALUES('delete', old.rowid, old.title, old.body);
END;
CREATE TRIGGER entities_au AFTER UPDATE ON entities BEGIN
  INSERT INTO fts_entities(fts_entities, rowid, title, body) VALUES('delete', old.rowid, old.title, old.body);
  INSERT INTO fts_entities(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;

-- Schema migrations
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
INSERT INTO schema_migrations(version, applied_at) VALUES (1, datetime('now'));

-- VIEWS (one per active type, plus utility)
CREATE VIEW v_current_self AS
  SELECT * FROM entities WHERE type='self' AND status='active' LIMIT 1;

-- Generic active-per-type view template:
-- (in code we generate these for: place, goal, knowledge, person, resource,
--  constraint, state, event, preference, stance, role)
CREATE VIEW v_active_places AS SELECT * FROM entities
  WHERE type='place' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_goals AS SELECT * FROM entities
  WHERE type='goal' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_knowledge AS SELECT * FROM entities
  WHERE type='knowledge' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_persons AS SELECT * FROM entities
  WHERE type='person' AND status='active'
  ORDER BY json_extract(attrs,'$.importance') DESC, updated_at DESC;

CREATE VIEW v_active_resources AS SELECT * FROM entities
  WHERE type='resource' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_constraints AS SELECT * FROM entities
  WHERE type='constraint' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_states AS SELECT * FROM entities
  WHERE type='state' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC LIMIT 5;

CREATE VIEW v_recent_state AS SELECT * FROM v_active_states LIMIT 1;

CREATE VIEW v_active_events AS SELECT * FROM entities
  WHERE type='event' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_preferences AS SELECT * FROM entities
  WHERE type='preference' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_stances AS SELECT * FROM entities
  WHERE type='stance' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_active_roles AS SELECT * FROM entities
  WHERE type='role' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_stale_entities AS SELECT * FROM entities
  WHERE status='active'
    AND ((expires_at IS NOT NULL AND expires_at < datetime('now'))
      OR (expires_at IS NULL AND julianday('now') - julianday(updated_at) > 90));
```

### 8.4 PRAGMAs (set la openStore)

- `journal_mode=WAL` — concurrent readers
- `foreign_keys=ON`
- `synchronous=NORMAL`
- `busy_timeout=5000`

---

## 9. `/ctx-add` Claude Code skill — spec completă

### 9.1 Locație

- **Install target:** `~/.claude/skills/ctx-add/SKILL.md` (user-scoped, disponibil din orice proiect).
- **Source-of-truth:** `packages/skill-ctx-add/SKILL.md` în monorepo.
- **Install method:** `pca install-skill ctx-add` copiază SKILL.md la `~/.claude/skills/ctx-add/`.

### 9.2 SKILL.md format (sketch)

```markdown
---
name: ctx-add
composition_level: molecule
description: |
  Capture an observation into the Personal Context Agent store, with automatic
  classification across the 12 context layers (self, place, goal, knowledge,
  person, resource, constraint, state, event, preference, stance, role).
  Use when the user types /ctx-add followed by raw text, or says "capture this
  to context", "ține minte că", "remember that I...".
---

# /ctx-add — Personal Context Agent capture

You are the capture handler for the Personal Context Agent. The user gives you
raw text; you classify it into one of the 12 entity types, extract type-specific
attrs, and call the MCP tool `record_observation` to persist it.

## Step 1 — Read context

Check that the MCP server `pca` is connected. If not, instruct user to run
`pca install-mcp claude-code` and retry.

## Step 2 — Classify

Read the input text. Decide the entity type using the table below (full schema
in `~/.pca/docs/entity-types.md`):

[table of 12 types with anchor question + examples per type]

If the text contains multiple distinct facts, propose a **split** into multiple
entities + the links between them.

## Step 3 — Extract attrs

Per chosen type, fill the attrs schema:

[per-type attrs schema with examples]

Default authority: `self-declared` if user wrote it as a fact about themselves,
`observed` if you inferred it from context. Default confidence: `high` if
explicit, `medium` if interpretation, `low` if uncertain.

## Step 4 — Confirm

Show the user:
- Type (with reasoning 1-liner)
- Title (≤ 80 chars)
- Attrs (formatted)
- Suggested TTL (from default per type)
- Detected links to existing entities (if any)

Ask: `Accept? [Y/n/edit/split]`

## Step 5 — Persist

Call MCP tool `record_observation` with the structured payload.
If split: multiple `record_observation` calls + link creation via... [link
flow defined below].

## Step 6 — Confirmation message

Tell the user what was saved with the new entity id(s).

## Edge cases

- Self type: only one allowed. If exists, propose `update_entity` instead.
- Empty input: prompt the user for what to capture.
- Multi-language: classify in any language; titles in user's language; attrs
  enum values in English (canonical).
- Reject if user input looks like a question (`?` at end + no claim) — that's a
  query, not a capture.
```

### 9.3 Token cost

Skill runs entirely inside Claude Code conversation — uses tokens of current
context window. Typical cost per `/ctx-add` invocation: ~500-1500 tokens
(classification reasoning + confirmation flow). **No external API key required.**

### 9.4 Failure modes

- MCP server not connected → skill aborts with clear instruction.
- `record_observation` returns error (singleton conflict, validation fail) → skill shows error + asks user how to proceed.
- User says „no" la confirm → skill doesn't persist anything.

### 9.5 Alternative invocation triggers

Skill description includes these triggers (Claude will auto-route):
- `/ctx-add ...`
- „capture this to context"
- „ține minte că ..."
- „remember that I ..."
- „save to PCA ..."

---

## 10. `ctx` CLI (read-only) + `pca` CLI (admin)

### 10.1 `ctx` subcomenzi (NO `add`)

```
ctx list <type> [--scope SCOPE] [--limit N] [--stale]
ctx show <id>
ctx summary [--scope SCOPE]
ctx review [--stale] [--type TYPE]
ctx confirm <id> [--still-true | --no-longer-true | --modify]
ctx export [--format json|md] [--output FILE]   # post-MVP optional
ctx help
```

**Performance target:** < 100ms per command (cold start Node + SQLite read).

### 10.2 `pca` subcomenzi (admin)

```
pca init                            # create ~/.pca/store.db
pca install-mcp [client]            # patches MCP config (claude-code, claude-desktop)
pca install-skill <name>            # copies skill from package to ~/.claude/skills/
pca migrate                         # run pending schema migrations
pca doctor                          # health checks
pca version
```

**`pca doctor` checks:**
- `~/.pca/store.db` exists, writable, schema version current
- `~/.claude/mcp.json` has `pca` server configured
- `~/.claude/skills/ctx-add/SKILL.md` exists
- `pca-mcp-server` binary is in PATH
- 0 stale entities count vs > 0 (warn if accumulated)

### 10.3 Stack

- **`commander`** — argument parsing
- **`@inquirer/prompts`** — interactive review loop
- **`picocolors`** — colored output
- **`ulidx`** — ID generation
- **`zod`** — schema validation

---

## 11. MCP server — detalii implementare

### 11.1 Stack

- **`@modelcontextprotocol/sdk`** — TypeScript SDK (latest stable)
- **`better-sqlite3`** — sync DB client
- **`zod`** — input validation
- **`ulidx`** — ID generation

### 11.2 Transport

Stdio only.

### 11.3 Install în Claude Code

`pca install-mcp claude-code` patches `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "pca": {
      "command": "pca-mcp-server",
      "env": { "PCA_DB": "/Users/narcisbrindusescu/.pca/store.db" }
    }
  }
}
```

### 11.4 Tool descriptions (prescriptive, locked v0.2 Q7)

Examples:

**`get_self_summary`:**
> Returns a structured summary of the user's identity, active roles, goals,
> constraints, recent state, top people, active stances and preferences.
> **IMPORTANT: Call this at the start of any conversation where you need to
> give the user personalized advice, recommendations, or planning suggestions.**
> Cheap (~10ms), idempotent. Always call before generating opinionated content
> about the user's work, schedule, or decisions.

**`list_active`:**
> Returns all active entities of a given type for the user. Use when you need a
> specific slice (e.g., all current goals, all current constraints, recent
> state). Cheaper and more targeted than `get_self_summary` when you only need
> one dimension.

### 11.5 Logging

- All tool calls logged to `events` table.
- Stderr only for technical logs (never stdout — corrupts JSON-RPC).
- `~/.pca/logs/mcp-server.log` rotated daily.

---

## 12. Demo / success criteria

MVP e validat când TOATE sunt true:

1. ✅ `pca init && pca install-skill ctx-add && pca install-mcp claude-code && pca doctor` rulează curat pe Mac-ul lui Narcis.
2. ✅ În Claude Code, `/ctx-add lucrez la admin spital Pitești ...` clasifică corect ca `role` și creează entitate în <5 sec end-to-end.
3. ✅ După capture-uri pentru toate 12 layers (10-15 entități), o întrebare gen „cum mă recomanzi să-mi structurez săptămâna" în Claude Code produce răspuns care citează **≥ 5 entități din ≥ 3 tipuri diferite** (verificabil via events log).
4. ✅ `get_self_summary` returnează sub 100ms cu DB de 100 entități.
5. ✅ `ctx review --stale` rulat săptămânal duce la ≥ 1 confirm action în 4 săptămâni consecutive.
6. ✅ Niciun API key necesar pentru `pca`/`ctx`/`pca-mcp-server`. Skill-ul folosește doar tokens-ul Claude Code curent.
7. ✅ Zero crashes în 7 zile de uz zilnic.

**Anti-success criteria:**

- ❌ `/ctx-add` clasifică consistent wrong (>30% override la confirm) → skill prompt necesită rework.
- ❌ Skill nu poate vorbi cu MCP server-ul → install flow broken.
- ❌ DB peste 50MB în prima lună → capture inflaționară.
- ❌ Narcis nu folosește `/ctx-add` după 2 săptămâni → friction sau valoare insuficientă.

---

## 13. Risks & mitigations

| Risc | P | Impact | Mitigare |
|---|---|---|---|
| MCP TS SDK API instabil (0.x) | medie | mediu | pin la versiune; `pca doctor` verifică compatibility |
| Concurrent writes corup DB | mică | mare | WAL + busy_timeout=5s + retry pe SQLITE_BUSY |
| Skill clasifică wrong consistent | medie | mare | few-shot examples în SKILL.md; iterare după prima săptămână |
| Skill nu e invocat (Claude nu detectează) | medie | mare | descriere prescriptivă cu multe triggers; `composition_level: molecule` |
| FTS5 returnează irelevant | medie | mediu | acceptăm; embeddings post-MVP |
| User uită `ctx review` → store stale | mare | mediu | `pca doctor` arată count stale; weekly review prompt în Claude Code |
| LLM client ignoră MCP tools (LLM bug) | mică | mare | tool descriptions prescriptive (Q7 locked); fallback `ctx summary` în terminal |
| Schema migration breaking pe DB existing | mică | mare | `schema_migrations` table + backup auto înainte de migrate |
| Skill split de date complexe ratează linkurile | medie | mediu | acceptăm; user poate face link manual via `ctx` (post-MVP) |
| 12 entity types overwhelm (user confuz) | medie | mediu | onboarding doc + few-shot la prima utilizare |

---

## 14. Out of scope MVP

### Val 2 (post-MVP, post-validare demo-loop)
- Skill `/ctx-mirror` — declared vs observed audit
- Skill `/ctx-link` — manual link creation
- Skill `/ctx-query` — search wrapper peste `get_relevant_context`
- `ctx export --format md` — markdown backup
- Bulk import (Obsidian, Apple Notes)
- Embeddings retrieval

### Val 3 (productizare)
- Multi-user / multi-tenancy
- Cloud sync (libsql/Turso)
- Encryption at-rest
- REST API + auth
- Mobile/web clients
- Sharing scopes

### Val 4 (advanced)
- Multi-agent conflict resolution semantic
- Captură ambientală (Rewind-style opt-in)
- GDPR right-to-be-forgotten cu audit trail
- Frame-problem retrieval cu intent classifier

---

## 15. Open questions (LOCKED v0.3)

Toate cele 7 din v0.2 rămân locked. Două noi din v0.3:

1. **Q1 [Decis] — Două binare:** `pca` + `ctx`.
2. **Q2 [Decis] — Global npm install.**
3. **Q3 [Decis] — DB path `~/.pca/store.db`.**
4. **Q4 [Decis] — TTL defaults:** State 7d, Goal 90d, Role/Constraint 180d, Resource 180d, Stance/Preference/Knowledge/Person/Place/Self/Event ∞.
5. **Q5 [REVIZUIT v0.3] — Classification location:** **mutat din CLI în Claude Code skill `/ctx-add`**. Zero API key în CLI/MCP server. Skill folosește LLM-ul Claude Code curent.
6. **Q6 [Decis] — Scope default `general`.**
7. **Q7 [Decis] — Tool descriptions prescriptive.**
8. **Q8 [NEW v0.3, Decis] — All 12 entity types prim-clasă în MVP.** Reducerea la 5 din v0.2 e abandonată. Schema completă din start.
9. **Q9 [NEW v0.3, Decis] — Skill location:** user-scoped (`~/.claude/skills/ctx-add/`), nu project-scoped. Funcționează din orice proiect.

---

## 16. Roadmap (post-MVP)

| Etapă | Conținut | Estimare |
|---|---|---|
| **MVP v0.1** | acest PRD | 2-3 weekend-uri |
| **v0.2** | `/ctx-mirror`, `/ctx-link`, `ctx export` | 2 weekend-uri |
| **v0.3** | embeddings retrieval, performance hardening | 2 weekend-uri |
| **v0.4 productize-ready** | auth + multi-user + cloud sync | 4-6 weekend-uri |
| **v0.5 commercial** | hosted SaaS, encryption, web/mobile | 8-12 weekend-uri |

---

## 17. Cum se leagă de Alteramens

- **[[wiki/concepts/productize-yourself|Productize Yourself]]:** Build for yourself first; productize after demo-loop validates.
- **[[wiki/concepts/encoded-judgment|Skill Era]]:** PCA = infrastructura peste care skills devin „skills cu context", nu funcții generice. `/ctx-add` în sine e un skill exemplificator pentru pattern-ul Alteramens.
- **[[wiki/concepts/inverted-polarity-sister-system|Inverted polarity vs Faber]]:** Faber = knowledge despre lume (MD source-of-truth); PCA = knowledge despre user (SQLite source-of-truth).

---

## 18. Next steps (concrete, acționabile)

1. **Validare PRD v0.3** — citește, semnalează deviații sau dubii. Locked = locked înainte de cod.
2. **Bootstrap monorepo** — `pnpm` workspace în `projects/personal-context-agent/code/`, 4 packages (core, mcp-server, cli, skill-ctx-add).
3. **Spike #1 — schema + view-uri (1 zi).** `packages/core/src/store.ts` + `0001_initial.sql` + smoke test toate 12 entity types se pot crea + view-uri merg.
4. **Spike #2 — MCP server cu 2 tools (1 zi).** `get_self_summary` + `record_observation`. Conectat la Claude Code. Tool call manual din conversație.
5. **Spike #3 — `/ctx-add` skill v0 (1 zi).** SKILL.md cu classification table; testare pe 10 capture-uri reale.
6. **Iterație #1 — toate 6 tools + restul CLI subcomenzi (1 weekend).**
7. **Iterație #2 — `pca doctor`, install-skill, install-mcp, migrate (1 weekend).**
8. **Iterație #3 — skill polishing pe baza primei săptămâni de uz real (1 weekend).**
9. **Live test 7 zile** — daily use, log în `learnings.md` (de creat).

---

**Status:** mvp-locked v0.3. Foundation completă pentru execuție. Următorul pas natural: bootstrap monorepo.
