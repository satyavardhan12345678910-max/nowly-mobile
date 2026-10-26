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

// Exact original mockup asset cropped from reference
const MOCKUP_IMAGE = require('@/../assets/images/nowly-people-widget-mockup.png');
// 426 x 514 aspect ratio from original crop
const MOCKUP_ASPECT_RATIO = 426 / 514;

export default function HomeWidgetOnboardingScreen() {
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

  const handleContinue = () => {
    router.replace('/');
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Background Soft Blue/Warm Glow */}
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
        {/* ─── 1. TOP BAR: Back Button + 5 Progress Indicators + Skip ─── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back to contacts page">
            <Feather name="chevron-left" size={22} color="#111113" />
          </Pressable>

          {/* 5 Progress Indicators (4 mint-green, 5th pale grey) */}
          <View style={styles.progressContainer} accessibilityLabel="Step 5 of 5">
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={styles.progressSegment} />
          </View>

          <Pressable
            onPress={handleSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip to home">
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        </View>

        {/* ─── 2. HEADING & SUBTITLE ─── */}
        <View style={styles.headingSection}>
          <Text style={styles.headingBlack}>Your people.</Text>
          <Text style={styles.headingGrey}>Right on your</Text>
          <Text style={styles.headingGrey}>home screen.</Text>

          <Text style={styles.subtitle}>
            See what your closest friends are doing without opening Nowly.
          </Text>
        </View>

        {/* ─── 3. EXACT PHONE HOME-SCREEN MOCKUP IMAGE ─── */}
        <View style={styles.mockupWrapper}>
          <Image
            source={MOCKUP_IMAGE}
            style={styles.mockupImage}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Phone home screen showing the Nowly friends widget and apps"
          />
        </View>

        {/* ─── 4. BOTTOM CONTINUE BUTTON ─── */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue to home">
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
    backgroundColor: '#FAFBFD',
  },
  ambientGlow: {
    position: 'absolute',
    top: 60,
    right: -40,
    width: 240,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#E0EDFD',
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    marginBottom: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: '#E5E7EB',
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
    backgroundColor: '#12C995',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E95A5',
  },

  // 2. Heading
  headingSection: {
    marginBottom: 8,
  },
  headingBlack: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -1,
  },
  headingGrey: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#717886',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15.5,
    lineHeight: 22,
    color: '#8E95A5',
    fontWeight: '400',
    marginTop: 8,
  },

  // 3. Exact Phone Mockup Image
  mockupWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  mockupImage: {
    width: Math.min(SCREEN_WIDTH - 44, 332),
    height: Math.min(SCREEN_WIDTH - 44, 332) / MOCKUP_ASPECT_RATIO,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.48, 430),
    aspectRatio: MOCKUP_ASPECT_RATIO,
  },

  // 4. Bottom Continue Button
  bottomSection: {
    marginTop: 8,
    marginBottom: 6,
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
