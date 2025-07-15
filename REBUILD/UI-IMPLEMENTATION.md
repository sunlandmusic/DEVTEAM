# DEVTEAM UI Implementation Guide

## 1. Layout Overview

### Main Components
1. 4 Supercomputers (Top)
2. Dogon Mask (Below Supercomputers)
3. DEVTEAM Text (Center)
4. Input Text Field
5. Toolbar
6. Team Selector Buttons

## 2. Animation System

### Global Animations
```css
/* app/styles/global.css */
@keyframes neonPulse {
  0% {
    background-color: rgba(88, 31, 140, 0.45);
    box-shadow: 0 0 15px rgba(88, 31, 140, 1),
                0 0 30px rgba(88, 31, 140, 0.85),
                0 0 45px rgba(88, 31, 140, 0.65);
  }
  25% {
    background-color: rgba(255, 215, 0, 0.45);
    box-shadow: 0 0 15px rgba(255, 215, 0, 1),
                0 0 30px rgba(255, 215, 0, 0.85),
                0 0 45px rgba(255, 215, 0, 0.65);
  }
  50% {
    background-color: rgba(186, 85, 211, 0.45);
    box-shadow: 0 0 15px rgba(186, 85, 211, 1),
                0 0 30px rgba(186, 85, 211, 0.85),
                0 0 45px rgba(186, 85, 211, 0.65);
  }
  75% {
    background-color: rgba(0, 0, 139, 0.45);
    box-shadow: 0 0 15px rgba(0, 0, 139, 1),
                0 0 30px rgba(0, 0, 139, 0.85),
                0 0 45px rgba(0, 0, 139, 0.65);
  }
  100% {
    background-color: rgba(88, 31, 140, 0.45);
    box-shadow: 0 0 15px rgba(88, 31, 140, 1),
                0 0 30px rgba(88, 31, 140, 0.85),
                0 0 45px rgba(88, 31, 140, 0.65);
  }
}

@keyframes pulseGlow {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

## 3. Component Details

### Team Selector
- Position: Part of ComputerGrid component
- Features:
  - Teams 1-4 and ALL button
  - Dark purple glow on selection
  - Disabled during processing
- State Management:
  - Uses selectedTeams array
  - Tracks processing state
  - Handles team toggling

Implementation:
```tsx
// ComputerGrid.tsx
export function ComputerGrid({
  activeHubs,
  selectedTeams,
  isProcessing,
  onHubToggle
}: ComputerGridProps) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 32,
      marginBottom: 16,
      padding: 16,
    },
    computerWrapper: {
      opacity: isProcessing ? 0.7 : 1,
    }
  });

  return (
    <View style={styles.container}>
      {activeHubs.map((isActive, index) => (
        <Pressable 
          key={index}
          onPress={() => !isProcessing && onHubToggle(index)}
          style={[
            styles.computerWrapper,
            { opacity: isProcessing ? 0.7 : 1 }
          ]}
          disabled={isProcessing}
        >
          <ComputerIcon
            isActive={isActive}
            isSelected={selectedTeams.includes(index + 1)}
            isProcessing={isProcessing}
          />
        </Pressable>
      ))}
    </View>
  );
}
```

State Management:
```tsx
// App.tsx
export default function Page() {
  const [activeHubs, setActiveHubs] = useState([false, false, false, false]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleHub = (index: number) => {
    if (isProcessing) return;
    
    const newActiveHubs = [...activeHubs];
    newActiveHubs[index] = !newActiveHubs[index];
    setActiveHubs(newActiveHubs);

    const teamNumber = index + 1;
    if (newActiveHubs[index]) {
      setSelectedTeams([...selectedTeams, teamNumber]);
    } else {
      setSelectedTeams(selectedTeams.filter(t => t !== teamNumber));
    }
  };
}
```

Purple Glow Effect:
```tsx
// ChatHubIcon.tsx
{(isSelected && isActive) && (
  <div style={{
    position: 'absolute',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(88, 31, 140, 0.85) 0%, rgba(88, 31, 140, 0.45) 40%, rgba(88, 31, 140, 0) 70%)',
    filter: 'blur(40px)',
    animation: 'pulseGlow 2s ease-in-out infinite',
    zIndex: 0,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }} />
)}
```

### Supercomputers
- Position: Top of page
- Features:
  - 6 transparent docks per computer
  - Light up during team processing
  - Dark purple glow when team selected
- Behavior:
  - Only selected teams light up during processing
  - Selection only activates purple glow, not colorful lights

Implementation:
```tsx
const ChatHubIcon = ({ 
  isActive = false, 
  isSelected = false, 
  isProcessing = false 
}: ChatHubIconProps) => {
  const getUniqueDelay = (index: number) => {
    return -(index * 0.15); // 0.15s gap between each slot
  };

  const showAnimation = isActive && isProcessing;

  return (
    <div style={{ 
      width: '120px', 
      height: '200px',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Purple glow effect when selected */}
      {(isSelected && isActive) && (
        <div style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(88, 31, 140, 0.85) 0%, rgba(88, 31, 140, 0.45) 40%, rgba(88, 31, 140, 0) 70%)',
          filter: 'blur(40px)',
          animation: 'pulseGlow 2s ease-in-out infinite',
          zIndex: 0,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }} />
      )}
      {/* Slots */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1
      }}>
        {Array(6).fill(null).map((_, index) => (
          <div
            key={index}
            className="slot"
            style={{
              width: '60%',
              height: '8%',
              animation: showAnimation ? `neonPulse 0.8s ease-in-out ${getUniqueDelay(index)}s infinite` : 'none',
              opacity: showAnimation ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

### Dogon Mask
- Position: Below supercomputers, bottom edge flush with DEVTEAM text
- Size: Reduced by 25% from original
- Features:
  - Transparent eyes with neon glow animation
  - Animation width and height reduced by 50%
  - Animation emanates from behind mask through eyes

Implementation:
```tsx
const MaskContainer = styled.div`
  position: relative;
  width: 147px;
  height: 147px;
  margin: 0 auto;
  margin-bottom: -20px;
  margin-top: -100px;
`;

const SlotsOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  z-index: 0;
  transform: translateY(29px);  // Moved down by additional 11px from 18px
`;

const Slot = styled(motion.div)`
  width: 22.5%;  // Reduced from 45% to 22.5% (50% reduction)
  height: 3%;    // Reduced from 6% to 3% (50% reduction)
  background: transparent;
  border: 2px solid #7F00FF;
  box-shadow: 0 0 10px #7F00FF, 0 0 20px #7F00FF;
  border-radius: 4px;
`;

const MaskImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
`;

export function DogonMask({ isProcessing = false }: DogonMaskProps) {
  const getDelay = (index: number) => -(index * 0.15);

  const slotAnimation = {
    initial: { opacity: 0.3, scale: 1 },
    animate: isProcessing ? {
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1],
      borderColor: ['#7F00FF', '#FFD700', '#7F00FF'],
      boxShadow: [
        '0 0 10px #7F00FF, 0 0 20px #7F00FF',
        '0 0 10px #FFD700, 0 0 20px #FFD700',
        '0 0 10px #7F00FF, 0 0 20px #7F00FF'
      ],
    } : {}
  };

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
      <SlotsOverlay>
        {Array(6).fill(null).map((_, index) => (
          <Slot
            key={index}
            initial="initial"
            animate="animate"
            variants={slotAnimation}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: getDelay(index),
              ease: "easeInOut"
            }}
          />
        ))}
      </SlotsOverlay>
      <MaskImage 
        src="/DOGONMASK.png" 
        alt="Dogon Mask"
        initial="initial"
        animate="animate"
        variants={maskAnimation}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </MaskContainer>
  );
}

### DEVTEAM Text
- Position: Center of page
- Font Size: 19px reduced by 20%
- Color: rgba(255, 255, 255, 0.7)
- Hover Text:
  - Text: "leveraging the power of 24 A.i. models simultaneously"
  - Fade transition: 0.5s ease-in-out
  - No box borders

Implementation:
```css
.dev-team-title {
  font-size: 4rem;
  font-weight: bold;
  letter-spacing: 4px;
  margin-bottom: 2rem;
  cursor: default;
  position: relative;
  text-align: center;
}

.dev-team-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  opacity: 0;
  transition: opacity 1s ease-in-out;
  pointer-events: none;
}

.dev-team-title:hover .dev-team-tooltip {
  opacity: 1;
}
```

### Input Text Field
- Grey border with large corner radius
- Expandable height with handle in bottom-right
- Text: "We're ready to help you"

Implementation:
```tsx
const InputField = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.6);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    content: "We're ready to help you";
  }
  
  &:focus {
    outline: none;
    border-color: rgba(128, 128, 128, 0.8);
  }
`;
```

### Toolbar Buttons
- Size increased by 20% from original
- Evenly spaced in available area
- Send button rotated 30 degrees up
- Image upload icon matches reference
- Removed expand text field button

Implementation:
```tsx
const buttonStyle = (isDisabled: boolean = false) => ({
  width: '54px',
  height: '54px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.2s ease',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  opacity: isDisabled ? 0.5 : 1,
});

// Send button with rotation
<button
  style={buttonStyle(disabled)}
  onClick={() => !disabled && onSendToTeams([])}
  data-tooltip="Send"
  disabled={disabled}
>
  <div style={{ transform: 'rotate(-30deg)' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="22" x2="12" y2="13"/>
      <polygon points="12 2 20 13 4 13 12 2"/>
    </svg>
  </div>
</button>
```

## 4. State Management

### App Level State
```tsx
export default function Page() {
  const [activeHubs, setActiveHubs] = useState([false, false, false, false]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSlowingDown, setIsSlowingDown] = useState(false);

  // State management functions
  const toggleHub = (index: number) => {
    if (isProcessing) return;
    
    const newActiveHubs = [...activeHubs];
    newActiveHubs[index] = !newActiveHubs[index];
    setActiveHubs(newActiveHubs);

    const teamNumber = index + 1;
    if (newActiveHubs[index]) {
      setSelectedTeams([...selectedTeams, teamNumber]);
    } else {
      setSelectedTeams(selectedTeams.filter(t => t !== teamNumber));
    }
  };
}
```

### Processing State Animation
The processing state animation is coordinated across multiple components:

1. **Supercomputers**:
```tsx
const showAnimation = isActive && isProcessing;
// Applied to slots with neonPulse animation
```

2. **Dogon Mask**:
```tsx
const slotAnimation = {
  animate: isProcessing ? {
    opacity: [0.3, 1, 0.3],
    scale: [1, 1.2, 1],
    borderColor: ['#7F00FF', '#FFD700', '#7F00FF'],
    // ...
  } : {}
};
```

3. **Team Selection**:
```tsx
<Pressable 
  disabled={isProcessing}
  style={{ opacity: isProcessing ? 0.7 : 1 }}
>
```

### Animation Timing
- Slot animations have 0.15s gap between each slot
- Full animation cycle is 0.8s
- Last 2 seconds slow down by 50% before stopping
- Animations coordinate across all components during processing state

## 5. Animation Details

### Neon Pulse Animation
```css
@keyframes neonPulse {
  0% {
    box-shadow: 0 0 10px #8a4fff, 0 0 20px #8a4fff, 0 0 40px #8a4fff, 0 0 60px #8a4fff;
  }
  50% {
    box-shadow: 0 0 30px #8a4fff, 0 0 40px #8a4fff, 0 0 60px #8a4fff, 0 0 80px #8a4fff;
  }
  100% {
    box-shadow: 0 0 10px #8a4fff, 0 0 20px #8a4fff, 0 0 40px #8a4fff, 0 0 60px #8a4fff;
  }
}
```

### Processing Animation
- Only active during requests
- Last 2 seconds slow down by 50%
- Lights correspond to selected teams
- Team selection activates purple glow only

### Button Styling
- No box borders on hover text
- Toolbar and team selection hover text without borders
- Buttons adjust to screen size
- Equal spacing between buttons 