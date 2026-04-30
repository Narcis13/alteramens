---
title: "arscontexta"
type: entity
category: tool
aliases: ["arscontexta plugin", "arscontexta claude code plugin"]
first_seen: skill-graphs-2-heinrich
sources: [skill-graphs-2-heinrich]
related_entities: [heinrich]
related_concepts: [skill-graphs, atoms-molecules-compounds, encoded-judgment, skill-era]
vault_refs: []
status: active
---

# arscontexta

Claude Code plugin construit de [[heinrich]] pentru construirea de knowledge bases / skill graphs. **~249 fișiere markdown structurate** care învață un agent cum să creeze sisteme similare — un skill graph self-referential care se predă pe sine.

## Pattern-ul self-referential

Numele e cheie: *ars* (artă) + *contexta* (context). Plug-in-ul nu e o tool care produce ceva. E un **graph care învață agentul să construiască graphs**. Echivalent metodologic: instalezi-l, alegi un research preset, indici un topic, apoi îl umpli cu slash commands `/learn` și `/reduce`.

> "249 files of structured knowledge the agent traverses to derive a local knowledge system that really fits your workflow"

## Componente declarate (din articol)

- **Folder structure** pre-creat pentru markdown skill graph
- **Slash commands** `/learn` și `/reduce` pentru ingest și sinteză
- **Research preset** ca punct de plecare pentru orice topic
- **Index file** ca entry point al graph-ului — agentul îl citește ca să înțeleagă landscape-ul

## Dovadă a tezei skill-graphs

[[arscontexta]] e **proof-of-work** pentru articolul lui heinrich: nu doar argumentează că skill graphs funcționează la scară, ci livrează unul de 249 fișiere care funcționează ca distribuibil. Asta-l alătură categorial cu artefacte ca [[gbrain]] (al lui [[garry-tan]]) — skill collection + framework, nu doar idee.

## Comparativ cu Faber

Faber-ul Alteramens are o țintă diferită dar topologie similară:

| | arscontexta | Faber |
|---|---|---|
| Scop | A învăța agentul să construiască knowledge bases | A reține și sintetiza knowledge personal pentru Narcis |
| Mărimea | ~249 fișiere prompted | Câteva sute de pagini, crescând organic |
| Audiență | Agentul care construiește | Agent + Narcis + future-self |
| Persistență | Per-instalare (poți regenera) | Append-only, version-controlled |
| Marker | Plugin manifest | `.faber.toml` |

Vezi [[faber-as-skill-graph]] pentru evaluare detaliată.

## Status

Active, public, distribuit ca plugin Claude Code. Linkul direct nu apare în articol (probabil pe GitHub heinrich's account). Nu e instalat în setup-ul Alteramens — Faber acoperă spațiul similar cu o opinie diferită.
