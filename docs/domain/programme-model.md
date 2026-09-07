# Programme model specification

Status: proposed normative domain model  
Last updated: 2026-08-06  
Related: [`workout-progression-rulebook.md`](workout-progression-rulebook.md), [`set-types.md`](set-types.md)

## Logging-first applicability — 2026-09-07

The owner-approved scope in [D-009](../project/decision-log.md) and the [current PRD](../product/product-requirements.md) takes precedence over the earlier broad foundation contract below. Blank workouts, repeats and standalone reusable routines require no goal, programme, enrolment, planned occurrence or schedule. Scheduling/sequence automation, carry-forward, ranked substitution recommendations, short-workout adaptation and progression suggestions are deferred; retained rules describe future contracts, not first-release obligations. Core set integrity, comparable descriptive records, editing, offline restoration and data ownership remain required. The current web prototype demonstrates interaction only, with memory that resets on reload; production durability gates remain future work.


## 1. Purpose and modelling choices

This specification defines the logical programme model. It deliberately separates an authored plan from a scheduled occurrence, an active session and observed performance:

`Programme → ProgrammeVersion → ProgrammeWorkout → WorkoutTemplateVersion → PlannedExercise → PlannedSet`

`ProgrammeVersion + ProgrammeEnrolment + ScheduleState → PlannedWorkoutOccurrence`

`PlannedWorkoutOccurrence? + snapshot → ActiveWorkout → CompletedWorkout`

A programme is the user's enduring plan container. A programme version is immutable after publication. A programme enrolment is one user's live/run-specific progress through a selected version; it owns the schedule cursor and can finish while the reusable programme remains available. `ProgrammeWorkout` is a version's ordered reference to one exact immutable version of a logical workout template; a template version describes repeatable intent and may also exist outside a programme for reuse. An occurrence is one resolvable appearance of that programme-workout/template version in an enrolment schedule. A session is what actually happened. This prevents later plan or standalone-template edits from rewriting history and allows a programme to be repeated without erasing its prior run.

Stable identifiers are opaque UUID/ULID-equivalent values. The examples use readable IDs only for clarity. Display names, array indexes and dates MUST NOT be identity.

### 1.1 Architecture terminology and state mapping

The conceptual storage model in [`../architecture/data-model.md`](../architecture/data-model.md) maps to this domain model as follows. Domain names and invariants are canonical for behavior; storage may normalise them without changing meaning.

| Domain term | Architecture entity/fields | Mapping constraint |
|---|---|---|
| `Programme` | `Programme` | Reusable user-owned plan identity; active/completed is not the programme's run state |
| `ProgrammeVersion` | `ProgrammeVersion` | Immutable after publish/use; monotonically versioned |
| `ProgrammeWorkout` | `ProgrammeWorkout` | Ordered membership from a programme version to one exact `WorkoutTemplateVersion` |
| `WorkoutTemplateVersion` | `WorkoutTemplateVersion` | Immutable content; logical `WorkoutTemplate` supplies reusable identity |
| `PlannedExercise` / `PlannedSet` | architecture `TemplateExercise` plus owned target/set rows | Must retain all orthogonal set fields from [`set-types.md`](set-types.md), stable order and rule version |
| `ProgrammeEnrolment` | `ProgrammeEnrolment` | Run-specific adopted version, pointer and last-advanced command; at most one primary active enrolment drives Today in MVP |
| `PlannedWorkoutOccurrence` | `PlannedWorkout` | Must retain a stable **logical occurrence ID** across a move. If storage creates lineage rows with `supersedes_id`, each row also carries/derives the same lineage-root logical occurrence ID |
| `ActiveWorkout` / `CompletedWorkout` | state-specific projections of `WorkoutSession` | They are not duplicate stores; the session snapshot is authoritative |
| `ScheduleState` | enrolment pointer plus occurrence dispositions | Pointer/revision update is atomic with completion/skip and idempotency receipt |

Occurrence state projection is explicit:

| Domain state | Storage representation |
|---|---|
| `planned` | `PlannedWorkout.status=planned` with no terminal disposition |
| `missed` (unresolved) | `status=planned` plus explicit/derived `missedUnresolved` disposition from stored local date/time-zone; never `skipped` |
| `active` | `PlannedWorkout.status=started` plus the unique linked active `WorkoutSession` |
| `completed` | `status=completed`; linked session `completionKind=full` |
| `completedPartial` | `status=completed`; linked session `completionKind=partial` with child completed/skipped/not-attempted dispositions |
| `skipped` | `status=skipped` plus the selected skip/return policy |
| `cancelled` | `status=cancelled` plus reason/provenance |
| moved occurrence | Domain returns to `planned` at new intent while preserving logical occurrence identity; storage MAY retain an old row as `moved` and a replacement lineage row, but only one live row may resolve/start/complete |

Architecture rework is required if the storage schema cannot express `missedUnresolved`, `completionKind`, child `notAttempted`, or stable logical occurrence identity across move lineage. Treating missed as skipped or partial as full would violate `WPR-SCH-006` and `WPR-SES-006`.

## 2. Aggregate and entity contracts

### PM-ENT-001 Programme

| Field | Required | Contract |
|---|---:|---|
| `programmeId` | yes | Immutable stable identity |
| `ownerProfileId` | yes | Local profile in MVP; future account identity is separate |
| `name` | yes | Trimmed, 1–120 Unicode grapheme clusters; not globally unique |
| `status` | yes | `draft`, `available`, `archived`, `softDeleted`; run state belongs to ProgrammeEnrolment |
| `currentPublishedVersionId` | conditional | Required for available/archived programmes |
| `createdAt`, `updatedAt` | yes | Absolute instants plus source time-zone metadata where relevant |
| `sourceTemplateRef` | no | Catalogue template ID/version used to create it; provenance only |

### PM-ENT-002 ProgrammeVersion

| Field | Required | Contract |
|---|---:|---|
| `programmeVersionId`, `programmeId` | yes | Immutable version identity and parent |
| `versionNumber` | yes | Positive, strictly increasing within programme |
| `status` | yes | `draft`, `published`, `retired`, `cancelled`; use/adoption state belongs to ProgrammeEnrolment |
| `publishedAt` | conditional | Required once published; an enrolment version-adoption event stores its effective occurrence boundary |
| `scheduleDefinition` | yes | One fixed or flexible definition (`PM-SCH-*`) |
| `programmeWorkoutIds` | yes | Ordered non-empty unique list; every item references one exact immutable workout-template version |
| `progressionPolicyRefs` | no | Versioned supported rules only |
| `defaults` | yes | Disclosed rest, units/display hints, short-mode policy; missing values resolve through `WPR-REST-001` |
| `changeSummary`, `predecessorVersionId` | conditional | Required after v1 to support review/audit |
| `contentReviewStatus` | conditional | Required for product-authored template content; `unreviewed/reviewed/rejected/expired` |

### PM-ENT-003 ProgrammeWorkout and WorkoutTemplateVersion

| Field | Required | Contract |
|---|---:|---|
| `programmeWorkoutId`, `programmeVersionId` | yes | Ordered membership identity and immutable owning programme version |
| `workoutTemplateId`, `workoutTemplateVersionId` | yes | Logical reusable template identity plus exact immutable content version |
| `sequenceOrder` | yes | Unique integer ordering key within the programme version; schedule entries reference membership, not name |
| `programmeLabelOverride` | no | Optional label within this programme; does not change template identity/history |
| `name` | yes | Template-version name, trimmed 1–120 grapheme clusters; programme memberships remain distinguishable after normalisation |
| `focusText` | no | Template-version plain-language user/content-author text; not inferred health effect |
| `durationEstimateInputs` | no | Template-version explicit overhead/rest/movement inputs; never an unsupported guaranteed duration |
| `plannedExerciseIds` | yes | Ordered, non-empty list owned by the workout-template version |
| `defaultRestSeconds` | no | Integer 0–7,200; 0 means no timed rest, not missing |
| `repeatPolicy` | no | Programme membership/completion semantics; not a mutable property of completed occurrences |

### PM-ENT-004 PlannedExercise

| Field | Required | Contract |
|---|---:|---|
| `plannedExerciseId`, `workoutTemplateVersionId` | yes | Stable identity and immutable template-version parent |
| `exerciseDefinitionId`, `exerciseDefinitionVersion` | yes | Exact intended exercise/variation definition |
| `orderKey` | yes | Stable sortable key; list position is not identity |
| `plannedSetIds` | yes | At least one valid planned set |
| `groupRef` | no | Superset/circuit group and within-group order (`PM-GRP-*`) |
| `priority` | yes | Integer 1–5; default 3 (normal). Lower number means keep earlier in short mode |
| `minimumWorkingSets` | yes | Integer 0..working planned count |
| `notes` | no | Programme-scoped note reference |
| `restSecondsOverride` | no | Integer 0–7,200 |
| `substitutionPolicy` | no | Authored alternatives and required equipment filters |
| `progressionRuleRef` | no | One supported rule/version or manual |

### PM-ENT-005 PlannedSet

| Field | Required | Contract |
|---|---:|---|
| `plannedSetId`, `plannedExerciseId` | yes | Stable identity and parent |
| `orderKey` | yes | Unique within exercise |
| `setRole` | yes | `warmUp`, `working` or `drop`; semantics in `ST-ROLE-*` |
| `measurementTarget` | yes | Valid exact/range target compatible with exercise mode |
| `loadTarget` | conditional | Required only when the load mode/rule needs it |
| `effortIntent` | yes | Default `standard`; other values defined by `ST-EFF-*` |
| `requiredEffortRating` | no | Named `RPE` or `RIR`, never ambiguous “effort” |
| `restSecondsOverride` | no | Integer 0–7,200 |
| `optionalInShortMode` | yes | Boolean; warm-ups are not automatically optional |
| `dropParentPlannedSetId` | conditional | Required for a drop set and must precede it in same exercise |

### PM-ENT-006 ExerciseGroup

| Field | Required | Contract |
|---|---:|---|
| `groupId`, `workoutTemplateVersionId` | yes | Identity and immutable template-version parent |
| `groupType` | yes | `superset` (two or more members) or `circuit` (two or more members; product copy may distinguish intent) |
| `memberPlannedExerciseIds` | yes | Ordered unique list; each member belongs to at most one group |
| `roundTarget` | no | Positive integer; absence means each exercise follows its planned sets without round enforcement |
| `restBetweenMembersSeconds` | no | Integer 0–7,200 |
| `restAfterRoundSeconds` | no | Integer 0–7,200 |
| `shortModeSplittable` | yes | Boolean; effect governed by `WPR-SHORT-004` |

### PM-ENT-007 PlannedWorkoutOccurrence

| Field | Required | Contract |
|---|---:|---|
| `occurrenceId` | yes | Stable identity; moving preserves it, repeating creates another |
| `programmeEnrolmentId`, `programmeVersionId`, `programmeWorkoutId`, `workoutTemplateVersionId` | yes | Exact run, programme membership and immutable content source |
| `kind` | yes | `scheduledWorkout`, `reinsertedWorkout`, `restDay` |
| `plannedLocalDate` | conditional | Required for fixed occurrences; optional reminder date for flexible, never cursor identity |
| `scheduleTimeZone` | conditional | IANA zone for calendar interpretation |
| `sequenceOrdinal` | conditional | Required for flexible occurrence; monotonically identifies cursor cycle/position |
| `state` | yes | State machine `PM-OCC-*` |
| `sourceOccurrenceId` | no | Required for repeat/reinsert derivation |
| `resolution` | no | Skip/move/count-ad-hoc decision plus timestamp and user scope |

### PM-ENT-008 ScheduleState

| Field | Required | Contract |
|---|---:|---|
| `programmeEnrolmentId`, `programmeVersionId` | yes | One current state per enrolment and its adopted version |
| `mode` | yes | `fixed` or `flexible` |
| `cursor` | yes | Fixed unresolved occurrence boundary or flexible workout index/cycle |
| `lastTransitionId` | yes | Idempotency token for this enrolment's schedule update |
| `revision` | yes | Monotonic optimistic-concurrency revision |

### PM-ENT-009 ProgrammeEnrolment

| Field | Required | Contract |
|---|---:|---|
| `programmeEnrolmentId`, `programmeId` | yes | Stable run/progress identity and plan container |
| `currentProgrammeVersionId` | yes | Exact adopted immutable version for future occurrences |
| `status` | yes | `active`, `paused`, `completed`, `archived` |
| `isPrimary` | yes | At most one live enrolment is primary for Today in MVP; other programmes remain available without competing next-workout claims |
| `startedAt`, `completedAt` | yes/conditional | Completion time required only when completed |
| `versionAdoptionEvents` | yes | Ordered old/new version and first affected not-started occurrence; never rebases started/completed sessions |
| `scheduleStateId` | yes | Current cursor/revision for this enrolment |
| `lastAdvancedCommandId` | no | Idempotency protection for completion/skip transitions |

Active/completed workout fields belong to the architecture data model, but each session MUST store `sourceProgrammeEnrolmentId?`, `sourceProgrammeVersionId?`, `sourceProgrammeWorkoutId?`, `sourceWorkoutTemplateVersionId?`, `sourceOccurrenceId?`, a self-contained plan snapshot and a unique completion idempotency token.

## 3. Programme and version state machines

### PM-STATE-001 Programme and enrolment

Allowed transitions:

- Programme `draft → available`: after full validation and publishing at least one version.
- Programme `available → archived`: explicit user action; enrolment/history remains readable.
- Programme `archived → available`: explicit restore; it does not resume/create an enrolment automatically.
- Enrolment `active ↔ paused`: explicit user action; paused enrolments produce no primary Today workout.
- Enrolment `active → completed`: configured terminal condition reached and acknowledged.
- Enrolment `active|paused|completed → archived`: explicit user action; history remains readable.
- Repeating a completed run creates a new enrolment/cursor; it never resets the completed enrolment in place.
- any non-deleted state `→ softDeleted`: explicit destructive action; referential history/export policy applies.

Disallowed: enrolment `completed → active` in place, published version `→ draft`, mutating a published/used version, or hard-deleting a programme that still owns retained completed history.

### Versioning (PM-VER-001 through PM-VER-005)

| ID | Invariant |
|---|---|
| PM-VER-001 | A programme version is mutable only while `draft`. Publishing freezes its membership graph and exact workout-template-version references; referenced template versions are themselves immutable once published/used. |
| PM-VER-002 | Editing published content clones the latest appropriate version to a new draft; publication/adoption is atomic. Cancelling the draft leaves each enrolment on its prior adopted version. |
| PM-VER-003 | For a live enrolment, version adoption's effective boundary is the first not-started occurrence selected in preview. Started/completed sessions never rebase. |
| PM-VER-004 | A scheduled enrolment version adoption may be replaced/cancelled before its boundary; the operation records both decisions and cannot orphan an occurrence. |
| PM-VER-005 | Template catalogue version and user programme version are independent; adoption provenance never creates live linkage. |

**Example.** `pgm-v2` becomes effective from occurrence `occ-104`. `occ-103` was started but not completed: it keeps the v1 snapshot. `occ-104` and later unresolved/generated occurrences use v2. Editing v2 creates v3; it never changes v2 records.

## 4. Schedule definitions and state transitions

### PM-SCH-001 Fixed definition

Each recurrence entry contains a stable recurrence ID, programme-workout ID (therefore an exact workout-template version), IANA time zone, weekday/local-time or explicit local-date rule, optional end condition and collision policy. Generation is a deterministic projection window; an occurrence once persisted retains identity even if later moved.

### PM-SCH-002 Flexible definition

Contains the ordered, non-empty programme-workout IDs, start cursor, repeat mode (`repeat`, `finite`) and skip default (`advance`, `defer`, `askEveryTime`). Dates MAY be reminders but do not determine cursor identity.

### PM-OCC-001 Occurrence states

Allowed transitions are:

```text
planned ──start──────────────> active ──complete────────> completed
   │                              │
   ├─move──────> planned          ├─discard─────────────> planned|cancelled
   ├─mark missed> missed          └─complete partial────> completedPartial
   ├─skip──────> skipped
   └─cancel────> cancelled

missed ──do now/move─────────> planned
missed ──start───────────────> active
missed ──skip────────────────> skipped
```

`completedPartial` is a completion outcome, not an active error. A flexible occurrence normally remains `planned` across date passage; it receives `missed` only if a future explicitly date-committed flexible mode is added and defined separately.

### PM-SCH-003 Next-workout selector

Given one primary active programme enrolment and no active session:

1. If its fixed schedule has unresolved `missed` occurrences, select the earliest by planned local date, then recurrence order, then occurrence ID. Surface the count of other unresolved items.
2. Otherwise select the earliest `planned` fixed occurrence at/after the schedule boundary.
3. For flexible mode, materialise/select the occurrence at `(cycle, cursorIndex)`.
4. Rest-day occurrences may be shown as today context but are not returned as the startable next workout.
5. If the finite sequence is exhausted, return `programmeComplete`, not a fabricated repeat.

Given an active session, Today returns that session as the primary resume state regardless of planned occurrence ordering (`WPR-SES-002`).

### PM-SCH-004 Schedule transition transaction

On idempotent workout completion:

1. verify the completion token has not been applied to the enrolment/session;
2. freeze the completed workout snapshot;
3. resolve/link the source occurrence if any;
4. advance the enrolment's flexible cursor exactly once only if the session was configured to count;
5. compute the next state and persist `lastTransitionId`;
6. invalidate derived Today/progression/record projections;
7. commit all steps atomically.

Retry with the same completion token returns the existing result. A different token for an already-completed active-session ID is rejected as a conflict.

## 5. Programme validation

Validation returns stable code, entity/path, plain-language message and suggested recovery. It never drops the invalid draft.

| ID | Validation rule |
|---|---|
| PM-VAL-001 | Programme name is present and within 1–120 grapheme clusters after trimming. |
| PM-VAL-002 | A programme version contains 1–50 workout templates; each contains 1–100 planned exercises. These are technical support bounds, not safety limits. |
| PM-VAL-003 | Ordered membership/child IDs are unique, every programme-workout references a resolvable immutable template version, all referenced children exist under the correct owning version, and order keys are unique within each parent. |
| PM-VAL-004 | Exactly one valid schedule definition exists; every scheduled programme-workout ID belongs to the programme version. |
| PM-VAL-005 | Fixed recurrence entries have a valid local calendar rule and IANA zone; flexible sequences have a non-empty unique ordered sequence and valid cursor. |
| PM-VAL-006 | Every planned exercise references a resolvable versioned exercise definition and has 1–100 planned sets. |
| PM-VAL-007 | Every planned set is compatible with the exercise measurement/load mode and passes `ST-VAL-*`. |
| PM-VAL-008 | `minimumWorkingSets` is 0..working-set count; priority is 1..5; short-mode optionality cannot contradict a programme-authored required minimum. |
| PM-VAL-009 | MVP group membership is unique and one-level: a group has >=2 planned-exercise members in the same workout-template version, an exercise belongs to at most one group, and a group cannot contain another group. Member/group order is unambiguous. |
| PM-VAL-010 | A drop parent exists in the same planned exercise, precedes the child and does not create a cycle. |
| PM-VAL-011 | A progression rule is supported/versioned, references compatible target fields and specifies increment/rounding/qualification needed for deterministic evaluation. |
| PM-VAL-012 | Version numbers strictly increase; enrolment adoption boundaries cannot precede started/completed work; an enrolment has exactly one adopted version at any occurrence boundary and at most one pending next adoption. |
| PM-VAL-013 | A live enrolment has one valid schedule state; no more than one enrolment is `active` and `isPrimary=true` for the local profile in MVP. |

Support bounds in `PM-VAL-002` and `PM-VAL-006` protect storage/UI/testability. Exceeding them should invite splitting the content or exporting for review; error copy MUST NOT say a plan is unsafe.

## 6. Group and round semantics

| ID | Rule |
|---|---|
| PM-GRP-001 | A superset/circuit groups exercises for order/rest presentation. It does not merge their performances or set identities. |
| PM-GRP-002 | If `roundTarget` exists, round `r` consists of the `r`th eligible planned working set of each member in member order; exercises may have additional non-round sets before/after. |
| PM-GRP-003 | A missing member set in a partial round is skipped/not attempted, never auto-completed. The next round is accessible only according to UI preference; data semantics remain independent. |
| PM-GRP-004 | Reordering a member outside its group explicitly ungroups it for the active session. Updating future structure requires a new programme version. |
| PM-GRP-005 | Rest between members and rest after round resolve separately; neither timer blocks logging. |
| PM-GRP-006 | MVP supports creating, editing and executing only simple non-nested superset/circuit groups. Nested groups, reusable group presets, conditional members/rounds and cross-workout group automation are post-MVP (`FEAT-POST-010`). |

## 7. Duration estimate contract

`estimate = known timed-set seconds + planned rest seconds + configured per-set transition overhead + configured per-exercise transition overhead`.

- Rep-based set duration is unknown unless an explicit pace estimate exists; product-authored default overhead may be used only if labelled approximate and documented.
- Range results are preferred when any component is a range.
- User edits or short-mode preview recompute from the session plan snapshot.
- The result is an estimate, not a promise or safety/recovery assertion (`WPR-SHORT-005`).

## 8. Editing, deletion and history

| ID | Rule |
|---|---|
| PM-HIST-001 | Enrolment pause/archive removes its next workout from Today; programme archive removes it from creation surfaces. Both preserve versions and history. |
| PM-HIST-002 | Soft deletion hides programme planning content after the stated recovery window, but retained completed sessions keep enough snapshot data for interpretation/export. |
| PM-HIST-003 | Removing an exercise from a new version does not delete occurrences/sessions based on old versions. |
| PM-HIST-004 | Changing exercise identity is not a rename if measurement interpretation changes; it requires a new exercise-definition version and migration decision. |
| PM-HIST-005 | Sequence resets are explicit events with old/new cursor, reason and effective occurrence; they never rewrite prior sequence ordinals. |

## 9. Worked examples

### PM-EX-001 Fixed week with a miss

Version v1 schedules A Monday and B Thursday. A is completed. Thursday B passes unresolved and becomes `missed`. The following Monday A also exists, but selector returns the missed B first with two explicit choices: resolve B or act on another occurrence. Choosing “skip B and omit” marks only B skipped; A remains Monday's occurrence. No completed data changes.

### PM-EX-002 Flexible sequence and repeat

Cursor is B in A → B → C → repeat. User chooses “repeat A” as an unscheduled workout and leaves “affect sequence” off. New occurrence `repeat-A-2` links to A but B remains the expected session. Completing B later advances the cursor to C once.

### PM-EX-003 Programme edit during active workout

The user starts Upper from v4, then edits the programme to v5 while Upper remains active. The active workout retains its v4 snapshot. The edit preview chooses the next not-started occurrence as v5's effective boundary. Completion uses v4's progression rule and updates the schedule once; future occurrence content uses v5.

### PM-EX-004 Partial circuit

A three-member circuit has three rounds. The user completes round 1 and only members 1–2 of round 2, then finishes partial. Five completed sets remain observed; member 3 round 2 and all round 3 sets are `notAttempted`. No sets are invented to make rounds rectangular.

## 10. Model acceptance scenarios

The executable behavior is specified in [`domain-test-scenarios.md`](domain-test-scenarios.md), especially `TS-PGM-001`–`TS-PGM-006`, `TS-SCH-001`–`TS-SCH-012` and `TS-SES-001`–`TS-SES-010`. Edge inputs are catalogued under `EC-PGM-*`, `EC-SCH-*`, `EC-SES-*` and `EC-TIME-*` in [`edge-cases.md`](edge-cases.md).
