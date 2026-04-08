---
title: "AI Tutor Admitere — PRD Alpha v0.1"
project: ai-tutor-admitere
status: alpha-draft
version: 0.1
created: 2026-04-08
authors: [Narcis Brindusescu, Claude]
horizon: 18-24 luni (admitere iulie 2027)
working_brand: AIDIDACT (neratificat — vezi decisions.md Note 5a)
---

# AI Tutor Admitere — PRD Alpha v0.1

> **Ce este acest document.** O schiță inițială, opinionată, a produsului. Punct de plecare, nu specificație finală. Tot ce e marcat **[Propunere]** este o decizie de luat, nu o decizie luată. Tot ce e marcat **[Decis]** are deja referință în [[projects/ai-tutor-admitere/decisions|decisions.md]].
>
> **Ce nu este.** Nu e roadmap inginieresc, nu e wireframe, nu e document de marketing. E PRD-ul care răspunde la întrebarea "ce construim, pentru cine, de ce, cum arată produsul în mare".
>
> **Ancore în wiki.** Frame strategic complet în [[wiki/syntheses/ai-tutor-admitere-strategic-frame|Strategic Frame]]. Sesiunea originară în [[wiki/sources/brainstorm-ai-tutor-medicina|brainstorm 2026-04-07]]. Toate conceptele sunt linkate inline.

---

## 0. TL;DR

Construim un **agent de pregătire pentru admiterea la UMF Carol Davila București, cohorta 2027, biologie**. Produsul este un coach AI care deține curriculum-ul, schedule-ul și dialogul zilnic cu candidatul; **nu** un chatbot peste manual. Se vinde ca **bootcamp 600-900 EUR** pentru perioada de pregătire de 10 luni (toamna 2026 → iulie 2027), nu ca abonament SaaS. Moat-ul este **modelul psihometric longitudinal pe utilizator** + **judecata pedagogică encodată** în comportamentul agentului. Construim public, cu [[wiki/entities/mihai-brindusescu|Mihai]] ca user zero. Orizont 18-24 luni, decuplat de obiectivul Alteramens 1K MRR / 6 luni ([[projects/ai-tutor-admitere/decisions|Decizia 5]]).

---

## 1. Problema

**Părintele român al unui candidat la medicină plătește deja 5.000-10.000 EUR pe meditații pentru un an de pregătire.** Asta nu e o ipoteză — e piață validată, infrastructură veche, comportament default. Întrebarea nu e "există cerere", ci "ce face un produs care merită să stea în acel buget".

Ce nu funcționează în soluțiile actuale:

| Soluție curentă | Ce lipsește |
|---|---|
| Meditații 1-la-1 | Geografic limitat (Bucuresti-centric), scump, fără date longitudinale, fără accountability zilnic |
| Centre de excelență (vezi [[wiki/entities/centrul-excelenta-carol-davila\|Centrul de Excelență Carol Davila]]) | Cohort schedule, nu individual; geografic; trust ridicat dar nepersonalizat |
| Platforme content video (vezi [[wiki/entities/eduboom\|Eduboom]]) | Bibliotecă pasivă; învățarea rămâne în responsabilitatea elevului; nu detectează auto-amăgire |
| Chatbot LLM generic | Reactiv, fără memorie longitudinală, fără judecata pedagogică, fără calibrare; suficient de "bun" cât să dea iluzia de înțelegere, suficient de slab cât să strice rezultatul real |

Problema pe care o rezolvăm e una de **calibrare**, nu de informație. Materialul există ([[wiki/concepts/calibration-over-content|Calibration Over Content]]). Candidații avansați au acces la manual și la mii de grile. Ce nu au e un sistem care îi prinde mințind despre ce știu — și un coach care îi ține la program 10 luni fără să se piardă în zgomot.

---

## 2. Viziune (one-liner)

> **Coach-ul AI care duce un candidat la admitere până la usa amfiteatrului din UMF Carol Davila — zi de zi, cu calibrare onestă, transparență pentru părinte, și suficientă judecată pedagogică încât rezultatul să nu depindă de cât de "deștept e modelul" în sine.**

---

## 3. Wedge & non-goals

### 3.1 Wedge [Decis — vezi [[projects/ai-tutor-admitere/decisions|Decizia 1]]]

- **Universitate:** UMF Carol Davila București
- **Specializare:** Medicină generală (admiterea la dentar/farmacie poate refolosi 80% din content; nu acum)
- **Materie:** **Biologie** (subiectul cu volum de content cel mai mare; chimia vine la layer 2 al compounding game)
- **Cohortă:** Admitere iulie 2027 (timeline activ: octombrie 2026 → iulie 2027)
- **Limbă:** Română
- **Scope content:** Manual de Biologie XI-XII (programa actuală pentru Carol Davila) + **barem oficial Carol Davila** + bancă internă de grile generate/curated în jurul acestor surse

Această alegere trece toate testele [[wiki/concepts/bounded-problem-wedge|Bounded Problem Wedge]]: cumpărător numit, deadline real, alternativă validată cu preț cunoscut, content finit, outcome binar.

### 3.2 Non-goals (alpha)

Lucrurile pe care **NU** le facem în prima versiune, deși par tentante:

1. **NU "platformă de învățare personalizată" generală.** Nici matematică, nici fizică, nici limba română. Wedge-ul moare dacă diluăm.
2. **NU alte universități de medicină** în alpha. Cluj/Iași/Timișoara/Tg Mureș vin la layer 2 al [[wiki/concepts/compounding-games|compounding game]]-ului.
3. **NU pregătire pentru licee internaționale / IB / SAT / etc.** Cohortă greșită, alt buyer, alt buget.
4. **NU "ChatGPT pentru biologie".** Anti-pattern explicit ([[wiki/concepts/agentic-curriculum|Agentic Curriculum — Anti-Pattern]]).
5. **NU abonament lunar fără capăt.** Bootcamp pricing ([[wiki/concepts/bootcamp-pricing|Bootcamp Pricing]]).
6. **NU adaptare către "lifelong learners" sau "upskilling profesional".** Cohortă greșită; pierdem dead-line, parent buyer, alternativa validată.
7. **NU un produs care merge bine fără mecanisme de calibrare.** Dacă în primele 4 săptămâni nu prinde elevul mințind, l-am construit greșit.

---

## 4. Audiență & roluri

Trei tipuri de utilizatori cu interfețe distincte:

### 4.1 Candidat (utilizator primar)

- 17-19 ani
- Elev de clasa a XII-a sau "an pierdut" pentru pregătire
- Folosește produsul **zilnic, 60-120 min**, timp de 8-10 luni
- Prima interacțiune: standup-ul de dimineață al agentului
- Vrea: să intre. Nu vrea: să fie umilit, să fie plictisit, să simtă că pierde timpul.

### 4.2 Părinte (cumpărător & sponsor)

- 40-55 ani
- Plătește integral pachetul
- Nu folosește produsul direct; folosește **dashboard-ul de părinte** săptămânal (sau când e îngrijorat)
- Prima interacțiune: pagina de pricing + landing-ul de "build-in-public"
- Vrea: să știe că banii lui produc rezultat; să poată dormi noaptea
- Sensibilitate cheie: **nu vrea suprasăturare; nu vrea micromanagement**

### 4.3 Validator pedagogic (rol intern, nu utilizator) [Decis — Decizia 4]

- Student UMF (an III+) plătit ~500 lei/lună (de confirmat)
- Validează corectitudinea explicațiilor generate de agent pe răspunsurile la grile
- SLA: răspuns la review în <48h pentru content nou
- Open: contract format, recruitment, scaling

---

## 5. Frame strategic (rezumat — pentru detaliu vezi wiki)

Produsul e un stack de 5 layere ([[wiki/syntheses/ai-tutor-admitere-strategic-frame|Strategic Frame]]). PRD-ul ăsta se ocupă în principal de **Layer 2 (Mecanism)** și **Layer 3 (Pricing)**, pentru că sunt layerele cu cea mai mare incertitudine de execuție. Layer 1 (Wedge), Layer 4 (Authenticity) și Layer 5 (Compounding) sunt deja decise sau doar parțial deschise.

```
Layer 5: Compounding   → Carol Davila biologie 2027 → +chimie → +alte UMF → ... → USMLE/MIR
Layer 4: Authenticity  → Build-in-public, Mihai user-zero, Narcis named founder
Layer 3: Pricing       → Bootcamp 600-900 EUR / pachet, înlocuiește meditațiile
Layer 2: Mechanism     → Agent + longitudinal model + calibrare + reverse-time plan
Layer 1: Wedge         → UMF Carol Davila București, biologie, cohorta 2027, RO
```

---

## 6. Mecanism (cum funcționează produsul)

Patru sub-mecanisme care se compun. **Niciunul nu funcționează singur.**

### 6.1 Reverse-Time Curriculum Engine ([[wiki/concepts/reverse-time-planning|concept]])

- **Input:** data exactă a admiterii (~iulie 2027, exact când e publicat de UMF), inventarul complet de concepte din manualul XI-XII, baremul Carol Davila ca filtru de relevanță, starea inițială a candidatului (din diagnostic baseline)
- **Output:** o planificare per-elev, cu data țintă de "mastery" pentru fiecare concept, dependențele dintre ele, și buffer de revision înainte de exam
- **Reguli:** scope honesty — dacă inventarul nu încape în timp, planul **arată explicit ce se taie**. Nu pretinde că totul încape.

### 6.2 Longitudinal User Model ([[wiki/concepts/longitudinal-user-model|concept]])

Storage activ și interpretat al comportamentului per-elev. Capturăm:

- **Latency per întrebare** (răspuns rapid + corect ≠ răspuns lent + corect)
- **Confidence calibration** (Brier score: gap-ul dintre încredere declarată și acuratețe reală)
- **Forgetting curve personală** per topic
- **Failure pattern signatures** (ex: confundă sistematic cromozomi cu cromatide)
- **Time-of-day retention** (când reține, când doar simte că reține)
- **Click metaphors** (ce analogie a făcut un concept să "clicheze")
- **Free-text explanation quality** (când i se cere să explice "de ce")

**Important:** modelul **nu** e doar log-ul. Modelul e **interpretarea log-ului**, care e [[wiki/concepts/encoded-judgment|judecată pedagogică encodată]] (vezi §8 mai jos).

### 6.3 Calibration Engine ([[wiki/concepts/calibration-over-content|concept]])

Mecanismele care fac auto-amăgirea mai grea. Pentru alpha, propunem:

| Mecanism | Implementare alpha | Sursă |
|---|---|---|
| Confidence-weighted scoring | Înainte de fiecare grilă: slider 0-100% încredere; Brier score afișat săptămânal | calibration-over-content §1 |
| Forced explanation | 1 din 5 răspunsuri corecte: "explică în 2-3 propoziții de ce e răspunsul corect" → auto-grading + sample manual review | calibration-over-content §2 |
| Interleaved practice | Sesiunile zilnice mixează 2-3 topice; nu sunt block-practice pe un capitol | calibration-over-content §3 |
| Spaced repetition tied to deadline | Intervalele recalculate săptămânal cu data examenului ca anchor, nu SM-2 generic | calibration-over-content §4 |
| Latency tracking | Răspunsuri corecte cu latency anormal mare/mică = "fragile", retest în 24-72h | calibration-over-content §5 |
| Adversarial confusables | Pentru concepte fragile, următoarea grilă folosește un distractor near-miss specific tipului de eroare al elevului | calibration-over-content §6 |

### 6.4 Agent Loop ([[wiki/concepts/agentic-curriculum|concept]])

Buclă proactivă, **nu** chat reactiv. Comportament zilnic:

1. **07:30 (sau ora setată) — Standup automat:** mesaj cu diagnoza zilei trecute, planul zilei curente, prioritatea săptămânii, distanța față de target, timpul rămas până la examen.
2. **Daytime — Sesiuni de practică:** elevul deschide app → agentul a setat deja sesiunea; nu e o căutare în meniu, e "Începe sesiunea de azi (47 min)".
3. **End-of-day — Closeout:** raport scurt al zilei, ce s-a învățat, ce a fost amânat, ce vine mâine. Trimis și în dashboard părinte.
4. **Weekly — Recalibration pass:** modelul reinterpretează datele, reverse plan-ul se ajustează, dependențele se reașează, eventual se taie scope.
5. **Monthly — Escalation review:** dacă trajectory < target, agentul flagează — către elev cu un mesaj direct, către părinte cu un context honest în dashboard.

**Regula de aur:** agentul deține schedule-ul. Elevul poate să-l overrideze, dar overrideul e un act conștient, nu default-ul. Default-ul e "fă ce a setat agentul azi".

---

## 7. Surface-ul produsului — module

Six module, cu dependențe explicite:

```
                     ┌──────────────────────┐
                     │ Reverse Plan Engine  │
                     └───────────┬──────────┘
                                 │
       ┌─────────────────────────┼───────────────────────┐
       ▼                         ▼                       ▼
┌─────────────┐        ┌──────────────────┐    ┌──────────────────┐
│ Practice    │◀──────▶│  Longitudinal    │───▶│  Agent Loop      │
│ Engine      │        │  User Model      │    │  (standup +      │
│ (calibration│        │                  │    │   daytime +      │
│  mechanics) │        └──────────────────┘    │   closeout)      │
└──────┬──────┘                 ▲              └────────┬─────────┘
       │                        │                       │
       ▼                        │                       ▼
┌─────────────┐                 │              ┌──────────────────┐
│ Content /   │                 └──────────────│  Parent          │
│ Manual UI   │                                │  Dashboard       │
└─────────────┘                                └──────────────────┘
```

### 7.1 Reverse Plan Engine

- **Ce face:** generează și menține planul personal per-elev, ancorat în data examenului
- **Inputs:** data exam, inventar concepte, baseline diagnostic, weekly recalibration din longitudinal model
- **Outputs:** mastery date per concept, trajectory curve, "what's being dropped" report
- **Acceptance criteria:**
  - planul re-rulează în <2s la recalibration
  - când scope nu încape, output-ul include lista explicită de concepte amânate/tăiate
  - planul e citibil de un om (nu doar de agent) și poate fi exportat ca PDF pentru părinte

### 7.2 Practice Engine

- **Ce face:** pune întrebări, încasează răspunsuri, aplică mecanismele de calibrare
- **Inputs:** următorul concept din planul zilei + state din longitudinal model + bancă de grile
- **Outputs:** răspuns corect/incorect cu explicație, signal-uri în longitudinal model (latency, confidence error, etc.), update la mastery score
- **Mecanisme obligatorii pentru alpha:** confidence slider, latency tracking, occasional forced explanation, spaced repetition. Adversarial confusables = stretch goal.
- **Acceptance criteria:**
  - fiecare răspuns produce minim 4 semnale în model (corect/incorect, latency, confidence error, fragility flag)
  - explicațiile răspunsurilor sunt validate de [Decis] reviewer UMF înainte să fie servite
  - elevul nu poate sări "explică de ce" prompt-ul când e cerut (fără cheating ușor)

### 7.3 Longitudinal User Model

- **Ce face:** stochează istoricul, calculează agregatele, expune interpretări către agent
- **Storage:** structurat (nu doar log JSON); per-elev separat
- **Interpretation rules:** [Propunere] versionate ca cod, nu ca prompt; minim 12 reguli identificabile pe care le putem testa și itera
- **Acceptance criteria:**
  - după 14 zile de uz, modelul produce minim 5 "insights" interpretabile despre elev (ex: "perfomează cu 18% mai bine la genetică decât la circulator", "confidence-ul e systematically overconfident pe respirator")
  - exportul modelului per-elev e human-readable
  - regulile de interpretare au teste (nu doar intuiție)

### 7.4 Agent Loop

- **Ce face:** orchestrarea zilnică (standup, daytime, closeout), escalări, narrative
- **Stack:** [Propunere] LLM (Claude Opus/Sonnet via API) + tool calls în Reverse Plan + Practice + Model + Dashboard
- **Behavior policies:** encoded ca skill files / system prompt versionat, **nu** improvizate per sesiune
- **Acceptance criteria:**
  - standup-ul de dimineață e generat zilnic, conține diagnoză + plan + prioritate + countdown + ton calibrat
  - escalation thresholds sunt explicite (când alertează părintele, când nu)
  - toate output-urile către elev sunt logate pentru review

### 7.5 Content / Manual UI

- **Ce face:** acces la manualul de biologie XI-XII + barem + explicații; nu e "feature principal", e infrastructură
- **Vezi §9 pentru content scope**
- **Acceptance criteria:**
  - elevul poate căuta concept și ajunge la pasajul relevant din manual
  - fiecare grilă are link înapoi la pagina de manual sursă
  - când explicația agentului contrazice manualul, e flagged automat pentru review

### 7.6 Parent Dashboard

- **Ce face:** raport săptămânal pentru părinte; vizibilitate la trajectory; alerts când e cazul
- **Cheia pedagogică:** cât mai puțin micromanagement, cât mai multă claritate
- **Acceptance criteria:**
  - părintele primește 1 raport/săptămână (e-mail sau în-app), nu 7
  - raportul răspunde la 3 întrebări: "e pe drum?", "ce a făcut săptămâna asta?", "ar trebui să fac ceva?"
  - dashboardul **nu** afișează detaliile psihometrice ale elevului (ar fi surveillance) — afișează agregate și narrative
  - alert-urile de escaladare sunt rare (target: <1/lună la o trajectory sănătoasă)

---

## 8. Principii pedagogice (judecata encodată)

Lucrurile care trebuie să rămână adevărate **chiar dacă LLM-ul de dedesubt se schimbă**. Astea sunt [[wiki/concepts/encoded-judgment|encoded judgment]], nu features.

1. **Recognition is not recall.** Nu acceptăm "am citit, am înțeles" ca proxy pentru "știu". Mecanisme de calibrare obligatorii.
2. **Skipping is the signal.** Topicele evitate sunt exact topicele de lucrat. Agentul trebuie să detecteze evitarea.
3. **The deadline is the compass.** Toate deciziile zilnice se justifică prin referire la data examenului. Fără reverse plan → fără justificare → chatbot.
4. **Discomfort > comfort în zona de calibrare.** Dacă produsul "se simte plăcut" tot timpul, e un semn că nu calibrează. Acceptăm prietenește critica directă.
5. **The agent owns the schedule, the elev owns the effort.** Agentul nu acceptă "amânare nemotivată"; elevul nu acceptă să fie tratat ca un robot.
6. **Părintele primește narrativă, nu surveillance.** Nu există "vezi ce a făcut acum" în dashboard. Există "iată cum stă săptămâna asta și de ce".
7. **Honesty over hype.** Trajectory raportat onest, fie e bun, fie nu. Mai bun să pierdem un client la timp decât să-l pierdem la rezultat.
8. **Validare medicală obligatorie pentru content.** Niciun răspuns generat de agent nu ajunge la elev fără să fi trecut printr-o cale validată — fie revizuită de reviewer UMF, fie marcată explicit ca "AI-generated, neverificat".

---

## 9. Content scope (alpha)

Aceasta e cea mai grea piesă de execuție din proiect. Conținutul nu se reutilizează în compounding game ([[wiki/syntheses/ai-tutor-admitere-strategic-frame|strategic frame Layer 5]]).

### 9.1 Surse oficiale

| Sursă | Status alpha | Notes |
|---|---|---|
| Manual de Biologie clasa XI (Corint sau editura curentă pe programă) | **Necesar — must have** | Text + diagrame; ~280 pagini |
| Manual de Biologie clasa XII | **Necesar — must have** | Text + diagrame; ~250 pagini |
| Barem oficial Carol Davila (varianta cea mai recentă publicată) | **Necesar — must have** | Definește scope-ul de detaliu |
| Variante anterioare admitere Carol Davila (5-10 ani) | **Highly recommended** | Pentru calibrare la stilul real al examenului |
| Oficial syllabus / programa MEN curentă | Important | Pentru a justifica decupajul față de manual |

### 9.2 Bancă de grile

- **Target alpha:** ~2.000 grile de calitate, validate pedagogic
- **Surse:** (a) variante anterioare digitalizate, (b) grile generate de LLM și revizuite de reviewer UMF, (c) eventual licențiere externă dacă e accesibilă
- **Metadata per grilă:** topic, concept(e), difficulty estimate, time-to-solve estimate, dependencies, sursă, status validare
- **Open:** dacă grilele oficiale au restricții de copyright relevante pentru folosirea în produs comercial. **Verificare juridică înainte de v1.**

### 9.3 Pipeline de validare content

```
Concept identificat în plan
   ↓
LLM generează explicație candidat
   ↓
Auto-checks (consistency, length, structural)
   ↓
Reviewer UMF în queue (SLA <48h)
   ↓
Aprobat → servit elevului
Respins → înapoi la generare cu feedback
```

[Propunere] Build-in pentru queue-ul de review din ziua 1. Fără el, content-ul AI se acumulează nevalidat și produsul devine riscant pentru rezultatul real.

---

## 10. Pricing & business model

### 10.1 Pricing alpha [Propunere — necesită testare]

Conform [[wiki/concepts/bootcamp-pricing|Bootcamp Pricing]] și frame layer 3:

- **Pachet standard:** 700 EUR pentru cei 10 luni de pregătire (octombrie 2026 → iulie 2027), plătit în 2 tranșe (350 + 350)
- **Pachet success-fee (variantă optionala):** 400 EUR upfront + 400 EUR la admitere în top 600
- **Early bird (cohorta pilot autumn 2026):** 500 EUR fixed, cu commitment explicit la build-in-public
- **Free for Mihai și ~5 candidați-pilot** care acceptă să fie case studies

### 10.2 Validare pricing înainte de build-out [Propunere]

[[wiki/concepts/validate-before-build|Validate Before Build]] aplicat la pricing:
- Țintă: **5+ părinți** care confirmă că ar plăti 700 EUR înainte ca produsul să existe peste un MVP minimal
- Format: conversații 30-45 min, ofertă verbală, întrebare directă "ai plăti asta în august 2026?"
- **Dacă <3/5 spun da → re-evaluăm pricing-ul, nu produsul**

### 10.3 Cliff economics

[[wiki/concepts/bootcamp-pricing|Bootcamp pricing]] = revenue concentrat în fereastra de înscrieri (iulie-octombrie). Cash flow planning pentru 2026-2027 trebuie să respecte cliff-ul. Asta nu e SaaS ARR liniar.

### 10.4 LLM cost economics [Open — Decizia 6 propusă]

- Estimare brută: ~10 luni × ~60 min/zi × API calls = nontrivial cost per elev
- [Propunere model 1:] cost LLM inclus în pachet, monitorizat per cohortă; dacă depășește buget, optimizăm prompt engineering / caching / model tier
- [Propunere model 2:] credit-based, vizibil elevului
- **Recomandare alpha:** model 1 (inclus) — simplitate pentru părinte, cost ca buget, monitorizat intern
- **Decizie de luat:** care provider (Anthropic Claude Sonnet vs Opus vs mix), self-hosted local vs cloud

---

## 11. Tehnologie — sketch arhitectural

⚠ **Aceasta e cea mai puțin definitivată secțiune.** Vezi §16 (open decisions). PRD-ul nu prescrie stack-ul, doar cere ca alegerea stack-ului să respecte câteva proprietăți obligatorii.

### 11.1 Proprietăți obligatorii ale stack-ului

1. **Persistență per-elev sigură.** Modelul longitudinal e moat-ul; nu pierdem date.
2. **LLM-agnostic la nivel de business logic.** Poate trebuie să schimbăm provider-ul la 6 luni; nu rescriem produsul.
3. **Encoded judgment în cod, nu doar în prompts.** Regulile de interpretare a modelului = funcții testate, nu doar instrucțiuni text.
4. **Reproducibility la decizii agent.** Pentru orice decizie a agentului din ultimele 30 zile, putem reconstrui de ce a luat-o.
5. **Privacy first.** Datele Mihai și ale celorlalți elevi nu părăsesc infrastructura noastră fără consimțământ explicit.

### 11.2 Componente [Propunere — schiță]

| Componentă | Tech proposal alpha | Rationale |
|---|---|---|
| Backend / API | Python (FastAPI) sau TypeScript (Node) | Mature LLM tooling, simple deploy |
| Storage | Postgres + pgvector pentru RAG content; structured tables pentru longitudinal model | Familiar, reliable, queryable |
| LLM provider | Anthropic Claude Sonnet/Opus via API | [[wiki/concepts/encoded-judgment\|judgment-friendly]], skills layer disponibil |
| Frontend candidat | Web (React / Next.js) | Cross-device, no install friction; reconsider Electron post-MVP dacă offline e load-bearing |
| Frontend părinte | Same web app, role-gated | Simplitate; e-mail săptămânal ca primary channel |
| Auth | Email magic link sau passkey, SRL legal owner separat de Alteramens | Părinții nu vor parole complicate |
| Observability | Logs structurate + traces per agent decision | Pentru property #4 |

### 11.3 Build-vs-buy

- **Build:** longitudinal model, calibration mechanics, agent loop, reverse plan engine, content review pipeline
- **Buy/use:** LLM API, auth provider, payment provider (Stripe + suport facturare RO), e-mail/transactional, hosting
- **Open:** spaced repetition — folosim un library (ex: ts-fsrs) sau scriem ce avem nevoie?

---

## 12. Metrici de succes

Patru niveluri de metrici, cu praguri diferite de relevanță:

### 12.1 Metrici "produsul trăiește" (alpha — autumn 2026)

- ≥1 elev (Mihai) folosește produsul zilnic ≥5 zile/săptămână timp de ≥4 săptămâni consecutiv
- Daily standup generated în <30s (latency budget)
- Reviewer UMF prinde <5% rate de erori în content servit (target inițial)
- Modelul longitudinal acumulează minim 200 semnale/elev după 4 săptămâni
- Niciun bug pierdere date

### 12.2 Metrici "produsul învață" (winter 2026 → spring 2027)

- Mihai rezolvă grile baseline cu acuratețe în creștere statistic semnificativă peste timp
- Brier score (calibration) îmbunătățit cu ≥20% față de baseline
- Agent decisions justificabile post-hoc în ≥90% din cazuri (review intern)
- ≥3 cazuri în care agentul a detectat o problemă pe care elevul nu o conștientiza

### 12.3 Metrici "piața răspunde" (winter 2026 → summer 2027)

- ≥5 părinți confirmă verbal pricing-ul înainte de octombrie 2026
- ≥3 elevi pilot înrolați pentru cohorta 2027 (alături de Mihai)
- ≥1 cohort plătitor pentru 2027 (chiar și 5 elevi e succes la nivelul ăsta)
- Build-in-public produce minim 1 conversie atribuibilă (părinte care a venit din narativă)

### 12.4 Metric primar (single number)

- **Iulie 2027: rezultatul admiterii lui Mihai și al cohortei pilot.** Onest. Bun sau rău. Asta e proof point-ul. Tot restul e proxy.

---

## 13. Build-in-public plan (rezumat)

Detaliile reale rămân la decizia lui Narcis ([[projects/ai-tutor-admitere/decisions|Open: channel mix]]). Scheletul:

- **Cadență:** minim 1 update săptămânal (newsletter sau LinkedIn)
- **Tone:** founder-as-father, dar cu identitate de "founder" ([[projects/ai-tutor-admitere/decisions|Decizia 2]])
- **Privacy:** datele lui Mihai sanitizate înainte de orice publicare; consimțământul explicit per post sensibil
- **Honest reckoning rule:** dacă într-o săptămână s-a stricat ceva, se publică. Dacă în iulie 2027 rezultatul nu e bun, se publică.
- **Channels prioritate:** newsletter RO + LinkedIn RO ([[wiki/concepts/building-in-public|Building in Public]])
- **Anti-pattern:** transformarea în surveillance content. Mihai nu e mascotă, e user zero.

---

## 14. Riscuri & mitigări

| Risc | Probabilitate | Impact | Mitigare |
|---|---|---|---|
| Content generat de AI conține erori medicale | Înaltă | Foarte mare (rupe trustul iremediabil) | Reviewer UMF obligatoriu înainte de servire; flag automat când AI contrazice manual |
| Mihai pierde motivația după 3-4 luni | Moderată | Mare (proof point dispare) | Agent loop cu motivational scaffolding; check-in părinte (Narcis) ca human-in-the-loop; nu pretindem că AI rezolvă moral hazard |
| Părinții nu plătesc 700 EUR pentru ceva nou | Moderată | Mare | Validate-before-build cu 5+ conversații înainte de polish; early-bird 500 EUR pilot cohort |
| LLM cost depășește buget per elev | Moderată | Mediu | Monitoring per-cohort; caching agresiv; fallback la model tier mai mic pentru sarcini non-critice |
| Restricții copyright pe variante / barem oficial | Moderată | Mediu | Verificare juridică înainte de v1; backup plan: grile generate + validate, nu copiate |
| Reviewer UMF abandonează / SLA | Moderată | Mediu | Recrutare 2 reviewers din start, nu unul; contract clar; dependență minimă pe un singur om |
| Build-in-public devine surveillance content | Joasă | Mare reputational | Reguli de privacy explicite (§13); review pre-publish cu Mihai |
| Centrul de Excelență CD reacționează agresiv | Joasă | Mediu | Poziționare ca "complementary, not replacement" ([[wiki/entities/centrul-excelenta-carol-davila\|trust ceiling, nu demolish]]) |
| Eduboom pivotează la calibrare + agent | Joasă | Mediu | Moat-ul nostru e [[wiki/concepts/data-compounding-moat\|longitudinal data]] + authenticity, nu features replicabile |
| Mihai nu intră în 2027 | Există | Foarte mare emoțional, mediu strategic | Honest reckoning publică; case study-ul devine "ce am învățat", nu "promit altora ce nu am livrat copilului meu" |

---

## 15. Roadmap propus (alpha → MVP → cohort 1)

> Toate datele sunt **propuneri**, nu commitments. Decuplate de obiectivul 1K MRR / 6 luni ([[projects/ai-tutor-admitere/decisions|Decizia 5]]).

### Faza 0 — Anchor & validate (acum → mai 2026)

- ✅ Brainstorm & strategic frame (gata, în wiki)
- ✅ Decision log seedat ([[projects/ai-tutor-admitere/decisions|decisions.md]])
- ✅ PRD alpha v0.1 (acest document)
- 🔲 Brand ratificat (AIDIDACT sau alternativa) — domain check, trademark check, search hygiene
- 🔲 Legal entity decis (SRL nou vs sub-brand)
- 🔲 5 conversații cu părinți pentru validare pricing
- 🔲 Reviewer UMF identificat și aliniat
- 🔲 Licențe / juridic content

### Faza 1 — MVP intern (iunie → septembrie 2026)

- 🔲 Reverse plan engine cu inventarul complet de concepte
- 🔲 Practice engine cu confidence scoring + latency tracking + spaced repetition
- 🔲 Longitudinal model + 12 reguli de interpretare versionate
- 🔲 Agent loop cu daily standup + closeout (parent dashboard săptămânal)
- 🔲 Content pipeline: 500 grile validate, manual XI integrat
- 🔲 Mihai folosește produsul 4 săptămâni consecutiv
- **Gate Faza 1 → Faza 2:** Mihai folosește, modelul învață, daily standup e útil. Dacă nu, reluăm.

### Faza 2 — Cohort pilot (octombrie 2026 → decembrie 2026)

- 🔲 3-5 elevi pilot înrolați (Mihai + ~4)
- 🔲 Manual XII integrat
- 🔲 1.500 grile validate (cumulat 2.000)
- 🔲 Adversarial confusables implementate
- 🔲 Build-in-public cadență stabilă
- **Gate Faza 2 → Faza 3:** retention >80% după 8 săptămâni, signal pozitiv în calibrare, ≥3 părinți recommend produsul

### Faza 3 — Cohort 2027 plătitor (ianuarie 2027 → iulie 2027)

- 🔲 Înrolare cohorta 2027 plătitoare (target: 5-30 elevi)
- 🔲 Reverse plan rulează pentru cohorta întreagă, individualizat
- 🔲 Parent dashboard la maturitate
- 🔲 Honest weekly transparency reports public
- **Outcome iulie 2027:** rezultatele admiterii. Single source of truth.

### Faza 4 — Compound (post iulie 2027)

Doar dacă faza 3 a confirmat ipoteza:
- Adăugat chimie (al doilea subiect Carol Davila)
- Adăugat alte UMF Romania
- Refactor pentru content pluggable
- ([[wiki/syntheses/ai-tutor-admitere-strategic-frame|strategic frame Layer 5]])

---

## 16. Decizii deschise (mirror la decisions.md, plus noi)

Carry-over din [[projects/ai-tutor-admitere/decisions|decisions.md §Open]]:

- **Brand** — AIDIDACT propus, neratificat
- **Legal entity** — SRL nou vs sub-brand
- **LLM cost model** — credit vs included
- **MVP scope detaliat** — partial schițat în §15 Faza 1, dar cere ratificare
- **Build-in-public channel mix**
- **Pricing experiment plan** — 5+ părinți înainte de build
- **Local (Electron) vs web** — recomandare alpha: web, dar deschis
- **Portfolio question 1K MRR** — separat, la nivel Alteramens

Noi, propuse de PRD:

- **Stack tehnic concret** (§11) — alegerea provider, framework, storage; deadline ratificare: înainte de Faza 1
- **Reviewer UMF — recrutare formală** — contract format, SLA, plata, eventual al doilea reviewer
- **Content licensing strategy** — clarificare juridică pentru bareme și variante oficiale
- **Cohort 2026 pilot recruitment plan** — cum identificăm cei 4 elevi non-Mihai, ce le promitem, ce semnează
- **Privacy & data policy formal** — GDPR + minor consent (Mihai e minor în momentul utilizării)
- **Spaced repetition library vs in-house** — small but real
- **Definiția exactă a "mastery" per concept** — pragul numeric
- **Threshold-uri escalare către părinte** — pragul de "alarmează" vs "aici e încă ok"

---

## 17. Anexă A — Daily standup pattern (referință)

Pentru claritate, exemplu concret de output din agent loop, copiat din [[wiki/concepts/agentic-curriculum|Agentic Curriculum]]:

```
07:30 — Bună Mihai. Yesterday you missed 3 questions on alveolar
gas exchange. Today: 15 min focused review on gas diffusion, then
we move to circulator system. This week you are below baseline on
genetics-problems — Friday I am reserving 90 min for that. T-minus
287 days. You are tracking percentile 78. Target: 90. Let's accelerate.
```

Observăm 5 elemente obligatorii: **diagnosis, plan, weekly priority, calibration vs target, tone**. Dacă un standup nu le conține pe toate 5, e bug, nu feature.

---

## 18. Anexă B — Ce nu acoperă alpha-ul ăsta

Lista onestă a lucrurilor care **trebuie** rezolvate dar care nu intră în scope-ul acestui PRD alpha:

- Wireframes / UX detaliat (vine după ratificarea modelelor)
- Schema completă a longitudinal model-ului (vine cu prima implementare)
- Specificația exhaustivă a celor 12 reguli de interpretare
- Marketing copy / landing page
- Strategia de PR / lansare
- Acorduri cu Centrul de Excelență sau alte instituții
- Plan de scalare către alte UMF (intentionally — fac parte din [[wiki/concepts/compounding-games|compounding game]] post-2027)
- Strategia post-admitere (ce se întâmplă cu modelul longitudinal după ce elevul a intrat / nu a intrat)

---

## 19. Schimbări față de brainstorm (ce e nou aici)

Acest PRD adaugă față de [[wiki/sources/brainstorm-ai-tutor-medicina|brainstorm 2026-04-07]] și [[wiki/syntheses/ai-tutor-admitere-strategic-frame|strategic frame]]:

1. Decuparea concretă în 6 module (§7) cu acceptance criteria
2. MVP cut propus pentru autumn 2026 (§15 Faza 1) — răspunde la o open question din decisions.md
3. Metrici de succes pe 4 niveluri (§12), nu doar "Mihai admis"
4. Pipeline de validare content explicit (§9.3)
5. Sketch arhitectural cu **proprietăți obligatorii**, nu cu stack prescriptiv (§11)
6. Roadmap cu gate-uri între faze (§15)
7. Decizii noi propuse pentru decisions.md (§16, partea inferioară)
8. Anti-features explicite (§3.2)
9. Risk register format tabel cu mitigări (§14)

---

## 20. Status & next actions

**Status:** alpha v0.1, draft pentru review intern.

**Next actions propuse — by Narcis:**

1. **Citește, atacă, marchează ce nu e adevărat.** PRD-ul ăsta vrea să fie contestat, nu aprobat tăcut.
2. **Prioritizează cele 8 decizii deschise noi din §16** și mută cele top-3 în [[projects/ai-tutor-admitere/decisions|decisions.md]] în următoarele 2 săptămâni.
3. **Începe validarea pricing-ului** — 5 părinți, 700 EUR întrebare directă, înainte de orice cod.
4. **Brand ratificat sau respins** — AIDIDACT moare sau trăiește.
5. **Reviewer UMF identificat** — primul nume real, pentru a deschide pipeline-ul de content.

**Next actions propuse — by Claude (în următoarea sesiune #spec sau #build):**

- Detaliază prima dintre cele 12 reguli de interpretare a longitudinal model-ului ca exemplu
- Wireframe-text pentru standup-ul de dimineață (UI-spec, nu doar pattern)
- Proposal pentru schema Postgres a longitudinal model-ului (după ratificare stack)

---

> **Versiune:** 0.1 alpha | **Următoarea revizuire:** după validarea pricing-ului (5 conversații părinți) sau după ratificarea brandului. Whichever comes first.
