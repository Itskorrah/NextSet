---
name: implement-visual-direction
description: Implement an approved NextSet mobile screen or flow from a selected visual reference and design-system direction. Use only after a direction is explicitly selected and the target mock, viewport, states, requirements, and production-phase authority are available.
---

# Implement a visual direction

## Required inputs

- Exact selected visual source and direction name
- Target viewport, platforms, screens, interaction states, and approved requirement IDs
- Relevant design tokens, accessibility requirements, and existing components
- Explicit authority to change production code; prototype authority alone is not production authority

## Procedure

1. Read `AGENTS.md`, the nearest scoped `AGENTS.md`, and the approved design, journey, requirement, and architecture documents.
2. Open the source visual; inventory typography, spacing, colours, shapes, assets, content, states, and responsive behaviour.
3. Reuse the established mobile runtime and components. Do not redraw icons or image assets with CSS or inline SVG.
4. Implement the smallest complete flow, including focus, pressed, disabled, loading, empty, error, offline, large-text, and reduced-motion behaviour that applies.
5. Preserve 48×48 logical-pixel critical targets, semantic labels, logical focus order, local-first save feedback, and user override paths.
6. Run unit/component checks and render the same viewport/state as the source.
7. Invoke `$run-visual-qa`; fix all P0–P2 findings before handoff.

## Evidence required

- Source visual path and implementation screenshot path at matched viewport/state
- Requirements and tokens used; asset/font licences
- Validation commands and results; screen-reader/large-text/reduced-motion evidence
- Interaction recording or deterministic steps for the primary journey

## Failure conditions

Return `blocked` when no exact visual source is selected, production authority is absent, required assets cannot be used legally, the runtime cannot be rendered, or P0–P2 visual/accessibility findings remain.

## Output

Report implemented requirements and states, source-to-render evidence, validations, residual P3 polish, blockers, and a single review action.
