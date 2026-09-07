# Open-source and development-tooling assessment

**Research date:** 6 August 2026 (Australia/Sydney)  
**Decision context:** NextSet is a local-first iOS/Android strength journal. The architecture documents currently propose React Native + Expo + TypeScript and SQLite, contingent on a spike; tooling recommendations below inherit that condition rather than independently approving the stack.

## Recommendation labels

- **Adopt:** use in the indicated phase, with the listed controls.
- **Borrow:** copy the workflow or pattern without installing the tool now.
- **Defer:** evidence may justify it later; adding it now creates more cost than value.
- **Reject:** do not use for the stated purpose.

“Active” means recent releases or repository work were visible on the research date. It is not a prediction of future maintenance. Licences must be rechecked at the exact pinned version and captured in an SBOM before release.

## Tool matrix

| Tool | Purpose | Activity and licence | Security/privacy posture | Cost and lock-in | Dependency/maintenance risk | Concrete benefit | Recommendation |
|---|---|---|---|---|---|---|---|
| **Codex `AGENTS.md`** | Durable repository instructions and scope boundaries | First-party Codex capability; licence is not a project dependency. Official guidance says to keep instructions small and use nested files closest to the work ([Codex guidance](https://developers.openai.com/codex/concepts/customization#agents-guidance)). | Instructions can reduce unsafe drift but are not enforcement. Pair with sandboxing, CI, review and protected branches. Never place secrets in instructions. | Included with Codex; low workflow lock-in because Markdown remains readable. | Stale/conflicting nested instructions can silently misdirect agents. | Defines source-of-truth docs, commands, ownership and “do not build yet” constraints once for every agent. | **Adopt now** |
| **Codex Skills** | Reusable research, review and implementation workflows | First-party Codex capability. Skills use a `SKILL.md` plus optional scripts/references/assets and load progressively; repository Skills use `.agents/skills` ([Codex Skills](https://developers.openai.com/codex/concepts/customization#skills)). The current managed workspace denied writes to `.agents/`, so the nine packages under top-level `skills/` are manual equivalent workflows in valid Skill format, not auto-discovered repository Skills. | Skill scripts are executable supply chain. Keep project-owned skills reviewable, pin external tools, use least permissions and require explicit approval for destructive/network actions. | Included; modest Codex workflow coupling, but Markdown/scripts are portable. | Too many overlapping skills increase routing ambiguity and hidden process. | Encodes NextSet-specific checks such as local-write durability, accessibility journeys, ADR validation and source-citation format. | **Adopt selectively; install into `.agents/skills` in a writable checkout** |
| **Native Codex subagents/worktrees** | Parallel bounded research, architecture and QA with isolated ownership | Stable built-in multi-agent capability is documented in the current Codex configuration reference; no runtime package enters the app ([Codex config reference](https://learn.chatgpt.com/docs/config-file/config-reference#configtoml)). | Agents share human-authorised scope. Use non-overlapping file ownership, read-only reviewers and a root integrator; worktrees reduce merge collisions but not incorrect reasoning. | Included; workflow is Codex-specific but artefacts remain normal files/commits. | Coordination overhead and duplicated research grow quickly; concurrent writes can conflict. | Parallelises independent artefacts without introducing an autonomous-agent framework into product code. | **Adopt now**; **reject** extra agent frameworks for this phase |
| **GitHub Spec Kit** | Spec-driven workflow from specification to plan, tasks and implementation | [Repository](https://github.com/github/spec-kit) is MIT-licensed and active at the research date; documentation describes Specify → Plan → Tasks → Implement ([docs](https://github.github.io/spec-kit/)). | Installer/scripts/templates must be reviewed before execution. Generated plans do not prove correctness or security. | Free/local; workflow conventions create moderate process coupling, not runtime lock-in. | Can duplicate existing PRD/ADR/backlog structures and add ceremony. | Useful checklists for resolving ambiguities and tracing tasks back to requirements. | **Borrow**, do not install yet |
| **React Native + Expo** | Cross-platform production application stack | [React Native](https://github.com/facebook/react-native) and [Expo](https://github.com/expo/expo) are MIT-licensed and active; exact versions must be selected together using the [Expo SDK reference](https://docs.expo.dev/versions/latest/). | Native build dependencies and config plugins can execute code at install/build time. Pin lockfiles, audit config plugins, minimise native modules and build from clean CI. | OSS/local builds are free; optional Expo Application Services are paid and create operational coupling, but are not required for local development builds. | New Architecture and SDK compatibility make version upgrades release work. | One typed product implementation with native escape hatches and maintained device APIs. | **Adopt only if ADR-0001 spike passes** |
| **`expo-sqlite` + SQLite** | Durable local source of truth, migrations and transactions | `expo-sqlite` ships in the MIT-licensed Expo repository; official docs say databases persist across restarts and document prepared/tagged statements ([Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)). SQLite is public domain ([SQLite copyright](https://www.sqlite.org/copyright.html)). | Parameterise every value, own migrations, enable integrity/foreign-key checks, test crash atomicity, and threat-model backups/encryption. SQLCipher introduces key-recovery cost. | Free and local; SQL schema is highly portable. Expo binding adds replaceable framework coupling behind a repository interface. | Schema errors can permanently damage user history; critical-path dependency. | Atomic offline set/workout writes and inspectable export without a backend. | **Adopt with migration/interrupt gates** |
| **WatermelonDB** | Reactive offline-first database layer and sync model | [Repository](https://github.com/Nozbe/WatermelonDB) is MIT-licensed and maintained, with a substantial open-issue surface at research time. | Additional query/sync abstraction expands attack and migration surface. Review advisories and do not expose sync endpoints without auth/threat modelling. | Free; high data-layer/API lock-in compared with parameterised SQLite repositories. | Native bindings, schema conventions and sync protocol add complexity before scale is known. | Could improve reactive performance for very large datasets and later custom sync. | **Defer** |
| **Storybook for React Native** | Isolated component states and visual/accessibility review | [Repository](https://github.com/storybookjs/react-native) is MIT-licensed and active, with current Expo/React Native guidance. | Stories may accidentally contain personal fixtures or debug controls. Use synthetic data and exclude development surfaces from release builds. | Free; moderate story-format/config lock-in, but components remain normal React Native code. | Metro/Expo compatibility must be checked on each stack upgrade. | Exercises set rows, timers, empty/error/offline states, themes and large-text variants without navigating the app. | **Adopt when production UI begins** |
| **React Native Testing Library** | Behaviour-focused component tests using role/name/state queries | [Repository](https://github.com/callstack/react-native-testing-library) is MIT-licensed and active. Pin a stable release compatible with the chosen React Native version. | Test semantics encourage accessibility but cannot prove native focus order, contrast or device behaviour. No production data should enter fixtures. | Free; low lock-in because tests use user-facing queries. | Renderer/version coupling and false confidence from mocked native APIs. | Fast tests for planned/actual labels, validation, completion state, reduced-motion branching and screen-reader names. | **Adopt after stack approval** |
| **Maestro** | Black-box cross-platform mobile E2E and smoke flows in YAML | [Repository](https://github.com/mobile-dev-inc/Maestro) is Apache-2.0-licensed and active; local CLI and optional cloud are available. | Test builds, screenshots and logs may contain personal data. Use synthetic accounts/data, scrub artifacts, restrict signing credentials and avoid cloud upload initially. | Local runner is free; hosted cloud is paid/optional and creates artifact/vendor coupling. CI device/macOS minutes still cost money. | UI selectors and timing can be flaky; iOS/Android capability is not identical. Pin the CLI. | Automates start/log/edit/finish/force-quit/offline smoke stories and visual screenshot checkpoints across platforms. | **Adopt locally after first vertical slice** |
| **Detox** | React Native grey-box E2E with synchronisation | [Repository](https://github.com/wix/Detox) is MIT-licensed and active, with 20.x releases visible at research time. | Native test binaries, simulator control and CI signing require careful credential and artifact handling. | Free; stronger React Native/native-build coupling than Maestro. | High setup/upgrade cost and brittle native integration can duplicate Maestro coverage. | Deep RN-aware synchronisation may solve flows where a black-box runner is insufficient. | **Defer**; re-evaluate from measured Maestro gaps |
| **axe-core** | Automated accessibility rules for web content | [Repository](https://github.com/dequelabs/axe-core) is MPL-2.0-licensed and active. Its support scope is HTML-based web interfaces. | Safe as a dev test when pinned, but results are incomplete and page fixtures must not contain personal data. | Free; low web-test lock-in. | It does not validate native iOS/Android semantics, focus, gestures or large-text layout. | Useful only for web prototypes, documentation or a future web surface. | **Adopt for web artefacts; reject as native proof** |
| **Platform accessibility tools** | VoiceOver, Accessibility Inspector, TalkBack, Accessibility Scanner and manual switch/keyboard testing | First-party OS tools, no app runtime licence. React Native documents the platform bridge ([RN accessibility](https://reactnative.dev/docs/accessibility)); Android requires combined manual/tool/user testing ([Android testing](https://developer.android.com/guide/topics/ui/accessibility/testing)). | Run on synthetic fixtures; screenshots and recordings can expose personal data. Automated scanners are not conformance. | Included with platform tooling; unavoidable platform coupling. | Manual coverage can decay unless journeys and device/version ownership are explicit. | Verifies real names, roles, focus, actions, reflow, contrast, motion and task completion. | **Adopt from the first vertical slice** |
| **React Native Reanimated** | UI-thread animation and gesture primitives | [Repository](https://github.com/software-mansion/react-native-reanimated) is MIT-licensed and active. | Native/worklet code expands upgrade and review surface. Honour reduced motion and never place persistence correctness behind animation completion. | Free; moderate React Native and native-version lock-in. | Compatibility is sensitive to React Native/Expo versions; overuse makes behaviour harder to test. | Can produce responsive reordering and state transitions when core native/layout animation is insufficient. | **Defer until a measured motion need** |
| **React Native Skia** | Custom high-performance 2D charts/graphics | [Repository](https://github.com/Shopify/react-native-skia) is MIT-licensed and active. | A drawn canvas has no automatic semantic equivalent. Provide accessible textual/table alternatives and sanitise exported images. | Free; meaningful binary size and Skia-specific rendering lock-in. | Native build/version, performance and accessibility burden is high for an MVP. | Enables bespoke large-history charts only if simple native/chart primitives fail measured needs. | **Defer** |
| **Sentry React Native SDK** | Crash/error/performance diagnostics | [SDK repository](https://github.com/getsentry/sentry-react-native) is MIT-licensed and active. The SDK is OSS; hosted Sentry is a third-party service. | Workout notes, exercise history, body metrics and identifiers must never be captured by default. Scrub breadcrumbs/attachments, define consent, region, retention and deletion; self-hosting still has operational risk. | Hosted tiers can cost money and create query/dashboard lock-in; raw events can be routed elsewhere only with design effort. | Native SDK upgrades and privacy configuration are ongoing release obligations. | Diagnoses intermittent crashes and release-specific failures that local logs miss. | **Defer until telemetry/privacy decision** |
| **fastlane** | Repeatable signing, build and store-release automation | [Repository](https://github.com/fastlane/fastlane) is MIT-licensed and active. | Signing keys, App Store Connect/Play credentials and screenshots are high-value secrets. Use short-lived/scoped credentials, encrypted CI secrets and protected release jobs. | Free/self-hosted; scripts are portable but platform APIs can change. CI macOS time costs money. | Ruby/plugin ecosystem and store API changes require maintenance. | Removes manual release variance and makes metadata/screenshots/build steps auditable. | **Defer until store accounts and first release candidate** |
| **Renovate** | Automated dependency update pull requests and grouping | [Repository](https://github.com/renovatebot/renovate) is AGPL-3.0-licensed and active; hosted and self-hosted modes exist. | The hosted app needs repository permissions; dependency PRs can introduce supply-chain changes. Never auto-merge runtime/native updates without clean builds and device smoke tests. | Hosted service has operational coupling; self-hosting costs maintenance. | Configuration noise and update volume can overwhelm a small team; licence obligations for modifications/deployment need review. | Keeps security and Expo-compatible dependency updates visible and grouped. | **Defer**; start with platform-native update alerts |

## Minimal recommended set by phase

### Foundation now

1. **Adopt native Codex `AGENTS.md`, focused Skills and bounded subagents.** Keep one human/root-agent integration owner and non-overlapping file ownership.
2. **Borrow Spec Kit’s traceability:** every task links to a requirement/ADR and includes evidence plus acceptance criteria. Do not add another parallel folder taxonomy.
3. **Reject third-party autonomous-agent frameworks.** The project does not need an agent runtime, vector database or orchestration service to produce product documentation or app code.

### Architecture spike

1. Pin the approved Expo/React Native versions in a lockfile and generate clean native projects.
2. Use raw parameterised `expo-sqlite` behind repository interfaces; add migration, failure-injection and export fixtures before UI breadth.
3. Add React Native Testing Library for state/semantic component tests.
4. Run the platform accessibility tools manually from the first start/log/finish journey.

### First vertical slice

1. Add Storybook only for durable production components and real error/offline/large-text states.
2. Add local Maestro smoke flows for launch → start → log/edit → background/force-quit → recover → finish/export.
3. Keep motion on core primitives; introduce Reanimated only if profiling or interaction fidelity establishes a gap.

### Release preparation

1. Add fastlane after signing identities and store metadata exist, with protected manual release approval.
2. Decide on crash telemetry only after the privacy/threat model; if Sentry is selected, start with maximum data minimisation.
3. Add dependency automation conservatively. Never auto-merge native or data-layer changes.

## Security and supply-chain gate

Before any new tool or package enters the repository:

- record purpose, owner, exact version, direct/transitive licence and source;
- prefer an actively maintained first-party/platform package over a convenience wrapper;
- review install/build scripts and native config plugins;
- commit one lockfile and require immutable installs in CI;
- generate an SBOM and licence inventory for release builds;
- run vulnerability scanning, but treat findings as triage inputs rather than automatic truth;
- forbid secrets, production data and personal workout fixtures in tests, stories, logs and screenshots;
- require clean iOS and Android release builds after native dependency changes;
- document removal/migration strategy for anything in the persistence, navigation or telemetry boundary.

## Multi-agent development protocol

Native Codex features are sufficient if the work is decomposed by artefact and risk:

1. Root agent defines shared sources of truth, file ownership and acceptance checks.
2. Research/product/architecture agents work in non-overlapping paths and cite current primary sources.
3. Implementation agents receive one vertical capability plus tests, not a vague “build the app” brief.
4. A separate read-only reviewer checks requirement traceability, data durability, accessibility and dependency changes.
5. Root agent resolves contradictions and runs repository-wide validation before integration.

Do not ask multiple agents to design the same source-of-truth file and then merge prose. Parallelism is valuable for independent evidence and verification; it is harmful when ownership is ambiguous.

## Explicitly deferred tooling

- Backend-as-a-service, authentication, sync engines, analytics/CDP and feature-flag platforms: no approved MVP need.
- AI/LLM runtime, embeddings, vector database or autonomous coaching framework: conflicts with explainable, deterministic MVP progression.
- Camera/sensor repetition-count SDKs: evidence, device and privacy burden exceed current value.
- Heavy charting/canvas runtime: raw history and simple accessible trends should prove the need first.
- Cloud device farms and hosted visual-regression services: start with a small physical-device/simulator matrix; adopt only from measured coverage/capacity constraints.

## Uncertainties

- Repository activity and licence terms can change; recheck the selected tag, not just the default branch.
- No production dependency graph or CI platform exists yet, so build-time, binary-size and CI-cost estimates remain qualitative.
- Maestro versus Detox must be decided from the actual React Native build, not repository popularity.
- SQLite wrapper ergonomics and release-build performance remain spike questions.
- Hosted service prices, data regions and terms were not compared because telemetry and cloud build services are not approved requirements.

The central recommendation is deliberately small: native Codex workflow controls, a pinned production stack, SQLite, behaviour-focused component tests, real platform accessibility checks and one black-box E2E layer. Every additional framework must solve a measured problem.
