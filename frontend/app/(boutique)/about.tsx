import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

/**
 * About Screen
 * Information about the app, company, and version details
 */
export default function AboutScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleBackPress = () => {
    router.back();
  };

  const handleNavigateToTerms = () => {
    router.push('/terms-of-service');
  };

  const handleNavigateToPrivacy = () => {
    router.push('/privacy-policy');
  };

  const handleNavigateToLicenses = () => {
    router.push('/licenses');
  };

  const appVersion = '1.0.0';
  const companyInfo = {
    name: 'TryRack',
    tagline: 'Your AI-Powered Personal Fashion Assistant',
    description: 'TryRack is revolutionizing the way people interact with fashion through AI-powered virtual try-on technology. Experience your wardrobe digitally before you buy.',
    founded: '2024',
    mission: 'To make fashion accessible and sustainable through AI technology.',
    values: [
      'Innovation in AI and fashion',
      'Sustainability and ethical fashion',
      'User privacy and data security',
      'Accessibility for everyone'
    ]
  };

  const aboutSections = [
    {
      title: 'About Us',
      content: 'TryRack leverages cutting-edge AI technology to transform your shopping experience. Our virtual try-on feature allows you to see how clothes look on you before purchasing, reducing returns and supporting sustainable fashion.'
    },
    {
      title: 'Our Mission',
      content: companyInfo.mission
    },
    {
      title: 'Technology',
      content: 'Built with advanced AI models and computer vision, TryRack provides accurate virtual try-on experiences using state-of-the-art image processing technology.'
    },
    {
      title: 'Privacy',
      content: 'We prioritize your privacy. Your data is encrypted and never shared with third parties. You have complete control over your information.'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="About"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Info */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=120&fit=crop' }} 
            style={styles.logo} 
          />
          <ThemedText type="title" style={styles.appName}>{companyInfo.name}</ThemedText>
          <ThemedText style={[styles.tagline, { color: iconColor }]}>
            {companyInfo.tagline}
          </ThemedText>
          <ThemedText style={[styles.version, { color: iconColor }]}>
            Version {appVersion}
          </ThemedText>
        </View>

        {/* About Sections */}
        {aboutSections.map((section) => (
          <View key={section.title} style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            <ThemedText style={[styles.sectionContent, { color: iconColor }]}>
              {section.content}
            </ThemedText>
          </View>
        ))}

        {/* Our Values */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Our Values
          </ThemedText>
          {companyInfo.values.map((value) => (
            <View key={value} style={styles.valueItem}>
              <IconSymbol name="plus" size={16} color={tintColor} />
              <ThemedText style={[styles.valueText, { color: iconColor }]}>
                {value}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Connect With Us
          </ThemedText>

          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={[styles.socialLink, { backgroundColor: `${tintColor}20` }]}
              onPress={() => Linking.openURL('https://instagram.com/tryrack')}
            >
              <IconSymbol name="camera.fill" size={24} color={tintColor} />
              <ThemedText style={styles.socialLinkText}>Instagram</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialLink, { backgroundColor: `${tintColor}20` }]}
              onPress={() => Linking.openURL('https://facebook.com/tryrack')}
            >
              <IconSymbol name="info.circle" size={24} color={tintColor} />
              <ThemedText style={styles.socialLinkText}>Facebook</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialLink, { backgroundColor: `${tintColor}20` }]}
              onPress={() => Linking.openURL('https://twitter.com/tryrack')}
            >
              <IconSymbol name="pencil" size={24} color={tintColor} />
              <ThemedText style={styles.socialLinkText}>Twitter</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={[styles.section, { backgroundColor }]}>
          <TouchableOpacity style={styles.legalItem} onPress={handleNavigateToTerms}>
            <ThemedText style={styles.legalText}>Terms of Service</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} onPress={handleNavigateToPrivacy}>
            <ThemedText style={styles.legalText}>Privacy Policy</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} onPress={handleNavigateToLicenses}>
            <ThemedText style={styles.legalText}>Licenses</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: iconColor }]}>
            © {new Date().getFullYear()} TryRack. All rights reserved.
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
    alignItems: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  version: {
    fontSize: 14,
    opacity: 0.6,
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
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  valueText: {
    fontSize: 16,
    opacity: 0.8,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialLink: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    minWidth: '30%',
    gap: 8,
  },
  socialLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  legalText: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.6,
  },
});
