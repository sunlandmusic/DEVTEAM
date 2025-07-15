import { chromium } from '@playwright/test';

class BrowserService {
  private browser: any = null;
  private page: any = null;
  private isInitialized = false;

  async initializeBrowser() {
    if (this.isInitialized) {
      await this.page?.bringToFront();
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: false,
        channel: 'chromium'
      });
      const context = await this.browser.newContext();
      this.page = await context.newPage();
      
      // Navigate to chathub.gg
      await this.page.goto('https://app.chathub.gg');
      
      // Set up file handling permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async minimizeBrowser() {
    if (!this.page) return;
    
    try {
      await this.page.evaluate(() => {
        window.resizeTo(0, 0);
        window.moveTo(0, window.screen.height);
      });
    } catch (error) {
      console.error('Failed to minimize browser:', error);
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
    }
  }
}

export const browserService = new BrowserService(); 