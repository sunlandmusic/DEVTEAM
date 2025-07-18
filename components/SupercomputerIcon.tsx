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
`;

const ModelInfo = styled.div`
  color: #fff;
  font-size: 12px;
  text-align: center;
  line-height: 1.8;
  opacity: 0.9;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  z-index: 3;
`;

const ModelName = styled.div`
  margin-bottom: 4px;
`;

const ModelVersion = styled.div`
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 16px;
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
        return (
          <>
            <ModelName>DEEPSEEK</ModelName>
            <ModelVersion>R1</ModelVersion>
          </>
        );
      case 'pro':
        return (
          <>
            <ModelName>CLAUDE</ModelName>
            <ModelVersion>OPUS 4</ModelVersion>
          </>
        );
      case 'premium':
        return (
          <>
            <ModelName>GEMINI</ModelName>
            <ModelVersion>2.5 PRO</ModelVersion>
            <ModelName>CLAUDE</ModelName>
            <ModelVersion>OPUS 4</ModelVersion>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px', gap: '4px' }}>
              <div>
                <span style={{ fontSize: '12px' }}>GROK 4</span>
              </div>
              <div>
                <span style={{ fontSize: '12px' }}>DEEPSEEK R1</span>
              </div>
            </div>
          </>
        );
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
          <ComputerImage
            src="/DEVTEAM/images/supercomputerback.png"
            alt="Supercomputer Back"
          />
          <ModelInfo>
            {getModelInfo()}
          </ModelInfo>
        </BackFace>
      </RotatingContainer>
    </Container>
  );
}
