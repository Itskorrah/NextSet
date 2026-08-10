# Prototype command results

Run date: 2026-08-10  
Workspace: `prototypes/nextset-directions`  
Node: 24.14.0  
npm CLI: 11.6.2, invoked through the bundled pnpm `dlx` runner because no standalone `npm` binary was exposed

## Current-source verification status

The final High-effort pass verified the current source after the last valid-draft navigation and completion-copy changes. The production build, all 28 protected-runtime integrity checks, 32 Playwright cases, four Sites package cases and complete evidence capture pass. The earlier usage-limit blocker is resolved and is retained only in task history, not as current project status.

## Clean install

```text
pnpm dlx npm@11.6.2 ci
exit 0
added 77 packages
```

The command consumed the committed npm lockfile (`lockfileVersion: 3`). No dependency range was updated.

## Protected runtime and build

```text
pnpm dlx npm@11.6.2 run build
exit 0
Mobile runtime integrity check passed (28 protected files).
TypeScript passed.
Vite 8.1.3 transformed 510 modules.
Prepared Sites build: dist/server/index.js and dist/.openai/hosting.json.
```

## Runtime and product interaction suite

```text
pnpm dlx npm@11.6.2 run test:runtime
exit 0
32 passed (2.7m)
```

Coverage includes protected mobile-scroll/carousel/sheet/keyboard/Pixel/FlowStack behaviour; exactly ten states in each direction; expected and unplanned workout starts; valid, invalid and locale-aware set entry; completed-set editing; partial completion; workout-sequence preservation; substitution scope, empty-result and exercise-identity behaviour; truthful history destinations; per-workout programme editing and validation; draft-safe global navigation; distinct Field Kit/Open Pace quick-save controls; and three-direction bottom-scroll reachability above fixed chrome.

## Sites package suite

```text
pnpm dlx npm@11.6.2 run test:sites
exit 0
4 passed; 0 failed
```

## Browser evidence capture

```text
pnpm dlx npm@11.6.2 run capture:evidence
exit 0
Captured 33 mobile states, 3 active-workout comparison plates, and 3 rendered contact sheets.
No console/page errors, horizontal overflow, or sub-48px rendered controls detected.
```

The final manifest timestamp and per-screen checks are in [`capture-manifest.json`](capture-manifest.json). The 30 iPhone files are exactly 393×852. The three Pixel active-workout files are exactly 427×952.

Current capture timestamp: `2026-08-10T03:34:06.468Z`. The current-source capture contains 33 records and reports zero runtime errors, horizontal-overflow states or rendered controls below 48×48. All three comparison plates, all three contact sheets and the three Pixel active captures were inspected at original resolution after capture.
