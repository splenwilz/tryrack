import type React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type CustomHeaderProps = {
  title: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
} & (
  | { showBackButton?: false; onBackPress?: never }
  | { showBackButton: true; onBackPress: () => void }
);

/**
 * Custom Header Component for Wardrobe Screen
 * Provides consistent header styling with search and notification icons
 * Based on North Face mobile design patterns
 */
export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
  showBackButton = false,
  onBackPress,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.header, { backgroundColor }]}>
      {/* Left side - Back button or Title */}
      <View style={styles.leftSection}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          disabled={!onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigates to the previous screen"
          accessibilityState={{ disabled: !onBackPress }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="chevron.right"
            size={24}
            color={iconColor}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
        </TouchableOpacity>
      ) : (
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
      )}
      </View>

      {/* Right side - Icons */}
      <View style={styles.rightSection}>
        {/* Search Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          disabled={!onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Search"
          accessibilityHint="Opens search"
          accessibilityState={{ disabled: !onSearchPress }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="magnifyingglass"
            size={24}
            color={iconColor}
          />
        </TouchableOpacity>

        {/* Notification Icon with Badge */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          disabled={!onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          accessibilityHint="Opens notifications"
          accessibilityState={{ disabled: !onNotificationPress }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <View style={styles.notificationContainer}>
            <IconSymbol
              name="bell"
              size={24}
              color={iconColor}
            />
            {/* Notification Badge */}
            {notificationCount > 0 && (
              <View style={[
                styles.badge,
                { backgroundColor: Colors[colorScheme].tint }
              ]}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  leftSection: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
