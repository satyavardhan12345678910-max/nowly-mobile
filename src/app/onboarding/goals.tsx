import React, { useEffect } from 'react';
import {
  BackHandler,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Bundled local high-res portrait assets
const AVATARS = {
  sophie: require('@/../assets/images/avatars/sophie.jpg'),
  rohan: require('@/../assets/images/avatars/rohan.jpg'),
  maya: require('@/../assets/images/avatars/maya.jpg'),
  arjun: require('@/../assets/images/avatars/user.jpg'),
};

export default function SharedGoalsScreen() {
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
    router.push('/onboarding/streaks');
  };

  const handleSkip = () => {
    router.push('/onboarding/intention');
  };

  return (
    <View style={styles.container}>
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
            accessibilityLabel="Go back">
            <Text style={styles.brandTitle}>Nowly</Text>
          </Pressable>

          {/* 5 Progress Indicators (3rd is active / solid black) */}
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
            accessibilityLabel="Skip to next step">
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        </View>

        {/* ─── 2. SECTION BADGE ─── */}
        <View style={styles.sectionBadge}>
          <Feather name="users" size={13} color="#059669" style={{ marginRight: 6 }} />
          <Text style={styles.sectionBadgeText}>SHARED GOALS</Text>
        </View>

        {/* ─── 3. MAIN HEADING & SUBTITLE ─── */}
        <View style={styles.headingSection}>
          <Text style={styles.heading}>
            Turn goals{'\n'}into a group habit.
          </Text>
          <Text style={styles.subtitle}>
            Set a goal, invite your people, stay on track together and earn rewards.
          </Text>
        </View>

        {/* ─── 4. MAIN ILLUSTRATION / LAYERED CARD ─── */}
        <View style={styles.illustrationSection}>
          {/* Background Decorative Layer */}
          <View style={styles.cardBackgroundShadow} />

          {/* Foreground Main Goal Card */}
          <View style={styles.goalCard}>
            {/* Goal Card Header */}
            <View style={styles.goalCardHeader}>
              <View style={styles.targetIconCircle}>
                <Ionicons name="disc-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.goalCardHeaderText}>
                <Text style={styles.goalTitle}>Study 2 hours daily</Text>
                <Text style={styles.goalMeta}>4 people • Every day</Text>
              </View>
            </View>

            {/* Four Member Progress Indicators */}
            <View style={styles.membersRow}>
              {/* Sophie */}
              <View style={styles.memberCol}>
                <View style={[styles.avatarRing, styles.avatarRingCompleted]}>
                  <Image
                    source={AVATARS.sophie}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                    <Feather name="check" size={9} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  Sophie
                </Text>
                <Text style={[styles.memberProgress, { color: '#12C995' }]}>
                  2/2h
                </Text>
              </View>

              {/* Rohan */}
              <View style={styles.memberCol}>
                <View style={[styles.avatarRing, styles.avatarRingCompleted]}>
                  <Image
                    source={AVATARS.rohan}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                    <Feather name="check" size={9} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  Rohan
                </Text>
                <Text style={[styles.memberProgress, { color: '#12C995' }]}>
                  2/2h
                </Text>
              </View>

              {/* Maya */}
              <View style={styles.memberCol}>
                <View style={[styles.avatarRing, styles.avatarRingInProgress]}>
                  <Image
                    source={AVATARS.maya}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <View style={[styles.statusBadge, styles.statusBadgeInProgress]}>
                    <Feather name="clock" size={8} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  Maya
                </Text>
                <Text style={[styles.memberProgress, { color: '#F97316' }]}>
                  1/2h
                </Text>
              </View>

              {/* Arjun */}
              <View style={styles.memberCol}>
                <View style={[styles.avatarRing, styles.avatarRingInactive]}>
                  <Image
                    source={AVATARS.arjun}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <View style={[styles.statusBadge, styles.statusBadgeInactive]}>
                    <View style={styles.emptyDot} />
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  Arjun
                </Text>
                <Text style={[styles.memberProgress, { color: '#9CA3AF' }]}>
                  0/2h
                </Text>
              </View>
            </View>

            {/* Mint-Green Segmented Progress Bar */}
            <View style={styles.segmentedProgressBar}>
              <View style={[styles.barSegment, styles.barSegmentActive]} />
              <View style={[styles.barSegment, styles.barSegmentActive]} />
              <View style={[styles.barSegment, styles.barSegmentActive]} />
              <View style={[styles.barSegment, styles.barSegmentInactive]} />
            </View>

            <View style={styles.progressCaptionRow}>
              <Text style={styles.progressCaptionText}>3/4 completed</Text>
            </View>
          </View>

          {/* Floating Reminder Notification Card */}
          <View style={styles.notificationBubble}>
            <View style={styles.bellIconCircle}>
              <Feather name="bell" size={15} color="#111113" />
            </View>
            <View style={styles.notificationTextCol}>
              <View style={styles.notificationHeaderRow}>
                <Text style={styles.notificationAppTitle}>Nowly</Text>
                <Text style={styles.notificationTime}>now</Text>
              </View>
              <Text style={styles.notificationMainTitle}>Time to focus!</Text>
              <Text style={styles.notificationSub}>Study • 2 hours 💪</Text>
            </View>
          </View>

          {/* Curved Arrow & Reminder Caption */}
          <View style={styles.reminderCallout}>
            <View style={styles.curvedArrowContainer}>
              <Ionicons
                name="arrow-undo-outline"
                size={22}
                color="#94A3B8"
                style={styles.curvedArrowIcon}
              />
            </View>
            <Text style={styles.reminderCalloutText}>
              Get reminded{'\n'}at the set time.
            </Text>
          </View>
        </View>

        {/* ─── 5. THREE FEATURE TILES ─── */}
        <View style={styles.tilesRow}>
          {/* Tile 1: Set a goal */}
          <View style={styles.featureTile}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#E6FAF2' }]}>
              <Feather name="users" size={19} color="#059669" />
            </View>
            <Text style={styles.tileTitle}>Set a goal</Text>
          </View>

          {/* Tile 2: Stay on track */}
          <View style={styles.featureTile}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="bell" size={19} color="#9333EA" />
            </View>
            <Text style={styles.tileTitle}>Stay on track</Text>
          </View>

          {/* Tile 3: Earn rewards */}
          <View style={styles.featureTile}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#FFEDD5' }]}>
              <Feather name="gift" size={19} color="#EA580C" />
            </View>
            <Text style={styles.tileTitle}>Earn rewards</Text>
          </View>
        </View>

        {/* ─── 6. REWARDS BANNER ─── */}
        <View style={styles.rewardsBanner}>
          {/* Left Text */}
          <View style={styles.rewardsTextCol}>
            <Text style={styles.rewardsTitle}>
              Redeem your{'\n'}streak points.
            </Text>
            <Text style={styles.rewardsSubtitle}>
              After successful completion,{'\n'}receive points and redeem on these.
            </Text>
          </View>

          {/* Right Illustrations: Decorative Spark Rays + Brand Cards */}
          <View style={styles.rewardsGraphicCol}>
            {/* Orange Sparks Rays */}
            <View style={styles.sparkRaysContainer}>
              <View style={[styles.sparkRay, { transform: [{ rotate: '-35deg' }] }]} />
              <View style={[styles.sparkRay, { height: 10, transform: [{ rotate: '0deg' }] }]} />
              <View style={[styles.sparkRay, { transform: [{ rotate: '35deg' }] }]} />
            </View>

            {/* Overlapping Brand Mini Cards */}
            <View style={styles.cardsStack}>
              {/* 1. Netflix */}
              <View style={[styles.rewardMiniCard, styles.netflixCard]}>
                <Text style={styles.netflixLetter}>N</Text>
              </View>

              {/* 2. Canva */}
              <View style={[styles.rewardMiniCard, styles.canvaCard]}>
                <Text style={styles.canvaText}>Canva</Text>
              </View>

              {/* 3. Google */}
              <View style={[styles.rewardMiniCard, styles.googleCard]}>
                <View style={styles.googleGWrapper}>
                  <Ionicons name="logo-google" size={20} color="#EA4335" />
                </View>
              </View>

              {/* 4. Nowly Hoodie */}
              <View style={[styles.rewardMiniCard, styles.hoodieCard]}>
                <MaterialCommunityIcons name="tshirt-crew" size={21} color="#FFFFFF" />
                <Text style={styles.hoodieWordmark}>nowly</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 7. BOTTOM NEXT BUTTON ─── */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next to Intention setup">
            <Text style={styles.nextButtonText}>Next</Text>
            <Feather
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={styles.nextArrow}
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
  scrollContent: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
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
    width: 24,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E95A5',
  },

  // 2. Section Badge
  sectionBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  sectionBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.6,
  },

  // 3. Heading & Subtitle
  headingSection: {
    marginBottom: 14,
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15.5,
    lineHeight: 22,
    color: '#8E95A5',
    fontWeight: '400',
  },

  // 4. Main Illustration / Layered Card
  illustrationSection: {
    position: 'relative',
    marginVertical: 12,
    paddingTop: 16,
    paddingBottom: 28,
  },
  cardBackgroundShadow: {
    position: 'absolute',
    top: 24,
    left: 4,
    width: '92%',
    height: '88%',
    backgroundColor: '#EDF2F9',
    borderRadius: 26,
    transform: [{ rotate: '-6deg' }],
    opacity: 0.85,
  },
  goalCard: {
    width: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    transform: [{ rotate: '-2.5deg' }],
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  targetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalCardHeaderText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  goalMeta: {
    fontSize: 13,
    color: '#8E95A5',
    marginTop: 2,
    fontWeight: '400',
  },

  // Member Progress Circles Row
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 16,
  },
  memberCol: {
    alignItems: 'center',
    width: (SCREEN_WIDTH > 400 ? 68 : 62),
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarRingCompleted: {
    borderColor: '#12C995',
  },
  avatarRingInProgress: {
    borderColor: '#F97316',
  },
  avatarRingInactive: {
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  statusBadgeCompleted: {
    backgroundColor: '#12C995',
  },
  statusBadgeInProgress: {
    backgroundColor: '#F97316',
  },
  statusBadgeInactive: {
    backgroundColor: '#CBD5E1',
  },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#111113',
    marginTop: 5,
    textAlign: 'center',
  },
  memberProgress: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },

  // Segmented Progress Bar
  segmentedProgressBar: {
    height: 7,
    flexDirection: 'row',
    gap: 4,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  barSegment: {
    flex: 1,
    borderRadius: 3.5,
  },
  barSegmentActive: {
    backgroundColor: '#12C995',
  },
  barSegmentInactive: {
    backgroundColor: '#E5E7EB',
  },
  progressCaptionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  progressCaptionText: {
    fontSize: 12,
    color: '#8E95A5',
    fontWeight: '500',
  },

  // Floating Notification Bubble
  notificationBubble: {
    position: 'absolute',
    top: 6,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bellIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTextCol: {
    minWidth: 110,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationAppTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111113',
  },
  notificationTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationMainTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111113',
    marginTop: 1,
  },
  notificationSub: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },

  // Reminder Callout (Curved Arrow + Text)
  reminderCallout: {
    position: 'absolute',
    bottom: -6,
    right: 14,
    alignItems: 'center',
  },
  curvedArrowContainer: {
    marginBottom: 2,
    transform: [{ rotate: '45deg' }],
  },
  curvedArrowIcon: {
    opacity: 0.8,
  },
  reminderCalloutText: {
    fontSize: 11.5,
    lineHeight: 15,
    color: '#8E95A5',
    fontWeight: '500',
    textAlign: 'center',
  },

  // 5. Three Feature Tiles Row
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  featureTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  tileIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111113',
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  // 6. Rewards Banner
  rewardsBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  rewardsTextCol: {
    flex: 1,
    paddingRight: 6,
  },
  rewardsTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.3,
  },
  rewardsSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    color: '#8E95A5',
    marginTop: 5,
    fontWeight: '400',
  },
  rewardsGraphicCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  sparkRaysContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: 12,
    marginBottom: 3,
  },
  sparkRay: {
    width: 2,
    height: 8,
    borderRadius: 1,
    backgroundColor: '#FDBA74',
  },
  cardsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardMiniCard: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  netflixCard: {
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-6deg' }],
    zIndex: 1,
  },
  netflixLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E50914',
    letterSpacing: -1,
  },
  canvaCard: {
    backgroundColor: '#00C4CC',
    transform: [{ rotate: '4deg' }],
    zIndex: 2,
  },
  canvaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  googleCard: {
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-3deg' }],
    zIndex: 3,
  },
  googleGWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoodieCard: {
    backgroundColor: '#111113',
    transform: [{ rotate: '5deg' }],
    zIndex: 4,
    paddingTop: 1,
  },
  hoodieWordmark: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: -2,
  },

  // 7. Bottom Next Button
  bottomSection: {
    marginTop: 4,
  },
  nextButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
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
  nextButtonPressed: {
    backgroundColor: '#26282E',
    transform: [{ scale: 0.99 }],
  },
  nextButtonText: {
    fontSize: 17.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  nextArrow: {
    marginLeft: 2,
  },
});
