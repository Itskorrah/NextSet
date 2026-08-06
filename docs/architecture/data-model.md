# NextSet conceptual data model

Status: proposed, implementation-ready at the conceptual level  
Date: 2026-08-06  
Scope: first-release local model plus explicit future-sync seams

## Design invariants

1. The SQLite database is the source of truth. React state, a notification and a future server response are never proof that a workout was saved.
2. User-created IDs are generated locally and never change across export, restore or sync.
3. A completed workout is a historical snapshot. Later catalogue, unit, programme or template edits cannot rewrite it.
4. Programme edits create immutable versions; planned future work can move to a new version only through an explicit policy.
5. Multi-row user intentions commit atomically with audit and future-sync metadata.
6. Derived records name their source/calculation version and can be rebuilt.
7. Deletion is explicit: archive, soft-delete/tombstone, and irreversible local purge have different behaviours.
8. Wall-clock timestamps do not decide business order or sync conflicts by themselves.
9. Every ordered collection has an explicit position plus stable-ID tie-break; row insertion order is never meaningful.
10. Core data is readable and writable with no account or network.

## Identity, timestamps, ordering and versions

The following common columns and type rules define stable identity, temporal representation, deterministic ordering and independent schema/content/calculation versioning.

Every mutable user-data table has the following unless marked otherwise:

| Column | Type | Rule |
|---|---|---|
| `id` | TEXT UUIDv7 | 128-bit RFC 9562 UUID, lower-case canonical string, generated locally; primary key. |
| `created_at_ms` | INTEGER | UTC Unix epoch milliseconds from the injected clock. |
| `updated_at_ms` | INTEGER | UTC epoch milliseconds; display/audit aid, not sole conflict authority. |
| `row_version` | INTEGER | Starts at 1 and increments once per successful logical mutation. |
| `origin_installation_id` | TEXT UUID | Installation that created the row; no hardware identifier. |
| `deleted_at_ms` | INTEGER nullable | Tombstone time; ordinary queries exclude tombstones. |
| `deletion_reason` | TEXT nullable | `user`, `cascade_owner`, `catalog_retired`, `conflict_resolution`; no free-text secrets. |

UUIDv7 is locally generatable and time-ordered, but consumers must treat it as opaque and must not infer a user's exact activity time from it. RFC 9562 defines UUIDv7 and its Unix-time component. [RFC 9562](https://www.rfc-editor.org/info/rfc9562/) (accessed 2026-08-06).

Additional conventions:

- Timestamps are UTC integers. Store the IANA time-zone identifier and user-facing `local_date` on workout/schedule events where calendar meaning matters.
- Durations are integer milliseconds; exercise time is integer seconds unless sub-second precision is an approved requirement.
- Canonical load is integer grams and distance is integer millimetres. Every committed quantity also retains the user's original exact decimal value and entered unit; store the decimal without binary floating point (for example, canonical decimal text or coefficient/scale). Display conversion and rounding use `MeasurementPreference`, but neither a preference change nor a conversion may rewrite the original value/unit. Bodyweight contribution and assisted load have explicit fields/sign, never overloaded negative values.
- RPE uses integer tenths (`75` = 7.5); RIR uses integer reps. Validation bounds live in the rulebook/domain layer and database `CHECK`s.
- Enumerations are constrained text with application codecs and database `CHECK`s. Unknown future enum values fail safely during import.
- Boolean values are integer `0/1` with `CHECK` constraints.
- Flexible JSON is allowed only for versioned rule payloads, export manifests and audit patches. Core relationships and query fields remain relational.
- Ordered children use `position INTEGER >= 0`, unique within the live parent where practical, and are normalised in the same reorder transaction. Reads order by `position, id`.
- `content_version` identifies shipped catalogue content. `calculation_version` identifies deterministic derived logic. `schema_version` identifies storage/export structure. These are not interchangeable.

## Relationship overview

```text
TrainingGoal <-- UserPreferences --> MeasurementPreference / AppSettings

Exercise --< ExerciseVariation
   |  \--< ExerciseMuscle >-- MuscleGroup
   |   \-< ExerciseEquipment >-- Equipment
   \--0..1 CustomExercise

Programme --< ProgrammeVersion --< ProgrammeWorkout >-- WorkoutTemplateVersion
                                      |                    ^
                                      |                    |
                                      +-- WorkoutSequence -+-- Schedule
                                                               |
                                                         PlannedWorkout
                                                               |
                                                        WorkoutSession
                                                          |         |
                                                ExercisePerformance |
                                                          |         |
                                                       SetEntry     |
                                                          \---- PersonalRecord

ProgressionRule --> Programme/TemplateExercise
ProgressionRecommendation --> source performance/sets --> future target
UserNote --> exactly one supported owner

All mutable user data --> EntityRevision + ChangeEvent/Outbox metadata
Database --> MigrationMetadata / ExportMetadata / SyncMetadata
```

## Entity catalogue

### Preferences and goals

| Entity | Key fields | Relationships and lifecycle |
|---|---|---|
| **UserPreferences** | singleton `id`, `current_training_goal_id`, onboarding flags, week-start, default schedule mode, guidance level | References the active TrainingGoal and MeasurementPreference. Locally scoped; no name, email, birthday or gender is required. A `default_gym_profile_id` field is a POST seam only and is not created by MVP migrations. |
| **TrainingGoal** | `goal_type`, optional user label, priority, effective dates | Built-in types plus a custom neutral label. Preferences points to current goal; history is retained so old recommendation context remains explainable. No medical/body-image scoring. |
| **MeasurementPreference** | load unit, distance unit, bodyweight unit, decimal display rules | Display/input policy only. Canonical stored measurements do not change when preferences change. |
| **AppSettings** | appearance, haptics enabled, reduced-motion override (`system/on/off`), timer notification choice, privacy/diagnostics choice | Technical/product settings. System accessibility settings take precedence where applicable. Secrets are not stored here. |

### Exercise catalogue and equipment

| Entity | Key fields | Relationships and lifecycle |
|---|---|---|
| **Exercise** | stable ID, canonical display name, movement pattern, supported measurement/load/laterality definition, instructions licence/source, `catalogue_status`, `content_version` | Parent for variations, muscles and equipment. Shipped records are updated by versioned catalogue migrations and retired rather than reused. Custom exercise is represented by a 1:1 extension. |
| **ExerciseVariation** | `exercise_id`, optional `parent_exercise_id`, variation label, mechanics flags | Directed relation between a base movement and a specific variation. No cycles; deletion restricted if referenced. |
| **CustomExercise** | `exercise_id` PK/FK, user label, description/instructions, created-from exercise optional | Exactly one per custom Exercise. User can edit; workout snapshots preserve prior labels. Soft-delete while referenced. |
| **MuscleGroup** | stable catalogue code, display name, region, content version | Shipped taxonomy; retired, not physically deleted while referenced. |
| **ExerciseMuscle** | `exercise_id`, `muscle_group_id`, role `primary/secondary`, contribution rank | Many-to-many. Recommendation/substitution input, never a medical claim. |
| **Equipment** | stable code, display name, category, content version | Shipped or local custom equipment. |
| **ExerciseEquipment** | `exercise_id`, `equipment_id`, requirement `required/optional/alternative` | Many-to-many. |
| **GymProfile — POST seam** | user label, optional notes, active flag | `FEAT-POST-001`; no MVP table, migration, preference or UI. When introduced, it has GymEquipment rows and must not collect precise location by default. |
| **GymEquipment — POST seam** | `gym_profile_id`, `equipment_id`, availability, optional increment grams, notes | `FEAT-POST-001`; no MVP table or migration. A future profile deletion soft-deletes membership and clears preference only; it never changes workout history. |

### Programmes, templates and scheduling

| Entity | Key fields | Relationships and lifecycle |
|---|---|---|
| **Programme** | user-facing identity, name, source `built_in/custom`, current version ID, archived flag | Logical programme across immutable versions. Deletion archives by default; hard delete only when unreferenced or during delete-all. |
| **ProgrammeVersion** | `programme_id`, monotonic version number, name/description snapshot, scheduling mode, effective time, based-on version, immutable flag | Owns programme workouts, sequence and schedule definition. Published/used versions are immutable. Unique `(programme_id, version_number)`. |
| **WorkoutTemplate** | logical template identity, owner programme optional, current version ID, name, archived flag | Can exist standalone or in programmes. |
| **WorkoutTemplateVersion** | `workout_template_id`, version number, name/focus/estimated-duration snapshot, immutable flag | Owns ordered TemplateExercise rows. ProgrammeVersion references a specific version. |
| **TemplateExercise** | template-version ID, exercise-definition/version ID, position, equipment and unit snapshots, priority, optional-group ID, progression-rule ID/version, rest-config ID, notes | Snapshot-like plan definition that owns ordered PlannedSet rows. Superset/circuit membership uses an explicit group entity, not adjacent positions. |
| **PlannedSet** | template-exercise ID, stable ID, position, set role, measurement mode/target, load mode/target/basis, laterality mode/target, effort intent/target, drop-parent planned-set ID optional, minimum/optional flags | Immutable with its WorkoutTemplateVersion. The orthogonal dimensions and compatible targets follow [`../domain/set-types.md`](../domain/set-types.md); a flat type code cannot discard a dimension. |
| **ExerciseGroup** | template-version ID, type `superset/circuit`, position, rounds, rest policy | Owns TemplateExercise membership/order where grouped. |
| **ProgrammeWorkout** | programme-version ID, template-version ID, position, label, optionality | Ordered set of workouts available to a version. |
| **WorkoutSequence** | programme-version ID, name, repeat policy, current pointer stored separately in enrolment | Owns ordered WorkoutSequenceItem rows. Definition is immutable with the programme version. |
| **WorkoutSequenceItem** | sequence ID, programme-workout ID, position, return-after-skip policy | Stable ordered membership. |
| **Schedule** | programme-version ID, mode `fixed_weekday/flexible_sequence`, time-zone ID, start local date, end policy | Owns fixed rules or references a sequence. Calendar recurrence is data, not precomputed forever. |
| **ScheduleRule** | schedule ID, weekday/local time or interval rule, programme-workout ID, position | Fixed schedule definition. Time-zone changes create explicit recalculation decisions. |
| **ProgrammeEnrolment** | adopted programme/version ID, status, started/completed times, sequence pointer, last-advanced command ID | User's live progression through a version. Pointer advancement is atomic with completion/skip. New programme versions do not silently move an enrolment. |
| **ProgrammeVersionAdoption** | enrolment ID, from/to programme-version IDs, `effectiveLogicalOccurrenceId`, state `scheduled/applied/replaced/cancelled`, decision source/recommendation ID optional, command ID, revisions and times | Revisioned adoption decision. Its boundary is the first selected not-started occurrence; replacing/cancelling it preserves prior audit and cannot rebase an active/completed session or orphan an occurrence. |
| **PlannedWorkout** | enrolment ID optional, stable `logicalOccurrenceId` (`logical_occurrence_id` in SQLite), programme-workout/template version IDs, planned local date/time-zone, sequence ordinal, status, `missedUnresolved` (`missed_unresolved`) disposition, skip/cancel policy and reason, `supersedes_id`, priority/duration snapshot | Materialised near-term occurrence. Storage states are `planned/started/completed/skipped/cancelled`; an implementation may retain a superseded row as `moved`, but the replacement carries the same `logicalOccurrenceId` and only one live lineage row can resolve/start/complete. An elapsed fixed date projects `missed` as `status=planned` plus `missedUnresolved`; it is never silently converted to skipped. |

### Workout execution and history

`WorkoutSession` is the canonical table. **ActiveWorkout** and **CompletedWorkout** are state-specific domain projections required by the product model, not duplicated stores.

| Entity | Key fields | Relationships and lifecycle |
|---|---|---|
| **WorkoutSession** | planned-workout ID optional, programme/template/version snapshot IDs, state, `completionKind` (`completion_kind`) nullable `full/partial`, title/focus snapshot, started/ended UTC, local date/time-zone, pause totals, source `planned/unscheduled/repeated`, completion revision, duration, user summary | One active row maximum in v1. ActiveWorkout = state `active`; CompletedWorkout = `completed`. A completed session requires `completionKind`; `partial` requires explicit completed/skipped/not-attempted child dispositions. Abandon retains a recoverable record until user confirms deletion. |
| **ActiveWorkout** | projection of WorkoutSession plus current exercise, durable draft, timer state and restoration marker | Never stored as a second copy. Startup queries it before Today. |
| **CompletedWorkout** | projection of WorkoutSession plus completion revision and derived summaries | Edits create revisions and recalculation; status remains completed. |
| **ExercisePerformance** | session ID, planned TemplateExercise ID optional, original/substituted Exercise IDs, name/equipment/representable-increment/target/unit snapshots, position, state `draft/completed/skipped/notAttempted`, substitution reason, group snapshot, started/completed times | Ordered exercise instance in one session. MVP captures explicit session equipment context and any representable increment directly; it does not depend on a named gym profile. A partial completion materialises a disposition for each planned child; `notAttempted` is distinct from skipped and has no fabricated observations. A substitution never rewrites the template or earlier history unless the user chooses a separate programme edit. |
| **SetEntry** (**SetPerformance**) | performance ID, planned-set ID optional, position, state `draft/completed/skipped/notAttempted/invalidated/softDeleted`, `set_role`, `measurement_mode` and mode-specific observations, `load_mode` and mode-specific load/basis, `laterality_mode` and side values, `effort_intent`, user-entered RPE/RIR/failure report, drop-parent set ID optional, target snapshots, completed time, source/provenance, validity flags | Persisted form of the canonical record in [`../domain/set-types.md`](../domain/set-types.md). Role, measurement, load, laterality and effort are separate constrained fields, so combinations such as a working timed assisted unilateral set remain representable. Completed quantities store canonical integer grams/millimetres plus original exact decimal/unit. `skipped` and `notAttempted` contain disposition/provenance only, not observations. Unique live `(performance_id, position)`; edits increment row/session revision and invalidate affected derived data. |
| **RestTimerConfiguration** | duration, auto-start trigger, notification/haptic policy, count direction | Referenced by AppSettings, TemplateExercise and ExercisePerformance override in precedence order. No running timer ticks stored. |
| **RestTimerState** | workout session ID, source set ID, started/ends UTC, monotonic start/duration where available, paused state, local-notification ID | One current timer per active workout. On restore, calculate remaining time; a missing notification has no data effect. |

### Progression, records and notes

| Entity | Key fields | Relationships and lifecycle |
|---|---|---|
| **ProgressionRule** | stable ID/version, rule type, versioned validated config, scope, explanation template version, active flag | Referenced by a template exercise/programme. Published versions immutable. Rule evaluation is deterministic. |
| **ProgressionRecommendation** | rule/version ID, exercise/programme context, source workout/set IDs and source revisions, generated time, reference/raw/rounded values, increment/rounding policy, proposed target, explanation facts, state `pending/accepted/deferred/dismissed/invalidated/superseded`, invalidation reason/replacement ID, calculation version | A suggestion, never an authoritative coaching claim. Acceptance is an idempotent command that publishes a new immutable WorkoutTemplateVersion and ProgrammeVersion and records the enrolment's explicit future not-started occurrence adoption boundary; it never updates a target in place. Editing a contributing source atomically marks the pending object invalidated and, if still eligible, creates a separately identified candidate without rewriting the old payload. |
| **PersonalRecord** | exercise ID, metric type, canonical value, source session/performance ID, achieved time, calculation version, status `current/superseded/invalidated` | Derived, reproducible and restrained. `PersonalRecordSourceSet` links every contributing set. Ties use explicit policy, not row order. |
| **PersonalRecordSourceSet** | record ID, set-entry ID, contribution role | Many-to-many provenance. |
| **UserNote** | exactly one of exercise/programme/workout/performance owner IDs, note type, content, pinned flag | Enforce exactly one owner with a `CHECK`; full text is private content and excluded from logs/telemetry. Workout snapshots may retain the text the user entered for that workout. |

### History, migration, export and future sync

| Entity | Key fields | Relationships and lifecycle |
|---|---|---|
| **EntityRevision** | entity type/ID, entity row version, command ID, prior revision ID, JSON patch or snapshot, before/after hashes, reason, created time | Append-only user-edit history for supported entities. Content follows owner deletion/purge. Not a substitute for current rows. |
| **CommandReceipt** | command ID, command type, input hash, committed time, result entity/revision | Makes tap retries/process handoff idempotent. Retention can be bounded after sync/export safety review. |
| **ChangeEvent** | mutation ID, entity type/ID, operation, base/new version, field clocks, payload hash, occurred time, sync state | Written in the same transaction as data. Local first release does not transmit it. Becomes future outbox. |
| **Installation** | random installation ID, created time, local display label optional, last clock value | Not based on advertising ID, hardware serial or account. Future account association is separate. |
| **MigrationMetadata** | schema version, migration ID/checksum, started/completed time, app build, result, recovery-copy checksum | Append-only. One successful row per migration. `PRAGMA user_version` is a convenience mirror, not the only record. |
| **ExportMetadata** | export ID, format/schema version, requested/completed time, record counts, destination class (not path), manifest checksum, result/error code | Does not retain exported content or external file paths. Failed staging files are removed. |
| **ImportMetadata** *(post-MVP seam)* | import ID, source format, manifest checksum, validation/result, conflict policy, counts, source export ID optional | Reserved for a future approved portable restore/import capability. It is not a reachable MVP feature; any future import validates into a temporary database and swaps only after confirmation and integrity checks. |
| **SyncEntityMetadata** | entity type/ID, server version/ETag, last synced local version, HLC/field clocks, tombstone acknowledgement | Empty/unset while sync is disabled. Kept outside domain payload where practical. |
| **SyncCursor** | future account/dataset ID, pull cursor, last success/error code, retry time | No first-release network behaviour. |
| **ConflictRecord** | entity type/ID, local/remote mutation IDs and redacted summaries, full alternatives in protected local data, detected/resolved times, resolution | Preserves ambiguous concurrent edits for user resolution; no silent loss. |

## Required constraints and indexes

- `FOREIGN KEY` enforcement enabled for every connection; ownership uses `ON DELETE RESTRICT` for historical sources and explicit application cascades for owned drafts.
- Partial unique index allowing one live `WorkoutSession(state='active')`.
- Partial unique index allowing only one resolvable live PlannedWorkout row per `(enrolment_id, logical_occurrence_id)`; moved lineage rows retain the same `logicalOccurrenceId` but cannot be started or completed.
- Unique programme/template version numbers within logical owner.
- Unique live child positions within each ordered owner, with stable-ID fallback during repair/import.
- Unique `CommandReceipt.command_id` and `ChangeEvent.mutation_id`.
- Checks for valid state transitions at the application layer plus database enum/range checks. Completed WorkoutSession rows require `completionKind`; non-completed rows cannot claim one, and `completionKind=partial` requires materialised child dispositions.
- SetEntry checks enforce compatible role/measurement/load/laterality/effort dimensions. `skipped` and `notAttempted` rows reject observed values; completed mass/distance observations require both canonical integer and original exact decimal/unit fields.
- Indexes for session start date, exercise history `(exercise_id, completed_at)`, active/planned state, programme current version, live children by parent/position, tombstones, stale projections and unsent change events.
- Full-text search is unnecessary for v1; normalised name columns/indexes are sufficient. Do not enable FTS without a measured catalogue/search need and privacy review.

## Versioning and editing history

### Programme/template editing

Draft versions may mutate until first use/publish. Thereafter editing clones the complete owned graph into version `n+1`, applies the command, validates the graph and publishes it atomically. A live enrolment adopts a new ProgrammeVersion through a separate ProgrammeVersionAdoption action that records the first selected not-started `logicalOccurrenceId` boundary. Occurrences/sessions before that boundary retain their exact prior snapshots; active/completed sessions never migrate. Cancelling or replacing a scheduled adoption is revisioned and cannot orphan an occurrence.

### Completed workout editing

An edit command records before/after values, increments the session `completion_revision`, updates source rows, invalidates dependent records/recommendations/charts and recomputes the affected range. Undo is another revision; audit rows are not rewritten. UI identifies recalculation and never presents stale PRs as current.

### Catalogue evolution

Shipped Exercise/Muscle/Equipment IDs never change. Corrections update content version; removal sets `catalogue_status='retired'`. Historical snapshots retain original display content. Custom exercise merge is an explicit data migration, never name matching.

## Deletion behaviour

| User action | Behaviour |
|---|---|
| Archive programme/template | Hide from creation surfaces; history and references remain. Reversible. |
| Delete unused custom exercise | Tombstone; hard-purge after undo window if no history/reference and no sync obligation. |
| Delete workout | Tombstone session and owned content in one transaction; derived data invalidated. Offer undo locally. Future sync retains tombstone until all known replicas acknowledge. |
| Delete a set/exercise from completed workout | Revisioned domain edit, not raw row deletion; recalculates derived data. |
| Delete gym profile — POST | After `FEAT-POST-001` is approved, clear the future preference and tombstone profile/membership; workout equipment snapshots remain. No MVP entity or delete flow exists. |
| Delete all local data | Require explicit confirmation, cancel notifications, close DB, remove DB/WAL/SHM and local exports only where the app owns them, recreate system catalogue, clear secure values. Never claim deletion of user-shared files or historical OS backups. |

Soft deletion is not privacy deletion. A delete-all flow must remove current rows, revisions, tombstones, staging files and caches. Flash storage and external/OS backups can limit forensic guarantees; wording must be honest.

## Local transaction boundaries

- Start workout: plan disposition + session + exercise/set snapshots + command receipt + change events.
- Set create/edit/complete: set + aggregate revision + derived invalidation + receipt + change event.
- Reorder: every affected child position + owner row version + receipt/change events.
- Substitute: disposition of original performance + replacement snapshot + target/group changes + history.
- Complete workout: validate all owned drafts + full/partial completion kind + completed/skipped/not-attempted child dispositions + logical occurrence resolution + session state/time + plan/sequence advancement + derived results + history.
- Programme publish: immutable complete version graph + logical current pointer.
- Future portable restore/import, only if separately approved: validate in a separate temporary DB; merge or replace only inside an explicit recovery transaction/file swap.

Haptics, notifications, files and future network requests occur after commit and cannot roll back the database.

## Interrupted-session restoration

Persist every structured draft change, current exercise, set position, timer endpoints and relevant sheet mode as durable workout state. Do not persist pixel scroll offsets or open keyboard state. At startup:

1. complete database recovery/migrations;
2. query the unique live active session;
3. validate its owned graph and last committed command;
4. rebuild the view model and timer from timestamps;
5. show a clear “Workout restored” state and the last durable edit;
6. if invalid, preserve data and enter recovery UI rather than creating a new empty workout.

## Conflict principles

These fields exist before sync, but conflict handling activates only after a backend decision.

- Server receipt time and device wall-clock time never override data silently by themselves.
- Mutations are idempotent by mutation ID and carry base/new row versions.
- Non-overlapping field edits may merge; provenance is retained.
- Concurrent set value edits, completion/deletion conflicts and programme graph changes are high-value conflicts: preserve both variants and request resolution.
- Additions are set-union by stable ID. Duplicate semantic rows are not auto-deduplicated by name.
- Concurrent order changes retain every child, resolve each move by field clock, then normalise ties by stable ID; a conflict record notes material reorder collisions.
- A tombstone cannot erase a causally newer edit without an explicit resolution.
- Resolved alternatives remain in EntityRevision/ConflictRecord until retention policy permits purge.

## Export and future restore format

The MVP machine-readable export and a user-directed restorable backup are different products and must not be conflated. Export is required by `PRD-FR-037`; portable restore/import remains `FEAT-POST-009` unless the product owner explicitly changes scope.

### Portable data export (`nextset-export-v1`)

- UTF-8 ZIP/package selected by the user.
- `manifest.json`: product/format/schema versions, export ID/time, content sections, canonical units, counts and SHA-256 per file.
- Normalised JSON Lines per entity family using stable IDs and UTC timestamps; exported quantities include canonical value/unit plus original exact decimal/unit, without exposing SQLite implementation details.
- Friendly CSV files for workouts, exercises and sets; CSV is lossy convenience, while the versioned JSONL/manifest is the complete MVP machine-readable export contract.
- `README.txt` describing privacy sensitivity and units.
- No device identifier, diagnostic log, secure-store value, push token or deleted content unless the user explicitly selects a history-inclusive export option.
- Validate hashes and parse the completed staged package before presenting the share sheet.

### Post-MVP restorable backup seam (`FEAT-POST-009`)

This section preserves an architectural seam, not an MVP capability or release gate. If separately approved, a backup would include the lossless current dataset, programme versions, revision lineage needed for safe restore and a manifest. Restore would never write directly over the live DB: validate version/checksums, import into a temporary database, run domain/integrity checks, show counts/conflicts, then atomically replace or merge after confirmation. Unknown future required entity versions would block restore safely.

Password-encrypted portable backups are deferred pending a vetted cross-platform cryptography/key-recovery design. An unencrypted export must warn that the destination controls its security. Do not invent custom encryption.

## Backup principles

- First release: platform-protected app storage, an explicit and tested platform-standard backup inclusion/exclusion policy, local corruption/migration recovery, and user-initiated machine-readable export. There is no user-directed portable restore/import UI.
- Test actual platform backup/restore behavior on both platforms according to the declared inclusion/exclusion policy and across supported app versions; if app data is excluded, verify the truthful residual-loss disclosure instead of claiming recovery.
- Exclude caches, staging files, notifications and secure-store values that cannot be decrypted after restore.
- If SQLCipher is adopted later, design database-key escrow/recovery and OS backup rules together; an encrypted DB restored without its key is data loss.
- A platform backup is not successful until its supported restore path produces matching canonical record counts/checksums and passes integrity/domain checks. This does not imply the exported package is importable.
- Clearly state that uninstall/device loss may destroy data when no usable platform backup exists; MVP export supports ownership but cannot be presented as an in-app restore mechanism.

Android recommends its standard backup system and warns that custom exported copies can leak sensitive data; Expo notes SecureStore values cannot be decrypted from Android backup after the Keystore key is removed. [Android backup security](https://developer.android.com/privacy-and-security/risks/backup-best-practices) and [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) (accessed 2026-08-06).

## Privacy and sync boundaries

- Workout content, notes, goals, gym labels and history are private user content.
- No exact location, contacts, advertising ID, photos, health-platform data or account identifiers are required by this model.
- Logs use entity type, operation code and random correlation ID; never note text, exercise labels, measurement values or SQL bindings.
- UI/domain repositories read local records only. Future sync is an adapter that applies verified mutations into SQLite; remote responses never bypass the local source of truth.
- The future account/user ID maps to a dataset at the sync boundary and is not the primary key of every domain row.
- Analytics, if later approved, consumes explicitly defined aggregate events, not database/change-log replication.

## Schema/migration rules

1. Assign a fixed SQLite `application_id` and monotonically increasing `user_version` at initial implementation.
2. Every numbered migration has immutable SQL/code, checksum, precondition, postcondition, fixture tests and rollback-by-recovery-copy procedure.
3. Never edit a released migration; add a corrective migration.
4. Migrations are forward-only in the installed app. App rollback that cannot read the newer schema is blocked; distribution rollback requires a compatible build.
5. Preserve the original DB before migration and never create an empty DB over a failed one.
6. Run `quick_check`, `integrity_check` where appropriate, and `foreign_key_check`; SQLite documents that the first integrity check does not include foreign-key errors. [SQLite PRAGMA](https://www.sqlite.org/pragma.html) (accessed 2026-08-06).
7. Record migration duration and failure code without content.

## Decisions by reversibility

| Decision | Class |
|---|---|
| Stable IDs, canonical units, immutable history snapshots | Must; very expensive to reverse |
| SQLite relational source of truth | Must; expensive to reverse |
| Programme versions and revision lineage | Must; expensive to retrofit after user history exists |
| Tombstone/sync metadata columns before sync | Must; low incremental cost, expensive retrofit |
| Exact index set and projection tables | Reversible through migration and measurement |
| JSONL+manifest export contract v1 | MVP; expensive once users depend on it; version, never silently change |
| User-directed portable restore/import | Post-MVP (`FEAT-POST-009`) unless the product owner explicitly changes scope |
| SQLCipher and password-encrypted backup | Deferred decision |
| Cloud-specific server fields/protocol | Deferred; keep out of domain rows where possible |

## Model validation still required

- Fitness-domain review of measurement fields for timed, unilateral, assisted and bodyweight sets.
- Product decision on edit-history/undo retention. Portable restore/import remains post-MVP; moving it into the first release requires a new explicit owner decision plus security, migration and round-trip evidence.
- Privacy decision on platform backup inclusion by data class.
- Performance proof for indexes/projections against the large-history fixture.
- Sync conflict usability tests before any multi-device launch.
