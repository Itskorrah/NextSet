# Workout and progression rulebook

Status: proposed normative domain contract  
Last updated: 2026-08-06  
Audience: product, design, domain, data, implementation and quality agents

## 1. Authority, language and classifications

This rulebook defines domain outcomes independently of screens or technology. **MUST**, **SHOULD** and **MAY** are normative. Examples are illustrative unless explicitly labelled a validation fixture. If another foundation document abbreviates a behavior, this rulebook and the linked programme/set specifications control domain meaning.

Every rule has at least one explicit classification. A combined label such as `P/R` means the calculation is programme-defined while its proposed change remains optional; the most restrictive mutation/claim boundary always applies. The system must preserve the boundary between observed facts, configured plans and suggested changes.

| ID | Class | Meaning | May mutate data automatically? | Required product treatment |
|---|---|---|---|---|
| WPR-CLASS-001 | **D — deterministic product rule** | Integrity or state-transition behavior defined by NextSet and reproducible from stored inputs | Yes, only for the specified transition and within one local transaction | No “AI” language; covered by exact automated tests |
| WPR-CLASS-002 | **P — programme-defined rule** | Behavior explicitly stored in the effective programme version | Only when executing the already-approved programme; changing the programme needs user intent | Show the configured rule and programme version |
| WPR-CLASS-003 | **C — user-configurable rule** | Preference or session choice controlled by the user | Only after the user commits the setting/action | Preserve scope: session, programme or global |
| WPR-CLASS-004 | **R — optional recommendation** | A non-binding candidate action derived from qualifying observations and a supported rule | **No.** It remains pending until accepted or edited | Explain trigger, proposal, limits and all override options |
| WPR-CLASS-005 | **F — future intelligence** | Adaptive/model-driven behavior not approved for MVP | No production behavior in this phase | Requires a new decision, evidence, privacy, safety and explainability review |
| WPR-CLASS-006 | **V — professional validation required** | Training content/rule whose appropriateness cannot be established by software mechanics alone | Not until approved through the documented review process | Label status; do not ship provisional content as authoritative |
| WPR-CLASS-007 | **N — no product claim** | Area where NextSet records user choices or displays descriptive data but does not assert safety, diagnosis, treatment or outcomes | No claim-generating automation | Use bounded, factual language; see [`safety-boundaries.md`](safety-boundaries.md) |

### 1.1 Universal invariants

| ID | Class | Rule |
|---|---|---|
| WPR-INV-001 | D | Every persisted domain entity MUST have an immutable stable identifier; display names are never identity. |
| WPR-INV-002 | D | Completed history MUST retain the programme version, exercise definition version, set semantics and rule version needed to interpret it. |
| WPR-INV-003 | D | Planned targets, observed performance, calculated summaries and recommendations MUST be distinct types and labels. |
| WPR-INV-004 | D | The same valid stored inputs and rule version MUST produce the same schedule, progression and record outcome. Locale, UI order and connectivity cannot change it. |
| WPR-INV-005 | D | An operation acknowledged as saved MUST survive interruption. A failed operation MUST retain the last committed state and return an explicit recoverable error. |
| WPR-INV-006 | C | Users MAY depart from a programme during a session. A session-only departure MUST NOT alter future programme versions without a separate explicit choice. |
| WPR-INV-007 | N | NextSet records and organises training. It does not guarantee fitness results or determine that an exercise, load, volume, schedule or progression is safe or suitable for a person. |

## 2. Programme creation and templates

| ID | Class | Normative rule |
|---|---|---|
| WPR-PGM-001 | D | A programme is publishable only when it has a name, at least one valid workout-template version, one schedule mode and an unambiguous workout order. A primary active enrolment additionally requires one adopted published version and valid schedule state. Detailed invariants are `PM-VAL-001`–`PM-VAL-013`. |
| WPR-PGM-002 | C | A user MAY create a custom programme from blank, duplicate an owned programme, or adopt a product template. |
| WPR-PGM-003 | D | Adopting a template MUST copy a versioned snapshot into a user-owned programme. Later catalogue edits MUST NOT alter the adopted programme. |
| WPR-PGM-004 | V | Product-supplied template content—including exercise selection, targets, ordering and progression rules—requires named fitness-content review before release. The software model being valid does not make content appropriate. |
| WPR-PGM-005 | D | An edit that changes future planned content MUST create a new immutable workout-template version where its content changed and a new programme version. A live programme enrolment adopts it only through an explicit effective occurrence boundary. Editing a reusable standalone template alone does not update a programme until explicitly adopted. Completed workouts and already-started sessions keep their source versions/snapshots. |
| WPR-PGM-006 | C | While editing, advanced options MAY remain unset. The system applies only disclosed product defaults and shows them in preview before publish/adoption. |
| WPR-PGM-007 | D | Saving invalid programme content MUST fail field-by-field without discarding the draft or partially activating it. |
| WPR-PGM-008 | D | A programme enrolment/run completes when its configured terminal condition is met. A repeating enrolment has no implicit completion date. Completion does not delete/archive the reusable programme or history. |
| WPR-PGM-009 | C | At enrolment completion the user MAY start a new enrolment of the same programme, archive the completed run/programme, duplicate the programme or select another. NextSet MUST NOT auto-enrol the user. |

**Example — template adoption.** Catalogue template `tpl-17@v3` contains Full Body A/B/C. Avery adopts it, changes Tuesday to Wednesday, and activates user programme `pgm-91@v1`. When the catalogue later publishes `tpl-17@v4`, Avery remains on `pgm-91@v1`; an optional “template update available” flow may compare changes but cannot apply them silently.

## 3. Scheduling and next-workout selection

### 3.1 Schedule modes

| ID | Class | Normative rule |
|---|---|---|
| WPR-SCH-001 | P | A fixed schedule maps workout occurrences to local calendar dates/weekday recurrence. Its “next” state is the earliest unresolved occurrence at or after the programme cursor, not simply today’s weekday. |
| WPR-SCH-002 | P | A flexible sequence stores an ordered cursor such as A → B → C → repeat. Date passage and rest days MUST NOT advance the cursor. |
| WPR-SCH-003 | D | Exactly one schedule mode is active per programme version. Switching mode requires a preview and new version; completed history remains unchanged. |
| WPR-SCH-004 | D | At most one occurrence is the programme’s expected next workout. Multiple overdue fixed occurrences remain individually resolvable, but Today presents one primary next action plus an exception summary. |
| WPR-SCH-005 | C | A user MAY configure fixed sessions, a repeating flexible sequence, or a finite flexible sequence. The UI MUST explain whether the end repeats, completes or awaits a new plan. |

### 3.2 Miss, skip, move and repeat

| ID | Class | Normative rule |
|---|---|---|
| WPR-SCH-006 | D | Passing a planned fixed date creates a **missed/unresolved** occurrence; it does not equal a skip and does not by itself change completed history. |
| WPR-SCH-007 | D | A flexible sequence has no missed occurrence solely because time passed. A separate optional reminder may become stale, but the cursor remains unchanged. |
| WPR-SCH-008 | C | Resolving a missed fixed occurrence requires one explicit action: do now, move to another date, skip, replace with another planned occurrence, or leave unresolved. |
| WPR-SCH-009 | C | **Skip** marks one planned occurrence intentionally not performed. Before commit, the user chooses the applicable configured behavior: omit it, defer/reinsert it, or—in a flexible sequence—advance the cursor. The default is programme-defined and always disclosed. |
| WPR-SCH-010 | C | **Move/reschedule** changes the planned occurrence date/order while preserving the same occurrence identifier. If it creates a conflict, the user resolves order or date before save. |
| WPR-SCH-011 | C | **Repeat** creates a new occurrence referencing the same workout template/version. It MUST NOT masquerade as the original occurrence or advance the programme cursor unless the user explicitly chooses that effect. |
| WPR-SCH-012 | D | Starting an unscheduled workout defaults to no programme-cursor effect. If the user elects to count it as the expected occurrence, the session must be compatible and the consequence previewed. |
| WPR-SCH-013 | D | A rest/recovery day is a schedule item without workout volume. Completing or passing it is never a failed workout and does not advance a flexible workout cursor. |
| WPR-SCH-014 | D | Calendar intent uses the occurrence’s stored local date and schedule time zone. Absolute event timestamps and captured offsets remain immutable when device time zone changes. |
| WPR-SCH-015 | D | On daylight-saving gaps/overlaps, occurrence identity derives from local date plus recurrence identity, not an assumed 24-hour duration; the system MUST NOT duplicate or omit an occurrence solely due to clock change. |

**Validation example — flexible miss.** Sequence cursor is B on Monday. The user does not open NextSet until Friday. The expected session is still B; no B “miss” or automatic C is created (`WPR-SCH-002`, `WPR-SCH-007`).

**Validation example — fixed conflict.** A moved Tuesday A and a planned Thursday B would both land Thursday. The save flow must ask the user to keep both with explicit order, move one, or cancel. It cannot discard either (`WPR-SCH-010`).

## 4. Active sessions, partial completion and restoration

| ID | Class | Normative rule |
|---|---|---|
| WPR-SES-001 | D | Starting a workout creates one active-session identifier idempotently from the deliberate start action. Duplicate taps/retries cannot create duplicate sessions. |
| WPR-SES-002 | D | Only one authoritative active workout exists per local profile in MVP. Attempting another start presents resume, finish/discard with confirmation, or cancel; it never silently replaces the active session. |
| WPR-SES-003 | D | A session snapshots its source workout template and programme version at start. Later programme edits do not mutate it. |
| WPR-SES-004 | C | Users MAY add, remove, reorder or substitute exercises/sets in an active session. Each deviation stores its scope and reason when provided; no reason is required. |
| WPR-SES-005 | D | Set states are planned, draft or completed. Only completed, valid sets count in performance summaries and progression eligibility. A draft is recoverable input, not observed performance. |
| WPR-SES-006 | C | A workout MAY be completed with planned work unfinished. Each planned item ends as completed, skipped or not attempted; these states are distinct. |
| WPR-SES-007 | C | On partial completion, eligible skipped/not-attempted exercises MAY be carried forward only after preview. The copied work receives new planned identifiers and links to its source; completed sets are never copied as future work. |
| WPR-SES-008 | D | Completing a workout is an idempotent local transaction that freezes the final snapshot, links the occurrence, updates the schedule cursor once, and invalidates/recomputes derived records. |
| WPR-SES-009 | C | Discarding an active workout is destructive and requires explicit confirmation with scope. A recoverable soft-delete window MAY be provided; a discarded session does not advance schedule state. |
| WPR-SES-010 | D | Elapsed workout duration excludes explicitly paused intervals if pause tracking is enabled; wall-clock start/end remain stored. The UI must name which duration it displays. |

### 4.1 Restoration

| ID | Class | Normative rule |
|---|---|---|
| WPR-RES-001 | D | Each acknowledged mutation is committed locally before success feedback. Related changes—set completion plus timer anchor, for example—share one transaction. |
| WPR-RES-002 | D | Restoration loads the latest valid committed revision for the authoritative active-session ID. It must not merge an older snapshot over a newer journal entry. |
| WPR-RES-003 | D | Every valid structured active-workout field change MUST be checkpointed locally without relying on blur/background callbacks. Raw invalid or partially parsed input SHOULD be checkpointed when it can be stored safely. The UI distinguishes restored drafts from completed sets; no draft becomes completed after restart. |
| WPR-RES-004 | D | Rest timers restore from persisted monotonic/wall-clock anchors and configured duration, not a decremented counter. Clock anomalies produce a labelled expired/unknown state without modifying sets. |
| WPR-RES-005 | D | Repeating completion after a crash returns the already-created completed workout and final schedule state; it does not create a duplicate or advance twice. |
| WPR-RES-006 | D | Offline behavior is identical for core domain transitions. Sync/network status cannot disable local start, log, edit, restore or completion. |
| WPR-RES-007 | D | If active data is unreadable, the app quarantines the failing payload, opens the last verified readable revision when available, explains what could not be loaded and offers export/recovery paths. It MUST NOT silently initialise an empty history. |
| WPR-RES-008 | D | Storage exhaustion or transaction failure leaves the prior committed revision authoritative, keeps the attempted input visible when feasible, and blocks a false saved/completed acknowledgement. |

## 5. Sets, exercise modes and rest

The canonical model is in [`set-types.md`](set-types.md). Set role, measurement mode, load mode, laterality, effort intent and exercise grouping are separate dimensions; UI labels must not collapse them into an invalid single enum.

| ID | Class | Normative rule |
|---|---|---|
| WPR-SET-001 | D | A completed set MUST satisfy the validation contract for its exercise measurement mode and set role. See `ST-VAL-001`–`ST-VAL-016`. |
| WPR-SET-002 | P | Planned rep/time targets are inclusive ranges or exact values. An observed value outside target remains valid performance and is labelled outside target; it is not rejected. |
| WPR-SET-003 | C | RPE and RIR are optional subjective observations unless the programme explicitly requires one for a rule. They are never inferred from speed, reps or failure flags in MVP. |
| WPR-SET-004 | D | RPE and RIR must be stored separately with their named scales. The product MUST NOT automatically convert between them as an observed fact. |
| WPR-SET-005 | D | Warm-up sets are stored and shown in history but excluded from working-set volume, progression qualification and working-set PRs unless an explicitly supported rule says otherwise. MVP rules do not. |
| WPR-SET-006 | D | A drop set links to the immediately relevant parent working/drop set within the same exercise performance. Its lower-load relationship is validated only for comparable load modes; manually marked exceptions remain stored but are excluded from drop-specific analytics. |
| WPR-SET-007 | C/N | A failure-intent marker records a programme/user intention or report; it does not certify physiological failure, safety or effort accuracy. Defaults do not encourage failure. |
| WPR-SET-008 | D/P | MVP supersets/circuits are simple non-nested ordered exercise groups, not a measurement or effort type. Users can create, edit and execute them; every child set remains independently valid/persisted. Nested groups, conditional branching and reusable advanced group workflows are post-MVP (`FEAT-POST-010`). |
| WPR-SET-009 | D | Timed, bodyweight, assisted and unilateral performances retain their raw components. NextSet MUST NOT fabricate equivalent external load or bilateral totals for cross-mode comparison. |
| WPR-SET-010 | C | Users MAY edit any observed set value and add a note. Edits trigger all affected deterministic recalculations. |

### 5.1 Rest timer

| ID | Class | Normative rule |
|---|---|---|
| WPR-REST-001 | P/C | Rest duration resolves in order: one-off session override, planned-set/exercise value, workout default, user default, or disabled. The winning source is inspectable. |
| WPR-REST-002 | C | Completing an eligible set MAY auto-start rest when enabled. The user may start, pause, extend, reduce, restart or dismiss it without changing the set record. |
| WPR-REST-003 | D | Starting a new timer replaces the active timer only after deterministic policy: same-session automatic timers replace; a manual timer requires confirmation if replacement would discard meaningful remaining time. |
| WPR-REST-004 | D | Timer display and alerts never block set logging, editing, substitution, navigation or completion. |
| WPR-REST-005 | D | Notification denial changes only external alert delivery. In-app timer state remains available and the denial is explained once without repeated pressure. |
| WPR-REST-006 | D | A timer that expires while the app is closed shows elapsed on restoration; it does not create a set, advance exercise order or infer readiness. |

## 6. Exercise substitution and custom exercises

| ID | Class | Normative rule |
|---|---|---|
| WPR-SUB-001 | C | A user may request substitution for equipment availability, comfort/preference, gym availability, variety or programme variation. A reason is optional and not treated as a diagnosis. |
| WPR-SUB-002 | R | Candidate ranking MAY use curated target-region tags, movement pattern, equipment availability, exercise variation family, programme-authored alternative and exercises already completed. Each contributing factor is shown in plain language. |
| WPR-SUB-003 | D | Exact programme-authored alternatives rank ahead of heuristic catalogue matches when their equipment constraints are satisfied, but the user retains final choice. |
| WPR-SUB-004 | D | Material mismatches—measurement mode, unilateral/bilateral structure, equipment or planned group role—must be disclosed. A candidate with unknown metadata is labelled unknown, not “equivalent.” |
| WPR-SUB-005 | N | “Similar” means metadata similarity for logging/planning; it is not a claim of biomechanical equivalence, safety, rehabilitation suitability or identical training effect. |
| WPR-SUB-006 | C | Substitution scope is current set/exercise performance, current session, or future programme version. The default during a workout is current session only. |
| WPR-SUB-007 | D | The substituted performance receives a new exercise-performance identity and links to the planned exercise. Previous-history hints come from the actual selected exercise/variation, never the replaced exercise unless shown as planned context. |
| WPR-SUB-008 | D | If no candidate passes required metadata filters, the system offers search/custom exercise/skip; it MUST NOT invent a confident substitute. |
| WPR-SUB-009 | C/D | MVP MAY capture explicit available equipment and representable load increments for the current session. The context is stored with the session snapshot, may rank/filter candidates and round a candidate target, and does not create a reusable named gym profile or prove present availability. |

### 6.1 Named gym profiles — POST contract

`WPR-GYM-001`–`WPR-GYM-004` specify `PRD-FR-008`/`FEAT-POST-001` behavior for later implementation. They are not MVP gates. MVP uses the explicit session context in `WPR-SUB-009` and `WPR-PROG-016`.

| ID | Class | Normative POST rule |
|---|---|---|
| WPR-GYM-001 | C | A named gym profile MAY record equipment availability and representable increments. Exact location is not required and MUST NOT be inferred to select a profile. |
| WPR-GYM-002 | D | An explicitly selected named profile filters/ranks candidates and may source load increments only; it never rewrites a programme, invalidates history or proves equipment is currently available. |
| WPR-GYM-003 | C | Users may choose no profile, select/change one for a session, or override any availability value. A session selection does not change the global/default profile unless separately committed. |
| WPR-GYM-004 | D | Editing/archiving a profile affects future selection only. Completed performances retain captured equipment/load context, and missing profile metadata becomes unknown rather than a false match. |

### 6.2 Custom exercises — MVP

| ID | Class | Normative rule |
|---|---|---|
| WPR-CUSTOM-001 | C/D | A custom exercise requires only name, measurement mode, load mode/basis and laterality. Equipment, category, movement and muscle metadata are optional/user-authored; absent fields are stored as unknown, never block otherwise valid logging and suppress confident substitution ranking that depends on them. |
| WPR-CUSTOM-002 | D | A custom exercise may share a display name with another exercise; stable identity and disambiguating metadata prevent history merge. |
| WPR-CUSTOM-003 | D | Editing a custom definition creates a new definition version when interpretation changes. Historical performance retains the old version. |
| WPR-CUSTOM-004 | D | Deleting a custom exercise definition archives it from selection but retains historical references and export data. |

## 7. Short-workout mode and carrying work forward

| ID | Class | Normative rule |
|---|---|---|
| WPR-SHORT-001 | C | The user activates short mode with available minutes or manual “keep” choices. It is never inferred as a punishment for lateness. |
| WPR-SHORT-002 | P | Programme authors/users MAY assign each exercise/group a priority tier, minimum required sets, optional sets and non-splittable group flag. Missing priority defaults to normal, not “unimportant.” |
| WPR-SHORT-003 | D | Deterministic reduction order is: remove explicitly optional sets from lowest priority upward; reduce working sets down to configured minima; remove lowest-priority exercises/groups; never remove completed work. |
| WPR-SHORT-004 | D | A superset/circuit marked non-splittable is kept/reduced as a group. A splittable group explains any member removed. |
| WPR-SHORT-005 | D | Duration is an estimate based on disclosed inputs (planned reps/time, configured rest and overhead model). If inputs are insufficient, the system shows an approximate/unknown state and supports manual selection; it does not promise completion within the chosen time. |
| WPR-SHORT-006 | C | The preview lists kept, reduced and removed work with reasons. The user may restore or override any uncompleted item before applying. |
| WPR-SHORT-007 | D | Short mode creates a session adaptation; the source workout template is unchanged. The completion record preserves both planned and performed work. |
| WPR-SHORT-008 | C | Removed/not-attempted work may be offered for deliberate carry-forward under `WPR-SES-007`; it is not silently appended to the next workout. |

**Validation example.** A workout has priority-1 squat (3 sets, minimum 2), priority-2 row (3, minimum 2) and priority-3 curls (2, minimum 0/optional). Short mode first removes curls, then at tighter limits reduces row to 2, then squat to 2. The preview may not claim the resulting workout is physiologically optimal or guaranteed to fit (`WPR-SHORT-003`, `WPR-SHORT-005`, `SAF-NC-005`).

## 8. Progression and targets

### 8.1 Common contracts

| ID | Class | Normative rule |
|---|---|---|
| WPR-PROG-001 | D | A progression evaluation uses only completed, comparable, eligible working sets tied to one exercise variation and rule version. Warm-ups, invalidated sets and session substitutions from a different variation are excluded. |
| WPR-PROG-002 | D | A recommendation stores input performance IDs, rule ID/version, calculation values, rounding increment, explanation, created time and status. Re-evaluation never rewrites the historical recommendation. |
| WPR-PROG-003 | R/D | Recommendations are candidates. Accepting (or editing then accepting) atomically creates, validates and publishes a new immutable workout-template/programme version and schedules the live enrolment to adopt it at an explicit future not-started occurrence boundary. It never mutates a published version, active session or completed record. Defer/dismiss makes no plan change; retry with the same acceptance command is idempotent. |
| WPR-PROG-004 | C/D | A manual future target override is always allowed within data validation. Committing it creates the same immutable future-version/adoption boundary as acceptance under `WPR-PROG-003`; it is labelled user-authored and may optionally pause recommendations for a chosen scope. A session-only observed deviation changes only the session snapshot, not the programme. |
| WPR-PROG-005 | D | Correcting/deleting a contributing performance atomically invalidates every pending recommendation that cites it and recomputes a separately identified future candidate when still eligible; it never rewrites the old recommendation in place. Accepted historical decisions/versions remain auditable but are not silently reversed. |
| WPR-PROG-006 | D | No recommendation is generated when inputs are missing, non-comparable, outside rule applicability, or conflict with an active manual hold. The UI may explain the reason. |
| WPR-PROG-007 | N | A recommendation states that a configured performance condition was met; it does not promise strength, muscle, health or safety outcomes. |

### 8.2 Supported rules

| ID | Class | Inputs and deterministic candidate outcome |
|---|---|---|
| WPR-PROG-010 Double progression | P/R | For `n` planned working sets at target `[rMin,rMax]`, qualify only when at least `n` comparable sets are completed and the selected qualification policy is met. MVP default policy: all first `n` sets have reps >= `rMax`; if a configured effort ceiling exists, all recorded required effort values must pass it. Candidate load = current planned load + configured increment, rounded once using stored equipment rule; candidate reps reset to `rMin`. |
| WPR-PROG-011 Rep-range progression | P/R | When load stays fixed, candidate rep target increases by configured step until `rMax`, based on configured qualification (all-sets or total-reps). At ceiling, the programme must explicitly say whether to hold or transition to a load rule. |
| WPR-PROG-012 Percentage increase | P/R | Candidate load = reference planned load × (1 + configured percent/100), rounded using `WPR-PROG-016`. Percent, reference and maximum step must be stored; observed load is not silently used unless configured. |
| WPR-PROG-013 Manual progression | C | No automatic candidate is computed. The user chooses the future target with comparable history visible. |
| WPR-PROG-014 RPE/RIR-gated guidance | P/R/V | A deterministic performance gate may include user-entered RPE or RIR, but rule content/thresholds require professional validation. Missing required ratings suppress the recommendation; the app never infers ratings. |
| WPR-PROG-015 Hold/repeat target | P/R | A programme may propose repeating the same target when its declared qualification is not met. This is neutral plan logic, not a judgement or penalty. |
| WPR-PROG-016 Load rounding | D/P | Resolve the smallest representable increment in MVP from explicit current-session exercise/equipment context, then programme/exercise configuration, then user default. A named gym profile may supply the explicitly selected source only POST (`WPR-GYM-*`). Round once using stored policy (`nearest`, `up`, `down`); tie behavior/source are stored. If no increment exists, show the unrounded candidate for confirmation or suppress according to programme rule. |
| WPR-PROG-017 Unexpected decline | R/N | A configurable descriptive trigger MAY note that comparable performance fell beyond a stated threshold across a stated number of sessions. It may offer view history, hold target, lower manually, or dismiss. It MUST NOT diagnose cause, prescribe recovery or automatically reduce the programme. Threshold content requires validation before default release. |
| WPR-PROG-018 Deload concept | P/C/V | A deload is only an explicitly authored programme block or user-created version that changes stated targets/volume. Automatic deload recommendation content is deferred until professional validation; MVP makes no recovery claim. |

**Double-progression fixture.** Programme target: 3 × 8–10 at 50 kg, increment 2.5 kg, all-sets policy. Observed eligible working sets: 10/10/10 at 50 kg. Candidate: 52.5 kg for 3 × 8, with explanation referencing all three sets. If the third set is 9, no increase candidate; configured policy may propose hold. If a fourth unplanned set reaches 10 but a planned first-three set is 9, the all-first-`n` qualification remains false.

**Percentage fixture.** Reference 47.5 kg, +5%, representable increment 2.5 kg, nearest with ties upward. Raw candidate 49.875 kg; stored candidate 50 kg. Explanation displays 47.5 × 1.05 and rounding to available 2.5 kg.

## 9. Personal records and descriptive summaries

| ID | Class | Normative rule |
|---|---|---|
| WPR-PR-001 | D | A record is computed only within a comparison signature: profile, exercise variation/version compatibility, measurement mode, load mode, laterality aggregation policy, unit-normalised values and record-rule version. |
| WPR-PR-002 | D | MVP record types MAY include heaviest comparable external load, most reps at an exact comparable load, best reps within a configured target range, highest comparable exercise volume, highest comparable workout volume and estimated 1RM. Unsupported modalities are omitted rather than forced into a score. |
| WPR-PR-003 | D | Warm-up sets, invalid/soft-deleted sets and incomplete drafts are excluded. Drop/failure-intent sets are included only in record types whose rule explicitly permits them and are labelled in drill-down. |
| WPR-PR-004 | D | Volume equals the record rule's disclosed formula over comparable values. MVP MUST NOT rank bodyweight, assisted and external-load volume together or fabricate body mass when absent. |
| WPR-PR-005 | D/N | Estimated 1RM is a mathematical estimate, labelled **Estimated 1RM**, with formula/version and qualifying rep range. It is not an observed lift, safe attempt suggestion or performance guarantee. |
| WPR-PR-006 | C | Users may reduce/disable celebrations while records continue to calculate. A celebration cannot cover inputs or block the next logging action. |
| WPR-PR-007 | D | When a completed workout is edited/deleted, affected records are recomputed across remaining eligible data. A former record is no longer shown as current but remains explainable through edit history where retained. |
| WPR-PR-008 | D | Ties use deterministic ordering: same record value shares the record; canonical “first achieved” is earliest completion timestamp, then stable performance ID. Later ties may be recognised without claiming a new higher record. |
| WPR-PR-009 | D | A record candidate is not confirmed until the completion transaction succeeds. Offline confirmation is valid because the local store is authoritative for MVP. |
| WPR-PR-010 | N | Consistency milestones describe recorded sessions within a declared interval. They do not judge training quality, health or adherence morality and do not punish breaks. |

## 10. Editing completed sessions, notes and deletion

| ID | Class | Normative rule |
|---|---|---|
| WPR-EDIT-001 | C | Users may edit set values, exercise identity (through explicit remap), notes, timestamps within allowed chronology, and completion states on a completed workout. |
| WPR-EDIT-002 | D | An edit creates an audit event with entity ID, prior revision reference, changed fields, edit timestamp and optional user reason. Free-text old/new values are protected like current notes. |
| WPR-EDIT-003 | D | Workout start must not be after end; set completion timestamps must remain within the session or be explicitly marked unknown/imported. Invalid chronology cannot be committed. |
| WPR-EDIT-004 | D | Each edit transaction recomputes or invalidates duration, volume, PRs, charts and pending progression recommendations atomically. No derived result may remain knowingly stale without a visible recalculating/error state. |
| WPR-EDIT-005 | D | Editing an occurrence-linked completed workout does not rewind/advance the current programme cursor automatically. Any schedule correction is a separate explicit operation. |
| WPR-NOTE-001 | C | Notes can be scoped to programme version, workout template, planned exercise, active/completed workout or exercise performance. The UI names the scope before save. |
| WPR-NOTE-002 | D | Notes are user data included in full export and scoped deletion. They are excluded from telemetry, recommendation inputs and share cards by default. |
| WPR-NOTE-003 | N | Free text is not interpreted as a diagnosis, readiness signal or instruction by MVP domain logic. |

## 11. Safety and claims integration

The complete boundary is [`safety-boundaries.md`](safety-boundaries.md). The following rules are non-negotiable integrations:

| ID | Class | Normative rule |
|---|---|---|
| WPR-SAFE-001 | N | Storage validation limits are technical bounds, not “safe” training limits. UI errors say values are unsupported/likely mistyped, not unsafe. |
| WPR-SAFE-002 | N | NextSet does not diagnose pain, injury, fatigue, recovery, overtraining or readiness. It may record a user reason and show neutral control options. |
| WPR-SAFE-003 | V | Product-authored programmes, technique instructions, default progression thresholds and any RPE/RIR/deload defaults require documented professional content validation. |
| WPR-SAFE-004 | N | The app does not guarantee strength, hypertrophy, weight, health or appearance outcomes. Trends describe stored data and known calculation limits. |
| WPR-SAFE-005 | D/N | No celebration, streak or recommendation rewards maximal volume, training through discomfort, failure frequency or skipping rest. |
| WPR-SAFE-006 | F/V | Health-context personalisation, rehabilitation, return-to-training, pregnancy, disease/medication effects and injury-specific substitutions are outside MVP and require an explicitly approved professional product process. |

## 12. Conflict order and failure policy

When valid instructions conflict, resolve in this order:

1. Data integrity and explicit safety/no-claim boundary (`WPR-INV-*`, `WPR-RES-*`, `SAF-*`).
2. The user's current explicit action and scope.
3. The primary programme enrolment's adopted version and declared rule.
4. The user's saved global preference.
5. A disclosed product default.
6. Optional recommendation ranking.

No lower item may silently override a higher one. If two rules at the same level cannot be reconciled, preserve committed data, make no mutation and ask the user to resolve the specific conflict.

## 13. Implementation and review gate

A workout-domain feature is implementation-ready only when it has:

- stable IDs and state transitions in this rulebook or a linked normative specification;
- inputs, output, eligibility, scope, provenance and failure outcome;
- relevant `EC-*` catalogue cases and `TS-*` Given/When/Then scenarios;
- accessibility and offline behavior;
- explicit classification (`D/P/C/R/F/V/N`);
- safety/claim language review where it exposes content;
- no unresolved decision that changes persisted meaning.

Visual prototypes may demonstrate these rules but do not supersede them or constitute production validation.
