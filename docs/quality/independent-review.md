# Independent foundation review

Status: final independent review after rework  
Review date: 2026-08-06  
Reviewer: independent Codex subagent; no primary authorship of the reviewed artefacts  
Scope: the attached product-foundation brief and the integrated repository package at the time of this review

## Gate result

**blocked**

The product, domain, architecture and quality specifications are unusually thorough for a foundation milestone, and the rework closed the material cross-document safety, phase and data-recovery conflicts found in the first pass. The package still cannot satisfy its own definition of done because one P0 evidence blocker and three P2 prototype/design findings remain open. Under [`../agents/ownership-review-rework.md`](../agents/ownership-review-rework.md), every open P0-P2 is blocking.

No production application or cloud backend was introduced. Production work must remain stopped until the product owner approves scope, architecture, critical journeys and one visual direction, and until the findings below are closed.

## Review method and evidence limits

The review covered the original brief, the source-of-truth documents named by the root constitution, every generated visual reference, the prototype source/tests, the repository skills/workflows and the validation scripts.

Direct evidence included:

- visual inspection of the three 390x844 active-workout references and all three ten-screen boards;
- static inspection of the React/TypeScript prototype, CSS tokens and Playwright tests;
- structural Markdown/link/artefact validation, protected-runtime integrity validation and independent Skill front-matter/section validation;
- focused cross-document checks for feature phase, custom-exercise requirements, scheduling, substitution, set-entry actions, migrations, WAL recovery, portable restore, severity gates and asset provenance;
- a primary-source currency crosscheck of the time-sensitive Expo, React Native, Compose Multiplatform and Codex Skills claims. No material discrepancy was found. Current repository Skills discovery uses `.agents/skills`; the recorded managed-workspace denial and manual top-level workflows are therefore described truthfully. See [Codex Skills](https://developers.openai.com/codex/skills), [Expo SDK reference](https://docs.expo.dev/versions/latest/), [Expo New Architecture](https://docs.expo.dev/guides/new-architecture/) and [Kotlin Multiplatform FAQ](https://kotlinlang.org/docs/multiplatform/faq.html).

The prototype dependencies are not installed, `npm` is unavailable, and `node_modules/` is absent. The prototype could not be compiled, launched or exercised in the user's browser. No TypeScript/build result, Playwright result, console inspection, responsive run, assistive-technology run or rendered source-to-implementation comparison is claimed. The workspace also has no local `.git`, so branch, commit, push and pull-request state were outside this review's evidence.

## Open findings

### IR-P0-001 - executable prototype and mobile screenshot evidence are absent

**Severity:** P0 - unusable/unverified critical design flow and missing required evidence  
**Evidence:** [`../../prototypes/nextset-directions/design-qa.md`](../../prototypes/nextset-directions/design-qa.md) records an exact blocked result, no installed dependencies and no implementation capture. [`../design/prototype-guide.md`](../design/prototype-guide.md) correctly states that the boards are generated references, not rendered screenshots or interaction evidence. The three normalized active references are 390x844, but the ten-screen boards are 1503/1536-pixel-wide collages rather than 30 captured mobile viewports.  
**Impact:** build correctness, the coded interactions, font rendering, overflow, keyboard/safe-area behavior, responsive reflow, target geometry, accessibility semantics and fidelity to the references remain unknown. Passing the protected-file integrity check proves only that the scaffold files are unchanged. It does not satisfy the brief's working-prototype and realistic-mobile-screenshot evidence.  
**Closure evidence required:** install the pinned dependencies in an approved environment; run the runtime, interaction, build and Sites tests; launch the prototype in the user's chosen in-app browser; exercise the critical paths for all three directions on the iPhone and Pixel presets; capture all ten screens per direction at recorded mobile viewport/state; compare each active-workout implementation capture with its exact reference in one visual comparison; fix and recapture every P0-P2 issue; replace the blocked design-QA result with the comparison history.

### IR-P2-002 - the required programme editor remains partly visual-only and drag-dependent

**Severity:** P2 - meaningful interaction and accessibility incompleteness  
**Evidence:** [`../../prototypes/nextset-directions/src/Prototype.tsx`](../../prototypes/nextset-directions/src/Prototype.tsx) renders handlerless workout tabs and Reorder/Edit/Add exercise/Review rule controls in `ProgrammeEditorScreen` (around lines 1027-1048). Reorder is represented by a drag-handle button without an observable move action or Move up/Move down alternative. Several history rows also render as buttons with arrows but only the first has a handler (around lines 922-929). The generated boards now show accessible move controls, but the coded review artefact does not.  
**Impact:** a required core screen appears actionable without demonstrating the action, and keyboard/switch users have no non-drag reorder path in the source. This conflicts with the prototype interaction contract and the repository's accessible-reordering guidance.  
**Closure evidence required:** implement observable prototype state for workout selection, Move up/Move down, exercise edit/add and rule expansion; either make each visible history row work or render noninteractive rows honestly; add role/name/state tests and keyboard/switch coverage; verify the interactions in the browser.

### IR-P2-003 - the prototype tests are statically inconsistent with the current source

**Severity:** P2 - test gap and likely false/failed evidence  
**Evidence:** the primary-flow Playwright test still looks for `Use this programme`, while the reworked source labels the button `Use this example in prototype`. The same test fills the weight field with the locale draft `105,0` and requires that raw value to remain, while `Stepper` synchronizes `draft` from the parsed parent value on every `value` change (`useEffect` around line 676), which is likely to normalize it immediately to `105`. This inference could not be confirmed because Playwright cannot run in the current environment.  
**Impact:** the principal interaction test is expected to fail before it reaches the intended assertions, and locale-aware direct entry is not demonstrably preserved.  
**Closure evidence required:** update the test to the deliberate final label; preserve a valid user's raw locale draft while it is being edited and synchronize only true external changes (such as stepper actions); add comma-decimal and invalid-draft restoration cases; run and retain the passing Playwright result.

### IR-P2-004 - Open Pace still labels mismatches without naming the difference

**Severity:** P2 - design/content drift from the substitution rule  
**Evidence:** [`../../prototypes/visual-references/open-pace-ten-screen-board.png`](../../prototypes/visual-references/open-pace-ten-screen-board.png), screen 6, now correctly includes today/future scope and marks candidates as `Material mismatch`, but the candidate cards list match tags and do not say what actually differs. Tempo Ledger, Field Kit and the coded prototype do name concrete differences. `WPR-SUB-004` and [`../design/content-tone.md`](../design/content-tone.md) require material mismatches such as equipment, load basis or unilateral structure to be disclosed plainly.  
**Impact:** a user cannot evaluate the trade-off from this direction's high-fidelity reference, and the label risks implying that the product has explained information it has only categorized.  
**Closure evidence required:** regenerate or revise the Open Pace board so each mismatched candidate names the actual difference in plain language; inspect the final image at original resolution; update its generation record/hash if the pixels change.

## Coverage assessment

| Area | Result | Independent assessment |
|---|---|---|
| Research | Sufficient for foundation decision-making | Freshly dated, source-linked and evidence-classed; marketing, documented behavior, user report and inference are not silently merged. Limitations and the provisional-name collision risk are explicit. |
| Product and scope | Sufficient after rework | Broad users, measurable outcomes, MVP/POST/FUTURE boundaries and exclusions are traceable. Simple one-level groups are MVP; advanced grouping and named gym profiles are clearly POST. |
| Workout domain and UX | Sufficient after rework | Deterministic scheduling, set dimensions, substitution, progression, interruption, history integrity and safety/no-claim boundaries have stable rules and extensive scenario coverage. Custom exercises now have one consistent minimum-field contract. |
| Visual directions | Reviewable but not executable | Exactly three meaningfully different systems and ten labelled board states per direction are present. Tempo Ledger remains a reasoned recommendation, not an owner selection. Runtime and screenshot proof remains blocked by IR-P0-001. |
| Architecture | Sufficient for owner approval and later spike | Conditional React Native/Expo recommendation, Flutter fallback, local authoritative SQLite, transactional writes, versioned history and future-sync seams are credible. WAL-consistent migration snapshots now require online backup/`VACUUM INTO` or a checkpointed closed copy. |
| Quality | Strong specification; execution intentionally future | Acceptance, release, accessibility, offline, migration, performance and recovery gates are measurable. The package now consistently requires zero open P0-P2. No future production gate is represented as already passed. |
| Agents and workflows | Sufficient with a recorded environment limitation | Ownership/rework evidence is concrete. Nine manual Skill-format workflows validate structurally; automatic repository discovery remains unavailable because `.agents/skills` is not writable in this workspace. |
| Foundation phase boundary | Passed | No production `app/`, production dependency set, telemetry SDK or backend was introduced. |

## Rework verified closed

The following first-pass findings were independently rechecked and are closed:

- portable restore/import is consistently POST (`FEAT-POST-009`); MVP export is no longer described as a restorable package;
- migration recovery now forbids copying an active main SQLite file without its WAL and adds an uncheckpointed-WAL fixture;
- release/readiness governance now requires zero open P0-P2;
- simple non-nested supersets/circuits are consistently MVP and advanced grouping is POST;
- named gym profiles are consistently POST, while MVP uses explicit session equipment/increment context;
- custom-exercise required versus optional metadata is consistent across journey, rule and tests;
- the populated-set one-action requirement is no longer weakened by the edited/blank-row allowance;
- set durability copy says `saved`, not physiologically `safe`;
- generated-board provenance, current hashes and proprietary template-asset publication exclusions are recorded;
- the current Tempo Ledger and Field Kit boards disclose saved state, substitution scope/mismatches and programme versioning, and include non-drag reorder controls;
- the regenerated Open Pace board removes the earlier unsupported strength/effect claims, adds programme selection/creation, saved-on-device confirmation, substitution scope and publish-new-version controls;
- the coded prototype now removes the unvalidated programme suitability recommendation, corrects schedule copy, labels persistence as a foundation target, names substitution mismatches, fixes exercise position, and makes unplanned start, rest controls, note/history and progress controls stateful;
- direction-specific navigation, direct numeric input, completion counts, e1RM suppression, programme version copy and approved color tokens are present in source.

## Validation record

| Command/check | Result |
|---|---|
| `python3 scripts/validate_foundation.py` | Passed after this review file was added: 53 required artefacts, 70 Markdown files, 9 skills, 3 normalized visual references. |
| bundled Node `scripts/check-mobile-runtime.mjs` | Passed: 28 protected files. |
| Ruby YAML/front-matter and required-section validation over `skills/*/SKILL.md` | Passed: all 9 Skill-format workflows. |
| `sips` pixel-dimension inspection | Three normalized active references are exactly 390x844; ten-screen boards are 1503x1046 or 1536x1024. |
| Direct original-resolution image inspection | Completed for all three active references and all three current boards. |
| Dependency/build/Playwright/browser/accessibility comparison | Not run; blocked by unavailable `npm`, missing dependencies and denied registry/escalation access. |
| Local Git status | Not available; this workspace contains no `.git`. |

## Required final recheck

After closing IR-P0-001 and IR-P2-002 through IR-P2-004, rerun the foundation validator, protected-runtime check, clean build and tests; perform the browser/mobile/visual/accessibility evidence pass; update the design-QA result; then repeat this independent review. Product-owner approval remains a separate decision and must not be inferred from a technical pass.

**Final gate result: blocked**
