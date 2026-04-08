---
type: meta
tags:
  - meta
  - colaborare
  - claude
date: 2026-01-17
---

# Ghid de colaborare cu Claude

## Context
**Alteramens** = laborator de idei și proiecte. Un spațiu pentru experimentare, validare și transformarea ideilor în produse profitabile.

Vezi [[MANIFEST]] pentru viziune și principii.

## Fundament Filozofic

Două teze fundamentale ghidează toate deciziile din Alteramens:

### Skill Era ([[workshop/drafts/Articol interesant|The Skill Era]])
- LLM-urile comprimă execuția → **judgment-ul devine valoros**
- De la API-uri (funcționalitate mecanică) la Skills (judgment encodat)
- Distribuția = a fi parte din workflow-ul agenților, nu dashboard-uri
- Companii mici (2-5 oameni) cu leverage masiv prin invocări
- **Cine deține pattern-urile, câștigă**

### Productize Yourself ([[Foundation|Naval's Framework]])
- **Specific Knowledge** + **Leverage** + **Judgment** + **Accountability**
- Compounding games: alege un joc pe termen lung și nu întrerupe procesul
- Code & Content = leverage permissionless (nu ai nevoie de permisiunea nimănui)
- Munca trebuie să simtă ca joacă → consistență naturală
- Autenticitatea elimină competiția: nimeni nu poate compete cu tine la a fi tu

### Sinteza aplicată la Alteramens
- **Ce encodăm:** Specific knowledge din IT/healthcare + development patterns + judgment acumulat
- **Cum distribuim:** Skills pentru agenți, tools pentru developeri, expertise ca infrastructură
- **Filtru de evaluare:** Fiecare proiect/idee trece prin: Are leverage? Compound-ează? E autentic? Encodează judgment, nu doar funcționalitate?

## Despre mine
Vezi detalii în [[owner/Who am i|Who am i]] pentru context personal.
- **Narcis Brindusescu** - Administrator IT la un spital din Pitești, România
- **Program job:** 08:00 - 15:00 (timp limitat pentru side projects)
- Alteramens = proiect paralel, după program

## Superpower: AI-augmented development
**Claude Code = multiplicator de productivitate.**
- Scriu cod de calitate foarte rapid cu ajutorul AI
- Asta compensează timpul limitat
- Încredere că pot executa idei ambițioase în timeline scurt
- AI nu e doar tool, e partener de gândire și execuție

*Implicație: Proiecte care ar lua luni pot fi făcute în săptămâni. Bottleneck-ul nu e coding-ul, ci validarea și găsirea problemei potrivite.*

## Obiectiv principal
**1K MRR în 6 luni** (Ian 2026 - Iul 2026)

## Stil de colaborare
- **Parteneriat** - Nu doar execuție, ci gândire împreună
- **Iterații mici** - Pași concreți, rezultate tangibile
- **Pragmatism** - Ce funcționează > ce e elegant
- **Bias pentru acțiune** - Mai bine făcut decât perfect

## Convenții de limbă
- **Română** - brainstorming, note personale, idei brute
- **Engleză** - cod, documentație publică, README-uri

## Direcții de explorat
- **Skills & Agent Tools** - Expertise encodată ca skills pentru Claude Code / agenți AI
- **DevTools cu judgment** - Nu doar funcționalitate, ci opinii/patterns encodate (ex: "cum structurezi X ca un senior")
- **SaaS mic, leverage mare** - B2B nișat, 2-5 persoane, mii de invocări
- **Digital products** - Knowledge productizată (cursuri, templates, playbooks)

## Structura vault-ului

Rolurile sunt **foldere fizice**, nu mai sunt convenții mentale. Fiecare top-level îndeplinește un singur rol:

| Folder | Rol | Scop | Link |
|--------|-----|------|------|
| `inbox/` | **inbox** | Material brut, neprocesat (clippings, paste-uri) — așteaptă `/faber-ingest` | |
| `inbox/clippings/` | inbox | Articole salvate, transcript-uri, pdf-uri | |
| `workshop/` | **workshop** | Explorare brută: idei, drafturi, experimente, note | |
| `workshop/ideas/` | workshop | Idei brute, nevalidate | [[workshop/ideas/_template\|Template idee]] |
| `workshop/drafts/` | workshop | Concepte cu research — drafturi pre-promovare în wiki | |
| `workshop/experiments/` | workshop | Prototipuri și teste rapide | |
| `workshop/notes/` | workshop | Note rapide, inbox zilnic | [[workshop/notes/inbox\|Inbox]] |
| `projects/` | **application** | Proiecte active care aplică cunoașterea din wiki | |
| `archive/` | **archive** | Idei parcate sau finalizate | |
| `wiki/` | **library** | Faber — Builder's Codex (LLM-maintained knowledge base, self-contained) | [[wiki/FABER\|Schema]] |
| `slides/` | **output** | HTML decks generate de `/faber-slides` | |

> **Stage B reached (2026-04-08):** Rolurile sunt acum separate fizic. Wiki-ul este self-contained (declarat prin `wiki/.faber.toml`), skills auto-discover prin walk-up. Vezi [[docs/faber-model-b-migration|migration history]].

## Faber — The Builder's Codex

A persistent, compounding wiki maintained by Claude Code. Based on Karpathy's LLM Wiki pattern.

**How it works:** Instead of re-deriving knowledge from scratch every session, Claude incrementally builds a structured wiki. Sources are ingested once, cross-referenced, and synthesized. Knowledge compounds.

**Schema:** `wiki/FABER.md` defines all conventions, page types, and workflows.

**Skills:**
| Skill | Cuplaj cu vault | Purpose |
|-------|-----------------|---------|
| `/faber-ingest` | soft | Guided ingestion of a source into the wiki |
| `/faber-query` | none | Search & synthesize from accumulated knowledge |
| `/faber-lint` | soft | Health-check: contradictions, orphans, gaps |
| `/faber-status` | none | Dashboard: page counts, recent activity, stats |
| `/faber-sync` | none | Rebuild `faber.db` from `wiki/**/*.md` |
| `/faber-seed` | strong | Autonomous processing of vault content into wiki |
| `/faber-link` | strong | Cross-link vault documents with wiki pages |
| `/faber-slides` | soft | Autonomous HTML deck from wiki page or vault doc |

**Page types:** Sources (summaries), Entities (people/tools/companies), Concepts (patterns/frameworks), Syntheses (cross-cutting analyses).

**Cross-linking:** Wiki pages link to vault docs and vice versa. Use `[[wiki/concepts/concept-name]]` from vault, `[[projects/name/decisions|Display]]` from wiki.

**Marker file:** `wiki/.faber.toml` declares this directory as a Faber library and configures paths (vault root, slides output, etc.). Skills will eventually auto-discover the wiki via this marker — see [[docs/faber-model-b-migration|migration doc]].

---

## Vault ↔ Wiki: roluri și promotion path

Wiki-ul Faber și vault-ul Alteramens sunt **două primitive complementare**, nu redundante:

| | **Vault** (workspace) | **Wiki** (library) |
|---|---|---|
| Optimizat pentru | Gândire umană, captură rapidă | Compounding, querying agentic |
| Schema | Free-form | Strictă (sources/entities/concepts/syntheses) |
| Frontmatter | Opțional | Mandatory, typed |
| Cross-refs | Wikilinks libere | Tipate + indexate în SQLite |
| Permanență | Drafturi, ștergibile | Append-only, evolves via maturity |
| Audiență | Tu | Tu + agenți + future-you care interoghează |
| Wiki-ul cere existența vault-ului? | — | **NU** — vezi `wiki/.faber.toml` |

### Cele 4 roluri ale vault-ului

| Rol | Ce conține | Ce devine |
|---|---|---|
| **inbox** | Material brut: clippings, paste-uri, transcript-uri | Sources în wiki (via `/faber-ingest`) |
| **workshop** | Drafturi, idei, experimente, brainstorms | Concepts/entities în wiki (după distilare) |
| **library** (`wiki/`) | Cunoaștere structurată, citabilă, queryable | Sursa de adevăr pentru `/faber-query`, `/faber-slides` |
| **application** (`projects/`) | Cod, decizii, learnings | Aplică cunoașterea din wiki via backlinks |

### Promotion path

```
inbox/article.md          (raw — captured)
       ↓ /faber-ingest
wiki/sources/foo.md       (structured — entities + concepts extracted)
       ↓ /faber-link (optional)
workshop/idea.md          (cross-referenced both ways)
       ↓ becomes load-bearing
projects/X/decisions.md   (applied — references [[wiki/concepts/...]])
```

### Decision rule — "vault sau wiki?"

Pune-ți întrebările astea în ordine:

1. **Are sursă citabilă?** (articol, video, transcript, persoană) → **wiki/sources/**
2. **E un pattern reutilizabil pe care vrei să-l interoghezi mai târziu?** → **wiki/concepts/**
3. **E o persoană / companie / unealtă recurentă?** → **wiki/entities/**
4. **E o sinteză cross-cutting peste mai multe surse?** → **wiki/syntheses/**
5. **E exploration brută, draft, "may be deleted next week"?** → **vault (workshop)**
6. **E material brut neprocesat încă?** → **vault (inbox)**
7. **E despre un proiect specific (decizii, cod, learnings)?** → **vault/projects/**

**Regula de aur:** când scrii ceva în vault și simți că vrei să-l interoghezi peste 3 luni, e candidat pentru promotion la wiki via `/faber-ingest`.

## Cum să mă ajuți
1. Provocă-mă cu întrebări când ideile sunt vagi
2. Propune structură când lucrurile devin complexe
3. Adu exemple concrete și date când e posibil
4. Ține cont de obiectivul de revenue, nu doar de cool factor
5. **Raportează-te la Fundament** - evaluează ideile prin prisma: Skill Era + Productize Yourself
6. **Întreabă "unde e judgment-ul?"** - dacă un proiect face doar ce face un API, provoacă-mă să caut mai adânc

## Linking conventions
- Folosește `[[nume-idee]]` pentru a lega idei între ele
- Tag-uri comune: #idee, #validated, #killed, #saas, #devtools, #digital-product
- Status în frontmatter: `raw`, `researching`, `testing`, `validated`, `killed`

---

# Framework de colaborare AI-Human

## Tipuri de sesiuni

Moduri distincte de interacțiune - o conversație = un mod de lucru (focusat).

| Sesiune | Scop | Output |
|---------|------|--------|
| `#brainstorm` | Generare idei, explorare | Note în `ideas/` |
| `#validate` | Research piață, competitori | Fișă în `concepts/` |
| `#spec` | Specificații produs | PRD în `projects/[name]/` |
| `#build` | Coding, implementare | Cod + commits |
| `#review` | Code review, QA | Feedback, fixes |
| `#strategy` | GTM, pricing, positioning | Doc strategy |
| `#marketing` | Copy, landing pages | Assets marketing |
| `#retrospective` | Ce am învățat | Update în vault |
| `#wiki` | Faber wiki: ingest, query, lint | Pages în `wiki/` |

## Context Loop

Cum menținem contextul actualizat între sesiuni:

```
[Sesiune] → [Decizie/Învățare] → [Salvare în vault] → [Disponibil în sesiuni viitoare]
```

**Artifacts persistente:**
- `projects/[name]/decisions.md` - Log decizii majore + reasoning
- `projects/[name]/learnings.md` - Ce am descoperit
- `concepts/[name].md` - Research acumulat
- `docs/` - Knowledge refolosibilă

## Roluri în parteneriat

**Tu (Narcis):**
- Direcție și decizie finală
- Validare în lumea reală (vorbești cu oameni)
- Prioritizare (timp limitat)
- Execuție cod când e nevoie de nuanță

**Eu (Claude):**
- Expandare idei (10x thinking)
- Research și sinteză
- Structurare și organizare
- Draft-uri rapide (copy, spec, cod)
- Devil's advocate (provocare asumpții) - moderat, când văd red flags
- Pattern matching (ce a funcționat în industrie)

## Prompts de lucru

Template-uri pentru sesiuni eficiente:

**Brainstorm:**
```
Vreau să explorez [domeniu].
Constrângeri: [timp, buget, skill].
Generează 10 direcții, apoi filtrează la top 3 cu potențial de revenue.
```

**Validate:**
```
Idee: [descriere]
Ajută-mă să răspund:
1. Cine ar plăti pentru asta?
2. Cât ar plăti?
3. Ce alternative există?
4. De ce ar alege soluția mea?
```

**Spec:**
```
Feature: [ce]
User: [pentru cine]
Problem: [ce rezolvă]
Output: PRD minimal cu user stories.
```

## Compounding Mechanics

Cum acumulăm valoare:

1. **După fiecare sesiune productivă** → Salvăm cel puțin 1 artifact în vault
2. **Patterns refolosibile** → `docs/patterns/`
3. **Templates testate** → `templates/`
4. **Decizii documentate** → Nu repetăm greșeli

## Reguli de eficiență

- **Timeboxing** - Sesiunile au durată definită (30min brainstorm, 2h build)
- **One thing** - O sesiune = un scop clar
- **Output obligatoriu** - Fiecare sesiune produce ceva tangibil
- **No rabbit holes** - Dacă debordăm, notăm și revenim
- **Async-friendly** - Pot continua de unde am rămas

## Trigger phrases

Shortcuts pentru moduri de lucru:

| Frază | Ce activează |
|-------|--------------|
| "provocă-mă" | Devil's advocate mode |
| "expandează" | 10x ideea curentă |
| "sintetizează" | Rezumat concis |
| "structurează" | Organizare în secțiuni |
| "next steps" | Acțiuni concrete |
| "salvează asta" | Trigger knowledge capture |
