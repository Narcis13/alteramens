---
title: "Skill Graphs 2.0 — Atoms, Molecules, Compounds"
type: source
format: article
origin: conversation
source_ref: "conversation:2026-04-27"
ingested: 2026-04-27
guided: true
entities: [heinrich, arscontexta, langchain]
concepts: [atoms-molecules-compounds, skill-graphs, brain-ram-leverage, encoded-judgment, skill-era, thin-harness-fat-skills, skillify]
key_claims:
  - "Naive skill graphs (Wikipedia-style cross-linking) break beyond 2-3 dependency levels — agents fail to call dependent skills reliably at depth, and circular dependencies amplify the failure."
  - "Compose skills on three levels: atoms (deterministic primitives, no inter-skill calls), molecules (2-10 atoms with explicit when/how instructions), compounds (multi-molecule orchestrators with real agent autonomy)."
  - "Each composition level provides ~10x leverage over the level below for the same operator brain RAM — driving 5 compound agents = 500 atomic units of work."
  - "Brain RAM (parallel context-switching capacity) is the new limiting resource for solo operators, not coding speed."
  - "Compounds hit a reliability ceiling around 8-10 molecules; higher abstractions will be needed but heinrich hasn't yet implemented one."
  - "A single SKILL.md cannot hold a deep domain (therapy, law, trading, company knowledge) — depth requires a network of small composable files connected by prose-embedded wikilinks."
  - "Progressive disclosure pipeline: index → YAML descriptions → wikilinks-in-prose → sections → full content. Most decisions happen before any file is fully read."
  - "Reliability testing across atom/molecule/compound layers is the unsolved bottleneck — heinrich admits this is the hardest part and unsolved."
confidence: high
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
---

# Skill Graphs 2.0 — Atoms, Molecules, Compounds

Articol de [[heinrich]] care propune o **arhitectură compozițională pentru skill-uri** după ce constată că ideea naivă de skill-graphs (rețea densă, Wikipedia-style) se rupe în practică. Conținutul e împărțit în două secțiuni majore: prima despre stratificarea skill-urilor (atoms / molecules / compounds), a doua despre forma corectă a unui skill graph (rețea de fișiere mici cu progressive disclosure).

## De ce skill graphs naive eșuează

Premisa intuitivă: dacă encodezi cunoaștere ca markdown skill files care se referă unele la altele prin wikilinks, ar trebui să poți construi grafuri arbitrare de adâncime. În practică:

- Agenții apelează fiabil **doar 1-2 niveluri** de dependență. Skill A → Skill B funcționează. Skill A → B → C → D devine non-determinist.
- Circular dependencies sunt și mai rele.
- Dense graphs (Wikipedia-shape) confruntă human driver-ul cu prea mult judgment delegat agentului.

Heinrich nu abandonează ideea — o restructurează. Compoziția rămâne mecanismul-cheie de leverage; ce se schimbă e **forma** compoziției.

## Atoms / Molecules / Compounds — Three Levels of Skills

Fiecare nivel sus = mai mult judgment dat agentului, mai puțină reliabilitate per call. Fiecare nivel jos = workflow mai explicit, mai aproape de determinist.

**ATOMS** — primitive single-purpose. Exemple: scrape LinkedIn profile, verify email with Hunter, find competitor's blog posts, review this PR. Sunt aproape deterministe. **Nu apelează alte skill-uri** (de regulă).

**MOLECULES** — orkestrare a 2-10 atoms cu **instrucțiuni explicite** when/how. Două forme posibile: workflow structurat (atom-1 → atom-2 → atom-3 ...) sau orchestrator care cunoaște 5 atoms și folosește judgment să le compună. Push composition into the skill, minimize agent runtime decision-making.

**COMPOUNDS** — orkestrator high-level peste multiple molecules. "Run outbound sales playbook." "Plan and build this feature, then review and QA it." **Aici agentul primește autonomie reală.** Mai puțin deterministe by design — pentru că asta-i sensul, multiple judgment calls în lanț.

Heinrich și echipa lui au numit aceste niveluri **capabilities / composites / playbooks** în repo-ul lor.

## Brain RAM — De Ce Composition Levels Contează

Argumentul economic e cel mai puternic în articol: **brain RAM** (capacitatea operatorului de a context-switch între task-uri în paralel) e noua resursă scarce.

Suposed: poți menține atenție pe ~5 agenți în paralel.

| Nivel pe care îl conduci | 5 agenți paraleli înseamnă |
|---|---|
| Atoms | 5 atomic units of work |
| Molecules | 5 molecules = 50 atomic units |
| Compounds | 5 compounds = 50 molecules = **500 atomic units** |

> "Why are you sitting in the driver's seat when your car has full self-driving?"

Aceeași cantitate de timp și RAM mintală, output diferit cu **2 ordine de mărime**. Analogia cu CTO-ul de la 1000 oameni: nu fixează el bug-uri, are încredere în IC-i să o facă fiabil. Solo operator-ul aplicat agentic = aceeași dinamică.

## Unde se rupe (heinrich admite că nu știe încă)

Limitele declarate ale modelului:
- **Atoms trebuie să fie solide.** Un atom flaky strică totul de deasupra.
- **Molecules trebuie să cheme atoms-urile fiabil.** Compoziție explicită, nu vibez.
- **Compounds peste 8-10 molecules** — guess-ul lui heinrich pentru următorul reliability ceiling.
- **Reliability testing la fiecare nivel** = problema reală nerezolvată. Speculează că autoresearch-style solutions ar putea ajuta, dar n-a încercat.

> "I'm still driving molecules and compounds, and even that does not feel trivial to get right. But the goal is to keep moving up to higher levels for every workstream."

## Skill Graphs > SKILL.md — De Ce Fișierul Singur Nu Ajunge

A doua jumătate a articolului argumentează că **un singur SKILL.md nu poate ține un domeniu profund**. Exemplu citat: terapie cu CBT, attachment theory, active listening, emotional regulation, etc. Ar fi un fișier monstruos sau patru-cinci fișiere care nu se referă unele la altele.

**Soluția:** rețea de fișiere mici, fiecare un singur thought / technique / claim, conectate prin **wikilinks în proză**:

> "Each file is one complete thought, technique or skill and `[[wikilinks between them create a traversable graph]]`."

Wikilinks în proză au valoare semantică — agentul citește fraza și înțelege *de ce* să urmeze link-ul. Asta diferă de o tabelă de referințe stearpă.

## Progressive Disclosure — Pipeline-ul de Citire

Heinrich numește pattern-ul explicit:

```
index → descriptions → links → sections → full content
```

Cele mai multe decizii se iau **înainte ca un fișier să fie citit complet**. Mecanism:

1. Index file (entry point) listează toate paginile cu YAML descriptions
2. Agentul scanează descriptions fără să deschidă fișierele
3. Wikilinks-în-proză devin trigger-e contextuale ("urmează linkul ăsta când...")
4. MOCs (Maps of Content) organizează cluster-e de skills în sub-topic-uri navigabile
5. Skill discovery se aplică **recursiv** în interiorul graph-ului

## arscontexta — Plug-in-ul self-referential

[[arscontexta]] e Claude Code plugin construit de heinrich: ~250 markdown files conectate care **învață un agent să construiască knowledge bases (= skill graphs)**. Self-referential prin design — un skill graph care învață să construiești skill graphs.

Conține structură pre-făcută + slash commands `/learn` și `/reduce`. Research preset îl alimentează cu un topic și completează folder-ul.

## Domenii citate ca skill-graph candidates

Heinrich enumeră domenii care **nu încap într-un singur fișier dar funcționează ca graphs**:
- Trading: risk management, market psychology, position sizing, technical analysis
- Legal: contract patterns, compliance requirements, jurisdiction specifics, precedent chains
- Company: org structure, product knowledge, processes, onboarding context, culture, competitive landscape
- Therapy: CBT patterns, attachment theory, active listening, emotional regulation

Pentru fiecare, primitive-le sunt aceleași: wikilinks, YAML descriptions, MOCs, index file ca entry point.

## Citatul-cheie

> "Skills are context engineering, basically curated knowledge injected where it matters. Skill graphs are the next step. Instead of one injection the agent navigates a knowledge structure, pulling in exactly what the current situation requires. This is the difference between an agent that follows instructions and an agent that understands a domain."

## Limitări recunoscute

- Reliability testing la scară (atoms, molecules, compounds) e nerezolvat.
- Heinrich nu a atins încă layer-ul deasupra compounds.
- Articolul e descriptiv, nu prescriptiv — "still figuring out where this breaks."
- Numirea (atoms/molecules/compounds) împrumutată din chimie, useful as mnemonic dar nu o teorie formală.

## De ce contează pentru Alteramens

Două aplicații directe:

1. **Faber wiki = skill graph realizat** prin design. Wikilinks-în-proză, YAML descriptions, index auto-generated, MOCs implicite în categoriile sources/entities/concepts/syntheses. Vezi [[faber-as-skill-graph]] pentru evaluarea completă.

2. **`.claude/skills/` directory** poate fi clasificat explicit pe niveluri atom/molecule/compound — dar **prin filtru propriu**, nu copy-paste. Care e atom în vocabularul Alteramens? `/faber-sync` da; `/faber-ingest` e clar molecule (cheamă sync, scrie pages, citește vault). Compounds există încă? Probabil nu — Narcis conduce manual orkestrarea molecule-level. Asta e exact insight-ul lui heinrich despre brain RAM.
