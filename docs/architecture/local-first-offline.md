# Local-first, offline and restoration design

Status: proposed  
Date: 2026-08-06

## Promise

NextSet's workout loop is fully local. With airplane mode enabled, a user can open existing data, start a planned or unscheduled workout, log/edit/reorder/substitute sets and exercises, run the in-app rest timer, complete the workout, advance a fixed or flexible programme, review history, and export data to a local provider that does not require network access.

“Offline” does not mean “queue the workout in memory until connectivity returns.” The SQLite commit is the completion boundary for every critical action.

Google's current offline-first guidance describes the local data source as the canonical source read by higher layers and recommends writing critical user data locally first. NextSet adopts that principle without a first-release network source. [Android offline-first architecture](https://developer.android.com/topic/architecture/data-layer/offline-first) (accessed 2026-08-06).

## Write protocol

```text
user action
  -> validate syntax and domain invariants
  -> enqueue one serialized database command
  -> BEGIN transaction
       mutate domain rows
       append revision / command receipt / change event
       invalidate or update derived rows
     COMMIT
  -> update saved projection
  -> noncritical haptic/notification
```

- The UI may render the new value optimistically, but it remains visibly `saving` until commit.
- On failure, retain the attempted input and offer retry/correction. Never show a success haptic or “saved” state.
- Structured workout fields are written on every valid value change; do not rely on blur, navigation or app-background events.
- A rapid double tap reuses or deduplicates a command ID; it cannot create two sets/completions.
- No debounce window may be the only copy of workout data. If note-entry batching is later measured as necessary, an on-disk draft journal must close that gap.
- `AppState`/lifecycle handlers may flush disposable UI preferences, but correctness assumes they might never run.

## SQLite durability baseline

- One app-owned database and serialized writer.
- Foreign keys enabled on every connection.
- Explicit transactions around every aggregate mutation.
- Start with WAL and `synchronous=FULL`; measure critical-commit latency on supported devices before considering any relaxation.
- Do not use `synchronous=OFF`, memory journals or unreviewed PRAGMA tuning.
- Parameterised statements, constraints and idempotent command receipts.
- Checkpoint WAL at safe lifecycle/size thresholds, never by deleting WAL/SHM files manually.
- Never create a recovery or migration copy by copying only the main database file while WAL writers may be active. Produce a transactionally consistent snapshot with SQLite's online backup API or `VACUUM INTO`; alternatively stop the serialized writer, checkpoint, close every connection, then copy the closed database and verify the copy before continuing.
- Treat commit failures, disk-full and I/O errors as user-visible unsaved states.

SQLite states that transactions appear atomic even when interrupted by an OS crash or power failure, subject to underlying filesystem behaviour, and documents WAL-specific trade-offs. SQLite separately documents its [online backup API](https://www.sqlite.org/backup.html) and [`VACUUM INTO`](https://www.sqlite.org/lang_vacuum.html#vacuuminto) for consistent snapshots. [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html) and [SQLite WAL](https://www.sqlite.org/wal.html) (all accessed 2026-08-06).

## Active-workout restoration contract

Durable state includes:

- session identity/state and plan/template snapshots;
- exercise order, substitutions and group membership;
- every draft/completed/skipped set value and position;
- current exercise/last focused logical field (not keyboard or pixel coordinate);
- timer source, start/end timestamps, pause state and notification ID;
- short-workout decisions and explanation;
- last committed command/revision.

On cold start the app completes migrations/integrity checks before querying the unique active session. It reconstructs the screen from SQLite, derives timer remaining time from persisted endpoints, and identifies the last saved action. The user sees `Workout restored` and can continue, finish or abandon. The application does not automatically discard an “old” active workout; age prompts a choice.

If owned rows violate an invariant, enter a read-only recovery view that preserves and exports raw user records. Do not silently skip malformed exercises or manufacture a new session.

## Time and timer behaviour

- Store UTC endpoints and the time-zone ID/local date relevant to the workout.
- While the process runs, use monotonic elapsed time for smooth countdown; after restart use persisted UTC end time and reconcile clock-change anomalies.
- Manual clock/time-zone change never alters recorded set order or duration already committed.
- Rest timer expiry is advisory. Local notifications can be delayed, denied or disabled; set logging remains available and the in-app timer remains correct.
- Starting a new timer replaces/cancels the prior notification only after the set transaction commits.

## Connectivity states

First release has no sync status because there is no sync. Do not show misleading “cloud” or “all synced” language. If online-only documentation/support links exist, they are isolated from workouts and fail with a plain offline message.

Future sync states are `local only`, `sync pending`, `syncing`, `conflict`, and `synced at …`; even then, `saved on this device` is distinct from remote sync.

## Major data-loss paths and prevention

| Loss path | Prevention | Required proof |
|---|---|---|
| Process killed after user action | Commit before acknowledgement; no lifecycle dependency. | Terminate after each command phase on both platforms; zero acknowledged loss. |
| UI says saved before commit | Explicit `saving/saved/failed` state; success effect post-commit. | Fault-inject commit and assert failed UI retains input. |
| Rapid taps create duplicates | Stable command ID and unique receipt/constraints. | 100 rapid/delayed duplicate deliveries yield one semantic result. |
| App backgrounds/phone locks | Every valid structured change already durable; restoration from DB. | Lock/background/terminate at every core journey step. |
| Device restarts/power loss | SQLite transactions and durable PRAGMA baseline. | Reboot/process-kill interruption campaign on physical devices. |
| Partial multi-row write | One explicit transaction including history/change rows. | Fail each SQL statement; only complete before/after states occur. |
| Disk full / quota / I/O error | Detect error; retain input; stop further dependent commands; explain unsaved state and recovery. | Fill test storage and exercise start/set/finish/export. |
| Database busy/deadlock | Single writer; bounded retry; no dropped command. | Inject busy/locked responses and assert bounded outcome. |
| Migration crash/failure | Pre-migration recovery copy, transactional steps, immutable migrations, post-checks. | Interrupt every migration boundary from all supported schemas. |
| Database corruption | Never overwrite; quarantine copy; read-only recovery/export; explicit scoped reset only. Offer restore only when a separately supported backup capability exists. | Corrupt header/pages/index/FK fixtures and verify no silent empty DB. |
| App upgrade then binary rollback | Forward-compatible distribution plan; block incompatible old binary; never downgrade schema in place. | Install/upgrade/attempt rollback matrix. |
| Uninstall/app-data clear | Honest warning; declared/tested platform backup policy plus verified machine-readable export. MVP export is not represented as importable. | Platform backup inclusion/exclusion audit, expected OS restore behavior and export verification on both platforms. |
| Device loss/theft | Platform backup where declared plus user-controlled export; portable restore and optional account sync are future capabilities. Device lock protects confidentiality, not availability. | Exercise every supported platform-backup path and verify residual-loss disclosure when none applies. |
| OS backup restores DB but not key | Do not enable SQLCipher without co-designed key recovery/backup exclusions. SecureStore is not source of truth. | Device-transfer/backup restore tests with and without credentials. |
| Export interrupted/corrupt | Stage, checksum, parse/verify, then share; source DB unchanged. | Interrupt each stage; no corrupt file reported successful. |
| Future portable import overwrites good data | Post-MVP seam: validate into a temporary DB, show counts/conflicts and keep the original until atomic swap. No MVP import endpoint exists. | Becomes blocking only if `FEAT-POST-009` is explicitly approved. |
| Completed-history edit leaves stale PR/chart | Source revision plus transactional invalidation/recalculation state. | Edit/delete contributing sets and compare full rebuild. |
| Catalogue/programme edit rewrites history | Immutable versions and session snapshots. | Change names/units/targets and assert completed output unchanged. |
| Schedule advancement duplicates/skips | Completion + pointer/plan disposition in one idempotent transaction. | Fixed/flexible skip/repeat/reschedule property tests. |
| Timer/notification delayed | Timer is derived from durable endpoints; notification never authoritative. | Deny permission, Doze/low-power, reboot and manual clock tests. |
| Future sync conflict erases local edit | Atomic outbox, stable IDs, revision/conflict records; high-value conflicts preserve both. | Deterministic two-device partition/rejoin simulations. |
| Delete-all leaves app-owned copies | Cancel effects, clear DB/WAL/SHM, staging, cache, revisions and secure values; disclose external/OS copies. | Filesystem/backup inspection on both platforms. |
| Dependency/SQLite upgrade changes semantics | Pin versions; migration/atomicity/interruption suite before merge. | Upgrade branch runs full data-safety matrix. |

## MVP backup, export and recovery boundary

### Must for first release

- Define and test platform backup inclusion/exclusion rules; never assume vendor backup happens. Exercise actual OS restore behavior where data is included and verify truthful residual-loss disclosure where it is not.
- Provide the versioned, user-initiated machine-readable export required by `PRD-FR-037`; stage privately, verify its manifest/checksums and report omissions/failure. MVP does not expose an import/portable-restore action for that file.
- Preserve/quarantine corrupt or failed-migration data, recover the last verified readable local revision/copy where possible, and offer export/reset without implying unsupported recovery.
- CSV is a convenience view; the JSON package and manifest/checksums define the complete machine-readable export.

### Post-MVP unless explicitly approved

- User-directed local backup/restore package and import (`FEAT-POST-009`).
- Routine import helpers (`FEAT-POST-007`).
- Automatic account-backed backup/sync.
- End-to-end encrypted remote backup.
- Password-encrypted portable archive, pending vetted library/key UX.

Moving portable restore/import into MVP requires an explicit product-owner scope decision plus security, migration, malformed-input, interruption and clean-install round-trip gates. Until then it has no reachable control and is not a first-release gate.

Android's security guidance recommends the standard backup system and warns that custom copies in broadly readable storage can leak data. [Android backup security](https://developer.android.com/privacy-and-security/risks/backup-best-practices) (accessed 2026-08-06).

## Migration protocol

1. Stop domain writes and show a truthful upgrade state.
2. Check available space and source schema/application ID.
3. Create/verify recovery copy; retain until new DB passes checks and at least one successful launch.
4. Apply one immutable numbered migration per transaction where supported.
5. Record migration metadata/checksum.
6. Run application invariants, `integrity_check` and `foreign_key_check`.
7. On failure, reopen the original; retain failed copy for user-approved diagnostics; never initialise empty.
8. Delete old recovery copy only under documented retention and storage-pressure rules.

## Offline acceptance gates

- All critical journeys pass with radios disabled from before app launch through completion/history review.
- 100 forced terminations at random command boundaries lose zero acknowledged writes.
- 10,000 generated command sequences preserve database/domain invariants.
- Every released migration source fixture passes normal, low-space and interrupted execution.
- The user can distinguish `saved locally` from `exported` and, in the future, `synced`.
- Rest timer never overlays or disables set logging.
- No startup/recovery path silently creates an empty replacement for existing unreadable data.

## Classification

| Item | Class |
|---|---|
| Commit-before-acknowledgement, restoration, atomic migrations | Must; expensive to retrofit |
| WAL/FULL exact tuning | Reversible only with fault/performance evidence |
| Standard backup policy + truthful disclosure | Must |
| User-directed portable restore/import | Post-MVP (`FEAT-POST-009`); requires explicit product-owner approval to move |
| Cloud sync/remote backup | Deferred |
| SQLCipher | Deferred until backup/key design |
