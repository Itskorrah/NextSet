# NextSet project constitution

## Purpose and users

NextSet helps mainstream gym users plan, start, record, and progress through workouts with minimal repeated-use friction. Design for new gym users, intermediate trainees, experienced lifters, general fitness users, and people with inconsistent schedules. Never hard-code the product around one routine, goal, gender, gym, or training style.

## Source of truth

Read the smallest relevant set before changing anything:

- Product boundary: `docs/product/product-requirements.md` and `docs/product/feature-inventory.md`
- Workout behaviour: `docs/domain/workout-progression-rulebook.md`
- User flows: `docs/product/user-journeys.md`
- Design: `docs/design/design-principles.md` and `docs/design/visual-directions.md`
- Architecture and data: accepted files in `docs/architecture/adrs/` plus `docs/architecture/data-model.md`
- Quality: `docs/quality/acceptance-criteria.md` and `docs/quality/release-readiness.md`
- Decisions and uncertainty: `docs/project/decision-log.md` and `docs/project/assumptions-questions.md`

This milestone is foundation-only. Do not start the production app until the product owner records approval of scope, visual direction, architecture, and critical journeys.

## Repository structure

Keep research, product, domain, design, architecture, quality, and agent guidance in their existing `docs/` scopes. Keep disposable visual work under `prototypes/`. Reusable manual procedures are packaged under `skills/` in Codex Skill format; this managed workspace did not permit writing the auto-discovered `.agents/skills/` path. Do not introduce a production `app/` or cloud backend during the foundation phase.

## Development principles

- Optimise for the user’s fiftieth workout, not only onboarding or screenshots.
- Keep the default path simple; reveal advanced configuration when requested.
- Preserve user control. Recommendations must be optional and explainable.
- Write workout data locally and transactionally before any future sync work.
- Separate deterministic domain rules from UI, persistence, and optional recommendations.
- Add only approved features that map to a requirement ID and measurable user outcome.
- Never use fake analytics, placeholder production controls, guilt, shame, unsafe coaching claims, or body-image pressure.

## Required validation

Run the most specific relevant checks. A change is not validated because it looks plausible or compiles elsewhere. Record commands, results, device/state, and evidence paths. Failed or unavailable checks remain explicit blockers.

Minimum future production gates include domain unit tests, data and migration tests, component/integration tests, mobile end-to-end flows, visual regression, accessibility, offline and interruption restoration, export, performance, large-text, and reduced-motion tests.

## Git practices

- Work on a purpose-named branch; never force-push or rewrite shared history.
- Keep commits logical, reviewable, and free of unrelated user changes.
- Before each push, verify status, active branch, `origin`, and validation results.
- Open a pull request into `main`; do not merge without owner approval.
- Never commit credentials, local secrets, generated signing material, or private user data.

## Security and data safety

- Collect the minimum data necessary and default it to private.
- Treat completed workout history as user-owned data: exportable, editable through auditable operations, and never silently discarded.
- Use stable identifiers, explicit schema versions, transaction boundaries, backup/restore checks, and migration rollback or recovery plans.
- No production dependency, telemetry, SDK, backend, or data transfer without documented purpose, licence/security review, and an accepted decision.

## Accessibility and design

- Target WCAG 2.2 AA where applicable and platform accessibility guidance.
- Critical touch targets are at least 48×48 logical pixels; never rely on colour, gesture, sound, or motion alone.
- Support screen readers, Dynamic Type/font scaling, large text, high contrast, reduced motion, and logical focus order.
- Use approved semantic colour roles, type roles, spacing, shape, motion, and haptics. Avoid generic dashboard styling and decorative data.

## Definition of done

A change is done only when approved requirements and rules are implemented, relevant tests pass, accessibility and data-safety impacts are checked, documentation and decision records are current, no placeholder behaviour remains, evidence is attached, and an independent reviewer has no unresolved P0–P2 findings.

## Uncertainty and conflicts

State assumptions, evidence strength, unknowns, and the cost of being wrong. Do not present marketing claims, anecdotes, inference, or untested behaviour as fact.

Resolve conflicts in this order: platform/system instructions; current product-owner instruction; this root constitution; the nearest scoped `AGENTS.md`; accepted requirement/rule/ADR; older guidance. A more local file may add constraints but cannot weaken safety, accessibility, privacy, quality, or the foundation phase boundary. Record material conflicts rather than silently choosing.
