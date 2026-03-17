---
parent: "[[glyphrail/glyphrail|Glyphrail]]"
type: learnings
---

# Glyphrail - Ce am invatat

## Design & Architecture

- Separarea engine (control flow) / agent (judgment) / tool (side effects) este o arhitectura robustă pentru agentic systems — fiecare poate evolua independent
- "Bounded agent execution" e un pattern important: agentul contribuie judgment, dar nu deține loop-ul
- Persisted state + execution cursor permit resume fără a reconstrui contextul din memorie — aceasta e o proprietate puternică pentru sisteme long-running
- CLI ca contract machine-operable e o idee puternică pentru agent interop — capabilitati, scheme și outputs standardizate

## Implementation

- Run artifacts (meta.json, state.latest.json, trace.jsonl, checkpoints/) permit debugging post-factum fără logging special
- Structured output repair (fenced JSON extraction) e necesar în practică — LLM-urile returnează des JSON în markdown fencing
- `capabilities --json` ca entrypoint machine-readable e un pattern bun pentru orice CLI destinat agenților
- Retry counters persistate permit inspecție și resume consistent — nu pierzi starea după crash

## Process

- YAML DSL cu strict shape validation detectează erori la authoring time, nu la runtime
- Mock adapter pentru teste deterministe e esențial — workflows trebuie să fie testabile fără LLM live
- Explicit namespaces (input/state/context/system) elimina ambiguitatea în expresii
