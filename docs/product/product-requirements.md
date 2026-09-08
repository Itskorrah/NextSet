# NextSet product requirements

Status: logging-first MVP scope, critical journeys, Tempo Ledger direction and local-first mobile architecture accepted by product owner on 2026-09-07 (D-009, D-010)  
Scope: product behaviour and outcomes; domain semantics are normative in [`../domain/workout-progression-rulebook.md`](../domain/workout-progression-rulebook.md)  
Last updated: 2026-09-07

## 1. Purpose and decision boundary

NextSet is a private, local-first workout logger for mainstream gym users. It helps people start a workout, record what happened and understand improvements from their own history. A person can use it indefinitely without choosing a goal, programme, schedule or coaching preference.

The central promise is:

> Start a workout, record your sets and see what changes over time.

Reusable routines and repeating completed workouts reduce effort on later visits. They are optional shortcuts; a blank workout is a complete first-class path. “Journeys” in this repository describe internal interaction specifications, never a choice users must make.

The product owner accepted this narrower scope and authorised a disposable prototype pass on 2026-09-07 (`D-009`). This is not production approval. Tempo Ledger is the proposed visual base for review; React Native + Expo + TypeScript and local SQLite remain proposed. Production stays blocked until the owner approves final visual direction, architecture and the revised critical journeys.

### Scope precedence after the logging-first decision

The phase labels and wording here supersede the earlier broad programme-led MVP. Existing domain/architecture specifications remain useful reference material, but their schedule, programme-enrolment, automatic adaptation and recommendation machinery is **not a hidden dependency** of the first release. Current sessions and routines must be valid with no programme, planned occurrence or progression rule. Future domain changes require review before production implementation.

The first release covers blank and repeated workouts, optional reusable routines, basic mainstream set logging, a non-blocking timer, editable history, comparable exercise performance, workout frequency, personal bests, local durability/restoration, units, accessibility, export and scoped deletion. Advanced group/drop authoring, ranked substitutions, goal-driven setup, fixed/flexible scheduling, short-workout recommendations, progression suggestions and richer analytics are deferred. Manual exercise changes and finishing early remain part of logging.

Normative terms use **MUST**, **SHOULD** and **MAY** in their RFC 2119 sense. A target marked **validation target** is a proposed gate, not a claim about a product that has not yet been built or tested.

## 2. Product principles

| ID | Principle | Product consequence |
|---|---|---|
| PRD-P-001 | Fast on the fiftieth workout | Repeated actions are designed around already-known values, one-handed use and minimal confirmations. |
| PRD-P-002 | Simple first, useful indefinitely | Start and log without setup; routines and optional set detail are disclosed on demand. |
| PRD-P-003 | Useful information only | A metric or chart must answer a named user question and offer interpretation without pretending causation. |
| PRD-P-004 | Flexible rather than rigid | Add, remove, reorder, repeat or finish when needed without a schedule or guilt. |
| PRD-P-005 | Honest records | Show observed facts and comparable trends; recommendations are deferred. Future guidance must be explainable. |
| PRD-P-006 | Encouraging without manipulation | No guilt, body pressure, punitive streak loss, urgency or rewards for unsafe volume. |
| PRD-P-007 | Local reliability | Recording, restoration and completion work without a network; committed workout data is not silently lost. |
| PRD-P-008 | Broad by default | The model supports free weights, machines, bodyweight and mixed routines without assuming one split, goal, gender, gym or experience level. |
| PRD-P-009 | User control | Suggestions are dismissible and overridable; deterministic data integrity rules are the only non-optional automation. |

## 3. Intended users

The audiences overlap. Experience level must not be inferred from appearance, gender, selected goal or exercise choice.

| ID | Audience | Needs | Default experience |
|---|---|---|---|
| PRD-U-001 | New gym users | A clear first action, understandable exercise selection, simple logging and modest progress feedback | Start workout immediately; plain-language labels and optional help |
| PRD-U-002 | Intermediate users | Fast logging, previous performance, repeatability and history | Repeat a workout or choose an optional routine; comparable previous values inline |
| PRD-U-003 | Experienced lifters | Accurate records, custom exercises, optional routines, correction and export | Direct entry and precise history without compulsory planning or advice |
| PRD-U-004 | General fitness users | A reliable record across machines, free weights, bodyweight and mixed routines | Blank workout and descriptive progress views |
| PRD-U-005 | Users with inconsistent schedules | Train whenever possible without resolving missed dates | Start or repeat whenever ready; no schedule, streak penalty or sequence to repair |

Explicit non-assumptions: NextSet is not centred on boxing, sparring, a push-pull-legs split, bodybuilding, strength sport, one gym, one goal or a fixed Monday-to-Sunday routine.

## 4. Jobs to be done

| ID | Situation | Job | Desired outcome |
|---|---|---|---|
| PRD-JTBD-001 | When I arrive ready to train | Let me begin a blank workout, repeat previous work or use a routine | I start deliberately with no setup dependency |
| PRD-JTBD-002 | When I am between sets | Let me record what happened with minimal attention | My set is saved immediately and I can keep training |
| PRD-JTBD-003 | When today differs from previous workouts | Let me add, change, reorder or omit exercises and finish early | The record reflects what happened without altering the original routine/history |
| PRD-JTBD-004 | When I return after interruption or poor connectivity | Restore the exact committed workout state | I do not recreate work or wonder whether it was saved |
| PRD-JTBD-005 | When I often do similar workouts | Let me save and edit an optional reusable routine | I avoid re-entering exercises without adopting a programme or schedule |
| PRD-JTBD-006 | When deciding my next set | Show comparable previous observations | I choose my own values; the app does not prescribe a target |
| PRD-JTBD-007 | When reviewing progress | Help me answer a specific question from trustworthy records | I understand a trend without being pressured or misled |
| PRD-JTBD-008 | When I need control of my records | Let me correct, export or delete my data safely | My history remains auditable and portable |

## 5. Scope assumptions

- The foundation is mobile-first and local-first. An account, cloud backend and continuous connection are not required for core MVP use.
- Optional user-owned routines are independently versioned; starting or repeating creates a snapshot without programme enrolment. Curated training-programme content is deferred.
- Guidance and progression suggestions are POST. The MVP reports observations and calculations; users choose their own targets.
- Goal selection and personalised template ranking are deferred; no inferred goal controls the v1 experience.
- All exercise and performance data shown in examples are illustrative, not prescriptions.
- Calendar dates follow the device's local time zone while completed records preserve absolute timestamps and the time-zone offset captured at the event.
- Definitions and classifications in the workout rulebook take precedence over abbreviated UI wording in this document.

## 6. Functional requirements

Phase labels are **FND** (foundation capability), **MVP**, **POST** or **FUTURE**. FND capabilities may not be visible features but are required before MVP release.

### 6.1 Immediate entry and optional routines

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-001 | MVP | First launch MUST open a usable Workouts screen with Start workout. Account, goal, experience, programme, routine, schedule and notification setup MUST NOT gate any logging/history/trend path. | The user can start immediately and use blank workouts indefinitely. Display units are visible at entry and adjustable in Settings; no onboarding completion flag is required. |
| PRD-FR-002 | MVP | Users MUST be able to preview and start an optional reusable routine independently of a programme, schedule or enrolment. | Starting copies the selected routine version into a new session with no completed sets. Curated training programmes and their discovery are deferred. |
| PRD-FR-003 | MVP | Users MUST be able to create, name, save and edit a reusable workout routine, including saving a completed workout as a routine. | A routine contains an ordered exercise list and optional set/rest targets; validation preserves input. It is reusable indefinitely without dates, sequence, goal or progression rules. |
| PRD-FR-004 | POST | A programme MUST support exactly one active schedule mode at a time: fixed weekday or flexible ordered sequence. | Switching mode previews future consequences, preserves completed history and requires confirmation. See `WPR-SCH-001`–`WPR-SCH-005`. |
| PRD-FR-005 | MVP | Routine edits MUST create a version/snapshot boundary that preserves existing active and completed workouts. | Editing a routine affects only future starts; repeating a historical workout copies that workout revision, not the current routine. No user-facing enrolment/version selection is needed for the normal edit. |
| PRD-FR-006 | MVP | Routine editing MUST support exercise order, optional planned sets, reps/time targets, rest and notes with no mandatory advanced configuration. | Basic routine validation uses independent exercise/set semantics. Superset/circuit group authoring, nested groups, programme-level rules and progression configuration are POST. |
| PRD-FR-007 | MVP | Users MUST be able to add a custom exercise with a unique stable identifier, name, measurement mode, load mode/basis and laterality. | Equipment, category, movement and muscle metadata are optional/unknown; missing metadata never blocks valid logging but suppresses confident substitution ranking. Duplicate names remain separate; deletion cannot erase history. |
| PRD-FR-008 | POST | Users SHOULD be able to create named gym profiles describing available equipment. | A profile filters and ranks substitutions but never invalidates prior records or automatically replaces plan content. |

### 6.2 Workouts, starting and deferred scheduling

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-009 | MVP | Workouts MUST present one dominant Start workout action, replaced by Continue workout when a session is active, with secondary paths to repeat recent work or open routines. | A new user can identify how to log without a goal/programme/schedule, chart or fictional next session. Recent history is absent rather than fabricated when empty. |
| PRD-FR-010 | MVP | Starting a blank workout from Workouts MUST require one deliberate action when no active-workout conflict exists. | A single activation creates and persists an empty active session and presents Add exercise. No sample or routine exercise is silently inserted. |
| PRD-FR-011 | MVP | Users MUST be able to repeat a completed workout or start a saved routine as a new session. | A stable new session ID is created; exercise order and reference/target values may be copied, but all completion state, observed sets, timestamps, timer state and record eligibility reset. The source remains unchanged; there is no sequence decision. |
| PRD-FR-012 | POST | Users MUST be able to move, skip, repeat or deliberately reschedule a planned session without rewriting completed history. | The UI states the effect on the next session before committing. See `WPR-SCH-006`–`WPR-SCH-012`. |
| PRD-FR-013 | POST | Fixed and flexible scheduling MUST behave deterministically across missed dates, time-zone changes and daylight-saving transitions. | A missed fixed session is unresolved until the user chooses an action; a flexible sequence does not advance because a date passed. |
| PRD-FR-014 | POST | Rest and recovery days MUST be representable without being treated as failed workouts. | They never create negative adherence or punitive messaging and do not advance a flexible workout sequence. |

### 6.3 Active workout and repeated logging

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-015 | FND | Every active-workout mutation MUST be committed through an atomic local transaction before success feedback is shown. | Forced termination after any acknowledged mutation restores that mutation or an explicit recoverable error; never a silently older state. See `WPR-RES-001`–`WPR-RES-006`. |
| PRD-FR-016 | MVP | Active workouts MUST show selected exercises, optional routine/reference targets, comparable previous performance, recorded sets, notes and save state offline. | Blank workouts have no planned-set total. Missing history says no previous sets; target/reference values never count as completed observations. |
| PRD-FR-017 | MVP | Users MUST be able to add, record, edit and remove independent standard or warm-up sets with explicit load/measurement mode and units. | Broad measurement fidelity covers external load/reps, bodyweight or assisted work, and time/distance where applicable. Advanced drop/group authoring is deferred; data semantics remain separate and valid under the set specification. |
| PRD-FR-018 | MVP | The default set row MUST prioritise measurement values and one explicit Log set action; optional effort or role fields MUST NOT block completion. | A valid populated normal set takes one deliberate action to record. Warm-up/optional detail is disclosed; unsupported advanced workflows have no placeholder controls. |
| PRD-FR-019 | MVP | Rest timing MUST be configurable, start from an applicable set completion, continue independently and remain non-blocking. | Logging, editing, navigation and finishing remain available while the timer runs; disabled notifications do not stop in-app timing. See `WPR-REST-001`–`WPR-REST-006`. |
| PRD-FR-020 | MVP | Users MUST be able to add/remove/reorder exercises and add unplanned sets during an active workout. | Changes affect the active session only; recorded data is retained or removed only through explicit recoverable actions. Saving changes as a routine is separate and optional. |
| PRD-FR-021 | POST | Users MUST be able to substitute an exercise for the current session and optionally for future sessions. | Suggestions expose matching reasons and meaningful mismatches; the user chooses. MVP accepts explicit session equipment availability/increments without saving a named gym profile. See `WPR-SUB-001`–`WPR-SUB-009`; named profiles remain `PRD-FR-008` POST. |
| PRD-FR-022 | MVP | Active workouts MUST support pause/leave, application termination, device lock/restart and offline continuation with exact restoration of committed state. | One authoritative active session is restored with elapsed time, timer derivation and unsaved-field treatment disclosed. |
| PRD-FR-023 | POST | Users MUST be able to choose short-workout mode by available time or manual priority selection. | The app previews kept/deferred/removed work, never deletes the underlying template and explains every change. See `WPR-SHORT-001`–`WPR-SHORT-008`. |
| PRD-FR-024 | MVP | Users MUST be able to finish at any point while preserving exactly the work recorded. | Only completed observed sets enter history/trends. Unlogged targets are not auto-completed; finishing asks no sequence/carry-forward question. A zero-set session does not create workout-frequency or personal-best evidence. |

### 6.4 Completion, history and progress

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-025 | MVP | Workout completion MUST atomically preserve the final session, confirm local save, summarise meaningful results and show the next likely action. | Retrying an interrupted completion is idempotent and cannot create duplicate completed workouts. |
| PRD-FR-026 | MVP | History/progress MUST identify personal bests only within an explicitly comparable exercise and measurement category with source-set provenance. | V1 shows observed highest external load and most reps at the same load where eligible, not estimated strength. Ties retain provenance; corrections/deletions recalculate results. Estimated 1RM and cross-exercise totals are deferred. |
| PRD-FR-027 | MVP | Users MUST be able to review workout/exercise history and three restrained progress questions: workout frequency, comparable exercise performance over time, and observed personal bests. | No routine or goal is required. Each view states range, units, source records, eligibility and an accessible text/list alternative. Empty history offers Start workout; one comparable session shows the observation and asks for another before a trend claim. |
| PRD-FR-028 | MVP | Users MUST be able to edit completed workout facts with an audit trail and deterministic recalculation. | Preserve original completion time and source IDs; store revision time/reason. Rebuild affected frequency, performance and personal-best results; never label stale aggregates current. |
| PRD-FR-029 | MVP | The application MUST distinguish planned targets, observed performance, calculated summaries and recommendations in labels and data. | No recommendation or estimate is displayed as an observed fact. |
| PRD-FR-030 | POST | Users MAY opt into a restrained ghost comparison against a comparable prior, best or planned session. | It is off by default, can be hidden instantly and never blocks entry or uses non-comparable exercise variants. |
| PRD-FR-031 | POST | Users MAY create a privacy-reviewed share card from selected workout facts. | The preview shows every included field; notes, location, schedule and account identifiers are excluded by default. |

### 6.5 Deferred guidance and its future constraints

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-032 | POST | Supported progression rules MUST be deterministic or programme-defined and independently testable. | A rule version, qualifying observations and rounding behavior reproduce the same candidate target. |
| PRD-FR-033 | POST | A progression recommendation MUST state what was observed, which rule applied, the proposed next target and any material limitation. | It remains pending until accepted, changed or dismissed; acceptance creates a new immutable future programme/template version at an explicit not-started occurrence boundary and never retroactively changes published, active or completed data. |
| PRD-FR-034 | POST | Users MUST be able to accept, edit, defer or dismiss a recommendation and manually override a planned target. | Accepted edits/overrides are labelled user decisions, preserved through immutable future versions and do not train or infer hidden health conclusions. |
| PRD-FR-035 | POST | The product MUST suppress progression recommendations when required inputs are incomplete, incomparable, corrected but not recalculated, or outside a validated rule boundary. | It may say why no suggestion is available; it must not fill missing facts with an inferred answer. |
| PRD-FR-036 | FUTURE | Any adaptive or model-generated guidance MUST remain behind a separately approved evidence, safety, privacy and explainability decision. | No autonomous progression, programme generation, injury response or health prediction enters MVP by implication. |

### 6.6 Data control, settings and failure handling

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-037 | MVP | Users MUST be able to export all user-entered training data and the metadata necessary to interpret it in a documented, machine-readable format. | Export works offline, includes schema/export versions and reports omissions or failure without claiming success. |
| PRD-FR-038 | MVP | Users MUST be able to delete local data through an explicit, scoped and confirmable flow. | Scope and recoverability are stated before action; an active export may be offered but is never required. Account deletion appears only when an account exists. |
| PRD-FR-039 | FND | Migration, corruption and partial-write handling MUST fail safely and preserve the last known readable data or a recoverable copy. | The app never silently resets to an empty state after a failed migration. See `WPR-RES-007` and `EC-DATA-*`. |
| PRD-FR-040 | MVP | Measurement units, accessibility preferences, timer behaviour and restrained record feedback MUST be configurable. | Display-unit changes preserve canonical meaning. Goal, schedule and recommendation settings are absent from v1. Reduced motion/sound/haptic preferences are respected. |
| PRD-FR-041 | MVP | Empty, permission-denied and local-operation failure states MUST explain what is known, what was not saved and the safe next action. | A failed operation cannot show success or discard entered values solely to clear an error. |
| PRD-FR-042 | FUTURE | If account sync is later introduced, local workout completion MUST not depend on it. | Conflicts preserve both versions until deterministically reconciled; server state cannot silently overwrite newer local work. |

## 7. Non-functional requirements

| ID | Area | Requirement and proposed validation gate |
|---|---|---|
| PRD-NFR-001 | Durability | Zero silent loss of acknowledged workout mutations across the interruption, restart, out-of-storage and migration release suites. “Acknowledged” means local commit succeeded before UI success feedback. |
| PRD-NFR-002 | Offline | All MVP routine editing, starting, logging, restoration, completion, history, edit, export and delete tasks MUST operate without internet after required app content is installed. Network-only additions must be explicitly labelled and non-blocking. |
| PRD-NFR-003 | Responsiveness | On approved minimum reference devices, set-value input feedback MUST meet p95 <=50 ms/p99 <=100 ms and a durable set commit plus saved feedback MUST meet p95 <=100 ms/p99 <=200 ms under the reference long-workout dataset. All other operation, frame, fixture and measurement contracts in [`../quality/performance-budgets.md`](../quality/performance-budgets.md) are normative and take precedence over summaries here. |
| PRD-NFR-004 | Repeated-task speed | Validation target: from a populated set row, completing a normal set takes one deliberate action; editing the most recent set is reachable in one action; starting a blank workout from Workouts takes one action when conflict-free. |
| PRD-NFR-005 | Restoration | Validation target: after forced termination, the authoritative active workout becomes usable at p95 <=500 ms after the database is ready on approved minimum devices, with all acknowledged mutations intact. Cold-launch budgets and fixture details are normative in [`../quality/performance-budgets.md`](../quality/performance-budgets.md). |
| PRD-NFR-006 | Accessibility | Critical flows MUST support screen readers, logical focus, non-colour status cues, dynamic text without loss of action, reduced motion, adequate contrast and platform-appropriate touch targets. Large-text and reduced-motion release suites are mandatory. |
| PRD-NFR-007 | One-handed use | Primary repeated controls SHOULD remain in comfortable thumb reach on supported phone sizes; no critical action may depend only on a gesture. |
| PRD-NFR-008 | Privacy | Local-only use requires no account. Training notes, schedule and history are private by default; telemetry, sharing and future sync require explicit scope and purpose. Secrets and health inferences are never written to analytics. |
| PRD-NFR-009 | Explainability (POST guidance) | Every future displayed recommendation MUST be reproducible from stored rule version and cited observations, and readable without training jargon or hidden scoring. |
| PRD-NFR-010 | Compatibility | Routine/session/set rules MUST be UI-independent and covered by platform-neutral domain tests. Persisted schemas and exported formats are explicitly versioned and migratable. |
| PRD-NFR-011 | Scale | The reference data suite MUST include a long active workout and a multi-year history; core logging may not degrade materially merely because history grew. Exact dataset sizes and budgets are owned by quality documents. |
| PRD-NFR-012 | Trust | No fake analytics, fabricated duration, placeholder control, unsupported medical claim or marketing statement presented as observed behavior may appear in production. |
| PRD-NFR-013 | Localisation readiness | User-facing strings, pluralisation, dates, decimal input and units MUST be externalised and locale-aware; canonical quantities remain unambiguous. MVP language coverage is a release decision, not assumed here. |
| PRD-NFR-014 | Security | Destructive operations require explicit intent; imported/exported data is treated as untrusted; logs redact free-text notes and identifiers. Security controls may not compromise local durability. |

## 8. Product success measures

These measures test whether the promise is being met. They are proposed thresholds for moderated studies, instrumented betas or release tests, not current results. Analytics require a separate consent and privacy decision; equivalent local usability research may be used.

| ID | Question | Measure | Foundation/MVP target | Guardrail |
|---|---|---|---|---|
| PRD-SM-001 | Is starting understandable? | Participants identify Start workout or Continue workout from Workouts in a timed task | Initial eight-person gate: >=7/8 without assistance in <=5 seconds | No setup, schedule or chart needed to understand the primary action |
| PRD-SM-002 | Is starting fast? | Blank-workout action count and completion rate; discoverability of repeat/routine options | One deliberate action for blank start; >=95% unassisted task completion | Repeat and routines remain optional secondary paths |
| PRD-SM-003 | Is logging fast? | Median time from reviewing a valid populated normal-set row to committed completion in repeated-use study | <=3 seconds; p90 <=6 seconds | Error rate <=1%; accessibility users assessed separately rather than excluded |
| PRD-SM-004 | Is correction easy? | Successful edit of most recent incorrect set | >=95% unassisted; median <=10 seconds | Edit history and record recalculation remain intact |
| PRD-SM-005 | Is local reliability credible? | Acknowledged mutations retained across automated failure matrix | 100% in release suite; zero silent loss | Failures must not be hidden by dropping cases |
| PRD-SM-006 | Does scheduling reduce friction? | POST: retain miss/reschedule/skip prediction research for any future scheduling proposal | Not a v1 gate | Scheduling cannot become a hidden logging prerequisite |
| PRD-SM-007 | Is guidance understandable? | POST: users can state observation, proposed change and override choice if guidance is later approved | Not a v1 gate | Recommendation acceptance is never a success target |
| PRD-SM-008 | Is the product broadly usable? | Task completion across new, intermediate, experienced, general-fitness and schedule-variable cohorts | No cohort more than 10 percentage points below aggregate on critical tasks | Evaluate every cohort against the same approved logging scope |
| PRD-SM-009 | Does progress information help? | Participant answers the chart's named question correctly | >=85% per shipped chart | Remove or redesign a chart that cannot meet the threshold |
| PRD-SM-010 | Is control trustworthy? | Export correctness, completed-workout edit correctness and scoped delete correctness in release suites | 100% schema-valid exports; 100% deterministic recomputation; zero out-of-scope deletes | Deletion speed never outranks scope clarity |
| PRD-SM-011 | Is the product encouraging? | Reports of guilt, shame or pressure in qualitative study; audit of copy and rewards | No known punitive pattern ships; all high-severity findings resolved | Streak engagement is not used to override wellbeing concerns |

Retention, workout frequency and recommendation acceptance are diagnostic only. They cannot demonstrate fitness outcomes and must not be optimised by encouraging excessive training.

## 9. Requirement traceability

- Feature phase and rationale: [`feature-inventory.md`](feature-inventory.md).
- Complete interactions: [`user-journeys.md`](user-journeys.md), using `JNY-*` IDs.
- Normative workout behavior: [`../domain/workout-progression-rulebook.md`](../domain/workout-progression-rulebook.md), using `WPR-*` IDs.
- Programme invariants: [`../domain/programme-model.md`](../domain/programme-model.md), using `PM-*` IDs.
- Set semantics: [`../domain/set-types.md`](../domain/set-types.md), using `ST-*` IDs.
- Known boundary cases and executable examples: [`../domain/edge-cases.md`](../domain/edge-cases.md) and [`../domain/domain-test-scenarios.md`](../domain/domain-test-scenarios.md).
- Product safety and claims: [`../domain/safety-boundaries.md`](../domain/safety-boundaries.md), using `SAF-*` IDs.

## 10. Approval decisions

**Accepted:** the logging-first product boundary and deferrals in `D-009`, based on the product owner's explicit 2026-09-07 instruction. This authorises documentation and disposable-prototype work only.

**Still awaiting owner review:** the revised critical journeys, final visual direction (Tempo Ledger is the proposed base) and proposed architecture. Inspect the working prototype before recording these approvals; scope acceptance alone does not approve every interaction detail or open the production gate.

D-012 and D-013 accept the initial 47-movement built-in catalogue, its five picker groups, search, category shortcuts and expandable sections. Custom exercises remain available for any movement absent from the catalogue; assisted-load semantics await separate validation. Personal-best categories and minimum platforms/locales still need usability and data-model review. Exact calculation-window copy, backup policy and name clearance remain tracked in [`../project/assumptions-questions.md`](../project/assumptions-questions.md). No backend, telemetry or technology-stack change is authorised by the simplification pass.
