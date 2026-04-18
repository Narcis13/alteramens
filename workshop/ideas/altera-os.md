---
type: idee
status: spec
tags:
  - idee
  - os
  - ai-native
  - multi-tenant
  - monorepo
  - altera-os
date: 2026-04-18
monetizare: B2B SaaS (future) + internal hospital tool (now)
potential: high
complexitate: high
version: "1.0"
name: altera-os
description: AI-orchestrated modular OS unifying docraftr, glyphrail, takt, bunbase, robun, faber
timeline: 6 months (3 phases)
target_goal: 1K MRR by Jul 2026
---

# Altera OS — Spec & Implementation Plan

> **"Ca un Microsoft Access dar AI-native, cu module loose-coupled orchestrate de un agent."**

Un OS personal/enterprise care unifică 6 proiecte Alteramens existente (**docraftr, glyphrail, takt, bunbase, robun, faber**) într-o singură platformă multi-tenant, operată conversational de un agent AI (**robun** la runtime, **Claude Code** la dev-time), cu o singură bază de date SQLite și ingest inteligent de documente în format EAV care se promovează dinamic la scheme structurate.

**Context fondator:** Primul deploy este la spitalul din Pitești (server intranet), pentru workflow-uri reale precum **raportul trimestrial multidisciplinar** (financiar + statistică medicală + logistică) — care devine MVP-ul. După validare la spital, platforma e productizată ca SaaS B2B.

---

## 1. Vision & Fundament

### 1.1 Filozofie aplicată

Altera OS este o concretizare directă a tezei **Skill Era + Productize Yourself**:

- **Skill Era**: Modulele expun CLI + API + MCP tools. Agentul (robun) invocă skills care compun capabilities în workflow-uri. Judgment-ul (cum ingerăm un document, cum promovăm EAV → schema, când trimitem la cloud vs local) e encodat în skills, nu hardcoded.
- **Specific Knowledge**: Domeniu cunoscut (IT spital + development patterns RO). Validatori CUI/CNP/IBAN sunt deja în docraftr. Use case-urile spitalului sunt specifice și validate de realitate.
- **Leverage**: O DB schema → HTTP + CLI + Agent + Chat. Un document JSON docraftr → HTML + PDF + agent tool. O ingestare → EAV + wiki + structured (când e stabil).
- **Compounding**: Wiki faber acumulează. Schema promotions devin templates. Skills se compun.

### 1.2 Positioning

| | **Microsoft Access** | **Altera OS** |
|---|---|---|
| Paradigma | Forms + Reports + Tables | Forms + Reports + Tables + **Agent** |
| Schema | Fixed, definită upfront | EAV first → structured promotion dinamic |
| Ingest | Manual data entry | Multi-format cu AI classification |
| Query | SQL / Query Designer | SQL + Natural Language + FTS + Wiki |
| Automatizare | Macros + VBA | Event bus + Triggers + Glyphrail workflows + Agent skills |
| Deploy | Desktop file | Single binary (`bun build --compile`) |
| Multi-user | File locking | Multi-tenant HTTP + WS + SSE |
| Extensibility | VBA | Skills (markdown), Tools (TS), MCP servers |

### 1.3 Target users (progresiv)

1. **Narcis @ Spital Pitești** — power user unic, validator, driver al use case-urilor
2. **Colegi spital (2-10)** — angajați care fac ingest, completează formulare, primesc rapoarte
3. **Alte spitale / SMB-uri RO** (luna 4-6) — tenants SaaS
4. **International SMB** (post-1K MRR) — tenants SaaS după localization

---

## 2. Constraints & Decizii

Toate deciziile confirmate cu Narcis în discuția 2026-04-18:

| # | Decizie | Valoare | Implicații |
|---|---|---|---|
| D1 | **Deployment** | Server intranet spital acum → SaaS multi-tenant ulterior | `tenant_id` everywhere, Docker-ready, single-instance multi-tenant |
| D2 | **Integrare proiecte** | Monorepo fresh, pull code util | Fresh `/altera-os` repo; preluăm porțiunile curate, rescriem glue |
| D3 | **Orchestrator** | Dual: Robun runtime + Claude Code dev-time | Robun = agent loop autonomous (chat, scheduled); Claude Code = admin/build (rapoarte noi, migrări, debugging) |
| D4 | **Data model** | Hibrid: EAV first + structured promotion dinamic | Un tabel EAV flexibil; agentul sugerează promovare la colecție structurată when pattern is stable |
| D5 | **First use case** | Raport trimestrial multidisciplinar | Exercită ingest + EAV + faber + docraftr + sanitization + workflow |
| D6 | **UI** | Dual: Admin UI + chat embedded | React 19 dashboard + chat panel persistent (robun) |
| D7 | **AI policy** | Cloud cu sanitization layer | PII detection + token replacement înainte de orice cloud call |
| D8 | **Faber role** | Portat în Bun, DB unificată | `faber_sync.py` → TypeScript; wiki pages live în `altera.db` |
| D9 | **Name** | **Altera OS** | Package: `altera`, binary: `altera`, repo: `github.com/Narcis13/altera-os` |
| D10 | **Timeline** | Full platform 6 luni (3 faze) | Aliniat cu goal 1K MRR (Ian-Iul 2026) |
| D11 | **Auth** | Local JWT (ca BunBase) + `tenant_id` | Multi-tenant ready, 0 infra extra |
| D12 | **Schema promotion** | Agent sugerează background, user confirmă dashboard | Nightly analyzer → `schema_suggestions` table → admin UI review |

---

## 3. Target Architecture

### 3.1 High-Level Diagram

```
                ┌─────────────────────────────────────────┐
                │           ALTERA OS (Bun monorepo)       │
                └─────────────────────────────────────────┘
                                    │
     ┌──────────────────────────────┼──────────────────────────────┐
     │                              │                              │
┌────▼──────┐              ┌────────▼─────────┐           ┌────────▼─────┐
│ ADMIN UI  │              │  CHAT INTERFACE  │           │     CLI      │
│ (React 19)│              │ (Robun + web WS) │           │  (altera)    │
└────┬──────┘              └────────┬─────────┘           └────────┬─────┘
     │                              │                              │
     └──────────────────────────────┼──────────────────────────────┘
                                    │
                   ┌────────────────▼─────────────────┐
                   │    HTTP GATEWAY (Hono + WS/SSE)  │
                   │    Auth (JWT) + tenant resolver  │
                   └────────────────┬─────────────────┘
                                    │
     ┌───────────┬──────────────┬───┼──────────────┬──────────────┐
     │           │              │   │              │              │
┌────▼────┐ ┌───▼────┐ ┌───────▼───▼───┐ ┌───────▼────┐ ┌────────▼─────┐
│ DOCS    │ │ TASKS  │ │   WIKI       │ │ INGEST     │ │ COLLECTIONS  │
│(docraftr│ │(takt)  │ │  (faber)     │ │ PIPELINE   │ │ (BunBase     │
│         │ │        │ │              │ │            │ │  schema-in-db)│
└────┬────┘ └───┬────┘ └──────┬───────┘ └─────┬──────┘ └──────┬───────┘
     │          │             │                │               │
     └──────────┴─────────────┼────────────────┴───────────────┘
                              │
              ┌───────────────▼────────────────┐
              │    AGENT RUNTIME (robun port)  │
              │  Skills + Tools + Memory + LLM │
              └───────────────┬────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │ WORKFLOW ENGINE (glyphrail)    │
              │  Deterministic orchestration   │
              └───────────────┬────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │  SANITIZATION LAYER (PII)      │
              │  Detect → Tokenize → Reverse   │
              └───────────────┬────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │   EVENT BUS (takt pattern)     │
              │   Cross-module pub/sub         │
              └───────────────┬────────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │        UNIFIED SQLITE (altera.db)        │
         │  + WAL mode, tenant_id everywhere       │
         │  + FTS5 on prose/attributes              │
         │  + Drizzle ORM (migrations)              │
         └──────────────────────────────────────────┘
```

### 3.2 Monorepo Structure

```
altera-os/
├── apps/
│   ├── altera-server/              # Main HTTP + WS server
│   │   ├── src/
│   │   │   ├── index.ts            # Bun.serve entry
│   │   │   ├── routes/             # Hono routes per module
│   │   │   ├── middleware/         # Auth, tenant, CORS, logging
│   │   │   └── realtime/           # SSE + WS managers
│   │   └── package.json
│   ├── altera-admin/               # React 19 admin UI
│   │   ├── src/
│   │   │   ├── pages/              # Dashboard, Ingest, Forms, Tasks, Wiki
│   │   │   ├── chat/               # Embedded chat panel (robun)
│   │   │   ├── components/         # Shared (reused from Loom)
│   │   │   └── api.ts              # HTTP client
│   │   └── package.json
│   └── altera-cli/                 # Unified `altera` CLI binary
│       ├── src/
│       │   ├── bin.ts              # Entry (chmod +x)
│       │   ├── commands/           # auth, ingest, docs, tasks, wiki, agent
│       │   └── config.ts           # ~/.altera/config.json
│       └── package.json
├── packages/
│   ├── @altera/core/               # Shared types, Zod schemas, constants
│   ├── @altera/db/                 # SQLite + Drizzle + migrations + tenant scope
│   ├── @altera/auth/               # JWT, users, sessions, middleware
│   ├── @altera/events/             # Event bus (cross-module)
│   ├── @altera/ingest/             # Multi-format parsers (PDF/DOCX/XLSX/CSV/MD/TXT)
│   ├── @altera/sanitize/           # PII detection + tokenize + reverse
│   ├── @altera/eav/                # EAV engine (entities, attributes, FTS)
│   ├── @altera/collections/        # Schema-in-db (from BunBase)
│   ├── @altera/docs/               # docraftr (forms/reports engine)
│   ├── @altera/tasks/              # takt (boards, cards, triggers)
│   ├── @altera/wiki/               # faber (ported to TS)
│   ├── @altera/flows/              # glyphrail (workflow engine)
│   ├── @altera/agent/              # robun (agent loop, providers, skills)
│   ├── @altera/loom/               # Loom UI (vendored)
│   └── @altera/validators/         # CUI/CNP/IBAN (from docraftr)
├── skills/                         # Agent skills (markdown + frontmatter)
│   ├── ingest-document.md
│   ├── classify-document.md
│   ├── extract-kpis.md
│   ├── sanitize-pii.md
│   ├── generate-form.md
│   ├── generate-report.md
│   ├── query-knowledge.md
│   ├── promote-schema.md
│   ├── schedule-task.md
│   └── create-trigger.md
├── workflows/                      # Glyphrail workflows
│   ├── quarterly-report.yaml
│   ├── ingest-pipeline.yaml
│   └── schema-promotion.yaml
├── migrations/                     # Drizzle migrations
│   ├── 0000_init.sql
│   ├── 0001_add_eav.sql
│   └── ...
├── seeds/                          # Seed data (dev + demo)
├── docs/
│   ├── architecture.md
│   ├── adrs/                       # Architecture Decision Records
│   └── deploy.md
├── scripts/
│   ├── build-binary.ts             # bun build --compile
│   ├── dev.ts                      # Dev orchestrator (server + admin HMR)
│   └── migrate.ts
├── .env.example
├── bunfig.toml
├── package.json                    # Bun workspaces root
├── CLAUDE.md                       # Dev guide for Claude Code
└── README.md
```

### 3.3 Module responsibilities

| Package | Rol | Pull from | Changes |
|---|---|---|---|
| `@altera/core` | Types, Zod, constants | — | Nou |
| `@altera/db` | SQLite + Drizzle + tenant scope | docraftr/src/db/ | Generalize schema, unify |
| `@altera/auth` | JWT, users, sessions | bunbase/src/auth/ | Simplify, tenant-aware |
| `@altera/events` | Typed event bus + subscribers | takt/src/src/event-bus.ts | Generalize event types |
| `@altera/ingest` | Multi-format parsers | — (new) | Uses `pdf-parse`, `mammoth`, `xlsx`, `csv-parse` |
| `@altera/sanitize` | PII detection + tokenize | — (new, CRITICAL) | Regex + optional NER local |
| `@altera/eav` | EAV storage + FTS | — (new) | Entity/Attribute model + FTS5 |
| `@altera/collections` | Schema-in-db | bunbase/src/core/ | Collection → runtime table |
| `@altera/docs` | Document engine | docraftr/src/ (most) | Ported + multi-tenant enforced |
| `@altera/tasks` | Kanban + triggers | takt/src/ | Ported, event bus unified |
| `@altera/wiki` | Faber (TS port) | wiki/faber_sync.py | Rewrite in TS, unify DB |
| `@altera/flows` | Workflow engine | glyphrail/src/ | Full port, add Claude adapter |
| `@altera/agent` | Agent loop + tools | robun/src/ | Port agent/, tools/, skills/; drop 7 of 9 channels |
| `@altera/loom` | UI design system | docraftr/vendor/loom/ | Vendored |
| `@altera/validators` | CUI/CNP/IBAN | docraftr/src/validators/ | As-is |

---

## 4. Unified Data Model

Un singur fișier SQLite (`altera.db`) cu WAL mode. Toate tabelele au `tenant_id` pentru multi-tenant isolation. Drizzle ORM pentru schema + migrations.

### 4.1 Core infrastructure tables

```typescript
// Tenants (hospital = 1 tenant; SaaS = N)
tenants         (id, name, slug, settings_json, created_at)

// Users + auth
users           (id, tenant_id, username, email, password_hash, role, created_at)
// role: 'admin' | 'user' | 'agent'
sessions        (id, user_id, token_hash, expires_at, ip, user_agent)

// Audit log (cine ce a făcut)
audit_log       (id, tenant_id, user_id, action, resource_type, resource_id,
                 before_json, after_json, created_at)

// Files (uploaded documents — input pentru ingest)
files           (id, tenant_id, user_id, name, mime_type, size_bytes,
                 storage_path, hash_sha256, uploaded_at)
```

### 4.2 Ingest + EAV (flexible schema)

```typescript
// Entitățile ingestate — un rând per document/entitate
entities        (id, tenant_id, entity_type, name, source_file_id,
                 status, classification_confidence, ingested_at)
// entity_type: 'invoice', 'protocol', 'monthly_report', 'patient_note', …
// status: 'raw' | 'classified' | 'structured' | 'archived'

// Attributele (triplete EAV)
attributes      (id, tenant_id, entity_id, key, value_text, value_number,
                 value_date, value_json, is_sensitive, extracted_by, confidence)
// is_sensitive: true dacă conține PII detectat
// extracted_by: 'agent' | 'user' | 'structured_import'

// Full-text search peste attributes
CREATE VIRTUAL TABLE fts_attributes USING fts5(
  entity_id UNINDEXED, key, value_text,
  tokenize = 'unicode61 remove_diacritics 2'
);

// Full-text search peste entities (name + classification)
CREATE VIRTUAL TABLE fts_entities USING fts5(
  id UNINDEXED, name, entity_type
);
```

### 4.3 Structured promotion (collections)

Pattern inspirat din BunBase — colecții definite runtime.

```typescript
// Collections (tabele dinamice)
collections     (id, tenant_id, name, slug, schema_json,
                 auto_generated, source_entity_type, record_count, created_at)

// Records — stocate ca JSON în tabel generic, queryable via JSON1
collection_records (id, tenant_id, collection_id, record_json, eav_entity_id,
                    created_at, updated_at)
// eav_entity_id: FK opțional către entitățile originale EAV (traceability)

// Schema suggestions (agent analyzer output)
schema_suggestions (id, tenant_id, pattern_name, entity_type, sample_entity_ids_json,
                    suggested_schema_json, sample_count, status, created_at)
// status: 'pending' | 'approved' | 'rejected' | 'applied'
```

**Flow promovare:**
1. Nightly: agent analyzer scanează `entities` cu același `entity_type`, detectează structură comună
2. Inserează rând în `schema_suggestions`
3. Admin UI afișează "Schema Suggestions" cu diff + sample data
4. Admin click Apply → creează `collection`, migrează datele, marchează `entities.status = 'structured'`

### 4.4 docraftr (documents)

```typescript
document_templates    (id, tenant_id, name, kind, definition_json, version,
                       tags_json, created_by, created_at)
// kind: 'report' | 'form' | 'hybrid'

document_submissions  (id, tenant_id, template_id, data_json, submitted_by,
                       validated, created_at)

document_renders      (id, tenant_id, submission_id, html_content, pdf_path,
                       rendered_at, published_at)
```

### 4.5 takt (tasks)

```typescript
boards          (id, tenant_id, name, owner_id, description, created_at)
columns         (id, tenant_id, board_id, name, position)
cards           (id, tenant_id, column_id, title, description, due_date,
                 position, assigned_to, created_at)
labels          (id, tenant_id, board_id, name, color)
card_labels     (card_id, label_id)
comments        (id, tenant_id, card_id, user_id, body, created_at)
artifacts       (id, tenant_id, card_id, name, content, mime_type, created_at)
triggers        (id, tenant_id, board_id, event_type, conditions_json,
                 actions_json, enabled)
```

### 4.6 faber (wiki — unified in DB)

```typescript
wiki_pages      (id, tenant_id, slug, page_type, title, body_md,
                 frontmatter_json, maturity, confidence, created_at, updated_at)
// page_type: 'source' | 'entity' | 'concept' | 'synthesis'
// maturity: 'seed' | 'developing' | 'mature' | 'challenged'

wiki_relations  (id, tenant_id, from_slug, to_slug, relation_type)
// relation_type: 'mentions' | 'extends' | 'contradicts' | 'applies'

wiki_key_claims (id, tenant_id, page_id, claim_text, confidence)
wiki_aliases    (id, tenant_id, page_id, alias)

-- FTS
CREATE VIRTUAL TABLE fts_wiki USING fts5(slug, title, body_md);
CREATE VIRTUAL TABLE fts_claims USING fts5(page_id UNINDEXED, claim_text);

-- Temporal log (pentru /faber-brief style queries)
wiki_log_events (id, tenant_id, event_date, operation, title, body, created_at)
wiki_log_event_pages (event_id, page_slug, action)
```

### 4.7 glyphrail (workflows)

```typescript
workflow_defs     (id, tenant_id, name, yaml_source, version, created_at)
workflow_runs     (id, tenant_id, def_id, status, state_json, cursor,
                   input_json, output_json, started_at, completed_at)
// status: 'running' | 'completed' | 'failed' | 'paused'
workflow_traces   (id, tenant_id, run_id, step_id, event_type, payload_json, timestamp)
workflow_checkpoints (id, tenant_id, run_id, step_id, state_json, created_at)
```

### 4.8 Agent (robun)

```typescript
conversations     (id, tenant_id, user_id, channel, title, started_at)
// channel: 'web' | 'telegram' | 'email'
messages          (id, tenant_id, conversation_id, role, content,
                   tool_calls_json, tool_results_json, tokens, created_at)
// role: 'user' | 'assistant' | 'tool' | 'system'

agent_memory      (id, tenant_id, user_id, scope, key, value, updated_at)
// scope: 'long_term' | 'session'

skills_registry   (id, tenant_id, name, source_path, frontmatter_json, body_md,
                   enabled, last_loaded_at)

tool_invocations  (id, tenant_id, conversation_id, message_id, tool_name,
                   input_json, output_json, duration_ms, success, created_at)
```

### 4.9 Events

```typescript
events            (id, tenant_id, event_type, source_module, actor_user_id,
                   payload_json, created_at)
-- partitioned conceptually: log of all typed events emitted

-- Event subscribers state (for replay / at-least-once processing)
event_subscribers (id, tenant_id, subscriber_name, last_processed_event_id)
```

### 4.10 Sanitization

```typescript
sanitization_mappings (id, tenant_id, session_id, token, original_value_encrypted,
                       value_type, created_at, expires_at)
-- value_type: 'name' | 'cnp' | 'phone' | 'email' | 'address' | 'fo_number' | 'icd_code'
```

---

## 5. Sanitization Layer (CRITIC pentru hospital deploy)

Cel mai critical subsystem pentru GDPR compliance. **Zero date PII nu părăsesc instanța fără tokenization.**

### 5.1 Principiu

```
Input text → [SANITIZER] → Tokenized text → [CLOUD LLM] → Tokenized response → [REVERSE] → Final text
                 ↓
            mappings DB
          (encrypted, tenant-scoped, session-bound)
```

### 5.2 Pipeline

```typescript
// @altera/sanitize/src/index.ts

export interface SanitizationResult {
  sanitized: string
  mappings: Map<string, { original: string, type: ValueType }>
  sessionId: string
}

export async function sanitize(
  text: string,
  tenantId: string,
  sessionId: string,
): Promise<SanitizationResult> {
  // 1. Detect PII patterns (regex + NER)
  const detections = [
    ...detectCNP(text),           // regex: [1-8]\d{12} + checksum
    ...detectPhones(text),        // +40/07... patterns
    ...detectEmails(text),        // RFC 5322 subset
    ...detectCUI(text),           // RO/CUI with checksum
    ...detectIBAN(text),          // RO IBAN
    ...detectFONumber(text),      // "FO nr X/YYYY" patterns
    ...detectICDCodes(text),      // ICD-10 codes
    ...await detectNames(text),   // NER local model (spaCy/transformers.js)
    ...await detectAddresses(text),
  ]

  // 2. Sort by position, replace with tokens
  const mappings = new Map()
  let sanitized = text
  for (const d of detections.sort((a,b) => b.start - a.start)) {
    const token = generateStableToken(d.value, d.type, sessionId)
    sanitized = sanitized.substring(0, d.start) + token + sanitized.substring(d.end)
    mappings.set(token, { original: d.value, type: d.type })
  }

  // 3. Persist mappings (encrypted)
  await persistMappings(tenantId, sessionId, mappings)

  return { sanitized, mappings, sessionId }
}

export async function reverse(
  text: string,
  sessionId: string,
): Promise<string> {
  const mappings = await loadMappings(sessionId)
  let restored = text
  for (const [token, { original }] of mappings) {
    restored = restored.replaceAll(token, original)
  }
  return restored
}
```

### 5.3 Token Format

```
[PERSON_1], [PERSON_2], ...     # Nume proprii
[CNP_1], [CNP_2], ...           # CNP-uri
[PHONE_1], [PHONE_2], ...       # Numere telefon
[EMAIL_1], [EMAIL_2], ...       # Emailuri
[CUI_1], ...                    # CUI firme
[IBAN_1], ...                   # IBAN-uri
[FO_1], ...                     # Număr foaie observație
[ICD_1], ...                    # Cod ICD-10
[ADDR_1], ...                   # Adrese
[DATE_1], ...                   # Date specifice (opțional)
```

**Stable tokens:** Aceeași valoare în același `session_id` primește același token (consistency pentru agent).

### 5.4 NER Model (local)

Pentru detectarea numelor proprii și adreselor românești, folosim un model local mic:

**Opțiunea 1 (recomandat MVP):** `transformers.js` cu model quantized (e.g., `Xenova/bert-base-multilingual-uncased-ner-hrl`), rulat în worker thread. ~200MB download, ~100ms/doc.

**Opțiunea 2 (scale):** Servit prin un proces Python separat (ollama + model fine-tuned), accesat via HTTP intern.

### 5.5 Policy & audit

- **Policy per tenant:** Setting `sanitization_level` (`strict` | `moderate` | `off`)
- **Audit:** Fiecare sanitization call logat în `audit_log` cu hash(input) + token count
- **Expiry:** `sanitization_mappings.expires_at` = 24h default → auto-purge
- **Admin UI:** "Sanitization dashboard" — arată last N invocations, tokens created, policy per provider

---

## 6. First Use Case — Quarterly Report (MVP anchor)

### 6.1 Business context

Spitalul trebuie să publice trimestrial, pe site, un raport multidisciplinar care combină:

- **Financiar**: buget executat, facturi plătite, restanțe, achiziții
- **Statistică medicală**: pacienți tratați, internări, externări, mortalitate, DRG
- **Logistică**: stocuri medicamente, achiziții echipamente, mentenanță

Datele vin în formate eterogene — Excel (financiar), PDF (rapoarte statistice), Word (memo-uri logistică), CSV (export SIUI), etc. — produse de departamente diferite.

**Pain today:** Narcis asamblează manual raportul, copy-paste, verifică consistență, formatează, publică. 2-3 zile de muncă per trimestru.

**Target:** Utilizatorii fac drag-drop documentele în Altera OS, click "Generează raport Q1 2026", primesc HTML ready-to-publish în 5-10 minute.

### 6.2 End-to-end flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1 — INGEST                                                │
│  Utilizatorul drop-uie 15 documente (xlsx, pdf, docx)          │
│  Admin UI → POST /api/ingest (multipart)                       │
│  Server → @altera/ingest parser → text extraction              │
│  Server → emits event: 'file.uploaded' per fiecare              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2 — CLASSIFY + EXTRACT (per document, parallel)           │
│  Event subscriber: classify-subscriber                          │
│    → @altera/sanitize sanitize(text, tenant, session)           │
│    → Cloud LLM (Claude) → classify + extract attributes         │
│    → @altera/sanitize reverse(response, session)                │
│    → @altera/eav insert entity + attributes                     │
│    → emits: 'entity.classified' cu entity_type                  │
│                                                                 │
│  Ex: document.xlsx → entity_type='financial_report',            │
│      attributes: { period: 'Q1 2026', total_budget: 1.2M, ... } │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3 — USER TRIGGERS REPORT                                  │
│  Chat panel: "Generează raport trimestrial pentru Q1 2026"      │
│  Agent (robun) identifies intent + invokes skill                 │
│    → skill: generate-quarterly-report                           │
│    → skill executes glyphrail workflow: quarterly-report.yaml   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4 — WORKFLOW EXECUTION (glyphrail deterministic)          │
│                                                                 │
│  Step 4.1: query-entities tool                                  │
│    SELECT * FROM entities                                       │
│    WHERE tenant_id = ? AND status = 'classified'                │
│      AND attributes->period = 'Q1 2026'                         │
│                                                                 │
│  Step 4.2: group-by-type (pure function)                        │
│    → { financial: [...], medical: [...], logistics: [...] }     │
│                                                                 │
│  Step 4.3: synthesize-financial (agent step, bounded)           │
│    Input: financial entities + attributes                       │
│    Output schema: { total_budget, executed, deviation, ... }    │
│    Sanitization: active                                         │
│                                                                 │
│  Step 4.4: synthesize-medical (agent step)                      │
│    Similar, with medical KPIs                                   │
│                                                                 │
│  Step 4.5: synthesize-logistics (agent step)                    │
│    Similar                                                      │
│                                                                 │
│  Step 4.6: synthesize-executive-summary (agent step)            │
│    Inputs: outputs de mai sus                                   │
│    Output: narrative text (sanitized)                           │
│                                                                 │
│  Step 4.7: render-report tool (docraftr)                        │
│    Template: quarterly-report template (created once)           │
│    Data: synthesized structured data                            │
│    Output: HTML + optional PDF                                  │
│                                                                 │
│  Step 4.8: cross-link-wiki tool (faber)                         │
│    Links entities in wiki (Q1 2026, key people, departments)    │
│                                                                 │
│  Step 4.9: return                                                │
│    { report_id, html_url, pdf_url }                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5 — USER REVIEWS + PUBLISHES                              │
│  Admin UI deschide raportul în preview                          │
│  User approval: click "Publish"                                 │
│  Server → document_renders.published_at = now()                 │
│  Event: 'report.published'                                      │
│  Trigger (optional): copy la /var/www/hospital-site/            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Template docraftr (quarterly report)

Stored as `document_templates` row cu `definition_json`:

```json
{
  "id": "quarterly-report-v1",
  "version": 1,
  "title": "Raport Trimestrial Spital",
  "kind": "report",
  "theme": { "primary": "#0066cc", "font": "Inter" },
  "sections": [
    {
      "id": "header",
      "layout": "stack",
      "components": [
        { "type": "heading", "mode": "read", "size": "xl", "bind": { "value": "period" } },
        { "type": "company-block", "mode": "read", "bind": { "company": "hospital" } }
      ]
    },
    {
      "id": "exec-summary",
      "title": "Sumar executiv",
      "components": [
        { "type": "rich-text", "mode": "read", "bind": { "value": "summary_md" } }
      ]
    },
    {
      "id": "financial",
      "title": "Situație financiară",
      "components": [
        { "type": "kpi-grid", "mode": "read", "bind": { "items": "financial.kpis" } },
        { "type": "table", "mode": "read", "bind": { "rows": "financial.invoices_summary" } }
      ]
    },
    {
      "id": "medical-stats",
      "title": "Statistică medicală",
      "components": [
        { "type": "kpi-grid", "mode": "read", "bind": { "items": "medical.kpis" } },
        { "type": "chart", "mode": "read", "variant": "bar", "bind": { "data": "medical.chart" } }
      ]
    },
    {
      "id": "logistics",
      "title": "Logistică",
      "components": [
        { "type": "table", "mode": "read", "bind": { "rows": "logistics.summary" } }
      ]
    },
    {
      "id": "footer",
      "components": [
        { "type": "text", "mode": "read", "bind": { "value": "published_at" } }
      ]
    }
  ]
}
```

### 6.4 Workflow `quarterly-report.yaml`

```yaml
version: "1.0"
name: quarterly-report
description: Consolidează documente ingestate trimestrial într-un raport publicabil
inputSchema:
  type: object
  properties:
    period: { type: string, pattern: "^Q[1-4] \\d{4}$" }
    tenant_id: { type: string }
  required: [period, tenant_id]

steps:
  - id: fetch-entities
    kind: tool
    tool: query-entities
    input:
      tenant_id: ${input.tenant_id}
      filters:
        period: ${input.period}
        status: classified
    save: state.entities

  - id: group
    kind: assign
    value:
      financial: ${filter(state.entities, e => e.entity_type == 'financial_report')}
      medical: ${filter(state.entities, e => e.entity_type == 'medical_stats')}
      logistics: ${filter(state.entities, e => e.entity_type == 'logistics_report')}
    save: state.grouped

  - id: synth-financial
    kind: agent
    mode: structured
    provider: claude
    objective: Sumarizează datele financiare într-un raport executiv
    instructions: |
      Extrage KPI-uri: buget total, executat, deviation %, top 5 facturi.
      Returnează JSON strict.
    input:
      entities: ${state.grouped.financial}
    outputSchema:
      type: object
      properties:
        kpis: { type: array }
        invoices_summary: { type: array }
        narrative: { type: string }
    save: state.financial

  - id: synth-medical
    kind: agent
    mode: structured
    # … similar

  - id: synth-logistics
    kind: agent
    mode: structured
    # … similar

  - id: synth-summary
    kind: agent
    mode: structured
    objective: Sinteză executivă peste toate categoriile
    input:
      financial: ${state.financial}
      medical: ${state.medical}
      logistics: ${state.logistics}
      period: ${input.period}
    outputSchema:
      type: object
      properties:
        summary_md: { type: string }
    save: state.summary

  - id: render
    kind: tool
    tool: docraftr-render
    input:
      template_id: quarterly-report-v1
      data:
        period: ${input.period}
        financial: ${state.financial}
        medical: ${state.medical}
        logistics: ${state.logistics}
        summary_md: ${state.summary.summary_md}
        published_at: ${now}
      tenant_id: ${input.tenant_id}
    save: state.rendered

  - id: return
    kind: return
    output:
      report_id: ${state.rendered.id}
      html_url: ${state.rendered.html_url}
      period: ${input.period}
```

---

## 7. Roadmap — 3 faze / 6 luni

### PHASE 1 — Foundation + First Use Case (Săptămânile 1-8, ~2 luni)

**Goal:** Raportul trimestrial funcționează end-to-end cu date reale de la spital. Infrastructura e solidă pentru expand.

**Gates:**
- ✅ Monorepo funcțional, `bun install`, `bun run dev` pornește server + admin
- ✅ Auth local JWT cu tenant, admin creează users
- ✅ Ingest PDF/DOCX/XLSX/CSV → EAV
- ✅ Sanitization layer funcțional (PII detection + reverse, auditat)
- ✅ Agent runtime minimal (robun port) cu 1 provider (Claude) + 5 skills core
- ✅ docraftr port funcțional cu ≥20 componente core
- ✅ Workflow engine (glyphrail port) execută `quarterly-report.yaml`
- ✅ Admin UI cu chat embedded
- ✅ Use case #1 livrat: produce raport Q1 cu date reale

**Deliverables:** Binary `altera` care pornește pe server-ul spitalului + demo end-to-end.

### PHASE 2 — Expand Modules (Săptămânile 9-18, ~2.5 luni)

**Goal:** Toate modulele sunt funcționale. Schema promotion funcționează. Agentul e puternic.

**Scope:**
- Full takt (boards, cards, triggers, calendar, comments, artifacts)
- Full faber port (wiki schema, ingest flow, lint, slides)
- Glyphrail full DSL (parallel, sub-workflows, imports)
- Schema promotion flow (analyzer + admin approval UI)
- Agent skills: ≥15 skills (form generation, report generation, query, scheduling)
- BunBase collections (schema-in-db complete)
- Event bus cu audit log extensiv
- SSE + WS real-time UI
- Telegram channel pentru robun (optional)
- Use cases 2-3 livrate (tickets IT mentenanță, protocoale SOPs search)

**Deliverables:** Platformă completă, usable day-to-day la spital.

### PHASE 3 — Productize (Săptămânile 19-26, ~2 luni)

**Goal:** SaaS-ready. First paying customer.

**Scope:**
- Multi-tenant isolation hardening (row-level security, tenant quotas)
- Billing (Stripe adapter, tenant subscription, usage metering)
- Onboarding flow (signup → tenant creation → first-run wizard)
- Landing page (alteraos.com — NextJS sau Astro, separat)
- Documentation (docs.alteraos.com — Fumadocs sau VitePress)
- Single-binary release cu auto-update
- Docker image + compose file pentru self-host
- Backup/restore (export/import SQLite + files)
- Monitoring (basic metrics: request count, agent invocations, errors)
- Customer-facing changelog + version tagging
- Outreach: 10 potential customers contacted, demos, trials
- **GTM:** Launch pe Product Hunt RO + comunități HealthTech EU

**Deliverables:** `v1.0.0` pe GitHub Releases + landing page + 1-3 paying tenants.

---

## 8. Phase 1 — Detailed Task Breakdown

Planul detaliat pentru Phase 1 (săptămânile 1-8), care poate fi împărțit în 8 "sprints" săptămânale, fiecare cu tasks concrete implementabile de Claude Code.

### Sprint 1 — Monorepo Foundation (Week 1)

**Goal:** Repo nou `altera-os` cu workspace setup, shared packages scheletate, dev loop funcțional.

**Tasks:**

1. **S1.1** — Init repo
   - `bun init` în `altera-os/`
   - Configure Bun workspaces în `package.json` (`"workspaces": ["apps/*", "packages/*"]`)
   - Setup `bunfig.toml`, `tsconfig.json` base, `.editorconfig`, `.gitignore`
   - Setup Biome (linting + formatting)
   - Install base deps: Hono, Zod, Drizzle, drizzle-kit, bun-types
   - AC: `bun install` OK, `bunx tsc --noEmit` passes, `bunx biome check .` clean

2. **S1.2** — Create `@altera/core` package
   - Shared Zod schemas (User, Tenant, Entity, Attribute)
   - Shared types (ActionContext, TenantScope)
   - Constants (error codes, enums)
   - Exported via `packages/@altera/core/index.ts`
   - AC: imports work from other packages

3. **S1.3** — Create `@altera/db` package
   - Drizzle config
   - Base schema: `tenants`, `users`, `sessions`, `audit_log`, `files`
   - Migration 0000_init.sql
   - Helper: `withTenant(db, tenantId)` — scoped query builder
   - `migrate.ts` script
   - AC: `bun run migrate` creates DB, seed test tenant + admin user

4. **S1.4** — Create `@altera/auth` package
   - JWT sign/verify (jose)
   - Password hashing (argon2)
   - Login/logout/register services
   - Hono middleware: `requireAuth`, `requireRole`, `withTenant`
   - Rate limiting basic
   - AC: tests pass for login flow, middleware rejects invalid tokens

5. **S1.5** — Scaffold `apps/altera-server`
   - Bun.serve + Hono app
   - Routes: `/api/auth/*`, `/api/health`, `/api/me`
   - Middleware pipeline (auth → tenant → logging)
   - Error handler (consistent JSON error shape)
   - AC: `bun run dev` starts server, can register + login via curl

6. **S1.6** — Scaffold `apps/altera-admin`
   - Vite + React 19 + TypeScript
   - Basic routes (login, dashboard, logout)
   - API client helper
   - Tailwind setup (for utilities)
   - AC: `bun run admin:dev` serves UI, login works against server

7. **S1.7** — Scaffold `apps/altera-cli`
   - Entry `bin.ts` with `#!/usr/bin/env bun`
   - Commands: `altera auth login/logout/whoami`, `altera config`
   - ~/.altera/config.json persistence
   - AC: `bun link` then `altera auth login` works

8. **S1.8** — CLAUDE.md for the new repo
   - Dev guide: how to add package, run tests, commit conventions
   - Architecture overview linking to architecture.md
   - AC: a new agent reading CLAUDE.md can run the project

### Sprint 2 — Event Bus + Events (Week 2)

**Goal:** Event infrastructure — pattern din takt adaptat pentru multi-module.

**Tasks:**

1. **S2.1** — `@altera/events` package
   - Typed event definitions (discriminated union pe `type`)
   - Event types initial: `file.uploaded`, `entity.created`, `entity.classified`, `workflow.started`, `workflow.completed`, `report.rendered`, `report.published`
   - `EventBus` class cu `emit`, `subscribe`, `unsubscribe`
   - Persistent mode (write to `events` table) + in-memory mode
   - AC: Test — emit event, subscriber fires, persisted in DB

2. **S2.2** — Activity subscriber
   - `ActivitySubscriber` writes to `audit_log` on every event
   - Registered in server bootstrap
   - AC: CRUD operations produce audit log entries

3. **S2.3** — SSE manager
   - `SseManager` — maintain connections per tenant, subscribe to event bus
   - Filter events by tenant + subscription topics
   - Reconnect logic
   - AC: Test — admin UI connects to SSE, sees events real-time

4. **S2.4** — WS manager
   - `WsManager` — bidirectional channel, similar filtering
   - Message protocol: `{ type, payload }`
   - AC: Test — open WS, receive events pushed by server

5. **S2.5** — Admin UI real-time hook
   - `useRealtime(topics)` — React hook for SSE/WS
   - Displays live event stream (debug panel)
   - AC: Events appear in UI as triggered

### Sprint 3 — Ingest Pipeline (Week 3)

**Goal:** Upload → parsed text extraction → pre-EAV.

**Tasks:**

1. **S3.1** — `@altera/ingest` package skeleton
   - Parser interface: `parseFile(buffer, mime) → { text, metadata, pages }`
   - Parsers: `pdf-parse`, `mammoth` (docx), `xlsx`, `csv-parse`, plaintext, markdown
   - Auto-detect mime from content (magic bytes) + extension
   - AC: Unit tests per format with fixtures

2. **S3.2** — File upload endpoint
   - `POST /api/files/upload` (multipart)
   - Validate size, mime, calculate SHA256 hash
   - Store to `./data/{tenant_id}/files/{hash[:2]}/{hash}.{ext}`
   - Insert `files` row
   - Emit `file.uploaded`
   - AC: curl upload works, file on disk, row in DB, event fired

3. **S3.3** — Ingest worker (event subscriber)
   - Subscribe to `file.uploaded`
   - Parse file → extract text
   - Create `entities` row (status='raw', entity_type=null)
   - Insert raw text as `attributes` key='raw_text'
   - Emit `entity.created`
   - AC: Upload file → entity appears

4. **S3.4** — Admin UI Ingest page
   - Drag-drop upload zone
   - File list per tenant (paginated)
   - Click file → see extracted text + metadata
   - AC: Drag-drop multiple files, see them processed

5. **S3.5** — Ingest CLI
   - `altera ingest <file.pdf>` → uploads + reports entity ID
   - `altera entity list`, `altera entity show <id>`
   - AC: Works from terminal on test files

### Sprint 4 — Sanitization Layer (Week 4)

**Goal:** PII sanitization end-to-end, auditat.

**Tasks:**

1. **S4.1** — `@altera/sanitize` package scaffold
   - Types: `Detection`, `SanitizationResult`, `ValueType`
   - Main API: `sanitize()`, `reverse()`
   - AC: Skeleton compiles

2. **S4.2** — Regex detectors
   - CNP validator (checksum algorithm RO)
   - Phone (RO mobile + fixed + international)
   - Email, URL
   - CUI, IBAN (reuse from docraftr validators)
   - FO numbers, ICD-10 codes
   - AC: Unit tests on Romanian medical text samples

3. **S4.3** — NER integration (transformers.js)
   - Load quantized NER model in worker thread
   - Detect PERSON, ORG, LOC entities
   - Graceful fallback if model fails to load
   - AC: Text with names gets them detected

4. **S4.4** — Token generation + mapping store
   - Stable tokens (same value → same token in session)
   - Encrypted storage (AES-GCM with tenant key)
   - `sanitization_mappings` table
   - Auto-expiry via scheduled cleanup
   - AC: Tokens consistent per session, encrypted at rest

5. **S4.5** — Reverse API
   - `reverse(text, sessionId)` replaces tokens back
   - Handles nested tokens (e.g., token inside JSON string)
   - AC: Round-trip identity: `reverse(sanitize(x))` = x

6. **S4.6** — Integration hook
   - `withSanitization(call, tenant, session)` wrapper for LLM calls
   - Auto-sanitizes prompts, reverses responses
   - AC: Claude call through wrapper never sees PII

7. **S4.7** — Admin UI: Sanitization audit
   - Page showing recent sanitization events
   - Per event: timestamp, input hash, tokens generated, LLM provider
   - Policy toggle per tenant
   - AC: Sanitization operations visible in UI

### Sprint 5 — EAV Engine + Classification Agent (Week 5)

**Goal:** Agentul clasifică entități și extrage attributes → EAV populated.

**Tasks:**

1. **S5.1** — `@altera/eav` package
   - Types: `Entity`, `Attribute`, `EntityQuery`
   - API: `createEntity`, `setAttribute`, `getAttributes`, `queryEntities`
   - FTS search across attributes
   - AC: CRUD tests pass

2. **S5.2** — Agent runtime scaffolding (`@altera/agent`)
   - Port robun `agent/loop.ts` (simplified)
   - Provider abstraction (MultiProvider simplified to just Anthropic for MVP)
   - Tool registry
   - Message history
   - AC: Can invoke Claude with a message + tool, get response

3. **S5.3** — First tools
   - `query-entities` — SQL-ish filter over EAV
   - `set-attribute` — write to EAV
   - `classify-entity` — mark entity type + confidence
   - `sanitize-then-call` — convenience wrapper
   - AC: Each tool has schema + works in isolation

4. **S5.4** — Classification skill
   - `skills/classify-document.md` — skill definition
   - Prompt: given raw text, propose `entity_type` from a known taxonomy
   - Taxonomy configurable per tenant
   - AC: Running skill on sample doc produces classified entity

5. **S5.5** — Classification event subscriber
   - Subscribe to `entity.created` → invoke classify-document skill
   - Update `entities.entity_type`, `entities.classification_confidence`
   - Emit `entity.classified`
   - AC: Upload file → entity.classified event fires with type

6. **S5.6** — Admin UI: EAV browser
   - Entities list with filters (type, status, period)
   - Entity detail page showing all attributes
   - Full-text search box
   - AC: Ingested documents visible, searchable

### Sprint 6 — docraftr Port + Workflow Engine Port (Week 6)

**Goal:** Document rendering + deterministic workflow orchestration.

**Tasks:**

1. **S6.1** — Port docraftr core
   - Port `src/core/` (types, schemas, registry, conditions)
   - Port `src/engine/` (renderDocument, loom-html, loom-form)
   - Port `src/loom/` (assets, tokens)
   - Vendored Loom UI in `packages/@altera/loom/`
   - AC: `renderDocument(def, data)` returns HTML string

2. **S6.2** — Port docraftr components
   - Prioritize: text, heading, rich-text, table, kpi-grid, company-block, invoice-block, chart
   - Register all via `registerReadOnlyComponents()`
   - AC: Each component renders correctly via unit test

3. **S6.3** — docraftr services + actions
   - `templateService` (CRUD)
   - `submissionService` (CRUD)
   - `renderService` (generate + persist)
   - Actions: `template.create/list/get/update`, `render.render`
   - HTTP routes under `/api/docs/*`
   - AC: Can create template, render HTML via API

4. **S6.4** — Port glyphrail engine
   - Port `src/core/execution-engine.ts`
   - Port `src/dsl/` (workflow validation)
   - Port `src/tools/runtime.ts`
   - Port `src/agent/runtime.ts` (structured mode)
   - Adapt persistence: DB tables instead of files (`.glyphrail/runs/*`)
   - AC: Can load YAML workflow, execute, persist run in DB

5. **S6.5** — Live Claude adapter for glyphrail
   - Implement `AgentAdapter` using `@altera/agent` Claude provider
   - Sanitization hook embedded
   - AC: Agent steps in workflows work with real Claude (sanitized)

6. **S6.6** — Workflow runner tool
   - `run-workflow` tool for the agent: input = workflow name + params
   - Returns run ID, polls until complete
   - AC: Agent can trigger workflow and read result

### Sprint 7 — Admin UI Polish + Chat Integration (Week 7)

**Goal:** UI decent, chat embedded funcțional.

**Tasks:**

1. **S7.1** — Admin UI navigation
   - Sidebar layout: Dashboard, Ingest, Entities, Templates, Reports, Tasks (stub), Wiki (stub), Workflows, Settings
   - Persistent chat panel (collapsible right side)
   - Tenant switcher (if user has multiple)
   - AC: Navigation works, layout responsive

2. **S7.2** — Chat panel component
   - Connected to `@altera/agent` via WS
   - Message bubbles (user/assistant/tool)
   - Tool use visualization (collapsed by default)
   - Input with file attach
   - AC: Can chat with robun, see tool invocations

3. **S7.3** — Dashboard page
   - Stats: entities by type, recent events, active workflows, tenant info
   - Quick actions: Ingest, New template, New workflow run
   - AC: Real data loads on page

4. **S7.4** — Templates page
   - List docraftr templates
   - Create/edit via JSON editor (CodeMirror/Monaco)
   - Preview rendered output
   - AC: Create template, preview it

5. **S7.5** — Reports page
   - List generated reports (document_renders)
   - Preview, download HTML/PDF
   - Publish button
   - AC: Flow: render → preview → publish works

### Sprint 8 — Quarterly Report End-to-End (Week 8)

**Goal:** Use case #1 funcționează cu date reale.

**Tasks:**

1. **S8.1** — Create quarterly-report template
   - JSON template as defined in section 6.3
   - Seed into DB on first run
   - AC: Template exists in fresh DB

2. **S8.2** — Write `quarterly-report.yaml` workflow
   - Complete workflow as in section 6.4
   - Test with mock data
   - AC: Workflow passes validation (`glyphrail validate`)

3. **S8.3** — Create synthesis skills
   - `skills/synthesize-financial.md`
   - `skills/synthesize-medical.md`
   - `skills/synthesize-logistics.md`
   - `skills/synthesize-executive-summary.md`
   - Each with prompt + output schema
   - AC: Manually invoking each skill produces reasonable output on fixtures

4. **S8.4** — Render quarterly report flow
   - Chat: "Genereaza raport Q1 2026"
   - Agent recognizes intent → invokes `generate-quarterly-report` skill
   - Skill runs workflow
   - Result linked in chat: "Raport generat: [link]"
   - AC: Full flow works

5. **S8.5** — Real data test
   - Ingest 5-10 real documents from Q1 (anonymized first for safety)
   - Generate report
   - Manual review of output
   - Fix issues
   - AC: Report acceptable quality, narcis signs off

6. **S8.6** — Package binary
   - Build script: `bun build --compile`
   - Output: `dist/altera` (~80MB binary)
   - Embed admin UI build as assets
   - Startup message
   - AC: `./altera --port 8080` runs end-to-end

7. **S8.7** — Deploy guide
   - `docs/deploy.md`: server setup, first-run, backup
   - Systemd service example
   - AC: Narcis can deploy on hospital server following guide

---

## 9. Skills Catalog (Phase 1 minimal)

Skills sunt fișiere markdown cu frontmatter, descoperite automat de `@altera/agent/skills/`.

### Format

```markdown
---
name: classify-document
description: Given raw document text, classify entity type and extract key attributes
category: ingest
enabled: true
model_hint: claude-haiku-4-5  # fallback to sonnet if needed
tools: [set-attribute, classify-entity]
sanitization: required
---

# Classify Document

You are a document classifier for a hospital OS.

## Task

Given raw text from a document, determine:
1. The most appropriate `entity_type` from the taxonomy
2. Key attributes (period, amounts, dates, categories)
3. Confidence level (0-1)

## Taxonomy

- `financial_report` — bugete, facturi, achiziții
- `medical_stats` — internări, externări, DRG, mortalitate
- `logistics_report` — stocuri, mentenanță, echipamente
- `protocol` — SOP, proceduri interne, circulare
- `memo` — comunicări interne
- `contract` — contracte furnizori
- `other` — nu se potrivește

## Output

Use `classify-entity` tool with entity_id, entity_type, confidence.
Use `set-attribute` tool repeatedly to save extracted attributes.
```

### Phase 1 skills

| Skill | Category | Purpose |
|---|---|---|
| `classify-document` | ingest | Clasifică entity_type + attributes |
| `sanitize-pii` | meta | Wrapper explicit (agentul cere sanitization) |
| `synthesize-financial` | synth | Sumarizare date financiare |
| `synthesize-medical` | synth | Sumarizare date medicale |
| `synthesize-logistics` | synth | Sumarizare date logistică |
| `synthesize-executive-summary` | synth | Narrative top-level |
| `generate-quarterly-report` | orchestration | Orchestrează workflow-ul |
| `query-knowledge` | search | FTS search peste entities/attributes |

### Phase 2 skills (preview)

| Skill | Purpose |
|---|---|
| `generate-form` | Generează docraftr form definition din prompt |
| `generate-report-template` | Propune template docraftr pentru un tip raport |
| `promote-schema` | Analizează entities similare → sugerează colecție |
| `schedule-task` | Creează card în takt |
| `create-trigger` | Setup trigger pe eveniment |
| `search-wiki` | Query faber |
| `ingest-from-url` | Fetch + ingest URL |
| `faber-link-entity` | Cross-link entity cu wiki |

---

## 10. Tech Stack Consolidat

| Layer | Technology | Reason |
|---|---|---|
| Runtime | **Bun ≥1.3** | Consistent cu toate proiectele existente, performant, single-binary build |
| Language | **TypeScript strict (ESNext)** | Type safety, widespread |
| HTTP | **Hono v4** | Folosit deja de docraftr, takt, robun, bunbase |
| Database | **SQLite (bun:sqlite) + Drizzle ORM** | Drizzle = type-safe, migrations; folosit de docraftr |
| Validation | **Zod** | Standard în toate proiectele |
| Frontend | **React 19 + Vite + Tailwind v4** | Takt + BunBase pattern |
| UI Design System | **Loom UI (vendored)** | Consistent cu docraftr, agent-renderable |
| Real-time | **SSE (primary) + WS (collab)** | Takt pattern |
| Auth | **JWT (jose) + argon2** | BunBase pattern |
| Testing | **bun test (co-located)** | Consistent, fast |
| Linting | **Biome** | Fast, no config |
| LLM | **Anthropic SDK (Claude)** | Primary; `@anthropic-ai/sdk` with prompt caching |
| NER | **transformers.js (Xenova models)** | Local, no Python dep |
| PDF parsing | **pdf-parse** | Mature, Bun-compatible |
| DOCX parsing | **mammoth** | Industry standard |
| XLSX parsing | **xlsx (SheetJS)** | Industry standard |
| CSV parsing | **csv-parse** | Standard |
| Build | **bun build --compile** | Single binary |
| Containerization | **Docker (Alpine + Bun)** | Optional, for SaaS deploy |
| Monorepo | **Bun workspaces (native)** | Zero extra tool |

---

## 11. Security & Compliance

### 11.1 Data handling

- **At rest:** SQLite WAL mode, file permissions 0600. Attributes marked `is_sensitive` encrypted with per-tenant key (key stored in env or OS keyring).
- **In transit:** HTTPS mandatory in production (nginx reverse proxy sau Caddy).
- **PII:** Zero cloud transmission without sanitization. Audit log for every sanitization call.
- **Files:** Stored in `./data/{tenant_id}/files/`, filesystem perms scoped to app user.

### 11.2 Authentication & authorization

- **Password policy:** min 12 chars, argon2id hashing.
- **Session:** JWT cu expiry 24h, refresh token 7d, rotation on refresh.
- **Roles:** `admin` (tenant-wide), `user` (scoped), `agent` (service account).
- **Audit:** Fiecare action scrie în `audit_log`.

### 11.3 Tenant isolation

- `tenant_id` în toate tabelele (FK către `tenants`).
- Middleware `withTenant` injectează `tenant_id` în context.
- Drizzle helper `withTenant(db, ctx.tenantId)` returns scoped query builder — prevents accidental cross-tenant queries at dev-time.
- **Tests:** Suite dedicată ce verifică că user din tenant A nu poate accesa date tenant B (try auth bypass, SQL injection patterns).

### 11.4 GDPR

- **Right to access:** `altera export-tenant --id X` — produce JSON + files archive.
- **Right to erasure:** `altera delete-tenant --id X --confirm` — cascade delete + purge files.
- **Data minimization:** Sanitization default ON pentru cloud calls.
- **DPA:** Document în `docs/compliance/dpa.md` — Anthropic's DPA linked + ours.

### 11.5 Deployment hardening

- Environment variables (`.env.production`): DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, ANTHROPIC_API_KEY.
- Secrets NEVER în repo (`.gitignore` enforced + pre-commit hook).
- systemd service cu `NoNewPrivileges=true`, `ProtectSystem=strict`.
- Regular backups (DB + files) scriptate.

---

## 12. Development Workflow

### 12.1 Repo setup (dev)

```bash
git clone git@github.com:Narcis13/altera-os.git
cd altera-os
bun install
cp .env.example .env.local
bun run migrate
bun run seed:dev
bun run dev  # concurrently: server + admin + CLI link
```

### 12.2 Commit conventions

Conventional commits (aliniat cu takt/BRN):

```
feat(ingest): add xlsx parser
fix(sanitize): handle edge case in CNP regex
chore(deps): update drizzle
docs(architecture): add sequence diagram for quarterly report flow
test(auth): cover token rotation
```

### 12.3 Test strategy

- **Unit:** `*.test.ts` co-located, runs `bun test`
- **Integration:** `tests/integration/*.test.ts` — tenant isolation, full workflow runs
- **E2E (Phase 2+):** Playwright against admin UI

### 12.4 Claude Code usage

Dev-time:
- `claude "add a new parser for .rtf format to @altera/ingest"`
- `claude "implement workflow step for sending notification via email"`
- Generate new skills via prompt, iterate
- Debug workflows by reading trace artifacts

### 12.5 CI (Phase 1 end)

GitHub Actions:
- On push: typecheck, lint, test
- On tag `v*`: build binary, attach to release

---

## 13. Risk Register

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | Sanitization misses PII → leak to cloud | High (GDPR) | Medium | Multi-pattern detection + NER + audit + red-team tests |
| R2 | SQLite not performant at scale (10+ tenants, GB data) | Medium | Low-medium | WAL + indexes + prepared for Postgres migration (abstract DB layer) |
| R3 | Cloud LLM downtime or policy change | Medium | Medium | Provider abstraction allows swap (OpenAI, local ollama fallback) |
| R4 | Monorepo integration bigger scope than estimated | High | High | Strict phase gates; Phase 1 scope is MINIMAL for first use case |
| R5 | Loom UI incompatible with new use cases | Low | Low | Already proven in docraftr; extend components as needed |
| R6 | Event bus race conditions (parallel ingests) | Medium | Medium | Persistent event log + idempotent subscribers + tests |
| R7 | Schema promotion suggestions low quality | Low | Medium | User in the loop (confirm) + iteration on analyzer prompt |
| R8 | Agent infinite loops (runaway tool calls) | Medium | Low | Glyphrail caps + robun max iterations (20) |
| R9 | Hospital server resource constraints | Medium | Unknown | Single binary + SQLite = low footprint; profile early |
| R10 | Solo dev burnout (6-month timeline while full-time job) | High | Medium | Phase 1 is minimum viable; can stretch Phase 2-3; AI leverage mitigates |

---

## 14. Open Questions (to resolve before Phase 2)

1. **Telegram integration** — Phase 2 sau Phase 3? Util pentru notificări workflow asincrone.
2. **Email channel** — reply-to-email pentru agentul robun? Pentru escalații.
3. **Offline mode** — ce se întâmplă când cloud LLM e down? Queue + retry? User notification?
4. **Mobile access** — admin UI responsive enough, sau PWA dedicat?
5. **Printing** — raportul final → PDF cum? Puppeteer embedded? External service?
6. **Backup strategy details** — scheduled dump + offsite? Retention policy?
7. **Multi-language UI** — RO primary, EN fallback? i18n library (format-js)?
8. **User invitations** — email-based sau admin manual add?
9. **API pentru terți** — `/api/v1/*` public cu API keys? Phase 3?
10. **Observability** — logs (pino) + metrics (?) + traces (?)

---

## 15. Next Steps (immediate)

1. **[Narcis]** Review acest document, flag disagreements sau adjust priorities
2. **[Narcis]** Decide sub-decizii rămase (Section 14) — sau accept defaults
3. **[Claude Code]** Init repo `altera-os` conform Section 3.2
4. **[Claude Code]** Execute Sprint 1 tasks (S1.1 - S1.8)
5. **[Narcis]** Validate Sprint 1 output, identify blockers
6. **[Claude Code]** Execute Sprint 2 și înainte, săptămânal

**Cadence:** Sprint review weekly (Narcis + Claude Code). Demo live la sfârșit de fiecare fază. Retrospective documentată în `docs/retros/`.

---

## 16. Source Code Inventory & Migration Plan (OPERATIONAL)

This section is **operational** — it contains exact repo URLs, local paths, and copy commands so Claude Code can execute migrations without guessing.

### 16.0 Source Inventory (2026-04-18)

Toate repos sunt **PUBLIC** pe `github.com/Narcis13/*` — strategie uniformă: clone shallow din GitHub, zero dependență de clone-uri locale.

| Module | GitHub repo | Sub-path | Status | Strategy |
|---|---|---|---|---|
| **docraftr** | `github.com/Narcis13/docraftr` | `/` (root) | Active v0.1 alpha, 10-layer arch | Clone → cherry-pick 8 of 10 layers |
| **glyphrail** | `github.com/Narcis13/glyphrail` | `/` (root) | Active v0.1 MVP Slice 6 | Clone → port ~100% (zero runtime deps) |
| **takt (+BRN)** | `github.com/Narcis13/brn` | `/src/` | Active v0.1, ~825K TS | Clone → pull takt code; **skip `.brn/`** (BRN framework not part of OS) |
| **bunbase** | `github.com/Narcis13/bunbase` | `/` (root) | Active v0.3, 20K LOC, 470 tests | Clone → pull patterns only (schema-in-db, hooks, auth rules, admin UI components) |
| **robun** | `github.com/Narcis13/robun` | `/` (root) | Active v1.0.0, 9 channels | Clone → pull agent/, tools/, skills/, drop 7 channels |
| **faber** | `github.com/Narcis13/alteramens` | `/wiki/` (sparse checkout) | Live în vault Narcis | Sparse clone → port Python `faber_sync.py` → TS; hybrid DB+MD model |
| **Loom UI** | (vendored în docraftr) | `docraftr/vendor/loom/` | Already vendored | Extract to `packages/@altera/loom/` din docraftr clone |

**Access:** Toate repos sunt PUBLIC — nu e nevoie de auth GitHub pentru clone. `gh auth login` util doar pentru PR-uri ulterioare.

**Note pe `alteramens` repo:** E vault-ul complet al lui Narcis (large repo cu images, notes, etc.). Folosim **sparse checkout** pentru a pull doar `wiki/` — economisește spațiu și timp de clone.

### 16.1 Bootstrap Script

Înainte de Sprint 2, rulează o singură dată pentru a popula `_sources/`:

**`scripts/fetch-sources.sh`** (to be created by Claude Code în Sprint 1):

```bash
#!/usr/bin/env bash
# Fetches all source repos into _sources/ (gitignored)
# Run once before Sprint 2 starts migrating code.
# All 6 source repos are PUBLIC on github.com/Narcis13/*
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p _sources

# --- Standard full shallow clones (main branch only) ------------------

clone_or_update() {
  local name="$1"
  local url="$2"
  local dir="_sources/$name"
  if [ ! -d "$dir" ]; then
    echo "→ Cloning $name from $url"
    git clone --depth 1 "$url" "$dir"
  else
    echo "→ Updating $name"
    git -C "$dir" pull --ff-only
  fi
}

clone_or_update docraftr  https://github.com/Narcis13/docraftr.git
clone_or_update glyphrail https://github.com/Narcis13/glyphrail.git
clone_or_update bunbase   https://github.com/Narcis13/bunbase.git
clone_or_update robun     https://github.com/Narcis13/robun.git
clone_or_update takt-brn  https://github.com/Narcis13/brn.git

# --- Sparse clone for alteramens (only wiki/ needed for faber) --------

FABER_DIR="_sources/alteramens"
if [ ! -d "$FABER_DIR" ]; then
  echo "→ Sparse cloning alteramens (wiki/ only)"
  git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/Narcis13/alteramens.git "$FABER_DIR"
  git -C "$FABER_DIR" sparse-checkout set wiki
else
  echo "→ Updating alteramens (sparse)"
  git -C "$FABER_DIR" pull --ff-only
fi

# --- Summary ----------------------------------------------------------

echo ""
echo "Sources ready:"
ls -la _sources/
echo ""
echo "Commits fetched:"
for d in _sources/*/; do
  name=$(basename "$d")
  sha=$(git -C "$d" rev-parse --short HEAD 2>/dev/null || echo "n/a")
  echo "  $name: $sha"
done
```

**`.gitignore` addition:**
```
_sources/
```

**Prerequisites pentru rulare:**
- `git` + `bash` (standard)
- Nu e nevoie de `gh auth` (repos PUBLIC)
- Internet access la github.com
- ~500MB disk space pentru toate clone-urile shallow + sparse alteramens

**Scurtături (opțional) pentru dev experience:**

Dacă vrei să lucrezi simultan cu repos originale (e.g., să faci fix upstream în timp ce migrezi), poți înlocui în `_sources/` link-uri simbolice către clone-urile tale existente. Exemple:

```bash
# Dacă ai deja ~/projects/robun/, folosește-l direct:
rm -rf _sources/robun && ln -sfn "$HOME/projects/robun" _sources/robun

# Similar pentru vault-ul alteramens local (dev pe faber):
rm -rf _sources/alteramens && ln -sfn "$HOME/projects/alteramens" _sources/alteramens
```

Nu e cerință — doar optimizare dacă lucrezi activ pe două repos în paralel.

### 16.2 docraftr → `@altera/docs` + `@altera/loom` + `@altera/validators`

**Source:** `_sources/docraftr/`

**Copy operations:**

```bash
# Loom UI (vendored assets, extract to own package)
cp -r _sources/docraftr/vendor/loom/ \
      packages/@altera/loom/vendor/

# Validators (CUI/CNP/IBAN — standalone)
cp -r _sources/docraftr/src/validators/ \
      packages/@altera/validators/src/

# Core types, schemas, registry, conditions (browser-safe)
cp -r _sources/docraftr/src/core/ \
      packages/@altera/docs/src/core/

# 70+ components (read-only + interactive)
cp -r _sources/docraftr/src/components/ \
      packages/@altera/docs/src/components/

# Engine (rendering pipeline)
cp -r _sources/docraftr/src/engine/ \
      packages/@altera/docs/src/engine/

# Loom integration layer (assets.ts, tokens.ts)
cp -r _sources/docraftr/src/loom/ \
      packages/@altera/docs/src/loom/

# Actions + dual adapter — COPY then ADAPT (tenant integration)
cp -r _sources/docraftr/src/actions/ \
      packages/@altera/docs/src/actions/
cp -r _sources/docraftr/src/dual/ \
      packages/@altera/docs/src/dual/
```

**Post-copy adaptations (MANUAL edits):**

- [ ] `packages/@altera/docs/src/core/*.ts` — replace `import { db } from '../db'` cu `import type { DbClient } from '@altera/db'`; pass via `ActionContext`
- [ ] `packages/@altera/docs/src/actions/*.ts` — replace `tenantId: string` default cu inject via `ActionContext.tenantId` (non-optional)
- [ ] `packages/@altera/docs/src/dual/hono-adapter.ts` — integrează cu gateway-ul principal din `apps/altera-server/` (nu creează Hono app separat, doar mount routes)
- [ ] Schema Drizzle migrată în `packages/@altera/db/schema/docs.ts` (tables: `document_templates`, `document_submissions`, `document_renders`)

**Skip (din docraftr):**
- [ ] `src/db/` — schema merge la `@altera/db` (tabele redenumite cu prefix standard)
- [ ] `src/services/` — rescriem minimal cu tenant context explicit (nu preluăm textual)
- [ ] `src/agent/` — agent toolkit rescris complet în `@altera/agent` (tool definitions noi, aliniate cu robun's registry)
- [ ] `bin/docraftr.ts` — CLI entry absorbit în `apps/altera-cli`
- [ ] `showcase-*.html`, `showcase-*.json` — referință only, NU le copy în altera-os

**Expected size after migration:** ~15-20K LOC în `@altera/docs` + `@altera/loom` + `@altera/validators`.

### 16.3 takt → `@altera/tasks` + `@altera/events` (+ admin UI components)

**Source:** `_sources/takt-brn/`

**⚠️ CRITIC:** Repo-ul `brn` conține atât takt (aplicația) cât și framework-ul BRN (`.brn/`, `nightshift.sh`, `thinker.md`). **NU copiem BRN** — e metodologia, nu partea din OS.

**Copy operations:**

```bash
# Event system (core pentru cross-module events)
mkdir -p packages/@altera/events/src/subscribers/
cp _sources/takt-brn/src/src/event-bus.ts        packages/@altera/events/src/
cp _sources/takt-brn/src/src/event-types.ts      packages/@altera/events/src/
cp _sources/takt-brn/src/src/activity-subscriber.ts  packages/@altera/events/src/subscribers/
cp _sources/takt-brn/src/src/notification-subscriber.ts  packages/@altera/events/src/subscribers/

# Real-time managers (mount în server app)
mkdir -p apps/altera-server/src/realtime/
cp _sources/takt-brn/src/src/sse-manager.ts      apps/altera-server/src/realtime/
cp _sources/takt-brn/src/src/ws-manager.ts       apps/altera-server/src/realtime/

# Trigger engine (core pentru automations)
cp _sources/takt-brn/src/src/trigger-engine.ts   packages/@altera/tasks/src/

# CLI commands — renamed & restructured
mkdir -p apps/altera-cli/src/commands/tasks/
for cmd in board column card label comment notification artifact trigger search; do
  cp "_sources/takt-brn/src/cli-${cmd}.ts" \
     "apps/altera-cli/src/commands/tasks/${cmd}.ts"
done
cp _sources/takt-brn/src/cli-utils.ts \
   apps/altera-cli/src/commands/tasks/_utils.ts

# HTTP routes (mount în server)
cp _sources/takt-brn/src/src/routes.ts \
   apps/altera-server/src/routes/tasks.ts

# React UI components (tasks section of admin)
mkdir -p apps/altera-admin/src/pages/tasks/
cp -r _sources/takt-brn/src/src/ui/ \
      apps/altera-admin/src/pages/tasks/ui/
# Keep: BoardView, BoardList, CalendarView, CardModal, QuickCreatePopover,
#       BoardArtifacts, TriggerManager, NotificationBell, api.ts
# Skip: LoginPage (we have central auth), App.tsx, index.tsx (admin app has its own)

# Date utilities
cp _sources/takt-brn/src/src/date-utils.ts \
   packages/@altera/tasks/src/

# DB schema (adapt, don't copy-paste)
# Reference: _sources/takt-brn/src/src/db.ts — extrage schema în Drizzle
```

**Post-copy adaptations (MANUAL edits):**

- [ ] `packages/@altera/events/src/event-types.ts` — extinde discriminated union cu events cross-module: `file.uploaded`, `entity.classified`, `workflow.completed`, `report.rendered`, etc.
- [ ] `packages/@altera/events/src/event-bus.ts` — adaugă mod persistent (write la `events` table) alături de in-memory
- [ ] Toate CLI commands — schimbă `loadSession()` la middleware nou `requireAuth()` din `@altera/auth`
- [ ] `routes/tasks.ts` — adaugă `tenant` middleware la toate rutele
- [ ] Schema DB: toate tabelele adaugă `tenant_id` column + index
- [ ] UI components — schimbă `api.ts` base URL să matcheze gateway-ul unified
- [ ] Elimină auth pages (LoginPage.tsx) — folosim auth central

**Skip (din takt-brn):**
- [ ] `.brn/` — framework BRN (ideologie de build, nu cod al OS-ului)
- [ ] `.brn/specs/`, `.brn/vault/`, `.brn/history/`, `.brn/archive/`
- [ ] `nightshift.sh`, `thinker.md`
- [ ] `TAKT_CLI_GUIDE.md` — reference only, NOT copied
- [ ] `CLAUDE.md` (BRN coding rules) — altera-os has its own
- [ ] Auth tables (users, sessions din takt) — folosim `@altera/auth`

**Expected size after migration:** ~10-12K LOC în `@altera/tasks` + `@altera/events`.

### 16.4 bunbase → `@altera/collections` + auth + admin UI patterns

**Source:** `_sources/bunbase/`

**Strategy:** Pull SELECTIVE — nu preluăm BaaS-ul complet (e over-scope). Doar patterns reutilizabile.

**Copy operations:**

```bash
# Schema-in-database pattern (pentru structured promotion)
mkdir -p packages/@altera/collections/src/
cp _sources/bunbase/src/core/database.ts \
   packages/@altera/collections/src/database.ts
cp _sources/bunbase/src/core/schema.ts \
   packages/@altera/collections/src/schema.ts
cp _sources/bunbase/src/core/records.ts \
   packages/@altera/collections/src/records.ts
cp _sources/bunbase/src/core/hooks.ts \
   packages/@altera/collections/src/hooks.ts
cp _sources/bunbase/src/core/query.ts \
   packages/@altera/collections/src/query.ts
cp _sources/bunbase/src/core/validation.ts \
   packages/@altera/collections/src/validation.ts

# Auth patterns — EXTRACT (nu copy direct)
# Reference: _sources/bunbase/src/auth/ pentru:
#   - JWT flow cu refresh rotation
#   - argon2 hashing
#   - Auth rules engine (null/''/expression)
# Adaptăm în packages/@altera/auth/ (rescris, nu copy)

# Admin UI components (React)
mkdir -p apps/altera-admin/src/pages/collections/
cp -r _sources/bunbase/src/admin/ \
      apps/altera-admin/src/pages/collections/
# Cherry-pick: RecordsList, RecordForm, CollectionSchema, FieldEditor
# Skip: full admin shell (we have our own), Settings pages (we have our own)

# Storage patterns (files)
cp _sources/bunbase/src/storage/validation.ts \
   packages/@altera/core/src/files/validation.ts
# Rest of storage rescris simplu: filesystem per tenant
```

**Post-copy adaptations:**

- [ ] Remove dependency pe `bunbase`-specific types; folosește `@altera/core` types
- [ ] Auth rules engine: simplificat pentru MVP (doar `admin`/`user`/`public`); expression parser Phase 2
- [ ] Collections: `tenant_id` în toate tabelele generate runtime
- [ ] Record routes auto-generated — mount sub `/api/collections/:slug`

**Skip (din bunbase):**
- [ ] `src/api/` — avem Hono propriu
- [ ] `src/email/` — simplu port când e nevoie
- [ ] `src/realtime/` — avem SSE/WS din takt
- [ ] `cli.ts` — avem CLI unified
- [ ] Teste — adaptăm propriile
- [ ] Binary compile logic — folosim la nivel de `altera-os` root

**Expected size after migration:** ~3-5K LOC în `@altera/collections` + patterns răspândite în `@altera/auth`, `@altera/core`.

### 16.5 glyphrail → `@altera/flows`

**Source:** `_sources/glyphrail/`

**Strategy:** Pull ~100% — zero runtime deps, compact, solid. Doar adaptăm storage layer.

**Copy operations:**

```bash
# Entire src/ tree
cp -r _sources/glyphrail/src/cli/      packages/@altera/flows/src/cli/
cp -r _sources/glyphrail/src/core/     packages/@altera/flows/src/core/
cp -r _sources/glyphrail/src/dsl/      packages/@altera/flows/src/dsl/
cp -r _sources/glyphrail/src/tools/    packages/@altera/flows/src/tools/
cp -r _sources/glyphrail/src/agent/    packages/@altera/flows/src/agent/
cp -r _sources/glyphrail/src/config/   packages/@altera/flows/src/config/

# Templates (init, workflow, tool scaffolding)
cp -r _sources/glyphrail/templates/    packages/@altera/flows/templates/

# Test fixtures pentru referință
cp -r _sources/glyphrail/test/         packages/@altera/flows/test/
```

**Post-copy adaptations:**

- [ ] `src/core/run-storage.ts` — REWRITE: storage în DB (`workflow_runs`, `workflow_traces`, `workflow_checkpoints`) în loc de `.glyphrail/runs/run_<id>/`
  - API-ul rămâne similar (load/save run, append trace)
  - Păstrează JSONL trace format (serialized la `workflow_traces.payload_json`)
- [ ] `src/agent/mock-adapter.ts` — păstrat pentru teste
- [ ] **ADD** `src/agent/claude-adapter.ts` — implementează `AgentAdapter` folosind `@altera/agent` (cu sanitization wrapper)
- [ ] `src/config/` — integrare cu `@altera/core` config (tenant-aware config discovery)
- [ ] CLI commands — mount în `apps/altera-cli/src/commands/flows/` (wraps package CLI)

**No skip** — glyphrail e compact și self-contained.

**Expected size after migration:** ~8-10K LOC în `@altera/flows`.

### 16.6 robun → `@altera/agent`

**Source:** `_sources/robun/` (clonat din `github.com/Narcis13/robun`)

**Strategy:** Pull selectively — agentul core e esențial, channels reduse drastic.

**Copy operations:**

```bash
# Agent core
mkdir -p packages/@altera/agent/src/
cp _sources/robun/src/agent/loop.ts         packages/@altera/agent/src/loop.ts
cp _sources/robun/src/agent/context.ts      packages/@altera/agent/src/context.ts
cp _sources/robun/src/agent/memory.ts       packages/@altera/agent/src/memory.ts
cp _sources/robun/src/agent/skills.ts       packages/@altera/agent/src/skills.ts
cp _sources/robun/src/agent/subagent.ts     packages/@altera/agent/src/subagent.ts

# Message bus (for channels)
cp -r _sources/robun/src/bus/               packages/@altera/agent/src/bus/

# Tool registry + tools
cp -r _sources/robun/src/tools/             packages/@altera/agent/src/tools/

# Providers (KEEP only MultiProvider for Anthropic; drop CodexProvider OAuth)
mkdir -p packages/@altera/agent/src/providers/
cp _sources/robun/src/providers/multi-provider.ts \
   packages/@altera/agent/src/providers/multi-provider.ts
cp _sources/robun/src/providers/base.ts \
   packages/@altera/agent/src/providers/base.ts
# Skip: codex-provider.ts (ChatGPT OAuth), and the 11 other specific providers for Phase 1

# Session persistence
cp -r _sources/robun/src/session/           packages/@altera/agent/src/session/

# Config (adapt)
cp _sources/robun/src/config/schema.ts      packages/@altera/agent/src/config/schema.ts

# Channels — KEEP ONLY WEB + TELEGRAM (Phase 2); Phase 1 just web chat
mkdir -p packages/@altera/agent/src/channels/
cp _sources/robun/src/channels/base.ts      packages/@altera/agent/src/channels/base.ts
# Web channel: to be written new (WS-based, integrated with admin UI)
# Telegram: defer to Phase 2
#   cp _sources/robun/src/channels/telegram.ts  packages/@altera/agent/src/channels/telegram.ts

# Skills — robun skills as reference (our own will live in /skills/ root)
cp -r _sources/robun/src/skills/            docs/reference/robun-skills/
```

**Post-copy adaptations:**

- [ ] `memory.ts` — rewrite storage: MEMORY.md/HISTORY.md → DB tables (`agent_memory` with scope, conversations, messages)
- [ ] `skills.ts` — adapt loader să citească din `/skills/` root + from DB (`skills_registry`)
- [ ] `context.ts` — injecteaz tenant_id în system prompt; citește tenant settings
- [ ] Toate LLM calls — wrap cu sanitization middleware din `@altera/sanitize`
- [ ] `subagent.ts` — integrare cu `@altera/flows` (subagent = workflow spawn?)
- [ ] Tool registry — adaugă tools specifice Altera (query-entities, set-attribute, docraftr-render, etc.)

**Skip (din robun):**
- [ ] Channels: Discord, WhatsApp, Slack, Email, Feishu, DingTalk, QQ, Mochat (7 canale) — Phase 3+ if ever
- [ ] `cron/` — replaced by glyphrail scheduled workflows
- [ ] `heartbeat/` — not relevant for OS runtime
- [ ] `server.ts` — avem Hono propriu
- [ ] CLI commands — mount în `apps/altera-cli/src/commands/agent/`
- [ ] NANOBOT_TS_GUIDE.md, PROVIDER_GUIDE.md — reference only

**Expected size after migration:** ~8-12K LOC în `@altera/agent`.

### 16.7 faber → `@altera/wiki`

**Source:** `_sources/alteramens/wiki/` (sparse clone din `github.com/Narcis13/alteramens`, doar subdirectorul `wiki/`)

**Strategy:** Port Python `faber_sync.py` → TypeScript. Hybrid model (MD files truth + DB index derivat).

**Copy operations:**

```bash
# FABER.md schema as reference (but don't copy verbatim)
cp _sources/alteramens/wiki/FABER.md \
   packages/@altera/wiki/docs/faber-schema-reference.md

# Python sync script as implementation reference
cp _sources/alteramens/wiki/faber_sync.py \
   packages/@altera/wiki/docs/faber_sync.py.reference.py

# Existing wiki content: Narcis decides if import into OS tenant OR keep separate
# Recommendation: For hospital tenant, START EMPTY (different knowledge domain)
# For personal Alteramens tenant, option to import later via migration script (wiki/
#   from _sources/alteramens/wiki/sources|entities|concepts|syntheses/)
```

**Implementation tasks (rewrite in TS):**

- [ ] `packages/@altera/wiki/src/schema.ts` — Zod schemas pentru frontmatter (Source, Entity, Concept, Synthesis)
- [ ] `packages/@altera/wiki/src/sync.ts` — port Python script la TypeScript:
  - Parse MD files din tenant's wiki dir (`./data/{tenant_id}/wiki/`)
  - Extract frontmatter + body + wikilinks + key claims
  - Upsert în DB (`wiki_pages`, `wiki_relations`, `wiki_key_claims`)
  - Rebuild FTS tables
  - Parse `log.md` → `wiki_log_events`
  - Idempotent: drop+recreate derived tables, preserve `sync_log` history
- [ ] `packages/@altera/wiki/src/ingest.ts` — flow ingest (skill `faber-ingest`) creates source + extracts entities/concepts
- [ ] `packages/@altera/wiki/src/query.ts` — FTS + relation traversal
- [ ] `packages/@altera/wiki/src/lint.ts` — orphans, contradictions, thin pages, phantoms detection
- [ ] `packages/@altera/wiki/src/brief.ts` — wake-up briefing query (port `/faber-brief` logic)

**Architecture decision — MD files vs DB only:**

**Recommended: Hybrid (keep MD files as truth, DB derivat):**

- ✅ Git history works (wiki = git-managed per tenant)
- ✅ Portable (tenant can export wiki dir)
- ✅ Readable fără app (just markdown)
- ✅ Compatible with Obsidian / VS Code editors
- ❌ Sync overhead pe fiecare update (but <200ms pentru wiki-uri mari)
- ❌ Sursa dublă (dar MD = single source of truth)

**Alternative: DB-only:**
- ✅ Fără sync
- ✅ Queries instant
- ❌ Pierdem git history per-page
- ❌ Greu de editat fără app

**Decision:** **Hybrid**. Per tenant: `./data/{tenant_id}/wiki/` cu MD files + DB index rebuilt on change (file watcher sau explicit `faber-sync`).

**Location decisions:**

- Hospital tenant wiki: fresh start, populate via ingest
- Personal Alteramens wiki: stays în `~/projects/alteramens/wiki/` (vault-bound); optional import script pentru Altera OS tenant separat

**Skip:**
- [ ] Skill files `.claude/skills/faber-*` — reimplementează ca agent skills în `/skills/` root (markdown + frontmatter robun format)
- [ ] `slides/` auto-generation — Phase 2+

**Expected size after migration:** ~2-4K LOC în `@altera/wiki`.

### 16.8 Loom UI → `@altera/loom`

**Source:** `_sources/docraftr/vendor/loom/` (already vendored în docraftr)

**Strategy:** Extract vendored copy into standalone package.

**Copy operations:**

```bash
# Vendored Loom (CSS + JS + asset loader)
mkdir -p packages/@altera/loom/vendor/
cp -r _sources/docraftr/vendor/loom/* \
      packages/@altera/loom/vendor/

# Create thin TypeScript wrapper
# packages/@altera/loom/src/index.ts — exports for:
#   - getLoomCss(): string
#   - getLoomJs(): string
#   - mapThemeTokens(theme): CssVars
```

**Expected size:** ~2-3K LOC în `@altera/loom`.

### 16.9 Migration Timing within Sprints

| Sprint | Migration tasks |
|---|---|
| Sprint 1 | None (foundation only). Create `scripts/fetch-sources.sh`. |
| Sprint 2 | `takt` → `@altera/events` (event-bus.ts, event-types.ts, subscribers) + realtime managers |
| Sprint 3 | None (ingest is new code). Maybe pull small utilities. |
| Sprint 4 | None (sanitize is new code). |
| Sprint 5 | `robun` → `@altera/agent` (agent core + tools + providers trimmed) |
| Sprint 6 | `docraftr` → `@altera/docs` + `@altera/loom` + `@altera/validators`; `glyphrail` → `@altera/flows` |
| Sprint 7 | `takt` UI components → admin app (board, calendar, etc.) |
| Sprint 8 | `faber` port → `@altera/wiki` (initial sync + ingest) |
| Phase 2 | `bunbase` patterns → `@altera/collections`; remaining `takt` features |

### 16.10 Safety & Verification

**Before each migration batch:**

1. **Verify upstream state:**
   ```bash
   git -C _sources/<project> log -1 --oneline
   ```
   Log commit SHA în `docs/migrations/<module>.md` pentru traceability.

2. **Dry-run diff:**
   After copying, run `bun run typecheck` pentru a identifica imports stricate. Fix în adaptation step.

3. **Smoke test:**
   Fiecare package are un smoke test rapid (e.g., `@altera/events` poate emit + consume un event). Sprint complete = smoke tests pass.

4. **License check:**
   All source repos sunt MIT (verified în frontmatter). No licensing issues.

5. **Per-file attribution (optional):**
   Pentru transparență, păstrează un header comment în fișiere preluate:
   ```typescript
   // Originally from github.com/Narcis13/<project>, commit <sha>, migrated 2026-XX-XX
   ```

### 16.11 Progressive Migration Philosophy

**Important:** Claude Code nu trebuie să migreze TOTUL în Phase 1. Principiul e **"pull what you need when you need it"**:

- Sprint N needs feature X → migrate X in Sprint N, adapt it, test it, move on
- Nu preluăm proactiv cod "just in case"
- Dacă o capability nu e necesară în Phase 1 (ex: Telegram channel, calendar view), nu o migra acum
- `_sources/` rămâne intact ca referință pentru Phase 2/3

Acest aproach:
- Minimizează surface area de debug
- Permite incremental adaptation
- Nu leagă planul de decizii premature

---

## 17. Success Metrics (pe fază)

### Phase 1

- ✅ Binary `altera` runs on hospital server
- ✅ Admin user + first colleague account created
- ✅ 15+ documente Q1 reale ingestate
- ✅ `Generate Q1 report` flow produces publishable HTML in <10min
- ✅ Zero PII leaks (audit log clean)
- ✅ Narcis signs off pe raport — "acceptable, better than manual"

### Phase 2

- ✅ 3+ use cases active la spital
- ✅ 5+ colegi activi (cu activity log tracking)
- ✅ Schema promotion: 1-2 collections auto-suggested + applied
- ✅ 100+ entities ingestate cumulate
- ✅ Glyphrail workflows: 5+ definite, 50+ runs
- ✅ Agent invocations: 500+ cu success rate >90%

### Phase 3

- ✅ Landing page live + docs site
- ✅ 1 paying customer ($$/month) signed
- ✅ Self-hosted Docker image disponibil
- ✅ GitHub repo public cu 50+ stars (optional)
- ✅ 1K MRR path clarificat (even if not hit yet)

---

## 18. Philosophical Alignment Check

Aplicând cele 4 criterii din `CLAUDE.md`:

| Criteriu | Altera OS check |
|---|---|
| **Has leverage?** | ✅ O DB schema → HTTP + CLI + Agent + Chat + MCP. Skills compose → infinite workflows. |
| **Compounds?** | ✅ Each ingested doc enriches EAV + wiki. Each skill written helps the next task. Templates auto-reused. |
| **Authentic?** | ✅ Built on pain you live (hospital IT). Validated daily la job. Cannot be competed on being-you. |
| **Encodes judgment (not just functionality)?** | ✅ Classification taxonomy, sanitization policy, schema promotion heuristics, workflow orchestration — all judgment calls encoded, not API wrappers. |

**Skill Era alignment:** Maximum. Each skill = encoded judgment, each tool = capability, agent orchestrates. Distribution via MCP (post-Phase 3) makes Altera skills addressable by other agents globally.

**Productize Yourself alignment:** Maximum. Your specific knowledge (IT spital + dev patterns RO) + leverage (AI-augmented coding) + judgment (architecture decisions documented as ADRs) + accountability (deployed at real hospital, real users).

---

## 19. Ready for Claude Code

Acest document este suficient de detaliat pentru a fi executat de Claude Code iterativ. Sprint-urile 1-8 sunt descompuse în task-uri atomice cu acceptance criteria. Schema DB e completă. Arhitectura e clară. Secțiunea 16 conține inventar operațional cu căi absolute și comenzi copy-paste.

**Prerequisites verificabile (toate repos sunt PUBLIC):**

```bash
# Internet + git basic
git --version
curl -sf https://api.github.com/repos/Narcis13/docraftr > /dev/null && echo "✓ GitHub reachable"

# Toate 6 repos accesibile anonim
for repo in docraftr glyphrail brn bunbase robun alteramens; do
  curl -sf "https://api.github.com/repos/Narcis13/$repo" > /dev/null \
    && echo "✓ Narcis13/$repo" \
    || echo "✗ Narcis13/$repo UNREACHABLE"
done
```

**Primul pas concret (Sprint 1 bootstrap):**

```bash
# 1. Create new repo
mkdir -p ~/projects/altera-os && cd ~/projects/altera-os
git init
bun init -y

# 2. Add .gitignore
cat > .gitignore <<'EOF'
node_modules/
*.log
.env*
!.env.example
data/
dist/
_sources/
*.db
*.db-shm
*.db-wal
EOF

# 3. Start Claude Code with the spec
claude
```

Apoi prompt-ul pentru Claude Code:

> Citește `/Users/narcisbrindusescu/projects/alteramens/workshop/ideas/altera-os.md` — planul Altera OS. Suntem în directorul nou `~/projects/altera-os/` gol (doar `.gitignore` și `package.json` init). Implementează Sprint 1 (tasks S1.1 — S1.8 din secțiunea 8 a planului). Pentru fiecare task: commit atomic cu mesaj `feat(sprint1): <task>` și confirmă AC înainte de a trece la următorul. La finalul sprint-ului, creează și `scripts/fetch-sources.sh` conform secțiunii 16.1, dar NU rula script-ul — îl rulăm la început de Sprint 2.

**Iteration cadence:**

- **Săptămânal:** Review sprint complete, blockers identified, merge la `main`.
- **La sfârșit Sprint 1:** Narcis rulează `bun run dev`, verifică că server + admin UI funcționează local, creează primul admin user. Dacă OK → green light Sprint 2.
- **La sfârșit Sprint 2 (migration start):** Narcis rulează `scripts/fetch-sources.sh`, verifică că `_sources/` e populat. Claude Code începe migrarea per planul 16.2+.
- **La sfârșit Sprint 8:** Demo live raport trimestrial cu date reale → Phase 1 complete.

---

*Document version: 1.2 — 2026-04-18*
*Changelog:*
*- v1.0 (2026-04-18): Initial comprehensive plan*
*- v1.1 (2026-04-18): Section 16 rewritten with operational migration instructions — exact source paths, bootstrap script, per-module copy commands*
*- v1.2 (2026-04-18): Unified source strategy — all 6 repos PUBLIC on github.com/Narcis13; faber sourced via sparse checkout of alteramens repo's wiki/ subdirectory; robun via regular clone (no symlink fallback required)*

*Next review: după Sprint 1 completion.*
