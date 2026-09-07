# NextSet

NextSet is a mobile workout logger focused on recording workouts quickly, repeating what works, and understanding progress. Goals, programmes and schedules are not required.

This repository completed its product foundation and system-design milestone on 2026-09-07. It now contains the approved product rules, user journeys, architecture decisions, quality standards, disposable visual prototypes, and the local-first native mobile application.

## Current app state

The native application in [`mobile/`](mobile/) is a logging-first Expo/React Native app backed by local SQLite. It supports blank workout starts, workout names, exercise and set logging, safe editing/deletion with Undo, repeat and optional reusable routines, history, descriptive progress, kg/lb preferences, export, delete-all, and active-workout recovery. It has no account, cloud sync, programme, goal, or schedule requirement.

The owner-selected NS Monogram is configured as the iOS app icon, with matching Android adaptive and themed-icon assets. The app currently runs as a signed development build on a physical iPhone. A standalone/TestFlight distribution build is planned next; it is not yet configured.

## Review this milestone

Start with:

1. [`docs/project/charter.md`](docs/project/charter.md)
2. [`docs/product/product-requirements.md`](docs/product/product-requirements.md)
3. [`docs/product/feature-inventory.md`](docs/product/feature-inventory.md)
4. [`docs/design/visual-directions.md`](docs/design/visual-directions.md)
5. [`docs/architecture/adrs/0001-mobile-stack.md`](docs/architecture/adrs/0001-mobile-stack.md)
6. [`docs/domain/workout-progression-rulebook.md`](docs/domain/workout-progression-rulebook.md)
7. [`docs/quality/release-readiness.md`](docs/quality/release-readiness.md)

The current logging-first Tempo Ledger proposal and the preserved earlier three design directions are reviewable under [`prototypes/`](prototypes/). Those previews are disposable design artefacts; the native app in [`mobile/`](mobile/) is the durable local workout implementation. The legacy directions use illustrative sample data.

## Phase boundary

The owner accepted the narrower logging-first scope in D-009 and approved the visual direction, critical journeys and local-first architecture in D-010 on 2026-09-07. Production implementation is authorised only for that approved scope.

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
- `mobile/` — the local-first Expo native app and its implementation checks
- `skills/` — reusable manual workflows packaged in Codex Skill format; this managed workspace does not permit writing the auto-discovered `.agents/skills/` path

## Licence status

No project-wide open-source licence has been selected. Research citations and third-party asset or font licences are recorded with their relevant artefacts. Do not assume the repository is licensed for redistribution until the owner selects a licence.
