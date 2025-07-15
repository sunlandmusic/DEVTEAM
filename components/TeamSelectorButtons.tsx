import React from 'react';
import { TeamSelectorButtonsProps, TeamId } from '../types';
import { useAutomationStore } from '../services/store';

export const TeamSelectorButtons: React.FC<TeamSelectorButtonsProps> = ({ selectedTeams, onSelectTeam }) => {
  const teams: TeamId[] = [1, 2, 3, 4];
  const { processingStatus } = useAutomationStore();
  const { processingTeams } = processingStatus;

  return (
    <div className="flex space-x-2 sm:space-x-3 p-2 bg-[rgba(51, 51, 51, 0.8)] backdrop-blur-sm rounded-xl shadow-lg">
      {teams.map(id => {
        const isProcessing = processingTeams.includes(id);
        const isSelected = selectedTeams.includes(id);

        return (
          <button
            key={id}
            onClick={() => onSelectTeam(id)}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50
                      ${isProcessing ? 'opacity-60 cursor-not-allowed bg-gray-600/40 text-gray-300' : 'hover:bg-purple-500/60'}
                      ${isSelected && !isProcessing
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 focus:ring-purple-400' 
                        : 'bg-gray-600/40 text-gray-300 hover:text-white focus:ring-purple-500'}`}
          >
            Team {id}
            {isProcessing && ' (Running)'}
          </button>
        );
      })}
    </div>
  );
};
