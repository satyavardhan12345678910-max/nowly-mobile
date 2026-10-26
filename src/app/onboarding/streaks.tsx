import React, { useEffect } from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Exact cropped illustration from the reference image
const MOCKUP_IMAGE = require('@/../assets/images/nowly-streaks-badges-mockup.png');
// High-resolution asset dimensions: 997 x 1024
const MOCKUP_ASPECT_RATIO = 997 / 1024;

export default function StreaksBadgesOnboardingScreen() {
  const insets = useSafeAreaInsets();

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
    router.push('/onboarding/rescue');
  };

  const handleSkip = () => {
    router.push('/onboarding/intention');
  };

  return (
    <View style={styles.container}>
      {/* Background Soft Blush Glow */}
      <View style={styles.ambientGlow} />

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
        {/* ─── 1. TOP BAR: Wordmark + 5 Progress Indicators + Skip ─── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back to shared goals">
            <Text style={styles.brandTitle}>Nowly</Text>
          </Pressable>

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
            <Text style={styles.badgeText}>STREAKS & BADGES</Text>
          </View>
        </View>

        {/* ─── 3. MAIN HEADING & SUPPORTING TEXT ─── */}
        <View style={styles.headingSection}>
          <Text style={styles.heading}>Custom streaks</Text>
          <Text style={styles.heading}>with badges and</Text>
          <Text style={styles.heading}>relationships.</Text>

          <Text style={styles.paragraph}>
            Pick a streak with a friend. Complete it together to unlock a badge, set your wallpaper on the Settings page, and earn 2× streak points to win prizes.
          </Text>
        </View>

        {/* ─── 4. MAIN ILLUSTRATION (CROPPED PHONES & PINK ARTWORK) ─── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={MOCKUP_IMAGE}
            style={styles.illustrationImage}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Streaks and Badges interface mockup showing badges and relationship streak"
          />
        </View>

        {/* ─── 5. BOTTOM CONTINUE ACTION ─── */}
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
    backgroundColor: '#FCFAF9',
  },
  ambientGlow: {
    position: 'absolute',
    top: 140,
    right: -60,
    width: 280,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#FFE8EC',
    opacity: 0.6,
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
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
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
    backgroundColor: '#FDEAEB',
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
    color: '#FF044E',
    letterSpacing: 0.6,
  },

  // 3. Main Heading & Paragraph
  headingSection: {
    marginBottom: 4,
  },
  heading: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -1,
  },
  paragraph: {
    fontSize: 14.5,
    lineHeight: 20.5,
    color: '#717886',
    fontWeight: '400',
    marginTop: 10,
    letterSpacing: -0.1,
  },

  // 4. Main Illustration
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    width: '100%',
  },
  illustrationImage: {
    width: Math.min(SCREEN_WIDTH - 40, 345),
    height: Math.min(SCREEN_WIDTH - 40, 345) / MOCKUP_ASPECT_RATIO,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.46, 420),
    aspectRatio: MOCKUP_ASPECT_RATIO,
  },

  // 5. Bottom Continue Action
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
