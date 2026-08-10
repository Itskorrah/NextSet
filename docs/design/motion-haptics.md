# NextSet motion and haptics

Status: proposed interaction language for direction evaluation; not implemented or device-tested  
Date: 2026-08-06  
Evidence date: official sources accessed 2026-08-06

## Purpose

Motion and haptics should confirm state, preserve spatial continuity and make repeated logging feel responsive. They never carry the only meaning, delay a local write, imply that an unsaved action succeeded or turn routine exercise into spectacle.

Apple advises apps to respond to Reduce Motion by reducing automatic/repetitive animation, zoom, scale, peripheral and depth motion and by preferring less spatial treatments such as fades in its [Accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility). Android's [Haptics design principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles) say “less is more”, recommend action-oriented predefined effects and require fallbacks because hardware capability varies. React Native exposes platform accessibility state/events but notes that Android and iOS behaviour differs in its [Accessibility documentation](https://reactnative.dev/docs/accessibility). These sources were accessed 2026-08-06.

## Non-negotiable sequence

```text
User action
  → validate input
  → begin visible pending state without success semantics
  → commit local transaction
  → if committed: show completed state + optional haptic/motion
  → if failed: retain draft + show error; no success haptic or check
```

Animation completion is never a prerequisite for persistence or the next action. A duplicate tap is handled by the command/idempotency layer, not by disabling the UI for a decorative delay.

## Shared motion rules

- Begin direct-manipulation feedback immediately; target future production response is within the performance budget in [`../quality/performance-budgets.md`](../quality/performance-budgets.md).
- Use opacity, colour, stroke/fill and at most short 4–8 px positional transitions for routine state.
- Keep routine transitions at roughly 80–260 ms. Duration is a hypothesis to tune on minimum devices, not a production guarantee.
- No bounce, elastic overshoot, parallax, blur travel, looping celebration or per-second countdown animation in the repeated workout loop.
- A timer may show continuous progress only when it conveys elapsed time; the numeric value is authoritative and remains correct when animation is disabled or frames are dropped.
- Reordering follows the user's gesture; the final order snaps only after a valid commit. Move up/down controls provide the same result without drag.
- Sheets dismiss the keyboard before presentation and preserve the logical focus return.
- Route transitions never move protected device chrome and never make an active workout appear discarded.
- Loading placeholders must not pulse indefinitely. Prefer stable skeleton blocks or progress text for operations long enough to perceive.

## Direction motion character

| Direction | Routine motion | Set completion | Progress and navigation | Personal record |
|---|---|---|---|---|
| **Tempo Ledger** | 100–180 ms crisp fade/underline and 4 px settle; ease-out with no overshoot | Current row receives a left rule, values settle to ink and a check appears after commit | Ledger tab underline slides only between adjacent destinations; segmented progress fills discretely | Outlined stamp fades/scales from 98% to 100% after verified completion; reduced mode shows it instantly |
| **Field Kit** | 80–140 ms mechanical latch; 1–2 px button depression; almost no spatial travel | Control bay changes outline→filled state and the next bay becomes current after commit | Exercise bay and thick rail snap to the new state; reordering uses hard displacement | PB hardware tag latches from amber outline to mint fill; no flash or particles |
| **Open Pace** | 160–260 ms gentle opacity and 6–8 px continuity shift; no spring bounce | Current-set sheet settles, timeline node fills and focus moves predictably after commit | Timeline advances with a short path fill; bottom sheet and destination transitions preserve source position | “New best” capsule and explanation fade in at completion; no interruption during active entry |

The different tempo is intentional. Combining the directions does not mean averaging all timing into one generic spring system.

## Reduced-motion contract

When the platform requests reduced motion or the in-app celebration setting is reduced:

| Standard treatment | Reduced alternative |
|---|---|
| Row slide/settle | Immediate row state plus ≤100 ms opacity change if useful |
| Exercise timeline/path fill | Static completed/current nodes and updated text |
| Sheet travel from bottom | Immediate placement or brief crossfade; focus moves only after destination exists |
| Programme reordering displacement | Direct final position plus textual announcement |
| PR scale/stamp/latch | Static “New best” tag and one polite announcement |
| Completion transition | Immediate saved summary; no zoom, confetti or sweeping chart |
| Timer progress animation | Numeric countdown and static state indicator; optional coarse segment update |

Functional progress, save/error state and navigation order must remain understandable when all animations are disabled. Do not use “0.01 ms animation” as the only implementation strategy if the component still mounts distracting intermediate frames.

## Haptic principles

1. Haptics are supplementary, optional and user-disableable.
2. Use platform action-oriented effects/constants where possible; a device with no suitable actuator receives no effect rather than a long buzzy substitute.
3. Frequent actions get the lightest useful cue. Importance, not visual drama, determines strength.
4. Do not play a success haptic until durable local commit.
5. Do not haptically punish validation errors, missed workouts, below-target sets or dismissed recommendations.
6. Sound, haptic and notification options for rest expiry are independently controllable.
7. Rapid steppers coalesce or suppress repeated ticks so a held/repeated increment does not become a vibration stream.
8. Haptic-off, silent mode, low-power behaviour and unsupported devices retain complete visible and semantic feedback.

## Direction haptic character

| Event | Tempo Ledger | Field Kit | Open Pace |
|---|---|---|---|
| Select option | Platform selection tick, used sparingly | Short clear tick | Soft/light selection tick |
| Valid set committed | One crisp light confirmation | One short medium latch | One soft light confirmation |
| Workout committed | One medium confirmation | Firm but brief confirmation | Gentle two-pulse completion |
| Verified personal record | Two light taps separated briefly; completion screen only | Short medium + light tag pulse; completion screen only | Two soft taps; completion screen only |
| Rest expired | User-selected platform notification/alert cue | User-selected clear alert cue; no long buzzy fallback | User-selected gentle alert cue |
| Increment reaches equipment step | None by default | Very light tick with rate limiting | None by default |
| Failed save | No “success” effect; optional platform error cue only if enabled and paired with accessible error | Same | Same |

Exact iOS/Android effects must be selected during implementation against the approved stack and physical devices. Names such as “light” and “medium” express hierarchy, not a promise that different actuators feel equivalent.

## Event specifications

### Set commit

- On press: visible pressed state only.
- During a perceptible transaction: keep the user's values and show a non-success pending label such as “Saving…”. Do not replace values with a spinner.
- On success: row state, progress and focus update atomically from the committed model; announce once; play the configured direction haptic.
- On failure: values stay editable, focus returns to the affected context, the error says “Set not saved” and no completion state remains.

### Rest timer

- Start, pause, extend, reduce, restart and dismiss are visible commands independent of the set record.
- Expiry changes `Resting` to `Rest complete`; it never logs a set, advances an exercise or claims readiness.
- Screen-reader output announces start/pause/expiry according to user preference, not every tick.
- Background reconstruction uses timestamps; motion resumes from computed time rather than an in-memory animation frame.

### Workout completion

- Finish remains active only when required unfinished-work choices are resolved.
- A saved-on-device status appears before any summary animation.
- Summary items may stagger only if all content and controls are immediately available to assistive technology and the stagger does not delay exit.
- A record or suggestion appears after saved confirmation and never captures focus unexpectedly.

### Reorder and substitution

- Reorder motion preserves stable identity; failed commit returns to the authoritative order while retaining a retryable proposal.
- Substitution transition names the new exercise and scope. It does not morph one exercise into another in a way that implies equivalence.

### Errors and recovery

- Use stable placement, not shake, for validation errors.
- A restored active workout may use a brief info banner; it cannot repeatedly animate on every resume.
- Corruption/migration recovery avoids pulsing alarm treatment. The severity comes from precise persistent copy and blocked unsafe writes.

## Validation evidence required after implementation

- 60 fps/frame-time traces on minimum and mid-tier devices for set commit, navigation, sheet, reordering and long-workout scroll.
- Video and state logs proving success visuals/haptics occur after local commit and never after injected failure.
- Reduce Motion/remove animations coverage for all ten required screens and every event above.
- Haptics on/off, low-power/unsupported actuator, notification granted/denied and silent-mode checks on physical iOS and Android devices.
- VoiceOver/TalkBack focus and announcement recordings for set commit, timer expiry, completion, PR and failure.
- A repeated 30-set task confirming motion/haptics do not slow logging, cause accidental double entry or become fatiguing.

The generated visual references cannot provide any of this evidence.
