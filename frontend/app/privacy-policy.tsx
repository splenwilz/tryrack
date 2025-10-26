import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';

/**
 * Privacy Policy Screen
 * Comprehensive privacy policy for TryRack users
 */
export default function PrivacyPolicyScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');

  const handleBackPress = () => {
    router.back();
  };

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, such as account details, preferences, uploaded images, and usage data. We also automatically collect certain information about your device and how you use TryRack.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use your information to:\n• Provide and improve our services\n• Process virtual try-on requests\n• Personalize your experience\n• Send you updates and notifications\n• Ensure security and prevent fraud\n• Comply with legal obligations'
    },
    {
      title: '3. Data Storage and Security',
      content: 'We implement industry-standard security measures to protect your data. Your information is encrypted in transit and at rest. We regularly review and update our security practices to ensure your data is safe.'
    },
    {
      title: '4. Image Data and AI Processing',
      content: 'When you use our virtual try-on feature, we process your uploaded images using AI technology. Images are temporarily stored for processing purposes and are automatically deleted after a short period.'
    },
    {
      title: '5. Data Sharing',
      content: 'We do not sell your personal information. We may share your information with:\n• Service providers who help us operate\n• Legal authorities when required by law\n• Business partners with your explicit consent'
    },
    {
      title: '6. Your Rights',
      content: 'You have the right to:\n• Access your personal data\n• Correct inaccurate information\n• Request deletion of your data\n• Export your data\n• Opt-out of certain data processing\n• Withdraw consent at any time'
    },
    {
      title: '7. Third-Party Services',
      content: 'TryRack may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.'
    },
    {
      title: '8. Cookies and Tracking',
      content: 'We use cookies and similar technologies to enhance your experience, analyze usage, and improve our services. You can manage cookie preferences through your device settings.'
    },
    {
      title: '9. Children\'s Privacy',
      content: 'TryRack is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.'
    },
    {
      title: '10. International Data Transfers',
      content: 'Your information may be transferred to and processed in countries other than your own. We ensure adequate safeguards are in place to protect your data in accordance with this privacy policy.'
    },
    {
      title: '11. Data Retention',
      content: 'We retain your personal information only as long as necessary to provide our services and comply with legal obligations. When you delete your account, we remove your personal data within 30 days.'
    },
    {
      title: '12. Changes to Privacy Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Privacy Policy"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.mainTitle}>
            Privacy Policy
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
            If you have questions about this Privacy Policy, please contact us at privacy@tryrack.com
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
