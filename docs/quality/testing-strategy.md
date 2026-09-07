# NextSet testing strategy

Status: proposed for future implementation  
Date: 2026-08-06  
Quality principle: protect user-entered workout data before optimising test-count vanity metrics

## Logging-first applicability — 2026-09-07

The owner-approved scope in [D-009](../project/decision-log.md) and the [current PRD](../product/product-requirements.md) takes precedence over the earlier broad foundation contract below. Blank workouts, repeats and standalone reusable routines require no goal, programme, enrolment, planned occurrence or schedule. Scheduling/sequence automation, carry-forward, ranked substitution recommendations, short-workout adaptation and progression suggestions are deferred; retained rules describe future contracts, not first-release obligations. Core set integrity, comparable descriptive records, editing, offline restoration and data ownership remain required. The current web prototype demonstrates interaction only, with memory that resets on reload; production durability gates remain future work.


## Outcomes

The test system must prove four things:

1. Workout/programme rules produce correct, explainable outcomes over normal and adversarial sequences.
2. Every acknowledged user write survives interruption, failure and migration.
3. Repeated logging remains fast and accessible on real supported devices.
4. Release artefacts contain only approved, complete behaviour—no placeholder controls, fake analytics or undisclosed data transfer.

Tests are evidence, not the quality goal. Coverage cannot compensate for an untested process kill, physical-device screen reader flow, active-session restoration or declared platform-backup behavior.

## Test layers

| Layer | Primary scope | Environment | Merge/release expectation |
|---|---|---|---|
| Static contracts | Type safety, dependency direction, lint, SQL/schema checks, secret/licence/dependency scan | CI | Every PR; blocking |
| Domain unit/property | Set validation, blank/repeat/routine lifecycle, comparable records, conversions; future scheduling/progression only when approved | Pure TypeScript, injected clock/IDs | Every PR; blocking |
| Database/migration | Repositories, constraints, transactions, query plans, forward migrations, corruption/low-space cases | Real SQLite version plus native integration | Every PR core; full matrix nightly/release |
| Component | Rendering, input, semantic roles/state/value, large text/reduced motion, error/saving states | React Native component harness | Every PR for changed components |
| Feature integration | Application command through SQLite/projection/platform fakes | Native app/dev build | Every PR for changed feature; blocking |
| End to end | Complete critical journeys, process kill/relaunch, OS UI, offline, permissions, export and declared platform-backup behavior | Release build on simulator/emulator and physical devices | Smoke per merge; full release matrix |
| Visual regression | Approved components/screens in both themes/text sizes/states | Deterministic screenshot build | Changed screens; human-reviewed baseline updates |
| Accessibility | Automated semantics/contrast plus VoiceOver/TalkBack/keyboard/switch/manual cognition | Simulator tools + physical devices | Automated per PR; manual each RC |
| Performance/reliability | Launch, commit, render, memory, long history/workout, stress, battery-sensitive behaviours | Profileable/release physical devices | Nightly trend; release blocking budgets |
| Security/privacy | Permissions, traffic, logs, export, deletion, platform-backup policy and dependencies | Release artefact/device/proxy/CI | Every RC; blocking |

Flutter's official test guidance usefully distinguishes unit, widget and integration confidence/cost and notes that native OS UI needs an additional driver; NextSet applies the same layered principle to React Native. [Flutter testing overview](https://docs.flutter.dev/testing/overview) (accessed 2026-08-06).

## Tooling decision

The behaviours and fixtures are mandatory; exact runners are reversible. At implementation kickoff, select the smallest maintained set that proves them:

- pure TypeScript test runner integrated with the application toolchain;
- React Native component renderer/testing library;
- native iOS/Android E2E driver able to terminate/relaunch, toggle connectivity or use platform helpers, handle system UI and collect artefacts;
- deterministic screenshot comparison;
- Xcode/Android/RN profilers and platform accessibility tools;
- SQLite fixture/fault-injection harness.

Run a one-week tool spike against start/log/edit/terminate/active-session-restore/export before adoption. Reject a runner that cannot reliably control process state or produces more than 1% flake over 100 consecutive critical-flow runs. Do not keep two overlapping E2E frameworks without a capability gap and owner.

## Deterministic test foundations

- Inject clock, monotonic clock, UUID generator and locale/time-zone.
- Command IDs and fixture IDs are fixed in tests.
- Rules accept immutable inputs and return typed result/explanation.
- Every random/property test prints and retains the seed; failures shrink to a minimal sequence.
- Database tests use isolated files and inspect actual committed rows, not mocked repository calls.
- Platform services have contract fakes for fast integration tests and physical-device conformance tests for real behaviour.
- Release screenshot/performance builds disable animations only where the specific test demands it; normal motion is measured separately.
- Seeded private marker strings detect content leakage into logs, network, exports and crash artefacts.

## Domain and rule testing

### Required examples

- Fixed schedule: on-time, unresolved missed, moved with stable logical occurrence identity, skipped, repeated, time-zone change and DST boundary.
- Flexible sequence: complete, skip with/without return, repeat, recovery day, full/partial completion with skipped/not-attempted children, abandoned workout and idempotent pointer advance.
- Orthogonal set semantics: roles (`warmUp/working/drop`), measurement modes, load modes, laterality and effort intent/observation independently and in compatible combinations—including a working timed assisted unilateral set—plus invalid combinations.
- Progression: every approved rule at lower/middle/upper target, incomplete set, manual override, decline/deload boundary and explanation facts.
- Substitution: compatible/incompatible equipment, movement/muscle intent, duplicate exercise and user override.
- Personal records: ties, edits, deletions, unit changes, invalid sets, estimated metrics and calculation-version rebuild.
- Short-workout mode: preserves declared priority, records omitted work and explains the change.

### Property/model tests

- Completing or retrying the same command is idempotent.
- Sequence pointer always references a live item and advances at most once per disposition.
- Unit round-trip remains exact within the proposed canonical integer-gram/millimetre representation; canonical value does not depend on display unit, and the committed original exact decimal/unit survives display-preference changes, export and migration.
- Reordering never loses/duplicates a child and results in a total deterministic order.
- Programme version publication never mutates a prior version or completed snapshot.
- Derived records equal a full rebuild after any generated valid edit sequence.
- Invalid input never changes persisted state.

Gate: 100% of currently approved MVP rulebook rules, state transitions and domain edge scenarios have direct tests; retained POST/FUTURE contracts are gated only when brought into scope. Critical domain modules target ≥95% branch coverage and ≥90% mutation score; surviving mutants in safety/schedule/record logic block release. Coverage exceptions require a reviewed reason tied to unreachable/generated code.

## Database and migration testing

### Repository/constraint suite

- Foreign-key, uniqueness, `CHECK`, one-active-workout and ownership constraints.
- Parameter binding with quotes, Unicode, maximum lengths and hostile strings.
- Atomic start, set commit/edit, substitution, completion, programme publication and deletion.
- Duplicate command/mutation delivery.
- Planned-workout lineage constraints: one resolvable row per logical occurrence, stable `logical_occurrence_id` across moves, unresolved missed remains distinct from skipped, and partial completion requires explicit child dispositions.
- Set-dimension compatibility and exact-quantity pair constraints, including rejection of observations on skipped/not-attempted rows.
- Query plans and indexes against the large-history fixture.
- WAL/checkpoint and concurrent read/serialized write behaviour on both platforms.

### Fault injection

For each critical transaction, fail before/after every SQL statement and at commit. Assert exact canonical state is either before or after—never partial—and that the UI does not acknowledge a failed commit. Inject database busy, disk full, I/O error, malformed row and process termination.

Include an uncheckpointed-WAL recovery fixture: commit known rows that remain in WAL, then attempt every approved snapshot path. The online-backup/`VACUUM INTO` snapshot (or checkpoint-and-closed-copy alternative) must reopen with the committed rows, pass integrity/foreign-key checks and match the canonical hash. A deliberately copied main database file without its active WAL must fail the test and must never be accepted as a recovery copy.

### Migration suite

- Golden database fixture for every released schema and meaningful data shape.
- Empty, normal, maximum-size, tombstone/history-rich and unusual-Unicode fixtures.
- Apply every supported source schema directly to current; verify IDs, counts, canonical hashes and domain invariants.
- Interrupt every migration boundary; verify the transactionally consistent original/recovery snapshot remains usable, including the uncheckpointed-WAL fixture.
- Low-space and corrupt source scenarios enter recovery without replacement.
- Run `integrity_check` and `foreign_key_check`; SQLite documents that integrity check alone does not detect foreign-key failures. [SQLite PRAGMA](https://www.sqlite.org/pragma.html) (accessed 2026-08-06).
- A released migration is immutable; CI compares checksums.

Gate: zero lost/duplicated canonical records and zero unexplained hash difference across all fixtures.

## Component and interaction testing

Every interactive component has tests for:

- default, focused, pressed, disabled, saving, saved, validation error and storage failure;
- accessible name, role, state/value and action;
- light/dark/high-contrast where supported;
- 200% text and narrow supported width without critical clipping;
- reduced motion and haptics disabled;
- keyboard appearance, numeric decimal conventions and focus continuity;
- rapid repeated input and double taps;
- no colour-only or haptic-only communication.

Prefer user-observable queries/labels over implementation selectors. A screenshot pass is not an accessibility pass.

## End-to-end critical journeys

Automate at minimum:

1. first launch → Workouts → start blank without goal/template/schedule;
2. one action starts a blank workout or resumes the active session;
3. repeat a historical workout and start a standalone routine, each with zero completed sets;
4. log approved set modalities, add/edit/delete/reorder, rest timer continues without blocking; advanced drop/group authoring deferred;
5. manually choose another exercise without inheriting incomparable history; ranked substitutions deferred;
6. background, lock, terminate and reboot during active workout; restore latest committed state;
7. complete entirely in airplane mode; review history;
8. navigate away from active work and resume without losing recorded sets or silently committing drafts;
9. history/trends handle empty, one-observation, comparable, edited and deleted histories without invented improvements;
10. edit completed workout and recalculate comparable records/history; recommendations deferred;
11. export offline and verify the documented machine-readable content/checksums without changing the live DB;
12. verify declared platform backup inclusion/exclusion and actual OS restore behavior where supported;
13. failed write, failed migration, corrupt DB and disk-full recovery;
14. delete all local data and verify app-owned remnants absent.

Each critical journey runs with new-user and large-history fixtures, light/dark, at least one large-text configuration and both platforms. Destructive/recovery variants can be partitioned across suites but cannot be manual-only.

## Offline and interrupted-session restoration campaign

- Radios disabled before cold launch; no DNS/network stubs that mask a dependency.
- Terminate at a randomly selected boundary in 100 iterations per platform for the RC.
- Terminate immediately after user input, during SQL statement, before commit, after commit/before UI response, during notification scheduling, on background and during migration/export.
- Assert every acknowledged command exists exactly once and every unacknowledged attempt is either absent or visibly recoverable; never partial.
- Re-run with clock/time-zone change, notification denied, low-power constraints and device restart.

Gate: **zero acknowledged user-data loss**. Any occurrence is P0 and invalidates the release campaign after the fix.

## Visual regression

Baseline only approved production states at realistic device sizes. Include Today, active workout/set entry, substitution, completion, history/progress, programme editor, all empty/error/recovery states, light/dark, large text and reduced motion end states.

- Pixel tolerance is calibrated for platform font/renderer variance; mask only nondeterministic OS chrome/timestamps.
- Baseline update requires a design reviewer and reason in the change.
- Visual tests catch unintended change; human review checks hierarchy, originality, fake data/controls and usability.
- No production screenshot baseline may include “Lorem ipsum,” placeholder controls or analytics that are not computed from fixture records.

## Accessibility tests

Automated: semantics tree, duplicate/missing names, roles/state/value, contrast tokens, touch target geometry, focus traps and text-scale snapshot layouts.

Manual per release candidate on physical devices:

- VoiceOver and TalkBack complete start/log/edit/timer/substitute/finish/active-session-restore/export/delete;
- logical focus persists after set insert/delete and validation error;
- iOS largest approved accessibility text sizes and Android 200% font; landscape where supported;
- Reduce Motion/remove animations and system bold/high contrast where supported;
- external keyboard/switch-access sampling;
- colour-vision simulation plus human contrast inspection.

Requirements and gates are in [accessibility-requirements.md](accessibility-requirements.md).

## Performance and scale testing

All blocking numbers come from release/profileable builds on the agreed minimum reference devices. React Native warns that development mode performance is not representative. [React Native performance](https://reactnative.dev/docs/performance.html) (accessed 2026-08-06).

Fixtures:

- typical: 2 programmes, 150 workouts, 4,000 sets;
- large history: 20 programmes/versions, 5,000 workouts, 150,000 sets, 500 custom exercises, revisions/tombstones;
- long active workout: 40 exercises × 12 sets with groups/notes/timer;
- pathological but valid: long Unicode names/notes and dense chart range.

Measure cold/warm launch, Today, start/log/edit/finish, history search/scroll, chart generation, migration, export, memory after repeated navigation and 30-minute active workout. Budgets are in [performance-budgets.md](performance-budgets.md).

## Security and privacy tests

- Static secret scan, dependency vulnerability/licence/SBOM and entitlement/permission diff.
- Release-binary traffic capture across all core journeys; unexpected outbound traffic blocks a local-only release.
- Search logs, crash artefacts, app-switcher snapshot, notification and non-private files for seeded private markers.
- Export content/schema/checksum validation, private staging cleanup and hostile destination/error behavior.
- Platform backup inclusion/exclusion and actual restore behavior with SecureStore exclusions and current/previous app versions.
- Delete-all filesystem and UI verification.
- Future backend: cross-tenant, auth expiry/revocation, idempotency, export/delete and conflict tests before beta.

## CI and cadence

| Cadence | Blocking suite |
|---|---|
| Pre-commit/local | Changed unit/component tests, type/lint/format. |
| Every PR | Static, full domain, component, core DB/migrations, affected integration, architecture dependencies, docs/links. |
| Main merge | iOS/Android clean native build and critical E2E smoke in release-like build. |
| Nightly | Full E2E matrix, property/stress, large history, migration/interruption, visual and performance trend. |
| Release candidate | Signed release artefacts; physical-device accessibility/performance/offline/security/platform-backup policy and OS-supported restore behavior; full checklist. |

No required test may remain permanently quarantined. Flake gate: critical suite ≥99% pass consistency over the last 100 unchanged runs; a flaky data-safety test blocks release until fixed. Retries may gather evidence but the first failure remains visible.

## Defect severity

- **P0:** acknowledged data loss/corruption, cross-user exposure, unrecoverable migration, release crash on core path.
- **P1:** cannot start/log/finish/restore an active session offline; incorrect schedule/progression/PR with material effect; critical accessibility blocker; security high severity.
- **P2:** significant friction, wrong noncritical output, performance/accessibility budget miss with workaround.
- **P3:** polish/cosmetic issue without misleading or inaccessible meaning.

Release gate: zero open P0–P2. P3 may remain only with a named owner, product/quality approval, dated follow-up and no misleading, inaccessible, unsafe or data-risk consequence.

## Evidence package

For each RC retain:

- commit, lockfile hash, app/build/schema/catalogue/rule versions and signed artefact IDs;
- commands and test reports with seeds;
- device/OS/build-mode matrix;
- migration fixture hashes, interruption results, export validation and platform-backup inclusion/restore results;
- performance raw data/percentiles/traces;
- accessibility manual script/results and issues;
- screenshots/visual diff approvals;
- permissions/traffic/log/SBOM/security scan results;
- known issues, accepted risks and sign-offs.

## Reversibility

| Decision | Class |
|---|---|
| Behavioural contracts, deterministic fixtures, fault injection | Must; expensive to retrofit |
| Exact unit/component/E2E runner | Reversible after tool spike |
| Coverage/mutation thresholds | Reversible with quality approval, never to hide missing critical scenarios |
| Physical minimum-device matrix | Must before release; update with supported OS policy |
| Cloud device farm | Deferred until it adds coverage beyond owned devices |
