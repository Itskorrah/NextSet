import { expect, test, type Page } from "@playwright/test";

async function dismissPrototypeKeyboard(page: Page) {
  const keyboard = page.getByTestId("keyboard-dock");
  await expect(keyboard).toHaveAttribute("data-visible", "true");
  const box = await keyboard.boundingBox();
  if (!box) throw new Error("Prototype keyboard dock has no visible bounds");
  const x = box.x + box.width / 2;
  const startY = box.y + 24;
  await page.mouse.move(x, startY);
  await page.mouse.down();
  await page.mouse.move(x, startY + 110, { steps: 5 });
  await page.mouse.up();
  await expect(keyboard).toHaveAttribute("data-visible", "false");
}

const directions = ["Tempo Ledger", "Field Kit", "Open Pace"] as const;
const navigationByDirection = {
  "Tempo Ledger": ["Workout", "History", "Exercises", "Plans", "More prototype review menu"],
  "Field Kit": ["Workout", "History", "Settings prototype review menu"],
  "Open Pace": ["Today", "Workout", "Progress"],
} as const;
const screens = [
  ["onboarding", "Onboarding"],
  ["programme", "Programme selection"],
  ["today", "Today"],
  ["active", "Active workout"],
  ["set-entry", "Set entry"],
  ["substitution", "Exercise substitution"],
  ["complete", "Workout completion"],
  ["history", "History"],
  ["exercise-progress", "Exercise progress"],
  ["programme-editor", "Programme editor"],
] as const;

for (const direction of directions) {
  test(`${direction} exposes all ten required review screens`, async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto("/?review=legacy");
    await page.getByRole("button", { name: new RegExp(direction, "i") }).click();
    await expect(page.getByTestId("screen-onboarding")).toBeVisible();

    for (const [id, label] of screens) {
      await page.getByRole("button", { name: /open prototype screen index/i }).click();
      const screenIndex = page.locator(".screen-index");
      await expect(screenIndex).toBeVisible();
      await screenIndex.getByRole("button", { name: new RegExp(`\\d+\\s*${label}`, "i") }).click();
      await expect(page.getByTestId(`screen-${id}`)).toBeVisible();
      await expect(screenIndex).toBeHidden();
    }

    await page.getByRole("button", { name: /open prototype screen index/i }).click();
    const screenIndex = page.locator(".screen-index");
    await screenIndex.getByRole("button", { name: /\d+\s*Today/i }).click();
    await expect(page.getByTestId("screen-today")).toBeVisible();
    await expect(screenIndex).toBeHidden();
    const navigation = page.getByRole("navigation", { name: new RegExp(direction, "i") });
    await expect(navigation.getByRole("button")).toHaveCount(navigationByDirection[direction].length);
    for (const label of navigationByDirection[direction]) {
      await expect(navigation.getByRole("button", { name: new RegExp(`^${label}$`, "i") })).toBeVisible();
    }
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  });
}

test("foundation choices disclose when downstream goal and weekday behaviour is not modelled", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await expect(page.getByTestId("screen-onboarding")).toContainText("not used to generate downstream suggestions in this foundation prototype");
  await expect(page.getByTestId("screen-onboarding")).toContainText("Foundation product principle");
  await page.getByRole("button", { name: /Continue to programmes/i }).click();
  await expect(page.getByTestId("screen-programme")).toContainText("static 45–60 minute template estimate based on 16 planned sets and sample 2–3 minute rests");
  const fixedConcept = page.getByRole("radio", { name: /Fixed weekdays concept/i });
  await expect(fixedConcept).toContainText("Specific days are not modelled in this prototype");
  await expect(page.getByTestId("screen-programme")).not.toContainText("Plan around chosen days");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Exercise substitution/i }).click();
  await expect(page.getByRole("note")).toContainText("STATIC PROTOTYPE MATCH FIXTURE");
  await expect(page.getByRole("note")).toContainText("not computed or safety-approved recommendations");
});

test("route changes focus a named screen context and preserve visible header labels", async ({ page }) => {
  await page.goto("/?review=legacy&keyboard=1");
  const keyboard = page.getByTestId("keyboard-dock");
  await expect(keyboard).toHaveAttribute("data-visible", "true");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await expect(keyboard).toHaveAttribute("data-visible", "false");

  const onboarding = page.getByRole("main", { name: "Onboarding screen" });
  await expect(onboarding).toBeFocused();
  await expect(page.getByRole("button", { name: /Onboarding.*open prototype screen index/i })).toBeVisible();
  await page.keyboard.press("Tab");
  const backToGallery = page.getByRole("button", { name: "Back to direction gallery" });
  await expect(backToGallery).toBeFocused();
  await expect.poll(() => backToGallery.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return `${style.outlineStyle} ${style.outlineWidth}`;
  })).toBe("solid 3px");

  await page.getByRole("radio", { name: /Build consistency/i }).click();
  await page.getByRole("button", { name: /Continue to programmes/i }).click();
  const programme = page.getByRole("main", { name: "Programme selection screen" });
  await expect(programme).toBeFocused();
  await expect(keyboard).toHaveAttribute("data-visible", "false");

  await page.getByRole("button", { name: /Use this example in prototype/i }).click();
  const today = page.getByRole("main", { name: "Today screen" });
  await expect(today).toBeFocused();
  await expect(keyboard).toHaveAttribute("data-visible", "false");

  await page.getByRole("button", { name: /Start Upper A/i }).click();
  const active = page.getByRole("main", { name: "Active workout screen" });
  await expect(active).toBeFocused();
  await expect(keyboard).toHaveAttribute("data-visible", "false");

  await page.getByRole("button", { name: /Active workout.*open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Exercise progress/i }).click();
  await expect(page.getByRole("main", { name: "Exercise progress screen" })).toBeFocused();

  await page.getByRole("button", { name: /Exercise progress.*open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: "Review all three directions" }).click();
  await expect(page.getByRole("main", { name: "NextSet visual direction prototypes" })).toBeFocused();
  await page.getByRole("button", { name: /Field Kit/i }).click();
  await expect(page.getByRole("main", { name: "Onboarding screen" })).toBeFocused();

  await page.getByRole("button", { name: /Onboarding.*open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await page.getByRole("textbox", { name: /Programme name/i }).fill("Guarded focus draft");
  await dismissPrototypeKeyboard(page);
  await page.getByRole("button", { name: /Programme editor.*open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Discard changes/i }).click();
  await expect(page.getByRole("main", { name: "Today screen" })).toBeFocused();
  await page.waitForTimeout(350);
  await expect(keyboard).toHaveAttribute("data-visible", "false");
});

test("set controls expose coherent draft state and charts expose every plotted observation", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

  await expect(page.getByRole("note")).toContainText("STATIC ACTIVE-WORKOUT REVIEW STATE");
  await expect(page.getByRole("note")).toContainText("no user workout session is in progress");
  const workingSets = page.getByRole("group", { name: "Working sets" });
  await expect(workingSets).toBeVisible();
  await expect(workingSets.getByRole("button", { name: /Open set 4: 100 kilograms, 8 reps, RIR not recorded; current draft, target 6–10 reps, not saved/i })).toBeVisible();
  await expect(page.getByRole("table", { name: "Working sets" })).toHaveCount(0);

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Exercise progress/i }).click();
  const toggle = page.locator('button[aria-controls="progress-observations"]');
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const observations = page.getByRole("list", { name: "Six plotted comparable-session observations" });
  await expect(observations.getByRole("listitem")).toHaveCount(6);
  await expect(observations).toContainText("22 Jun");
  await expect(observations).toContainText("100 kg × 9 reps");

  const firstSource = observations.getByRole("button", { name: "Open source workout from 22 June 2026: 90 kg × 8 reps" });
  const sourceTarget = await firstSource.boundingBox();
  expect(sourceTarget?.height).toBeGreaterThanOrEqual(48);
  await firstSource.click();
  const sourceDetail = page.getByRole("region", { name: "Source workout from 22 June 2026" });
  await expect(sourceDetail).toBeFocused();
  await expect(sourceDetail).toContainText("Upper A · 22 June 2026");
  await expect(sourceDetail).toContainText("Unshown workout data is not inferred");
  await sourceDetail.getByRole("button", { name: "Back to plotted observations" }).click();
  await expect(sourceDetail).toBeHidden();
  await expect(firstSource).toBeFocused();
});

test("history details announce context and return focus to the originating session", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /History/i }).click();

  const sourceSession = page.getByRole("button", { name: "Open Upper A from THU 06 AUG: sample completed, 16 sets" });
  await expect(sourceSession).toHaveAccessibleName("Open Upper A from THU 06 AUG: sample completed, 16 sets");
  await sourceSession.click();
  const detail = page.getByRole("region", { name: "Upper A session details from THU 06 AUG" });
  await expect(detail).toBeFocused();
  await expect(detail.getByRole("list", { name: "Upper A sample exercises" })).toBeVisible();
  await page.getByRole("button", { name: "Back to History" }).click();
  await expect(detail).toBeHidden();
  await expect(sourceSession).toBeFocused();
});

test("programme validation returns focus to the retained invalid field", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();

  const programmeName = page.getByRole("textbox", { name: /Programme name/i });
  await programmeName.fill("");
  await dismissPrototypeKeyboard(page);
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(programmeName).toBeFocused();
  await expect(programmeName).toHaveAttribute("aria-invalid", "true");

  await programmeName.fill("Accessible programme draft");
  await dismissPrototypeKeyboard(page);
  await page.getByRole("button", { name: /Edit Barbell bench press/i }).click();
  const prescription = page.getByRole("textbox", { name: /Target sets and reps/i });
  await prescription.fill("invalid prescription");
  await dismissPrototypeKeyboard(page);
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await expect(prescription).toBeFocused();
  await expect(prescription).toHaveAttribute("aria-invalid", "true");

  const editExercise = page.getByRole("button", { name: /Edit Barbell bench press/i });
  await prescription.fill("4 × 8");
  await dismissPrototypeKeyboard(page);
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await expect(editExercise).toBeFocused();
  await editExercise.click();
  await page.getByRole("region", { name: /Edit Barbell bench press/i }).getByRole("button", { name: "Cancel" }).click();
  await expect(editExercise).toBeFocused();
});

test("direct note saves retain focus on one confirmation", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Private exercise note/i }).fill("Directly saved exercise note");
  await page.getByRole("button", { name: /Save exercise note in prototype/i }).click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  await expect(page.getByText("Exercise note saved in prototype state.", { exact: true })).toBeFocused();

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
  await page.getByRole("button", { name: /Add a private workout note/i }).click();
  await page.getByRole("textbox", { name: /Private workout note/i }).fill("Directly saved workout note");
  await page.getByRole("button", { name: /Update sample completion-note fixture/i }).click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  await expect(page.getByText("Sample completion-note fixture updated · no workout record or History entry created.", { exact: true })).toBeFocused();
});

test("final-set and guarded next-exercise transitions keep a logical focus target", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

  await page.getByRole("button", { name: /Log set 4/i }).click();
  const nextFocus = page.getByRole("region", { name: "Next exercise focus: Chest-supported row" });
  await expect(nextFocus).toBeFocused();

  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Private exercise note/i }).fill("Keep elbows comfortable");
  await page.getByRole("button", { name: /Close exercise note/i }).click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  await nextFocus.getByRole("button", { name: /Go to Chest-supported row/i }).click();
  await expect(page.getByText("Save exercise note before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByRole("heading", { name: "Chest-supported row", exact: true })).toBeVisible();
  await expect(page.getByRole("main", { name: "Active workout screen" })).toBeFocused();
});

test("fixed active controls leave the final workout actions fully reachable", async ({ page }) => {
  test.setTimeout(30_000);
  for (const direction of directions) {
    await page.goto("/?review=legacy");
    await page.getByRole("button", { name: new RegExp(direction, "i") }).click();
    await page.getByRole("button", { name: /open prototype screen index/i }).click();
    await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

    const finalAction = direction === "Open Pace"
      ? page.getByRole("button", { name: /Finish workout/i })
      : page.locator(".screen-active .inline-actions").getByRole("button", { name: /Finish workout/i });
    const scroll = page.locator(".nextset-scroll .mobile-scroll");
    await expect(page.getByRole("main", { name: "Active workout screen" })).toBeFocused();
    await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect(finalAction).toBeVisible();

    const geometry = await Promise.all([
      finalAction.boundingBox(),
      page.locator(".active-set-dock").boundingBox(),
    ]);
    expect(geometry[0]).not.toBeNull();
    expect(geometry[1]).not.toBeNull();
    expect((geometry[0]?.y ?? 0) + (geometry[0]?.height ?? 0)).toBeLessThanOrEqual((geometry[1]?.y ?? 0) - 4);
  }
});

test("onboarding can be skipped without silently selecting a training goal", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await expect(page.getByRole("radiogroup", { name: /Training goal/i }).locator('[aria-checked="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: /Explore without choosing/i }).click();
  await expect(page.getByTestId("screen-programme")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("No training goal selected");
});

test("switching visual directions clears transient prototype state", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Log set 4/i }).click();
  await expect(page.locator(".save-toast")).toContainText("100 kg × 8");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /Review all three directions/i }).click();
  await expect(page.getByRole("main", { name: /NextSet visual direction prototypes/i })).toBeVisible();
  await page.getByRole("button", { name: /Field Kit/i }).click();
  await expect(page.getByTestId("screen-onboarding")).toBeVisible();
  await expect(page.locator(".save-toast")).toHaveCount(0);
  await expect(page.getByText("Tempo Ledger screen index", { exact: true })).toHaveCount(0);
});

test("primary prototype journey preserves one-action start and editable set entry", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();

  await page.getByRole("radio", { name: /Build consistency/i }).click();
  await page.getByRole("button", { name: /Continue to programmes/i }).click();
  await page.getByRole("radio", { name: /Flexible sequence/i }).click();
  await page.getByRole("button", { name: /Use this example in prototype/i }).click();

  await expect(page.getByTestId("screen-today")).toContainText("Upper A");
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Barbell bench press");
  await expect(page.getByTestId("screen-active")).toContainText("No sets recorded yet");
  await expect(page.locator(".set-row.is-complete")).toHaveCount(0);
  await expect(page.locator(".set-row.is-current")).toContainText("6–10");

  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  const exerciseNote = page.getByRole("textbox", { name: /Private exercise note/i });
  await exerciseNote.fill("Keep the setup identical next time.");
  await page.getByRole("button", { name: /Save exercise note in prototype/i }).click();
  await expect(page.getByRole("region", { name: /Exercise note for Barbell bench press/i }).getByRole("status")).toContainText("saved in prototype state");
  await page.getByRole("button", { name: /Close exercise note/i }).click();

  await page.getByRole("button", { name: /Log set 1/i }).click();
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Set 1 recorded");
  await expect(page.getByRole("button", { name: /Log set 2/i })).toBeEnabled();
  await page.getByRole("button", { name: /Edit completed set 1: 95 kilograms, 10 reps, RIR 2/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toContainText("Edit completed set 1");
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("97.5");
  await page.getByRole("textbox", { name: /weight/i }).fill("100,0");
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("100,0");
  await page.getByRole("button", { name: /^Update set$/i }).click();

  await expect(page.locator(".save-toast")).toContainText("100 kg");
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await expect(page.getByRole("button", { name: /Edit completed set 1: 100 kilograms/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /Next exercise focus: Chest-supported row/i })).toHaveCount(0);
  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await expect(page.getByRole("textbox", { name: /Private exercise note/i })).toHaveValue("Keep the setup identical next time.");
  await page.getByRole("button", { name: /Close exercise note/i }).click();

  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Not comfortable/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  const futureConfirmation = page.getByRole("region", { name: /Confirm future programme substitution/i });
  await expect(futureConfirmation).toContainText("Current active workout: Barbell bench press remains unchanged");
  await expect(futureConfirmation).toContainText("next not-started Upper A occurrence");
  await expect(futureConfirmation).toContainText("Reason retained: Not comfortable");
  await futureConfirmation.getByRole("button", { name: /Confirm future programme change/i }).click();
  await expect(page.locator(".save-toast")).toContainText("next not-started Upper A occurrence");
  await expect(page.getByTestId("screen-active")).toContainText("Reason: Not comfortable");
  await expect(page.getByRole("heading", { name: "Barbell bench press", exact: true })).toBeVisible();
});

test("progress and completion fixtures respect approved rule boundaries", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Exercise progress/i }).click();
  await expect(page.getByTestId("screen-exercise-progress")).toContainText("PROTOTYPE SAMPLE");
  await expect(page.getByTestId("screen-exercise-progress")).toContainText("This fixture adds 10 kg");
  await expect(page.getByTestId("screen-exercise-progress")).not.toContainText("You added 10 kg");
  await expect(page.getByTestId("screen-exercise-progress")).not.toContainText("130 kg");
  await expect(page.getByTestId("screen-exercise-progress")).toContainText("Estimated 1RM stays unavailable");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Workout completion/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("16 working sets");
  await expect(page.getByTestId("screen-complete")).toContainText("all planned work complete");
  await expect(page.getByTestId("screen-complete")).toContainText("16 / 16 sets");
  await expect(page.getByTestId("screen-complete")).toContainText("Sample duration · 52 minutes");
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 100 kg × 9");
  await expect(page.locator(".completion-highlight")).toContainText("One more rep than your previous equivalent session");
  await expect(page.getByTestId("screen-complete")).toContainText("No automatic target change");
});

test("locale draft, history actions and programme editing expose observable state", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*History/i }).click();
  await page.getByRole("button", { name: /Open Lower A from MON 03 AUG/i }).click();
  await expect(page.getByTestId("screen-history")).toBeVisible();
  const lowerSession = page.getByRole("region", { name: /Lower A session details from MON 03 AUG/i });
  await expect(lowerSession).toContainText("Back squat");
  await expect(lowerSession).toContainText("15 sample working sets in this prototype");
  await expect(lowerSession).not.toContainText("Barbell bench press");
  await page.getByRole("button", { name: /Back to History/i }).click();
  await page.getByRole("button", { name: /Open Upper A from THU 06 AUG/i }).click();
  const upperSession = page.getByRole("region", { name: /Upper A session details from THU 06 AUG/i });
  await expect(upperSession).toContainText("Barbell bench press");
  await expect(upperSession).toContainText("best 100 kg × 9");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Programme editor/i }).click();
  await page.getByRole("button", { name: /^Lower A$/i }).click();
  await expect(page.getByRole("button", { name: /^Lower A$/i })).toHaveAttribute("aria-pressed", "true");
  const lowerExercises = page.getByRole("list", { name: /Lower A exercises/i });
  await expect(lowerExercises).toContainText("Back squat");
  await expect(lowerExercises).not.toContainText("Barbell bench press");

  await page.getByRole("button", { name: /Move Romanian deadlift up/i }).click();
  await expect(page.locator(".editor-status")).toContainText("moved up in Lower A");
  await expect(lowerExercises.getByRole("listitem").first()).toContainText("Romanian deadlift");

  await page.getByRole("button", { name: /Edit Romanian deadlift/i }).click();
  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("4 × 8–12");
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await expect(lowerExercises).toContainText("4 × 8–12");

  await page.getByRole("button", { name: /^Add exercise$/i }).click();
  await expect(lowerExercises).toContainText("Bulgarian split squat");

  await page.getByRole("button", { name: /^Upper A$/i }).click();
  const upperAExercises = page.getByRole("list", { name: /Upper A exercises/i });
  await expect(upperAExercises).toContainText("Barbell bench press");
  await expect(upperAExercises).not.toContainText("Bulgarian split squat");
  await page.getByRole("button", { name: /^Add exercise$/i }).click();
  await expect(upperAExercises).toContainText("Cable fly");

  await page.getByRole("button", { name: /^Upper B$/i }).click();
  const upperBExercises = page.getByRole("list", { name: /Upper B exercises/i });
  await expect(upperBExercises).toContainText("Lat pulldown");
  await expect(upperBExercises).not.toContainText("Barbell bench press");
  await page.getByRole("button", { name: /^Add exercise$/i }).click();
  await expect(upperBExercises).toContainText("Face pull");

  await page.getByRole("button", { name: /^Lower A$/i }).click();
  await expect(page.getByRole("list", { name: /Lower A exercises/i }).getByRole("listitem").first()).toContainText("Romanian deadlift");
  await expect(page.getByRole("list", { name: /Lower A exercises/i })).toContainText("Bulgarian split squat");
  await page.getByRole("button", { name: /Review example rule/i }).click();
  await expect(page.getByText(/explicit qualifying sets/i)).toBeVisible();
});

test("programme publishing validates and persists one atomic prototype version", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();

  const programmeName = page.getByRole("textbox", { name: /Programme name/i });
  await expect(programmeName).toHaveValue("Full body · 3 sessions");
  await expect(page.getByRole("button", { name: /No changes to publish/i })).toBeDisabled();
  await programmeName.fill("");
  await page.getByRole("radio", { name: /Fixed weekdays/i }).click();
  await expect(page.getByRole("radio", { name: /Fixed weekdays/i })).toContainText("Specific days are not modelled in this prototype");
  await expect(page.getByTestId("screen-programme-editor")).not.toContainText("Plan around chosen days");
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(page.getByRole("alert")).toContainText("Programme name is required");
  await expect(page.getByTestId("screen-programme-editor")).toBeVisible();

  await programmeName.fill("Three-day strength rotation");
  await expect(page.getByRole("heading", { name: "Three-day strength rotation", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Move Chest-supported row up/i }).click();
  await page.getByRole("button", { name: /Edit Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("   ");
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await expect(page.getByRole("alert")).toContainText("Target sets and reps are required");
  await expect(page.getByRole("region", { name: /Edit Barbell bench press/i })).toBeVisible();
  await expect(page.getByText(/Barbell bench press updated in Upper A/i)).toHaveCount(0);
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(page.getByTestId("screen-programme-editor")).toBeVisible();

  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("hello");
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await expect(page.getByRole("alert")).toContainText("Use 1–4 sets × 1–100 reps");
  await expect(page.getByRole("region", { name: /Edit Barbell bench press/i })).toBeVisible();
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(page.getByRole("alert")).toContainText("resolve this edit before publishing");

  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("4 × 5");
  await page.getByRole("button", { name: /^Lower A$/i }).click();
  await expect(page.getByRole("alert")).toContainText("before switching workouts");
  await expect(page.getByRole("button", { name: /^Upper A$/i })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("textbox", { name: /Target sets and reps/i })).toHaveValue("4 × 5");
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(page.getByRole("alert")).toContainText("Save or cancel this exercise edit before publishing");
  await expect(page.getByTestId("screen-programme-editor")).toBeVisible();
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(page.locator(".save-toast")).toContainText("published in this prototype state");
  await expect(page.getByTestId("screen-today")).toContainText("Chest-supported row");
  await expect(page.getByTestId("screen-today")).toContainText("FIXED-WEEKDAY CONCEPT · SPECIFIC DAYS NOT MODELLED");
  const todayExercises = page.locator(".today-exercises > li");
  await expect(todayExercises.nth(0).locator("span").first()).toHaveText("01");
  await expect(todayExercises.nth(0)).toContainText("Chest-supported row");
  await expect(todayExercises.nth(1).locator("span").first()).toHaveText("02");
  await expect(todayExercises.nth(1)).toContainText("Barbell bench press");
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await expect(page.getByRole("heading", { name: "Chest-supported row", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("No comparable set sample exists");
  await expect(page.getByTestId("screen-active")).toContainText("No observations are prefilled or recorded");

  await page.getByRole("button", { name: /^Plans$/i }).click();
  await expect(page.getByRole("textbox", { name: /Programme name/i })).toHaveValue("Three-day strength rotation");
  await expect(page.getByRole("radio", { name: /Fixed weekdays/i })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("list", { name: /Upper A exercises/i }).getByRole("listitem").first()).toContainText("Chest-supported row");
  await expect(page.getByRole("list", { name: /Upper A exercises/i })).toContainText("4 × 5");
});

test("Today never presents a static template duration as recalculated after a programme edit", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await page.getByRole("button", { name: /Edit Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("2 × 6–10");
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await expect(page.getByTestId("screen-today")).toContainText("duration not modelled in this prototype");
  await expect(page.getByTestId("screen-today")).not.toContainText("45–60 min");
  await expect(page.getByTestId("screen-today")).toContainText("SAMPLE DATE · THURSDAY");
  await expect(page.getByTestId("screen-today")).toContainText("Lower A · sample prior fixture · 3 days ago");
});

test("programme editor bottom navigation preserves, publishes or discards a valid draft deliberately", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();

  await page.getByRole("textbox", { name: /Programme name/i }).fill("Guarded rotation");
  await page.getByRole("button", { name: /Edit Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("4 × 5");
  const historyNavigation = page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^History$/i });
  await dismissPrototypeKeyboard(page);
  await historyNavigation.click();
  await expect(page.getByText("Save this programme before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Keep editing/i }).click();
  await expect(page.getByTestId("screen-programme-editor")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Target sets and reps/i })).toHaveValue("4 × 5");

  await historyNavigation.click();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByTestId("screen-history")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Programme changes published before leaving");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await expect(page.getByRole("textbox", { name: /Programme name/i })).toHaveValue("Guarded rotation");
  await expect(page.getByRole("list", { name: /Upper A exercises/i })).toContainText("4 × 5");

  await page.getByRole("textbox", { name: /Programme name/i }).fill("Discarded name");
  await dismissPrototypeKeyboard(page);
  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^History$/i }).click();
  await page.getByRole("button", { name: /Discard changes/i }).click();
  await expect(page.getByTestId("screen-history")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Unpublished programme draft discarded");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await expect(page.getByRole("textbox", { name: /Programme name/i })).toHaveValue("Guarded rotation");
});

test("an edited first-exercise prescription does not reuse an incompatible set fixture", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await page.getByRole("button", { name: /Edit Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Target sets and reps/i }).fill("4 × 5");
  await page.getByRole("button", { name: /Save exercise edit/i }).click();
  await page.getByRole("button", { name: /Publish new version/i }).click();

  await expect(page.locator(".today-exercises > li").first()).toContainText("Barbell bench press");
  await expect(page.locator(".today-exercises > li").first()).toContainText("4 × 5");
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Target 5 reps · 4 working sets");
  await expect(page.getByTestId("screen-active")).toContainText("No comparable set sample exists");
  await expect(page.locator(".set-ledger")).toHaveCount(0);
  await expect(page.locator(".active-set-dock")).toHaveCount(0);

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("0 working sets");
  await expect(page.getByTestId("screen-complete")).toContainText("0 / 16 sets");
  await expect(page.locator(".completion-highlight")).toContainText("NO SETS RECORDED");
  await expect(page.locator(".recommendation-copy")).toContainText("No working sets were recorded for Barbell bench press");
  await expect(page.locator(".recommendation-copy")).not.toContainText("fourth planned");
});

test("set entry validates direct numeric drafts and offers deliberate restoration", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Set entry/i }).click();

  const weightInput = page.getByRole("textbox", { name: /weight/i });
  const repsInput = page.getByRole("textbox", { name: /^reps$/i });
  const saveButton = page.getByRole("button", { name: /Update sample set fixture/i });
  await expect(page.getByRole("note")).toContainText("STATIC SET-ENTRY REVIEW STATE");
  await expect(weightInput).toHaveAttribute("inputmode", "decimal");
  await expect(repsInput).toHaveAttribute("inputmode", "numeric");

  await weightInput.fill("not-a-number");
  await expect(weightInput).toHaveAttribute("aria-invalid", "true");
  const weightError = page.getByText("Enter a valid weight", { exact: true });
  await expect(weightError).toBeVisible();
  await expect(weightError).toHaveAttribute("aria-live", "polite");
  await expect(saveButton).toBeDisabled();
  await weightInput.press("Tab");
  await expect(weightInput).toHaveValue("not-a-number");
  await page.getByRole("button", { name: /^Restore 100$/i }).click();
  await expect(weightInput).toHaveValue("100");
  await expect(page.getByText("Restored last valid value: 100", { exact: true })).toBeVisible();

  await weightInput.fill("-2.5");
  await expect(page.getByText("Weight must be zero or greater", { exact: true })).toBeVisible();
  await expect(saveButton).toBeDisabled();
  await page.getByRole("button", { name: /^Restore 100$/i }).click();

  await repsInput.fill("8.5");
  await expect(repsInput).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Reps must be a whole number", { exact: true })).toBeVisible();
  await expect(saveButton).toBeDisabled();
  await repsInput.fill("-1");
  await expect(page.getByText("Reps must be at least 1 for a normal set", { exact: true })).toBeVisible();
  await expect(saveButton).toBeDisabled();
  await repsInput.fill("0");
  await expect(page.getByText("Reps must be at least 1 for a normal set", { exact: true })).toBeVisible();
  await expect(saveButton).toBeDisabled();
  await repsInput.fill("8");
  await repsInput.press("Tab");
  await expect(saveButton).toBeEnabled();
  for (let increase = 0; increase < 2; increase += 1) {
    await page.getByRole("button", { name: /^Increase RIR$/i }).click();
  }
  await expect(page.getByLabel("Current RIR: 1")).toBeVisible();
  await page.getByRole("button", { name: /Do not record RIR/i }).click();
  await expect(page.getByLabel("Current RIR: not recorded")).toBeVisible();

  await weightInput.fill("105,0");
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await expect(weightInput).toHaveValue("107.5");
});

test("set-entry bottom navigation keeps or saves a valid draft deliberately", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Set entry/i }).click();
  await page.getByRole("textbox", { name: /weight/i }).fill("107.5");

  const historyNavigation = page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^History$/i });
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /Review all three directions/i }).click();
  await expect(page.getByText("Update this sample set before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Keep editing/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("107.5");
  await expect(page.getByRole("main", { name: "Set entry screen" })).toBeFocused();

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /Review all three directions/i }).click();
  await expect(page.getByText("Update this sample set before leaving?", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("main", { name: "Set entry screen" })).toBeFocused();
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("107.5");

  await historyNavigation.click();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByTestId("screen-history")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Sample set 4 fixture updated before leaving · no workout record created");
  await expect(page.getByRole("button", { name: /TODAY · JUST RECORDED/i })).toHaveCount(0);
  await page.waitForTimeout(350);
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 4: 107.5 kilograms, 8 reps, RIR not recorded/i })).toBeVisible();
});

test("completed working sets open and persist an honest editable set state", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

  await expect(page.locator(".last-performance")).toContainText("100 kg × 8 reps");
  await page.getByRole("button", { name: /Edit completed set 3: 100 kilograms, 8 reps, RIR 1/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Update set$/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 3: 102.5 kilograms, 8 reps, RIR 1/i })).toBeVisible();
  await expect(page.locator(".last-performance")).toContainText("100 kg × 8 reps");

  await page.getByRole("button", { name: /Edit completed set 2: 100 kilograms, 8 reps, RIR 2/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toContainText("SET 2 OF 4");
  await expect(page.getByRole("heading", { name: /Edit completed set 2/i })).toBeVisible();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /Increase reps/i }).click();
  await page.getByRole("button", { name: /Increase reps/i }).click();
  await page.getByRole("button", { name: /^Update set$/i }).click();
  await expect(page.locator(".save-toast")).toContainText("Set 2 updated in prototype state · 102.5 kg × 10");
  await expect(page.getByRole("button", { name: /Edit completed set 2: 102.5 kilograms, 10 reps, RIR 2/i })).toBeVisible();

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("start from Today before recording a completion");
});

test("runtime completion records the set observation without inferring a rep best", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Open set 4: 100 kilograms, 8 reps, RIR not recorded/i }).click();
  await page.getByRole("textbox", { name: /^reps$/i }).fill("10");
  await page.getByRole("button", { name: /^Log set$/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByText("Review incomplete workout", { exact: true })).toBeVisible();
  const dispositionChoices = page.getByRole("radiogroup", { name: "Remaining-work disposition" }).getByRole("radio");
  await expect(dispositionChoices).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    expect((await dispositionChoices.nth(index).boundingBox())?.height).toBeGreaterThanOrEqual(48);
  }
  await page.getByRole("button", { name: /Finish partial workout/i }).click();

  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 100 kg × 10");
  await expect(page.locator(".completion-highlight")).toContainText("observed prototype value");
  await expect(page.locator(".completion-highlight")).not.toContainText("NEW REP BEST");
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("Finish atomically records partial work, attribution, disposition, history and the next cursor", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await page.getByRole("textbox", { name: /Private exercise note/i }).fill("Keep elbows tucked.");
  await page.getByRole("button", { name: /Save exercise note in prototype/i }).click();
  await page.getByRole("button", { name: /Close exercise note/i }).click();
  await page.getByRole("button", { name: /Log set 1/i }).click();

  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Choose Dumbbell bench press/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("1 previously recorded set remains attributed to Barbell bench press");

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByText("Review incomplete workout", { exact: true })).toBeVisible();
  await expect(page.getByText(/1 set is recorded and 15 planned sets are not attempted/i)).toBeVisible();
  await expect(page.locator(".sheet-description")).toContainText("Recorded sets remain attributed to Barbell bench press");
  await page.getByRole("radio", { name: /Add prototype carry-forward reminder/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();

  const completion = page.getByTestId("screen-complete");
  await expect(completion).toContainText("1 / 16 sets");
  await expect(completion).toContainText("15 planned working sets not attempted");
  await expect(completion).toContainText("Prototype review reminder only · no sets copied or scheduled");
  await expect(completion).toContainText("Duration not modelled in this prototype");
  await expect(completion).not.toContainText("52 minutes");
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press");
  await expect(page.locator(".completion-highlight")).not.toContainText("Dumbbell bench press");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*History$/i }).click();
  const justRecorded = page.getByRole("button", { name: /Open Upper A from TODAY · JUST RECORDED/i });
  await expect(justRecorded).toBeVisible();
  await expect(justRecorded).toContainText("1 recorded set");
  await expect(justRecorded).not.toContainText("Sample");
  await justRecorded.click();
  const runtimeRecord = page.getByRole("region", { name: /Upper A session details from TODAY · JUST RECORDED/i });
  await expect(runtimeRecord).toContainText("Partial workout record");
  await expect(runtimeRecord).toContainText("Duration not modelled · 1 recorded working set");
  await expect(runtimeRecord).toContainText("Barbell bench press");
  await expect(runtimeRecord).toContainText("Keep elbows tucked.");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await expect(page.getByRole("heading", { name: "Lower A", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-today")).toContainText("One-time follow-up recorded");
  await expect(page.getByTestId("screen-today")).toContainText("No work has been copied or scheduled");
  await page.getByRole("button", { name: /Start Lower A/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("No sets recorded yet");
  await expect(page.locator(".set-row.is-complete")).toHaveCount(0);
  await page.getByRole("button", { name: /Add exercise note for Back squat/i }).click();
  await expect(page.getByRole("textbox", { name: /Private exercise note/i })).toHaveValue("");
});

test("empty substitution search has no actionable top-match fallback", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Exercise substitution/i }).click();

  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("no-listed-exercise");
  await expect(page.getByText("No listed match. Try a broader name.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /No listed match to use/i })).toBeDisabled();
  await expect(page.getByTestId("screen-substitution")).toBeVisible();
});

test("substitution scope changes today only when explicitly selected", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Use top match.*today only/i }).click();
  await expect(page.getByRole("heading", { name: "Chest press machine", exact: true })).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("selected for today only");
  await expect(page.getByTestId("screen-active")).toContainText("3 previously recorded sets remain attributed to Barbell bench press");
  await expect(page.getByTestId("screen-active")).toContainText("No sets for Chest press machine have been entered");
  await expect(page.locator(".set-ledger")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Future programme/i }).click();
  const futureTopMatch = page.getByRole("button", { name: /Use top match.*new programme version/i });
  await futureTopMatch.click();
  const futureConfirmation = page.getByRole("region", { name: /Confirm future programme substitution/i });
  await expect(futureConfirmation).toBeFocused();
  await expect(futureConfirmation).toContainText("next not-started Upper A occurrence");
  await expect(futureConfirmation).toContainText("Reason retained: No reason provided");
  await expect(futureConfirmation).toContainText("Preserved: set and rep target 4 × 6–10");
  await expect(futureConfirmation).toContainText("Cleared: no planned load is migrated");
  await expect(futureConfirmation).toContainText("equipment metadata follows");
  await futureConfirmation.getByRole("button", { name: /Cancel future change/i }).click();
  await expect(futureTopMatch).toBeFocused();
  await futureTopMatch.click();
  await page.getByRole("region", { name: /Confirm future programme substitution/i }).getByRole("button", { name: /Confirm future programme change/i }).click();
  await expect(page.getByRole("heading", { name: "Barbell bench press", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("Target 6–10 reps");
  await expect(page.getByTestId("screen-active")).toContainText("100 kg × 8 reps");
  await expect(page.locator(".save-toast")).toContainText("next not-started Upper A occurrence");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await expect(page.getByRole("list", { name: /Upper A exercises/i }).getByRole("listitem").first()).toContainText("Chest press machine");
});

test("repeated today-only substitution stays in the original movement family", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await page.getByRole("button", { name: /Start Lower A/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Choose Goblet squat/i }).click();
  await expect(page.getByRole("heading", { name: "Goblet squat", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Choose another replacement/i }).click();

  await expect(page.locator(".substitution-origin")).toContainText("Goblet squat");
  await expect(page.locator(".substitution-origin")).toContainText("original planned movement: Back squat");
  await expect(page.getByText("Hack squat machine", { exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-substitution")).not.toContainText("Dumbbell bench press");
});

test("unplanned completion preserves the expected programme sequence", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today/i }).click();
  await page.getByRole("button", { name: /Start unplanned workout/i }).click();
  await expect(page.locator(".save-toast")).toContainText("programme sequence unchanged");
  await expect(page.getByTestId("screen-active")).toContainText("Unplanned Upper A repeat");
  await expect(page.getByTestId("screen-active")).toContainText("does not count as the expected occurrence");
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("programme sequence stays unchanged");
  await expect(page.locator(".completion-summary")).toContainText("Next in sequence");
  await expect(page.locator(".completion-summary")).toContainText("Upper A");
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await expect(page.getByRole("heading", { name: "Upper A", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start Upper A/i })).toBeVisible();
});

test("Field Kit and Open Pace active controls preserve their distinct quick-save models", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Field Kit/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await expect(page.getByLabel("Current active RIR: not recorded")).toBeVisible();
  await page.getByRole("button", { name: /Increase active RIR/i }).click();
  await page.getByRole("button", { name: /Do not record active RIR/i }).click();
  await expect(page.getByLabel("Current active RIR: not recorded")).toBeVisible();
  await page.getByRole("button", { name: /Increase active weight/i }).click();
  for (let decrement = 0; decrement < 10; decrement += 1) {
    await page.getByRole("button", { name: /Decrease active reps/i }).click();
  }
  await page.getByRole("button", { name: /Pause/i }).click();
  await expect(page.getByRole("button", { name: /Resume/i })).toBeVisible();
  const fieldTimer = page.locator(".field-rest-row > span");
  const pausedTimerText = await fieldTimer.textContent();
  await page.waitForTimeout(1_100);
  await expect(fieldTimer).toHaveText(pausedTimerText ?? "");
  await page.getByRole("button", { name: /Resume/i }).click();
  await page.waitForTimeout(1_100);
  await expect(fieldTimer).not.toHaveText(pausedTimerText ?? "");
  await page.getByRole("button", { name: /Complete set 4/i }).click();
  await expect(page.locator(".save-toast")).toContainText("102.5 kg × 1");
  await expect(page.getByRole("button", { name: /SET 4 SAVED/i })).toBeDisabled();
  await page.getByRole("button", { name: /Decrease active reps/i }).click();
  await expect(page.getByRole("button", { name: /SET 4 SAVED/i })).toBeVisible();
  await page.getByRole("button", { name: /Increase active weight/i }).click();
  await expect(page.getByRole("button", { name: /Complete set 4/i })).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("save again");
  await page.getByRole("button", { name: /Complete set 4/i }).click();
  await expect(page.locator(".save-toast")).toContainText("105 kg × 1");

  await page.reload();
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await expect(page.getByLabel("Current active RIR: not recorded")).toBeVisible();
  await expect(page.getByLabel(/Exercise progress: exercise 1 of 5 is current/i).locator(".is-current")).toHaveText("1");
  await expect(page.getByTestId("screen-active")).not.toContainText("Keep shoulder blades down and back");
  for (let decrement = 0; decrement < 10; decrement += 1) {
    await page.getByRole("button", { name: /Decrease active reps/i }).click();
  }
  await page.getByRole("button", { name: /Save set 4/i }).click();
  await expect(page.locator(".save-toast")).toContainText("100 kg × 1");
  await page.getByRole("button", { name: /Decrease active reps/i }).click();
  await expect(page.getByRole("button", { name: /Set 4 saved/i })).toBeDisabled();
  await page.getByRole("button", { name: /Increase active reps/i }).click();
  await expect(page.getByRole("button", { name: /Save set 4/i })).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("save again");
  await page.getByRole("button", { name: /Save set 4/i }).click();
  await expect(page.locator(".save-toast")).toContainText("100 kg × 2");
  await page.getByRole("button", { name: /Go to Chest-supported row/i }).click();
  await expect(page.getByRole("heading", { name: "Chest-supported row", exact: true })).toBeVisible();
  await expect(page.getByText(/Current focus · set entry is outside this ten-screen review state/i)).toBeVisible();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Review-only active fixture · start from Today before recording a completion");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*History$/i }).click();
  await expect(page.getByRole("button", { name: /TODAY · JUST RECORDED/i })).toHaveCount(0);
});

test("Open Pace shows the published target range for Upper B", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  for (let completedWorkout = 0; completedWorkout < 2; completedWorkout += 1) {
    await page.getByRole("button", { name: /^Start (Upper A|Lower A)$/i }).click();
    await page.getByRole("button", { name: /Finish workout/i }).click();
    await page.getByRole("button", { name: /Finish partial workout/i }).click();
    await page.getByRole("button", { name: /Return to Today/i }).click();
  }
  await expect(page.getByRole("heading", { name: "Upper B", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Start Upper B/i }).click();
  await expect(page.locator(".pace-set-list > button.is-current")).toContainText("8–12");
  await expect(page.locator(".pace-set-list > button.is-current")).not.toContainText("6–10");
});

test("an in-progress workout resumes without resetting edited set state", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Open set 1: 10 reps at 95 kilograms/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Save set$/i }).click();
  await page.getByRole("button", { name: /Pause/i }).click();
  await page.getByRole("navigation", { name: /Open Pace/i }).getByRole("button", { name: /^Today$/i }).click();

  await expect(page.getByRole("button", { name: /Continue Upper A/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start unplanned workout/i })).toHaveCount(0);
  await page.getByRole("button", { name: /Continue Upper A/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 1: 10 reps at 97.5 kilograms/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 100 kilograms; current draft/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Resume/i })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Open set 1: 95 kilograms, 10 reps, RIR 2; current draft/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Log set$/i }).click();
  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^Plans$/i }).click();
  await expect(page.getByTestId("screen-programme-editor")).toBeVisible();
  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^Continue$/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 1: 97.5 kilograms, 10 reps, RIR 2/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open set 2: 100 kilograms, 8 reps, RIR 2; current draft/i })).toBeVisible();
});

test("a real workout keeps rest idle until a set is saved and continues timing while Active is unmounted", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await expect(page.getByLabel("Rest timer idle: start manually or save a set")).toBeVisible();
  await expect(page.getByRole("button", { name: /Start 90s rest/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Pause/i })).toHaveCount(0);
  await page.getByRole("button", { name: /^Save set 1$/i }).click();
  const timer = page.locator(".pace-rest-card strong");
  const beforeLeaving = await timer.textContent();
  await page.getByRole("navigation", { name: /Open Pace/i }).getByRole("button", { name: /^Today$/i }).click();
  await page.waitForTimeout(1_200);
  await page.getByRole("button", { name: /Continue Upper A/i }).click();
  await expect(timer).not.toHaveText(beforeLeaving ?? "");
});

test("Tempo rest controls expose minus 30, announce expiry, and never advance workout state", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /^Log set 1$/i }).click();

  const timer = page.locator(".rest-rail");
  const decrease = timer.getByRole("button", { name: /−30s/i });
  await expect(decrease).toBeVisible();
  expect((await decrease.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  await decrease.click();
  await decrease.click();
  await decrease.click();
  await expect(timer.getByRole("status")).toHaveText("REST COMPLETE");
  await expect(timer.getByRole("button", { name: /Restart 90s/i })).toBeVisible();
  await expect(timer.getByRole("button", { name: /Dismiss rest/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open set 2: 100 kilograms, 8 reps, RIR 2; current draft/i })).toBeVisible();

  await timer.getByRole("button", { name: /Restart 90s/i }).click();
  await expect(timer).toContainText("RESTING");
  await timer.getByRole("button", { name: /Dismiss rest/i }).click();
  await expect(page.getByLabel("Rest timer idle: start manually or save a set")).toBeVisible();
  await page.getByRole("button", { name: /Start 90s rest/i }).click();
  await expect(timer).toContainText("01:30");
});

test("rest controls remain available through a today replacement and the next-exercise branch", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /^Save set 1$/i }).click();
  await page.getByRole("button", { name: /Exercise options/i }).click();
  await page.getByRole("button", { name: /Choose Dumbbell bench press/i }).click();
  await expect(page.getByLabel(/rest timer:/i).getByRole("button", { name: /−30s/i })).toBeVisible();

  await page.getByRole("button", { name: /Return to Barbell bench press/i }).click();
  await page.getByRole("button", { name: /^Save set 2$/i }).click();
  await page.getByRole("button", { name: /^Save set 3$/i }).click();
  await page.getByRole("button", { name: /^Save set 4$/i }).click();
  await page.getByRole("button", { name: /Go to Chest-supported row/i }).click();
  await expect(page.getByRole("heading", { name: "Chest-supported row", exact: true })).toBeVisible();
  await expect(page.getByLabel(/rest timer:/i).getByRole("button", { name: /−30s/i })).toBeVisible();
});

test("recommitting a saved set correction neither auto-advances nor restarts a paused timer", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /^Save set 1$/i }).click();
  await page.getByRole("button", { name: /Pause/i }).click();

  await page.getByRole("button", { name: /Edit completed set 1: 10 reps at 95 kilograms/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Increase active weight/i }).click();
  await page.getByRole("button", { name: /^Save set 1$/i }).click();
  await expect(page.getByRole("button", { name: /^Set 1 saved$/i })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Resume/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 100 kilograms; planned draft/i })).toBeVisible();

  await page.getByRole("button", { name: /Edit completed set 1: 10 reps at 97.5 kilograms/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Update set$/i }).click();
  await expect(page.getByRole("button", { name: /^Set 1 saved$/i })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Resume/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 100 kilograms; planned draft/i })).toBeVisible();
});

test("dirty exercise notes guard set entry and Finish without silently discarding text", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  const note = page.getByRole("textbox", { name: /Private exercise note/i });
  await note.fill("Persist this setup cue.");
  await page.getByRole("button", { name: /Open set 1:/i }).click();
  await expect(page.getByText("Save exercise note before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Keep editing/i }).click();
  await expect(note).toHaveValue("Persist this setup cue.");

  await page.getByRole("button", { name: /Open set 1:/i }).click();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Exercise note for Barbell bench press saved before leaving");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await expect(page.getByRole("textbox", { name: /Private exercise note/i })).toHaveValue("Persist this setup cue.");
  await page.getByRole("textbox", { name: /Private exercise note/i }).fill("Discard only this revised draft.");
  await page.getByRole("button", { name: /Close exercise note/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByText("Save exercise note before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Discard changes/i }).click();
  await expect(page.getByText("Review incomplete workout", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Keep training/i }).click();
  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await expect(page.getByRole("textbox", { name: /Private exercise note/i })).toHaveValue("Persist this setup cue.");
});

test("completion note guard saves into History and the History exit is direct", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();

  await page.getByRole("button", { name: /Add a private workout note/i }).click();
  await page.getByRole("textbox", { name: /Private workout note/i }).fill("Session ended early for time.");
  await page.getByRole("button", { name: /View recorded workout in History/i }).click();
  await expect(page.getByText("Save workout note before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByTestId("screen-history")).toBeVisible();
  await page.getByRole("button", { name: /Open Upper A from TODAY · JUST RECORDED/i }).click();
  await expect(page.getByRole("region", { name: /Private workout note/i })).toContainText("Session ended early for time.");
});

test("review-only Completion Done is navigation-only and preserves an active occurrence", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("COMPLETE SAMPLE");
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await expect(page.getByRole("heading", { name: "Upper A", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue Upper A/i })).toBeVisible();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*History$/i }).click();
  await expect(page.getByRole("button", { name: /TODAY · JUST RECORDED/i })).toHaveCount(0);
});

test("selecting the current runtime Completion from the screen index preserves its unsaved note and source", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await page.getByRole("button", { name: /Add a private workout note/i }).click();
  const note = page.getByRole("textbox", { name: /Private workout note/i });
  await note.fill("Keep this unsaved runtime note.");
  await dismissPrototypeKeyboard(page);

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("FINISHED PARTIAL");
  await expect(page.getByTestId("screen-complete")).not.toContainText("COMPLETE SAMPLE");
  await expect(note).toHaveValue("Keep this unsaved runtime note.");
});

test("a recorded custom Set 4 survives other-set edits and reaches the completion snapshot", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await page.getByRole("button", { name: /Open set 4: 100 kilograms, 8 reps, RIR not recorded; planned draft/i }).click();
  await page.getByRole("textbox", { name: /weight/i }).fill("107.5");
  await page.getByRole("button", { name: /^Log set$/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 4: 107.5 kilograms, 8 reps/i })).toBeVisible();

  await page.getByRole("button", { name: /Open set 1: 95 kilograms, 10 reps, RIR 2; planned draft/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Log set$/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 4: 107.5 kilograms, 8 reps/i })).toBeVisible();

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.locator(".completion-highlight")).toContainText("LAST SAVED SET IN WORKOUT ORDER");
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 107.5 kg × 8");
  await expect(page.getByTestId("screen-complete")).toContainText("2 / 16 sets");
});

test("retained per-set drafts survive switching, auto-advance, and a reversible today replacement", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await page.getByRole("button", { name: /Open set 2: 8 reps at 100 kilograms; planned draft/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Increase active weight/i }).click();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 102.5 kilograms; current draft/i })).toBeVisible();

  await page.getByRole("button", { name: /Open set 1: 10 reps at 95 kilograms; planned draft/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /^Save set 1$/i }).click();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 102.5 kilograms; current draft/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Save set 2$/i })).toBeEnabled();

  await page.getByRole("button", { name: /Exercise options/i }).click();
  await page.getByRole("button", { name: /Choose Dumbbell bench press/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Unrecorded set drafts remain attached to Barbell bench press and are recoverable by returning to it");
  await page.getByRole("button", { name: /Add exercise note for Dumbbell bench press/i }).click();
  const replacementNote = page.getByRole("textbox", { name: /Private exercise note/i });
  await replacementNote.fill("Keep this replacement cue.");
  const returnToOriginal = page.getByRole("button", { name: /Return to Barbell bench press/i });
  await returnToOriginal.click();
  await expect(page.getByText("Save exercise note before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Keep editing/i }).click();
  await expect(returnToOriginal).toBeFocused();
  await expect(replacementNote).toHaveValue("Keep this replacement cue.");
  await returnToOriginal.click();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByTestId("screen-active")).toBeFocused();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 102.5 kilograms; current draft/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Save set 2$/i })).toBeEnabled();
  await page.getByRole("button", { name: /Exercise options/i }).click();
  await page.getByRole("button", { name: /Choose Dumbbell bench press/i }).click();
  await page.getByRole("button", { name: /Add exercise note for Dumbbell bench press/i }).click();
  await expect(page.getByRole("textbox", { name: /Private exercise note/i })).toHaveValue("Keep this replacement cue.");
});

test("Field Kit Previous set uses the nearest saved predecessor, not a later out-of-order set", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Field Kit/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await page.getByRole("button", { name: /Open set 4: 100 kilograms, 8 reps; planned draft/i }).click();
  await page.getByRole("button", { name: /^Complete set$/i }).click();
  await page.getByRole("button", { name: /Open set 1: 95 kilograms, 10 reps; planned draft/i }).click();
  await page.getByRole("button", { name: /^Complete set$/i }).click();

  const previousSet = page.locator(".field-previous-set");
  await expect(previousSet).toContainText("95 kg");
  await expect(previousSet).toContainText("10");
  await expect(previousSet).not.toContainText("100 kg");
});

test("future substitution after a today-only replacement names the original programme slot", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Choose Chest press machine/i }).click();
  await expect(page.getByRole("heading", { name: "Chest press machine", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Choose another replacement/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("dumbbell");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  const confirmation = page.getByRole("region", { name: /Confirm future programme substitution/i });
  await expect(confirmation).toContainText("Current active workout: Chest press machine remains unchanged");
  await expect(confirmation).toContainText("replace Barbell bench press with Dumbbell bench press");
  await expect(confirmation).not.toContainText("replace Chest press machine with Dumbbell bench press");
  await confirmation.getByRole("button", { name: /Confirm future programme change/i }).click();
  await expect(page.getByRole("heading", { name: "Chest press machine", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("Barbell bench press becomes Dumbbell bench press");
  await expect(page.getByTestId("screen-active")).toContainText("Current active workout (Chest press machine) is unchanged");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await expect(page.getByRole("list", { name: /Upper A exercises/i }).getByRole("listitem").first()).toContainText("Dumbbell bench press");
});

test("a second future substitution names the latest published programme slot", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  await page.getByRole("region", { name: /Confirm future programme substitution/i }).getByRole("button", { name: /Confirm future programme change/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Barbell bench press becomes Chest press machine");

  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("dumbbell");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  const secondConfirmation = page.getByRole("region", { name: /Confirm future programme substitution/i });
  await expect(secondConfirmation).toContainText("replace Chest press machine with Dumbbell bench press");
  await expect(secondConfirmation).not.toContainText("replace Barbell bench press with Dumbbell bench press");
  await secondConfirmation.getByRole("button", { name: /Confirm future programme change/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Chest press machine becomes Dumbbell bench press");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await expect(page.getByRole("list", { name: /Upper A exercises/i }).getByRole("listitem").first()).toContainText("Dumbbell bench press");
});

test("future substitution follows the active exercise identity across a published reorder", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^Plans$/i }).click();
  await page.getByRole("button", { name: /Move Chest-supported row up/i }).click();
  await page.getByRole("button", { name: /Publish new version/i }).click();
  await page.getByRole("button", { name: /Continue Upper A/i }).click();
  await expect(page.getByRole("heading", { name: "Barbell bench press", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("dumbbell");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  const confirmation = page.getByRole("region", { name: /Confirm future programme substitution/i });
  await expect(confirmation).toContainText("replace Barbell bench press with Dumbbell bench press");
  await confirmation.getByRole("button", { name: /Confirm future programme change/i }).click();

  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^Plans$/i }).click();
  const publishedUpperA = page.getByRole("list", { name: /Upper A exercises/i }).getByRole("listitem");
  await expect(publishedUpperA.nth(0)).toContainText("Chest-supported row");
  await expect(publishedUpperA.nth(1)).toContainText("Dumbbell bench press");
  await expect(publishedUpperA.nth(0)).not.toContainText("Dumbbell bench press");
});

test("a new workout clears the prior active session future-version notice", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Exercise options/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("dumbbell");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  await page.getByRole("region", { name: /Confirm future programme substitution/i }).getByRole("button", { name: /Confirm future programme change/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Next not-started Upper A occurrence");

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await page.getByRole("button", { name: /Start Lower A/i }).click();
  await expect(page.getByRole("heading", { name: "Back squat", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).not.toContainText("Next not-started Upper A occurrence");
});

test("completion and History exclude a saved set after its inline values become an unsaved draft", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /^Save set 1$/i }).click();
  await page.getByRole("button", { name: /^Save set 2$/i }).click();

  await page.getByRole("button", { name: /Edit completed set 2: 8 reps at 100 kilograms/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Increase active weight/i }).click();
  await expect(page.getByRole("button", { name: /Open set 2: 8 reps at 102.5 kilograms; current draft/i })).toBeVisible();

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 95 kg × 10");
  await expect(page.getByTestId("screen-complete")).toContainText("1 / 16 sets");
  await page.getByRole("button", { name: /View recorded workout in History/i }).click();
  await page.getByRole("button", { name: /Open Upper A from TODAY · JUST RECORDED/i }).click();
  await expect(page.getByRole("region", { name: /Upper A session details from TODAY · JUST RECORDED/i })).toContainText("1 recorded set · last saved set in workout order 95 kg × 10");
});

test("runtime completion stays observation-only when an earlier set looks stronger than the final saved set", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();

  await page.getByRole("button", { name: /Open set 1:/i }).click();
  await page.getByRole("textbox", { name: /weight/i }).fill("100");
  await page.getByRole("button", { name: /^Save set$/i }).click();
  await page.getByRole("button", { name: /Decrease active weight/i }).click();
  await page.getByRole("button", { name: /Decrease active weight/i }).click();
  await page.getByRole("button", { name: /^Save set 2$/i }).click();

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 95 kg × 8");
  await expect(page.locator(".completion-highlight")).toContainText("observed prototype value");
  await expect(page.getByTestId("screen-complete")).not.toContainText("NEW REP BEST");
});

test("replacement attribution never claims sets for a zero-set exercise", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today$/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Choose Dumbbell bench press/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("No sets were recorded for Barbell bench press before this replacement");
  await expect(page.getByTestId("screen-active")).not.toContainText("previously recorded");

  await page.reload();
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Log set 4/i }).click();
  await page.getByRole("button", { name: /Go to Chest-supported row/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Choose Seated cable row/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("No sets were recorded for Chest-supported row before this replacement");
  await expect(page.getByTestId("screen-active")).not.toContainText("4 previously recorded sets");
});

test("closing History search clears an otherwise hidden filter", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*History$/i }).click();
  const searchToggle = page.getByRole("button", { name: /Search history/i });
  await searchToggle.click();
  await page.getByRole("textbox", { name: /Search workout history/i }).fill("no matching workout");
  await expect(page.getByText("No workout matches that search.", { exact: true })).toBeVisible();
  await searchToggle.click();
  await expect(searchToggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".history-list > button")).toHaveCount(4);
});

test("History visibly separates sample fixtures from recorded sessions and derives shown month counts", async ({ page }) => {
  await page.goto("/?review=legacy");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*History$/i }).click();

  const monthStrip = page.locator(".month-strip");
  await expect(monthStrip).toContainText("AUGUST2 shown");
  await expect(monthStrip).toContainText("JULY2 shown");
  await expect(monthStrip).toContainText("JUNE0 shown");
  await expect(page.getByText(/Static dated rows are prototype samples/i)).toBeVisible();
  const sampleRow = page.getByRole("button", { name: "Open Upper A from THU 06 AUG: sample completed, 16 sets" });
  await expect(sampleRow).toHaveAccessibleName("Open Upper A from THU 06 AUG: sample completed, 16 sets");
  await expect(sampleRow).toContainText("16 sample sets");
  await expect(sampleRow).toContainText("Sample · Completed");
});
