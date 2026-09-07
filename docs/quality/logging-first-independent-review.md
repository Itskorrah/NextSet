# Logging-first independent review

Status: final independent review
Review date: 2026-09-07
Reviewer: independent Codex subagent; no primary authorship of the reviewed logging-first changes

## Scope and method

Reviewed the current default disposable prototype at `/`, its logging-first evidence package, and the approved logging-first scope in the product requirements, feature inventory, journeys, workout rulebook (`WPR-LOG-001`–`WPR-LOG-005`) and acceptance criteria. The retained direction study at `/?review=legacy` is a historical review route and was not treated as a failure of the default logging-first flow.

The evidence manifest source hashes match the reviewed `src/Prototype.tsx` and `src/prototype.css`. The default route rendered as the logging-first experience, showed the blank Start workout path, and had no framework error overlay or captured console errors.

## Focused recheck

The material prior findings are closed in both source and focused live tests:

- Multiple entries of the same exact exercise identity are flattened per completed workout before the exercise record is derived, so the heaviest eligible set across those entries contributes to Progress.
- Weighted sets retain canonical grams. A reps-only completed-set edit after changing display units preserves that stored amount and displays the original pound value when switching back.
- A populated next set presents a specifically labelled `Log set` action which records the shown values in one deliberate activation.

The default logger also keeps blank start, empty History/Progress, repeat/routine copy without copied completions, explicit finish eligibility, bodyweight/timed entry, correction/deletion recalculation, visible unit state and non-blocking rest state within the disposable interaction scope. No recommendation, programme, goal, schedule or fictional analytic record is reachable in that default route.

## Validation evidence

| Check | Result |
|---|---|
| Evidence source-hash comparison | Matched `manifest.json` for `src/Prototype.tsx` and `src/prototype.css` |
| TypeScript | `node node_modules/typescript/bin/tsc` passed |
| Recorded focused suite | 13 `logging-first.spec.ts` tests passed, as recorded in `evidence/2026-09-07-logging-first/command-results.md` |
| Independent live recheck | Passed: one-tap populated next set; duplicate exercise aggregation in Progress; reps-only edit preserves canonical load across kg/lb |
| Browser inspection of `/` | Default logging-first content rendered; no error overlay and no captured console errors |
| Recorded visual/accessibility geometry capture | 15 states; no reported horizontal overflow, runtime errors or controls below 48 logical pixels |

## Limits that remain production gates

This is an in-memory browser prototype that truthfully resets on reload. It does not constitute production evidence for local transactions, active-session restoration, SQLite/migrations, native assistive technology, physical devices, export or durable deletion. Those requirements remain explicit production gates and are not P0–P2 defects in this foundation prototype review.

## Gate result

No unresolved P0–P2 finding was identified in the reviewed default logging-first prototype and its scoped evidence.

**Final gate result: passed**
