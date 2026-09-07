# Decision log

Material decisions use ADRs for technical commitments and this log for cross-functional choices. Status values are `proposed`, `accepted`, `superseded`, or `rejected`.

| ID | Date | Status | Decision | Rationale | Evidence / owner action |
|---|---|---|---|---|---|
| D-001 | 2026-08-06 | superseded | Refine the promise around keeping the next useful action obvious while preserving flexibility and record quality. | Differentiates NextSet from generic logging and autonomous coaching without promising outcomes. | Superseded by the logging-first promise in D-009. |
| D-002 | 2026-08-06 | superseded | Treat flexible sequence and fixed weekday scheduling as co-equal MVP modes. | They solve materially different mainstream scheduling needs and share the same occurrence model. | D-009 defers both scheduling modes out of the first release. |
| D-003 | 2026-08-06 | superseded | Start recommendations with deterministic, versioned, explainable rules. | Offline, testability, trust, and user control matter more than opaque novelty. | D-009 defers suggestions; explainability remains a constraint if later approved. |
| D-004 | 2026-08-06 | proposed | Use local-first device data and defer cloud backend/account sync. | Core logging must survive connectivity, interruption, and service failure; cloud adds irreversible complexity. | ADR-0002 and ADR-0003. |
| D-005 | 2026-08-06 | proposed | Recommend Tempo Ledger as the default visual foundation, with selective Open Pace guidance patterns. | It balances speed, numeric clarity, originality, accessibility, and long-session restraint; Field Kit is strong but narrower. | Product owner must choose; no direction is selected by this document. |
| D-006 | 2026-08-06 | accepted | Keep this milestone strictly pre-production. | The prompt defines an explicit approval stop. | Production code is absent; prototypes are labelled disposable. |
| D-007 | 2026-08-06 | accepted | Treat “NextSet” as provisional. | Public name scans are not legal or trademark clearance. | Counsel-led clearance required before brand investment. |
| D-008 | 2026-08-06 | proposed | Target 48×48 logical-pixel critical controls and WCAG 2.2 AA-compatible contrast/focus rules. | Gym use increases one-handed and movement-related precision demands beyond bare minimums. | Validate in accessibility matrix and user testing. |
| D-009 | 2026-09-07 | accepted | Make the first release a logging-first app: blank workouts, set logging, repeat completed workouts, optional reusable routines, editable history and meaningful comparable trends. Defer goal/programme/schedule setup, automated scheduling, short-workout recommendations, ranked substitution guidance, advanced group/drop authoring and progression suggestions. | The owner wants a simple log that is useful indefinitely without adopting a training plan. Reduce commitment before the first recorded set and repeated-use friction. | Owner agreed to the recommendations and explicitly instructed this documentation/prototype pass on 2026-09-07. Durable local data, restoration, accessibility, units, export and deletion remain planned release requirements. Scope approval is separate from final design, architecture and journey approval. |
| D-010 | 2026-09-07 | accepted | Select Tempo Ledger as the visual direction; approve the logging-first critical journeys; build a local-first iOS/Android app with React Native, Expo, TypeScript and SQLite. | The owner reviewed the working prototype, approved its visual direction and core loop, and chose a native phone app with no accounts, cloud sync, scheduling or coaching in the first release. | Production implementation may begin within the approved logging-first scope. The first build must preserve the acceptance criteria for durable local data, accessible controls, editing, export and deletion; it cannot inherit deferred features. |

## D-009 — decision detail and boundary

**Owner:** product owner, recorded from the current conversation on 2026-09-07.  
**Evidence class:** explicit product decision; it is not usability evidence or proof of fitness outcomes.

The default loop is **Start workout → add exercises → log sets → finish → review history/trends**. It stays complete with no goal, programme, routine, schedule or recommendation. Repeat copies a completed workout into a fresh session with all observed completion state reset. Routines are optional reusable definitions with no calendar or enrolment requirement. Finishing early records only what happened and asks no carry-forward decision.

The initial progress questions are workout frequency, comparable exercise performance and observed personal bests. Empty/insufficient histories must be useful and truthful; samples, unlogged targets and estimates cannot masquerade as results. Reuse/editing must preserve provenance and recalculate affected derived data.

**Consequences and reversibility:** the earlier broad programme-led MVP in D-001–D-003 is superseded. Preserve deferred specifications as reference, but do not build their engines or expose placeholder controls in the logging-first experience. Optional basic measurement detail remains; complex planner/group workflows move behind a new scope decision. The cost of being wrong is reduced appeal to users seeking full programme automation; validate demand after the logging loop works reliably.

**Authorised now:** update foundation documentation and the disposable prototype, using Tempo Ledger as the proposed base and relevant mobile iOS design principles. Retain the proposed technology stack. No production app, backend, telemetry or dependency adoption is authorised by this decision.

**Superseded approval state:** D-010 records the owner's final acceptance of Tempo Ledger, the revised critical journeys, and the local-first React Native/Expo/SQLite architecture. It authorises production implementation of the logging-first scope only.

## D-010 — production foundation approval

**Owner:** product owner, recorded from the current conversation on 2026-09-07.  
**Evidence class:** explicit product decision based on owner walkthrough of the disposable prototype; it is not a claim of external usability research.

The approved first release is a native iOS and Android phone app. It starts blank, lets a person add exercises and log/edit sets, and supports repeat, optional reusable routines, history and descriptive trends. Tempo Ledger is the selected visual base. React Native + Expo + TypeScript and one local SQLite database are the approved initial implementation architecture.

Accounts, cloud sync, social features, payments, goals, programmes, schedules, automated workout adaptation and progression advice remain out of scope. The three small clarity refinements are required in the first real build: distinguish Repeat from Save as routine, keep trend language descriptive rather than coaching-like, and never imply that preview-only state is durable.

## New decision record template

```text
ID / date / owner / status
Context and user problem
Options considered
Decision and non-decision
Evidence and uncertainty
Consequences, risks, and reversibility
Validation and review date
Supersedes / superseded by
```
