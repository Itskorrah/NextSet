# Decision log

Material decisions use ADRs for technical commitments and this log for cross-functional choices. Status values are `proposed`, `accepted`, `superseded`, or `rejected`.

| ID | Date | Status | Decision | Rationale | Evidence / owner action |
|---|---|---|---|---|---|
| D-001 | 2026-08-06 | proposed | Refine the promise around keeping the next useful action obvious while preserving flexibility and record quality. | Differentiates NextSet from generic logging and autonomous coaching without promising outcomes. | Approve or revise at foundation review. |
| D-002 | 2026-08-06 | proposed | Treat flexible sequence and fixed weekday scheduling as co-equal MVP modes. | They solve materially different mainstream scheduling needs and share the same occurrence model. | Review `WPR-SCH-*` rules and journey tests. |
| D-003 | 2026-08-06 | proposed | Start recommendations with deterministic, versioned, explainable rules. | Offline, testability, trust, and user control matter more than opaque novelty. | Review progression rulebook and ADRs. |
| D-004 | 2026-08-06 | proposed | Use local-first device data and defer cloud backend/account sync. | Core logging must survive connectivity, interruption, and service failure; cloud adds irreversible complexity. | ADR-0002 and ADR-0003. |
| D-005 | 2026-08-06 | proposed | Recommend Tempo Ledger as the default visual foundation, with selective Open Pace guidance patterns. | It balances speed, numeric clarity, originality, accessibility, and long-session restraint; Field Kit is strong but narrower. | Product owner must choose; no direction is selected by this document. |
| D-006 | 2026-08-06 | accepted | Keep this milestone strictly pre-production. | The prompt defines an explicit approval stop. | Production code is absent; prototypes are labelled disposable. |
| D-007 | 2026-08-06 | accepted | Treat “NextSet” as provisional. | Public name scans are not legal or trademark clearance. | Counsel-led clearance required before brand investment. |
| D-008 | 2026-08-06 | proposed | Target 48×48 logical-pixel critical controls and WCAG 2.2 AA-compatible contrast/focus rules. | Gym use increases one-handed and movement-related precision demands beyond bare minimums. | Validate in accessibility matrix and user testing. |

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
