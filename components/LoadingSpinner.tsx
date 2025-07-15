import React from 'react';
import styled from 'styled-components';

const LoadingText = styled.p`
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 16px;
  line-height: 1.5;
`;

export interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Processing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center my-8" role="status" aria-live="polite">
      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      <LoadingText>{text}</LoadingText>
    </div>
  );
};
