import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';

import {
  DEFAULT_PET_ID,
  getPetsByCategory,
  PET_CATEGORIES,
  PET_CATALOGUE,
} from '@/constants/pets';
import { useAuth } from '@/context/auth-context';
import { fetchUserPetSelection, saveUserPetSelection } from '@/lib/pet';
import { PetCatalogueEntry, PetCategory } from '@/types/pet';

// Base metrics for horizontal cards
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = 74;
const CARD_GAP = 9;

export default function OnboardingPetSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { user } = useAuth();

  // Screen height breakpoints for responsive space utilization
  const isCompact = screenHeight < 720;
  const isTall = screenHeight >= 840;

  // Active category filter (Normal, Uncommon, Mythical)
  const [activeCategory, setActiveCategory] = useState<PetCategory>('normal');

  // Currently selected pet ID (defaults to 'husky' matching screenshot)
  const [selectedPetId, setSelectedPetId] = useState<string>(DEFAULT_PET_ID);

  // Horizontal scroll ref for auto-scrolling to selected card
  const horizontalScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Persistence and loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dynamically calculate hero preview height to maximize central space without overflowing
  const heroHeight = useMemo(() => {
    // Non-hero content: insets + header (~38) + title block (~82) + pet details (~88) + bottom selection (~210)
    const fixedContentHeight = insets.top + insets.bottom + (isCompact ? 385 : 420);
    const available = screenHeight - fixedContentHeight;

    if (isCompact) {
      return Math.max(210, Math.min(255, available));
    } else if (isTall) {
      return Math.max(295, Math.min(355, available));
    }
    return Math.max(260, Math.min(315, available));
  }, [screenHeight, insets.top, insets.bottom, isCompact, isTall]);

  // Scaled soft mint aura diameter
  const auraSize = useMemo(() => {
    return Math.min(Math.round(heroHeight * 0.92), Math.round(screenWidth * 0.74));
  }, [heroHeight, screenWidth]);

  // Load existing pet selection on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSavedSelection() {
      try {
        const savedId = await fetchUserPetSelection(user?.id);
        if (isMounted && savedId) {
          const match = PET_CATALOGUE.find((p) => p.id === savedId);
          if (match) {
            setSelectedPetId(match.id);
            setActiveCategory(match.category);
          }
        }
      } catch (err) {
        console.warn('Could not load saved pet selection:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadSavedSelection();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Android hardware back support
  useEffect(() => {
    const onBack = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  // Currently selected pet record
  const selectedPet = useMemo<PetCatalogueEntry>(() => {
    return PET_CATALOGUE.find((p) => p.id === selectedPetId) || PET_CATALOGUE[0];
  }, [selectedPetId]);

  // Filtered pet list for current category
  const categoryPets = useMemo<PetCatalogueEntry[]>(() => {
    return getPetsByCategory(activeCategory);
  }, [activeCategory]);

  // Handle pet selection tap
  const handleSelectPet = useCallback((pet: PetCatalogueEntry, index?: number) => {
    setSelectedPetId(pet.id);
    setSaveError(null);

    // Keep selected card visible in horizontal scroll row
    if (typeof index === 'number' && horizontalScrollRef.current) {
      const scrollX = Math.max(0, index * (CARD_WIDTH + CARD_GAP) - screenWidth / 2 + CARD_WIDTH);
      horizontalScrollRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [screenWidth]);

  // Handle category switch
  const handleSwitchCategory = useCallback((cat: PetCategory) => {
    setActiveCategory(cat);
    const petsInCat = getPetsByCategory(cat);
    if (petsInCat.length > 0) {
      // If current selected pet is not in this category, select first pet
      const currentMatch = petsInCat.find((p) => p.id === selectedPetId);
      if (!currentMatch) {
        setSelectedPetId(petsInCat[0].id);
      }
    }
    // Reset horizontal scroll to beginning
    horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [selectedPetId]);

  // Handle back button
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Handle Continue button press
  const handleContinue = async () => {
    if (!selectedPet) {
      Alert.alert('Select a Pet', 'Please choose a companion to continue.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveUserPetSelection(user?.id, selectedPet.id);
      if (!result.success) {
        setSaveError('Could not save companion. Tap to retry.');
        setIsSaving(false);
        return;
      }

      // Successful persistence - navigate to next onboarding step
      try {
        router.push({
          pathname: '/onboarding/activity',
          params: { petId: selectedPet.id },
        } as any);
      } catch {
        router.push('/onboarding/goals');
      }
    } catch (err) {
      console.warn('Error saving pet selection:', err);
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render icon for each personality tag
  const renderTagIcon = (iconName?: string) => {
    switch (iconName) {
      case 'mountain':
        return <FontAwesome5 name="mountain" size={11} color="#064E3B" style={styles.tagIcon} />;
      case 'compass':
        return <Feather name="compass" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'flash':
      case 'zap':
        return <Ionicons name="flash" size={13} color="#064E3B" style={styles.tagIcon} />;
      case 'people':
      case 'users':
        return <Ionicons name="people" size={13} color="#064E3B" style={styles.tagIcon} />;
      case 'edit-3':
        return <Feather name="edit-3" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'droplet':
      case 'water':
        return <Ionicons name="water" size={13} color="#064E3B" style={styles.tagIcon} />;
      case 'sun':
      case 'sunny':
        return <Ionicons name="sunny" size={13} color="#064E3B" style={styles.tagIcon} />;
      case 'smile':
        return <Feather name="smile" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'heart':
        return <Ionicons name="heart" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'coffee':
        return <Feather name="coffee" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'feather':
        return <Feather name="feather" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'wind':
        return <Feather name="wind" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'book-open':
        return <Feather name="book-open" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'moon':
        return <Ionicons name="moon" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'cpu':
        return <Feather name="cpu" size={12} color="#064E3B" style={styles.tagIcon} />;
      case 'search':
        return <Feather name="search" size={12} color="#064E3B" style={styles.tagIcon} />;
      default:
        return <Ionicons name="sparkles" size={12} color="#064E3B" style={styles.tagIcon} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Ambient Organic Mint-Green Backdrop Blobs ─── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.ambientTopRightWave} />
        <View style={styles.ambientCenterBlob} />
      </View>

      {/* ─── 1. HEADER: Back Arrow + Nowly Brand (NO progress bar) ─── */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 2, 12) }]}>
        <Pressable
          style={({ pressed }) => [styles.headerLeft, pressed && styles.pressedOpacity]}
          onPress={handleBack}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel="Back to previous screen">
          <Ionicons name="chevron-back" size={24} color="#111113" />
          <Text style={styles.headerBrandTitle}>Nowly</Text>
        </Pressable>
      </View>

      {/* ─── 2. UPPER & HERO SECTION (Flexible, Centered, Scrollable on small screens) ─── */}
      <View style={styles.heroSectionWrapper}>
        <ScrollView
          contentContainerStyle={[
            styles.heroScrollContent,
            isCompact && styles.heroScrollContentCompact,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Top Titles Block */}
          <View style={styles.titleBlock}>
            <View style={styles.companionBadge}>
              <Ionicons name="paw" size={12} color="#059669" style={styles.companionBadgeIcon} />
              <Text style={styles.companionBadgeText}>YOUR COMPANION</Text>
            </View>
            <Text style={[styles.title, isCompact && styles.titleCompact]}>
              Choose your pet.
            </Text>
            <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>
              Pick a companion that's always with you on Nowly.
            </Text>
          </View>

          {/* Large Hero Preview (Primary Visual Focus) */}
          <View style={[styles.heroPreviewContainer, { height: heroHeight }]}>
            {/* Soft Mint Ambient Aura Backdrop */}
            <View
              style={[
                styles.heroAuraBackdrop,
                {
                  width: auraSize,
                  height: auraSize,
                  borderRadius: auraSize / 2,
                },
              ]}
            />

            {/* Significantly Enlarged Transparent Pet Illustration */}
            <Image
              source={selectedPet.image}
              style={styles.heroPetImage}
              contentFit="contain"
              transition={180}
              accessibilityLabel={`${selectedPet.name} full preview`}
            />

            {/* 3 Playful Mint-Green Delight Ticks */}
            <View
              style={[
                styles.delightTicks,
                {
                  top: Math.round(heroHeight * 0.1),
                  right: Math.round(screenWidth * 0.16),
                },
              ]}>
              <View style={[styles.delightTick, styles.tick1]} />
              <View style={[styles.delightTick, styles.tick2]} />
              <View style={[styles.delightTick, styles.tick3]} />
            </View>
          </View>

          {/* Pet Details directly beneath illustration */}
          <View style={styles.petDetailsBlock}>
            {/* Pet Name */}
            <Text style={[styles.selectedPetName, isCompact && styles.selectedPetNameCompact]}>
              {selectedPet.name}
            </Text>

            {/* 3 Personality Tags */}
            {selectedPet.personalityTags && selectedPet.personalityTags.length > 0 && (
              <View style={[styles.tagsContainer, isCompact && styles.tagsContainerCompact]}>
                {selectedPet.personalityTags.map((tag, idx) => (
                  <View key={`${tag.label}-${idx}`} style={[styles.tagPill, isCompact && styles.tagPillCompact]}>
                    {renderTagIcon(tag.icon)}
                    <Text style={[styles.tagPillText, isCompact && styles.tagPillTextCompact]}>
                      {tag.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Short Personality Description */}
            <Text
              style={[
                styles.selectedPetDescription,
                isCompact && styles.selectedPetDescriptionCompact,
              ]}
              numberOfLines={2}>
              {selectedPet.description}
            </Text>
          </View>

          {/* Save error banner with retry option */}
          {saveError && (
            <Pressable onPress={handleContinue} style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorBannerText}>{saveError}</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* ─── 3. BOTTOM-ALIGNED SELECTION SECTION (Category Tabs + Cards + Action Button) ─── */}
      <View
        style={[
          styles.bottomSelectionSection,
          {
            paddingBottom: Math.max(insets.bottom + 6, 14),
          },
        ]}>
        {/* Category Selector Tabs (Normal, Uncommon, Mythical) */}
        <View style={styles.categoryTabsContainer}>
          {PET_CATEGORIES.map((category) => {
            const isSelected = activeCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => handleSwitchCategory(category.id)}
                style={({ pressed }) => [
                  styles.categoryTab,
                  isCompact && styles.categoryTabCompact,
                  isSelected ? styles.categoryTabActive : styles.categoryTabInactive,
                  pressed && styles.pressedOpacity,
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${category.label} category`}>
                {category.id === 'normal' && (
                  <Ionicons
                    name="paw"
                    size={isCompact ? 14 : 15}
                    color={isSelected ? '#111113' : '#374151'}
                    style={styles.categoryTabIcon}
                  />
                )}
                {category.id === 'uncommon' && (
                  <Ionicons
                    name="star"
                    size={isCompact ? 13 : 14}
                    color={isSelected ? '#111113' : '#374151'}
                    style={styles.categoryTabIcon}
                  />
                )}
                {category.id === 'mythical' && (
                  <FontAwesome5
                    name="crown"
                    size={isCompact ? 11 : 12}
                    color={isSelected ? '#111113' : '#374151'}
                    style={styles.categoryTabIcon}
                  />
                )}
                <Text
                  style={[
                    styles.categoryTabText,
                    isCompact && styles.categoryTabTextCompact,
                    isSelected ? styles.categoryTabTextActive : styles.categoryTabTextInactive,
                  ]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Horizontal Pet Selector Cards */}
        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
          style={styles.horizontalScrollView}>
          {categoryPets.map((pet, index) => {
            const isSelected = pet.id === selectedPetId;

            return (
              <Pressable
                key={pet.id}
                onPress={() => handleSelectPet(pet, index)}
                style={({ pressed }) => [
                  styles.petCard,
                  isCompact && styles.petCardCompact,
                  isSelected ? styles.petCardSelected : styles.petCardInactive,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Select ${pet.name}`}>
                {/* Selected Checkmark Badge (Mint Green Circle) */}
                {isSelected && (
                  <View style={styles.selectedCheckBadge}>
                    <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                  </View>
                )}

                {/* Pet Artwork Illustration */}
                <View style={[styles.petCardImageWrapper, isCompact && styles.petCardImageWrapperCompact]}>
                  <Image
                    source={pet.image}
                    style={styles.petCardImage}
                    contentFit="contain"
                    transition={150}
                  />
                </View>

                {/* Pet Name */}
                <Text
                  style={[
                    styles.petCardName,
                    isCompact && styles.petCardNameCompact,
                    isSelected && styles.petCardNameSelected,
                  ]}
                  numberOfLines={1}>
                  {pet.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Choose This Pet Action Button */}
        <View style={styles.continueButtonWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              isCompact && styles.continueButtonCompact,
              isSaving && styles.continueButtonDisabled,
              pressed && !isSaving && styles.continueButtonPressed,
            ]}
            onPress={handleContinue}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Choose this pet and continue">
            {isSaving ? (
              <ActivityIndicator size="small" color="#111113" />
            ) : (
              <View style={styles.continueButtonContent}>
                <Text style={[styles.continueButtonText, isCompact && styles.continueButtonTextCompact]}>
                  Choose This Pet
                </Text>
                <Feather
                  name="arrow-right"
                  size={isCompact ? 17 : 19}
                  color="#111113"
                  style={styles.continueButtonArrow}
                />
              </View>
            )}
          </Pressable>
        </View>
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

  // ─── Organic Ambient Mint-Green Glow Waves ───
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
    top: 200,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#EDFAF4',
    opacity: 0.5,
  },

  // ─── Header: Back Arrow + Brand Title ───
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

  // ─── Upper & Hero Section (Takes all available space above selection section) ───
  heroSectionWrapper: {
    flex: 1,
  },
  heroScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 4,
  },
  heroScrollContentCompact: {
    paddingTop: 2,
  },

  // ─── Title Block ───
  titleBlock: {
    alignItems: 'flex-start',
  },
  companionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6FAF2',
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 5.5,
    marginBottom: 6,
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
    fontSize: 29,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 3,
  },
  titleCompact: {
    fontSize: 25,
    lineHeight: 30,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 18.5,
    marginBottom: 4,
  },
  subtitleCompact: {
    fontSize: 12.5,
    lineHeight: 16.5,
    marginBottom: 2,
  },

  // ─── Main Hero Showcase (Substantially Enlarged) ───
  heroPreviewContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  heroAuraBackdrop: {
    position: 'absolute',
    backgroundColor: '#E6FAF2',
    opacity: 0.85,
    transform: [{ scaleY: 0.95 }],
  },
  heroPetImage: {
    width: '94%',
    height: '94%',
    zIndex: 2,
  },
  delightTicks: {
    position: 'absolute',
    width: 26,
    height: 26,
    zIndex: 3,
  },
  delightTick: {
    position: 'absolute',
    backgroundColor: '#34D399',
    borderRadius: 1.5,
  },
  tick1: {
    top: 1,
    right: 3,
    width: 8.5,
    height: 2.5,
    transform: [{ rotate: '-25deg' }],
  },
  tick2: {
    top: 9,
    right: 0,
    width: 9.5,
    height: 2.5,
  },
  tick3: {
    top: 17,
    right: 4,
    width: 8.5,
    height: 2.5,
    transform: [{ rotate: '25deg' }],
  },

  // ─── Pet Details Directly Below Preview ───
  petDetailsBlock: {
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedPetName: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111113',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  selectedPetNameCompact: {
    fontSize: 23,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tagsContainerCompact: {
    gap: 5,
    marginBottom: 5,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6FAF2',
    paddingVertical: 5.5,
    paddingHorizontal: 11,
    borderRadius: 16,
  },
  tagPillCompact: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    gap: 4,
  },
  tagIcon: {
    marginTop: -0.5,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  tagPillTextCompact: {
    fontSize: 11,
  },
  selectedPetDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18.5,
    paddingHorizontal: 14,
  },
  selectedPetDescriptionCompact: {
    fontSize: 11.5,
    lineHeight: 16,
    paddingHorizontal: 10,
  },

  // ─── Bottom-Aligned Selection Section ───
  bottomSelectionSection: {
    backgroundColor: 'transparent',
    paddingTop: 2,
  },

  // ─── Category Tabs ───
  categoryTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5.5,
    height: 38,
    borderRadius: 19,
  },
  categoryTabCompact: {
    height: 34,
    borderRadius: 17,
    gap: 4.5,
  },
  categoryTabActive: {
    backgroundColor: '#B9F5D8',
  },
  categoryTabInactive: {
    backgroundColor: '#F3F4F6',
  },
  categoryTabIcon: {
    marginTop: -0.5,
  },
  categoryTabText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  categoryTabTextCompact: {
    fontSize: 11.5,
  },
  categoryTabTextActive: {
    color: '#111113',
    fontWeight: '700',
  },
  categoryTabTextInactive: {
    color: '#374151',
  },

  // ─── Horizontal Pet Selector Row ───
  horizontalScrollView: {
    marginBottom: 10,
  },
  horizontalScrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
    paddingVertical: 2,
  },
  petCard: {
    width: CARD_WIDTH,
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  petCardCompact: {
    height: 88,
    paddingVertical: 5,
  },
  petCardInactive: {
    borderWidth: 1.5,
    borderColor: '#F0F1F4',
  },
  petCardSelected: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  petCardImageWrapper: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCardImageWrapperCompact: {
    width: 46,
    height: 46,
  },
  petCardImage: {
    width: '100%',
    height: '100%',
  },
  petCardName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  petCardNameCompact: {
    fontSize: 10,
  },
  petCardNameSelected: {
    color: '#111113',
    fontWeight: '700',
  },

  // ─── Error Banner ───
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 6,
    gap: 6,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },

  // ─── Choose This Pet Action Button ───
  continueButtonWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  continueButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonCompact: {
    height: 48,
    borderRadius: 24,
  },
  continueButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  continueButtonTextCompact: {
    fontSize: 14.5,
  },
  continueButtonArrow: {
    marginTop: 1,
  },
});
