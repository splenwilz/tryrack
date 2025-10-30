/**
 * ShimmerPlaceholder Component
 * 
 * A lightweight shimmer/skeleton loading component using LinearGradient
 * for smooth animated placeholders during AI processing.
 * 
 * Context7 Best Practices:
 * - Uses Expo's LinearGradient for performance
 * - Theme-aware colors
 * - Configurable width/height
 * - Smooth animation loop
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ShimmerPlaceholderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width = '100%',
  height = 40,
  borderRadius = 8,
  style,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  
  // Animated value for shimmer translation
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create looping shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnimation]);
  
  // Interpolate animation for gradient movement
  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });
  
  // Theme-aware shimmer colors
  const shimmerColors = [
    backgroundColor || '#FFFFFF',
    `${tintColor || '#007AFF'}20`, // 20% opacity of tint color
    backgroundColor || '#FFFFFF',
  ] as const;
  
  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          borderWidth: 1,
          borderColor: `${borderColor}30`,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginVertical: 4,
  },
  shimmerContainer: {
    width: '300%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

