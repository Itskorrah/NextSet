# NextSet acceptance criteria

Status: proposed release contract updated for accepted logging-first scope (D-009); no production criterion is claimed passed in this foundation phase  
Updated: 2026-09-07

## Reading this document

- **MUST-v1** blocks the first production release.
- **DEFER** is intentionally outside v1; no placeholder control may imply it exists.
- Evidence must be linked to the release commit/build and run on the stated platform/device.
- “Immediate” and “fast” mean the measured budgets in [performance-budgets.md](performance-budgets.md).
- Accessibility criteria defer to [accessibility-requirements.md](accessibility-requirements.md).

## Scope and evidence applicability

The first release is logging, optional routines/repeat, editable history and meaningful trends. It MUST remain complete without a goal, programme, schedule or advice. The current PRD phase labels override older broad-MVP references in domain/test documents. Fixed/flexible schedule automation, ranked substitutions, short-workout adaptation, advanced group/drop authoring and progression suggestions are DEFER; their criteria below retain stable IDs but are not v1 gates.

The disposable browser prototype validates supported interactions only. Its [README](../../prototypes/nextset-directions/README.md) and [QA evidence](../../prototypes/nextset-directions/design-qa.md) must state implemented modes, session-storage limitations and omitted release features. A browser test cannot pass native durability, migration, export, device accessibility or a full first-release modality contract. Those remain explicit future gates.

## Product clarity and start

### AC-TODAY-01 — Workouts makes starting understandable (MUST-v1)

Given either first launch or an existing local history, Workouts presents one dominant Start workout action when idle and Continue workout when a session exists. Optional recent-repeat/routines are secondary; no goal, programme, schedule, chart or onboarding-completion state is required. Empty history does not seed fictional records or hide navigation.

Evidence: moderated comprehension test with at least 8 representative participants (including ≥3 beginners), ≥7/8 identify how to start/continue without assistance within 5 seconds; automated new/returning/active states.


### AC-START-01 — blank workout starts in one action (MUST-v1)

Given Workouts with no active session/conflict, activating Start workout once creates a durable independent empty session and shows Add exercise. The session contains zero seeded exercises, observed sets, programme/routine/occurrence requirements or completed flags. Unit preferences remain visible/editable without a setup wizard.

Evidence: E2E tap count = 1, empty session assertions, start atomicity/idempotency and latency results; offline first and repeated launches.


### AC-START-02 — routine and repeat are optional shortcuts (MUST-v1)

Given Workouts or History, the user can preview/start a routine or repeat a completed workout without goal or schedule choices. From an already open source detail, one deliberate start/repeat activation creates the new session when conflict-free. A user with no routine can start and finish blank workouts indefinitely and receives the same history/trend features.

Evidence: routine/repeat and blank-only E2E plus moderated discoverability; no compulsory enrolment/sequence fields and no second active session.


### AC-ACTIVE-01 — existing active workout takes precedence (MUST-v1)

Given a durable active workout, when the app opens or the user attempts another start, then NextSet offers Continue as the primary action and does not create a second active session. Finish/abandon is explicit.

Evidence: cold-start and duplicate-command E2E; unique database constraint.

### AC-REPEAT-01 — repeat is a new record (MUST-v1)

Repeating a completed workout copies its selected revision's exercises/order and clearly labelled optional reference targets into a new session. New IDs, zero observed sets/completion flags, fresh timestamps and reset duration/timer/PR eligibility are required. Source completion, notes/revision provenance and history do not change. Duplicate starts are idempotent and an existing active workout takes precedence.

Evidence: new-session/source-hash assertions; repeat after correction; complete a second workout and verify distinct history/frequency; interruption/duplicate-command tests.

### AC-FINISH-01 — finish records actual work without future choices (MUST-v1)

Finishing preserves exactly observed completed sets. Unlogged targets do not become observations; dirty drafts receive an explicit save/return/discard choice. The user can finish before optional routine targets without resolving a sequence, carry-forward or recommendation. A zero-set/abandoned session creates no completed-workout frequency or personal-best evidence. Optional Save as routine does not block completion or create another session.

Evidence: empty/partial/routine-overrun/draft/failure/duplicate-completion scenarios; source counts and no schedule/recurrence mutation.

## Repeated workout logging

### AC-SET-01 — normal set is fast (MUST-v1)

Given an active exercise with prior/target context visible and a valid populated normal set row, completing that unchanged set requires exactly one deliberate activation of the visible completion action, and durable feedback meets the set-commit performance budget. If the row is blank or the user changes one value first, reaching the edited valid state and completing it takes no more than three deliberate touch actions excluding numeric keystrokes. The edited/blank allowance never weakens the one-action populated-row contract.

Evidence: instrumented task run across 30 consecutive sets and moderated repeated-use test; p95/p99 timing.

### AC-SET-02 — edit is simple and safe (MUST-v1)

Given a completed set in the active workout, when the user activates the visible row/value, then they can change one value and recommit in no more than 3 deliberate actions excluding keystrokes; cancellation preserves old data and commit creates one revision.

Evidence: E2E, revision/database assertions and screen-reader equivalent action.

### AC-SET-03 — set dimensions remain explicit (MUST-v1)

Set role, measurement mode, load mode, laterality and effort intent/observation accepted by the approved MVP use separate validated fields. Their combined meaning is announced textually where needed; colour/icon alone does not identify any dimension, and selecting one dimension never erases another compatible one.

Evidence: domain/component/accessibility test matrix. Unsupported combinations are rejected without data mutation.

### AC-SET-04 — add/reorder/unplanned set does not lose content (MUST-v1)

Adding an unplanned set or reordering exercises/sets preserves stable IDs, values, grouping and deterministic order through process termination.

Evidence: property tests and termination E2E.

### AC-TIMER-01 — timer assists without blocking (MUST-v1)

Given a running rest timer, the user can log/edit/navigate within the active workout; the timer is visible but does not cover critical controls. Denied/delayed notifications or disabled haptics do not alter the timer or workout.

Evidence: both-platform E2E with permission allowed/denied, background/clock change and large text.

### AC-SUB-01 — manual exercise changes preserve recorded work (MUST-v1)

Given an active workout, users can manually add a different exercise or remove an unlogged exercise without a ranked recommendation or future-programme choice. Recorded sets retain their original exercise identity unless the user explicitly edits/deletes those facts with recovery. Previous values use the new exercise's compatible signature; mismatched draft targets do not silently carry across modes.

Evidence: manual change/record-preservation transaction tests, comparison-signature tests and accessible operation. Ranked suggestion/reason/equivalence UI is DEFER under PRD-FR-021.


### AC-SHORT-01 — short-workout changes are explained (DEFER — D-009)

Historical future-feature contract only; it is not a v1 implementation dependency or reachable placeholder.

Given a time limit, the result retains higher-priority work according to deterministic programme data, identifies reduced/omitted work before confirmation, and allows override. It does not claim optimality.

Evidence: rule examples/property tests and explanation snapshot.

## Offline, interruption and data safety

### AC-OFFLINE-01 — full workout offline (MUST-v1)

With radios disabled before cold launch, the user can start blank or from routine/repeat, add/change exercises manually, log/edit, run the in-app timer, complete and review the workout. No spinner/error waits for network.

Evidence: signed release E2E on iOS/Android physical devices.

### AC-RESTORE-01 — active workout survives interruption (MUST-v1)

After every acknowledged core action, process termination/relaunch restores exactly one active session with the latest committed values/order/exercise changes and correct timer state. A restored banner identifies continuity.

Evidence: 100 random-boundary terminations per platform with zero acknowledged loss.

### AC-WRITE-01 — no silent user-data loss (MUST-v1)

The UI reports saved only after commit. On busy, disk-full, I/O or constraint failure, attempted input remains visible/recoverable and the app says it was not saved. No success haptic occurs.

Evidence: statement/commit fault injection and device low-space tests.

### AC-TXN-01 — aggregate commands are atomic/idempotent (MUST-v1)

Blank/routine/repeat start, set edit/commit, manual exercise changes, completion, routine save/edit and delete result in exactly the complete before or after state under every injected failure, and retrying a command does not duplicate effects.

Evidence: database fault matrix and duplicate-delivery tests.

### AC-MIG-01 — migration cannot erase the source (MUST-v1)

Every supported prior schema migrates with stable IDs/counts/invariants; interruption or validation failure leaves the original/recovery copy usable and never opens an empty replacement.

Evidence: fixture hashes, interruption matrix, integrity/foreign-key checks.

### AC-CORRUPT-01 — corrupt/partial data enters recovery (MUST-v1)

An unreadable or invariant-breaking database is preserved, writes stop, and the user gets a truthful local recovery/export/reset path. MVP offers no in-app portable restore; any supported OS backup recovery occurs through the declared platform flow, and reset requires explicit confirmation.

Evidence: corrupt corpus E2E and filesystem inspection.

### AC-BACKUP-01 — platform-backup policy and export are verifiable (MUST-v1)

The signed app has documented platform backup inclusion/exclusion rules and actual OS restore behavior is tested where data is included. The MVP export stages privately, is machine-readable/versioned, verifies manifest/checksums and reports failure without changing the live DB. It is not presented as importable or as a portable backup.

Evidence: both-platform backup-policy/config audit, supported OS backup/restore drill or verified exclusion behavior, offline export schema/content/checksum tests and residual-loss copy review.

## Routine integrity and deferred scheduling

### AC-SCHED-01 — missed day does not corrupt schedule (DEFER — D-009)

Historical future-feature contract only; it is not a v1 implementation dependency or reachable placeholder.

Given a fixed programme and a missed local date, reopening preserves the occurrence as `missedUnresolved` and shows a neutral choice consistent with the configured policy; it never marks work completed, treats the occurrence as skipped or destroys later plans merely because time passed. A flexible occurrence does not become missed merely because a reminder date passed unless a future date-committed mode defines that behavior.

Evidence: deterministic clock/time-zone/DST tests and E2E.

### AC-SCHED-02 — fixed programmes follow explicit dispositions (DEFER — D-009)

Historical future-feature contract only; it is not a v1 implementation dependency or reachable placeholder.

Move, skip, repeat and full/partial complete change only the intended planned occurrence; a move preserves its stable logical occurrence identity, partial completion preserves completed/skipped/not-attempted child dispositions, no duplicate/missing session is created, and future schedule recalculation is explainable.

Evidence: model/property tests and plan lineage assertions.

### AC-SCHED-03 — flexible sequence behaves as specified (DEFER — D-009)

Historical future-feature contract only; it is not a v1 implementation dependency or reachable placeholder.

Completion advances exactly once; skip/repeat/recovery-day behaviour follows its explicit return policy; retry/interruption cannot double-advance.

Evidence: state-machine/property tests and transaction failure tests.

### AC-PROG-01 — routine editing preserves active and historical snapshots (MUST-v1)

Creating/editing a routine works without a programme, schedule, goal, progression rule or enrolment. Save creates a version/snapshot boundary for future starts; active/completed workouts and earlier routine versions remain unchanged. Saving a completed workout as a routine changes no observed record and starts no session. Empty/invalid edits preserve inputs and the prior valid routine.

Evidence: before/after source and session hash assertions; create/edit/save-from-workout E2E including cancellation/failure; no scheduling/version-boundary wizard required.


## History, records and guidance

### AC-HIST-01 — completed workouts remain readable and safely editable (MUST-v1)

History is available without a routine or programme and opens raw source exercises/sets/units/notes with completion/edit provenance. Editing completed facts records a revision, preserves original completion identity/time, recalculates affected frequency/performance/bests and never shows known-stale results as current. Read, repeat and save-as-routine cannot alter the source record.

Evidence: source immutability and edit-vs-full-rebuild tests, invalid edit/cancellation/failure E2E, offline history and accessible raw-record views.


### AC-PR-01 — observed personal bests are comparable and traceable (MUST-v1)

Initial record categories follow PRD-FR-026: highest eligible external load and most reps at the same load for the same compatible exercise/measurement/load/laterality signature. The source working set, unit, date, rule/eligibility/tie policy are inspectable. Warm-ups, drafts, empty sessions and incompatible variants cannot produce working PRs. Edit/delete deterministically invalidates or supersedes results. Estimated 1RM, aggregate cross-exercise scores and health/fitness-outcome claims are DEFER.

Evidence: eligibility/tie/unit boundaries, source-set provenance, correction/deletion full-rebuild equivalence and restrained accessible feedback. No unsupported modality is coerced into a load record.


### AC-GUIDE-01 — progression recommendations explain why (DEFER — D-009)

Historical future-feature contract only; it is not a v1 implementation dependency or reachable placeholder.

Every recommendation names the observed rule-relevant facts, rule/version, calculation and proposed change; is labelled as a suggestion; can be deferred, dismissed or overridden; and creates no change until accepted. Acceptance publishes an immutable future template/programme version at an explicit not-started occurrence boundary. A contributing source edit invalidates—not rewrites—a pending recommendation and creates a separately identified recomputed candidate when still eligible. Unsupported medical/professional claims are absent.

Evidence: rule/explanation golden tests and content review.

### AC-CHART-01 — every chart answers a question (MUST-v1)

Every production chart has an approved requirement naming the user question/action, units/time range/source/empty state and accessible non-visual summary. Fake or placeholder series are prohibited.

Evidence: requirement traceability, fixture/source assertion and accessibility review.

### AC-TREND-01 — useful trends with honest empty states (MUST-v1)

Progress answers exactly the initial questions: recorded workout frequency, comparable exercise performance and observed personal bests. Frequency counts completed sessions with at least one recorded set in the displayed local-date range, excluding drafts, empty/abandoned sessions and illustrative samples. Exercise series compare the same variant and compatible measurement/load/laterality signature using explicit units and eligible observed working sets; they never turn assistance, a different variant or missing values into a false improvement.

Zero observations explain what is absent and offer Start workout. One comparable session shows its actual observations and explains that another comparable session is needed to assess change. Each displayed calculation states range/inclusion rules and has a source list/table and accessible text equivalent. A routine or goal is never required. Correction/deletion rebuilds affected views; no e1RM, body scoring, adherence pressure or prescriptive next target appears.

Evidence: empty, single-session, two-comparable-session, incompatible-mode/variant, warm-up, zero-set, sample, correction/deletion and date-range fixtures; source-set drill-down; chart comprehension ≥85% target and screen-reader equivalent.

## Beginner/advanced balance

### AC-DISCLOSE-01 — logging remains complete without planning (MUST-v1)

First launch, repeated blank workouts, set entry, finish, history and trends require no account, goal, routine, programme, scheduling, progression-rule or exertion setup. Optional routines and basic set detail are discoverable on demand. Deferred features have no placeholder controls and no hidden database prerequisite for a valid session.

Evidence: beginner moderated test (≥7/8 complete a blank workout without assistance), routine/repeat cohort tasks, and route/schema dependency inventory.


### AC-FEATURE-01 — every feature maps to an approved requirement (MUST-v1)

Every reachable production control has a requirement/acceptance ID and complete behaviour. No placeholder, “coming soon” dead control, fake analytics or prototype-only route ships unless the product owner explicitly approves a truthful informational surface.

Evidence: route/control inventory linked to requirements and release exploratory pass.

## Accessibility and performance

### AC-A11Y-01 — scalable text and reflow (MUST-v1)

At 200% font scaling and approved platform accessibility sizes, all critical journeys retain content/function, critical labels are not truncated, and two-dimensional scrolling is not required for ordinary text/forms.

Evidence: automated layout matrix and physical-device manual journeys.

### AC-A11Y-02 — critical controls are operable (MUST-v1)

All interactive controls have semantic name/role/state/value, logical focus order, visible focus where applicable, and at least 48×48 logical-pixel hit areas for NextSet's mobile UI. Contrast meets the accessibility specification.

Evidence: semantic/geometry/contrast automation plus VoiceOver/TalkBack.

### AC-A11Y-03 — alternatives to motion/colour/haptics (MUST-v1)

No meaning/action is conveyed only by colour, animation, gesture or haptic. Reduced Motion removes nonessential spatial/celebratory motion without delaying completion.

Evidence: token/state tests and manual review.

### AC-PERF-01 — repeated loop meets budget (MUST-v1)

Signed release builds on minimum devices meet set commit, start/finish, frame, memory and large-history budgets with no network.

Evidence: raw traces and percentile report linked to build; development-mode evidence is invalid.

## Privacy and release integrity

### AC-PRIV-01 — local-only claim is true (MUST-v1)

Traffic capture across all core journeys in the signed build contains no production outbound request except an explicitly initiated external support/licence link. No ads, session replay or undisclosed analytics SDK is present.

Evidence: proxy/device capture, dependency/SBOM and binary permission review.

### AC-PRIV-02 — export/share is explicit and minimal (MUST-v1)

Before sharing, the user previews data/card content and private notes/identifiers are excluded by default. App-owned staging copies are deleted after handoff/failure.

Evidence: filesystem and content inspection.

### AC-DELETE-01 — delete is honest and complete within scope (MUST-v1)

Delete-all identifies consequences, offers export, removes app-owned DB/WAL/cache/history/staging/secure values and restarts clean. It states that shared files and platform backups are outside immediate control.

Evidence: both-platform filesystem/backup/UI inspection.

## Explicitly deferred acceptance boundaries

- Goal/programme setup, fixed/flexible scheduling, short-workout recommendations, ranked substitutions, group/drop authoring and progression suggestions: DEFER under D-009; manual logging and optional simple routines remain complete.
- Accounts, cloud backup, cross-device sync and push notifications: DEFER; no account/cloud UI.
- Public social feed, messaging, marketplace, payments/subscriptions, nutrition and leaderboards: DEFER/EXCLUDED per product approval.
- Smartwatch, autonomous AI coaching and AI-generated programmes: DEFER; no placeholder claims.
- Remote analytics/error reporting: DEFER until privacy/vendor decision and separate criteria.
- SQLCipher/app lock: DEFER until threat/key-recovery/backup decision.
- User-directed portable restore/import: POST-MVP under `FEAT-POST-009`; moving it requires an explicit product-owner decision and new security/migration/round-trip criteria. MVP has no restore/import control.

## Foundation-phase acceptance

D-009 records product-owner acceptance of the logging-first scope only. This documentation phase is accepted only when the owner also approves final visual direction, architecture and revised critical journeys; all decision statuses are explicit; citations carry access date; documents are internally linked; no production app is represented as built/tested; prototypes are labelled disposable; and current uncertainties remain visible. Production implementation must stop until that approval.
