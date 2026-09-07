---
name: review-accessibility
description: Audit a NextSet screen, flow, design, or implementation for platform accessibility and WCAG 2.2 AA-compatible behaviour. Use during design review, component work, end-to-end testing, and before release readiness.
---

# Review accessibility

## Required inputs

- Target screens/flow and platform/device matrix
- Visual source or rendered build with all relevant states
- Requirement IDs and `docs/quality/accessibility-requirements.md`

## Procedure

1. Test semantic names/roles/values, reading and focus order, announcements, error identification, and state changes with VoiceOver and TalkBack where supported.
2. Test dynamic/system text scaling through the required maximum, bold text, display zoom, high contrast, dark/light themes, and orientation policy.
3. Measure critical touch targets and spacing; target at least 48×48 logical pixels.
4. Verify text/non-text contrast, non-colour redundancy, keyboard/switch paths, simple alternatives to gestures, and no focus obstruction.
5. Test Reduce Motion and remove nonessential movement, bounce, flashing, and timer-driven loss of control.
6. Check fitness-specific conditions: one-handed use, motion/fatigue, numeric clarity, rest-timer noninterference, offline/status announcements, and reversible destructive actions.

## Evidence required

- Device/OS/assistive-technology matrix, screenshots or recordings, measured target/contrast results, and exact reproduction steps
- Automated results plus manual results; automated checks never substitute for assistive-technology testing
- Requirement mapping and owner for every exception

## Failure conditions

Return `blocked` for an inaccessible critical journey, missing labels, clipped required content at target text sizes, colour-only state, unreachable controls, focus loss, unannounced data loss/error, or unjustified exception.

## Output

List P0–P3 findings with location, evidence, impact, fix, verification method, and final `pass|blocked` against the required matrix.
