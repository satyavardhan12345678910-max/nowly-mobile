import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function StreakRescueOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<'rescue' | 'friends'>('rescue');
  const [streakSaved, setStreakSaved] = useState(false);

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
    router.back();
  };

  const handleNext = () => {
    router.push('/onboarding/intention');
  };

  const handleSkip = () => {
    router.push('/onboarding/intention');
  };

  const handleSaveMyStreak = () => {
    setStreakSaved(true);
    // Illustrative interaction; allow seamless next progression
    setTimeout(() => {
      handleNext();
    }, 450);
  };

  return (
    <View style={styles.container}>
      {/* Background Soft Peach & Lavender Orbs */}
      <View style={styles.ambientPeachGlow} />
      <View style={styles.ambientLavenderGlow} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 8, 20),
            paddingBottom: Math.max(insets.bottom + 12, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* ─── 1. TOP BAR: Centered 5 Progress Indicators + Skip ─── */}
        <View style={styles.topBar}>
          {/* Left placeholder / back tap area */}
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back to streaks and badges"
            style={styles.backTouchTarget}
          />

          {/* 5 Progress Indicators (Middle / 3rd indicator active black) */}
          <View style={styles.progressContainer} accessibilityLabel="Step 3 of 5">
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <Pressable
            onPress={handleSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip to intentions">
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        </View>

        {/* ─── 2. CATEGORY BADGE ─── */}
        <View style={styles.categoryBadgeContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.badgeFlame}>🔥</Text>
            <Text style={styles.badgeText}>STREAK RESCUE</Text>
          </View>
        </View>

        {/* ─── 3. MAIN HEADING & SUPPORTING TEXT ─── */}
        <View style={styles.headingSection}>
          <Text style={styles.heading}>Missed a day?</Text>
          <Text style={styles.heading}>Rescue your streak.</Text>

          <Text style={styles.paragraph}>
            Use a Streak Rescue to keep{'\n'}your streak alive.
          </Text>
        </View>

        {/* ─── 4. CENTRAL RESCUE CARD ─── */}
        <View style={styles.cardWrapper}>
          <View style={styles.rescueCard}>
            {/* Top Drag Handle Decoration */}
            <View style={styles.dragHandle} />

            {/* Card Header */}
            <Text style={styles.cardTitle}>Your streak needs saving</Text>

            {/* Streak Counter with Flame */}
            <View style={styles.streakRow}>
              <Text style={styles.flameIcon}>🔥</Text>
              <Text style={styles.streakNumber}>127</Text>
            </View>
            <Text style={styles.streakCaption}>day streak</Text>

            {/* Pale Pink Alert Banner */}
            <View style={styles.alertBanner}>
              <Feather name="calendar" size={18} color="#EF4444" style={styles.alertIcon} />
              <View style={styles.alertTextCol}>
                <Text style={styles.alertTitle}>You missed yesterday</Text>
                <Text style={styles.alertSubtitle}>
                  Use a rescue to keep your streak alive.
                </Text>
              </View>
            </View>

            {/* Selection Option 1: Use Streak Rescue */}
            <Pressable
              onPress={() => setSelectedOption('rescue')}
              style={[
                styles.optionRow,
                selectedOption === 'rescue'
                  ? styles.optionRowSelected
                  : styles.optionRowUnselected,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedOption === 'rescue' }}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconContainer, styles.optionIconRescue]}>
                  <Feather name="life-buoy" size={20} color="#EA580C" />
                </View>
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>Use Streak Rescue</Text>
                  <Text style={styles.optionSubtitle}>3 rescues left this week</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedOption === 'rescue'
                    ? styles.radioOuterSelected
                    : styles.radioOuterUnselected,
                ]}>
                {selectedOption === 'rescue' && <View style={styles.radioInnerSelected} />}
              </View>
            </Pressable>

            {/* Selection Option 2: Restore with friends */}
            <Pressable
              onPress={() => setSelectedOption('friends')}
              style={[
                styles.optionRow,
                selectedOption === 'friends'
                  ? styles.optionRowSelected
                  : styles.optionRowUnselected,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedOption === 'friends' }}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconContainer, styles.optionIconFriends]}>
                  <Ionicons name="people" size={18} color="#1F2937" />
                </View>
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>Restore with friends</Text>
                  <Text style={styles.optionSubtitle}>
                    Ask a friend to help you keep your streak.
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedOption === 'friends'
                    ? styles.radioOuterSelected
                    : styles.radioOuterUnselected,
                ]}>
                {selectedOption === 'friends' && <View style={styles.radioInnerSelected} />}
              </View>
            </Pressable>

            {/* Illustrative Internal Button: Save my streak */}
            <Pressable
              onPress={handleSaveMyStreak}
              style={({ pressed }) => [
                styles.saveStreakButton,
                pressed && styles.saveStreakButtonPressed,
                streakSaved && styles.saveStreakButtonSaved,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save my streak">
              <Text style={styles.saveStreakButtonText}>
                {streakSaved ? 'Streak saved!' : 'Save my streak'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ─── 5. BOTTOM CONTINUE BUTTON ─── */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue to intentions">
            <Text style={styles.continueButtonText}>Continue</Text>
            <Feather
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={styles.continueArrow}
            />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  ambientPeachGlow: {
    position: 'absolute',
    top: 360,
    left: -70,
    width: 260,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FDEEE4',
    opacity: 0.8,
  },
  ambientLavenderGlow: {
    position: 'absolute',
    top: 200,
    right: -80,
    width: 280,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#F3EEF9',
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  // 1. Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 16,
  },
  backTouchTarget: {
    width: 44,
    height: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressSegment: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: '#111113',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E95A5',
  },

  // 2. Category Badge
  categoryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F2EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeFlame: {
    fontSize: 13,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#994F28',
    letterSpacing: 0.6,
  },

  // 3. Main Heading & Paragraph
  headingSection: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -1,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 21,
    color: '#717886',
    fontWeight: '400',
    marginTop: 10,
    letterSpacing: -0.1,
  },

  // 4. Central Rescue Card
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    width: '100%',
  },
  rescueCard: {
    width: '100%',
    maxWidth: 356,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 235, 0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 22,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111113',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  flameIcon: {
    fontSize: 26,
  },
  streakNumber: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -1,
  },
  streakCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E95A5',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },

  // Alert Banner
  alertBanner: {
    backgroundColor: '#FFF1F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  alertIcon: {
    marginTop: 1,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  alertSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E95A5',
    marginTop: 1,
  },

  // Selection Options
  optionRow: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionRowSelected: {
    backgroundColor: '#FFF7F2',
    borderWidth: 1.5,
    borderColor: '#F97316',
  },
  optionRowUnselected: {
    backgroundColor: '#FAFAFB',
    borderWidth: 1,
    borderColor: '#ECECEF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconRescue: {
    backgroundColor: '#FFEDD5',
  },
  optionIconFriends: {
    backgroundColor: '#F3F4F6',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E95A5',
    marginTop: 1,
  },

  // Radio Indicators
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderWidth: 2,
    borderColor: '#F97316',
  },
  radioOuterUnselected: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  radioInnerSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },

  // Internal Card Button: Save my streak
  saveStreakButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveStreakButtonPressed: {
    backgroundColor: '#26282E',
    transform: [{ scale: 0.99 }],
  },
  saveStreakButtonSaved: {
    backgroundColor: '#16A34A',
  },
  saveStreakButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // 5. Bottom Continue Button
  bottomSection: {
    marginTop: 6,
    marginBottom: 4,
  },
  continueButton: {
    width: '100%',
    height: 62,
    borderRadius: 31,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonPressed: {
    backgroundColor: '#26282E',
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    fontSize: 17.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  continueArrow: {
    marginLeft: 2,
  },
});
