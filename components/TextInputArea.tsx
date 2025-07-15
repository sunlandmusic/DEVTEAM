import React, { KeyboardEvent } from 'react';
import styled from 'styled-components';
import { TextInputAreaProps, TeamId } from '../types';
import { useAutomationStore } from '../services/store';

const Container = styled.div`
  width: 100%;
  max-width: 36rem;
  padding: 0;
  position: relative;
`;

const InputField = styled.textarea<{ $isDisabled: boolean }>`
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.6);
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
    border-color: rgba(128, 128, 128, 0.8);
  }

  opacity: ${props => props.$isDisabled ? 0.6 : 1};
  pointer-events: ${props => props.$isDisabled ? 'none' : 'auto'};
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'text'};
`;

const ResponseContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const TeamResponseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(17, 17, 17, 0.3);
  border-radius: 0.75rem;
  overflow: hidden;
`;

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(31, 31, 31, 0.6);
  backdrop-filter: blur(8px);
`;

const TeamTitle = styled.h3`
  color: #9333ea;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant: 'copy' | 'export' | 'clear' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  
  ${props => {
    switch (props.variant) {
      case 'copy':
        return `
          background: rgb(75, 75, 75);
          &:hover { background: rgb(90, 90, 90); }
        `;
      case 'export':
        return `
          background: rgb(147, 51, 234);
          &:hover { background: rgba(147, 51, 234, 0.8); }
        `;
      case 'clear':
        return `
          background: rgb(0, 0, 139);
          &:hover { background: rgba(0, 0, 139, 0.8); }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResponseContent = styled.div`
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

export function TextInputArea({ value, onChange, onSend, disabled = false, isTaskMode = false }: TextInputAreaProps) {
  const { responses, clearTeamResponse } = useAutomationStore();
  const teams: TeamId[] = [1, 2, 3, 4];

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSend) {
      e.preventDefault();
      onSend();
    }
  };

  const handleCopyTeam = async (teamId: TeamId) => {
    const teamResponse = responses[teamId];
    if (teamResponse) {
      try {
        await navigator.clipboard.writeText(teamResponse);
        // Could add a toast notification here for success
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleExportTeam = (teamId: TeamId) => {
    const teamResponse = responses[teamId];
    if (teamResponse) {
      const blob = new Blob([teamResponse], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team${teamId}_response.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleClearTeam = (teamId: TeamId) => {
    clearTeamResponse(teamId);
  };

  return (
    <Container>
      <InputField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="what's pop'n ?"
        $isDisabled={disabled}
      />
      
      <ResponseContainer>
        {teams.map(teamId => {
          const teamResponse = responses[teamId];
          if (!teamResponse) return null;

          return (
            <TeamResponseWrapper key={teamId}>
              <TeamHeader>
                <TeamTitle>Team {teamId}</TeamTitle>
                <ActionButtons>
                  <ActionButton
                    variant="copy"
                    onClick={() => handleCopyTeam(teamId)}
                    title="Copy response"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" />
                      <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" />
                    </svg>
                    Copy
                  </ActionButton>
                  <ActionButton
                    variant="export"
                    onClick={() => handleExportTeam(teamId)}
                    title="Export response"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export
                  </ActionButton>
                  <ActionButton
                    variant="clear"
                    onClick={() => handleClearTeam(teamId)}
                    title="Clear response"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </ActionButton>
                </ActionButtons>
              </TeamHeader>
              <ResponseContent>{teamResponse}</ResponseContent>
            </TeamResponseWrapper>
          );
        })}
      </ResponseContainer>
    </Container>
  );
}