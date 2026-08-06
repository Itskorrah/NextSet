# Set types and performance measurement specification

Status: proposed normative domain contract  
Last updated: 2026-08-06

## 1. Key modelling decision

“Set type” is not one flat enum. A recorded set is the product of orthogonal dimensions:

1. **set role** — why it appears in the session (`warmUp`, `working`, `drop`);
2. **measurement mode** — what was observed (`repetitions`, `duration`, `distanceDuration`, `repetitionsDuration`);
3. **load mode** — how resistance is represented (`external`, `bodyweight`, `assisted`, `none`, `custom`);
4. **laterality** — how sides are recorded (`bilateral`, `unilateralShared`, `unilateralSeparate`);
5. **effort intent and observation** — standard/AMRAP/failure-permitted intent and optional RPE/RIR/failure report;
6. **group context** — independent, superset or circuit membership.

This prevents invalid semantics such as treating “superset”, “bodyweight” and “failure” as mutually exclusive peers. UI may offer familiar shortcuts, but persisted data MUST retain these separate dimensions.

## 2. Canonical set record

### ST-MOD-001 SetPerformance

| Field | Required | Meaning |
|---|---:|---|
| `setPerformanceId` | yes | Immutable stable identity |
| `exercisePerformanceId` | yes | Owning exercise occurrence in one session |
| `plannedSetId` | no | Source planned set; absent for unplanned set |
| `orderKey` | yes | Stable ordering within exercise performance |
| `state` | yes | `draft`, `completed`, `skipped`, `notAttempted`, `invalidated`, `softDeleted`; only `completed` contains observed performance, while skipped/not-attempted materialised planned rows contain disposition/provenance only |
| `setRole` | yes | `warmUp`, `working`, `drop` |
| `measurementMode` | yes | Copied from compatible exercise-definition version |
| `measurement` | conditional | Mode-specific observation in section 4 |
| `loadMode`, `load` | yes/conditional | Mode-specific load in section 5 |
| `lateralityMode`, `sideValues` | yes/conditional | Section 6 |
| `effortIntent` | yes | Section 7; default `standard` |
| `rpe`, `rir`, `failureReported` | no | User-entered observations; never inferred |
| `dropParentSetId` | conditional | Required when role is `drop` |
| `completedAt` | conditional | Required for a locally completed set; imported unknown timestamps use explicit provenance |
| `source` | yes | `planned`, `unplanned`, `imported`, `edited` plus version/provenance |
| `noteRef` | no | User note, protected as private data |
| `revision` | yes | Monotonic edit revision |

Canonical quantities are logical exact decimals plus explicit units; implementation MUST NOT use binary floating point as persisted identity/comparison for loads or distances. The SQLite architecture maps mass to exact integer grams and distance to exact integer millimetres while also retaining the user's original exact value/unit. That is the approved storage representation of this domain contract, not a competing numeric model. A future unit requiring finer precision needs a schema/rule decision rather than lossy rounding.

### 2.1 Architecture SetEntry and SetType mapping

The architecture's `SetEntry` is the persisted form of `SetPerformance`. Its current flat `SetType` example must be normalised to these orthogonal domain fields or made a composite profile that references them; the words below are **not** mutually exclusive type codes.

| Legacy/architecture label | Canonical domain field |
|---|---|
| `warm_up`, `working`, `drop` | `setRole` (`ST-ROLE-*`) |
| `failure` | `effortIntent` and/or user-entered `failureReported` (`ST-EFF-*`) |
| `timed` | `measurementMode` is `duration`, `distanceDuration` or `repetitionsDuration` (`ST-MEAS-*`) |
| `bodyweight`, `assisted` | `loadMode` (`ST-LOAD-*`) |
| `unilateral` | `lateralityMode` (`ST-LAT-*`) |
| `superset`, `circuit` | exercise/group relationship, never set measurement type (`ST-GRP-*`) |

A working timed assisted unilateral set is valid and must not require choosing one label at the expense of the others. Persistence therefore needs separate constrained columns/foreign keys (or an equivalently validated composite) for role, measurement, load, laterality and effort. Any architecture table that keeps `set_type_id` must define it as a versioned composite profile and still expose its constituent values for validation, comparison and export.

## 3. Set roles

| ID | Role | Meaning and behavior |
|---|---|---|
| ST-ROLE-001 | `warmUp` | Preparation set explicitly authored/marked by the user. Saved in history; excluded from MVP working volume, progression qualification and working-set PRs. It is not automatically optional or “easy.” |
| ST-ROLE-002 | `working` | Set eligible for programme target evaluation, comparable summaries and record rules when all other eligibility conditions pass. It makes no claim that the load/volume is appropriate. |
| ST-ROLE-003 | `drop` | Working effort intentionally linked after a parent working/drop set with a changed resistance or compatible custom change. Saved independently; participation in records is rule-specific. |

“Failure set” is represented as `setRole=working|drop` plus effort intent/report (`ST-EFF-*`). “AMRAP” is also effort intent, not observed proof of maximal reps.

## 4. Measurement modes

| ID | Mode | Required observation | Optional observation | Comparison boundary |
|---|---|---|---|---|
| ST-MEAS-001 | `repetitions` | Integer reps | cadence note only as free text in MVP | Same exercise variation, load/laterality signature |
| ST-MEAS-002 | `duration` | Duration in whole seconds | load, RPE/RIR when compatible | Same exercise variation/load/laterality; duration direction is exercise-defined (`more`, `less`, `none`) |
| ST-MEAS-003 | `distanceDuration` | Exact distance + duration seconds | load when compatible | Same exercise variation and unit-normalised distance/duration; no automatic single-score PR in MVP |
| ST-MEAS-004 | `repetitionsDuration` | Integer reps + duration seconds | load, RPE/RIR | Same exercise variation/load; descriptive in MVP unless a reviewed rule defines direction |

MVP does not invent pace, calories, power, velocity, range of motion or technique quality when sensors and validated definitions are absent. A future measurement mode requires a versioned exercise-definition migration and record-rule decision.

## 5. Load modes

| ID | Mode | Stored fields | Rules |
|---|---|---|---|
| ST-LOAD-001 | `external` | `externalLoad {value, unit, basis}` | Value >=0. `basis` is `total`, `perImplement`, `perSide` or `machineDisplayed`; it is part of comparison signature. The app never guesses the basis. |
| ST-LOAD-002 | `bodyweight` | optional `addedExternalLoad`; optional body mass snapshot only if user deliberately records it | Body mass is not required and never fetched/inferred in MVP. “Bodyweight + 10 kg” retains the +10 component; total effective load is not fabricated. |
| ST-LOAD-003 | `assisted` | `assistance {value, unit, basis}`; optional added load only for a separately supported definition | Greater assistance is not treated as a heavier lift. Records compare within the same machine/definition and assistance basis; lower assistance may be a descriptive improvement candidate only under a reviewed rule. |
| ST-LOAD-004 | `none` | no load fields | Used for unloaded/timed/repetition observations. Entering a load is invalid rather than silently ignored. |
| ST-LOAD-005 | `custom` | versioned named numeric fields defined by the exercise definition | Requires a display, validation and comparison contract. Unsupported custom values are recordable/exportable but excluded from generic PR/volume. |

Unit conversion affects display only. Canonical comparison normalises equivalent mass/distance units using a versioned exact conversion policy and retains the original entered value/unit.

## 6. Laterality

| ID | Mode | Input contract | Summary contract |
|---|---|---|---|
| ST-LAT-001 | `bilateral` | One shared measurement/load represents the exercise definition's complete set | No side inference |
| ST-LAT-002 | `unilateralShared` | One value is explicitly declared to apply to both sides; optional starting side | Reps are stored “per side” or “total” according to the versioned exercise definition; label is always visible |
| ST-LAT-003 | `unilateralSeparate` | Left and right observations are recorded separately; either side may be incomplete/different | Never average, double or copy a side silently. A set can be completed with one side absent only when user confirms partial-side state |

Changing an exercise definition from per-side to total-rep semantics creates a new version and comparison boundary. A UI convenience to “copy left to right” requires an explicit action and stores both observations.

## 7. Effort intent and observation

| ID | Concept | Contract |
|---|---|---|
| ST-EFF-001 | `standard` intent | No planned maximal-effort meaning |
| ST-EFF-002 | `amrap` intent | User/programme intends “as many repetitions as chosen under the programme instruction”; it does not prove physiological maximum or require failure |
| ST-EFF-003 | `failurePermitted` intent | Programme/user permits stopping at self-reported failure; content requires professional validation and neutral display |
| ST-EFF-004 | `failureRequired` intent | Not included in product-authored MVP defaults. If custom programmes can represent it, it remains user-authored, carries no endorsement and requires an explicit advanced disclosure |
| ST-EFF-005 | `failureReported` observation | Optional boolean/unknown user report about the completed set; never inferred or used as a safety fact |
| ST-EFF-006 | RPE observation | Optional exact 0–10 value in 0.5 increments in MVP; labelled user-reported subjective exertion |
| ST-EFF-007 | RIR observation | Optional integer 0–10 in MVP; labelled user-reported reps in reserve |

The model can preserve both RPE and RIR when an approved UI or import deliberately supplies both, but whether the first-release entry UI exposes simultaneous entry is deferred to interaction validation. They must not be auto-converted or treated as perfectly equivalent. A programme rule that requires one must name it; the other cannot silently substitute.

## 8. Drop, supersets and circuits

| ID | Rule |
|---|---|
| ST-DROP-001 | A drop set's parent exists, is completed or is being committed atomically, belongs to the same exercise performance and precedes the drop set. |
| ST-DROP-002 | For external-load comparable sets, a valid canonical drop normally has lower external load than its parent. Equal/higher values require “manual exception,” remain observed data and are excluded from drop-specific analysis. |
| ST-DROP-003 | A chain is allowed (`working → drop → drop`) but cycles and cross-exercise links are invalid. |
| ST-DROP-004 | A drop set may have different reps/duration and effort observation; those remain independently validated. |
| ST-GRP-001 | Superset/circuit membership belongs to exercise performances and planned groups, not individual measurement meaning. |
| ST-GRP-002 | Completing one group member never completes or fabricates another member's set. |
| ST-GRP-003 | Rest after a member/round is timer configuration, not set duration or completion. |
| ST-GRP-004 | MVP group context is one-level and non-nested. More advanced group composition is a post-MVP programme-authoring concern, not another set type. |

## 9. Target model

A target is never an observed set. `MeasurementTarget` contains a compatible exact value or inclusive minimum/maximum; `LoadTarget` contains exact/range load plus basis; `EffortTarget` contains one named RPE/RIR range or intent. Minimum MUST be <= maximum.

| ID | Target rule |
|---|---|
| ST-TGT-001 | Observed performance outside a target remains valid and is labelled below/within/above the target without judgement. |
| ST-TGT-002 | A planned value copied into an input remains a draft until the user deliberately completes it; the system cannot claim it was performed. |
| ST-TGT-003 | Previous-session values are reference hints, not default observations. If prefilled, their prefilled state must be visually distinguishable and completion remains deliberate. |
| ST-TGT-004 | “3 × 8–10” means three planned working sets, each with inclusive range 8..10; it does not mean any 24–30 total reps qualifies unless the progression rule explicitly uses total-reps policy. |

## 10. Validation rules

Validation failures preserve input. Numeric support bounds protect software/data quality; they are not safe training limits (`SAF-NC-006`). Product design should catch likely unit mistakes (for example 1000 kg after switching from lb) through confirmation, not a medical warning.

| ID | Validation |
|---|---|
| ST-VAL-001 | A completed set has one supported measurement mode matching its exercise-definition version. |
| ST-VAL-002 | Reps are integers 0..100,000. Zero is allowed only when explicitly recording an attempted/no-rep or partial result; it is excluded from positive-performance PRs. |
| ST-VAL-003 | Duration is an integer 1..86,400 seconds for completed timed observations; zero remains an incomplete draft. |
| ST-VAL-004 | Distance is exact, >0 and <=1,000,000 canonical metres; unit is supported and original value retained. |
| ST-VAL-005 | Mass/load/assistance values are exact decimals 0..100,000 canonical kg with at most implementation-supported precision; UI confirms outlier/unit changes rather than claiming danger. |
| ST-VAL-006 | Load fields conform exactly to load mode; incompatible extra fields produce a recoverable validation error and are not silently discarded. |
| ST-VAL-007 | Load basis is present for external/assisted values and is compatible with exercise definition. |
| ST-VAL-008 | RPE is absent or 0..10 in 0.5 increments; RIR is absent or integer 0..10. Values outside support remain draft/error. |
| ST-VAL-009 | A completed unilateral-separate set has a valid observation for at least one side and explicit `completeBoth` or `partialSide` state; missing side is not copied. |
| ST-VAL-010 | A completed set has `completedAt`, unless imported with explicit `timestampUnknown` provenance. |
| ST-VAL-011 | Set order is unique within an exercise performance. Reorder changes keys, never identities. |
| ST-VAL-012 | Drop parent rules `ST-DROP-001`–`ST-DROP-003` pass; exception status is explicit where allowed. |
| ST-VAL-013 | A soft-deleted/invalidated set cannot be completed or counted until restored as a new revision. |
| ST-VAL-014 | Decimal parsing uses the active locale for entry but produces one unambiguous canonical value; mixed separators that cannot be resolved are rejected with the original text retained. |
| ST-VAL-015 | NaN, infinity, negative quantity, numeric overflow and malformed import values are never accepted as completed observations. |
| ST-VAL-016 | A planned target's minimum <= maximum and all components are compatible with the exercise measurement/load/laterality definition. |

## 11. Comparability, volume and records

### ST-CMP-001 Comparison signature

Two set performances are directly comparable only when all required fields match or a versioned compatibility mapping explicitly permits comparison:

- profile;
- exercise definition/variation compatibility family and version;
- measurement mode;
- load mode and basis;
- laterality mode and per-side/total convention;
- equipment/machine identity where the exercise definition requires it;
- unit-normalised quantity semantics;
- record/rule version.

Display names, shared muscle tags or substitution ranking do not establish comparability.

### ST-CMP-002 Volume

For eligible repetition + external-load sets with `basis=total`, basic set volume is `canonical total external load × repetitions`. For `perImplement/perSide`, a multiplier is used only when the exercise definition explicitly states how many implements/sides the recorded reps represent. Otherwise volume is unknown. Duration, bodyweight, assisted and custom modes do not enter the same total.

Volume is a descriptive arithmetic summary, not a measurement of physiological stimulus or workout quality.

### ST-CMP-003 Estimated 1RM

MVP may offer a versioned formula (for example, an approved formula applied only in a declared rep range) but must store formula ID/version, inputs and limitations. The foundation does not select a formula; that is an unresolved content/domain decision requiring validation. Until selected, e1RM is disabled rather than inconsistently calculated.

## 12. Entry and edit behavior

| ID | Interaction-domain contract |
|---|---|
| ST-UX-001 | Completing a valid normal set commits the entire set revision atomically and produces immediate saved feedback. |
| ST-UX-002 | An invalid field receives specific error focus; other valid draft fields remain. No generic “couldn't save” replaces actionable validation. |
| ST-UX-003 | Editing a completed set creates a new revision and triggers deterministic recalculation under `WPR-EDIT-004`. |
| ST-UX-004 | Deleting the latest set is recoverable in the immediate edit context where feasible; permanent/soft-delete semantics are clear. |
| ST-UX-005 | Advanced fields appear only when enabled or required, but persisted advanced values cannot be hidden in a way that makes completion misleading. |
| ST-UX-006 | Rest timer start is part of the same acknowledged outcome as set completion when auto-start is enabled; timer failure cannot roll back a valid set, but it must be reported without false timer success. The transaction stores the timer anchor where supported. |

## 13. Worked records

### ST-EX-001 Normal external-load set

Bench press definition uses repetitions, external `total` load, bilateral. User records 8 reps at 60 kg, working role, RPE 8. The set is eligible for comparable working history. It does not imply the target was safe or that RPE was objectively verified.

### ST-EX-002 Dumbbell per-implement set

Dumbbell press definition uses `perImplement`; user records “20 kg each × 10.” Persist 20 kg with basis `perImplement`, reps 10 and definition multiplier 2 if the definition states both arms move per rep. Display may show “20 kg each.” It cannot compare directly with a 40 kg barbell press.

### ST-EX-003 Assisted pull-up

Exercise uses repetitions + assisted machine. User records 8 reps at 25 kg assistance. The raw assistance remains 25 kg. It is not represented as “-25 kg,” combined with unknown body mass or placed on a heaviest-load leaderboard.

### ST-EX-004 Unilateral difference

Left leg records 10 reps at 15 kg; right records 8 at 15 kg. Both are preserved. The app does not average to 9, double to 18 or copy 10 to the right. Progress views may show sides separately when that question is supported.

### ST-EX-005 Drop chain

Working: 10 at 50 kg. Drop 1: 8 at 40 kg linked to working. Drop 2: 7 at 30 kg linked to Drop 1. All are saved; the two drop sets are excluded from a rule that qualifies only planned working sets unless the rule explicitly includes them.

## 14. Test traceability

See `TS-SET-001`–`TS-SET-014`, `TS-REST-001`–`TS-REST-005` and `TS-PR-001`–`TS-PR-008` in [`domain-test-scenarios.md`](domain-test-scenarios.md). Boundary inputs are `EC-SET-*`, `EC-GROUP-*`, `EC-UNIT-*` and `EC-PR-*` in [`edge-cases.md`](edge-cases.md).
