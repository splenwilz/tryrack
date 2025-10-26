import { StyleSheet, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

/**
 * Licenses Screen
 * Open source licenses and attributions for TryRack
 */
export default function LicensesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleBackPress = () => {
    router.back();
  };

  const licenses = [
    {
      name: 'React Native',
      version: '0.73.0',
      license: 'MIT',
      link: 'https://github.com/facebook/react-native',
      description: 'Framework for building native mobile apps'
    },
    {
      name: 'Expo',
      version: '50.0.0',
      license: 'MIT',
      link: 'https://github.com/expo/expo',
      description: 'Platform for building universal React applications'
    },
    {
      name: 'Expo Router',
      version: '3.0.0',
      license: 'MIT',
      link: 'https://github.com/expo/router',
      description: 'File-based router for React Native'
    },
    {
      name: '@react-native-async-storage/async-storage',
      version: '1.21.0',
      license: 'MIT',
      link: 'https://github.com/react-native-async-storage/async-storage',
      description: 'AsyncStorage for React Native'
    },
    {
      name: 'react-native-reanimated',
      version: '3.6.0',
      license: 'MIT',
      link: 'https://github.com/software-mansion/react-native-reanimated',
      description: 'React Native\'s Animated library reimplemented'
    },
    {
      name: 'react-native-safe-area-context',
      version: '4.7.0',
      license: 'MIT',
      link: 'https://github.com/th3rd-wave/react-native-safe-area-context',
      description: 'Safe Area context for React Native'
    },
    {
      name: '@react-navigation/native',
      version: '6.1.0',
      license: 'MIT',
      link: 'https://github.com/react-navigation/react-navigation',
      description: 'Navigation library for React Native'
    },
    {
      name: 'Google Sign-In',
      version: '9.0.0',
      license: 'Apache 2.0',
      link: 'https://github.com/google/GoogleSignIn-Android',
      description: 'Google Sign-In SDK'
    },
    {
      name: 'WorkOS',
      version: '8.0.0',
      license: 'MIT',
      link: 'https://github.com/workos-inc/workos-node',
      description: 'WorkOS authentication and identity platform'
    }
  ];

  const aiTechnologies = [
    {
      name: 'Google Gemini AI',
      description: 'Advanced AI model for virtual try-on and image processing',
      link: 'https://gemini.google.com'
    },
    {
      name: 'TensorFlow Lite',
      description: 'Machine learning inference for mobile devices',
      link: 'https://www.tensorflow.org/lite'
    },
    {
      name: 'Core ML',
      description: 'Apple\'s machine learning framework for iOS',
      link: 'https://developer.apple.com/documentation/coreml'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Licenses"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.mainTitle}>
            Open Source Licenses
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: iconColor }]}>
            TryRack is built with open source software
          </ThemedText>
        </View>

        {/* Dependencies */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Dependencies
          </ThemedText>

          {licenses.map((license) => (
            <TouchableOpacity
              key={license.name}
              style={styles.licenseItem}
              onPress={() => Linking.openURL(license.link)}
            >
              <View style={styles.licenseInfo}>
                <ThemedText style={styles.licenseName}>{license.name}</ThemedText>
                <ThemedText style={[styles.licenseDetails, { color: iconColor }]}>
                  v{license.version} • {license.license}
                </ThemedText>
                <ThemedText style={[styles.licenseDescription, { color: iconColor }]}>
                  {license.description}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={iconColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Technologies */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            AI Technologies
          </ThemedText>

          {aiTechnologies.map((tech) => (
            <TouchableOpacity
              key={tech.name}
              style={styles.licenseItem}
              onPress={() => Linking.openURL(tech.link)}
            >
              <IconSymbol name="info.circle" size={20} color={tintColor} />
              <View style={styles.licenseInfo}>
                <ThemedText style={styles.licenseName}>{tech.name}</ThemedText>
                <ThemedText style={[styles.licenseDescription, { color: iconColor }]}>
                  {tech.description}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={iconColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            TryRack Information
          </ThemedText>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>App Version</ThemedText>
            <ThemedText style={[styles.infoValue, { color: iconColor }]}>
              1.0.0
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Build Date</ThemedText>
            <ThemedText style={[styles.infoValue, { color: iconColor }]}>
              January 2024
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Platform</ThemedText>
            <ThemedText style={[styles.infoValue, { color: iconColor }]}>
              iOS & Android
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: iconColor }]}>
            Thank you to all the open source contributors who make TryRack possible.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  licenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  licenseDetails: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  licenseDescription: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    opacity: 0.7,
  },
  footer: {
    paddingVertical: 24,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
