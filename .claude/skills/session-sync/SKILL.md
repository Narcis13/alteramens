# Session-Sync Skill

Automatizează "închiderea buclei" la finalul sesiunilor de lucru - salvează decizii, learnings și context în vault.

## Activation

**Manual triggers:**
- `/session-sync`
- "salvează sesiunea"
- "închide bucla"
- "sync session"

**Proactive (sugerează când):**
- Sesiune >20 minute cu conținut valoros
- S-au luat decizii importante
- S-au descoperit unfair advantages sau insights
- Conversație se apropie de final natural

**Skip când:**
- Sesiuni scurte de clarificare (<10min)
- Pure coding sessions fără decizii strategice
- Întrebări punctuale fără context nou

## Diferențiere de Knowledge-Capture

| Skill | Salvează | Unde | Când |
|-------|----------|------|------|
| `knowledge-capture` | Info refolosibilă (tips, how-to) | `docs/` | Oricând |
| `session-sync` | Context sesiune + decizii | `sessions/`, `projects/`, `concepts/` | Final sesiune |

## Workflow

### 1. SCAN

Parcurg conversația și extrag:

- **Decizii** - alegeri cu reasoning (piață, tehnologie, prioritizare)
- **Unfair advantages** - descoperiri despre avantaje competitive
- **Viziuni/concepte** - idei cristalizate, direcții clare
- **Validări/invalidări** - ce s-a confirmat sau infirmat
- **Action items** - pași următori concreți
- **Learnings** - lecții învățate, patterns observate

### 2. PLAN

Propun ce salvez, în format:

```
📋 PLAN Session-Sync

✅ CREARE: sessions/YYYY-MM-DD-topic.md
   → Note sesiune cu descoperiri, decizii, action items

📝 UPDATE: projects/[project]/decisions.md
   → +2 decizii noi (decizie A, decizie B)

📝 UPDATE: owner/Who am i.md
   → +1 unfair advantage descoperit

✅ CREARE: concepts/[name].md
   → Concept nou cristalizat

Confirmă cu "da" sau ajustează.
```

### 3. CONFIRM

Aștept răspuns explicit:
- "da" / "ok" / "go" → execut
- ajustări → incorporez și re-propun
- "skip" / "nu" → opresc

### 4. EXECUTE

Creez/actualizez fișierele respectând:
- Frontmatter YAML corect per tip
- Wikilinks `[[path/to/file]]` pentru conexiuni
- Tags consistente
- **Append** la fișiere existente (nu overwrite)
- Limba din CLAUDE.md (RO pentru notes, EN pentru docs)

## Output Types

### Session Notes (mereu creat)

**Destinație:** `sessions/YYYY-MM-DD-topic.md`

**Template:**
```markdown
---
type: session
mode: [brainstorm|validate|spec|build|review|strategy]
date: YYYY-MM-DD
duration: ~Xmin
output:
  - path/to/artifact1
  - path/to/artifact2
tags:
  - tag1
  - tag2
---

# Sesiune: [Titlu descriptiv]

## Întrebare inițială

> "[Întrebarea sau task-ul care a pornit sesiunea]"

## Descoperiri cheie

### 1. [Descoperire]
[Detalii]

### 2. [Descoperire]
[Detalii]

## Decizii luate

1. **[Decizie]** - [reasoning scurt]
2. **[Decizie]** - [reasoning scurt]

## Action items

- [ ] [Task] - **[timeline dacă există]**
- [ ] [Task]

## Learnings

1. **[Learning bold]**
2. **[Learning bold]**

## Artifacts create

- [[path/to/artifact1]] - descriere
- [[path/to/artifact2]] - descriere

## Următoarea sesiune

[Ce urmează]
```

### Decizii (când s-au luat decizii)

**Destinație:** `projects/[project]/decisions.md`

**Template pentru append:**
```markdown

---

## YYYY-MM-DD: [Titlu decizie]

### Context
[Ce problemă rezolvăm]

### Decizie
**[Decizia clară, bold]**

### Reasoning
[De ce am ales asta]

### Consecințe
[Ce înseamnă pentru proiect]
```

### Unfair Advantages (când se descoperă)

**Destinație:** `owner/Who am i.md` secțiunea "Unfair Advantages"

**Format append:**
```markdown
X. **[Nou advantage]**: [Descriere scurtă - implicație]
```

### Concepte (când se cristalizează)

**Destinație:** `concepts/[name].md`

**Template:**
```markdown
---
type: concept
status: researching
tags:
  - tag1
  - tag2
date: YYYY-MM-DD
monetizare: [subscription|one-time|freemium|tbd]
potential: [low|medium|high]
complexitate: [low|medium|high]
---

# [Nume Concept]

## Descriere scurtă

[1-2 propoziții]

## Viziune

> "[Quote care surprinde esența]"

## Problema

[Ce rezolvă]

## Soluția propusă

[Cum rezolvă]

## Monetizare

[Model de business]

## Următorul pas

[Acțiune concretă]

## Conexiuni

- [[path/to/related]] - relație
```

## Convenții

### Frontmatter obligatoriu
- `type:` - tipul documentului
- `date:` - data creării (YYYY-MM-DD)
- `tags:` - array de tags relevante

### Wikilinks
- Format: `[[path/to/file]]` sau `[[path/to/file|Display Text]]`
- Relativă la root vault

### Tags comune
- `#idee`, `#validated`, `#killed`
- `#saas`, `#devtools`, `#digital-product`
- `#strategie`, `#validare`, `#piata`

### Update vs Create
- **Create** - când fișierul nu există
- **Update (append)** - când fișierul există, adaug la final cu separator `---`

## Exemple

### Input (fragment conversație)

> "Am decis să ne focusăm pe România pentru că soția are deja clienți. Asta e un unfair advantage pe care nu l-am văzut până acum. Următorul pas e să vorbesc cu ea."

### Output propus

```
📋 PLAN Session-Sync

✅ CREARE: sessions/2026-01-17-validare-piata.md
   → Note sesiune cu decizia focus România

📝 UPDATE: projects/workscript/decisions.md
   → +1 decizie: Focus piață România

📝 UPDATE: owner/Who am i.md
   → +1 unfair advantage: Acces direct la piață prin soție

Confirmă cu "da" sau ajustează.
```

## Guidelines de execuție

1. **Scanează complet** - nu rata decizii menționate casual
2. **Prioritizează** - ce e cu adevărat nou vs repetiție
3. **Linkează** - creează conexiuni între artifacts
4. **Nu duplica** - verifică ce există deja
5. **Respectă formatul** - frontmatter, separatori, structură
6. **Append corect** - la fișiere existente, adaugă la final

## Error handling

- **Fișier inexistent menționat în output** → Creează-l
- **Folder inexistent** → Creează folderul
- **Conflict cu conținut existent** → Propune merge, nu overwrite
