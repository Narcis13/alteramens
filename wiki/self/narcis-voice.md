---
title: "Narcis — Voice rules"
type: self
subtype: voice
status: active
maturity: developing
created: 2026-04-22
updated: 2026-04-22
voice_rules:
  - slug: romglish-when-natural
    rule: "Păstrează Romglish când e natural (cod-switching EN→RO în mijlocul propoziției). Nu traduce forțat."
    category: romglish
    status: active
    examples_yes:
      - "Am făcut shipping la skill-ul X."
      - "Bottleneck-ul nu e coding-ul, ci validarea."
    examples_no:
      - "Am efectuat livrarea la abilitatea X."
      - "Gâtuirea nu este programarea, ci validarea."
  - slug: no-corporate-hedging
    rule: "Fără hedging corporate. Zero 'could potentially', 'it is important to note', 'in conclusion'."
    category: register
    status: active
    examples_yes:
      - "Funcționează. Iată de ce."
      - "Nu merge. Am schimbat abordarea."
    examples_no:
      - "Ar putea potențial funcționa în anumite condiții."
      - "Este important de menționat că..."
  - slug: short-sentences-hard-claims
    rule: "Propoziții scurte. Claim-uri tari. Un ton de constatare, nu de explicație academică."
    category: register
    status: active
    examples_yes:
      - "Judgment-ul câștigă. Execuția e comprimată."
    examples_no:
      - "Din perspectiva analitică, judgment-ul, considerat ca element strategic, prezintă un avantaj competitiv în contextul comprimării execuției."
  - slug: first-person-singular
    rule: "Persoana I singular (‘eu’, ‘am’, ‘scriu’). Fără ‘noi’ retoric. Accountability directă."
    category: register
    status: active
  - slug: technical-terms-en
    rule: "Termenii tehnici rămân în EN (shipping, commit, leverage, skill, prompt). Nu se traduc nici forțat, nici italic."
    category: romglish
    status: active
    examples_yes:
      - "Am dat merge la PR-ul cu skill-ul nou."
    examples_no:
      - "Am contopit (merge) solicitarea de tragere (PR) cu noua abilitate."
  - slug: pillar-alignment-check
    rule: "Orice text lung verifică: se aliniază cu cel puțin un pilon activ? Dacă nu — edit until yes, or kill it."
    category: pillar-alignment
    status: active
  - slug: no-emojis-in-prose
    rule: "Zero emoji în prose. Exception: dacă utilizatorul cere explicit."
    category: register
    status: active
  - slug: specific-numbers-concrete-examples
    rule: "Numere concrete > descrieri vagi. ‘21 zile’ bate ‘câteva săptămâni’. ‘1000 urmăritori’ bate ‘mulți urmăritori’."
    category: specificity
    status: active
---

# Voice rules

Regulile de voce care populează tabela `voice_rules`. Skills (`/semnal-*`, `/to-content`, `/faber-ingest`) citesc aceste reguli din DB la startup (nu din MD).

Orice text scris "în numele lui Narcis" trece aceste reguli înainte de shipping. Drift = `status: challenged` pe regula în cauză, nu ștergere.

## Cum se aplică

- `/semnal-draft` și `/semnal-reply` — selectează toate regulile cu `status='active'` și le injectează în prompt.
- `/to-content` — aceleași reguli + piloni activi + constraints.
- `/faber-ingest` — folosește regulile doar pentru a nu sterilizeniza citatele lui Narcis la extragere.

## Revizie

La fiecare `/faber-meet`, Narcis reconfirmă. Regula devine `retired` dacă a fost înlocuită; `challenged` dacă Claude raportează contraexemple din log.
