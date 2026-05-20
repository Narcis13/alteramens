---
title: Personal Context Agent — Plan: Turso Cloud Sync (embedded replicas)
date: 2026-05-20
status: planning
supersedes: —
related:
  - STATE.md (§11 Arc 3 — cross-device sync)
  - prd-mvp.md
  - code/packages/core/src/store.ts
  - code/packages/core/src/schema/migrations/
  - code/packages/mcp-server/src/index.ts
---

# Plan — Turso Cloud Sync via Embedded Replicas

> **One-line:** Switch `@pca/core` from `bun:sqlite` to `@libsql/client` in
> **embedded-replica** mode so the local `~/.pca/store.db` syncs bidirectionally
> with a remote Turso database. Result: ctx-add/get_self_summary lucrează identic
> de pe laptopul de acasă și de pe cel de la spital, iar cele 15 entități +
> 20 events existente migrează ca data de pornire.

---

## 0. Why this exists

Astăzi `~/.pca/store.db` e un fișier local, separat pe fiecare mașină. Asta
înseamnă două vieți paralele:

- "Narcis de la spital" (08:00–15:00, problemele de zi)
- "Narcis de acasă" (după program, Alteramens / build mode)

PCA-ul trebuia să fie *un singur* model al lui Narcis. Două DB-uri = două
modele divergente. La fiecare interacțiune cu Claude trebuie să te întrebi
"oare laptopul ăsta știe X?" → defectează exact promisiunea PCA-ului.

Soluția cea mai curată e Turso embedded-replicas: libsql menține un fișier
SQLite local (citirile rămân instant, offline funcționează), iar în
background-ul clientului se face push/pull cu un libsql remote pe Turso.

Acesta este Arc 3 din STATE.md ("SaaS / multi-device") — primul pas concret.

---

## 1. Goals

- `~/.pca/store.db` (sau echivalent) devine o *replică embedded* a unui DB
  remote `pca-prod` pe Turso. Scrierile se propagă la remote; citirile vin de
  local.
- Cele 15 entități + 2 linkuri + 20 events existente pe laptopul de acasă sunt
  migrate o singură dată în remote, devenind starea canonică.
- Laptopul de la spital, după setup, primește exact aceleași date prin sync.
- `bun test` rămâne verde pe toată suita (core + cli + mcp).
- MCP server pornește, ctx-add scrie, ctx review citește — fără regresiuni
  funcționale.
- Setup-ul pe o mașină nouă = clonare repo + `.env` cu credentiale + `bun
  install` + prima sincronizare automată la pornirea MCP-ului.
- Tokenul Turso trăiește **numai** în `code/.env` (gitignored). Nu intră în
  git, nu intră în settings.json, nu intră în memorie.

## 2. Non-goals (this plan)

- **Multi-user / multi-tenant Turso** — un singur cont, un singur DB. Faber
  framework distribuit (`project_faber_distribution`) e altă bătălie.
- **Conflict resolution complex** (CRDT, vector clocks, etc.) — Turso
  embedded-replicas folosește un model "last-writer-wins per row" cu un
  generation counter. Acceptăm asta. Mitigare: nu scriem simultan din 2 locuri
  (vezi §6 risc).
- **Encryption at rest** pe Turso — Turso criptează la nivelul lor; nu adăugăm
  un strat suplimentar de aplicație în iterația asta.
- **Migrare automată "merge" între DB-ul de acasă și cel de la spital** — DB-ul
  de la spital se sacrifică (decizie luată 2026-05-20 cu Narcis). Va deveni
  oglinda celei de acasă după primul sync.
- **Rollback automat la sqlite local-only** — dacă embedded-replica explodează,
  rollback se face manual prin checkout pe commit anterior. Acceptabil pentru
  un solo-dev project.
- **CLI command `pca sync`** ca prim-class verb — sync-ul e managed de libsql
  client automat. Eventual adăugăm un `pca sync now` / `pca sync status` mai
  târziu dacă apare nevoia.

## 3. Design decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Embedded replica, NU remote-only.** `url = file:~/.pca/local-replica.db`, `syncUrl = libsql://pca-prod-narcis13.turso.io`, `authToken = $TURSO_AUTH_TOKEN`. | Citirile rămân locale (rapide, offline funcționează). Scrierile merg la remote și replică înapoi. Standard Turso pattern pentru desktop apps. Vezi [Turso embedded replicas docs](https://docs.turso.tech/features/embedded-replicas/introduction). |
| D2 | **API-ul `Store` devine async.** Toate cele ~30 metode publice (createEntity, getEntity, listActive, ...) returnează `Promise<...>`. | `@libsql/client` e exclusiv async. Nu există shim sincron decent. Refactor-ul e mecanic. |
| D3 | **`openStore` devine `async function openStore(opts)`** și acceptă `{ url, syncUrl?, authToken?, syncInterval? }`. Default: dacă lipsește `syncUrl`, e local-only (backward compat pentru teste). | Testele nu trebuie să atingă rețeaua. `withTempStore()` rămâne local-only, fără syncUrl. |
| D4 | **Migrațiile rulează exact ca acum** (versiune + idempotență prin `schema_migrations`), dar via `client.batch([...])` în loc de `db.exec(sql)`. | Funcția `runMigrations` se rescrie să folosească libsql. Versionarea e identică. |
| D5 | **Path-ul replicii locale: `~/.pca/local-replica.db`** (nu rescriem peste `store.db`). | Lăsăm `store.db` actual ca backup; după ce confirmăm syncul, îl putem șterge. Numele "local-replica" e auto-documentar. |
| D6 | **Credentialele se citesc din `code/.env`** (Bun îl încarcă automat când rulezi `bun run`). Variabile: `TURSO_DB_URL`, `TURSO_AUTH_TOKEN`, opțional `PCA_LOCAL_REPLICA` pentru override. | Bun.env nativ + `.env` gitignored. Zero infrastructură nouă. |
| D7 | **PRAGMA-urile actuale (WAL, foreign_keys, busy_timeout) devin no-op sau se traduc.** libsql ignoră WAL (replication-driven), păstrează FK ON prin default config. | libsql nu suportă pragma WAL ca SQLite obișnuit. Documentăm asta. |
| D8 | **Sync interval default: 60 secunde**, override prin `PCA_SYNC_INTERVAL_SEC`. La pornirea MCP-ului facem un `await store.sync()` explicit ca să nu pornim cu date stale. | 60s e suficient pentru workflow-ul ăsta (scrii odată la câteva minute). Sync explicit la boot evită "deschid Claude pe celălalt laptop și văd context vechi". |
| D9 | **Niciun "merge" — DB-ul de la spital se sacrifică.** Backup la `~/.pca/store.db.bak-pre-turso-YYYYMMDD` înainte de cutover. | Confirmat de Narcis 2026-05-20. Cele 15 entități de aici sunt canonice. |
| D10 | **Migrarea datelor existente e un script separat one-shot** (`scripts/migrate-to-turso.ts`), nu logică inline în `openStore`. | Separare clară între "schema bootstrap" (idempotent, mereu rulează) și "data backfill" (rulează o singură dată). |

## 4. Architecture impact map

```
┌─────────────────────────────────────────────────────────────────┐
│                       Laptop acasă                              │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ Claude Code │ →  │ pca-mcp      │ →  │ @pca/core       │    │
│  │ (stdio MCP) │    │ server (TS)  │    │ openStore()     │    │
│  └─────────────┘    └──────────────┘    └────────┬────────┘    │
│                                                  │              │
│                                          ┌───────▼────────┐    │
│                                          │ @libsql/client │    │
│                                          │ embedded mode  │    │
│                                          └───┬────────┬───┘    │
│                                              │        │        │
│                            local reads ──────┘        │        │
│                                              ┌────────▼───┐    │
│                                              │ local-      │    │
│                                              │ replica.db  │    │
│                                              └────────┬────┘    │
└────────────────────────────────────────────────────────│────────┘
                                                         │ sync (every 60s
                                                         │  + on boot + on write)
                                                         ▼
                              ┌──────────────────────────────────┐
                              │  Turso cloud (libsql://...)      │
                              │  pca-prod-narcis13.turso.io      │
                              └──────────────────────────────────┘
                                                         ▲
                                                         │ sync
┌────────────────────────────────────────────────────────│────────┐
│                       Laptop spital                    │        │
│                                            ┌───────────▼────┐  │
│                                            │ local-replica   │  │
│                                            │ .db (oglindă)   │  │
│                                            └──────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Files touched (estimate):**

| Layer | Files | Change kind |
|---|---|---|
| `@pca/core` | `package.json` | + `@libsql/client` dep |
| `@pca/core` | `src/store.ts` | rewrite: sync→async, swap driver |
| `@pca/core` | `src/index.ts` | adapt export signatures |
| `@pca/core` | `tests/helpers.ts` | async `withTempStore` |
| `@pca/core` | `tests/*.test.ts` (4) | add await |
| `@pca/cli` | `src/ctx.ts`, `src/pca.ts` | await `openStore` |
| `@pca/cli` | `src/ctx-commands/*.ts` (2) | await store calls |
| `@pca/cli` | `src/pca-commands/*.ts` (4) | await store calls |
| `@pca/cli` | `tests/*.test.ts` (8) | add await |
| `@pca/mcp-server` | `src/index.ts` | dotenv + async open + initial sync |
| `@pca/mcp-server` | `src/handlers.ts` | toate handler-ele devin async (deja sunt în SDK probabil) |
| `@pca/mcp-server` | `tests/*.test.ts` (3) | add await |
| (root) | `code/.env.example` | + template |
| (root) | `code/.gitignore` | + `.env` |
| (root) | `scripts/migrate-to-turso.ts` | NEW |

Total estimat: ~25 fișiere, 90% modificări mecanice (await/async).

---

## 5. Implementation plan (faze + acceptance criteria)

### Phase 0 — Provisioning Turso (manual, 30 min)

**Owner:** Narcis (necesită browser + CLI auth).

**Steps:**
1. Instalează Turso CLI: `brew install tursodatabase/tap/turso`
2. `turso auth signup` (sau `login`) — folosește contul GitHub
3. `turso db create pca-prod --location fra` (Frankfurt = cel mai aproape de RO)
4. `turso db show pca-prod --url` → copiezi URL-ul `libsql://...`
5. `turso db tokens create pca-prod --expiration none` → copiezi tokenul
6. Creezi `code/.env`:
   ```
   TURSO_DB_URL=libsql://pca-prod-XXXX.turso.io
   TURSO_AUTH_TOKEN=eyJhbGciOi...
   PCA_LOCAL_REPLICA=/Users/narcisbrindusescu/.pca/local-replica.db
   PCA_SYNC_INTERVAL_SEC=60
   ```
7. Verifici că `code/.gitignore` conține `.env` (dacă nu, adaugi)
8. Creezi `code/.env.example` (committed) cu aceleași chei dar valori `<your-...>`

**Acceptance:**
- `turso db shell pca-prod` se conectează și acceptă `SELECT 1;`
- `code/.env` există local, NU apare în `git status`
- `code/.env.example` apare în `git status` (de adăugat)

**Commit:** `turso: scaffold .env.example + gitignore (no code yet)`

---

### Phase 1 — Backup + freeze (15 min) ✅ DONE 2026-05-20 18:47

Înainte de orice modificare de cod.

> **Path correction (2026-05-20):** DB-ul canonic NU e `~/.pca/store.db` (gol — DB-ul pe care MCP-ul Claude Code îl folosește azi prin `PCA_DB=~/.pca/store.db` din `~/.claude.json`). DB-ul cu cele **15 entities + 2 links + 20 events** trăiește la `projects/personal-context-agent/data/store.db`. Backup-ul Phase 1 țintește acest path; orice referință la `~/.pca/store.db` în Phase 4 + Phase 6 trebuie citită ca `projects/.../data/store.db`. La Phase 3b va trebui realiniat `PCA_DB` din MCP config (sau înlocuit cu flow Turso).

**Steps (executed):**
1. `cp projects/personal-context-agent/data/store.db projects/personal-context-agent/data/store.db.bak-pre-turso-20260520-184714` — backup atomic, sha256 identic cu originalul (`07b9544e...`). DB-ul nu era deschis de niciun proces, deci `cp` clasic e safe (nu a fost nevoie de `sqlite3 .backup`).
2. `sqlite3 …/data/store.db .schema > /tmp/pca-schema-snapshot.sql` — 238 linii.
3. Counts per tabel (corect — query-ul original `FROM entities, links, events, captures` ar fi produs un cross-join):
   ```
   entities: 15   links: 2   events: 20   captures: 0
   ```
4. MCP server-ul Claude Code (PID 4640) rulează pe `~/.pca/store.db` (DB-ul gol), **nu** pe DB-ul canonic — deci nu trebuie oprit pentru Phase 1. Va trebui oprit/reconfigurat la cutover (Phase 3b/4).
5. Anunț celălalt laptop ("nu folosi PCA până nu termin migrarea") — **în sarcina ta**, asincron față de Claude Code.

**Acceptance — met:**
- ✅ `.bak` byte-identic cu originalul (sha256 + size match)
- ✅ Row counts identice pe toate tabelele (15/2/20/0 + schema_migrations=4)
- ✅ `lsof | grep data/store.db` → gol (DB-ul canonic e liber)
- ⏭️ `lsof | grep ~/.pca/store.db` încă raportează PID 4640 (MCP curent) — irelevant, acel DB nu e cel migrat

**Side note — second backup at `~/.pca/store.db.bak-pre-turso-20260520-183739`:** primul backup făcut greșit pe DB-ul gol (`~/.pca/store.db`). De șters la Phase 6 cleanup.

---

### Phase 2 — `@pca/core` switch to libsql (4–5h, partea grea)

Aici e munca reală. Două commit-uri logice ar fi ideale: (2a) rewrite `store.ts`, (2b) update tests.

#### Phase 2a — Rewrite `store.ts`

**Steps:**

1. `cd code && bun add @libsql/client -w packages/core` (sau echivalent workspace add)
2. În `store.ts`:
   - Înlocuiește `import { Database } from "bun:sqlite"` cu
     `import { createClient, type Client, type InValue } from "@libsql/client"`
   - Schimbă `openStore(dbPath: string)` → `async function openStore(opts: OpenStoreOptions)` unde:
     ```typescript
     export type OpenStoreOptions = {
       url: string;              // local file: "file:..." OR remote "libsql:..."
       syncUrl?: string;         // remote URL când url e local replica
       authToken?: string;
       syncInterval?: number;    // secunde; default 60 dacă syncUrl prezent
     };
     ```
   - Helper `createClient(opts)` decide între:
     - local-only: `createClient({ url: opts.url })`
     - embedded replica: `createClient({ url: opts.url, syncUrl, authToken, syncInterval })`
   - La boot, dacă e embedded: `await client.sync()` o singură dată ca să nu pornim cu date stale.
3. Rescrie fiecare metodă:
   - `db.prepare(sql).run(...args)` → `await client.execute({ sql, args })`
   - `db.prepare(sql).get(...args)` → `(await client.execute({ sql, args })).rows[0] ?? null`
   - `db.prepare(sql).all(...args)` → `(await client.execute({ sql, args })).rows`
   - `db.transaction(fn)()` → `const tx = await client.transaction("write"); try { ...; await tx.commit(); } catch (e) { await tx.rollback(); throw e; }`
   - Atenție: libsql `rows` întoarce `Row` objects, nu plain objects — verifică cast-ul în `rowToEntity`, `rowToLink` etc. Probabil e identic ca formă dar TypeScript se va plânge.
4. `runMigrations`:
   - Rămâne sincron logic, dar IO devine async
   - `client.executeMultiple(sql)` pentru fiecare fișier .sql
   - Drop pragma-urile WAL (libsql nu le folosește); păstrează `PRAGMA foreign_keys = ON` (probabil deja default în libsql)
5. `close()` → `client.close()` (e sync sau async? — verifică în docs; libsql client are `client.close()` sync)
6. **Atenție specială:** funcția `getNeighbors` are query mare cu CASE și params. Verifică că `args` array e construit corect pentru libsql (libsql acceptă array sau object `{ named: ... }`).

**Acceptance pentru 2a:**
- `bun run typecheck` în `code/` întoarce 0 erori (toate consumatorii încă sunt rupți, dar `core` e curat)
- `bun test packages/core` — niciun test încă nu rulează cu succes pentru că `tests/helpers.ts` nu e încă async; OK pentru moment, mergem mai departe

**Commit (2a):** `core: switch store from bun:sqlite to @libsql/client (async API)`

#### Phase 2b — Update `@pca/core` tests

**Steps:**

1. `tests/helpers.ts`:
   - `withTempStore` devine `async function withTempStore()` și returnează `Promise<{ store, cleanup, dbPath }>`
   - Folosește `url: \`file:\${dbPath}\`` (libsql syntax pentru local file)
2. `tests/store.test.ts`, `tests/captures.test.ts`, `tests/relations.test.ts`:
   - Pattern: fiecare `it/test` devine `async`
   - Fiecare `store.createEntity(...)` → `await store.createEntity(...)`
   - Same pentru toate metodele
3. Rulează `bun test packages/core` în loop până e verde.

**Acceptance pentru 2b:**
- `bun test packages/core` PASS pe toate testele
- `bun run typecheck` clean

**Commit (2b):** `core: async tests + helpers for new store API`

---

### Phase 3 — Update consumers (CLI + MCP, 2–3h)

#### Phase 3a — CLI

**Steps:**

1. `src/pca.ts`, `src/ctx.ts`:
   - În entry-point: `const store = await openStore({ url: \`file:\${dbPath}\` })` (local-only cli — vezi D11 mai jos)
2. Fiecare comandă (`init.ts`, `doctor.ts`, `migrate-links.ts`, `log.ts`, `review.ts`, `util.ts`):
   - Adaugă `await` la fiecare `store.foo(...)`
   - Funcțiile handler devin async (probabil deja sunt)
3. Teste CLI (`tests/init.test.ts`, `tests/doctor.test.ts`, etc.):
   - Convertește la async/await
   - `cli-entry.test.ts` — atenție la `child_process` spawn-uri: nu se schimbă, ele oricum sunt async; dar dacă există assertions inline cu `openStore` direct, adaugă await

**D11 (decizie inline):** CLI-ul rulează **local-only**, nu deschide replică embedded. Motiv: comenzile CLI sunt one-shot și nu vrem latență de sync la fiecare invocare. MCP server-ul (proces lung) ține replica vie. Dacă rulezi `pca doctor`, vezi starea ultimei sincronizări (cea făcută de MCP). Acceptabil pentru iterația asta. Eventual revedere.

Implementare D11: CLI cheamă `openStore({ url: \`file:\${dbPath}\` })` *fără* syncUrl. Asta înseamnă că CLI lucrează direct pe fișierul `local-replica.db` și vede date sincronizate de MCP. Reconciliere cu syncul Turso nu e necesară din CLI.

**Acceptance:**
- `bun test packages/cli` PASS
- `bun packages/cli/src/pca.ts doctor` rulează fără eroare pe DB-ul curent

**Commit (3a):** `cli: adapt to async store API (local-only mode)`



**Steps:**

1. `src/index.ts`:
   - Import: `import "dotenv/config"` la TOP (sau folosim `process.loadEnvFile()` din Bun)
   - Actually, Bun încarcă `.env` automat dacă rulezi cu `bun`. Dar MCP-ul e spawned de Claude Code — verifică ce shell folosește. Sigur-safe: încarcă manual:
     ```typescript
     import { config } from "dotenv";
     config({ path: join(import.meta.dir, "../../..", ".env") });
     ```
   - Schimbă `resolveDbPath()` în `resolveStoreOptions(): OpenStoreOptions`:
     ```typescript
     function resolveStoreOptions(): OpenStoreOptions {
       const localPath = process.env.PCA_LOCAL_REPLICA
         ?? join(homedir(), ".pca", "local-replica.db");
       const syncUrl = process.env.TURSO_DB_URL;
       const authToken = process.env.TURSO_AUTH_TOKEN;
       const syncInterval = Number(process.env.PCA_SYNC_INTERVAL_SEC ?? 60);
       if (!syncUrl) {
         process.stderr.write("[pca-mcp-server] WARN: TURSO_DB_URL missing, falling back to local-only mode\n");
         return { url: `file:${localPath}` };
       }
       return { url: `file:${localPath}`, syncUrl, authToken, syncInterval };
     }
     ```
   - `const store = await openStore(resolveStoreOptions())` — deja async, OK
   - Log la pornire: `[pca-mcp-server] connected (replica=..., remote=..., sync=Ns)`
2. `src/handlers.ts`: handler-ele rămân în mare la fel (deja primesc `store` și sunt async în signatures? Verifică); doar `await` în plus dacă era apel direct sync.
3. Teste handlers + server: convertesc la async/await.

**Acceptance:**
- `bun test packages/mcp-server` PASS
- `bun packages/mcp-server/src/index.ts` (cu env vars setate) pornește, loghează "connected", și nu crash-uiește în 30s

**Commit (3b):** `mcp: load Turso credentials from .env, init embedded replica`

---

### Phase 4 — Data migration (1h)

Script one-shot: pompează datele din `~/.pca/store.db.bak-pre-turso-...` în Turso prin libsql client.

**Steps:**

1. Creează `code/scripts/migrate-to-turso.ts`:
   ```typescript
   #!/usr/bin/env bun
   // One-shot: pompează entities/links/events/captures/etc. din local SQLite
   // (legacy bun:sqlite) direct în Turso prin libsql.
   //
   // RUN ONCE. Idempotent prin INSERT OR IGNORE pe ULID-uri (toate cheile sunt ULID-uri,
   // deci re-rularea nu duplică). Schema trebuie să existe deja în Turso (rulează
   // întâi MCP-ul o dată să creeze schema via runMigrations, apoi acest script).
   ```

   Logica:
   - Deschide DB-ul vechi cu `bun:sqlite` (legacy driver — import-ul rămâne valid)
   - Deschide client libsql pe Turso (URL + token din `.env`)
   - Pentru fiecare tabel în ordine FK-correct: `schema_migrations`, `entities`, `links`, `events`, `captures`, `annotations`, `sources`, `entity_sources`, `entity_tags`, `tags`, `projects`, `capture_entities`, `capture_links`
   - `SELECT * FROM <table>`, apoi `INSERT OR IGNORE INTO <table> (...) VALUES (...)`
   - La final: SELECT COUNT pe ambele și loghează diff. Dacă counts diferă, exit 1.
   - **NU** migra view-urile sau tabela FTS — astea sunt recreate de migrațiile schema (rebuild automat din rânduri).

2. Workflow:
   - Asigură-te că schema e deja creată în Turso: rulează MCP-ul o dată (sau un mic script de bootstrap care doar deschide `openStore` cu syncUrl) ca să declanșeze `runMigrations`. După prima sincronizare reușită, schema e în Turso.
   - Rulează: `bun run code/scripts/migrate-to-turso.ts ~/.pca/store.db.bak-pre-turso-YYYYMMDD-HHMMSS`
   - Verifică:
     ```
     turso db shell pca-prod "SELECT COUNT(*) FROM entities;"   # → 15
     turso db shell pca-prod "SELECT COUNT(*) FROM events;"     # → 20
     turso db shell pca-prod "SELECT COUNT(*) FROM links;"      # → 2
     ```
3. Forțează un sync pe replica locală: pornește MCP-ul, fă un `get_self_summary` din Claude Code. Trebuie să vezi entitatea `self` cu datele tale.

**Acceptance:**
- Row counts identice între backup și Turso pentru toate tabelele
- `get_self_summary` în Claude Code returnează date corecte
- `turso db shell pca-prod "SELECT * FROM entities WHERE type='self';"` arată un singur rând

**Commit:** `scripts: add one-shot Turso migration tool + run for canonical DB`

---

### Phase 5 — Second-laptop bootstrap (30 min, când ești la spital)

**Steps:**

1. `git pull` la repo pe laptopul de la spital
2. Creează `code/.env` cu **același conținut** ca pe laptopul de acasă (TURSO_DB_URL, TURSO_AUTH_TOKEN, PCA_LOCAL_REPLICA)
3. `cd code && bun install`
4. Înainte de orice ctx-add: șterge orice `~/.pca/store.db*` rămas pe spital (e oricum demodat, decizia D9):
   ```
   mv ~/.pca/store.db ~/.pca/store.db.spital-discarded-$(date +%Y%m%d)
   ```
5. Pornește Claude Code, lasă MCP server-ul să creeze `~/.pca/local-replica.db` și să facă primul sync
6. `get_self_summary` → trebuie să vezi exact aceeași entitate self ca acasă

**Acceptance:**
- DB-ul de la spital arată identic cu cel de acasă
- O scriere de pe spital (ex. `record_observation`) apare pe Turso în ≤2 min
- O scriere de acasă apare pe spital la următoarea repornire MCP (sau în 60s dacă MCP rulează)

---

### Phase 6 — Cleanup + docs (30 min)

1. Adaugă în `code/README.md` o secțiune "Cross-device sync":
   - Cerințe: cont Turso, `.env`
   - Cum bootstrapezi a doua mașină
   - Avertizare: NU scrie simultan de pe ambele laptopuri (vezi §6 risk register)
2. Adaugă în `STATE.md` §11: bifează Arc 3 ca "v1 live, embedded replicas pe Turso"
3. Șterge backup-urile vechi după 2 săpt de operare stabilă (sau le ții — fișier mic)
4. Adaugă o entitate `resource` în PCA: `Turso pca-prod DB` cu link la token storage location (=fișier `.env`). Asta închide bucla.

**Commit:** `docs: add Turso sync setup instructions; STATE: mark Arc 3 v1`

---

## 6. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| **Scriere simultană de pe ambele laptopuri** → conflict last-write-wins pe row, pierdere update silentă | High | Disciplină personală: închizi Claude Code înainte să schimbi laptopul. Eventual: `pca doctor` să arate "last sync at HH:MM" ca tu să vezi prospețimea. NU rezolvăm cu CRDT în iterația asta. |
| **Token leaked în git** | Critical | `.gitignore` cu `.env`; verificare `git status` înainte de fiecare commit; `git secret-scan` opțional. Backup: tokenul e revocable din Turso UI în 5s. |
| **libsql nu suportă o feature SQLite folosită** (FTS5, views, etc.) | Medium | libsql e fork de SQLite, suportă FTS5 + views. Verifică prin rularea migrațiilor în Turso prima oară. Dacă o feature lipsește, contingency: păstrăm `bun:sqlite` și folosim Turso doar ca backup periodic (varianta B). |
| **Refactor sync→async sparge ceva subtle** (mai ales tranzacții, cascade pe invalidate) | Medium | Acoperire de teste e bună (vezi `tests/`). Rulează full suite după fiecare commit. Dacă pică, rollback la commit-ul precedent. |
| **Latență de sync = 60s mai mare decât tolerabil** pentru workflow-ul real | Low | Tunable prin `PCA_SYNC_INTERVAL_SEC`. Putem coborî la 15s dacă e nevoie (Turso suportă). |
| **Turso free tier limită atinsă** (1GB storage, 1B row reads/lună) | Low | PCA-ul tău are ~152KB. Nu o să atingi limita în viața asta. |
| **Migrare existentă pică la jumate** | Medium | Backup-ul `.bak-pre-turso` rămâne. Scriptul e idempotent (INSERT OR IGNORE pe ULID). Re-rulezi. |
| **Bun nu încarcă `.env` în MCP context** (spawned de Claude Code) | Medium | Folosim `dotenv` package explicit + path absolut. Testat la Phase 3b. |
| **Schema-migration race**: dacă cele două laptopuri pornesc MCP simultan și prima dată ambele încearcă să creeze schema | Low | `INSERT OR REPLACE INTO schema_migrations` e idempotent. `CREATE TABLE IF NOT EXISTS` la fel. Plus, schema se creează doar o dată în viața DB-ului. |

## 7. Test strategy

- **Unit (`bun test`)**: tot ce rulează acum continuă să ruleze, doar async. Nu adăugăm test cazuri noi în iterația asta.
- **Integration manuală**: §5 acceptance criteria pentru fiecare fază sunt suficiente.
- **Cross-device manual test** (după Phase 5):
  1. Scrii pe acasă: `/ctx-add Test cross-device 1`
  2. Aștepți 90s
  3. Pe spital, pornești MCP, `get_self_summary` sau `list_active` — trebuie să vezi entitatea
  4. Scrii pe spital: `/ctx-add Test cross-device 2`
  5. Acasă: `list_active` în 90s → trebuie să apară

## 8. Effort estimate

| Phase | Estimate | Cumulative |
|---|---|---|
| 0. Provisioning | 30 min | 30 min |
| 1. Backup | 15 min | 45 min |
| 2a. Rewrite store.ts | 3h | 3h 45m |
| 2b. Core tests async | 1.5h | 5h 15m |
| 3a. CLI async | 1h | 6h 15m |
| 3b. MCP async + .env | 1h | 7h 15m |
| 4. Data migration | 1h | 8h 15m |
| 5. Second laptop | 30 min (la spital) | 8h 45m |
| 6. Cleanup + docs | 30 min | 9h 15m |

**Total ~1 zi de muncă concentrată.** Realist: 2 sesiuni de seară (acasă) + Phase 5 a treia zi (la spital).

## 9. Open questions / things to confirm înainte de start

1. **Regiune Turso:** Frankfurt (`fra`) e cel mai apropiat. Alt European hub? AMS? Confirm.
2. **Numele DB-ului pe Turso:** `pca-prod` propus. OK sau ai altă convenție?
3. **Token expiration:** propunere `none` (nu expiră) — convenabil dar mai puțin sigur. Alternativă: 1 an cu reminder de rotation. Confirm.
4. **CLI mode:** D11 spune CLI rămâne local-only fără sync. Vrei totuși ca `pca doctor` să poată face un sync forțat? (1 oră extra de muncă.)
5. **STATE.md update:** îl modific la final ca să bifez Arc 3, sau lași tu?
6. **Schema bootstrap pe Turso:** preferi (a) să rulezi MCP-ul gol o dată ca să creeze schema, apoi script de data migration, SAU (b) să fac un script `bootstrap-turso-schema.ts` separat care doar rulează migrațiile, fără date? Variantă (b) e mai explicită.

## 10. Definition of done

- [ ] `code/.env` cu credentiale, `code/.env.example` în git
- [ ] `@pca/core` complet pe `@libsql/client`, async, toate testele pass
- [ ] `@pca/cli` adaptat, toate testele pass
- [ ] `@pca/mcp-server` cu embedded replica + initial sync, toate testele pass
- [ ] DB-ul Turso `pca-prod` conține cele 15 entități / 2 linkuri / 20 events migrate
- [ ] Pe laptopul de acasă, `get_self_summary` returnează date corecte după migrare
- [ ] Pe laptopul de la spital, după bootstrap, exact aceleași date apar prin sync
- [ ] O scriere de pe un laptop apare pe celălalt în ≤ 90s
- [ ] Documentat în `code/README.md` cum se setează a doua mașină
- [ ] `STATE.md` §11 bifează Arc 3 v1

---

*Plan pregătit 2026-05-20 după conversație cu Narcis. Tehnologie: Turso embedded replicas (libsql). Decizie de scope: DB-ul de la spital se sacrifică, cel de acasă (15 entități) devine canonic.*
