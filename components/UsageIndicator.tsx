import React from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';

const UsageContainer = styled.div<{ $isVisible: boolean; $rect: DOMRect | null }>`
  position: fixed;
  top: ${props => props.$rect ? `${props.$rect.bottom + 16}px` : '0'};
  left: ${props => props.$rect ? `${props.$rect.left}px` : '0'};
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 200px;
  transform-origin: top right;
  transform: scale(${props => props.$isVisible ? 1 : 0});
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: all 0.2s ease;
  z-index: 999999;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const UsageTitle = styled.h3`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.87);
  margin-bottom: 0.5rem;
`;

const UsageBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const UsageProgress = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$percentage > 80 ? '#ef4444' : props.$percentage > 50 ? '#f59e0b' : '#10b981'};
  transition: width 0.3s ease;
`;

const UsageText = styled.p`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

interface UsageIndicatorProps {
  isVisible: boolean;
  usedCredits: number;
  totalCredits: number;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function UsageIndicator({ isVisible, usedCredits, totalCredits, buttonRef }: UsageIndicatorProps) {
  const percentage = (usedCredits / totalCredits) * 100;
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (isVisible && buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isVisible, buttonRef]);

  const content = (
    <UsageContainer $isVisible={isVisible} $rect={rect}>
      <UsageTitle>API Credits</UsageTitle>
      <UsageBar>
        <UsageProgress $percentage={percentage} />
      </UsageBar>
      <UsageText>
        {usedCredits.toFixed(2)} / {totalCredits.toFixed(2)} credits used
      </UsageText>
    </UsageContainer>
  );
  
  return createPortal(content, document.body);
} 