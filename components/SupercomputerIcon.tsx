import React from 'react';
import styled from 'styled-components';
import { SupercomputerIconProps } from '../types';

const Container = styled.div`
  width: 120px;
  height: 200px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  perspective: 1000px;
`;

const RotatingContainer = styled.div<{ $isRotated: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.$isRotated ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const PurpleGlow = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(88, 31, 140, 0.85) 0%, rgba(88, 31, 140, 0.45) 40%, rgba(88, 31, 140, 0) 70%);
  filter: blur(40px);
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
  gap: 8px;
  z-index: 1;
  transform: translateY(-20px);
`;

const Slot = styled.div<{ $isProcessing: boolean, $delay: number }>`
  width: 49%;
  height: 10px;
  background: transparent;
  animation: ${props => props.$isProcessing ? `neonPulse 0.8s ease-in-out ${props.$delay}s infinite` : 'none'};
  opacity: ${props => props.$isProcessing ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const ComputerFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FrontFace = styled(ComputerFace)`
  transform: rotateY(0deg);
`;

const BackFace = styled(ComputerFace)`
  transform: rotateY(180deg);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 10px;
`;

const ModelInfo = styled.div`
  color: #fff;
  font-size: 12px;
  text-align: center;
  line-height: 1.4;
  opacity: 0.9;
`;

const ComputerImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  pointer-events: none;
`;

export function SupercomputerIcon({ 
  teamId,
  onClick,
  isSelected = false,
  isCurrentlyProcessing = false,
  modelMode = 'economy',
  showModelInfo = false
}: SupercomputerIconProps) {
  
  // Get unique base offset for each computer
  const getBaseOffset = (id: number) => {
    switch(id) {
      case 1: return 0;
      case 2: return 0.2;
      case 3: return 0.4;
      case 4: return 0.6;
      default: return 0;
    }
  };

  // Get delay for each slot, incorporating both direction and base offset
  const getDelay = (index: number) => {
    const baseOffset = getBaseOffset(teamId);
    const isDownward = teamId % 2 === 1;
    const slotDelay = isDownward ? index * 0.15 : (5 - index) * 0.15;
    return baseOffset + slotDelay;
  };

  // Get model information based on mode
  const getModelInfo = () => {
    switch(modelMode) {
      case 'economy':
        return 'DeepSeek R1 (x4)';
      case 'pro':
        return 'Claude Opus 4 (x4)';
      case 'premium':
        return 'GEMINI 2.5 PRO\nCLAUDE OPUS 4\nGROK 4\nDEEPSEEK R1 (x4)';
      default:
        return '';
    }
  };

  return (
    <Container onClick={onClick}>
      {isSelected && <PurpleGlow $isVisible={isSelected} />}
      <RotatingContainer $isRotated={showModelInfo}>
        <FrontFace>
          <SlotsContainer>
            {Array(6).fill(null).map((_, index) => (
              <Slot
                key={index}
                $isProcessing={isCurrentlyProcessing}
                $delay={getDelay(index)}
              />
            ))}
          </SlotsContainer>
          <ComputerImage
            src="/DEVTEAM/images/supercomputer.png"
            alt="Supercomputer"
          />
        </FrontFace>
        <BackFace>
          <ModelInfo>
            {getModelInfo()}
          </ModelInfo>
        </BackFace>
      </RotatingContainer>
    </Container>
  );
}
