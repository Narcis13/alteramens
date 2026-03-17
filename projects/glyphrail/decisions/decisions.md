---
parent: "[[glyphrail/glyphrail|Glyphrail]]"
type: decisions
---

# Glyphrail - Decizii

| Decizie | Ratiune | Outcome |
|---------|---------|---------|
| CLI-first design | CLI este contractul pe care un agent extern îl poate automatiza (capabilities, validate, run, inspect, resume) | Active |
| Engine deține control flow, nu agentul | Separare clară: determinism la nivel de orchestrare, judgment bounded la nivel de agent step | Active |
| YAML workflow DSL | Human-readable, diff-friendly, agent-parseable; strict top-level shape | Active |
| JSON runtime state model | Explicit namespaces (input, state, context, system), fără hidden în memorie | Active |
| Persisted run artifacts per run ID | Resume din state persistent, nu din prompt history sau in-memory context | Active |
| Structured output repair | Extrage JSON valid din răspunsuri cu markdown fencing — util pentru LLM-uri care nu respectă strict formatul | Active |
| Mock agent adapter | Tests și workflows rămân deterministe fără LLM live; scriptable cu mockResponses | Active |
| Zero runtime dependencies | Portabilitate maximă, mai ușor de instalat global | Active |
| `--json` flag pe toate comenzile | Stable JSON envelope pentru operators și agenți automatizați | Active |
| Bounded `while` cu `maxIterations` | Prevenire infinite loops fără sacrificarea flexibilității | Active |
| Checkpoint după fiecare step (default) | Resume granular, debugging mai ușor | Active |
| `parallel` deferred | Complexitate prea mare pentru MVP; determinismul e prioritar | Pending |
| `agent.mode=tool-use` deferred | Nevoie de mai multă gândire la interfața cu provider adapters | Pending |
