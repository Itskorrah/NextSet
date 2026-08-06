---
name: run-mobile-e2e
description: Run and document NextSet mobile end-to-end journeys across approved iOS and Android targets, including offline, interruption, restoration, large-text, and error states. Use after an integrated journey exists and before release-readiness claims.
---

# Run mobile end-to-end tests

## Required inputs

- Approved journey and acceptance IDs
- Build identifier, seed/fixture, device/OS matrix, and reset procedure
- Network/interruption controls and expected persisted state

## Procedure

1. Start from a known local database and record build/device details.
2. Execute the journey through user-visible controls; never patch state behind the UI unless the test explicitly validates migration/setup.
3. Capture deliberate actions, elapsed interaction budget, visible feedback, and persisted events.
4. Repeat critical flows offline and across background, force-quit, phone lock, process death, reboot, failed sync, and relaunch as applicable.
5. Cover iOS and Android, compact and large devices, target large-text settings, reduced motion, and screen-reader smoke paths.
6. Validate local database/export state after UI completion; detect duplicates, lost sets, stale plans, and record errors.

## Evidence required

- Exact command, build, fixture, device/OS, locale/units, network state, video/screenshots, logs, and resulting persisted/exported state
- Requirement-to-test matrix and retry/flakiness count

## Failure conditions

Return `blocked` for nondeterministic fixtures, unavailable required devices, silent data loss, duplicate state, critical accessibility failure, flaky critical flow, or missing persisted-state evidence.

## Output

Report pass/fail per journey and matrix cell, reproduction steps, artefact paths, flakiness, data assertions, blockers, and required rework.
