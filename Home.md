---
type: moc
tags:
  - moc
  - home
  - index
date: 2026-01-17
---

# 🏠 Alteramens

> Laborator de idei și proiecte. Obiectiv: **1K MRR în 6 luni**.

## Quick Links
- [[journal/{{date:YYYY-MM-DD}}|Daily note azi]] - Jurnalul zilei
- [[inbox]] - Captează rapid o idee nouă
- [[templates/idea|Creează idee nouă]] - Template pentru idei
- [[MANIFEST]] - Viziune și principii
- [[CLAUDE]] - Ghid de colaborare

---

## 📊 Dashboard

### Idei active
```dataview
TABLE status, potential, complexitate
FROM "ideas"
WHERE type = "idee" AND status != "killed"
SORT date DESC
```

### Recent modificate
```dataview
LIST
FROM ""
WHERE type = "idee"
SORT file.mtime DESC
LIMIT 5
```

### Ultimele daily notes
```dataview
LIST
FROM "journal"
SORT date DESC
LIMIT 5
```

---

## 🗂️ Structură

### Workflow
```
inbox → ideas/ → concepts/ → experiments/ → projects/ → archive/
  💭      💡         📋           🧪            🚀         📦
```

### Foldere

| Folder | Scop | Status |
|--------|------|--------|
| `journal/` | Daily notes | 📓 |
| [[inbox]] | Quick capture | 📥 Activ |
| `ideas/` | Idei brute | 💡 |
| `concepts/` | Idei cu research | 📋 |
| `experiments/` | Prototipuri | 🧪 |
| `projects/` | În dezvoltare | 🚀 |
| `archive/` | Parcate/finalizate | 📦 |
| `templates/` | Șabloane | 📝 |

---

## 🏷️ Tag-uri

### După tip
- #saas - Software as a Service
- #devtools - Tools pentru developeri
- #digital-product - Cursuri, templates, guides

### După status
- #idee - Idee nouă, nevalidată
- #validated - Validată, merită continuat
- #killed - Abandonată

---

## 📈 Obiective 2026

Vezi [[MANIFEST#Timeline]] pentru milestones complete.

- [ ] Ian: Setup + 3 idei documentate
- [ ] Feb: Primul experiment live
- [ ] Mar: Primii utilizatori
- [ ] Apr: Prima plată
- [ ] Iul: 1000$ MRR
