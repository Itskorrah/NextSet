# NextSet user journeys and interaction specifications

Status: revised logging-first critical journeys accepted by product owner on 2026-09-07 (D-010)  
Last updated: 2026-09-07

## Current scope and evidence boundary

These are internal journey names, never a menu of “journeys” users must select. The owner accepted logging, repeat, optional routines, history, meaningful trends and the detailed core interactions below on 2026-09-07. No routine, goal, programme, date or recommendation is needed at any point in the core loop.

Stable `JNY-*` IDs are retained. `JNY-002`, `JNY-005`, `JNY-011`, `JNY-021`–`JNY-023` and `JNY-025` are **POST**, preserved at the end for reference. `JNY-015` now covers manual session exercise changes; its earlier ranked-guidance variant is POST. References to broader domain tests apply only to approved current behaviour, never to deferred engines by implication.

This document describes the future production contract. The disposable prototype demonstrates only the supported subset stated in its [README](../../prototypes/nextset-directions/README.md) and [QA record](../../prototypes/nextset-directions/design-qa.md). Browser/in-session state is not evidence of native persistence, export, migration or device accessibility. No prototype sample is production evidence.

## 1. Shared interaction contract

These journeys specify intent and domain outcomes, not a selected visual direction. All are mobile-first, one-handed where practical, offline-capable for MVP core work, screen-reader operable, usable with larger system text and compatible with reduced motion. **MUST** is normative.

Common behavior:

- A saved acknowledgement appears only after the local transaction commits (`WPR-RES-001`).
- Back/leave never discards a valid draft without warning; validation points to the field and preserves other input.
- Planned, observed, calculated and recommended values use distinct labels (`WPR-INV-003`).
- Advanced fields are disclosed when the user enables or needs them, not during every default action.
- Destructive actions state scope and recoverability before confirmation.
- Network absence never blocks the MVP routine/workout/history/export journeys after required content is installed.
- Haptic, animation, colour and sound are supplementary; semantic text/state always conveys the result.
- “Friction removed” names avoidable steps. It does not permit removal of deliberate start, destructive confirmation, scope choice or recommendation approval.

Acceptance references `PRD-FR-*`, `WPR-*` and the test catalogue in [`../domain/domain-test-scenarios.md`](../domain/domain-test-scenarios.md).

## 2. Immediate entry and optional routines

### JNY-001 First launch without setup

**Phase:** MVP.  
**Intention.** Begin logging immediately without account, goal, programme, schedule or experience selection.  
**Entry.** First launch or an empty local history.

**Steps and decisions.**

1. Open Workouts with a dominant Start workout action and concise product context. No setup-completion state is required.
2. Activate Start workout to open a truly empty session (`JNY-007`), then Add exercise.
3. See explicit measurement units at set entry; change preferences later without a tutorial or questionnaire.
4. Use blank workouts indefinitely. Routines, History, Progress and Settings remain available without completing onboarding.

**Feedback and decisions.** There is no compulsory goal/routine wizard or “choose a journey” question. History/progress explain why empty without sample records.  
**Failure and recovery.** Local defaults/save failure uses JNY-035 and retains user input. An active session from a prior launch takes precedence; a failed read is not an empty first launch.  
**Acceptance.** PRD-FR-001, PRD-FR-009–PRD-FR-010, AC-START-01; one action reaches a blank workout offline, with no exercises or recorded sets silently inserted.


### JNY-003 Previewing and starting an optional routine

**Phase:** MVP.  
**Intention.** Reuse familiar exercises without following a scheduled programme.  
**Entry.** Workouts → Routines → selected routine.

**Steps and decisions.**

1. Preview the routine name, exercises/order and any optional set/rest targets.
2. Choose Start routine; create a new independent session snapshot with new session/set IDs and no completed observations.
3. Log, add, change or omit exercises as needed. The source routine remains unchanged.
4. Resolve any existing active session through Continue or explicit finish/discard; never replace it silently.

**Feedback and decisions.** Copied targets and previous values are labelled references, never current observations. No goal, sequence, duration prediction or progression summary is required.  
**Failure and recovery.** Failed start retains the routine and any active session; retry is idempotent. No routines yields Create routine plus a blank Start workout path.  
**Acceptance.** PRD-FR-002, PRD-FR-005, PRD-FR-011; source unchanged, completion flags reset and no programme/enrolment/occurrence required.


### JNY-004 Creating or saving a reusable routine

**Phase:** MVP.  
**Intention.** Avoid re-entering a familiar workout while keeping routines optional.  
**Entry.** Workouts → Routines → Create routine, or completed workout → Save as routine.

**Steps and decisions.**

1. Name the routine and add/search exercises; when saving completed work, copy its exercise order and eligible reference targets with provenance.
2. Optionally set independent set/reps/time/rest targets and notes. No target, goal, schedule, progression rule or group authoring is mandatory.
3. Reorder/remove exercises with visible accessible alternatives to drag; validate supported fields without clearing input.
4. Save the routine. Save does not start a workout, mark any set performed or alter source history.

**Feedback and decisions.** A saved routine becomes an optional start shortcut. Separate routine notes/targets from the completed source workout facts.  
**Failure and recovery.** Invalid fields remain drafts with precise errors. Failed save creates no partially usable routine and preserves the draft for retry.  
**Acceptance.** PRD-FR-003, PRD-FR-005–PRD-FR-006; saved routines are independent of programmes and schedules; source completion and PRs unchanged.


## 3. Workouts and starting

### JNY-006 Opening Workouts

**Phase:** MVP.  
**Intention.** See the next useful action without interpreting a dashboard.  
**Entry.** Normal launch, Workouts tab or return from completion.

**Steps and decisions.**

1. If a session is active, show Continue workout as the dominant action with brief recorded progress.
2. Otherwise show Start workout as the dominant action; optional recent-repeat and routine entries are secondary.
3. Open History or Progress using stable labelled navigation without starting or configuring anything.

**Feedback and decisions.** No fictional scheduled-next-workout, streak penalty, decorative metric or compulsory planning action appears. Empty history does not change navigation.  
**Failure and recovery.** Failed active/history reads expose recovery, not a misleading blank start. No second session is created while an existing one remains unresolved.  
**Acceptance.** PRD-FR-009, AC-TODAY-01, AC-ACTIVE-01, PRD-SM-001; users identify how to start/continue within the proposed comprehension budget.


### JNY-007 Starting a blank workout

**Phase:** MVP.  
**Intention.** Record whatever is being done today without a plan.  
**Entry.** Workouts → Start workout.

**Steps and decisions.**

1. Activate Start workout once.
2. Atomically create one new active session with an empty exercise list and no programme, routine, occurrence, targets or recorded sets.
3. Show Add exercise. Choose an exercise and enter the first set through JNY-009.
4. Continue adding exercises/sets or leave/resume; naming the workout is optional and editable.

**Feedback and decisions.** The empty state clearly says to add an exercise. Success feedback follows the local transaction, not merely button activation.  
**Failure and recovery.** Duplicate taps/retries create one session. Save failure shows no successful start and retains the prior state. If an active session exists, offer Continue.  
**Acceptance.** PRD-FR-010, PRD-FR-015, AC-START-01; one deliberate start action and zero seeded exercises/observations, including repeat visits.


### JNY-008 Choosing a start shortcut

**Phase:** MVP.  
**Intention.** Use an existing routine or completed workout without changing the simple default.  
**Entry.** Workouts secondary routines/recent area or History detail.

**Steps and decisions.**

1. Choose a routine preview (`JNY-003`) or Repeat workout (`JNY-024`).
2. Inspect the source if needed; start a fresh session with copied reference context and no recorded sets.
3. Keep blank Start workout available without any dependency on saved content.

**Feedback and decisions.** Each shortcut names its source. No “does this advance your programme?” question exists.  
**Failure and recovery.** An active session takes precedence and source-not-found leaves current data untouched. Cancel preserves navigation and session state.  
**Acceptance.** PRD-FR-011, AC-START-02; routine/repeat are discoverable secondary choices and never prerequisites.


## 4. Active workout and set entry

### JNY-009 Logging a normal set

**Intention.** Record a working set with minimal attention and continue training.  
**Entry.** Active workout, focused set row.

**Steps and decisions.**

1. Review any optional routine/repeat target and comparable previous value, each clearly labelled; a blank workout needs neither.
2. Enter/adjust applicable load and reps/time; previous/planned values may be reference/prefill but remain draft.
3. Activate Log set once.
4. System validates and atomically commits the set plus timer anchor where configured; saved feedback appears, next focus advances predictably and non-blocking rest begins.

**Feedback and decisions.** Completed state uses text/semantics plus optional haptic; progress and any target-relative label update. A PR remains a candidate until session completion.  
**Failure and recovery.** Field error preserves values/focus. Transaction failure keeps draft and prior revision, never a checkmark. Termination after acknowledgement restores the set.  
**Friction removed.** One completion action once values are valid; numeric keyboard flow; no modal, celebration or timer takeover.  
**Acceptance.** `PRD-FR-017`–`PRD-FR-019`, `ST-UX-001`–`ST-UX-006`, `TS-JNY-002`; median task target `PRD-SM-003`; screen reader announces value, set index, role, state and error.

### JNY-010 Logging a warm-up set

**Intention.** Preserve preparation work without mixing it into working performance/records.  
**Entry.** Planned warm-up row or “Add set” → Warm-up.

**Steps and decisions.**

1. Use a row visibly labelled Warm-up; add more or convert role before completion if needed.
2. Enter compatible measurement/load and complete as in `JNY-009`.
3. History/progress summary records it with warm-up role and excludes it from MVP working metrics.

**Feedback and decisions.** Warm-up saved state is equal in reliability but visually subordinate to working targets.  
**Failure and recovery.** Role conversion after completion is an edit and recomputes derived data; invalid fields retain draft.  
**Friction removed.** Same row mechanics as normal sets; no separate warm-up screen.  
**Acceptance.** `WPR-SET-005`, `ST-ROLE-001`, `TS-SET-011`; a heavier warm-up never becomes a working PR input.


### JNY-012 Editing an incorrect set

**Intention.** Correct the latest or any completed set without uncertainty about saving.  
**Entry.** Tap completed set row; newest-set Edit is one action away.

**Steps and decisions.**

1. Open row in edit state with current values and role.
2. Change fields; review any comparison-signature/role consequence if material.
3. Save atomically; derived progress, timer-independent state, PR candidates and derived summaries recompute/invalidate.
4. Optionally delete with immediate recovery where feasible.

**Feedback and decisions.** Edited marker/history is available without cluttering the row. Saved feedback waits for commit.  
**Failure and recovery.** Invalid edit retains original completed revision as authoritative and edit draft visible. Recalculation failure cannot produce mixed old/new derived state.  
**Friction removed.** No trip to History for active-session correction; no save of unchanged fields required.  
**Acceptance.** `PRD-FR-017`, `ST-UX-003`, `TS-EDIT-001`, `PRD-SM-004`; correcting latest set is unassisted and does not advance exercise/timer again.

### JNY-013 Adding another set

**Phase:** MVP.  
**Intention.** Record extra work without editing a routine.  
**Entry.** Active exercise → Add set or next blank set entry.

**Steps and decisions.**

1. Create an independent draft set; optional prior values are reference hints with completion cleared.
2. Enter valid measurements and optionally choose Warm-up, then Log set.
3. Continue beyond a routine target if desired; this changes only the current session.

**Feedback and decisions.** Blank workouts have no planned denominator; an extra set is simply recorded work, not a deviation needing a reason.  
**Failure and recovery.** Invalid input remains draft. Failed commit retains earlier sets and attempted values; no routine/history mutation occurs.  
**Acceptance.** PRD-FR-017–PRD-FR-020; stable set identity and transaction/restore assertions, with no progression dependency.


### JNY-014 Reordering exercises

**Phase:** MVP.  
**Intention.** Adapt workout order without losing recorded values.  
**Entry.** Active workout exercise list → Move up/down or accessible reorder.

**Steps and decisions.**

1. Move an exercise using visible actions or an equivalent optional drag shortcut.
2. Commit the new order while keeping sets and draft context attached to stable exercise-performance IDs.
3. Leave source routine/history unchanged; Save as routine is a separate optional action after completion.

**Feedback and decisions.** Announce the new position and keep useful focus. Scope is this workout only.  
**Failure and recovery.** Invalid/stale reorder preserves latest committed order and recoverable intent. No delete/re-add shortcut may lose sets.  
**Acceptance.** PRD-FR-020, AC-SET-04; ordering and content survive interruption, with accessible alternatives to gesture.


### JNY-015 Changing exercises manually

**Phase:** MVP.  
**Intention.** Record the exercise actually chosen without automated advice.  
**Entry.** Active workout exercise actions or Add exercise.

**Steps and decisions.**

1. Search/select the desired exercise manually, using its own identity and measurement fields.
2. If replacing an unlogged draft exercise, clear incompatible draft targets with a visible explanation.
3. If the original has recorded sets, preserve those records as their original exercise; adding/removing work requires explicit scoped actions.
4. Keep the source routine/history unchanged and show previous values only from the actual comparable exercise.

**Feedback and decisions.** No ranking, equivalence/safety claim, reason questionnaire or today/future programme choice is required. Ranked substitution guidance under PRD-FR-021 is POST.  
**Failure and recovery.** Cancel preserves all original data. A failed mutation leaves the full prior session and draft recoverable.  
**Acceptance.** PRD-FR-020, PRD-FR-016, AC-SUB-01; variant changes never relabel completed source sets or falsely compare previous performance.


### JNY-016 Adding a custom exercise

**Intention.** Log an exercise absent from the maintained catalogue with enough semantics for correct future entry.  
**Entry.** Exercise search empty state or routine editor.

**Steps and decisions.**

1. Enter required name, measurement mode, load mode/basis and laterality. Equipment, category, movement and muscle tags are optional; omitted values are stored as unknown and any comparison limitations are explained.
2. See duplicate-name matches with disambiguating metadata; choose existing or continue distinct.
3. Validate and save; return to the originating picker with the custom exercise selected.

**Feedback and decisions.** “Custom” ownership and missing-metadata limitations remain visible.  
**Failure and recovery.** Unsupported fields retain draft. Duplicate name never merges history. An offline save works; failed save returns to exact form.  
**Friction removed.** Minimum valid fields only; no mandatory muscle taxonomy expertise or internet.  
**Acceptance.** `PRD-FR-007`, `WPR-CUSTOM-001`–`WPR-CUSTOM-004`, `TS-CUSTOM-001`, `TS-CUSTOM-004`; required fields alone permit valid logging; missing optional metadata never creates a false comparison; version-changing edits never reinterpret old sets.

## 5. Interruption and completion

### JNY-017 Pausing or leaving a workout

**Intention.** Leave temporarily or stop deliberately without losing/accidentally discarding work.  
**Entry.** Back/home navigation, phone lock, app switch or workout overflow.

**Steps and decisions.**

1. Ordinary navigation/backgrounding leaves the active workout saved and resumable; no confirmation for non-destructive leave.
2. Explicit Pause optionally stops elapsed active duration under the disclosed duration model; rest timer behavior remains separate.
3. Explicit Finish opens `JNY-020`; Discard requires scope/recoverability confirmation.

**Feedback and decisions.** Workouts shows Continue with committed progress. A non-persisted draft is labelled/restored according to checkpoint policy.  
**Failure and recovery.** If a final local checkpoint fails, prior committed state remains and the user sees which draft is not saved. Discard creates no completed-workout or trend evidence.  
**Friction removed.** No “Are you sure?” merely for switching tabs/apps; destructive distinction is explicit.  
**Acceptance.** `WPR-SES-002`, `WPR-SES-009`, `WPR-RES-*`, `TS-SES-009`; lock/background/kill do not lose acknowledged changes.

### JNY-018 Restoring an active workout

**Intention.** Resume exactly where training stopped and trust the state.  
**Entry.** Relaunch/Workouts Continue after background, termination, device restart or offline interval.

**Steps and decisions.**

1. App loads the authoritative latest valid committed revision before presenting progress as current.
2. Workouts primary action is Continue; activation returns to last meaningful exercise/focus without inventing completion.
3. Rest timer derives from anchors and shows remaining/elapsed/unknown; restored drafts are visibly drafts.

**Feedback and decisions.** A subtle “Restored—saved locally” may appear; recovery warnings are shown only when a revision could not load.  
**Failure and recovery.** Corrupt latest revision falls back/quarantines through `JNY-036`; no valid active data produces explicit recovery, never an empty fresh workout.  
**Friction removed.** No manual recreation, login or network requirement; no blocking recovery modal when restoration is exact.  
**Acceptance.** `PRD-FR-022`, `WPR-RES-001`–`WPR-RES-008`, `TS-RES-001`–`TS-RES-005`; all acknowledged mutations exact and drafts not counted.

### JNY-019 Completing a workout offline

**Phase:** MVP.  
**Intention.** Finish with the same recorded facts and confidence without connectivity.  
**Entry.** Finish while offline; same path as JNY-020.

**Steps and decisions.**

1. Review actual recorded sets and any unlogged drafts; resolve drafts explicitly without auto-completing targets.
2. Finish through one atomic, idempotent local completion; no cloud, schedule or sequence resolution is involved.
3. Open completed history from local data and verify the recorded sets and source provenance.

**Feedback and decisions.** Saved on this device is shown only after commit in production. Prototype copy states its actual session storage scope.  
**Failure and recovery.** Commit failure keeps the session active with inputs intact; retry cannot duplicate history. No network spinner blocks finishing.  
**Acceptance.** PRD-FR-024–PRD-FR-025, PRD-NFR-002, AC-OFFLINE-01; one completed session, accurate observed-set count, no hidden online service.


### JNY-020 Finishing with the work recorded

**Phase:** MVP.  
**Intention.** Close the workout without being forced to finish a plan or choose future training.  
**Entry.** Finish workout from any active session.

**Steps and decisions.**

1. Review completed observed sets. Unlogged targets stay unperformed; a dirty set draft must be saved, retained by returning, or explicitly discarded.
2. Optionally add a note or edit the workout name, then finish deliberately.
3. After successful atomic commit, show a concise recorded-work summary and useful History/Done actions.
4. Offer Save as routine as an optional separate action. Do not ask about schedule advancement, carry-forward, recommendations or sharing.
5. An empty session is either retained for logging or explicitly discarded; it creates no frequency/performance/PR evidence.

**Feedback and decisions.** Finishing early is neutral. No achievement, next target or explanatory score blocks exit. Source routines stay unchanged.  
**Failure and recovery.** Failed completion leaves the active workout intact. Retry is idempotent; accidental repeated activation cannot duplicate history.  
**Acceptance.** PRD-FR-024–PRD-FR-026, AC-FINISH-01; only observed sets counted and no mandatory future-planning decision.


## 6. Repeating completed work




### JNY-024 Repeating a completed workout

**Phase:** MVP.  
**Intention.** Reuse exercise order and previous context without re-entering the record.  
**Entry.** Completed workout detail → Repeat workout, or recent workout shortcut.

**Steps and decisions.**

1. Use the current visible revision of the selected completed workout as the explicit source.
2. Create a fresh session with new IDs, copied exercise order and reference/target hints where meaningful.
3. Reset observed completed sets, completion flags, timestamps, elapsed duration, timer and record eligibility. References are clearly distinct from current input.
4. Log each new set deliberately. Editing/reordering the repeated session cannot change its completed source.
5. If another session is active, Continue it or explicitly finish/discard before a fresh start.

**Feedback and decisions.** The session identifies that it repeats the source, but is empty of current observations. No programme or routine needs to exist.  
**Failure and recovery.** Missing source or start failure leaves history unchanged; duplicate commands return one session. Invalid old modes require explicit handling rather than fabricated compatible values.  
**Acceptance.** PRD-FR-011, AC-REPEAT-01; source hashes unchanged and new completion/PR/frequency inputs empty until deliberate logging.


## 7. History and progress

### JNY-026 Reviewing workout history

**Phase:** MVP.  
**Intention.** Find what was recorded and reuse or correct it.  
**Entry.** History tab, recent workout or completion summary.

**Steps and decisions.**

1. View reverse-chronological recorded workouts by name/date and actual-set summary.
2. Open detail to see actual exercise sets, units, notes, completion and edit provenance.
3. Choose Edit (`JNY-030`), Repeat (`JNY-024`) or Save as routine (`JNY-004`).
4. When no recorded workouts exist, explain why and offer Start workout; preserve all navigation.

**Feedback and decisions.** No programme filter, calendar commitment or chart is needed to find a record. Date filters must remain visible when they produce no results.  
**Failure and recovery.** Isolate unreadable records and preserve valid history; show recovery rather than an empty reset.  
**Acceptance.** PRD-FR-027–PRD-FR-028, AC-HIST-01; offline stable timestamp/ID ordering and source records unchanged by reading/repeat/routine saving.


### JNY-027 Reviewing exercise history

**Intention.** See comparable previous performances for one exact exercise/variation.  
**Entry.** Exercise row history action, exercise library or progress.

**Steps and decisions.**

1. Confirm exercise variation, equipment/load/laterality signature and any compatibility boundary.
2. View chronological sessions/sets with warm-up/working and edited labels.
3. Filter range/role; open source workout or chart/record.

**Feedback and decisions.** Incomparable variants appear in a separate “related, not directly comparable” area or are excluded with explanation.  
**Failure and recovery.** Unknown definitions preserve raw history and say why comparison is unavailable. Filters that yield nothing show reset action.  
**Friction removed.** One action from active exercise; no same-name merging or giant default chart.  
**Acceptance.** `PRD-FR-016`, `PRD-FR-027`, `ST-CMP-001`, `TS-SET-012`; previous value shown during logging originates only from the exact compatible signature.

### JNY-028 Reviewing observed personal bests

**Phase:** MVP.  
**Intention.** Understand the best comparable recorded performance and its source.  
**Entry.** Progress or exercise history.

**Steps and decisions.**

1. See only applicable observed categories from PRD-FR-026: highest eligible external load and most reps at the same load.
2. Open the contributing source set/workout, date, unit, comparison signature, tie/eligibility and rule version.
3. If no eligible working-set evidence exists, explain the limit and show raw history. No estimate or arbitrary score fills the gap.

**Feedback and decisions.** Personal best means best recorded eligible observation, not a claim of fitness outcome. e1RM and cross-exercise totals are POST; feedback remains restrained and accessible.  
**Failure and recovery.** Correcting/deleting a source invalidates/recalculates current bests; never present known-stale records as current.  
**Acceptance.** PRD-FR-026, AC-PR-01; exact source eligibility, ties, units and recomputation verified. Warm-ups/drafts/incomparable variants excluded from working PRs.


### JNY-029 Reviewing meaningful trends

**Phase:** MVP.  
**Intention.** Answer a small number of questions from recorded workouts without a training plan.  
**Entry.** Progress tab or exercise history.

**Steps and decisions.**

1. Workout frequency shows the number of completed sessions with at least one recorded set in the displayed local-date range; drafts/empty/abandoned sessions do not count.
2. Exercise performance shows comparable observed working sets by exercise variant and matching load/measurement/laterality signature, with dates, units and source records.
3. Personal bests follow JNY-028. Change/range labels explain the exact comparison; no causal strength/health claim or training recommendation is generated.
4. With zero observations offer Start workout; with one comparable session show its actual values and explain that another comparable session is needed before describing change.
5. Provide an accessible list/table/text equivalent and a way to inspect contributing workouts. Adjust filters without mixing incompatible variants.

**Feedback and decisions.** A blank-workout-only user has the same trends as a routine user. Unknown or missing values are not zero-filled. Frequency is descriptive, not a target or adherence score.  
**Failure and recovery.** After correction/deletion recompute affected counts/series/bests. Calculation failure preserves raw records and hides/labels pending derived data; no fabricated replacement series.  
**Acceptance.** PRD-FR-026–PRD-FR-029, AC-CHART-01, AC-TREND-01, PRD-SM-009; empty/one-session/incomparable/edit fixtures and equivalent accessible content.


## 8. Editing and data control

### JNY-030 Editing a completed workout

**Intention.** Correct historical mistakes without losing provenance or leaving stale records.  
**Entry.** Completed workout details → Edit.

**Steps and decisions.**

1. Enter edit mode; current values and source/edited state are visible.
2. Change compatible set values/roles/notes/times or explicitly remap an exercise with semantic preview.
3. Review affected duration, PR, chart and frequency results; add optional reason.
4. Save one atomic revision; inspect updated result/edit marker.

**Feedback and decisions.** Completion time remains distinct from edit time. Current derived truth updates and prior revision remains auditable per retention policy.  
**Failure and recovery.** Invalid chronology/semantic remap blocks exact field. Recalculation failure rolls back or shows one coherent pending strategy; source routines and other completed sessions remain unchanged.  
**Friction removed.** Direct edit from history, not duplicate/delete workout; no forced reason for ordinary correction.  
**Acceptance.** `PRD-FR-028`, `WPR-EDIT-001`–`WPR-EDIT-005`, `TS-EDIT-001`–`TS-EDIT-005`; no knowingly stale derived state.

### JNY-031 Editing a reusable routine

**Phase:** MVP.  
**Intention.** Change a future shortcut without rewriting performed work.  
**Entry.** Workouts → Routines → selected routine → Edit.

**Steps and decisions.**

1. Edit name, exercises/order, optional target sets/rest or notes using the simple JNY-004 editor.
2. Validate exact fields while retaining all draft values.
3. Save an independent routine revision; future starts use it. Existing active/completed snapshots and historical repeat sources remain unchanged.
4. Cancel preserves the previously saved routine.

**Feedback and decisions.** Use plain “Routine saved” with scope explanation where helpful; no effective-date/enrolment/version wizard appears in the normal flow.  
**Failure and recovery.** Failed save preserves prior version and draft. A removed catalogue item retains source identity and history; incompatible changes require explicit validation.  
**Acceptance.** PRD-FR-003, PRD-FR-005–PRD-FR-006, AC-PROG-01; immutable snapshot/source assertions and no schedule fields or progression controls.


### JNY-032 Exporting training data

**Intention.** Obtain a complete, interpretable copy of user-entered training data without an account or internet.  
**Entry.** Settings → Data → Export; optional history export shortcut.

**Steps and decisions.**

1. Review export scope, format/version, inclusion of private notes and destination behavior; full export is the default ownership path.
2. Choose location using platform file controls and start.
3. Generate from a consistent local snapshot, validate manifest/checksum/schema and only then report completion/share file.

**Feedback and decisions.** Summary lists generated time, schema/export version, record counts and any explicitly unsupported/omitted category.  
**Failure and recovery.** Destination/write/validation failure reports not exported, handles partial temporary file and leaves source untouched. Retry uses a new snapshot/version.  
**Friction removed.** No signup, support request, network or proprietary-only format.  
**Acceptance.** `PRD-FR-037`, `PRD-SM-010`, `TS-DATA-007`; works offline; independent schema reader validates all referenced stable IDs and units.

### JNY-033 Deleting an account or local data

**Intention.** Remove exactly the intended data with clear consequences and no misleading account language.  
**Entry.** Settings → Data/privacy.

**Steps and decisions.**

1. See scopes that actually exist: active session, selected routine/history where supported, all local data; account deletion appears only if an account exists in a future version.
2. Review affected counts, sync/backup implications and recoverability. Optional export is offered without blocking.
3. Confirm through a deliberate scope-specific action; transaction serialises with active writes.
4. Receive completion for exact scope and land in an accurate empty/remaining state.

**Feedback and decisions.** No dark patterns, retention ambiguity or automatically selected broader scope.  
**Failure and recovery.** Conflict with active completion waits/returns retryable state; failed deletion does not claim partial success. If remote account deletion is future/online-only, local core behavior and exact pending state are explained separately.  
**Friction removed.** No support contact or forced export, while retaining necessary deliberate confirmation.  
**Acceptance.** `PRD-FR-038`, `SAF-PRIV-005`, `TS-DATA-008`–`TS-DATA-009`; automated fixture proves zero out-of-scope deletes and referential validity of retained history.

## 9. Empty and failure recovery

### JNY-034 Understanding empty and insufficient-data states

**Phase:** MVP.  
**Intention.** Know why content is absent and take one useful action.  
**Entry.** No workouts/routines/exercise records or a filtered range with no matches.

**Steps and decisions.**

1. Empty Workouts keeps Start workout dominant; empty History/Progress says no recorded workouts and offers Start workout.
2. Empty Routines offers Create routine without blocking blank logging.
3. One comparable session shows actual observations with a neutral explanation that another comparable workout is needed to assess change.
4. No eligible personal best or filtered results explains the exact reason and offers relevant source history or filter change.

**Feedback and decisions.** No sample series, zeroed fake chart, guilt label, setup funnel or “choose a goal” action fills the space. Navigation and data controls remain available.  
**Failure and recovery.** Potential corruption/migration failure invokes JNY-036 rather than ordinary emptiness.  
**Acceptance.** PRD-FR-027, PRD-FR-041, AC-TREND-01; cause/action matched to fixture and announced through semantic headings/text.


### JNY-035 Handling a failed local operation

**Intention.** Know what saved, keep entered work and recover safely.  
**Entry.** Any local transaction, storage, validation or revision conflict failure.

**Steps and decisions.**

1. System rolls back/retains last committed revision and keeps attempted draft where feasible.
2. Feedback names operation and truth: not saved, previous value still saved, or conflict with newer value.
3. Offer relevant action: correct field, retry, review latest/conflict, free space/export, or cancel without draft loss.
4. On successful retry, acknowledge once and recompute normally.

**Feedback and decisions.** Error is adjacent to affected action and accessible; a durable issue may also use a persistent status surface.  
**Failure and recovery.** Repeated failures never turn into false success or clear data. Storage exhaustion blocks further acknowledgements and protects the active session.  
**Friction removed.** No generic error that requires guessing, no forced navigation away, no repeated duplicate writes.  
**Acceptance.** `PRD-FR-015`, `PRD-FR-041`, `WPR-INV-005`, `WPR-RES-008`, `TS-DATA-001`, `TS-DATA-010`; failure injection proves exact prior state and idempotent retry.

### JNY-036 Handling corrupted or partially migrated data

**Intention.** Preserve trustworthy data, understand the limited failure and access recovery rather than see a silent reset.  
**Entry.** Launch, restoration or history read detects checksum/schema/migration failure.

**Steps and decisions.**

1. Stop the failing migration/read transaction and quarantine the unreadable payload without overwriting it.
2. Load the latest verified readable revision or unaffected data in normal/read-only mode.
3. Explain which scope/version could not load, what is still available and whether any recent change may be missing—without claiming recovery beyond evidence.
4. Offer retry, diagnostic/full export of readable data, restore from supported backup when future capability exists, or clear only the explicit affected scope after confirmation.

**Feedback and decisions.** Recovery status remains visible until resolved; normal empty screens are never used to disguise failure. Technical detail is available for support/export but main copy stays understandable.  
**Failure and recovery.** If all active revisions fail but history is valid, preserve history and show no fabricated active workout. If migration rollback fails, block writes/read-only rather than continue on uncertain schema.  
**Friction removed.** No silent wipe, mandatory network/account or broad delete as first option.  
**Acceptance.** `PRD-FR-039`, `WPR-RES-007`, `EC-DATA-003`–`EC-DATA-006`, `TS-DATA-003`–`TS-DATA-006`, `TS-JNY-007`; corruption fixtures retain every unaffected entity byte/logically and expose scoped recovery.

## 10. Current journey coverage matrix

| Outcome | Current journeys | Required evidence |
|---|---|---|
| Immediate start / optional reuse | JNY-001, JNY-003–JNY-004, JNY-006–JNY-008, JNY-024, JNY-031 | No setup/plan gate; blank actually empty; repeat/routine snapshots reset completion and preserve sources |
| Record and change work | JNY-009–JNY-010, JNY-012–JNY-018 | Fast ordinary sets; manual exercise changes; valid modalities; accessible actions; exact interruption recovery |
| Finish and understand history | JNY-019–JNY-020, JNY-026–JNY-030 | Observed-only completion, auditable editing, source-backed comparisons, empty/one-session states |
| Control and recover | JNY-032–JNY-036 | Export/schema, scoped delete, transaction/migration/corruption evidence and truthful absence states |

## 11. Journey approval criteria

The owner reviews these interactions against the working disposable prototype before final journey approval. Production remains gated separately.

1. A first-time user starts blank in one deliberate action without goals, routines, programmes or scheduling.
2. Normal set logging remains one explicit action after valid entry; supported detail is optional and accessible.
3. Repeat creates fresh observations and preserves source history; routines are useful but never mandatory.
4. Finishing records only performed work and asks no future-planning or recommendation question.
5. History and the three progress questions work without a routine; no fake analytics, incompatible comparisons or unjustified trend claims appear.
6. Active work, correction, export, delete and recovery retain exact scope and truth under production failure tests.
7. Tempo Ledger's proposed treatment supports large text, screen readers, reduced motion, safe areas and thumb reach.

## 12. Deferred journey specifications retained for reference

The following are **POST** under D-009, with their earlier details preserved. Any “MVP,” “MUST” or entry point inside these historical bodies applies only if the feature is separately reapproved; it cannot override the current requirements or create a hidden first-release dependency. No placeholder route ships for these journeys.

### JNY-002 Choosing a training goal — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Use a broad preference to rank understandable templates and tailor product wording without being stereotyped or promised an outcome.  
**Entry.** Onboarding, profile settings or programme discovery.

**Steps and decisions.**

1. Review a small, plain-language, non-exclusive list such as general fitness, get stronger, build muscle, improve consistency, or “not sure / prefer not to say.”
2. Open “how this is used” to see: template ranking and optional defaults only; no guaranteed result, diagnosis or locked features.
3. Select one primary goal, skip, or later edit it. Preview any template-order change before leaving settings.

**Feedback and decisions.** Selection is labelled a preference. A change does not mutate an active programme enrolment, its adopted version or completed history.  
**Failure and recovery.** If goal metadata is unavailable, templates remain browseable without ranking. A failed save leaves the prior goal and the new draft visible for retry.  
**Friction removed.** No forced gender, body image, calorie, weight, photo or timeline inputs.  
**Acceptance.** `PRD-FR-001`, `SAF-NC-004`, `SAF-NC-012`; every goal has neutral copy, skip parity and no feature gate; changing it creates no programme version.


### JNY-005 Choosing fixed or flexible scheduling — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Make the plan fit a predictable week or an inconsistent schedule and understand what a miss does.  
**Entry.** Template adoption, custom builder or programme-version edit.

**Steps and decisions.**

1. Compare two equal first-class options: fixed days (“A every Monday”) and flexible sequence (“A → B → C whenever you train”).
2. For fixed, assign local weekdays/dates, order same-day collisions and time zone. For flexible, order workouts and choose repeat/finite end behavior.
3. Choose a disclosed skip default: omit/advance, defer/reinsert or ask each time where applicable.
4. Preview the first next workout and examples of miss, skip and repeat; confirm.

**Feedback and decisions.** The summary states “dates select workouts” or “completion advances the sequence.” Rest days are neutral.  
**Failure and recovery.** Conflicting fixed entries require ordering/move/cancel; an empty sequence cannot save. Switching an existing programme uses a new version and resolves overdue work.  
**Friction removed.** No assumption that flexible users want weekday mapping; no automatic sequence damage from missing a day.  
**Acceptance.** `PRD-FR-004`, `WPR-SCH-001`–`WPR-SCH-015`, `TS-SCH-001`, `TS-SCH-009`; a user can correctly predict the next workout in both modes before confirmation.


### JNY-011 Logging a drop set — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Record a linked reduced-resistance effort accurately without slowing normal entry.  
**Entry.** Planned drop row or completed set overflow → “Add drop set.”

**Steps and decisions.**

1. System links the immediately relevant parent and preselects compatible fields as editable drafts.
2. Enter changed resistance and observed reps/time; complete.
3. For another drop, add from the prior drop to create a visible chain.

**Feedback and decisions.** Parent/Drop 1/Drop 2 relationship is readable without relying on indentation/colour alone.  
**Failure and recovery.** Missing/cross-exercise/cyclic parent blocks save. Equal/higher comparable load asks convert to working or save explicit manual exception excluded from drop analysis. Deleting parent requires relink/convert/delete decision.  
**Friction removed.** Parent is inferred from immediate context but inspectable/changeable; normal rows stay simple.  
**Acceptance.** `ST-DROP-001`–`ST-DROP-004`, `TS-SET-014`; every child persists independently and survives restoration.


### JNY-021 Missing a planned workout — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Understand what happened and choose what comes next without punishment.  
**Entry.** Today after a fixed occurrence's date passes; flexible schedules do not create a miss from time alone.

**Steps and decisions.**

1. See “A was planned for Thursday and is unresolved,” not “failed” or lost streak.
2. Choose Do now, move, skip, replace/count compatible work, or leave unresolved.
3. Preview next-workout effect; commit one action or dismiss for later.

**Feedback and decisions.** Today updates occurrence and next state after local commit. Other overdue occurrences remain listed.  
**Failure and recovery.** Conflicts require resolution. Failed save leaves missed occurrence/draft choice unchanged. For flexible mode, the app explains that B remains next and offers no false miss.  
**Friction removed.** No guilt notification, auto-skip, hidden sequence advance or rebuilding the week.  
**Acceptance.** `PRD-FR-012`–`PRD-FR-014`, `WPR-SCH-006`–`WPR-SCH-008`, `TS-SCH-001`–`TS-SCH-003`, `TS-SAFE-007`; user predicts next state before commit.


### JNY-022 Rescheduling a workout — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Move planned work while preserving identity and avoiding collisions.  
**Entry.** Planned occurrence details, Today missed-state options or programme calendar.

**Steps and decisions.**

1. Choose Move/reschedule; select new local date/order.
2. Preview conflicts, time-zone context and effect on following sessions.
3. If collision exists, choose keep both with order, move one or cancel.
4. Commit; same occurrence ID receives new plan position and resolution history.

**Feedback and decisions.** Confirmation names old/new date and next expected workout.  
**Failure and recovery.** Invalid calendar date/recurrence conflict preserves picker selection. Concurrent resolution returns fresh state and retains proposed move.  
**Friction removed.** No delete/recreate, no completed-history mutation, no forced whole-programme version for a one-off occurrence move.  
**Acceptance.** `WPR-SCH-010`, `EC-SCH-004`, `TS-SCH-004`, `TS-SCH-011`; occurrence identity and source version remain stable.


### JNY-023 Skipping a workout — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Intentionally omit/defer a session and know the sequence consequence.  
**Entry.** Planned/missed occurrence actions.

**Steps and decisions.**

1. Choose Skip; read configured default and alternatives (omit, defer/reinsert, advance where applicable).
2. Optionally add a private note/reason; no reason required.
3. Preview “Next will be …” and confirm.

**Feedback and decisions.** Occurrence becomes skipped only after commit; neutral language and undo/recovery where feasible.  
**Failure and recovery.** If state changed elsewhere, refresh and ask only if the choice remains relevant. A failed commit leaves it planned/missed.  
**Friction removed.** No shame, questionnaire or silent default.  
**Acceptance.** `WPR-SCH-009`, `TS-SCH-005`, `SAF-WELL-001`–`SAF-WELL-003`; next state matches preview; no completed workout is created.


### JNY-025 Selecting short-workout mode — POST

**Phase:** deferred by D-009. Earlier MVP references within this retained specification are superseded; no first-release route/control or implementation dependency is authorised.

**Intention.** Adapt a session to limited time while retaining control and understanding what changed.  
**Entry.** Before Start, active-workout options or Today duration context.

**Steps and decisions.**

1. Enter available minutes or select “help me shorten”; optionally mark must-keep exercises.
2. Review deterministic preview of kept, reduced and removed sets/exercises with priority/minimum reasons and approximate-time basis.
3. Restore/remove/reorder any uncompleted item manually; confirm for this session only.
4. At finish, optionally carry eligible removed work via explicit preview.

**Feedback and decisions.** Active header states Short mode and provides Undo/review. Source programme is visibly unchanged.  
**Failure and recovery.** Too-small/unknown budget shows no-fit/unknown, never a guarantee. Non-splittable groups/minima block automatic cuts but permit manual override/partial completion.  
**Friction removed.** No manual deletion one set at a time, no claim of optimisation, no forced programme edit.  
**Acceptance.** `PRD-FR-023`, `WPR-SHORT-001`–`WPR-SHORT-008`, `TS-SHORT-001`–`TS-SHORT-005`; completed work never removed; user can state exactly what changed.
