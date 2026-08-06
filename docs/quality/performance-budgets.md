# NextSet performance budgets

Status: proposed initial budgets; calibrate once minimum devices are approved, never after measuring only high-end devices  
Date: 2026-08-06

## User-centred objective

NextSet must feel immediate during the fiftieth workout with a large history, not only during onboarding on a development machine. Data durability has priority over shaving milliseconds: no performance optimisation may acknowledge an uncommitted set, disable required integrity checks or depend on a background callback.

## Measurement contract

- Measure signed or release/profileable builds; debug/development results are diagnostic only. React Native explicitly warns that development mode harms JavaScript performance. [React Native performance](https://reactnative.dev/docs/performance.html) (accessed 2026-08-06).
- Approve three physical reference tiers before implementation: minimum supported iOS device, minimum supported Android device, and current representative mid-tier devices. Blocking values below apply to each minimum device unless stated.
- Fresh install and large-history fixture are separate runs; test airplane mode and normal local state.
- Report p50/p95/p99, sample count, device/OS, thermal/battery state, build/commit, schema and fixture hash. Use ≥30 launch samples and ≥500 set commits per platform for RC.
- Start after device cool-down, ≥20% free storage and no debugger. Record thermal throttling; rerun rather than discard silently.
- Wall duration uses monotonic clocks. Frame data comes from platform traces/profilers, not visual impression.
- Regression gate applies even if the absolute budget passes: >10% p95 slowdown in a critical metric versus the approved baseline requires investigation/approval.

Android distinguishes time to initial display (TTID) from time to full display (TTFD); NextSet records both, with “full” meaning the primary local content is interactive. [Android app startup](https://developer.android.com/topic/performance/vitals/launch-time) (accessed 2026-08-06).

## Reference fixtures

| Fixture | Contents |
|---|---|
| Fresh | shipped catalogue, onboarding incomplete, no user history |
| Typical | 2 current programmes, 150 completed workouts, 4,000 sets, 25 custom notes |
| Large | 20 programme/version graphs, 5,000 workouts, 150,000 sets, 500 custom exercises, realistic revisions/tombstones |
| Long active | 40 exercises × 12 set rows, groups, notes, active timer, 5 substitutions |
| Migration | previous-release large DB plus enough free space for verified recovery copy |

## Interaction and storage budgets

All times are from user action to the named durable/interactive outcome.

| Metric | Minimum-device budget | Notes |
|---|---:|---|
| Set value input visual response | p95 ≤50 ms; p99 ≤100 ms | Keystroke/tap to displayed value; no blocked JS/UI thread. |
| Durable set commit | p95 ≤100 ms; p99 ≤200 ms | Tap/submit to SQLite commit + saved feedback, WAL/FULL baseline. |
| Edit/reorder durable commit | p95 ≤150 ms; p99 ≤300 ms | Long active fixture. |
| Start expected workout | p95 ≤350 ms; p99 ≤700 ms | Tap to interactive active screen with transaction committed. |
| Restore active workout | p95 ≤500 ms after DB ready | Long active fixture; correct last committed state. |
| Complete workout | p95 ≤500 ms; p99 ≤1,000 ms | Long active fixture, includes schedule advance and core derived rows. |
| Today local query/projection | p95 ≤100 ms; p99 ≤200 ms | Large fixture, excluding cold app launch. |
| Exercise search result update | p95 ≤100 ms after input | 500 custom + shipped catalogue; ≥2-character query. |
| History first page | p95 ≤200 ms | Large fixture, 50 rows or viewport equivalent. |
| Exercise-progress view | p95 ≤300 ms | Large fixture; bounded range/default summary. |
| Save programme version | p95 ≤500 ms; p99 ≤1,000 ms | Maximum approved MVP programme graph. |

If a durability budget fails, optimise statements/indexes/render invalidation first. Relaxing `synchronous` needs a new ADR plus power-loss proof and product-owner approval.

## Launch/navigation budgets

| Metric | Budget |
|---|---:|
| Cold TTID | p50 ≤1,000 ms; p95 ≤1,800 ms |
| Cold TTFD, no migration | p50 ≤1,500 ms; p95 ≤2,500 ms |
| Warm TTFD | p95 ≤900 ms |
| Route transition to interactive local screen | p95 ≤300 ms; p99 ≤600 ms |
| Recovery/migration progress indication | visible by 500 ms if operation will exceed 1,000 ms |

Today/active workout shell may render before noncritical derived summaries, but Start/current set/error/recovery status cannot be falsely marked ready.

## Frame and animation budgets

At 60 Hz a frame has about 16.67 ms; React Native and Android guidance both use roughly this smooth-rendering target. Android labels frames above 700 ms frozen and says none should take that long. [React Native performance](https://reactnative.dev/docs/performance.html) and [Android slow rendering](https://developer.android.com/topic/performance/vitals/render) (accessed 2026-08-06).

Measure active-workout scroll, numeric input, set completion, exercise reorder/substitution transition, completion and history/chart interactions:

- ≥95% of steady interaction frames delivered within one 60 Hz interval on minimum devices.
- ≥99.5% within two intervals (≤33.4 ms), excluding first navigation frame reported separately.
- **Zero frames ≥700 ms** and zero application-not-responding events.
- No JS-thread task >50 ms during repeated set input; unavoidable work is chunked/deferred after durable feedback.
- 120 Hz devices should use available refresh smoothly, but v1 blocking budget is the 60 Hz minimum-device contract.
- Reduced-motion mode meets equal or better response budgets and does not add artificial delays.

## Memory and resource budgets

Measure resident/physical footprint with platform tools after warm-up/GC stabilisation:

| Scenario | Budget |
|---|---:|
| Typical Today/history steady state | p95 ≤220 MB |
| Long active/large chart peak | ≤300 MB, then returns to within 15% of pre-action baseline within 30 s |
| 20 cycles Today → active → history → Today | retained growth ≤15 MB and ≤10% of baseline; no monotonic unbounded growth |
| Backgrounded after workout saved | releases nonessential caches/images within platform opportunity; active data remains durable on disk |

These are guardrails, not an instruction to cache to the limit. Any OS memory termination in the reference test is a failure even below a sampled number.

## Database, migration and export budgets

| Operation | Typical | Large | Behaviour |
|---|---:|---:|---|
| DB open + PRAGMA/bootstrap, no migration | p95 ≤150 ms | p95 ≤300 ms | Integrity quick path included. |
| Minor release migration | ≤2 s | ≤15 s | Progress if >1 s; UI not usable until verified. |
| Major migration/rebuild | ≤5 s | ≤30 s | Requires release-specific budget/free-space test. |
| Full integrity/foreign-key diagnostics | report baseline | ≤60 s | Run in diagnostics/RC; progress/cancel only if safe. |
| Lossless export + verification | ≤3 s | ≤30 s | Does not include user time in share picker. |
| Conditional post-MVP portable import/restore validation | ≤5 s | ≤45 s | Initial future guardrail only; not an MVP gate. If approved, live DB remains unchanged until final swap. |
| Derived-record full rebuild | ≤2 s | ≤20 s | Incremental updates meet interaction budgets. |

No timeout may trigger an empty reset. If a supported large dataset exceeds a blocking budget, show determinate/meaningful progress and preserve recovery; get quality/product approval before release. The conditional portable import/restore row becomes blocking only if the product owner moves `FEAT-POST-009` into scope.

## Energy/background budgets

- With a rest timer running and screen otherwise idle, app-attributable average CPU is <5% on each reference device over 10 minutes after warm-up.
- A 30-minute typical screen-on workout consumes no more than 2 percentage points of battery above a matched static-screen baseline on the same device/settings; run three trials and report median.
- No polling loop faster than needed for the visible timer; background state has no timer tick loop or persistent wake lock.
- Local notification scheduling is event-based. No network/background sync exists in v1.
- Haptics occur only for approved user actions, not timer ticks or scrolling.

Battery measurement is noisy; a >10% regression in platform energy-impact trace or the controlled delta above blocks pending investigation even if absolute device readings vary.

## Package and storage budgets

- Store download per platform architecture: ≤60 MB for first release.
- Installed application code/assets excluding user DB/cache: ≤150 MB.
- No unlicensed/unused large video or duplicate font assets.
- User database growth target: ≤1 KB median per completed set excluding note text/catalogue; measure actual fixture, do not preallocate large files.
- Temporary export/migration requires a preflight free-space estimate and cleans owned staging/recovery copies according to policy.

## Performance test gates

Every PR: microbench changed domain/SQL hot path and prevent obvious query-plan regressions.  
Nightly: typical/large automated interaction and frame trend on at least one iOS/Android reference device.  
Release candidate: full table on all minimum/mid-tier reference devices, signed build, raw traces archived.

A metric fails if either absolute budget or >10% regression gate fails. Rerun once only for a documented environmental anomaly. Accepted exception requires measured user impact, product/quality/architecture sign-off, expiry and owner; no exception for acknowledged data loss, frozen frames or repeated set input missing the p99 by >2×.

## Decisions and unknowns

| Item | Class |
|---|---|
| Commit/interaction/frame budgets | Must initial gates; tune only with evidence before implementation baseline freezes |
| Release-build physical-device measurement | Must |
| Specific profiling automation/tool | Reversible |
| Exact minimum devices/OS versions | Blocking unresolved product/engineering decision |
| 120 Hz blocking target | Defer until device support and visual direction approved |
| Remote production performance telemetry | Deferred pending privacy decision; local/manual evidence still required |
| User-directed portable restore/import budget | Post-MVP; activates only with explicit product-owner scope approval |
