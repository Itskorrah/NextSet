# Outcome-based roadmap

The roadmap is gated by evidence and owner decisions, not calendar promises.

## Gate 0 — Foundation approval (current)

**Exit outcomes:** product promise, target users, MVP boundary, one visual direction, critical journeys, local-first architecture, workout rules, and quality gates are approved. Git and prototype execution blockers are resolved or accepted with a recovery plan.

## Gate 1 — Walking skeleton

Build the smallest production-grade vertical slice that proves the expensive foundations:

- New local profile and measurement preference
- Seed exercise selection
- One programme template with flexible sequence
- Today → start → record normal sets → interrupt/restore → complete offline
- Versioned local schema, migrations, export skeleton, and durable transaction log
- Design tokens and accessibility primitives from the chosen direction
- Domain and restoration tests running in CI

**Exit evidence:** no silent data loss across forced termination and migration fixtures; one deliberate action starts the expected workout; normal set logging meets the interaction budget.

## Gate 2 — MVP breadth

Add approved programme creation/editing, fixed scheduling, custom exercises, warm-up and advanced set types, substitutions, short-workout mode, history, useful exercise progress, editable completion, personal records, explainable progression, settings, complete export, and deletion controls.

**Exit evidence:** all MVP requirement IDs and domain cases pass; large text, screen reader, reduced motion, offline, long-history, and device-size matrices pass; no P0–P2 visual or accessibility findings.

## Gate 3 — Private product validation

Run instrumented, consented testing with new, intermediate, experienced, and inconsistent-schedule users. Measure start clarity, set-entry time/error, programme recovery, substitution understanding, recommendation trust, restoration confidence, and retention without manipulative mechanics.

**Exit evidence:** success thresholds in the PRD are met or the design is revised; data-loss and migration gates remain at zero tolerated loss.

## Gate 4 — Release candidate

Complete privacy disclosures, accessibility nutrition labels/statements, store assets, support/export/deletion flows, error monitoring decision, release automation, rollback plan, migration rehearsal, and signed readiness review.

## Post-MVP and future gates

Only after the core record is trusted: optional account and encrypted sync, multi-device conflict UI, share cards, gym profiles, broader progression templates, carefully validated summaries, and platform extensions. Payments, social feeds, autonomous coaching, nutrition, marketplaces, and wearables require independent discovery and approval.
