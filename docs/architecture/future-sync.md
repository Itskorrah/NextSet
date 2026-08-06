# Future account and synchronisation architecture

Status: design seam only; **not approved for implementation**  
Date: 2026-08-06  
Related: [ADR-0003](adrs/0003-defer-cloud-backend.md)

## Decision now

Do not build accounts, remote storage or sync for the first release. Preserve the ability to add them by using stable local IDs, row revisions, tombstones, immutable historical snapshots, transactional change events and repository boundaries.

The first backend decision is expensive to reverse because it fixes identity, retention, conflict, deletion and encryption contracts. No provider should be selected until product demand and privacy requirements are approved.

## Goals for a later phase

- Optional account; a local-only mode remains viable.
- Multiple devices can work offline for long periods.
- Local reads/writes remain immediate and authoritative for the current device.
- Sync is idempotent, resumable, observable and never required to finish a workout.
- Concurrent high-value edits are never silently discarded.
- Export and account deletion cover the complete user dataset.
- Server compromise or diagnostics should expose the minimum feasible content.

Non-goals: real-time collaborative workout editing, public social feed, trainer marketplace and analytics replication.

## Boundary

```text
UI -> application command -> local SQLite transaction
                                  | data + ChangeEvent
                                  v
                           committed outbox
                                  |
                           SyncCoordinator
                            /           \
                    push mutations    pull cursor
                            \           /
                     verified remote API
                                  |
                     apply into SQLite transaction
                                  |
                           local UI refresh
```

The UI never reads server responses directly. The network adapter validates payload/schema/auth, then applies accepted mutations into SQLite; repository subscribers update from local data.

## Mutation envelope

Each locally committed mutation eventually exposes:

- `mutation_id` (UUID, idempotency key);
- account/dataset ID at the wire boundary;
- entity type and stable entity ID;
- operation (`create/update/tombstone/restore`);
- base entity version and proposed new version;
- changed field set and versioned payload;
- per-field hybrid logical clock or equivalent causal metadata;
- origin installation ID (random app ID, not hardware ID);
- command/revision ID and payload hash;
- client schema/protocol version;
- client occurrence time as informational evidence, never sole authority.

The data mutation and outbox row are written in the same local transaction. A server retries by `mutation_id`; duplicate delivery returns the original result.

## Synchronisation cycle

1. Trigger opportunistically on foreground, explicit refresh and OS-permitted background work. Connectivity is a hint, not a guarantee.
2. Authenticate without blocking local commands.
3. Push a bounded, ordered batch of outbox mutations.
4. Server validates authorisation, schema, invariants and idempotency; it returns accepted versions or typed conflicts.
5. Client records acknowledgements and applies server changes/conflicts in one transaction.
6. Pull changes after the durable cursor, page by page, applying each page transactionally.
7. Advance cursor only after all records in that page commit.
8. Recompute affected projections locally and expose sync state.
9. Retry transient failures with capped exponential backoff/jitter; authentication and schema failures require explicit handling.

Background work is a convenience. Expo documents that background tasks are deferrable, OS-scheduled and may stop when the user kills the app; sync correctness therefore relies on resumable foreground operation. [Expo BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/) (accessed 2026-08-06).

## Conflict policy by data class

| Data | Concurrent policy | User experience |
|---|---|---|
| Independent new workouts/sets | Union by stable ID. | Both appear; semantic duplicate detection is advisory only. |
| Different scalar fields | Merge when causal metadata proves fields do not overlap. | Usually invisible; revision provenance retained. |
| Same set load/reps/RPE | Preserve both versions; no wall-clock last-write-wins. | Show compact comparison with device/time context and choose/combine. |
| Active same workout on two devices | Branch the session after common base; never mingle values silently. | Pick primary, keep the other as conflict copy or separate workout. |
| Completed workout edit vs edit | Field merge only if disjoint; otherwise preserve both. | Resolve before dependent records are treated current. |
| Delete vs causally newer edit | Edit survives pending resolution; tombstone cannot erase it. | “Deleted elsewhere / edited here” choice. |
| Programme version graph | Immutable versions make concurrent edits siblings from same base. | Choose one as current, keep/rename/merge through an explicit new version. |
| Ordered list moves | Apply causal per-item moves, retain all children, normalise ties by ID. Material crossing conflict creates record. | Show merged order only when unambiguous; otherwise review. |
| Preferences/settings | Field-level last-writer only with hybrid logical clocks and revision history. | Undo/reselect; device-only settings never sync. |
| Personal records/recommendations | Never merge derived rows. Recalculate from resolved source data/version. | Mark stale during conflict. |

“Last writer wins” based only on device time is prohibited: clocks skew and it silently destroys meaningful workout edits.

## Active-workout single-writer strategy

When online, a short renewable lease can warn that the same session is open elsewhere, but it cannot be a correctness lock because devices work offline. Each device continues locally. If two branches appear, server and client preserve them. Completion on one branch does not delete the other; the user resolves or keeps both.

## Tombstones and retention

- A synced deletion creates a tombstone with causal metadata.
- Do not purge until every known active replica has acknowledged it or a documented maximum offline-retention window expires.
- Returning devices older than the retention window perform a full reconciliation and cannot resurrect purged data automatically.
- Account delete bypasses ordinary tombstone retention on the server after required safety/backup grace, with transparent legal/operational exceptions.
- Local revision/conflict data follows the resolved entity's user-approved retention.

Exact retention periods are a product/privacy decision, not set here.

## Identity and authentication

- Local domain IDs are never replaced by account-scoped sequential IDs.
- An account owns one or more encrypted datasets; account ID mapping stays at the API/sync boundary.
- Use platform browser/system authentication with standards-based OAuth/OIDC or passkeys when selected; never embed provider passwords.
- Store refresh credentials only in Keychain/Keystore-backed secure storage and rotate/revoke them. Apple describes Keychain as encrypted storage for small secrets. [Apple Keychain Services](https://developer.apple.com/documentation/security/keychain-services) (accessed 2026-08-06).
- Sign-out must distinguish “remove this device's credentials” from “delete local workout data” and “delete account everywhere.”
- Account recovery must not silently create a second empty dataset.

## Security and privacy decision gate

Before selecting a backend, choose one model:

1. **Service-readable content:** TLS in transit, managed encryption at rest, strict tenant authorisation and audited operations. Easier server-side search/support; server compromise exposes content.
2. **End-to-end encrypted content:** device-held dataset keys, encrypted records/blobs, explicit multi-device key transfer/recovery. Stronger confidentiality; materially complicates conflict processing, search, recovery and support.

This choice is expensive to reverse. The local schema avoids server-generated primary IDs but does not pretend that E2EE can be added later without protocol/key work. A threat-model and recovery usability study must decide before any real data is uploaded.

Data minimisation:

- do not upload gym location, notes, workout values or custom exercise names unless required for the opted-in sync dataset;
- telemetry is a separate consent/purpose pipeline and never receives sync payloads;
- server logs redact tokens, payloads, query parameters and user content;
- push notifications contain opaque wake hints, not workout content; delivery is not guaranteed.

## API properties

- Versioned contract and generated validators.
- Authenticated tenant scoping on every operation; object ID knowledge is not authorisation.
- Payload/body limits, rate limits and bounded batch sizes.
- Idempotent mutation endpoint and cursor-based change feed.
- Monotonic per-dataset server sequence for pull, independent of device clock.
- Atomic server transaction for mutation plus change-feed entry.
- Explicit minimum/maximum client protocol versions and safe upgrade response.
- Export/delete jobs with verifiable status and audit.
- No remote code/config may alter workout rules without a signed app/rule-version decision.

## Failure and recovery

| Failure | Behaviour |
|---|---|
| Offline/timeout/5xx | Local command succeeds; mutation remains pending; retry later. |
| Auth expired | Pause network, preserve outbox, prompt at a noncritical boundary. |
| Duplicate request | Server returns prior mutation result. |
| Partial response/app killed | Cursor not advanced until local page transaction commits; retry safe. |
| Unknown schema | Quarantine payload, stop affected sync, keep local data usable, require compatible app. |
| Server rejects invariant | Keep local source/revision, expose actionable conflict; never delete it. |
| Account unavailable | Local workout remains usable; status states remote limitation. |
| Server data loss | Reconcile from encrypted backups and device outboxes without rolling local data backward silently. |
| Device revoked | Revoke credentials/keys; local deletion depends on platform reachability and cannot be guaranteed remotely. |

## Rollout stages

1. Local-only metadata and deterministic two-replica simulator.
2. Internal disposable accounts with synthetic data; fault/partition suite.
3. Opt-in encrypted backup of an immutable test dataset.
4. Opt-in one-way upload plus export/delete verification.
5. Two-device sync beta with conflict UX and no automatic purge.
6. General availability only after security review, restore drill, incident runbook and measured conflict rate.

No stage may make sync mandatory to start or finish a workout.

## Required proof before launch

- Model-based tests across at least 10,000 generated two/three-device partition/rejoin sequences.
- Duplicate, reordered, lost and corrupted message tests; convergent canonical state or explicit unresolved conflict.
- No acknowledged local write lost when the process dies during push/pull/apply.
- Account deletion removes active server dataset and credentials under approved retention, while export remains usable.
- Cross-tenant access tests at every API surface.
- Token rotation/revocation, device loss and account recovery drills.
- Restore server backup into an isolated environment and reconcile with device outbox.
- Conflict UX usability test for set edits, programme branches and delete/edit.
- Privacy disclosure and store data-safety labels match captured traffic.

## Classification

| Item | Class |
|---|---|
| Stable IDs, versions, tombstones, transactional outbox seam | Must now; expensive retrofit |
| Backend/provider/protocol | Deferred and reversible before data exists |
| Service-readable vs E2EE | Deferred, but expensive to reverse after launch |
| Account identity/recovery/deletion | Deferred; security-critical |
| Background sync | Deferred and non-authoritative |
| Social/real-time collaboration | Explicitly out of scope |

