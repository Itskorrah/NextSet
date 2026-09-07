import { expect, test, type Page } from "@playwright/test";

const bench = "Barbell bench press";
async function start(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start workout", exact: true }).click();
}
async function addExercise(page: Page, name = bench) {
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
}
async function logSet(page: Page, weight = "60", reps = "8", name = bench) {
  await page.getByRole("button", { name: `Add set for ${name}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Weight (kg)", exact: true }).fill(weight);
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill(reps);
  await page.getByRole("button", { name: "Log set", exact: true }).click();
}
async function finish(page: Page) {
  await page.getByRole("button", { name: "Finish workout", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
}

test("first launch is a blank logger with honest empty history and progress", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("logging-first")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start workout", exact: true })).toBeVisible();
  await expect(page.getByText(/resets on reload/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue to programmes|Use this example/ })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "History", exact: true }).click();
  await expect(page.getByTestId("logging-first")).toContainText(/Your log starts here/i);
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByTestId("logging-first")).toContainText(/Progress starts with a record/i);
});

test("blank start has no prescribed exercises and cannot finish empty", async ({ page }) => {
  await start(page);
  await expect(page.getByRole("button", { name: /Add set for/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Finish workout", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save workout", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await addExercise(page);
  await page.getByRole("button", { name: "Finish workout", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save workout", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
});

test("record, finish, repeat and improve produce genuine comparable history", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page); await finish(page);
  await expect(page.getByTestId("logging-first")).toContainText("60");
  await page.getByRole("button", { name: "Repeat workout", exact: true }).click();
  await page.getByRole("button", { name: "Finish workout", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save workout", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(page.getByRole("button", { name: /Edit set/ })).toHaveCount(0);
  await logSet(page, "65", "8"); await finish(page);
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByTestId("logging-first")).toContainText("65");
  await expect(page.getByTestId("logging-first")).toContainText("60");
  await expect(page.getByTestId("logging-first")).not.toContainText(/suggested target|next target|e1rm/i);
});

test("a populated next set logs in one deliberate action", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page, "60", "8");
  await expect(page.getByRole("button", { name: `Log 60 kg × 8 reps for ${bench}`, exact: true })).toBeVisible();
  await page.getByRole("button", { name: `Log 60 kg × 8 reps for ${bench}`, exact: true }).click();
  await expect(page.getByRole("button", { name: `Edit set 2 for ${bench}`, exact: true })).toContainText("60 kg × 8 reps");
});

test("active workout survives navigating to history and back", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page);
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "History", exact: true }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Workouts", exact: true }).click();
  await page.getByRole("button", { name: "Resume workout", exact: true }).click();
  await expect(page.getByRole("button", { name: `Edit set 1 for ${bench}`, exact: true })).toBeVisible();
});

test("routine start copies structure without copying completion", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page); await finish(page);
  await page.getByRole("button", { name: "Save as routine", exact: true }).click();
  await page.getByRole("textbox", { name: "Routine name", exact: true }).fill("My quick session");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Workouts", exact: true }).click();
  await page.getByRole("button", { name: /Start routine My quick session/ }).click();
  await page.getByRole("button", { name: "Finish workout", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save workout", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(page.getByRole("button", { name: /Edit set/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: `Add set for ${bench}`, exact: true })).toBeVisible();
});

test("negative and fractional reps are rejected while comma decimal load works", async ({ page }) => {
  await start(page); await addExercise(page);
  await page.getByRole("button", { name: `Add set for ${bench}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Weight (kg)", exact: true }).fill("-5");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8.5");
  await page.getByRole("button", { name: "Log set", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("textbox", { name: "Weight (kg)", exact: true }).fill("62,5");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await page.getByRole("button", { name: "Log set", exact: true }).click();
  await expect(page.getByTestId("logging-first")).toContainText("62.5");
});

test("all tabs and primary controls fit the iPhone and Pixel viewports", async ({ page }) => {
  await page.goto("/");
  for (const device of ["iPhone", "Pixel 10"]) {
    if (device === "Pixel 10") {
      await page.getByRole("button", { name: /Preview device: iPhone/ }).click();
      await page.getByRole("menuitemradio", { name: /Pixel 10/ }).click();
    }
    for (const name of ["Workouts", "History", "Progress"]) {
      await page.getByRole("button", { name, exact: true }).click();
      const audit = await page.getByTestId("logging-first").evaluate(root => {
        const phone = root.closest("[data-phone-screen]") as HTMLElement;
        return { overflow: phone.scrollWidth > phone.clientWidth + 1, small: [...root.querySelectorAll("button,input")].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 47.5 || r.height < 47.5); }).map(el => el.textContent) };
      });
      expect(audit).toEqual({ overflow: false, small: [] });
    }
  }
});

test("repeated exercise entries all contribute to progress", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page, "60");
  await addExercise(page);
  await page.getByRole("button", { name: `Add set for ${bench}`, exact: true }).last().click();
  await page.getByRole("textbox", { name: "Weight (kg)", exact: true }).fill("80");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await page.getByRole("button", { name: "Log set", exact: true }).click();
  await finish(page);
  await page.getByRole("navigation").getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.locator(".lf-personal-best")).toContainText("80 kg × 8 reps");
});

test("history correction and reversible deletion recompute descriptive records", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page, "80"); await finish(page);
  await page.getByRole("button", { name: `Edit set 1 for ${bench}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Weight (kg)", exact: true }).fill("50");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("button", { name: /View edits/ })).toBeVisible();
  await page.getByRole("navigation").getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.locator(".lf-personal-best")).toContainText("50 kg × 8 reps");
  await page.getByRole("navigation").getByRole("button", { name: "History", exact: true }).click();
  await page.locator(".lf-history-row").click();
  await page.getByRole("button", { name: "Delete workout", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete workout", exact: true }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.locator(".lf-personal-best")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo deletion", exact: true }).click();
  await expect(page.locator(".lf-personal-best")).toContainText("50 kg × 8 reps");
});

test("cancelled edits retain recorded values and invalid drafts remain editable", async ({ page }) => {
  await start(page); await addExercise(page); await logSet(page);
  await page.getByRole("button", { name: `Edit set 1 for ${bench}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Weight (kg)", exact: true }).fill("100");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Weight (kg)", exact: true })).toHaveValue("100");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Discard changes", exact: true }).click();
  await expect(page.getByRole("button", { name: `Edit set 1 for ${bench}`, exact: true })).toContainText("60 kg");
});

test("bodyweight and timed exercises do not require fictitious weight", async ({ page }) => {
  await start(page); await addExercise(page, "Push-up");
  await page.getByRole("button", { name: "Add set for Push-up", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /Weight/ })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("12");
  await page.getByRole("button", { name: "Log set", exact: true }).click();
  await addExercise(page, "Plank");
  await page.getByRole("button", { name: "Add set for Plank", exact: true }).click();
  await page.getByRole("textbox", { name: "Duration (seconds)", exact: true }).fill("45");
  await page.getByRole("button", { name: "Log set", exact: true }).click();
  await finish(page);
  await expect(page.locator(".lf-detail-exercises")).toContainText("12 reps");
  await expect(page.locator(".lf-detail-exercises")).toContainText("45 sec");
  await expect(page.locator(".lf-detail-exercises")).not.toContainText(" kg");
});

test("changing only reps after switching units preserves the recorded load", async ({ page }) => {
  await start(page); await addExercise(page);
  await page.getByRole("button", { name: "Weight units: kg", exact: true }).click();
  await page.getByRole("button", { name: "Pounds (lb)", exact: true }).click();
  await page.getByRole("button", { name: `Add set for ${bench}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Weight (lb)", exact: true }).fill("1");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await page.getByRole("button", { name: "Log set", exact: true }).click();
  await page.getByRole("button", { name: "Weight units: lb", exact: true }).click();
  await page.getByRole("button", { name: "Kilograms (kg)", exact: true }).click();
  await page.getByRole("button", { name: `Edit set 1 for ${bench}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("9");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("button", { name: "Weight units: kg", exact: true }).click();
  await page.getByRole("button", { name: "Pounds (lb)", exact: true }).click();
  await expect(page.getByRole("button", { name: `Edit set 1 for ${bench}`, exact: true })).toContainText("1 lb × 9 reps");
});
