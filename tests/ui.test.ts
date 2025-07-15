import { test, expect, Page } from '@playwright/test';
import { ChatHubManager } from './chathub.setup';

let chatHubManager: ChatHubManager;
let mainPage: Page;

test.beforeAll(async ({ browser }) => {
  chatHubManager = new ChatHubManager();
  mainPage = await browser.newPage();
  await mainPage.goto('http://localhost:5173');
  
  // Grant clipboard permissions
  await mainPage.context().grantPermissions(['clipboard-read', 'clipboard-write']);
});

test.afterAll(async () => {
  await chatHubManager.closeAllBrowsers();
  if (mainPage) await mainPage.close();
});

test.describe('DEV TEAM UI Tests', () => {
  test('browser initialization flow', async () => {
    // Click the Browsers button to initialize
    const browsersButton = mainPage.locator('[data-testid="browsers-button"]');
    await browsersButton.click();
    
    // Initialize browsers
    await chatHubManager.initializeBrowsers();
    
    // Wait for user setup (in real usage, user would manually interact)
    // For testing, we'll simulate a delay
    await mainPage.waitForTimeout(2000);
    
    // Click Browsers button again to minimize and mark as ready
    await browsersButton.click();
    await chatHubManager.minimizeBrowsers();
    
    // Verify browsers are ready
    await expect(browsersButton).toHaveAttribute('data-browsers-ready', 'true');
  });

  test('file upload synchronization', async () => {
    // Click file upload in main UI
    await mainPage.locator('[data-testid="file-upload-button"]').click();
    
    // Verify file upload triggered in all chathubs
    for (let i = 1; i <= 4; i++) {
      const hub = chatHubManager.getChathub(i);
      expect(hub).toBeTruthy();
      if (hub) {
        await expect(hub.page.locator('input[type="file"]')).toBeVisible();
      }
    }
  });

  test('image upload synchronization', async () => {
    // Click image upload in main UI
    await mainPage.locator('[data-testid="image-upload-button"]').click();
    
    // Verify image upload triggered in all chathubs
    for (let i = 1; i <= 4; i++) {
      const hub = chatHubManager.getChathub(i);
      expect(hub).toBeTruthy();
      if (hub) {
        await expect(hub.page.locator('button:has-text("Upload image")')).toBeVisible();
        await expect(hub.page.locator('input[type="file"]')).toBeVisible();
      }
    }
  });

  test('image generation synchronization', async () => {
    // Click image generation in main UI
    await mainPage.locator('[data-testid="image-gen-button"]').click();
    
    // Verify image generation triggered in all chathubs
    for (let i = 1; i <= 4; i++) {
      const hub = chatHubManager.getChathub(i);
      expect(hub).toBeTruthy();
      if (hub) {
        await expect(hub.page.locator('button:has-text("Image generations")')).toBeVisible();
      }
    }
  });

  test('web search synchronization', async () => {
    // Click web search in main UI
    await mainPage.locator('[data-testid="web-search-button"]').click();
    
    // Verify web search triggered in all chathubs
    for (let i = 1; i <= 4; i++) {
      const hub = chatHubManager.getChathub(i);
      expect(hub).toBeTruthy();
      if (hub) {
        await expect(hub.page.locator('button:has-text("Web search")')).toBeVisible();
      }
    }
  });

  test('copy and reset synchronization', async () => {
    // Test copy all messages
    await mainPage.locator('button:has-text("Copy all messages")').click();
    for (let i = 1; i <= 4; i++) {
      await chatHubManager.copyAllMessages(i);
    }

    // Test reset all conversations
    await mainPage.locator('button:has-text("Reset all conversations")').click();
    for (let i = 1; i <= 4; i++) {
      await chatHubManager.resetConversations(i);
    }
  });

  test('team selection functionality', async () => {
    // Initially no teams should be selected
    for (let i = 1; i <= 4; i++) {
      await expect(mainPage.locator(`[data-testid="team-${i}"]`)).not.toHaveClass(/selected/);
    }
    
    // Click first team and verify selection
    await mainPage.locator('[data-testid="team-1"]').click();
    await expect(mainPage.locator('[data-testid="team-1"]')).toHaveClass(/selected/);
    
    // Click second team and verify multiple selection
    await mainPage.locator('[data-testid="team-2"]').click();
    await expect(mainPage.locator('[data-testid="team-1"]')).toHaveClass(/selected/);
    await expect(mainPage.locator('[data-testid="team-2"]')).toHaveClass(/selected/);
    
    // Deselect first team
    await mainPage.locator('[data-testid="team-1"]').click();
    await expect(mainPage.locator('[data-testid="team-1"]')).not.toHaveClass(/selected/);
    await expect(mainPage.locator('[data-testid="team-2"]')).toHaveClass(/selected/);
  });

  test('error handling for empty input', async () => {
    // Try to send empty input
    const startButton = mainPage.locator('button:has-text("START")');
    await startButton.click();
    
    // Check error message
    const errorMessage = mainPage.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Please enter a prompt...');
    
    // Error should disappear after 5 seconds
    await expect(errorMessage).toBeHidden({ timeout: 6000 });
  });

  test('error handling for no team selection', async () => {
    // Enter text but don't select team
    const textarea = mainPage.locator('textarea');
    await textarea.fill('Test prompt');
    
    const startButton = mainPage.locator('button:has-text("START")');
    await startButton.click();
    
    // Check error message
    const errorMessage = mainPage.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Please select at least one team...');
    
    // Error should disappear after 5 seconds
    await expect(errorMessage).toBeHidden({ timeout: 6000 });
  });

  // Helper function to wait for all chathubs to complete
  async function waitForChathubsCompletion(page: Page) {
    // Wait for all team responses to appear
    // We know processing is complete when isProcessingTeams becomes false
    await page.waitForFunction(() => {
      const processingState = window.document.querySelector('[data-testid="processing-state"]');
      return processingState?.getAttribute('data-is-processing-teams') === 'false';
    }, { timeout: 30000 });

    // Additional verification that responses are visible
    await expect(page.locator('.team-response')).toBeVisible();
  }

  // Helper function to wait for summary completion
  async function waitForSummaryCompletion(page: Page) {
    // Wait for summary processing to complete
    // We know it's complete when isSummarizing becomes false
    await page.waitForFunction(() => {
      const processingState = window.document.querySelector('[data-testid="processing-state"]');
      return processingState?.getAttribute('data-is-summarizing') === 'false';
    }, { timeout: 60000 }); // Longer timeout for summary

    // Verify summary is visible
    await expect(page.locator('.summary-content')).toBeVisible();
  }

  test('complete process cycle with state monitoring', async () => {
    const page = await mainPage;
    
    // 1. Initial Setup and START
    await page.locator('[data-testid="team-1"]').click();
    const textarea = page.locator('textarea');
    await textarea.fill('Test prompt');
    
    // Start processing and monitor states
    const startButton = page.locator('button:has-text("START")');
    await startButton.click();

    // 2. Monitor Chathub Processing
    // Verify processing started
    await expect(page.locator('[data-testid="processing-state"]')).toHaveAttribute('data-is-processing-teams', 'true');
    await expect(page.locator('[data-testid="dogon-mask-container"] .processing')).toBeVisible();
    await expect(page.locator('[data-testid="slot-animation-container"] .slot-animation')).toBeVisible();

    // Wait for all chathubs to complete
    await waitForChathubsCompletion(page);

    // 3. Copy All Messages
    const copyAllButton = page.locator('button:has-text("Copy All Messages")');
    await copyAllButton.click();

    // Verify copy state (if you have a visual indicator)
    await expect(copyAllButton).toHaveClass(/copied/);

    // 4. Generate Summary
    const generateSummaryButton = page.locator('button:has-text("Generate Summary")');
    await generateSummaryButton.click();

    // 5. Monitor Summary Generation
    await expect(page.locator('[data-testid="processing-state"]')).toHaveAttribute('data-is-summarizing', 'true');
    await waitForSummaryCompletion(page);

    // 6. Copy Summary
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const copySummaryButton = page.locator('button:has-text("COPY")').last();
    await copySummaryButton.click();

    // Verify copy state (if you have a visual indicator)
    await expect(copySummaryButton).toHaveClass(/copied/);

    // 7. Wait for automatic download
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/devteam-responses-.*\.md/);

    // 8. Reset All Conversations
    const resetButton = page.locator('button:has-text("RESET ALL CONVERSATIONS")');
    await resetButton.click();

    // 9. Verify Complete Reset
    await expect(textarea).toBeEmpty();
    await expect(page.locator('[data-testid="team-1"]')).not.toHaveClass(/selected/);
    await expect(page.locator('.team-response')).not.toBeVisible();
    await expect(page.locator('.summary-content')).not.toBeVisible();
    await expect(page.locator('[data-testid="processing-state"]')).toHaveAttribute('data-is-processing-teams', 'false');
    await expect(page.locator('[data-testid="processing-state"]')).toHaveAttribute('data-is-summarizing', 'false');
  });

  test('animation states during processing', async () => {
    const page = await mainPage;
    
    // Select team and submit
    await page.locator('[data-testid="team-1"]').click();
    const textarea = page.locator('textarea');
    await textarea.fill('Test prompt');
    
    const startButton = page.locator('button:has-text("START")');
    await startButton.click();
    
    // Check if DogonMask animation is active during processing
    await expect(page.locator('[data-testid="dogon-mask-container"] .processing')).toBeVisible();
    await expect(page.locator('[data-testid="slot-animation-container"] .slot-animation')).toBeVisible();
    
    // Wait for processing to finish
    await expect(page.locator('.team-response')).toBeVisible({ timeout: 30000 });
    
    // Verify animations stop after processing
    await expect(page.locator('[data-testid="dogon-mask-container"] .processing')).not.toBeVisible();
  });

  test('START button changes color on clipboard content', async () => {
    const startButton = mainPage.locator('button:has-text("START")');
    
    // Initially button should not have clipboard-ready class
    await expect(startButton).not.toHaveClass(/clipboard-ready/);
    
    // Copy some content
    await mainPage.locator('button:has-text("Copy all messages")').click();
    
    // Wait for clipboard content and verify button state
    await expect(startButton).toHaveClass(/clipboard-ready/, { timeout: 2000 });
    
    // Clear clipboard by copying empty content
    await mainPage.evaluate(() => navigator.clipboard.writeText(''));
    
    // Button should return to normal state
    await expect(startButton).not.toHaveClass(/clipboard-ready/);
  });

  test('START button color persists until clipboard cleared', async () => {
    const startButton = mainPage.locator('button:has-text("START")');
    
    // Copy content and verify button state
    await mainPage.locator('button:has-text("Copy all messages")').click();
    await expect(startButton).toHaveClass(/clipboard-ready/);
    
    // Refresh page
    await mainPage.reload();
    
    // Button should still show clipboard-ready state if content exists
    const clipboardContent = await mainPage.evaluate(() => navigator.clipboard.readText());
    if (clipboardContent) {
      await expect(startButton).toHaveClass(/clipboard-ready/);
    }
  });
}); 