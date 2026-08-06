# NextSet user journeys and interaction specifications

Status: proposed critical journeys for product-owner approval  
Last updated: 2026-08-06

## 1. Shared interaction contract

These journeys specify intent and domain outcomes, not a selected visual direction. All are mobile-first, one-handed where practical, offline-capable for MVP core work, screen-reader operable, usable with larger system text and compatible with reduced motion. **MUST** is normative.

Common behavior:

- A saved acknowledgement appears only after the local transaction commits (`WPR-RES-001`).
- Back/leave never discards a valid draft without warning; validation points to the field and preserves other input.
- Planned, observed, calculated and recommended values use distinct labels (`WPR-INV-003`).
- Advanced fields are disclosed when the user enables or needs them, not during every default action.
- Destructive actions state scope and recoverability before confirmation.
- Network absence never blocks the MVP planning/workout/history/export journeys after required content is installed.
- Haptic, animation, colour and sound are supplementary; semantic text/state always conveys the result.
- “Friction removed” names avoidable steps. It does not permit removal of deliberate start, destructive confirmation, scope choice or recommendation approval.

Acceptance references `PRD-FR-*`, `WPR-*` and the test catalogue in [`../domain/domain-test-scenarios.md`](../domain/domain-test-scenarios.md).

## 2. Setup and programme selection

### JNY-001 First-time onboarding

**Intention.** Begin using NextSet without creating an account or understanding advanced training terminology.  
**Entry.** First launch or “continue setup” on an incomplete local profile.

**Steps and decisions.**

1. See the central promise, local-first summary and a primary “Set up NextSet”; a secondary “Explore first” may defer optional setup.
2. Choose display units; see that they can change later.
3. Optionally self-describe experience and select a training goal through `JNY-002`; “not sure” and skip remain valid.
4. Choose “use a template” (`JNY-003`) or “build my own” (`JNY-004`). A user may exit and resume at the last committed step.
5. Choose scheduling through `JNY-005`, review a plain-language summary and finish.

**Feedback and decisions.** A short progress indicator names the current step rather than implying a mandatory long funnel. Each saved choice acknowledges locally. Advanced RPE/RIR/progression questions are deferred to template/custom-plan context.  
**Failure and recovery.** Invalid values are inline; a local write failure retains the current choices and uses `JNY-035`. A killed app resumes the last committed step; it never claims setup is complete early.  
**Friction removed.** No signup, paywall, notification prompt, body measurements, mandatory goal, forced tutorial or exhaustive exercise questionnaire.  
**Acceptance.** `PRD-FR-001`, `PRD-FR-040`; backtracking does not lose valid answers; skip produces usable neutral defaults; screen-reader order matches visual order; setup can finish offline.

### JNY-002 Choosing a training goal

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

### JNY-003 Selecting a programme template

**Intention.** Start from a reviewed plan that is understandable before adoption.  
**Entry.** Onboarding, programme tab/library or after programme completion.

**Steps and decisions.**

1. Browse a deliberately bounded template set ranked by explicit filters, not opaque personalisation.
2. Open a preview showing audience/intent, sessions/order, schedule options, exercises, approximate-duration basis, progression behavior, required equipment, advanced set types and content-review/version status.
3. Choose a template, optionally change allowed settings, then review the exact copied programme.
4. Select schedule (`JNY-005`) and adopt. Adoption creates a user-owned version (`WPR-PGM-003`) and, when chosen as the primary plan, a distinct active programme enrolment/cursor.

**Feedback and decisions.** “Added to your programmes” appears after atomic save; the template/version provenance remains inspectable.  
**Failure and recovery.** Missing required equipment is a disclosed mismatch, not a block; the user may inspect alternatives/customise. Unreviewed/expired content cannot be presented as current reviewed content (`SAF-PRO-001`). Failed adoption retains preview/configuration.  
**Friction removed.** No marketplace, giant catalogue, hidden paywall or mandatory editing.  
**Acceptance.** `PRD-FR-002`, `PM-VER-005`, `TS-PGM-004`, `TS-SAFE-004`; later catalogue updates do not mutate the adopted programme.

### JNY-004 Creating a custom programme

**Intention.** Build a precise plan without advanced options cluttering the basic path.  
**Entry.** “New programme” → “Build my own,” onboarding or duplicate existing programme.

**Steps and decisions.**

1. Name the programme and add the first workout.
2. Search/recent/favourite/add custom exercise; arrange exercises.
3. Add planned sets with simple defaults (working sets, reps/range, optional load/rest). Open advanced controls only for warm-up/drop, time, RPE/RIR, effort intent, priority or progression. Create/edit simple one-level supersets or circuits by selecting two or more exercises, member order and round/rest behavior; nested/conditional groups are not an MVP option.
4. Add/duplicate more workouts, define schedule with `JNY-005`, and review programme summary.
5. Validate; resolve path-specific issues; save as draft or activate.

**Feedback and decisions.** Autosave/explicit draft state is visible; publish/enrolment preview distinguishes plan targets from suggestions. Defaults state their source.  
**Failure and recovery.** Invalid or unsupported combinations retain the draft and link directly to the offending workout/exercise/set (`PM-VAL-*`, `ST-VAL-*`). If publication/adoption fails, no partial version becomes effective for the enrolment.  
**Friction removed.** Duplicate workout/set, recently used exercise, reusable rest/default values and collapsed advanced sections; no forced progression rule.  
**Acceptance.** `PRD-FR-003`, `PRD-FR-006`, `WPR-PGM-006`, `TS-PGM-001`, `TS-PGM-007`; beginner can create a basic valid programme without opening advanced controls; an experienced user can create, edit and execute a simple non-nested superset/circuit with independent sets.

### JNY-005 Choosing fixed or flexible scheduling

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

## 3. Today and starting

### JNY-006 Opening the app on a training day

**Intention.** Know what to do next and whether anything needs attention.  
**Entry.** Normal launch or Today tab.

**Steps and decisions.**

1. If an active workout exists, see Resume as the primary action with last committed progress.
2. Otherwise see the expected workout name/focus, why it is next, relevant last session, approximate-duration provenance and Start.
3. If missed/conflicting occurrences exist, see one compact exception summary with a path to resolve; it does not displace the primary context unless resolution is required.
4. Choose Start (`JNY-007`), unscheduled (`JNY-008`), inspect plan or resolve schedule exception.

**Feedback and decisions.** Today uses factual state: unknown duration/history is labelled, not filled. Sync/network status is secondary because core data is local.  
**Failure and recovery.** Unreadable active data invokes `JNY-036`; a selector conflict names the conflicting occurrences without guessing.  
**Friction removed.** No analytics grid, social feed, motivational interruption or multi-step expected start.  
**Acceptance.** `PRD-FR-009`, `PRD-SM-001`; users identify next workout/focus/unfinished state in <=5-second target; large text preserves primary action and exception meaning.

### JNY-007 Starting the next workout

**Intention.** Begin the expected session deliberately with one action.  
**Entry.** Primary Start on Today.

**Steps and decisions.**

1. Activate Start once.
2. System idempotently creates/persists an active session from the exact programme-version snapshot and opens the first actionable exercise.
3. Optional lightweight acknowledgement states workout name; no blocking countdown/tutorial.

**Feedback and decisions.** Active status, start time and local saved state are immediately available.  
**Failure and recovery.** Duplicate tap/retry returns the same session (`WPR-SES-001`). If another active session exists, offer resume/finish/discard/cancel (`JNY-017`) instead of replacing. Failed local creation retains Today and explicit retry.  
**Friction removed.** No confirmation when state is conflict-free, network roundtrip or programme recap.  
**Acceptance.** `PRD-FR-010`, `TS-SES-001`, `TS-JNY-001`; one deliberate action from Today; session exists before active UI claims it started.

### JNY-008 Starting an unscheduled workout

**Intention.** Train outside the expected programme without corrupting its sequence.  
**Entry.** Secondary “Other workout” action on Today/programmes/history.

**Steps and decisions.**

1. Choose recent/template/empty workout or duplicate a historical workout.
2. Review whether it is linked to the primary active programme enrolment. Default: does not affect its sequence.
3. If compatible with the expected occurrence, optionally choose “count as expected” after seeing the exact schedule consequence.
4. Start; session is persisted and clearly labelled unscheduled or linked.

**Feedback and decisions.** Today shows Resume; the expected workout remains visible in context if not counted.  
**Failure and recovery.** Incompatible content cannot count as expected; the user may still start it without sequence effect. Existing active session conflict uses `JNY-017`.  
**Friction removed.** No need to rebuild the programme or falsely mark expected work complete.  
**Acceptance.** `PRD-FR-011`, `WPR-SCH-012`, `TS-SCH-007`; default leaves cursor unchanged; explicit compatible choice advances once on completion, not start.

## 4. Active workout and set entry

### JNY-009 Logging a normal set

**Intention.** Record a working set with minimal attention and continue training.  
**Entry.** Active workout, focused set row.

**Steps and decisions.**

1. Review planned target and comparable previous value, each clearly labelled.
2. Enter/adjust applicable load and reps/time; previous/planned values may be reference/prefill but remain draft.
3. Activate Complete once.
4. System validates and atomically commits the set plus timer anchor where configured; saved feedback appears, next focus advances predictably and non-blocking rest begins.

**Feedback and decisions.** Completed state uses text/semantics plus optional haptic; progress and any target-relative label update. A PR remains a candidate until session completion.  
**Failure and recovery.** Field error preserves values/focus. Transaction failure keeps draft and prior revision, never a checkmark. Termination after acknowledgement restores the set.  
**Friction removed.** One completion action once values are valid; numeric keyboard flow; no modal, celebration or timer takeover.  
**Acceptance.** `PRD-FR-017`–`PRD-FR-019`, `ST-UX-001`–`ST-UX-006`, `TS-JNY-002`; median task target `PRD-SM-003`; screen reader announces value, set index, role, state and error.

### JNY-010 Logging a warm-up set

**Intention.** Preserve preparation work without mixing it into working progression/records.  
**Entry.** Planned warm-up row or “Add set” → Warm-up.

**Steps and decisions.**

1. Use a row visibly labelled Warm-up; add more or convert role before completion if needed.
2. Enter compatible measurement/load and complete as in `JNY-009`.
3. History/progress summary records it with warm-up role and excludes it from MVP working metrics.

**Feedback and decisions.** Warm-up saved state is equal in reliability but visually subordinate to working targets.  
**Failure and recovery.** Role conversion after completion is an edit and recomputes derived data; invalid fields retain draft.  
**Friction removed.** Same row mechanics as normal sets; no separate warm-up screen.  
**Acceptance.** `WPR-SET-005`, `ST-ROLE-001`, `TS-SET-011`; a heavier warm-up never becomes a working PR or progression input.

### JNY-011 Logging a drop set

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

### JNY-012 Editing an incorrect set

**Intention.** Correct the latest or any completed set without uncertainty about saving.  
**Entry.** Tap completed set row; newest-set Edit is one action away.

**Steps and decisions.**

1. Open row in edit state with current values and role.
2. Change fields; review any comparison-signature/role consequence if material.
3. Save atomically; derived progress, timer-independent state, PR candidates and recommendations recompute/invalidate.
4. Optionally delete with immediate recovery where feasible.

**Feedback and decisions.** Edited marker/history is available without cluttering the row. Saved feedback waits for commit.  
**Failure and recovery.** Invalid edit retains original completed revision as authoritative and edit draft visible. Recalculation failure cannot produce mixed old/new derived state.  
**Friction removed.** No trip to History for active-session correction; no save of unchanged fields required.  
**Acceptance.** `PRD-FR-017`, `ST-UX-003`, `TS-EDIT-001`, `PRD-SM-004`; correcting latest set is unassisted and does not advance exercise/timer again.

### JNY-013 Adding an unplanned set

**Intention.** Record extra work honestly without editing the programme mid-session.  
**Entry.** Exercise action “Add set” or add after last row.

**Steps and decisions.**

1. Add a set; role defaults to compatible working set and copies only editable target hints, not observed completion.
2. Optionally choose warm-up/drop/effort fields; enter and complete.
3. At session finish or overflow menu, optionally choose “update future programme,” which opens a separate version edit.

**Feedback and decisions.** Unplanned badge and session-only scope are clear.  
**Failure and recovery.** Invalid combination stays draft. Programme update failure leaves the observed active set intact and future plan unchanged.  
**Friction removed.** One add action and familiar row; no forced reason or builder interruption.  
**Acceptance.** `PRD-FR-020`, `WPR-INV-006`, `TS-SES-004`; progression all-first-`n` policy does not substitute this set for a failed planned set (`TS-PROG-002`).

### JNY-014 Reordering exercises

**Intention.** Adapt order to equipment flow while preserving set records and group meaning.  
**Entry.** Active workout exercise list → Reorder or drag handle with accessible move actions.

**Steps and decisions.**

1. Enter reorder mode; move exercise using drag or explicit move-before/after controls.
2. If group membership would break, confirm ungroup for this session or cancel.
3. Commit order; active progress and completed sets remain attached by stable identity.
4. Optionally open separate future-programme update.

**Feedback and decisions.** New order is announced; completed/active location is preserved; scope says “this workout.”  
**Failure and recovery.** Concurrent/stale reorder returns conflict and restores latest order while preserving proposed changes for retry. Invalid group cycles cannot save.  
**Friction removed.** No delete/re-add; keyboard/screen-reader alternative to drag.  
**Acceptance.** `PRD-FR-020`, `PM-GRP-004`, `TS-SES-008`; identities, values and source template remain unchanged.

### JNY-015 Replacing an unavailable exercise

**Intention.** Continue training when equipment/preference prevents the planned exercise, with the user in control.  
**Entry.** Exercise actions → Replace; optionally select reason.

**Steps and decisions.**

1. Optionally choose equipment unavailable, gym lacks equipment, uncomfortable/preference, variety or programme variation.
2. Review programme-authored alternatives first when eligible, then candidates with matching/mismatching target-region, movement, equipment, variation and group-role metadata. MVP may capture equipment availability and representable increments explicitly for this session; it does not require or save a named gym profile.
3. Search all or add custom if suggestions are insufficient.
4. Choose a candidate and scope: current session default or future programme version; review incompatible target fields and adapt.
5. Confirm; new exercise performance links to the planned exercise and uses its own comparable history.

**Feedback and decisions.** The row states “replaced X for this workout”; reasons are explanations, not claims of equivalence/safety.  
**Failure and recovery.** No candidates yields search/custom/skip, not invented confidence. A mode mismatch clears incompatible draft targets after preview. Failed future update does not undo session substitution.  
**Friction removed.** Recent/available filters, no builder round trip for session-only change, no mandatory reason.  
**Acceptance.** `PRD-FR-021`, `WPR-SUB-001`–`WPR-SUB-008`, `TS-SUB-001`–`TS-SUB-005`, `TS-SAFE-001`; previous values never come from the replaced variation as if comparable.

### JNY-016 Adding a custom exercise

**Intention.** Log an exercise absent from the maintained catalogue with enough semantics for correct future entry.  
**Entry.** Exercise search empty state or substitution/custom-programme flow.

**Steps and decisions.**

1. Enter required name, measurement mode, load mode/basis and laterality. Equipment, category, movement and muscle tags are optional; omitted values are stored as unknown and their substitution-ranking impact is explained.
2. See duplicate-name matches with disambiguating metadata; choose existing or continue distinct.
3. Validate and save; return to the originating picker with the custom exercise selected.

**Feedback and decisions.** “Custom” ownership and missing-metadata limitations remain visible.  
**Failure and recovery.** Unsupported fields retain draft. Duplicate name never merges history. An offline save works; failed save returns to exact form.  
**Friction removed.** Minimum valid fields only; no mandatory muscle taxonomy expertise or internet.  
**Acceptance.** `PRD-FR-007`, `WPR-CUSTOM-001`–`WPR-CUSTOM-004`, `TS-CUSTOM-001`, `TS-CUSTOM-004`; required fields alone permit valid logging; missing optional metadata produces no confident substitution match; version-changing edits never reinterpret old sets.

## 5. Interruption and completion

### JNY-017 Pausing or leaving a workout

**Intention.** Leave temporarily or stop deliberately without losing/accidentally discarding work.  
**Entry.** Back/home navigation, phone lock, app switch or workout overflow.

**Steps and decisions.**

1. Ordinary navigation/backgrounding leaves the active workout saved and resumable; no confirmation for non-destructive leave.
2. Explicit Pause optionally stops elapsed active duration under the disclosed duration model; rest timer behavior remains separate.
3. Explicit Finish opens `JNY-020`; Discard requires scope/recoverability confirmation.

**Feedback and decisions.** Today shows Resume with committed progress. A non-persisted draft is labelled/restored according to checkpoint policy.  
**Failure and recovery.** If a final local checkpoint fails, prior committed state remains and the user sees which draft is not saved. Discard never advances schedule.  
**Friction removed.** No “Are you sure?” merely for switching tabs/apps; destructive distinction is explicit.  
**Acceptance.** `WPR-SES-002`, `WPR-SES-009`, `WPR-RES-*`, `TS-SES-009`; lock/background/kill do not lose acknowledged changes.

### JNY-018 Restoring an active workout

**Intention.** Resume exactly where training stopped and trust the state.  
**Entry.** Relaunch/Today Resume after background, termination, device restart or offline interval.

**Steps and decisions.**

1. App loads the authoritative latest valid committed revision before presenting progress as current.
2. Today primary action is Resume; activation returns to last meaningful exercise/focus without inventing completion.
3. Rest timer derives from anchors and shows remaining/elapsed/unknown; restored drafts are visibly drafts.

**Feedback and decisions.** A subtle “Restored—saved locally” may appear; recovery warnings are shown only when a revision could not load.  
**Failure and recovery.** Corrupt latest revision falls back/quarantines through `JNY-036`; no valid active data produces explicit recovery, never an empty fresh workout.  
**Friction removed.** No manual recreation, login or network requirement; no blocking recovery modal when restoration is exact.  
**Acceptance.** `PRD-FR-022`, `WPR-RES-001`–`WPR-RES-008`, `TS-RES-001`–`TS-RES-005`; all acknowledged mutations exact and drafts not counted.

### JNY-019 Completing a workout offline

**Intention.** Finish with the same confidence and outcomes as online.  
**Entry.** Finish from an active workout while network is absent/unreliable.

**Steps and decisions.**

1. Review completed, skipped and not-attempted work plus any carry-forward choice.
2. Add an optional workout note; choose Finish.
3. System atomically freezes the completed snapshot, resolves the occurrence/cursor once, computes local record candidates and confirms local save.
4. Completion summary opens from local data; any future sync status is secondary and cannot downgrade the completion.

**Feedback and decisions.** “Saved on this device” is factual. PR/recommendation language has the same boundaries as online.  
**Failure and recovery.** Storage/transaction failure keeps the active session and review choices for retry; process termination during commit resumes idempotently. No “waiting for internet” spinner blocks completion.  
**Friction removed.** No account, network retry or cloud confirmation.  
**Acceptance.** `PRD-FR-013`, `PRD-NFR-002`, `WPR-RES-005`–`WPR-RES-006`, `TS-RES-003`, `TS-PR-006`, `TS-JNY-004`; one completed workout and at most one schedule advance.

### JNY-020 Completing a workout

**Intention.** Close the session, know it is saved and see only meaningful next information.  
**Entry.** Finish action during active workout or after final planned set.

**Steps and decisions.**

1. Review duration basis and planned-state summary; classify unfinished work as skipped/not attempted and choose any carry-forward (`WPR-SES-006`–`WPR-SES-007`).
2. Add/edit optional note; finish deliberately.
3. After atomic commit, show saved confirmation, concise completed-set/workout summary, comparable PRs, pending explainable recommendation and next likely action.
4. A recommendation action opens its evidence, rule, proposed target and override choices. Accept/edit previews the future not-started occurrence boundary and creates a new immutable future version only after confirmation; defer/dismiss changes no plan.
5. Choose Done/Today, History or edit summary. If this ends a finite programme enrolment, show start a new run, archive, duplicate or select another—never auto-enrol. Celebrations are non-blocking/configurable.

**Feedback and decisions.** Completion timestamp and local-saved status are explicit. Calculated and estimated values are labelled.  
**Failure and recovery.** Invalid unfinished-state choice points to the item; completion transaction failure leaves active; retry/idempotency prevents duplicates.  
**Friction removed.** No statistic wall, compulsory sharing, rating prompt or repeated confirmation when all work is resolved.  
**Acceptance.** `PRD-FR-024`–`PRD-FR-026`, `WPR-SES-008`, `TS-SES-006`, `TS-SCH-010`; summary never blocks exit or next workout clarity.

## 6. Schedule exceptions and time limits

### JNY-021 Missing a planned workout

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

### JNY-022 Rescheduling a workout

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

### JNY-023 Skipping a workout

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

### JNY-024 Repeating a workout

**Intention.** Perform a prior/same workout again without pretending it is the expected occurrence.  
**Entry.** History, programme workout action or completion summary.

**Steps and decisions.**

1. Choose Repeat; preview copied plan snapshot and reference workout/version.
2. Decide sequence effect; default is none. If counting as expected is compatible, see explicit consequence.
3. Start new occurrence/session with new IDs; previous observations appear only as comparable reference.

**Feedback and decisions.** “Repeat of A; B remains next” or chosen effect is visible.  
**Failure and recovery.** Incompatible repeat cannot count as expected but may start independently. Duplicate tap is idempotent.  
**Friction removed.** No manual reconstruction or accidental overwrite of prior workout.  
**Acceptance.** `WPR-SCH-011`–`WPR-SCH-012`, `TS-SCH-006`; source history unchanged; cursor unchanged by default.

### JNY-025 Selecting short-workout mode

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

## 7. History and progress

### JNY-026 Reviewing workout history

**Intention.** Find what was done on a date/session and open reliable detail.  
**Entry.** History tab, Today last-workout link or completion summary.

**Steps and decisions.**

1. View reverse-chronological completed sessions with neutral calendar/list switch, programme/name, completion status and meaningful summary.
2. Filter by programme/date if needed; open a workout.
3. Review source plan versus observed exercises/sets, notes, edits, duration basis, substitutions and records.
4. Choose Edit (`JNY-030`), Repeat (`JNY-024`) or export path.

**Feedback and decisions.** Edited/partial/imported/unknown-time states are labelled. Empty results keep filters visible.  
**Failure and recovery.** A corrupt individual record is isolated and recovery/export offered; valid history remains usable.  
**Friction removed.** Last workout is one action from Today; no analytics prerequisite or social layer.  
**Acceptance.** `PRD-FR-027`, `WPR-INV-002`, `TS-JNY-007`; offline, stable order with timestamp/ID tie-break, all observed/plan distinctions readable.

### JNY-027 Reviewing exercise history

**Intention.** See comparable previous performances for one exact exercise/variation.  
**Entry.** Exercise row history action, exercise library or progress.

**Steps and decisions.**

1. Confirm exercise variation, equipment/load/laterality signature and any compatibility boundary.
2. View chronological sessions/sets with warm-up/working/drop and edited/imported labels.
3. Filter range/role; open source workout or chart/record.

**Feedback and decisions.** Incomparable variants appear in a separate “related, not directly comparable” area or are excluded with explanation.  
**Failure and recovery.** Unknown definitions preserve raw history and say why comparison is unavailable. Filters that yield nothing show reset action.  
**Friction removed.** One action from active exercise; no same-name merging or giant default chart.  
**Acceptance.** `PRD-FR-016`, `PRD-FR-027`, `ST-CMP-001`, `TS-SET-012`; previous value shown during logging originates only from the exact compatible signature.

### JNY-028 Reviewing personal records

**Intention.** Understand a best comparable recorded performance and its evidence without workout interruption.  
**Entry.** Completion summary, exercise progress or Records view.

**Steps and decisions.**

1. Review restrained record categories available for this measurement signature.
2. Open a record to see rule/version, input set/workout, unit/basis, first-achieved/tie state and exclusions.
3. For e1RM, see “Estimated,” formula/version/range when approved; no attempt recommendation.

**Feedback and decisions.** New candidate celebrates after completion only, is dismissible/reduced-motion compatible and never covers controls.  
**Failure and recovery.** Insufficient/incomparable data yields an explanation, not zero. Editing/deleting source recomputes current record and edit history explains change.  
**Friction removed.** Records surfaced in context, no leaderboard/share prompt.  
**Acceptance.** `PRD-FR-026`, `WPR-PR-001`–`WPR-PR-010`, `TS-PR-001`–`TS-PR-008`; exact reproducibility and no unsupported modality score.

### JNY-029 Reviewing progress charts

**Intention.** Answer a specific training-history question rather than browse decorative analytics.  
**Entry.** Progress tab or exercise/workout history “View trend.”

**Steps and decisions.**

1. Select a named question, such as “How has my comparable load for this rep range changed?”
2. See chart title/question, metric, units, time range, inclusion/exclusion rules and data points accessible in non-visual form.
3. Adjust range/filter; open a point to its source workout.
4. Read a bounded descriptive summary with no cause/outcome inference.

**Feedback and decisions.** Insufficient data explains what is required. Edited data updates atomically.  
**Failure and recovery.** Incompatible variants remain separated; calculation failure keeps last verified result marked with an error/retry rather than a false new chart.  
**Friction removed.** Small approved chart set, question-led entry, no crowded Today analytics.  
**Acceptance.** `PRD-FR-027`, `PRD-SM-009`, `SAF-MET-004`; >=85% target correctly answer each chart question; accessible table/summary conveys equivalent information.

## 8. Editing and data control

### JNY-030 Editing a completed workout

**Intention.** Correct historical mistakes without losing provenance or leaving stale records.  
**Entry.** Completed workout details → Edit.

**Steps and decisions.**

1. Enter edit mode; current values and source/edited state are visible.
2. Change compatible set values/roles/notes/times or explicitly remap an exercise with semantic preview.
3. Review affected duration, PR, chart and pending recommendation categories; add optional reason.
4. Save one atomic revision; inspect updated result/edit marker.

**Feedback and decisions.** Completion time remains distinct from edit time. Current derived truth updates and prior revision remains auditable per retention policy.  
**Failure and recovery.** Invalid chronology/semantic remap blocks exact field. Recalculation failure rolls back or shows one coherent pending strategy; schedule cursor never rewinds automatically.  
**Friction removed.** Direct edit from history, not duplicate/delete workout; no forced reason for ordinary correction.  
**Acceptance.** `PRD-FR-028`, `WPR-EDIT-001`–`WPR-EDIT-005`, `TS-EDIT-001`–`TS-EDIT-005`; no knowingly stale derived state.

### JNY-031 Editing a programme

**Intention.** Change future training precisely without rewriting started/completed work.  
**Entry.** Programme details → Edit; optional session action “update future plan.”

**Steps and decisions.**

1. System clones the effective programme version to a draft and creates new draft workout-template versions only for changed content; edit workouts/exercises/sets/rules/schedule using `JNY-004`/`JNY-005` patterns.
2. Validate and preview change summary plus first affected not-started occurrence.
3. Publish and select the allowed effective boundary for the live enrolment to adopt it; cancel retains the enrolment's current version.
4. Active session and prior history continue under source versions.

**Feedback and decisions.** Future/current labels and version summary are explicit; no “published/adopted” state appears until the transaction commits.  
**Failure and recovery.** Invalid boundary/content retains draft; concurrent newer version requires compare/rebase decision, never silent overwrite.  
**Friction removed.** Duplication/bulk edit and in-context future-update entry; no editing every occurrence.  
**Acceptance.** `PRD-FR-005`, `PM-VER-001`–`PM-VER-005`, `TS-PGM-003`, `TS-PGM-005`; content hash of old versions and active session stays exact.

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

1. See scopes that actually exist: active session, selected programme/history where supported, all local data; account deletion appears only if an account exists in a future version.
2. Review affected counts, sync/backup implications and recoverability. Optional export is offered without blocking.
3. Confirm through a deliberate scope-specific action; transaction serialises with active writes.
4. Receive completion for exact scope and land in an accurate empty/remaining state.

**Feedback and decisions.** No dark patterns, retention ambiguity or automatically selected broader scope.  
**Failure and recovery.** Conflict with active completion waits/returns retryable state; failed deletion does not claim partial success. If remote account deletion is future/online-only, local core behavior and exact pending state are explained separately.  
**Friction removed.** No support contact or forced export, while retaining necessary deliberate confirmation.  
**Acceptance.** `PRD-FR-038`, `SAF-PRIV-005`, `TS-DATA-008`–`TS-DATA-009`; automated fixture proves zero out-of-scope deletes and referential validity of retained history.

## 9. Empty and failure recovery

### JNY-034 Handling an empty state

**Intention.** Understand why content is absent and take the one useful next action.  
**Entry.** No programme, no workouts, no exercise history, no records, filter with no matches, or exhausted finite programme.

**Steps and decisions.**

1. State the exact cause: “No programme yet,” “No completed workouts,” “No comparable records” or “No results for these filters.”
2. Offer one primary context action (choose/create, start unscheduled, clear filters) and at most relevant secondary education.
3. Preserve navigation and data-control access.

**Feedback and decisions.** Empty is neutral—not failure, zero progress or invented chart data.  
**Failure and recovery.** If absence may be corruption/migration, do not use a normal empty state; invoke `JNY-036`.  
**Friction removed.** No fake analytics, placeholder controls, decorative card wall or generic “Nothing here.”  
**Acceptance.** `PRD-FR-041`, `PRD-NFR-012`; cause/action match fixture; screen reader receives heading, explanation and primary action; no fabricated values.

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

## 10. Journey coverage matrix

| Product promise stage | Primary journeys | Release evidence |
|---|---|---|
| Plan | `JNY-001`–`JNY-005`, `JNY-021`–`JNY-025`, `JNY-031` | Programme validation/version tests, schedule prediction study, accessible builder tasks |
| Start | `JNY-006`–`JNY-008` | `PRD-SM-001`, `PRD-SM-002`, idempotent start and conflict tests |
| Record | `JNY-009`–`JNY-018` | `PRD-SM-003`–`PRD-SM-005`, modality tests, timer/non-blocking and restoration suites |
| Progress | `JNY-019`–`JNY-020`, `JNY-026`–`JNY-030` | Record/progression reproducibility, chart comprehension, edit recalculation |
| Control and recover | `JNY-032`–`JNY-036` | Export schema, scoped deletion, storage/migration/corruption failure injection |

## 11. Journey approval criteria

The product owner should approve these journeys only if:

1. expected and unscheduled starts are both discoverable without competing primary actions;
2. normal set logging remains a one-action completion path after valid entry;
3. advanced set detail does not clutter the beginner default but is fully representable;
4. fixed/flexible misses, skips, repeats and moves produce predictable next state;
5. short mode explains deterministic reductions without pretending optimisation;
6. recommendation and record language preserves user control/no-claim boundaries;
7. active work survives every tested interruption/offline case;
8. edits, exports, deletes and corrupt-data recovery preserve exact scope and truth;
9. the selected visual direction can support large text, screen readers, reduced motion and thumb reach without removing actions.
