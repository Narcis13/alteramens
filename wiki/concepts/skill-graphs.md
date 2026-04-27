---
title: "Skill Graphs — Network of Composable Skill Files via Wikilinks"
type: concept
category: pattern
sources: [skill-graphs-2-heinrich]
entities: [heinrich, arscontexta]
related: [atoms-molecules-compounds, brain-ram-leverage, thin-harness-fat-skills, encoded-judgment, skill-era, executable-wiki, faber-sqlite-index]
maturity: seed
confidence: high
contradictions: []
applications: ["wiki/FABER.md"]
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-04-27 ingest | Skill Graphs 2.0"
---

# Skill Graphs — Network of Composable Skill Files via Wikilinks

Pattern arhitectural propus de [[heinrich]] în [[skill-graphs-2-heinrich]] pentru cazurile când **un singur SKILL.md nu poate ține un domeniu profund**. Soluția: rețea de fișiere mici, fiecare un complete thought, conectate prin wikilinks-în-proză și navigate prin progressive disclosure.

## Premisa

Skill-urile clasice (un fișier = o capabilitate) merg pentru task-uri simple. Pentru domenii cu adâncime — terapie cu cognitive-behavioral patterns + attachment theory + active listening + emotional regulation; drept cu contract patterns + compliance + jurisdiction + precedent — un singur fișier devine fie monstruos, fie superficial.

Răspunsul lui heinrich: **scrie multe fișiere mici, conectează-le, lasă agentul să navigheze**.

## Distincție vs naive skill graphs

Heinrich însuși precizează că **skill graphs naive** (Wikipedia-style cross-link-uire densă unde A apelează B apelează C apelează D) **se rup la adâncime** — agenții nu cheamă fiabil skill-uri sub 2-3 niveluri de dependență. Circular dependencies amplifică problema.

**Skill graphs 2.0** rezolvă asta prin:
1. Composition stratificată ([[atoms-molecules-compounds]]) — limitează adâncimea call chain-urilor la maxim 3 niveluri logice
2. **Progressive disclosure** ca mecanism de navigare — nu apelezi skill-ul, *citești-l selectiv*

## Primitive

Heinrich enumeră patru primitive necesare pentru un skill graph funcțional:

1. **Wikilinks-în-proză** — link-urile sunt incluse în fraze normale, nu listate ca "see also". Asta poartă semnificație: agentul citește contextul și înțelege *de ce* să urmeze link-ul.

2. **YAML frontmatter cu descriptions** — fiecare fișier are un descriptor scannable. Agentul filtrează după descriptions fără să deschidă fișierele.

3. **MOCs (Maps of Content)** — fișiere care organizează cluster-e de skill-uri în sub-topic-uri navigabile. MOC-ul nu conține skill-ul — îl indexează cu wikilinks adnotate.

4. **Index file** ca entry point — citit la începutul oricărei query-uri. Pointează atenția, nu enumeră exhaustiv.

## Progressive Disclosure Pipeline

Mecanismul-cheie. Citatul lui heinrich:

```
index → descriptions → links → sections → full content
```

Detaliat:

1. **Index** — entry point. Listează ce există, organizează MOCs.
2. **Descriptions** — YAML frontmatter scannabil. Agentul decide ce merită deschis.
3. **Links** — wikilinks-în-proză indică *în ce direcție* să navigheze.
4. **Sections** — la nevoie, agentul citește o secțiune specifică, nu fișierul întreg.
5. **Full content** — ultimul resort, când contextul cere asta.

> "Most decisions happen before reading a single full file."

Asta-i diferența față de RAG (chunked retrieval) — agentul **navighează intentional** în loc să fie servit chunk-uri pe similarity score.

## Ce Activează Pattern-ul

Heinrich enumeră domenii care nu încap în un fișier dar funcționează ca graphs:

- **Trading** — risk management, market psychology, position sizing, technical analysis
- **Legal** — contract patterns, compliance requirements, jurisdiction specifics, precedent chains
- **Company** — org structure, product knowledge, processes, onboarding context, culture, competitive landscape
- **Therapy** — CBT patterns, attachment theory, active listening, emotional regulation

Pattern-ul: domenii **profunde dar interconectate**, unde context flows between concepts.

## Citatul-cheie

> "Skills are context engineering, basically curated knowledge injected where it matters. Skill graphs are the next step. Instead of one injection the agent navigates a knowledge structure, pulling in exactly what the current situation requires. This is the difference between an agent that follows instructions and an agent that understands a domain."

## Plug-in-ul self-referential

[[arscontexta]] e plugin-ul lui heinrich — ~249 markdown files care învață un agent să construiască knowledge bases (= skill graphs). Self-referential: e un skill graph care se predă pe sine.

## Faber ca skill graph realizat

Pattern-ul descris de heinrich e topologia [[wiki/FABER.md|Faber wiki]] aproape vorbă-cu-vorbă:

| Heinrich primitive | Faber implementation |
|---|---|
| Wikilinks-în-proză | `[[concept-slug]]` în corp |
| YAML descriptions | Frontmatter pe fiecare pagină |
| MOCs | Categoriile sources/entities/concepts/syntheses + auto-generated index.md |
| Index file ca entry point | `wiki/index.md` regenerat de `faber_sync.py` |
| Progressive disclosure | SQLite + FTS face acest pipeline mecanic; agentul citește `index.md` → query frontmatter → urmează wikilinks-uri → citește pagina țintă |

Vezi [[faber-as-skill-graph]] pentru evaluare detaliată și ce-ar lipsi pentru paritate completă.

## Distincția față de [[thin-harness-fat-skills]]

[[thin-harness-fat-skills]] descrie **arhitectura unui skill individual** — markdown procedure + deterministic script + resolver entry. Skill graphs descrie **cum se conectează multiple skills/notes**.

Sunt complementare, nu competitive:
- Un nod într-un skill graph poate fi un fat skill (executabil) sau un knowledge note (readable)
- Resolver-ul (AGENTS.md) face routing între skill-uri executabile; index-ul + wikilinks fac routing între knowledge notes

## Unde se rupe

Heinrich nu numește limitele explicit pentru skill graphs (le-a numit pentru atoms/molecules/compounds). Ipotetic:

- **Pierderea de context la fișiere foarte mici** — un complete thought poate avea nevoie de mai mult decât o pagină
- **Wikilinks-în-proză cer scriitor disciplinat** — link-uri puse de lene devin zgomot semantic
- **Index drift** — dacă entry point-ul nu e regenerat (cum face `faber_sync.py`), graph-ul putrezește la margini

## Conexiuni

- [[atoms-molecules-compounds]] — modelul de compoziție care trăiește în interiorul graph-ului
- [[thin-harness-fat-skills]] — arhitectura intra-nod
- [[encoded-judgment]] — pattern-ul prin care knowledge devine callable
- [[skill-era]] — skill graphs sunt artefactul nativ al Skill Era pentru domenii profunde
- [[executable-wiki]] — același shape (LLM-maintained structured knowledge)
- [[faber-sqlite-index]] — implementarea concretă care face progressive disclosure mecanic în Faber
