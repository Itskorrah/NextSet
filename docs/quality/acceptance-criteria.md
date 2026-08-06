# NextSet acceptance criteria

Status: proposed contract; no criterion is claimed as passed in the foundation phase  
Date: 2026-08-06

## Reading this document

- **MUST-v1** blocks the first production release.
- **DEFER** is intentionally outside v1; no placeholder control may imply it exists.
- Evidence must be linked to the release commit/build and run on the stated platform/device.
- “Immediate” and “fast” mean the measured budgets in [performance-budgets.md](performance-budgets.md).
- Accessibility criteria defer to [accessibility-requirements.md](accessibility-requirements.md).

## Product clarity and start

### AC-TODAY-01 — next workout is immediately understandable (MUST-v1)

Given an enrolled user with a valid next fixed or flexible workout, when Today finishes local loading, then the screen presents the workout name/focus, whether it is scheduled or next-in-sequence, last workout context, estimated duration if known, and one dominant Start action without requiring a chart or secondary screen.

Evidence: moderated comprehension test with at least 8 representative participants (including ≥3 beginners), ≥7/8 correctly identify what comes next and how to start within 5 seconds; automated content/state tests.

### AC-START-01 — expected workout starts in one action (MUST-v1)

Given Today shows an expected workout and there is no active session/conflict, when the user activates Start once, then a durable active workout opens. No confirmation is inserted unless a material choice is unresolved.

Evidence: E2E tap count = 1; start transaction atomicity and latency results.

### AC-START-02 — unplanned workout is easy (MUST-v1)

Given Today, when the user chooses the clearly labelled alternate action for an unscheduled workout, then they can select an existing template or blank workout and reach an active workout in no more than 3 deliberate actions after opening the alternate action.

Evidence: E2E and moderated journey; action count documented.

### AC-ACTIVE-01 — existing active workout takes precedence (MUST-v1)

Given a durable active workout, when the app opens or the user attempts another start, then NextSet offers Continue as the primary action and does not create a second active session. Finish/abandon is explicit.

Evidence: cold-start and duplicate-command E2E; unique database constraint.

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

### AC-SUB-01 — substitution preserves purpose and user control (MUST-v1)

Given an unavailable exercise, substitutions show movement/muscle/equipment relevance and what target context will be preserved; the user can search/override. Confirming records original and replacement IDs/reason without changing completed history or the programme unless separately chosen.

Evidence: domain compatibility tests, snapshot transaction test and moderated comprehension. No medical-safety claim.

### AC-SHORT-01 — short-workout changes are explained (MUST-v1 if feature is in approved MVP)

Given a time limit, the result retains higher-priority work according to deterministic programme data, identifies reduced/omitted work before confirmation, and allows override. It does not claim optimality.

Evidence: rule examples/property tests and explanation snapshot.

## Offline, interruption and data safety

### AC-OFFLINE-01 — full workout offline (MUST-v1)

With radios disabled before cold launch, the user can start, log/edit, substitute, run the in-app timer, complete and review the workout. No spinner/error waits for network.

Evidence: signed release E2E on iOS/Android physical devices.

### AC-RESTORE-01 — active workout survives interruption (MUST-v1)

After every acknowledged core action, process termination/relaunch restores exactly one active session with the latest committed values/order/substitutions and correct timer state. A restored banner identifies continuity.

Evidence: 100 random-boundary terminations per platform with zero acknowledged loss.

### AC-WRITE-01 — no silent user-data loss (MUST-v1)

The UI reports saved only after commit. On busy, disk-full, I/O or constraint failure, attempted input remains visible/recoverable and the app says it was not saved. No success haptic occurs.

Evidence: statement/commit fault injection and device low-space tests.

### AC-TXN-01 — aggregate commands are atomic/idempotent (MUST-v1)

Start, set edit/commit, substitution, completion, schedule advancement, programme publish and delete result in exactly the complete before or after state under every injected failure, and retrying a command does not duplicate effects.

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

## Programme and scheduling

### AC-SCHED-01 — missed day does not corrupt schedule (MUST-v1)

Given a fixed programme and a missed local date, reopening preserves the occurrence as `missedUnresolved` and shows a neutral choice consistent with the configured policy; it never marks work completed, treats the occurrence as skipped or destroys later plans merely because time passed. A flexible occurrence does not become missed merely because a reminder date passed unless a future date-committed mode defines that behavior.

Evidence: deterministic clock/time-zone/DST tests and E2E.

### AC-SCHED-02 — fixed programmes follow explicit dispositions (MUST-v1)

Move, skip, repeat and full/partial complete change only the intended planned occurrence; a move preserves its stable logical occurrence identity, partial completion preserves completed/skipped/not-attempted child dispositions, no duplicate/missing session is created, and future schedule recalculation is explainable.

Evidence: model/property tests and plan lineage assertions.

### AC-SCHED-03 — flexible sequence behaves as specified (MUST-v1)

Completion advances exactly once; skip/repeat/recovery-day behaviour follows its explicit return policy; retry/interruption cannot double-advance.

Evidence: state-machine/property tests and transaction failure tests.

### AC-PROG-01 — programme editing preserves history (MUST-v1)

Publishing an edit creates a new immutable programme/template version. Active/completed snapshots and prior versions remain unchanged. A live enrolment adopts the version only through an explicit action and stored future not-started occurrence boundary.

Evidence: database equality/hash assertions and user-facing version choice test.

## History, records and guidance

### AC-HIST-01 — completed workouts edit safely (MUST-v1)

Editing a completed workout records a revision, retains status, recalculates affected aggregates/records/recommendations and never shows known-stale derived data as current.

Evidence: edit sequence vs full-rebuild comparison and interruption test.

### AC-PR-01 — personal records are correct and restrained (MUST-v1 for approved record types)

Each approved record type has a precise formula, eligibility/tie/unit policy and source-set provenance. Edit/delete invalidates or supersedes correctly. Celebration never blocks the next set.

Evidence: exhaustive boundary examples, property tests and UI timing/accessibility tests.

### AC-GUIDE-01 — progression recommendations explain why (MUST-v1 where recommendation is shown)

Every recommendation names the observed rule-relevant facts, rule/version, calculation and proposed change; is labelled as a suggestion; can be deferred, dismissed or overridden; and creates no change until accepted. Acceptance publishes an immutable future template/programme version at an explicit not-started occurrence boundary. A contributing source edit invalidates—not rewrites—a pending recommendation and creates a separately identified recomputed candidate when still eligible. Unsupported medical/professional claims are absent.

Evidence: rule/explanation golden tests and content review.

### AC-CHART-01 — every chart answers a question (MUST-v1)

Every production chart has an approved requirement naming the user question/action, units/time range/source/empty state and accessible non-visual summary. Fake or placeholder series are prohibited.

Evidence: requirement traceability, fixture/source assertion and accessibility review.

## Beginner/advanced balance

### AC-DISCLOSE-01 — simple first, powerful when needed (MUST-v1)

Default onboarding/programme/set logging does not require RPE/RIR, advanced set dimensions, progression-rule authoring or schedule internals. Approved advanced controls remain discoverable through labelled progressive disclosure and persist predictably.

Evidence: beginner moderated test (≥7/8 complete core setup without assistance) plus expert scenario coverage; default screen inventory.

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

- Accounts, cloud backup, cross-device sync and push notifications: DEFER; no account/cloud UI.
- Public social feed, messaging, marketplace, payments/subscriptions, nutrition and leaderboards: DEFER/EXCLUDED per product approval.
- Smartwatch, autonomous AI coaching and AI-generated programmes: DEFER; no placeholder claims.
- Remote analytics/error reporting: DEFER until privacy/vendor decision and separate criteria.
- SQLCipher/app lock: DEFER until threat/key-recovery/backup decision.
- User-directed portable restore/import: POST-MVP under `FEAT-POST-009`; moving it requires an explicit product-owner decision and new security/migration/round-trip criteria. MVP has no restore/import control.

## Foundation-phase acceptance

This documentation phase is accepted only when product owner approves the product/MVP/visual/architecture/journeys; all decision statuses are explicit; citations carry access date; documents are internally linked; no production app is represented as built/tested; prototypes are labelled disposable; and current uncertainties remain visible. Production implementation must stop until that approval.
