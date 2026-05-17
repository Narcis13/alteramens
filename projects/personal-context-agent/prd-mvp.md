---
title: "Personal Context Agent — PRD MVP v0.1"
project: personal-context-agent
status: mvp-draft
version: 0.1
created: 2026-05-17
authors: [Narcis Brindusescu, Claude]
horizon: 2-3 weekend-uri pentru MVP funcțional (demo loop), 4-6 weekend-uri pentru hardening
working_name: PCA (Personal Context Agent — codename, ne-ratificat)
stack: TypeScript + SQLite (local) + MCP TS SDK + `ctx` CLI
---

# Personal Context Agent — PRD MVP v0.1

> **Ce este acest document.** Specificația minimă a primei versiuni funcționale (MVP) — un MCP server TypeScript care expune Layer 1 (cele 6 tool-uri din [[wiki/syntheses/personal-context-agent|sinteza fondatoare]]) și un singur UI de capture: CLI (`ctx`). Tot ce e marcat **[Propunere]** e decizie de luat; **[Decis]** e blocat înainte de orice cod.
>
> **Ce nu este.** Nu e produs comercial, nu e multi-user, nu e cloud sync, nu e mobile, nu e API REST, nu e zero-knowledge encryption. Toate astea sunt **out of scope MVP** și apar în [[#13-out-of-scope-mvp|secțiunea 13]].
>
> **Ancore.** Sinteza fondatoare: [[wiki/syntheses/personal-context-agent|Personal Context Agent — Decompoziție filozofică & blueprint inițial]]. Modelul de straturi: [[wiki/concepts/twelve-layers-of-context|Twelve Layers of Context]]. Maparea entity-types: [[wiki/concepts/entity-types-to-layers-mapping|Entity Types ↔ Layers v0.2]]. Polaritatea inversă față de Faber: [[wiki/concepts/inverted-polarity-sister-system|Inverted Polarity Sister System]].

---

## 0. TL;DR

Construim **un singur binar TypeScript** care:
1. Pornește un **MCP server local (stdio transport)** ce expune 6 tool-uri ([[#7-functional-requirements-mcp-layer-1|secțiunea 7]]) către orice agent compatibil MCP (Claude Code, Claude Desktop, Cline, Zed, ...).
2. Pornește un **CLI de capture** (`ctx add`, `ctx list`, `ctx confirm`, ...) — singurul UI uman din MVP.
3. Persistă într-un singur fișier **SQLite local** (`~/.pca/store.db`), schema redusă la entity types absolut necesare ca demo-loop-ul să funcționeze.

**Demo-loop pe care MVP-ul îl validează:**

```
Narcis: ctx add "lucrez la admin spital Pitești dimineața, builder Alteramens după-amiaza"
Narcis: ctx add "obiectiv: 1K MRR Alteramens în 6 luni" --type goal
Narcis: ctx add "constraint: 08-15 ocupat de spital" --type constraint
Narcis: (în Claude Code) "Cum mă recomanzi să-mi structurez săptămâna?"
Claude: [apelează get_self_summary + list_active("goal") + list_active("constraint")]
Claude: răspuns ancorat în rol + goal + constraint — nu generic.
```

Dacă acest loop merge end-to-end fără friction, MVP-ul e validat. Restul (mobile, cloud, multi-user, encryption) e produs comercial, nu MVP.

---

## 1. Problema (MVP scope)

Sinteza fondatoare descrie problema generală pentru Personal Context Agent: agenții AI răspund generic pentru că nu au contextul utilizatorului. MVP-ul restrânge problema la **un singur use case**:

> **Eu, Narcis, am nevoie ca agenții pe care îi folosesc zilnic (Claude Code în primul rând, Claude Desktop secundar) să răspundă consistent ca și cum mă cunosc — fără să le re-explic de fiecare dată cine sunt, ce fac dimineața vs după-amiaza, ce obiective am, ce constrângeri.**

Sub-probleme rezolvate de MVP:

| Sub-problemă | Rezolvare MVP |
|---|---|
| Re-prompting plictisitor („sunt admin spital + builder...") | `get_self_summary()` returnează un punch-card consistent |
| Goal-uri uitate când întreb agentul „pe ce să mă focusez" | `list_active("goal")` returnează doar goal-urile active |
| Constraints nerespectate (sugestii care ignoră program de spital) | `list_active("constraint")` |
| Capture rapid de observații („e marți, am vorbit cu X despre Y") | `ctx add` din terminal, sub 3 secunde |
| Stale context (un goal a fost atins acum 2 luni dar e încă listat) | `confirm_entity` cu decision: still-true/no-longer-true/modify |

**Ce NU rezolvă MVP:** captura ambientală automată, mobile capture, cross-device sync, multi-agent observation conflicts, advanced retrieval/embeddings, voice/aesthetic layer, declared-vs-observed mirror. Toate sunt în roadmap post-MVP.

---

## 2. Viziune (one-liner)

> **Un binar TypeScript pe care îl pornești o dată, te capturi în 5 minute prin `ctx add`, și de atunci orice agent MCP-compatible răspunde ca și cum te știe — pentru că te citește.**

---

## 3. Wedge & non-goals

### 3.1 Wedge [Decis]

- **User zero:** Narcis Brindusescu (eu, builder-ul). Single-user, single-device.
- **Use case prim:** self-summary ancorat în Claude Code din vault-ul Alteramens.
- **Form factor capture:** CLI (`ctx`). Niciun alt UI.
- **Form factor server:** MCP stdio local. Nimic remote/cloud.
- **Stack:** TypeScript (Node 22+), SQLite via `better-sqlite3`, MCP via `@modelcontextprotocol/sdk` TS.
- **Persistență:** un singur fișier `~/.pca/store.db`. Niciun cloud, niciun sync, niciun cont.
- **Multi-agent:** writes de la Claude Code și Claude Desktop, ambele citind același DB local. Concurrent writes via SQLite WAL mode (suficient pentru 1 utilizator).

### 3.2 Non-goals (MVP)

NU livrăm în MVP — chiar dacă tentant:

1. **NU UI web/mobile/desktop GUI.** O singură interfață umană: CLI.
2. **NU sync cloud / multi-device.** Un singur fișier DB, un singur Mac.
3. **NU multi-user / multi-tenancy.** Hardcoded „I am Narcis".
4. **NU encryption at rest.** SQLite plain. (Disk-level FileVault e responsabilitatea sistemului.)
5. **NU REST API / HTTP transport pentru MCP.** Stdio only.
6. **NU all 12 entity types din v0.2.** MVP pornește cu 5 (vezi [[#8-data-model-schema-sqlite-mvp|secțiunea 8]]).
7. **NU embeddings / semantic search.** `get_relevant_context` folosește FTS5 + tag/type filter în MVP. Embeddings vin post-MVP.
8. **NU declared-vs-observed mirror.** Skill-ul `/ctx-mirror` e roadmap, nu MVP.
9. **NU import bulk din Obsidian / Apple Notes / etc.** Capture manuală only.
10. **NU MD export.** Vine în v0.2.
11. **NU auth / API keys / OAuth.** Local trust.
12. **NU advanced decay heuristics.** TTL fix per tip (vezi [[#8-data-model-schema-sqlite-mvp|secțiunea 8]]).

Fiecare item din lista de sus e o tentație clasică de scope-creep. Le numim aici ca să le respingem prin referință, nu prin discuție.

---

## 4. Audiență (MVP)

**User zero unic:** Narcis. Toate deciziile UX se calibrează după:
- Folosește Claude Code zilnic din `/Users/narcisbrindusescu/projects/alteramens`.
- Lucrează pe macOS (Darwin), shell `zsh`.
- Are deja Node + Claude Code instalate.
- Vorbește română pentru capture, engleză pentru cod.
- Tolerează friction tehnic mic dacă reduce timpul de capture sub 5 secunde.

**Out of scope MVP:** orice alt user. Validarea produsului pentru alți ICP se face post-MVP, după ce demo-loop-ul merge pentru mine.

---

## 5. User journeys (MVP)

Patru journey-uri, toate dintr-un terminal `zsh`:

### 5.1 Bootstrap (one-time, ~10 minute)

```bash
# 1. Instalare globală
npm install -g @alteramens/pca

# 2. Init DB la ~/.pca/store.db
pca init

# 3. Capture identity inițial
ctx add --type self "Narcis Brindusescu. Admin IT spital Pitești 08-15. Builder Alteramens după-amiaza. 51yo."
ctx add --type role "Admin IT spital — domeniu defensiv, status quo, 08-15"
ctx add --type role "Builder Alteramens — domeniu ofensiv, productize-yourself, după 15:00"
ctx add --type goal "1K MRR Alteramens în 6 luni" --expires 2026-11-17
ctx add --type constraint "08-15 ocupat de spital — no deep builder work"
ctx add --type stance "Bias pentru acțiune; iterații mici"

# 4. Conectare MCP la Claude Code (edit ~/.claude/mcp.json)
pca install-mcp claude-code
```

### 5.2 Capture rapid (recurent, ~3 secunde)

```bash
ctx add "Conversație cu Mihai despre admitere — el vrea biologie XI-XII complet în iulie"
# → Propune type, default: event. User Enter pentru confirm.
```

### 5.3 Confirmare / decay (săptămânal, ~5 minute)

```bash
ctx review --stale
# Listează tot ce expiră sau nu a fost atins în 30+ zile.
# Pentru fiecare: [s]till-true / [n]o-longer-true / [m]odify / skip
```

### 5.4 Inspecție (oricând)

```bash
ctx list --type goal
ctx show <id>
ctx summary  # echivalentul a ce vede agentul
```

---

## 6. Architecture overview (MVP)

```
┌──────────────────────────────────────────────────────────────┐
│  Claude Code / Claude Desktop  (MCP client)                  │
└─────────────────────────────┬────────────────────────────────┘
                              │ MCP stdio (JSON-RPC over stdin/stdout)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  pca-mcp-server  (TypeScript, Node 22+)                      │
│  - 6 tools: get_relevant_context, record_observation,        │
│    update_entity, confirm_entity, list_active,               │
│    get_self_summary                                          │
│  - shared core: src/core/store.ts                            │
└─────────────────────────────┬────────────────────────────────┘
                              │ better-sqlite3 (sync, in-process)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  ~/.pca/store.db  (SQLite, WAL mode, FTS5 enabled)           │
│  - entities, links, events, fts_entities, schema_migrations  │
└─────────────────────────────▲────────────────────────────────┘
                              │ same better-sqlite3 handle (separate process)
                              │
┌──────────────────────────────────────────────────────────────┐
│  ctx CLI  (TypeScript, Node 22+, citește/scrie same DB)      │
│  - subcomenzi: init, add, list, show, summary, review,       │
│    confirm, install-mcp                                      │
└──────────────────────────────────────────────────────────────┘
```

**Monorepo TypeScript** (pnpm workspaces sau npm workspaces):

```
pca/
├── packages/
│   ├── core/           # store, schema, migrations, queries (shared)
│   ├── mcp-server/     # binar pca-mcp-server (stdio)
│   ├── cli/            # binar ctx (capture UI)
│   └── shared-types/   # zod schemas, types comune
├── package.json
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

**Două binare publicate (sau un singur binar cu subcomenzi):**

- `pca` (admin: `init`, `install-mcp`, `migrate`, `doctor`)
- `ctx` (capture: `add`, `list`, `show`, `summary`, `review`, `confirm`)
- `pca-mcp-server` (invocat de MCP client, nu de user)

**[Propunere]:** unificare într-un singur binar `pca` cu subcomenzi (`pca add`, `pca mcp-server`). Avantaj: un singur install. Dezavantaj: `ctx add "..."` e mai natural decât `pca add "..."`.

---

## 7. Functional requirements — MCP Layer 1

Cele 6 tool-uri expuse via MCP. Toate sunt **prim-clasă în MVP** — niciuna nu e stub. Toate input-urile validate cu `zod`; toate output-urile JSON-serializable.

### 7.1 `get_self_summary(scope?)` — punch-card identity

**Purpose:** răspunde „cine e user-ul" coerent, pentru agentul fresh fără context.

**Input:**
```ts
{
  scope?: string  // 'general' (default) | 'project:X' | 'role:Y'
}
```

**Output:**
```ts
{
  self: { title: string, body: string, updated_at: string },
  active_roles: Array<{ id, title, body, scope }>,
  active_goals: Array<{ id, title, timeframe, expires_at }>,
  active_constraints: Array<{ id, title }>,
  recent_state?: { mood?, energy?, focus?, updated_at } | null,
  last_updated: string
}
```

**Behavior:** SELECT statice peste view-urile `v_current_self`, `v_active_roles`, `v_active_goals`, `v_active_constraints`. Dacă `scope='project:X'`, filtrează entitățile cu `scope='project:X'` sau `scope='general'`.

**Token budget:** ≤ 1500 tokens. Dacă depășește, trimite top-N per categorie cu indicator de truncare.

---

### 7.2 `get_relevant_context(query, max_items?)` — frame-problem retrieval

**Purpose:** întoarce subsetul de context relevant pentru un query în limbaj natural.

**Input:**
```ts
{
  query: string,
  max_items?: number,  // default 10
  types?: Array<'self'|'role'|'goal'|'constraint'|'state'|'stance'|'event'>
}
```

**Output:**
```ts
{
  items: Array<{
    id, type, title, body, scope, authority, confidence,
    relevance: number,  // 0..1
    why: string         // explanation 1-liner
  }>,
  total_matched: number,
  retrieval_strategy: 'fts5+type-filter'  // explicit pentru debugging
}
```

**Behavior MVP:** FTS5 match pe `title + body`, ranking BM25, filtru pe `type` dacă specificat, filtru implicit `status='active' AND (expires_at IS NULL OR expires_at > now())`.

**[Propunere] post-MVP:** embeddings (OpenAI text-embedding-3-small sau local `transformers.js`) pentru semantic match peste FTS5. Marcat explicit ca **NU în MVP** — FTS5 e suficient pentru demo-loop.

---

### 7.3 `record_observation(text, type?, source?)` — agentul observă ceva

**Purpose:** agent capturează în store ceva dedus din conversație („Narcis a zis că e obosit").

**Input:**
```ts
{
  text: string,
  type?: 'self'|'role'|'goal'|'constraint'|'state'|'stance'|'event',  // default 'event'
  source?: string,  // ex: 'claude-code:conversation-id-xyz'
  scope?: string,   // default 'general'
  expires_at?: string  // ISO 8601
}
```

**Output:**
```ts
{
  id: string,
  type: string,
  status: 'created' | 'updated',
  authority: 'observed'  // hardcoded: agent writes always 'observed'
}
```

**Behavior:** INSERT cu `authority='observed'`, `confidence='medium'`, `maturity='provisional'`. Eveniment înregistrat în `events` cu `actor=<MCP client name>`, `operation='observe'`.

**Guard:** dacă agentul încearcă să scrie `type='self'`, refuză cu eroare clară („self e singleton; folosește `update_entity` pe self existent"). Self este self-declared only.

---

### 7.4 `update_entity(id, changes)` — modificare directă

**Purpose:** orice agent sau user vrea să modifice o entitate existentă (title, body, attrs, status, expires_at).

**Input:**
```ts
{
  id: string,
  changes: {
    title?: string,
    body?: string,
    status?: 'active' | 'archived' | 'invalidated',
    expires_at?: string | null,
    attrs?: Record<string, unknown>
  }
}
```

**Output:**
```ts
{
  id: string,
  previous: { ...snapshot vechi },
  current: { ...snapshot nou },
  event_id: number
}
```

**Behavior:** UPDATE pe rândul curent + INSERT în `events` cu `operation='update'` + payload-ul delta. Authority pe rândul updated → cea a actor-ului (agent → observed; CLI → self-declared).

**Guard:** dacă `id` nu există → eroare clară. Dacă target are `authority='self-declared'` și actor e agent → permise modificările pe `attrs` și `body`, NU pe `title` (proxy pentru identitate declarată).

---

### 7.5 `confirm_entity(id, decision)` — decay re-validation

**Purpose:** răspunde la întrebarea „mai e adevărat că X?" — esențial pentru compounding fără noise.

**Input:**
```ts
{
  id: string,
  decision: 'still-true' | 'no-longer-true' | 'modify',
  modify?: { title?, body?, attrs? },  // doar dacă decision='modify'
  note?: string
}
```

**Output:**
```ts
{
  id: string,
  outcome: 'extended' | 'invalidated' | 'modified',
  new_expires_at?: string,
  event_id: number
}
```

**Behavior:**
- `still-true` → set `expires_at = now() + default_ttl(type)`, INSERT event `operation='confirm'`.
- `no-longer-true` → set `status='invalidated'`, `invalidated_at=now()`. Soft delete; rândul rămâne pentru istorie.
- `modify` → UPDATE cu valorile noi + extend TTL. Event `operation='confirm-modify'`.

**Default TTL per tip [Propunere]:**

| Type | TTL |
|---|---|
| `state` | 7 zile |
| `goal` | 90 zile |
| `role` | 180 zile |
| `constraint` | 180 zile |
| `stance` | nelimitat (manual confirm only) |
| `event` | nelimitat (istorie) |
| `self` | nelimitat |

---

### 7.6 `list_active(type)` — listare per tip

**Purpose:** retrieval cheap, indexed, pentru cazul standard „dă-mi toate goal-urile active".

**Input:**
```ts
{
  type: 'self'|'role'|'goal'|'constraint'|'state'|'stance'|'event',
  scope?: string,
  limit?: number  // default 50
}
```

**Output:**
```ts
{
  items: Array<{ id, title, body, scope, authority, confidence, expires_at, updated_at }>,
  count: number,
  type: string
}
```

**Behavior:** SELECT pe view-ul corespondent `v_active_<type>`. Ordonat după `updated_at DESC`.

---

## 8. Data model — Schema SQLite (MVP)

**Reducere vs synthesis v0.2:** păstrăm doar entity types absolut necesare pentru demo-loop. **5 tipuri active în MVP**: `self`, `role`, `goal`, `constraint`, `stance` + 2 utilitare: `state` (volatile, optional în MVP), `event` (auto-generat).

**NU sunt în MVP** (vin în v0.2): `person`, `place`, `knowledge`, `resource`, `preference`. Decizia: vezi [[wiki/concepts/entity-types-to-layers-mapping|entity-types-to-layers-mapping]] secțiunea „MVP slice".

### 8.1 DDL

```sql
-- Migration 0001 — initial schema

CREATE TABLE entities (
  id              TEXT PRIMARY KEY,           -- ulid (lexicographic, sortable)
  type            TEXT NOT NULL CHECK (type IN
                    ('self','role','goal','constraint','stance','state','event')),
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
  source_ref      TEXT,                       -- ex: 'cli', 'claude-code:conv-xyz', 'claude-desktop:msg-abc'
  attrs           JSON,                       -- type-specific extra fields (timeframe pe goal, mood pe state, etc.)
  created_at      TEXT NOT NULL,              -- ISO 8601
  updated_at      TEXT NOT NULL,
  expires_at      TEXT,                       -- ISO 8601, NULL = nu expiră
  invalidated_at  TEXT
);

CREATE INDEX idx_entities_type_status ON entities(type, status);
CREATE INDEX idx_entities_expires ON entities(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_entities_scope ON entities(scope);

-- Constraint: doar un singur 'self' active.
CREATE UNIQUE INDEX idx_self_singleton
  ON entities(type) WHERE type='self' AND status='active';

CREATE TABLE events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at   TEXT NOT NULL,
  actor         TEXT NOT NULL,            -- 'cli' | 'claude-code' | 'claude-desktop' | 'system'
  operation     TEXT NOT NULL
                  CHECK (operation IN ('create','update','observe','invalidate','confirm','confirm-modify','expire')),
  entity_id     TEXT REFERENCES entities(id),
  payload       JSON,
  source_ref    TEXT
);

CREATE INDEX idx_events_entity ON events(entity_id);
CREATE INDEX idx_events_actor_time ON events(actor, occurred_at DESC);

-- FTS5 full-text search peste title + body
CREATE VIRTUAL TABLE fts_entities USING fts5(
  title, body,
  content='entities',
  content_rowid='rowid'
);

-- Triggers pentru a menține FTS sincron
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

-- Schema versioning
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
INSERT INTO schema_migrations(version, applied_at) VALUES (1, datetime('now'));

-- Views
CREATE VIEW v_current_self AS
  SELECT * FROM entities WHERE type='self' AND status='active' LIMIT 1;

CREATE VIEW v_active_roles AS
  SELECT * FROM entities WHERE type='role' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_goals AS
  SELECT * FROM entities WHERE type='goal' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_constraints AS
  SELECT * FROM entities WHERE type='constraint' AND status='active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  ORDER BY updated_at DESC;

CREATE VIEW v_active_stances AS
  SELECT * FROM entities WHERE type='stance' AND status='active'
  ORDER BY updated_at DESC;

CREATE VIEW v_recent_state AS
  SELECT * FROM entities WHERE type='state' AND status='active'
  ORDER BY updated_at DESC LIMIT 1;

CREATE VIEW v_stale_entities AS
  SELECT * FROM entities WHERE status='active'
    AND ((expires_at IS NOT NULL AND expires_at < datetime('now'))
      OR (expires_at IS NULL AND julianday('now') - julianday(updated_at) > 30));
```

### 8.2 Decizii implicite

- **PRAGMA `journal_mode=WAL`** la deschidere — permite citiri concurente între CLI și MCP server.
- **PRAGMA `foreign_keys=ON`** — events.entity_id referențiat.
- **PRAGMA `synchronous=NORMAL`** — performanță decentă fără pierderi în caz de crash.
- **ULID pentru `id`** — sortable lexicographic, generabil fără collision check (`@kdrnp/ulidx` sau `ulidx` în npm).

### 8.3 attrs JSON per tip [Propunere]

```jsonc
// goal
{ "timeframe": "long|mid|short", "parent_id": "<id>"?, "success_criteria": "..."? }

// constraint
{ "kind": "time|ethical|legal|cognitive|capacity", "hard_or_soft": "hard|soft" }

// state
{ "mood": "...", "energy": "low|med|high", "focus": "..." }

// role
{ "schedule": "08-15 mon-fri" | string, "domain": "defensive|offensive" }

// stance
{ "reason": "...", "evidence_sources": ["..."] }
```

Schema attrs nu e validată la nivel SQL — validare la nivel TS prin zod în `packages/core/src/schemas/`.

---

## 9. MCP server — detalii implementare

### 9.1 Stack

- **`@modelcontextprotocol/sdk`** (TypeScript, latest) — server side.
- **`better-sqlite3`** — synchronous client, zero boilerplate.
- **`zod`** — input validation pentru toate tool-urile.
- **`ulidx`** — ID generation.

### 9.2 Transport

**Stdio only.** Servere MCP locale rulează ca subprocess pornit de MCP client (Claude Code, Claude Desktop). Comunicare prin stdin/stdout cu newline-delimited JSON-RPC.

**NU în MVP:** HTTP/SSE transport, WebSocket transport, remote MCP.

### 9.3 Lifecycle

```ts
// packages/mcp-server/src/index.ts (sketch)
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { openStore } from '@pca/core';

const store = openStore(process.env.PCA_DB ?? '~/.pca/store.db');
const server = new Server({ name: 'pca', version: '0.1.0' }, { capabilities: { tools: {} } });

// Register 6 tools (vezi secțiunea 7)
server.setRequestHandler(...);

await server.connect(new StdioServerTransport());
```

### 9.4 Install în Claude Code

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

**[Propunere]:** comanda `pca install-mcp claude-desktop` patches `~/Library/Application Support/Claude/claude_desktop_config.json` similar.

### 9.5 Logging & observability

- Toate tool calls logged în `events` table cu `actor=<MCP client>`, `operation=<tool name>`.
- Stderr log (file `~/.pca/logs/mcp-server.log`) pentru debugging — niciodată stdout, ar coruptui JSON-RPC.
- `pca doctor` rulează self-checks (DB writable, schema curentă, MCP config valid).

---

## 10. CLI `ctx` — UI de capture

### 10.1 Subcomenzi

```
ctx add <text> [--type TYPE] [--scope SCOPE] [--expires DATE] [--note NOTE]
ctx list [--type TYPE] [--scope SCOPE] [--limit N]
ctx show <id>
ctx summary [--scope SCOPE]
ctx review [--stale] [--type TYPE]
ctx confirm <id> [--still-true | --no-longer-true | --modify]
ctx help
```

### 10.2 Comportament `ctx add`

Dacă `--type` lipsește, propune tipul prin **heuristică simplă** (regex/keyword), NU LLM:

| Pattern în text | Type propus |
|---|---|
| „obiectiv", „target", „want to", „plan to" | goal |
| „nu pot", „nu vreau", „nu am voie", „limit" | constraint |
| „obosit", „energizat", „mood", „azi mă simt" | state |
| „cred că", „believe", „pentru mine X înseamnă" | stance |
| „sunt admin", „rolul meu", „job" | role |
| (default) | event |

User confirmă cu Enter sau override cu `n` → menu.

### 10.3 Interactive review (`ctx review --stale`)

```
[1/3] Goal — „Lansez landing page Personal Context Agent"
       expires_at: 2026-04-30 (acum 17 zile)
       [s]till-true / [n]o-longer-true / [m]odify / [k]eep stale / skip ?
```

### 10.4 Stack

- **`commander`** — argument parsing.
- **`@clack/prompts`** sau **`@inquirer/prompts`** — prompt UI interactive (review loop).
- **`picocolors`** — output coloured fără overhead.

### 10.5 Performanță

Target: `ctx add "..."` < 200ms wall-clock (cold start Node + SQLite write).

---

## 11. Demo / success criteria

**MVP e validat când toate următoarele sunt adevărate:**

1. ✅ Pe Mac-ul lui Narcis, `pca init && ctx add ...` funcționează fără edge cases vizibile timp de 7 zile consecutive.
2. ✅ MCP server-ul răspunde sub 50ms la `get_self_summary` cu un DB de 100 entitati.
3. ✅ În Claude Code, o întrebare gen „cum mă recomanzi să-mi structurez săptămâna" produce un răspuns care **citează măcar 2 entități** din store (verificabil prin events log: tool calls `get_self_summary` + `list_active('goal')`).
4. ✅ Demo-loop-ul end-to-end (capture → întreabă agentul → primește răspuns ancorat) durează sub 60 secunde din cold start.
5. ✅ `ctx review --stale` rulat săptămânal duce la cel puțin un `confirm` action în 4 săptămâni consecutive (proof că decay-ul nu e ornamental).

**Anti-success criteria** (semnale că MVP-ul e greșit):

- ❌ Narcis nu mai folosește `ctx add` după 2 săptămâni → friction prea mare sau valoare prea mică.
- ❌ Claude Code returnează răspunsuri identice cu/fără PCA conectat → store-ul nu informează agentul.
- ❌ DB-ul crește peste 100MB în prima lună → captura e inflaționară, nu disciplinată.

---

## 12. Risks & mitigations

| Risc | Probabilitate | Impact | Mitigare MVP |
|---|---|---|---|
| MCP TS SDK schimbă API în 0.x | medie | mediu | pin la versiune; expun `pca doctor` ca prim line de defense |
| Concurrent writes corup DB | mică | mare | WAL mode + retry on `SQLITE_BUSY` cu exponential backoff |
| FTS5 returnează irelevant pentru intent | medie | mediu | acceptă tradeoff în MVP; embeddings post-MVP |
| User uită să `confirm` → store stale | mare | mediu | `pca doctor` arată count entități stale; `ctx review --stale` ca obicei săptămânal |
| MCP client nu apelează tool-urile (LLM ignoră) | medie | mare | tool descriptions explicite + onboarding doc cu prompt-uri sample care obligă agent să apeleze |
| Schema migration pe DB existing | mică | mare | `schema_migrations` table + check la `openStore`; ref-uire DB înainte de migrate |
| Capture friction > 3s → abandonment | medie | mare | benchmark `ctx add` la fiecare PR; target sub 200ms |

---

## 13. Out of scope MVP

Re-iterare pentru claritate, organizată după valuri:

### Val 2 (post-MVP, post-validare demo-loop)
- Mobile/web UI (Next.js + PWA peste același store, sync via libsql)
- Skill `/ctx-mirror` (declared vs observed audit, async cu Faber events log)
- MD export
- Embeddings pentru `get_relevant_context`
- Cele 5 entity types restante (`person`, `place`, `knowledge`, `resource`, `preference`)
- Bulk import (Obsidian, Apple Notes)

### Val 3 (productizare)
- Multi-user / multi-tenancy
- Cloud sync (libsql/Turso, CRDT pentru collaboration)
- Encryption at-rest (client-side key, zero-knowledge opt-in)
- REST API + auth (API keys, OAuth)
- Sharing scopes (sub-context shared cu un agent / alt user)
- Hosted SaaS

### Val 4 (advanced)
- Multi-agent observation conflict resolution semantic
- Frame-problem retrieval cu intent classifier
- Captură ambientală (Rewind-style, opt-in)
- Right-to-be-forgotten cu tombstones + audit trail GDPR

---

## 14. Open questions (de rezolvat în primul weekend)

1. **Un binar sau două?** `pca` + `ctx` separat sau unificat (`pca add`, `pca mcp-server`)? Vot inițial: separat — `ctx` e gestul de zi cu zi, merită binar dedicat.
2. **`ctx` global install vs npx?** Global = friction zero recurent. NPX = friction zero la install. Vot inițial: global, cu fallback documentat la npx.
3. **DB path default** `~/.pca/store.db` vs `~/Library/Application Support/PCA/store.db` (macOS convention)? Vot inițial: `~/.pca/` — vizibil în `ls -la`, ușor de backup.
4. **TTL defaults — ok?** State 7d, Goal 90d, Role 180d, Constraint 180d. Calibrare în 4 săptămâni de uz, nu acum.
5. **Heuristica de type-propose pe `ctx add` — keyword sau LLM call?** Vot inițial: keyword pentru MVP (zero latency, zero cost). LLM-classification post-MVP.
6. **`scope='general'` vs `scope='project:alteramens'` ca default?** Vot inițial: general — la fel ca skill-urile Faber (CLAUDE.md general, project-specific opt-in).
7. **MCP tool descriptions — cât de prescriptive?** Trebuie să fie suficient de clare încât Claude/GPT să apeleze get_self_summary la conversation start fără prompt explicit. Calibrare empirică în primul weekend.

---

## 15. Roadmap (post-MVP, indicativ)

| Etapă | Conținut | Estimare |
|---|---|---|
| **MVP v0.1** | tot ce e în acest PRD | 2-3 weekend-uri |
| **v0.2** | Skill `/ctx-mirror`, MD export, `person` + `knowledge` entity types | 2 weekend-uri |
| **v0.3** | Embeddings retrieval, `place` + `resource` + `preference` | 2 weekend-uri |
| **v0.4 (productize-ready)** | Auth + multi-user + cloud sync (libsql) | 4-6 weekend-uri |
| **v0.5 (commercial)** | Hosted SaaS, encryption, web/mobile clients | 8-12 weekend-uri |

Decuplat de obiectivul 1K MRR Alteramens — PCA poate fi prim sau al doilea produs, decizie post-validare.

---

## 16. Cum se leagă de Alteramens

- **[[wiki/concepts/productize-yourself|Productize Yourself]] fit:** Construim întâi pentru Narcis (cea mai apropiată ICP testabilă). Demo-ul devine asset de marketing.
- **[[wiki/concepts/encoded-judgment|Skill Era]] fit:** Skills cu context = skills cu judgment. PCA e infrastructura peste care skill-urile devin „skills cu judgment", nu skills generice.
- **[[wiki/concepts/inverted-polarity-sister-system|Inverted polarity vs Faber]]:** Faber compound-ează knowledge despre lume; PCA compound-ează modelul utilizatorului. Reciclăm ~70% din pattern-uri (maturity, decay, append-only events).
- **[[wiki/syntheses/personal-context-agent|Sinteză fondatoare]]:** acest PRD e materializarea "Partea XI — Next steps", punctul 2 (#spec) și punctul 3 (#build prototype).

---

## 17. Next steps (concrete, acționabile)

1. **Validare PRD** — citește documentul, marchează **[Propunere]** → **[Decis]** sau **[Respins]** pentru fiecare deschidere. Decideri locked înainte de orice cod.
2. **Bootstrap repo** — `pnpm create` în `/Users/narcisbrindusescu/projects/alteramens/projects/personal-context-agent/code/`, monorepo cu cele 3 packages.
3. **Spike #1 — MCP echo** — `pca-mcp-server` care expune un singur tool (`get_self_summary` hardcoded) și se conectează la Claude Code. Target: 2 ore.
4. **Spike #2 — `ctx add` + DB write** — CLI cu o singură subcomandă. Target: 2 ore.
5. **Spike #3 — demo-loop end-to-end** — concept-bridge între cele două spike-uri. Target: 1 zi.
6. **Iterație #1** — implementare completă a celor 6 tools, schema completă, view-uri, CLI subcomenzi toate. Target: 1 weekend.
7. **Iterație #2** — `ctx review --stale`, decay enforcement, performance benchmarks, doctor command. Target: 1 weekend.
8. **Live test 7 zile** — eu folosesc PCA zilnic, log issues în [[projects/personal-context-agent/learnings|learnings.md]] (de creat).

---

**Status:** mvp-draft v0.1. Foundation. Următorul pas natural: review acest document și răspuns la cele 7 open questions din [[#14-open-questions-de-rezolvat-in-primul-weekend|secțiunea 14]] înainte de orice linie de cod.
