# NextSet design principles

Status: foundation proposal for product-owner approval  
Date: 2026-08-06  
Scope: product experience and design-system constraints; this is not approval to build the production app

## Current scope — logging-first, 2026-09-07

Under [D-009](../project/decision-log.md), Workouts replaces programme-centred Today as the first surface. Start blank is immediately available; routines, history and progress add value without goals, programme enrolment or scheduling. Prior references below to scheduling, recommendations and programme versioning are deferred examples, not required logging UI. Keep advanced fields contextual, label all three main destinations and use familiar back/sheet dismissal patterns. Tempo Ledger is the proposed visual base, not final owner design approval.


## Design objective

NextSet should make the next useful action obvious while preserving the user's plan, history and control. Its quality will be judged in the middle of a real session and on the fiftieth workout, not only during onboarding or in a polished screenshot.

These principles translate the product requirements in [`../product/product-requirements.md`](../product/product-requirements.md), the interaction evidence in [`../research/fitness-interaction-research.md`](../research/fitness-interaction-research.md), and the deterministic behaviour in [`../domain/workout-progression-rulebook.md`](../domain/workout-progression-rulebook.md) into design constraints.

## Principles

### 1. Put the current decision first

Order information by decision latency:

1. **Now:** the current exercise, set values, save state and completion action.
2. **Next:** rest time and the next set or exercise.
3. **Context:** planned target, previous comparable result, notes and substitution intent.
4. **Later:** trends, achievements, programme editing and settings.

Today answers “What is next?” before it shows analysis. The active workout answers “What do I log?” before it shows history. A new module must state which lower-priority item it displaces.

### 2. Optimise the repeat, not the tour

- Starting the expected workout is one deliberate action when no material choice is unresolved (`PRD-FR-010`).
- A valid, unchanged normal set is committed in one deliberate action; editing stays in the same context (`PRD-FR-018`).
- Previous actual, planned target and current actual are visually and semantically distinct.
- Add, edit, reorder and replace actions preserve the user's place.
- Advanced fields remain available without becoming permanent row noise.

### 3. Make local truth visible before delight

“Saved” means the local transaction succeeded. “Synced” is a separate future state. A success animation, haptic, personal-record treatment or completion summary may begin only after the local write succeeds (`PRD-FR-015`, `WPR-RES-001`). Failed writes retain the attempted input, state what was not saved and never imitate success.

### 4. Keep the plan flexible and the history honest

A programme is a source for a session, not a prison. Skip, repeat, reschedule, substitute, shorten and add actions must explain whether they affect this session, the programme sequence or a future programme version. Completed history is never silently rewritten. A missed day is a scheduling state, not a failure state.

### 5. Start plain; reveal precision in context

The default path uses familiar labels such as “weight”, “reps”, “rest” and “previous”. RPE, RIR, set roles, progression rules, programme versions and grouping appear only when enabled or relevant. Disclosure must remain labelled and discoverable; simplicity must not become an expert ceiling.

### 6. Treat numbers as user data, not decoration

- Use tabular numerals where columns or timers must remain stable.
- Keep units attached visually and in the accessible value.
- Never merge planned, observed, estimated and recommended values.
- Do not invent precision: unknown duration stays unknown; estimated 1RM is labelled as an estimate.
- Charts answer a named question, disclose range and inclusion rules, and offer the underlying list or table.

### 7. Design for a moving, interrupted, one-handed user

Primary actions occupy the lower reachable region without covering content, the keyboard or system safe areas. Every critical hit area is at least 48×48 logical pixels/points, with destructive actions separated from high-frequency completion. The experience survives lock, call, music switching, loss of signal, force quit and device restart.

### 8. Encourage without judgement

Reward accuracy and meaningful personal progress, not maximal volume, failure frequency or never resting. Celebrations are brief, private by default, dismissible and configurable. There are no punitive streaks, body-image scores, shame, artificial urgency or red “failure” treatment for a changed schedule.

### 9. Build identity from a coherent system

Originality comes from a recognisable hierarchy, type rhythm, shape language, progress treatment, motion and haptic character. It does not come from gradients, glow, excessive cards, random icons, ornamental charts or a colour swap over the same layout. Light and dark appearances are designed separately.

### 10. Accessibility changes the structure

Accessibility is not a finishing audit. The base structure supports:

- logical headings, groups and focus order;
- coherent set-row announcements rather than fragmented cells;
- 200% text scaling and platform accessibility sizes without lost content or function;
- row-to-stack reflow instead of shrinking type;
- visible alternatives to colour, gesture, sound, motion and haptics;
- VoiceOver, TalkBack, switch/external-keyboard and reduced-motion paths;
- chart summaries and navigable data alternatives.

The proposed cross-platform 48×48 baseline is deliberately stricter than the web minimum and matches the larger native target recommendation recorded in [`../quality/accessibility-requirements.md`](../quality/accessibility-requirements.md).

### 11. Use calm density, not empty spectacle

Whitespace separates decisions; it is not a substitute for content. Cards are reserved for a real grouping, status or elevation change. Dividers, alignment and type hierarchy should carry routine structure. The interface may become denser for expert contexts, but never at the cost of target size, legibility or reflow.

### 12. Preserve privacy in every surface

Workout notes, schedule detail, body information and identifiers are private by default. Lock-screen, notification, sharing and app-switcher surfaces reveal only the minimum approved content. Share and export flows preview exactly what leaves the device.

## System invariants

| Area | Invariant | Design consequence |
|---|---|---|
| Active state | Exactly one authoritative active workout | Opening the app resumes it; starting another workout cannot create a hidden duplicate |
| Set completion | Local commit precedes acknowledgement | The complete control has pending, committed and failed states; no optimistic success |
| Timer | Independent and non-blocking | It remains visible but never owns a full-screen modal or disables logging |
| Recommendations | Optional proposal with provenance | Show observed facts, rule and proposed change; offer accept, edit, defer and dismiss |
| Substitution | User chooses scope and match | Show why a candidate fits and any mismatch; default during training is today only |
| Progress | Comparable records only | Labels state exercise variation, range, unit and estimate status |
| Advanced controls | Contextual disclosure | Programme or exercise preferences can reveal fields without changing the normal-set path |
| Error recovery | Input is preserved | Errors sit beside the affected value and provide a safe retry or recovery action |
| Themes | Semantics do not change | Colour roles, focus order, state labels and control placement remain stable |

## Review questions

Before accepting a screen or component, reviewers should be able to answer:

1. What is the user's next likely action?
2. Which displayed value is previous, planned, observed, calculated or recommended?
3. What happens if the app closes immediately after this action?
4. Can the task be completed one-handed, with a screen reader, at large text and without motion or haptics?
5. Does a deviation affect only today, future planning or completed history?
6. Is every metric actionable and sourced from real data?
7. Does the treatment remain understandable without colour?
8. Is any copy making a coaching, health or safety claim the product cannot support?

## Foundation boundary

The three directions in [`visual-directions.md`](visual-directions.md) are proposals, not a selected design system. The visual-reference images and React/Vite prototype are disposable review artefacts. No production component, token, asset or behaviour is approved until the product owner selects a direction and the future implementation passes the gates in [`../quality/acceptance-criteria.md`](../quality/acceptance-criteria.md).
