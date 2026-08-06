# Product safety and claims boundaries

Status: proposed normative boundary; professional review still required where marked  
Last updated: 2026-08-06

## 1. Purpose

NextSet is a workout planning and recording product. It is not a medical device, healthcare service, rehabilitation system or autonomous coach in the proposed MVP. These boundaries limit what the product calculates, recommends and says. They do not establish that any exercise, programme, load or training practice is safe or appropriate for an individual.

This document distinguishes:

- **mechanical product safety** — preventing lost/corrupted records and unintended state changes;
- **content safety** — reviewed wording and bounded product-authored training content;
- **claim safety** — not presenting estimates, correlations or user inputs as medical/professional conclusions;
- **future/professional validation** — work that cannot enter production solely because it is technically implementable.

When a safety boundary conflicts with engagement, convenience or recommendation coverage, the boundary wins.

## 2. Claims NextSet may make

| ID | Permitted claim type | Conditions and example |
|---|---|---|
| SAF-ALLOW-001 | Stored fact | It is directly recorded and unchanged: “You logged 3 completed working sets.” |
| SAF-ALLOW-002 | Deterministic plan state | It follows a versioned rule: “Workout B is next in your flexible sequence.” |
| SAF-ALLOW-003 | Transparent arithmetic | Formula, inputs, units and limits are available: “Recorded external-load volume was 1,800 kg using load × reps for eligible sets.” |
| SAF-ALLOW-004 | Bounded recommendation trigger | It names the configured observation and user choice: “You reached the top of the programme's rep range across all three working sets. Consider 52.5 kg next time, or keep/edit the target.” |
| SAF-ALLOW-005 | Descriptive trend | It identifies period, metric and inclusion rules without causation: “Your recorded bench-press load for 8 reps increased across these sessions.” |
| SAF-ALLOW-006 | Technical failure state | It says exactly what saved: “That edit was not saved. Your previous set is still stored; try again after freeing space.” |

Permitted copy must not add an outcome guarantee, diagnosis or moral judgement.

## 3. Explicit no-claim areas

| ID | NextSet MUST NOT claim or infer | Safe product behavior |
|---|---|---|
| SAF-NC-001 | That an exercise, load, rep count, set count, rest time, schedule or programme is safe or suitable for a person | Record the choice; show product-authored content only after review; allow override/stop |
| SAF-NC-002 | Diagnosis, treatment, rehabilitation suitability or injury-specific substitution | If a user says an exercise is uncomfortable, offer neutral skip/search/substitution controls and suggest seeking appropriately qualified help when copy context warrants; do not interpret cause |
| SAF-NC-003 | Fatigue, readiness, recovery, overtraining, illness or the reason performance changed | Show the comparable observations and neutral options such as view history, hold target, edit target or dismiss |
| SAF-NC-004 | Guaranteed strength, hypertrophy, weight, appearance, health or performance outcomes | Describe plan intent as author-supplied and outcomes as uncertain; never promise results |
| SAF-NC-005 | That short-workout selection is optimal, equivalent to the full plan or guaranteed to fit the selected time | Explain deterministic priority reductions and that duration is an estimate |
| SAF-NC-006 | That technical input limits are physiological safety thresholds | Copy says “outside the supported range” or “check the unit/value,” not “unsafe” |
| SAF-NC-007 | That user-reported RPE, RIR or failure is objectively verified | Label it self-reported and do not infer one from another |
| SAF-NC-008 | That estimated 1RM is an observed maximum, a recommended attempt or safe load | Always label **Estimated 1RM**, expose formula/rep range and keep it out of prescriptive copy |
| SAF-NC-009 | That muscle tags, movement patterns or substitution similarity prove equivalent effect | Say which metadata matches/mismatches and preserve user choice |
| SAF-NC-010 | That volume, adherence or streak length measures workout quality, discipline or worth | Treat metrics as descriptive; no punitive or moral copy |
| SAF-NC-011 | That the absence of a warning means the absence of risk | Avoid “safe”, “approved for you” or reassurance generated from incomplete profile data |
| SAF-NC-012 | Personal characteristics inferred from goal, exercise choice, performance, name or appearance | Ask only necessary optional preferences; do not infer gender, body state, disability or experience |

## 4. Content requiring professional validation

Technical/product review cannot replace a qualified content review. Before release, the repository must record reviewer role/qualifications, scope, date, version, evidence/rationale, limitations and expiry/re-review trigger. This is not a claim that one reviewer makes content universally suitable.

| ID | Content/rule | Minimum validation deliverable |
|---|---|---|
| SAF-PRO-001 | Product-supplied programme templates | Per-version content review of audience, prerequisites, exercise ordering, targets, frequency, progression, alternatives and plain-language limits |
| SAF-PRO-002 | Default progression thresholds/increments and qualification policy | Review of applicable exercise/load modes, edge conditions, rounding, suppression and non-response options |
| SAF-PRO-003 | RPE/RIR-based default rules or educational copy | Review of scale wording, applicability, missing/contradictory entries and automation-bias risk |
| SAF-PRO-004 | Deload, performance-decline or recovery-related default suggestions | Review of evidence, language and escalation boundaries; MVP should defer automated recovery advice |
| SAF-PRO-005 | Exercise instructions, technique cues and authored alternatives | Per-definition source/provenance, version, accessibility and limitation review; no treatment claims |
| SAF-PRO-006 | Failure/AMRAP default programming or celebratory treatment | Review of intended audience, wording, safeguards and whether it should appear at all in product-authored templates |
| SAF-PRO-007 | Estimated 1RM formula and qualifying rep range | Selected formula/version, applicable data, exclusion conditions, display precision and non-prescriptive disclaimer |
| SAF-PRO-008 | Adaptive/model-generated training guidance | New product decision plus prospective safety, privacy, bias, explainability, monitoring and human-override plan; out of MVP |
| SAF-PRO-009 | Content aimed at minors or age-specific populations | Legal/policy plus appropriately qualified content review; not assumed in the current broad adult-gym foundation |

An item marked “requires validation” remains unavailable or explicitly user-authored until the review artefact is approved. A generic disclaimer cannot substitute for validation.

## 5. Recommendation safety contract

| ID | Rule |
|---|---|
| SAF-REC-001 | A recommendation is optional (`WPR-CLASS-004`), never a command, and never mutates the programme before user acceptance. |
| SAF-REC-002 | It lists the specific qualifying completed performances, rule/version, calculation and rounding. Missing required data suppresses the recommendation. |
| SAF-REC-003 | It offers accept, edit, hold/defer and dismiss with equal functional legitimacy. Copy must not shame a hold or dismissal. |
| SAF-REC-004 | It is limited to the measurement/variation/rule boundary that was validated; no cross-exercise or cross-modality extrapolation. |
| SAF-REC-005 | User notes, inferred mood, missed sessions, age, body state, health status or location are not recommendation inputs in MVP. |
| SAF-REC-006 | Unexpected decline produces descriptive comparison and neutral controls only; it does not name a cause or automatically lower work. |
| SAF-REC-007 | A manual override remains possible and is labelled user-authored. Repeated overrides do not trigger pressure or hidden scoring. |
| SAF-REC-008 | Recommendations stop when data is corrected, incomparable, corrupt, outside supported bounds, under a manual hold or attached to a superseded rule. |
| SAF-REC-009 | Future intelligent guidance must be separately consented where data processing requires it and provide a non-intelligent core path. |

### Approved pattern

> You completed 10 reps in each of the three planned working sets at 50 kg, the top of this programme's 8–10 range. Its double-progression rule proposes 52.5 kg for 8–10 reps next time after rounding to 2.5 kg. Keep 50 kg, use 52.5 kg, edit, or dismiss.

### Rejected patterns

- “Your body is ready for more.” — unsupported readiness inference.
- “You should safely lift 52.5 kg.” — unsupported suitability/safety claim.
- “Poor recovery detected; take a deload.” — diagnosis-like cause and prescription.
- “Don't break your streak—train today.” — manipulative pressure.
- “This replacement is injury-safe.” — medical/rehabilitation overreach.

## 6. Pain, discomfort and unexpected events

| ID | User signal or event | Required response | Prohibited response |
|---|---|---|---|
| SAF-EVT-001 | User selects “uncomfortable” as substitution reason | Preserve the reason privately if the user chooses; offer skip, search, programme-authored alternative and end-exercise controls | Diagnose, ask leading medical questions, promise a suitable alternative |
| SAF-EVT-002 | User writes pain/injury language in a note | Store as private free text; do not parse for training automation in MVP | Feed to analytics/recommendations or generate diagnosis/treatment |
| SAF-EVT-003 | Comparable performance declines | Show values, data-quality limitations and neutral target controls | Infer fatigue, illness, overtraining or recovery need |
| SAF-EVT-004 | Extreme/outlier entry | Ask the user to verify number, unit and load basis; preserve draft | Call it dangerous/unsafe or silently clamp it |
| SAF-EVT-005 | Repeated failure-intent sets | Record accurately and keep celebrations neutral/off | Reward frequency, encourage another set or infer risk level |
| SAF-EVT-006 | User stops/partially completes | Save completed work and label skipped/not-attempted accurately; provide neutral next-plan choices | Shame, negative adherence judgement, auto-add missed work |

General emergency or medical-help copy, if included, must be jurisdictionally and professionally reviewed and shown only in a context that warrants it. The product must not pretend it can detect emergencies.

## 7. Set, record and metric boundaries

| ID | Rule |
|---|---|
| SAF-MET-001 | Warm-up, working and drop/failure-intent semantics remain visible; the product does not reward working classification changes. |
| SAF-MET-002 | Bodyweight, assisted, external-load, machine and custom modes are not collapsed into an invented universal load/volume score. |
| SAF-MET-003 | A personal record is a record under a stated comparison signature, not a general assessment of ability or health. |
| SAF-MET-004 | Charts state question, metric, units, time range and inclusion rules. Correlation over time is not causal evidence. |
| SAF-MET-005 | Muscle-group views use curated/user-authored exercise metadata and are labelled as plan/history categorisation, not measured muscle stimulus or balance. |
| SAF-MET-006 | Consistency summaries allow breaks and do not use loss-framed streaks. “No data” is not “failure.” |
| SAF-MET-007 | No feature rewards maximal workout volume, failure frequency, missing rest, pain/discomfort or comparison with another person's performance. |

## 8. Template and exercise-content governance

Each product-authored content item needs:

- immutable content ID and version;
- author/reviewer provenance and licence/source for media/text;
- intended use and explicit non-applicability/limitations;
- review status/date and re-review trigger;
- exercise-definition/measurement compatibility;
- accessible text alternative for visual/media content;
- change log and migration/adoption behavior;
- user report/correction channel for factual or accessibility issues.

Removing/rejecting catalogue content must not erase adopted programme versions or historical records. The product may warn that catalogue content is withdrawn and offer user-controlled replacement; it cannot rewrite history.

## 9. Wellbeing and engagement guardrails

| ID | Rule |
|---|---|
| SAF-WELL-001 | No guilt, shame, fear, body pressure, excessive urgency or moralised “discipline” copy. |
| SAF-WELL-002 | No punitive streak loss. A consistency view may count recorded activity while treating gaps neutrally and offering full opt-out. |
| SAF-WELL-003 | Rest days and deliberate skips are first-class neutral plan states. |
| SAF-WELL-004 | Celebrations are restrained, dismissible, reduced-motion compatible and configurable. They never block logging. |
| SAF-WELL-005 | Notifications are user-configured reminders, not escalating pressure. Declining permission does not degrade core use or trigger repeated prompts. |
| SAF-WELL-006 | Public comparison, leaderboards and competitive ranking are rejected for the proposed scope (`FEAT-REJ-002`). |
| SAF-WELL-007 | Retention, session frequency and recommendation acceptance cannot override data accuracy, privacy, accessibility or qualitative harm findings. |

## 10. Privacy-sensitive safety boundaries

| ID | Rule |
|---|---|
| SAF-PRIV-001 | Local-only use requires no account. Training goal and notes remain optional/private user data. |
| SAF-PRIV-002 | Free-text notes, exact schedule, location/gym name, health language and raw workout content are excluded from telemetry by default. |
| SAF-PRIV-003 | Share/export previews state included fields; share cards omit notes, location, schedule and identifiers by default. |
| SAF-PRIV-004 | Model/adaptive processing cannot be enabled in the future through a vague general analytics consent. |
| SAF-PRIV-005 | Deletion scope and recoverability are explained before commitment; an export offer is optional, not coercive. |

## 11. Safety acceptance checklist

No product/domain feature is ready for approval until reviewers can answer yes:

1. Is every output typed as plan, observation, calculation or recommendation?
2. Is the `D/P/C/R/F/V/N` classification explicit?
3. Can the user distinguish a stored fact from an estimate or suggestion?
4. Does the feature avoid diagnosis, treatment, readiness, recovery and outcome claims?
5. Are technical validation limits described without implying physiological safety?
6. Are override, dismiss, partial completion and rest treated neutrally?
7. Has required professional content been reviewed at the exact shipped version?
8. Are incomplete/incomparable inputs suppressed instead of guessed?
9. Are privacy and accessibility failure modes covered?
10. Do `TS-SAFE-*` and linked domain scenarios pass?

## 12. Open professional-validation decisions

- Select the role/qualification and governance process for product template and exercise-content reviewers.
- Select and validate any e1RM formula, display precision and qualifying rep range; until then it remains disabled.
- Decide whether product-authored MVP templates may include failure-permitted sets and under what reviewed audience/content conditions.
- Validate any default RPE/RIR progression thresholds, decline thresholds or deload concepts before they appear as product recommendations.
- Define launch-age policy and jurisdiction-specific legal/content requirements; the current foundation does not claim age-specific suitability.
