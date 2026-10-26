import { useState } from 'react';
import {
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

import {
  Colors,
  FontWeights,
  Radii,
  Shadows,
  Spacing,
} from '@/design-system';

// High-resolution avatar photos matching reference screenshot exactly
const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=140&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=140&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80',
];

export default function OnboardingManifestoScreen() {
  const insets = useSafeAreaInsets();
  const [activeTile, setActiveTile] = useState<'glance' | 'friends' | 'ping' | 'live'>('live');

  const handleNext = () => {
    // Temporarily routing directly to How Nowly Works (/onboarding/circle) for onboarding UI testing
    router.push('/onboarding/circle');
  };

  return (
    <View style={styles.outerContainer}>
      {/* Decorative Mint-Green Background Ambience */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.mintBlobTopRight} />
        <View style={styles.mintBlobMidRight} />
        <View style={styles.mintBlobBottomLeft} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 8, 24),
            paddingBottom: Math.max(insets.bottom + 20, 32),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}>
        <View style={styles.contentWrapper}>
          {/* 1. TOP INNER CIRCLE FLOATING CARD */}
          <View style={styles.innerCircleCard}>
            {/* Left: 3 Overlapping Avatars + "+4" Badge */}
            <View style={styles.avatarGroup}>
              {AVATAR_URLS.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={[
                    styles.avatarImage,
                    index > 0 && styles.avatarOverlap,
                  ]}
                  contentFit="cover"
                  transition={200}
                  accessibilityLabel={`Friend profile ${index + 1}`}
                />
              ))}
              <View style={[styles.avatarBadge, styles.avatarOverlap]}>
                <Text style={styles.avatarBadgeText}>+4</Text>
              </View>
            </View>

            {/* Center: Inner Circle title & "4 present now" */}
            <View style={styles.circleInfo}>
              <Text style={styles.circleTitle}>Inner Circle</Text>
              <View style={styles.presenceRow}>
                <View style={styles.greenPresenceDot} />
                <Text style={styles.presenceText}>4 present now</Text>
              </View>
            </View>

            {/* Right: "Private orbit" pill tag */}
            <View style={styles.orbitTag}>
              <Text style={styles.orbitTagText}>Private{'\n'}orbit</Text>
            </View>
          </View>

          {/* 2. MINT BADGE: "THE MANIFESTO" */}
          <View style={styles.manifestoBadge}>
            <View style={styles.manifestoDot} />
            <Text style={styles.manifestoBadgeText}>THE MANIFESTO</Text>
          </View>

          {/* 3. HERO HEADING */}
          <Text style={styles.heading}>
            No doomscrolling.{'\n'}No bullshit.{'\n'}Just your people.
          </Text>

          {/* 4. SUBTITLE */}
          <Text style={styles.subtitle}>
            A calmer way to check in, stay connected,{'\n'}and be part of their day.
          </Text>

          {/* 5. BLUSH CARD: "THE ALGORITHMIC LOOP" */}
          <View style={styles.loopCard}>
            {/* Header */}
            <View style={styles.loopHeader}>
              <View style={styles.loopTitleRow}>
                <View style={styles.loopIconCircle}>
                  <Ionicons name="infinite" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.loopTitle}>The Algorithmic Loop</Text>
              </View>
              <View style={styles.minLostBadge}>
                <Text style={styles.minLostText}>~64 min lost</Text>
              </View>
            </View>

            {/* 3 Rows with Vertical Connector Line */}
            <View style={styles.loopRowsContainer}>
              <View style={styles.loopVerticalConnector} />

              {/* Row 1: Person Outline Icon */}
              <View style={styles.loopRow}>
                <View style={styles.loopRowIconContainer}>
                  <Feather name="user" size={16} color="#374151" />
                </View>
                <Text style={styles.loopRowText}>
                  Open to check close friend’s photos
                </Text>
              </View>

              {/* Row 2: Overlapping Cards / Reels Icon */}
              <View style={styles.loopRow}>
                <View style={styles.loopRowIconContainer}>
                  <Ionicons name="copy-outline" size={16} color="#374151" />
                </View>
                <Text style={styles.loopRowText}>
                  Recommended strangers auto-played
                </Text>
              </View>

              {/* Row 3: Search Icon */}
              <View style={styles.loopRow}>
                <View style={styles.loopRowIconContainer}>
                  <Feather name="search" size={16} color="#374151" />
                </View>
                <Text style={styles.loopRowText}>
                  Sponsored ad traps & endless reels
                </Text>
              </View>
            </View>
          </View>

          {/* 6. MINT-OUTLINED CARD: "NOWLY: THE INTIMATE CIRCLE" */}
          <View style={styles.intimateCircleCard}>
            {/* Header */}
            <View style={styles.intimateHeader}>
              <View style={styles.intimateHeaderDot} />
              <Text style={styles.intimateHeaderText}>
                NOWLY: THE INTIMATE CIRCLE
              </Text>
            </View>

            {/* 4 Feature Tiles */}
            <View style={styles.tilesRow}>
              {/* 1. Glance (Eye Icon) */}
              <Pressable
                onPress={() => setActiveTile('glance')}
                style={[
                  styles.tile,
                  activeTile === 'glance' && styles.tileActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Glance">
                <Feather
                  name="eye"
                  size={22}
                  color={activeTile === 'glance' ? '#10B981' : '#111113'}
                />
                <Text
                  style={[
                    styles.tileText,
                    activeTile === 'glance' && styles.tileTextActive,
                  ]}>
                  Glance
                </Text>
              </Pressable>

              {/* 2. Friends (Two-Person Icon) */}
              <Pressable
                onPress={() => setActiveTile('friends')}
                style={[
                  styles.tile,
                  activeTile === 'friends' && styles.tileActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Friends">
                <Feather
                  name="users"
                  size={22}
                  color={activeTile === 'friends' ? '#10B981' : '#111113'}
                />
                <Text
                  style={[
                    styles.tileText,
                    activeTile === 'friends' && styles.tileTextActive,
                  ]}>
                  Friends
                </Text>
              </Pressable>

              {/* 3. Ping (Chat Bubble Icon) */}
              <Pressable
                onPress={() => setActiveTile('ping')}
                style={[
                  styles.tile,
                  activeTile === 'ping' && styles.tileActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Ping">
                <Ionicons
                  name="chatbubble-outline"
                  size={21}
                  color={activeTile === 'ping' ? '#10B981' : '#111113'}
                />
                <Text
                  style={[
                    styles.tileText,
                    activeTile === 'ping' && styles.tileTextActive,
                  ]}>
                  Ping
                </Text>
              </Pressable>

              {/* 4. Live (Green Lightning Bolt Icon) */}
              <Pressable
                onPress={() => setActiveTile('live')}
                style={[
                  styles.tile,
                  styles.tileActive,
                  activeTile === 'live' && styles.tileActiveBorder,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Live">
                <Ionicons
                  name="flash"
                  size={21}
                  color="#10B981"
                />
                <Text style={styles.tileTextActive}>Live</Text>
              </Pressable>
            </View>

            {/* Description Sub-section */}
            <View style={styles.descriptionSection}>
              <View style={styles.descIconCircle}>
                <Ionicons name="flash" size={22} color="#10B981" />
              </View>
              <View style={styles.descTextContainer}>
                <Text style={styles.descTitle}>
                  Real updates from people you actually care about.
                </Text>
                <Text style={styles.descSubtitle}>
                  Unfiltered “Now” moments, quick reactions,{'\n'}and a calmer social experience.
                </Text>
              </View>
            </View>
          </View>

          {/* 7. STATS CARD */}
          <View style={styles.statsCard}>
            {/* Left Column */}
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>AVERAGE SESSION</Text>
              <Text style={styles.statValue}>42 seconds</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.statDivider} />

            {/* Right Column */}
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>QUALITY</Text>
              <View style={styles.genuineBadge}>
                <Text style={styles.genuineText}>100% Genuine</Text>
              </View>
            </View>
          </View>

          {/* 8. BLACK FULL-WIDTH NEXT BUTTON */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next">
            <View style={styles.nextButtonContent}>
              <Text style={styles.nextButtonText}>Next</Text>
              <View style={styles.arrowIconContainer}>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  /* Atmospheric Mint Background Shapes */
  mintBlobTopRight: {
    position: 'absolute',
    top: 70,
    right: -85,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#E6FAF2',
    opacity: 0.9,
  },
  mintBlobMidRight: {
    position: 'absolute',
    top: 250,
    right: -55,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D1FAE5',
    opacity: 0.5,
  },
  mintBlobBottomLeft: {
    position: 'absolute',
    bottom: 50,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E6FAF2',
    opacity: 0.55,
  },

  /* 1. TOP INNER CIRCLE CARD */
  innerCircleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderColor: '#EFF0F2',
    borderWidth: 1,
    borderRadius: 26,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 20,
    ...Shadows.sm,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111113',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  circleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  circleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  presenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenPresenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  presenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#737B8C',
  },
  orbitTag: {
    backgroundColor: '#F0F1F3',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitTagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#111113',
    textAlign: 'center',
  },

  /* 2. MINT BADGE: THE MANIFESTO */
  manifestoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF2',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  manifestoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  manifestoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },

  /* 3. HERO HEADING */
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.8,
    marginBottom: 10,
  },

  /* 4. SUBTITLE */
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#737B8C',
    marginBottom: 20,
  },

  /* 5. BLUSH CARD: THE ALGORITHMIC LOOP */
  loopCard: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  loopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loopIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  minLostBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  minLostText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  loopRowsContainer: {
    gap: 14,
    position: 'relative',
  },
  loopVerticalConnector: {
    position: 'absolute',
    left: 16.5,
    top: 17,
    bottom: 17,
    width: 1.5,
    backgroundColor: '#E5E7EB',
  },
  loopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loopRowIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loopRowText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    flex: 1,
  },

  /* 6. MINT-OUTLINED CARD: NOWLY INTIMATE CIRCLE */
  intimateCircleCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  intimateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  intimateHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  intimateHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: 0.6,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tile: {
    flex: 1,
    height: 76,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tileActive: {
    backgroundColor: '#E6FAF2',
  },
  tileActiveBorder: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tileText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#737B8C',
  },
  tileTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  descriptionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E6FAF2',
    paddingTop: 14,
    gap: 12,
  },
  descIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descTextContainer: {
    flex: 1,
  },
  descTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111113',
    marginBottom: 3,
  },
  descSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
    color: '#737B8C',
  },

  /* 7. STATS CARD */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF0F2',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.3,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 14,
  },
  genuineBadge: {
    backgroundColor: '#E6FAF2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  genuineText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.3,
  },

  /* 8. BLACK FULL-WIDTH NEXT BUTTON */
  nextButton: {
    backgroundColor: '#111113',
    borderRadius: Radii.pill,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...Shadows.button,
  },
  nextButtonPressed: {
    backgroundColor: '#2D2F36',
    transform: [{ scale: 0.99 }],
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowIconContainer: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
