# Assumptions and unresolved questions

Current scope update: 2026-09-07. The logging-first boundary is accepted in `D-009`; final design, revised journeys and architecture are accepted in `D-010`.

## Working assumptions for the foundation

| ID | Assumption | Why reasonable now | Cost if wrong | Validation path |
|---|---|---|---|---|
| A-01 | The first release targets iOS and Android phones, not tablet, desktop, or watch. | Workout logging is primarily a phone task and the brief is mobile-first. | Medium | Owner decision and later device research. |
| A-02 | Core use is individual and private; accounts are not required for first-run value. | Local-first logging and export can exist without cloud identity. | Medium | Usability study and architecture review. |
| A-03 | Metric and imperial measurement preferences must coexist from day one. | Mainstream geographic scope and export require explicit units. | High | Domain tests and market validation. |
| A-04 | Superseded by D-009: scheduling is POST; v1 has no required dates or sequence. | Explicit owner approval of logging-first scope. | Low for core logging; revisit demand for planning later | Validate blank/repeat/routine flows without schedule entities. |
| A-05 | Progression suggestions are POST. If approved later, deterministic/explainable rules remain the starting proposal. | Owner deferred advice to focus on trustworthy records. | Low for logging; potential loss of guidance-seeking users | Test understanding of observed trends; defer recommendation study. |
| A-06 | Exercise instructions can begin as concise text and maintained metadata, not a large video library. | Reduces scope, licensing, download, and maintenance risk. | Low | New-user task study. |
| A-07 | The design prototypes use realistic illustrative data, not measured product analytics. | No production data exists in this phase. | Low | Keep prototypes labelled and remove invented metrics from claims. |
| A-08 | The name “NextSet” is provisional pending professional clearance. | Preliminary scans cannot establish legal availability. | High | Counsel-led trademark/domain/app-store clearance. |
| A-09 | Superseded by D-009: group/drop authoring is POST; independent standard/warm-up sets remain v1. | The accepted first release centres on logging, routines and history without advanced programme construction. | Medium for users needing structured groups | Validate whether manual independent logging covers initial needs; group semantics remain reference material. |

| A-10 | People can understand meaningful progress from observed frequency, comparable exercise performance and personal bests without advice. | Matches the owner-approved product direction; not yet a usability result. | Medium | Moderated comparison/empty-state tests and transparent source records. |
| A-11 | Tempo Ledger is the selected visual base for the first real build. | Owner reviewed the logging-first prototype and approved the direction in D-010. | Low; implementation tokens remain refinable | Validate on real devices and with future usability feedback. |

## Product-owner approval checklist

The owner approved the narrowed product scope (D-009), Tempo Ledger direction, the critical blank/repeat/routine/log/finish/history/trend journeys, and the React Native + Expo + TypeScript / local SQLite architecture (D-010). Do not request these approvals again.

Before production, close the launch measurement-mode/catalogue coverage and observed personal-best definitions against data-model and usability review. Accessibility, durability, editing, export and deletion remain requirements, not scope options to trade away.

## Questions intentionally deferred until after direction approval

- Final product name, trademark clearance, domains, and store listing identity
- Exact first-use help and unit-default copy after comprehension tests; no compulsory onboarding flow
- Final exercise seed-library size and editorial ownership
- Commercial model and price, which are outside MVP implementation
- Cloud account/sync vendor and conflict UI, which are deferred by architecture
- Whether optional exertion fields earn their place in the initial logging UI; they cannot gate normal sets
- Exact trend windows and labels after usefulness testing; no exercise-quality/body-image/recovery scoring

## Historical environment and evidence record (2026-08-10; not current validation)

- The configured workspace initially had no checkout and its filesystem policy denied creating `.git`. A readable local checkout was later restored on `foundation/product-and-system-design`; current managed permissions still keep local Git metadata non-writable, so publication mutations use the authenticated GitHub connector.
- Registry DNS and dependency access initially failed, then recovered. After the final adversarial source rework, the current production build, 28 protected-runtime checks, 32 browser/runtime/product cases, four Sites cases and a 33-state capture at `2026-08-10T03:34:06.468Z` passed. The capture reports zero runtime errors, horizontal-overflow states or rendered controls below 48×48.
- Repository workflow discovery could not be enabled: `mkdir -p .agents/skills` failed with `mkdir: .agents: Operation not permitted`. The top-level `skills/` packages are therefore manual Skill-format workflows, not auto-discovered repository Skills; copying/installing them is deferred to a writable checkout.

These are historical environment observations and must be rechecked before operational decisions; they are not claims about current permissions or tooling. At the final High-effort checkpoint, the readable local branch and its tracking ref both pointed to commit `4654abdb57bae51331ef468717b1b808c0ac92b5`; `origin` was exact, and draft [PR #1](https://github.com/Itskorrah/NextSet/pull/1) was open and mergeable. Product-owner direction review can use the current-source executable and visual evidence. Final technical acceptance requires a current independent-review record; at that checkpoint owner approvals were still pending. D-009 now records scope acceptance only; current visual, architecture and revised-journey approvals still gate production.
