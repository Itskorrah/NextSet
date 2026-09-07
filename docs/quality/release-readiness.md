# NextSet release-readiness gates

Status: checklist and evidence contract; no production release is currently ready  
Date: 2026-08-06

## Logging-first applicability — 2026-09-07

The owner-approved scope in [D-009](../project/decision-log.md) and the [current PRD](../product/product-requirements.md) takes precedence over the earlier broad foundation contract below. Blank workouts, repeats and standalone reusable routines require no goal, programme, enrolment, planned occurrence or schedule. Scheduling/sequence automation, carry-forward, ranked substitution recommendations, short-workout adaptation and progression suggestions are deferred; retained rules describe future contracts, not first-release obligations. Core set integrity, comparable descriptive records, editing, offline restoration and data ownership remain required. The current web prototype demonstrates interaction only, with memory that resets on reload; production durability gates remain future work.


## Two distinct gates

### Foundation milestone (current phase)

This milestone may be presented for approval when research/product/domain/design/architecture/quality/agent/repository artefacts are complete and cross-reviewed; the logging-first Tempo Ledger proposal is reviewable and the earlier three-direction exploration is retained separately; all uncertainty and citations are visible; validation evidence is recorded; and the repository branch/PR is ready. It must stop before production implementation.

Required product-owner decisions:

1. visual direction and any elements to combine;
2. MVP boundary;
3. architecture recommendation;
4. critical journeys;
5. feature additions/removals/deferrals and mainstream breadth.

Foundation approval is not app-release approval.

### Production first release (future)

The signed candidate can ship only when every MUST gate below has linked evidence from that exact commit/build. A checked box without evidence is incomplete.

## Release record header

```text
Version/build:
Commit / lockfile hash:
Schema / catalogue / rule versions:
iOS artefact / signing identity:
Android artefact / signing identity:
Target rollout date:
Minimum supported OS/devices:
Release owner:
Evidence package path/link:
Known issues / accepted risks:
Go/no-go decision and timestamp:
```

## 1. Scope and product integrity — MUST

- [ ] Product owner approved MVP, journeys, visual direction and architecture; decision links recorded.
- [ ] Every reachable route/control maps to an approved requirement and acceptance ID.
- [ ] No placeholder/dead control, prototype route, lorem ipsum, fake analytics or mock result exists in the production build.
- [ ] Every chart names its user question, source, unit/range, empty/error state and accessible alternative.
- [ ] Explicit exclusions/deferred features have no misleading affordance or marketing claim.
- [ ] User-directed portable restore/import remains absent under `FEAT-POST-009` unless the product owner explicitly moves it into scope and adds its security/migration gates.
- [ ] Beginner core setup/logging remains free of mandatory advanced configuration; expert options remain discoverable.
- [ ] Content/fitness review confirms terminology, formulas, explanation boundaries and no unsupported medical/professional claims.
- [ ] Store screenshots/copy show actual approved behaviour and do not expose private fixture data.

Evidence: signed route/control inventory, requirement trace report, content/domain review, final store assets.

## 2. Source and reproducible build — MUST

- [ ] Release branch/commit reviewed; repository clean; origin/branch/tag verified; protected checks pass.
- [ ] Exact Node/package-manager/Expo/native toolchain and dependencies locked; clean iOS/Android builds reproduce.
- [ ] No credential, key, profile, `.env`, user DB/export or private screenshot in Git/build artefacts.
- [ ] Native entitlements/permissions, URL schemes, backup rules and release configuration diff reviewed.
- [ ] SBOM and third-party licence/notice inventory generated; fonts/assets have approved licences.
- [ ] Vulnerability/provenance scan has no unaccepted critical/high issue; lockfile change reviewed.
- [ ] Developer menus, verbose logging, test endpoints/flags and fixture seeding are absent/disabled.
- [ ] Signed artefacts install and launch on all minimum devices.

Evidence: CI logs, hashes/signatures, SBOM/licences, scans, config/permission diff and clean-build commands.

## 3. Functional and acceptance quality — MUST

- [ ] All MUST-v1 criteria in [acceptance-criteria.md](acceptance-criteria.md) pass on both platforms.
- [ ] Domain state transitions/rules have direct tests; critical branch/mutation gates pass.
- [ ] Critical E2E journeys pass with typical and large-history fixtures.
- [ ] Light/dark, empty/error/recovery, small screen and locale/unit variants reviewed.
- [ ] Blank/repeat/routine starts, draft handling and honest completion match WPR-LOG-*; scheduling and automated adaptation remain deferred.
- [ ] Comparable descriptive trends/records match approved definitions and source provenance; progression suggestions remain deferred.
- [ ] No open P0–P2. Any accepted P3 has an owner, expiry and approval and cannot conceal misleading, inaccessible, unsafe or data-risk behaviour.
- [ ] Critical suite flake consistency ≥99% over last 100 unchanged runs; no required test quarantined.

Evidence: test reports/seeds/device matrix, exploratory charter, defect/waiver report.

## 4. Data safety, offline and recovery — MUST

- [ ] Airplane-mode cold launch → start → log/edit/substitute → finish → history passes on physical iOS/Android.
- [ ] 100 random-boundary forced terminations per platform produce zero acknowledged write loss/duplication and exact active-workout restore.
- [ ] Statement/commit fault injection yields only complete before/after state for every critical transaction.
- [ ] Disk-full, SQLite busy/I/O, app background/lock/reboot, notification denied/delayed and clock/time-zone changes have truthful recovery.
- [ ] Every released source schema migrates; interruption/low-space/corrupt cases preserve original and never create silent empty DB.
- [ ] `integrity_check`, `foreign_key_check` and domain invariants pass on migrated current/large fixtures.
- [ ] Offline machine-readable export validates schema/content/checksums, cleans private staging and never changes the live DB; it is not described as importable.
- [ ] Platform backup behavior is tested against actual inclusion/exclusion rules and supported OS restore paths; no encrypted DB/credential-key mismatch, and residual-loss wording is truthful.
- [ ] Delete/undo and delete-all behaviours match retention/privacy wording and remove app-owned copies.

Any acknowledged data loss, unrecoverable migration or silent reset is automatic no-go.

Evidence: interruption/fault matrix, fixture hashes, active-session restoration results, export validation, platform-backup policy/restore results and backup/delete filesystem inspection.

## 5. Accessibility — MUST

- [ ] All [accessibility requirements](accessibility-requirements.md) blocking gates pass.
- [ ] VoiceOver/TalkBack complete onboarding/start/set/timer/substitution/finish/active-session-restore/export/delete on physical current devices; oldest supported smoke passes.
- [ ] 200% and approved largest platform text sizes preserve every critical action/content; no overlap/truncation blocker.
- [ ] Critical target geometry ≥48×48; focus order/return, roles, names, state/value/actions correct.
- [ ] Final light/dark screens have no AA contrast failure; charts have nonvisual alternatives.
- [ ] Reduce Motion/remove animations and haptics off/notification denied retain complete equivalent feedback.
- [ ] External keyboard/switch sampling and destructive/error recovery pass.

Evidence: manual scripts/videos/screenshots as privacy permits, semantic/contrast/geometry reports and defect closure.

## 6. Performance and reliability — MUST

- [ ] Signed build meets every blocking [performance budget](performance-budgets.md) on approved minimum and mid-tier reference devices.
- [ ] Raw p50/p95/p99 samples/traces identify build, fixture, device/OS and thermal state.
- [ ] Zero frozen ≥700 ms frames, ANRs or reference-device memory termination in measured critical journeys.
- [ ] Large-history/long-workout scroll/input/query/memory and 30-minute energy scenarios pass.
- [ ] Migration/export duration and progress/free-space behaviour pass.
- [ ] No >10% unexplained p95 regression against approved baseline.

Evidence: performance report/raw traces and approved exceptions (if any).

## 7. Security and privacy — MUST

- [ ] Current threat model/data inventory/retention/deletion/backup flows reviewed.
- [ ] Release-binary traffic capture confirms local-only claim and expected external link behaviour; no undisclosed SDK/request.
- [ ] Seeded private marker appears in no logs, crash artefacts, notifications, previews or files except explicit user export.
- [ ] SQL parameterisation/input limits and malicious supported-input/deep-link corpus pass.
- [ ] Permission/entitlement prompts are contextual, minimal and have complete denial paths.
- [ ] Export/share preview is minimal by default; app-private staging is removed after handoff/failure.
- [ ] Delete-all and app-switcher/notification privacy behaviour tested; limitations stated honestly.
- [ ] Store privacy/data-safety labels, privacy policy and third-party declarations match the exact binary/traffic.
- [ ] Security reviewer accepts dependency scan and any exception; incident contact/triage exists.

Evidence: traffic/log/file captures, supported-input fuzz report, permission diff, disclosures and security sign-off.

## 8. Visual and interaction quality — MUST

- [ ] Implemented direction matches approved design tokens, shape/type/spacing/motion/haptic principles without copying competitor identity.
- [ ] All critical screens/states reviewed on real devices at realistic data density, not only snapshots.
- [ ] Active workout maintains one-handed reach, numeric clarity and nonblocking timer under repeated use.
- [ ] Visual regressions reviewed in light/dark/small/large-text states; baseline changes approved by design.
- [ ] Animation/haptic timing never precedes durable success or blocks interaction.
- [ ] App icon, launch, store and empty/error/recovery states are coherent and licensed.

Evidence: visual QA report, approved diffs, physical-device capture and asset licence inventory.

## 9. Store, operations and support — MUST

- [ ] Bundle/application IDs, versions, signing, minimum OS, orientations, export compliance and store categories correct.
- [ ] Store copy, screenshots, privacy policy, support URL/contact and data disclosures approved.
- [ ] Release notes are accurate, neutral and identify known migration/backup implications where relevant.
- [ ] Staged/phased rollout configured where stores permit; named release owner monitors crashes/reviews/support.
- [ ] Support runbook covers active-workout recovery, migration/corruption, export, declared platform-backup limitations, notification denial and delete-all without requesting raw private DB by default.
- [ ] Incident/severity/escalation and stop-rollout criteria rehearsed.
- [ ] Previous store build and current migration fixtures retained; signing/rebuild capability verified.

Remote production telemetry is deferred unless separately approved; absence of telemetry increases the need for staged rollout, direct support and store/device evidence.

## Rollout and rollback plan

### Before rollout

1. Freeze RC commit/dependencies/migrations; generate evidence package.
2. Install signed candidate over previous public version and as clean install on the matrix.
3. Verify declared platform-backup behavior on representative data and retain the verified migration recovery artefact; do not substitute the MVP export for a restore drill.
4. Record explicit go/no-go with product, engineering, quality, design/accessibility and privacy/security.

### Staged rollout

Start with internal/beta users using non-sensitive or consented real data, then a small production percentage where supported. Expand only after the defined observation window has no P0/P1 signal. Exact percentages/windows are set when operational channels exist; they must not be invented without monitoring capacity.

### Stop rollout immediately for

- any credible acknowledged data loss/corruption or migration failure cluster;
- core offline/start/log/finish/active-session-restore crash;
- cross-user/content disclosure or unexpected network capture;
- critical accessibility blocker introduced from prior build;
- signing/permission/store disclosure mismatch;
- ANR/frozen-frame or startup regression that makes core use unreliable.

### Rollback constraints

An older binary may not understand a newer schema. Never advise binary downgrade until its schema compatibility is proven. Preferred response order:

1. pause rollout;
2. preserve affected user DBs; do not reset;
3. ship a forward corrective build/migration from the reviewed branch;
4. use store rollback only when the prior binary is proven compatible with the upgraded schema;
5. communicate scope/recovery honestly.

OTA updates are deferred. If adopted later, runtime/schema compatibility, signed update channels, staged rollout and rollback get a dedicated decision/gate.

## Required sign-off

| Owner | Attests |
|---|---|
| Product owner | Scope, claims, MVP/exclusions and accepted user-facing risk |
| Engineering | Reproducible artefact, architecture, migrations, operational plan |
| Quality (independent) | Test evidence, defects, acceptance/data/offline/performance gates |
| Design/accessibility | Approved direction, repeated-use quality and accessibility manual gates |
| Privacy/security | Data flows, binary traffic, permissions, disclosures, scans and incidents |
| Release owner | Store metadata, staged rollout, monitoring/support and stop plan |

One person may hold multiple roles in a small team, but the primary author cannot be the sole reviewer of their own critical evidence.

## Final go/no-go rule

**GO** only when every MUST box is complete with build-specific evidence, all sign-offs are recorded, residual risks are understood and rollback constraints are viable.  
**NO-GO** for any missing critical evidence, P0/P1, data-safety/security/accessibility blocker, false store claim, untested migration/active-session restoration or unverified declared platform-backup behavior. Schedule pressure is not an exception.

## Deferred/reversible items

| Item | Class |
|---|---|
| Exact CI/test vendors and device farm | Reversible |
| Store staged-rollout percentages/windows | Reversible, set with monitoring capacity |
| OTA updates and remote telemetry | Deferred, separate security/privacy/recovery decisions |
| Accounts/cloud sync/payments | Deferred and outside first release |
| User-directed portable restore/import | Post-MVP (`FEAT-POST-009`) unless an explicit owner decision moves it and adds security/migration gates |
| Schema/data/export compatibility and signing identity | Expensive to reverse; release-critical |
