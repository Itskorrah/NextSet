import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const prototypeRoot = path.resolve(scriptDirectory, "..");
const workspaceRoot = path.resolve(prototypeRoot, "../..");
const evidenceRoot = path.join(prototypeRoot, "evidence", "2026-08-06");
const screenshotRoot = path.join(evidenceRoot, "screens");
const comparisonRoot = path.join(evidenceRoot, "comparisons");
const previewUrl = process.env.NEXTSET_PREVIEW_URL ?? "http://127.0.0.1:4173/?review=legacy";
const capturedAt = new Date().toISOString();
const captureDate = capturedAt.slice(0, 10);

const directions = [
  { name: "Tempo Ledger", slug: "tempo-ledger", reference: "tempo-ledger-active-workout-390x844.png" },
  { name: "Field Kit", slug: "field-kit", reference: "field-kit-active-workout-390x844.png" },
  { name: "Open Pace", slug: "open-pace", reference: "open-pace-active-workout-390x844.png" },
];

const screens = [
  { id: "onboarding", label: "Onboarding", slug: "onboarding" },
  { id: "programme", label: "Programme selection", slug: "programme-selection" },
  { id: "today", label: "Today", slug: "today" },
  { id: "active", label: "Active workout", slug: "active-workout" },
  { id: "set-entry", label: "Set entry", slug: "set-entry" },
  { id: "substitution", label: "Exercise substitution", slug: "exercise-substitution" },
  { id: "complete", label: "Workout completion", slug: "workout-completion" },
  { id: "history", label: "History", slug: "history" },
  { id: "exercise-progress", label: "Exercise progress", slug: "exercise-progress" },
  { id: "programme-editor", label: "Programme editor", slug: "programme-editor" },
];

await mkdir(screenshotRoot, { recursive: true });
await mkdir(comparisonRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1400, height: 1200 },
  colorScheme: "light",
  reducedMotion: "reduce",
  locale: "en-AU",
});

const records = [];
const runtimeErrors = [];

async function openScreen(page, label, id) {
  await page.getByRole("button", { name: /open prototype screen index/i }).click();
  const index = page.locator(".screen-index");
  await index.waitFor({ state: "visible" });
  await index.getByRole("button", { name: new RegExp(`\\d+\\s*${label}`, "i") }).click();
  await page.getByTestId(`screen-${id}`).waitFor({ state: "visible" });
  await index.waitFor({ state: "hidden" });
  await page.locator("[data-testid='mobile-scroll']").evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.waitForTimeout(80);
}

async function auditScreen(page) {
  return page.locator("[data-phone-screen]").evaluate((phone) => {
    const phoneRect = phone.getBoundingClientRect();
    const controls = [...phone.querySelectorAll("button, input, textarea, select, [role='button']")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          name: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ") || element.tagName,
          width: Math.round((rect.width / phoneRect.width) * phone.clientWidth),
          height: Math.round((rect.height / phoneRect.height) * phone.clientHeight),
          disabled: "disabled" in element ? Boolean(element.disabled) : false,
        };
      });

    return {
      viewport: { width: phone.clientWidth, height: phone.clientHeight },
      horizontalOverflow: phone.scrollWidth > phone.clientWidth + 1,
      undersizedControls: controls.filter((control) => control.width < 48 || control.height < 48),
      controlCount: controls.length,
    };
  });
}

async function captureDeviceViewport(page, outputPath) {
  const geometry = await page.locator("[data-phone-screen]").evaluate((phone) => {
    const rect = phone.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: phone.clientWidth,
      height: phone.clientHeight,
    };
  });
  await page.screenshot({ path: outputPath, clip: geometry, animations: "disabled" });
}

for (const direction of directions) {
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(`${direction.name}: console: ${message.text()}`);
  });
  page.on("pageerror", (error) => runtimeErrors.push(`${direction.name}: pageerror: ${error.message}`));

  await page.goto(previewUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
  await page.getByRole("button", { name: new RegExp(direction.name, "i") }).click();
  await page.getByTestId("screen-onboarding").waitFor({ state: "visible" });

  for (const screen of screens) {
    await openScreen(page, screen.label, screen.id);
    const screenPath = path.join(screenshotRoot, `${direction.slug}-${screen.slug}-iphone-light.png`);
    await captureDeviceViewport(page, screenPath);
    records.push({
      direction: direction.name,
      screen: screen.label,
      device: "iPhone",
      file: path.relative(prototypeRoot, screenPath),
      audit: await auditScreen(page),
    });
  }

  await openScreen(page, "Active workout", "active");
  await page.getByTestId("device-picker").click();
  await page.getByTestId("device-option-pixel-10").click();
  await page.locator("[data-phone-screen][data-device='pixel-10']").waitFor({ state: "visible" });
  await page.waitForTimeout(120);
  const pixelPath = path.join(screenshotRoot, `${direction.slug}-active-workout-pixel-10-light.png`);
  await captureDeviceViewport(page, pixelPath);
  records.push({
    direction: direction.name,
    screen: "Active workout",
    device: "Pixel 10",
    file: path.relative(prototypeRoot, pixelPath),
    audit: await auditScreen(page),
  });

  await page.close();
}

for (const direction of directions) {
  const referencePath = path.join(workspaceRoot, "prototypes", "visual-references", direction.reference);
  const implementationPath = path.join(screenshotRoot, `${direction.slug}-active-workout-iphone-light.png`);
  const [reference, implementation] = await Promise.all([
    readFile(referencePath),
    readFile(implementationPath),
  ]);
  const comparisonPage = await context.newPage();
  await comparisonPage.setViewportSize({ width: 900, height: 960 });
  await comparisonPage.setContent(`<!doctype html>
    <html><head><style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 24px; background: #e9e7e2; color: #171914; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
      h1 { margin: 0 0 18px; font-size: 20px; }
      main { display: grid; grid-template-columns: 390px 393px; gap: 24px; align-items: start; }
      figure { margin: 0; }
      figcaption { margin-bottom: 8px; font-size: 12px; font-weight: 700; letter-spacing: .03em; }
      img { display: block; width: 100%; height: auto; border: 1px solid #aaa; background: white; }
    </style></head><body>
      <h1>${direction.name} · active workout comparison · ${captureDate}</h1>
      <main>
        <figure><figcaption>Generated source reference · 390×844</figcaption><img alt="Source reference" src="data:image/png;base64,${reference.toString("base64")}"></figure>
        <figure><figcaption>Rendered iPhone app viewport · 393×852</figcaption><img alt="Rendered implementation" src="data:image/png;base64,${implementation.toString("base64")}"></figure>
      </main>
    </body></html>`, { waitUntil: "load" });
  const comparisonPath = path.join(comparisonRoot, `${direction.slug}-active-workout-source-vs-rendered.png`);
  await comparisonPage.screenshot({ path: comparisonPath, fullPage: true, animations: "disabled" });
  await comparisonPage.close();
}

for (const direction of directions) {
  const captures = await Promise.all(screens.map(async (screen) => ({
    screen,
    image: await readFile(path.join(screenshotRoot, `${direction.slug}-${screen.slug}-iphone-light.png`)),
  })));
  const contactPage = await context.newPage();
  await contactPage.setViewportSize({ width: 1120, height: 1040 });
  await contactPage.setContent(`<!doctype html>
    <html><head><style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 20px; background: #e9e7e2; color: #171914; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
      h1 { margin: 0 0 14px; font-size: 20px; }
      main { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; align-items: start; }
      figure { margin: 0; }
      figcaption { height: 30px; margin-bottom: 5px; font-size: 10px; font-weight: 700; line-height: 1.2; }
      img { display: block; width: 100%; height: auto; border: 1px solid #aaa; background: white; }
    </style></head><body>
      <h1>${direction.name} · ten rendered iPhone review states · ${captureDate}</h1>
      <main>${captures.map(({ screen, image }, index) => `
        <figure><figcaption>${index + 1} · ${screen.label}</figcaption><img alt="${screen.label}" src="data:image/png;base64,${image.toString("base64")}"></figure>
      `).join("")}</main>
    </body></html>`, { waitUntil: "load" });
  const contactPath = path.join(comparisonRoot, `${direction.slug}-ten-screen-rendered-contact-sheet.png`);
  await contactPage.screenshot({ path: contactPath, fullPage: true, animations: "disabled" });
  await contactPage.close();
}

await browser.close();

const evidence = {
  capturedAt,
  previewUrl,
  browser: "Playwright Chromium 149 via @playwright/test 1.61.1",
  viewport: { width: 1400, height: 1200 },
  context: { locale: "en-AU", colorScheme: "light", reducedMotion: "reduce" },
  records,
  runtimeErrors,
};

await writeFile(path.join(evidenceRoot, "capture-manifest.json"), `${JSON.stringify(evidence, null, 2)}\n`);

const undersized = records.flatMap((record) => record.audit.undersizedControls.map((control) => ({
  direction: record.direction,
  screen: record.screen,
  device: record.device,
  ...control,
})));
const overflows = records.filter((record) => record.audit.horizontalOverflow);

if (runtimeErrors.length || undersized.length || overflows.length) {
  console.error(JSON.stringify({ runtimeErrors, undersized, overflows }, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Captured ${records.length} mobile states, 3 active-workout comparison plates, and 3 rendered contact sheets.`);
  console.log("No console/page errors, horizontal overflow, or sub-48px rendered controls detected.");
}
