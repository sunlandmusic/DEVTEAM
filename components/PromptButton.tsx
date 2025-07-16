import React, { useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 28px;
    height: 28px;
    color: rgba(255, 255, 255, 0.9);
  }

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 9999;
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
  iconPath?: string;
}

const PRESET_PROMPTS = {
  'OVERVIEW': 'Please provide a comprehensive overview of the project.',
  'PRD': 'Please create a detailed Product Requirements Document (PRD).',
  'TASK LIST': 'Please break down this project into a detailed task list.',
  'DATA CLEANING': 'Please clean and format the provided data.'
};

export const PromptButton: React.FC<PromptButtonProps> = ({ onSelectPrompt, iconPath }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePromptSelect = (prompt: string) => {
    onSelectPrompt(PRESET_PROMPTS[prompt as keyof typeof PRESET_PROMPTS]);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button onClick={() => setIsOpen(!isOpen)}>
        {iconPath ? (
          <img src={iconPath} alt="Prompt" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
            <path d="M8 9h8" />
            <path d="M8 13h6" />
          </svg>
        )}
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