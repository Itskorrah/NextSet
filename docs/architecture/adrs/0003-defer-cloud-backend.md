# ADR-0003: Defer cloud backend and accounts

- Status: proposed
- Date: 2026-08-06
- Owners: architecture, product and privacy
- Decision class: current deferral is reversible; backend data contracts and encryption choices will be expensive to reverse
- Approval required: yes

## Context

The first release can fulfil NextSet's central promise entirely on one device. A backend would add identity, consent, network failure, security operations, deletion, incident response, sync conflicts and recurring cost before multi-device value has been validated.

## Decision

Do not build a cloud backend, account system, remote analytics warehouse or push-notification service for the first release. Local notifications remain allowed. Keep stable IDs, revisions, tombstones, an atomic change log and repository interfaces so a future sync system can be added without rewriting domain rules.

Before backend implementation, approve separate decisions for:

- account identity, recovery and deletion;
- regional hosting, retention and subprocessors;
- sync protocol and conflict UX;
- transport and at-rest security;
- whether end-to-end encryption is required;
- observability with content redaction;
- abuse, incident and availability operations;
- data export/import compatibility.

## Consequences

Positive:

- Workouts have no server availability dependency.
- The initial privacy surface, cost and operational burden are materially smaller.
- Product learning focuses on logging and programme value rather than account funnels.

Negative:

- No automatic cross-device recovery or multi-device continuity.
- Device loss/uninstall remains a risk mitigated in MVP by a declared OS/platform-backup policy and user-controlled offline export, not eliminated. User-directed portable import/restore is deferred as `FEAT-POST-009`.
- Product analytics are limited; any local metrics must be aggregate and user-visible until telemetry is separately approved.

## Guardrails

- No third-party SDK may upload workout content, exercise names, notes or stable row IDs.
- UI and domain code must not import a future backend SDK.
- The local change log is not a licence to transmit; sync remains disabled until explicit consent and backend approval.
- The MVP offline export format is versioned independently of a future wire protocol. A compatible user-directed portable import/restore contract is post-MVP (`FEAT-POST-009`) and cannot be implied by the existence of export.

## Revisit triggers

- Validated demand for multi-device use or automatic remote recovery.
- A product requirement cannot be fulfilled locally.
- Privacy/security review, operational ownership and deletion/export flows are funded.
- The product owner explicitly approves the future-sync architecture.
