import { test, expect } from '@playwright/test';
import { setupBrowser, closeBrowser, getPage } from './browser.setup';

test.beforeAll(async () => {
  await setupBrowser();
});

test.afterAll(async () => {
  await closeBrowser();
});

test('basic browser test', async () => {
  const page = await getPage();
  
  // Navigate to our local dev server
  await page.goto('http://localhost:5173');
  
  // Basic test to verify we can see the DEV TEAM title
  const title = await page.locator('h1').textContent();
  expect(title).toBe('DEV TEAM');
}); 