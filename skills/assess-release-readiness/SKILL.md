---
name: assess-release-readiness
description: Assess whether a NextSet mobile release candidate has complete product, domain, data, accessibility, performance, privacy, operational, store, and rollback evidence. Use for formal release-candidate reviews; never use it to waive missing quality gates.
---

# Assess release readiness

## Required inputs

- Release candidate identifier and complete change scope
- Approved requirements, risks, ADRs, test matrices, migration/export evidence, privacy/store artefacts, monitoring and rollback plan
- Named decision owner and unresolved exceptions

## Procedure

1. Read `AGENTS.md` and `docs/quality/release-readiness.md`; freeze the candidate under review.
2. Trace every shipped feature to an approved requirement, acceptance evidence, domain tests, and user-facing content.
3. Verify critical journeys, offline/interruption restoration, migration, export/deletion, accessibility matrix, performance budgets, security/privacy review, dependency/licence review, and clean-install/upgrade paths.
4. Confirm no placeholder controls, fake analytics, hidden data loss, unsupported claims, secrets, debug flags, or unapproved telemetry remain.
5. Rehearse rollback/recovery and verify support, incident ownership, known-issue communication, and store metadata match the build.
6. Treat exceptions as explicit time-bounded risk acceptances; never infer acceptance from silence.

## Evidence required

- Signed requirement/test/risk matrix, commands and artefact links, device/build matrix, migration/rollback rehearsal, privacy/accessibility/store review, and release owner decision

## Failure conditions

Return `no-go` for any P0/P1, data-loss risk, failed critical journey, inaccessible core flow, unmet critical performance budget, unreviewed migration/privacy change, missing rollback, or evidence attached to a different build.

## Output

Return `go`, `conditional go`, or `no-go`; list blocking findings first, then gate matrix, accepted exceptions with owners/expiry, rollback trigger, and final decision owner.
