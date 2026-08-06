---
name: review-product-requirements
description: Review proposed or changed NextSet product requirements for user value, scope, evidence, traceability, measurable acceptance, safety, and phase fit. Use for PRDs, feature proposals, backlog promotion, scope changes, or requirement approval before design or implementation.
---

# Review product requirements

## Required inputs

- Requirement or proposal with stable ID
- User problem, target users, phase, owner, dependencies, and evidence
- Related journeys, domain rules, architecture decisions, and success measure
- Explicit non-goals and unresolved decisions

## Procedure

1. Read `AGENTS.md`, `docs/project/charter.md`, `docs/product/product-requirements.md`, and `docs/product/feature-inventory.md`.
2. Restate the user problem and expected behaviour without solution language. Flag if this cannot be done.
3. Trace the proposal to the central promise, target users, journey, domain rule, measure, dependency, and phase.
4. Test the default path for beginner simplicity and the advanced path for sufficient control.
5. Challenge scope inflation, competitor-driven inclusion, manipulative retention, unsupported claims, fake analytics, and cloud dependence.
6. Rewrite ambiguous acceptance criteria into observable outcomes, including failure and recovery states.
7. Classify assumptions, evidence strength, privacy/accessibility/data-safety impact, and cost of being wrong.

## Evidence required

- Traceability table with requirement, problem, journey, rule/ADR, measure, and acceptance criteria
- Source links or research paths for material claims
- Named conflicts, exclusions, unknowns, and owner decisions
- Diff or exact replacement wording when rework is proposed

## Failure conditions

Return `blocked` when the user problem, accountable decision owner, phase, safety boundary, or measurable outcome is missing; when the proposal conflicts with an accepted rule/ADR without an explicit supersession decision; or when production work is requested before foundation approval.

## Output

Return `pass`, `rework`, or `blocked`; lead with severity-ranked findings, then a traceability table, exact required changes, residual uncertainty, and the next approval decision.
