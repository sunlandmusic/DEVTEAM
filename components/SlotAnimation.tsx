import React from 'react';
import styled from 'styled-components';

interface SlotAnimationProps {
  teamId: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const Container = styled.div`
  width: 40px;
  height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const PurpleGlow = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(88, 31, 140, 0.85) 0%, rgba(88, 31, 140, 0.45) 40%, rgba(88, 31, 140, 0) 70%);
  filter: blur(10px);
  animation: pulseGlow 2s ease-in-out infinite;
  z-index: 0;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  pointer-events: none;
`;

const SlotsContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
  z-index: 1;
  transform: translateY(-5px);
`;

const Slot = styled.div<{ $delay: number }>`
  width: 49%;
  height: 10px;
  background: transparent;
  animation: neonPulse 0.4s ease-in-out ${props => props.$delay}s infinite;
  opacity: 1;
`;

export function SlotAnimation({ 
  teamId,
  isSelected = false,
  onClick
}: SlotAnimationProps) {
  // Get unique base offset for each animation set
  const getBaseOffset = (id: number) => {
    switch(id) {
      case 1: return 0;      // First starts at 0
      case 2: return 0.2;    // Second starts with 0.2s offset
      default: return 0;
    }
  };

  // Single slot, no need for complex delay calculation
  const getDelay = () => getBaseOffset(teamId);

  return (
    <Container onClick={onClick}>
      {isSelected && <PurpleGlow $isVisible={isSelected} />}
      <SlotsContainer>
        <Slot key={0} $delay={getDelay()} />
      </SlotsContainer>
    </Container>
  );
} 