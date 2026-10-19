import { useEffect } from 'react';
import {
  BackHandler,
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
import { Feather, Ionicons } from '@expo/vector-icons';

import { Radii } from '@/design-system';
import { useAuth } from '@/context/auth-context';

// Bundled local high-res portrait assets for 100% reliable, instant offline rendering
const LOCAL_AVATARS = {
  sophie: require('@/../assets/images/avatars/sophie.jpg'),
  rohan: require('@/../assets/images/avatars/rohan.jpg'),
  maya: require('@/../assets/images/avatars/maya.jpg'),
  defaultUser: require('@/../assets/images/avatars/user.jpg'),
};

export default function HowNowlyWorksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Hardware back button support for Android to return to Profile Setup
  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleNext = () => {
    // Preserves existing flow; next onboarding step will be connected in future patch
  };

  const userAvatarSource = user?.user_metadata?.avatar_url
    ? { uri: user.user_metadata.avatar_url }
    : LOCAL_AVATARS.defaultUser;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 6, 18),
            paddingBottom: Math.max(insets.bottom + 14, 22),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back to Profile Setup">
            <Text style={styles.brandTitle}>Nowly</Text>
          </Pressable>

          {/* 4-part Progress Indicator (1st active/black, remaining 3 light grey) */}
          <View style={styles.progressBar} accessibilityLabel="Step 1 of 4">
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
        </View>

        {/* Heading & Subtitle */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>How Nowly works.</Text>
          <Text style={styles.subtitle}>Stay close with your people, effortlessly.</Text>
        </View>

        {/* Feature Cards List */}
        <View style={styles.cardsContainer}>
          {/* ========================================================= */}
          {/* CARD 1 — See */}
          {/* ========================================================= */}
          <View style={styles.card}>
            {/* Left: Explanatory Content */}
            <View style={styles.cardLeft}>
              <View style={[styles.iconBadge, styles.iconBadgeMint]}>
                <Feather name="eye" size={21} color="#05C189" />
              </View>
              <Text style={styles.cardTitle}>See</Text>
              <Text style={styles.cardDescription}>
                what your people are doing right now.
              </Text>
            </View>

            {/* Right: Enlarged Nowly Friends Preview */}
            <View style={styles.cardRight}>
              <View style={styles.previewContainer}>
                {/* Header: "Nowly" + search and plus controls */}
                <View style={styles.previewTopRow}>
                  <Text style={styles.previewBrand}>Nowly</Text>
                  <View style={styles.previewActions}>
                    <Feather name="search" size={14} color="#4B5563" />
                    <View style={styles.previewMiniAddButton}>
                      <Feather name="plus" size={12} color="#374151" />
                    </View>
                  </View>
                </View>

                {/* Friends Row with Larger Avatars */}
                <View style={styles.friendsRow}>
                  {/* Add Friend */}
                  <View style={styles.friendCol}>
                    <View style={styles.addFriendCircle}>
                      <Feather name="plus" size={16} color="#374151" />
                    </View>
                    <Text style={styles.friendName}>Add</Text>
                    <Text style={styles.friendStatusPlaceholder}> </Text>
                    <Text style={styles.friendTimePlaceholder}> </Text>
                  </View>

                  {/* Sophie (Working - 3m ago - Green ring & dot) */}
                  <View style={styles.friendCol}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={LOCAL_AVATARS.sophie}
                        style={[styles.friendAvatar, styles.avatarActiveBorder]}
                        contentFit="cover"
                        transition={150}
                      />
                      <View style={[styles.statusDot, styles.statusDotGreen]} />
                    </View>
                    <Text style={styles.friendName} numberOfLines={1}>Sophie</Text>
                    <Text style={styles.friendStatus} numberOfLines={1}>Working</Text>
                    <Text style={styles.friendTime} numberOfLines={1}>3m ago</Text>
                  </View>

                  {/* Rohan (At Gym - 12m ago - Orange dot) */}
                  <View style={styles.friendCol}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={LOCAL_AVATARS.rohan}
                        style={styles.friendAvatar}
                        contentFit="cover"
                        transition={150}
                      />
                      <View style={[styles.statusDot, styles.statusDotOrange]} />
                    </View>
                    <Text style={styles.friendName} numberOfLines={1}>Rohan</Text>
                    <Text style={styles.friendStatus} numberOfLines={1}>At Gym</Text>
                    <Text style={styles.friendTime} numberOfLines={1}>12m ago</Text>
                  </View>

                  {/* Maya (Studying - 28m ago - Grey dot) */}
                  <View style={styles.friendCol}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={LOCAL_AVATARS.maya}
                        style={styles.friendAvatar}
                        contentFit="cover"
                        transition={150}
                      />
                      <View style={[styles.statusDot, styles.statusDotGrey]} />
                    </View>
                    <Text style={styles.friendName} numberOfLines={1}>Maya</Text>
                    <Text style={styles.friendStatus} numberOfLines={1}>Studying</Text>
                    <Text style={styles.friendTime} numberOfLines={1}>28m ago</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ========================================================= */}
          {/* CARD 2 — Update */}
          {/* ========================================================= */}
          <View style={styles.card}>
            {/* Left: Explanatory Content */}
            <View style={styles.cardLeft}>
              <View style={[styles.iconBadge, styles.iconBadgeLavender]}>
                <Feather name="plus" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.cardTitle}>Update</Text>
              <Text style={styles.cardDescription}>
                what you're doing in seconds.
              </Text>
            </View>

            {/* Right: Message Composer Preview */}
            <View style={styles.cardRight}>
              <View style={styles.previewContainer}>
                {/* Input Bar with User Portrait */}
                <View style={styles.composerRow}>
                  <Image
                    source={userAvatarSource}
                    style={styles.composerUserAvatar}
                    contentFit="cover"
                    transition={150}
                  />

                  {/* Pill input container */}
                  <View style={styles.composerPill}>
                    <View style={styles.composerTextWrapper}>
                      <Text style={styles.composerText}>At the gym 💪</Text>
                      <View style={styles.composerCursor} />
                    </View>
                    <View style={styles.sendButtonCircle}>
                      <Feather name="arrow-up" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </View>

                {/* Bottom Controls: Image, Smile, Pin, Aa */}
                <View style={styles.composerControlsRow}>
                  <View style={styles.composerControlBtn}>
                    <Feather name="image" size={16} color="#6B7280" />
                  </View>
                  <View style={styles.composerControlBtn}>
                    <Feather name="smile" size={16} color="#6B7280" />
                  </View>
                  <View style={styles.composerControlBtn}>
                    <Feather name="map-pin" size={15} color="#6B7280" />
                  </View>
                  <View style={styles.composerControlBtn}>
                    <Text style={styles.composerAaText}>Aa</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ========================================================= */}
          {/* CARD 3 — Build */}
          {/* ========================================================= */}
          <View style={styles.card}>
            {/* Left: Explanatory Content */}
            <View style={styles.cardLeft}>
              <View style={[styles.iconBadge, styles.iconBadgePeach]}>
                <Ionicons name="stats-chart" size={21} color="#F97316" />
              </View>
              <Text style={styles.cardTitle}>Build</Text>
              <Text style={styles.cardDescription}>
                streaks and get a weekly report.
              </Text>
            </View>

            {/* Right: Weekly Activity Chart Preview */}
            <View style={styles.cardRight}>
              <View style={styles.previewContainer}>
                <Text style={styles.chartTitle}>Your week</Text>

                {/* 7-day Activity Chart */}
                <View style={styles.chartBarsRow}>
                  {/* Mon */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPeach, { height: 18 }]} />
                    </View>
                    <Text style={styles.dayLabel}>Mon</Text>
                  </View>

                  {/* Tue */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPeach, { height: 30 }]} />
                    </View>
                    <Text style={styles.dayLabel}>Tue</Text>
                  </View>

                  {/* Wed (Vivid Orange Highlight) */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillOrange, { height: 52 }]} />
                    </View>
                    <Text style={[styles.dayLabel, styles.dayLabelHighlight]}>Wed</Text>
                  </View>

                  {/* Thu */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPeach, { height: 24 }]} />
                    </View>
                    <Text style={styles.dayLabel}>Thu</Text>
                  </View>

                  {/* Fri */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPeach, { height: 18 }]} />
                    </View>
                    <Text style={styles.dayLabel}>Fri</Text>
                  </View>

                  {/* Sat */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPeach, { height: 40 }]} />
                    </View>
                    <Text style={styles.dayLabel}>Sat</Text>
                  </View>

                  {/* Sun */}
                  <View style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPeach, { height: 26 }]} />
                    </View>
                    <Text style={styles.dayLabel}>Sun</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Button positioned with exact relative margin */}
        <View style={styles.bottomContainer}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next">
            <Text style={styles.nextButtonText}>Next →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },

  // Top Header Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.4,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressSegment: {
    width: 14,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    width: 18,
    backgroundColor: '#111113',
  },

  // Headings
  headerSection: {
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#8E95A5',
    fontWeight: '400',
  },

  // Cards List
  cardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EDF0F3',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Left Column
  cardLeft: {
    width: 92,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconBadgeMint: {
    backgroundColor: '#D7F7EB',
  },
  iconBadgeLavender: {
    backgroundColor: '#F3ECFE',
  },
  iconBadgePeach: {
    backgroundColor: '#FFF1E8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8E95A5',
    fontWeight: '400',
  },

  // Right Column Preview Card
  cardRight: {
    flex: 1,
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 11,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },

  // Card 1: See Preview Elements
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111113',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  previewMiniAddButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  friendCol: {
    alignItems: 'center',
    flex: 1,
  },
  addFriendCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 5,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  avatarActiveBorder: {
    borderWidth: 1.8,
    borderColor: '#10B981',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  statusDotGreen: {
    backgroundColor: '#10B981',
  },
  statusDotOrange: {
    backgroundColor: '#F97316',
  },
  statusDotGrey: {
    backgroundColor: '#9CA3AF',
  },
  friendName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111113',
    marginBottom: 1,
  },
  friendStatus: {
    fontSize: 8.5,
    color: '#6B7280',
    lineHeight: 11,
  },
  friendTime: {
    fontSize: 8,
    color: '#9CA3AF',
    lineHeight: 10,
  },
  friendStatusPlaceholder: {
    fontSize: 8.5,
    lineHeight: 11,
  },
  friendTimePlaceholder: {
    fontSize: 8,
    lineHeight: 10,
  },

  // Card 2: Update Preview Elements
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  composerUserAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
  },
  composerPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
  },
  composerTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  composerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#111113',
  },
  composerCursor: {
    width: 1.5,
    height: 13,
    backgroundColor: '#F59E0B',
    marginLeft: 2,
    borderRadius: 1,
  },
  sendButtonCircle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  composerControlBtn: {
    width: 36,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerAaText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Card 3: Build Preview Elements
  chartTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#8E95A5',
    marginBottom: 6,
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 58,
    paddingHorizontal: 2,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 52,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  barFillPeach: {
    width: 13,
    borderRadius: 4,
    backgroundColor: '#FFE5D6',
  },
  barFillOrange: {
    width: 13,
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  dayLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dayLabelHighlight: {
    color: '#111113',
    fontWeight: '700',
  },

  // Bottom Button
  bottomContainer: {
    marginTop: 0,
    marginBottom: 4,
  },
  nextButton: {
    width: '100%',
    height: 54,
    borderRadius: Radii.pill,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonPressed: {
    backgroundColor: '#27272A',
    transform: [{ scale: 0.99 }],
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
