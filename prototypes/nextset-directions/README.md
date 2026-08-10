# NextSet visual-direction prototype

This is a disposable Product Design mobile prototype containing exactly three review directions:

1. Tempo Ledger
2. Field Kit
3. Open Pace

Each direction exposes the ten required screens through the in-app screen index: onboarding, programme selection, Today, active workout, set entry, exercise substitution, completion, history, exercise progress, and programme editor.

The prototype uses realistic illustrative training data. It has no production persistence, account, analytics, cloud sync, coaching, or backend behaviour and must not be used as the production codebase.

## Visual sources

Review-ready 390×844 source images are in `../visual-references/`:

- `tempo-ledger-active-workout-390x844.png`
- `field-kit-active-workout-390x844.png`
- `open-pace-active-workout-390x844.png`

Review-ready generated ten-screen boards are also present:

- `tempo-ledger-ten-screen-board.png`
- `field-kit-ten-screen-board.png`
- `open-pace-ten-screen-board.png`

The higher-resolution active-workout originals are retained beside them. All are generated direction references, not runtime screenshots. Source-mock copy and sample values define visual intent only; approved domain rules and content documents take precedence.

## Run locally

This prototype preserves the Product Design `mobile-app` runtime. From this directory:

```bash
npm ci --prefer-offline --no-audit --no-fund
npm run check:runtime
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

Open `http://localhost:4173/` in Codex Desktop’s in-app browser. Use the runtime device picker to review iPhone and Pixel 10. Keep the browser viewport large enough that the app-owned phone screen is rendered at 1:1 scale.

## Validate

```bash
npm run check:runtime
npm run test:runtime
npm run build
npm run test:sites
```

The final foundation pass completed these checks and retained its evidence under [`evidence/2026-08-06/`](evidence/2026-08-06/). Re-run them after any prototype change.

## Verified foundation status

On 10 August 2026, the post-rework current source passed the production build, all 28 protected-runtime checks, 32 browser/runtime/product cases and four Sites package cases. A fresh 33-state capture at `2026-08-10T03:34:06.468Z` reports zero runtime errors, horizontal-overflow states or rendered controls below 48×48; all comparison plates, contact sheets and Pixel active captures were inspected at original resolution. See [`design-qa.md`](design-qa.md) and [`evidence/2026-08-06/command-results.md`](evidence/2026-08-06/command-results.md).

The generated source boards are still not labelled as rendered screenshots; the browser captures live under `evidence/`. Proprietary device/keyboard chrome from the local Product Design template remains intentionally ignored for Git publication. A clone must re-bootstrap that licensed template or supply cleared replacements before reproducing device-framed QA.
