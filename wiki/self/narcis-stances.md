---
title: "Narcis — Stance-uri active"
type: self
subtype: stances
status: active
maturity: developing
created: 2026-04-22
updated: 2026-05-16
stances:
  - slug: shipping-over-perfection
    on_topic: delivery cadence
    position: "Shipping > perfecționare — publicarea săptămânală bate drafturile finisate."
    confidence: high
    status: active
    last_reaffirmed: 2026-04-22
  - slug: romglish-authentic-over-sterilized-english
    on_topic: voice register
    position: "Romglish autentic > engleză sterilizată de LLM. Voce reală, Romglish când e natural."
    confidence: high
    status: active
    last_reaffirmed: 2026-04-22
  - slug: judgment-over-functionality
    on_topic: what to encode
    position: "Judgment encodat > funcționalitate mecanică. Skills/tools cu opinii, nu doar API-uri."
    confidence: high
    status: active
    last_reaffirmed: 2026-04-22
  - slug: pragmatic-over-elegant
    on_topic: engineering trade-offs
    position: "Pragmatic > elegant. Ce funcționează bate ce e rafinat."
    confidence: high
    status: active
    last_reaffirmed: 2026-04-22
  - slug: organic-growth-no-shortcuts
    on_topic: audience growth on X
    position: "Creștere organică pe bune — zero boți, zero auto-reply, zero engagement pods."
    confidence: high
    status: active
    last_reaffirmed: 2026-04-22
  - slug: bias-for-action
    on_topic: decision making
    position: "Bias pentru acțiune — iterații mici, rezultate tangibile, mai bine făcut decât perfect."
    confidence: high
    status: active
    last_reaffirmed: 2026-04-22
  - slug: written-offer-over-sales-call
    on_topic: selling premium services
    position: "Written offer > sales call. Un Google Doc care pre-gestionează obiecțiile scalează; un call de discovery nu. Yes-ul self-generated bate yes-ul extras."
    confidence: medium
    status: active
    created: 2026-04-24
    last_reaffirmed: 2026-04-24
    source: asset-creators-operator-playbook
  - slug: client-cap-as-discipline
    on_topic: growth boundaries in coaching/consulting
    position: "Client cap e disciplină, nu scarcity theater. Dincolo de 5-6 activi devii angajat. Mai bine slot gol decât client greșit — un client greșit costă 6 săptămâni și testimonial inutilizabil."
    confidence: medium
    status: active
    created: 2026-04-24
    last_reaffirmed: 2026-04-24
    source: asset-creators-operator-playbook
  - slug: no-refunds-as-buyer-filter
    on_topic: policies as pre-sale filters
    position: "No refunds = filtru de serious buyer, nu lipsă de integritate. Refund policy atrage buyer's remorse ca model de business. Edge cases (medical, familial, seller fail) se tratează privat."
    confidence: medium
    status: active
    created: 2026-04-24
    last_reaffirmed: 2026-04-24
    source: asset-creators-operator-playbook
  - slug: services-as-distribution-products-as-business
    on_topic: business model for solo operators
    position: "Serviciile (coaching, advisory, consulting) nu sunt business-ul. Sunt cum rămâi aproape de problema reală pentru a construi produsele scalabile. Clienții co-construiesc produsele."
    confidence: medium
    status: active
    created: 2026-04-24
    last_reaffirmed: 2026-04-24
    source: asset-creators-operator-playbook
  - slug: compose-skills-by-level
    on_topic: skill architecture
    position: "Compose at atoms/molecules/compounds layers — don't ship undifferentiated SKILL.md piles. Skills nemarcate cu nivel de compoziție sunt skills nematurate."
    confidence: medium
    status: active
    created: 2026-04-27
    last_reaffirmed: 2026-04-27
    source: skill-graphs-2-heinrich
  - slug: open-protocols-over-vendor-apis-for-personal-data
    on_topic: distribution infrastructure for personal-data systems
    position: "Protocoale publice (MCP-style) > API-uri vendor-proprietare pentru personal-data infrastructure. Fără standard public, ești captiv într-un vendor — strategic, nu opțional."
    confidence: medium
    status: active
    created: 2026-05-16
    last_reaffirmed: 2026-05-16
    source: personal-context-agent
  - slug: identity-first-over-notes-first-storage
    on_topic: personal data architecture
    position: "Identity-first > notes-first pentru sisteme de context personal. Identity, Role, Goal, State, Stance sunt entity types de prim rang, nu mențiuni incidentale în note."
    confidence: medium
    status: active
    created: 2026-05-16
    last_reaffirmed: 2026-05-16
    source: personal-context-agent
  - slug: validate-before-code-for-ambitious-bets
    on_topic: decision making on non-trivial systems
    position: "Pentru pariuri ambițioase (sistem cu protocol, multi-tenant, mobile-native), validate 5+ conversații înainte de orice cod. Bias for action rămâne, calibrat la scop — small bets ship fast; big bets validate first."
    confidence: medium
    status: active
    created: 2026-05-16
    last_reaffirmed: 2026-05-16
    source: personal-context-agent
---

# Stance-uri active

Poziții declarate pe sub-probleme concrete. Fiecare stance e **confruntabil** prin log — `/faber-mirror` poate detecta drift între stance și comportament.

> Reciprocă: [[claude]] (jurnal de echipaj) sincronizează propriile heuristici cu stance-urile de aici. Drift-ul stance ↔ heuristică e flagged de `/faber-lint`.

## Shipping > perfecționare

Reafirmat la fiecare sesiune. Contra-forța directă pentru [[narcis-constraints#amanare-postarea|slăbiciunea amânării]]. Orice sistem personal trebuie să atace friction-ul de shipping, nu să adauge cool features.

## Romglish autentic > engleză sterilizată

Voce nativă în RO, engleză decent. Romglish e semnătură, nu compromis. [[narcis-voice]] codifică regulile efective — LLM-ul trebuie să păstreze vocea când scrie în numele meu.

## Judgment encodat > funcționalitate mecanică

Filozofia [[wiki/concepts/skill-era|Skill Era]]. Skills/tools care **au opinii** — "cum structurezi X ca un senior" — nu doar API-uri.

## Pragmatic > elegant

Ce funcționează bate ce e rafinat. Iterațiile mici câștigă. Refactor-ul e admis numai când rezolvă o problemă reală.

## Creștere organică, pe bune

Target X: [[narcis-commitments#x-1000-followers|1000+ urmăritori reali]]. Zero automatizare pe growth. Semnal > volum.

## Bias pentru acțiune

Gândirea are loc în execuție. Dacă am îndoieli, le rezolv prin shipping — nu prin încă o iterație de plan.

---

## Written offer > sales call *(adăugat 2026-04-24, confidence: medium)*

Adoptat după ingest-ul [[asset-creators-operator-playbook]]. Un document scris care pre-gestionează obiecțiile — nu un deck, nu un landing page, **un Google Doc** — devine asset-ul shareable. Yes-ul self-generated (buyer-ul decide la 11pm singur) scalează; yes-ul extras (discovery call) cere munca 10x per sale. Aplicabil la orice advisory/coaching/done-with-you offer Alteramens. Vezi [[google-doc-offer]] pentru pattern complet.

**Când NU se aplică:** B2B enterprise cu procurement formal. Pentru piețe SMB / creator economy / solopreneur, stance-ul ține.

## Client cap ca disciplină *(adăugat 2026-04-24, confidence: medium)*

Adoptat după ingest-ul [[asset-creators-operator-playbook]]. Dincolo de 5-6 clienți 1:1 activi, un solo operator devine angajat — pierde capacitatea de a răspunde în 4h și de a ship produse scalabile. Cap-ul nu e marketing (scarcity theater), ci **operational**. Implicația concretă: atunci când Narcis lansează un advisory offer, cap explicit de 3-5 slots, cu slot-uri deschise chiar și nevandute dacă fit-ul e greșit.

## No refunds ca filtru de cumpărător *(adăugat 2026-04-24, confidence: medium)*

Adoptat după ingest-ul [[asset-creators-operator-playbook]]. Premisa: refund policy **filtrează serious buyers** (serious people don't plan to fail) și **atrage buyer's remorse ca model de business**. Adoptare conservativă — aplicabil pentru offer-uri $500+ unde fit-ul e pre-filtrat prin [[google-doc-offer]]. Pentru micro offer ($49 template), politica standard de refund pe 14 zile rămâne acceptabilă (e e-commerce, nu advisory).

Edge cases (medical, familial, seller fail) se gestionează privat, nu sunt publicizate.

## Serviciile = distribuție, produsele = business *(adăugat 2026-04-24, confidence: medium)*

Adoptat după ingest-ul [[asset-creators-operator-playbook]]. Nu e contradicție cu [[productize-yourself]] — e **clarificare operațională**: coaching/advisory nu e destinația finală, e **mecanismul de învățare** care face posibilă productizarea ulterioară. Swipe Bank devine $97 template. Playbook intern devine $997 course. Clienții co-construiesc produsele.

Implicație pentru Alteramens: orice advisory offer pe care Narcis îl lansează **trebuie să fie proiectat explicit ca feedback loop pentru primul produs scalabil**, nu ca destinație.

## Compose skills pe niveluri *(adăugat 2026-04-27, confidence: medium)*

Adoptat după ingest-ul [[skill-graphs-2-heinrich]]. Operationalizare a stance-ului [[#judgment-encodat--funcționalitate-mecanică|judgment-over-functionality]] — nu e suficient ca un skill să encodeze judgment; **trebuie să declare la ce nivel îl encodează**. Un skill fără nivel = un skill fără contract de reliability.

Cele trei niveluri ([[heinrich]], [[atoms-molecules-compounds]]):
- **Atom** — primitive single-purpose, aproape determinist, no inter-skill calls
- **Molecule** — chain de 2-10 atoms cu instrucțiuni explicite when/how
- **Compound** — orchestrator multi-molecule cu autonomie reală

Implicație pentru `.claude/skills/`: fiecare SKILL.md ar trebui să declare `composition_level` în frontmatter. Skill-urile nemarcate sunt suspecte — fie n-au scope clar, fie maschează molecule ca atom, fie pretind compound dar fac doar molecule.

Filtrul Alteramens (peste heinrich): un compound merită construit doar dacă (1) encodează judgment Alteramens, nu generic, (2) reduce brain RAM-ul, nu doar înmulțește output, (3) e voice-aware, (4) e aliniat cu un pillar activ. Vezi [[faber-as-skill-graph]] și [[brain-ram-leverage]].

**Când NU se aplică:** scripts one-off care nu sunt skills (ex: un bash util în `scripts/`). Stance-ul vorbește despre skills agentic, nu cod în general.

## Open protocols > vendor APIs pentru personal-data infrastructure *(adăugat 2026-05-16, confidence: medium)*

Adoptat după ingest-ul [[personal-context-agent]]. Premisă strategică: pentru sisteme care țin *date personale* compounding (memory, context, identity model), protocolul public e *strategic*, nu opțional. Fără standard public, ești captiv într-un vendor — *„poate dezamăgești OpenAI Memories peste 6 luni, dar nu poți migra cu tine."*

Aplicabil concret la:
- [[personal-context-agent-project|Personal Context Agent]] adoptă [[mcp-protocol|MCP]] ca layer 1 distribution.
- Orice viitor sistem Alteramens care stochează date *despre user* (vs date despre lume — vezi [[executable-wiki|Faber pattern]]) trece prin protocol public.

**Când NU se aplică:** experimente interne, prototype-uri, sisteme one-shot. Stance-ul e despre infrastructură care se vrea durabilă și portabilă.

## Identity-first > notes-first storage *(adăugat 2026-05-16, confidence: medium)*

Adoptat după ingest-ul [[personal-context-agent]]. Pentru sisteme de context personal, primitivele de stocare trebuie să fie entități tipizate (Person, Role, Goal, State, Stance) — nu note din care identitatea se infera. Notes-first ([[mem-ai]], [[notion]], [[tana]], [[anytype]], [[logseq]]) face inferența probabilistă din content textual. Identity-first face inferența un SQL JOIN.

Implicație arhitecturală: schema înainte de UI. Decay și authority sunt câmpuri tipizate, nu cum se citește textul. Multi-tenancy e un `user_id`, nu o re-arhitecturare.

Vezi [[identity-first-storage]] pentru pattern-ul complet și [[twelve-layers-of-context]] pentru ontologie.

**Când NU se aplică:** notebook personal nestructurat ([[obsidian|Obsidian]] pentru drafturi, vault Alteramens). Identity-first e pentru *agent-readable user model*, nu pentru *human-writeable workspace*. Cele două coexistă — vezi [[inverted-polarity-sister-system]].

## Validate înainte de cod, pentru pariuri ambițioase *(adăugat 2026-05-16, confidence: medium)*

Adoptat după ingest-ul [[personal-context-agent]]. Calibrare critică pentru [[#bias-pentru-acțiune|bias-for-action]] și [[#shipping--perfecționare|shipping > perfection]] — *small bets ship fast; big bets validate first*.

Definiție pariu ambițios:
- Sistem cu protocol propriu (multi-agent, cross-vendor)
- Multi-tenant din ziua zero (schema decisions hard-to-reverse)
- Mobile-native (build cost mare, UI lock-in)
- Multi-luni de muncă, nu zile
- Categorie nouă (nu „yet another tool in known category")

Pentru astfel de pariuri: **5+ conversații cu utilizatori reali** înainte de prima linie de cod. Întrebări precum *„ce context regretezi că trebuie să-l reexplici la fiecare conversație? Ai plăti $X/lună ca să scapi de asta?"* trebuie să dea răspunsuri *înainte* ca arhitectura să fie locked in.

**Când NU se aplică:**
- Experimente / prototypes (build first, fail cheap)
- Skills și tools în domenii deja validate (CRO, SEO, content) — acolo bias-for-action rămâne neclintit
- Lucruri pe care le construiești pentru tine fără ambiție comercială (build whenever)

Stance-ul nu contrazice bias-for-action; îl scoate din pilot automat pentru cazurile unde reversal-ul ar costa luni de muncă.
