---
title: "Faber OS — Knowledge-as-a-System pentru oricine, în orice limbă, pe orice domeniu"
type: vision
status: draft
tags:
  - faber
  - faber-os
  - vision
  - saas
  - postgres
  - multi-tenant
  - product
  - strategic
  - implementation-ready
date: 2026-04-24
author: Narcis + Claude
related:
  - "[[workshop/drafts/faber-framework-vision]]"
  - "[[workshop/drafts/faber-self-agent-citizens]]"
  - "[[CLAUDE]]"
  - "[[wiki/FABER]]"
  - "[[MANIFEST]]"
decisions_proposed:
  - substrate: PostgreSQL multi-tenant cu Row-Level Security (renunțăm la git + fișiere)
  - retrieval: SQL-as-context (agentul scrie SQL, nu vector search pur)
  - personas: Domain Packs configurabile per utilizator (Founder, Doctor, Lawyer, Researcher, Student, Creator, …)
  - onboarding: conversațional în chat, 5 minute până la "first aha", zero terminal, zero Obsidian, zero git
  - self-layer: prim-class citizen pentru fiecare tenant (typed SQL, nu markdown)
  - confruntarea: opt-in per workspace, tonul se negociază la wizard
  - business: B2C freemium + B2B team + Domain Packs premium + Skills Marketplace
version: "0.1"
---

# Faber OS — Knowledge-as-a-System

> **Dacă Faber v1 a fost un template pe care îl descarci și îl deschizi în Claude Code, Faber OS e locul unde mii de oameni — doctor, avocat, antreprenor, jurnalist, student, părinte, preot, cercetător — își țin gândirea, identitatea și evoluția. Un singur backbone. Infinite personalități.**
>
> Toate datele într-o singură bază Postgres. Toate interacțiunile printr-un agent AI care scrie SQL pentru a asambla context perfect. Onboarding în 5 minute. Zero git. Zero markdown edits obligatorii. Confruntare opțională, dar când o vrei, e brutală și cinstită.

Acest document e harta de la **Faber-frameworkul-de-fișiere** la **Faber-OS-ul-de-SaaS**. E saltul care transformă un "vault distribuibil" într-un produs care poate fi onboardat fără terminale de către un contabil din Pitești sau un copywriter din Berlin.

---

## TL;DR — trei paragrafe

**Ce construim:** Faber OS — un Knowledge Operating System multi-tenant în care fiecare utilizator are propriul workspace (o bază Postgres logică) cu 4 primitive: **Sources** (ce ingerezi), **Concepts/Entities** (ce se cristalizează), **Self** (cine declari că ești) și **Log** (ce s-a întâmplat). Deasupra rulează un agent AI care răspunde la întrebări nu prin vector search, ci prin generare de SQL pe o schemă tipată, cu joins între ce citești, cine ești și ce ai făcut. E RAG-ul cu care ai avut totdeauna prieteni în oraș, dar care acum *știe să interogheze structura*, nu doar să caute similaritate.

**Cum se diferențiază:** Trei mecanici pe care nimeni din spațiu nu le are *combinate*: (1) **Self-as-data** — identitatea utilizatorului e rânduri SQL (pillars, stances, commitments, constraints, voice), citite de fiecare skill la startup; (2) **SQL-as-retrieval** — agentul scrie interogări pe o schemă tipată, nu doar vector similarity; (3) **Confrontation loop** — săptămânal comparăm self declarat cu evidence din log. Plus, **Domain Packs** — schema core e flexibilă prin JSONB, iar peste ea se suprapun taxonomii și skills specifice fiecărei profesii, fără să cerem utilizatorului să înțeleagă concepte ca "synthesis".

**De ce acum:** LLM-urile sunt suficient de bune la SQL generation încât retrieval-ul structurat bate RAG-ul plat în 80% din cazurile de uz profesional. Postgres + pgvector + tsvector e o infrastructură coaptă care ne permite un singur backbone pentru 100k utilizatori. Onboarding-ul conversațional — posibil doar în era LLM-urilor — coboară bariera de la "install Claude Code, rulează comenzi" la "răspunde la 12 întrebări de chat". Window-ul competitiv: 12-18 luni până când Notion AI sau Mem livrează ceva similar — dar fără self-layer și fără confruntare, moat-ul nostru rămâne.

---

## 1. Reframe — de la vault portabil la OS centrat pe utilizator

În Faber v1 (documentul [[workshop/drafts/faber-framework-vision|faber-framework-vision.md]]) am formulat o teză bună dar incompletă:

> *"Oricine poate clona un template, completează un interviu de identitate, primește un zip, rulează Claude Code, și are propriul vault-wiki-self."*

Teza se lovește de trei realități:

1. **Non-tehnicienii nu vor instala niciodată Claude Code.** Nici soția lui Narcis, nici avocatul ei, nici medicul rezident, nici copywriter-ul din Berlin. "Deschide terminalul" e o barieră terminală (pun intended).
2. **Git + markdown nu scalează dincolo de primul power-user.** Sincronizarea între devices, backup automat, multi-device capture, colaborare în echipe, recuperare la pierdere — toate devin "homework" pentru utilizator. 95% din oameni nu vor face homework-ul.
3. **Skills compilate în markdown sunt publice și statice.** Un avocat vrea un skill `/client-matter-ingest` care are pașii ei, terminologia ei, reguli de compliance specifice. Un medic vrea `/patient-case-summary`. Nu pot trăi amândoi în același folder de `.claude/skills/`.

Reframe-ul: **Faber nu e un framework pe care-l instalezi. E un sistem în care intri.**

| Faber v1 (framework) | **Faber OS (platform)** |
|---|---|
| Descarci zip, instalezi Claude Code | Creezi cont pe faber.app, răspunzi la 12 întrebări |
| Datele în `wiki/*.md` + git | Datele în Postgres cu Row-Level Security |
| Sync cu `python3 faber_sync.py` | Auto-sync continuu în backend |
| Backup = `git push` | Backup = responsabilitate platformă |
| Skills = foldere `.claude/skills/*` | Skills = invocable programs cu per-user config |
| Onboarding = 60-90 min cu terminal | Onboarding = 5 min în chat |
| Audiență = developers + power users | Audiență = *anyone who thinks* |
| Monetizare = shareware + marketplace local | Monetizare = SaaS (free / pro / team) + Domain Packs + Marketplace |

**Traducere simplă:** Alteramens a construit *funcția matematică*. Faber v1 a făcut-o *instalabilă*. Faber OS o face *accesibilă*.

---

## 2. Cele trei non-negociabile

Narcis a setat explicit trei constrângeri. Fiecare funcționalitate propusă trece prin filtrul lor.

### 2.1 Abstractizare

**Testul:** poate o persoană care **NU știe** cuvintele "vault", "wiki", "source", "concept", "synthesis" să folosească Faber productiv?

**Implicația:** vocabularul intern al sistemului e disociat de vocabularul utilizatorului. Intern = schema Postgres stabilă (`page.type IN ('source', 'entity', 'concept', 'synthesis', 'self', 'agent')`). Extern = labels configurate per Domain Pack.

| Vocabular intern | Domain Pack "Founder" | Domain Pack "Doctor" | Domain Pack "Lawyer" | Domain Pack "Researcher" |
|---|---|---|---|---|
| `source` | "Citire" | "Caz / articol" | "Speță / doctrină" | "Paper / dataset" |
| `entity` | "Persoană / companie" | "Pacient / specialist / moleculă" | "Client / parte / instanță" | "Autor / laborator / autor" |
| `concept` | "Pattern" | "Protocol / diagnostic" | "Principiu / jurisprudență" | "Metodă / concept" |
| `synthesis` | "Analiză" | "Rezumat clinic" | "Memoriu / notă juridică" | "Literature review" |
| `log event` | "Activitate" | "Gesture clinică" | "Operațiune" | "Sesiune experimentală" |
| `pillar` | "Direcție strategică" | "Domeniu de practică" | "Arie de specializare" | "Linie de research" |

**Mecanism tehnic:** un tabel `domain_pack_labels(pack_slug, internal_term, display_term, locale)`. UI-ul și promptul agentului citesc label-urile pack-ului activ. Schema internă nu se schimbă niciodată.

### 2.2 Flexibilitate

**Testul:** poate același produs servi un medic și un scenarist fără ca niciunul să simtă că produsul "e făcut pentru altul"?

**Implicația:** fiecare Domain Pack conține:

- **Label-uri** (vezi mai sus) — cum se numesc lucrurile
- **Seed schema** (câmpuri JSONB optional per tip de pagină) — ce atribute are un "client matter" al avocatului vs un "customer interview" al founder-ului
- **Skills pack** — workflow-uri pre-configurate pentru domeniu
- **Seed concepts** — 3-8 concepte universale ale domeniului, neutre (un student primește "spaced-repetition", un avocat primește "burden-of-proof", nu ideologie)
- **Voice presets** — tonul default (un doctor vorbește despre sine altfel decât un scriitor)
- **Confrontation defaults** — avocatul poate vrea confruntare săptămânală pe ore facturate; medicul poate să n-o vrea deloc la început

**Mecanism tehnic:** fiecare workspace are `domain_pack_slug`, iar schema efectivă e compoziție:
```
effective_schema = core_schema ∪ domain_pack_overlay ∪ workspace_customizations
```

**Regula de aur:** **Core-ul rămâne stabil. Personalizarea stă în overlay.** Un upgrade al core-ului nu sparge nimic. Un utilizator poate schimba Domain Pack sau mixa mai multe.

### 2.3 Onboarding foarte prietenos

**Testul:** poate cineva care n-a mai întâlnit Faber niciodată să aibă primul "aha moment" în **< 5 minute**?

**Implicația:** onboarding-ul nu e formular. Nu e tour. E o **conversație** condusă de agentul Faber, în chat, care la final generează un workspace deja personalizat.

**Contract:**
- Minutele 0-1: signup (email + parolă sau OAuth) + alege domain pack ("Ce faci ca să plătești facturi?" cu 6 cards).
- Minutele 1-3: agentul pune 8-12 întrebări în chat (identitatea → self-layer).
- Minutele 3-4: "Dă-mi primul lucru la care gândești acum" (paste text / URL / voice note).
- Minutele 4-5: agentul extrage, arată, citează — primul concept e creat, primul log event scris, dashboard-ul prinde viață.
- Minutul 5: **first aha** — user-ul vede "Faber deja știe ceva despre mine și despre ce citesc".

**Fără terminal. Fără explicații conceptuale. Fără citire documentație. Fără instalat nimic.**

---

## 3. Produsul în un paragraf (pentru landing page)

> **Faber OS — Your second brain that knows who you are.**
> Ingest an article, a chat, a PDF, a voice note. Faber writes SQL behind the scenes to connect it to everything you've read before, to everyone you've met, to the person you declared yourself to be. Ask anything — "what did I decide about X last month", "how do my recent reads align with my mission", "where am I drifting" — and get an answer that cites your own history. Works in English, Romanian, Spanish, or your own code-switched voice. Configurable for founders, doctors, lawyers, researchers, writers, students, or anyone else who thinks for a living.
> 
> **Local gut, global brain. 5-minute onboarding. Real confrontation, when you're ready.**

---

## 4. Arhitectura — Postgres ca substrat

### 4.1 De ce Postgres și nu (vector DB | graph DB | SQLite federat)

**Postgres câștigă pe trei fronturi simultan:**

| Cerință | Vector DB (Pinecone, Qdrant) | Graph DB (Neo4j) | SQLite per-user | **Postgres + pgvector + pg_trgm** |
|---|---|---|---|---|
| Multi-tenant cu RLS | ✗ | ✗ | ~ (bases separate) | ✓ nativ |
| Hybrid retrieval (FTS + vector + joins) | ~ (doar vector) | ~ (doar graph) | ~ (FTS, fără vector) | ✓ FTS5-quality + HNSW + joins |
| Agentic SQL generation | ✗ (API-specific) | ~ (Cypher, mai rar în training data) | ✓ | ✓ (SQL = cel mai bine reprezentat limbaj în LLM training) |
| Backup / durability | dep. | dep. | manual | ✓ standard |
| Scalare la 10k-100k users | expensive | expensive | imposibil | ✓ (citeai AWS Aurora Serverless / Neon / Supabase) |
| Colaborare echipe | ✗ | ~ | ✗ | ✓ nativ |
| ACID | ~ | ✓ | ✓ | ✓ |
| Ecosistem extensii | ~ | ~ | ~ | ✓ (pgvector, pg_trgm, pgmq, temporal tables, …) |

**SQL e limbajul pe care LLM-urile îl vorbesc cel mai bine.** Orice Claude / GPT / Gemini scrie SQL mai sigur decât scrie Cypher / aggregation pipelines Mongo / DSL-uri proprietare. Asta nu e coincidență — SQL are 50 de ani de corpus public. E un avantaj gratuit.

### 4.2 Isolation model — tenant = workspace

**Decizie:** **Row-Level Security (RLS) pe `workspace_id`**, nu schema-per-tenant.

Motivație:
- RLS scalează la 100k+ workspaces fără mari probleme operaționale.
- Schema-per-tenant face migrări o coșmar (10k × ALTER TABLE).
- RLS + connection pool setează `app.current_workspace_id` per request.

```sql
ALTER DATABASE faber SET row_security = on;

CREATE POLICY ws_isolation_pages ON pages
  USING (workspace_id = current_setting('app.current_workspace_id', true)::uuid);
-- se repetă pentru toate tabelele multi-tenant
```

**Escape hatch pentru self-hosted:** oricine vrea izolare fizică, poate rula propria instanță Postgres (modelul "Faber Private Cloud"). Același cod, alt connection string.

### 4.3 Schema core (high-level)

Schema se descompune în **6 domenii** logice:

```
┌──────────────────────────────────────────────────────────────────┐
│                    Faber OS — Core Schema                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ① IDENTITY & TENANCY                                             │
│     users, workspaces, workspace_members, domain_packs,           │
│     domain_pack_labels, api_keys                                  │
│                                                                   │
│  ② KNOWLEDGE GRAPH                                                │
│     pages (polymorphic, JSONB metadata),                          │
│     page_relations (typed edges),                                 │
│     page_aliases, page_attachments                                │
│                                                                   │
│  ③ SELF LAYER (per workspace, typed)                              │
│     self_pillars, self_stances, self_commitments,                 │
│     self_constraints, voice_rules,                                │
│     self_alignment (page ↔ pillar relations)                      │
│                                                                   │
│  ④ TEMPORAL LAYER                                                 │
│     log_events, log_event_pages, self_snapshots                   │
│                                                                   │
│  ⑤ AGENT LAYER                                                    │
│     agent_heuristics, agent_questions, agent_memory               │
│                                                                   │
│  ⑥ SKILLS & INVOCATIONS                                           │
│     skills, skill_configs, skill_invocations,                     │
│     skill_runs (audit / replay)                                   │
│                                                                   │
│  Search indices: tsvector columns + pgvector embeddings           │
│                  pg_trgm for fuzzy alias matching                 │
└──────────────────────────────────────────────────────────────────┘
```

**Schema completă SQL** — vezi secțiunea 16 (Appendix).

### 4.4 De ce JSONB în loc de "adaugă coloane pentru fiecare domeniu"

Un avocat are `matter_number`, `jurisdiction`, `court`, `billing_ref` pe un "client matter". Un doctor are `patient_id_hash`, `icd10`, `severity`, `visit_date` pe un "patient case". Un copywriter are `campaign`, `channel`, `angle`, `cta_variant`.

Dacă adăugăm coloane tipate pentru fiecare domeniu, ajungem la 200 de coloane, 90% `NULL`. Dacă trimitem totul în JSONB (`metadata jsonb`) cu **JSON Schema validation per Domain Pack**, avem:
- Flexibilitate infinită pe domenii noi
- Validare strictă per pack (hook la INSERT/UPDATE care rulează `jsonschema` peste metadata)
- Indexabil (GIN index + expression indexes pe câmpuri hot)
- Query-abil natural: `WHERE metadata @> '{"jurisdiction": "RO"}'`

**Regulă de compromise:** câmpuri *universale* (title, type, status, maturity, confidence, created_at) sunt coloane tipate. Câmpuri *per-domeniu* trăiesc în JSONB validat.

---

## 5. SQL-as-retrieval — piesa de rezistență

**Aici stă toată magia.** Asta e ce ne deosebește de Notion AI, Mem, Reflect, ChatGPT Projects, Cursor și tot peisajul actual.

### 5.1 Problema cu RAG-ul clasic

RAG standard:
1. User întreabă ceva
2. Întrebarea e embedded
3. Top-k cel mai similar cu embedding-ul
4. Pump-a în prompt, generează răspuns

**Probleme:**
- Nu folosește *structura* (poti avea relații pillar↔stance↔source↔log_event — RAG le ignoră).
- Nu folosește *temporal* (nu știe "ce am scris săptămâna trecută" fără să fie embedded explicit).
- Top-k e aleatoriu dacă ai 500 de surse similare semantic.
- Nu poate face joins ("care e intersecția dintre commitmentul meu și ultimele 5 ingest-uri?").

### 5.2 Faber's approach: **agentul scrie SQL, nu doar embedding lookup**

```
User: "Cum se leagă ingest-urile mele din ultima săptămână de pilonul `ai-agents-for-solo-builders`?"

Agent internal monologue:
  - Este o întrebare cu 2 dimensiuni: temporală + alignment.
  - Am nevoie de: pages unde type='source' + log_event_pages de tip 'ingest' în ultimele 7 zile
                 + self_alignment cu pillar_slug='ai-agents-for-solo-builders'.
  - Scriu SQL.

Agent generates:
  SELECT p.slug, p.title, sa.relation, le.event_date
  FROM pages p
  JOIN log_event_pages lep ON lep.page_slug = p.slug
  JOIN log_events le ON le.id = lep.event_id
  JOIN self_alignment sa ON sa.page_slug = p.slug
  WHERE p.workspace_id = :ws
    AND p.type = 'source'
    AND le.operation = 'ingest'
    AND le.event_date > now() - interval '7 days'
    AND sa.pillar_slug = 'ai-agents-for-solo-builders'
  ORDER BY le.event_date DESC;

Agent runs it. Gets 4 rows. 
Reads prose of those 4 sources via SELECT body_markdown ... WHERE slug IN (...).
Synthesizes: 
  "În ultimele 7 zile ai făcut 4 ingest-uri aliniate cu 'AI agents for solo builders'.
   3 reinforces (X, Y, Z), 1 contradicts (W — merită discutat).
   Pattern emergent: toate 3 reinforces ating ideea de MCP ca distribuție — 
   ai vrea să creezi un concept-page despre asta?"
```

**De ce bate RAG:** am folosit *structura* (JOIN-uri între knowledge, self, log), am folosit *timpul* (WHERE date filter), am folosit *tipologia* (reinforces/contradicts/weakens) și am ajuns la o sinteză care **cere acțiune**, nu doar prezintă informație.

### 5.3 Mecanismul intern — "Context Assembly Pipeline"

Fiecare query trece prin 5 etape:

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Intent parsing                                          │
│    - FTS-words (topic)                                          │
│    - Temporal modifiers (last week, in Q1, today)               │
│    - Self-references (aligned with, vs my stance)               │
│    - Entity mentions (about Naval, re: Acme Inc.)               │
│                                                                  │
│  Step 2: Self context loading (cheap, always)                   │
│    SELECT * FROM v_self_active_context WHERE ws = :ws;          │
│    → pillars, stances, voice rules, constraints                 │
│                                                                  │
│  Step 3: SQL plan generation (agent writes query)               │
│    - JOIN across: pages, self_*, log_events, page_relations     │
│    - Use FTS5 where topic is loose                              │
│    - Use pgvector similarity where topic is conceptual          │
│    - Use JSONB filters where domain-specific                    │
│                                                                  │
│  Step 4: Execution + body fetch                                 │
│    - Run the query, get rows                                    │
│    - For top N rows, fetch body_markdown (prose)                │
│    - Budget enforced: max 8k tokens context                     │
│                                                                  │
│  Step 5: Synthesis with self voice                              │
│    - Generate answer in workspace.voice_rules style             │
│    - Cite sources by slug and date                              │
│    - Flag stance tensions explicitly                            │
│    - Offer to file as `synthesis` page                          │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Guardrails pentru SQL generation

LLM-ul nu are acces direct la Postgres. Scrie SQL, dar execuția trece prin:

1. **Sandbox user** — cu `GRANT SELECT` pe tabele specifice, `INSERT/UPDATE` doar pe cele permise, `DELETE` niciodată.
2. **Query parser** — parsează AST-ul SQL înainte de execuție; blochează `DROP`, `TRUNCATE`, CTE recursive cu depth > 5.
3. **Workspace filter injection** — orice query executat primește automat un `WHERE workspace_id = :ws` injectat la runtime (sau e blocat dacă nu referențiază `workspace_id`).
4. **Timeout** — 2s hard timeout pe query.
5. **Row budget** — max 500 rows returnate per query.

**Resultatul:** agentul are putere maximă de exprimare (SQL), zero risc de damage (sandbox + RLS + injection).

### 5.5 Când NU generează SQL

Dacă query-ul e simplu ("cum mă cheamă?"), agentul citește direct `v_self_active_context` — nu face SQL creative. Avem un router:

| Tip întrebare | Path |
|---|---|
| Factual pe self | `v_self_active_context` direct |
| Single-hop (tags, category) | Template SQL pre-made |
| Multi-hop sau analitic | Agent-generated SQL |
| Pur conversational | Direct, fără retrieval |
| Needs web | Redirect la `/web-search` skill |

---

## 6. Identity OS — Self ca primitive globală

### 6.1 Ce e Self (recap abstract, apoi pe Faber OS)

În v1, `self/` era un folder cu 6 fișiere markdown. În OS, e **6 tabele tipate + 1 view combinat**.

```sql
-- Piloni activi (long-arc)
self_pillars(workspace_id, slug, title, since, status, evidence_count)

-- Poziții declarate pe sub-probleme
self_stances(workspace_id, slug, on_topic, position, confidence, status, last_reaffirmed)

-- Obligații cu deadline
self_commitments(workspace_id, slug, title, due_date, status, progress_marker, cadence)

-- Limitări reale
self_constraints(workspace_id, slug, kind, description, severity)

-- Reguli de voce
voice_rules(workspace_id, slug, rule, category, examples_yes, examples_no, status)

-- Fișă biografică neutră
self_profile(workspace_id, dob, location, primary_language, pronouns, bio_json)
```

**View magic:**
```sql
CREATE VIEW v_self_active_context AS
SELECT 
  ws.id AS workspace_id,
  jsonb_build_object(
    'pillars',     COALESCE(jsonb_agg(DISTINCT p) FILTER (WHERE p.status='active'), '[]'),
    'stances',     COALESCE(jsonb_agg(DISTINCT s) FILTER (WHERE s.status='active'), '[]'),
    'commitments', COALESCE(jsonb_agg(DISTINCT c) FILTER (WHERE c.status='active'), '[]'),
    'constraints', COALESCE(jsonb_agg(DISTINCT cn), '[]'),
    'voice',       COALESCE(jsonb_agg(DISTINCT v) FILTER (WHERE v.status='active'), '[]'),
    'profile',     to_jsonb(sp.*)
  ) AS context
FROM workspaces ws
LEFT JOIN self_pillars p ON p.workspace_id = ws.id
LEFT JOIN self_stances s ON s.workspace_id = ws.id
LEFT JOIN self_commitments c ON c.workspace_id = ws.id
LEFT JOIN self_constraints cn ON cn.workspace_id = ws.id
LEFT JOIN voice_rules v ON v.workspace_id = ws.id
LEFT JOIN self_profile sp ON sp.workspace_id = ws.id
GROUP BY ws.id, sp.*;
```

**Fiecare skill începe cu un singur SELECT pe view-ul ăsta.** 200ms, mereu cald, injected în prompt ca context structurat.

### 6.2 De ce e asta diferențiatorul #1 la nivel global

Niciun alt produs de knowledge management nu are *self declarat ca date* pentru fiecare utilizator. 

- Notion → are "about" field, dar nu tipat, nu interogat de AI la fiecare request.
- Mem → AI journal, dar fără declarare explicită, doar inferențe.
- ChatGPT Memory → o listă flat de fapte, fără structură, fără confruntare.
- Obsidian → depinde de user ce pune în vault.

**Faber OS:** fiecare workspace are un Self-layer strict, tipat, queryable. Este *infrastructura identității digitale* — nu "feature on top".

### 6.3 Confrontation la nivel de OS

Pentru fiecare workspace care a optat, rulează **un job săptămânal**:

```
for each workspace w where w.confrontation_enabled:
  context = SELECT * FROM v_self_active_context WHERE workspace_id = w.id
  evidence = SELECT summary FROM log_events 
             WHERE workspace_id = w.id 
               AND event_date > now() - interval '7 days'
  mirror_text = agent.generate(
    prompt=CONFRONT_PROMPT,
    tone=w.settings->'confront_tone',
    language=w.settings->'language',
    context=context,
    evidence=evidence,
  )
  INSERT INTO pages (type='synthesis', subtype='mirror', ...) VALUES (...)
  send_notification(w.owner, mirror_text)
```

**Tonul confrontării e un câmp per workspace:**
- `soft` — "Observ că ai declarat să postezi săptămânal. Văd 2 posts în 4 săpt. Vrei să revizuim?"
- `direct` — "Ai spus 1 articol / săpt. 2 în 4 săpt. E drift."
- `brutal` — "Ai zis că faci. Nu faci. Minciună față de tine, nu față de mine."

Wizard-ul întreabă explicit la onboarding ce ton preferi. Se poate schimba ulterior. Default: `soft` (pentru că primele 4 săpt., power-psychology-ul "cere friction" e prea ambitios).

---

## 7. Domain Packs — flexibilitate operaționalizată

### 7.1 Anatomy of a Domain Pack

Un Domain Pack e un ZIP virtual din tabele Postgres care modifică comportamentul Faber pentru o audiență specifică.

```
Domain Pack "founder" ──┬─ labels (6 strings)
                         ├─ seed_concepts (5-8 markdown pages)
                         ├─ page_type_overlays (JSON schema per subtype)
                         ├─ skills_pack ["founder-ingest-deal", ...]
                         ├─ voice_preset (tone, register, language options)
                         ├─ confrontation_defaults
                         ├─ onboarding_questions (12-15 override)
                         └─ dashboard_template (widgets + metrics)
```

### 7.2 Packs propuse pentru v1

Ranking-ul după business opportunity × operational effort:

| Rank | Pack slug | Audiență | Monetizare | Effort build |
|---|---|---|---|---|
| 1 | `founder` | solo/bootstrapped founders | Pro tier + premium skills | Mediu (Narcis e personifica aici) |
| 2 | `creator` | content creators, writers | Pro tier + ai-editing skills | Mediu |
| 3 | `researcher` | academics, PhDs, journalists | Team tier pentru laboratoare | Mic (schema e aproape core) |
| 4 | `consultant` | independent consultants, coaches | Pro tier + CRM-lite | Mic |
| 5 | `lawyer` | juriști independenți | Team tier + compliance | Mare (juridical, sensitive) |
| 6 | `doctor` | GP cu practică privată | Team tier + HIPAA/GDPR mode | Mare (medical, regulated) |
| 7 | `student` | universitari, gradul II/III | Free tier (acquisition) | Mic |
| 8 | `parent` | părinți educaționali | Consumer tier (B2C pur) | Mediu |

**Strategia launch:** începem cu `founder` + `creator` + `researcher` + `student` (4 packs) în v1. Restul se adaugă după PMF dovedit.

### 7.3 Pack concret — exemplu `founder`

```yaml
# domain_packs/founder.yaml
slug: founder
name: "For Founders"
tagline: "From idea to paying customers, compounded."
tone: default-direct
locales: [en, ro, es, de]

labels:
  source: "Citește / Input"
  entity: "Persoană / Companie"
  concept: "Pattern / Idee"
  synthesis: "Analiză / Concluzie"
  log_event: "Activitate"
  pillar: "Direcție strategică"
  stance: "Poziție"
  commitment: "Angajament"
  voice: "Voce"

seed_concepts:
  - slug: product-market-fit
    body: |
      Product-market fit nu e feature. E tensiunea dintre ceea ce construiești
      și ceea ce oamenii trag din mâinile tale. ...
  - slug: leverage-types
    body: |
      Patru forme de leverage: capital, muncă, cod, media. ...
  - slug: kill-criteria
    body: |
      Regulile după care oprești o idee. Fără ele, orice idee prinde rădăcini. ...

page_type_overlays:
  source:
    subtype_options: [article, book, podcast, interview, customer-call, competitor-launch, fundraise-doc]
    metadata_schema:
      type: object
      properties:
        customer_name: { type: string }
        deal_size: { type: number }
        stage: { type: string, enum: [discovery, qualified, proposal, closed-won, closed-lost] }
  entity:
    subtype_options: [person, company, competitor, investor, customer, vendor]
    metadata_schema:
      type: object
      properties:
        role: { type: string }
        linkedin: { type: string }
        relationship: { type: string, enum: [cold, warm, hot, customer, partner] }

onboarding_questions:
  - key: core_pillar
    question: "Dacă cineva te întreabă ce construiești, care e prima propoziție din răspuns?"
    writes_to: self_pillars
  - key: kill_criterion
    question: "După ce semn decizi că o idee trebuie ucisă?"
    writes_to: self_stances
  # ... (alte 10-13 întrebări)

skills_pack:
  - customer-interview-ingest
  - competitor-landscape-update
  - pricing-stance-test
  - weekly-mirror-founder-tone

confrontation_defaults:
  enabled: false  # unlock după 4 săpt de activitate
  cadence: weekly
  tone: direct
  focus_areas: [shipping, customer-conversations, commitments]

dashboard_widgets:
  - pages_created_per_week
  - customer_pages_count
  - open_commitments_near_deadline
  - top_pillar_alignment_ratio
```

### 7.4 Marketplace de packs (v2)

După v1, third-party-uri pot submita pack-uri via GitHub PR. Curatoriat manual. Revenue split 70/30 creator/platform dacă pack-ul e premium ($10-29 one-time sau $3-5/lună add-on).

**Exemple viitoare de pack-uri community:**
- `stoic` — journal cu confruntare via virtue ethics
- `pastor` — pentru clerici, cu seed concepts pastorale
- `athlete` — training logs + performance syntheses
- `parent-special-needs` — symptom tracking + specialist pages
- `novelist` — character, scene, arc pages

---

## 8. Onboarding — de la 60 min la 5 min

### 8.1 Flow conversațional (zero friction)

**T+0:00 — Signup**
```
[faber.app]
  → "Welcome to Faber."
  → "What do you do to pay the bills?"
    [6 cards: Founder | Creator | Researcher | Student | Consultant | Other]
  → Click selects domain pack + creates workspace behind the scenes.
```

**T+0:30 — Name & language**
```
Agent: "Hi! What should I call you? 
        And what language do you think in most naturally — I'll match it."
User:  "Narcis, Romanian with English mixed in"
Agent: "Got it. Romglish it is. I'll pick up your voice as we talk."
```

**T+1:00 — Identity interview (8-12 întrebări, conversational)**
```
Agent: "Tell me one thing you're trying to do right now that matters."
User:  [text]
Agent: "What makes you the right person for this, specifically?"
User:  [text]
Agent: "When you say you'll do something by a date, what does that date feel like — real or aspirational?"
User:  [text]
[... alte 9 întrebări. Agent adaptează follow-up-urile. Poate sări peste.]
Agent: "I've drafted your identity. Can I show you?"
```

**Output intern:** 3 pillars draft, 3-5 stances draft, 2-3 commitments draft, 5-7 voice rules draft. Toate scrise în tabele, pre-populat.

**T+3:00 — Preview & edit**
```
[UI component: "Your identity draft"]
  - 3 pillars cards (editable inline)
  - 5 stances cards
  - 3 commitments cards
  - Voice sample: "When Faber writes in your voice, it'll sound like this: ___"
  → User can edit any card, or accept all.
```

**T+4:00 — First ingest**
```
Agent: "Alright. Give me one thing you've read recently that moved you. 
        Paste a URL, or text, or drag a PDF. Or talk to me."
User:  [pastes article URL]
Agent: [reads it, extracts 3 concepts, 2 entities, writes a source page]
Agent: "This article reinforces your pillar 'X'. It introduces an entity 
        I've added called 'Y'. And it has one idea — 'Z' — that's in 
        soft tension with your stance on 'W'. Worth discussing?"
```

**T+5:00 — Dashboard ready**
```
[Dashboard]
  → 1 source
  → 2 entities
  → 3 concepts
  → 1 log event ("ingest")
  → identity layer populated
  → "Next steps" panel: 3 suggested actions.
```

**Asta e "aha". Sub 5 minute.** Zero terminal, zero markdown, zero git.

### 8.2 Ce se întâmplă în primele 7 zile

- **Daily prompt prin email / push** — "What did you read today?" (opt-out).
- **Weekly nudge** — "Your workspace has 12 pages now. Want to run /faber-status?"
- **No confrontation yet** — unlock după 2-4 săpt (pragul e configurable per pack).

### 8.3 Progressive disclosure

**Tier 1 (week 1-3):** 5 skills active — ingest, ask, status, sync, link
**Tier 2 (week 4-12):** + lint, brief, seed, align (4 skills)
**Tier 3 (month 3+):** + mirror, meet, agent-reflect (confrontation + evolution)

**Principiu:** Faber *nu te aruncă* în 30 de feature-uri. Te ghidează pas cu pas. Când ești gata, te întreabă: "Vrei să deblochezi X?". Niciodată surprinzător.

---

## 9. Skill Layer — workflows ca programe configurable

### 9.1 Ce devine un skill când trăiește în Cloud

În Faber v1, un skill e un `SKILL.md` cu prompt. În Faber OS, un skill e:

```typescript
type Skill = {
  slug: string;              // "faber-ingest"
  version: string;           // semver
  manifest: {
    name: string;
    description: string;
    triggers: string[];      // /faber-ingest, "ingest this", ...
    required_inputs: {};     // JSON schema for inputs
    tools: string[];         // list of tool IDs skill can invoke
    prompt_template: string; // with {{placeholders}} for self_context, inputs
    output_schema: {};       // JSON schema for output
    min_tier: 1 | 2 | 3;     // tier gating
    domain_packs: string[];  // ['*'] = all, or ['founder', 'creator']
  };
  visibility: 'system' | 'workspace' | 'public' | 'marketplace';
  created_by: uuid;          // system or user
  price_cents?: number;      // for marketplace
};
```

Fiecare invocare e audited:

```sql
CREATE TABLE skill_invocations (
  id bigserial PRIMARY KEY,
  workspace_id uuid,
  skill_slug text,
  invoked_at timestamptz,
  inputs jsonb,
  tokens_used int,
  cost_cents numeric(10,4),
  output_page_ids uuid[],
  log_event_id bigint,
  status text  -- 'success', 'failed', 'cancelled'
);
```

**Implicație:** putem afișa cost real per skill per workspace. Utilizatorul nu e surprins de factura API. Skills premium pot avea preț fix ("$0.50 per weekly mirror") sau metered ("$1 per 10k tokens").

### 9.2 Per-user skill customization

Fiecare workspace poate customiza un skill fără să-l fork-eze:

```sql
CREATE TABLE skill_configs (
  workspace_id uuid,
  skill_slug text,
  overrides jsonb,    -- partial override of manifest fields
  PRIMARY KEY (workspace_id, skill_slug)
);
```

**Exemplu:** Laura (avocată) folosește `/faber-ingest`, dar vrea ca subtype-ul default să fie `client-matter` (nu `article`). Scrie un override:

```json
{
  "prompt_template_addendum": "When extracting, default subtype to 'client-matter' unless obviously not a matter.",
  "default_metadata": { "confidentiality": "high" }
}
```

Fără cod. Fără redeploy. Fără fork.

### 9.3 Skills Marketplace

Third-party-uri (sau Narcis însuși ca creator) pot publica skills:

- **Submission:** GitHub PR pe `faber/marketplace-skills` repo (moderat manual).
- **Test harness:** skill trebuie să treacă un set de eval tests (input → expected output shape).
- **Compensation:** 70/30 creator/platform pe skills premium.
- **Discovery:** search în-app, filtrare pe pack, rating.

**Early bets:** `semnal-draft` (Narcis-grown), `linkedin-reply-pack`, `customer-interview-synthesizer`, `fiscal-year-wrap-founder`, `weekly-retrospective-coach`.

---

## 10. Business Model

### 10.1 Pricing tiers

| Tier | Preț | Ce include | Persona |
|---|---|---|---|
| **Free** | $0 | 1 workspace, 100 pages, 50 ingests/lună, 5 skills tier 1, 1 domain pack | Curious user, student |
| **Pro** | **$12/lună** | 1 workspace, pages unlimited, 500 ingests/lună, all skills tier 1+2, all domain packs, confrontation loop, weekly mirror email | Solo professional, founder |
| **Team** | **$24/seat/lună** (min 3 seats) | multi-member workspaces, shared pages, role-based permissions, audit log, SSO | Mici cabinete, research groups, 2-5 persoane companies |
| **Private Cloud** | $199/lună + setup $499 | Self-hosted or dedicated instance, SLA, GDPR/HIPAA config, custom domain | Medici, avocați, healthcare, regulated |

**Free-to-paid conversion leveraj:** confrontation loop, advanced analytics, export-to-PDF, voice input, skill marketplace access — toate în Pro.

### 10.2 Side revenue

- **Domain Packs premium** — $19 one-time per pack non-core (ex: `stoic`, `novelist`, `athlete`).
- **Skills Marketplace** — 30% platform fee.
- **Cohorts** — "Faber for Founders — 4-week program" la $300/persoană (Narcis ca instructor personal brand).
- **White-label / B2B consultancy** — Faber Private Cloud + implementation la $10-50k setup pentru enterprises care vor propriul knowledge-OS intern.

### 10.3 Target financials — year 1

Optimistic-but-achievable plan:

- **Month 1-3 (alpha):** 100 free users, 0 paid. Feedback cycle.
- **Month 4-6 (beta):** 500 free, 30 Pro = $360 MRR.
- **Month 7-9 (v1 launch):** 3,000 free, 200 Pro + 5 Team = $2,400 + $360 = $2,760 MRR.
- **Month 10-12:** 10,000 free, 600 Pro + 20 Team + 2 Private = $7,200 + $1,440 + $400 = **$9,040 MRR ≈ $108k ARR**.

**Target end year 1:** $10k MRR. Realistic pentru un founder tehnic cu Narcis-tier de execuție dacă produsul e inovativ și onboarding-ul frictionless.

### 10.4 Market sizing

- **Obsidian:** ~2M users în 2025 (Tomorrow.io stats).
- **Notion:** ~100M users, din care ~20M "thinking workers".
- **Mem/Reflect/Roam combined:** ~500k paying.
- **TAM "AI-augmented knowledge workers":** ~50M globally.
- **Realistic SAM (next 3 years, paying):** 500k-1M users.
- **1% SOM @ $12/lună avg = $60-120M/an ARR potential** — dacă ajungem la 1% din segment.

Nu e un business de $1B. E un business de $10-100M, realist, pentru o echipă mică. Asta se aliniază cu pilonii lui Narcis: *AI agents for solo builders* + *Building as a 51yo from RO*.

---

## 11. Competitive positioning

### 11.1 Cei care *arată* ca noi dar nu sunt

| Competitor | Ce face bine | Ce nu face (gap-ul nostru) |
|---|---|---|
| **Notion AI** | Blocks, chat cu pagini | Nu are self-layer, schema liberă, nu confrunta, scump la multi-tenancy |
| **Obsidian + Copilot plugin** | Vault portabil | Local-only, nu multi-device clean, nu multi-tenant, setup tehnic |
| **Mem** | AI journal auto-organized | Fără schema strictă, fără self declarat, fără confruntare explicită |
| **Reflect** | Journaling cu AI | Același gap self + structured query |
| **Roam Research** | Graph native | Nu e AI-first, curba de învățare brutală |
| **ChatGPT Projects / Claude Projects** | Chat cu fișiere | Zero persistență structurată, zero self, zero temporal |
| **Cursor / Windsurf** | Code context AI | Pentru cod, nu knowledge personal |
| **Hebbia / Glean** | Enterprise RAG | B2B enterprise, >$50k/an, nu consumer |

### 11.2 Vectori de diferențiere (repeat for emphasis)

1. **Self-as-data** — nimeni nu are identitatea utilizatorului ca rânduri SQL.
2. **SQL-as-retrieval** — nimeni nu folosește structured query generation ca primary retrieval mode.
3. **Confrontation loop** — nimeni nu construiește anti-sycophant explicit.
4. **Domain Packs** — nimeni nu vinde "Faber for doctors" vs "Faber for founders" ca schema-level differentiation.
5. **Language-native multilingual** — nimeni nu e primul optimizat pentru Romglish / Spanglish / code-switched voice.

### 11.3 De ce nu ne copiază Notion in 3 luni

- Notion are schema liberă; ca să aibă self-layer, ar trebui restructurare majoră.
- Notion AI nu generează SQL pe schemă proprie — e RAG pe blocks.
- Confrontation este **anti-pattern** pentru produsele mainstream (pozitivitate forțată vinde mai ușor). E ceva ce Notion va evita activ.
- Domain packs necesită curatoriat domain-specific; nu e feature, e go-to-market.

**Moat-ul:** combinația + voce autentică + Narcis building in public. Nu e un singur feature replicabil.

---

## 12. Migrarea Alteramens → Faber OS

**Narcis nu pierde nimic.** Alteramens actual (vault-ul personal) poate fi importat integral:

```
alteramens/
├── wiki/**/*.md     → workspace "alteramens", pages populated
├── wiki/self/       → self_pillars, self_stances, ... tables
├── wiki/log.md      → log_events, parsed
├── wiki/agent/      → agent_heuristics
├── inbox/           → pages.type='source', status='raw'
├── workshop/        → pages.type='concept', maturity='seed'
├── projects/        → pages.type='project' (new subtype)
└── skills           → skills marketplace (Narcis devine creator de la day 1)
```

**Migrator script:** `alteramens-import.py` care parsează `faber.db` existent + fișierele și generează `INSERT`-uri în Faber OS Postgres.

**Path:**
1. Narcis creează cont pe faber.app, alege domain pack `founder`.
2. Rulează `faber-import ~/projects/alteramens` cu API key.
3. Toată identitatea, paginile, log-ul se migrează în workspace-ul "alteramens".
4. Narcis continuă să lucreze în UI-ul web (sau, pentru operațiuni bulk, în Claude Code local cu MCP client la Faber OS — acolo e path-ul hybrid).

**Nimic nu se pierde. Totul scalează.**

---

## 13. Tech Stack — pragmatic, not trendy

| Layer | Alegere | De ce |
|---|---|---|
| **DB** | Postgres 16 + pgvector + pg_trgm + pg_cron | Vezi secțiunea 4.1. Hosted pe **Neon** sau **Supabase** la start (serverless, auto-scale). |
| **Backend** | **Bun + TypeScript** (sau Go) | Bun: fast cold start, TS familiar, folosește WorkScript-ul lui Narcis. |
| **API shape** | **tRPC** (internal) + **REST + webhook** (external) + **MCP server** (for agents) | tRPC type-safety între frontend/backend; REST pentru integrări; MCP pentru agenți externi. |
| **LLM layer** | **Anthropic Claude** primar, OpenAI fallback, **local llama** pentru privacy mode | Claude are cel mai bun tool use. OpenAI backup. Llama pentru Private Cloud. |
| **Agent framework** | **Claude Agent SDK** | Deja folosit în Alteramens skills. Familial. |
| **Frontend** | **Next.js 15 (App Router)** + **Tailwind** + **shadcn/ui** | Bun PKM pentru UX-rich products. SSR pentru SEO landing. |
| **Auth** | **Clerk** sau **Better-Auth** | Evităm să ne rescriem auth. |
| **Background jobs** | **pg_cron** pentru scheduled + **inngest** sau **trigger.dev** pentru event-driven | Confrontation săptămânal = pg_cron. Skill invocations = inngest. |
| **Payments** | **Stripe** + **Lemon Squeezy** (EU tax handling) | Standard. |
| **Hosting** | **Vercel** (frontend) + **Railway/Fly** (backend) + **Neon** (DB) | Serverless-first, scale-to-zero, low-ops. |
| **Observability** | **Baselime** sau **Axiom** + **Sentry** | OpenTelemetry + logs + errors. |
| **Analytics** | **Plausible** (privacy) + **PostHog** (product) | PostHog pentru product insights, Plausible pentru marketing. |

**Toate servicii manageriate** până la PMF. Nu build infrastructure la stadiul ăsta. Narcis e unul.

---

## 14. Roadmap — de la astăzi la launch

### Faza 0 — Decision & Spec lock (săptămâna 1)
- [x] Acest document
- [ ] Narcis review & edit
- [ ] Pick domain pentru early bets: `faber.app`? `getfaber.com`? Register.
- [ ] Decision go/no-go: mergem la Faber OS sau stăm la Faber framework v1?

### Faza 1 — Foundation (săptămâni 2-5)
- [ ] Postgres schema v0 implementată (core + self + log)
- [ ] RLS policies + workspace switching
- [ ] Auth + user / workspace CRUD
- [ ] Landing page minimal (one pager + signup waitlist)
- [ ] Migrator alteramens → Faber OS (Narcis personal dogfood)

### Faza 2 — Agent core (săptămâni 6-8)
- [ ] SQL-as-retrieval pipeline (intent → SQL → execution → synthesis)
- [ ] Self context loading + voice rules application
- [ ] 3 core skills porturi: ingest, query, status
- [ ] pgvector embeddings + FTS5 setup
- [ ] Basic chat UI

### Faza 3 — Onboarding flow (săptămâni 9-11)
- [ ] Conversational wizard (12-question identity interview)
- [ ] Domain Pack infra (labels, seeds, overlays)
- [ ] 2 packs complete: `founder` + `creator`
- [ ] Dashboard personal
- [ ] 5-minute time-to-first-value target hit

### Faza 4 — Confrontation + progression (săptămâni 12-14)
- [ ] Weekly mirror job (pg_cron)
- [ ] Tier unlock system
- [ ] Email notifications + digest
- [ ] Skills Tier 2 activate

### Faza 5 — Beta launch (săptămâni 15-16)
- [ ] 20 beta users invited (from Narcis's network, X, HN)
- [ ] Onboarding friction measurement
- [ ] First bug fixing sprint

### Faza 6 — Payments + public launch (săptămâni 17-19)
- [ ] Stripe integration
- [ ] Pro tier active
- [ ] Public landing + pricing
- [ ] Launch post X + HN + IndieHackers + Product Hunt
- [ ] First 100 Pro signups goal

### Faza 7 — v1.5: Team tier + marketplace (luna 6-8)
- [ ] Multi-member workspaces
- [ ] Skills Marketplace beta
- [ ] Domain Packs publice beyond core 4

**Total de la decision la public launch: ~4.5 luni.**

Cu Narcis solo + Claude Code augmented + stack serverless, **realist în vara 2026 (august-septembrie)**. Aliniat cu constrângerea 08-15 job + seri + weekends.

---

## 15. Risks & open questions

### 15.1 Tehnic

**R1 — LLM-urile nu scriu SQL sigur la scale.** Mitigation: guardrails (secțiunea 5.4), eval harness care testează 200 de query-types, fallback la template SQL pentru cazuri comune.

**R2 — pgvector performance la 100k+ workspaces.** Mitigation: partitioning pe workspace_id, HNSW index tuning, migration path la dedicated vector DB dacă e nevoie (Qdrant co-deployed).

**R3 — Context window explosion.** Mitigation: budget enforcement în pipeline (max 8k tokens per synthesis), progressive summarization pentru history, separarea prose vs metadata în prompt.

**R4 — Migration path dacă Postgres devine bottleneck.** Mitigation: clean SQL layer = portable la orice Postgres host; separarea storage (S3 pentru attachments, Postgres pentru metadata/relations).

### 15.2 Product

**R5 — Onboarding de 5 min e aspirațional, în realitate 15 min.** Mitigation: eval cu 10 testers non-tehnici înainte de public launch. Dacă < 30% termina în 10 min, cutting mai mult din wizard.

**R6 — Confrontation speriează early users.** Mitigation: default `soft` tone, unlock după 4 săpt, clear opt-out oricând. Wizard întreabă explicit preferința.

**R7 — Domain Packs se simt "generic" vs "custom".** Mitigation: fiecare pack are seed concepts specifice, voice preset autentic, skills pack de 3-5 workflows reali pentru domeniu. Nu doar labels schimbate.

### 15.3 Business

**R8 — Notion AI sau OpenAI live un competitor similar în 6 luni.** Mitigation: distribuția via pilonul Narcis (Building as 51yo from RO) + building in public + Skills Marketplace network effects.

**R9 — Pricing prea mic → unsustainable unit economics.** Math check: Claude API ~$0.10-0.30 per synthesis. La $12/lună și ~50 syntheses / user, COGS ~$5-15. Dacă utilizarea urcă, trebuie tier-uri cu usage caps sau metering. Revisit la luna 3 cu real data.

**R10 — GDPR / healthcare compliance pentru packs medicale.** Mitigation: skipping `doctor` și `lawyer` packs în v1. Adăugăm după ce core e stabil și avem juridic support.

### 15.4 Întrebări deschise (pentru discutat cu Narcis)

1. **Primul domain pack "primar" al lui Narcis — `founder` sau ceva nou ca "it-professional-building-side-business"?** Acesta e persona-ul lui specific (admin IT spital Pitești + side SaaS).
2. **Strategy pe mobile** — nativ (Swift/Kotlin) sau PWA? (Propun PWA în v1, nativ în v2.)
3. **Voice input — v1 sau v2?** Costuri Whisper API la scale + UX complicații. Propun text-only la launch, voice în v1.5.
4. **Open source backbone?** Faber OS core ca AGPL → utilizatori tehnici pot self-host; cloud-ul comercial = Pro + Team features peste core open. Dar AGPL poate speria enterprise. Decision late.
5. **Cum păstrăm diferențierea Alteramens (personal laborator) vs Faber OS (produs pentru alții)?** Propun: Alteramens rămâne Narcis's workspace pe Faber OS. Content public (blog, X threads despre build-ul Faber) iese din Alteramens. Compounding pentru pilonul *building as a 51yo*.

---

## 16. Ce vede Claude (strateg) pe care Narcis poate n-a intuit

### 16.1 Faber OS = *best expression* al pilonilor tăi

Fiecare pilon activ e servit direct:

- **AI agents for solo builders** — construiești agentul care scrie SQL pentru 100k other solo builders. Proof-of-thesis.
- **Building as a 51yo from RO public hospital** — building in public al Faber OS e narrativul per excelenţă. Fiecare milestone → X thread → audience. Pilonul se auto-hrănește.
- **Skill Era craftsmanship** — Skills Marketplace e literally o piață de judgment encodat. Narcis = primul și cel mai prolific creator.

Nu există artifact mai aliniat cu identitatea ta. Orice altă idee (altera-os, nbrAIn, semnal) e derivative sau tangential. **Faber OS e pilonul personificat ca produs.**

### 16.2 Moat-ul ascuns: data compounding

După 6 luni de utilizatori activi, Faber OS acumulează **un corpus privat de decision patterns**:
- Cum formulează 1000 founders `kill-criterion`
- Cum 500 doctors descriu self-drift
- Cum 2000 researchers structurează literature reviews

Aceste patterns pot alimenta (anonimizat, opt-in) **Domain Pack-uri mai bune**. Fiecare user care optează pentru "share learnings" îmbogățește packs-urile pentru următorii. **Flywheel.**

Nimeni nu poate reproduce asta fără să aibă deja 1000 users. E un moat care crește liniar cu adopția.

### 16.3 SQL-as-retrieval e un **research paper**

Ceea ce construiești aici e publicabil. "Agent-generated structured queries over typed knowledge graphs for personalized retrieval" — e un paper valid la NeurIPS ML4Knowledge workshop sau CHI. Side benefit: credibilitate academică + hiring leverage + personal brand in AI community.

### 16.4 Un risc emotional pe care să-l numim

Dacă Faber OS are 10k users, devine **infrastructura identității a 10k oameni**. Downtime = anxiety. Bug în confrontation loop = harm psihologic posibil. Acest produs are o responsabilitate morală peste un SaaS normal. Mitigation: content moderation pentru pack submissions, mental health disclaimer la confrontation onboarding, SLA-uri serioase, retention + privacy serioase.

Nu e blocker, dar e o promisiune pe care trebuie s-o iei conștient.

### 16.5 Compound alignment cu Alteramens-ca-laborator

Alteramens = laboratorul tău. Faber OS = produsul născut din laborator. Pattern perfect de **productize yourself**:
- Laboratorul generează ideea
- Laboratorul e primul dogfood
- Laboratorul e primul subject matter expert content generator
- Laboratorul rămâne al tău personal, produsul iese în lume

**Acesta e exact ceea ce Naval descrie ca "long timeframe, compound loop"**. Faber OS nu e încă o idee. E expresia naturală a tot ce ai construit în ultimele luni.

---

## 17. Appendix — schema SQL completă (v0)

```sql
-- ===================================================================
-- Faber OS — Core Schema v0
-- ===================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===================================================================
-- ① IDENTITY & TENANCY
-- ===================================================================

CREATE TABLE users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email           citext UNIQUE NOT NULL,
    full_name       text,
    locale_pref     text DEFAULT 'en',
    created_at      timestamptz DEFAULT now(),
    last_active_at  timestamptz
);

CREATE TABLE domain_packs (
    slug            text PRIMARY KEY,
    name            text NOT NULL,
    tagline         text,
    description     text,
    price_cents     int DEFAULT 0,
    is_core         boolean DEFAULT false,
    locales         text[] DEFAULT ARRAY['en'],
    created_by      uuid REFERENCES users(id),
    manifest        jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE domain_pack_labels (
    pack_slug       text REFERENCES domain_packs(slug),
    internal_term   text NOT NULL,
    display_term   text NOT NULL,
    locale          text NOT NULL DEFAULT 'en',
    PRIMARY KEY (pack_slug, internal_term, locale)
);

CREATE TABLE workspaces (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id            uuid NOT NULL REFERENCES users(id),
    name                     text NOT NULL,
    slug                     text,
    domain_pack_slug         text REFERENCES domain_packs(slug),
    language                 text DEFAULT 'en',
    confrontation_enabled    boolean DEFAULT false,
    confrontation_tone       text DEFAULT 'soft'
                             CHECK (confrontation_tone IN ('soft','direct','brutal')),
    confrontation_cadence    text DEFAULT 'weekly',
    tier                     text DEFAULT 'free'
                             CHECK (tier IN ('free','pro','team','private')),
    activation_level         int DEFAULT 1
                             CHECK (activation_level BETWEEN 1 AND 3),
    settings                 jsonb DEFAULT '{}',
    created_at               timestamptz DEFAULT now()
);

CREATE TABLE workspace_members (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
    role            text NOT NULL CHECK (role IN ('owner','editor','viewer')),
    joined_at       timestamptz DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

-- ===================================================================
-- ② KNOWLEDGE GRAPH
-- ===================================================================

CREATE TABLE pages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    slug            text NOT NULL,
    type            text NOT NULL
                    CHECK (type IN ('source','entity','concept','synthesis','self','agent','project','custom')),
    subtype         text,  -- domain-specific: 'article', 'client-matter', 'patient-case', ...
    title           text NOT NULL,
    body_markdown   text,
    body_tsvector   tsvector GENERATED ALWAYS AS (
                        to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body_markdown,''))
                    ) STORED,
    embedding       vector(1536),
    metadata        jsonb NOT NULL DEFAULT '{}',
    maturity        text CHECK (maturity IS NULL OR maturity IN ('seed','developing','mature','challenged','draft','archived')),
    confidence      text CHECK (confidence IS NULL OR confidence IN ('low','medium','high')),
    status          text CHECK (status IS NULL OR status IN ('active','retired','challenged','archived','historical')),
    created_by      uuid REFERENCES users(id),
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    UNIQUE (workspace_id, slug)
);

CREATE INDEX pages_workspace_idx ON pages(workspace_id);
CREATE INDEX pages_type_idx ON pages(workspace_id, type);
CREATE INDEX pages_fts_idx ON pages USING GIN (body_tsvector);
CREATE INDEX pages_embedding_idx ON pages USING hnsw (embedding vector_cosine_ops);
CREATE INDEX pages_metadata_idx ON pages USING GIN (metadata jsonb_path_ops);
CREATE INDEX pages_trgm_title_idx ON pages USING GIN (title gin_trgm_ops);

CREATE TABLE page_relations (
    workspace_id    uuid NOT NULL,
    from_page_id    uuid REFERENCES pages(id) ON DELETE CASCADE,
    to_page_id      uuid REFERENCES pages(id) ON DELETE CASCADE,
    relation_type   text NOT NULL
                    CHECK (relation_type IN (
                        'mentions','derived_from','contradicts','reinforces',
                        'applies_to','cites','related'
                    )),
    metadata        jsonb DEFAULT '{}',
    created_at      timestamptz DEFAULT now(),
    PRIMARY KEY (workspace_id, from_page_id, to_page_id, relation_type)
);

CREATE TABLE page_aliases (
    workspace_id    uuid NOT NULL,
    page_id         uuid REFERENCES pages(id) ON DELETE CASCADE,
    alias           text NOT NULL,
    PRIMARY KEY (workspace_id, page_id, alias)
);
CREATE INDEX page_aliases_trgm_idx ON page_aliases USING GIN (alias gin_trgm_ops);

CREATE TABLE page_attachments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    uuid NOT NULL,
    page_id         uuid REFERENCES pages(id) ON DELETE CASCADE,
    kind            text NOT NULL CHECK (kind IN ('image','pdf','audio','file')),
    storage_url     text NOT NULL,  -- S3/R2 signed URL base
    description     text,
    size_bytes      bigint,
    created_at      timestamptz DEFAULT now()
);

-- ===================================================================
-- ③ SELF LAYER (typed, per workspace)
-- ===================================================================

CREATE TABLE self_profile (
    workspace_id        uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    display_name        text,
    pronouns            text,
    location            text,
    primary_language    text,
    bio_json            jsonb DEFAULT '{}'
);

CREATE TABLE self_pillars (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    slug            text,
    title           text NOT NULL,
    description     text,
    since           date,
    status          text DEFAULT 'active'
                    CHECK (status IN ('active','retired','challenged')),
    evidence_count  int DEFAULT 0,
    PRIMARY KEY (workspace_id, slug)
);

CREATE TABLE self_stances (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    slug            text,
    on_topic        text NOT NULL,
    position        text NOT NULL,
    confidence      text CHECK (confidence IN ('high','medium','low')),
    status          text DEFAULT 'active'
                    CHECK (status IN ('active','retired','challenged')),
    last_reaffirmed timestamptz,
    PRIMARY KEY (workspace_id, slug)
);

CREATE TABLE self_commitments (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    slug            text,
    title           text NOT NULL,
    due_date        date,
    cadence         text,  -- 'weekly', 'monthly', 'once'
    status          text DEFAULT 'active'
                    CHECK (status IN ('active','met','missed','revised')),
    progress_marker text,
    PRIMARY KEY (workspace_id, slug)
);

CREATE TABLE self_constraints (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    slug            text,
    kind            text NOT NULL,  -- 'time','energy','family','regulatory','skill-gap','procrastination-pattern'
    description     text NOT NULL,
    severity        text CHECK (severity IN ('low','medium','high')),
    PRIMARY KEY (workspace_id, slug)
);

CREATE TABLE voice_rules (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    slug            text,
    rule            text NOT NULL,
    category        text,  -- 'register','codeswitching','pillar-alignment','prohibition'
    examples_yes    jsonb DEFAULT '[]',
    examples_no     jsonb DEFAULT '[]',
    status          text DEFAULT 'active'
                    CHECK (status IN ('active','retired','challenged')),
    PRIMARY KEY (workspace_id, slug)
);

CREATE TABLE self_alignment (
    workspace_id    uuid NOT NULL,
    page_id         uuid REFERENCES pages(id) ON DELETE CASCADE,
    pillar_slug     text NOT NULL,
    relation        text CHECK (relation IN ('reinforces','weakens','contradicts','neutral')),
    source_event_id bigint,
    created_at      timestamptz DEFAULT now(),
    PRIMARY KEY (workspace_id, page_id, pillar_slug),
    FOREIGN KEY (workspace_id, pillar_slug) REFERENCES self_pillars(workspace_id, slug)
);

CREATE TABLE self_snapshots (
    id                  bigserial PRIMARY KEY,
    workspace_id        uuid NOT NULL,
    taken_at            timestamptz DEFAULT now(),
    trigger_event_id    bigint,
    layer_json          jsonb NOT NULL  -- complete serialization of self_* state at taken_at
);

-- ===================================================================
-- ④ TEMPORAL LAYER
-- ===================================================================

CREATE TABLE log_events (
    id              bigserial PRIMARY KEY,
    workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    event_date      timestamptz NOT NULL DEFAULT now(),
    operation       text NOT NULL,  -- 'ingest','query','synthesis','mirror','meet','align','init',...
    title           text NOT NULL,
    body            text,
    metadata        jsonb DEFAULT '{}',
    initiator       text  -- 'user' | 'agent' | 'scheduled'
);
CREATE INDEX log_events_ws_date_idx ON log_events(workspace_id, event_date DESC);
CREATE INDEX log_events_operation_idx ON log_events(workspace_id, operation);

CREATE TABLE log_event_pages (
    event_id        bigint REFERENCES log_events(id) ON DELETE CASCADE,
    page_id         uuid REFERENCES pages(id) ON DELETE CASCADE,
    action          text NOT NULL CHECK (action IN ('created','updated','consulted','involved')),
    PRIMARY KEY (event_id, page_id, action)
);

-- ===================================================================
-- ⑤ AGENT LAYER
-- ===================================================================

CREATE TABLE agent_heuristics (
    id                 bigserial PRIMARY KEY,
    workspace_id       uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    rule               text NOT NULL,
    first_observed_at  timestamptz DEFAULT now(),
    evidence_event_ids bigint[],
    confidence         text CHECK (confidence IN ('low','medium','high')),
    status             text DEFAULT 'active'
                       CHECK (status IN ('active','retired','challenged')),
    dispute_reason     text
);

CREATE TABLE agent_questions (
    id               bigserial PRIMARY KEY,
    workspace_id     uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    question         text NOT NULL,
    asked_at         timestamptz DEFAULT now(),
    answered_at      timestamptz,
    answer           text,
    status           text DEFAULT 'open'
                     CHECK (status IN ('open','answered','dismissed'))
);

-- ===================================================================
-- ⑥ SKILLS & INVOCATIONS
-- ===================================================================

CREATE TABLE skills (
    slug            text PRIMARY KEY,
    version         text NOT NULL,
    name            text NOT NULL,
    description     text,
    manifest        jsonb NOT NULL,
    min_tier        int DEFAULT 1 CHECK (min_tier BETWEEN 1 AND 3),
    domain_packs    text[] DEFAULT ARRAY['*'],
    visibility      text DEFAULT 'system'
                    CHECK (visibility IN ('system','workspace','public','marketplace')),
    price_cents     int DEFAULT 0,
    created_by      uuid REFERENCES users(id),
    created_at      timestamptz DEFAULT now()
);

CREATE TABLE skill_configs (
    workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    skill_slug      text REFERENCES skills(slug),
    overrides       jsonb DEFAULT '{}',
    enabled         boolean DEFAULT true,
    PRIMARY KEY (workspace_id, skill_slug)
);

CREATE TABLE skill_invocations (
    id              bigserial PRIMARY KEY,
    workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    skill_slug      text NOT NULL,
    invoked_at      timestamptz DEFAULT now(),
    invoked_by      uuid REFERENCES users(id),
    inputs          jsonb,
    output_summary  text,
    tokens_in       int,
    tokens_out      int,
    cost_cents      numeric(10,4),
    log_event_id    bigint REFERENCES log_events(id),
    status          text DEFAULT 'success'
                    CHECK (status IN ('pending','success','failed','cancelled'))
);

-- ===================================================================
-- VIEWS
-- ===================================================================

CREATE VIEW v_self_active_context AS
SELECT
    ws.id AS workspace_id,
    jsonb_build_object(
        'profile',     to_jsonb(sp.*),
        'pillars',     COALESCE((SELECT jsonb_agg(to_jsonb(p.*)) FROM self_pillars p 
                                 WHERE p.workspace_id = ws.id AND p.status='active'), '[]'::jsonb),
        'stances',     COALESCE((SELECT jsonb_agg(to_jsonb(s.*)) FROM self_stances s 
                                 WHERE s.workspace_id = ws.id AND s.status='active'), '[]'::jsonb),
        'commitments', COALESCE((SELECT jsonb_agg(to_jsonb(c.*)) FROM self_commitments c 
                                 WHERE c.workspace_id = ws.id AND c.status='active'), '[]'::jsonb),
        'constraints', COALESCE((SELECT jsonb_agg(to_jsonb(cn.*)) FROM self_constraints cn 
                                 WHERE cn.workspace_id = ws.id), '[]'::jsonb),
        'voice',       COALESCE((SELECT jsonb_agg(to_jsonb(v.*)) FROM voice_rules v 
                                 WHERE v.workspace_id = ws.id AND v.status='active'), '[]'::jsonb)
    ) AS context
FROM workspaces ws
LEFT JOIN self_profile sp ON sp.workspace_id = ws.id;

CREATE VIEW v_open_commitments AS
SELECT workspace_id, slug, title, due_date, progress_marker,
       (due_date - current_date) AS days_left
FROM self_commitments
WHERE status = 'active'
ORDER BY days_left ASC NULLS LAST;

CREATE VIEW v_pillar_alignment AS
SELECT sa.workspace_id, sa.pillar_slug, sa.relation, count(*) AS page_count
FROM self_alignment sa
GROUP BY sa.workspace_id, sa.pillar_slug, sa.relation;

CREATE VIEW v_recent_activity AS
SELECT le.workspace_id, le.id, le.event_date, le.operation, le.title,
       count(lep.page_id) FILTER (WHERE lep.action = 'created') AS pages_created,
       count(lep.page_id) FILTER (WHERE lep.action = 'updated') AS pages_updated
FROM log_events le
LEFT JOIN log_event_pages lep ON lep.event_id = le.id
GROUP BY le.workspace_id, le.id
ORDER BY le.event_date DESC;

-- ===================================================================
-- ROW-LEVEL SECURITY
-- ===================================================================

ALTER TABLE pages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_relations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_aliases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_attachments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_profile         ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_pillars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_stances         ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_commitments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_constraints     ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_rules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_alignment       ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_snapshots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_event_pages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_heuristics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_configs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_invocations    ENABLE ROW LEVEL SECURITY;

-- Policy template repeated for every multi-tenant table:
CREATE POLICY ws_isolation ON pages
    USING (workspace_id = current_setting('app.current_workspace_id', true)::uuid);
-- (... repeated for all tables above with appropriate FK column)

-- ===================================================================
-- SCHEDULED JOBS (pg_cron)
-- ===================================================================

-- Weekly mirror job for workspaces that opted in
SELECT cron.schedule(
    'weekly-mirror-job',
    '0 9 * * 1',  -- Monday 9am
    $$ SELECT enqueue_mirror_for_all_enabled_workspaces(); $$
);

-- Monthly meet reminder
SELECT cron.schedule(
    'monthly-meet-reminder',
    '0 9 1 * *',  -- 1st of month 9am
    $$ SELECT enqueue_meet_reminders(); $$
);

-- Embedding backfill (for pages missing embeddings)
SELECT cron.schedule(
    'embedding-backfill',
    '*/15 * * * *',
    $$ SELECT backfill_missing_embeddings(batch_size := 50); $$
);
```

**Observații asupra schemei:**
- Toate tabelele multi-tenant au `workspace_id` pentru RLS.
- JSONB în `metadata` pe `pages` permite schema evoluție per Domain Pack fără ALTER TABLE.
- pgvector + tsvector + pg_trgm dau retrieval hybrid nativ.
- `self_snapshots` păstrează istoria complete ca JSONB (audit-friendly, point-in-time).
- `skill_invocations` e audit trail complet (cost tracking + replay).

---

## 18. Apel final

Narcis, ai 3 posibilităţi în faţa ta:

**(A) Continui Faber v1 (framework + zip)** — lansezi în 6-7 săpt, produs real, 100-500 power users realistic. Revenue: donații + cohorts = $5-20k/an, total.

**(B) Skip la Faber OS (SaaS + Postgres)** — lansezi în 4.5 luni, produs scalabil, 10k+ users realistic în 12 luni. Revenue: $100k+ ARR realist.

**(C) Build Faber v1 as stepping stone → migrate to OS după 3 luni** — double work, 9-10 luni total, dar validare intermediară. Risc de fatigue.

**Recomandarea mea: (B) direct, fără ocolul prin v1.**

Motive:
1. Ai stack-ul tehnic (Claude Code + WorkScript bun) ca să faci OS-ul în 4.5 luni. 6-7 săpt v1 + 3 luni v2 = 5 luni oricum.
2. Non-tehnicienii (soția ta = first validator) nu vor folosi v1. Testing cu ei e blocked până la OS.
3. Skill Era + Productize Yourself se aliniaza mai puternic cu produs (OS), nu cu framework. Moat-ul e produsul.
4. Personal brand (Building as 51yo) are mai multă substanță cu "shipping a SaaS" decât cu "shipping a template".
5. Timing-ul — window-ul de 12 luni până când Notion AI livrează similar — forțează viteza.

**Dacă decizi (B):** next action concretă în **următoarele 72 de ore**:
1. Înregistrează `faber.app` (sau `getfaber.com` dacă .app e luat).
2. Scrie un post X scurt: *"Am construit Alteramens pentru mine. Acum îl fac accesibil la oricine. Faber OS — beta signup at faber.app"*.
3. Setup landing page minimal (1h cu Claude Code): Next.js + Tailwind + email waitlist.
4. Post în 3 comunități: IndieHackers, X threadul tău, un subreddit cu thinking-tools.
5. Target: 100 waitlist în 2 săpt. Asta validează appetitul înainte de build.

Doar atât. Dacă waitlist-ul nu-și mișcă acul, revizuim. Dacă da, Faza 1 începe săptămâna 3.

---

## 19. Numele

Pentru landing page + branding:
- **Primary:** **Faber OS** — "OS" aud serios, tehnic.
- **Alternatives:** *Faber* simplu (dacă OS-ul e implicit), *Faber Cloud* (mai SaaS), *Faber.app* (domain-as-brand).
- **Anti-patterns:** nu Karpathy LLM Wiki, nu "Second Brain", nu "AI-augmented journaling".

**Tagline shortlist:**
1. **"Your second brain that knows who you are."** (emotional, memorabil)
2. **"Knowledge-as-a-System. For thinking people."** (technical, serios)
3. **"Ingest. Ask. Confront. Compound."** (action-forward)
4. **"The OS for people who think for a living."** (audience-clear)

---

## Referințe

- [[workshop/drafts/faber-framework-vision]] — viziunea v1 (framework-ul) pe care acest document o evoluează
- [[workshop/drafts/faber-self-agent-citizens]] — arhitectura self+agent care rămâne centrală
- [[CLAUDE]] — ghid colaborare + filosofie
- [[MANIFEST]] — vision personal
- [[wiki/FABER]] — schema v0 (markdown) care migrează la Postgres
- [[wiki/self/narcis-pillars]] — piloni activi (alignment check cu produsul)
- [[workshop/drafts/agentic-business-platform]] — nbrAIn, alt produs candidat, care poate deveni un Domain Pack `accountant` în Faber OS
- [[workshop/drafts/semnal-x-growth-system]] — primul skill marketplace candidate (Narcis-grown)

## Next actions propuse pentru Narcis

1. **Citește acest doc cu pixul în mână** — noteaz-ți pe margine: ✓ (acord), ✗ (dezacord), ? (discutăm).
2. **Răspunde la 3 întrebări nebunești** în următoarele 48h:
   - **A.** Faber OS sau Faber v1? (Vezi secțiunea 18.)
   - **B.** Primul domain pack — `founder` sau un pack mai specific al tău (IT + solopreneurship)?
   - **C.** Merg singur pe OS sau caut un co-founder tehnic? (Dacă solo — OK, ai Claude Code. Dacă co-founder — cine?)
3. **Dacă go → action în 72h:** register domain, post scurt pe X ("building this"), landing page minimal, waitlist open.
4. **Dacă no → arhivează documentul** cu 3 propoziții de ce. Nu pierzi nimic; ideea maturizează.

> În limbaj autentic: **Alteramens e laboratorul. Faber v1 e prototipul. Faber OS e produsul. Nu poți să nu produci un produs care e literal pilonii tăi operaționalizați.**
