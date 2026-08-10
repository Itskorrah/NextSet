# NextSet colour and typography studies

Status: proposed tokens for visual-direction evaluation; not production tokens  
Date: 2026-08-06  
Evidence date: official sources accessed 2026-08-06

## Evaluation method

Colour is assigned by product role, not by a universal claim that a hue makes people stronger, calmer or more motivated. Each palette was evaluated for identity, long-session comfort, light/dark use, state separation, broad audience fit and ability to avoid cryptocurrency, gaming, AI-gradient and gender-coded fitness clichés.

The proposed contrast pairs below use the WCAG relative-luminance formula. The cross-platform baseline is at least 4.5:1 for ordinary text, 3:1 for qualifying large text and 3:1 for essential non-text boundaries/indicators. WCAG is a web standard, so native platform guidance and task testing remain necessary. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) defines those contrast and 200% resize outcomes; Android currently recommends the same 4.5:1/3:1 text thresholds and at least 48×48 dp touch targets in [Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps). Both were accessed 2026-08-06.

Ratios are calculations from the proposed hex values, not measurements of the generated reference images. Opacity, gradients, pressed/disabled states and compositing must be recalculated from the final rendered pixels.

## Semantic colour contract

All directions use the same semantic roles even though the hues differ.

| Role | Meaning and constraints |
|---|---|
| `canvas` | App background; never a status colour |
| `surface` | Raised/grouped content; elevation must also have boundary/position |
| `ink` | Primary text and icons |
| `muted-ink` | Secondary text; still passes 4.5:1 at ordinary sizes |
| `line` | Functional boundary/grid/focus-adjacent separator; ≥3:1 where required to perceive control/state |
| `action` / `on-action` | Primary action fill and its content; not reused for warning/error |
| `success` | Durable saved/completed/verified state, paired with text or icon |
| `warning` | Attention without data loss; paired with an explanation/action |
| `danger` | Failed write or destructive consequence; never used for missed training or below-target performance |
| `info` | Neutral explanation or restored state |
| `focus` | Visible keyboard/switch focus; ≥3:1 against adjacent colours and not obscured |
| `disabled` | Unavailable control only; never the sole carrier of essential instructions |

Selected, completed, planned, skipped, error and personal-record states must remain distinguishable in monochrome through labels, icons, stroke/fill or pattern.

## Tempo Ledger palette

### Light appearance

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F4F0E7` | Warm paper field |
| `surface` | `#FFFDF8` | Ledger sheet and editing surface |
| `ink` | `#171914` | Primary copy/numerics |
| `muted-ink` | `#5B5C54` | Secondary labels |
| `line` | `#7D7C74` | Functional rules and control boundaries |
| `action` | `#B73320` | Primary action/current-row rule |
| `on-action` | `#FFFDF8` | Action text/icon |
| `success` | `#4B5A32` | Saved/completed/progress |
| `warning` | `#765100` | Unresolved attention state |
| `danger` | `#A82E2E` | Failed save/destructive state |
| `info` | `#2F5B78` | Restored/neutral explanation |
| `focus` | `#0D5BD7` | Keyboard/switch focus ring |

### Dark appearance

| Token | Value | Use |
|---|---|---|
| `canvas` | `#171A16` | Charcoal paper field |
| `surface` | `#22261F` | Raised ledger sheet |
| `ink` | `#F5F1E8` | Primary copy/numerics |
| `muted-ink` | `#C3C0B7` | Secondary labels |
| `line` | `#77786D` | Functional rules/boundaries |
| `action` | `#FF7457` | Primary action/current-row rule |
| `on-action` | `#171914` | Action content |
| `success` | `#B4C987` | Saved/completed/progress |
| `warning` | `#F0C56A` | Unresolved attention state |
| `danger` | `#FF8A82` | Failed save/destructive state |
| `info` | `#8FC7EA` | Restored/neutral explanation |
| `focus` | `#8DB5FF` | Focus ring |

Core calculated pairs: light `ink/canvas` 15.57:1, `muted-ink/canvas` 5.95:1, `on-action/action` 5.89:1, `success/surface` 7.36:1 and `line/canvas` 3.69:1; dark `ink/canvas` 15.58:1, `muted-ink/canvas` 9.65:1, `action/on-action` 6.65:1 and `line/canvas` 3.92:1.

## Field Kit palette

### Dark-first appearance

| Token | Value | Use |
|---|---|---|
| `canvas` | `#151816` | Instrument-panel field |
| `surface` | `#1D211F` | Equipment bay |
| `ink` | `#F5F1E8` | Primary copy/numerics |
| `muted-ink` | `#C1C7C3` | Secondary labels |
| `line` | `#6F756F` | Rails and functional boundaries |
| `action` | `#F2B544` | Primary action/current position |
| `on-action` | `#151816` | Action content |
| `success` | `#7FD3A5` | Durable saved/completed state |
| `warning` | `#F6D06F` | Attention state; not the action amber in the same component |
| `danger` | `#FF776A` | Failed save/destructive state |
| `info` | `#73B7E8` | Restored/neutral explanation |
| `focus` | `#9EC5FF` | Focus ring |

### Light appearance

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F2EFE5` | Warm equipment-label field |
| `surface` | `#FFFFFF` | Raised bay |
| `ink` | `#171A17` | Primary copy/numerics |
| `muted-ink` | `#525A55` | Secondary labels |
| `line` | `#737B75` | Rails and boundaries |
| `action` | `#7A5100` | Primary action/current position |
| `on-action` | `#FFFFFF` | Action content |
| `success` | `#1E6948` | Durable saved/completed state |
| `warning` | `#755000` | Attention state |
| `danger` | `#A22F32` | Failed save/destructive state |
| `info` | `#285E84` | Restored/neutral explanation |
| `focus` | `#005FCC` | Focus ring |

Core calculated pairs: dark `ink/canvas` 15.87:1, `muted-ink/canvas` 10.41:1, `action/on-action` 9.77:1, `success/canvas` 10.02:1, `danger/canvas` 6.90:1 and `line/canvas` 3.79:1; light `ink/canvas` 15.25:1, `muted-ink/canvas` 6.18:1 and `on-action/action` 6.99:1.

The dark appearance is the direction's defining expression, but it cannot be the only fully designed theme. Amber means operational action/current position; saved state remains mint so a successful write is not confused with selection.

## Open Pace palette

### Light appearance

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F7F3EA` | Warm open field |
| `surface` | `#FFFDF8` | Current-set and grouped surface |
| `ink` | `#123B38` | Primary copy/navigation |
| `muted-ink` | `#5B6964` | Secondary labels |
| `line` | `#77837D` | Functional boundary and timeline |
| `action` | `#C74430` | Primary Save/Start action |
| `on-action` | `#FFFDF8` | Action content |
| `success` | `#176B4E` | Saved/completed/progress |
| `warning` | `#755000` | Unresolved attention state |
| `danger` | `#A63232` | Failed save/destructive state |
| `info` | `#315D86` | Restored/neutral explanation |
| `focus` | `#075FCC` | Focus ring |

### Dark appearance

| Token | Value | Use |
|---|---|---|
| `canvas` | `#0F2826` | Deep teal field |
| `surface` | `#173633` | Raised current-set surface |
| `ink` | `#F6F2E9` | Primary copy/navigation |
| `muted-ink` | `#C5CFCA` | Secondary labels |
| `line` | `#6E827B` | Functional boundary/timeline |
| `action` | `#FF806B` | Primary action |
| `on-action` | `#0F2826` | Action content |
| `success` | `#8FD0AF` | Saved/completed/progress |
| `warning` | `#F2CA73` | Unresolved attention state |
| `danger` | `#FF8D87` | Failed save/destructive state |
| `info` | `#94C8EF` | Restored/neutral explanation |
| `focus` | `#A0C2FF` | Focus ring |

Core calculated pairs: light `ink/canvas` 11.10:1, `muted-ink/canvas` 5.20:1, `on-action/action` 4.81:1, `success/surface` 6.36:1 and `line/canvas` 3.56:1; dark `ink/canvas` 13.90:1, `muted-ink/canvas` 9.73:1, `action/on-action` 6.33:1, `success/canvas` 8.74:1 and `line/canvas` 3.80:1.

The proposed `#C74430` action is intentionally darker than the bright coral in the generated reference. The reference image's actual composited contrast has not been verified and must not become a production token by sampling alone.

## Typography principles

1. Text scaling remains enabled. Critical text is not capped or shrunk to preserve a composition.
2. Body copy uses sentence case. Uppercase is limited to short labels and actions and must not carry complex explanations.
3. Timers and aligned data use tabular numerals; a monospaced face is optional, not a requirement for every number.
4. Units remain visually attached and are included in the accessible value: “100 kilograms”, not four separate focus stops.
5. Planned, previous, logged, estimated and recommended values always have explicit labels.
6. At large text, columns become stacked labelled values. No ordinary form or set table requires two-dimensional scrolling.
7. Localisation tests include long German-like labels, languages without uppercase, right-to-left layout, comma decimals and plural/grammar variation before the type system is accepted.
8. Font files are bundled locally only after licence and glyph coverage review; workout logging cannot depend on a remote font request.

## Shared type roles

Sizes are initial logical-point/sp targets. Platform text styles and user scaling take precedence.

| Role | Default size / line height | Use |
|---|---:|---|
| Display | 36 / 40 | Exercise or screen title; one per screen |
| Title | 28 / 34 | Major section and completion headline |
| Heading | 22 / 28 | Group heading/card title |
| Body | 16 / 23 | Explanations and ordinary labels |
| Body compact | 15 / 21 | Dense history/set context; not long paragraphs |
| Label | 13 / 17 | Short field/status label; use weight before all caps |
| Caption | 12 / 16 | Provenance/supporting metadata; never critical instruction |
| Data hero | 40 / 44 | Current load/reps or completion result |
| Data row | 18 / 24 | Set values/history rows |
| Timer | 28 / 32 | Remaining rest time with tabular numerals |
| Button | 16 / 20 | Action label; semibold/bold, never ultra-condensed for sentences |

No role below 12 logical units is approved for user-facing content. Actual minimums are validated by physical-device legibility and platform accessibility settings, not frozen by this table.

## Direction type studies

### Tempo Ledger

- **Primary:** IBM Plex Sans Regular/Medium/Semibold/Bold.
- **Data:** IBM Plex Mono Medium/Semibold for timers and columns only.
- **Character:** editorial and technical without looking like code.
- **Adjustments:** Display 34/38 at 700; Body 16/23; Data row 18/24; Timer 28/32. Tracking is normal for body and +0.06em only for short 13 px uppercase labels.
- **Fallback:** platform sans plus platform monospace; reflow and hierarchy must remain correct when metrics change.

IBM describes Plex as an open-source UI-capable family and distributes it under the SIL Open Font License 1.1 in the [official IBM Plex repository](https://github.com/IBM/plex) and [licence file](https://github.com/IBM/plex/blob/master/LICENSE.txt) (accessed 2026-08-06). “Plex” is a reserved font name; modified files require OFL review.

### Field Kit

- **Display:** Archivo Expanded ExtraBold/Black for short titles and large actions.
- **Body/labels:** Archivo Regular/Semibold in normal width and sentence case.
- **Data:** Atkinson Hyperlegible Mono Medium/Bold for load, reps and timer values.
- **Character:** equipment marking and strong word shapes, with a deliberately more readable numeric system.
- **Adjustments:** Display 38/39, restricted to roughly 24 characters; Body 16/22; Data hero 48/50; labels 14/18. Long translated actions fall back to normal-width Archivo and sentence case rather than shrinking.
- **Fallback:** system sans and system monospace; the layout may not assume expanded/condensed metrics.

Archivo includes width variants and is licensed under OFL 1.1 in the [official Omnibus-Type repository](https://github.com/Omnibus-Type/Archivo); the foundry's [Archivo page](https://www.omnibus-type.com/fonts/archivo/) also identifies the licence and intended print/digital use (accessed 2026-08-06). Braille Institute provides Atkinson Hyperlegible Next and Mono for personal and commercial use on its [official font page](https://www.brailleinstitute.org/freefont/); the upstream [font repository](https://github.com/googlefonts/atkinson-hyperlegible) records SIL OFL 1.1 (accessed 2026-08-06).

### Open Pace

- **Primary/data:** Recursive Sans & Mono variable family.
- **Character:** open, personable letterforms with consistent family DNA across prose and numerics.
- **Axis policy:** use `CASL` sparingly in display headings only; body remains near its neutral setting. Use the mono axis for timers/data without animating font axes during the repeated workout loop.
- **Adjustments:** Display 36/41; Body 16/24; Data hero 42/46; Timer 29/33. Friendly character comes from spacing and wording, not low contrast or exaggerated rounded forms.
- **Fallback:** system sans/monospace with identical semantic roles and responsive layout.

Recursive is published as a UI/code variable family under SIL OFL 1.1 in the [official Arrow Type repository](https://github.com/arrowtype/recursive) and [Recursive project site](https://www.recursive.design/process/) (accessed 2026-08-06).

## Numeric, unit and date treatment

- Store canonical values separately from display formatting; design never implies a destructive unit conversion.
- Respect locale decimal separators and groupings. A decimal keypad is not evidence that only `.` is valid.
- Use `kg`, `lb`, `reps`, seconds/minutes and assistance/bodyweight modifiers in visible labels. Screen readers receive expanded, natural-language units.
- A timer uses `01:12` visually and “1 minute 12 seconds remaining” semantically. Do not announce every second.
- Dates use locale-aware display while history retains an unambiguous timestamp/time-zone context in detail/export.
- A dash means “not logged” only when accompanied by that semantic state; it never silently means zero.

## Font acceptance gate

Before any proposed font enters production:

1. pin the exact font version and source;
2. retain its licence/copyright text and reserved-name obligations;
3. test required glyphs, numerals, symbols, diacritics, metric/imperial notation and localisation coverage;
4. test Android/iOS rendering, bold text, Dynamic Type/font scaling, 200% text, fallback metrics and screen-reader pronunciation;
5. subset only with a documented language strategy and without removing required glyphs;
6. record file hashes and notices in the release asset inventory.

No proposed direction font is currently bundled in the disposable prototype. CSS family names can fall back silently and therefore are not rendered-font evidence.
