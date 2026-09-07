# NextSet technology evaluation

Status: proposed for product-owner approval  
Decision date: 2026-08-06  
Research access date: 2026-08-06  
Related decisions: [ADR-0001](adrs/0001-mobile-stack.md), [ADR-0002](adrs/0002-local-first-storage.md), [ADR-0003](adrs/0003-defer-cloud-backend.md)

## Outcome

Recommend **React Native with Expo, TypeScript, development builds and Continuous Native Generation**, with SQLite as the authoritative store. This is not a recommendation to stay inside Expo Go or to avoid native code. A development build is a normal React Native application and can include project-specific native libraries and configuration.

The recommendation is conditional on an implementation spike passing the data-integrity, accessibility and release-build performance gates below. Flutter is the credible fallback if React Native cannot meet those gates. Native SwiftUI plus Jetpack Compose is the quality ceiling but does not justify two product implementations for the expected first-release team. Compose Multiplatform is now a serious option, but its current platform-specific gaps and smaller cross-platform mobile ecosystem make it a less suitable default for NextSet.

## Non-negotiable constraints

- A set commit, workout edit and workout completion succeed with no network.
- SQLite acknowledges the transaction before the UI reports that critical data is saved.
- An interrupted active workout is restored from durable domain state, not reconstructed from navigation state.
- The domain and data layers are independent of React components and any future backend SDK.
- VoiceOver, TalkBack, large text, reduced motion, haptics and local notifications are validated on real devices.
- Production behaviour is tested in release builds; development-mode frame timings are not evidence.
- A dependency cannot enter the critical write path without an owner, licence check, compatibility check and failure test.

## Options considered

### A. React Native with Expo (recommended)

Use the current stable Expo SDK when implementation begins, pin every runtime dependency, and use a custom development build from the start. The official Expo SDK matrix available on the access date lists SDK 57 with React Native 0.86, while Expo documents that SDK 55 and later use only React Native's New Architecture. Those versions are evidence of currency, not a version pin for a future implementation. [Expo SDK reference](https://docs.expo.dev/versions/latest/) and [New Architecture guide](https://docs.expo.dev/guides/new-architecture/) (accessed 2026-08-06).

Strengths:

- One TypeScript product implementation across iOS and Android, with a large React ecosystem and good Codex effectiveness.
- First-party `expo-sqlite` persists across restarts, exposes transactions and supports build-time SQLite configuration; SQLCipher is available if a later threat-model decision warrants its key-management cost. [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (accessed 2026-08-06).
- React Native exposes native accessibility roles, names, state, values and actions for VoiceOver and TalkBack, while still requiring platform-specific testing. [React Native accessibility](https://reactnative.dev/docs/accessibility) (accessed 2026-08-06).
- Expo supplies maintained adapters for haptics, notifications, secure small-value storage and deferrable background work. The operating system still controls whether haptics fire and when background work runs; none may be treated as guaranteed. [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/), [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) and [Expo BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/) (accessed 2026-08-06).
- Development builds allow arbitrary native libraries and configuration, and can build locally without an Expo account. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/) (accessed 2026-08-06).

Risks and controls:

- JavaScript-thread work can cause dropped interaction frames. Keep SQL and rule evaluation bounded, virtualise history lists, avoid broad re-renders and profile release builds. React Native documents a 16.67 ms frame interval at 60 Hz and warns that development mode is not representative. [React Native performance](https://reactnative.dev/docs/performance.html) (accessed 2026-08-06).
- Native-library compatibility changes with the New Architecture. Maintain a small dependency set, run native builds on every dependency update and require both-platform smoke tests before merging.
- Expo background tasks are deferrable and platform-scheduled; iOS may run them later and terminated-app behaviour differs. Workout safety therefore never depends on a background callback.
- Over-the-air JavaScript updates can create runtime/schema mismatch. Any later OTA adoption must bind update runtime versions to native and schema compatibility, stage rollouts, and preserve rollback. OTA is deferred from the first release unless separately approved.

### B. Flutter

Flutter is a strong alternative with predictable rendering, mature unit/widget/integration test layers and a coherent single-language toolchain. Official documentation describes natively compiled multi-platform apps, platform channels for native integrations, and an offline-first pattern. [Flutter platform integration](https://docs.flutter.dev/platform-integration), [Flutter testing](https://docs.flutter.dev/testing/overview) and [Flutter offline-first](https://docs.flutter.dev/app-architecture/design-patterns/offline-first) (accessed 2026-08-06).

Why it is not first choice:

- The team would adopt Dart and Flutter-specific patterns while NextSet's product logic, prototype tooling and likely contributor pool benefit from TypeScript/React familiarity.
- Critical SQLite, secure storage and some device features rely on plugins whose ownership must be assessed separately from the Flutter SDK.
- Custom rendering is excellent, but native-feeling text input, accessibility, platform UI and notification behaviour still require per-platform verification. Flutter's own integration test package cannot interact with native platform UI such as permission dialogs or notifications, so another layer is needed for complete E2E coverage.

Fallback trigger: switch before production feature work if the React Native spike misses a must-pass performance or accessibility gate for reasons intrinsic to the framework rather than the prototype implementation.

### C. Native iOS and Android

SwiftUI and Jetpack Compose provide direct access to each platform, the strongest native behaviour and first-party testing/profiling. Apple describes SwiftUI as its declarative UI framework; Google describes Jetpack Compose as Android's recommended modern native UI toolkit. [SwiftUI](https://developer.apple.com/swiftui/) and [Jetpack Compose](https://developer.android.com/compose) (accessed 2026-08-06).

Why it is not first choice:

- Two UI, persistence, migration, accessibility and E2E implementations materially slow the first release.
- Domain rules can drift unless a separate cross-platform specification and conformance suite are maintained.
- Cross-platform parity and defect fixing cost more for a small team, even though platform-specific quality can be higher.

Reconsider when platform-specific experiences become the differentiator, the team can sustainably staff both platforms, or a measured framework ceiling blocks required quality.

### D. Kotlin and Compose Multiplatform

Compose Multiplatform is the only materially credible additional alternative found. JetBrains documents Android and iOS targets as stable and provides SwiftUI/UIKit interoperability. It also documents platform-specific APIs that are absent from common code and differences that require per-platform handling. [Compose Multiplatform FAQ](https://kotlinlang.org/docs/multiplatform/faq.html), [platform specifics](https://kotlinlang.org/docs/multiplatform/compose-platform-specifics.html) and [Android-only APIs](https://kotlinlang.org/docs/multiplatform/compose-android-only-components.html) (accessed 2026-08-06).

Why it is not first choice:

- It is strongest for Kotlin-centred teams; NextSet would otherwise pay language, build and ecosystem adoption cost.
- Some platform services remain target-specific and the iOS accessibility/tooling path has less project evidence than React Native or fully native development.
- Shared UI can encourage lowest-common-denominator behaviour unless platform adaptation is designed and reviewed deliberately.

Reconsider if the implementation team is Kotlin-first or shared domain logic becomes more valuable than React ecosystem velocity.

### E. WebView-first wrappers

Capacitor/Ionic and similar WebView-first approaches were screened out. They can ship cross-platform CRUD products quickly, but NextSet's repeated numeric entry, keyboard handling, long virtualised workout lists, haptics, accessibility semantics and native motion make them materially weaker than the four options above. No weighted score is assigned.

## Required-criterion comparison

Scores are 1–5 and express suitability for NextSet's expected first-release team. The following full matrix prevents the weighted roll-up from hiding a required criterion.

| Required criterion | RN + Expo | Flutter | Native x2 | Compose MP | Decision note |
|---|---:|---:|---:|---:|---|
| Cross-platform quality | 4 | 5 | 3 | 4 | Shared code helps parity; native has two implementations to keep aligned. |
| Native interaction quality | 4 | 4 | 5 | 4 | Every shared toolkit still needs per-platform keyboard, gesture and screen-reader QA. |
| Offline storage | 5 | 4 | 5 | 4 | Expo has a maintained SQLite module; other shared stacks require a separately assessed persistence dependency. |
| Animation | 4 | 5 | 5 | 5 | All can meet restrained product motion; React Native needs release-thread/frame proof. |
| Custom graphics | 4 | 5 | 5 | 5 | Flutter/Compose/native have particularly direct drawing models; NextSet does not yet require a graphics-heavy engine. |
| Accessibility | 4 | 4 | 5 | 3 | Native has the shortest path to new platform APIs; all options require physical-device validation. |
| Haptics | 5 | 4 | 5 | 4 | Expo has a maintained adapter; operating-system/user settings remain authoritative. |
| Testing | 4 | 5 | 5 | 4 | Flutter/native have coherent first-party layers; full native OS interaction still needs device-level E2E. |
| Maintainability | 4 | 4 | 2 | 3 | Native doubles product/migration suites; Compose MP is best with an established Kotlin team. |
| Development velocity | 5 | 3 | 2 | 3 | TypeScript/React best matches assumed team and prototypes; assumption must be confirmed. |
| App-store delivery | 5 | 4 | 3 | 3 | Expo streamlines common builds while still allowing local native builds; store policy applies equally. |
| Codex effectiveness | 5 | 3 | 2 | 3 | One TypeScript tree offers the broadest current automation/context leverage for this project. |
| Ecosystem maturity | 4 | 4 | 5 | 3 | Native APIs are the platform baseline; RN/Flutter ecosystems are broad but package quality varies. |
| Dependency risk | 4 | 4 | 5 | 3 | A small Expo module set is manageable; shared stacks require compatibility tracking. |
| Long-term flexibility | 4 | 4 | 5 | 4 | Framework-free domain/SQL contracts reduce, but cannot eliminate, future rewrite cost. |
| Performance | 4 | 5 | 5 | 5 | React Native must prove JS/UI-thread behaviour with the long-workout release fixture. |
| Background operation | 4 | 4 | 5 | 3 | OS scheduling is nondeterministic in every stack; native has the most direct API access. |
| Local notifications | 5 | 4 | 5 | 4 | All are capable; permission, channels and delivery behaviour remain platform-specific. |

## Weighted decision

Scores are 1 (poor) to 5 (excellent). Weighted total is `sum(weight × score) / 5`, yielding a score out of 100. The numbers are an auditable judgement, not benchmark results; the spike replaces assumptions with evidence.

| Criterion | Weight | RN + Expo | Flutter | Native x2 | Compose MP |
|---|---:|---:|---:|---:|---:|
| Local-first capability and data safety | 17 | 5 | 4 | 5 | 4 |
| Native UX and performance ceiling | 12 | 4 | 5 | 5 | 5 |
| Cross-platform parity | 10 | 4 | 5 | 3 | 4 |
| Accessibility capability | 9 | 4 | 4 | 5 | 3 |
| Haptics, notifications, background work | 8 | 4 | 4 | 5 | 4 |
| Automated-test ergonomics | 9 | 4 | 5 | 5 | 4 |
| Store build and delivery workflow | 6 | 5 | 4 | 3 | 3 |
| Development velocity and Codex effectiveness | 10 | 5 | 3 | 2 | 3 |
| Maintainability for expected team | 7 | 4 | 4 | 2 | 3 |
| Ecosystem maturity and dependency risk | 7 | 4 | 4 | 5 | 3 |
| Long-term extensibility | 5 | 4 | 4 | 5 | 4 |
| **Weighted total / 100** | **100** | **86.6** | **84.2** | **83.4** | **74.6** |

Sensitivity: lowering delivery/velocity weight by 8 points and moving it to rendering performance makes Flutter the likely winner. Doubling expected team size improves native development. The current recommendation therefore depends on the stated first-release context, not a claim that one framework is universally best.

## Required architecture spike

Build only enough disposable production-stack code to test risk; it is not permission to implement the application.

| Gate | Must-pass evidence |
|---|---|
| Durable active workout | Create 12 exercises × 8 sets, terminate the process after each type of write, relaunch 100 times; zero acknowledged writes missing and exactly one active session restored. |
| Transaction failure | Inject a failure at every statement in set-completion and workout-completion transactions; every run yields either the complete before-state or complete after-state. |
| Migration safety | Migrate fixtures from every released schema (initially N-1) with interruption injection; original DB retained on every failure and integrity checks pass on success. |
| Interaction latency | On the agreed low-tier supported iOS and Android devices, release-build set commit feedback p95 ≤100 ms and p99 ≤200 ms across 500 commits. |
| Rendering | Active-workout scroll and set-entry animations meet the frame budget in `docs/quality/performance-budgets.md`; no sustained jank under the long-workout fixture. |
| Accessibility | VoiceOver and TalkBack complete start/log/edit/finish/restore; 200% text does not hide critical controls; reduced motion removes nonessential spatial movement. |
| Platform services | Local rest-timer notification, haptics-off behaviour, app lock/foreground/background transitions and time changes work on physical devices. Background delivery is not asserted as guaranteed. |
| Build reproducibility | Clean iOS and Android release builds from the lockfile in CI; software-bill-of-materials and licence inventory generated. |

Failure response: diagnose and optimise once. If a must-pass gate still fails because of an intrinsic framework limitation, run the identical spike in Flutter and update ADR-0001 before product implementation.

## Decision reversibility

| Decision | Class | Reason |
|---|---|---|
| React Native + Expo | Expensive to reverse | Rewrites the presentation/platform layer; domain contracts and SQL schema reduce but do not remove cost. |
| TypeScript domain modules with no React imports | Must | Preserves testability and makes a future UI rewrite possible. |
| Expo development builds, not Expo Go | Must | Production native configuration, SQLite/security testing and real release behaviour require it. |
| Exact current stable Expo SDK | Reversible | Pin at implementation start; upgrade only through compatibility and migration gates. |
| Raw parameterised SQLite repositories initially | Reversible | A typed query layer can be adopted behind repository interfaces after evidence. |
| Cloud backend and account system | Defer | No first-release user problem requires them; premature choices create privacy and sync commitments. |
| OTA updates | Defer | Useful later, but schema/runtime compatibility and rollback need a dedicated decision. |
| SQLCipher | Defer decision | Database encryption changes backup and key recovery; the platform sandbox/storage encryption is the initial baseline. |

## Open evidence gaps

- No NextSet production UI, device matrix or representative large-history fixture exists yet, so performance scores remain hypotheses.
- Team composition and native expertise are assumed to favour TypeScript/React; this must be confirmed before implementation.
- Minimum supported iOS/Android versions are not approved. They affect Expo SDK choice, device coverage and accessibility behaviour.
- The necessity of database-level encryption depends on the approved threat model, backup design and whether future data categories become more sensitive.
