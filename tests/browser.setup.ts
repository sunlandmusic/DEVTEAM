import { chromium, Browser, Page } from '@playwright/test';

let browser: Browser;
let page: Page;

export async function setupBrowser() {
  // Launch browser
  browser = await chromium.launch({
    headless: false, // Set to true for production
    channel: 'chromium'
  });

  // Create a new page
  page = await browser.newPage();

  return { browser, page };
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
  }
}

export async function getPage() {
  if (!page) {
    const setup = await setupBrowser();
    page = setup.page;
  }
  return page;
} 