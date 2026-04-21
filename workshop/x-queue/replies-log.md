---
type: log
tags:
  - semnal
  - replies
  - learning-loop
status: active
date: 2026-04-21
---

# Replies log

Append-only log al reply-urilor postate pe X, pentru learning loop săptămânal
(agregat de viitorul `/semnal-reflect`). Scris automat de skill-ul `/semnal-reply`
doar după ce confirmi că reply-ul a fost publicat manual.

## Format per linie

```
YYYY-MM-DD HH:MM | <URL post original> | @<handle autor> | [<variant-label>] <text-ul postat> | follow-ups (24h/72h): <likes / replies-pe-reply / follows atribuiți>
```

- `<variant-label>` ∈ {`context`, `contrarian`, `question`, `edited`, `custom`}
- Începe cu placeholder `follow-ups: TBD` — completezi manual după 24-72h
- Nu wrappa linia — păstreaz-o single-line pentru `tail`-friendly reading

## Metrici de urmărit (în timp)

- **Reply-uri postate / săptămână** (consistency > intensitate) — target ≥10 până în săpt 4
- **Follows atribuiți / reply** — semnalul real de tracțiune
- **Pattern-uri care prind** (pe pilon? pe varianta? pe ora zilei?) — input pentru reflect

## Entries

> *Gol încă. Prima intrare vine după ce rulezi `/semnal-reply` și confirmi publicarea.*
