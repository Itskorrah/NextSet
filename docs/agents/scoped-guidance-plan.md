# Scoped `AGENTS.md` plan

Current scoped guidance exists for `docs/`, `prototypes/`, and the manual Skill-format workflows under `skills/`. The managed workspace denied writes to `.agents/`, so these packages are reviewable and manually invokable but are not automatically discovered as repository Skills. In a writable checkout, copy each validated package from `skills/<name>/` to `.agents/skills/<name>/`, rerun the official Skill validator, and remove the manual-location disclaimer in the same reviewed commit. Create the following production guidance files only when the corresponding approved area is introduced; placing them now would imply a production structure that has not been approved.

| Future path | Scope of guidance |
|---|---|
| `apps/mobile/AGENTS.md` | React Native/Expo runtime, navigation, platform behaviour, screen composition, accessibility, haptics, local notifications, native-module policy, device validation |
| `packages/design-system/AGENTS.md` | Approved tokens, components, typography, icons/assets, responsive/large-text behaviour, motion/reduced motion, visual regression |
| `packages/workout-engine/AGENTS.md` | Pure deterministic domain logic, rule IDs/precedence, units/rounding, safety/no-claim boundaries, table-driven tests, no UI/storage imports |
| `packages/data/AGENTS.md` | SQLite schema, repositories, transactions, migrations, backups, export, deletion, audit/provenance, future sync boundaries |
| `tests/AGENTS.md` | Fixture ownership, test pyramid, device matrix, isolation, determinism, visual baselines, flaky-test policy, evidence retention |
| `docs/release/AGENTS.md` | Store/privacy/accessibility claims, release notes, known issues, sign-off and rollback evidence |

Each scoped file may strengthen but never weaken the root constitution. Its creation is part of the same change that creates the owned area, so guidance exists before substantive implementation.
