import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

import { DEFAULT_ACTIVITY_ID, getActivitiesForPet, getMissingAssetsForPet } from '@/constants/activities';
import { PET_CATALOGUE } from '@/constants/pets';
import { useAuth } from '@/context/auth-context';
import { fetchUserActivitySelection, saveUserActivitySelection } from '@/lib/activity';
import { fetchUserPetSelection } from '@/lib/pet';
import { ActivityCatalogueEntry } from '@/types/activity';

const HORIZONTAL_PADDING = 18;
const GRID_GAP = 12;

export default function OnboardingActivitySelectionScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ petId?: string }>();

  const isCompact = screenHeight < 720;

  // Selected companion pet ID (read from route params or fallback to 'red_panda')
  const [selectedPetId, setSelectedPetId] = useState<string>(params.petId || 'red_panda');

  // Selected activity ID (defaults to 'gym' matching reference screenshot)
  const [selectedActivityId, setSelectedActivityId] = useState<string>(DEFAULT_ACTIVITY_ID);

  // Loading & saving state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dynamic card geometry: EXACTLY 2 cards per row
  const cardWidth = useMemo(() => {
    const availableWidth = screenWidth - HORIZONTAL_PADDING * 2 - GRID_GAP;
    return Math.floor(availableWidth / 2);
  }, [screenWidth]);

  // Landscape image height preserving proportions of original 4:3 illustrations
  // Ensures approximately 6 cards are visible in the initial viewport
  const imageHeight = useMemo(() => {
    return Math.round(cardWidth * 0.72);
  }, [cardWidth]);

  // Selected companion pet metadata
  const selectedPet = useMemo(() => {
    return PET_CATALOGUE.find((p) => p.id === selectedPetId) || PET_CATALOGUE[0];
  }, [selectedPetId]);

  // Dynamically load the pet-specific activity catalogue
  const activities = useMemo<ActivityCatalogueEntry[]>(() => {
    return getActivitiesForPet(selectedPetId);
  }, [selectedPetId]);

  // Missing assets for the current pet (for logging / developer notice)
  const missingAssets = useMemo<string[]>(() => {
    return getMissingAssetsForPet(selectedPetId);
  }, [selectedPetId]);

  // Load existing pet selection and activity selection on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSelections() {
      try {
        const [savedPet, savedActivity] = await Promise.all([
          fetchUserPetSelection(user?.id),
          fetchUserActivitySelection(user?.id),
        ]);

        if (isMounted) {
          const activePet = params.petId || savedPet || 'red_panda';
          setSelectedPetId(activePet);

          if (savedActivity) {
            setSelectedActivityId(savedActivity);
          }
        }
      } catch (err) {
        console.warn('Could not load saved onboarding state:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSelections();
    return () => {
      isMounted = false;
    };
  }, [user?.id, params.petId]);

  // Android hardware back support
  useEffect(() => {
    const onBack = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/onboarding/pet' as any);
    }
  };

  const handleSelectActivity = useCallback((activity: ActivityCatalogueEntry) => {
    setSelectedActivityId(activity.id);
    setSaveError(null);
  }, []);

  const handleContinue = async () => {
    if (!selectedActivityId) {
      Alert.alert('Select an Activity', 'Please pick an activity to continue.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveUserActivitySelection(user?.id, selectedActivityId);
      if (!result.success) {
        setSaveError('Could not save activity. Tap to retry.');
        setIsSaving(false);
        return;
      }

      // Navigate to the next onboarding screen
      try {
        router.push('/onboarding/goals');
      } catch {
        router.push('/onboarding/streaks');
      }
    } catch (err) {
      console.warn('Error saving activity selection:', err);
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render activity icon for card label below image
  const renderCardIcon = (
    iconName?: string,
    iconFamily?: 'ionicons' | 'feather',
    isSelected: boolean = false
  ) => {
    const iconColor = isSelected ? '#059669' : '#374151';

    if (iconFamily === 'feather') {
      switch (iconName) {
        case 'play-circle':
          return <Feather name="play-circle" size={14} color={iconColor} style={styles.activityIcon} />;
        case 'frown':
          return <Feather name="frown" size={14} color={iconColor} style={styles.activityIcon} />;
        case 'book-open':
          return <Feather name="book-open" size={14} color={iconColor} style={styles.activityIcon} />;
        case 'headphones':
          return <Feather name="headphones" size={14} color={iconColor} style={styles.activityIcon} />;
        default:
          return <Feather name="activity" size={14} color={iconColor} style={styles.activityIcon} />;
      }
    }

    switch (iconName) {
      case 'barbell-outline':
        return <Ionicons name="barbell-outline" size={15} color={iconColor} style={styles.activityIcon} />;
      case 'game-controller-outline':
        return <Ionicons name="game-controller-outline" size={15} color={iconColor} style={styles.activityIcon} />;
      case 'moon':
        return <Ionicons name="moon" size={14} color={iconColor} style={styles.activityIcon} />;
      case 'restaurant-outline':
        return <Ionicons name="restaurant-outline" size={14} color={iconColor} style={styles.activityIcon} />;
      case 'school-outline':
        return <Ionicons name="school-outline" size={14} color={iconColor} style={styles.activityIcon} />;
      default:
        return <Ionicons name="sparkles" size={14} color={iconColor} style={styles.activityIcon} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Ambient Organic Mint-Green Backdrop Blobs ─── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.ambientTopRightWave} />
        <View style={styles.ambientCenterBlob} />
      </View>

      {/* ─── 1. HEADER: Back Arrow + Nowly Brand ─── */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 2, 12) }]}>
        <Pressable
          style={({ pressed }) => [styles.headerLeft, pressed && styles.pressedOpacity]}
          onPress={handleBack}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel="Back to companion selection">
          <Ionicons name="chevron-back" size={24} color="#111113" />
          <Text style={styles.headerBrandTitle}>Nowly</Text>
        </Pressable>
      </View>

      {/* ─── 2. MAIN SCROLLABLE CONTENT ─── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom + 90, 105),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}>
        {/* Title Block with Exact Approved Copy */}
        <View style={[styles.titleBlock, isCompact && styles.titleBlockCompact]}>
          <View style={styles.companionBadge}>
            <Ionicons name="sparkles" size={12} color="#059669" style={styles.companionBadgeIcon} />
            <Text style={styles.companionBadgeText}>YOUR ACTIVITY</Text>
          </View>
          <Text style={[styles.title, isCompact && styles.titleCompact]}>
            This is what your <Text style={styles.titleAccent}>activity cards</Text> look like based on the pet you chose.
          </Text>
        </View>

        {/* ─── 3. 2-COLUMN ACTIVITY GRID (Exactly 2 cards per row) ─── */}
        <View style={styles.gridContainer}>
          {activities.map((activity) => {
            const isSelected = activity.id === selectedActivityId;

            return (
              <Pressable
                key={activity.id}
                onPress={() => handleSelectActivity(activity)}
                style={({ pressed }) => [
                  styles.activityCard,
                  { width: cardWidth },
                  isSelected ? styles.activityCardSelected : styles.activityCardInactive,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Select ${activity.name}`}>
                {/* Circular Selection Checkmark Badge */}
                {isSelected && (
                  <View style={styles.selectedCheckBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}

                {/* 1. Full-bleed Landscape Illustration Container (Original Brightness, 0% overlay) */}
                <View style={[styles.cardImageWrapper, { height: imageHeight }]}>
                  {activity.image ? (
                    <Image
                      source={activity.image}
                      style={styles.cardImage}
                      contentFit="cover"
                      transition={150}
                      accessibilityLabel={`${activity.name} illustration`}
                    />
                  ) : (
                    <View style={styles.missingAssetPlaceholder}>
                      <Ionicons name="image-outline" size={26} color="#9CA3AF" />
                      <Text style={styles.missingAssetTitle}>Asset Pending</Text>
                      <Text style={styles.missingAssetSubtitle}>
                        {selectedPet.name} illustration missing
                      </Text>
                    </View>
                  )}
                </View>

                {/* 2. Activity Label strictly BELOW the image on clean white card surface */}
                <View style={styles.cardLabelContainer}>
                  <View style={styles.labelRow}>
                    {renderCardIcon(activity.icon, activity.iconFamily, isSelected)}
                    <Text
                      style={[
                        styles.activityName,
                        isSelected && styles.activityNameSelected,
                      ]}
                      numberOfLines={1}>
                      {activity.name}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Save error banner if any */}
        {saveError && (
          <Pressable onPress={handleContinue} style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorBannerText}>{saveError}</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* ─── 4. PINNED BOTTOM ACTION CONTAINER: "Continue →" ─── */}
      <View
        style={[
          styles.bottomActionContainer,
          {
            paddingBottom: Math.max(insets.bottom + 8, 14),
          },
        ]}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            (!selectedActivityId || isSaving) && styles.continueButtonDisabled,
            pressed && !isSaving && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!selectedActivityId || isSaving}
          accessibilityRole="button"
          accessibilityLabel="Continue to goals">
          {isSaving ? (
            <ActivityIndicator size="small" color="#111113" />
          ) : (
            <View style={styles.continueButtonContent}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Feather name="arrow-right" size={19} color="#111113" style={styles.continueButtonArrow} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pressedOpacity: {
    opacity: 0.7,
  },

  // ─── Organic Ambient Mint-Green Backdrop Blobs ───
  ambientTopRightWave: {
    position: 'absolute',
    top: 50,
    right: -80,
    width: 320,
    height: 380,
    borderRadius: 160,
    backgroundColor: '#E6FAF2',
    opacity: 0.65,
    transform: [{ rotate: '25deg' }, { scaleX: 1.1 }],
  },
  ambientCenterBlob: {
    position: 'absolute',
    top: 240,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#EDFAF4',
    opacity: 0.5,
  },

  // ─── Header: Back Arrow + Nowly Brand ───
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBrandTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.3,
  },

  // ─── Scroll Content ───
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
  },

  // ─── Title Block ───
  titleBlock: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleBlockCompact: {
    marginBottom: 7,
  },
  companionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6FAF2',
    paddingVertical: 4,
    paddingHorizontal: 9.5,
    borderRadius: 14,
    gap: 5,
    marginBottom: 5,
  },
  companionBadgeIcon: {
    marginTop: -0.5,
  },
  companionBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.35,
    lineHeight: 24.5,
  },
  titleCompact: {
    fontSize: 16.5,
    lineHeight: 22,
  },
  titleAccent: {
    color: '#00D084',
  },

  // ─── 2-Column Grid Container ───
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'flex-start',
  },
  activityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityCardInactive: {
    borderWidth: 1.5,
    borderColor: '#F0F1F4',
  },
  activityCardSelected: {
    borderWidth: 2.5,
    borderColor: '#00D084',
    ...Platform.select({
      ios: {
        shadowColor: '#00D084',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardImageWrapper: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  missingAssetPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  missingAssetTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  missingAssetSubtitle: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  cardLabelContainer: {
    height: 38,
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activityIcon: {
    marginTop: -0.5,
  },
  activityName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  activityNameSelected: {
    color: '#059669',
  },

  // ─── Error Banner ───
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },

  // ─── Fixed Bottom Action Container ───
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00D084',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  continueButtonArrow: {
    marginTop: 1,
  },
});
