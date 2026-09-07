# Outcome-based roadmap

Updated: 2026-09-07. The roadmap follows the accepted logging-first scope (`D-009`) and is gated by evidence and owner decisions, not calendar promises.

## Gate 0 — Foundation approval (current)

**Accepted:** a simple workout logger with optional routines, repeat, editable history and meaningful trends; earlier broad scheduling/guidance scope is deferred.

**Current work:** simplify the disposable Tempo Ledger prototype, reconcile product/domain/architecture scope, validate changed flows and obtain independent review. Demonstrate an empty first launch, a genuinely blank workout, recording/editing sets, repeat with completion state reset, optional routine creation/editing and history/trend empty states.

**Exit outcomes:** owner approves the final visual direction, revised critical journeys and proposed architecture. Scope acceptance alone does not open the production gate. Current prototype limitations and review findings are explicit; no native durability or release-readiness claim comes from a browser prototype.

## Gate 1 — Dependable workout loop

After Gate 0 approval, build the smallest production slice that proves a useful record:

- Open Workouts without account, goal, programme or schedule setup; units are visible and editable.
- Start an empty session, select exercises and record/edit ordinary sets.
- Leave, lock, terminate and relaunch; restore exactly the latest committed work offline.
- Finish without carry-forward decisions and find the saved workout in history.
- Use stable IDs, versioned local schema, recoverable migrations and verified transaction boundaries.
- Apply the selected design/accessibility primitives and prove screen-reader/large-text operation.

**Exit evidence:** zero silent acknowledged loss in interruption/failure fixtures; blank start in one action; no duplicate active/completed workouts; ordinary set logging meets the interaction budget. Database and domain design must not require a programme or planned occurrence.

## Gate 2 — Reuse, correction and useful progress

Add repeat of any completed workout, optional routine creation/editing/save-from-workout, approved custom exercise and measurement modes, standard/warm-up sets, a non-blocking timer, manual exercise changes, notes, auditable completed-workout editing, workout frequency, comparable exercise performance and observed personal bests. Finish complete export and scoped deletion before any release.

**Exit evidence:** repeat copies no completion flags or current-session observations; routine edits preserve old snapshots; corrected/deleted data deterministically changes trends/PRs; empty and single-observation histories make no invented trend claim. Every visible control maps to the accepted scope. Accessibility, offline, restoration, export, device-size and long-history gates pass for all shipped flows.

## Gate 3 — Private product validation

Test with new, intermediate, experienced, general-fitness and inconsistent-schedule users. Include people who only log blank workouts, people who repeat history and people who choose routines. Measure first-action clarity, repeated set-entry errors/time, edit/reuse comprehension, trend interpretation and confidence in restoration. Use consented research; no telemetry is assumed.

**Exit evidence:** PRD task thresholds met or the design revised; no unresolved material usability/accessibility/data-loss findings. The app remains fully useful without a routine or guided plan. Frequency is a descriptive metric, not a target for pressure or fitness claims.

## Gate 4 — Release candidate

Complete both-platform device evidence, backup-policy/recovery verification, migration rehearsal, privacy disclosures, store/support content, name clearance, accessibility statements, release automation and signed readiness review. No production dependency, external service or data transfer enters without an accepted purpose/security/licence decision.

## Deferred discovery

Fixed/flexible schedules, curated programmes, ranked substitutions, short-workout recommendations, progression suggestions, advanced set/group workflows and richer analytics require fresh evidence and scope approval after the logging loop is trusted. Portable backup/import, cloud sync, gym profiles, sharing and platform extensions remain separately deferred. Payments, social features, nutrition and autonomous coaching are outside this first release.
