# NextSet system architecture

Status: proposed foundation  
Date: 2026-08-06  
Primary decisions: [mobile stack](adrs/0001-mobile-stack.md), [local storage](adrs/0002-local-first-storage.md), [cloud deferral](adrs/0003-defer-cloud-backend.md)

## Logging-first applicability — 2026-09-07

The owner-approved scope in [D-009](../project/decision-log.md) and the [current PRD](../product/product-requirements.md) takes precedence over the earlier broad foundation contract below. Blank workouts, repeats and standalone reusable routines require no goal, programme, enrolment, planned occurrence or schedule. Scheduling/sequence automation, carry-forward, ranked substitution recommendations, short-workout adaptation and progression suggestions are deferred; retained rules describe future contracts, not first-release obligations. Core set integrity, comparable descriptive records, editing, offline restoration and data ownership remain required. The current web prototype demonstrates interaction only, with memory that resets on reload; production durability gates remain future work.


## Architectural objective

The user can plan, start, log, interrupt, restore, finish and edit a workout without a network. Every acknowledged critical action is durable. UI polish may evolve; workout history, identifiers and rules must survive product evolution.

## First-release context

```text
VoiceOver / TalkBack / keyboard / touch
                   |
       NextSet iOS and Android app
        |          |             |
   SQLite DB   OS services   user-selected export
                  |                 |
      notifications, haptics,       +-- machine-readable export (restore deferred)
      secure small-value store

No account, backend, push service or mandatory telemetry.
```

Internet availability is irrelevant to core first-release flows. The exercise catalogue ships in the application/database seed and user-created data remains local unless the user explicitly exports it.

## Dependency rule

Dependencies point inward. An inner layer cannot import an outer layer.

```text
Presentation (React Native screens and components)
        |
Application (commands, queries, orchestration)
        |
Domain (entities, value objects, deterministic rules)
        |
Ports (repository, clock, ID, transaction, notification contracts)
        ^
Adapters (SQLite, Expo platform services, future sync)
```

### 1. Domain

Owns set validation, workout lifecycle, optional routine snapshots, comparable descriptive records and units. Scheduling and recommendation modules are future boundaries, not first-release dependencies. It is pure TypeScript with no React, Expo, SQL, wall-clock or random-number imports. Time and IDs arrive through ports. Rules return typed outcomes and explanations rather than mutating global state.

Domain modules:

- `routine`: standalone versions and exercise/target snapshots; `programme` scheduling/enrolment is deferred.
- `workout`: session state machine, exercise snapshots, orthogonal set role/measurement/load/laterality/effort semantics, ordering and completion.
- Future `progression`: deterministic evaluation and explainable recommendation candidates; deferred.
- `records`: personal-record definitions, invalidation and recalculation ranges.
- `measurement`: canonical values, unit conversion and numeric precision.
- `exercise`: catalogue/custom exercise semantics and substitution compatibility.

### 2. Application

Each user intention is one command or query. Examples: `StartBlankWorkout`, `RepeatWorkout`, `StartRoutine`, `CommitSet`, `EditCompletedSet`, `CompleteWorkout`, `RestoreActiveWorkout`, `ExportTrainingData`.

A command:

1. validates input syntax;
2. reads required records through repositories;
3. invokes domain rules;
4. writes all state, revision history and change-log rows in one transaction;
5. commits;
6. emits an in-process invalidation/domain event;
7. returns a durable result to the UI;
8. schedules noncritical effects such as haptics or notifications after commit.

If step 4 or 5 fails, no success state or success haptic is shown. Retrying the same command with the same `command_id` is idempotent.

Queries read projections from SQLite. A small in-memory cache is permitted only when it can be discarded and recreated without data loss. No query waits for network refresh.

### 3. Presentation

Screens consume typed view models assembled by application queries. Local optimistic rendering is allowed, but the component exposes `saving`, `saved` or `failed` state until the transaction resolves. A failed commit retains the user's input on screen, offers retry, and never silently reverts.

Presentation state includes navigation, focus, transient animation and open-sheet state. Durable workout state, timers, typed drafts, completion flags and schedule position belong in SQLite.

Accessibility is a component contract: semantic name, role, state/value, logical focus order, scalable layout and reduced-motion behaviour must be defined with the visual state.

### 4. Data adapter

`SQLiteDatabase` owns one connection lifecycle, migration gate, PRAGMA configuration, transaction runner and write queue. Repositories map database rows to domain values; SQL rows never escape the adapter.

Rules:

- one database file for transactional consistency;
- foreign keys on every connection;
- explicit parameterised statements only;
- explicit transaction per aggregate command;
- no SQL in screens/hooks;
- no delete-by-default for historical workout data;
- checked-in numbered migrations with pre/postconditions;
- startup `quick_check` routinely and full `integrity_check` plus `foreign_key_check` in diagnostics, upgrade validation and release fixtures;
- prepared queries and indexes validated against representative large histories.

SQLite notes that `integrity_check` does not detect foreign-key errors, so both checks are required. [SQLite PRAGMA reference](https://www.sqlite.org/pragma.html) (accessed 2026-08-06).

### 5. Platform adapters

- `Clock`: wall time plus monotonic duration; timers never infer elapsed duration only from UI ticks.
- `IdGenerator`: standards-compliant UUIDv7 generated locally, with collision failure treated as fatal. UUIDv7 is time-ordered but remains opaque to domain rules. [RFC 9562](https://www.rfc-editor.org/info/rfc9562/) (accessed 2026-08-06).
- `Lifecycle`: foreground/background/termination signals are optimisation hints, not persistence guarantees.
- `Haptics`: optional feedback after durable success; silent failure is acceptable.
- `LocalNotifications`: optional rest-timer reminder; the in-app timer derives from persisted `ends_at`, so delayed/missing notifications do not corrupt state.
- `SecureStore`: only small secrets or future tokens/keys, never the workout database or irreplaceable data. Expo explicitly warns not to use SecureStore as the sole source of truth for critical data. [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) (accessed 2026-08-06).
- `FileExport`: writes a staged file, verifies checksum/readability, then invokes the system share/document UI.

## Aggregate and transaction boundaries

| Command | Atomic records | Post-commit work |
|---|---|---|
| Start workout | planned-workout disposition, workout session, exercise snapshots, initial rest state, audit/change rows | navigate, optional haptic |
| Commit/edit set | set row, exercise/workout aggregates, recommendation/PR invalidations, audit/change rows | refresh projections, timer/haptic |
| Substitute exercise | workout-exercise snapshot, disposition of old row, new targets/order, note, audit/change rows | refresh UI |
| Complete workout | all draft validation, session completion, plan/sequence advancement, derived PR/recommendation rows, audit/change rows | completion feedback, cancel timer notification |
| Edit completed workout | edited rows, new revision, derived-data invalidation/recompute, audit/change rows | refresh history |
| Programme edit | new immutable programme version and all owned children; pointer update | rebuild future plans, never mutate completed snapshots |
| Delete local data | deletion request marker then transactional domain purge; export metadata retained only if user keeps export | remove caches/notifications; secure-value cleanup |

No transaction includes file sharing, haptics, notifications or network calls.

## Workout lifecycle state machine

```text
draft/planned --start--> active --finish--> completed
      |                    |  \
      |                    |   +--abandon--> abandoned
      +--skip/cancel-------+ 

active --app/process interruption--> active (durable, restored)
completed --edit--> completed with a new revision
```

Only one active session is allowed in the first release, enforced by a database constraint. Starting another presents continue/finish/abandon choices. `completed` is never changed back to `active`; reopening for correction creates a new edit revision while retaining completed status.

## Startup and recovery

1. Open database in a guarded bootstrap screen.
2. Verify application ID/schema metadata and create a transactionally consistent pre-migration recovery snapshot when a migration is required. Use SQLite's online backup API or `VACUUM INTO`; otherwise stop the serialized writer, checkpoint WAL, close every connection, copy the closed database, and verify the snapshot. Copying the main file alone while WAL may contain committed pages is forbidden.
3. Apply each migration in a transaction; record checksum, start/end time and result.
4. Run integrity and foreign-key checks.
5. If checks fail, preserve the original, enter recovery mode and offer diagnostics, offline export where readable, local recovery copies and any explicitly supported OS/platform restore path; do not initialise an empty replacement silently. User-directed portable import/restore remains post-MVP (`FEAT-POST-009`).
6. Query for the single active workout and pending committed drafts.
7. Recalculate timer display from persisted timestamps and monotonic state where available.
8. Route to the recovery banner/active workout or Today.

If the database cannot open, the app never overwrites it. It copies the unreadable file to a quarantined path, records non-content diagnostics locally and asks the user before any restore/reset action.

## Error model

Errors are typed as `validation`, `conflict`, `storage_transient`, `storage_corrupt`, `migration`, `permission`, `export`, or `unexpected`. User messages state what was and was not saved. Technical logs contain operation codes and correlation IDs, not workout content, notes or raw SQL values.

Retry policy:

- validation: correct input; never auto-retry;
- SQLite busy/transient I/O: bounded retry with jitter while retaining input;
- constraint conflict: reread and show a domain-specific choice;
- corruption/migration: stop writes and enter recovery mode;
- haptic/notification failure: continue; record redacted diagnostic only;
- export failure: leave source DB unchanged and delete only the incomplete staging file.

## Derived data

Personal records, charts and recommendations are reproducible projections. Their source rows and `calculation_version` are stored. Editing/deleting a contributing set marks the affected projection range stale and recomputes it transactionally or through a durable local job. The UI never shows known-stale analytics as current.

## Package boundaries for future implementation

```text
mobile/
  presentation/        React Native screens, components, view models
  application/         commands, queries, transaction orchestration
  domain/              pure rules and values
  data/
    ports/             repository and service interfaces
    sqlite/            schema, migrations, repositories, projections
  platform/            Expo/native adapters
  sync/                absent in v1; future adapter only
  test-support/        clocks, IDs, fixtures, fault injection
```

Exact folders may adapt to the approved repository structure, but dependency direction is mandatory.

## First release, deferred work and reversibility

| Item | Classification | Notes |
|---|---|---|
| Pure domain/application boundary | Must; expensive to reverse | Prevents UI/data coupling and enables deterministic tests. |
| SQLite source of truth | Must; expensive to reverse | Existing user data and migrations depend on it. |
| One active-workout constraint | Must; reversible via migration | Simplifies restoration and sync; revisit with validated parallel-session need. |
| Expo Router/navigation library | Reversible | Select during implementation; navigation must not own durable state. |
| State-management library | Reversible | Prefer minimal local projection subscriptions; no global duplicate database. |
| ORM/query builder | Reversible | Adopt only after migration, transaction and generated-SQL review. |
| Cloud sync/accounts | Deferred; later expensive | See ADR-0003 and future-sync design. |
| Remote feature flags/analytics | Deferred | No runtime dependency for first release. |
| SQLCipher/app lock | Deferred decision | Requires threat model, key recovery and backup validation. |
| User-directed portable restore/import | Post-MVP | `FEAT-POST-009`; retain seams only, with no first-release control or gate unless explicitly moved by the product owner. |

## Architecture fitness functions

- Static dependency test: `domain` imports only domain/test utilities; `presentation` cannot import SQLite modules.
- Every application command has transaction rollback and idempotency tests.
- Every migration is tested from all supported prior schemas, with fault injection.
- Every critical command has a process-termination E2E scenario.
- Release-build performance and accessibility gates in `docs/quality` block release.
- MVP export validates documented schema/content/checksums without mutating the database; declared platform-backup behavior matches real inclusion/exclusion and supported OS restore tests.
- No test or production path requires network to run a workout.

## Unresolved decisions

- Approved minimum devices/OS versions and the corresponding exact Expo SDK pin.
- Whether/when the product owner moves `FEAT-POST-009` portable restore into a future release; the current MVP default is no portable restore/import, and export alone is not described as device-loss recovery.
- Database-level encryption and app lock threat model.
- Exact handling of a corrupt database when no valid backup exists; user consent is required before reset.
- Whether an eventually approved metrics system can meet the no-content privacy boundary.
