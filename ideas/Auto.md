---
type: idee
status: raw
tags:
  - idee
date: 2026-03-23
monetizare:
potential:
complexitate:
version: "1.0"
name: agent-success-demo
description: Structured agent success using the built-in mock adapter
state: "[object Object]"
steps:
  - id: analyze
    kind: agent
    mode: structured
    provider: mock
    model: mock
    objective: Determine whether evidence is sufficient
    instructions: |
      Return strict JSON only.
      Be conservative.
    input:
      goal: ${state.goal}
      vendors:
        - alpha
        - beta
    outputSchema:
      type: object
      properties:
        enoughEvidence:
          type: boolean
        reason:
          type: string
      required:
        - enoughEvidence
        - reason
      additionalProperties: false
    save: state.decision
    meta:
      mockResponse:
        rawOutput: |
          ```json
          {"enoughEvidence":true,"reason":"Two vendors are enough for the demo."}
          ```
  - id: done
    kind: return
    output:
      decision: ${state.decision}
---

# Auto

## Descriere scurtă
[1-2 propoziții - ce e și pentru cine]

## Problema
[Ce durere rezolvă? Cine o are? Cât de mare e?]

## Soluția propusă
[Cum ar arăta produsul/serviciul]

## Monetizare
- **Model:**
- **Preț estimat:**
- **Potențial:**

## Complexitate
- **Tehnic:**
- **Timp până la MVP:**
- **Dependențe:**

## Validare
- [ ] Am găsit oameni cu problema asta?
- [ ] Există competitori? (bine = piață validată)
- [ ] Ar plăti cineva pentru asta?

## Următorul pas
[O singură acțiune concretă, mică]

---

## Conexiuni
- Idei similare: [[]]
- Inspirație: [[]]
- Poate combina cu: [[]]

## Note

