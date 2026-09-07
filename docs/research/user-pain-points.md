# NextSet user pain points

**Research date:** 6 August 2026 (Australia/Sydney)  
**Method:** Synthesis of current product documentation, public store reviews and recent community discussions. No interviews, diary study or representative survey has yet been completed.

## Evidence rules

- **[D] Documented:** a capability or limitation appears in first-party help, release or store material.
- **[U] User-reported:** one or more people describe an experience publicly. Reports expose possible failure modes but do not establish prevalence.
- **[I] Inference:** a NextSet design requirement or hypothesis derived from evidence.

Frequency below is **directional**: “recurring” means the theme appeared across products or threads, not that a population rate is known. Confidence reflects triangulation, not statistical certainty.

## Ranked pain-point inventory

| Rank | Pain point | Who/when | Severity | Directional frequency | Confidence | NextSet response |
|---:|---|---|---|---|---|---|
| 1 | **A completed set or workout can disappear, duplicate or disagree across devices.** | Anyone logging on a Watch/phone, during an outage or after interruption | Critical | Recurring across several communities | High that the failure mode matters; unknown incidence | Local atomic writes, explicit pending-sync state, deterministic merge, force-quit recovery and undo/history |
| 2 | **Repeated entry demands too many taps or too much precision while the user is exerted.** | Active lifters, especially one-handed, sweaty, in poor light or between timed sets | High | Recurring | Medium-high | Previous-value prefill, row-level completion, large targets, focused numeric editing and non-modal timer |
| 3 | **Programme structure is too rigid, while editing/importing it is too laborious.** | Users with spreadsheet/PDF programmes, rotating schedules, busy gyms or missed days | High | Recurring | Medium | Fast MVP routine creation, fixed/flexible sequence, choose-next and intent-preserving substitutions; routine import is the separate post-MVP `FEAT-POST-007` |
| 4 | **Progression advice feels opaque or wrong when context is missing.** | Intermediate/advanced users; limited-equipment and returning users | High; potentially safety-relevant | Recurring in adaptive-app discussions | Medium | Explain recommendation inputs, show planned versus actual, make all suggestions editable/dismissible |
| 5 | **Workout history is hard to move, incomplete on export or locked behind a tier.** | Switchers, long-term users, coaches and privacy-conscious users | High because years of history create lock-in | Recurring and partly documented | High | Versioned full MVP export; validated portable restore/import remains post-MVP `FEAT-POST-009`; never charge for basic access to user-authored data |
| 6 | **Subscription price or free-tier caps feel disconnected from core logging value.** | Casual users and people already paying for coaching/programmes elsewhere | Medium-high | Widespread anecdotal theme | Medium | Do not use an indefinite subscription in the MVP; separate durable core utility from genuinely recurring services |
| 7 | **A large exercise library is still hard to search or substitute correctly.** | Crowded-gym users, home-gym users and people with injuries/preferences | Medium-high | Recurring | Medium | Alias/equipment/movement search, recently used list, fast custom exercise and intent-aware substitution |
| 8 | **Watch and health integrations fail at the exact moment they are meant to reduce friction.** | Wearable-first users | High for affected sessions | Repeated in Strong/Hevy reports | Medium-high for the failure mode | Ship wearable logging only with an explicit ownership/merge model and destructive-state recovery tests |
| 9 | **Analytics are abundant but do not answer what to do next.** | Beginners and time-poor users | Medium | Common category pattern; limited direct prevalence data | Medium-low | Make insights action-oriented and traceable; default to recent comparison, PRs and trend context |
| 10 | **Beginners face jargon and blank-page anxiety; advanced users face simplified ceilings.** | New lifters versus experienced programme followers | Medium-high | Persistent category tension | Medium | A runnable starter routine plus progressive disclosure of RPE/RIR, set types, periodisation and calculators |
| 11 | **Streaks, feeds and celebrations can become guilt, clutter or interruption.** | Private, inconsistent-schedule and low-attention users | Medium | Plausible but not well quantified here | Low-medium | Private by default; celebrations brief and dismissible; adherence views tolerate planned rest and missed days |

## Evidence behind the highest-risk pains

### 1. Data loss, sync ambiguity and interruption

- **[U]** Strong users describe Apple Watch/phone live-sync divergence, unchecked sets and timers that do not agree ([November 2025 thread](https://www.reddit.com/r/strongapp/comments/1p1tcww/live_sync_issues/)); a separate user reported several Watch workouts missing from phone history ([September 2025 report](https://www.reddit.com/r/strongapp/comments/1nejskg)). Replies are mixed, so these cannot estimate incidence.
- **[U]** In a 2026 Strong thread, a paid user describes spending workout time repairing Watch/phone state; other replies range from similar problems to no problem at all ([mixed report](https://www.reddit.com/r/strongapp/comments/1ssrg6o/bugs/)). The heterogeneity is itself important: intermittent failures are difficult to reproduce and erode trust.
- **[U]** A January 2026 Hevy outage thread contains many “no internet”/upload reports and some manual re-entry after service returned ([thread](https://www.reddit.com/r/Hevy/comments/1qhaohr/anyone_elses_hevy_app_not_working/)). A smaller older thread records the developer warning that logout/reinstall could destroy unsynced sessions ([developer response](https://www.reddit.com/r/Hevy/comments/1cg4jlj)).
- **[D]** Fitbod’s own [offline guide](https://help.fitbod.me/hc/en-us/articles/360006572594-Can-I-use-Fitbod-without-an-internet-connection) distinguishes locally available logging from unavailable history/record sync and warns users to reconnect before deleting the app.

**[I] Requirement:** A set-complete action commits locally before any animation or network operation. Recovery tests must cover airplane mode, process kill, phone restart, low storage, background expiration, duplicate taps and clock changes. The user must see whether data is saved locally, synced or needs attention.

### 2. Friction during repeated logging

- **[D]** Competitors repeatedly advertise remembered values and shortcuts: GymBook documents prefilled pickers/Quick-Log in its [store listing](https://apps.apple.com/us/app/gymbook-strength-training/id650113307), RepCount documents last-weight prefill in its [listing](https://apps.apple.com/us/app/repcount-gym-workout-tracker/id594982044), and Strong positions itself as a notebook replacement on its [product page](https://www.strong.app/).
- **[U]** A long-time JEFIT user says recent changes made manual entry slower and familiar functions harder to reach ([discussion](https://www.reddit.com/r/jefit/comments/1ll9bq3)). This is one account, but it describes a concrete regression to benchmark.
- **[U]** A Liftin’ user notes that swapping an exercise requires an extra search action before choices appear ([release discussion](https://www.reddit.com/r/LiftinApp/comments/1ro79yx/version_480_released/)). Small repeated costs matter more inside a timed session than in settings.

**[I] Requirement:** For a repeated unchanged set, the acceptance target is one deliberate tap to commit. Editing a numeric value should not require navigating away, and timer controls must never cover the next set. This is a usability hypothesis, not an established universal threshold; validate it with task timing and error rate.

### 3. Rigid programmes and costly setup

- **[U]** Liftin’ users ask to import a premade spreadsheet/PDF plan rather than reconstruct it manually ([request](https://www.reddit.com/r/LiftinApp/comments/1s6hh1c/how_to_add_a_premade_workout_planprogram/)).
- **[U]** An Alpha Progression user says the inability to import history is a switching blocker even though CSV export exists ([request](https://www.reddit.com/r/alphaprogression/comments/1houajm/feature_request_import_workout_and_history/)).
- **[D]** Boostcamp addresses authoring depth with a [desktop programme creator](https://www.boostcamp.app/custom-program), implicitly acknowledging that dense multi-week editing is not always a good phone task.

**[I] Requirement:** Separate programme definition from session execution. Users can skip, reorder, substitute or do an ad-hoc workout without silently rewriting the source programme. Import should expose a preview and mapping step, not guess destructively.

### 4. Recommendation trust

- **[D/M]** Fitbod says session generation considers goals, history, recovery, equipment and time in [its help centre](https://help.fitbod.me/hc/en-us/sections/360001078993-Understanding-Fitbod-How-It-Works); Alpha Progression describes per-set recommendations and a stable plan on [its product page](https://alphaprogression.com/en/); RP documents feedback-driven mesocycle adjustments in its [store listing](https://apps.apple.com/us/app/rp-hypertrophy/id1555614554).
- **[U]** Fitbod’s team acknowledged that recommendations can overshoot and discussed fixes in a [2026 product update](https://www.reddit.com/r/fitbod/comments/1t7bndn/what_weve_fixed_whats_next/). Users in another thread describe equipment/history context that appears to bias recommendations ([discussion](https://www.reddit.com/r/fitbod/comments/1syw4wx/fitbod_workers_i_invite_you_to_answer_this/)).

**[I] Requirement:** Recommendations are proposals, not truth. Display a concise rationale and the source observations; allow “keep last time”, direct edit and dismissal. Never imply injury prevention or medical authority.

### 5. Portability and ownership

- **[D]** Strong documents CSV export but says it cannot be imported back ([support article](https://help.strongapp.io/article/235-export-workout-data)). Alpha Progression advertises CSV export; Caliber announced in-app export in a [release note](https://www.reddit.com/r/caliberstrong/comments/1nzwrod/release_notes_caliber_570_export_workout_data/).
- **[U]** Boostcamp users call missing official CSV a deal-breaker and publish an extraction workaround ([request](https://www.reddit.com/r/Boostcamp/comments/1mvura5/can_i_download_my_historical_data/), [workaround](https://www.reddit.com/r/Boostcamp/comments/1pl34n0/heres_how_to_get_all_of_your_workout_data_as_a/)).
- **[U]** A Hevy user reports that exported workout rows omit muscle-group metadata even though full historical sessions remain downloadable ([discussion](https://www.reddit.com/r/Hevy/comments/1oo19nc/psa_hevy_saves_all_your_workout_history_even/)). Field completeness needs hands-on verification.

**[I] MVP requirement:** Export a documented schema containing stable identifiers, timestamps/time zones, units, custom exercises, programmes, planned and actual targets, set types, notes and deletion state. Validate the export with an independent schema reader/fixture that parses it and compares expected counts/values without importing it into a live or clean app installation. User-directed routine import and portable restore remain the separate post-MVP capabilities `FEAT-POST-007` and `FEAT-POST-009`.

## Jobs and emotional needs

### Before training

- “Tell me what I planned without making me manage a project.”
- “Let me change today because equipment, time and recovery are different.”
- “Get me into a useful first session before I understand every term.”

### During training

- “Remember what I did so I only enter what changed.”
- “Confirm that the set is saved even when the network or Watch is unreliable.”
- “Keep the rest timer visible and useful without taking over the screen.”
- “Let me swap, skip or add something without losing the programme’s intent.”

### After training

- “Show that the workout is complete and durable.”
- “Tell me what improved in plain language, then get out of the way.”
- “Keep history available and portable even if I stop paying or change device.”

### Across inconsistent weeks

- “Resume from reality rather than punishing me for a missed calendar slot.”
- “Preserve sequence when that matters, but let me choose the next suitable session.”

## Segment tensions to design for

| Tension | Beginner need | Experienced need | Product resolution |
|---|---|---|---|
| Programme setup | A safe, understandable starting point | Exact control and import | Starter routine plus editable structure and import preview |
| Set detail | Weight, reps, done | RPE/RIR, tempo, set type, notes | Progressive disclosure at programme/exercise level |
| Progression | Plain next step | Transparent rules and autonomy | Rationale, source history and reversible override |
| Analytics | “Am I progressing?” | Volume/intensity/exercise trends | Layered summaries; no dashboard wall before a useful answer |
| Schedule | Guidance | Flexible sequencing | Today recommendation plus choose-next and ad-hoc modes |
| Motivation | Gentle success feedback | No gamified noise | Optional, brief PR moments; rest-aware adherence |

## Product principles derived from the evidence

1. **Trust before intelligence.** A plain journal that never loses work beats an impressive recommendation engine that sometimes does.
2. **The active workout is an interruption-sensitive tool.** Every modal, animation and network dependency must justify its cost between sets.
3. **Remember, do not assume.** Prefill prior actuals, but keep them visually distinct and editable.
4. **A plan is not a prison.** Track deviations explicitly rather than blocking them or mutating history.
5. **Data ownership is a feature.** Versioned export and deletion are MVP product quality; separately secured routine import and portable restore remain post-MVP under `FEAT-POST-007` and `FEAT-POST-009`, not account-administration shortcuts.
6. **Advanced does not mean crowded.** Preserve expert capability through context and disclosure, not permanent visual density.
7. **Motivation must tolerate real life.** Rest, illness, travel and missed weeks should not be framed as failure.

## Research gaps and next tests

1. Interview 8–12 lifters across beginner, self-programmed, coached and home-gym contexts; explicitly recruit left-handed, large-text and screen-reader users.
2. Observe an actual session or realistic gym simulation. Record tap count, time, corrections, one-hand switches and interruptions for three repeated exercises.
3. Benchmark Strong, Hevy, Fitbod, Alpha Progression, Boostcamp and Liftin’ with the same routine, offline/restart script and export checklist.
4. Run a programme-import concept test using one spreadsheet, one PDF and one free-form note; measure correction effort rather than “AI extraction” delight.
5. Test three progression explanations and measure comprehension, acceptance, override confidence and perceived pressure.
6. Validate severity and frequency with a structured survey only after interviews supply the correct language and answer choices.

Until that work is complete, this document is a risk map and design hypothesis set—not a quantified voice-of-customer study.
