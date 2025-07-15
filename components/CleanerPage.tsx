import React, { useState, useCallback, useRef } from 'react';
import { DogonMask } from './DogonMask';
import { TextInputArea } from './TextInputArea';
import { Toolbar } from './Toolbar';
import { UsageIndicator } from './UsageIndicator';
import { OpenRouterService } from '../services/OpenRouterService';
import { FileList } from './FileList';
import { useAutomationStore } from '../services/store';
import styled from 'styled-components';

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
`;

const InputWrapper = styled.div`
  width: 36rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 auto;
`;

// Mode Toggle Switch Component
const ModeToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

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

// New two-button switcher
const SwitcherContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SwitcherButton = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#444' : 'transparent'};
  color: ${props => props.$isActive ? '#fff' : '#666'};
  border: 1px solid #444;
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.$isActive ? '#444' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$isActive ? '#fff' : '#aaa'};
  }
`;

const ModelText = styled.div`
  font-size: 0.75rem;
  color: #aaa;
  text-align: center;
  line-height: 1.2;
  max-width: 300px;
`;

// Custom Cleaner Toolbar
const CleanerToolbarContainer = styled.div`
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

const ToolButton = styled.button<{ $isDisabled?: boolean; $isActive?: boolean }>`
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
  }
`;

const PromptsDropdown = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: inline-block;
`;

const PromptsButton = styled(ToolButton)`
  position: relative;
`;

const PromptsMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(51, 51, 51, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 0;
  margin-bottom: 8px;
  min-width: 200px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const PromptsMenuItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
  </svg>
);

const PromptsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
  </svg>
);

const UsageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const CleanIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="22" x2="12" y2="13"/>
    <polygon points="12 2 20 13 4 13 12 2"/>
  </svg>
);

interface CleanerToolbarProps {
  disabled?: boolean;
  onSend: () => void;
  isProcessing: boolean;
  onPromptSelect: (prompt: string) => void;
}

function CleanerToolbar({ disabled, onSend, isProcessing, onPromptSelect }: CleanerToolbarProps) {
  const [showPrompts, setShowPrompts] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usageButtonRef = useRef<HTMLButtonElement>(null);
  const openRouterService = OpenRouterService();
  const { used: usedCredits, total: totalCredits } = openRouterService.getCredits();
  const { addAttachment, updateAttachment } = useAutomationStore();

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
        updateAttachment(attachment.id, 'success', undefined, text.slice(0, MAX_FILE_SIZE));
      } catch (error) {
        updateAttachment(attachment.id, 'error');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addAttachment, updateAttachment]);

  const handlePromptSelect = (prompt: string) => {
    onPromptSelect(prompt);
    setShowPrompts(false);
  };

  return (
    <CleanerToolbarContainer>
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

      <PromptsDropdown $isOpen={showPrompts}>
        <TooltipContainer>
          <PromptsButton 
            onClick={() => setShowPrompts(!showPrompts)}
            $isActive={showPrompts}
          >
            <PromptsIcon />
          </PromptsButton>
          <Tooltip>Prompt</Tooltip>
        </TooltipContainer>
        <PromptsMenu $isOpen={showPrompts}>
          <PromptsMenuItem onClick={() => handlePromptSelect("PLEASE COMPILE, REMOVE DUPLICATE DATA, SUMMARIZE, CLEAN, LABEL and FORMAT THIS DATA")}>
            PLEASE COMPILE, REMOVE DUPLICATE DATA, SUMMARIZE, CLEAN, LABEL and FORMAT THIS DATA
          </PromptsMenuItem>
        </PromptsMenu>
      </PromptsDropdown>

      <TooltipContainer style={{ position: 'relative', zIndex: showUsage ? 99999 : 1 }}>
        <ToolButton 
          ref={usageButtonRef}
          onClick={() => setShowUsage(!showUsage)}
          $isActive={showUsage}
        >
          <UsageIcon />
        </ToolButton>
        <Tooltip>Usage</Tooltip>
        <UsageIndicator 
          isVisible={showUsage}
          usedCredits={usedCredits}
          totalCredits={totalCredits}
          buttonRef={usageButtonRef}
        />
      </TooltipContainer>

      <TooltipContainer>
        <ToolButton 
          onClick={onSend}
          $isDisabled={disabled}
          style={{ 
            backgroundColor: isProcessing ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
          }}
        >
          <div style={{ transform: 'rotate(-30deg)' }}>
            <CleanIcon />
          </div>
        </ToolButton>
        <Tooltip>Start</Tooltip>
      </TooltipContainer>
    </CleanerToolbarContainer>
  );
}

const CleanerPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  // Remove modelMode and restore isPremiumMode logic
  const [isPremiumMode, setIsPremiumMode] = useState(false);
  const [showCleanerTooltip, setShowCleanerTooltip] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const openRouterService = OpenRouterService();
  const { attachments, cleanerResult, setCleanerResult, clearCleanerResult, cleanerProcessing, setCleanerProcessing } = useAutomationStore();

  // Restore send logic to use isPremiumMode
  const handleSend = async () => {
    if (!prompt.trim()) return;
    setCleanerProcessing(true);
    setCleanerResult('');
    try {
      const successfulAttachments = attachments.filter(att => att.status === 'success' && att.content);
      const response = await openRouterService.sendPrompt(
        prompt,
        successfulAttachments,
        1,
        isPremiumMode
      );
      setCleanerResult(response);
    } catch (error) {
      setCleanerResult(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setCleanerProcessing(false);
    }
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const handleCopy = async () => {
    if (cleanerResult) {
      await navigator.clipboard.writeText(cleanerResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  const handleExport = () => {
    if (cleanerResult) {
      const blob = new Blob([cleanerResult], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned_result.txt';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
  const handleClear = () => clearCleanerResult();

  return (
    <Container>
      <div className="relative w-full min-h-screen">
        <main className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 z-10">
          <div 
            className="text-center relative"
            onMouseEnter={() => setShowCleanerTooltip(true)}
            onMouseLeave={() => setShowCleanerTooltip(false)}
            style={{ marginTop: '32px', marginBottom: '16px' }}
          >
            <Title>CLEANER</Title>
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
              className={`dev-team-tooltip ${showCleanerTooltip ? 'visible' : ''}`}
            >
              AI-powered data cleaning and formatting
            </div>
          </div>

          <div className="flex items-center gap-8 relative">
            <div style={{ position: 'relative', zIndex: 2, marginTop: '100px' }}>
              <DogonMask isProcessing={cleanerProcessing} />
            </div>
          </div>

          <SwitcherContainer>
            <ModelText>
              {isPremiumMode ? 'GROK 4' : 'DEEPSEEK R1'}
            </ModelText>
            <ButtonRow>
              <SwitcherButton 
                $isActive={!isPremiumMode}
                onClick={() => setIsPremiumMode(false)}
              >
                ECONOMY
              </SwitcherButton>
              <SwitcherButton 
                $isActive={isPremiumMode}
                onClick={() => setIsPremiumMode(true)}
              >
                PREMIUM
              </SwitcherButton>
            </ButtonRow>
          </SwitcherContainer>

          <div className="mt-[20px] w-full flex flex-col items-center gap-6 relative">
            <InputContainer>
              <TextInputArea
                value={prompt}
                onChange={setPrompt}
                disabled={cleanerProcessing}
                onSend={handleSend}
              />
              <FileList />
              <CleanerToolbar
                disabled={!prompt.trim()}
                onSend={handleSend}
                isProcessing={cleanerProcessing}
                onPromptSelect={handlePromptSelect}
              />
            </InputContainer>
            {cleanerResult && (
              <div className="w-full max-w-4xl mx-auto mt-6">
                <div className="bg-black rounded-lg p-6 border border-gray-700">
                  <div 
                    className="text-gray-200 whitespace-pre-wrap mb-4"
                    dangerouslySetInnerHTML={{ __html: cleanerResult.replace(/^Cleaned Data Result:\s*/g, '') }}
                  />
                  <div className="flex gap-4 mt-2">
                    <button onClick={handleCopy} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white">
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white">Export</button>
                    <button onClick={handleClear} className="px-4 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white">Clear</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Container>
  );
};

export default CleanerPage; 