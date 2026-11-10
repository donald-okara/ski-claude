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

const settled = async (page, id) => {
  await expect(page.locator('section.ski-active')).toHaveCount(1);
  await expect(page.locator('section.ski-active')).toHaveId(id);
  await expect(page.locator('.ski-entering, .ski-leaving')).toHaveCount(0);
};

test('forward uses the destination kind and settles', async ({ page }) => {
  await page.goto('/examples/basic/#slide-2');
  await settled(page, 'steps');
  await page.goto('/examples/basic/#slide-3');
  await page.keyboard.press('ArrowRight');   // fade -> vertical
  await expect(page.locator('#vertical')).toHaveClass(/ski-entering/);
  await settled(page, 'vertical');
});

test('rapid presses end on the right slide', async ({ page }) => {
  await page.goto('/examples/basic/#slide-3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await settled(page, 'none');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await settled(page, 'fade');
});

test('none swaps without transition classes', async ({ page }) => {
  await page.goto('/examples/basic/#slide-4');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ski-entering, .ski-leaving')).toHaveCount(0);
  await settled(page, 'none');
});

test('reduced motion disables every transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/examples/basic/#slide-3');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ski-entering, .ski-leaving')).toHaveCount(0);
  await settled(page, 'vertical');
});

test('going back plays the leaving slide kind and the leaving slide stays visible', async ({ page }) => {
  await page.goto('/examples/basic/#slide-4');
  await page.keyboard.press('ArrowLeft');    // leaving vertical, entering fade
  await expect(page.locator('#vertical')).toHaveClass(/ski-leaving/);
  await expect(page.locator('#fade')).toHaveClass(/ski-entering/);
  await expect(page.locator('#fade')).toHaveClass(/ski-active/);
  await settled(page, 'fade');
});

test('End jumps with a fade whatever the slides declare', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('End');          // destination declares none
  await expect(page.locator('#none')).toHaveClass(/ski-entering/);
  await settled(page, 'none');
});
