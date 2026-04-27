---
title: "Skill Engineering — Map of Content"
type: moc
category: map-of-content
topic: skill-engineering
sources: [skill-era-article, skillify-agents-same-mistakes, skill-graphs-2-heinrich]
entities: [garry-tan, heinrich, openclaw, gbrain, hermes-agent, langchain, arscontexta]
concepts: [skill-era, encoded-judgment, thin-harness-fat-skills, skillify, atoms-molecules-compounds, skill-graphs, brain-ram-leverage, latent-vs-deterministic]
syntheses: [faber-as-skill-graph, marketing-skills-catalog]
related: [skill-era, encoded-judgment, thin-harness-fat-skills, skillify, atoms-molecules-compounds, skill-graphs, brain-ram-leverage, latent-vs-deterministic, faber-as-skill-graph, executable-wiki, agent-fleet-architecture, productize-yourself, leverage, active-skills]
maturity: developing
confidence: high
created: 2026-04-27
updated: 2026-04-27
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-04-27 build | MOC skill-engineering"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-04-27 build | MOC skill-engineering"
---

# Skill Engineering — Map of Content

Entry point pentru tot ce s-a acumulat în Faber despre **cum se proiectează, se compun, se verifică și se distribuie skills** — în sensul larg (de la `.claude/skills/*/SKILL.md` la Google Doc encoded judgment). MOC-ul e un instrument de navigare, nu un rezumat: deschide-l ca să decizi *ce să citești*, nu ca să eviți să citești.

Pattern-ul vine de la [[heinrich]] — wikilinks-în-proză + descriptions scannabile + progressive disclosure. Ăsta-i primul MOC explicit din Faber. Înainte, categoriile (sources/entities/concepts/syntheses) jucau rol de MOCs implicite — vezi [[faber-as-skill-graph]] §"Ce-ar mai trebui să adăugăm".

## Întrebări la care răspunde acest MOC

- *Ce înseamnă "skill" în sensul Skill Era?* → start cu [[skill-era]], apoi [[encoded-judgment]]
- *Cum arată arhitectura unui skill individual?* → [[thin-harness-fat-skills]]
- *Cum compui mai multe skills împreună?* → [[atoms-molecules-compounds]] + [[skill-graphs]]
- *De ce să urci în nivel de compoziție?* → [[brain-ram-leverage]]
- *Cum păstrezi skills durabile / non-rotted?* → [[skillify]]
- *Unde-i Alteramens-ul în toată povestea asta?* → [[faber-as-skill-graph]]

## Reading order recomandat (progressive disclosure)

Trei trasee, alege după intent:

### Traseu 1 — "vreau să înțeleg paradigm-ul, am 15 minute"
1. [[skill-era]] — paradigm shift API → Skill (mature, high confidence)
2. [[encoded-judgment]] — distincția API vs Skill, filtrul "where is the judgment?"
3. [[brain-ram-leverage]] — argumentul economic care motivează totul

### Traseu 2 — "vreau să construiesc skills, am 1 oră"
1. [[thin-harness-fat-skills]] — arhitectura: markdown procedure + script determinist + resolver entry
2. [[skillify]] — disciplina de verification (10 pași, fără care skills-urile rotează)
3. [[atoms-molecules-compounds]] — nivelurile de compoziție și trade-off leverage-vs-reliability
4. [[latent-vs-deterministic]] — split-ul intern fiecărui skill (ce face LLM, ce face cod)

### Traseu 3 — "vreau să-l aplic la Alteramens, am decizii de luat"
1. [[faber-as-skill-graph]] — synthesis-ul care leagă tot graph-ul de viziunea proprie + open questions
2. [[skill-graphs]] — pattern-ul topologic (cum trăiește Faber-ul ca skill graph deja)
3. [[brain-ram-leverage]] — întrebarea-filtru zilnică: "la ce nivel îmi alocă RAM-ul cel mai bun ROI azi?"

## Cluster-ul de concepte

### [[skill-era]] — paradigm shift API → Skill
*Mature, high.* Teza-meta: când LLM-urile comprimă execuția, ce rămâne valoros e [[encoded-judgment|judgment-ul]]. Distribuția se mută din dashboard-uri în workflow-uri agentice. Companii mici cu leverage masiv prin invocări. **Cine deține pattern-urile, câștigă.**

Citește când: vrei contextul "de ce contează asta acum" pentru orice decizie de produs.

### [[encoded-judgment]] — Skills vs Functions
*Developing, high.* Distincția operațională: API = funcție mecanică; Skill = judgment encodat. Filtrul "where is the judgment?" se aplică tuturor proiectelor Alteramens. Heinrich rafinează în spectru: atom = bounded judgment / molecule = composed judgment / compound = open judgment. Garry Tan adaugă: judgment-ul ne-verificat = vibes.

Citește când: evaluezi un proiect/skill/feature și nu ești sigur unde-i moat-ul.

### [[thin-harness-fat-skills]] — arhitectura unui skill individual (Garry Tan)
*Seed, high.* Forma: harness minimal (loader + resolver) + skills grase ca markdown. SKILL.md teach modelul *cum să abordeze* o sarcină, nu *ce să facă*. **Loop-ul critic:** "the latent space builds the deterministic tool, then the deterministic tool constrains the latent space." Skills sunt diffable, agent-authorable, progressive-disclosable.

Citește când: scrii un nou skill sau auditezi unul existent. Echivalent pentru `.claude/skills/*/SKILL.md` deja exists; ce lipsește e disciplina [[skillify]].

### [[skillify]] — disciplina de verification (Garry Tan)
*Developing, high.* Promotion ritual de 10 pași care transformă orice prototype/failure în infrastructură testată. SKILL.md → cod determinist → unit tests → integration tests → LLM evals → resolver entry → resolver eval → check-resolvable + DRY → E2E smoke → brain filing rules. Catches două failure modes: *wrong side* (judgment în latent în loc de cod) și *silent rot* (drift, dark skills, overlap). Heuristic: "search your conversation for 'fucking shit' — those are your missing test cases."

Citește când: ai un skill care funcționează dar n-ai încredere în el peste 3 luni; sau auditezi `.claude/skills/` pentru dark skills și overlap.

### [[atoms-molecules-compounds]] — three-tier composition (heinrich)
*Seed, high.* Modelul stratificat: **atom** (bounded, near-deterministic, no inter-skill calls) / **molecule** (chain de 2-10 atoms cu instrucțiuni explicite) / **compound** (orkestrator multi-molecule cu autonomy reală). Echivalențe: capabilities / composites / playbooks. Trade-off: cu cât urci, cu atât delegi mai mult judgment, cu atât mai puțin determinism. Compounds peste 8-10 molecules → reliability ceiling.

Citește când: încerci să clasifici skill-urile existente sau decizi dacă să construiești un compound nou.

### [[skill-graphs]] — pattern-ul topologic (heinrich)
*Seed, high.* Soluția pentru domenii prea adânci pentru un singur SKILL.md: **rețea de fișiere mici, conectate prin wikilinks-în-proză, navigate prin progressive disclosure** (index → descriptions → links → sections → full content). Patru primitive: wikilinks-în-proză + YAML descriptions + MOCs + index ca entry point. Faber e deja un skill graph realizat (vezi [[faber-as-skill-graph]]); MOC-ul ăsta e prima MOC explicită.

Citește când: domeniul cu care lucrezi e prea mare pentru un singur fișier; sau te gândești cum să organizezi `.claude/skills/` ca graph navigabil.

### [[brain-ram-leverage]] — argumentul economic (heinrich)
*Seed, high.* Resursa scarce a solo operator-ului agentic e **brain RAM**, nu coding speed. Aceeași cantitate de timp/RAM mintală conduce 5 task-uri în paralel — diferența e *nivelul* la care le conduci. 5 atoms = 5 unități; 5 molecules = 50; 5 compounds = 500. ~2 ordine de mărime între capete. **De aici motivația pentru a urca în nivel de compoziție.** Analogia: CTO-ul unei companii de 1000 nu fixează fiecare bug — dacă o face, și-a alocat RAM-ul greșit.

Citește când: te întrebi "ce să fac astăzi" sau evaluezi dacă merită investit într-un compound.

### [[latent-vs-deterministic]] — split intra-skill (Garry Tan)
*Mențiune.* Principiul intern al fiecărui skill: judgment → LLM, precision → cod determinist. Atoms tind să fie heavy-deterministic; compounds tind să fie heavy-latent. Skill-uri care fac math/parsing/lookup în prompt = wrong side. Citează la nevoie, nu obligatoriu pentru contextul general.

## Surse-rădăcină (originalul, nu derivativele)

- [[skill-era-article]] — articolul-meta despre Skill Era (paradigm + filtre + arhetip de companie)
- [[skillify-agents-same-mistakes]] — Garry Tan, eseul Skillify (10 pași + critique LangChain + check-resolvable)
- [[skill-graphs-2-heinrich]] — heinrich, Skill Graphs 2.0 (atoms/molecules/compounds + brain RAM + skill graphs ca topologie)

## Entități-cheie (autorii și implementările)

- [[garry-tan]] — autorul thin-harness-fat-skills + Skillify; investitor YC; reference stack: [[openclaw]] (harness) + [[gbrain]] (verification)
- [[heinrich]] — autorul atoms/molecules/compounds + skill graphs 2.0 + brain RAM leverage; reference: [[arscontexta]] (skill graph care se predă pe sine)
- [[hermes-agent]] — Nous Research; creează skills autonom dar nu le testează (counter-example: creation fără verification)
- [[langchain]] — counter-example în ambele unghiuri: primitives without opinions = vibes-based reliability ($160M, 3 ani, "pieces but not a practice")

## Synthesis activă

[[faber-as-skill-graph]] — singura synthesis care unește tot cluster-ul prin viziunea Alteramens. Patru părți: (1) Faber e deja skill graph prin convergență; (2) lens atoms/molecules/compounds aplicat la `.claude/skills/`; (3) tensiuni — wiki vs skills, progressive disclosure pentru execution, ceiling-ul 8-10 molecules; (4) direcții posibile, nu prescriptive. **Open questions de calitate** — citește chiar dacă deja știi conceptele.

## Connecții laterale (out-of-cluster)

Skill engineering nu trăiește izolat. Conexiunile care contează:

- [[productize-yourself]] (Naval) — leverage-ul personal e ce face skill engineering relevant pentru solo operatori; brain RAM e mecanismul, productize yourself e meta-frame-ul
- [[leverage]] — concept umbrelă; brain RAM și encoded judgment sunt mecanisme specifice
- [[executable-wiki]] — același shape (LLM-maintained structured knowledge agentul consumă); Faber e instanță
- [[agent-fleet-architecture]] (Eric Siu) — analog org-scale: specialist agents cu propriile skills; thin-harness-fat-skills aplicat la nivel de companie
- [[google-doc-offer]] — varianta non-tech a thin-harness-fat-skills: skill = Google Doc cu judgment cristalizat, distribuit via URL; vezi [[skill-era]] §"Non-Tech Variant"

## Open questions (din [[faber-as-skill-graph]])

Nu ignore-able când iei decizii pe `.claude/skills/`:

1. ~~**Wiki vs skills ca două graph-uri separate** — merită un MOC `wiki/mocs/active-skills.md` care să listeze fiecare skill cu wikilink spre concept Faber relevant?~~ **Addressed 2026-04-27 — vezi [[active-skills]] MOC. Toate cele 54 de skills au acum un loc semantic; marketing skills delegă la [[marketing-skills-catalog]], Faber/Semnal/meta sunt clusterizate direct.**
2. **Progressive disclosure pentru execution** — Claude Code face eager loading; skills mari mănâncă context degeaba. Spart `/faber-ingest` în sub-skills cu wikilinks între ele?
3. **8-10 molecules ceiling** — Faber are deja 12+ skill-uri sub `/faber-*`. Un compound care le orkestrează lovește ceiling-ul prin design. Ce înseamnă "compound" în vocabularul Alteramens?
4. **Etichetare retroactivă** — `composition_level: atom | molecule | compound` în SKILL.md frontmatter? Cost mic, vizibilitate mare.

## Pillars activi pe care MOC-ul îi întărește

- `skill-era-craftsmanship` — întreg cluster-ul e operaționalizarea acestui pillar
- `ai-agents-for-solo-builders` — brain RAM + atoms/molecules/compounds = scheletul economic și compozițional al pillar-ului

## Întreținere

- **Maturity:** developing — devine `mature` când există cel puțin un compound funcțional în `.claude/skills/` și o synthesis follow-up care îl evaluează
- **Update triggers:** orice ingest nou care atinge ≥2 din concepts în related; sau o decizie majoră pe `.claude/skills/` (audit Skillify, primul compound, MOC `active-skills`)
- **Drift check:** dacă cele 7 concepte centrale nu mai sunt cele mai relevante pentru skill engineering peste 3 luni, MOC-ul cere rewrite, nu append

---

*Pentru `/faber-query` despre skill engineering: pornește de aici. Pentru context istoric, vezi log-urile `2026-04-23` (Skillify ingest) și `2026-04-27` (Skill Graphs 2.0 ingest).*
