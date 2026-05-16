---
title: "Personal Context Agent — Decompoziție filozofică & blueprint inițial"
type: synthesis
trigger: insight
question: "Ce este 'context' filozofic, și cum implementăm un agent care creează / întreține / compound-ează un context personal accesibil din orice agent AI (cloud + mobil)?"
sources_consulted: []
concepts_involved: [productize-yourself, specific-knowledge, leverage, encoded-judgment, knowledge-first-development, brain-ram-leverage, judgment, context-aware-interrupt, context-graph-as-meme, product-marketing-context, twelve-layers-of-context, identity-first-storage, declared-vs-observed-gap, context-decay-heuristics, frame-problem-retrieval, authority-decay-compounding, inverted-polarity-sister-system]
entities_involved: [personal-context-agent-project, mcp-protocol, mem-ai, rewind-ai, limitless-ai, tana, anytype, logseq, notion, obsidian, dex, clay, alteramens]
created: 2026-05-16
updated: 2026-05-16
maturity: draft
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-05-16 build | Personal Context Agent foundation synthesis"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-05-16 build | Personal Context Agent foundation synthesis"
  - pillar: building-as-51yo-from-ro-public-hospital
    relation: reinforces
    source_event: "2026-05-16 ingest | Personal Context Agent — extracting concepts & entities"
---

# Personal Context Agent — Decompoziție filozofică & blueprint inițial

Punctul de plecare: orice agent AI (Claude, GPT, Gemini, ...) răspunde generic pentru că nu are **contextul tău**. Un student care învață pentru examen are nevoie de un răspuns radical diferit decât un contabil cu 80 de clienți, chiar dacă întrebarea sună la fel. Astăzi asta se rezolvă prin prompting repetitiv ("sunt X, am rolul Y, lucrez la Z") — o re-explicație manuală care nu compound-ează. **Pariul:** un agent AI dedicat care construiește și menține un context personal compounding-ant, expus standardizat oricărui alt agent, accesibil de pe orice device.

Documentul ăsta face două lucruri:
1. **Decompune filozofic ce e "context"** — straturi, proprietăți, tensiuni.
2. **Schițează arhitectura** sistemului care îl materializează — sister-system al [[FABER|Faber]] cu polaritate inversă (SQLite ca source of truth; MD-ul, dacă există, e derivat).

Toată discuția se ancorează în [[productize-yourself|Productize Yourself]] (start personal → SaaS) și [[encoded-judgment|Encoded Judgment]] (skills, nu funcționalitate).

**Decizii de framing locked (din sesiunea de aliniere):**
- Ambiție: start personal → productize ca Alteramens.
- Relație cu Faber: sistem soră, dar **tot textul stocat în SQLite** (nu MD ca primar, DB ca derivat — exact invers față de Faber).
- Emfază: echilibrat filozofic → architectural.

---

## Partea I — Ce e "context" filozofic

### Definiție de lucru

> **Context = câmpul de relevanță care înconjoară o entitate și determină ce înseamnă un semnal, ce acțiune e potrivită, sau ce judecată e bună.**

Fără context, informația e *semnal fără semantică*. Cu context, aceleași cuvinte/date/acțiuni capătă pondere radical diferită. "Trebuie să predau marți" e o propoziție; *cine* o spune (student la admitere vs profesor universitar vs contabil), *când* o spune (luni seara vs cu trei luni înainte), și *unde se află* (în pregătire intensă vs liniștit) decide complet ce ajutor e util.

LLM-ul fără context personal e ca un medic specialist care intră în cabinet și nu are dosarul pacientului. Răspunde corect statistic dar irelevant *pentru tine*. Sistemul de context personal **e dosarul**.

### Lineage filozofic (gândire pe care construim)

Câteva ancore — nu academic, doar pentru calibrare:

- **Wittgenstein** — *meaning is use within a language game*. Nu există semnificație context-free. Dacă agentul nu cunoaște *language game-ul tău* (rolul, jargonul, audience-ul), răspunde la altă întrebare decât ai pus.
- **Heidegger** — *being-in-the-world* (Dasein). Contextul nu e *în jurul tău*, e *constitutiv ție*. Nu te poți extrage din context ca să-l privești neutru.
- **Bateson** — *context is the difference that makes a difference*. Frame-ul e ce face informația informativă.
- **Polanyi** — *tacit dimension*. Mare parte din ce știi e contextual și nearticulabil. Sistemul trebuie să captureze și implicit, nu doar explicit.
- **Andy Clark** — *extended mind*. Cogniția spill-uiește în tool-uri, artefacte, mediu. Un context-system e literalmente parte din mintea ta extinsă — o memorie externă structurată.
- **Gadamer** — *fusion of horizons*. Înțelegerea apare când orizontul tău (context) întâlnește orizontul textului (un input). Agentul fără orizontul tău produce o "fuziune" cu un orizont generic — adică un răspuns adresat omului mediu.

**Sinteză aplicată:** context = *ce nu trebuie să explici de fiecare dată ca răspunsul să nu fie generic*. Sistemul mută inferența agentului de pe **statistica globală** pe **statistica condiționată pe tine**.

---

## Partea II — Decompoziție: cele 12 straturi ale contextului

12 straturi orthogonale. Fiecare are propriile primitive de stocare. Lista nu e dogmă — e ipoteză de lucru.

| # | Strat | Întrebare-ancoră | Exemple |
|---|---|---|---|
| 1 | **Identitate** | Cine sunt? | Roluri (admin spital, builder, părinte), valori, traits, narativa de sine |
| 2 | **Temporal** | Când sunt? | Acum (oră, zi), recent (săptămâna trecută), ciclic (semestru, fiscal year), anticipat (deadlines) |
| 3 | **Spațial / mediu** | Unde sunt? | Fizic (acasă/birou/transit), digital (apps active), social (singur/echipă/familie) |
| 4 | **Goals** | Ce încerc să fac? | Long (carieră, financiar), mid (trimestru, proiect), short (azi, săptămâna asta) |
| 5 | **Cunoaștere** | Ce știu / nu știu? | Expertiză domeniu, skills, gaps known/unknown, modele mentale, surse de încredere |
| 6 | **Relațional** | Cine contează? | Familie, colegi, clienți, mentori, audiență, adversari, "circle of competence" social |
| 7 | **Resurse** | Ce am? | Timp, bani, energie, atenție budget, tool-uri, abonamente, acces |
| 8 | **Constrângeri** | Ce nu pot / nu vreau? | Legale, etice, cognitive (oboseală), de timp, taboo-uri |
| 9 | **Stare** | Cum sunt acum? | Mood, energie, stres, workload, evenimente recente care au mutat baseline-ul |
| 10 | **Istorie** | Ce s-a întâmplat? | Decizii + outcomes, lecții, pattern-uri auto-observate |
| 11 | **Estetică / gust** | Ce-mi pare bun? | Style preferences, quality bar, voice, register, "things that delight" |
| 12 | **Stance epistemic** | Cum cred că știu? | Ce evidence accept, cum update-ez beliefs, toleranță ambiguitate, heuristici |

Câteva observații care nu sunt evidente:

- **Stratul 11 (estetică) e cronic underestimat.** Diferența dintre două răspunsuri Claude *bune* e *gustul*. Codificat = leverage masiv pentru output care simte "ca tine".
- **Stratul 9 (stare) e cel mai volatil dar cel mai action-changing.** "Sunt obosit acum" schimbă tipul de răspuns mai mult decât "sunt admin de spital".
- **Stratul 12 (stance epistemic) e rar capturat dar definitoriu** — un om care vrea evidence vs unul care vrea convingere e operațional altă persoană. Faber are deja `narcis-stances.md`; aici devine prim-clasă.
- **Straturile nu sunt independente** — o stare de oboseală (9) restrânge resursele (7), schimbă goal-urile urmărite (4), poate slăbi stance-uri epistemice (12). Sistemul trebuie să modeleze și *interferențele*.

Faber capturează deja parțial straturile 1, 5, 11, 12 prin `self/narcis-pillars.md`, `narcis-stances.md`, `narcis-voice.md`, `narcis-constraints.md`. **Personal Context Agent extinde la toate cele 12 și le face accesibile out-of-vault.**

---

## Partea III — Cross-cutting properties (axe ortogonale pe orice item de context)

Indiferent de stratul în care trăiește, fiecare item de context are 8 proprietăți meta care decid cum e stocat și folosit:

| Property | Exemplu | Decizie de design |
|---|---|---|
| **Volatility** | Identitate slow, mood fast | Cadență de refresh diferită per tip |
| **Visibility** | Goal articulabil, taste tacit | UI diferit pentru *declared* vs *inferred* |
| **Authority** | Self-declared vs observed-by-agent vs inferred | Tag obligator pe fiecare scriere |
| **Confidence** | Sigur / probabil / presupun | Câmp tipizat low/med/high |
| **Provenance** | "Spus de Narcis pe 16 mai în chat cu Claude" | Source link obligatoriu |
| **Decay** | "Acum lucrez la X" → expires în 1 lună | TTL opțional + re-prompt automat |
| **Granularity** | "Builder" vs "builder de skills devtools B2B" | Tags ierarhice |
| **Scope** | General vs proiect-specific vs rol-specific | Visibility scope per item |

**Insight critic:** **authority + decay** sunt cele care fac diferența între un context-store care *compound-ează* și unul care devine *zgomot*. Fără ele sistemul se umple cu fapte care nu mai sunt adevărate, iar agenții care le citesc dau răspunsuri tot mai stale.

---

## Partea IV — Mecanica de compounding (ce face un sistem să acumuleze valoare, nu noise)

Faber are deja câteva primitive pe care le reciclăm:

1. **Append-only history.** Nu pierdem stările vechi. Poți întreba "ce credeam acum un an?".
2. **Cross-linking tipizat.** Identity → Goal → Project → Knowledge. Graph navigabil mecanic, nu doar prin scanare textuală.
3. **Maturity ladder.** *provisional → working → load-bearing*. Declarațiile noi sunt provisional implicit; promovate prin utilizare + timp.
4. **Decay + re-validation.** Context care expiră automat, cu UI minimal de re-confirmare ("mai e adevărat că X?").
5. **Synthesis periodic.** Meta-pagini care leagă altele (à la `/faber-meet` și `/faber-mirror`). Reflexie disciplinată, nu opțională.
6. **Declared-vs-observed gap-tracking.** Sistemul *vede* discrepanța între ce zici și ce arăți. Faber are deja primitiva asta (`/faber-mirror`); în Personal Context Agent **devine load-bearing**.

Aici e **diferența fundamentală** față de Faber: Faber compound-ează *knowledge despre lume* (sources externe → distilare). Personal Context Agent compound-ează *modelul tău* (declarații + observații → model coerent al persoanei). Subiectul cunoașterii e diferit, deci primitivele de stocare și skill-urile de întreținere sunt diferite.

---

## Partea V — Tensiuni și probleme grele (numite, nu rezolvate)

Nu le rezolvăm aici; le numim ca să nu surprindă mai târziu și ca decizii pentru sesiuni viitoare.

1. **Privacy.** Date personale ≠ knowledge despre lume. Cloud trust boundary mult mai sensibilă. Client-side encryption probabil inevitabilă pentru SaaS.
2. **Voice-vs-observation gap.** Oamenii se descriu inaccurat. Sistemul *trebuie* să tracking-uiască gap-ul; altfel devine o oglindă măgulitoare. Faber are deja `/faber-mirror` — aici e centrul, nu marginea.
3. **The frame problem.** Ce e relevant pentru un query e *în sine* contextual. Retrieval-ul nu poate fi doar embedding-match; trebuie să înțeleagă intent.
4. **Update authority.** Cine scrie? User declarativ + agent infer + alt agent infer = potential conflict. Attribution obligatoriu pe fiecare write.
5. **Multi-agent consistency.** Dacă Claude, GPT, Gemini scriu toți la același store, conflict resolution? Event-sourcing rezolvă mecanic dar nu semantic.
6. **Self-reference paradox.** Sistemul te oglindește; oglindirea te schimbă (Karpathy: "you become what you measure"). Filtru anti-nudge necesar.
7. **Granularity overload.** Prea mult context = noise. Per-query filtering esențial; full-dump în context window e anti-pattern.
8. **Schema rigidity vs flexibility.** Typed (queryable) vs free-form (capturable). Hybrid (typed columns + JSON attrs) e compromisul standard.
9. **Lock-in protocol.** Fără un standard public (MCP cel mai matur candidat), ești captiv într-un vendor. **Public protocol = strategic — nu opțional.**
10. **Right-to-be-forgotten.** Append-only intră în conflict cu GDPR. Soft-delete + tombstones e workaround-ul standard, dar pierde semantica "asta era adevărat acum 2 ani".

---

## Partea VI — Diferențierea față de Faber

User-ul a cerut explicit: sister system, dar **toată informația stocată în SQLite — nu fișiere MD ca în Faber, cu DB derivat**. Inversiunea polarității e voluntară și informează tot designul.

| Dimensiune | Faber | Personal Context Agent |
|---|---|---|
| Subject | Knowledge despre lume | Knowledge despre user |
| Source of truth | MD files | **SQLite** |
| MD role | Primary read/write | Optional export (derived) |
| Editor target | Obsidian / text editor | Mobile + web client custom |
| Read audience | Narcis + agents | Agents (primary) + Narcis (curator) |
| Velocity | Slow, deliberate curation | Continuous (auto-capture + periodic curate) |
| Multi-tenancy | Single (vault-ul lui Narcis) | Multi-user din ziua zero |
| Sync mecanic | Git | DB replication (libsql/Turso/CRDT) |
| Voice/declared layer | `self/*.md` (manual) | Built-in (prim-clasă entity types) |
| Decay | Implicit (lint) | Built-in (TTL per item) |

**De ce SQLite-as-source-of-truth aici (nu MD ca în Faber):**

- **Mobile-native** — MD edit-uit pe mobil e dureros; un client nativ peste SQLite e curat.
- **Multi-agent concurrent writes** → ACID guarantees gratis.
- **Distribuție cloud** — un singur artefact de sync, nu N file-uri răspândite.
- **Schema migrations disciplinate** — într-un DB ai migrații versionate; într-o colecție de MD-uri ai... hope și grep.
- **Queryable din start** — agentul vine cu intent, primește subset relevant printr-un query, nu full-vault scan.
- **FTS5 nativ** — semantic search out of the box, fără infrastructură separată.

**Trade-off-uri acceptate:**

- Pierdem editing direct în Obsidian (intentional — nu e use case-ul aici).
- Trebuie clienți custom (build cost — dar e fix ce vinzi ca produs).
- Versioning prin event-sourcing intern în loc de git history.
- Backup-ul e mai puțin "deschis" — dar export MD oricând la cerere.

**Importanța filozofică a inversiunii:** Faber e *un text uman parsabil de agent*. Personal Context Agent e *un model agent-first exportabil ca text*. Optimizări diferite → arhitecturi diferite. Nu e ortodoxie; e calibrare la use case.

---

## Partea VII — Blueprint architectural inițial

Nu e plan final; e schiță pe care să iterăm. Toate numele sunt provisional.

### Entity types (draft v0.1)

Core types (fiecare cu schema proprie pe `attrs`):

- **Person** — user-ul + alți oameni relevanți (relații, cine contează).
- **Role** — un rol al user-ului (admin spital, builder, părinte, student); temporal, poate fi paused/active.
- **Goal** — obiectiv cu timeframe, status, parent, success criteria.
- **Project** — proiect activ; sub-context cu propriile primitive (poate avea propriul scope).
- **State** — snapshot temporal (energy, mood, location, focus). Volatile, TTL scurt.
- **Knowledge** — ce știe (skill, domain, depth, source).
- **Constraint** — limitare (timp, etică, contract, capacitate).
- **Preference** — gust, voice, aesthetic, register.
- **Resource** — tool, subscription, asset, access.
- **Stance** — declarație tare cu motivație (echivalentul Faber stances).
- **Event** — append-only log (orice schimbare).
- **Source** — citation pentru un fapt (conversation_id, URL, file).

Primitive transversale:
- **Link** — relație tipizată între două entități (person × goal, role × project, ...).
- **Annotation** — atașează note libere la orice entity.
- **Tag** — categorizare liberă (slug-uri kebab-case).

### Schema SQLite (sketch — nu producție)

```sql
CREATE TABLE entities (
  id           TEXT PRIMARY KEY,        -- ulid sau uuid
  type         TEXT NOT NULL,           -- person, role, goal, ...
  title        TEXT NOT NULL,
  body         TEXT,                    -- markdown narrative
  status       TEXT DEFAULT 'active',   -- active | archived | invalidated
  authority    TEXT NOT NULL,           -- self-declared | observed | inferred
  confidence   TEXT DEFAULT 'medium',   -- low | medium | high
  maturity     TEXT DEFAULT 'provisional', -- provisional | working | load-bearing
  source_id    TEXT,                    -- ref to source row
  scope        TEXT DEFAULT 'general',  -- general | project:X | role:Y
  attrs        JSON,                    -- type-specific fields
  created_at   TIMESTAMP NOT NULL,
  updated_at   TIMESTAMP NOT NULL,
  expires_at   TIMESTAMP,               -- decay
  invalidated_at TIMESTAMP               -- soft delete
);

CREATE TABLE links (
  id          TEXT PRIMARY KEY,
  src_id      TEXT NOT NULL,
  dst_id      TEXT NOT NULL,
  relation    TEXT NOT NULL,            -- works-with, depends-on, parent-of, ...
  weight      REAL DEFAULT 1.0,
  authority   TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL
);

CREATE TABLE events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at   TIMESTAMP NOT NULL,
  actor         TEXT NOT NULL,          -- user | claude | gpt | mobile | ...
  operation     TEXT NOT NULL,          -- create | update | observe | invalidate | confirm
  entity_id     TEXT,
  link_id       TEXT,
  payload       JSON,                   -- delta (ce s-a schimbat)
  source_ref    TEXT                    -- conversation_id, device, etc.
);

CREATE TABLE annotations (
  id          TEXT PRIMARY KEY,
  entity_id   TEXT,
  body        TEXT NOT NULL,
  authority   TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL
);

CREATE VIRTUAL TABLE fts_entities USING fts5(
  title, body, content='entities'
);

-- Views (intenție, nu DDL complet)
-- v_current_self       — snapshot identity layer
-- v_active_roles
-- v_active_goals
-- v_active_projects
-- v_recent_state       — ultimele entries State
-- v_authority_gap      — items unde declared ≠ observed
-- v_stale_entities     — expires_at < now() sau no-touch în 30+ zile
-- v_load_bearing       — items pentru "what's reliably true about me"
```

### Skills (mirror al pattern-ului Faber, adaptat)

- `/ctx-capture` — quick add: text liber → propose entity type → confirm.
- `/ctx-query` — search & synthesize (echivalent `/faber-query`).
- `/ctx-mirror` — declared vs observed audit (echivalent `/faber-mirror`).
- `/ctx-decay` — surface stale items pentru re-validare.
- `/ctx-meet` — sesiune periodică de review (lunar?), à la `/faber-meet`.
- `/ctx-export` — MD export pentru human review / backup.
- `/ctx-import` — bulk import din note existente (Obsidian, Apple Notes, ...).
- `/ctx-brief` — wake-up briefing pentru agent fresh.

### Agent access protocol

**Layer 1 — MCP server (primary).** Local sau cloud. Orice agent (Claude Desktop, Claude Code, Cline, ChatGPT-cu-MCP) îl conectează ca tool provider. Tools expuse:

- `get_relevant_context(query, max_items)` — retrieval per query, cu ranking.
- `record_observation(text, type?)` — agentul observă ceva, propune entity.
- `update_entity(id, changes)` — modificare directă.
- `confirm_entity(id, decision)` — re-validate ("still-true" | "no-longer-true" | "modify").
- `list_active(type)` — listare per tip.
- `get_self_summary(scope?)` — punch-card identity.

**Layer 2 — REST API + Web/Mobile client.** Pentru user direct (UI nativ pe mobil). MCP scoate la lumină **același** data store.

### Distribuție

- **Local-first** — SQLite pe device, optional cloud sync (Turso/libsql).
- **Cloud-hosted** — per-user DB izolat; mobile + web clients.
- **Sync conflict policy** — event log replay; last-writer-wins pe atribute simple; CRDT-style pe colecții (links, tags).
- **Encryption** — at-rest cu client-side key (zero-knowledge ca opțiune), in-transit TLS standard.
- **Self-hosting opțional** — docker image pentru power-user/B2B sensibil.

---

## Partea VIII — Distincție competitivă

| Player | Ce face | De ce nu acoperă |
|---|---|---|
| **OpenAI Memories** | Notes inline injected în ChatGPT | Vendor-locked, opaque, fără schema publică, fără API stabil |
| **Anthropic auto-memory (Claude Code)** | File-based, typed entries, persists across conversations | Local-only Claude Code; fără mobil; fără protocol multi-agent |
| **Mem.ai** | AI notes app cu retrieval | Notes-first, nu identity-first; fără protocol pentru alți agenți |
| **Rewind / Limitless** | Passive capture audio/screen | Captură brută; nu modelarea persoanei |
| **Personal CRM (Dex, Clay)** | Doar layer-ul relațional | Acoperă 1 din 12 straturi |
| **Notion / Obsidian / Logseq** | Free-form notes | User face toată munca de structurare; agenții nu au protocol curat |
| **Tana, Anytype** | Structured notes cu types | Mai aproape, dar agent-first nu e prim-clasă |

**Edge-ul Personal Context Agent:**

1. **Identity-first** — modelarea persoanei e cetățean de prim rang (nu by-product al notițelor).
2. **Multi-agent protocol** — MCP nativ, fără vendor lock-in. Te slujește indiferent ce LLM folosești săptămâna asta.
3. **Compounding mechanics built-in** — maturity, decay, declared-vs-observed (preluat din Faber, dovedit pe vault-ul actual).
4. **Mobile-native** — context evoluează pe parcursul zilei, nu doar la birou.
5. **Productizable** — schema generic, multi-tenancy din ziua zero, encryption optional.
6. **Open exportable format** — MD export oricând. Nu lock-in prin format proprietar.

---

## Partea IX — De ce contează aliniat cu Alteramens

- **[[productize-yourself|Productize Yourself]] fit:** Narcis are nevoie acut (multi-rol: admin spital + builder + restul). Construiește pentru tine → vinde altora. Compounding-ul personal e și *demo* și *moat* — alți builderi vor recunoaște problema.
- **[[encoded-judgment|Skill Era]] fit:** Skills cu context personal sunt skills *cu judgment*. Skills fără context sunt funcții. Personal Context Agent e *infrastructura* peste care skill-era leverage-ul devine real.
- **[[leverage|Permissionless leverage]]:** Nu depinde de Anthropic/OpenAI; e *deasupra* lor (le folosește pe toate). User aduce contextul, alege agentul.
- **Compounding business model:** Cu cât user adaugă mai mult, cu atât răspunsurile-din-agenți sunt mai bune. Lock-in natural via valoare, nu prin restricție.
- **Prior tehnic dovedit:** pattern-ul Faber (markdown wiki + SQLite + skills + maturity + decay + mirror) e validat pe vault-ul tău. Personal Context Agent reciclează ~70% din mecanică. Risc tehnic redus.

---

## Partea X — Open questions (decizii încă deschise)

1. **Nume.** Persona, Anchor, Cocon, Aether, Plinta, Sigil, Vade, Atlas, Lume, Loam? Naming → product positioning.
2. **Schema rigidity.** Câte entity types fixe (~12 propuse) vs JSON pe attrs? Trade-off queryability vs flexibility.
3. **Authority disambiguation UI.** Cum marchezi *declared* vs *observed* la write time fără să devină friction?
4. **Decay heuristics.** TTL per tip (State: 7d, Goal: until-status-change, Role: 90d, Constraint: until-invalidated)? Sau learned per user?
5. **Frame problem retrieval.** Embedding similarity? Tag filtering? Graph traversal? Hybrid? `get_relevant_context` e critical path — calitatea ei face/sparge produsul.
6. **Nudge / personality drift filter.** Cum eviți ca sistemul, oglindind, să creeze un Narcis simulat care nu mai e Narcis real?
7. **Sharing scopes.** Un user share-uie un sub-context cu un agent (proiect-specific)? Cu alt user (colaborare)? Modul "shared context" e un al doilea produs.
8. **MVP slice.** Care e cel mai mic produs care livrează valoare reală? Cel mai bun candidat azi: *self-summary pentru orice agent* — un singur tool MCP care răspunde "cine e user-ul" coerent, ancorat în identity + active roles + active goals.
9. **GDPR vs append-only.** Soft delete + tombstones suficient? Sau hard-delete-on-request cu audit trail separat?
10. **Encryption boundary.** Client-side key default? Sau server-side cu opt-in zero-knowledge? Friction vs siguranță.
11. **Onboarding.** Cum scapi de "blank slate problem"? Import din existing notes? Conversație de 30 min cu agentul pentru bootstrap? Both?

---

## Partea XI — Next steps sugerați

Folosind trigger-urile din [[CLAUDE.md|Framework de colaborare]]:

1. **#validate** — vorbește cu 3-5 oameni care folosesc Claude/GPT zilnic și întreabă: *"ce context regretezi că trebuie să-l reexplici la fiecare conversație?"* Sub-întrebare: *"ai plăti $X/lună ca să scapi de asta?"*. Output: profile clare ICP (probabil: solo builders, consultants, knowledge workers cu multi-rol).
2. **#spec** — PRD pentru MVP cu un singur use case: *self-summary pentru orice agent*. Un MCP server local cu un singur tool (`get_self_summary`) și un singur UI de capture (CLI sau mobile simplu). Validează loop-ul minim: write → context activ în agent → răspuns ancorat.
3. **#build** — prototip local zero-friction:
   - SQLite + Python MCP server (~1 weekend).
   - Capture CLI (`ctx add "..."`).
   - Conectat la Claude Code din vault-ul ăsta.
   - Demo: întrebi Claude Code "cum mă recomanzi să-mi structurez săptămâna" și răspunsul e ancorat în roluri + goals + constraints curente (nu generic).
4. **#strategy** — brief de poziționare vs OpenAI memories / Anthropic memory / Mem.ai / Notion. 1 pagină.
5. **#wiki** — această sinteză e seed. Vor apărea concept pages dedicate per problemă grea: `wiki/concepts/declared-vs-observed-gap.md`, `wiki/concepts/context-decay-heuristics.md`, `wiki/concepts/frame-problem-retrieval.md`, `wiki/concepts/identity-first-storage.md`.

---

**Status:** draft. Foundation document, nu plan executabil. Următorul pas natural: **#validate** (5 conversații în săptămâna asta) înainte de orice cod.

**Cea mai bună întrebare de testat în #validate, ca să eviți pareidolia produsului:** *"Dacă ar exista azi un buton 'agentul ăsta știe deja cine ești', ce ai vrea să știe primul lucru?"* Răspunsurile orientează ce strat (din cele 12) e prioritar pentru MVP.
