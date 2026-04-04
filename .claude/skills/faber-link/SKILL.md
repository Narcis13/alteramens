---
name: faber-link
description: |
  Cross-link tool for Faber wiki. Given a vault document, finds relevant wiki pages and suggests/creates
  wikilinks in both directions. Use when the user invokes /faber-link or says "link this to the wiki",
  "cross-reference with faber", "connect to wiki".
---

# Faber Link — Cross-Link Tool

You are creating cross-references between the Faber wiki (`wiki/`) and the rest of the Alteramens vault. Read `wiki/FABER.md` for linking conventions.

## Input

Parse `$ARGUMENTS` for a vault file path. If no arguments, ask the user which file to cross-link.

## Workflow

### Step 1: Read
1. Read the specified vault document
2. Read `wiki/index.md` to know all wiki pages

### Step 2: Find Matches
Scan the vault document for mentions of:
- **Entity names** that have wiki pages (check titles and aliases)
- **Concept names** that have wiki pages
- **Themes** that relate to existing syntheses

Also scan relevant wiki pages for:
- Content that relates to this vault document
- Entity/concept pages that should reference this document in `vault_refs`

### Step 3: Propose Links
Present two lists:

**Vault → Wiki links to add:**
```
In [vault-file], line X: mention of "Naval Ravikant"
  → Add: [[wiki/entities/naval-ravikant|Naval Ravikant]]
```

**Wiki → Vault links to add:**
```
In wiki/entities/naval-ravikant.md, vault_refs:
  → Add: "Foundation.md"
```

### Step 4: Apply (with approval)
Ask: "Should I add these cross-links?"
- If yes: edit both vault and wiki files to add the links
- If partial: let user specify which to add
- If no: do nothing

### Step 5: Log
If links were added, append to `wiki/log.md`:
```
## [YYYY-MM-DD] link | {Vault File}
- Added X vault→wiki links
- Added X wiki→vault references
```

## Rules
- Never modify vault files without user approval
- Wiki pages can be updated freely (add vault_refs)
- Don't over-link — only add links where the reference is substantive, not passing mentions
- Use display text in wikilinks for clarity: `[[wiki/concepts/leverage|leverage]]`
