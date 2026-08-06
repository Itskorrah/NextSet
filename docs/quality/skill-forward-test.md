# `review-workout-rules` skill forward test

Status: blocked test; architecture rework applied, candidate rule not approved  
Test ID: `SFT-RWR-001`  
Date: 2026-08-06  
Skill under test: [`../../skills/review-workout-rules/SKILL.md`](../../skills/review-workout-rules/SKILL.md)

## Candidate rule

> When every working set reaches the top of its target rep range, immediately add 5% to the exercise load in the programme and use the rounded result next session. If a workout is edited later, keep the recommendation unchanged.

This was a read-only forward test of the candidate wording against the skill's required inputs, procedure, evidence and failure conditions. The normative comparison sources were the [`workout-progression-rulebook.md`](../domain/workout-progression-rulebook.md), [`programme-model.md`](../domain/programme-model.md), [`set-types.md`](../domain/set-types.md), [`edge-cases.md`](../domain/edge-cases.md), [`safety-boundaries.md`](../domain/safety-boundaries.md), [`domain-test-scenarios.md`](../domain/domain-test-scenarios.md) and [`data-model.md`](../architecture/data-model.md).

## Result

`blocked`

The wording triggers the skill's failure conditions for ambiguous precedence and core outcomes, missing unit/rounding semantics, silent plan/history mutation, insufficient explanation inputs and absent recovery behavior. Its apparent classes are deterministic calculation (`D`), programme-defined behavior (`P`), optional recommendation (`R`) and professional-validation need (`V`); rule ownership and configuration scope were not supplied.

## Required-input check

| Skill input | Candidate evidence | Finding |
|---|---|---|
| Stable rule ID/version | None | Missing; historical evaluation and migration cannot identify the rule. |
| Entity/state inputs and outputs | “every working set”, “exercise load”, “programme”, “next session” | Ambiguous set selector, load reference, target aggregate and occurrence boundary. |
| Validation and precedence | None | Missing compatibility, missing/invalid-input, manual-hold, concurrent-edit and version-conflict behavior. |
| Recommendation journey/copy | “immediately add” | Conflicts with the optional accept/edit/hold/dismiss contract. |
| Related tests | None | No executable fixtures or invariant assertions supplied. |
| Safety/content approval | Fixed 5% default | Professional validation is required before product-authored release. |

## Severity-ranked findings

1. **Blocker — silent programme mutation.** “Immediately add” bypasses a pending recommendation and user acceptance. Under `WPR-PROG-003`, acceptance must publish immutable future WorkoutTemplateVersion and ProgrammeVersion content and record an explicit future not-started occurrence adoption boundary.
2. **Blocker — nondeterministic qualification.** “Every working set” does not specify planned `n`, first-`n` versus all completed sets, `== rMax` versus `>= rMax`, extra/unplanned sets, partial/not-attempted sets, variation/comparison signature or an effort gate (`WPR-PROG-001`, `WPR-PROG-010`).
3. **Blocker — incomplete percentage and rounding identity.** The rule omits the planned-load reference, supported load mode/basis, maximum step, equipment/gym increment, rounding direction, tie behavior and no-increment outcome (`WPR-PROG-012`, `WPR-PROG-016`).
4. **Blocker — incorrect edit behavior.** A contributing-source edit must invalidate a pending recommendation and create a separately identified candidate when still eligible. Accepted history remains auditable and is not silently reversed; neither case means keeping one object unchanged (`WPR-PROG-005`).
5. **Blocker — no durable/recovery contract.** The wording has no source revisions, rule version, audit events, completion/evaluation transaction, idempotency key, offline parity, interruption recovery, migration or concurrent-edit result.
6. **High — “next session” is not an occurrence selector.** It does not resolve moved, skipped, repeated, unscheduled or already-started occurrences, nor scope the exercise to an exact programme-workout/template version.
7. **High — product-authored training content is unvalidated.** The 5% value, qualification, cap, supported modalities and hold/suppression behavior require documented professional validation (`WPR-SAFE-003`).

## Corrected rule template

This template intentionally leaves missing decisions in brackets; filling them is required before review can produce a deterministic rule.

> **`[RULE_ID]@[VERSION]` — `[programme-authored/product-authored and validation reference]`.** On successful completion of a workout snapshotted from `[programme version]`, evaluate exactly `[qualification selector]` for planned exercise `[scope]`. Qualifying sets must be completed, valid, comparable, `setRole=working`, and each record repetitions `[>= or ==; choose]` its stored `rMax`; apply `[effort gates]` if configured.
>
> Missing, incomparable, out-of-scope inputs or a manual hold produce no candidate and an explainable suppression reason. If qualified, idempotently create one pending recommendation. Compute `rawCandidate = [stored reference planned load] × 1.05`, apply `[maximum-step rule]`, then round once to `[equipment/gym increment]` using `[nearest/up/down]` and `[tie behavior]`. With no usable increment, `[show raw for confirmation or suppress; choose]`.
>
> Store source performance IDs/revisions, rule ID/version, reference, percent, raw/capped/rounded values, increment/policy, explanation, time and status. Do not mutate a published programme or active session. Offer accept, edit, hold and dismiss equally. Accept/edit publishes immutable future template/programme versions and records `[first eligible not-started logical occurrence boundary]`.
>
> If a contributing source changes while pending, preserve and invalidate the old object and create a distinct recomputed candidate if eligible. If already accepted, retain the accepted decision/version and require a new explicit correction; never silently reverse it. Completion, evaluation and retry follow `[durable local transaction/idempotency policy]`.

## Decision evidence

| Case and precedence | Expected state transition | Explanation and audit output |
|---|---|---|
| Valid qualifying source; no manual hold | Completion creates one `pending` recommendation only | Source IDs/revisions, rule/version, exact calculation, rounding and `recommendationCreated`; programme unchanged. |
| Missing, invalid, incomparable, effort-gate failure or manual hold | No candidate | Stable suppression reason; no plan mutation. Data/safety and explicit user action outrank the programme rule. |
| User accepts current candidate at expected programme revision | Publish immutable future versions and adoption boundary; mark recommendation accepted | Acceptance command/receipt, old/new version IDs and logical occurrence boundary. |
| User edits candidate | Publish user-authored future versions and adoption boundary | Generated and edited values plus override audit. |
| User holds/dismisses | Update recommendation status only | Choice and scope; programme unchanged. |
| Contributing source edited while pending | Mark old object invalidated; optionally create distinct candidate | Source revision and replacement linkage; old payload unchanged. |
| Contributing source edited after acceptance | Preserve accepted history and programme version; no automatic reversal | Correction audit and, if applicable, a separate new candidate. |
| Offline retry/process termination | Exactly one completion and evaluation result | Stable command receipt; no duplicate recommendation or cursor advancement. |
| Concurrent programme change/acceptance | Reject stale revision or require explicit resolution | Conflict audit; preserve user input, never silent last-write-wins. |

## Edge and invalid-input catalogue

- Exact versus above-upper-bound reps; fewer than planned sets; extra unplanned sets; warm-up/drop roles; skipped/not-attempted/invalidated sets.
- Mixed exercise variation, measurement/load mode, load basis, equipment, laterality, unit or rule version.
- Session load override versus stored planned reference; bodyweight, assisted, none and custom load modes.
- Missing/zero/unsupported percent or increment; rounding tie; raw result rounding to current load; maximum-step cap.
- Started session with later programme edit; moved, skipped, repeated or already-started “next” occurrence.
- Disk full/process termination at each commit boundary; offline completion; unknown historical rule version.
- Irrelevant versus contributing edit; pending versus accepted object; concurrent source, programme and acceptance revisions.

## Automated-test mapping and gaps

Existing coverage to reuse: `TS-PROG-001`, `TS-PROG-002`, `TS-PROG-004` through `TS-PROG-008`, `TS-DATA-002`, `TS-SCH-010` and `TS-PGM-003` in [`domain-test-scenarios.md`](../domain/domain-test-scenarios.md).

Missing table-driven coverage:

- `3 × 8–10 @ 50 kg`, `10/10/10`, 5%, 2.5 kg increment produces one pending 52.5 kg candidate while the programme remains unchanged.
- Equality/above-bound policy, first-`n` selection and an extra unplanned-set case.
- Planned-load reference versus session override and every supported load-mode/basis combination.
- Nearest/up/down/tie/no-increment/maximum-step cases using exact quantity identity.
- Accept/edit publishes the exact future versions/boundary; stale revision conflicts preserve the choice.
- Source edit before and after acceptance proves invalidation/replacement versus historical preservation.
- Termination before/after every completion/evaluation statement and idempotent offline retry.
- Move/skip/repeat/fixed/flexible selection retains logical occurrence identity and does not rebase an active session.
- Historical rule replay, unknown-version migration and concurrent acceptance/programme edit.

Every case must assert source IDs/revisions, rule/version, exact raw and rounded math, recommendation status, version/adoption audit, command idempotency and absence of silent programme mutation.

## Safety and claim notes

- The fixed 5% content and its applicability require professional validation before release; software bounds are not safe training limits.
- Copy may state the observed facts and configured math. It must not claim the user is “ready”, that the increase is “safe” or “optimal”, or promise strength, muscle or health outcomes.
- Accept, edit, hold and dismiss remain equal user-controlled actions. A suitable bounded pattern is: “You completed `[facts]`. This programme rule proposes `[rounded load]`: `[reference] × 1.05 = [raw]`, rounded `[policy]` to `[increment]`.”

## Rework caused by the forward test

The test exposed cross-document representation seams. The following foundation changes were made without approving the candidate rule:

- [`../architecture/data-model.md`](../architecture/data-model.md) now stores set role, measurement mode, load mode, laterality and effort independently instead of a flat SetType; PlannedSet uses the same dimensions.
- Committed mass/distance quantities now retain canonical integer grams/millimetres and the original exact decimal/unit.
- PlannedWorkout now represents unresolved missed state, stable logical occurrence identity across move lineage and one resolvable live row; WorkoutSession and children represent full/partial completion and not-attempted dispositions.
- ProgressionRecommendation now preserves invalidated pending objects, creates distinct recomputed candidates and accepts only through immutable future versions plus an explicit enrolment adoption boundary.
- Quality criteria and tests now assert these semantics and accessible combined announcements.

These repairs make the foundation capable of expressing a valid rule. `SFT-RWR-001` remains `blocked` until every bracketed rule input is supplied, the 5% content is professionally validated and the missing tests pass.
