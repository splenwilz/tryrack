/**
 * Try-On Detail Screen (Full-Screen View)
 * Shows a single try-on result with actions: share, save, delete
 */
import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useDeleteTryOn } from '@/hooks/useVirtualTryOn';
import { useUser } from '@/hooks/useAuthQuery';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TryOnDetailScreen() {
  const router = useRouter();
  const { imageUrl, createdAt, tryonId } = useLocalSearchParams<{
    imageUrl: string;
    createdAt: string;
    tryonId: string;
  }>();

  const [isSaving, setIsSaving] = useState(false);

  // Get current user
  const { data: user } = useUser();

  // Delete mutation
  const deleteMutation = useDeleteTryOn();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleClose = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out my virtual try-on!',
        url: imageUrl, // iOS only
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share image');
      console.error('Share error:', error);
    }
  };

  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to save images'
        );
        setIsSaving(false);
        return;
      }

      // Download image to local file system (use PNG for lossless quality)
      const filename = `tryon_${tryonId}_${Date.now()}.png`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;
      
      console.log('📥 Downloading high-quality image from:', imageUrl);
      console.log('💾 Local path:', localUri);
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
      
      console.log('✅ Download result:', downloadResult);
      
      // Save to media library with original quality
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      
      console.log('📸 Asset created:', asset);
      
      // Optionally create album
      const album = await MediaLibrary.getAlbumAsync('TryRack Try-Ons');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('TryRack Try-Ons', asset, false);
      }

      Alert.alert('Success!', 'Image saved to your photo library');
      setIsSaving(false);
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save image to gallery');
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Delete Try-On',
      'Are you sure you want to delete this try-on? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting try-on:', tryonId);
              
              await deleteMutation.mutateAsync({
                tryonId: parseInt(tryonId, 10),
                userId: user.id,
              });
              
              console.log('✅ Try-on deleted successfully');
              
              // Navigate back immediately (don't wait for alert)
              router.back();
              
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert('Deleted', 'Try-on deleted successfully');
              }, 300);
            } catch (error: any) {
              console.error('❌ Delete error:', error);
              
              // Only show error if it's not a 404 (404 means already deleted)
              if (error.status !== 404) {
                Alert.alert('Error', 'Failed to delete try-on');
              } else {
                // Already deleted, just go back
                console.log('ℹ️ Try-on already deleted, navigating back');
                router.back();
              }
            }
          },
        },
      ]
    );
  };

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {createdAt ? formatDate(createdAt) : 'Try-On'}
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      {/* Image */}
      <View style={[styles.imageContainer, { backgroundColor: cardBg }]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Action Buttons */}
      <View style={[styles.actions, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: cardBg }]}
          onPress={handleShare}
          disabled={deleteMutation.isPending}
        >
          <MaterialIcons name="share" size={22} color={tintColor} />
          <ThemedText style={[styles.actionText, { color: textColor }]}>Share</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: cardBg }]}
          onPress={handleSaveToGallery}
          disabled={isSaving || deleteMutation.isPending}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : (
            <MaterialIcons name="download" size={22} color={tintColor} />
          )}
          <ThemedText style={[styles.actionText, { color: textColor }]}>
            {isSaving ? 'Saving...' : 'Save'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: cardBg }]}
          onPress={handleDelete}
          disabled={deleteMutation.isPending || isSaving}
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator size="small" color="#ff3b30" />
          ) : (
            <MaterialIcons name="delete" size={22} color="#ff3b30" />
          )}
          <ThemedText style={[styles.actionText, { color: '#ff3b30' }]}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
});

