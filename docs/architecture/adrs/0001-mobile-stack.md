# ADR-0001: React Native with Expo for the mobile stack

- Status: accepted
- Date: 2026-08-06
- Owners: architecture and product owner
- Decision class: expensive to reverse
- Approval required: recorded in D-010 on 2026-09-07

## Context

NextSet needs one premium iOS/Android experience, fast repeated set entry, robust local persistence, accessibility, haptics, local notifications and a small-team delivery model. Framework familiarity alone is not a valid reason to choose a stack. The weighted analysis is in [technology-evaluation.md](../technology-evaluation.md).

## Decision

Use React Native with Expo and TypeScript. Begin with a custom development build and Continuous Native Generation; Expo Go is not the production development environment. Pin the current stable Expo SDK and all dependencies at implementation kickoff after the architecture spike. Use the React Native New Architecture supported by that SDK.

Keep domain and application modules framework-free. React components may call application use cases, never SQL or future network clients directly. Native modules are permitted when a measured requirement cannot be met by a maintained Expo module.

## Consequences

Positive:

- One product implementation and shared domain test suite across iOS and Android.
- Direct access to maintained Expo modules plus an escape hatch to native Swift/Kotlin.
- TypeScript/React is effective for Codex-assisted development and broad contributor availability.

Negative:

- Performance can be harmed by JavaScript-thread work and broad React re-renders.
- Dependency compatibility must be checked against each Expo/React Native release.
- Platform accessibility and interaction differences remain; shared code does not remove two-platform QA.

Controls:

- Must pass the release-build architecture spike in the technology evaluation.
- Keep critical dependency count small and run clean native builds after upgrades.
- Profile on physical low-tier supported devices.
- Validate VoiceOver and TalkBack manually; component props alone are insufficient evidence.

## Alternatives

- Flutter: fallback if the spike demonstrates an intrinsic React Native quality ceiling.
- Native SwiftUI/Compose: reconsider with sustainably staffed platform teams or a platform-specific differentiator.
- Compose Multiplatform: reconsider for a Kotlin-first team.
- WebView-first wrapper: rejected for the repeated interaction and native-behaviour requirements.

## Revisit triggers

- A must-pass performance/accessibility spike gate fails after one evidence-led optimisation pass.
- More than 20% of critical screens require bespoke native views or modules.
- Framework upgrades repeatedly block supported OS/store requirements.
- Team composition changes materially before implementation begins.

## Evidence

Official Expo documentation states that development builds can use native libraries/configuration, and official React Native documentation exposes both platform accessibility APIs and release-mode performance guidance. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/), [React Native accessibility](https://reactnative.dev/docs/accessibility), [React Native performance](https://reactnative.dev/docs/performance.html) (accessed 2026-08-06).
