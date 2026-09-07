# NextSet information architecture

Status: logging-first foundation proposal; scope accepted in `D-009`, detailed navigation awaits owner review  
Updated: 2026-09-07  
Scope: phone navigation and information hierarchy; Tempo Ledger is the proposed base

## Organising idea

NextSet opens around recording a workout. People can use it indefinitely without choosing a goal, routine, programme, schedule or guidance mode. Repeating history and saving routines are optional shortcuts. “Journeys” are internal interaction specifications, never a user-facing setup choice.

The active workout is a recoverable task that remains reachable while viewing history or routines. In future production, it is durable and locally transactional. The disposable browser prototype must label its actual session/persistence limitations; it does not prove native restoration.

## Content model

| Object | User question | Relationship and scope |
|---|---|---|
| Workouts | How do I start or continue? | Start workout or Continue workout; recent repeat and optional routines are secondary |
| Routine | What do I often do? | User-owned ordered exercises with optional set/rest targets and notes; no dates, sequence, goal or enrolment |
| Active workout | What am I recording now? | Independent session with stable ID, exercises, draft/recorded sets, notes and timer state; source routine/workout is optional |
| Completed workout | What happened? | A completed session plus auditable later revisions; only observed completed sets enter performance results |
| Exercise | What am I recording? | Stable identity, variation, equipment and measurement/load/laterality semantics |
| Set | What did I do? | Actual measurement, units, role and completion; copied targets and previous values are separate reference data |
| History | What have I recorded? | Chronological sessions and their source sets; edits and repeat are available from detail |
| Progress | What has changed? | Descriptive frequency, comparable exercise observations and observed personal bests with record provenance |

Programme, planned occurrence, schedule cursor, carry-forward disposition and recommendation are POST objects. They must not become mandatory foreign keys or user choices for this hierarchy. Existing [`../architecture/data-model.md`](../architecture/data-model.md) contains broader reference semantics; its current scope boundary must preserve independent sessions/routines before production.

## Destination hierarchy

```text
NextSet
├── Workouts (first launch and normal home)
│   ├── Start workout → empty active session → Add exercise
│   ├── Continue active workout (replaces Start when active)
│   ├── Repeat a recent completed workout
│   └── Routines
│       ├── Preview / Start routine
│       └── Create / Edit routine
├── Active workout (reachable task layer)
│   ├── Add / remove / reorder exercises
│   ├── Log / edit / remove sets
│   ├── Comparable previous values and optional notes
│   ├── Non-blocking rest timer
│   └── Finish with the work recorded / explicit discard
├── History
│   ├── Completed-workout list
│   └── Workout detail → Edit / Repeat / Save as routine
├── Progress
│   ├── Workout frequency
│   ├── Exercise history and comparable performance
│   └── Observed personal bests and source sets
└── Settings (secondary entry)
    ├── Units, accessibility and timer preferences
    ├── Export / scoped local-data deletion
    └── Privacy, licences and support
```

Proposed persistent navigation has three labelled destinations: **Workouts, History, Progress**. Routines live under Workouts; settings stay secondary. Keep these destinations stable when history is empty. There is no Today schedule dashboard, Programme tab, goal wizard or deferred-feature placeholder. Final treatment remains subject to prototype review, large-text/accessibility verification and owner approval.

## Navigation rules

1. **Continue takes precedence.** An active workout replaces the dominant Start action. Any repeat/routine start attempt must resolve the existing session and cannot silently create a second one.
2. **Leaving preserves work.** Tabs, back and history previews preserve committed session values. Dirty fields are retained or present an explicit save/discard/keep-editing choice.
3. **Use visible, plain actions.** Add exercise, Log set, Finish workout, Repeat workout and Save as routine identify their effect. No schedule/version terminology belongs in normal logging.
4. **Keep optional work contextual.** Routine creation and settings never interrupt first start or finishing. Finishing needs no goal, next-workout, carry-forward or recommendation decision.
5. **Use sheets for bounded choices.** Exercise options, set detail and timer adjustment may use dismissible sheets. Search, full workout history and routine editing can use full screens with clear back labels and focus restoration.
6. **Gestures are shortcuts.** Drag/swipe must have visible accessible alternatives. No critical action relies solely on a gesture, colour or haptic.
7. **Respect platform use.** Preserve iOS safe-area insets, familiar labelled navigation/back behaviour, at least 48×48 logical-pixel critical targets, scalable text, accessible focus and reduced motion. Apply these design principles to the proposed React Native stack; they do not authorise a SwiftUI rewrite.
8. **Do not imply unimplemented features.** The prototype describes its actual save scope and supported modes; future production-only settings are documentation contracts, not dead controls.

## Required current review states

| State | Primary action | Essential information / recovery |
|---|---|---|
| First-use Workouts | Start workout | No sample “next” session or setup gate; optional routines secondary |
| Blank active workout | Add exercise | No silently seeded exercises, targets or completed sets; empty state explains the next action |
| Exercise selection | Add selected exercise | Search/select with clear identity and supported measurement mode; cancel preserves session |
| Set entry | Log set | Unit, measurement, optional previous reference; errors retain input and do not record a set |
| Active workout with records | Log next set / Finish | Recorded versus draft values distinct; editing accessible; timer does not cover actions |
| Finish | Save completed workout | Only observed work counted; incomplete targets do not become performed sets; no carry-forward choice |
| Empty History / Progress | Start workout | Why empty, how records will help, no fake charts or zeroed sample performance |
| One recorded session | View source workout | Show actual observations and “record another comparable session” before claiming an improvement trend |
| Repeat | Start new workout | Explicit source reference, new session, all completion flags cleared; source history unchanged |
| Routine preview/editor | Start / Save routine | Optional exercise/set/rest definition with no schedule; edits affect future starts only |
| History detail and edit | Edit / Repeat | Original record and correction provenance; recompute derived views after save |
| Progress with comparisons | Inspect exercise / source sets | Identity, unit, dates/range, inclusion rules, observed values and accessible text/list alternative |

## Active-workout task structure

Reading and focus order follows the task: workout/exercise name, comparable previous context if present, current set fields, Log set, recorded sets/edit actions, optional notes/timer, exercise and finish actions. Do not add a planned denominator to a blank workout. A routine can show optional targets, but logging beyond them remains possible.

At large text, set rows reflow into vertical summaries without horizontal scrolling, smaller type or hidden actions. Screen-reader users can navigate headings for Current exercise, Set entry, Recorded sets, Timer and Workout actions. Focus returns predictably after sheets, edits and exercise selection.

## Meaningful progress states and rules

- **Workout frequency:** count completed sessions containing at least one recorded eligible set in the displayed local-date range. Empty/abandoned/draft sessions are excluded. This describes recorded workouts, not adherence, health or a recommendation to train more.
- **Comparable exercise performance:** group by exercise variant and matching measurement/load/laterality semantics. Show units, dates and underlying sets. Unit conversion preserves canonical meaning; different variants or assistance levels cannot become a misleading continuous “strength” series.
- **Observed personal bests:** use the approved `PRD-FR-026` categories and eligible source sets. Do not imply an estimated 1RM, cross-exercise score or causal fitness improvement. No eligible data means an explanation, not a fabricated best.
- **Insufficient history:** zero sessions offer Start workout; one comparable session shows that observation and explains why change cannot yet be assessed. Unknown/missing values remain unknown, never zero-filled.
- **Corrections:** after an edit/delete, invalidate/recompute affected counts, series and bests; stale results are hidden or clearly pending. A chart always has an accessible equivalent and source drill-down.

## Failure and data states

| State | Required presentation | Forbidden shortcut |
|---|---|---|
| Local loading | Labelled, brief and recoverable | Network spinner blocking offline logging |
| Draft versus recorded | Explicit recorded state after successful commit only | Checkmark or frequency increment before save |
| Save failed | Retain values, say what was not saved, offer retry | Clearing input or claiming success |
| Interrupted session | Continue with latest committed values | Silently starting an empty replacement |
| No results in range | Explain filter/date range and offer change | Pretending history is lost |
| Corrupt/unreadable data | Preserve source and expose truthful recovery/export path | Silent reset to empty history |

## Foundation validation

The revised [`../product/user-journeys.md`](../product/user-journeys.md) must map to reachable entries, outcomes and recovery paths here. Prototype QA verifies the supported browser interactions and its stated limitations. Native transaction/restoration, device accessibility and full release gates remain future evidence requirements. Final direction/journey/architecture approval remains separate from accepted logging-first scope.
