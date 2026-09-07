# Domain test scenarios

Status: implementation-ready acceptance catalogue  
Last updated: 2026-08-06

## Logging-first applicability — 2026-09-07

The owner-approved scope in [D-009](../project/decision-log.md) and the [current PRD](../product/product-requirements.md) takes precedence over the earlier broad foundation contract below. Blank workouts, repeats and standalone reusable routines require no goal, programme, enrolment, planned occurrence or schedule. Scheduling/sequence automation, carry-forward, ranked substitution recommendations, short-workout adaptation and progression suggestions are deferred; retained rules describe future contracts, not first-release obligations. Core set integrity, comparable descriptive records, editing, offline restoration and data ownership remain required. The current web prototype demonstrates interaction only, with memory that resets on reload; production durability gates remain future work.


## 1. Test contract

These scenarios are technology-independent and must be converted into automated domain tests. Scenarios labelled **transaction** require a real local persistence integration test with failure injection in addition to a pure-domain test. Scenarios labelled **interaction** also require UI/accessibility evidence. Exact persisted values, stable IDs, revisions, provenance and error codes must be asserted—not only visible copy.

Shared fixture unless overridden:

- local profile `P1`, units kg, no network;
- programme `PG1@v1` with flexible sequence A → B → C → repeat, cursor B;
- workout B contains squat 3 × 8–10 at 50 kg, increment 2.5 kg; row 3 is normal priority, minimum two working sets;
- deterministic double progression uses first three eligible planned working sets, all at upper bound;
- active-session mutations start at revision 10;
- times use IANA zone `Australia/Sydney` and fixed test clock;
- IDs and decimals are generated/injected deterministically.

Every failure assertion includes: prior committed state unchanged, attempted draft preserved where feasible, explicit stable error code/path, no false success feedback, no schedule/record/recommendation side effect.

## 2. Programme and versions

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-PGM-001 / unit | Draft programme name is spaces and one workout is empty | Validate/activate | Return `PM-VAL-001` and child-path `PM-VAL-006`; retain draft; create no effective version |
| TS-PGM-002 / unit | Imported version repeats an order key and references a foreign child | Validate import | Reject/quarantine only import with `PM-VAL-003`; active programme graph is byte/logically unchanged |
| TS-PGM-003 / transaction | v1 workout is active and user edits to v2 | Activate v2 at first not-started occurrence | Active snapshot/source stays v1; valid future boundary points to v2; boundary before active occurrence is rejected |
| TS-PGM-004 / unit | User adopted catalogue `T@3` into `PG@1` | Catalogue publishes `T@4` | `PG@1` content/hash and occurrences remain unchanged; provenance still `T@3` |
| TS-PGM-005 / transaction | v2 effective, v3 draft/scheduled | User cancels v3 | v2 remains effective; v3 is cancelled; no occurrence orphan/reference to v3 |
| TS-PGM-006 / unit | Finite sequence cursor completes its last occurrence | Apply completion transition | Programme returns `completed`; no new occurrence; actions repeat/archive/select are available data outcomes, not auto-run |
| TS-PGM-007 / unit+interaction | Four exercises are available in a workout draft | Create/edit a two-exercise superset, execute independent child sets, then attempt to nest it in a circuit | Simple group/member order/round/rest save and execute; child identities remain independent; nested attempt returns `PM-VAL-009` without discarding the valid simple group or exercises |

## 3. Scheduling and calendar

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-SCH-001 / unit | Flexible cursor B last opened Monday | Clock advances to Friday | Selector still returns B; creates no missed event; cursor revision unchanged |
| TS-SCH-002 / unit | Fixed B planned Thursday | Friday arrives without start/skip/move | Same occurrence becomes `missed`; no completion/skip; resolution choices are enumerated |
| TS-SCH-003 / unit | Fixed A/B/C occurrences overdue on distinct dates | Select Today state | Earliest unresolved occurrence is primary; other count/order deterministic; none removed |
| TS-SCH-004 / interaction | Moving A to Thursday conflicts with B | User attempts save | Preview requires keep-both-with-order, move one or cancel; no mutation until selection |
| TS-SCH-005 / unit | Flexible B has `skipDefault=askEveryTime` | User chooses `defer` | B-derived new occurrence remains before C per stored semantics; cursor/result matches choice; no implicit omit/advance |
| TS-SCH-006 / unit | Flexible cursor B | Complete unscheduled repeat of A with `counts=false` | New repeat links A; B remains next; sequence revision does not advance |
| TS-SCH-007 / transaction | Flexible B expected; ad-hoc snapshot is compatible B | Complete once with `countAsExpected=false`, once in isolated fixture with true | False leaves cursor B; true resolves occurrence/advances C exactly once after previewed choice |
| TS-SCH-008 / unit | Today contains rest-day occurrence and flexible cursor B | Resolve Today | Rest context is non-startable/non-failure; selector still returns B as next workout |
| TS-SCH-009 / interaction | Fixed programme has overdue A and future B | Switch to flexible | Cannot activate until A is explicitly mapped/resolved; completed history unchanged; new version records choice |
| TS-SCH-010 / transaction | Completion token `K1` already moved B→C | Retry `K1` after simulated crash | Return existing completion and C; no second cursor revision/occurrence |
| TS-SCH-011 / transaction | Two commands use schedule revision 7 | Commit skip, then commit stale move | Skip commits revision 8; move returns conflict and preserves its draft; no mixed resolution |
| TS-SCH-012 / interaction | B completes with one exercise not attempted | User selects count sequence in partial-completion preview | Completion is `completedPartial`; cursor advances once; missing work remains explicit and is not copied unless separately selected |
| TS-TIME-001 / unit | Fixed Monday occurrence authored in Sydney; device changes to Los Angeles | Render/select before completion | Identity and Sydney local date remain; absolute events unaffected; zone difference is display context only |
| TS-TIME-002 / unit | Fixed local recurrence falls in spring DST gap | Generate occurrence projection twice | Exactly one stable occurrence ID; documented calendar resolution; no omission/duplication |
| TS-TIME-003 / unit | Fixed local recurrence falls in autumn repeated hour | Generate occurrence projection twice | Exactly one recurrence identity; absolute resolved instant/offset unambiguous and stable |

## 4. Active sessions and restoration

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-SES-001 / transaction | No active session | Deliver same start idempotency key twice | One active ID/snapshot/revision; both calls return it |
| TS-SES-002 / interaction | Active B exists with saved set | Attempt to start C | No C is created until user resolves resume/finish/discard; cancel leaves B exact |
| TS-SES-003 / unit | Active workout source is `PG@v1` | `PG@v2` becomes effective | Active content and rule refs remain v1; future occurrence uses v2 |
| TS-SES-004 / unit | Active session exercise/set order exists | Add unplanned set and reorder exercise | New stable ID/order keys; source template unchanged; deviation scope=session |
| TS-SES-005 / unit | Planned set remains a valid draft | Compute summaries | Draft excluded from completion, volume, PR and progression |
| TS-SES-006 / transaction | Circuit has 9 planned sets; 5 completed | Finish partial, mark 2 skipped/2 not attempted | Persist all states; no fabricated sets; completion atomic; group rounds remain partial |
| TS-SES-007 / transaction | Partial completion selects two carry-forward items | Retry completion/carry command | Exactly two new planned IDs with source links; retry returns same IDs; no completed set copied |
| TS-SES-008 / interaction | Exercise is in non-splittable superset | Drag outside group | Require explicit ungroup-for-session; confirm changes session only; cancel restores exact order/group |
| TS-SES-009 / interaction | Active session has saved work | Choose discard | Confirmation states scope/recovery; confirm cancels session without cursor advance; cancel retains session |
| TS-SES-010 / interaction | Empty unscheduled active workout | Finish | Require empty-completion confirmation/note or discard; completion produces no PR/progression/cursor effect |
| TS-RES-001 / transaction | Active revision 10 | Commit set to revision 11, show success, force terminate | Restore revision 11 with completed set and matching timer anchor |
| TS-RES-002 / transaction | Invalid rep text is checkpointed draft at revision 11 | Force terminate/reopen | Restore text as draft/error; no observed set, volume or progression input |
| TS-RES-003 / transaction | Active revision exists; network absent; process/device restart simulated | Reopen, edit set, complete workout | Restore latest revision and allow edit/completion offline with correct schedule/records |
| TS-RES-004 / transaction | Latest snapshot corrupt, valid journal revision 14 exists | Restore | Quarantine snapshot; restore revision 14; return recovery notice and no empty reset |
| TS-RES-005 / transaction | Rest timer anchor stored, wall clock jumps | Restore timer | Show computed elapsed/unknown per anomaly policy; do not mutate completed sets |

## 5. Local data, migrations, export and delete

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-DATA-001 / transaction | Store has space for no further page/write | Complete valid set | Commit fails; revision/derived data unchanged; draft remains; no saved/timer success |
| TS-DATA-002 / transaction | Active session final snapshot ready; fault injected during completion | Complete then retry after space restored | First leaves active authoritative/no partial cursor advance; retry creates one completion and one advance |
| TS-DATA-003 / transaction | Valid schema v4 database | v5 migration fails before commit | Full rollback to readable v4/recovery mode; no empty initialise; quarantine/report available |
| TS-DATA-004 / transaction | Snapshot checksum invalid, journal valid | Load active | Restore latest verified journal, quarantine invalid bytes, disclose recovery revision |
| TS-DATA-005 / transaction | All active records corrupt, completed history valid | Launch | History stays readable; no fabricated active state; scoped diagnostic export/recovery offered |
| TS-DATA-006 / unit+transaction | Import contains unknown set enum/version | Import | Unsupported entity quarantined/reported with raw payload; existing entities untouched; no reinterpretation |
| TS-DATA-007 / transaction | Export target fails mid-write | Export | No success state; partial temp file removed/reported per platform; source data exact |
| TS-DATA-008 / transaction | Completion transaction holds aggregate lock | Request scoped delete | Serialize or return retryable conflict; never a mixture of deleted profile and completed session |
| TS-DATA-009 / interaction | Local-only profile has no remote account | Open deletion | Show “delete local data,” not account claim; selected scope exact; optional export non-blocking |
| TS-DATA-010 / transaction | Two set edits start at revision 20 | Commit edit A then stale edit B | A becomes 21; B conflicts with its draft preserved; no last-write-wins loss |

## 6. Set semantics and units

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-SET-001 / unit | Rep set has 0 reps | Save as explicit attempted/no-rep | Valid completed observation with flag; excluded from positive PR/progression qualification |
| TS-SET-002 / parameterised unit | Numeric input is `-1`, NaN, infinity or overflow | Validate | Stable field error; cannot complete; no coercion/clamping |
| TS-SET-003 / unit | Duration-only definition | Submit reps/external load fields | Return mode/load errors; retain entered draft; ignore nothing silently |
| TS-SET-004 / interaction | Planned/previous values are prefilled | User leaves without completion | Remain visual draft/reference; no observed set or saved event |
| TS-SET-005 / unit | Target is 8..10, observed 7 then 11 | Complete each in isolated fixture | Both valid; labelled below/above; only rule qualification differs |
| TS-SET-006 / parameterised unit | RPE=8.3 or RIR=10.5 | Validate | Exact supported-step/integer errors; other valid fields remain |
| TS-SET-007 / unit | An approved UI/import deliberately supplies RPE 8 and RIR 2 | Complete | Domain model preserves both values/provenance; no auto-conversion/conflict correction. This does not decide whether MVP UI exposes simultaneous entry |
| TS-SET-008 / interaction | Unilateral-separate set has left=10, right empty | Complete | Require `partialSide` or right value; never copy; partial stores explicit missing side |
| TS-SET-009 / unit | Bodyweight pull-up has reps 8, added load 10 kg, no body mass | Summarise | Preserve +10 kg and reps; total effective load/volume remains unknown |
| TS-SET-010 / unit | Assisted pull-up has assistance -25 kg | Validate | Reject negative; do not reinterpret as external load |
| TS-SET-011 / unit | Warm-up at 100 kg, working at 90 kg | Compute working PR/progression | Warm-up visible but excluded; working 90 is eligible candidate |
| TS-SET-012 / unit | Two exercise IDs both display “Row” | Query comparable history | Separate histories unless explicit compatibility mapping/version; name has no merge effect |
| TS-SET-013 / unit | Imported valid set lacks timestamp | Import | Store `timestampUnknown` provenance and import order; invent no instant |
| TS-SET-014 / parameterised unit | Drop parent missing/cross-exercise/cycle/equal-or-higher load | Validate | Invalid link cases reject; load exception requires explicit flag and is excluded from drop analysis |
| TS-UNIT-001 / unit | 100 lb entered, then display changed to kg and back | Round trip/compare | Original 100 lb retained; canonical exact value stable; no new/double PR from display rounding |
| TS-UNIT-002 / interaction | Locale/decimal text is ambiguous | Parse and attempt complete | Preserve raw text with field guidance; no guessed quantity |
| TS-UNIT-003 / interaction | Existing load basis total; user selects per-side | Commit basis change | Require explicit confirmation; new signature; historical value untouched/not multiplied |

## 7. Rest timer and groups

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-REST-001 / interaction | Notification permission denied | Complete set with auto-rest | Set saves, in-app timer starts, one neutral permission explanation; all controls work |
| TS-REST-002 / unit+interaction | 40 seconds remain on same-session timer | Complete next eligible set | New configured timer replaces per policy; logging never blocked; old anchor retained only in audit if required |
| TS-REST-003 / transaction | Timer has anchor/duration; app closes | Reopen after expiry | Timer shows expired/elapsed; no exercise/set/sequence change |
| TS-REST-004 / unit | Wall and monotonic anchors disagree beyond policy | Restore | Return labelled unknown/expired state; never negative timer; sets exact |
| TS-REST-005 / interaction | User editing a set when timer expires | Deliver expiry | Non-blocking accessible announcement; draft/focus/modal preserved |

## 8. Substitution and custom exercises

`TS-SUB-001`–`TS-SUB-005` and `TS-CUSTOM-*` are MVP gates using explicit current-session equipment context. `TS-SUB-006` is POST contract coverage for named gym profiles and MUST NOT block MVP release.

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-SUB-001 / unit+interaction | No candidate satisfies required equipment metadata | Request substitution | No “equivalent” claim; show mismatches/unknown and search/custom/skip |
| TS-SUB-002 / interaction | Replacement uses timed unilateral mode vs planned rep bilateral | Choose replacement | Disclose mismatch; create correct blank target/schema; do not copy invalid reps/load |
| TS-SUB-003 / transaction | Active-session default scope | Substitute and leave future toggle untouched | Only session snapshot changes; programme version/content hash exact |
| TS-SUB-004 / unit | Planned exercise has history; substitute has none | Render previous comparison | Substitute previous is empty; replaced values may appear only as labelled planned context |
| TS-SUB-005 / unit | Explicit session context marks authored alternative equipment unavailable; heuristic candidate is available | Rank | Eligible heuristic ranks with explained match; authored option shows mismatch; user may choose either; no named profile is read/written |
| TS-SUB-006 / **POST contract transaction** | Active session captured named gym profile G1; G1 is later archived/equipment edited | Resume and request substitution | Existing session/performance context remains; unavailable profile metadata is unknown; no history/programme mutation; user can choose another profile or override for session |
| TS-CUSTOM-001 / unit | Built-in and custom exercise share normalised name | Create custom | Allow distinct ID; picker disambiguates; histories separate |
| TS-CUSTOM-002 / transaction | Custom definition v1 is reps; user changes to duration | Save | Create v2; v1 performances stay reps/comparable only to v1-compatible definitions |
| TS-CUSTOM-003 / transaction | Custom exercise used in history and future plan | Delete/archive | Hide from new picker; preserve history/export; future plan becomes explicitly unresolved, not erased |
| TS-CUSTOM-004 / unit | Custom exercise supplies only required name + measurement/load/laterality fields | Rank/log | Logging is valid; omitted equipment/category/movement/muscle factors are unknown, suppress dependent confident ranking and produce no similarity claim |

## 9. Short mode and carry-forward

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-SHORT-001 / unit+interaction | Time budget lower than all configured minima estimate | Generate preview | Show smallest deterministic subset or no-fit/manual choice; label estimate/unknown; make no guarantee |
| TS-SHORT-002 / unit | Exercise priority absent in imported compatible draft | Normalise | Assign disclosed default normal priority 3; not lowest/optional |
| TS-SHORT-003 / unit | Low-priority set completed before short mode; group non-splittable | Reduce | Completed set remains; uncompleted reductions respect group/minima and disclose all changes |
| TS-SHORT-004 / interaction | Every remaining set is at required minimum | Reduce further | Return no automatic reduction; user can manual override or finish partial; source unchanged |
| TS-SHORT-005 / interaction+transaction | Carry-forward duplicates same exercise next session | Preview and choose keep separate | New source-linked planned item remains separate; no performance/target merge; alternate choices deterministic |

## 10. Progression recommendations

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-PROG-001 / unit | 3×8–10 planned; only two working sets are 10 | Evaluate all-sets double progression | No increase; reason `insufficientQualifyingSets`; no plan mutation |
| TS-PROG-002 / unit | First planned sets are 10,9,10 and fourth unplanned is 10 | Evaluate first-three policy | Qualification false; fourth cannot replace second; hold/no candidate per rule |
| TS-PROG-003 / unit | RIR-gated rule requires RIR; set ratings absent | Evaluate | Suppress with `missingRequiredRIR`; never infer from reps/failure |
| TS-PROG-004 / unit | One set belongs to another exercise variation/equipment signature | Evaluate | Exclude it; if required count unmet suppress and list comparison limitation |
| TS-PROG-005 / transaction | Pending candidate cites set S1 | Edit S1 below threshold | Old recommendation status becomes invalidated; no silent rewrite; new hold/candidate created only if current rule qualifies |
| TS-PROG-006 / parameterised unit | 47.5 kg ×1.05 raw=49.875; increment=2.5; policies nearest/up/down | Evaluate | Return 50/50/47.5 respectively with raw value, policy, increment and one rounding operation |
| TS-PROG-007 / transaction | Pending increase exists on programme v2 | User selects manual hold and pauses exercise recommendations | New immutable v3 carries the same target labelled user-authored from the selected future boundary; v2 is exact; pending status records override; later evaluations are suppressed in scope |
| TS-PROG-008 / unit | Historical recommendation uses rule v1; effective plan uses v2 | Query/evaluate | Historical object unchanged/reproducible under v1; new candidate separately cites v2 |
| TS-PROG-009 / unit | Rep target is at max and rule says hold with no load transition | Evaluate | Candidate is hold or none per stored rule; no invented weight increase |
| TS-PROG-010 / transaction | Pending recommendation R cites programme v2 and acceptance command K | Accept K twice | Exactly one new immutable changed workout-template version and programme v3 are published; enrolment adopts v3 at the first selected not-started occurrence; v2, active session and history hashes remain exact; retry returns the same result |

## 11. Records, edits and notes

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-PR-001 / unit | Warm-up is heaviest, working set lower | Compute heaviest working-load PR | Exclude warm-up; select working set; history still lists both |
| TS-PR-002 / unit | Bodyweight and external-load definitions share name | Compute records | Separate/omit incompatible types; no universal load record |
| TS-PR-003 / unit | Two eligible sets tie exact value | Compute record | Both share value; earliest completion then stable ID is first-achieved; later is tie, not higher PR |
| TS-PR-004 / transaction | Current PR set is edited lower/deleted | Commit edit | Recompute to next eligible value in same transaction; charts/pending recommendations update/invalidate |
| TS-PR-005 / unit+interaction | No approved e1RM formula/version | Request progress view | No number; show unavailable/insufficient rule state, not estimate |
| TS-PR-006 / transaction | Eligible PR completed offline | Complete, then simulate future sync retry | Local completion confirms one PR; retry cannot duplicate/renumber it |
| TS-PR-007 / unit | Assisted set has 25 kg assistance | Compute heaviest-load PR | Exclude from external heaviest; no negative/combined load; only approved assisted metric may appear |
| TS-PR-008 / unit | External-load volumes have incompatible basis/unknown multiplier | Aggregate workout | Sum only explicitly comparable/convertible sets; disclose excluded/unknown values |
| TS-EDIT-001 / transaction | Completed set feeds PR/recommendation | Delete set | Create edit event; atomically recompute PR and invalidate recommendation; history remains auditable |
| TS-EDIT-002 / interaction | Remap completed reps exercise to duration definition | Confirm edit | Block direct reinterpretation; require explicit rewrite preview/new fields; cancel preserves original |
| TS-EDIT-003 / unit | Edited start occurs after end or set time outside session without import flag | Validate | Reject chronology/path; original completion unchanged |
| TS-EDIT-004 / transaction | Completed old occurrence is edited | Commit valid value edit | Derived history updates; current programme cursor/revision unchanged |
| TS-EDIT-005 / transaction | Derived recalculation fault injected | Commit edit | Atomic rollback or explicit pending strategy keeps one coherent revision; never edited set with stale current PR |
| TS-NOTE-001 / interaction+transaction | Note editor opened from exercise during active session | Change scope to programme then save | Scope label/confirmation visible; note stored only selected scope; excluded from telemetry/recommendations |

## 12. Safety and claim tests

| ID / level | Given | When | Then |
|---|---|---|---|
| TS-SAFE-001 / interaction+content | User chooses substitution reason “uncomfortable” | Show candidates | Copy is neutral metadata match/mismatch; no diagnosis, treatment or “safe” claim; skip/search available |
| TS-SAFE-002 / unit+content | Validated descriptive decline trigger fires | Render output | Show exact comparable values and hold/edit/history/dismiss; no cause, readiness or automatic deload |
| TS-SAFE-003 / privacy | Note contains pain/health language | Save and inspect domain events/telemetry/recommendations/export | Note stored/exported privately; absent from analytics/recommendation inputs; no interpretation |
| TS-SAFE-004 / content+unit | Product template review status is missing/expired/rejected | List/adopt | Cannot present/adopt as reviewed current template; previously adopted snapshots/history remain usable and provenance visible |
| TS-SAFE-005 / static content gate | Recommendation resource contains `safe`, `optimal`, guarantee or readiness language | Run claim lint + human review | Release gate fails unless phrase is a clearly bounded UI context unrelated to training claim and approved; no silent waiver |
| TS-SAFE-006 / product review | Achievement rule rewards maximal volume, failure frequency or no rest | Evaluate catalogue | Rule rejected/disabled; no user-facing celebration or notification |
| TS-SAFE-007 / static content+interaction | Missed-workout notification variants exist | Review/render | No guilt, fear, urgency or punitive streak copy; notification is optional and neutral |

## 13. Journey-facing quality scenarios

These are end-to-end acceptance targets in addition to domain tests:

| ID | Scenario | Required evidence |
|---|---|---|
| TS-JNY-001 | Expected workout is understood and started | From Today, user identifies next/focus/unfinished state and starts with one deliberate action; `PRD-SM-001`, `PRD-SM-002` |
| TS-JNY-002 | Normal set is logged and corrected | Valid populated set completes in one action; newest set edit is one action away; saved feedback precedes termination test; `PRD-SM-003`, `PRD-SM-004` |
| TS-JNY-003 | Timer never takes over | While running/expiring, user logs, edits, substitutes and finishes; screen-reader announcement does not steal destructive focus |
| TS-JNY-004 | Offline workout survives interruption | With network disabled, start/log/kill/reopen/edit/complete/export all succeed with exact state |
| TS-JNY-005 | Schedule exception is predictable | For miss, skip, move, repeat and ad-hoc cases, user predicts next workout before and after commit; domain result matches |
| TS-JNY-006 | Larger text and reduced motion | All critical journeys at required system text sizes and reduced motion retain labels/actions/order with no content/action loss |
| TS-JNY-007 | Corrupt data recovery | Fixture corruption shows explicit recovery state, preserves valid data and offers safe next actions; never empty-reset illusion |

## 14. Automation requirements

- Use table-driven tests for every rule permutation (schedule mode, set dimension, rounding policy, unit, laterality and recommendation status).
- Freeze time/time zone and inject identifiers; no scenario depends on the real clock, locale or network.
- Property tests SHOULD assert idempotency, stable ordering, non-negative/finite canonical quantities, version immutability and serialize/deserialize round trips.
- Failure injection MUST cover each local transaction boundary before, during and after commit.
- Export fixtures MUST be schema validated and round-tripped by an independent reader.
- Accessibility/end-to-end scenarios MUST test screen-reader semantics, keyboard/switch paths where supported, larger text and reduced motion—not screenshots alone.
- A failing expectation requires a rule/decision update or implementation fix; tests may not be weakened solely to make a build pass.
