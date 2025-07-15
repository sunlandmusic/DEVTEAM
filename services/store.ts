import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TeamId, TeamResponse } from '../types';

export interface FileAttachment {
  id: string;
  name: string;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  content?: string;
}

export interface Task {
  id: string;
  prompt: string;
  attachments: Array<{ name: string; path: string }>;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

type TeamRecord<T> = Partial<Record<TeamId, T>>;

interface ProcessingStatus {
  processingTeams: TeamId[];
  completedTeams: TeamId[];
  errors: TeamRecord<Error>;
}

export interface BrowserStatus {
  ready: boolean;
  instances: Record<number, boolean>;
}

interface AutomationState {
  // Team Selection
  activeTeams: number[];
  setActiveTeams: (teams: number[]) => void;

  // File Attachments
  attachments: FileAttachment[];
  addAttachment: (name: string) => FileAttachment;
  updateAttachment: (id: string, status: FileAttachment['status'], url?: string, content?: string) => void;
  removeAttachment: (id: string) => void;

  // Task Queue
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  processTasks: () => Promise<void>;
  clearTasks: () => void;

  // Processing Status
  processingStatus: ProcessingStatus;
  setProcessingStatus: (status: Partial<ProcessingStatus>) => void;
  startTeamProcessing: (teamId: TeamId) => void;
  stopTeamProcessing: (teamId: TeamId) => void;
  addCompletedTeam: (teamId: TeamId) => void;
  addError: (teamId: TeamId, error: Error) => void;

  // Browser Status
  browserStatus: BrowserStatus;
  setBrowserStatus: (status: Partial<BrowserStatus>) => void;
  updateBrowserInstance: (instanceId: number, ready: boolean) => void;

  // New fields
  isProcessing: boolean;
  currentTaskId: string | null;
  responses: TeamRecord<string>;
  setCurrentTaskId: (taskId: string | null) => void;
  updateProcessingStatus: (status: ProcessingStatus) => void;
  setTeamResponse: (teamId: TeamId, response: string) => void;
  clearTeamResponse: (teamId: TeamId) => void;
  cleanerResult: string;
  setCleanerResult: (result: string) => void;
  clearCleanerResult: () => void;
  cleanerProcessing: boolean;
  setCleanerProcessing: (processing: boolean) => void;

  preparationResult: string;
  setPreparationResult: (result: string) => void;
  clearPreparationResult: () => void;
  preparationProcessing: boolean;
  setPreparationProcessing: (processing: boolean) => void;

  // DEV TEAM state
  devTeamResponses: TeamResponse[];
  setDevTeamResponses: (responses: TeamResponse[]) => void;
  addDevTeamResponse: (response: TeamResponse) => void;
  clearDevTeamResponses: () => void;
  devTeamProcessing: boolean;
  setDevTeamProcessing: (processing: boolean) => void;
  devTeamPrompt: string;
  setDevTeamPrompt: (prompt: string) => void;
  devTeamSelectedTeams: TeamId[];
  setDevTeamSelectedTeams: (teams: TeamId[]) => void;
  devTeamIsTaskMode: boolean;
  setDevTeamIsTaskMode: (isTaskMode: boolean) => void;
  devTeamIsPremiumMode: boolean;
  setDevTeamIsPremiumMode: (isPremiumMode: boolean) => void;
}

const initialProcessingStatus: ProcessingStatus = {
  processingTeams: [] as TeamId[],
  completedTeams: [] as TeamId[],
  errors: {},
};

export const useAutomationStore = create<AutomationState>((set, get) => ({
  // Team Selection
  activeTeams: [],
  setActiveTeams: (teams) => set({ activeTeams: teams }),

  // File Attachments
  attachments: [],
  addAttachment: (name) => {
    const newAttachment: FileAttachment = {
      id: uuidv4(),
      name,
      status: 'uploading'
    };
    set((state) => ({
      attachments: [...state.attachments, newAttachment]
    }));
    return newAttachment;
  },
  updateAttachment: (id, status, url, content) => {
    set((state) => ({
      attachments: state.attachments.map((att) =>
        att.id === id ? { ...att, status, url, content } : att
      )
    }));
  },
  removeAttachment: (id) => {
    set((state) => ({
      attachments: state.attachments.filter((att) => att.id !== id)
    }));
  },

  // Task Queue
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  processTasks: async () => {
    const { tasks } = get();
    if (tasks.length === 0) return;
    
    set({ isProcessing: true });
    try {
      // Process tasks logic here
      // This is just a placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      set({ isProcessing: false });
    }
  },
  clearTasks: () => set({ tasks: [] }),

  // Processing Status
  processingStatus: initialProcessingStatus,
  setProcessingStatus: (status) =>
    set((state) => ({
      processingStatus: { ...state.processingStatus, ...status }
    })),
  startTeamProcessing: (teamId: TeamId) =>
    set((state) => ({
      processingStatus: {
        ...state.processingStatus,
        processingTeams: [...state.processingStatus.processingTeams, teamId as TeamId]
      }
    })),
  stopTeamProcessing: (teamId: TeamId) =>
    set((state) => ({
      processingStatus: {
        ...state.processingStatus,
        processingTeams: state.processingStatus.processingTeams.filter(id => id !== teamId)
      }
    })),
  addCompletedTeam: (teamId: TeamId) =>
    set((state) => ({
      processingStatus: {
        ...state.processingStatus,
        processingTeams: state.processingStatus.processingTeams.filter(id => id !== teamId),
        completedTeams: [...state.processingStatus.completedTeams, teamId as TeamId]
      }
    })),
  addError: (teamId: TeamId, error: Error) =>
    set((state) => ({
      processingStatus: {
        ...state.processingStatus,
        processingTeams: state.processingStatus.processingTeams.filter(id => id !== teamId),
        errors: { ...state.processingStatus.errors, [teamId]: error }
      }
    })),

  // Browser Status
  browserStatus: {
    ready: false,
    instances: {}
  },
  setBrowserStatus: (status) =>
    set((state) => ({
      browserStatus: { ...state.browserStatus, ...status }
    })),
  updateBrowserInstance: (instanceId, ready) =>
    set((state) => ({
      browserStatus: {
        ...state.browserStatus,
        instances: { ...state.browserStatus.instances, [instanceId]: ready }
      }
    })),

  // New fields
  isProcessing: false,
  currentTaskId: null,
  responses: {},
  setCurrentTaskId: (taskId) =>
    set(() => ({
      currentTaskId: taskId,
    })),
  updateProcessingStatus: (status: ProcessingStatus) =>
    set(() => ({
      processingStatus: status,
    })),
  setTeamResponse: (teamId, response) =>
    set((state) => ({
      responses: {
        ...state.responses,
        [teamId]: response,
      },
    })),
  clearTeamResponse: (teamId) =>
    set((state) => {
      const newResponses = { ...state.responses };
      delete newResponses[teamId];
      return { responses: newResponses };
    }),
  cleanerResult: '',
  setCleanerResult: (result) => set({ cleanerResult: result }),
  clearCleanerResult: () => set({ cleanerResult: '' }),
  cleanerProcessing: false,
  setCleanerProcessing: (processing) => set({ cleanerProcessing: processing }),
  preparationResult: '',
  setPreparationResult: (result) => set({ preparationResult: result }),
  clearPreparationResult: () => set({ preparationResult: '' }),
  preparationProcessing: false,
  setPreparationProcessing: (processing) => set({ preparationProcessing: processing }),

  // DEV TEAM state
  devTeamResponses: [],
  setDevTeamResponses: (responses) => set({ devTeamResponses: responses }),
  addDevTeamResponse: (response) => set((state) => ({ devTeamResponses: [...state.devTeamResponses, response] })),
  clearDevTeamResponses: () => set({ devTeamResponses: [] }),
  devTeamProcessing: false,
  setDevTeamProcessing: (processing) => set({ devTeamProcessing: processing }),
  devTeamPrompt: '',
  setDevTeamPrompt: (prompt) => set({ devTeamPrompt: prompt }),
  devTeamSelectedTeams: [],
  setDevTeamSelectedTeams: (teams) => set({ devTeamSelectedTeams: teams }),
  devTeamIsTaskMode: false,
  setDevTeamIsTaskMode: (isTaskMode) => set({ devTeamIsTaskMode: isTaskMode }),
  devTeamIsPremiumMode: true,
  setDevTeamIsPremiumMode: (isPremiumMode) => set({ devTeamIsPremiumMode: isPremiumMode }),
})); 