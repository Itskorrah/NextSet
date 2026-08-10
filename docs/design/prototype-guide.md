# NextSet prototype guide

Status: disposable foundation design artefacts; not production code  
Date: 2026-08-06

## Read this first

Everything under [`../../prototypes/`](../../prototypes/) is disposable visual exploration. It is not the production NextSet application, a tested workout engine, a durable local database, a native accessibility implementation or an approved design system.

The prototype uses realistic illustrative data. A toast or label such as “saved locally” demonstrates intended copy/state only; the prototype does not prove a transactional local write, interruption recovery, personal-record calculation, progression rule or offline production behaviour.

Production implementation must remain stopped until the product owner approves the visual direction, MVP, architecture and critical journeys.

## Artefact inventory

### Generated visual references

| Direction | File | Original size | Evidence type |
|---|---|---:|---|
| Tempo Ledger | [`../../prototypes/visual-references/tempo-ledger-active-workout.png`](../../prototypes/visual-references/tempo-ledger-active-workout.png) | 852×1846 PNG | Generated active-workout visual reference |
| Field Kit | [`../../prototypes/visual-references/field-kit-active-workout.png`](../../prototypes/visual-references/field-kit-active-workout.png) | 853×1844 PNG | Generated active-workout visual reference |
| Open Pace | [`../../prototypes/visual-references/open-pace-active-workout.png`](../../prototypes/visual-references/open-pace-active-workout.png) | 853×1844 PNG | Generated active-workout visual reference |

The complete state coverage is reviewable in three generated boards:

| Direction | Ten-screen board | Coverage |
|---|---|---|
| Tempo Ledger | [`tempo-ledger-ten-screen-board.png`](../../prototypes/visual-references/tempo-ledger-ten-screen-board.png) | Exactly ten required screens, 5×2 board |
| Field Kit | [`field-kit-ten-screen-board.png`](../../prototypes/visual-references/field-kit-ten-screen-board.png) | Exactly ten required screens, 5×2 board |
| Open Pace | [`open-pace-ten-screen-board.png`](../../prototypes/visual-references/open-pace-ten-screen-board.png) | Exactly ten required screens, 5×2 board |

These images exist and were inspected directly. They are **not rendered implementation screenshots**. Do not label, caption or present them as browser captures, tested UI, mobile screenshots or proof of implementation fidelity.

### React/Vite source prototype

Location: [`../../prototypes/nextset-directions/`](../../prototypes/nextset-directions/)

The shared prototype source defines exactly these ten screen states for each visual direction:

1. Onboarding
2. Programme selection
3. Today
4. Active workout
5. Set entry
6. Exercise substitution
7. Workout completion
8. History
9. Exercise progress
10. Programme editor

The screen index and direction gallery allow review navigation. Interactive examples include goal and schedule choice, expected start, current-set editing, substitution choice, completion, history drill-down and programme editing. Those interactions are prototype state only and do not implement the domain, persistence or recovery rules.

The protected runtime includes calibrated preview screens of 393×852 logical pixels for the iPhone preset and 427×952 for the Pixel 10 preset. Device chrome is a review aid, not an assertion that the product has been tested on those devices.

## Verified runtime and QA status

As of 2026-08-10:

- a clean install completed from the committed npm lockfile through npm 11.6.2 on Node 24.14.0;
- the protected-runtime check passed for all 28 protected files;
- TypeScript and the production/Sites build passed;
- the current 32-case browser/runtime/product suite and all four Sites worker/package tests passed after the final adversarial source rework;
- exactly 30 iPhone captures exist at 393×852, one for each direction/screen combination;
- three critical Pixel active-workout captures exist at 427×952;
- the three active-workout implementation captures were placed beside and directly compared with their exact normalized source references;
- the current-source 33-state capture at `2026-08-10T03:34:06.468Z` found no console/page error, horizontal overflow or rendered control below 48×48;
- original-resolution comparison confirmed that all active-workout actions could scroll fully above fixed app chrome without bleed or occlusion.

The verified revision includes the final state-integrity rework for programme publishing/reordering, completion math, comparable-history boundaries, substitution identity, session continuity and deliberate save/discard/keep-editing exits. The complete suite and evidence capture were rerun after the last source change.

The evidence is retained in [`../../prototypes/nextset-directions/evidence/2026-08-06/`](../../prototypes/nextset-directions/evidence/2026-08-06/), with exact results in [`command-results.md`](../../prototypes/nextset-directions/evidence/2026-08-06/command-results.md) and per-screen geometry/runtime records in [`capture-manifest.json`](../../prototypes/nextset-directions/evidence/2026-08-06/capture-manifest.json). [`../../prototypes/nextset-directions/design-qa.md`](../../prototypes/nextset-directions/design-qa.md) records the comparison history and remaining P3 limitations.

This closes the disposable prototype's executable/rendered evidence gate for foundation review. It does not prove a native app, durable local writes, physical-device behaviour, VoiceOver/TalkBack, native text scaling or production readiness.

## Run and re-verify

Read [`../../prototypes/nextset-directions/AGENTS.md`](../../prototypes/nextset-directions/AGENTS.md) before any prototype work. From the prototype directory:

```bash
npm ci
npm run check:runtime
npm run dev -- --host 127.0.0.1 --port 4173
```

In Codex Desktop, open `http://127.0.0.1:4173/` in the in-app browser. Keep the runtime and protected assets unchanged unless the user explicitly requests a runtime change.

Before handoff or a static build:

```bash
npm run check:runtime
npm run test:runtime
npm run build
npm run test:sites
```

Record the exact command, exit code, runtime versions, device preset/state and evidence path. A check that could not run remains a blocker; never replace it with “looks plausible”.

## Review route

For each direction, inspect all ten states in the order above, then repeat the critical active path:

```text
Onboarding
  → Programme selection
  → Today
  → Active workout
  → Set entry and save
  → Exercise substitution
  → Active workout
  → Completion
  → History
  → Exercise progress
  → Programme editor
```

Also test direct screen-index navigation, direction switching and the iPhone/Pixel preview selector. Switching visual direction must not retain a state in a way that disguises a missing treatment.

## Visual comparison procedure

1. Open the source PNG at original resolution and inspect it before comparison.
2. Render the matching active-workout state at the 393×852 iPhone screen viewport.
3. Capture only the app screen/device state intended for comparison; reject loading, blank, cropped or wrong-state captures.
4. Place the source reference and rendered capture side by side at the same aspect and visible state.
5. Compare hierarchy, content, density, typography, colour role, spacing, target geometry, shape, timer, set rows, progress and bottom navigation.
6. Fix visible mismatches in disposable prototype-owned source only.
7. Capture and compare again. A screenshot by itself is not visual QA.
8. Repeat critical checks on the 427×952 Pixel preset and for every required screen, even though only Active workout has a generated source reference.

Do not stretch the source PNG, crop out difficult areas or compare different scroll positions to create an artificial match.

## Ten-screen review checklist

| Screen | Product-state checks | Direction-distinction checks |
|---|---|---|
| Onboarding | Optional/skip language, goal does not lock features, clear step progress | Page/folio vs setup console vs guided path; distinct density, shape and motion |
| Programme selection | Template facts, equal fixed/flexible choice, custom path | Spec sheet vs loadout vs guided comparison |
| Today | Resume precedence, expected Start primary, unscheduled secondary, no analytics wall | Ledger agenda vs ready panel vs calm next-step narrative |
| Active workout | Previous/plan/logged distinction, non-blocking timer, progress, notes, substitution | Ruled ledger vs control console vs vertical path/current-set sheet |
| Set entry | Visible unit, direct edit + increment, optional RIR, one valid completion action | Inline ledger expansion vs large bays vs lower focus sheet |
| Substitution | Match/mismatch, no equivalence claim, today-only default | Comparison table vs availability list vs explanatory candidates |
| Completion | Saved-on-device first, concise summary, restrained PR/recommendation | Seal/stamp vs status panel/tag vs calm explanation |
| History | List/calendar, partial/short labels, no fake data | Chronological ledger vs dense log vs friendly timeline |
| Exercise progress | Named question, comparable scope, estimate label, data alternative | Ruled plot vs calibrated plot vs spacious answer-first trend |
| Programme editor | Future version scope, validation, accessible reorder alternative | Outline editor vs modular loadout vs guided collapsible editor |

If all three versions of a screen differ only by colour, the visual exploration has failed even if the implementation compiles.

## Interaction and failure checks

- Expected Start requires one deliberate action when conflict-free.
- Unscheduled start is secondary and defaults not to advance a programme sequence.
- A valid normal set has one completion action; the timer remains usable and non-blocking.
- Previous, planned and draft/logged values remain distinct after edits.
- Substitution defaults to the current session, explains matching factors/mismatches and never says “equivalent” or “safe”.
- Completion is concise and puts durable-device status before celebration.
- No state implies actual persistence, sync, analytics, PR calculation or recommendation execution in the prototype handoff.
- Every gesture has a visible action; every critical visible target is at least 48×48 in the prototype geometry.
- Browser zoom/text override at 200% is useful for early layout discovery, but it is not native Dynamic Type/font-scale or screen-reader proof.
- Reduced-motion browser media emulation is useful for checking the prototype branch, but it is not physical-device validation.

## Evidence naming

Store future disposable prototype evidence under a clearly dated review folder, for example:

```text
prototypes/nextset-directions/evidence/2026-08-06/
  tempo-ledger-active-iphone.png
  field-kit-active-iphone.png
  open-pace-active-iphone.png
  ten-screen-review.md
  command-results.txt
```

Evidence filenames name direction, screen, device/state and appearance. Source-reference images remain separate from rendered captures. Regenerate the whole dated set after any visible or interaction change; do not mix captures from different builds under one manifest.

## Prototype acceptance and stopping point

The disposable prototype is reviewable only when:

- dependencies install from the pinned lockfile in an approved environment;
- protected runtime check and relevant tests pass;
- each direction exposes all ten required states;
- the three active-workout renders have been compared directly with their source references;
- iPhone and Pixel presets have no critical crop, keyboard or safe-area failure;
- direction differences extend beyond colour into navigation, density, shape, type, timer, set row, progress, motion and haptics;
- limitations and mock behaviour remain explicit.

Even then, the result is a product-owner decision artefact, not production code and not proof of native accessibility, local-first durability or release readiness.
