# NextSet product requirements

Status: foundation proposal for product-owner approval  
Scope: product behaviour and outcomes; domain semantics are normative in [`../domain/workout-progression-rulebook.md`](../domain/workout-progression-rulebook.md)  
Last updated: 2026-08-06

## 1. Purpose and decision boundary

NextSet is a local-first mobile workout tracker and training companion for mainstream gym use. It must make the repeated work of deciding what is next, starting, recording, adapting and finishing a workout feel quick and dependable without taking control away from the user.

The central promise is:

> NextSet makes planning, starting, recording and progressing through workouts easier.

The supporting promise is:

> NextSet gives people the right amount of information at the right time without getting in the way of training.

This document defines the proposed foundation and MVP. It does not approve production implementation. The product owner must approve the product direction, MVP boundary, critical journeys and architecture before production work begins.

Normative terms use **MUST**, **SHOULD** and **MAY** in their RFC 2119 sense. A target marked **validation target** is a proposed gate, not a claim about a product that has not yet been built or tested.

## 2. Product principles

| ID | Principle | Product consequence |
|---|---|---|
| PRD-P-001 | Fast on the fiftieth workout | Repeated actions are designed around already-known values, one-handed use and minimal confirmations. |
| PRD-P-002 | Simple first, powerful when needed | Beginner defaults remain understandable; advanced set types, exertion and progression controls use progressive disclosure. |
| PRD-P-003 | Useful information only | A metric or chart must answer a named user question and offer interpretation without pretending causation. |
| PRD-P-004 | Flexible rather than rigid | Users can reschedule, skip, repeat, substitute, shorten and override without corrupting the programme sequence. |
| PRD-P-005 | Explainable guidance | A recommendation states the triggering observations, the applicable rule and the proposed change; it never silently edits the programme. |
| PRD-P-006 | Encouraging without manipulation | No guilt, body pressure, punitive streak loss, urgency or rewards for unsafe volume. |
| PRD-P-007 | Local reliability | Recording, restoration and completion work without a network; committed workout data is not silently lost. |
| PRD-P-008 | Broad by default | The model supports free weights, machines, bodyweight and mixed routines without assuming one split, goal, gender, gym or experience level. |
| PRD-P-009 | User control | Suggestions are dismissible and overridable; deterministic data integrity rules are the only non-optional automation. |

## 3. Intended users

The audiences overlap. Experience level must not be inferred from appearance, gender, selected goal or exercise choice.

| ID | Audience | Needs | Default experience |
|---|---|---|---|
| PRD-U-001 | New gym users | Understandable setup, terminology help, confidence about what is next, clear logging and modest progress feedback | Curated templates, plain-language labels, conservative defaults and advanced controls hidden until requested |
| PRD-U-002 | Intermediate users | Structured programmes, fast weight/set/rep logging, history and understandable progression | Previous values inline, quick completion, flexible scheduling and opt-in recommendations |
| PRD-U-003 | Experienced lifters | Custom programmes, advanced set structures, RPE/RIR, precise history, overrides and export | Dense-but-readable controls behind disclosure, programme versioning and full editability |
| PRD-U-004 | General fitness users | A reliable record across machines, free weights, bodyweight and mixed routines without compulsory coaching | Straightforward templates and descriptive progress views |
| PRD-U-005 | Users with inconsistent schedules | A logical next session after delays, deliberate skip/repeat/reschedule choices and time-limited alternatives | Flexible sequence as an equal first-class option; no punishment for missed dates |

Explicit non-assumptions: NextSet is not centred on boxing, sparring, a push-pull-legs split, bodybuilding, strength sport, one gym, one goal or a fixed Monday-to-Sunday routine.

## 4. Jobs to be done

| ID | Situation | Job | Desired outcome |
|---|---|---|---|
| PRD-JTBD-001 | When I arrive ready to train | Show me the expected session and let me begin deliberately | I know what is next and start it in one action |
| PRD-JTBD-002 | When I am between sets | Let me record what happened with minimal attention | My set is saved immediately and I can keep training |
| PRD-JTBD-003 | When I cannot follow the plan exactly | Let me substitute, reorder, shorten, skip, repeat or reschedule | The session remains useful and the future plan stays understandable |
| PRD-JTBD-004 | When I return after interruption or poor connectivity | Restore the exact committed workout state | I do not recreate work or wonder whether it was saved |
| PRD-JTBD-005 | When I plan training | Let me adopt a template or build a programme with the detail I need | The plan fits my schedule and level without unnecessary configuration |
| PRD-JTBD-006 | When deciding a future target | Show relevant history and an explainable option | I can accept, change or ignore a recommendation with confidence |
| PRD-JTBD-007 | When reviewing progress | Help me answer a specific question from trustworthy records | I understand a trend without being pressured or misled |
| PRD-JTBD-008 | When I need control of my records | Let me correct, export or delete my data safely | My history remains auditable and portable |

## 5. Scope assumptions

- The foundation is mobile-first and local-first. An account, cloud backend and continuous connection are not required for core MVP use.
- Programme templates are product-defined content, separately versioned from users' adopted programme versions.
- Guidance in MVP is deterministic and rules-based. It is optional, explainable and requires user approval. It is not autonomous coaching.
- Training goals personalise labels, template ranking and optional defaults; they do not justify health, medical or outcome claims.
- All exercise and performance data shown in examples are illustrative, not prescriptions.
- Calendar dates follow the device's local time zone while completed records preserve absolute timestamps and the time-zone offset captured at the event.
- Definitions and classifications in the workout rulebook take precedence over abbreviated UI wording in this document.

## 6. Functional requirements

Phase labels are **FND** (foundation capability), **MVP**, **POST** or **FUTURE**. FND capabilities may not be visible features but are required before MVP release.

### 6.1 Setup and programme planning

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-001 | MVP | NextSet MUST support a skippable, resumable first-run setup that captures measurement units, optional training goal, experience self-description, scheduling preference and accessibility-relevant preferences without requiring an account. | A user may complete, backtrack, defer optional questions or leave and resume without losing prior valid answers. Goal selection never locks features. |
| PRD-FR-002 | MVP | Users MUST be able to preview and adopt a versioned programme template, including exercises, set targets, schedule mode and disclosed progression behavior. | Adoption creates an independent user-owned programme version; later template changes cannot silently mutate it. |
| PRD-FR-003 | MVP | Users MUST be able to create, validate, save and edit a custom programme containing one or more workout templates. | Invalid fields identify the exact problem and preserve entered data. Advanced fields remain collapsed by default. See `PM-VAL-*`. |
| PRD-FR-004 | MVP | A programme MUST support exactly one active schedule mode at a time: fixed weekday or flexible ordered sequence. | Switching mode previews future consequences, preserves completed history and requires confirmation. See `WPR-SCH-001`–`WPR-SCH-005`. |
| PRD-FR-005 | MVP | Programme editing MUST create an auditable immutable version when a change can affect future planned sessions. | Active/completed sessions retain their originating version; the live enrolment adopts the new version only from an explicit not-started occurrence boundary. See `PM-VER-001`–`PM-VER-005`. |
| PRD-FR-006 | MVP | Users MUST be able to configure exercise order, planned sets, rep/time ranges, rest targets, notes, supported progression rules and simple non-nested supersets/circuits. | Users can create, edit and execute one-level groups with explicit member order, round/rest behavior and independent child sets. Nested groups, conditional group logic and advanced reusable group workflows are post-MVP. All values pass model/set validations. |
| PRD-FR-007 | MVP | Users MUST be able to add a custom exercise with a unique stable identifier, name, measurement mode, load mode/basis and laterality. | Equipment, category, movement and muscle metadata are optional/unknown; missing metadata never blocks valid logging but suppresses confident substitution ranking. Duplicate names remain separate; deletion cannot erase history. |
| PRD-FR-008 | POST | Users SHOULD be able to create named gym profiles describing available equipment. | A profile filters and ranks substitutions but never invalidates prior records or automatically replaces plan content. |

### 6.2 Today, scheduling and starting

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-009 | MVP | Today MUST make the next expected workout immediately identifiable, with focus, estimated duration provenance, last session context, unfinished-workout status and a primary start/resume action. | In usability validation, users can answer “what is next?” without opening analytics; unknown duration is shown as unknown, not invented. |
| PRD-FR-010 | MVP | Starting the expected workout from Today MUST require one deliberate action when no unresolved conflict exists. | A single activation creates and persists the active session, then shows the first exercise. |
| PRD-FR-011 | MVP | Users MUST be able to start an unscheduled workout from a template, from a recent workout or as an empty session. | The user chooses whether it affects programme sequence; default is no sequence advance. |
| PRD-FR-012 | MVP | Users MUST be able to move, skip, repeat or deliberately reschedule a planned session without rewriting completed history. | The UI states the effect on the next session before committing. See `WPR-SCH-006`–`WPR-SCH-012`. |
| PRD-FR-013 | MVP | Fixed and flexible scheduling MUST behave deterministically across missed dates, time-zone changes and daylight-saving transitions. | A missed fixed session is unresolved until the user chooses an action; a flexible sequence does not advance because a date passed. |
| PRD-FR-014 | MVP | Rest and recovery days MUST be representable without being treated as failed workouts. | They never create negative adherence or punitive messaging and do not advance a flexible workout sequence. |

### 6.3 Active workout and repeated logging

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-015 | FND | Every active-workout mutation MUST be committed through an atomic local transaction before success feedback is shown. | Forced termination after any acknowledged mutation restores that mutation or an explicit recoverable error; never a silently older state. See `WPR-RES-001`–`WPR-RES-006`. |
| PRD-FR-016 | MVP | The active workout MUST show exercise order, planned target, relevant comparable previous performance, completed/remaining progress and notes without requiring a network. | Missing or incomparable history is labelled; values from a different exercise variant are never presented as direct prior performance. |
| PRD-FR-017 | MVP | Users MUST be able to record, edit, delete and add sets for the measurement modes and set semantics defined in the set-type specification. | Completion is explicit, immediately persisted and reversible; destructive deletion offers recovery during the current edit context. |
| PRD-FR-018 | MVP | The default set row MUST optimise the normal working-set path while exposing warm-up, drop, failure-intent, RPE/RIR, unilateral and other advanced fields only when applicable. | Once valid values are present, completing a normal set requires one deliberate action and advances focus predictably. |
| PRD-FR-019 | MVP | Rest timing MUST be configurable, start from an applicable set completion, continue independently and remain non-blocking. | Logging, editing, navigation and finishing remain available while the timer runs; disabled notifications do not stop in-app timing. See `WPR-REST-001`–`WPR-REST-006`. |
| PRD-FR-020 | MVP | Users MUST be able to reorder exercises and add an unplanned exercise or set during an active workout. | The change affects only the session unless the user separately chooses to update future programme versions. |
| PRD-FR-021 | MVP | Users MUST be able to substitute an exercise for the current session and optionally for future sessions. | Suggestions expose matching reasons and meaningful mismatches; the user chooses. MVP accepts explicit session equipment availability/increments without saving a named gym profile. See `WPR-SUB-001`–`WPR-SUB-009`; named profiles remain `PRD-FR-008` POST. |
| PRD-FR-022 | MVP | Active workouts MUST support pause/leave, application termination, device lock/restart and offline continuation with exact restoration of committed state. | One authoritative active session is restored with elapsed time, timer derivation and unsaved-field treatment disclosed. |
| PRD-FR-023 | MVP | Users MUST be able to choose short-workout mode by available time or manual priority selection. | The app previews kept/deferred/removed work, never deletes the underlying template and explains every change. See `WPR-SHORT-001`–`WPR-SHORT-008`. |
| PRD-FR-024 | MVP | Users MUST be able to finish a partial session deliberately. | Completion distinguishes completed, skipped and not-attempted work and asks whether eligible work should be considered for carry-forward; it does not imply failure. |

### 6.4 Completion, history and progress

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-025 | MVP | Workout completion MUST atomically preserve the final session, confirm local save, summarise meaningful results and show the next likely action. | Retrying an interrupted completion is idempotent and cannot create duplicate completed workouts. |
| PRD-FR-026 | MVP | Completion and history MUST identify verified personal-record candidates using comparable data and stable rule versions. | Estimated records are labelled “estimated”; corrected/deleted data triggers deterministic recomputation. See `WPR-PR-001`–`WPR-PR-010`. |
| PRD-FR-027 | MVP | Users MUST be able to review workout history, exercise history and a restrained set of question-led progress views. | Every chart names its question, range, units, inclusion rules and empty/insufficient-data state. |
| PRD-FR-028 | MVP | Users MUST be able to edit a completed workout while preserving an edit history sufficient to recompute derived results. | The original completion timestamp remains; an edited timestamp/reason is stored; affected records and recommendations are recalculated. |
| PRD-FR-029 | MVP | The application MUST distinguish planned targets, observed performance, calculated summaries and recommendations in labels and data. | No recommendation or estimate is displayed as an observed fact. |
| PRD-FR-030 | POST | Users MAY opt into a restrained ghost comparison against a comparable prior, best or planned session. | It is off by default, can be hidden instantly and never blocks entry or uses non-comparable exercise variants. |
| PRD-FR-031 | POST | Users MAY create a privacy-reviewed share card from selected workout facts. | The preview shows every included field; notes, location, schedule and account identifiers are excluded by default. |

### 6.5 Guidance and user control

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-032 | MVP | Supported progression rules MUST be deterministic or programme-defined and independently testable. | A rule version, qualifying observations and rounding behavior reproduce the same candidate target. |
| PRD-FR-033 | MVP | A progression recommendation MUST state what was observed, which rule applied, the proposed next target and any material limitation. | It remains pending until accepted, changed or dismissed; acceptance creates a new immutable future programme/template version at an explicit not-started occurrence boundary and never retroactively changes published, active or completed data. |
| PRD-FR-034 | MVP | Users MUST be able to accept, edit, defer or dismiss a recommendation and manually override a planned target. | Accepted edits/overrides are labelled user decisions, preserved through immutable future versions and do not train or infer hidden health conclusions. |
| PRD-FR-035 | MVP | The product MUST suppress progression recommendations when required inputs are incomplete, incomparable, corrected but not recalculated, or outside a validated rule boundary. | It may say why no suggestion is available; it must not fill missing facts with an inferred answer. |
| PRD-FR-036 | FUTURE | Any adaptive or model-generated guidance MUST remain behind a separately approved evidence, safety, privacy and explainability decision. | No autonomous progression, programme generation, injury response or health prediction enters MVP by implication. |

### 6.6 Data control, settings and failure handling

| ID | Phase | Requirement | Acceptance summary |
|---|---|---|---|
| PRD-FR-037 | MVP | Users MUST be able to export all user-entered training data and the metadata necessary to interpret it in a documented, machine-readable format. | Export works offline, includes schema/export versions and reports omissions or failure without claiming success. |
| PRD-FR-038 | MVP | Users MUST be able to delete local data through an explicit, scoped and confirmable flow. | Scope and recoverability are stated before action; an active export may be offered but is never required. Account deletion appears only when an account exists. |
| PRD-FR-039 | FND | Migration, corruption and partial-write handling MUST fail safely and preserve the last known readable data or a recoverable copy. | The app never silently resets to an empty state after a failed migration. See `WPR-RES-007` and `EC-DATA-*`. |
| PRD-FR-040 | MVP | Measurement units, accessibility preferences, timer behavior, recommendation visibility and celebration intensity MUST be configurable. | Unit display changes do not alter canonical stored meaning; reduced motion/sound/haptic choices are respected. |
| PRD-FR-041 | MVP | Empty, permission-denied and local-operation failure states MUST explain what is known, what was not saved and the safe next action. | A failed operation cannot show success or discard entered values solely to clear an error. |
| PRD-FR-042 | FUTURE | If account sync is later introduced, local workout completion MUST not depend on it. | Conflicts preserve both versions until deterministically reconciled; server state cannot silently overwrite newer local work. |

## 7. Non-functional requirements

| ID | Area | Requirement and proposed validation gate |
|---|---|---|
| PRD-NFR-001 | Durability | Zero silent loss of acknowledged workout mutations across the interruption, restart, out-of-storage and migration release suites. “Acknowledged” means local commit succeeded before UI success feedback. |
| PRD-NFR-002 | Offline | All MVP planning, starting, logging, restoration, completion, history, edit, export and delete tasks MUST operate without internet after required app content is installed. Network-only additions must be explicitly labelled and non-blocking. |
| PRD-NFR-003 | Responsiveness | On approved minimum reference devices, set-value input feedback MUST meet p95 <=50 ms/p99 <=100 ms and a durable set commit plus saved feedback MUST meet p95 <=100 ms/p99 <=200 ms under the reference long-workout dataset. All other operation, frame, fixture and measurement contracts in [`../quality/performance-budgets.md`](../quality/performance-budgets.md) are normative and take precedence over summaries here. |
| PRD-NFR-004 | Repeated-task speed | Validation target: from a populated set row, completing a normal set takes one deliberate action; editing the most recent set is reachable in one action; starting the expected workout from Today takes one action when conflict-free. |
| PRD-NFR-005 | Restoration | Validation target: after forced termination, the authoritative active workout becomes usable at p95 <=500 ms after the database is ready on approved minimum devices, with all acknowledged mutations intact. Cold-launch budgets and fixture details are normative in [`../quality/performance-budgets.md`](../quality/performance-budgets.md). |
| PRD-NFR-006 | Accessibility | Critical flows MUST support screen readers, logical focus, non-colour status cues, dynamic text without loss of action, reduced motion, adequate contrast and platform-appropriate touch targets. Large-text and reduced-motion release suites are mandatory. |
| PRD-NFR-007 | One-handed use | Primary repeated controls SHOULD remain in comfortable thumb reach on supported phone sizes; no critical action may depend only on a gesture. |
| PRD-NFR-008 | Privacy | Local-only use requires no account. Training notes, schedule and history are private by default; telemetry, sharing and future sync require explicit scope and purpose. Secrets and health inferences are never written to analytics. |
| PRD-NFR-009 | Explainability | Every displayed recommendation MUST be reproducible from stored rule version and cited observations, and readable without training jargon or hidden scoring. |
| PRD-NFR-010 | Compatibility | Programme/set rules MUST be UI-independent and covered by platform-neutral domain tests. Persisted schemas and exported formats are explicitly versioned and migratable. |
| PRD-NFR-011 | Scale | The reference data suite MUST include a long active workout and a multi-year history; core logging may not degrade materially merely because history grew. Exact dataset sizes and budgets are owned by quality documents. |
| PRD-NFR-012 | Trust | No fake analytics, fabricated duration, placeholder control, unsupported medical claim or marketing statement presented as observed behavior may appear in production. |
| PRD-NFR-013 | Localisation readiness | User-facing strings, pluralisation, dates, decimal input and units MUST be externalised and locale-aware; canonical quantities remain unambiguous. MVP language coverage is a release decision, not assumed here. |
| PRD-NFR-014 | Security | Destructive operations require explicit intent; imported/exported data is treated as untrusted; logs redact free-text notes and identifiers. Security controls may not compromise local durability. |

## 8. Product success measures

These measures test whether the promise is being met. They are proposed thresholds for moderated studies, instrumented betas or release tests, not current results. Analytics require a separate consent and privacy decision; equivalent local usability research may be used.

| ID | Question | Measure | Foundation/MVP target | Guardrail |
|---|---|---|---|---|
| PRD-SM-001 | Is the next workout understandable? | Participants correctly identify next session, focus and exceptional state from Today in a timed usability task | Initial eight-person gate: >=7/8 without assistance in <=5 seconds; use >=90% when a later sample can support a percentage target | No increase in Today information beyond approved hierarchy to chase the metric |
| PRD-SM-002 | Is starting fast? | Expected-workout action count and completion rate | One deliberate action; >=95% task completion without assistance | Unscheduled start remains discoverable |
| PRD-SM-003 | Is logging fast? | Median time from reviewing a valid populated normal-set row to committed completion in repeated-use study | <=3 seconds; p90 <=6 seconds | Error rate <=1%; accessibility users assessed separately rather than excluded |
| PRD-SM-004 | Is correction easy? | Successful edit of most recent incorrect set | >=95% unassisted; median <=10 seconds | Edit history and record recalculation remain intact |
| PRD-SM-005 | Is local reliability credible? | Acknowledged mutations retained across automated failure matrix | 100% in release suite; zero silent loss | Failures must not be hidden by dropping cases |
| PRD-SM-006 | Does flexibility reduce schedule friction? | Users successfully resolve miss/reschedule/skip/repeat scenario and predict what comes next | >=90% correct prediction without assistance | No guilt language or automatic sequence advance |
| PRD-SM-007 | Is guidance understandable? | Users can state observation, proposed change and ability to override | >=85% correct after reading one recommendation | Acceptance rate is not a success target; dismissal is valid |
| PRD-SM-008 | Is the product broadly usable? | Task completion across new, intermediate, experienced, general-fitness and schedule-variable cohorts | No cohort more than 10 percentage points below aggregate on critical tasks | Do not erase advanced capability to equalise results |
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

The account-free local-first default, equal fixed/flexible scheduling and user-controlled rules-based guidance are recommendations within this proposed MVP, not extra owner questions. At the foundation milestone, ask the product owner only the agreed decisions:

1. Which visual direction to adopt.
2. Which elements from the other directions to combine.
3. Whether the proposed MVP boundary is acceptable.
4. Whether the architecture recommendation is acceptable.
5. Whether any feature should be added, removed or deferred.
6. Whether the product feels broad enough for mainstream gym users.
7. Whether any part feels generic, cluttered or unnecessarily complicated.

The following are deliberately deferred to normal product/implementation validation rather than silently assumed or escalated now: minimum supported OS versions, launch locales, template catalogue content and professional review process, analytics consent model, final e1RM rule, portable-restore timing, and any paid offering.
