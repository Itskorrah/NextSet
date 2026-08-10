# Design QA

Status: current-source executable and rendered QA complete  
Review date: 2026-08-10  
Result: passed; no actionable P0-P2 design-QA findings remain

## Comparison target and evidence

- **Generated source truth:** the three normalized `../visual-references/*-active-workout-390x844.png` references and the three generated ten-screen boards.
- **Rendered implementation:** `src/Prototype.tsx` and `src/prototype.css` inside the protected Product Design mobile runtime.
- **iPhone evidence:** exactly 30 rendered app-view captures, ten per direction, at a 393×852 client viewport.
- **Pixel evidence:** one active-workout capture per direction at 427×952.
- **Capture context:** Playwright Chromium 149, `@playwright/test` 1.61.1, `en-AU`, light appearance, reduced-motion emulation; see [`capture-manifest.json`](evidence/2026-08-06/capture-manifest.json).
- **Current verified capture:** `2026-08-10T03:34:06.468Z`; 33 records, zero runtime errors, zero horizontal-overflow states and zero rendered controls below 48×48.
- **Review plates:**
  - [Tempo Ledger source vs rendered](evidence/2026-08-06/comparisons/tempo-ledger-active-workout-source-vs-rendered.png)
  - [Field Kit source vs rendered](evidence/2026-08-06/comparisons/field-kit-active-workout-source-vs-rendered.png)
  - [Open Pace source vs rendered](evidence/2026-08-06/comparisons/open-pace-active-workout-source-vs-rendered.png)
- **Rendered ten-screen contact sheets:**
  - [Tempo Ledger](evidence/2026-08-06/comparisons/tempo-ledger-ten-screen-rendered-contact-sheet.png)
  - [Field Kit](evidence/2026-08-06/comparisons/field-kit-ten-screen-rendered-contact-sheet.png)
  - [Open Pace](evidence/2026-08-06/comparisons/open-pace-ten-screen-rendered-contact-sheet.png)

The generated boards remain references, not implementation screenshots. The files under `evidence/2026-08-06/screens/` are the browser-rendered captures.

## Executable verification

The clean install used the committed `package-lock.json` through npm 11.6.2 on Node 24.14.0. Exact commands and outcomes are retained in [`command-results.md`](evidence/2026-08-06/command-results.md).

| Check | Result |
|---|---|
| Clean lockfile install | Pass: 77 packages installed |
| Protected runtime | Pass: 28 protected files unchanged |
| TypeScript and production build | Pass: 510 modules transformed; Sites output prepared |
| Browser/runtime/product tests | Pass: 32/32 current-source cases |
| Sites worker/package tests | Pass: 4/4 |
| Evidence capture | Pass: 33 current-source mobile states plus 3 comparison plates and 3 contact sheets |
| Runtime errors | None observed by capture listener |
| Horizontal overflow at captured states | None detected |
| Rendered controls below 48×48 | None remaining |

The verified local preview is open in the Codex Desktop in-app browser at `http://127.0.0.1:4173/`. It remains a disposable web prototype; these checks do not prove native persistence, native performance, VoiceOver/TalkBack behaviour or physical-device input.

## Required fidelity-surface review

| Surface | Current-source result |
|---|---|
| Fonts and typography | Pass for direction review. Hierarchy, weight, wrapping, tabular values and direction-specific display treatment remain coherent at 393×852 and 427×952. Proposed brand typefaces are not bundled and remain a disclosed P3 implementation refinement. |
| Spacing and layout rhythm | Pass. Original-resolution plates and contact sheets show stable margins, readable density, aligned set controls and final actions reachable above fixed chrome. |
| Colours and visual tokens | Pass. Parchment/vermilion/olive, black/amber and cream/teal/coral systems remain distinct, semantic states retain non-colour cues, and no contrast-breaking drift was found visually. |
| Image quality and asset fidelity | Pass. Generated references remain clearly separated from browser captures; device chrome and keyboard assets come from the protected runtime, with no placeholder, CSS-drawn or substituted visible artwork. |
| Copy and content | Pass. Current copy distinguishes fixtures from recorded prototype state, reports partial work and sequence scope truthfully, and contains no unreviewed technique instruction. |

The three full-view plates are the primary side-by-side evidence. Focused original-resolution inspection covered each active screen's timer, comparable-history panel, set rows/current-set controls, primary action and bottom navigation. Separate cropped files were not needed because those regions are readable at native pixels in the plates; the three 427×952 Pixel active captures were also inspected directly for safe-area and fixed-chrome behaviour.

## Comparison findings and rework

### Tempo Ledger

The rendered direction now preserves the reference's warm ledger surface, disciplined rules, compact timer rail, previous-session comparison, aligned set rows, five labelled destinations and persistent vermilion set action. The render uses the approved four-set product fixture and truthful current-set state rather than copying inconsistent illustrative values from the generated reference.

Residual differences are non-blocking for direction selection: the protected device chrome consumes vertical space that is absent from the flattened reference, the proposed IBM Plex files are not bundled, and the previous-session block is simpler. These are recorded as P3 refinement work after direction selection, not hidden as a pixel match.

### Field Kit

The first rendered comparison exposed that colour alone was carrying too much of the difference. The active screen was rebuilt as the Field Kit control console: dark dense bands, amber rest/progress, large load and rep bays, explicit increments, RIR selector, set bays, target rail, three-destination hardware-like navigation and an always-visible Complete set action. The interaction test verifies Pause/Resume, load adjustment and quick save.

The source shows an illustrative 105 kg/current-set fixture while the rendered product fixture begins at 100 kg/set 4. That deliberate data difference preserves cross-document journey consistency and does not change the direction anatomy.

### Open Pace

The rendered direction now matches the source's guided vertical path, completed/current nodes, plain-language exercise context, rounded rest surface, target/last-time split, calm set list, floating three-destination navigation and lower current-set sheet with direct controls and Save. The interaction test verifies rep adjustment and quick save.

The first render placed the floating navigation at the top because its safe-area custom property existed only inside the scroll subtree. The variable was moved to app chrome with an explicit Pixel override, the navigation was recaptured at the bottom, and the screen-level geometry audit passed.

## Geometry/accessibility defects closed

The first automated capture found a 41 px history-search control, 47 px Open Pace rep increment controls and, after active-screen rework, a 40 px Open Pace RIR control. Each was raised to at least 48 px and the complete 33-state capture was rerun. The final manifest reports zero sub-48 px rendered controls and zero horizontal-overflow states.

Programme selection, history, notes, progress, programme editing, direct comma-decimal input, non-drag reorder actions, timer controls and direction-specific quick-save controls have observable state and browser assertions. This is useful early accessibility evidence, but it is not a WCAG, VoiceOver, TalkBack, switch-access or native Dynamic Type conformance result.

## Independent adversarial rework closed

The final independent pass exercised states that the earlier happy-path suite had accidentally treated as interchangeable. Rework now keeps history destinations, per-workout editor exercises, programme names and prescriptions truthful; distinguishes expected from unplanned sequence advancement; resets completed-set fixtures between sessions; blocks invalid normal-set values; supports completed-set editing; reports partial completion honestly; preserves substitution scope and selected-exercise identity; and marks post-save quick edits as drafts requiring recommit.

The first fresh comparison after that rework exposed fixed-chrome occlusion at the bottom of all three active directions. Opaque chrome coverage and scroll clearance were corrected, a three-direction reachability regression was added, and the 24-test checkpoint suite plus 33-state capture was rerun. Original-resolution inspection confirmed no Tempo action bleed, Field Kit stray action text or Open Pace hidden Finish label remained at that checkpoint.

The Open Pace active reference and its board were safety-edited to remove an unreviewed technique cue. The Tempo board now labels its neutral planning copy as a user-authored session note. Current generation IDs and hashes are retained in [`../../docs/design/source-assets-licences.md`](../../docs/design/source-assets-licences.md).

## Remaining non-blocking limits

- Proposed direction typefaces are not bundled; browser renders use declared system fallbacks.
- Only light appearance and reduced-motion browser emulation were captured in this foundation pass.
- Pixel evidence covers the critical active-workout state; all 30 required direction/screen captures are on the iPhone preset.
- No physical device, native screen reader, native text scaling, colour-filter, haptic or failure-injected persistence run exists because this artefact is not the production application.
- Some generated-reference copy/values were deliberately replaced by the approved product/domain fixture. The references remain visual, not normative behavioural truth.

The final static review then found further state-integrity defects in programme reordering/publishing, completion math, comparable-history boundaries, per-workout context, repeated substitution, cross-direction transient state, in-progress resume/navigation and valid-draft exits. Those defects were corrected. The current 32-case browser suite passes, including deliberate save/discard/keep-editing navigation, and the complete 33-state evidence set was regenerated after the last source change.

Current original-resolution inspection found no remaining actionable P0-P2 mismatch or occlusion. Owner direction selection and the production-phase accessibility, performance and data-safety gates remain separate.

**final result: passed**
