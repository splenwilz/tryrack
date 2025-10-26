import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

/**
 * Help & Support Screen
 * Access support resources, FAQs, and contact options
 */
export default function HelpSupportScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleBackPress = () => {
    router.back();
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose a support option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@tryrack.com')
        },
        { 
          text: 'Phone', 
          onPress: () => Linking.openURL('tel:+2348012345678')
        }
      ]
    );
  };

  const helpTopics = [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Learn how to use TryRack',
      icon: 'rocket.fill',
      items: [
        'Creating your profile',
        'Adding wardrobe items',
        'Using virtual try-on',
        'Managing your boutique'
      ]
    },
    {
      id: '2',
      title: 'Virtual Try-On',
      description: 'How virtual try-on works',
      icon: 'camera.fill',
      items: [
        'Taking good photos',
        'Using virtual try-on',
        'Understanding results',
        'Troubleshooting'
      ]
    },
    {
      id: '3',
      title: 'Boutique Management',
      description: 'Manage your boutique',
      icon: 'bag.fill',
      items: [
        'Adding products',
        'Managing orders',
        'Customer try-ons',
        'Analytics and reports'
      ]
    },
    {
      id: '4',
      title: 'Account & Billing',
      description: 'Manage your account',
      icon: 'creditcard',
      items: [
        'Subscription plans',
        'Payment methods',
        'Billing history',
        'Account settings'
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Help & Support"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Need Help?
          </ThemedText>

          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: tintColor }]} onPress={handleContactSupport}>
            <IconSymbol name="message.fill" size={24} color="white" />
            <View style={styles.quickActionInfo}>
              <ThemedText style={styles.quickActionTitle}>Contact Support</ThemedText>
              <ThemedText style={styles.quickActionDescription}>
                Get help from our support team
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: `${tintColor}20` }]}>
            <IconSymbol name="questionmark.circle" size={24} color={tintColor} />
            <View style={styles.quickActionInfo}>
              <ThemedText style={[styles.quickActionTitle, { color: useThemeColor({}, 'text') }]}>
                FAQ
              </ThemedText>
              <ThemedText style={[styles.quickActionDescription, { color: iconColor }]}>
                Find answers to common questions
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={tintColor} />
          </TouchableOpacity>
        </View>

        {/* Help Topics */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Help Topics
          </ThemedText>

          {helpTopics.map((topic) => (
            <TouchableOpacity 
              key={topic.id} 
              style={styles.topicItem}
              onPress={() => Alert.alert(topic.title, topic.items.join('\n• '))}
            >
              <View style={[styles.topicIcon, { backgroundColor: `${tintColor}20` }]}>
                <IconSymbol 
                  name={topic.icon as 'rocket.fill' | 'camera.fill' | 'bag.fill' | 'creditcard'} 
                  size={24} 
                  color={tintColor} 
                />
              </View>
              <View style={styles.topicInfo}>
                <ThemedText style={styles.topicTitle}>{topic.title}</ThemedText>
                <ThemedText style={[styles.topicDescription, { color: iconColor }]}>
                  {topic.description}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={iconColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Resources */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Resources
          </ThemedText>

          <TouchableOpacity style={styles.resourceItem}>
            <IconSymbol name="book.fill" size={20} color={tintColor} />
            <ThemedText style={styles.resourceText}>Documentation</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <IconSymbol name="play.circle.fill" size={20} color={tintColor} />
            <ThemedText style={styles.resourceText}>Video Tutorials</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <IconSymbol name="person.2.fill" size={20} color={tintColor} />
            <ThemedText style={styles.resourceText}>Community Forum</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Contact Us
          </ThemedText>

          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@tryrack.com')}>
            <IconSymbol name="envelope.fill" size={20} color={tintColor} />
            <ThemedText style={styles.contactText}>support@tryrack.com</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+2348012345678')}>
            <IconSymbol name="phone.fill" size={20} color={tintColor} />
            <ThemedText style={styles.contactText}>+234 801 234 5678</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <IconSymbol name="clock.fill" size={20} color={tintColor} />
            <ThemedText style={styles.contactText}>Mon-Fri, 9AM-5PM WAT</ThemedText>
          </View>
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
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  topicDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
  },
});
