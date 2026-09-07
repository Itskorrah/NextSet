---
name: review-workout-rules
description: Review NextSet workout, programme, scheduling, set-type, record, substitution, and progression rules for determinism, user control, edge cases, safety boundaries, and automated testability. Use before implementing or changing workout-domain behaviour.
---

# Review workout rules

## Required inputs

- Stable rule IDs and proposed wording or code
- Entity/state inputs, outputs, validation, precedence, and version
- Related journeys, recommendation copy, and domain tests

## Procedure

1. Read `docs/domain/workout-progression-rulebook.md`, programme/set specifications, edge cases, safety boundaries, and data model.
2. Classify each rule as deterministic, programme-defined, user-configurable, optional recommendation, future intelligence, professional-validation need, or no-claim area.
3. Enumerate normal, boundary, invalid, interruption, offline, edit, migration, and concurrency cases.
4. Check fixed/flexible scheduling, partial completion, reschedule/skip/repeat, substitution intent, set semantics, units, rounding, record recalculation, and recommendation explanation.
5. Prove user override and audit history. Ensure recommendations never mutate plan/history before confirmation.
6. Convert each outcome into table-driven tests with explicit fixtures and invariant assertions.

## Evidence required

- Decision table with inputs, precedence, expected state transition, explanation, and event/audit output
- Edge-case and invalid-input catalogue
- Automated test mapping and any professional-validation requirement

## Failure conditions

Return `blocked` for ambiguous precedence, nondeterministic core outcomes, missing unit/rounding semantics, silent historical mutation, unbounded safety claims, unexplainable recommendation, or absent recovery behaviour.

## Output

Return severity-ranked findings, corrected rule text, decision tables, missing tests, safety/claim notes, and `pass|rework|blocked`.
