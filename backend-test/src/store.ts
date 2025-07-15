import { create } from "zustand";

interface BrowserState {
  isProcessing: boolean;
  activeTeams: number[];
  setActiveTeams: (teams: number[]) => void;
  toggleTeam: (teamId: number) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
}

export const useBrowserStore = create<BrowserState>((set) => ({
  isProcessing: false,
  activeTeams: [],
  
  setActiveTeams: (teams) => set({ activeTeams: teams }),
  
  toggleTeam: (teamId) => 
    set((state) => ({
      activeTeams: state.activeTeams.includes(teamId)
        ? state.activeTeams.filter(id => id !== teamId)
        : [...state.activeTeams, teamId]
    })),
    
  startProcessing: () => set({ isProcessing: true }),
  stopProcessing: () => set({ isProcessing: false })
}));
