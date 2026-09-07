# Workout-domain edge-case catalogue

Status: proposed normative catalogue  
Last updated: 2026-08-06

## 1. Use

Each case identifies a condition future implementation and design must handle. **Expected outcome** is normative; **recovery** is the user-visible path. A case is not covered merely because the app does not crash—state, feedback, offline behavior and derived-data correctness must match. Test IDs refer to [`domain-test-scenarios.md`](domain-test-scenarios.md).

## 2. Programme and versioning

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-PGM-001 | Blank/whitespace programme name | Draft retained; exact field error; cannot activate | `PM-VAL-001` | `TS-PGM-001` |
| EC-PGM-002 | Programme has no workout or workout has no exercise/set | Draft retained with path-specific errors; no partial activation | `PM-VAL-002`, `PM-VAL-006` | `TS-PGM-001` |
| EC-PGM-003 | Duplicate child/order IDs after import | Quarantine/reject conflicting import; original active programme unchanged; report paths | `PM-VAL-003`, `PM-VAL-009` | `TS-PGM-002` |
| EC-PGM-004 | Active programme edited while its workout is active | Active session keeps source snapshot; new version starts at chosen future boundary | `PM-VER-002`, `PM-VER-003` | `TS-PGM-003` |
| EC-PGM-005 | Catalogue template updates after adoption | Owned programme is unchanged; optional compare flow only | `PM-VER-005`, `WPR-PGM-003` | `TS-PGM-004` |
| EC-PGM-006 | User cancels draft v3 after preview | v2 remains effective; no future occurrence points at v3 | `PM-VER-002`, `PM-VER-004` | `TS-PGM-005` |
| EC-PGM-007 | Effective boundary chosen before a started occurrence | Validation blocks boundary and proposes first not-started occurrence | `PM-VAL-012` | `TS-PGM-003` |
| EC-PGM-008 | Workout name differs only by case/spacing | Draft asks for a distinguishable name; IDs remain separate | `PM-ENT-003`, `PM-VAL-003` | `TS-PGM-001` |
| EC-PGM-009 | Programme reaches finite sequence end | State is complete; no implicit repeat; show repeat/archive/choose options | `WPR-PGM-008`, `WPR-PGM-009` | `TS-PGM-006` |
| EC-PGM-010 | Product template lacks/loses content review | It cannot be newly adopted as reviewed content; prior adopted snapshot/history remains | `WPR-PGM-004`, `SAF-PRO-001` | `TS-SAFE-004` |
| EC-PGM-011 | MVP author attempts a nested/overlapping group | Reject only the invalid grouping with `PM-VAL-009`; preserve exercises/sets/order and explain one-level membership; simple group save remains available | `WPR-SET-008`, `PM-GRP-006` | `TS-PGM-007` |

## 3. Scheduling, calendar and sequence

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-SCH-001 | Flexible user returns after several days | Cursor unchanged; no automatic misses; next workout remains same | `WPR-SCH-002`, `WPR-SCH-007` | `TS-SCH-001` |
| EC-SCH-002 | Fixed date passes without completion | One unresolved missed occurrence; user chooses resolution | `WPR-SCH-006`, `WPR-SCH-008` | `TS-SCH-002` |
| EC-SCH-003 | Several fixed occurrences are overdue | Earliest unresolved is primary; count/list others; none silently dropped | `WPR-SCH-004`, `PM-SCH-003` | `TS-SCH-003` |
| EC-SCH-004 | Move creates same-date conflict | Save pauses for explicit ordering/move/cancel choice | `WPR-SCH-010` | `TS-SCH-004` |
| EC-SCH-005 | Skip flexible workout with `askEveryTime` | Preview advance/defer/omit semantics; commit selected outcome only | `WPR-SCH-009` | `TS-SCH-005` |
| EC-SCH-006 | Repeat earlier workout while another is expected | New repeat occurrence; cursor unchanged by default | `WPR-SCH-011` | `TS-SCH-006` |
| EC-SCH-007 | Ad-hoc workout resembles expected workout | Default does not advance; explicit compatible “count as expected” may | `WPR-SCH-012` | `TS-SCH-007` |
| EC-SCH-008 | Rest day in flexible sequence reminder | Show neutral rest context; do not advance cursor or mark failure | `WPR-SCH-013` | `TS-SCH-008` |
| EC-SCH-009 | Switch fixed to flexible with overdue work | Preview requires explicit resolution/mapping; new version only; history unchanged | `WPR-SCH-003`, `PM-VER-003` | `TS-SCH-009` |
| EC-SCH-010 | Completion retry after schedule already advanced | Idempotent return; no second advance or occurrence | `PM-SCH-004`, `WPR-RES-005` | `TS-SCH-010` |
| EC-SCH-011 | Two rapid resolution actions from stale screens | Revision conflict; first committed result authoritative; second refreshes and asks again if still relevant | `PM-ENT-008`, `WPR-INV-005` | `TS-SCH-011` |
| EC-SCH-012 | Partial workout counted for flexible sequence | Completion preview states whether it counts; default follows programme setting; advances at most once | `WPR-SES-006`, `PM-SCH-004` | `TS-SCH-012` |

## 4. Time zones and clock changes

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-TIME-001 | Device crosses time zone before planned date | Occurrence retains schedule-local intent; Today shows date/zone context when different | `WPR-SCH-014` | `TS-TIME-001` |
| EC-TIME-002 | DST spring gap includes planned local time | One occurrence remains; apply documented platform calendar resolution; no omission/duplicate | `WPR-SCH-015` | `TS-TIME-002` |
| EC-TIME-003 | DST fall overlap repeats local time | One recurrence identity/occurrence only; absolute event timestamps disambiguate | `WPR-SCH-015` | `TS-TIME-003` |
| EC-TIME-004 | User manually moves device clock during rest | Timer derives from anchors; if inconsistent, show expired/unknown without touching set | `WPR-RES-004` | `TS-REST-004` |
| EC-TIME-005 | Completed workout edited across midnight/zone | Preserve absolute timestamps and captured offsets; validate start <= end; history labels local view context | `WPR-EDIT-003` | `TS-EDIT-003` |

## 5. Active session and restoration

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-SES-001 | Double-tap Start / retry after slow feedback | One active-session ID, one snapshot | `WPR-SES-001` | `TS-SES-001` |
| EC-SES-002 | Start while another active session exists | Resume/finish/discard/cancel decision; no silent replacement | `WPR-SES-002` | `TS-SES-002` |
| EC-SES-003 | App terminates immediately after saved set feedback | Restored active session contains that completed set | `WPR-RES-001`, `WPR-RES-002` | `TS-RES-001` |
| EC-SES-004 | App terminates while input is an invalid draft | Restore as visibly uncompleted draft where checkpointed; do not count | `WPR-RES-003`, `WPR-SES-005` | `TS-RES-002` |
| EC-SES-005 | Device restarts offline during workout | Restore exact latest committed state; all core actions remain usable | `WPR-RES-002`, `WPR-RES-006` | `TS-RES-003` |
| EC-SES-006 | Finish with exercises/sets incomplete | Explicit completed/skipped/not-attempted states; neutral partial completion | `WPR-SES-006` | `TS-SES-006` |
| EC-SES-007 | Carry-forward chosen twice due retry | Idempotent derived occurrences; no duplicate future work | `WPR-SES-007`, `WPR-RES-005` | `TS-SES-007` |
| EC-SES-008 | Reorder exercise out of non-splittable group | Require explicit ungroup/session deviation confirmation; future template unchanged | `PM-GRP-004`, `WPR-INV-006` | `TS-SES-008` |
| EC-SES-009 | User discards active workout containing saved sets | Explicit destructive scope; no schedule advance; recovery state disclosed | `WPR-SES-009` | `TS-SES-009` |
| EC-SES-010 | Unscheduled empty workout completed with no sets | Allow explicit empty completion only with confirmation/note or discard; no PR/progression/sequence effect by default | `WPR-SCH-012`, `WPR-SES-008` | `TS-SES-010` |

## 6. Local data, migration and storage failure

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-DATA-001 | Storage fills while completing a set | Previous revision remains; attempted input visible where feasible; no saved checkmark/timer claim | `WPR-RES-008` | `TS-DATA-001` |
| EC-DATA-002 | Storage fills during workout completion | Active session remains authoritative; retry is safe after recovery | `WPR-RES-005`, `WPR-RES-008` | `TS-DATA-002` |
| EC-DATA-003 | Migration fails before commit | Roll back; open prior readable schema/read-only recovery; never empty reset | `WPR-RES-007`, `PRD-FR-039` | `TS-DATA-003` |
| EC-DATA-004 | Latest active snapshot checksum invalid, prior journal valid | Quarantine bad revision and restore latest verified revision; explain possible unsaved delta | `WPR-RES-002`, `WPR-RES-007` | `TS-DATA-004` |
| EC-DATA-005 | All active revisions unreadable, history valid | Preserve history; quarantine active payload; offer diagnostic export/recovery; no fabricated active workout | `WPR-RES-007` | `TS-DATA-005` |
| EC-DATA-006 | Unknown future enum/schema value imported | Preserve raw import in quarantine; reject unsupported entity with path/report; existing data unchanged | `WPR-INV-002`, `PRD-NFR-010` | `TS-DATA-006` |
| EC-DATA-007 | Export destination becomes unavailable | Report failure and temporary-file handling; do not claim exported or delete source | `PRD-FR-037` | `TS-DATA-007` |
| EC-DATA-008 | Delete requested during active completion transaction | Serialize/stop and show exact current state; never partially delete across scopes | `PRD-FR-038`, `WPR-INV-005` | `TS-DATA-008` |
| EC-DATA-009 | User selects account deletion but no account exists | Explain local-data scope; do not imply remote account | `PRD-FR-038` | `TS-DATA-009` |
| EC-DATA-010 | App receives two writes based on same revision | First valid commit wins; second returns conflict with entered draft preserved for review | `WPR-INV-005`, `PM-ENT-008` | `TS-DATA-010` |

## 7. Set input, units and modalities

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-SET-001 | Zero reps | May be explicitly saved as attempted/no-rep; excluded from positive PRs; otherwise remains draft | `ST-VAL-002` | `TS-SET-001` |
| EC-SET-002 | Negative, NaN, infinity or overflow input | Field error; raw draft retained; no completed set | `ST-VAL-015` | `TS-SET-002` |
| EC-SET-003 | Rep/timed fields incompatible with exercise | Reject incompatible field without silently dropping it; offer correct mode | `ST-VAL-001`, `ST-VAL-006` | `TS-SET-003` |
| EC-SET-004 | Planned target copied/prefilled but not confirmed | Remains draft/reference, not observed performance | `ST-TGT-002`, `ST-TGT-003` | `TS-SET-004` |
| EC-SET-005 | Observed reps outside target range | Save valid set and label below/above; no forced correction | `ST-TGT-001` | `TS-SET-005` |
| EC-SET-006 | RPE 8.3 or RIR 10.5 | Specific supported-step/integer validation; other set fields retained | `ST-VAL-008` | `TS-SET-006` |
| EC-SET-007 | Both RPE and RIR entered | Store both as user reports if each valid; do not convert/reconcile | `ST-EFF-006`, `ST-EFF-007` | `TS-SET-007` |
| EC-SET-008 | Unilateral left filled, right missing | Require partial-side confirmation or right value; never copy silently | `ST-VAL-009` | `TS-SET-008` |
| EC-SET-009 | Bodyweight set lacks body mass | Save raw reps/added load; do not fabricate total load/volume | `ST-LOAD-002`, `ST-CMP-002` | `TS-SET-009` |
| EC-SET-010 | Assisted set entered with negative load | Reject; assistance is positive quantity with named basis | `ST-LOAD-003`, `ST-VAL-005` | `TS-SET-010` |
| EC-SET-011 | Deleted set was a progression/PR input | Recompute/invalidate affected derived data atomically | `WPR-EDIT-004`, `WPR-PR-007` | `TS-EDIT-001` |
| EC-SET-012 | Warm-up is heaviest set | Save/show it; exclude from working PR/progression under MVP rules | `WPR-SET-005`, `WPR-PR-003` | `TS-SET-011` |
| EC-SET-013 | Same display exercise name but distinct stable IDs | Histories remain separate unless explicit versioned compatibility mapping exists | `WPR-INV-001`, `ST-CMP-001` | `TS-SET-012` |
| EC-SET-014 | Imported set timestamp unknown | Store explicit unknown provenance; do not invent a time/order beyond available import order | `ST-VAL-010` | `TS-SET-013` |
| EC-UNIT-001 | User switches kg↔lb mid-session | Display converts; canonical/original values remain; no duplicate PR | `ST-LOAD-*`, `ST-CMP-001` | `TS-UNIT-001` |
| EC-UNIT-002 | “1000” entered after decimal-locale change | Parse by active locale; if ambiguous retain text/error; outlier confirmation only | `ST-VAL-005`, `ST-VAL-014` | `TS-UNIT-002` |
| EC-UNIT-003 | Per-side vs total load basis changes | Require explicit basis change and comparison boundary; never multiply/merge silently | `ST-LOAD-001`, `ST-CMP-001` | `TS-UNIT-003` |
| EC-UNIT-004 | Equipment increment unavailable | Show raw candidate/ask or suppress per rule; never pretend load is loadable | `WPR-PROG-016` | `TS-PROG-006` |
| EC-UNIT-005 | Equivalent value conversion rounds for display | Persist exact canonical + original; comparisons use canonical precision, display states rounding | `ST-LOAD-*` | `TS-UNIT-001` |

## 8. Drop sets, groups and timers

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-GROUP-001 | Drop parent deleted | Child link becomes invalid; transaction requires relink, convert role or delete; no orphan commit | `ST-DROP-001` | `TS-SET-014` |
| EC-GROUP-002 | Drop load equals/exceeds comparable parent | Require manual exception or role correction; exclude drop-specific analysis | `ST-DROP-002` | `TS-SET-014` |
| EC-GROUP-003 | Circular/cross-exercise drop link | Reject without changing existing chain | `ST-DROP-003` | `TS-SET-014` |
| EC-GROUP-004 | Circuit round incomplete at finish | Store individual completed/missing states; do not fabricate rectangular rounds | `PM-GRP-003` | `TS-SES-006` |
| EC-GROUP-005 | Group member removed in short mode | Respect splittable flag and disclose result; source template unchanged | `WPR-SHORT-004`, `WPR-SHORT-007` | `TS-SHORT-003` |
| EC-REST-001 | Notification permission denied | In-app timer works; explain external alert once; logging unaffected | `WPR-REST-005` | `TS-REST-001` |
| EC-REST-002 | Set completed while existing timer active | Apply same-session replacement policy; no blocked logging | `WPR-REST-003`, `WPR-REST-004` | `TS-REST-002` |
| EC-REST-003 | App closes before timer expires | Restore from anchors; deliver/display according to permission; no set changes | `WPR-RES-004`, `WPR-REST-006` | `TS-REST-003` |
| EC-REST-004 | Timer expires during edit/substitution | Expiry feedback is non-blocking and never discards modal/input state | `WPR-REST-004` | `TS-REST-005` |

## 9. Substitution and custom exercises

`EC-SUB-001`–`EC-SUB-006` and `EC-CUSTOM-*` are MVP cases using explicit current-session equipment context. `EC-SUB-007` is POST contract coverage for named gym profiles (`PRD-FR-008`); it is not an MVP release gate.

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-SUB-001 | No exact equipment match | Show mismatches/unknowns; offer search/custom/skip; no confident invented equivalent | `WPR-SUB-004`, `WPR-SUB-008` | `TS-SUB-001` |
| EC-SUB-002 | User chooses “uncomfortable” | Neutral reason; no diagnosis or “safe” candidate claim | `WPR-SUB-001`, `SAF-EVT-001` | `TS-SAFE-001` |
| EC-SUB-003 | Substitute has different measurement/laterality | Disclose mismatch, instantiate correct new set schema, do not copy incompatible targets | `WPR-SUB-004`, `WPR-SUB-007` | `TS-SUB-002` |
| EC-SUB-004 | Current-session substitution accidentally toggles future | Scope confirmation required; default session only; future update creates new version | `WPR-SUB-006` | `TS-SUB-003` |
| EC-SUB-005 | Previous values exist only for replaced exercise | Show as plan context only; actual previous-performance field for substitute is empty/its own | `WPR-SUB-007` | `TS-SUB-004` |
| EC-SUB-006 | Programme-authored alternative conflicts with explicit current-session equipment context | Disclose equipment mismatch and rank eligible alternatives; user may override; no named profile is created | `WPR-SUB-003`, `WPR-SUB-004`, `WPR-SUB-009` | `TS-SUB-005` |
| EC-SUB-007 | **POST contract:** selected named gym profile is archived or its equipment entry changes mid-session | Active snapshot keeps captured profile/equipment context; mark now-missing metadata unknown and allow explicit session profile/override; no history rewrite | `WPR-GYM-002`–`WPR-GYM-004` | `TS-SUB-006` |
| EC-CUSTOM-001 | Custom exercise duplicates built-in name | Allow with disambiguation; stable histories stay separate | `WPR-CUSTOM-002` | `TS-CUSTOM-001` |
| EC-CUSTOM-002 | User changes custom exercise from reps to time | New definition version; old history retains rep semantics | `WPR-CUSTOM-003` | `TS-CUSTOM-002` |
| EC-CUSTOM-003 | Custom exercise deleted but used in history/programme | Archive from picker; history remains; affected future plan asks replacement | `WPR-CUSTOM-004` | `TS-CUSTOM-003` |
| EC-CUSTOM-004 | Custom exercise omits optional equipment/category/movement/muscle metadata | Name + measurement/load/laterality definition logs normally; dependent substitution factors remain unknown and cannot support a confident similarity rank | `WPR-CUSTOM-001`, `WPR-SUB-004` | `TS-CUSTOM-004` |

## 10. Short mode and carry-forward

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-SHORT-001 | Available time below minimum estimated work | Preview smallest deterministic valid subset/manual selection; state estimate cannot fit; no guarantee | `WPR-SHORT-003`, `WPR-SHORT-005` | `TS-SHORT-001` |
| EC-SHORT-002 | Priority missing | Treat as normal priority, not lowest/unimportant | `WPR-SHORT-002` | `TS-SHORT-002` |
| EC-SHORT-003 | User already completed a low-priority set before enabling | Keep completed work; reduce only uncompleted plan | `WPR-SHORT-003` | `TS-SHORT-003` |
| EC-SHORT-004 | All remaining exercises marked required minimum | State no deterministic reduction available; allow manual override/partial completion | `WPR-SHORT-003`, `WPR-SHORT-006` | `TS-SHORT-004` |
| EC-SHORT-005 | Carry-forward collides with next workout's same exercise | Preview duplicate and let user merge as newly authored plan, keep separate or omit; never auto-merge performance | `WPR-SHORT-008`, `WPR-SES-007` | `TS-SHORT-005` |

## 11. Progression, decline and records

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-PROG-001 | Planned 3 sets; only 2 completed at top range | No all-sets increase recommendation; explain insufficient qualifying sets | `WPR-PROG-001`, `WPR-PROG-010` | `TS-PROG-001` |
| EC-PROG-002 | Fourth unplanned set qualifies but one first planned set does not | All-first-`n` policy remains false; no substitution of fourth set | `WPR-PROG-010` | `TS-PROG-002` |
| EC-PROG-003 | Required RPE/RIR missing | Suppress gated recommendation; never infer rating | `WPR-PROG-006`, `WPR-PROG-014` | `TS-PROG-003` |
| EC-PROG-004 | Mixed exercise variation/equipment | Exclude non-comparable set; explain limitation | `WPR-PROG-001`, `ST-CMP-001` | `TS-PROG-004` |
| EC-PROG-005 | Pending recommendation input is edited | Invalidate old pending recommendation and calculate a new version if eligible | `WPR-PROG-005` | `TS-PROG-005` |
| EC-PROG-006 | Percent candidate falls between available loads | Apply stored rounding policy once and explain raw + rounded values | `WPR-PROG-012`, `WPR-PROG-016` | `TS-PROG-006` |
| EC-PROG-007 | User manually holds/overrides target | Preserve user target; pause/suppress according to chosen scope; no pressure | `WPR-PROG-004`, `SAF-REC-007` | `TS-PROG-007` |
| EC-PROG-008 | Performance decline threshold reached | Descriptive comparison and neutral options only; no cause/automatic deload | `WPR-PROG-017`, `SAF-NC-003` | `TS-SAFE-002` |
| EC-PROG-009 | Rule version superseded between completion and view | Historical recommendation retains old rule; new candidate uses current eligible future rule, clearly separated | `WPR-PROG-002` | `TS-PROG-008` |
| EC-PROG-010 | Rep-range rule reaches ceiling without load transition | Follow configured hold; do not invent weight increase | `WPR-PROG-011` | `TS-PROG-009` |
| EC-PROG-011 | Recommendation acceptance is delivered twice or source version changes before acceptance | Idempotent same command returns the same new future version; stale/different source returns conflict and preserves pending choice for review; no published version mutates | `WPR-PROG-003`, `PM-VER-001`–`PM-VER-004` | `TS-PROG-010` |
| EC-PR-001 | Warm-up is heaviest load | No working-load PR; history still shows set | `WPR-PR-003` | `TS-PR-001` |
| EC-PR-002 | Bodyweight and external-load variants share name | Separate comparison signatures and records | `WPR-PR-001`, `ST-CMP-001` | `TS-PR-002` |
| EC-PR-003 | Two performances tie | Shared value; earliest deterministic first-achieved; later tie may be noted | `WPR-PR-008` | `TS-PR-003` |
| EC-PR-004 | Current PR set edited lower/deleted | Recompute from remaining eligible history atomically | `WPR-PR-007` | `TS-PR-004` |
| EC-PR-005 | e1RM formula/rep range not approved | Feature disabled/insufficient-rule state; no estimate | `ST-CMP-003`, `SAF-PRO-007` | `TS-PR-005` |
| EC-PR-006 | Workout completed offline with PR | Confirm local PR after atomic completion; later sync cannot duplicate it | `WPR-PR-009` | `TS-PR-006` |
| EC-PR-007 | Assisted exercise “heaviest” load | Do not rank assistance as external heaviest; use only approved assisted rule or no PR | `ST-LOAD-003`, `WPR-PR-002` | `TS-PR-007` |

## 12. Completed edits, notes and safety language

| ID | Edge condition | Expected outcome and recovery | Governing rules | Primary test |
|---|---|---|---|---|
| EC-EDIT-001 | Edit makes start later than end | Block commit with chronology error; preserve draft/original completed workout | `WPR-EDIT-003` | `TS-EDIT-003` |
| EC-EDIT-002 | Exercise remap changes measurement semantics | Require explicit compatible mapping or new performance rewrite preview; never silently reinterpret | `WPR-EDIT-001`, `ST-CMP-001` | `TS-EDIT-002` |
| EC-EDIT-003 | Edit a session linked to an old occurrence | History/derived data update; current schedule cursor unchanged | `WPR-EDIT-005` | `TS-EDIT-004` |
| EC-EDIT-004 | Recalculation fails after valid edit attempt | Entire transaction rolls back or visible pending state preserves old derived truth; no mixed revision | `WPR-EDIT-004` | `TS-EDIT-005` |
| EC-NOTE-001 | Exercise note accidentally targeted at programme | Scope shown before save; user can change; no implicit broadening | `WPR-NOTE-001` | `TS-NOTE-001` |
| EC-NOTE-002 | Note contains health/pain words | Store privately; no parsing into advice, analytics or recommendation | `WPR-NOTE-003`, `SAF-EVT-002` | `TS-SAFE-003` |
| EC-SAFE-001 | Recommendation copy adds “safe/optimal” | Content validation fails; recommendation cannot ship | `SAF-NC-001`, `SAF-REC-*` | `TS-SAFE-005` |
| EC-SAFE-002 | Celebration rewards highest failure frequency/volume | Product safety review fails; remove/reframe around accurate personal record only | `SAF-MET-007`, `SAF-WELL-004` | `TS-SAFE-006` |
| EC-SAFE-003 | Missed workout notification uses guilt/urgency | Copy audit fails; replace with neutral reminder or omit | `SAF-WELL-001`, `SAF-WELL-005` | `TS-SAFE-007` |

## 13. Coverage rule

Any newly discovered domain edge case must receive an `EC-*` ID, expected recoverable outcome, governing rule and at least one automated or explicitly manual test before the related feature is considered done. A production incident caused by an uncatalogued case must add a regression scenario, not only an implementation patch.
