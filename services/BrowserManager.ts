import { Browser, BrowserType, chromium, firefox } from 'playwright';

export interface BrowserConfig {
  maxInstances: number;
  viewport: {
    width: number;
    height: number;
  };
  timeout: number;
  gridLayout: {
    rows: number;
    cols: number;
  };
}

export interface BrowserInstance {
  id: number;
  type: 'chrome' | 'firefox' | 'edge' | 'brave';
  browser: Browser | null;
  position: { x: number; y: number };
  status: 'idle' | 'launching' | 'ready' | 'processing' | 'error';
}

export const DEFAULT_CONFIG: BrowserConfig = {
  maxInstances: 4,
  viewport: {
    width: 1280,
    height: 720
  },
  timeout: 300000, // 5 minutes
  gridLayout: {
    rows: 2,
    cols: 2
  }
};

export class BrowserManager {
  private instances: Map<number, BrowserInstance> = new Map();
  private config: BrowserConfig;
  
  constructor(config: BrowserConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.initializeInstances();
  }

  private initializeInstances(): void {
    const browserTypes = ['chrome', 'firefox', 'edge', 'brave'] as const;
    const screenWidth = window.screen.width || 2560;
    const screenHeight = window.screen.height || 1440;
    const browserWidth = screenWidth / 2;
    const browserHeight = screenHeight / 2;

    browserTypes.forEach((type, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      this.instances.set(index + 1, {
        id: index + 1,
        type,
        browser: null,
        position: {
          x: col * browserWidth,
          y: row * browserHeight
        },
        status: 'idle'
      });
    });
  }

  async launchBrowser(instanceId: number): Promise<Browser> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Browser instance ${instanceId} not found`);
    }

    try {
      instance.status = 'launching';
      
      let browserType: BrowserType;
      let launchOptions: any = {
        headless: false,
        args: [
          `--window-position=${instance.position.x},${instance.position.y}`,
          `--window-size=${this.config.viewport.width},${this.config.viewport.height}`,
          '--no-first-run',
          '--disable-web-security'
        ]
      };

      switch (instance.type) {
        case 'chrome':
          browserType = chromium;
          launchOptions.channel = 'chrome';
          break;
        case 'firefox':
          browserType = firefox;
          break;
        case 'edge':
          browserType = chromium;
          launchOptions.channel = 'msedge';
          break;
        case 'brave':
          browserType = chromium;
          // For macOS, adjust path as needed
          launchOptions.executablePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
          break;
        default:
          throw new Error(`Unsupported browser type: ${instance.type}`);
      }

      const browser = await browserType.launch(launchOptions);
      instance.browser = browser;
      instance.status = 'ready';
      
      return browser;
    } catch (error) {
      instance.status = 'error';
      throw new Error(`Failed to launch ${instance.type}: ${error}`);
    }
  }

  async launchAllBrowsers(): Promise<void> {
    const launchPromises = Array.from(this.instances.keys()).map(id => 
      this.launchBrowser(id).catch(error => {
        console.error(`Failed to launch browser ${id}:`, error);
        return null;
      })
    );

    await Promise.all(launchPromises);
  }

  getBrowserInstance(teamId: number): Browser | null {
    const instance = this.instances.get(teamId);
    return instance?.browser || null;
  }

  getBrowserStatus(teamId: number): string {
    const instance = this.instances.get(teamId);
    return instance?.status || 'unknown';
  }

  async closeBrowser(instanceId: number): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (instance?.browser) {
      try {
        await instance.browser.close();
        instance.browser = null;
        instance.status = 'idle';
      } catch (error) {
        console.error(`Error closing browser ${instanceId}:`, error);
        instance.status = 'error';
      }
    }
  }

  async cleanup(): Promise<void> {
    const closePromises = Array.from(this.instances.keys()).map(id => 
      this.closeBrowser(id)
    );
    
    await Promise.allSettled(closePromises);
    this.instances.clear();
  }

  async recoverBrowser(instanceId: number): Promise<boolean> {
    try {
      await this.closeBrowser(instanceId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.launchBrowser(instanceId);
      return true;
    } catch (error) {
      console.error(`Failed to recover browser ${instanceId}:`, error);
      return false;
    }
  }

  getGridStatus(): Record<number, { type: string; status: string; position: { x: number; y: number } }> {
    const status: Record<number, any> = {};
    
    this.instances.forEach((instance, id) => {
      status[id] = {
        type: instance.type,
        status: instance.status,
        position: instance.position
      };
    });
    
    return status;
  }
} 