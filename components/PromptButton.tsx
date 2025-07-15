import React, { useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  padding: 8px 16px;
  background: #444;
  color: white;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;

  &:hover {
    background: #555;
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 10;
  min-width: 150px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #444;
  }
`;

interface PromptButtonProps {
  onSelectPrompt: (prompt: string) => void;
}

const PRESET_PROMPTS = {
  'OVERVIEW': 'Please provide a comprehensive overview of the project.',
  'PRD': 'Please create a detailed Product Requirements Document (PRD).',
  'TASK LIST': 'Please break down this project into a detailed task list.',
  'DATA CLEANING': 'Please clean and format the provided data.'
};

export const PromptButton: React.FC<PromptButtonProps> = ({ onSelectPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePromptSelect = (prompt: string) => {
    onSelectPrompt(PRESET_PROMPTS[prompt as keyof typeof PRESET_PROMPTS]);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button onClick={() => setIsOpen(!isOpen)}>
        PROMPT ▼
      </Button>
      <Dropdown $isOpen={isOpen}>
        {Object.keys(PRESET_PROMPTS).map(promptName => (
          <DropdownItem
            key={promptName}
            onClick={() => handlePromptSelect(promptName)}
          >
            {promptName}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}; 