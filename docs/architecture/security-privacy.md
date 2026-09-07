# Security and privacy foundation

Status: proposed baseline; requires review before implementation and before each release  
Date: 2026-08-06

## Privacy position

NextSet is local-only by default. It needs no account, contact list, precise location, advertising identifier, photo library, microphone, camera or health-platform permission to deliver its first-release promise. Workout history, goals, custom exercise names, gym labels and notes are private user content even when they are not legally classified as medical data.

The product must say what is true: “Saved on this device” is not “backed up,” and “deleted from this device” is not deletion of a file the user shared or a historical platform backup.

## Data inventory and classification

| Class | Examples | Storage/handling |
|---|---|---|
| Private workout content | sets, loads, reps, RPE/RIR, completed history, programmes, goals, notes, gym labels | App-private SQLite; included only in user-directed export/backup; never logs/telemetry. |
| Sensitive credentials (future) | account refresh token, dataset encryption key | Keychain/Keystore-backed SecureStore only; never SQLite/log/export. |
| Preferences | units, appearance, haptic/timer choices | SQLite; sync only by explicit future scope. |
| Shipped public content | exercise catalogue, licensed instructions metadata | Signed app/seed data; licence/source tracked. |
| Operational diagnostics | app/build/schema version, operation/error code, timings, random correlation ID | Content-free, bounded retention, local unless opt-in transmission is approved. |
| Derived private data | PRs, recommendations, charts | Same protection as source; reproducible and invalidated on source edit. |

Do not infer/store gender, exact age, body-image scores, injuries, diagnosis or precise gym location without a separately approved user problem, consent and data model.

## Threat model

### In scope

- Another app reading exported or app data through misconfigured storage/sharing.
- Sensitive data leaking through logs, crash reports, screenshots/previews or notifications.
- Malicious/tampered catalogue assets or deep links, plus portable imports only if that post-MVP feature is later approved.
- SQL injection and unsafe dynamic queries.
- Lost/stolen locked or unlocked devices.
- Dependency/supply-chain compromise.
- Accidental destructive actions, corrupt migrations and data-loss bugs.
- Future credential theft, cross-account access and sync conflicts.
- A support/analytics vendor receiving more content than disclosed.

### Not fully controllable but disclosed

- A rooted/jailbroken or actively compromised operating system.
- A person with the unlocked device and app access before an optional app-lock feature exists.
- Copies already shared to another provider/device.
- Forensic recovery characteristics of flash storage and backups controlled by the OS/vendor.

No security claim may imply protection beyond the tested model.

## First-release controls

### Storage

- Store data only in the platform app-private container; never external/public paths.
- Rely initially on OS sandbox and device storage encryption. Evaluate app-level database encryption separately; do not enable it without key recovery/backup design.
- Use SQLite constraints, foreign keys, parameterised statements, explicit transactions and integrity checks.
- SecureStore is for small secrets only. Expo says it should not be the sole source of truth for irreplaceable critical data and notes Android values are not preserved across uninstall. [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) (accessed 2026-08-06).
- If an app-lock is later approved, treat biometrics as a local gate, not identity proof or encryption-key recovery. Biometric changes can invalidate protected SecureStore values.

### Least privilege

- Request notification permission only when the user enables timer reminders and after explaining value; the workout/timer still works if denied.
- Haptics require no user data and respect system/user settings.
- No background, network, location, Bluetooth, contacts, health, camera or photo permission by default.
- Add a permission only with a requirement, platform-specific denial path, privacy inventory update and E2E test.

### Input and code safety

- Parameterise SQL values; allow-list sortable columns/enums; never interpolate user text.
- Validate lengths, numeric ranges, Unicode and relationship ownership in both application and database layers.
- Treat catalogue and any consumed package as hostile: size limits, ZIP-bomb/path-traversal defence, schema validation, checksums and no executable content. MVP does not consume its exported package; a future approved import/restore must use a temporary isolated database.
- Deep links allow-list routes/parameters and require confirmation for destructive state changes.
- Never evaluate remote strings as code or rules.
- Production builds disable developer menus, verbose SQL logging and test backdoors.

### Logging and diagnostics

- Structured allow-list only: timestamp, app/build/schema, platform/OS class, operation code, duration bucket, error code, correlation ID.
- Prohibit workout values, note/custom labels, SQL bindings, export contents/paths, tokens, database files and stable entity IDs.
- Redact exceptions before any third-party boundary; SDK defaults are not assumed safe.
- Local logs rotate and have a documented short retention. User explicitly previews/approves diagnostic sharing.
- Android warns that logcat disclosure can expose personal data and recommends developer-only logging for sensitive details. [Android log disclosure guidance](https://developer.android.com/privacy-and-security/risks/log-info-disclosure) (accessed 2026-08-06).

### Screens, clipboard and notifications

- Rest notifications use generic configurable text by default (for example, “Rest timer complete”), not exercise, goal, weight or note content.
- App-switcher privacy shielding is a product/security option; enable for content-heavy workout/history screens if user testing shows acceptable interruption behaviour.
- Do not copy workout data to clipboard automatically; show confirmation and rely on OS clipboard behaviour.
- Share cards default to minimum fields and show a preview of exactly what leaves the app. Strip metadata from generated images where possible.

## Encryption decisions

### At rest

Initial baseline: app sandbox plus platform storage encryption. SQLCipher is supported as an Expo SQLite build option, but enabling it introduces a database key whose loss can make a valid backup unreadable. [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (accessed 2026-08-06).

SQLCipher/app-level encryption requires a separate decision answering:

- threat being mitigated beyond OS protection;
- key generation/storage/accessibility class;
- device transfer, backup restore and biometric-change behaviour;
- recovery without a cloud account;
- performance on minimum devices;
- export and deletion behavior, plus import only if the post-MVP capability is approved;
- cryptography/export compliance.

Never create a custom cipher or store the database key alongside the encrypted DB.

### In transit (future)

Use current platform TLS defaults, certificate validation and short-lived scoped tokens. Do not add custom certificate bypass/pinning without an operational rotation design. End-to-end encryption versus service-readable content is a pre-backend architecture decision, not a late hardening task.

Apple recommends platform Security framework services rather than implementing cryptography because cryptographic bugs are costly, and identifies Keychain for small secrets. [Apple Security](https://developer.apple.com/documentation/security/) and [Keychain Services](https://developer.apple.com/documentation/security/keychain-services) (accessed 2026-08-06).

## Backup, export and future import privacy

- Standard platform backup rules explicitly include/exclude each data class; do not rely on defaults without testing.
- Exclude SecureStore entries on Android backup where restored values would be undecryptable; Expo's configuration supports this.
- Stage exports only inside app-private temporary storage, verify, invoke system picker/share UI, then delete owned staging copies.
- Before export, state that files contain workout history and the chosen destination controls security.
- Human-readable CSV omits revisions/deleted content and private notes by default; complete machine-readable export inclusion is explicit.
- User-directed portable restore/import is post-MVP under `FEAT-POST-009`. If approved later, imports are validated in isolation and show exactly how many programmes/workouts/notes will be added/replaced.
- Never upload an export automatically for support.

Android recommends its standard backup system and warns that non-standard exported copies may leak data if placed in broadly readable storage. [Android backup security](https://developer.android.com/privacy-and-security/risks/backup-best-practices) (accessed 2026-08-06).

## Deletion and retention

### Individual deletion

Use a recoverable tombstone/undo window for accidental workout or programme deletion. The UI distinguishes archive from delete. Derived data is invalidated. In a future sync system, tombstones persist until replica acknowledgement/retention policy.

### Delete all local data

Two deliberate confirmations that identify consequences, with an export option but no manipulative friction. Cancel notifications/jobs; close DB; remove DB, WAL/SHM, caches, revision/conflict data, staging files and SecureStore values; recreate only shipped catalogue. Verify the app opens as a new local installation.

Disclose that user-shared exports and platform/vendor backups are outside immediate app control. Do not promise forensic secure erasure on flash. No “account deletion” language exists until accounts exist.

### Future account deletion

Must revoke sessions, queue server dataset deletion, expose status, delete/retain backups under a published policy, and distinguish local-device cleanup. Legal retention exceptions require plain disclosure. Test cross-tenant absence after deletion.

## Third parties and analytics

Default: no advertising SDK, session replay, remote feature flag, behavioural analytics or production network error SDK.

A future SDK requires:

- approved purpose and data-flow diagram;
- vendor/subprocessor, hosting, retention, deletion and breach review;
- current licence/security/maintenance assessment;
- proxy capture proving actual fields/endpoints;
- opt-in/opt-out and store-label alignment where required;
- kill switch and removal plan;
- prohibition on screen/session replay in workout, programme, history, note and export surfaces.

Product metrics can initially be computed locally and shown to the user. Never repurpose the future sync change log as analytics.

## Supply chain and build security

- Lock exact dependencies and package-manager version; review lockfile changes.
- Minimise native dependencies and run vulnerability, licence and provenance/SBOM checks.
- Use protected CI secrets, least-privilege signing access and separate development/production identifiers.
- Release binaries come from reviewed commit/lockfile; verify signing, entitlements/permissions and source maps/symbol handling.
- No credentials, keystores, provisioning profiles, `.env` values or production exports in Git.
- An Expo/React Native SDK upgrade runs clean native builds plus migration, privacy traffic and offline fault suites.

## Future backend security baseline

- Tenant authorisation on every object and mutation; stable object ID is not permission.
- OIDC/passkey-capable identity, secure system browser, token rotation/revocation and recovery abuse controls.
- TLS, managed encryption at rest, audited least-privilege service/database access and secret rotation.
- Idempotency, rate/body limits, schema validation and immutable security audit events.
- Content-redacted logs, backup restore drills, incident response/on-call and dependency patch ownership.
- Data export/delete endpoints and cross-tenant automated tests before beta.
- Threat model and independent security review before real user data.

## Security/privacy release gates

- Permission diff is reviewed; no unexplained sensitive capability/entitlement.
- Static secret scan and dependency vulnerability/licence/SBOM checks pass with no unaccepted critical/high finding.
- Proxy/device capture in every core journey matches the local-only claim; unexpected outbound request blocks release.
- Logs/crash artefacts/export staging inspected with seeded private strings; zero seeded string escapes an approved user export.
- Export schema/content/checksum and staging tests prove that no failed export is reported successful and no private staging copy remains.
- Delete-all inspection finds no app-owned user content; limitations about external/OS copies are shown.
- Declared platform backup inclusion/exclusion and supported OS restore behavior are tested on both platforms; no undecryptable DB/key mismatch.
- VoiceOver/TalkBack do not announce hidden private content behind a modal/app shield.
- Store privacy/data-safety disclosures match the tested binary and third-party SDK list.

## Classification and open questions

| Decision | Class |
|---|---|
| Local-only/data minimisation/no ads or session replay | Must for first release |
| App-private storage, parameterised SQL, redacted logs | Must; release blocking |
| SQLCipher/app lock | Deferred pending threat/recovery decision; reversible only before adoption |
| Portable backup encryption | Deferred pending vetted design |
| User-directed portable restore/import | Post-MVP (`FEAT-POST-009`) unless the product owner explicitly moves it and adds security/migration gates |
| Analytics/crash vendor | Deferred and reversible before collection |
| Backend encryption model | Deferred, expensive to reverse after upload |

If the product owner later moves portable restore/import into scope, a malicious package corpus must prove no path traversal, resource exhaustion, code execution or live-DB overwrite before release.

Open: minimum OS/device policy; whether/when to move post-MVP portable restore into a future release; local log retention; app-switcher shielding; whether workout data will later integrate with HealthKit/Health Connect; jurisdiction/age policy before account launch. The current first-release default remains no portable restore/import.
