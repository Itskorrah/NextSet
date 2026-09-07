# Logging-first prototype validation

Run date: 2026-09-07  
Scope: disposable logging-first Tempo Ledger proposal at `/`; preserved historical direction study at `/?review=legacy`.

## Commands and results

```text
node node_modules/typescript/bin/tsc
exit 0
```

```text
node node_modules/@playwright/test/cli.js test logging-first.spec.ts --workers=1 --reporter=line
13 passed (1.4m)
```

The test suite covers immediate blank start; empty History/Progress; one-tap populated next-set logging; validation and comma-decimal entry; active-session navigation; repeat and routine starts without copied completions; custom/bodyweight/timed entries; edits, deletion/undo and derived record updates; duplicate exercise aggregation; preserved canonical weight after a unit change; iPhone/Pixel geometry checks.

```text
node scripts/capture-logging-first.mjs
exit 0
15 captures; 0 runtime errors; 0 horizontal-overflow states; 0 controls below 48 logical pixels
```

Capture context: Chromium, en-AU, light appearance and reduced-motion emulation. The iPhone runtime preset is 393×852 and Pixel active state uses its 427×952 preset. The `large-text` image applies a 200% prototype base-font override; it is early browser evidence only, not native Dynamic Type proof.

## Limits

This artefact is an in-memory browser prototype. Reload resets data. It does not prove local transactions, offline recovery, SQLite migrations, native notifications/haptics, VoiceOver/TalkBack, physical-device interaction, export or deletion durability. Those requirements remain future production gates.
