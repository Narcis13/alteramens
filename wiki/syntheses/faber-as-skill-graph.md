---
title: "Faber as Skill Graph — Adding Skill Graph Layer to Faber, Filtered Through Alteramens"
type: synthesis
trigger: insight
question: "Faber este deja knowledge graph natural — cum aplicăm pattern-ul skill-graphs și cum îl extindem prin viziunea Alteramens la `.claude/skills/`?"
sources_consulted: [skill-graphs-2-heinrich, skill-era-article, skillify-agents-same-mistakes]
concepts_involved: [skill-graphs, atoms-molecules-compounds, brain-ram-leverage, thin-harness-fat-skills, skillify, encoded-judgment, skill-era]
entities_involved: [heinrich, garry-tan, arscontexta]
created: 2026-04-27
updated: 2026-04-27
maturity: draft
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
---

# Faber as Skill Graph — Adding Skill Graph Layer to Faber, Filtered Through Alteramens

Punct de plecare, nu plan. Articolul lui [[heinrich|heinrich]] pe [[skill-graphs-2-heinrich|Skill Graphs 2.0]] descrie un pattern care e **deja implementat în Faber** prin design accidental — sau, mai precis, prin convergență. Întrebarea acum: ce înseamnă să-l adăugăm explicit, și ce aduce dacă-l aplicăm și pe `.claude/skills/`-urile Alteramens?

## Partea I — Faber ca skill graph (prin convergență)

### Ce avem deja

Pattern-ul lui heinrich peste Faber:

| Heinrich primitive | Faber implementation | Status |
|---|---|---|
| Wikilinks-în-proză cu semantică | `[[concept-slug]]` în corp pe orice pagină | ✓ |
| YAML frontmatter cu descriptions | Frontmatter typed (sources, entities, concepts, syntheses) | ✓ |
| MOCs (Maps of Content) | Categorii sources/entities/concepts/syntheses ca de-facto MOCs | parțial |
| Index file ca entry point | `wiki/index.md` regenerat de [[wiki/faber_sync.py|faber_sync.py]] | ✓ |
| Progressive disclosure pipeline | SQLite + FTS face mecanic; agentul citește index → query frontmatter → urmează wikilinks → citește pagina | ✓ |

**Topologia e identică.** Diferența e că Faber e construit pentru **knowledge synthesis** și **persistență cross-session**, nu pentru **skill execution**. Are progressive disclosure prin layer-ul SQLite, nu doar prin convenție.

### Ce-i specific Faber-ului (peste pattern-ul lui heinrich)

Faber adaugă lucruri care nu apar în articolul lui heinrich:

- **Self/pillars/stances/voice** — un knowledge graph care **se aliniază** cu un agent uman (Narcis). Nodurile au `alignment` față de pillar-uri active.
- **Log temporal parsable** — `log.md` parsed în SQLite ca `log_events`. Skill graph-ul lui heinrich e ne-temporal (snapshot).
- **Vault ↔ wiki promotion path** — material brut (inbox) → distilare (workshop) → knowledge structurat (wiki). Heinrich nu vorbește despre fluxul de material brut.
- **Voice rules + romglish discipline** — graph-ul e **stilistic conscient**, nu doar semantic. Heinrich tratează totul ca prose neutră.

Asta-i **viziunea proprie** care diferențiază Faber de un graph generic. Skill graphs (heinrich) = topologie. Faber = topologie + temporalitate + alignment + voce.

### Ce-ar mai trebui să adăugăm (light touch)

Lucruri care ar face Faber **mai navigabil ca skill graph** fără să-l deformeze:

1. **MOCs explicite per topic** — momentan categorii (sources/entities/concepts/syntheses) sunt MOCs implicite. Un MOC explicit ar fi: `wiki/mocs/skill-engineering.md` care strânge `[[skill-era]] [[encoded-judgment]] [[thin-harness-fat-skills]] [[skillify]] [[atoms-molecules-compounds]] [[skill-graphs]] [[brain-ram-leverage]]` cu adnotări de când să urmezi care link. Heinrich numește asta "navigable sub-topic". Faber n-are încă.

2. **YAML descriptions mai discriminative** — frontmatter-ul curent are `title`, `category`, `maturity`. Pentru filtrare scannabilă a unui agent care decide ce să citească, ar putea ajuta o `summary: "one-line punch"`. Costuri: discipline de scriere; beneficii: agentul filtrează fără să deschidă.

3. **Wikilinks cu adnotare opțională** — pattern: `[[skillify|disciplina de verification care face graph-ul durabil]]`. Display name = adnotare semantică. Faber permite asta deja (sintaxa Obsidian); ce lipsește e disciplina de a o folosi.

4. **Entry-point per query type** — `index.md` e general. Pentru un agent care vine cu intent specific ("vreau să înțeleg cum compun skill-uri pentru un proiect"), un MOC dedicat scurtează drumul. Pentru `/faber-query` ar fi un boost masiv.

Niciuna nu e mecanică. Toate cer **scriere disciplinată**, nu cod nou.

## Partea II — Skill graph pattern aplicat la `.claude/skills/`

Aici răspundem la prompt-ul tău: **e natural fit pentru Faber, dar interesant ar fi să-l aplicăm și pentru agent skills, filtrat prin viziunea proprie**.

### Ce-ai deja în `.claude/skills/`

~50+ skill-uri locale. Faber-ul listează multe în skill-list-ul vizibil: `/faber-*` (ingest, query, lint, status, sync, seed, link, slides, brief, mirror, meet, align), `/semnal-draft`, `/semnal-reply`, `/to-content`, `/email`, `/agent-reflect`, plus suite-urile importate (`marketing-psychology`, `programmatic-seo`, `ai-seo`, `paid-ads`, `cold-email`, `landing-pages` etc.).

Asta-i deja un graph — dar **plat și nestratificat**. Toate la același nivel pe disc, niciun mod explicit de a spune "asta-i atom, asta-i moleculă, asta-i compound".

### Lens-ul atoms/molecules/compounds aplicat (hypothesis, de validat)

Filtrat prin viziunea Alteramens — **nu copy-paste heinrich**:

**ATOMS (capabilities)** — single-purpose, aproape determinist, no inter-skill calls:
- `/faber-sync` — rulează `faber_sync.py`, rebuild DB. Pură deterministic operation.
- `/faber-status` — un read SQL pe view-uri. Pure read.
- Sub-comenzi care nu există încă dar ar fi atomic: `/faber-search-fts`, `/faber-find-phantom`

**MOLECULES (composites)** — chain de 2-10 atoms cu instrucțiuni explicite, judgment moderate:
- `/faber-ingest` — read source → extract → write 5-10 pages → sync → log → report. Apel implicit la `/faber-sync` la final.
- `/faber-query` — search → synthesize → optional file as synthesis → log
- `/faber-link` — discover candidates → propose → write wikilinks bidirectional
- `/faber-lint` — check phantoms + orphans + thin pages + log integrity → report
- `/semnal-draft` — input seed → 3 voice variants → human-in-loop
- `/to-content` — input idea → 5 pieces × format → save în vault

**COMPOUNDS (playbooks)** — multi-molecule, autonomy reală:
- **Niciunul încă ca skill explicit.** Tu conduci compounds **manual** — adunând molecules într-o conversație ca asta.
- Candidate viitoare: `/alteramens-weekly-loop` (ingest 5-10 sources → identify pattern → write synthesis → produce content pieces → schedule X posts), `/idea-validation-loop` (research source → competitive scan → draft idea page → propose next experiment).

### Filtrul Alteramens — ce schimbă față de heinrich

Heinrich vede compounds ca leverage-maximizers per se. **Filtrul tău e mai strict.** Un compound merită construit doar dacă:

1. **Encodează judgment Alteramens** — nu doar lipește 5 molecules, ci aplică o opinie ([[encoded-judgment]] filter). Compound-ul `/idea-validation-loop` ar trebui să încorporeze ce contează la Alteramens (revenue potential? autenticitate? compounding?), nu generic validation.

2. **Reduce brain RAM-ul tău, nu doar înmulțește output** — dacă un compound îți cere RAM extra să-l observi, n-a livrat. Test-ul real: poți rula `/alteramens-weekly-loop` într-un background tab cât scrii la altceva? Dacă da, e un compound real. Dacă nu, e un molecule deghizat.

3. **Voice-aware** — output-urile compound-urilor trebuie să respecte voice rules (romglish, no LLM-sterility, no corporate hedging). Un compound care produce fluff sterilizat == un compound failed pentru tine, chiar dacă schema lui e corectă.

4. **Aliniat cu pillar-uri active** — compound-ul ar trebui să întărească explicit unul din `skill-era-craftsmanship`, `ai-agents-for-solo-builders`, sau `building-as-51yo-from-ro-public-hospital`. Dacă nu, e candidate pentru deletion înainte de creation.

Asta-i **viziunea proprie** care filtrează heinrich — el optimizează pentru leverage cognitiv generic; tu optimizezi pentru leverage cognitiv **aliniat cu identity și voice**.

### Pattern-ul AGENTS.md / resolver pentru `.claude/skills/`

Heinrich (și [[garry-tan]], prin [[thin-harness-fat-skills]]) presupun un **resolver** (AGENTS.md) care rutează intent → skill. Claude Code deja face asta implicit prin descriptions. Dar **nu e auditat**.

Întrebări nerezolvate:
- Există dark skills? (skill-uri în `.claude/skills/` care nu se invocă niciodată pentru că triggerul nu e clar)
- Există overlap? (`/faber-ingest` vs `/faber-seed` vs `/faber-link` — când fire-uiește care?)
- Există drift? (un description scris acum 3 luni care nu mai corespunde)

Asta-i exact ce livrează [[skillify]] (Garry Tan) ca disciplină. Aplicabilă mecanic peste `.claude/skills/`.

## Partea III — Tensiuni și open questions

### Tensiune: Faber vs `.claude/skills/` ca knowledge layer

Faber stochează knowledge **declarativ** — pagini citibile, agentul citește. `.claude/skills/` stochează knowledge **executabil** — proceduri pe care agentul rulează. Întrebarea: **trebuie să fie două graph-uri separate sau unul singur?**

Heinrich nu separă. [[arscontexta]] = un singur skill graph care servește ambele scopuri.

Faber + `.claude/skills/` = două graph-uri care se ating dar nu se traversează. Wikilinks din pagini Faber pot pointa spre skill files? Nu prin design.

**Open question:** merită un MOC `wiki/mocs/active-skills.md` care să listeze fiecare skill din `.claude/skills/` cu o descriere și un wikilink spre concept Faber relevant? Asta ar uni cele două graph-uri **fără** să le combine.

### Tensiune: progressive disclosure pentru skill execution

Faber face progressive disclosure pentru reading. Skills fac **eager loading** — descrierea + tot conținutul SKILL.md se încarcă când e invocat. Heinrich's pattern (index → descriptions → links → sections → full content) **n-are echivalent în Claude Code skill loading**.

Posibilă consecință: skills mari mănâncă context window degeaba. `/faber-ingest` are ~150 linii — dacă agentul cere doar Phase 5 (report), tot citește totul.

**Open question:** merită spart skills mari în sub-skills (echivalent atoms cu wikilinks între ele)? Trade-off: agility vs discoverability.

### Tensiune: 8-10 molecules ceiling

Heinrich estimează compounds peste 8-10 molecules → reliability ceiling. Faber are deja **12+ skill-uri** sub umbrela `/faber-*`. Dacă vreodată construiesc un compound care le orkestrează pe toate, lovesc ceiling-ul prin design.

**Open question:** ce înseamnă "compound" în vocabularul Alteramens? Un workflow care orkestrează 3 sub-task-uri majore, fiecare cu propriile sub-pași? Asta ar fi mai abstract decât heinrich propune.

## Partea IV — Direcții posibile (nu prescriptive)

Lista asta e generative — de unde **aș putea** începe, nu de unde **trebuie**:

1. **Etichetare retroactivă** — adaugă în SKILL.md frontmatter un câmp `composition_level: atom | molecule | compound`. Cost: 1 oră. Beneficiu: vizibilitate.

2. **MOC pentru skill engineering** — scrie `wiki/mocs/skill-engineering.md` care strânge tot graph-ul de concepte despre skills (skill-era, encoded-judgment, thin-harness-fat-skills, skillify, atoms-molecules-compounds, skill-graphs, brain-ram-leverage). Devine entry point pentru `/faber-query` despre ăsta.

3. **Skill audit prin lens skillify** — rulează retroactiv [[skillify]] checklist peste `/faber-*`-uri. Identifică dark skills, overlap, drift.

4. **Un compound experimental** — alege un workflow recurent (ex: weekly content production) și construiește-l ca compound explicit. Vezi dacă reduce brain RAM real, sau doar mută complexitatea(/alteramens-weekly-loop)).

5. **Bridge wiki ↔ skills** — fiecare skill din `.claude/skills/` să aibă o pagină echivalent în `wiki/concepts/` sau `wiki/mocs/` care îl descrie semantic. Asta unește graph-urile.

Niciuna nu e urgentă. Toate sunt aliniate cu pillar-uri active.

## Conexiuni

- [[skill-graphs]] — pattern-ul heinrich
- [[atoms-molecules-compounds]] — modelul de stratificare
- [[brain-ram-leverage]] — argumentul economic
- [[thin-harness-fat-skills]] — arhitectura intra-skill (Garry Tan)
- [[skillify]] — disciplina de verification
- [[encoded-judgment]] — filtrul Alteramens
- [[skill-era]] — meta-frame
- [[wiki/FABER.md|FABER schema]] — implementarea concretă a pattern-ului
