import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DogonMaskProps } from '../types';

const MaskContainer = styled.div`
  position: relative;
  width: 147px;
  height: 147px;
  margin: 0 auto;
  margin-bottom: -20px;
  margin-top: -80px;
`;

const MaskImage = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
  pointer-events: none;
`;

export function DogonMask({ isProcessing = false }: DogonMaskProps) {
  const maskAnimation = {
    initial: { scale: 1 },
    animate: isProcessing ? {
      scale: [1, 1.02, 1],
      filter: [
        'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))',
        'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
        'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))'
      ],
    } : {}
  };

  return (
    <MaskContainer>
      <MaskImage 
        src="/images/dogonmask.png" 
        alt="Dogon Mask"
        initial="initial"
        animate="animate"
        variants={maskAnimation}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </MaskContainer>
  );
}
