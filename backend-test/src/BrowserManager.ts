import { chromium, Browser, BrowserContext, Page } from "playwright";

class BrowserManager {
  private browsers: Map<number, Browser> = new Map();
  private contexts: Map<number, BrowserContext> = new Map();
  private pages: Map<number, Page> = new Map();

  async initialize(teamId: number) {
    if (this.browsers.has(teamId)) {
      return;
    }

    const browser = await chromium.launch({
      headless: false,
      args: [
        "--start-maximized",
        "--window-position=0,0",
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();
    
    this.browsers.set(teamId, browser);
    this.contexts.set(teamId, context);
    this.pages.set(teamId, page);
    
    return page;
  }

  async navigateToChathub(teamId: number) {
    const page = this.pages.get(teamId);
    if (!page) {
      throw new Error(`No page found for team ${teamId}`);
    }

    await page.goto("https://chat.openai.com");
    return page;
  }

  async cleanup(teamId: number) {
    const browser = this.browsers.get(teamId);
    if (browser) {
      await browser.close();
      this.browsers.delete(teamId);
      this.contexts.delete(teamId);
      this.pages.delete(teamId);
    }
  }

  async cleanupAll() {
    for (const teamId of this.browsers.keys()) {
      await this.cleanup(teamId);
    }
  }
}

export const browserManager = new BrowserManager();
