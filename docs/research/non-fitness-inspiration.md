# Non-fitness product inspiration for NextSet

**Research date:** 6 August 2026 (Australia/Sydney)  
**Method:** Review of current first-party product/help material plus limited user reports. These are pattern transfers, not endorsements or instructions to imitate another product’s visual identity.

## Evidence notation

- **[D] Documented behaviour:** described by a first-party product or help source.
- **[U] User report:** an anecdotal experience, useful as a caution rather than prevalence evidence.
- **[I] Transfer:** an inference for NextSet that must be validated in its own context.

## Pattern map

| Reference | What the source establishes | Transfer to NextSet | What not to copy |
|---|---|---|---|
| **Things 3** | [D] Things documents Quick Entry, checklists, natural grouping and a draggable “Magic Plus” insertion control on its [features page](https://culturedcode.com/things/features/); keyboard capture is covered in [support](https://culturedcode.com/things/support/articles/1059358/). | [I] Make the single “add” idea consistent across routine, exercise and set contexts. Insert at the point of use, preserve place, and reveal details only after capture. Fast repeat entry should feel like continuing a list, not completing a form. | Do not copy proprietary visual styling or use drag as the only accessible insertion method. A gym log needs larger targets and stronger save feedback than a desk task manager. |
| **Flighty** | [D] Flighty’s [Live Activities guide](https://flighty.com/help/live-activities-widgets) describes countdown, gate and disruption status without reopening the app. Apple’s design profile says Flighty keeps key information front and centre ([article](https://developer.apple.com/news/?id=970ncww4)). | [I] Treat the active workout and rest timer as glanceable status. Lock-screen/live surfaces can show exercise, set position and time remaining, with a direct return to the active session. Reserve motion for a real state transition. | Do not display sensitive workout/body information on a lock screen by default. Do not turn every set into a high-drama flight alert. |
| **Transit** | [D] Transit explicitly lists what remains available offline and what degrades in its [offline guide](https://help.transitapp.com/article/90-does-transit-work-offline). Its [accessibility page](https://resources.transitapp.com/article/522-transit-and-universal-accessibility) documents VoiceOver/TalkBack support, and GO offers background voice notifications in its [guide](https://help.transitapp.com/article/549-how-to-use-go). | [I] Publish an honest degraded-mode contract: logging and history on device remain available; cloud-only services say when they are stale. Timer completion can have optional nonvisual cues. “What works now?” should be legible at a glance. | Do not use location-style urgency for ordinary training. Accessibility claims require current testing, not a page that remains unchanged through redesigns. |
| **Bear** | [D] Bear’s [store listing](https://apps.apple.com/us/app/bear-markdown-notes/id1016366447) emphasises tools that stay out of the way, cross-note organisation, themes, privacy and multiple export formats. | [I] Keep the writing/logging surface quiet while allowing identity through typography, spacing and a small tokenised theme system. Treat export as product functionality. Search, tags and filters should support history without crowding Today. | Do not equate visual minimalism with accessibility. A blind user reports screen-reader regressions after product changes in a [2026 thread](https://www.reddit.com/r/bearapp/comments/1rrikgn/blind_user_feedback_bear_was_once_the_most/); one report is not an audit, but it is a warning to regression-test every redesign. |
| **Day One** | [D] Day One explains end-to-end encryption and recovery-key implications in its [encryption FAQ](https://dayoneapp.com/guides/day-one-sync/end-to-end-encryption-faq/) and privacy choices in its [privacy FAQ](https://dayoneapp.com/privacy-faqs/). Its 2026 [technical paper](https://dayoneapp.com/wp-content/uploads/2026/03/day-one-end-to-end-encryption-1.pdf) documents export formats including text, PDF and JSON. | [I] Training history is personal. Explain local storage, backup, sync, export and account deletion in plain language. If encryption is later introduced, recovery and device migration are part of the UX, not hidden security settings. | Do not claim “private” merely because data is local today. Do not introduce encryption or accounts before recovery, backup and support implications are designed end to end. |
| **Todoist** | [U] A long-time user praises the speed of instant capture and natural-language entry in a [community discussion](https://www.reddit.com/r/todoist/comments/1le8kne). This is anecdotal rather than a controlled comparison. | [I] Offer expert accelerators—recent exercises, defaults, keyboard paste/import and concise parsing—without making free-form text the only route. Preserve a predictable structured result after fast capture. | Do not hide parsing mistakes. A strength log needs explicit units, exercise identity and a confirmation preview before imported text becomes programme data. |
| **Monzo home redesign** *(anti-inspiration)* | [U] Users describe core balance/transaction information becoming harder to find as home-screen modules accumulated ([discussion](https://www.reddit.com/r/monzo/comments/1gylp0t)). This is a self-selected sample and not evidence about all users. | [I] Protect Today and the active workout with a strict information budget. New programmes, insights, challenges, coaching and promotions must earn a place outside the critical path. | Do not let personalisation become movable clutter. Configurability cannot replace a strong default hierarchy. |

## Transfer principles by design problem

### Fast repeated entry

Things demonstrates capture at the current context rather than through a detached creation flow. Todoist user praise reinforces the value of instant capture, though the evidence is anecdotal.

For NextSet:

- the last logged values and today’s target are already present;
- one deliberate action commits an unchanged set;
- add set/exercise occurs where it will appear;
- advanced properties are available after capture and can become programme defaults;
- keyboard/paste import can accelerate planning, but structured preview prevents silent interpretation errors.

**Avoid:** a universal floating action button whose meaning changes invisibly, a multi-page “new set” form, or drag-only reordering.

### One-handed use and navigation

The references do not prove a particular bottom-navigation layout. The transferable idea is **stable locus of action**: Things keeps capture consistent; Flighty returns directly to the live event; Transit keeps the active journey available.

For NextSet:

- Today, History and Programmes have stable destinations;
- an active workout persists above navigation and always resumes directly;
- the most frequent set action stays in the lower reachable region;
- detail/history opens without terminating the active state;
- every gesture has a visible alternative.

**Avoid:** moving the completion action between exercises, replacing labelled destinations with ambiguous icons, or making a modal the entire workout shell.

### Information hierarchy

Flighty prioritises “what is happening now”; Transit distinguishes live, scheduled and unavailable data; Monzo criticism shows the risk of feature accretion.

For NextSet, order information by decision latency:

1. **Now:** current exercise, set, actual inputs and completion.
2. **Next:** rest time and upcoming set/exercise.
3. **Context:** previous actual, planned target and substitution intent.
4. **Later:** trends, achievements, programme editing and account/settings.

This hierarchy should survive large text. It is not permission to hide important states such as unsynced data or validation errors.

### Motion and feedback

Flighty uses high-salience motion for meaningful travel state; NextSet’s ordinary set completion is more frequent and should be calmer.

- Use a short state transition, check and optional haptic to confirm a local commit.
- Use a restrained PR moment only after the workout or when it will not cover active input.
- Honour reduced motion and offer equivalent static feedback.
- Never delay durability on an animation.
- Avoid confetti for routine behaviour, looping timer motion or red failure theatrics for a missed target.

### Restrained gamification and progress

The non-fitness lesson is accumulated utility rather than an imported game economy. A journal grows more useful as it remembers; a travel app earns trust through accurate status.

For NextSet:

- mark personal records briefly and explain the comparison;
- show programme/session continuity without a punitive daily streak;
- count planned rest and flexible scheduling honestly;
- make progress views answer a question (“What changed over four sessions?”), not fill a dashboard;
- keep sharing opt-in and separate from the completion reward.

**Avoid:** coins, energy systems, loss-framed streak restoration, feed engagement as the default, and progress scores whose formula cannot be inspected.

### Empty states and onboarding

An empty state should complete the smallest useful loop, not advertise the whole feature inventory.

| Empty state | Useful first action | Progressive next step |
|---|---|---|
| No programme | Start a three-exercise sample or import/build one | Explain sequence choice after the first session |
| No history | Log one realistic set | Show previous values on the next comparable set |
| No exercise result | Search recent/common movements or create custom | Add aliases/equipment later |
| No progress trend | Explain how many comparable observations are needed | Offer the raw history now |
| Offline cloud feature | State what still works locally | Retry without blocking the workout |

Onboarding should ask for units and the minimum needed to make the first workout coherent. Goals, equipment profiles, RPE/RIR, notifications, Health access and themes can be requested in context. Permission prompts must explain a present benefit and remain deferrable.

### Local-first and trust

Transit’s degraded-mode documentation and Day One’s encryption/recovery documentation demonstrate that trust depends on a precise contract, not a “privacy-first” badge.

For NextSet:

- show saved-on-device separately from synced;
- keep logging, editing, history and export usable without a connection;
- identify cloud-dependent services and stale data;
- provide a versioned export users can inspect;
- explain backup and device migration before users need them;
- never suggest uninstall/reinstall while unsynced work exists.

### Themes, identity and accessibility

Bear shows that a focused utility can have a recognisable identity without covering the work in decoration. NextSet’s identity should come from consistent type, spacing, material/colour tokens, plain training language and crisp saved/completed states.

Theme requirements:

- light and dark palettes are both designed, not mechanically inverted;
- semantic colours pass contrast and have icon/text equivalents;
- large text reflows dense logging rows;
- motion and haptics respect system settings;
- theme choice never changes the meaning or order of controls;
- screenshots or marketing should not imply accessibility until VoiceOver/TalkBack and motor-access testing is complete.

## What to borrow now

1. **Things:** contextual capture, predictable hierarchy and progressive detail.
2. **Flighty:** glanceable active status and a direct resume path.
3. **Transit:** honest offline degradation and nonvisual live cues.
4. **Bear:** quiet work surface, searchable history, themes and export.
5. **Day One:** plain-language data, backup, privacy and recovery contract.
6. **Todoist:** expert capture accelerators with structured confirmation.

## What to explicitly avoid

- Copying another product’s layouts, iconography, animation signature or brand language.
- Expanding Today into a configurable home feed of every feature.
- Using personalisation to make navigation unpredictable.
- Making a live surface expose sensitive workout/body data by default.
- Claiming offline, privacy or accessibility from architecture intent without destructive testing.
- Letting themes, motion or gamification compete with the set-complete action.

## Uncertainty and validation plan

This review used public documentation rather than a controlled comparative walkthrough. Product behaviour may vary by platform, account tier and version; community sources are self-selected.

Validate the transfers with:

- an interaction prototype for contextual add, set completion and active-session resume;
- large-text, screen-reader and one-handed task tests;
- a lock-screen privacy concept test;
- an offline/force-quit recovery build, not a clickable mock;
- an onboarding test that measures time to first completed set and terms users cannot explain;
- a “feature pressure” review where every new dashboard module must state which higher-priority item it displaces.

The goal is to borrow proven interaction principles while keeping the product unmistakably a dependable strength journal, not a collage of admired apps.
