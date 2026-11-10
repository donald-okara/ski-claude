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

test('D toggles the theme and a reload starts from the default again', async ({ page }) => {
  await page.goto('/examples/basic/');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'light');
  await page.keyboard.press('d');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'light');
});

test('theme and text size are not written to storage', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('d');
  await page.keyboard.press('+');
  const stored = await page.evaluate(() => window.localStorage.length + window.sessionStorage.length);
  expect(stored).toBe(0);
});

test('text size steps, clamps and resets', async ({ page }) => {
  await page.goto('/examples/basic/');
  const scale = () => page.locator('html').evaluate((el) => el.style.getPropertyValue('--ski-text-scale').trim());
  for (let i = 0; i < 3; i++) await page.keyboard.press('+');
  expect(await scale()).toBe('1.3');
  for (let i = 0; i < 10; i++) await page.keyboard.press('+');
  expect(await scale()).toBe('1.6');
  await page.keyboard.press('0');
  expect(await scale()).toBe('1');
});

test('text size changes the rendered slide text', async ({ page }) => {
  await page.goto('/examples/basic/');
  const size = () => page.locator('#cover h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const before = await size();
  await page.keyboard.press('+');
  await page.keyboard.press('+');
  expect(await size()).toBeCloseTo(before * 1.2, 1);
});

test('shortcut guide lists every binding and closes on Escape', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('c');
  await expect(page.locator('.ski-shortcut')).toHaveCount(11);
  await expect(page.locator('.ski-shortcut').first()).toContainText('Space');
  await expect(page.locator('.ski-shortcut').first()).toContainText('→');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
  await page.keyboard.press('Escape');
  await expect(page.locator('.ski-shortcuts')).toBeHidden();
});

test('go-to jumps to a slide', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('g');
  await page.keyboard.type('4');
  await page.keyboard.press('Enter');
  await expect(page.locator('section.ski-active')).toHaveId('vertical');
  await expect(page.locator('.ski-goto')).toBeHidden();
});

test('go-to ignores junk and typing there triggers no shortcuts', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('g');
  await page.keyboard.type('d');
  await page.keyboard.press('Enter');
  await expect(page.locator('.ski-goto')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'light');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
});

test('only one overlay is open at a time', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('c');
  await expect(page.locator('.ski-shortcuts')).toBeVisible();
  await page.keyboard.press('g');
  await expect(page.locator('.ski-goto')).toBeVisible();
  await expect(page.locator('.ski-shortcuts')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ski-goto')).toBeHidden();
});

test('header has a fullscreen button', async ({ page }) => {
  await page.goto('/examples/basic/');
  await expect(page.locator('.ski-header .ski-fullscreen')).toBeVisible();
});

test('a plain :root rule in the deck overrides theme and font tokens in both themes', async ({ page }) => {
  await page.goto('/examples/tokens/');
  const tokens = () => page.locator('html').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { accent: cs.getPropertyValue('--ski-accent').trim(), font: cs.getPropertyValue('--ski-font-body').trim() };
  });
  expect(await tokens()).toEqual({ accent: 'rgb(255, 0, 0)', font: 'Georgia, serif' });
  await page.keyboard.press('d');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'dark');
  expect(await tokens()).toEqual({ accent: 'rgb(255, 0, 0)', font: 'Georgia, serif' });
  // Tokens the deck did not override still come from the theme.
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).getPropertyValue('--ski-bg').trim())).toBe('#141413');
});
