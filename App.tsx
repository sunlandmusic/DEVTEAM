import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { SupercomputerIcon } from './components/SupercomputerIcon';
import { SlotAnimation } from './components/SlotAnimation';
import { DogonMask } from './components/DogonMask';
import { Toolbar } from './components/Toolbar';
import { TeamSelectorButtons } from './components/TeamSelectorButtons';
import { TextInputArea } from './components/TextInputArea';
import { FileList } from './components/FileList';
import { OpenRouterService } from './services/OpenRouterService';
import { useAutomationStore } from './services/store';
import { TeamResponse, AppState, TeamId } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import styled from 'styled-components';
import { FileAttachments } from './components/FileAttachments';
import { PromptButton } from './components/PromptButton';

// Add Mode Toggle Switch Component
const ModeToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

// Only show the active label centered
const ToggleLabelActive = styled.div`
    width: 100%;
  text-align: center;
  font-size: 0.95rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  z-index: 2;
  position: relative;
`;

// Remove ModeLabel and ToggleLabels
// Add side labels
const SideLabel = styled.div`
  font-size: 0.75rem;
  color: #aaa;
  margin: 0 10px;
  min-width: 70px;
  text-align: center;
`;

const ToggleSwitch = styled.div<{ $isPremium: boolean }>`
  position: relative;
  width: 120px;
  height: 33px;
  background: #444;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ToggleLabels = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
    width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  pointer-events: none;
`;

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" />
    <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" />
  </svg>
);

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Add global styles
const globalStyles = `
  @keyframes pulseGlow {
    0% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
    100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  background: #000;
  color: white;
  width: 100%;
  overflow-x: hidden;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  margin: 0;
  padding: 0;
  line-height: 1;
  text-align: center;
`;

const Subtitle = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 0;
  padding: 0;
  line-height: 1;
`;

const InputContainer = styled.div`
  width: 100%;
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin: 0 auto;
  position: relative;
  
  &.has-responses {
    margin-bottom: 0.5rem;
  }
`;

const InputWrapper = styled.div`
  width: 36rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 auto;
`;

const ToolbarContainer = styled.div`
  width: 36rem;
  background: rgba(51, 51, 51, 0.8);
  backdrop-filter: blur(8px);
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const ProcessingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ProcessingText = styled.div`
  color: white;
  font-size: 1.5rem;
  text-align: center;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const ResponseText = styled.div`
  color: rgba(255, 255, 255, 0.87);
  font-size: 16px;
  line-height: 1.5;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
`;

const TeamHeader = styled.h3`
  color: rgba(255, 255, 255, 0.87);
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  height: 36px;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s;
  color: white;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.copy-button {
    background: rgb(75, 75, 75);
    &:hover:not(:disabled) { background: rgb(90, 90, 90); }
  }
  
  &.export-button {
    background: rgb(147, 51, 234);
    &:hover:not(:disabled) { background: rgba(147, 51, 234, 0.8); }
  }
  
  &.clear-button {
    background: rgb(0, 0, 139);
    &:hover:not(:disabled) { background: rgba(0, 0, 139, 0.8); }
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TaskInputContainer = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;

const TaskPromptInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(128, 128, 128, 0.8); // Grey border
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease-in-out;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(128, 128, 128, 1);
  }
`;

const AttachmentButton = styled.button`
  width: 100%;
  height: 38px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.8);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }
`;

const TeamSelectContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -11px;
`;

const TeamSelectButton = styled.select`
  width: 100%;
  height: 38px;
  padding: 0 8px;
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.8);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }

  &:focus {
    outline: none;
    border-color: rgba(128, 128, 128, 1);
  }

  option {
    background: #000;
    color: white;
  }
`;

const AddTaskButton = styled.button`
  width: 100%;
  padding: 10px;
  background: rgb(147, 51, 234);
  border: 2px solid #000000; // Thicker black border
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(147, 51, 234, 0.8);
  }
`;

const TaskActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;

  &:hover {
    opacity: 0.8;
  }
`;

const RemoveButton = styled(TaskActionButton)`
  display: flex;
  align-items: center;
  gap: 4px;

  &::after {
    content: "×";
    color: #ff4444;
    font-size: 18px;
    font-weight: bold;
    margin-left: 2px;
  }
`;

interface StartProcessingButtonProps {
  $isProcessing: boolean;
}

const StartProcessingButton = styled.button<StartProcessingButtonProps>`
  width: 100%;
  padding: 12px;
  background: rgb(147, 51, 234);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-top: 16px;

  &:hover {
    background: rgba(147, 51, 234, 0.8);
  }

  ${props => props.$isProcessing && `
    background: rgba(0, 0, 0, 0.8);
  `}
`;

const App: React.FC = () => {
  const [taskPrompt, setTaskPrompt] = useState('');
  const [taskAttachments, setTaskAttachments] = useState<File[]>([]);
  const [taskTeam, setTaskTeam] = useState<TeamId | null>(null);
  const [taskQueue, setTaskQueue] = useState<any[]>([]);
  const { 
    attachments, 
    processingStatus, 
    startTeamProcessing, 
    stopTeamProcessing, 
    addCompletedTeam, 
    addError, 
    processTasks,
    // DEV TEAM global state
    devTeamResponses,
    setDevTeamResponses,
    addDevTeamResponse,
    clearDevTeamResponses,
    devTeamProcessing,
    setDevTeamProcessing,
    devTeamPrompt,
    setDevTeamPrompt,
    devTeamSelectedTeams,
    setDevTeamSelectedTeams,
    devTeamIsTaskMode,
    setDevTeamIsTaskMode,
    devTeamIsPremiumMode,
    setDevTeamIsPremiumMode
  } = useAutomationStore();
  const openRouterService = OpenRouterService();
  const teams: TeamId[] = [1, 2, 3, 4];
  const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDevTeamTooltip, setShowDevTeamTooltip] = useState(false);
  
  // Add state for three modes
  const [devTeamModelMode, setDevTeamModelMode] = useState<'economy' | 'pro' | 'premium'>('economy');

  // --- Aggregated Action Handlers ---
  const handleCopyAllResponses = async () => {
    if (devTeamResponses.length === 0) return;
    // Replace model HTML header with Markdown heading
    const htmlHeaderRegex = /<span style=\\?"color: #a855f7; font-weight: bold;\\?">(.*?)<\\?\/span>/g;
    const text = devTeamResponses.map((tr: TeamResponse) => {
      let resp = tr.response.replace(htmlHeaderRegex, (_: string, header: string) => `# ${header}`);
      return `Team ${tr.teamId} Response:\n\n${resp}\n\n`;
    }).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExportAllResponses = () => {
    if (devTeamResponses.length === 0) return;
    // Replace model HTML header with Markdown heading
    const htmlHeaderRegex = /<span style=\\?"color: #a855f7; font-weight: bold;\\?">(.*?)<\\?\/span>/g;
    const text = devTeamResponses.map((tr: TeamResponse) => {
      // Replace all model headers in the response
      let resp = tr.response.replace(htmlHeaderRegex, (_: string, header: string) => `# ${header}`);
      return `Team ${tr.teamId} Response:\n\n${resp}\n\n`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aggregated_responses.md';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearAllResponses = () => {
    clearDevTeamResponses();
  };

  const handleTeamSelect = (teamId: TeamId) => {
    if (processingStatus.processingTeams.includes(teamId)) {
      stopTeamProcessing(teamId);
    } else if (devTeamIsTaskMode) {
      // In task mode, allow multiple selections
      if (devTeamSelectedTeams.includes(teamId)) {
        setDevTeamSelectedTeams(devTeamSelectedTeams.filter((id: TeamId) => id !== teamId));
      } else {
        setDevTeamSelectedTeams([...devTeamSelectedTeams, teamId]);
      }
    } else {
      // In regular mode, only allow one selection
      if (devTeamSelectedTeams.includes(teamId)) {
        setDevTeamSelectedTeams([]);
      } else {
        setDevTeamSelectedTeams([teamId]);
      }
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setTaskAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditTask = (idx: number) => {
    const task = taskQueue[idx];
    setTaskPrompt(task.prompt);
    setTaskAttachments(task.attachments);
    setTaskTeam(task.team);
    setEditTaskIndex(idx);
  };

  const handleAddTask = () => {
    if (!taskPrompt.trim() || !taskTeam) return;
    if (editTaskIndex !== null) {
      setTaskQueue(prev => prev.map((t, i) => i === editTaskIndex ? {
        prompt: taskPrompt,
        attachments: [...taskAttachments],
        team: taskTeam
      } : t));
      setEditTaskIndex(null);
    } else {
      setTaskQueue(prev => [
        ...prev,
        {
          prompt: taskPrompt,
          attachments: [...taskAttachments],
          team: taskTeam
        }
      ]);
      // Auto-select the team for this task
      setDevTeamSelectedTeams(devTeamSelectedTeams.includes(taskTeam) ? devTeamSelectedTeams : [...devTeamSelectedTeams, taskTeam]);
    }
    setTaskPrompt('');
    setTaskAttachments([]);
    setTaskTeam(null);
  };

  const handleRemoveTask = (idx: number) => {
    setTaskQueue(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (devTeamProcessing) {
      setDevTeamProcessing(false);
      processingStatus.processingTeams.forEach(teamId => {
        stopTeamProcessing(teamId);
      });
    } else {
      setDevTeamProcessing(true);
      try {
        if (devTeamIsTaskMode && taskQueue.length > 0) {
          // Multi-Task mode: process tasks with 4-second staggered delays
          const timestamp = new Date().toISOString();
          const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
          const STAGGER_DELAY_MS = 4000; // 4 seconds between task starts
          
          const results: TeamResponse[] = [];
          
          for (let i = 0; i < taskQueue.length; i++) {
            const task = taskQueue[i];
            
            // Start processing for this team
            startTeamProcessing(task.team);
            
            // Add delay between task starts (except for the first task)
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, STAGGER_DELAY_MS));
            }
            
            let timedOut = false;
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => {
                timedOut = true;
                reject(new Error('Timed out'));
              }, TIMEOUT_MS)
            );
            
            try {
              const response = await Promise.race([
                openRouterService.sendPrompt(
                  task.prompt,
                  task.attachments || [],
                  task.team,
                  devTeamModelMode
                ),
                timeoutPromise
              ]) as string;
              
              addCompletedTeam(task.team);
              results.push({
                teamId: task.team,
                prompt: task.prompt,
                response,
                timestamp,
                attachments: (task.attachments || []).map((att: any) => att.url).filter(Boolean)
              });
    } catch (error) {
              addError(task.team, error as Error);
              results.push({
                teamId: task.team,
                prompt: task.prompt,
                response: timedOut ? 'Error: Timed out after 2 minutes.' : `Error: ${String(error)}`,
                timestamp,
                attachments: (task.attachments || []).map((att: any) => att.url).filter(Boolean)
              });
            }
          }
          
          setDevTeamResponses(results);
      } else {
          // Regular processing
          if (devTeamSelectedTeams.length === 0) return;
          for (const teamId of devTeamSelectedTeams) {
            startTeamProcessing(teamId);
          }
          const timestamp = new Date().toISOString();
          const attachmentUrls = attachments.map(att => att.url).filter(Boolean) as string[];
          openRouterService.sendPrompt(devTeamPrompt, attachments, devTeamSelectedTeams[0], devTeamModelMode)
            .then(response => {
              addDevTeamResponse({
                teamId: devTeamSelectedTeams[0],
                prompt: devTeamPrompt,
                response: response.replace(/^Aggregated Responses:\s*/g, ''),
                timestamp,
                attachments: attachmentUrls
              });
              addCompletedTeam(devTeamSelectedTeams[0]);
            })
            .catch(error => {
              console.error(`Error processing team ${devTeamSelectedTeams[0]}:`, error);
              addError(devTeamSelectedTeams[0], error as Error);
            });
        }
      } catch (error) {
        console.error('Error processing:', error);
      } finally {
        setDevTeamProcessing(false);
      }
    }
  };

  const handleModeToggle = () => {
    setDevTeamIsPremiumMode(!devTeamIsPremiumMode);
  };

  // Effect: Auto-download .md and reset UI after all tasks complete in Task Fulfillment mode
  useEffect(() => {
    if (devTeamIsTaskMode && taskQueue.length > 0 && devTeamResponses.length === taskQueue.length) {
      // Auto-download .md
      const htmlHeaderRegex = /<span style=\"color: #a855f7; font-weight: bold;\">(.*?)<\/?span>/g;
      const text = devTeamResponses.map((tr: TeamResponse) => {
        let resp = tr.response.replace(htmlHeaderRegex, (_: string, header: string) => `# ${header}`);
        return `Team ${tr.teamId} Response:\n\n${resp}\n\n`;
      }).join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aggregated_responses.md';
      a.click();
      window.URL.revokeObjectURL(url);
      // Reset UI
      setTaskQueue([]);
      clearDevTeamResponses();
      setDevTeamIsTaskMode(false);
      setDevTeamPrompt('');
      setDevTeamSelectedTeams([]);
    }
  }, [devTeamIsTaskMode, taskQueue, devTeamResponses, clearDevTeamResponses, setDevTeamIsTaskMode, setDevTeamPrompt, setDevTeamSelectedTeams]);

  // Calculate if the Send button should be enabled and if we're in processing mode
  const hasTeamsToProcess = devTeamSelectedTeams.some(teamId => !processingStatus.processingTeams.includes(teamId));
  const isSendEnabled = devTeamPrompt.trim() !== '' && hasTeamsToProcess;
  const isInProcessingMode = processingStatus.processingTeams.length > 0;

  return (
    <>
      <style>{globalStyles}</style>
      <Container>
        <div className="relative w-full min-h-screen">
          <main className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 z-10">
            <div 
              className="text-center relative"
              onMouseEnter={() => setShowDevTeamTooltip(true)}
              onMouseLeave={() => setShowDevTeamTooltip(false)}
              style={{ marginTop: '0px', marginBottom: '16px' }}
            >
              <Title>DEV TEAM</Title>
              <div 
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '8px',
                  width: 'max-content',
                  pointerEvents: 'none',
                }} 
                className={`dev-team-tooltip ${showDevTeamTooltip ? 'visible' : ''}`}
              >
                leveraging the power of {devTeamIsPremiumMode ? '16' : '4'} A.i. models simultaneously
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-8 w-full px-4 max-w-2xl">
              {teams.map(id => (
                <SupercomputerIcon
                  key={id}
                  teamId={id}
                  onClick={() => handleTeamSelect(id)}
                  isSelected={devTeamSelectedTeams.includes(id)}
                  isCurrentlyProcessing={processingStatus.processingTeams.includes(id)}
                />
              ))}
            </div>

            <div className="flex items-center gap-8 relative">
              <div style={{ position: 'relative', zIndex: 2 }}>
                <DogonMask isProcessing={processingStatus.processingTeams.length > 0} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '18px 0 0 0', minHeight: 40 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <PromptButton onSelectPrompt={setDevTeamPrompt} />
                <button
                  onClick={() => setDevTeamModelMode('economy')}
                  style={{
                    padding: '8px 16px',
                    background: devTeamModelMode === 'economy' ? '#444' : 'transparent',
                    color: devTeamModelMode === 'economy' ? '#fff' : '#666',
                    border: '1px solid #444',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (devTeamModelMode !== 'economy') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#aaa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (devTeamModelMode !== 'economy') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                >
                  ECONOMY
                </button>
                <button
                  onClick={() => setDevTeamModelMode('pro')}
                  style={{
                    padding: '8px 16px',
                    background: devTeamModelMode === 'pro' ? '#444' : 'transparent',
                    color: devTeamModelMode === 'pro' ? '#fff' : '#666',
                    border: '1px solid #444',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (devTeamModelMode !== 'pro') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#aaa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (devTeamModelMode !== 'pro') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                >
                  PRO
                </button>
                <button
                  onClick={() => setDevTeamModelMode('premium')}
                  style={{
                    padding: '8px 16px',
                    background: devTeamModelMode === 'premium' ? '#444' : 'transparent',
                    color: devTeamModelMode === 'premium' ? '#fff' : '#666',
                    border: '1px solid #444',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (devTeamModelMode !== 'premium') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#aaa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (devTeamModelMode !== 'premium') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                >
                  PREMIUM
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-0 relative" style={{ marginTop: '0px' }}>
              <InputContainer className={devTeamResponses.length > 0 ? 'has-responses' : ''} style={{ gap: 0, marginBottom: 0, width: '100%', maxWidth: '36rem' }}>
                <div style={{ margin: 0, padding: 0, width: '100%' }}>
          <TextInputArea
                        value={devTeamPrompt}
                        onChange={setDevTeamPrompt}
                        disabled={false}
                        onSend={handleSend}
                      />
                    </div>
                    <div style={{ margin: 0, padding: 0, width: '100%' }}>
                      <FileList />
                    </div>
                    <div style={{ margin: 0, padding: 0, width: '100%' }}>
          <Toolbar
                        disabled={!devTeamPrompt.trim() && (!devTeamIsTaskMode || taskQueue.length === 0)}
                        onTaskModeChange={setDevTeamIsTaskMode}
                        isTaskMode={devTeamIsTaskMode}
                        onSend={handleSend}
                        onStop={() => handleSend()}
                        hasTasks={taskQueue.length > 0}
                        isProcessing={devTeamProcessing}
                      />
                    </div>
                  </InputContainer>

                  {devTeamIsTaskMode && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      marginTop: '2rem',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ flex: 1, maxWidth: 400, background: 'rgba(51,51,51,0.8)', borderRadius: 12, padding: 24, marginRight: 24 }}>
                        <h3 style={{ color: 'white', marginBottom: 16 }}>Add Task</h3>
                        <TaskInputContainer>
                          <TaskPromptInput
                            value={taskPrompt}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTaskPrompt(e.target.value)}
                            placeholder="Task prompt"
                          />
                        </TaskInputContainer>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <input
                                id="task-attachment-input"
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleAddAttachment}
                              />
                              <AttachmentButton
                                onClick={() => document.getElementById('task-attachment-input')?.click()}
                              >
                                + Add Attachment
                              </AttachmentButton>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, width: '100%' }}>
                                {taskAttachments.map((file, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 4 }}>
                                    <span style={{ color: 'white', fontSize: 14 }}>{file.name}</span>
                                    <button
                                      onClick={() => handleRemoveAttachment(idx)}
                                      style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <TeamSelectContainer>
                              <TeamSelectButton
                                value={taskTeam ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTaskTeam(Number(e.target.value) as TeamId)}
                              >
                                <option value="">Select Team</option>
                                {teams.map(id => (
                                  <option key={id} value={id}>Team {id}</option>
                                ))}
                              </TeamSelectButton>
                            </TeamSelectContainer>
                          </div>
                        </div>
                        <AddTaskButton onClick={handleAddTask}>
                          {editTaskIndex !== null ? 'Save Task' : 'Add Task'}
                        </AddTaskButton>
                      </div>
                      <div style={{ minWidth: 320, maxWidth: 400, background: 'rgba(31,31,31,0.8)', borderRadius: 12, padding: 24 }}>
                        <h3 style={{ color: '#9333ea', marginBottom: 16 }}>Task Queue</h3>
                        {taskQueue.length === 0 ? (
                          <div style={{ color: 'rgba(255,255,255,0.7)' }}>No tasks scheduled.</div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {taskQueue.map((task, idx) => (
                              <li key={idx} style={{ marginBottom: 16, background: 'rgba(51,51,51,0.5)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ color: '#9333ea', fontWeight: 500, fontSize: 15 }}>Team {task.team}</div>
                                {task.attachments.length > 0 && (
                                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                                    Attachments: {task.attachments.map((file: File) => file.name).join(', ')}
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <TaskActionButton onClick={() => handleEditTask(idx)}>
                                    Edit
                                  </TaskActionButton>
                                  <RemoveButton onClick={() => handleRemoveTask(idx)}>
                                    Remove
                                  </RemoveButton>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  <TeamSelectorButtons
                    selectedTeams={devTeamSelectedTeams}
                    onSelectTeam={handleTeamSelect}
                  />
                </div>

                {devTeamResponses.length > 0 && (
                  <div className="w-full flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 mt-4">
                      <ActionButton 
                        onClick={handleCopyAllResponses}
                        disabled={devTeamResponses.length === 0}
                        className="copy-button flex items-center gap-2"
                        aria-label="Copy responses to clipboard"
                      >
                        <CopyIcon className="w-4 h-4" />
                        {copied ? 'COPIED' : 'Copy'}
                      </ActionButton>
                      <ActionButton 
                        onClick={handleExportAllResponses}
                        disabled={devTeamResponses.length === 0}
                        className="export-button flex items-center gap-2"
                        aria-label="Export responses to Markdown"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Export
                      </ActionButton>
                      <ActionButton 
                        onClick={handleClearAllResponses}
                        disabled={devTeamResponses.length === 0}
                        className="clear-button flex items-center gap-2"
                        aria-label="Clear all responses"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Clear
                      </ActionButton>
                    </div>

                    <div className="w-full">
                      {devTeamResponses.map((tr, index) => (
                        <div key={index}>
                          <TeamHeader>Team {tr.teamId}:</TeamHeader>
                          <ResponseText dangerouslySetInnerHTML={{ __html: tr.response }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </Container>
        </>
      );
    };

    export default App;
