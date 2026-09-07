# Fitness interaction research for NextSet

**Research date:** 6 August 2026 (Australia/Sydney)  
**Scope:** Interaction and accessibility constraints for a phone-first strength-training log used in a gym. This is a research synthesis and a set of testable requirements, not a hands-on usability study.

## Evidence notation

- **[E] External evidence:** platform guidance or published research.
- **[P] Product evidence:** documented competitor behaviour.
- **[H] Hypothesis:** a NextSet design decision that requires validation.

Published target sizes and lab findings guide the design; they do not substitute for testing with the actual interface, devices and users.

## The gym is a hostile input environment

During an active workout the user may be breathing hard, moving, carrying equipment, holding a phone in one hand, using a thumb at an awkward reach, wearing headphones, sweating, working in low or high contrast light, racing a rest timer, sharing equipment or losing connectivity. Attention is episodic: the app is opened for a few seconds, interrupted and resumed.

**[E]** A Microsoft study of one-handed thumb use found target sizes around 9.2 mm for discrete tasks and 9.6 mm for serial tasks reduced errors in its tested conditions ([study](https://www.microsoft.com/en-us/research/publication/target-size-study-for-one-handed-thumb-use-on-small-touchscreen-devices/)). A separate holding-and-tapping study found the one-hand thumb grip had the worst performance among the tested grips ([paper](https://epub.ub.uni-muenchen.de/66437/)). These are controlled studies on particular devices/tasks, not universal dimensions.

**[E]** Android recommends touch targets of at least 48 dp in its [accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views). WCAG 2.2’s web criterion 2.5.8 defines a 24-by-24 CSS-pixel minimum with exceptions, while 2.5.5 provides an enhanced 44-by-44 target; the [WCAG 2.2 specification](https://www.w3.org/TR/WCAG22/) is a web standard, not a direct native-mobile sizing rule.

**[H]** For NextSet’s primary mobile actions, use at least the platform-recommended native target and prefer approximately 44 pt/48 dp or larger. Spacing must prevent adjacent complete/edit/delete actions from sharing an error boundary. Validate reach and error rate with both hands and small/large devices.

## Core interaction contract

### State model

| State | Durable data | Primary action | Failure-safe behaviour |
|---|---|---|---|
| **Today / no active workout** | Programmes, history and next-session selection | Start the suggested or chosen workout | Starting creates a local workout record immediately |
| **Active exercise** | Exercise order, targets, actuals and notes | Complete or edit the current set | Navigation, lock, crash and force-quit preserve all committed sets and the current draft |
| **Set draft** | In-progress values may be provisional | Commit set | Commit is a single atomic local transaction; validation never destroys entered values |
| **Set committed** | Actual values, time and provenance | Undo/edit or continue | Edit appends/reconciles history; duplicate tap is idempotent |
| **Resting** | Timer start, duration and relation to set | Continue, adjust or dismiss | Timer continues without holding a modal open and can recover from backgrounding |
| **Workout completion** | Final set list and completion time | Finish | Completion is local first; later sync cannot revert it silently |
| **Pending sync** | Complete local workout plus sync metadata | None required | Visible non-alarming status; deterministic retry; export still includes the workout |

**[H]** “Saved” means durable on this device. “Synced” is a separate state. The product must never show a success celebration before the local commit succeeds.

### Active-set row

The row must distinguish three values that competitors often blur:

1. **Previous actual:** what happened in the comparable prior session.
2. **Planned target:** what the programme or progression rule proposes today.
3. **Current actual:** what will be committed now.

**[H]** Prefill current actual from the plan or previous result according to an explicit rule, but never make a prefilled value look already completed. Completing an unchanged set should require one deliberate action. Editing a weight or rep value should keep completion within the same context. These are acceptance hypotheses to measure, not evidence that one tap is always optimal.

### Numeric entry

- Keep the correct unit visible (`kg`, `lb`, reps, seconds) and prevent unit conversion from silently changing recorded intent.
- Select the whole numeric field on deliberate edit; preserve decimal separators and locale.
- Offer increment/decrement controls only where the step is predictable. The step may differ by exercise/equipment.
- Accept zero/bodyweight/assisted values where the exercise model permits them; do not use a generic “must be positive” rule.
- Allow undo after commit. Avoid destructive swipe as the only deletion path.
- For screen readers, expose a concise value, unit, set position, state and action—not every visual column as unrelated fragments.

## One-handed reach and navigation

**[H]** Put the highest-frequency active-workout actions in the reachable lower region: complete set, edit current values, next exercise and timer access. Place destructive or infrequent actions away from the primary completion target. A bottom control must still clear the home indicator, gesture navigation area and on-screen keyboard.

Do not rely on a universal “thumb zone” diagram. Device size, grip, handedness, reach ability and mounted/bench placement all change reach. Test at least:

- left and right hand;
- small and large phones;
- phone held, lying flat and propped against equipment;
- dynamic text at the largest supported sizes;
- one-handed use with reduced dexterity;
- screen reader plus touch exploration.

Navigation rules:

- The active workout is one resumable task, not a stack of fragile modal screens.
- Back navigation never discards a set draft without a clear choice.
- Exercise details, history and substitution open without ending the active timer or session.
- Swipes can accelerate expert use but must have visible/button alternatives.
- Returning from the lock screen, camera, music or a call lands on the active workout state.

## Rest timer research

**[E]** Resistance-training rest intervals depend on goal, exercise, load and person; the evidence does not support one universal duration. A 2024 systematic review discusses hypertrophy outcomes across rest-interval conditions ([review](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1429789/pdf)). The product implication is configurability, not a medical or coaching recommendation.

Timer requirements:

- Start automatically only when the user/programme has opted in; manual start remains available.
- Default duration can be global, per programme or per exercise, with a visible one-session override.
- Show remaining time without covering logging, substitution, history or navigation.
- Continue through screen lock/backgrounding and reconstruct remaining time from a timestamp rather than a fragile in-memory counter.
- Provide visual and optional haptic/audio completion cues. Each cue can be disabled independently.
- Under screen reader, announce meaningful milestones sparingly and do not speak every second.
- Let the user add/subtract time with large controls and dismiss without changing the completed set.
- If system notification permission is denied, the in-app timer remains complete and honest about background limitations.

**[P]** Hevy, Strong, Liftin’, JEFIT, GymBook, RepCount and StrengthLog all document rest timers in public product material. A timer is table stakes; reliability and non-interference are the differentiators.

## Interruption, offline and recovery design

**[P]** Fitbod explicitly documents local offline logging with degraded history and recommendation behaviour in its [offline guide](https://help.fitbod.me/hc/en-us/articles/360006572594-Can-I-use-Fitbod-without-an-internet-connection). Caliber’s product team documented local workout storage and later sync in an [offline release](https://www.reddit.com/r/caliberstrong/comments/wqwi3s). Recent user reports from Strong and Hevy show why ambiguous cross-device state is a high-impact failure mode ([Strong sync discussion](https://www.reddit.com/r/strongapp/comments/1p1tcww/live_sync_issues/), [Hevy outage discussion](https://www.reddit.com/r/Hevy/comments/1qhaohr/anyone_elses_hevy_app_not_working/)).

**[H]** The local database is the active-workout authority. Network sync, if later introduced, operates on committed events/records and never blocks entry.

Recovery acceptance cases:

1. Enable airplane mode before starting; complete a workout; force-quit; restart; all sets and timer state recover.
2. Lose connectivity mid-set; commit several sets; finish; status reads saved locally and later transitions to synced without user reconstruction.
3. Tap complete twice rapidly; exactly one set completion is recorded.
4. Edit a set on two devices before sync; the conflict is surfaced or reconciled by a documented rule, never silently by “last write wins” on the whole workout.
5. Change time zone/system clock; durations and ordering remain coherent.
6. Receive a call, lock the screen, switch music apps and return; draft, scroll position and timer survive.
7. Simulate low storage/database failure; the app does not claim success and offers a recoverable path.
8. Upgrade/migrate the schema with an active and a completed workout; counts, units and custom exercises remain intact.

## Accessibility requirements

**[E]** React Native exposes accessibility roles, labels, state, actions and platform-specific VoiceOver/TalkBack behaviour in its [accessibility documentation](https://reactnative.dev/docs/accessibility). Apple’s [accessibility design guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility) and Android’s [testing guidance](https://developer.android.com/guide/topics/ui/accessibility/testing) both require more than automated checking.

### Semantics

- Give every control an accurate role, name, value, state and hint where the action is not self-evident.
- Announce set state (“Set 2 of 4, 80 kilograms, 8 reps, not completed”) as a coherent unit; avoid an exhausting traversal through decorative labels.
- Expose increment/decrement as adjustable actions where supported, while preserving direct-entry alternatives.
- When a set commits, announce the result once; move focus only if the user’s next target remains predictable.
- Mark headings and groups so users can jump among exercise, sets, timer and notes.
- Accessible names must not depend on the visible icon, colour or haptic pattern.

### Visual and motor access

- Support platform text scaling without clipping, overlapping or hiding the primary action. Dense set tables must reflow to cards/stacked rows rather than shrinking type.
- Meet platform contrast guidance in every state, including disabled, planned, completed, PR and error states.
- Never use colour alone for completed/planned/error or plate-loading differences.
- Keep targets large and separated; provide alternatives to swipe, long-press and drag.
- Honour reduced-motion settings. PR and completion feedback can use a static state change instead of confetti or scale motion.
- Haptics are supplementary and configurable; silent/haptics-off use must remain complete.

### Cognitive and language access

- Prefer “previous”, “planned” and “logged” over ambiguous abbreviations. Define RPE/RIR the first time and let users hide them.
- Keep errors adjacent to the affected value and state how to fix them without deleting input.
- Do not use a missed streak, red warning or loss framing for planned rest or schedule changes.
- Use locale-aware units, dates and decimal entry; show conversion decisions explicitly.

### Verification

Automated scanners catch only a subset of problems. Android states that testing should combine manual, analysis-tool and user testing in its [accessibility testing guide](https://developer.android.com/guide/topics/ui/accessibility/testing); Google likewise says Accessibility Scanner is not a replacement for manual testing in its [FAQ](https://support.google.com/accessibility/android/faq/6376582).

Minimum release checks:

- VoiceOver on current and previous supported iOS versions;
- TalkBack on at least a small and a large Android device class;
- largest text settings and display zoom;
- Switch Control/Switch Access or external keyboard traversal;
- reduced motion, increased contrast and colour filters;
- landscape only if supported, otherwise an explicit orientation decision;
- a usability session with disabled users before claiming accessibility support.

## Progression without false authority

**[E]** Current resistance-training guidance describes many interacting training variables and heterogeneous responses; the ACSM position stand is a useful domain overview, not a licence for an app to prescribe an individual’s care ([open-access position stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/)). Research on automated repetition logging suggests it may reduce manual burden, but published systems remain context- and model-dependent ([example study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10222347/)).

For MVP:

- calculate deterministic, inspectable suggestions from recorded outcomes and explicit programme rules;
- show the observations used and the change proposed;
- let the user accept, edit or ignore without penalty;
- avoid claims about injury prevention, rehabilitation, readiness or guaranteed outcomes;
- defer automatic camera/sensor rep counting until it demonstrates device coverage, privacy, accessibility and error recovery superior to manual entry.

## Field-test protocol

| Scenario | Task | Measures | Pass signal |
|---|---|---|---|
| Repeat workout | Log three exercises and nine unchanged sets | Time, taps, errors, help requests | Most sets commit with one deliberate action and no ambiguous prefill |
| Changed performance | Adjust weight/reps on four sets | Correction rate, unit errors, completion delay | Edits remain in context; no accidental completion/deletion |
| Crowded gym | Substitute an unavailable exercise | Time, comprehension, history treatment | User understands why substitute fits and what happens to history |
| One hand | Repeat core flow left- and right-handed | Reach failures, grip switches, accidental taps | Primary actions reachable without precision pinch or mandatory gesture |
| Interruption | Lock, take a call, background and force-quit | Lost draft/set/timer, resume time | Durable recovery and obvious next action |
| Offline | Complete and finish in airplane mode | Blocks, misleading status, data loss | Full logging works; saved/sync status is honest |
| Large text | Run active flow at maximum supported scaling | Clipping, hidden actions, traversal | Reflow preserves meaning and primary action |
| Screen reader | Start, log, edit, time and finish | Focus order, announcements, actions | Task completes without sighted assistance |

Recruit people who actually log strength training, including beginners, experienced programme followers, left-handed users, users with reduced dexterity/vision and people who use VoiceOver or TalkBack. A quiet desk simulation is necessary for debugging but insufficient for acceptance.

## Open questions

- Does a single active-set focus reduce errors versus a compact multi-set table for experienced users?
- Which value should prefill when planned and previous actual differ, and can users reliably tell which is which?
- When should the timer start: set commit, explicit action or a per-exercise preference?
- How should flexible sequencing affect progression and “next workout” without imposing a calendar?
- What is the least disruptive recovery UI for a genuine sync conflict?
- Which watch interactions remain valuable after the phone flow is already fast, and who owns an active workout across devices?

These require prototypes and observed task performance. They should remain open rather than being answered by competitor convention alone.
