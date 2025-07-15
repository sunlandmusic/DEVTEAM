import { test, expect, Page, chromium } from '@playwright/test';
import { ChatHubManager } from './chathub.setup';

let chatHubManager: ChatHubManager;
let mainPage: Page;

test.beforeAll(async ({ browser }) => {
  // Initialize chathub instances
  chatHubManager = new ChatHubManager();
  await chatHubManager.initializeChathubs(4); // Initialize 4 chathubs

  // Create main app page
  mainPage = await browser.newPage();
  await mainPage.goto('http://localhost:5173');

  // Grant clipboard permissions
  await mainPage.context().grantPermissions(['clipboard-read', 'clipboard-write']);
});

test.afterAll(async () => {
  await chatHubManager.closeAllChathubs();
  await mainPage.close();
});

test.describe('DEV TEAM E2E Tests', () => {
  test('complete process cycle with chathubs', async () => {
    // 1. Setup and START
    // Select teams 1 and 2
    await mainPage.locator('[data-testid="team-1"]').click();
    await mainPage.locator('[data-testid="team-2"]').click();
    
    // Enter prompt
    const testPrompt = 'Test prompt for chathubs';
    await mainPage.locator('textarea').fill(testPrompt);
    
    // Click START and begin monitoring
    const startButton = mainPage.locator('button:has-text("START")');
    await startButton.click();

    // 2. Monitor Chathub Processing
    // Verify UI processing state
    await expect(mainPage.locator('[data-testid="dogon-mask-container"] .processing')).toBeVisible();
    await expect(mainPage.locator('[data-testid="slot-animation-container"] .slot-animation')).toBeVisible();

    // Send prompts to selected chathubs and collect responses
    const responses: string[] = [];
    for (const teamId of [1, 2]) {
      // Send prompt to chathub
      await chatHubManager.sendPromptToChathub(teamId, testPrompt);
      
      // Wait for response
      await chatHubManager.waitForChathubResponse(teamId);
      
      // Copy response
      const response = await chatHubManager.copyChathubResponse(teamId);
      responses.push(response);
    }

    // 3. Copy All Messages
    // Wait for UI to show responses
    await expect(mainPage.locator('.team-response')).toBeVisible();
    const copyAllButton = mainPage.locator('button:has-text("Copy All Messages")');
    await copyAllButton.click();

    // 4. Generate Summary
    // Send combined responses to a summary chathub
    const summaryPrompt = `Summarize these responses:\n${responses.join('\n\n')}`;
    await chatHubManager.sendPromptToChathub(4, summaryPrompt); // Using chathub 4 for summary
    await chatHubManager.waitForChathubResponse(4);
    
    // Copy summary
    const summary = await chatHubManager.copyChathubResponse(4);

    // 5. Wait for both clipboard copy and file download
    // Setup listeners for both operations
    const downloadPromise = mainPage.waitForEvent('download');
    const clipboardPromise = mainPage.evaluate(() => navigator.clipboard.readText());

    // The final document should trigger both operations
    const download = await downloadPromise;
    const clipboardContent = await clipboardPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/devteam-responses-.*\.md/);

    // Verify clipboard content contains both responses and summary
    expect(clipboardContent).toContain(testPrompt); // Should contain original prompt
    for (const response of responses) {
      expect(clipboardContent).toContain(response); // Should contain each team response
    }
    expect(clipboardContent).toContain(summary); // Should contain the summary

    // 6. Reset All Conversations
    const resetButton = mainPage.locator('button:has-text("RESET ALL CONVERSATIONS")');
    await resetButton.click();

    // Verify reset state
    await expect(mainPage.locator('textarea')).toBeEmpty();
    await expect(mainPage.locator('[data-testid="team-1"]')).not.toHaveClass(/selected/);
    await expect(mainPage.locator('[data-testid="team-2"]')).not.toHaveClass(/selected/);
    await expect(mainPage.locator('.team-response')).not.toBeVisible();
  });

  test('verify clipboard and download content match', async () => {
    // Setup test
    await mainPage.locator('[data-testid="team-1"]').click();
    await mainPage.locator('textarea').fill('Test prompt for content verification');
    await mainPage.locator('button:has-text("START")').click();

    // Wait for processing and responses
    await chatHubManager.waitForChathubResponse(1);

    // Get both clipboard and downloaded content
    const downloadPromise = mainPage.waitForEvent('download');
    const clipboardPromise = mainPage.evaluate(() => navigator.clipboard.readText());

    const download = await downloadPromise;
    const clipboardContent = await clipboardPromise;

    // Download the file and read its content
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error('Download failed');
    
    const fs = require('fs');
    const downloadContent = fs.readFileSync(downloadPath, 'utf8');

    // Verify contents match
    expect(downloadContent).toBe(clipboardContent);
  });

  test('error handling', async () => {
    // Test empty input
    const startButton = mainPage.locator('button:has-text("START")');
    await startButton.click();
    await expect(mainPage.locator('[data-testid="error-message"]')).toHaveText('Please enter a prompt...');

    // Test no team selection
    await mainPage.locator('textarea').fill('Test prompt');
    await startButton.click();
    await expect(mainPage.locator('[data-testid="error-message"]')).toHaveText('Please select at least one team...');
  });

  test('chathub error recovery', async () => {
    // Select team and enter prompt
    await mainPage.locator('[data-testid="team-1"]').click();
    await mainPage.locator('textarea').fill('Test prompt');
    await mainPage.locator('button:has-text("START")').click();

    // Simulate chathub error by closing and reopening
    const hub1 = chatHubManager.getChathub(1);
    if (hub1) {
      await hub1.browser.close();
      
      // Reinitialize chathub 1
      const browser = await chromium.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto('https://chat.openai.com');
      
      // Update manager with new browser/page
      chatHubManager['chathubs'][0] = { browser, page, id: 1 };
    }

    // Verify system recovers
    await expect(mainPage.locator('.team-response')).toBeVisible({ timeout: 30000 });
  });
}); 