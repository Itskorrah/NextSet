# NextSet information architecture

Status: foundation proposal for product-owner approval  
Date: 2026-08-06  
Scope: mobile-phone information model and navigation; visual navigation treatment remains direction-dependent

## Organising idea

NextSet has two modes with different attention needs:

- **Plan and review:** choose what to do, maintain programmes and understand history.
- **Train:** resume a single interruption-sensitive active workout and record what happened.

The active workout is a durable task layer, not merely another tab page. It can be left without being discarded, survives process interruption, and is always the first resume destination while active.

## Content model

| User-facing object | Primary question | Canonical relationship |
|---|---|---|
| Today | What is next and how do I start? | Summarises active workout or next planned occurrence; contains no independent analytics feed |
| Programme | What sequence or schedule am I following? | User-owned versioned definition containing workout templates |
| Workout template | What is normally planned in this session? | Ordered exercises, targets, groups, rest and optional progression rules |
| Planned occurrence | When/what is expected next? | Fixed-date or flexible-sequence instance pointing to a programme version |
| Active workout | What am I doing now? | Durable session snapshot with committed sets, draft context and timer state |
| Completed workout | What actually happened? | Immutable completion plus auditable later revisions |
| Exercise | What movement am I recording? | Stable catalogue/custom identity with variation, equipment and measurement metadata |
| Exercise performance | How did this exercise go in one session? | Links the planned and actual exercise identities and contains ordered sets |
| Set | What did I record? | Planned target plus observed values, set semantics, completion and revision provenance |
| History | What have I recorded? | Chronological workouts and exercise-specific drill-down |
| Progress view | What changed for a defined question? | Derived, comparable result plus source list/table and calculation explanation |
| Recommendation | What could I change next and why? | Versioned proposal; no plan mutation until accepted |

The complete persistence semantics live in [`../architecture/data-model.md`](../architecture/data-model.md). Visual labels must not collapse distinct objects merely to simplify a prototype.

## Destination hierarchy

```text
NextSet
├── Today
│   ├── Continue active workout
│   ├── Next planned workout
│   ├── Start expected workout
│   ├── Start unscheduled workout
│   └── Resolve move / skip / repeat / reschedule
├── Train (durable task layer)
│   ├── Workout overview and exercise order
│   ├── Current exercise
│   │   ├── Set entry and edit
│   │   ├── Rest timer
│   │   ├── Notes and comparable history
│   │   └── Exercise substitution
│   ├── Add / reorder / short-workout adaptation
│   └── Finish / partial completion / recovery
├── History and progress
│   ├── Workout list and calendar
│   ├── Completed-workout detail and edit
│   ├── Exercise history
│   ├── Comparable records
│   └── Question-led charts with data alternative
├── Programmes
│   ├── Templates and previews
│   ├── User programmes and versions
│   ├── Workout editor
│   ├── Exercise library and custom exercises
│   └── Scheduling and progression rules
└── Settings and data
    ├── Units and accessibility preferences
    ├── Timer, guidance and celebration preferences
    ├── Export
    ├── Local data deletion
    └── Licences, privacy and support
```

This is the semantic hierarchy. The number and arrangement of visible bottom destinations varies meaningfully among Tempo Ledger, Field Kit and Open Pace; see [`visual-directions.md`](visual-directions.md). Every direction must still provide a stable, labelled path to each branch.

## Navigation rules

1. **Resume beats start.** When an active workout exists, Continue is the dominant Today action and the Train destination opens that workout.
2. **Global navigation never destroys a session.** Leaving Train preserves committed state and disclosed draft behaviour. Finishing and abandoning are explicit verbs.
3. **Context does not mutate scope.** Viewing history, a note or a substitution candidate during training does not end the timer or change the programme.
4. **Sheets are for bounded choices.** Set type, exercise options, timer adjustment and “today or future” scope may use a sheet. Multi-step programme editing, history and substitution search use full screens.
5. **Gestures accelerate only.** Swipe and drag have visible button/menu equivalents. Reorder provides Move up/down accessibility actions.
6. **Back is recoverable.** A dirty set draft is retained or receives a clear Save/Discard/Keep editing choice. Back never silently erases input.
7. **Deep links are state-aware.** A future notification or live surface returns to the current workout; it cannot create another session.
8. **No dead destinations.** Deferred features have no placeholder tab or inactive control.

## Ten required review screens

| Screen | User intention and primary action | Required information | Recovery and alternate paths |
|---|---|---|---|
| 1. Onboarding | Reach a useful plan without an account | Units, optional goal, experience description, schedule preference and accessibility-relevant choices | Skip/resume; explain that goals tune suggestions but do not lock features |
| 2. Programme selection or creation | Adopt a suitable start or build one | Template purpose, level, duration provenance, equipment assumptions, schedule mode and progression summary | Preview before adopt; custom programme path; no template silently mutates after adoption |
| 3. Today | Identify and start/continue what is next | Active status, next workout/focus, last workout, duration if known, schedule context and offline readiness | Start expected, start unscheduled, move/skip/repeat/reschedule, or resolve unfinished workout |
| 4. Active workout | See current position and log the next set | Exercise order, current exercise, previous comparable result, planned target, actual sets, progress, notes, timer and local-save state | Leave/resume, reorder, add, substitute, short mode, finish partial or finish complete |
| 5. Set entry | Record or correct one set accurately | Set position/type, load/measurement mode, reps/time, optional effort, previous/planned context and unit | Direct entry plus stepper; cancel preserves prior committed value; commit failure retains draft |
| 6. Exercise substitution | Replace unavailable/undesired work while preserving intent | Original exercise, reason optional, match factors, mismatches, actual-exercise history and change scope | Search, custom exercise, skip, choose today only, or separately change future programme |
| 7. Workout completion | Confirm durable completion and choose a useful next step | Saved-on-device state, completed/skipped/not-attempted work, meaningful comparable records, optional note and next occurrence | Idempotent retry, return to Today/history, handle partial/carry-forward choice without guilt |
| 8. History | Find a workout or exercise record | Chronological list/calendar, filters, completion state, short/partial labels and search | Empty history starts a workout; failed read exposes recovery rather than an empty reset |
| 9. Exercise progress | Answer one explicit progress question | Exercise variation, date range, unit, comparable observations, summary, estimate labels and underlying records | Insufficient-data explanation, range change, raw history, accessible table/list |
| 10. Programme editor | Adjust future training without rewriting history | Version scope, workout order, exercises, targets, rest, groups, schedule and progression rules | Validate without clearing input; preview effect; publish new version; cancel leaves current version active |

## Active-workout task structure

The default reading and focus order is:

1. workout and exercise position;
2. exercise name and target;
3. rest-timer summary and controls when running;
4. previous comparable performance;
5. current and completed set list;
6. current set editor/complete action;
7. notes and exercise options;
8. workout-level actions.

At large text, a four-column set row becomes a vertical set summary. It does not introduce horizontal scrolling or reduce type. A screen-reader user can navigate by headings to Current set, Timer, Sets, Notes and Workout actions; completed rows are coherent groups rather than four unrelated focus stops.

## States that must exist in the architecture

| State | Presentation requirement | Forbidden shortcut |
|---|---|---|
| Loading local data | Fast, labelled and non-blocking; retain last committed content where safe | Indefinite network spinner |
| Empty | Explain why and offer one relevant action | Marketing carousel or fake analytics |
| Offline | State that core work is available locally; identify only genuinely unavailable future service | Red error banner for normal offline use |
| Draft not committed | Distinct from saved set; preserve during recoverable navigation | Showing a completed check before commit |
| Saved locally | Brief visible/semantic acknowledgement | Conflating with future sync |
| Save failed | Retain values, explain what failed and offer retry/recovery | Clearing the form or playing success haptic |
| Resting | Glanceable remaining time with pause/adjust/dismiss | Full-screen countdown that blocks logging |
| Interrupted workout | Continue is dominant with elapsed/restored context | Starting another hidden active session |
| Insufficient progress data | State how many comparable observations are needed and show raw history | Zeroed or fabricated chart |
| Corrupt/unreadable data | Quarantine, explain and offer last verified revision/export path | Silent reset to an empty account |

## Search and filtering

- Exercise search ranks recent and favourite items before a full catalogue, supports aliases, and exposes equipment/movement filters.
- Substitution search is scoped to the original exercise intent but never labels heuristic similarity as safety or equivalence.
- History search covers workout name, exercise and user note locally; private notes are not used for telemetry or recommendations.
- Filters persist only when the user deliberately saves a preference. A hidden stale filter must not make history appear lost.

## Foundation validation

The IA is ready for owner review when each required journey in the future [`../product/user-journeys.md`](../product/user-journeys.md) maps to a stable entry, success state, failure state and recovery path here. The link may be unresolved while that concurrently owned deliverable is still being prepared; its absence is a foundation blocker, not permission to invent a different flow.
