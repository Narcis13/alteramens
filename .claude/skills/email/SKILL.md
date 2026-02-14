---
name: email
description: Manage Gmail inbox via Himalaya CLI. Use when the user wants to check email, read messages, search inbox, triage mail, delete or move messages, list folders, or any email-related task. Trigger on /email or any mention of email, inbox, mail, messages.
---

# Email (Himalaya CLI)

Operate Gmail via `himalaya` CLI. Account "gmail" is pre-configured with IMAP + SMTP.

## Commands

Parse `$ARGUMENTS` to determine the operation. Default (no args) = inbox overview.

### Inbox overview (default)

```bash
himalaya envelope list -o json
```

Display as a formatted table: ID, From, Subject, Date, Flags. Show newest first, max 20.

### Read message

Args: `read <id>`

```bash
himalaya message read <id>
```

Display headers (From, To, Subject, Date) then body.

### Read thread

Args: `thread <id>`

```bash
himalaya message thread <id>
```

### Unread messages

Args: `unread`

```bash
himalaya envelope list -o json
```

Filter results to show only envelopes WITHOUT the "Seen" flag.

### Search

Args: `search <query>`

```bash
himalaya envelope list -q "<query>" -o json
```

### List folders

Args: `folders`

```bash
himalaya folder list
```

### Browse folder

Args: `folder <name>`

```bash
himalaya envelope list -f "<name>" -o json
```

### Delete message (DESTRUCTIVE)

Args: `delete <id>`

**Before executing:** show the envelope details (from, subject) and ask the user to confirm with AskUserQuestion. Only proceed after explicit approval.

```bash
himalaya message delete <id>
```

### Move message (DESTRUCTIVE)

Args: `move <id> <folder>`

**Before executing:** show what will be moved and where, ask for confirmation with AskUserQuestion. Only proceed after explicit approval.

```bash
himalaya message move <id> <folder>
```

### Flag operations (DESTRUCTIVE)

Args: `flag <add|remove> <id> <flag>`

**Before executing:** confirm with AskUserQuestion.

```bash
himalaya flag add <id> <flag>
himalaya flag remove <id> <flag>
```

Common flags: Seen, Answered, Flagged, Deleted, Draft.

## Output formatting

- Always use `-o json` for programmatic parsing, then format results as readable markdown tables
- For message bodies, render plain text directly
- Truncate long subjects at 50 chars in table views
- Show relative dates when possible ("today", "yesterday", "3 days ago")

## Safety rules

- Read operations: execute freely
- Destructive operations (delete, move, flag): always confirm first via AskUserQuestion
- Never auto-delete or auto-move without explicit user approval
