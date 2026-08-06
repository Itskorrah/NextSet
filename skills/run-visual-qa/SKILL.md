---
name: run-visual-qa
description: Compare a rendered NextSet mobile implementation with its approved visual source and interaction specification. Use after visual implementation, before handoff, and whenever typography, tokens, layout, assets, responsive behaviour, or key states change.
---

# Run visual QA

## Required inputs

- Approved source image/frame and rendered implementation
- Matched viewport, pixel density, device, theme, content, and interaction state
- Applicable design, accessibility, and content specifications

## Procedure

1. Open both artefacts and create a same-size side-by-side or overlay comparison; do not review from code or memory.
2. Check composition and hierarchy, then focused regions for typography, spacing, colour/tokens, assets/icons, content, controls, and state cues.
3. Check thumb reach, 48×48 targets, contrast, text scaling, focus, screen-reader meaning, and reduced motion.
4. Classify findings: P0 blocks use/safety; P1 major mismatch; P2 moderate drift; P3 optional polish.
5. Fix P0–P2 findings, recapture the same state, and compare again. Record every iteration.
6. Do not pass from build success, HTTP health, or screenshots that were never compared with the source.

## Evidence required

- Source and implementation paths, pixel dimensions, CSS viewport, density, device, theme, and state
- Full-view comparison plus focused-region evidence or reason none is needed
- Findings, fixes, and post-fix captures for each P0–P2 iteration
- Primary interactions tested and console/runtime errors checked

## Failure conditions

Return `blocked` when either artefact is missing, states cannot be normalized, runtime capture is unavailable, or actionable P0–P2 findings remain.

## Output

Write `design-qa.md` beside the implementation with findings, open questions, implementation checklist, comparison history, follow-up P3 polish, and `final result: passed|blocked`.
