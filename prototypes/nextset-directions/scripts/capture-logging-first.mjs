import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'evidence/2026-09-07-logging-first');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1100 }, locale: 'en-AU', colorScheme: 'light', reducedMotion: 'reduce' });
const runtimeErrors = [];
page.on('pageerror', e => runtimeErrors.push(e.message));
page.on('console', m => { if (m.type() === 'error') runtimeErrors.push(m.text()); });
page.on('dialog', d => d.accept());
const records = [];
const nav = name => page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name, exact: true });
const button = name => page.getByRole('button', { name, exact: true });
async function capture(state) {
  await page.getByTestId('logging-first').waitFor();
  if (state !== 'progress-observations') {
    await page.locator('[data-testid="mobile-scroll"]').evaluate(element => { element.scrollTop = 0; });
  }
  await page.waitForTimeout(650);
  const audit = await page.locator('[data-phone-screen]').evaluate(phone => {
    const p = phone.getBoundingClientRect(), ratio = p.width / phone.clientWidth;
    const controls = [...phone.querySelectorAll('.lf-app button,.lf-app select,.lf-sheet button,.lf-sheet input,.lf-sheet textarea,.lf-sheet summary')].filter(el => { const r=el.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(el).visibility!=='hidden'; });
    return { viewport: { width: phone.clientWidth, height: phone.clientHeight }, horizontalOverflow: phone.scrollWidth>phone.clientWidth+1, undersizedControls: controls.map(el => {const r=el.getBoundingClientRect();return {name:el.getAttribute('aria-label')||el.textContent.trim(),width:r.width/ratio,height:r.height/ratio};}).filter(r=>r.width<47.5||r.height<47.5) };
  });
  await page.locator('[data-phone-screen]').screenshot({ path: resolve(out, `${state}.png`) });
  records.push({ state, file: `${state}.png`, ...audit });
}
async function add(name) { await button('Add exercise').click(); await page.getByRole('button',{name:new RegExp(`^${name}`)}).click(); }
async function log(weight,reps) { await button('Add set for Barbell bench press').click(); await page.getByRole('textbox',{name:'Weight (kg)',exact:true}).fill(weight); await page.getByRole('textbox',{name:'Reps',exact:true}).fill(reps); await button('Log set').click(); }
async function finish() {await button('Finish workout').click(); await button('Save workout').click();}
try {
  await page.goto('http://127.0.0.1:4173/');
  await capture('workouts-empty');
  await nav('History').click(); await capture('history-empty');
  await nav('Progress').click(); await capture('progress-empty');
  await nav('Workouts').click(); await button('Start workout').click(); await capture('active-empty');
  await button('Add exercise').click(); await capture('exercise-picker');
  await page.getByRole('button',{name:/^Barbell bench press/}).click();
  await log('60','8'); await capture('active-recorded');
  await button('Add set for Barbell bench press').click();
  await page.getByRole('textbox',{name:'Weight (kg)',exact:true}).fill('62.5');
  await page.getByRole('textbox',{name:'Reps',exact:true}).fill('8');
  await capture('set-entry'); await button('Log set').click();
  await add('Push-up');
  await button('Finish workout').click(); await capture('partial-finish'); await button('Save workout').click();
  await capture('workout-detail');
  await button('Save as routine').click(); await page.getByRole('textbox',{name:'Routine name',exact:true}).fill('Quick upper session'); await button('Save routine').click();
  await nav('Workouts').click(); await capture('routine');
  await button('Repeat workout').click(); await log('65','8'); await finish();
  await nav('History').click(); await capture('history');
  await nav('Progress').click(); await capture('progress');
  // The same real observations, scrolled to their accessible source table.
  await page.locator('.lf-trend-table').scrollIntoViewIfNeeded(); await capture('progress-observations');
  await nav('Workouts').click(); await button('Start workout').click(); await add('Barbell bench press'); await log('60','8');
  await page.getByRole('button',{name:/Preview device: iPhone/}).click();
  await page.getByRole('menuitemradio',{name:/Pixel 10/}).click(); await capture('pixel-active');
  await page.addStyleTag({content:'.lf-app,.lf-sheet{font-size:200% !important}'});
  await capture('large-text');
  const sourceHashes = {};
  for (const file of ['src/Prototype.tsx','src/prototype.css']) sourceHashes[file] = createHash('sha256').update(await readFile(resolve(root,file))).digest('hex');
  await writeFile(resolve(out,'manifest.json'), JSON.stringify({capturedAt:new Date().toISOString(),context:'Chromium automated prototype evidence; iPhone 393×852 and Pixel 427×952 presets; light; reduced motion; large-text = 200% app base font, not native Dynamic Type',sourceHashes,runtimeErrors,records},null,2)+'\n');
  console.log(JSON.stringify({captures:records.length,runtimeErrors,layoutDefects:records.filter(r=>r.horizontalOverflow||r.undersizedControls.length)},null,2));
} finally { await browser.close(); }
