---
title: "PCA — Linking implementation plan"
project: personal-context-agent
status: proposed
created: 2026-05-19
prd_ref: prd-mvp.md (v0.3 §8.3 links table, §13 ratează linkuri risc, §14 Val 2)
author: Narcis + Claude
---

# PCA Linking — Implementation Plan

> **Premisa.** Schema `links` și `store.createLink()` există deja (PRD §8.3). MCP
> surface, store read API, skill wiring, summary integration **lipsesc**.
> Linkurile sunt momentan write-only — phantom feature. Acest plan le pune în
> uz, în 3 faze, în ~1 weekend.

## 0. Context concentrat

| Strat | Stare actuală | Locație |
|---|---|---|
| Schema `links` (src/dst/relation/weight/authority/invalidated_at + 3 indexuri) | ✅ done | `code/packages/core/src/schema/migrations/0001_initial.sql:66-79` |
| `store.createLink()` cu event-log | ✅ done | `code/packages/core/src/store.ts:323-359` |
| Tip `Link` + `EventRow.operation = 'link'` | ✅ done | `code/packages/core/src/types.ts:69-78` |
| Store read API (`listLinks`, `getNeighbors`, `invalidateLink`) | ❌ lipsă | — |
| MCP tools pentru linking | ❌ lipsă | `code/packages/mcp-server/src/tool-defs.ts` are doar 6 tools fără linking |
| `/ctx-add` să persiste linkurile din split | ❌ lipsă | `code/packages/skill-ctx-add/SKILL.md` Step 5 |
| `get_self_summary` să folosească linkurile | ❌ lipsă | `code/packages/mcp-server/src/handlers.ts:137-185` |
| `/ctx-link` skill manual | ❌ Val 2 | `prd-mvp.md:950` — out of scope MVP |
| Risc "skill ratează linkurile" | accepted | `prd-mvp.md:941` |

## 1. Goals & non-goals

### Goals
1. Linkurile create în split-uri devin **persistente** (nu doar propuse).
2. Linkurile devin **interogabile** prin MCP (`get_neighbors`).
3. Linkurile **influențează `get_self_summary`** prin un câmp `key_links`.
4. Vocabular **canonic** de relations — fără explozie taxonomică.
5. **Cleanup automat**: linkurile sunt invalidate când entitățile sunt invalidate.

### Non-goals (rămân Val 2+)
- `/ctx-link` skill standalone pentru link manual via Claude Code UI.
- Embeddings / similarity peste linkuri.
- Vizualizare grafică.
- Multi-user / shared links.
- Promovarea `self.attrs.pillars` la entități prim-clasă (vezi Open Question Q-L1).

## 2. Decizii locked înainte de start

### D1 — Vocabular canonic de relations

11 relations fixe; orice altceva în skill = **respins** la confirm; fallback
explicit `related-to` permis dar marcat "low-information" în queryuri.

| Relation | Direction | Src types permise | Dst types permise | Acyclic | Symmetric | Semantică |
|---|---|---|---|---|---|---|
| `subgoal-of` | A → B | `goal` | `goal` | da | nu | A este parte din B |
| `motivated-by` | A → B | `goal`, `event`, `state`, `role` | `stance`, `constraint`, `knowledge` | nu | nu | A există pentru că există B |
| `collaborates-with` | A ↔ B | `person`, `self` | `person`, `goal` | nu | **da** | A și B lucrează împreună |
| `subject-of` | A → B | `person` | `event`, `goal` | nu | nu | A este despre cine/ce e B |
| `located-at` | A → B | `event`, `role`, `state` | `place` | nu | nu | locație fizică/digitală |
| `caused-by` | A → B | `state`, `event` | `event`, `role`, `place`, `person` | nu | nu | A apare din cauza B |
| `reinforces` | A → B | `stance`, `preference`, `role` | `stance`, `self` | nu | nu | A întărește B |
| `competes-with` | A ↔ B | `goal`, `stance`, `role` | `goal`, `stance`, `role` | nu | **da** | tensiune între A și B |
| `addresses` | A → B | `goal`, `role` | `constraint`, `knowledge`, `event` | nu | nu | A încearcă să rezolve B |
| `requires` | A → B | `goal`, `role` | `resource`, `knowledge`, `person`, `place` | nu | nu | A depinde de B |
| `related-to` | A ↔ B | * | * | nu | **da** | fallback — query-uri îl deprioritizează |

### D2 — Storage convention pentru relations simetrice

**Stochează o singură direcție.** La query, dacă relation are `symmetric: true`,
union: `WHERE (src=? OR dst=?)`. Reduce dublarea + simplifică invalidation.

### D3 — Cascade invalidation

Când entitate trece în status `invalidated` (sau `archived`), toate linkurile
unde apare ca `src_id` sau `dst_id` primesc `invalidated_at = now`. Nu se șterg
— append-only history. Vezi Phase 3 Step 3.2.

### D4 — Tipuri de operation event

Operațiile noi pe `events.operation`: `link` (deja există), plus `link-invalidate`
(adăugat în Phase 1). Nu adăugăm `link-update` — linkurile sunt immutable;
modificarea = invalidate + create nou.

### D5 — Autoritate pe linkuri

Default `observed`. `self-declared` doar dacă user-ul l-a propus explicit (din
input). `inferred` dacă skill-ul l-a dedus din side-context (vezi Step 0.5b din
ctx-add).

## 3. Faza 1 — Surface what exists

**Goal:** linkurile pot fi scrise și citite via MCP. `/ctx-add` le persistă în
split-uri.

**Estimare:** ~150 LOC + teste. 1 seară.

### Step 1.1 — Store read API

Fișier: `code/packages/core/src/store.ts` (extindere; **nu** file nou).

Adaugă:

```typescript
// In return object of openStore()
listLinks(opts: {
  entityId?: string;             // any side
  relation?: string;
  direction?: "out" | "in" | "both";  // default "both" if entityId set
  includeInvalidated?: boolean;  // default false
  limit?: number;                // default 50
}): Link[]

getNeighbors(id: string, opts?: {
  relation?: string;
  direction?: "out" | "in" | "both";  // default "both"
  types?: EntityType[];          // filter neighbor entity type
  limit?: number;                // default 50
}): Array<{ entity: Entity; link: Link; role: "out" | "in" }>

invalidateLink(linkId: string, actor: string, note?: string): Link
```

SQL pentru `listLinks` (cazul `direction="both"`):
```sql
SELECT * FROM links
WHERE (src_id = ? OR dst_id = ?)
  AND (? OR invalidated_at IS NULL)
  AND (? IS NULL OR relation = ?)
ORDER BY created_at DESC LIMIT ?
```

SQL pentru `getNeighbors` join cu entități + filter active:
```sql
SELECT l.*, e.* FROM links l
JOIN entities e ON e.id = CASE WHEN l.src_id = :id THEN l.dst_id ELSE l.src_id END
WHERE (l.src_id = :id OR l.dst_id = :id)
  AND l.invalidated_at IS NULL
  AND e.status = 'active'
  AND (e.expires_at IS NULL OR e.expires_at > datetime('now'))
  ...
```

`invalidateLink` setează `invalidated_at = nowIso()` + emite event `link-invalidate`.

### Step 1.2 — MCP tools (3 noi)

Fișier: `code/packages/mcp-server/src/tool-defs.ts` — adaugă 3 zod shapes.
Fișier: `code/packages/mcp-server/src/handlers.ts` — adaugă 3 handlers.
Fișier: `code/packages/mcp-server/src/server.ts` — înregistrează tools.

#### `link_entities`

```typescript
inputs: {
  src_id: string,
  dst_id: string,
  relation: string,             // must be in RELATIONS registry
  weight?: number,              // default 1.0
  authority?: "self-declared" | "observed" | "inferred"
}

validates:
  - both entities exist
  - both entities are status='active'
  - relation in canonical vocab (Phase 2 hardens — Phase 1 logs warning if unknown)
  - src_type + dst_type ∈ allowedPairs (Phase 2)
  - if relation.acyclic: no path dst → ... → src via same relation

returns: { id, src_id, dst_id, relation, weight, authority, created_at }
```

Description prescriptivă:
> Creates a typed link between two entities. Use to make explicit a relationship
> the user stated (or that you inferred with high confidence). Always prefer
> over hiding relations in entity body text. Returns the new link id.

#### `get_neighbors`

```typescript
inputs: {
  entity_id: string,
  relation?: string,
  direction?: "out" | "in" | "both",
  types?: EntityType[],
  limit?: number
}
returns: {
  center: Entity,
  neighbors: Array<{ entity: Entity, link: Link, role: "out" | "in" }>
}
```

Description prescriptivă:
> Returns entities directly linked to a given entity, with the link metadata.
> Use when answering "who is involved in X?", "what does goal Y require?",
> "what reinforces stance Z?". Cheaper than FTS for known-id traversal.

#### `invalidate_link`

```typescript
inputs: { link_id: string, note?: string }
returns: { id: string, invalidated_at: string }
```

Description prescriptivă:
> Marks a link as no-longer-true. Use when a relationship explicitly ended
> ("Mihai is no longer collaborating on X"). Append-only: the row stays, only
> invalidated_at is set.

### Step 1.3 — `/ctx-add` skill wiring

Fișier: `code/packages/skill-ctx-add/SKILL.md` (mirror în `~/.claude/skills/ctx-add/SKILL.md`
după `pca install-skill ctx-add`).

Modificări:

- **Step 2** (Propose split): rămâne — deja propune linkuri.
- **Step 5** (Persist): după ce toate `record_observation` calls reușesc,
  iterează prin linkurile acceptate de user și cheamă `link_entities` pentru
  fiecare. Folosește `record_observation` return ids ca `src_id` / `dst_id`.
- **Step 6** (Confirmation): adaugă linii `✓ Linked <relation>: <src-prefix>... → <dst-prefix>...`.
- Șterge nota actuală "link writing lands in a later session".

### Step 1.4 — Teste

Fișier: `code/packages/core/tests/store.test.ts` — extinde:
- `listLinks` returnează în ambele direcții
- `listLinks` exclude invalidated by default
- `getNeighbors` filtrează după type și nu returnează entități invalidated
- `invalidateLink` setează timestamp + emite event `link-invalidate`

Fișier: `code/packages/mcp-server/tests/handlers.test.ts` — extinde:
- `link_entities` respinge dacă src/dst nu există
- `link_entities` respinge dacă src/dst sunt invalidated
- `get_neighbors` returnează roles corect pentru direcție
- `invalidate_link` happy path

### Step 1.5 — Acceptance criteria Faza 1

- [ ] `bun test` pass în `packages/core` și `packages/mcp-server`
- [ ] `/ctx-add` cu input "Mihai (fiul meu) se pregătește pentru UMF iulie 2027" → 3 entități + 2 linkuri persistate
- [ ] `sqlite3 ~/.pca/store.db "SELECT COUNT(*) FROM links WHERE invalidated_at IS NULL"` > 0 după capture
- [ ] `pca doctor` neschimbat — fără regresie
- [ ] Cele 5 entități create în sesiunea de azi (preference + 3 goals + person) primesc retroactiv linkurile 5→4, 5→2, 3→stance, 3→knowledge dacă rulăm un `/ctx-link` manual SQL (testare manuală — nu blocking)

## 4. Faza 2 — Canonical vocab + summary integration

**Goal:** validation strictă pe relations + linkurile apar în `get_self_summary`.

**Estimare:** ~100 LOC + teste + 1 migrare mică. 1 seară.

### Step 2.1 — Relations registry

Fișier nou: `code/packages/core/src/links/relations.ts`

```typescript
import type { EntityType } from "../types.ts";

export type RelationSpec = {
  name: string;
  acyclic: boolean;
  symmetric: boolean;
  // empty array = any pair allowed (only for fallback `related-to`)
  allowedPairs: Array<[EntityType | "*", EntityType | "*"]>;
  description: string;
  lowInformation?: boolean;  // marks fallback for query deprioritization
};

export const RELATIONS: Record<string, RelationSpec> = {
  "subgoal-of":        { ... },
  "motivated-by":      { ... },
  "collaborates-with": { ... },
  "subject-of":        { ... },
  "located-at":        { ... },
  "caused-by":         { ... },
  "reinforces":        { ... },
  "competes-with":     { ... },
  "addresses":         { ... },
  "requires":          { ... },
  "related-to":        { ..., lowInformation: true },
};

export function validateLinkPair(
  relation: string,
  srcType: EntityType,
  dstType: EntityType,
): { ok: true } | { ok: false; reason: string };

export function isCyclic(
  store: Store, srcId: string, dstId: string, relation: string,
): boolean;  // only relevant when RELATIONS[relation].acyclic === true
```

Modificare în `link_entities` handler:
- respinge cu code `UNKNOWN_RELATION` dacă lipsește din registry
- respinge cu code `BAD_PAIR` dacă tipurile nu sunt permise
- respinge cu code `WOULD_CYCLE` dacă relation acyclic și ar crea ciclu

Export `RELATIONS` din `@pca/core` public surface (`index.ts`) ca să poată fi
consumat de SKILL.md tooling viitor (`/ctx-link`).

### Step 2.2 — `get_self_summary.key_links`

Fișier: `code/packages/mcp-server/src/handlers.ts:137-185`

Adaugă în `SelfSummary`:
```typescript
key_links: Array<{
  link: Link;
  src: { id: string; type: EntityType; title: string };
  dst: { id: string; type: EntityType; title: string };
}>;
```

Logică:
1. Colectează id-uri "importante": `self.id` + all active_goals + all top_people + all active_constraints.
2. `listLinks` pentru fiecare; deduplicate by link.id.
3. Filtrează linkuri cu `lowInformation` relations DACĂ avem >5 alte rezultate.
4. Rank: weight DESC, apoi created_at DESC.
5. Cap la 10 (configurabil prin opts.keyLinksLimit).
6. Hydratează src+dst entity titles (light projection, fără body).

Cost: 1 query supplementar peste o tabelă mică. Acceptat.

### Step 2.3 — Migrare `goal.attrs.parent_id` → linkuri `subgoal-of`

Fișier nou: `code/packages/core/src/schema/migrations/0002_parent_id_to_links.sql`

```sql
-- Convert legacy goal.attrs.parent_id into proper subgoal-of links.
-- Idempotent via uniqueness check on (src, dst, relation).
INSERT INTO links (id, src_id, dst_id, relation, weight, authority, created_at)
SELECT
  lower(hex(randomblob(13))),
  e.id,
  json_extract(e.attrs, '$.parent_id'),
  'subgoal-of',
  1.0,
  COALESCE(e.authority, 'observed'),
  e.created_at
FROM entities e
WHERE e.type = 'goal'
  AND json_extract(e.attrs, '$.parent_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM links l
    WHERE l.src_id = e.id
      AND l.dst_id = json_extract(e.attrs, '$.parent_id')
      AND l.relation = 'subgoal-of'
  );

-- Keep parent_id in attrs for one release (read-compat). Mark deprecated in registry.
```

ATENȚIE: ULIDs prin SQL pur sunt aproximative. Acceptabil pentru migrare one-shot —
linkurile rezultate sunt valide, doar id-urile nu sunt ULID-conformant. Alternativă
mai curată: rulează migrarea în TypeScript via store (un script `pca migrate-links`).

**Decizia:** mergi cu varianta TS script, nu pure SQL — păstrează invarianta
ULIDs pentru toate id-urile.

Fișier: `code/packages/cli/src/pca-commands/migrate-links.ts` (script one-shot,
nu comandă publică): iterează `listActive("goal")`, dacă `attrs.parent_id` există
și nu există link, cheamă `createLink`.

### Step 2.4 — Update SKILL.md cu vocabular canonic

Adaugă la `code/packages/skill-ctx-add/SKILL.md`, secțiune nouă "Step 4.5 —
Propose links":

```markdown
## Step 4.5 — Propose links (after entity split is accepted)

Use ONLY these canonical relations:
[insert RELATIONS table — copy from plan-linking.md §2 D1]

If no canonical relation fits, default to `related-to` (low-information).
NEVER invent new relation names. Never use `relates-to`, `connected-with`,
`see-also`, `links-to`, etc.
```

### Step 2.5 — Teste

- Registry validation: pair (goal, place) cu `subgoal-of` → BAD_PAIR
- Acyclic: `A subgoal-of B`, `B subgoal-of A` → WOULD_CYCLE
- `get_self_summary.key_links` returnează linkurile care ating self / active_goals
- Migrare TS script: idempotentă (2× run = aceleași linkuri)

### Step 2.6 — Acceptance criteria Faza 2

- [ ] `link_entities` cu relation neacceptabilă → `UNKNOWN_RELATION` cu mesaj clar
- [ ] `get_self_summary` include `key_links` cu ≥1 entry după ce ai legat 2 entități
- [ ] Migrare TS script rulat o dată — toate goal-urile cu `parent_id` au link `subgoal-of`; rulat a doua oară = 0 linkuri noi
- [ ] `/ctx-add` cu split de 3 entități și 2 linkuri propuse — relation propusă întotdeauna în vocabul canonic

## 5. Faza 3 — Hygiene

**Goal:** linkurile rămân curate pe termen lung. Tensions devin vizibile.

**Estimare:** ~80 LOC + teste. 1 seară.

### Step 3.1 — Cascade invalidation

Fișier: `code/packages/core/src/store.ts` — modifică `invalidateEntity`:

```typescript
function invalidateEntity(id, actor, note?) {
  // existing logic ...
  // NEW:
  const affectedLinks = db.prepare(
    `UPDATE links SET invalidated_at = ?
     WHERE (src_id = ? OR dst_id = ?) AND invalidated_at IS NULL
     RETURNING id`
  ).all(now, id, id);
  for (const link of affectedLinks) {
    logEvent({
      actor, operation: "link-invalidate",
      link_id: link.id,
      payload: { reason: "cascade", entity_id: id, note }
    });
  }
}
```

Aplică același pattern dacă entitate trece `active → archived` (decizie:
archived = linkurile rămân valide; doar `invalidated` cascade-ează). Documentează
explicit în comment.

### Step 3.2 — `ctx review --links`

Fișier: `code/packages/cli/src/ctx.ts` (sau `ctx-commands/review.ts` dacă nu există)

Output 3 secțiuni:

```
Dangling links (point to invalidated/missing entities):
  - <link_id> :: <src_title> --<relation>--> [MISSING/INVALIDATED]
  ...

Redundant links (same src+dst+relation, multiple active):
  - <src_title> --<relation>--> <dst_title>: 2 active links
  ...

Orphan entities (no in/out links, type ≠ event/state):
  - <type> "<title>" (<age>d old)
  ...
```

Plus o singură linie summary: `Health: X dangling, Y redundant, Z orphan. Run with --fix to invalidate.`

Implementare: 3 SQL queries simple. ~50 LOC.

### Step 3.3 — `ctx review --links --fix`

Cu flag `--fix`:
- Invalidate dangling links (cascade missed deja).
- Pentru redundant: păstrează cea cu cel mai mare weight (sau cea mai recentă), invalidate rest.
- Orphan entities: doar warning, fără acțiune automată — utilizatorul decide.

### Step 3.4 — Acceptance criteria Faza 3

- [ ] Invalidate o entitate cu 3 linkuri active → toate 3 linkuri primesc
      `invalidated_at`, 3 events `link-invalidate` cu payload `{reason: "cascade"}`
- [ ] `ctx review --links` rulează în <100ms pe store cu 1000 linkuri
- [ ] `--fix` pe state cu dangling links → 0 dangling după

## 6. Riscuri & mitigări

| Risc | P | Impact | Mitigare |
|---|---|---|---|
| LLM inventează relations noi în split | mare | mediu | Registry validation respinge la `link_entities`; user vede eroare clară |
| Skill propune linkuri în EVERY split → fatigue | medie | mic | Doar splits cu ≥2 entități + relations evidente; nu silui user-ul |
| Cascade invalidation cascade-ează prea agresiv | mică | mediu | Distinge `invalidated` (cascade) vs `archived` (no cascade); documentat |
| Migrarea `parent_id` strică ceva | mică | mediu | Idempotentă + backup `~/.pca/store.db` înainte (e standard via `pca doctor`) |
| `get_self_summary.key_links` umflă payload | medie | mediu | Cap la 10, projection light (no body), opt-out via `opts.includeKeyLinks=false` |
| Cycle check `subgoal-of` are cost O(n) | mică | mic | BFS limitată la depth 10; refuz cu mesaj clar dacă deep |
| Vocabular canonic se simte restrictiv în practică | medie | mic | Live test 2 săpt., apoi extindere dacă există gap concrete |

## 7. Open questions (de lock-uit la start of Faza 2)

- **Q-L1** — Pillars (`self.attrs.pillars: string[]`) ar trebui promovate la
  entități prim-clasă (stance cu maturity='load-bearing'?) ca să poată fi destination
  pentru `reinforces`? **Default proposal:** NU pentru MVP — `reinforces → self`
  e suficient pentru Faza 2. Reevaluează după 30 zile live test.

- **Q-L2** — `related-to` ar trebui rate-limited (e.g. max 1 per record_observation
  call) ca să evite ca LLM-ul să spamuieze fallback? **Default proposal:** doar
  warning în logs pentru acum, fără hard limit. Mai târziu, dacă > 30% din linkuri
  ajung `related-to`, introdu limit.

- **Q-L3** — `weight` se folosește în Phase 2 ranking? **Default proposal:** da,
  multiplicat cu recency decay. Skill setează `1.0` default; manual via `ctx`
  poate seta altceva (Val 2 când apare `/ctx-link`).

- **Q-L4** — Skill propune linkuri și pentru entități **deja existente** descoperite
  via `get_relevant_context` în Step 0.5a, sau doar pentru entități create în
  același capture? **Default proposal:** da, dacă match-ul e `existing-match`
  cu confidence high. Asta îmbogățește graful retroactiv.

## 8. Estimare totală

| Fază | LOC nou | Fișiere atinse | Teste noi | Timp |
|---|---|---|---|---|
| Faza 1 | ~150 | 4 (store, tool-defs, handlers, SKILL.md) | ~12 | 1 seară |
| Faza 2 | ~100 | 5 (+ registry, + summary, + migrare TS) | ~8 | 1 seară |
| Faza 3 | ~80 | 2 (store cascade, ctx review) | ~6 | 1 seară |
| **Total** | **~330** | **~10** | **~26** | **~1 weekend** |

## 9. Sequence of execution

```
Faza 1.1 (store API)
    ↓
Faza 1.2 (MCP tools — handlers depind de store)
    ↓
Faza 1.3 (SKILL.md update — depinde de MCP tools)
    ↓
Faza 1.4 (teste — pot rula după 1.1, 1.2 individual)
    ↓
[VALIDATE: capture manuală, vezi linkuri în DB]
    ↓
Faza 2.1 (registry)
    ↓
Faza 2.2 (summary integration — depinde de registry pentru lowInfo filter)
    ↓
Faza 2.3 (migrare TS — independentă, poate rula paralel cu 2.2)
    ↓
Faza 2.4 (SKILL.md vocab — depinde de 2.1)
    ↓
[VALIDATE: get_self_summary include key_links]
    ↓
Faza 3.1 (cascade invalidation)
    ↓
Faza 3.2/3.3 (ctx review --links + --fix)
    ↓
[VALIDATE: invalidate o entitate, vezi cascade; rulează ctx review]
```

## 10. Out of scope (deferred)

- **`/ctx-link` skill** — manual link creation via Claude Code. Rămâne Val 2.
  Plan-ul ăsta acoperă auto-linking via `/ctx-add`; manual e separat.
- **`/ctx-mirror` integration** — folosirea linkurilor pentru tension detection
  (constraint X + N goals = spread thinning). Rămâne Val 2 ca skill, dar
  beneficiază pasiv de schema gata făcută aici.
- **Embeddings peste linkuri** — Val 3.
- **Graph viz** — Val 4 sau separat.
- **Pillars-to-entities migration** — vezi Q-L1.

## 11. Rollback plan

Toate cele 3 faze sunt **append-only** la nivel de schema. Singura modificare
distructivă posibilă e migrarea `parent_id` (Step 2.3) care doar INSERT-ează
linkuri — nu șterge `attrs.parent_id`. Rollback:

```sql
-- Faza 2 migrare rollback (dacă apare bug):
DELETE FROM links WHERE relation = 'subgoal-of'
  AND created_at > '<migration-run-timestamp>';
```

Codul ts e versionat în git — rollback prin revert commit. MCP tools noi pot
fi dezînregistrate setând `enabled: false` în `server.ts` fără să atingi DB-ul.

---

## Apendice — exemplu end-to-end

**Input la `/ctx-add`** (sesiunea de azi, 2026-05-19, reală):

> vreau să trec pe un boring boilerplate în jurul AdonisJS, Inertia și Vue. Aș
> vrea să am un set complet de API-uri de business (CRM + contabilitate) ...
> sotia mea este expert contabil și poate facem un SaaS AI first ...

**Output Phase 1+ (cum trebuie să arate):**

```
✓ Saved preference #01KRZV4Y... "Boring boilerplate stack — AdonisJS + Inertia + Vue"
✓ Saved goal #01KRZV51... "Build AI-first business APIs (CRM + contabilitate)"
✓ Saved goal #01KRZV55... "Brand personal via learning digital marketing"
✓ Saved person #01KRZV56... "Soția — expert contabil"
✓ Saved goal #01KRZV59... "Explore: SaaS AI-first în contabilitate"
✓ Linked collaborates-with: #01KRZV59... → #01KRZV56... (goal → person, wife)
✓ Linked related-to: #01KRZV59... → #01KRZV51... (overlap APIs ↔ SaaS)
✓ Linked reinforces: #01KRZV55... → #01KRZM0S5DK... (goal → existing stance "social media")
✓ Linked addresses: #01KRZV55... → #01KRZM0P9... (goal → knowledge gap "marketing")
```

**`get_self_summary` ulterior include:**

```json
"key_links": [
  {
    "link": { "relation": "addresses", ... },
    "src": { "type": "goal", "title": "Brand personal via learning digital marketing" },
    "dst": { "type": "knowledge", "title": "Programming — 30+ ani ..." }
  },
  {
    "link": { "relation": "collaborates-with", ... },
    "src": { "type": "goal", "title": "Explore: SaaS AI-first ..." },
    "dst": { "type": "person", "title": "Soția — expert contabil" }
  },
  ...
]
```

Asta e diferența între "5 entități plate" și "graf interogabil cu motivație
structurată". Aici stă marele plus de consistență al contextului.
