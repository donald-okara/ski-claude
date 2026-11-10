import { test as base, expect } from '@playwright/test';

// Every test collects console errors and page errors and asserts there are none.
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));
    await use(page);
    expect(errors).toEqual([]);
  },
});

test('opens on the first slide', async ({ page }) => {
  await page.goto('/examples/basic/');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
  await expect(page.locator('.ski-header-label')).toHaveText('Intro · ski-claude');
  await expect(page.locator('.ski-header-position')).toHaveText('1 / 5');
  await expect(page.locator('aside').first()).toBeHidden();
});

test('reveals steps before advancing, and rewinds them', async ({ page }) => {
  await page.goto('/examples/basic/#slide-2');
  await expect(page.locator('#steps .ski-step-pending')).toHaveCount(2);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#steps .ski-step-pending')).toHaveCount(1);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('section.ski-active')).toHaveId('fade');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('section.ski-active')).toHaveId('steps');
  await expect(page.locator('#steps .ski-step-pending')).toHaveCount(0);
});

test('section carries forward to later slides', async ({ page }) => {
  await page.goto('/examples/basic/#slide-4');
  await expect(page.locator('.ski-header-label')).toHaveText('Transitions · Vertical');
});

test('hash follows the slide and deep links work', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#slide-2$/);
  await page.goto('/examples/basic/#slide-999');
  await expect(page.locator('section.ski-active')).toHaveId('none');
  await page.goto('/examples/basic/#slide-abc');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
});

test('Home and End jump to the ends', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('End');
  await expect(page.locator('.ski-header-position')).toHaveText('5 / 5');
  await page.keyboard.press('Home');
  await expect(page.locator('.ski-header-position')).toHaveText('1 / 5');
});

test('typing in an input does not navigate', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.locator('#cover input').click();
  await page.keyboard.type('a d');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
});

test('stage scales to the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 });
  await page.goto('/examples/basic/');
  const scale = await page.locator('.ski-stage').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(scale).toBeCloseTo(0.5, 2);
});

test('empty deck shows a message', async ({ page }) => {
  await page.goto('/examples/empty/');
  await expect(page.locator('.ski-empty')).toHaveText('This deck has no slides yet.');
  await page.keyboard.press('ArrowRight');
});

test('without the runtime the deck is a readable document', async ({ page }) => {
  // An empty script stands in for the absent runtime (an aborted request would log a console error).
  await page.route('**/ski/ski.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.goto('/examples/basic/');
  for (const id of ['cover', 'steps', 'fade', 'vertical', 'none']) await expect(page.locator('#' + id)).toBeVisible();
});
