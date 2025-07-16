export type TeamId = 1 | 2 | 3 | 4;

export interface TeamResponse {
  teamId: TeamId;
  prompt: string;
  response: string;
  timestamp: string;
  attachments: string[];
}

export interface AppState {
  inputText: string;
  selectedTeams: TeamId[];
  isProcessingTeams: boolean;
  isSummarizing: boolean;
  teamResponses: TeamResponse[];
  summaryText: string | null;
  error: string | null;
}

// Props for SupercomputerIcon component
export interface SupercomputerIconProps {
  teamId: TeamId;
  onClick: () => void;
  isSelected: boolean;
  isCurrentlyProcessing: boolean;
  modelMode?: 'economy' | 'pro' | 'premium';
  showModelInfo?: boolean;
}

// Props for DogonMask component
export interface DogonMaskProps {
  isProcessing: boolean;
}

// Props for Toolbar component
export interface ToolbarProps {
  onSend: () => void;
  isProcessing: boolean;
}

// Props for TeamSelectorButtons component
export interface TeamSelectorButtonsProps {
  selectedTeams: TeamId[];
  onSelectTeam: (teamId: TeamId) => void;
}

// Props for TextInputArea component
export interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend?: () => void;
  disabled?: boolean;
  isTaskMode?: boolean;
}

// Props for LoadingSpinner component
export interface LoadingSpinnerProps {
  text?: string;
}

// Props for icon components
export interface IconProps {
  className?: string;
}

// Props for ToolButton component
export interface ToolButtonProps {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  isDisabled?: boolean;
  isSendButton?: boolean;
}
