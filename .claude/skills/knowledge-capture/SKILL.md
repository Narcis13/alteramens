# Knowledge Capture Skill

Capture and save useful documentation, tips, and references to `docs/` for future use.

## Activation

**Proactive** - Propose saving when encountering valuable, reusable information during conversations.

Trigger when:
- Sharing a useful tip, trick, or workflow
- Explaining a non-obvious concept
- Providing reference material (commands, syntax, shortcuts)
- Solving a problem with reusable solution

## Workflow

1. Identify valuable information worth saving
2. Propose to user: "This seems useful to save. Want me to add it to `docs/[category]/`?"
3. Wait for confirmation
4. Save in appropriate category with concise format

## Categories

| Folder | Content |
|--------|---------|
| `docs/obsidian/` | Obsidian tips, plugins, workflows |
| `docs/tech/` | Tech stack references (languages, frameworks) |
| `docs/tools/` | Tools & utilities (CLI, apps, services) |
| `docs/cheatsheets/` | Quick references, command lists |

## Document Format

```markdown
---
title: [Title]
created: [YYYY-MM-DD]
tags: [tag1, tag2]
---

# [Title]

[Concise content - bullet points, code snippets, quick tips]

## See also
[Related links if relevant]
```

## Guidelines

- **Concise** - Quick reference style, not verbose explanations
- **Actionable** - Focus on "how to" not "what is"
- **Scannable** - Bullet points, code blocks, tables
- **English** - All documentation in English
- **No duplicates** - Check if similar doc exists before creating

## Examples

Good candidates for capture:
- Obsidian keyboard shortcuts
- Git commands for specific workflows
- Claude Code tips and tricks
- Framework quick-start patterns

Skip:
- One-time solutions specific to current context
- Already well-documented basics
- Personal notes (those go in `notes/`)
