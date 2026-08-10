# NextSet content and tone

Status: foundation guidance for all three directions  
Date: 2026-08-06

## Voice

NextSet sounds like a calm, competent training partner who keeps the record straight and leaves decisions with the user. It is concise during a workout, explanatory when a choice has consequences and neutral when reality differs from the plan.

The voice is:

- **clear:** name the object, action, scope and result;
- **factual:** distinguish observed, planned, calculated, estimated and recommended values;
- **encouraging:** recognise effort or a comparable best without judgement;
- **bounded:** state what the product knows and what it does not;
- **user-controlled:** explain options without implying there is one morally correct choice;
- **private:** never turn completion into an unsolicited share prompt.

It is not a coach, clinician, drill sergeant, hype brand or social-feed commentator.

## Attention-based writing

| Context | Copy budget and style | Example |
|---|---|---|
| Active set | Short labels and one-sentence errors | “Set not saved. Your values are still here.” |
| Rest timer | State + time + direct controls | “Resting · 1:12” / “Rest complete” |
| Today | One clear answer and one supporting line | “Upper A is next in your sequence.” |
| Scope-changing choice | Verb, object, consequence | “Use this exercise today only. Your programme stays unchanged.” |
| Recommendation | Observation, rule, proposal, choices | “You completed 10 reps on all 3 planned sets. Your double-progression rule suggests 52.5 kg next time.” |
| Completion | Saved truth, concise summary, next likely action | “Saved on this device. 17 working sets completed.” |
| History/progress | Named question and bounded answer | “Your best comparable bench-press set increased from 90 kg × 8 to 100 kg × 9 across six sessions.” |
| Recovery | Exact known state and safe next action | “This set was not saved. The previous saved set is unchanged. Try again.” |

## Canonical labels

Use the same terms across visual directions, export explanations and assistive-technology names.

| Concept | Preferred label | Avoid |
|---|---|---|
| What the programme proposes | **Planned** / **Target** | Assigned, required, prescribed |
| Comparable prior observation | **Previous** / **Last comparable set** | Last time when the variation is not comparable |
| What the user entered | **Logged** / **Completed set** | Result if it could be mistaken for a calculated outcome |
| Uncommitted values | **Draft** | Saved, done, complete |
| Durable device state | **Saved on this device** | Synced, uploaded, backed up |
| Future model proposal | **Suggestion** / **Recommendation** | Decision, optimal target, what you should do |
| Mathematical value | **Estimated 1RM** | 1RM, max, safe attempt |
| Flexible schedule position | **Next in sequence** | Due, late, missed because a date passed |
| Fixed occurrence past date | **Unresolved planned workout** / “was planned for…” | Failed workout, broken streak |
| Deliberate omission | **Skipped** | Failed, quit |
| Not performed | **Not attempted** | Zero |
| Session with reduced plan | **Short workout** / **Reduced for today** | Optimised, best possible |
| Changed exercise | **Replaced for this workout** | Equivalent, safe alternative |
| Personal record | **New rep best** / **New comparable best** | All-time best when data scope is narrower |

Use the glossary in [`../project/glossary.md`](../project/glossary.md) for domain definitions. UI copy may explain a term but cannot redefine its persisted meaning.

## Planned, previous and logged example

Good:

```text
Previous comparable set  100 kg × 8
Planned today            100 kg · 6–10 reps
Logged                   100 kg × 9
```

Avoid an unlabeled row such as `100 | 100 | 9`, even if visual column position appears obvious. At large text and for screen readers, each value must stand alone with its label and unit.

## Recommendations

Every recommendation follows this structure:

1. **Observed facts:** “You completed 10 reps on all 3 planned working sets at 50 kg.”
2. **Rule:** “Your programme uses double progression with a 2.5 kg increment.”
3. **Proposal:** “Consider 52.5 kg for 3 × 8 next time.”
4. **Control:** “Accept”, “Edit”, “Keep 50 kg”, “Later” or “Dismiss”, according to the rule state.
5. **Limit where material:** “This suggestion uses logged comparable sets; it does not account for recovery or injury.”

Do not use:

- “AI says…” or unexplained confidence scores;
- “Optimal”, “perfect”, “safe for you”, “injury-proof” or outcome guarantees;
- hidden programme mutation after “Got it”;
- a negative tone when a qualification was not met. Use “Keep the current target” rather than “You failed to progress.”

## Schedule and adherence

Preferred:

- “Upper A was planned for Thursday. Choose what should happen next.”
- “Lower A is still next in your flexible sequence.”
- “Skip Upper A? Lower A will become next.”
- “Move to Saturday. Your completed workouts will not change.”
- “Rest day” / “No workout planned.”

Avoid:

- “You’re behind.”
- “Don’t break your streak.”
- “Make up for a missed day.”
- “No excuses.”
- red error styling for an ordinary change of schedule.

## Substitution

Candidate text names evidence without claiming biomechanical or medical equivalence:

```text
Dumbbell bench press
Close metadata match
Same horizontal-push tag · similar target-region tags · dumbbells available
Difference: separate-arm load; previous barbell history will not be used as a direct comparison
```

Reason is optional. “Not comfortable” records preference only and never triggers an injury diagnosis or reassurance. If metadata is incomplete, say “Match information is incomplete”, not “Good alternative”.

Scope copy is explicit:

- **Use today only** — “Your programme stays unchanged.”
- **Change future workouts** — “This creates a new programme version. Started and completed workouts stay unchanged.”

## Short-workout mode

Say what changed and why:

```text
Estimated 28–35 minutes
Kept: squat, row
Reduced: row from 3 to 2 working sets — programme minimum is 2
Removed for today: curls — marked optional
Your original programme is unchanged.
```

Use “estimated” or “unknown” when duration inputs are incomplete. Never promise the workout will fit exactly or call the reduction optimal.

## Saved, sync and offline

MVP core data is local. Use:

- “Ready offline.”
- “Saved on this device.”
- “Restored from your latest saved workout.”
- “Export created on this device.”

If future sync exists, add a separate status:

- “Saved on this device · Waiting to sync.”
- “Synced.”
- “Sync needs attention. Your local workout is still saved.”

Never show “Saved” before the local commit, use a cloud icon as the only truth, or advise reinstall/logout when unsynced work may exist.

## Errors and recovery

An error answers four questions in order:

1. What operation failed?
2. What is still safely saved?
3. What input has been retained?
4. What can the user do next?

Examples:

| Situation | Copy |
|---|---|
| Set transaction failed | “Set not saved. Your values are still here; the previous saved set is unchanged. Try again.” |
| Storage full | “Set not saved because this device is low on storage. Keep this screen open, free space, then try again.” |
| Validation | “Enter reps as a whole number. Your weight and RIR are unchanged.” |
| Conflict | “This programme changed after you began editing. Review the latest version before publishing.” |
| Corrupt active revision | “We could not read the latest active-workout revision. Your completed history is still available. Review recovery options.” |
| Export failure | “Export not created. Your training data is unchanged.” |

“Something went wrong” may be a heading only when a precise explanation follows. Do not clear the screen merely to clear the error.

## Empty states

Use exact cause + one useful action:

| State | Heading | Explanation | Primary action |
|---|---|---|---|
| No programme | “No programme yet” | “Choose a reviewed template or build your own.” | “Choose a programme” |
| No workouts | “No completed workouts yet” | “Your first completed workout will appear here.” | “Start a workout” |
| No comparable exercise data | “No comparable sets yet” | “Log this exercise variation in another session to build a trend.” | “View raw history” when any exists |
| Filter empty | “No workouts match these filters” | Keep the filter summary visible. | “Clear filters” |
| Offline cloud-only future service | “This service needs a connection” | State which local tasks still work. | “Try again” |

Do not use fake zero charts, placeholder cards, guilt, mascots that trivialise data loss or a generic “Nothing here.” A normal empty state must never disguise corruption or migration failure.

## Completion and records

Routine completion:

```text
Saved on this device
Upper A complete
52 minutes · 17 working sets
Lower A is next in your sequence
```

Personal record:

```text
New rep best
100 kg × 9 on barbell bench press
One more rep than your previous comparable set at this load.
```

Do not use “Crushed it”, “Beast mode”, “No pain, no gain”, “Burned”, gendered praise, calorie/body language or unsupported “stronger” claims. A warmer opt-in celebration level may say “Nice work” but must still anchor any factual claim to recorded data.

## Directional inflection

The core terminology and safety boundary do not change with visual style.

| Direction | Copy rhythm | Example action / status |
|---|---|---|
| Tempo Ledger | Compact, literal, editorial | “Log set 4” · “Saved on this device” |
| Field Kit | Direct verbs and short operational labels; supporting sentences remain plain | “Complete set” · “Set 2 saved” |
| Open Pace | Slightly more conversational, still concise | “Save set” · “Upper A is next whenever you train” |

Do not let Field Kit become militaristic or Open Pace become patronising. Tempo Ledger must not replace plain language with cryptic abbreviations.

## Accessibility and localisation

- Visible labels contain the key words used in accessible names: visible “Save set” should not be announced only as “Confirm”.
- Avoid directional-only instructions such as “tap the icon on the right”. Name the action.
- Expand abbreviations on first use: “RIR (reps in reserve)”. Let users hide optional effort fields.
- Use locale-aware dates, decimal separators, units and plural forms. Do not concatenate translated fragments to build an announcement.
- Screen-reader announcements are concise and event-based. Do not announce every timer tick or duplicate visible and live-region content.
- Preserve user-entered names and notes exactly; do not interpret them as readiness, diagnosis or recommendation inputs.
- Avoid all-caps explanations. Voice and visual stress come from hierarchy, not shouting.

## Content review checklist

- Is the state true only after the relevant local transaction?
- Is scope explicit: current set, session, programme version, history or device data?
- Are planned, observed, calculated, estimated and recommended facts distinct?
- Does the copy preserve user control and avoid a medical/coaching/outcome claim?
- Does a missed or changed workout remain neutral?
- Can the sentence survive screen-reader output, large text and translation without relying on layout or colour?
- Does the error preserve input and name a safe next action?
- Is any metric tied to an approved question and real source data?
