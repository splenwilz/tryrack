import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

/**
 * Privacy & Security Screen
 * Manage privacy settings, data, and account security
 */
export default function PrivacySecurityScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsSharing, setAnalyticsSharing] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data will be exported to your email shortly.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Privacy & Security"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Privacy Settings
          </ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Profile Visibility</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Show your profile to other users
              </ThemedText>
            </View>
            <Switch
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              trackColor={{ false: iconColor, true: tintColor }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Data Sharing</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Allow data sharing for improvement
              </ThemedText>
            </View>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: iconColor, true: tintColor }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Analytics & Usage Data</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Help improve our services
              </ThemedText>
            </View>
            <Switch
              value={analyticsSharing}
              onValueChange={setAnalyticsSharing}
              trackColor={{ false: iconColor, true: tintColor }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Security Settings */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Security
          </ThemedText>

          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="lock" size={20} color={tintColor} />
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Change Password</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Update your account password
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Two-Factor Authentication</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Add an extra layer of security
              </ThemedText>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ false: iconColor, true: tintColor }}
              thumbColor="white"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="list.bullet.rectangle.fill" size={20} color={tintColor} />
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Active Sessions</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                View and manage active sessions
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Management
          </ThemedText>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <IconSymbol name="arrow.down" size={20} color={tintColor} />
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>Export Data</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Download your account data
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleDeleteAccount}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: '#FF3B30' }]}>Delete Account</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                Permanently delete your account
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText style={[styles.infoText, { color: iconColor }]}>
            Your privacy is important to us. We use encryption to protect your data and never share it with third parties without your consent.
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  dangerItem: {
    opacity: 0.8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
});
