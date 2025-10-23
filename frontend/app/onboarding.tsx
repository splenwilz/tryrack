import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Image } from 'react-native';
import { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, type SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { useOnboarding } from '@/hooks/use-onboarding';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Onboarding screen data structure
 * Each screen contains title, description, image, and action button text
 */
interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  image: number; // Image source (require() result)
  buttonText: string;
  isLast?: boolean;
}

// Onboarding screens configuration
const onboardingScreens: OnboardingScreen[] = [
  {
    id: '1',
    title: 'Try Before You Wear',
    description: 'Upload clothes, get instant outfit recommendations, and try on anything virtually before you wear.',
    image: require('@/assets/images/logo.png'),
    buttonText: 'Continue',
  },
  {
    id: '2',
    title: 'Smart Wardrobe Management',
    description: 'Add items to your digital wardrobe. Get personalized outfit suggestions based on your style.',
    image: require('@/assets/images/onboard-spouse.png'),
    buttonText: 'Get Started',
    isLast: true,
  },
  {
    id: '3',
    title: 'Virtual Try-On Technology',
    description: 'See how clothes look on you instantly. Our AI creates realistic try-on renders so you can shop with confidence.',
    image: require('@/assets/images/onboard-virtual-tryon.png'),
    buttonText: 'Continue',
  },
  {
    id: '4',
    title: 'Shop from Boutiques',
    description: 'Discover curated collections from local boutiques. Try on items virtually and buy directly through the app.',
    image: require('@/assets/images/onboard-boutique.png'),
    buttonText: 'Continue',
  }
  
];

/**
 * Progress Indicator Component
 * Shows dots for each onboarding screen with active state animation
 * 
 * @param currentIndex - Current active screen index
 * @param totalScreens - Total number of screens
 * @param onPress - Callback when a dot is pressed
 */
const ProgressIndicator: React.FC<{
  currentIndex: number;
  totalScreens: number;
  onPress: (index: number) => void;
}> = ({ currentIndex, totalScreens, onPress }) => {
  return (
    <View style={styles.progressDotsContainer}>
        {Array.from({ length: totalScreens }, (_, index) => index).map((index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.progressDot,
            index === currentIndex && styles.progressDotActive,
          ]}
          onPress={() => onPress(index)}
          activeOpacity={0.7}
        />
      ))}
    </View>
  );
};

/**
 * Onboarding Screen Item Component
 * Renders individual onboarding screen with image, text, and button
 * 
 * @param item - Onboarding screen data
 * @param index - Screen index for animations
 * @param scrollX - Shared value for scroll position
 */
const OnboardingItem: React.FC<{
  item: OnboardingScreen;
  index: number;
  scrollX: SharedValue<number>;
}> = ({ item, index, scrollX }) => {
  // Animated styles for image scaling and opacity
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.screenContainer}>
      {/* Image Container with Animation */}
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

/**
 * Main Onboarding Screen Component
 * Implements carousel with swipe gestures, progress indicator, and navigation
 * 
 * Features:
 * - Swipeable carousel using FlatList
 * - Progress indicator with tap navigation
 * - Smooth animations with Reanimated
 * - Responsive design
 * - Skip functionality
 * - Navigation to main app
 */
export default function OnboardingScreenComponent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const { completeOnboarding } = useOnboarding();

  /**
   * Handle scroll position changes
   * Updates current index and scrollX shared value for animations
   */
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = contentOffsetX;
    
    // Calculate current index based on scroll position
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  /**
   * Navigate to specific screen via progress indicator
   * Scrolls to the selected screen with smooth animation
   */
  const handleProgressPress = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  /**
   * Handle next button press
   * Navigates to next screen or completes onboarding
   */
  const handleNext = () => {
    if (currentIndex < onboardingScreens.length - 1) {
      // Go to next screen
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Complete onboarding and navigate to main app
      handleCompleteOnboarding();
    }
  };

  /**
   * Complete onboarding process
   * Navigate to authentication flow
   */
  const handleCompleteOnboarding = () => {
    // Navigate to get started screen instead of main app
    router.push('/auth/get-started');
  };

  /**
   * Skip onboarding process
   * Navigate to authentication flow
   */
  const handleSkip = () => {
    handleCompleteOnboarding();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Progress Indicator - At the very top */}
      <View style={styles.progressContainer}>
        <ProgressIndicator
          currentIndex={currentIndex}
          totalScreens={onboardingScreens.length}
          onPress={handleProgressPress}
        />
      </View>

      {/* Header with Skip Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={onboardingScreens}
        renderItem={({ item, index }) => (
          <OnboardingItem
            item={item}
            index={index}
            scrollX={scrollX}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          // Fallback for scroll to index failures
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
      />

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {onboardingScreens[currentIndex]?.buttonText || 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
  },
  progressDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  screenContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: "350px",
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
