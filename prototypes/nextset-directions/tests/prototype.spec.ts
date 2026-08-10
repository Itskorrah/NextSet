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
    await page.goto("/");
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

test("fixed active controls leave the final workout actions fully reachable", async ({ page }) => {
  test.setTimeout(30_000);
  for (const direction of directions) {
    await page.goto("/");
    await page.getByRole("button", { name: new RegExp(direction, "i") }).click();
    await page.getByRole("button", { name: /open prototype screen index/i }).click();
    await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

    const finalAction = direction === "Open Pace"
      ? page.getByRole("button", { name: /Finish workout/i })
      : page.locator(".screen-active .inline-actions").getByRole("button", { name: /Finish workout/i });
    const scroll = page.locator(".nextset-scroll .mobile-scroll");
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
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await expect(page.getByRole("radiogroup", { name: /Training goal/i }).locator('[aria-checked="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: /Explore without choosing/i }).click();
  await expect(page.getByTestId("screen-programme")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("No training goal selected");
});

test("switching visual directions clears transient prototype state", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();

  await page.getByRole("radio", { name: /Build consistency/i }).click();
  await page.getByRole("button", { name: /Continue to programmes/i }).click();
  await page.getByRole("radio", { name: /Flexible sequence/i }).click();
  await page.getByRole("button", { name: /Use this example in prototype/i }).click();

  await expect(page.getByTestId("screen-today")).toContainText("Upper A");
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await expect(page.getByTestId("screen-active")).toContainText("Barbell bench press");

  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  const exerciseNote = page.getByRole("textbox", { name: /Private exercise note/i });
  await exerciseNote.fill("Keep the setup identical next time.");
  await page.getByRole("button", { name: /Save exercise note in prototype/i }).click();
  await expect(page.getByRole("region", { name: /Exercise note for Barbell bench press/i }).getByRole("status")).toContainText("saved in prototype state");
  await page.getByRole("button", { name: /Close exercise note/i }).click();

  await page.getByRole("button", { name: /Log set 4/i }).click();
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("100 kg × 8");
  await expect(page.getByRole("button", { name: /SET 4 LOGGED/i })).toBeDisabled();
  await page.getByRole("button", { name: /Edit completed set 4: 100 kilograms, 8 reps, RIR not recorded/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toContainText("Edit completed set 4");
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("102.5");
  await page.getByRole("textbox", { name: /weight/i }).fill("105,0");
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("105,0");
  await page.getByRole("button", { name: /^Update set$/i }).click();

  await expect(page.locator(".save-toast")).toContainText("105 kg");
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("105");
  await expect(page.getByRole("region", { name: /Next exercise focus: Chest-supported row/i })).toBeVisible();
  await page.getByRole("button", { name: /Add exercise note for Barbell bench press/i }).click();
  await expect(page.getByRole("textbox", { name: /Private exercise note/i })).toHaveValue("Keep the setup identical next time.");
  await page.getByRole("button", { name: /Close exercise note/i }).click();

  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("button", { name: /Not comfortable/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  await expect(page.locator(".save-toast")).toContainText("next programme version");
  await expect(page.getByRole("heading", { name: "Barbell bench press", exact: true })).toBeVisible();
});

test("progress and completion fixtures respect approved rule boundaries", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Exercise progress/i }).click();
  await expect(page.getByTestId("screen-exercise-progress")).not.toContainText("130 kg");
  await expect(page.getByTestId("screen-exercise-progress")).toContainText("Estimated 1RM stays unavailable");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Workout completion/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("16 working sets");
  await expect(page.getByTestId("screen-complete")).toContainText("all planned work complete");
  await expect(page.getByTestId("screen-complete")).toContainText("16 / 16 sets");
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 100 kg × 9");
  await expect(page.locator(".completion-highlight")).toContainText("One more rep than your previous equivalent session");
  await expect(page.getByTestId("screen-complete")).toContainText("No automatic target change");
});

test("locale draft, history actions and programme editing expose observable state", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();

  const programmeName = page.getByRole("textbox", { name: /Programme name/i });
  await expect(programmeName).toHaveValue("Full body · 3 sessions");
  await programmeName.fill("");
  await page.getByRole("radio", { name: /Fixed weekdays/i }).click();
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

test("programme editor bottom navigation preserves, publishes or discards a valid draft deliberately", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
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
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /\d+\s*Set entry/i }).click();

  const weightInput = page.getByRole("textbox", { name: /weight/i });
  const repsInput = page.getByRole("textbox", { name: /^reps$/i });
  const saveButton = page.getByRole("button", { name: /^Log set$/i });
  await expect(weightInput).toHaveAttribute("inputmode", "decimal");
  await expect(repsInput).toHaveAttribute("inputmode", "numeric");

  await weightInput.fill("not-a-number");
  await expect(weightInput).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a valid weight", { exact: true })).toBeVisible();
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
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Set entry/i }).click();
  await page.getByRole("textbox", { name: /weight/i }).fill("107.5");

  const historyNavigation = page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^History$/i });
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.getByRole("button", { name: /Review all three directions/i }).click();
  await expect(page.getByText("Save this set before leaving?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Keep editing/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /weight/i })).toHaveValue("107.5");

  await historyNavigation.click();
  await page.getByRole("button", { name: /Save changes and leave/i }).click();
  await expect(page.getByTestId("screen-history")).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("Set 4 saved before leaving");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 4: 107.5 kilograms, 8 reps, RIR not recorded/i })).toBeVisible();
});

test("completed working sets open and persist an honest editable set state", async ({ page }) => {
  await page.goto("/");
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
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 102.5 kg × 10");
  await expect(page.locator(".recommendation-copy")).toContainText("2 of 4 Barbell bench press sets reached the top of the target range");
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await page.getByRole("button", { name: /Start Lower A/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 2: 90 kilograms, 8 reps, RIR 2/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /102.5 kilograms/i })).toHaveCount(0);
});

test("completion reports the full rep-best delta from the latest recorded set", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Open set 4: 100 kilograms, 8 reps, RIR not recorded/i }).click();
  await page.getByRole("textbox", { name: /^reps$/i }).fill("10");
  await page.getByRole("button", { name: /^Log set$/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();

  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 100 kg × 10");
  await expect(page.locator(".completion-highlight")).toContainText("2 more reps than your previous equivalent session");
  await expect(page.locator(".completion-highlight")).not.toContainText("One more rep");
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("finishing with an unsaved planned set requires confirmation and records partial counts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();

  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByText("Finish with planned work remaining?", { exact: true })).toBeVisible();
  await expect(page.getByText(/records 3 planned working sets; later work remains incomplete/i)).toBeVisible();
  await expect(page.getByTestId("screen-active")).toBeVisible();
  await page.getByRole("button", { name: /Finish partial workout/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("3 working sets");
  await expect(page.getByTestId("screen-complete")).toContainText("3 / 16 sets");
  await expect(page.getByTestId("screen-complete")).toContainText("13 planned working sets not completed");
  await expect(page.getByTestId("screen-complete")).not.toContainText("all planned work complete");
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await expect(page.getByRole("heading", { name: "Lower A", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Start Lower A/i }).click();
  await expect(page.getByRole("heading", { name: "Back squat", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("Target 6–10 reps");
  await expect(page.getByTestId("screen-active")).toContainText("92.5 kg × 8 reps");
  await page.getByRole("button", { name: /Open set 4: 95 kilograms, 8 reps, RIR not recorded/i }).click();
  await expect(page.getByTestId("screen-set-entry")).toContainText("Starting prototype value: 95 kg × 8");
  await expect(page.getByTestId("screen-set-entry")).toContainText("Why 95 kg?");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await expect(page.getByText("Goblet squat", { exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-substitution")).not.toContainText("Dumbbell bench press");

  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Log set 4/i }).click();
  await page.getByRole("button", { name: /Go to Romanian deadlift/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await expect(page.getByText("Dumbbell Romanian deadlift", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("15 / 15 sets");
  await expect(page.getByTestId("screen-complete")).not.toContainText("NEW REP BEST");
  await expect(page.getByTestId("screen-complete")).toContainText("no target or best-performance claim is made");
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await expect(page.getByRole("heading", { name: "Upper B", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Start Upper B/i }).click();
  await expect(page.getByRole("heading", { name: "Incline dumbbell press", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("Target 8–12 reps");
  await expect(page.getByTestId("screen-active")).toContainText("30 kg × 8 reps");
  await expect(page.locator(".set-row.is-current")).toContainText("8–12");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
  await page.getByRole("button", { name: /Return to Today/i }).click();
  await expect(page.getByRole("heading", { name: "Upper A", exact: true })).toBeVisible();
  await expect(page.locator(".focus-panel")).toContainText("Upper B · just recorded");

  await page.reload();
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Log set 4/i }).click();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.getByTestId("screen-complete")).toContainText("4 working sets");
  await expect(page.getByTestId("screen-complete")).toContainText("4 / 16 sets");
  await expect(page.getByTestId("screen-complete")).toContainText("12 planned working sets not completed");
});

test("empty substitution search has no actionable top-match fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Exercise substitution/i }).click();

  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("no-listed-exercise");
  await expect(page.getByText("No listed match. Try a broader name.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /No listed match to use/i })).toBeDisabled();
  await expect(page.getByTestId("screen-substitution")).toBeVisible();
});

test("substitution scope changes today only when explicitly selected", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Use top match.*today only/i }).click();
  await expect(page.getByRole("heading", { name: "Chest press machine", exact: true })).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("selected for today only");
  await expect(page.getByTestId("screen-active")).toContainText("Previously recorded sets remain attributed to Barbell bench press");
  await expect(page.getByTestId("screen-active")).toContainText("No sets for Chest press machine have been entered");
  await expect(page.locator(".set-ledger")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Active workout/i }).click();
  await page.getByRole("button", { name: /Replace exercise/i }).click();
  await page.getByRole("textbox", { name: /Search the listed alternatives/i }).fill("machine");
  await page.getByRole("button", { name: /Future programme/i }).click();
  await page.getByRole("button", { name: /Use top match.*new programme version/i }).click();
  await expect(page.getByRole("heading", { name: "Barbell bench press", exact: true })).toBeVisible();
  await expect(page.getByTestId("screen-active")).toContainText("Target 6–10 reps");
  await expect(page.getByTestId("screen-active")).toContainText("100 kg × 8 reps");
  await expect(page.locator(".save-toast")).toContainText("next programme version");
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Programme editor/i }).click();
  await expect(page.getByRole("list", { name: /Upper A exercises/i }).getByRole("listitem").first()).toContainText("Chest press machine");
});

test("repeated today-only substitution stays in the original movement family", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
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
  await page.goto("/");
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
  await page.goto("/");
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
  await expect(page.getByRole("button", { name: /SET 4 SAVED/i })).toBeVisible();
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
  await expect(page.getByRole("button", { name: /Set 4 saved/i })).toBeVisible();
  await page.getByRole("button", { name: /Increase active reps/i }).click();
  await expect(page.getByRole("button", { name: /Save set 4/i })).toBeVisible();
  await expect(page.locator(".save-toast")).toContainText("save again");
  await page.getByRole("button", { name: /Save set 4/i }).click();
  await expect(page.locator(".save-toast")).toContainText("100 kg × 2");
  await page.getByRole("button", { name: /Go to Chest-supported row/i }).click();
  await expect(page.getByRole("heading", { name: "Chest-supported row", exact: true })).toBeVisible();
  await expect(page.getByText(/Current focus · set entry is outside this ten-screen review state/i)).toBeVisible();
  await page.getByRole("button", { name: /Finish workout/i }).click();
  await expect(page.locator(".completion-highlight")).toContainText("Barbell bench press · 100 kg × 2");
  await expect(page.locator(".completion-highlight")).not.toContainText("Chest-supported row");
});

test("Open Pace shows the published target range for Upper B", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  for (let completedWorkout = 0; completedWorkout < 2; completedWorkout += 1) {
    await page.getByRole("button", { name: /open prototype screen index/i }).click();
    await page.locator(".screen-index").getByRole("button", { name: /Workout completion/i }).click();
    await page.getByRole("button", { name: /Return to Today/i }).click();
  }
  await expect(page.getByRole("heading", { name: "Upper B", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Start Upper B/i }).click();
  await expect(page.locator(".pace-set-list > button.is-current")).toContainText("8–12");
  await expect(page.locator(".pace-set-list > button.is-current")).not.toContainText("6–10");
});

test("an in-progress workout resumes without resetting edited set state", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Open Pace/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Open set 4: 8 reps at 100 kilograms/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Save set$/i }).click();
  await page.getByRole("button", { name: /Pause/i }).click();
  await page.getByRole("navigation", { name: /Open Pace/i }).getByRole("button", { name: /^Today$/i }).click();

  await expect(page.getByRole("button", { name: /Continue Upper A/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start unplanned workout/i })).toHaveCount(0);
  await page.getByRole("button", { name: /Continue Upper A/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 4: 8 reps at 102.5 kilograms/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Resume/i })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /Tempo Ledger/i }).click();
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  await page.locator(".screen-index").getByRole("button", { name: /^\d+\s*Today/i }).click();
  await page.getByRole("button", { name: /Start Upper A/i }).click();
  await page.getByRole("button", { name: /Open set 4: 100 kilograms, 8 reps, RIR not recorded/i }).click();
  await page.getByRole("button", { name: /Increase weight/i }).click();
  await page.getByRole("button", { name: /^Log set$/i }).click();
  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^Plans$/i }).click();
  await expect(page.getByTestId("screen-programme-editor")).toBeVisible();
  await page.getByRole("navigation", { name: /Tempo Ledger/i }).getByRole("button", { name: /^Continue$/i }).click();
  await expect(page.getByRole("button", { name: /Edit completed set 4: 102.5 kilograms, 8 reps, RIR not recorded/i })).toBeVisible();
});
