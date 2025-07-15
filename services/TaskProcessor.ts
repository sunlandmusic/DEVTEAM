import { Browser } from 'playwright';
import { BrowserManager } from './BrowserManager';
import { useAutomationStore } from './store';

export interface Task {
  id: string;
  teamId: number;
  prompt: string;
  attachments: string[];
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: Error;
  dependencies?: string[]; // IDs of tasks that must complete before this one
}

export interface TeamTaskMap {
  [teamId: number]: Task[];
}

export class TaskProcessor {
  private browserManager: BrowserManager;
  private taskQueues: TeamTaskMap = {};
  private processing: boolean = false;
  private teamProcessingStatus: { [teamId: number]: boolean } = {};

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
    // Initialize queues for all teams
    [1, 2, 3, 4].forEach(teamId => {
      this.taskQueues[teamId] = [];
      this.teamProcessingStatus[teamId] = false;
    });
  }

  addTask(task: Omit<Task, 'id' | 'status'>): string {
    const id = crypto.randomUUID();
    const newTask: Task = {
      ...task,
      id,
      status: 'queued'
    };
    
    // Add task to the specific team's queue
    this.taskQueues[task.teamId].push(newTask);
    return id;
  }

  private async processTeamTasks(teamId: number): Promise<void> {
    if (this.teamProcessingStatus[teamId]) return;

    const queue = this.taskQueues[teamId];
    if (queue.length === 0) return;

    this.teamProcessingStatus[teamId] = true;
    const browser = this.browserManager.getBrowserInstance(teamId);

    try {
      while (queue.length > 0) {
        const task = queue[0];
        
        // Check dependencies if any
        if (task.dependencies) {
          const unfinishedDeps = task.dependencies.filter(depId => 
            Object.values(this.taskQueues)
              .flat()
              .some(t => t.id === depId && t.status !== 'completed')
          );
          if (unfinishedDeps.length > 0) {
            // Skip this task for now, will retry on next iteration
            break;
          }
        }

        await this.processTask(task, browser);
        queue.shift(); // Remove the processed task
      }
    } finally {
      this.teamProcessingStatus[teamId] = false;
    }
  }

  private async processTask(task: Task, browser: Browser | null): Promise<void> {
    if (!browser) {
      throw new Error(`No browser instance available for team ${task.teamId}`);
    }

    try {
      task.status = 'processing';
      useAutomationStore.getState().startTeamProcessing(task.teamId);

      // Process the task using the browser
      const result = await this.executeTask(browser, task);
      
      task.status = 'completed';
      task.result = result;
      useAutomationStore.getState().addCompletedTeam(task.teamId);

    } catch (error) {
      task.status = 'error';
      task.error = error as Error;
      useAutomationStore.getState().addError(task.teamId, error as Error);
      
      // Attempt browser recovery
      await this.browserManager.recoverBrowser(task.teamId);
    }
  }

  private async executeTask(browser: Browser, task: Task): Promise<string> {
    const page = await browser.newPage();
    
    try {
      // Set up page
      await page.setViewportSize(this.browserManager['config'].viewport);
      
      // Handle file attachments if any
      if (task.attachments.length > 0) {
        // Implement file attachment handling here
        // This will depend on your specific UI implementation
      }

      // Execute the task
      // This is where you'll implement the specific task execution logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      
      return `Processed by Team ${task.teamId}: ${task.prompt}`;
    } finally {
      await page.close();
    }
  }

  async startProcessing(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      // Process all team queues in parallel
      await Promise.all(
        Object.keys(this.taskQueues).map(teamId => 
          this.processTeamTasks(Number(teamId))
        )
      );
    } finally {
      this.processing = false;
      // Stop processing for all teams
      Object.keys(this.teamProcessingStatus).forEach(teamId => {
        const id = Number(teamId);
        this.teamProcessingStatus[id] = false;
        useAutomationStore.getState().stopTeamProcessing(id);
      });
    }
  }

  async stopProcessing(): Promise<void> {
    this.processing = false;
    Object.keys(this.teamProcessingStatus).forEach(teamId => {
      const id = Number(teamId);
      this.teamProcessingStatus[id] = false;
      useAutomationStore.getState().stopTeamProcessing(id);
    });
  }

  getQueueStatus(): {
    processing: boolean;
    queueLengths: { [teamId: number]: number };
    currentTasks: { [teamId: number]: Task | undefined };
  } {
    return {
      processing: this.processing,
      queueLengths: Object.fromEntries(
        Object.entries(this.taskQueues).map(([teamId, queue]) => [teamId, queue.length])
      ),
      currentTasks: Object.fromEntries(
        Object.entries(this.taskQueues).map(([teamId, queue]) => [teamId, queue[0]])
      )
    };
  }
} 