import { chromium, Browser, Page } from '@playwright/test';

interface ChatHub {
  browser: Browser;
  page: Page;
  id: number;
  browserType: string;
  isReady: boolean;
}

export class ChatHubManager {
  private chathubs: ChatHub[] = [];
  private isInitialized: boolean = false;
  private clipboardMonitorInterval: NodeJS.Timeout | null = null;

  private async launchBrowser(id: number): Promise<Browser> {
    return chromium.launch({
      headless: false,
      channel: 'chromium'
    });
  }

  async initializeBrowsers() {
    if (this.isInitialized) {
      // If already initialized, bring window to front
      const hub = this.chathubs[0];
      if (hub) {
        await hub.page.bringToFront();
      }
      return;
    }

    const browser = await this.launchBrowser(1);
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to chathub.gg
    await page.goto('https://app.chathub.gg');
    
    // Set up file handling permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    this.chathubs.push({
      browser,
      page,
      id: 1,
      browserType: 'chromium',
      isReady: false
    });
    
    this.isInitialized = true;
    this.startClipboardMonitor();
  }

  private async startClipboardMonitor() {
    // Clear any existing monitor
    if (this.clipboardMonitorInterval) {
      clearInterval(this.clipboardMonitorInterval);
    }

    // Monitor clipboard every 500ms
    this.clipboardMonitorInterval = setInterval(async () => {
      try {
        // Check clipboard content in main UI
        const mainHub = this.getChathub(1);
        if (!mainHub) return;

        const clipboardContent = await mainHub.page.evaluate(() => navigator.clipboard.readText());
        const startButton = await mainHub.page.locator('button:has-text("START")');
        
        if (clipboardContent && clipboardContent.trim() !== '') {
          // Add clipboard-ready class if content exists
          await startButton.evaluate((button) => {
            button.classList.add('clipboard-ready');
          });
        } else {
          // Remove clipboard-ready class if no content
          await startButton.evaluate((button) => {
            button.classList.remove('clipboard-ready');
          });
        }
      } catch (error) {
        console.error('Error monitoring clipboard:', error);
      }
    }, 500);
  }

  async minimizeBrowsers() {
    const hub = this.chathubs[0];
    if (hub) {
      // Minimize browser window
      await hub.page.evaluate(() => {
        window.resizeTo(0, 0);
        window.moveTo(0, window.screen.height);
      });
      hub.isReady = true;
    }
  }

  async closeAllBrowsers() {
    // Stop clipboard monitor
    if (this.clipboardMonitorInterval) {
      clearInterval(this.clipboardMonitorInterval);
      this.clipboardMonitorInterval = null;
    }

    for (const hub of this.chathubs) {
      await hub.browser.close();
    }
    this.chathubs = [];
    this.isInitialized = false;
  }

  getChathub(id: number): ChatHub | undefined {
    return this.chathubs.find(hub => hub.id === id);
  }

  // Chathub UI interaction methods
  async uploadFile(id: number, filePath: string): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    // Click the file upload button and handle the file input
    await hub.page.locator('button:has-text("Upload files up to 10MB")').click();
    const fileInput = await hub.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async uploadImage(id: number, imagePath: string): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    // Click the image upload button and handle the file input
    await hub.page.locator('button:has-text("Upload image")').click();
    const fileInput = await hub.page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);
  }

  async triggerImageGeneration(id: number): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    await hub.page.locator('button:has-text("Image generations")').click();
  }

  async webSearch(id: number): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    await hub.page.locator('button:has-text("Web search")').click();
  }

  async copyAllMessages(id: number): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    await hub.page.locator('button:has-text("Copy all messages")').click();
    
    // Ensure START button updates immediately after copy
    const startButton = await hub.page.locator('button:has-text("START")');
    await startButton.evaluate((button) => {
      button.classList.add('clipboard-ready');
    });
  }

  async resetConversations(id: number): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    await hub.page.locator('button:has-text("Reset conversation")').click();
  }

  async summarizeAndCompare(id: number): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    await hub.page.locator('button:has-text("Summarize")').click();
  }

  async isChathubProcessing(id: number): Promise<boolean> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) return false;
    if (!hub.isReady) return false;

    const processingIndicator = await hub.page.locator('.processing-indicator').count();
    return processingIndicator > 0;
  }

  async waitForChathubResponse(id: number): Promise<void> {
    const hub = this.getChathub(1); // Always use the single browser
    if (!hub) throw new Error(`Chathub not found`);
    if (!hub.isReady) throw new Error(`Chathub is not ready`);

    await hub.page.waitForSelector('.response-complete', { state: 'visible' });
  }
} 