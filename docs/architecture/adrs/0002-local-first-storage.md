# ADR-0002: SQLite is the local source of truth

- Status: proposed
- Date: 2026-08-06
- Owners: architecture and product owner
- Decision class: expensive to reverse once users have data
- Approval required: yes

## Context

Workout data must survive poor reception, app backgrounding, process termination and device restart. A key-value store cannot safely represent the relational history, transactions and migrations required. A remote database cannot be the first-release availability dependency.

## Decision

Use one application-owned SQLite database through `expo-sqlite` as the sole authoritative data store. UI state is a projection; it is never the durable record.

Required configuration and rules:

- Enable foreign keys on every connection.
- Use write-ahead logging only after crash/interruption tests on supported devices.
- Use `synchronous=FULL` for the initial critical-write baseline; relax only through a new measured data-safety decision.
- Run all multi-row commands in explicit transactions.
- Serialize writes through one database service and parameterise all values.
- Store checked-in forward-only schema migrations and migration metadata.
- Persist stable UUIDv7 identifiers, row versions, timestamps and tombstones needed for export and future sync.
- Snapshot workout names, units, targets and relevant programme context so later edits cannot rewrite history.
- Acknowledge a save only after commit. Never depend on a lifecycle callback or background task for correctness.

SQLite documents that transactions appear atomic even across operating-system crash or power failure, subject to the filesystem guarantees it describes. Expo documents that its SQLite database persists across app restarts. [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html) and [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (accessed 2026-08-06).

## Consequences

Positive:

- Workouts can be created, edited, completed and read offline.
- Relational constraints and transactions protect multi-entity invariants.
- A portable, inspectable data boundary supports export and future sync.

Negative:

- Schema and migration discipline become release-critical.
- SQLCipher, if later enabled, complicates backup/key restore.
- SQLite is not a multi-device conflict resolver; sync metadata and policies are still required.

## Alternatives

- Async key-value storage: rejected as canonical storage; permitted only for noncritical disposable caches.
- Realm/object database: not selected because it adds a larger vendor/runtime dependency and makes cloud-sync coupling easier to introduce accidentally.
- Platform-specific SwiftData/Room: viable only with two data implementations and migration suites.
- Cloud-first API cache: rejected because it violates offline reliability.

## Revisit triggers

- Critical SQLite commits cannot meet the approved latency budget on the minimum device.
- A future feature needs write concurrency or data volume that measured SQLite behaviour cannot support.
- An approved account/sync design requires a different local representation; migration must preserve existing IDs and history.
- The threat model requires database-level encryption and an approved backup/key-recovery design exists.

