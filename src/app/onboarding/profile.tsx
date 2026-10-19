import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Radii, Shadows } from '@/design-system';
import { useAuth } from '@/context/auth-context';
import { fetchProfile, saveUserProfile, uploadAvatarPhoto } from '@/lib/profile';

type ImagePickerModuleType = typeof import('expo-image-picker');

let cachedImagePicker: ImagePickerModuleType | null = null;
function getImagePicker(): ImagePickerModuleType | null {
  if (cachedImagePicker) return cachedImagePicker;
  try {
    cachedImagePicker = require('expo-image-picker') as ImagePickerModuleType;
    return cachedImagePicker;
  } catch {
    return null;
  }
}

export default function OnboardingProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Initial user state (if pre-existing in auth session)
  const [name, setName] = useState(
    (user?.user_metadata?.display_name as string) ||
    (user?.user_metadata?.full_name as string) ||
    ''
  );
  const [photoUri, setPhotoUri] = useState<string | null>(
    (user?.user_metadata?.avatar_url as string) || null
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    (user?.user_metadata?.avatar_url as string) || null
  );

  const [nameError, setNameError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync auth user & database profile if available
  useEffect(() => {
    let isMounted = true;

    async function loadExistingProfile() {
      if (!user) return;

      // 1. Check user_metadata
      const metaName =
        (user.user_metadata?.display_name as string) ||
        (user.user_metadata?.full_name as string) ||
        '';
      const metaAvatar = (user.user_metadata?.avatar_url as string) || null;

      if (isMounted) {
        if (!name && metaName) setName(metaName);
        if (!photoUri && metaAvatar) {
          setPhotoUri(metaAvatar);
          setUploadedUrl(metaAvatar);
        }
      }

      // 2. Check public.profiles record in database
      const dbProfile = await fetchProfile(user.id);
      if (isMounted && dbProfile) {
        if (dbProfile.display_name && !name) {
          setName(dbProfile.display_name);
        }
        if (dbProfile.avatar_url && !photoUri) {
          setPhotoUri(dbProfile.avatar_url);
          setUploadedUrl(dbProfile.avatar_url);
        }
      }
    }

    loadExistingProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle image selection via native photo picker
  const handlePickPhoto = async () => {
    try {
      setPhotoError(null);

      const ImagePicker = getImagePicker();
      if (!ImagePicker) {
        setPhotoError('Image picker native module is not available in this build. Please install the latest development APK.');
        Alert.alert(
          'Update Required',
          'Photo selection requires the latest development build APK. Please install the updated APK.'
        );
        return;
      }

      // Check/request media library permissions
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      let finalStatus = status;

      if (status !== 'granted') {
        const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = permissionResponse.status;
      }

      if (finalStatus !== 'granted') {
        setPhotoError('Permission to access photos was denied. Please enable photo access in your settings.');
        return;
      }

      // Launch native image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedAsset = result.assets[0];
      const localUri = selectedAsset.uri;
      setPhotoUri(localUri);

      // If user is authenticated, attempt upload to Supabase storage 'avatars'
      if (user) {
        setIsUploadingPhoto(true);
        try {
          const publicUrl = await uploadAvatarPhoto(user.id, localUri);
          setUploadedUrl(publicUrl);
        } catch (uploadErr: any) {
          console.warn('Storage upload notice:', uploadErr.message);
          if (uploadErr.message?.includes('not found') || uploadErr.message?.includes('Bucket') || uploadErr.statusCode === '403') {
            setPhotoError(
              "Photo selected. Note: Supabase 'avatars' storage bucket needs migration to enable cloud sync."
            );
          } else {
            setPhotoError(`Cloud upload note: ${uploadErr.message}`);
          }
        } finally {
          setIsUploadingPhoto(false);
        }
      }
    } catch (err: any) {
      console.error('Error opening image picker:', err);
      if (err.message?.includes('ExponentImagePicker') || err.message?.includes('native module')) {
        setPhotoError('Image picker native module not found in this build. Please install the latest development build APK.');
        Alert.alert(
          'Update Required',
          'The installed development build does not contain the native image picker module. Please install the updated APK built by EAS.'
        );
      } else {
        setPhotoError(err.message || 'Failed to select image.');
      }
      setIsUploadingPhoto(false);
    }
  };

  // Handle Save and Next Navigation
  const handleNext = async () => {
    const trimmedName = name.trim();

    // 1. Validate Name
    if (!trimmedName) {
      setNameError('Please enter your name.');
      return;
    }
    setNameError(null);

    // Prevent repeated clicks while in progress
    if (isSaving) return;

    setIsSaving(true);

    try {
      let finalAvatarUrl = uploadedUrl;

      if (user) {
        // If photo selected but not yet uploaded to cloud, attempt upload now
        if (photoUri && (!uploadedUrl || uploadedUrl.startsWith('file:') || uploadedUrl.startsWith('content:'))) {
          try {
            finalAvatarUrl = await uploadAvatarPhoto(user.id, photoUri);
            setUploadedUrl(finalAvatarUrl);
          } catch (uploadErr) {
            console.warn('Could not upload photo during save; saving metadata:', uploadErr);
          }
        }

        // Save profile to Supabase auth metadata and public.profiles table
        await saveUserProfile(user.id, {
          displayName: trimmedName,
          avatarUrl: finalAvatarUrl,
        });
      }

      // Navigate to step 2 (Inner Circle) placeholder
      router.push('/onboarding/circle');
    } catch (error: any) {
      console.error('Profile save error:', error);
      Alert.alert('Save Error', error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Decorative Mint-Green Background Ambience */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.mintBlobTopLeft} />
        <View style={styles.mintBlobMidRight} />
        <View style={styles.mintBlobBottomLeft} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top + 8, 20),
                paddingBottom: Math.max(insets.bottom + 16, 28),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.contentWrapper}>
              {/* Top Navigation Bar: Back Chevron & Segmented Progress Indicator */}
              <View style={styles.topBar}>
                <Pressable
                  onPress={() => router.back()}
                  style={styles.backButton}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Go back">
                  <Feather name="chevron-left" size={28} color="#111113" />
                </Pressable>

                {/* 3-Step Segmented Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressSegment, styles.progressSegmentActive]} />
                  <View style={styles.progressSegment} />
                  <View style={styles.progressSegment} />
                </View>

                {/* Right Spacer to balance the top bar */}
                <View style={styles.topBarSpacer} />
              </View>

              {/* Brand Logo & Wordmark */}
              <View style={styles.brandingSection}>
                <Image
                  source={require('@/assets/images/nowly-logo.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                  accessibilityLabel="Nowly Logo"
                />
                <Text style={styles.wordmark}>Nowly</Text>

                {/* Main Heading & Subtitle */}
                <Text style={styles.heading}>Let’s set up your profile</Text>
                <Text style={styles.subtitle}>
                  Add your name and a photo so your{'\n'}friends can recognize you.
                </Text>
              </View>

              {/* Circular Photo Area */}
              <View style={styles.photoSection}>
                <Pressable
                  onPress={handlePickPhoto}
                  disabled={isUploadingPhoto}
                  style={({ pressed }) => [
                    styles.photoOuterRing,
                    pressed && styles.photoRingPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add or change profile photo">
                  <View style={styles.photoInnerCircle}>
                    {photoUri ? (
                      <Image
                        source={{ uri: photoUri }}
                        style={styles.avatarPhoto}
                        contentFit="cover"
                        transition={200}
                        accessibilityLabel="Selected Profile Photo"
                      />
                    ) : (
                      <View style={styles.photoPlaceholderContent}>
                        <Ionicons name="camera" size={32} color="#555B68" />
                        <Text style={styles.addPhotoText}>Add photo</Text>
                      </View>
                    )}

                    {/* Uploading Spinner Overlay */}
                    {isUploadingPhoto && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color="#10B981" />
                      </View>
                    )}
                  </View>

                  {/* Mint Plus Badge */}
                  <View style={styles.plusBadge}>
                    <Feather name="plus" size={18} color="#111113" />
                  </View>
                </Pressable>

                {/* Photo feedback / error */}
                {photoError && (
                  <Text style={styles.photoNoticeText}>{photoError}</Text>
                )}
              </View>

              {/* Name Field Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Your name</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError && text.trim().length > 0) {
                      setNameError(null);
                    }
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isSaving}
                  style={[
                    styles.textInput,
                    nameError ? styles.textInputError : null,
                  ]}
                />
                {nameError && (
                  <Text style={styles.errorText}>{nameError}</Text>
                )}
              </View>

              {/* Black Next Button */}
              <Pressable
                onPress={handleNext}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.nextButton,
                  pressed && styles.nextButtonPressed,
                  isSaving && styles.nextButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Next">
                <View style={styles.nextButtonContent}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>Next</Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color="#FFFFFF"
                        style={styles.nextButtonArrow}
                      />
                    </>
                  )}
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  /* Atmospheric Mint Background Shapes */
  mintBlobTopLeft: {
    position: 'absolute',
    top: -50,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E6FAF2',
    opacity: 0.9,
  },
  mintBlobMidRight: {
    position: 'absolute',
    top: 220,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E6FAF2',
    opacity: 0.7,
  },
  mintBlobBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#E6FAF2',
    opacity: 0.8,
  },

  /* Top Navigation Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topBarSpacer: {
    width: 36,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressSegment: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: '#10B981',
  },

  /* Brand Logo & Wordmark */
  brandingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 20,
    marginBottom: 6,
  },
  wordmark: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#737B8C',
    textAlign: 'center',
  },

  /* Circular Photo Area */
  photoSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  photoOuterRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1.5,
    borderColor: '#EFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    ...Shadows.sm,
  },
  photoRingPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  photoInnerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#F0F1F4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555B68',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  photoNoticeText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#059669',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },

  /* Name Field */
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111113',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111113',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },

  /* Black Next Button */
  nextButton: {
    height: 54,
    borderRadius: Radii.pill,
    backgroundColor: '#111113',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Shadows.button,
  },
  nextButtonPressed: {
    backgroundColor: '#2D2F36',
    transform: [{ scale: 0.99 }],
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonArrow: {
    marginLeft: 8,
  },
});
