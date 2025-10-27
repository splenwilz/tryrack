import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';

/**
 * Terms of Service Screen
 * Legal terms and conditions for TryRack usage
 */
export default function TermsOfServiceScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');

  const handleBackPress = () => {
    router.back();
  };

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By using TryRack, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.'
    },
    {
      title: '2. Description of Service',
      content: 'TryRack is an AI-powered virtual try-on service that allows users to digitally try on clothing items. The service includes wardrobe management, outfit recommendations, and virtual fitting experiences.'
    },
    {
      title: '3. User Accounts',
      content: 'To use certain features of TryRack, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
    },
    {
      title: '4. User Conduct',
      content: 'You agree not to:\n• Upload inappropriate content\n• Misuse the virtual try-on technology\n• Violate any laws or regulations\n• Interfere with the service\'s operation\n• Attempt to gain unauthorized access to our systems'
    },
    {
      title: '5. Content Ownership',
      content: 'You retain ownership of any content you upload to TryRack. By uploading content, you grant us a license to use, store, and process your content to provide our services.'
    },
    {
      title: '6. Intellectual Property',
      content: 'All software, designs, trademarks, and other intellectual property on TryRack are owned by us or our licensors. You may not copy, modify, or distribute any part of our service without permission.'
    },
    {
      title: '7. Limitation of Liability',
      content: 'TryRack is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.'
    },
    {
      title: '8. Privacy',
      content: 'Your use of TryRack is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.'
    },
    {
      title: '9. Termination',
      content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason we deem necessary.'
    },
    {
      title: '10. Changes to Terms',
      content: 'We may modify these terms at any time. We will notify you of any material changes. Your continued use of TryRack after changes constitutes acceptance of the new terms.'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Terms of Service"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.mainTitle}>
            Terms of Service
          </ThemedText>
          <ThemedText style={[styles.lastUpdated, { color: iconColor }]}>
            Last Updated: January 2024
          </ThemedText>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            <ThemedText style={[styles.sectionContent, { color: iconColor }]}>
              {section.content}
            </ThemedText>
          </View>
        ))}

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: iconColor }]}>
            By using TryRack, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
  lastUpdated: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
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
