# NextSet accessibility analysis

Status: foundation design analysis; no conformance claim  
Date: 2026-08-06  
Scope: three visual references, required design states and future implementation gates

## Evidence boundary

This analysis combines product/domain requirements, direct inspection of the three generated active-workout references and current official guidance. It does **not** establish that the references or prototype conform to WCAG, Apple or Android requirements.

Current limitations are material:

- the normalized sources contain one active-workout concept per direction, while the generated boards cover ten labelled screen concepts per direction;
- they are flattened PNGs with no semantics, focus order, target bounds or font metadata;
- the source images are generated visual references, not screenshots of the React/Vite implementation;
- separate browser evidence now covers all 30 direction/screen combinations at 393×852 plus three critical active-workout states at 427×952;
- the rendered capture audit found no sub-48×48 control, horizontal overflow or console/page error at those states, and browser tests cover keyboard-aware fields, non-drag reorder actions, locale entry, sheets and direction-specific active controls;
- no automated final-pixel contrast scan, VoiceOver/TalkBack task, switch-access task, native text-scale run, colour-filter run or physical-device target measurement has been completed;
- proposed colour-token ratios in [`colour-typography.md`](colour-typography.md) do not validate colours sampled from the references.

Accessibility remains a release-blocking requirement in [`../quality/accessibility-requirements.md`](../quality/accessibility-requirements.md). That specification is normative; this document focuses on design implications and direction risk.

## Current baseline

- Use WCAG 2.2 Level AA outcomes as the measurable cross-platform floor where applicable: 4.5:1 ordinary text, 3:1 qualifying large text, 3:1 essential non-text UI contrast, 200% text resize without lost content/function, visible focus, non-colour alternatives and alternatives to dragging. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), accessed 2026-08-06.
- Use a NextSet minimum of **48×48 logical pixels/points** for every interactive mobile hit area. Android's current guidance recommends at least 48×48 dp and says larger is better in [Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps), accessed 2026-08-06. This project standard intentionally exceeds WCAG's 24 CSS px minimum and Apple's smaller-platform default where applicable.
- Respond to platform Reduce Motion/remove-animations settings. Apple specifically advises reducing automatic/repetitive zoom, scale, peripheral and depth motion and using fades where appropriate in its [Accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility), accessed 2026-08-06.
- Use native accessibility names, roles, values, states and actions, but test both platforms because React Native notes that VoiceOver and TalkBack behaviour differs in its [Accessibility documentation](https://reactnative.dev/docs/accessibility), accessed 2026-08-06.
- Do not treat scanners as conformance. Android recommends descriptive labels, built-in semantics, alternatives to colour and accessible actions for drag/swipe interactions in [Principles for improving app accessibility](https://developer.android.com/guide/topics/ui/accessibility/principles), accessed 2026-08-06.

## Shared design requirements

### Semantics and focus

- Each screen has one clear title heading and logical section headings.
- A set row is one coherent summary with actions, for example: “Set 2 of 4, working set, planned 100 kilograms and 6 to 10 reps, logged 100 kilograms and 8 reps, completed.” It must not require traversal through decorative column labels for every row.
- Previous, planned, logged, calculated, estimated and recommended values are named in the accessible label/value, not inferred from position.
- Current exercise, current set, timer, notes and workout actions are reachable by heading/group navigation without reading every completed row.
- Opening a sheet moves focus into it, contains focus and returns focus to the invoking control after dismissal.
- After add/delete/reorder, focus moves to the logical affected item. Drag has Move up/down or Move before/after actions.
- Set completion announces once only after local commit. A failed write retains focus/draft and announces “not saved”; it never emits the completed state.

### Text and reflow

- Support platform scaling through 200% and the agreed largest iOS accessibility sizes; do not cap critical text to preserve a screenshot.
- Dense set tables become stacked labelled summaries. Two-column target/history panels become one column in reading order.
- Primary actions stay reachable above the on-screen keyboard, home indicator/navigation area and any active sheet.
- User-entered programme/exercise names and notes wrap. Truncation requires a nearby accessible way to reveal the full value.
- Uppercase and condensed faces are limited to short labels. Body text uses sentence case and adequate line height.
- Timer, load and reps may use tabular/monospaced numerals, but spoken values expand unit and duration naturally.

### Colour, contrast and status

- Test final composited pixels for every normal, pressed, selected, focused, disabled, error, saved, planned, current, completed and PR state in light and dark appearances.
- Do not use opacity to create ordinary secondary text unless the composited result still passes.
- State pairs use at least two cues: for example check + “Completed” + fill, left rule + “Current”, dashed boundary + “Planned”, error icon + “Not saved”.
- Charts combine colour with point shape/line pattern/direct label and provide a navigable list/table alternative.
- A user accent/theme cannot override semantic contrast; fall back to an approved semantic token.

Proposed core-token ratios, calculated from [`colour-typography.md`](colour-typography.md):

| Direction/appearance | Primary text | Secondary text | Primary action pair | Functional line |
|---|---:|---:|---:|---:|
| Tempo Ledger light | 15.57:1 | 5.95:1 | 5.89:1 | 3.69:1 |
| Tempo Ledger dark | 15.58:1 | 9.65:1 | 6.65:1 | 3.92:1 |
| Field Kit dark | 15.87:1 | 10.41:1 | 9.77:1 | 3.79:1 |
| Field Kit light | 15.25:1 | 6.18:1 | 6.99:1 | ≥3:1 target; recheck final states |
| Open Pace light | 11.10:1 | 5.20:1 | 4.81:1 | 3.56:1 |
| Open Pace dark | 13.90:1 | 9.73:1 | 6.33:1 | 3.80:1 |

These are token-pair calculations only. They do not cover antialiasing, image backgrounds, disabled states or the reference PNGs.

### Motor and one-handed access

- All controls, including set rows, overflow, increment/decrement, timer and nav destinations, have non-overlapping 48×48 hit areas.
- Keep at least 8 logical pixels between adjacent frequent and destructive targets, or prove separated expanded hit regions.
- Complete set, current numeric values and timer controls occupy the reachable lower area without pinning over scrollable content.
- Swipe, long press, drag, device motion and multi-finger gestures are never required.
- Stepper buttons use predictable equipment increments but preserve direct numeric entry.
- Destructive actions are outside the completion target's error boundary and provide undo or consequence-appropriate confirmation.

### Motion, haptics and sound

- The reduced-motion alternatives in [`motion-haptics.md`](motion-haptics.md) preserve the full task.
- No looping timer animation, confetti, shake error, bounce or rapid flash.
- Haptic and sound cues are optional, independently configurable and never required to identify completion/rest expiry/error.
- Notification denial and devices without suitable haptics leave the in-app timer complete.
- Screen readers announce timer start/pause/expiry sparingly, never every second.

### Cognition, language and safety

- Define RPE/RIR and advanced set types in context; let users hide optional effort fields.
- Use neutral scheduling language. No shame, loss-framed streak or urgent red state for a missed day.
- Recommendation copy shows observations, rule and proposed change and keeps Accept/Edit/Later/Dismiss control.
- Errors preserve input, name exactly what was not saved and state the safe recovery action.
- Exercise substitution explains metadata match/mismatch and never claims medical suitability or equivalence.

## Direct inspection: Tempo Ledger

Reference: [`../../prototypes/visual-references/tempo-ledger-active-workout.png`](../../prototypes/visual-references/tempo-ledger-active-workout.png), 852×1846.

### Visible strengths

- Very large exercise title and strong black-on-warm-light primary hierarchy.
- Literal headings for Previous session, Working sets and Exercise progress.
- Completed sets use checkmarks; the current row uses a distinct left rule and “Next set” labels.
- Large full-width Log Set action and stable numeric alignment.
- Timer remains in the content hierarchy instead of covering entry.

### Visible risks and required mitigation

| Risk seen in the flattened image | Required design response |
|---|---|
| Small uppercase/monospaced labels and footnote copy | Use the approved Label/Caption roles, test at physical size, allow wrapping and keep essential instructions at Body size |
| Thin grey rules and pale progress segments | Functional boundaries use the verified `line` token and non-colour state labels; decorative rules may remain lighter only when nonessential |
| Dense four-column set table | Reflow to a labelled vertical row at 200% text; expose one coherent row summary and direct edit actions |
| Five compact bottom destinations | Keep 48×48 target geometry, support long translations and test whether Exercises/Plans need a More grouping on minimum width |
| Olive progress and vermilion current state may be read as the only cue | Add text, check, fill/pattern and accessible state |
| No visible error/pending/focus examples | Design all states before approval; do not infer them from the default image |

**Direction risk:** medium. It has the lowest structural adaptation cost if the table reflow and bottom-navigation width are solved. The reference itself remains unverified.

## Direct inspection: Field Kit

Reference: [`../../prototypes/visual-references/field-kit-active-workout.png`](../../prototypes/visual-references/field-kit-active-workout.png), 853×1844.

### Visible strengths

- Extremely large load/reps values, stepper regions and Complete Set action.
- Thick module boundaries, strong warm-white/dark separation and large amber current state.
- Previous set includes values, RIR and a check; set bays label set number and values.
- Timer is a rail and does not appear modal.
- Three large bottom destinations offer generous target potential.

### Visible risks and required mitigation

| Risk seen in the flattened image | Required design response |
|---|---|
| Extensive condensed uppercase | Restrict expanded/condensed capitals to short headings/actions; use normal-width sentence-case body and allow localisation fallback |
| Muted grey labels on black appear visually weak | Use verified `muted-ink`; test antialiasing/OLED conditions and bold-text settings |
| Amber communicates active exercise, selection, progress, timer and action | Preserve separate saved mint, danger coral and textual/icon state; never make amber the only meaning |
| Exercise silhouettes and numbers form a dense horizontal strip | Every item has an accessible exercise label/state; at large text switch to a list/current-plus-next summary |
| Horizontal set bays imply sideways dependency | Provide a vertical list reflow and direct screen-reader set navigation |
| High information density and many hard boundaries | Use headings/groups to reduce focus stops; high-contrast mode simplifies rather than doubles every border |
| Visually forceful completion treatment | Cap haptic strength/frequency, remove any flash/bounce and keep ordinary completion calm |

**Direction risk:** high. Large controls are promising, but typography, state-colour overloading, horizontal structures and sensory intensity require the most remediation and user testing.

## Direct inspection: Open Pace

Reference: [`../../prototypes/visual-references/open-pace-active-workout.png`](../../prototypes/visual-references/open-pace-active-workout.png), 853×1844.

### Visible strengths

- Generous spacing, large exercise title, clear target/last-time labels and a prominent current set.
- Timeline nodes combine number/check with colour.
- Rest timer includes label, remaining time, Pause and +30s without taking over the screen.
- Completed rows use checks and a written “New best” tag.
- Lower Save Set region focuses the main repeated action.

### Visible risks and required mitigation

| Risk seen in the flattened image | Required design response |
|---|---|
| Vertical timeline carries workout/exercise position spatially | Provide explicit “Exercise 2 of 5” and list semantics; preserve meaning when line/timeline is hidden |
| Pale grey secondary values and boundaries | Replace with verified `muted-ink`/`line` tokens and test final composite |
| Bright reference coral with white action text is unverified | Use proposed darker `#C74430` or another verified pair; do not sample the reference into production |
| Target/last-time columns and set rows rely on width | Reflow to one-column reading order at large text; keep previous and target labels adjacent to values |
| Current-set sheet plus bottom navigation can consume most of the viewport | Make the sheet scroll/reflow above keyboard and safe areas; never obscure timer, error or Save |
| Rounded tint boundaries may be hard to perceive | Use ≥3:1 functional boundary/focus and do not rely on shadow |
| Large vertical travel can slow expert scanning | Offer a validated compact density without reducing target or type size |

**Direction risk:** medium. It has strong beginner and large-target potential but needs careful sheet/keyboard reflow and must not rely on the timeline.

## Required-screen accessibility design

| Screen | Required design and semantic behaviour |
|---|---|
| Onboarding | One clear heading/question; radiogroup/selection semantics; skip parity; progress stated as “Step x of y”; back/resume preserves committed choices; no permission/account trap |
| Programme selection/creation | Cards/items expose name, intent, frequency, duration basis, equipment and selected state as one useful group; preview and adopt are distinct; editor errors link to exact field |
| Today | Resume takes precedence when active; expected Start is one action otherwise; primary/secondary actions remain distinguishable at large text; unknown state is textual |
| Active workout | Short path to current exercise/set, timer, notes and actions; set list grouped; no modal timer; local-save state announced once; exercise order remains understandable without icons |
| Set entry | Visible/spoken unit, direct entry and adjustable actions, selected whole field on edit, locale decimal support, no placeholder-only label, error retains values/focus |
| Exercise substitution | Candidate is a coherent item with match factors and mismatches; no “equivalent/safe” claim; today-only default and future-scope consequence are read before confirmation |
| Workout completion | Saved-on-device status first; summary/PR do not steal focus; partial/skipped/not-attempted states textual; exit is always available; reduced celebration supported |
| History | Logical chronological list/calendar alternative; filters stay visible when empty; edited/partial/short states textual; search labels unique |
| Exercise progress | Question/title, range, unit, inclusion rules, bounded summary, chart description and navigable source table/list; no zero chart for insufficient data |
| Programme editor | Ordered headings/lists; drag alternative; collapsed advanced sections name their contents/state; version consequence before publish; errors preserve draft and focus |

## Screen-reader set-row contract

Recommended grouped announcement order:

```text
Set 4 of 5, working set, current.
Planned: 100 kilograms, 6 to 10 reps, RIR 2.
Previous comparable set: 100 kilograms, 8 reps, RIR 2.
Draft: 100 kilograms, 8 reps.
Actions: Complete set, Edit weight, Edit reps, More set options.
```

Do not include every visual column heading as a separate stop. Completed rows can collapse to one summary plus Edit/More actions. RIR is omitted when not enabled; it is never read as a single unexplained acronym on first use.

## Chart contract

Every chart must provide:

- the user question as its title;
- exercise/variation/comparison scope;
- unit and date range;
- inclusion/exclusion explanation;
- direct labels for key values;
- a nonvisual bounded summary that does not infer cause;
- a navigable list/table of the plotted observations;
- point activation that opens the source workout without relying on a tiny target;
- line/point/pattern distinctions that survive colour filters and monochrome.

Canvas-only charts without an equivalent semantic representation are not acceptable.

## Production accessibility validation matrix

| Configuration | Minimum tasks | Required evidence |
|---|---|---|
| iOS current + VoiceOver | onboarding, Today start/resume, set log/edit, timer, substitute, finish, history, export/delete | Screen recording plus focus/announcement notes and build/commit |
| iOS oldest supported physical device | repeated workout and interruption restore | Device/OS, raw result and defects |
| Android current + TalkBack | same full critical journey | Screen recording plus semantic/focus notes |
| Android oldest supported physical device | repeated workout and restore | Device/OS and result |
| 200% and largest approved text | all ten screens in both directions being considered | Screenshots/layout assertions; no hidden action/content |
| Small iPhone-like 393×852 screen and Pixel-like 427×952 screen | keyboard, safe areas, scroll, sheets, nav and current-set action | Matched screenshots and target overlays |
| Switch/external keyboard | navigation, set adjust/direct entry, reorder, sheet, destructive recovery | Action/focus trace |
| Reduce Motion/remove animations + haptics off | log, timer, completion, PR, reorder | State trace proving equivalent feedback |
| Light/dark, increased contrast and colour filters | all semantic states and charts | Final-pixel contrast report and visual review |
| Left/right hand and reduced dexterity | 30-set repeat, edit, substitute and timer | Reach errors, accidental taps, task time and participant notes |
| Offline/failed writes | start, log, finish and recover | Video plus transaction/fault log proving truthful announcements |

Automated checks may cover names/roles/state, target geometry, contrast tokens, text-layout matrices and reduce-motion branches. They do not replace manual physical-device and disabled-user testing.

## Foundation conclusion

Tempo Ledger currently has the best accessibility potential because its literal labels and ledger hierarchy can reflow without changing the conceptual model. Open Pace is close and offers strong clarity, but its timeline and set sheet must remain optional presentations of a linear semantic order. Field Kit's large targets are valuable, yet its compressed all-caps console and colour/state density create the greatest remediation risk.

This is a recommendation for owner review, not selection and not a compliance statement. No direction is accessibility-approved until a native production candidate passes the matrix above with no unresolved critical blocker.
