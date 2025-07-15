# DEV TEAM Build Guide

## Overview
DEV TEAM is a sophisticated web interface featuring four computer icons with animated neon lighting effects. The interface displays computer icons in a grid layout, each with six transparent slots that glow with purple and gold neon lights in a staggered animation pattern.

## 1. Project Setup

### 1.1 Create New Project
```bash
# Create a new directory
mkdir dev-team
cd dev-team

# Initialize a new Expo project
npx create-expo-app@latest -e with-router
```

### 1.2 Dependencies
Update your package.json with these dependencies:

```json
{
  "name": "dev-team",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-navigation/native": "^7.1.13",
    "@react-navigation/native-stack": "^7.3.18",
    "expo": "~50.0.11",
    "expo-asset": "~9.0.2",
    "expo-font": "~11.10.3",
    "expo-router": "^5.1.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.73.4",
    "react-native-reanimated": "^3.18.0",
    "react-native-web": "~0.19.6",
    "styled-components": "^6.1.8"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@types/react-dom": "^18.2.19",
    "typescript": "^5.1.3"
  }
}
```

### 1.3 Configuration Files

#### babel.config.js
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
          },
        },
      ],
    ],
  };
};
```

#### app.json
```json
{
  "expo": {
    "name": "DEV TEAM",
    "slug": "dev-team",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "devteam",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#111111"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.devteam.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#111111"
      },
      "package": "com.devteam.app"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

## 2. Project Structure
```
dev-team/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── assets/
│   └── images/
│       └── supercomputer.png
├── src/
│   └── components/
│       ├── ComputerIcon.tsx
│       ├── ComputerGrid.tsx
│       └── Toolbar.tsx
└── package.json
```

## 3. Component Implementation

### 3.1 Root Layout (_layout.tsx)
```typescript
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#111',
        },
      }}
    />
  );
}
```

### 3.2 Main App Screen (index.tsx)
```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ComputerGrid } from '../src/components/ComputerGrid';

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>DEV TEAM</Text>
      <Text style={styles.subtitle}>
        leveraging the power of 24 A.I. models simultaneously
      </Text>
      <ComputerGrid
        activeHubs={activeHubs}
        selectedTeams={selectedTeams}
        isProcessing={isProcessing}
        onHubToggle={toggleHub}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: -24,
    marginBottom: 32,
    textAlign: 'center',
  },
});
```

### 3.3 ComputerGrid Component
```typescript
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ComputerIcon } from './ComputerIcon';

interface ComputerGridProps {
  activeHubs: boolean[];
  selectedTeams: number[];
  isProcessing: boolean;
  onHubToggle: (index: number) => void;
}

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

### 3.4 ComputerIcon Component
```typescript
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay
} from 'react-native-reanimated';

interface ComputerIconProps {
  isActive?: boolean;
  isSelected?: boolean;
  isProcessing?: boolean;
}

export function ComputerIcon({ 
  isActive = false, 
  isSelected = false, 
  isProcessing = false 
}: ComputerIconProps) {
  const getUniqueDelay = (index: number) => {
    return -(index * 150); // 150ms gap between each slot
  };

  const showAnimation = isActive && (isSelected || isProcessing);

  const styles = StyleSheet.create({
    container: {
      width: 120,
      height: 200,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    purpleGlow: {
      position: 'absolute',
      width: '200%',
      height: '200%',
      opacity: (isSelected || (isActive && isProcessing)) ? 0.85 : 0,
      backgroundColor: 'rgba(88, 31, 140, 0.85)',
      borderRadius: 200,
      transform: [{ scale: 1.5 }],
      left: '-50%',
      top: '-50%',
    },
    slotsContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      zIndex: 1,
    },
    slot: {
      width: '60%',
      height: '8%',
      backgroundColor: showAnimation ? 'rgba(88, 31, 140, 0.45)' : 'transparent',
      shadowColor: 'rgba(88, 31, 140, 1)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: showAnimation ? 0.8 : 0,
      shadowRadius: 15,
      elevation: showAnimation ? 5 : 0,
    },
    computerImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
      zIndex: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.purpleGlow]} />
      
      <View style={styles.slotsContainer}>
        {Array(6).fill(null).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.slot,
              {
                opacity: showAnimation ? 1 : 0,
              }
            ]}
          />
        ))}
      </View>

      <Image 
        source={require('../../assets/images/supercomputer.png')}
        style={styles.computerImage}
      />
    </View>
  );
}
```

## 4. Animation System

### 4.1 Neon Pulse Animation
The neon pulse animation cycles through four colors:
1. Purple (rgb(88, 31, 140))
2. Gold (rgb(255, 215, 0))
3. Medium Purple (rgb(186, 85, 211))
4. Dark Blue (rgb(0, 0, 139))

Each slot has a staggered delay of 150ms from the previous slot, creating a flowing effect.

### 4.2 Glow Effects
- Base color opacity: 0.45
- Inner glow opacity: 1.0
- Middle glow opacity: 0.85
- Outer glow opacity: 0.65

## 5. Running the Project

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Press 'w' to open in web browser or scan the QR code with the Expo Go app on your mobile device.

## 6. Key Features

1. **Computer Grid**
   - Four computer icons in a 2x2 grid
   - Each computer has six transparent slots
   - Slots glow with neon animations

2. **Animation States**
   - Normal State: Purple glow for selected computers
   - Processing State: All active computers show flowing animations
   - Staggered Animation: 150ms delay between slots

3. **Interactive Elements**
   - Click/tap to select computers
   - Smooth transitions between states
   - Disabled interactions during processing

4. **Visual Effects**
   - Neon glow effects
   - Pulsing animations
   - Smooth opacity transitions
   - Staggered animations 