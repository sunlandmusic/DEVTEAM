import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { TasksButton } from './TasksButton';
import { useAutomationStore } from '../services/store';
import { UsageIndicator } from './UsageIndicator';
import { OpenRouterService } from '../services/OpenRouterService';

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
`;

const TooltipContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;

  &:hover {
    z-index: 99999;
  }
`;

const Tooltip = styled.span`
  position: absolute;
  bottom: -44px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;

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
  padding: 10px;
  opacity: ${props => props.$isDisabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 28px;
    height: 28px;
    color: rgba(255, 255, 255, 0.9);
    transform: ${props => props.$isSend ? 'rotate(-30deg)' : props.$isStop ? 'rotate(180deg)' : 'none'};
  }
`;

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="22" x2="12" y2="13"/>
    <polygon points="12 2 20 13 4 13 12 2"/>
  </svg>
);

const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="5" width="14" height="14" />
  </svg>
);

interface ToolbarProps {
  disabled?: boolean;
  onTaskModeChange: (isTaskMode: boolean) => void;
  isTaskMode: boolean;
  onSend: () => void;
  onStop?: () => void;
  hasTasks: boolean;
  isProcessing: boolean;
}

export function Toolbar({ 
  disabled, 
  onTaskModeChange, 
  isTaskMode, 
  onSend, 
  onStop,
  hasTasks,
  isProcessing 
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
          <PaperclipIcon />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="*/*"
          />
        </ToolButton>
        <Tooltip>Attach (file upload max 1MB)</Tooltip>
      </TooltipContainer>

      <TasksButton 
        isActive={isTaskMode}
        onToggle={() => onTaskModeChange(!isTaskMode)}
        disabled={false}
      />

      <TooltipContainer style={{ position: 'relative', zIndex: showUsage ? 99999 : 1 }}>
        <ToolButton 
          ref={settingsButtonRef}
          onClick={() => setShowUsage(!showUsage)}
          $isDisabled={false}
          $isActive={showUsage}
        >
          <SettingsIcon />
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
          {isProcessing ? <StopIcon /> : <SendIcon />}
        </ToolButton>
        <Tooltip>{isProcessing ? 'Stop' : 'Start'}</Tooltip>
      </TooltipContainer>
    </ToolbarContainer>
  );
}