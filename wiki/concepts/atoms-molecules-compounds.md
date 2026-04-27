---
title: "Atoms / Molecules / Compounds — Three-Tier Skill Composition"
type: concept
category: technical-playbook
sources: [skill-graphs-2-heinrich]
entities: [heinrich, garry-tan]
related: [skill-graphs, brain-ram-leverage, thin-harness-fat-skills, skillify, encoded-judgment, skill-era, latent-vs-deterministic]
maturity: seed
confidence: high
contradictions: []
applications: []
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
---

# Atoms / Molecules / Compounds — Three-Tier Skill Composition

Model stratificat pentru compoziția de agent skills, propus de [[heinrich]] în [[skill-graphs-2-heinrich]]. Fiecare nivel sus = mai mult judgment delegat agentului, mai puțină determinism per call. Echivalențe în vocabularul echipei lui heinrich: **capabilities / composites / playbooks**.

## Tabela de niveluri

| Nivel | Scope | Determinism | Calls other skills? | Agent autonomy |
|---|---|---|---|---|
| **Atom** | Single-purpose primitive | Aproape determinist | Nu (de regulă) | Minimă |
| **Molecule** | Task scoped, 2-10 atoms | Reliable, instrucțiuni explicite | Da, when/how prescris | Moderate |
| **Compound** | Cross-task orchestrator | Less deterministic by design | Da, multiple molecules | Real |

## Definiții

**ATOM** — building block atomic. Bounded scope, narrow function. Exemple din articol: scrape LinkedIn profile, find competitor's blog posts, verify email with Hunter, check email deliverability, review this PR. Atoms sunt aproape deterministe — "as close as you can get with an LLM". **Atoms typically don't call other skills.** Ele sunt frunzele.

**MOLECULE** — solves a larger problem prin compunerea de 2-10 atoms cu **explicit instructions on when and how** to call them. Push as much composition into the skill itself, minimize agent's runtime decision-making. Două forme:

1. **Workflow structurat** — chain explicit: atom-1 → atom-2 → atom-3 (ex: find leads → qualify → enrich → add to spreadsheet)
2. **Bounded orchestrator** — molecule cunoaște 5 atoms și folosește judgment să le compună pentru un prompt în scope

**COMPOUND** — high-level orchestrator care rulează multiple molecules. Exemple: "run outbound sales playbook", "plan and build this feature, then review and QA it". Aici **agentul primește autonomie reală** — multiple judgment calls în lanț, care prin natură vor fi less deterministic.

## Trade-off-ul leverage-vs-reliability

> "Higher level skills provide the agent with more judgement on how to orchestrate, lower level skills provide the model with a very clear workflow to execute."

Citirea inversă a tabelei: cu cât urci, cu atât **delegi mai mult judgment**. Cu cât cobori, cu atât **scrii mai mult workflow** și lași mai puțină decizie agentului.

Asta e motivul pentru care heinrich admite că compounds încă necesită un human driver — sunt prea non-deterministe să ruleze autonom în 2026.

## Reliability ceiling-uri

Heinrich numește puncte de rupere empirice:

- **Atoms** trebuie să fie solide. Un atom flaky strică totul de deasupra.
- **Molecules** trebuie să cheme atoms-urile fiabil. Compoziție explicită bate vibez.
- **Compounds peste 8-10 molecules** → reliability ceiling. La un moment dat va fi nevoie de un nivel deasupra compounds, dar heinrich n-a atins încă acel nivel.

> "I'm still driving molecules and compounds, and even that does not feel trivial to get right."

## De Ce Modelul Funcționează — Brain RAM

Vezi [[brain-ram-leverage]]: argumentul economic spune că **brain RAM-ul operatorului** e resursa scarce, nu coding speed. Aceeași cantitate de timp și RAM mintală conduce 5 task-uri în paralel — diferența e nivelul.

| Conduci... | 5 paraleli = |
|---|---|
| Atoms | 5 atomic units |
| Molecules | 50 atomic units |
| Compounds | 500 atomic units |

**~2 ordine de mărime** între capete. Asta-i argumentul pentru a urca în nivel.

## Mapare peste arhitectura existentă

[[thin-harness-fat-skills]] (al lui Garry Tan) e un model orthogonal — descrie **arhitectura unui skill** (markdown procedure + deterministic script + resolver entry). Atoms / molecules / compounds descrie **cum se aranjează multiple skills** unele față de altele.

Compatibilitate:
- Un atom e un fat skill cu un singur scop și fără call-uri către alte skills
- O moleculă e un fat skill care **cheamă alte fat skills via resolver-ul** (AGENTS.md)
- Un compound e un fat skill ce orkestrează multiple molecules

[[skillify]] (verification discipline) trebuie aplicată **la fiecare nivel** — dar gradul de verification posibil scade pe măsură ce urci. Atoms = unit tests + integration tests + LLM evals. Molecules = workflow tests pe combinații. Compounds = E2E smoke tests + human-in-loop.

[[latent-vs-deterministic]] e principiul intern al fiecărui skill — unde se face precizia (cod), unde se face judgment-ul (LLM). Atoms tind să fie heavy-deterministic. Compounds tind să fie heavy-latent.

## Critica implicită

Modelul atomic/molecular/compus e **descriptiv, nu formal**. Granițele între niveluri sunt fluide:

- Un workflow chain de 3 atoms (atom-1 → atom-2 → atom-3) e moleculă sau compound complicat?
- Un orchestrator care folosește 2 molecules + 3 atoms fluctuează între niveluri
- Vocabularul (capabilities / composites / playbooks) e mai puțin memorabil dar mai puțin metaforic

Heinrich însuși: "There might be other structures too." Tratează modelul ca mnemonic util, nu lege.

## Aplicare pentru Alteramens

Întrebarea filtru: **care skills din `.claude/skills/` sunt atoms? care sunt molecules? există compounds?**

Hypothesis (de validat când Narcis decide):

- **Atoms** candidate: `/faber-sync` (rulează un script Python, rebuild DB), `/faber-status` (un read SQL), poate `/email`
- **Molecules** candidate: `/faber-ingest` (read source → discuss → extract → write 5-10 pages → sync → report), `/faber-query`, `/faber-link`, `/semnal-draft`, `/to-content`, `/faber-slides`
- **Compounds** candidate: niciunul încă. Narcis conduce compoziția molecule-level manual prin browser/conversație.

Asta-i exact insight-ul lui heinrich despre brain RAM aplicat: **dacă molecule-urile sunt deja stabile, următorul pas e să compui compounds care să orkestreze 3-5 molecules cu autonomie**. Vezi [[faber-as-skill-graph]].

## Conexiuni

- [[skill-graphs]] — pattern complementar, descrie *forma* graph-ului în care trăiesc atoms/molecules/compounds
- [[brain-ram-leverage]] — argumentul economic care motivează urcarea în nivel
- [[thin-harness-fat-skills]] — arhitectura intra-skill care fit-uie peste oricare nivel
- [[skillify]] — verification discipline aplicată la fiecare nivel
- [[encoded-judgment]] — atoms = judgment bounded; compounds = judgment open
- [[skill-era]] — modelul stratificat e arhitectura nativă a Skill Era
- [[latent-vs-deterministic]] — split-ul cod/LLM în interiorul fiecărui skill
