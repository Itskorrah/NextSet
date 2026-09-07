# Ownership, review, and rework

## Assignment contract

Every delegated task states:

- Goal and explicit non-goals
- Owned paths and paths that must not be edited
- Inputs and normative documents
- Expected artefacts and stable identifiers
- Current dependencies and allowed assumptions
- Required sources, tests, screenshots, commands, and report format
- Completion and failure conditions

No two active agents edit the same file. If a shared contract changes, pause downstream work, integrate the contract once, then notify dependent owners.

## Evidence contract

An artefact handoff includes:

1. Files created or changed.
2. Decision and requirement coverage.
3. Sources and access dates for drift-prone claims.
4. Exact commands/checks and results.
5. Screenshots/captures with viewport and state for visual claims.
6. Assumptions, uncertainties, blockers, and decisions needed.
7. Confirmation that no out-of-scope files were changed.

“Looks good”, test plans without runs, HTTP health without browser inspection, generated mockups labelled as implementation captures, and uncited current claims are not evidence.

## Review severity

- **P0:** data loss, unsafe claim, security/privacy breach, unusable critical flow, or phase-boundary violation
- **P1:** major requirement/architecture/accessibility/visual failure likely to invalidate the milestone or release
- **P2:** meaningful incompleteness, ambiguity, test gap, or design drift that should be fixed before approval
- **P3:** non-blocking polish or future improvement

## Rework loop

1. Reviewer points to the brief/requirement/rule/evidence and states the observable mismatch.
2. Responsible owner proposes the smallest complete correction and affected dependencies.
3. Owner edits, reruns relevant validation, and returns new evidence.
4. Reviewer verifies the original finding against the revised artefact; build success alone does not close it.
5. Lead updates decisions and dependent artefacts, then closes or escalates the finding.

P0–P2 must be fixed or remain explicit blockers. P3 may remain in follow-up polish. A primary author cannot be the only closer of their own finding.

## Disagreement

Record the competing interpretations, evidence, affected user outcome, reversibility, and decision owner. Use the higher-safety interpretation temporarily for privacy, data integrity, accessibility, and health/safety boundaries. Do not bury disagreement in copy edits.
