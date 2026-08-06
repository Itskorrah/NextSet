---
name: review-data-migration
description: Review a NextSet local database migration for historical integrity, interruption safety, idempotence, compatibility, recovery, export correctness, and future sync boundaries. Use before merging any schema or semantic data change.
---

# Review data migrations

## Required inputs

- Before/after schema versions and migration code
- Representative, boundary, corrupted, large-history, and interrupted fixtures
- Invariants, backup/recovery design, compatibility window, and export mapping

## Procedure

1. Read the data model, local-first strategy, migration metadata rules, and accepted ADRs.
2. Classify the change as additive, transformative, destructive, or semantic; identify irreversible steps.
3. Verify stable identifiers, timestamps, order, units, programme versions, completed history, edits, deletions, and recommendation provenance remain meaningful.
4. Test clean upgrade, repeated execution, interrupted execution at each boundary, low storage, corrupted rows, old/large datasets, and app rollback policy.
5. Compare pre/post canonical exports and invariant counts/hashes. Explain intentional differences field by field.
6. Confirm a recoverable backup/checkpoint and safe failure state before destructive work.

## Evidence required

- Fixture catalogue and provenance, commands/results, pre/post schemas, invariant queries, export diffs, interruption matrix, duration/storage measurements, and recovery rehearsal

## Failure conditions

Return `blocked` for unbacked destructive change, non-idempotence, silent row loss, unstable IDs, semantic history drift, partial visible state, absent recovery path, or unbounded runtime/storage.

## Output

Return risk class, P0–P3 findings, invariant matrix, intentional transformations, recovery proof, compatibility decision, and `pass|blocked`.
