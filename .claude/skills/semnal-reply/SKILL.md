---
name: semnal-reply
composition_level: molecule
description: |
  Generate 3 value-adding English reply variants for an X post — add-context, gentle-contrarian,
  question-that-unlocks-thread — each under 250 chars, human-in-the-loop, no auto-post.
  Input: URL of the X post + raw thought in Romanian. Tones informed by pillars + targets list.
  Use on /semnal-reply, "reply la postul ăsta", "draft reply pentru", "riff on this tweet",
  "răspunde la tweet-ul ăsta". Logs to replies-log.md ONLY after user confirms publication.
---

# Semnal Reply — Valuable Replies for the Sweet-Spot Radar

At 0 followers, a valuable reply on a sweet-spot account beats an original post on your own
timeline. This skill produces 3 reply variants for a given X post, in English, short, and
value-adding — never "Great post!" slop. Narcis picks, edits, and posts manually.

## Vault Discovery

```bash
VAULT_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$(dirname $d)"; break; }
  d=$(dirname "$d")
done)
[ -z "$VAULT_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
XQUEUE="$VAULT_ROOT/workshop/x-queue"
```

Files you'll touch:
- Read-only canonical: `$VAULT_ROOT/wiki/concepts/x-content-pillars.md` (canonical pilon definitions),
  `$VAULT_ROOT/wiki/concepts/voice-preservation.md` (strategic framing — operational discipline comes
  from the `voice_rules` table loaded below)
- Read-only operational: `$XQUEUE/pillars.md` (working copy), `$XQUEUE/targets.md` (sweet-spot accounts)
- Append-only (Phase 4 only, after explicit confirmation): `$XQUEUE/replies-log.md`

## Self Context Loading (first step, always)

Before any reply generation, load active voice rules and stances from `faber.db` — **voice and positional rules come from the DB, not from MD files.**

```bash
WIKI_DB="$VAULT_ROOT/wiki/faber.db"
sqlite3 -json "$WIKI_DB" "SELECT voice_rules_json, stances_json FROM v_self_active_context;"
```

`voice_rules_json` governs every reply's register. `stances_json` (active `self_stances`) is critical for the **contrarian** variant — if a reply contradicts an active stance, you must flag it rather than draft it. If the contrarian angle can be built on top of an active stance, anchor it there.

If the DB is missing or the view returns empty, stop and tell Narcis — do not fall back to hard-coded voice rules.

## Input

Parse `$ARGUMENTS`:
- **URL + thought** (e.g., `https://x.com/simonw/status/1234 asta mă duce cu gândul la cum folosesc skills`) — ideal case
- **URL only** — ask for the thought (reply without angle = generic)
- **Thought only** — ask for the URL (no context = nothing to reply to)
- **Empty** — ask for both

The URL is usually `x.com/<handle>/status/<id>` or `twitter.com/<handle>/status/<id>`.

## Workflow

### Phase 1 — Gather Context

1. **Extract handle** from the URL (between the domain and `/status/`).
2. **Check targets list:** grep `$XQUEUE/targets.md` for the handle.
   - If found: note the pilon match and registered angle — informs tone (warm, reference-rich).
   - If not found: treat as cold — tone stays respectful, no assumed rapport.
3. **Fetch post content:**
   - Try `WebFetch` on the URL with a prompt like "Extract the original post text, author handle, and approximate date. Do not include replies."
   - If WebFetch fails (login wall, nitter blocked, etc.): tell Narcis "could not fetch — paste the post text or quote the key line" and wait.
4. **Reply constraints** are defined inline in this skill (section "Reply format rules" below) —
   ≤250 chars, ≤3 sentences, 3 variants (context/contrarian/question), English-only output.
   Voice discipline comes from the `voice_rules` loaded in Self Context Loading above.
5. **Read `wiki/concepts/x-content-pillars.md`** + `$XQUEUE/pillars.md` (operational copy) to map
   the target's pilon match.

Do NOT skip this phase. Replying without post content = generating generic filler.

### Phase 2 — Generate 3 Variants

Each variant ≤ 250 chars (ideally 180-230 — short replies perform). Each variant MUST add
something the original author doesn't already know or hadn't said. If you can't genuinely
add value on this post, tell Narcis honestly ("this one doesn't give you a reply angle
— pick another") rather than filler.

**Variant A — Add context / experience (`context`)**

Bring a concrete specific from Narcis's CV that extends the original:
- 30 years of code, from DOS 3.1 / Turbo Pascal
- 20 years in a Romanian public hospital IT — low budget, zero tolerance for errors
- Current AI-builder: Claude Code + skills daily
- 51 years old — late-bloomer founder
- Wife: accountant for ~20 SMB clients → real visibility into unsexy SMB workflows

The reply should say something only Narcis can say, anchored to the original post.

**Variant B — Gentle contrarian (`contrarian`)**

A fair, evidence-anchored counter-take. NOT an attack, NOT "well actually". Pattern:
"Agree with X, but from Y vantage point, Z complicates this." The friction is productive
— if the author has any curiosity, it invites a response. Never use sarcasm, never
imply the author is uninformed.

**Variant C — Question that unlocks (`question`)**

A specific question that only makes sense if you read the post carefully. NOT:
- "Could you elaborate?"
- "Interesting take, but how?"
- "What about X?" (generic)

YES:
- "Did this break for you on async calls too, or only sync?"
- "In your experience, does this scale past 5 people, or does the overhead flip?"

Specificity signals attention. Attention invites reply. A reply from a sweet-spot account
to a 0-follower account = pure algorithmic gold.

### Reply format rules (canonical — absorbed here from retired `x-voice-rules.md`)

Voice discipline comes from the `voice_rules` loaded in Self Context Loading (DB). Format rules live here.

- **English only** in reply output (even if Narcis's thought was in Romanian)
- **≤ 250 chars** (ideally 180-230 — short replies perform on X)
- **≤ 3 sentences**
- **3 variants genuinely distinct**: context (extend with Narcis-specific experience), contrarian (gentle, evidence-anchored), question (specific, only makeable if you read carefully)
- **Must add something** the original author doesn't already know or hadn't said — if you can't, tell Narcis honestly
- **Forbidden reply openers:** `Great point!`, `Love this!`, `This resonates...`, `I've been thinking about this...`, any variant of `+1` / `100%!` / `This!`
- **Forbidden LLM-isms (zero tolerance):** `dive deep`, `let's dive in`, `unlock`, `supercharge`, `game-changer`, `revolutionary`, `disruptive`, `transform`, `seamless`, `leverage` as a verb, `it's not just X, it's Y`, `at the end of the day`, `synergy`, moralizing closers
- **Voice preservation applies** — accented EN fine; no sterilization. `voice_rules` from the DB are the operational check
- **Thread replies:** engage with the claim Narcis cared about, not "the whole thread"
- **Contrarian guardrail:** if your contrarian angle contradicts an active `self_stance`, flag it to Narcis rather than drafting it — it's either a stance change or a bad reply

### Phase 3 — Present + Request Selection

Show the three variants numbered, with char count per variant, and the target-list
match status. Then ask Narcis which to use.

Format:

```
Post: @{handle} — {1-line summary of what the post says}
Target-list match: {pilon N — "{registered angle}"} | not on targets list (cold reply)
Narcis's thought: "{raw RO, unchanged}"

[1] Context  ({N} chars)
{reply text}

[2] Contrarian  ({N} chars)
{reply text}

[3] Question  ({N} chars)
{reply text}

Which do you use? (1/2/3 | edit | skip)
```

Use AskUserQuestion for the pick (4 options: 1 Context / 2 Contrarian / 3 Question / none).
If Narcis says "edit" or provides custom text, capture that as the final reply.

### Phase 4 — Log (ONLY after confirmed publication)

**Before logging:** Explicitly ask "Ai postat reply-ul? (y/n)". Only if yes, proceed.
If no, exit cleanly without writing anywhere.

If yes, append ONE line to `$XQUEUE/replies-log.md`:

```
YYYY-MM-DD HH:MM | {post-url} | @{handle} | [{variant-label}] {final-reply-text-as-posted} | follow-ups (24h/72h): TBD
```

Format notes:
- Use `date '+%Y-%m-%d %H:%M'`
- `{variant-label}` is one of: `context`, `contrarian`, `question`, `edited`, `custom`
- Keep the line on a single line (no wrapping in the raw file — readable with tail)
- End with literal `TBD` to invite future fill-in (next week's /semnal-reflect scoops these)

Then remind Narcis:
```
✓ logged. Revino aici în 24-72h să completezi follow-ups (likes / sub-replies / follows atribuiți).
```

## Forbidden Actions

- ❌ Call any X / Twitter API to post. Even if tokens are available — this is human-in-loop.
- ❌ Log without explicit "da/y" confirmation that the reply was posted manually.
- ❌ Write to `replies-log.md` during Phase 1-3 (only Phase 4, only after confirmation).
- ❌ Invent biographical details about Narcis not already in pillars.md or wiki.
- ❌ Generate a reply if the post content couldn't be retrieved AND Narcis didn't paste it.

## Quality Bar (self-check before presenting)

Before showing the 3 variants, reject internally if any is:
- [ ] Something 100 other people could have written
- [ ] Longer than 250 chars
- [ ] Using a forbidden opener
- [ ] Claiming expertise Narcis doesn't have
- [ ] Sycophantic ("love this", "great insight")
- [ ] Contrarian in an attack register (never)
- [ ] A question answerable by "yes" or "no" without nuance (zero engagement payoff)

If 2+ fail, regenerate that variant before presenting.

## Out of scope

- Reply radar / timeline scanning (Chrome extension, Week 2-3 per PRD §5.4)
- Auto-reply (forever out of scope — anti-feature, PRD §7)
- Metrics sync on replies (future `/semnal-reflect`, Week 4-6)
- Multi-post thread replies (reply to one post at a time for now)
