# NextSet visual-direction prototype

This is a disposable Product Design mobile prototype. Its default route is the owner-approved logging-first review proposal, using Tempo Ledger as its proposed visual base:

- Start an empty workout without goals, programmes or scheduling.
- Add exercises and record/edit sets.
- Repeat a completed workout or save it as an optional routine.
- Review honest empty states, workout history and comparable recorded observations.

All default-route data is in memory and resets on reload. It is not a durable workout database or production app.

The earlier three-direction exploration is retained at `?review=legacy`:

1. Tempo Ledger
2. Field Kit
3. Open Pace

Each legacy direction exposes the earlier ten review screens through its in-app screen index: onboarding, programme selection, Today, active workout, set entry, exercise substitution, completion, history, exercise progress, and programme editor.

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

The higher-resolution active-workout originals are retained beside them. All are generated direction references, not runtime screenshots. Source-mock copy and sample values define visual intent only; the documented current foundation rules and content proposals take precedence.

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

The current logging-first validation evidence is under [`evidence/2026-09-07-logging-first/`](evidence/2026-09-07-logging-first/). The August evidence below belongs to the preserved legacy exploration. Re-run the relevant checks after any prototype change.

## Verified logging-first status

The current default prototype passed TypeScript, 13 targeted Playwright cases, protected-runtime validation, production build and four Sites packaging cases. Its 15-state browser capture reported no runtime error, horizontal overflow or rendered control below 48 logical pixels. See [`design-qa.md`](design-qa.md) and [`evidence/2026-09-07-logging-first/command-results.md`](evidence/2026-09-07-logging-first/command-results.md).

## Historical legacy status

On 10 August 2026, the post-rework current source passed the production build, all 28 protected-runtime checks, 32 browser/runtime/product cases and four Sites package cases. A fresh 33-state capture at `2026-08-10T03:34:06.468Z` reports zero runtime errors, horizontal-overflow states or rendered controls below 48×48; all comparison plates, contact sheets and Pixel active captures were inspected at original resolution. See [`design-qa.md`](design-qa.md) and [`evidence/2026-08-06/command-results.md`](evidence/2026-08-06/command-results.md).

The generated source boards are still not labelled as rendered screenshots; the browser captures live under `evidence/`. Proprietary device/keyboard chrome from the local Product Design template remains intentionally ignored for Git publication. A clone must re-bootstrap that licensed template or supply cleared replacements before reproducing device-framed QA.
