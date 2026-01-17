<%*
const title = await tp.system.prompt("Numele ideii");
await tp.file.rename(title);
await tp.file.move("ideas/" + title);
-%>
---
type: idee
status: raw
tags:
  - idee
date: <% tp.date.now("YYYY-MM-DD") %>
monetizare:
potential:
complexitate:
---

# <% title %>

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

