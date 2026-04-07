---
title: "Reverse-Time Planning — Plan Backwards from a Fixed Date"
type: concept
category: mental-model
sources: [brainstorm-ai-tutor-medicina]
entities: []
related: [agentic-curriculum, calibration-over-content, kill-fast]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Reverse-Time Planning — Plan Backwards from a Fixed Date

When a project has a real, immovable deadline, plan **backwards from the deadline**, not forwards from the current state. This produces a defensible schedule, a clear daily compass, and an honest reckoning of what fits.

## Forward vs Reverse Planning

**Forward planning** (default instinct):
> "Where am I now? What can I work on today? Let's see how far we get."
- Start state defines the next step
- Progress is felt as motion
- Scope is open-ended
- "We'll get to that eventually"

**Reverse planning** (what works under deadlines):
> "On day X, the user must know N concepts at M proficiency. Working backwards, by day X-30 they must know N-K. By X-60, ... By today, they must be doing Y."
- End state defines every prior state
- Progress is measured against the schedule
- Scope is forced to honesty (cannot fit everything → drop something explicitly)
- "Today's reason is the date we are protecting"

## Why It Works

1. **Forces scope honesty** — a forward plan can pretend everything fits. A reverse plan bumps into the calendar and exposes the conflict immediately.

2. **Creates daily compass** — every day has a reason that can be defended ("today we cover X because it must be mastered by Y, two weeks before exam"). Without a reverse plan, today's decisions are arbitrary.

3. **Identifies dependency chains early** — working backwards surfaces "this concept requires that concept" relationships. Forward planning often discovers them when they bite.

4. **Makes trade-offs visible** — when something must be dropped, the reverse plan shows exactly what is being dropped and when. This is uncomfortable, which is why it is correct.

5. **Enables [[agentic-curriculum]]** — an agent that owns a schedule needs a destination. Reverse planning produces the destination as a series of dated milestones.

## How To Run Reverse Planning

1. **Define the end state precisely.** Not "user is good at biology." Instead: "user can answer a Carol Davila grilă at 85% accuracy with confidence calibration error < 10%."

2. **Map all the components of the end state.** Every concept, every skill, every behavior the end state requires. This is the inventory.

3. **Set mastery dates per component.** Working backwards from the deadline, schedule when each component must be at target proficiency. Account for review/spacing between mastery and exam.

4. **Build the prerequisite graph.** Each component depends on prior components. Walk the graph backwards from the deadline.

5. **Compute today's plan as the latest derivative.** Given the prerequisite graph and current state, today's work is whatever is on the critical path to the next mastery date.

6. **Re-plan when reality shifts.** A failed mastery check, illness, or scope change updates the graph. Reverse plans must be living, not static.

## Application: AI Tutor for Medical Admission

See [[brainstorm-ai-tutor-medicina]]. The exam date for Carol Davila 2027 admission is fixed (typically July 2027). The product's curriculum engine starts from that date and works backwards: mastery dates per concept, prerequisite chains across the manual, daily plans derived from the latest critical path. The agent ([[agentic-curriculum]]) runs forward through the schedule the reverse plan produced.

This is not just a feature — it is the **structural commitment** that makes the product different from a textbook or a chat tutor. The user is always being driven toward a destination, not browsing a library.

## Anti-Pattern

"We'll cover topics in the order of the manual." This is forward planning disguised as structure. The manual order is not optimized for retention until a specific exam date — it is optimized for pedagogical narrative. Following it blindly wastes calendar.

## Connection to Other Domains

Reverse planning is standard practice in:
- Product launches (working backwards from launch day)
- Construction (critical path scheduling)
- Race training (peak on race day)
- Tax filings (working backwards from deadline)

It is **under-applied** in education products because most education products do not have real deadlines. Once a product picks a deadline-driven wedge ([[bounded-problem-wedge]]), reverse planning becomes the natural backbone.
