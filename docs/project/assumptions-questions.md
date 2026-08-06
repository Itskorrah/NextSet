# Assumptions and unresolved questions

## Working assumptions for the foundation

| ID | Assumption | Why reasonable now | Cost if wrong | Validation path |
|---|---|---|---|---|
| A-01 | The first release targets iOS and Android phones, not tablet, desktop, or watch. | Workout logging is primarily a phone task and the brief is mobile-first. | Medium | Owner decision and later device research. |
| A-02 | Core use is individual and private; accounts are not required for first-run value. | Local-first logging and export can exist without cloud identity. | Medium | Usability study and architecture review. |
| A-03 | Metric and imperial measurement preferences must coexist from day one. | Mainstream geographic scope and export require explicit units. | High | Domain tests and market validation. |
| A-04 | The MVP supports both flexible sequences and fixed weekdays. | Both solve distinct, prioritised schedule problems in the brief. | Medium | Prototype and rule usability tests. |
| A-05 | Suggestions are deterministic or programme-defined before any future intelligence. | Easier to explain, test, trust, and use offline. | Low | Recommendation comprehension study. |
| A-06 | Exercise instructions can begin as concise text and maintained metadata, not a large video library. | Reduces scope, licensing, download, and maintenance risk. | Low | New-user task study. |
| A-07 | The design prototypes use realistic illustrative data, not measured product analytics. | No production data exists in this phase. | Low | Keep prototypes labelled and remove invented metrics from claims. |
| A-08 | The name “NextSet” is provisional pending professional clearance. | Preliminary scans cannot establish legal availability. | High | Counsel-led trademark/domain/app-store clearance. |
| A-09 | Simple one-level superset/circuit creation, editing and execution are MVP; nested, reusable and conditional group workflows are post-MVP. | `PRD-FR-006` already requires group support, while a non-nested boundary preserves beginner clarity and deterministic semantics. | Medium | Builder usability plus `TS-PGM-007`, group execution and accessibility tests. |

## Product-owner approval checklist

These are the only decisions requested at this milestone:

1. Which visual direction should become the base system?
2. Which specific elements, if any, should be combined from the other two directions?
3. Is the proposed MVP boundary acceptable?
4. Is the recommended architecture acceptable?
5. Should any feature be added, removed, or deferred?
6. Does the product feel broad enough for mainstream gym users?
7. Does any part feel generic, cluttered, or unnecessarily complicated?

## Questions intentionally deferred until after direction approval

- Final product name, trademark clearance, domains, and store listing identity
- Exact onboarding copy sequence after moderated comprehension tests
- Final exercise seed-library size and editorial ownership
- Commercial model and price, which are outside MVP implementation
- Cloud account/sync vendor and conflict UI, which are deferred by architecture
- Whether RPE and RIR can appear simultaneously in one programme or should be programme-level choices
- Which charts survive usefulness testing with real historical data

## Environment constraints and resolutions recorded during this milestone

- The configured workspace initially had no checkout and its filesystem policy denied creating `.git`; the canonical clone, branch, commit, push, and PR steps require a writable Git metadata directory.
- Registry DNS and dependency access initially failed, then recovered. A clean install from the committed npm lockfile, protected-runtime check, TypeScript/build, 15 browser tests, four Sites tests and 33-state mobile capture subsequently passed; the earlier prototype evidence blocker is closed.
- Repository workflow discovery could not be enabled: `mkdir -p .agents/skills` failed with `mkdir: .agents: Operation not permitted`. The top-level `skills/` packages are therefore manual Skill-format workflows, not auto-discovered repository Skills; copying/installing them is deferred to a writable checkout.

The remaining workspace constraints do not change the product or architecture recommendation. Local Git metadata and automatic repository-workflow discovery remain unavailable here; repository publication is handled through the authenticated GitHub connector and must still be verified explicitly.
