---
name: review-performance
description: Review NextSet mobile changes against approved launch, interaction, rendering, database, battery, storage, and large-history performance budgets. Use after measurable implementation exists, after dependency changes, and before release readiness.
---

# Review performance

## Required inputs

- Build/commit, target devices/OS, scenario, fixture sizes, and performance budgets
- Baseline from the same environment and instrumentation method

## Procedure

1. Read `docs/quality/performance-budgets.md` and identify budgets affected by the change.
2. Measure cold/warm launch, Today readiness, start/log/edit/finish feedback, scroll/render stability, active-workout restore, database operations, migration, export, memory, binary/storage, and battery where applicable.
3. Run release/profile builds on representative lower and current devices; separate simulator results from device evidence.
4. Test realistic long workout, large history, large custom exercise library, offline state, and reduced-motion/large-text variants.
5. Compare median and tail values with baseline; attribute regressions using traces rather than intuition.
6. Record variance, sample count, thermal/network state, and instrumentation overhead.

## Evidence required

- Reproducible commands, device/build configuration, raw results/traces, summary table, baseline delta, and budget decision
- Dependency/bundle changes and known measurement limitations

## Failure conditions

Return `blocked` when a critical budget is exceeded, only debug/simulator evidence exists for a release gate, samples are not reproducible, a regression lacks attribution, or workout writes/restoration can miss their durability budget.

## Output

Lead with budget verdicts, then measurements, regressions, trace evidence, proposed fixes, residual risk, and `pass|rework|blocked`.
