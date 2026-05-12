---
title: "Kanwas — juxtapunere brută peste Faber"
type: draft
status: raw
tags:
  - faber
  - competition
  - distribution
  - saas
  - research
date: 2026-05-08
related:
  - "[[wiki/syntheses/kanwas-vs-faber-analysis]]"
  - "[[workshop/drafts/faber-framework-vision]]"
  - "[[wiki/FABER]]"
---

# Kanwas — juxtapunere brută peste Faber

> Sinteza curată a fost filed la [[wiki/syntheses/kanwas-vs-faber-analysis]]. Asta e versiunea de gândire brută — pentru iterare, nu pentru queryare.

## TL;DR în 3 propoziții

1. **Kanwas operează pe aceeași teză ca Faber** ("contextul partajat = moat, nu modelul"), dar rezolvă problema echipelor de produs (canvas multiplayer + agent stream), nu a individualului.
2. **Diferențiatorul tău (self-as-data + confruntare) nu există în Kanwas** și e structural greu de adăugat — fereastră estimată 6-12 luni înainte să fie copiat.
3. **Slăbiciunea ta declarată (amânarea publicării) tocmai s-a confirmat empiric**: ei au deschis repo pe 22 apr (a doua zi după ce tu ai blocat viziunea), au strâns 543 stars în 16 zile, tu ai zero artefacte publice.

## Ce am aflat despre Kanwas (date dure)

- Repo public: `github.com/kanwas-ai/kanwas`, **Apache 2.0**
- Creat: **2026-04-22** (acum 16 zile)
- **543 stars / 75 forks / 49 subscribers / 4 issues open**
- Topics: `agents, canvas, collaboration, context-management`
- Stack: TypeScript monorepo, BlockNote, AdonisJS, **Yjs (CRDT)**, Docker, pnpm
- Componente: `frontend/`, `backend/`, `cli/` (`@kanwas/cli` pe npm), `yjs-server/`, `execenv/` (sandbox agenți), `shared/`, `docs/SYSTEM_OVERVIEW.md`
- Hosted: kanwas.ai (free signup)
- Customer logos vizibile: Veed, Wix, Softpay, TheFork, Grammarly, Quanos
- Testimonial: Schematik închide €4.6M pre-seed cu pitch deck Kanwas

## Identitatea taglinelor

- "Your team's context brain"
- "Sharing docs is so 2025. Sharing context is the future"
- "Not just answers. Not just outputs. Not starting from scratch"
- "AI can build anything. The hard part was never building"

Practic vând **exact** teza ta meta. Diferența e cui o vând: ei = echipe de produs. Tu = individual builder.

## Ce trebuie să admit

Kanwas a făcut public ceea ce tu ții în drafts. Pe 22 apr 2026. Tu ai blocat viziunea pe 23 apr 2026. **A doua zi.** Asta înseamnă două lucruri:

1. **Teza e validă** — alți operatori serioși o construiesc *acum*, în paralel
2. **Costul amânării e măsurabil** — ei au 543 stars de social proof; tu nu ai nimic public

Pentru cineva care a declarat `postpone-publishing` ca slăbiciune principală în `narcis-stances`, asta e empirical confirmation, nu speculation.

## Unde Faber chiar are moat (lucruri pe care Kanwas nu le poate copia ușor)

### 1. Self-as-data
Kanwas nu are echivalent. `wiki/self/pillars.md`, `stances.md`, `commitments.md`, `constraints.md`, `voice.md` cu schema tipată, citită de toate skills la startup — n-au așa ceva. Identity la ei = OAuth user + permissions, atât.

**De ce nu pot copia ușor**: produsul lor e fundamental despre *team alignment*. A adăuga *individual congruence* e topology violation — ar dilua propunerea pentru core audience-ul lor (echipe).

### 2. Confruntation loop (`/faber-mirror`, `/faber-meet`)
"AI care te confruntă săptămânal cu propriile stance-uri declarate vs log-ul realității" — uncategorized în piață. Cel mai apropiat: Mel Robbins journal, dar fără structured data + fără agent.

### 3. Schema strictă vs canvas liber
Canvas BlockNote la ei e rich dar free-form. Tu ai sources/entities/concepts/syntheses cu maturity states și cross-refs explicite. **Mai puțin sexy la demo, mult mai queryable agentic la scale.**

## Unde Faber e în urmă (gap-uri operaționale reale)

- **Multiplayer**: Yjs CRDT la ei. Tu = single-user. TAM-cap = nu poți viza echipe.
- **Visual canvas**: Hub-ul produsului lor. Tu = doar terminal + Obsidian read-only.
- **Web UI**: Inexistent la tine. Filtru natural anti non-tehnicieni.
- **Hosted**: kanwas.ai click-and-go. Tu = "instalează Claude Code + Python".
- **Agent execenv**: Sandbox la ei. Tu = mașina locală a userului.
- **Agent timeline live**: Stream în UI la ei. Tu = log.md text post-hoc.
- **Permission model**: Org/team/user. Tu = implicit single-user.
- **CLI bi-direcțional**: `kanwas pull/push`. Tu = local-only.

P7 din viziune zice "local-first, cloud-optional". Evidence-ul Kanwas împinge spre re-citirea P7 ca **"local-first, cloud-AS-FIRST-CLASS"** pentru orice audiență non-builder. Wizard-zip-Claude-Code rămâne v1 corect; un Faber.app hosted devine inevitabil v2 dacă vrei să atingi audiența "soția".

## Ce să fur — listă brută, neprioritizată

(versiunea filtrată e în synthesis; aici doar dump)

- "Context graph" ca meme de marketing — fură-l
- Customer logos / public showcase — pentru tine: 3-5 vault-uri publice read-only ca proof
- Repo public *acum*, fără cod, doar viziunea ca README
- Agent timeline UI — `log.md` + SQL views ai deja, mai trebuie HTML render
- CLI `faber pull/push` — pattern-ul `npm i -g @faber/cli` e standard accepted
- Visual canvas READ-ONLY peste `faber.db` — nu rescrie BlockNote
- Hosted Faber.app cu BYO API key — wedge pentru non-builderi
- Sandbox `execenv/` per vault — preț de admisie SaaS
- CRDT pentru `wiki/shared/` opt-in (NU pentru core, ar dilua self)
- Use-case templates pre-built (Solopreneurs/Researchers/Therapists/Coaches/Indie)
- Demo video 2 min ca centerpiece pe landing
- Self-host Docker compose ca "third-rail" pentru power users care nu vor cloud

## Riscuri / contradicții pe care nu le-am rezolvat

- **Open-source day-one vs support load solo**: dacă lansezi public, primești issues. Solo ești. Mitigare: lansezi cu README-only, cod abia după wizard ready. Cumperi timp și credibilitate simultan.
- **Hosted contradice P7?**: tehnic nu (cloud-optional a fost mereu permis). Dar "first-class hosted" cere execenv + sandbox + observability pe care local-only nu le cere. Decizie înainte de Faza 4.
- **Multiplayer ever sau never?**: dacă never, declară explicit în positioning ("Faber e intenționat single-player; pentru echipe folosește Kanwas"). Onestitatea ca diferențiator. Dacă later, `wiki/shared/` opt-in e topologia cea mai curată.
- **`/semnal-*` skills în core sau marketplace?**: argument core = anti-procrastination tool, exact slăbiciunea ta. Argument marketplace = niched. Posibil hibrid: `/semnal-draft` în core (universal), `/semnal-reply` în marketplace (specialist).

## Provocări directe către tine (cerute prin "provocă-mă")

1. **Tu ai blocat viziunea pe 23 apr. Au trecut 15 zile**. Kanwas a strâns 543 stars în 16 zile. Care e *output-ul* tău public din ultimele 15 zile? Dacă răspunsul e "zero", asta nu mai e deficiență de "timp" — e deficiență de *bias-pentru-acțiune*. Ai declarat "Mai bine făcut decât perfect" în CLAUDE.md. Live up.

2. **Decizia "Claude Code only" e rea pentru SaaS**. Bună pentru tine (curatoriat moștenit), dar P7 trebuie re-deschis. Hosted-mode = condiție de existență pentru produs serios pe această teză.

3. **Kanwas e acum activ pitch asset gratuit**. Folosește-l. Landing copy viitor: "Kanwas does X for teams. Faber does it for the individual builder. Same thesis, opposite axis." **Nu concura — slot-ează în gap-ul lor.**

4. **Soția ta e first validator** (deja consemnat în viziune, secțiunea 13.9). Acum că vezi UX-ul Kanwas — e click-and-go la kanwas.ai. Wizard-ul tău ar trebui să simuleze același UX, NU "instalează Python".

## Următorul pas concret (ales de tine)

- [ ] Public repo `github.com/narcis13/faber` cu framework-vision ca README — **azi**
- [ ] Post X cu tease — "Working on Faber, distributable AI-augmented thinking system. Alpha în iunie." — săptămâna asta
- [ ] Decizie scrisă: Faber.app hosted = v2 obligatoriu sau opțional? — săptămâna asta
- [ ] Rezervare domain `faber.dev` (+ `.codes`, `.wiki` ca backup)

---

*Filed în drafts pentru iterare. Sinteza curată: [[wiki/syntheses/kanwas-vs-faber-analysis]].*
