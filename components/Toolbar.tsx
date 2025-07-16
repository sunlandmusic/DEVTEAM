import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { TasksButton } from './TasksButton';
import { useAutomationStore } from '../services/store';
import { UsageIndicator } from './UsageIndicator';
import { OpenRouterService } from '../services/OpenRouterService';
import { PromptButton } from './PromptButton';

const ToolbarContainer = styled.div`
  width: 100%;
  max-width: 36rem;
  background: rgba(51, 51, 51, 0.8);
  backdrop-filter: blur(8px);
  padding: 0.206rem;
  border-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
`;

const TooltipContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;

  &:hover {
    z-index: 9999;
  }
`;

const Tooltip = styled.span`
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  border-radius: 4px;
  z-index: 9999;

  ${TooltipContainer}:hover & {
    opacity: 1;
  }
`;

const ToolButton = styled.button<{ $isDisabled?: boolean; $isSend?: boolean; $isStop?: boolean; $isActive?: boolean }>`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$isActive ? 'rgba(128, 0, 128, 0.3)' : 'transparent'};
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px;
  opacity: ${props => props.$isDisabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.2);
  }

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
  }
`;

const ICON_PATHS = {
  ATTACH: '/DEVTEAM/images/TOOLBAR ICONS/Attach.png',
  PROMPT: '/DEVTEAM/images/TOOLBAR ICONS/Prompt.png',
  MULTITASK: '/DEVTEAM/images/TOOLBAR ICONS/MultiTask.png',
  USAGE: '/DEVTEAM/images/TOOLBAR ICONS/Usage.png',
  START: '/DEVTEAM/images/TOOLBAR ICONS/START.png',
};

interface ToolbarProps {
  disabled?: boolean;
  onTaskModeChange: (isTaskMode: boolean) => void;
  isTaskMode: boolean;
  onSend: () => void;
  onStop?: () => void;
  hasTasks: boolean;
  isProcessing: boolean;
  onPromptSelect: (prompt: string) => void;
}

export function Toolbar({ 
  disabled, 
  onTaskModeChange, 
  isTaskMode, 
  onSend, 
  onStop,
  hasTasks,
  isProcessing,
  onPromptSelect
}: ToolbarProps) {
  const { addAttachment, updateAttachment, processingStatus } = useAutomationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [showUsage, setShowUsage] = useState(false);
  const openRouterService = OpenRouterService();
  const { used: usedCredits, total: totalCredits } = openRouterService.getCredits();

  const MAX_FILE_SIZE = 1024 * 1024; // 1MB

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        updateAttachment(
          addAttachment(file.name).id,
          'error'
        );
        continue;
      }
      if (!file.type.startsWith('text/')) {
        updateAttachment(
          addAttachment(file.name).id,
          'error'
        );
        continue;
      }
      const attachment = addAttachment(file.name);
      try {
        const text = await file.text();
        // Store the content in the attachment object (if your store supports it)
        updateAttachment(attachment.id, 'success', undefined, text.slice(0, MAX_FILE_SIZE));
      } catch (error) {
        updateAttachment(attachment.id, 'error');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addAttachment, updateAttachment]);

  return (
    <ToolbarContainer>      
      <TooltipContainer>
        <ToolButton 
          $isDisabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={ICON_PATHS.ATTACH} alt="Attach" />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="*/*"
          />
        </ToolButton>
        <Tooltip>Attach</Tooltip>
      </TooltipContainer>

      <TooltipContainer>
        <PromptButton onSelectPrompt={onPromptSelect} iconPath={ICON_PATHS.PROMPT} />
        <Tooltip>Prompt</Tooltip>
      </TooltipContainer>

      <TooltipContainer>
        <TasksButton 
          isActive={isTaskMode}
          onToggle={() => onTaskModeChange(!isTaskMode)}
          disabled={false}
          iconPath={ICON_PATHS.MULTITASK}
        />
        <Tooltip>Multi Task</Tooltip>
      </TooltipContainer>

      <TooltipContainer style={{ position: 'relative' }}>
        <ToolButton 
          ref={settingsButtonRef}
          onClick={() => setShowUsage(!showUsage)}
          $isDisabled={false}
          $isActive={showUsage}
        >
          <img src={ICON_PATHS.USAGE} alt="Usage" />
        </ToolButton>
        <Tooltip>Usage</Tooltip>
        <UsageIndicator 
          isVisible={showUsage}
          usedCredits={usedCredits}
          totalCredits={totalCredits}
          buttonRef={settingsButtonRef}
        />
      </TooltipContainer>

      <TooltipContainer>
        <ToolButton 
          onClick={isProcessing ? onStop : onSend}
          $isDisabled={disabled}
          $isSend={!isProcessing}
          $isStop={isProcessing}
          style={{ 
            backgroundColor: isProcessing ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
          }}
        >
          <img 
            src={ICON_PATHS.START} 
            alt={isProcessing ? 'Stop' : 'Start'} 
            style={{ transform: 'rotate(-44deg)' }}
          />
        </ToolButton>
        <Tooltip>{isProcessing ? 'Stop' : 'Start'}</Tooltip>
      </TooltipContainer>
    </ToolbarContainer>
  );
}