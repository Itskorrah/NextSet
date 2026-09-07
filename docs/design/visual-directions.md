# NextSet visual directions

Status: three foundation proposals; none selected  
Date: 2026-08-06  
Decision owner: product owner

## Current review target — 2026-09-07

The owner requested a logging-first redesign using **Tempo Ledger as the proposed base**. The default prototype now targets Workouts, an empty workout/exercise picker, fast set entry, optional routines, history and descriptive progress. It removes goal/programme/schedule gates. The existing Tempo active-workout reference supplies colour, typographic hierarchy, ledger rows and restrained actions; changed navigation/content follows the newer owner instruction, so pixel identity to the old programme-centric screen is not claimed. The other directions and old flow remain available only at `?review=legacy` for historical comparison. The scored comparison below is the earlier design hypothesis, not usability evidence or a final selection.

The supplied [mobile-ios-design skill](https://github.com/wshobson/agents/blob/main/plugins/ui-design/skills/mobile-ios-design/SKILL.md) informs semantic hierarchy, clear labelled tabs, safe-area clearance and accessible controls. Its SwiftUI code does not change the proposed React Native/Expo stack. Root 48×48 target requirements take precedence over the skill's 44-point sample. Physical VoiceOver/Dynamic Type/dark-mode verification remains a future native gate.


## Evidence and interpretation

The three source images were inspected directly at their original repository resolution on 2026-08-06:

- [`../../prototypes/visual-references/tempo-ledger-active-workout.png`](../../prototypes/visual-references/tempo-ledger-active-workout.png) — 852×1846 PNG
- [`../../prototypes/visual-references/field-kit-active-workout.png`](../../prototypes/visual-references/field-kit-active-workout.png) — 853×1844 PNG
- [`../../prototypes/visual-references/open-pace-active-workout.png`](../../prototypes/visual-references/open-pace-active-workout.png) — 853×1844 PNG

Each direction also has a generated, directly inspected ten-screen review board covering onboarding, programme selection/creation, Today, active workout, set entry, substitution, completion, history, exercise progress and programme editor:

- [`tempo-ledger-ten-screen-board.png`](../../prototypes/visual-references/tempo-ledger-ten-screen-board.png)
- [`field-kit-ten-screen-board.png`](../../prototypes/visual-references/field-kit-ten-screen-board.png)
- [`open-pace-ten-screen-board.png`](../../prototypes/visual-references/open-pace-ten-screen-board.png)

For comparison, the three references were reviewed at original resolution and against the same 393×852 logical-pixel active-workout frame used by the prototype. This normalises the intended viewport without cropping or implying pixel-perfect implementation parity.

All six source images are generated visual references, not screenshots of the React/Vite prototype. Separately, the current-source evidence contains exactly 30 rendered 393×852 iPhone captures, three 427×952 Pixel active-workout captures, three ten-screen contact sheets and three source-versus-rendered comparison plates. The clean build, 32 browser tests, four Sites tests and geometry/runtime capture pass; the manifest timestamp is `2026-08-10T03:34:06.468Z`. See [`prototype-guide.md`](prototype-guide.md) and [`../../prototypes/nextset-directions/design-qa.md`](../../prototypes/nextset-directions/design-qa.md). This evidence supports direction discussion and verifies the disposable prototype revision, but does not prove native accessibility, persistence or production behaviour.

Every proposal retains the same product invariants: local commit before success feedback, distinguish previous/planned/logged data, non-blocking rest timing, 48×48 critical targets, large-text reflow, non-colour state cues, optional recommendations and no punitive motivation. The meaningful decision is how each proposal prioritises and expresses those invariants.

## 1. Tempo Ledger

**Product personality:** editorial, exact, calm and quietly athletic.  
**Mood and rationale:** a premium training notebook crossed with a timing ledger. Warm paper surfaces, ruled structure and disciplined typography make dense information feel owned rather than “dashboarded”. The visual reference’s off-white field, hairlines, olive progress and vermilion action establish identity without glow or excessive cards.  
**Intended audience appeal:** broadest crossover: intermediate and experienced users get numeric density; beginners get literal labels and stable rows; general users can use it for long sessions without the aggressive tone associated with some strength products.  
**Information-density strategy:** medium-high density through alignment, rules and type hierarchy. Context remains visible, but only the current row receives strong emphasis.

### System character

| Attribute | Tempo Ledger treatment |
|---|---|
| Colour-role system | Parchment canvas and white-paper raised surface; near-black ink; olive success/progress; dark vermilion action; blue focus; semantic warning/error colours remain separate. Dark mode becomes charcoal paper with warm white ink, not pure black. Exact proposed tokens are in [`colour-typography.md`](colour-typography.md). |
| Typography | IBM Plex Sans for interface prose and IBM Plex Mono for timers, loads, reps and table-aligned metadata. Sentence case for content; restrained uppercase only for compact section labels. Tabular numerals are mandatory in changing values. |
| Shape language | Square and lightly clipped rectangles, 0–8 px radii, hairline rules, occasional “stamp” outline for records. Grouping relies on alignment and rules before cards. |
| Spacing | 4 px base; common rhythm 8/12/16/24/32. Dense rows remain at least 56 px tall and reflow at large text. Wide margins create a page edge rather than floating card gutters. |
| Navigation style | Five labelled ledger tabs: Workout/Today, History, Exercises, Plans and More. While active, Workout becomes Continue and preserves session state. This has the clearest explicit path to advanced areas but consumes the most bottom width. |
| Icon direction | Thin, squared line icons with consistent 1.75–2 px stroke; diagrams only when they communicate an exercise or state. Icons never replace labels on critical actions. |
| Active-workout treatment | Exercise title and target lead, followed by a full-width non-modal timer rail, previous-session comparison, ruled set ledger, segmented exercise progress and a persistent lower completion action. The directly inspected reference shows exactly this “work sheet” hierarchy. |
| Progress treatment | Segmented programme/exercise rails and question-led compact charts. Completed segments use colour plus fill/pattern/check. Comparisons are written as deltas beside the data. |
| Motion character | Crisp “mark made” transitions: 100–180 ms fades, underline/row fill and short 4 px shifts. No bounce. Completed rows settle immediately after durable commit. |
| Haptic character | One light, crisp confirmation for a committed set; a distinct medium confirmation for final workout completion; two restrained taps for a verified record. Never on ordinary navigation. |
| Chart style | Ruled baseline, direct labels, high-contrast line or bars, sparse grid, no smoothing that implies unobserved values. Use patterns/point shapes and provide the source table. |
| Set-row design | Previous, plan and actual remain separate columns/stacked labels. Completed rows show text/check plus muted fill; current row uses a left vermilion rule and “Next set”; planned future rows say “Planned”. |
| Button design | Full-width rectangular primary with dark vermilion fill and high-contrast text. Secondary actions are bordered or textual. Pressed state shifts 1–2 px and darkens; it never waits for animation to save. |
| Timer behaviour | Full-width horizontal status rail with remaining time, Pause and ±30s. It stays above the set ledger but never covers it. Expiry changes label/icon and may cue the user; it does not advance automatically. |
| Empty-state approach | A short ledger heading, one sentence explaining what will appear, and one action such as “Start your first workout”. No illustration is required; a simple ruled placeholder may show structure without fake values. |
| Personal-record treatment | A restrained outlined “New rep best” stamp attached to the qualifying set or completion summary. Celebration is delayed until local completion and can be reduced or disabled. |

### Ten screen treatments

| Required screen | Tempo Ledger expression |
|---|---|
| 1. Onboarding | Three-step numbered folio with one question per page; selected answers receive a check and side rule. Optional fields say “Skip for now”; units are chosen before any sample values. |
| 2. Programme selection/creation | Comparable programme “spec sheets” with frequency, duration provenance, equipment and schedule mode in aligned rows; Preview precedes Use. Custom creation opens a structured outline, not a blank dashboard. |
| 3. Today | Date folio, one dominant next-workout title, last-session line, compact exercise list and vermilion Start. Unfinished workout replaces Start with Continue. Analytics stay out. |
| 4. Active workout | The inspected reference’s ruled hierarchy becomes the foundation: exercise/title, timer rail, previous comparable result, set ledger, segmented exercise progress, then lower Log set action. |
| 5. Set entry | Current ledger row expands in place or into a bottom editing sheet; direct numeric entry and ± equipment increment are both available. The unit, previous and plan remain visible. |
| 6. Exercise substitution | Ranked comparison table with candidate, matching factors, disclosed mismatch and actual history source. Scope is a visible “Today only / Future programme” choice; today only is default. |
| 7. Workout completion | A saved-on-device seal, concise planned-versus-done ledger, verified records and one explainable next-target proposal. Return to Today is dominant; private note is secondary. |
| 8. History | Chronological ledger with month dividers and List/Calendar switch. Partial, short and edited sessions have textual status labels; no colour-only dots. |
| 9. Exercise progress | The question and plain-language answer appear before a compact chart; direct labels and a raw-session table are adjacent. Estimated values carry “Estimated” in every view. |
| 10. Programme editor | Outline editor with stable numbering, inline targets and explicit Publish new version action. Drag handles have Move up/down alternatives; advanced rules expand per exercise. |

### Accessibility analysis

Strengths visible in the reference are large exercise/title text, strong numeric alignment, literal labels and redundant current/completed cues. Main risks are compact uppercase labels, thin hairlines, a five-item navigation width and a table that cannot survive large text unchanged. The production interpretation must use the verified tokens in [`colour-typography.md`](colour-typography.md), combine state colour with text/icon, and reflow each set into a labelled vertical summary at 200% text. The image itself is not contrast or target-size evidence.

### Risks and trade-offs

- Editorial density can feel clinical if copy and haptics become too austere.
- Five bottom destinations are explicit but crowded on small screens and in long translations.
- Mono use must stay limited to data; applying it to paragraphs damages reading comfort.
- Ruled tables demand disciplined responsive reflow and screen-reader grouping.
- The calm character is less immediately “sports equipment” than Field Kit, which may reduce app-store visual impact.

## 2. Field Kit

**Product personality:** decisive, utilitarian, rugged and energetic.  
**Mood and rationale:** a piece of dependable gym equipment rather than a lifestyle dashboard. The inspected reference uses a dark instrument-panel surface, amber operational state, hard frames, an exercise-position strip, oversized numeric controls and a large Complete Set action.  
**Intended audience appeal:** experienced lifters, users who value big one-handed controls, busy or low-light gym contexts, and people attracted to a visibly athletic product. It is the narrowest emotional fit for beginners and users who prefer a calm health companion.  
**Information-density strategy:** highest density. Important values are extremely large while context is compressed into modules and abbreviated labels.

### System character

| Attribute | Field Kit treatment |
|---|---|
| Colour-role system | Dark graphite canvas, slightly raised equipment panels, warm white ink and safety amber action/progress. Mint confirms saved state and coral denotes errors; amber is never reused for warning. A light high-contrast maintenance theme is separately designed. |
| Typography | Archivo Expanded/Black for short display headings, Archivo regular for labels and Atkinson Hyperlegible Mono for numeric input and timer values. Uppercase is limited to headings/actions; explanatory copy stays sentence case in a wider, readable face. |
| Shape language | Hard rectangles, 0–3 px radii, 2 px rails, clipped/chamfered primary-button corners and mechanically separated modules. No glass, glow or generic soft cards. |
| Spacing | 4 px base with compact 4/8/12/16 rhythm; outer gutters 14–16 px. Density is earned by larger screens and short labels, never by targets below 48 px or body text below the proposed role minimum. |
| Navigation style | Three large equipment-bay destinations: Workout, History and Settings. Programmes and Today live within Workout as a task switcher. This provides the largest tab targets but hides planning depth one level deeper. |
| Icon direction | Bold squared glyphs and simple equipment silhouettes, filled only for active state. Exercise imagery is optional and must have a text alternative; it cannot be the only way to identify an exercise. |
| Active-workout treatment | Top exercise strip shows physical position; current exercise dominates; timer becomes a linear amber rail; prior set is a compact console; load/reps use two oversized stepper bays; set sequence stays horizontally visible. This is the reference’s defining interaction idea. |
| Progress treatment | Integer completion plus thick linear rail and numbered exercise bays. Progress uses position, text and fill, not amber alone. History charts resemble calibrated plots with square points and explicit axes. |
| Motion character | Mechanical snaps: 80–140 ms, minimal travel, no spring overshoot. Buttons depress 2 px; bays latch from outline to fill. Reordering uses a direct displaced row, not floating physics. |
| Haptic character | A short medium “latch” after committed set, light tick at equipment-defined increments, and a firm completion pulse. Increment haptics stop during rapid repeat input and all effects have platform fallbacks. |
| Chart style | High-contrast technical grid used sparingly, step or straight-line connections, square points and direct value callouts. Do not add gauges merely to match the equipment metaphor. |
| Set-row design | A horizontal bay per set with explicit completed/current/planned state; tapping a bay loads its large editing controls. At large text it becomes a vertical list with the same labels and no horizontal dependency. |
| Button design | Oversized amber primary with clipped corners, dark text and left confirmation glyph. Secondary modules use 2 px outlines. Destructive actions use separated coral outline plus confirmation/undo. |
| Timer behaviour | Amber progress rail beneath the exercise title with remaining and planned duration at opposing ends. Pause/extend remain one tap away; the timer never becomes a blocking alert. |
| Empty-state approach | A labelled “No session loaded” equipment panel with one large Load programme or Start empty action and a short local-readiness status. Avoid warning stripes and alarm language. |
| Personal-record treatment | A compact “PB” hardware tag and a single amber-to-mint latch after durable calculation. No strobe, sparks or volume-ranked reward. |

### Ten screen treatments

| Required screen | Field Kit expression |
|---|---|
| 1. Onboarding | Fast “setup check” panels for units, experience and schedule; a large Next control occupies the lower thumb region. Plain-language supporting text prevents the console metaphor becoming jargon. |
| 2. Programme selection/creation | Programme loadout list with duration, frequency, equipment and schedule badges. Selection shows an explicit contents review. Custom programme opens an ordered “build sheet” with large Add exercise. |
| 3. Today | “Ready” panel with next workout, equipment/focus, last session and a full-width Start Workout control. Continue Active Workout takes precedence. Secondary scheduling options sit in a labelled actions drawer. |
| 4. Active workout | The inspected reference’s exercise strip, huge load/reps controls, set bays, rest rail and oversized completion action define the screen. Less-used history and target detail sit below, not above, the action. |
| 5. Set entry | Full-screen control console with large direct-edit values, predictable increment controls and optional RIR strip. Direct keyboard entry remains available; step buttons never become the only path. |
| 6. Exercise substitution | Filterable “available alternatives” list showing match bars only when accompanied by plain-language factors and mismatches. Choose for today is the large primary; future programme change is a separate confirm step. |
| 7. Workout completion | “Saved locally / Workout complete” status panel, concise output list and restrained PB tag. A next-workout loadout is visible, but no recommendation is applied automatically. |
| 8. History | Dense session log with strong dates, workout status and filters. The default is a list; calendar is secondary to protect legibility in the dark theme. |
| 9. Exercise progress | One calibrated plot per question, large current best and clear source-session list. Estimates use an “EST” prefix plus expanded accessible label. |
| 10. Programme editor | Modular loadout editor: workouts as large tabs, exercise blocks with order/targets, and advanced settings in a tools drawer. Publishing creates a visible version and effective date. |

### Accessibility analysis

The reference visibly offers very large primary values and completion control, strong overall light/dark separation and redundant checkmarks. Its risks are substantial: extensive condensed uppercase, muted grey on black, amber used for several meanings, a dense exercise-icon rail, horizontally arranged set bays, and visually forceful haptics/motion that could fatigue. Body copy must use readable sentence case; amber cannot carry status alone; the exercise strip must be a labelled list; and high-contrast mode must simplify borders rather than adding more visual noise. The visual reference is not proof that any contrast pair or target passes.

### Risks and trade-offs

- The aggressive equipment metaphor may alienate beginners, general-fitness users or users seeking a calm/private journal.
- Dense dark panels are vulnerable to low-contrast secondary text and OLED smear in motion.
- Condensed uppercase can reduce word-shape recognition and localisation capacity.
- Strong completion haptics become irritating across dozens of sets unless frequency and intensity are carefully constrained.
- Three destinations improve reach but make programmes, Today and exercise browsing less immediately discoverable.
- The product could drift toward gaming or “hardcore” gender coding if amber, all caps and silhouettes are overused.

## 3. Open Pace

**Product personality:** human, spacious, supportive and optimistic without being sentimental.  
**Mood and rationale:** a guided path that makes sequence and progress legible while leaving visual breathing room. The directly inspected reference uses warm cream, deep teal, a vertical exercise timeline, rounded rest capsule, soft green completion state and a coral Save Set action.  
**Intended audience appeal:** beginners, general-fitness users, people returning after inconsistent schedules and users who want guidance without a coaching persona. Experienced lifters may find the default density too low.  
**Information-density strategy:** low-to-medium density with progressive disclosure. One current set is prominent; completed and upcoming work recede along a spatial path.

### System character

| Attribute | Open Pace treatment |
|---|---|
| Colour-role system | Warm cream canvas, off-white raised surface, deep teal ink/navigation, green saved/progress and dark coral action. Soft tints group context; dark mode uses deep teal surfaces rather than pure black. Exact proposed tokens deliberately darken the reference coral for AA text contrast. |
| Typography | Recursive Sans variable for the full interface, using its casual axis only slightly in friendly headings and its mono axis for timers/numerics. This creates personality with one licensed variable family while keeping body forms stable. |
| Shape language | 12–18 px radii, pill timer, circular timeline nodes and softly raised current-set sheet. Rounded treatment is reserved for active/interactive groupings rather than placing every datum in a card. |
| Spacing | 4 px base with 8/12/16/24/32/40 rhythm; 20–24 px outer gutters. More breathing room around the current task, with history and programme tools becoming denser when needed. |
| Navigation style | Three calm destinations: Today, Workout and Progress. Programmes live under Today and settings under an overflow/profile entry. The low choice count is beginner-friendly but needs explicit shortcuts for frequent editors. |
| Icon direction | Open rounded line icons, 2 px stroke, paired with text. Timeline nodes use number/check plus colour. Exercise illustrations are not central. |
| Active-workout treatment | A vertical exercise timeline anchors position; the rest timer is a compact capsule; target and last time sit side by side; sets read as a generous list; the current set opens in a lower sheet with large values and coral Save Set. |
| Progress treatment | Journey rail for in-session position; question/answer cards and simple direct-labelled trend lines for history. Progress language describes observed change and never judges missed time. |
| Motion character | Gentle continuity: 160–260 ms fades and 6–8 px transitions, a progress-node fill and sheet settle with no bounce. Reduced motion uses instant state plus a short opacity change. |
| Haptic character | Soft light confirmation after committed set, subtle selection tick for timeline/set changes and a gentle two-pulse completion. Timer expiry may use the platform notification effect; none is authoritative. |
| Chart style | Spacious line with direct labels and highlighted comparable points; minimal axes, no area gradient. A plain-language answer appears before the plot and a session list follows. |
| Set-row design | Generous label/value row with completion icon and optional “New best” text tag. Current row expands into the set sheet; future rows show target and dash/“Not logged”, never a blank that resembles zero. |
| Button design | Rounded 16–18 px coral primary with strong text contrast and optional directional glyph. Secondary buttons use teal text/border. Shadows are shallow and limited to active sheets. |
| Timer behaviour | Teal/soft-green pill with remaining time, circular/linear progress, Pause and +30s. It remains in flow and can collapse to a compact sticky status while scrolling. |
| Empty-state approach | Plain reassuring explanation, one suggested first action and optional “Learn what this means”. A single path/timeline mark may reinforce structure, but no mascot or guilt copy. |
| Personal-record treatment | “New best” capsule beside the source set and a calm completion explanation such as “One more rep than last time”. Celebration never interrupts input or implies health outcomes. |

### Ten screen treatments

| Required screen | Open Pace expression |
|---|---|
| 1. Onboarding | One supportive question at a time with progress steps and definitions on demand. Goal language says “starting point”, optional answers are deferrable and no feature is locked. |
| 2. Programme selection/creation | Guided programme comparison with “Why this may fit” grounded only in selected preferences, then a clear schedule choice. Custom creation starts from a small structure and reveals advanced fields as needed. |
| 3. Today | Calm next-session narrative, focus/duration/last-session context and one coral Start/Continue action. Flexible sequence is explained in one sentence; schedule adjustments are nearby but secondary. |
| 4. Active workout | The inspected reference’s vertical path, pill timer, target/last-time pair, set list and lower current-set sheet define the design. The sheet must not cover notes or timer controls at large text. |
| 5. Set entry | Lower sheet focuses on one set with large weight/reps controls, direct keyboard entry and optional RPE/RIR disclosure. Save remains clear of the keyboard and home indicator. |
| 6. Exercise substitution | Reason chips are optional; candidates use “Why it matches” sentences and disclose unknowns. The user chooses today or future in plain language after selection. |
| 7. Workout completion | Saved-on-device appears first, followed by a short positive summary, any comparable records and next-in-sequence. Recommendation rationale is expandable and all responses are neutral. |
| 8. History | Friendly timeline/list with month summaries and explicit partial/short labels. Calendar remains available; long history can switch to a denser list. |
| 9. Exercise progress | A plain-language answer, spacious comparable trend, definitions and underlying session list. Insufficient data explains what is needed without presenting an empty decorative chart. |
| 10. Programme editor | Guided outline with labelled sections, collapsible advanced settings and a persistent Save new version action. Expert “compact editor” may be a later preference only after validation. |

### Accessibility analysis

Visible strengths are plain labels, generous separation, large values, a clear current-set region and completion icons plus text. Risks include meaning carried by the vertical timeline, pale grey secondary text, the reference’s white-on-bright-coral action, large vertical travel, rounded low-contrast boundaries and a sheet that may obscure content at large text. The proposed coral is darker than the reference; timeline nodes require number/check/state text; and at 200% text the two-column target/history block and set sheet become one column in document order. Spaciousness does not by itself establish accessibility.

### Risks and trade-offs

- The lower density can slow experienced users who want several sets and targets visible simultaneously.
- A vertical timeline consumes width and may overstate a linear workout order when users reorder or use circuits.
- Rounded cards and soft tints can drift toward generic wellness styling if not kept selective.
- Large text and keyboard presentation can make the lower current-set sheet dominate the viewport.
- Three destinations hide programme editing and the exercise library one level deeper.
- Gentle language must remain concise enough for between-set attention.

## Scored comparison

Scores are design hypotheses on a 1–5 scale, where 5 is strongest. Weights reflect the product-owner-specified promise and repeated-workout risk. Weighted result is out of 5.00.

| Criterion | Weight | Tempo Ledger | Field Kit | Open Pace |
|---|---:|---:|---:|---:|
| Immediate clarity | 12 | 5 | 4 | 5 |
| Logging speed | 12 | 5 | 5 | 4 |
| One-handed use | 10 | 4 | 5 | 4 |
| Visual originality | 8 | 5 | 5 | 4 |
| Long-term usability | 10 | 5 | 3 | 5 |
| Accessibility potential | 12 | 5 | 3 | 5 |
| Useful information density | 7 | 5 | 5 | 3 |
| Athletic character | 7 | 4 | 5 | 3 |
| Beginner friendliness | 7 | 4 | 3 | 5 |
| Advanced-user capability | 5 | 5 | 5 | 3 |
| Enjoyment | 5 | 4 | 5 | 4 |
| Ability to scale | 5 | 5 | 4 | 4 |
| **Weighted result** | **100** | **4.71** | **4.25** | **4.22** |

The score is not usability evidence. It is a traceable design judgement based on the brief, current research, direct image inspection and known implementation cost. Rendered prototype comparison, field testing, large-text review and assistive-technology testing may change it.

## Recommendation, not selection

**Recommend Tempo Ledger as the base direction for owner review**, because it best balances fast repeated logging, precise numeric comparison, broad audience fit, long-session calm, accessible reflow potential and a distinctive identity that does not depend on “hardcore” fitness cues. Selectively borrow Open Pace’s plain-language recommendation pattern and its clear current-step continuity after testing; do not merge its rounded-card system wholesale. Preserve Field Kit’s oversized active-set targets as an accessibility and gym-floor benchmark, not as the default brand tone.

This recommendation does not select a direction. Production design remains stopped until the product owner chooses a base, identifies any elements to combine and records the decision in [`../project/decision-log.md`](../project/decision-log.md).
