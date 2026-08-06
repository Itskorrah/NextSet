# NextSet accessibility requirements

Status: proposed, release-blocking for future production  
Date: 2026-08-06  
Target: WCAG 2.2 Level AA principles adapted to native mobile, plus the stricter applicable Apple/Android guidance

## Standard and interpretation

WCAG is written for web content, but its perceivable/operable/understandable/robust outcomes provide measurable cross-platform baselines. Native platform semantics and user settings are authoritative where they differ. Passing an automated scanner is not conformance; critical journeys must work with VoiceOver and TalkBack on physical devices.

The baseline includes WCAG 2.2 AA text contrast of 4.5:1 (3:1 for qualifying large text), non-text UI contrast of 3:1 and text resizing to 200% without loss of content/function. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Resize Text understanding](https://www.w3.org/WAI/WCAG22/Understanding/resize-text) (accessed 2026-08-06).

## A11Y-01: semantic structure

- Every control exposes a concise accessible name, correct role, state, value and enabled/disabled status.
- Visible labels and accessible names use the same key words; an icon-only control receives a stable, action-oriented name.
- Headings identify major screen/section structure without announcing decorative text as headings.
- Lists/collections expose meaningful item grouping and position where supported; a set row must not be dozens of ambiguous focus stops.
- Decorative images/icons are hidden. Informative images have equivalent text.
- Validation error is programmatically associated with the field and announced politely; saving/saved state does not spam announcements.
- Custom adjustable controls expose increment/decrement and direct-edit alternatives.
- Modal/sheet focus moves inside on open, stays contained, returns to the invoking control on close, and supports the platform dismiss/escape action when safe.
- Route/screen change announces the new context once; rest-timer ticks are not live-announced every second.

React Native exposes platform accessibility names, roles, state, values and actions, while noting iOS/Android differences. [React Native accessibility](https://reactnative.dev/docs/accessibility) (accessed 2026-08-06).

### Workout-specific semantics

- A set row's combined announcement follows a stable order: set position and role, measurement, load mode/value/basis, laterality, effort observation if present, completion or not-attempted state, available actions. It announces only dimensions needed to disambiguate the row rather than collapsing them into one “type.”
- Previous performance and today's target are distinguishable in both label and value; colour/column position is insufficient.
- Superset/circuit membership and exercise substitution are announced textually.
- Personal-record celebration announces once after durable completion and never steals focus from set entry.
- Charts expose title, question answered, date range, unit, trend/summary and a navigable data table/list alternative.

## A11Y-02: focus and input order

- Focus order matches reading and task order in every supported layout and does not depend on visual absolute positioning.
- After adding/deleting/reordering a set, focus moves to the logical affected row/action—not screen start or an absent node.
- After a commit failure, focus remains on/returns to the retained input and the failure is announced.
- The active workout offers a short screen-reader path to current exercise, add/complete set, timer and next exercise; repeated historical detail is collapsible/skippable.
- Visible keyboard focus meets 3:1 adjacent contrast, is not obscured by sticky controls/keyboard, and never relies only on colour.
- External keyboard and switch navigation can activate every critical control without drag-only gestures.

## A11Y-03: text scaling, reflow and typography

- Support platform font scaling through at least 200% and all approved iOS accessibility text sizes used by the supported OS matrix.
- No critical label, numeric value, error, unit, timer or control clips, overlaps, disappears or becomes unreachable.
- Ordinary text/form flows use one-dimensional scrolling. Horizontal tables/graphs provide an equivalent reflowed/list representation.
- Layout may switch from rows to stacked cards/sections at large text; do not shrink system text to preserve the visual design.
- User-entered names/notes wrap. Truncation is allowed only when a nearby accessible expansion reveals the full value.
- Do not bake text into images. Use tabular numerals where visually useful without changing spoken meaning.
- Respect system bold text where available and maintain hierarchy without depending on thin weights.
- Numeric inputs keep a visible/spoken unit and accept locale-appropriate decimal entry; never rely only on placeholder text.

Gate: critical journeys at 200% font and the agreed largest iOS/Android accessibility configurations have no loss of content/function, unresolved overlap or hidden primary action.

## A11Y-04: touch targets and motor access

- NextSet standard: every interactive mobile hit area is at least **48 × 48 logical pixels/points**, even when the visible icon is smaller.
- Adjacent frequent/destructive controls have at least 8 logical pixels of separation or non-overlapping expanded hit regions.
- Set completion, timer, increment/decrement and exercise navigation cannot require precise edge taps.
- Swipe/drag actions have a visible tap/menu alternative. Reorder has Move up/down actions for assistive technology.
- Long press, multi-finger, shake and motion gestures are never the only path.
- Destructive actions are separated from repeated completion actions and are undoable or confirmed according to consequence.
- Primary active-workout actions sit within reasonable thumb reach in common one-handed portrait use, but screen-reader order remains logical.

Apple lists 44×44 pt as the standard iOS/iPadOS control target and emphasises spacing; Android recommends at least 48×48 dp. NextSet adopts the larger 48 baseline across both mobile platforms. [Apple accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility) and [Android accessible app guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views) (accessed 2026-08-06).

## A11Y-05: colour and contrast

- Normal text and images of text: ≥4.5:1; qualifying large text: ≥3:1.
- Essential control boundaries, focus, icons, chart marks and state indicators: ≥3:1 against adjacent colours.
- Disabled controls remain identifiable; disabled text is not used to communicate required instructions.
- Do not convey completed/skipped/error/PR/target/source status by colour alone; pair text, shape, pattern or icon with an accessible label.
- Light and dark themes are tested independently. Dark mode is not an inverted afterthought.
- User-selected/accent themes cannot override semantic status contrast; choose a safe fallback.
- Charts have distinguishable line/point styles and a nonvisual table/summary.
- Contrast is calculated on final composited colours including opacity/gradient/image background and all pressed/focused states.

Gate: zero known AA contrast failures in production tokens/screens. A brand exception is not permitted for functional text/control state.

## A11Y-06: motion, animation and flashing

- Respect system Reduce Motion/remove-animations settings on both platforms.
- Reduced mode removes parallax, large spatial travel, zoom, bounce, looping decoration and celebratory particle motion; use instant state or short fades where useful.
- Functional progress and save state remain understandable when all animation is disabled.
- No flashing content above three flashes per second and no high-risk large flash treatment.
- Gesture-tracked motion follows the gesture and can be replaced with controls.
- Auto-playing/looping motion has no place in the repeated workout loop.
- Animations never delay a user's next set action or block screen-reader focus.

Apple advises responding to Reduce Motion by reducing automatic/repetitive animation and substituting less spatial treatments such as fades. [Apple accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility) (accessed 2026-08-06).

## A11Y-07: haptics, audio and notifications

- Haptic feedback is optional, user-disableable and supplementary to visible/semantic feedback.
- Haptic absence due to device/system/low-power state has no functional effect.
- The rest timer offers visible and accessible state; sound/haptic/notification is not required to know completion.
- Notification text is generic/private by default, readable, and does not use urgency/shame.
- No essential instruction is audio-only. If sound is added, obey silent/system settings and provide equivalent visual/haptic choices.
- Do not announce every countdown tick; announce meaningful start/pause/expiry only according to user choice.

Expo documents cases where iOS haptics do nothing, including Low Power Mode or user settings, reinforcing that haptics cannot be authoritative. [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) (accessed 2026-08-06).

## A11Y-08: cognition, language and error prevention

- Use plain, consistent terms aligned with the product glossary. Define RPE/RIR and advanced set dimensions in context.
- Beginner defaults hide optional advanced configuration without making it undiscoverable.
- Never use shame, punitive streak loss, body pressure or false urgency.
- Distinguish Save/Finish/Abandon/Delete with verbs and consequences; destructive irreversible action requires confirmation and/or undo.
- Preserve input after errors and explain how to recover. Do not use generic “Something went wrong” when save status matters.
- Do not impose time limits. Rest timer expiry never closes/advances a task automatically.
- Empty states state why the area is empty and provide one relevant next action.
- Recommendation text gives evidence/reason and preserves override; no unsupported medical authority.
- Local date/time/unit formatting follows locale, while export retains explicit canonical units/time zones.

## A11Y-09: orientation, screen sizes and safe areas

- Portrait is mandatory for phone. If landscape is disabled, document a demonstrated interaction reason and platform accessibility impact; tablets/rotation need explicit approval.
- Support the minimum small-screen device without hidden controls; keyboard and safe-area insets cannot cover set completion or errors.
- Screen magnification/zoom must not break sticky overlays or trap the user.
- Split-screen/tablet behaviour is tested if supported by the final platform manifest.

## A11Y-10: authentication, privacy and safety

- No cognitive-function puzzle or inaccessible CAPTCHA is introduced.
- Future authentication uses platform browser/passkey-compatible flows and accessible recovery.
- Screen readers must not announce obscured underlying private content behind a modal/privacy shield.
- Sharing/export/delete previews identify private content and consequences accessibly.
- App lock, if later added, has a non-biometric fallback consistent with the approved threat model.

## Component definition of done

Each design-system component documents:

- accessible name source, role, state/value/action;
- focus order/return and keyboard/switch behaviour;
- 48×48 target and spacing geometry;
- text-scale/reflow behaviour;
- every contrast pair/state;
- reduced-motion and haptic-off behaviour;
- loading/saving/error announcements;
- both-platform automated examples and manual notes.

No bespoke accessibility semantics in a product screen where the design-system component can own them.

## Test matrix and gates

Automated per PR:

- semantic props/tree, accessible-name uniqueness and state/value;
- target geometry and contrast tokens;
- 100%, 150%, 200% font snapshot/layout tests on minimum widths;
- reduce-motion branches, alternative to gesture and focus/error state;
- lint/static checks, with suppressions reviewed and expiring.

Manual per release candidate:

| Platform/configuration | Critical journeys |
|---|---|
| Current supported iOS + VoiceOver, default and large accessibility text, Reduce Motion | onboarding, start, set entry/edit, timer, substitution, finish, restore, export/delete |
| Oldest supported iOS physical device + VoiceOver | repeated workout and recovery smoke |
| Current supported Android + TalkBack, 200% font, remove animations | same full critical journeys |
| Oldest supported Android physical device + TalkBack | repeated workout and recovery smoke |
| External keyboard/switch-access sample | navigation, input, reorder and destructive recovery |
| Light/dark + contrast/colour-vision review | every semantic state and chart |

Release blocks on:

- any critical journey impossible with VoiceOver/TalkBack or 200% text;
- missing/incorrect critical name, role, state/value or focus trap;
- critical target below 48×48;
- any functional AA contrast failure;
- motion/flash with health risk or no reduced alternative;
- data-loss/error message inaccessible;
- no accessible chart alternative.

Quality target after launch: accessibility-related crash-free core journeys 100%; critical support issue triaged within 1 business day. No automated score substitutes for these gates.

## Reversibility

| Decision | Class |
|---|---|
| Semantic component contracts and scalable layouts | Must; expensive to retrofit |
| 48×48 cross-platform target baseline | Must; design-system level |
| WCAG 2.2 AA adapted baseline | Must; can be strengthened, not silently weakened |
| Exact automated scanner | Reversible if replacement proves equal coverage |
| Landscape/tablet support | Product decision before implementation; manifest choice is reversible but UX work is material |
