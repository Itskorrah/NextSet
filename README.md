# NextSet

NextSet is a mobile workout-tracking and training companion focused on making planning, starting, recording, and progressing through workouts easier.

This repository is currently at the **product foundation and system design** milestone. It contains research, product rules, user journeys, architecture decisions, quality standards, agent workflows, and three disposable visual-direction prototypes. It intentionally does **not** contain the production mobile application.

## Review this milestone

Start with:

1. [`docs/project/charter.md`](docs/project/charter.md)
2. [`docs/product/product-requirements.md`](docs/product/product-requirements.md)
3. [`docs/product/feature-inventory.md`](docs/product/feature-inventory.md)
4. [`docs/design/visual-directions.md`](docs/design/visual-directions.md)
5. [`docs/architecture/adrs/0001-mobile-stack.md`](docs/architecture/adrs/0001-mobile-stack.md)
6. [`docs/domain/workout-progression-rulebook.md`](docs/domain/workout-progression-rulebook.md)
7. [`docs/quality/release-readiness.md`](docs/quality/release-readiness.md)

The three design directions are reviewable under [`prototypes/`](prototypes/). Their mock data is illustrative; it is not production analytics or a working workout database.

## Phase boundary

Production implementation must not begin until the product owner approves the MVP boundary, visual direction, architecture, and critical user journeys recorded in [`docs/project/assumptions-questions.md`](docs/project/assumptions-questions.md).

## Repository map

- `docs/project/` — charter, vision, users, assumptions, glossary, roadmap, and decisions
- `docs/research/` — competitor, user-problem, interaction, tooling, and name-collision research
- `docs/product/` — requirements, scope, features, measures, and journeys
- `docs/domain/` — workout, programme, set, progression, safety, and edge-case rules
- `docs/design/` — IA, visual systems, accessibility, motion, content, and prototype guidance
- `docs/architecture/` — stack evaluation, data model, local-first strategy, security, and ADRs
- `docs/quality/` — acceptance, testing, accessibility, performance, and readiness gates
- `docs/agents/` — multi-agent operating and evidence model
- `prototypes/` — disposable design artefacts, visual references, and prototype source
- `skills/` — reusable manual workflows packaged in Codex Skill format; this managed workspace does not permit writing the auto-discovered `.agents/skills/` path

## Licence status

No project-wide open-source licence has been selected. Research citations and third-party asset or font licences are recorded with their relevant artefacts. Do not assume the repository is licensed for redistribution until the owner selects a licence.
