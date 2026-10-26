import { useEffect, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Radii, Shadows } from '@/design-system';

// Bundled local portrait assets for the social-proof avatars
const LOCAL_AVATARS = {
  sophie: require('@/../assets/images/avatars/sophie.jpg'),
  rohan: require('@/../assets/images/avatars/rohan.jpg'),
  maya: require('@/../assets/images/avatars/maya.jpg'),
};

// ────────────────────────────────────────────────────────────────────────────
// Intention data
// ────────────────────────────────────────────────────────────────────────────

type IntentionId = 'stay_close' | 'screen_time' | 'goals' | 'social_media' | 'manage_time';

interface IntentionItem {
  id: IntentionId;
  title: string;
  description: string;
  /** Feather icon name */
  featherIcon?: string;
  /** Ionicons icon name */
  ionIcon?: string;
  /** Show "Primary" badge */
  isPrimary?: boolean;
}

const INTENTIONS: IntentionItem[] = [
  {
    id: 'stay_close',
    title: 'Stay close',
    description: 'Get quiet updates from my 3–5 favorite people.',
    featherIcon: 'heart',
    isPrimary: true,
  },
  {
    id: 'screen_time',
    title: "See where I'm spending most of my time",
    description: 'Get insights into my daily habits and screen time.',
    ionIcon: 'bar-chart',
  },
  {
    id: 'goals',
    title: 'Accomplish my goals together',
    description: 'Build habits, set goals and make progress with my favourite person.',
    featherIcon: 'target',
  },
  {
    id: 'social_media',
    title: 'Get out from social media',
    description: 'Replace mindless scrolling with meaningful moments.',
    ionIcon: 'phone-portrait-outline',
  },
  {
    id: 'manage_time',
    title: 'Manage time efficiently',
    description: 'Stay focused, build routines and create a balanced life.',
    featherIcon: 'clock',
  },
];

const DEFAULT_SELECTED: IntentionId[] = ['stay_close', 'goals', 'manage_time'];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export default function IntentionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ intentions?: string }>();
  const [selected, setSelected] = useState<Set<IntentionId>>(() => {
    if (params.intentions) {
      const items = params.intentions.split(',').filter(Boolean) as IntentionId[];
      if (items.length > 0) return new Set(items);
    }
    return new Set(DEFAULT_SELECTED);
  });

  // Hardware back button support for Android
  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const toggleSelection = (id: IntentionId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    router.push({
      pathname: '/onboarding/insights',
      params: { intentions: Array.from(selected).join(',') },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 8, 20),
            paddingBottom: Math.max(insets.bottom + 16, 28),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* ─── 1. HEADER: Back Button + Progress ─── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#111113" />
          </Pressable>

          {/* Progress: 4 green segments, 1 grey */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={styles.progressSegment} />
          </View>

          {/* Right spacer to balance the header */}
          <View style={styles.topBarSpacer} />
        </View>

        {/* ─── 2. HEADING ─── */}
        <View style={styles.headerSection}>
          {/* Badge */}
          <View style={styles.badge}>
            <Ionicons name="ellipse" size={8} color="#10B981" style={{ marginRight: 6 }} />
            <Feather name="target" size={13} color="#10B981" style={{ marginRight: 5 }} />
            <Text style={styles.badgeText}>YOUR INTENTION</Text>
          </View>

          <Text style={styles.heading}>What matters most{'\n'}to you?</Text>
          <Text style={styles.subtitle}>
            We'll personalize Nowly around what matters to you.{'\n'}Select one or more intentions.
          </Text>
        </View>

        {/* ─── 3. INTENTION CARDS ─── */}
        <View style={styles.cardsContainer}>
          {INTENTIONS.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => toggleSelection(item.id)}
                style={[
                  styles.card,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={item.title}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
                  ]}>
                  {item.featherIcon ? (
                    <Feather
                      name={item.featherIcon as any}
                      size={22}
                      color={isSelected ? '#10B981' : '#6B7280'}
                    />
                  ) : item.ionIcon ? (
                    <Ionicons
                      name={item.ionIcon as any}
                      size={22}
                      color={isSelected ? '#10B981' : '#6B7280'}
                    />
                  ) : null}
                </View>

                {/* Text Content */}
                <View style={styles.cardTextContainer}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isSelected && styles.cardTitleSelected,
                      ]}
                      numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>

                {/* Selection Indicator */}
                <View
                  style={[
                    styles.checkCircle,
                    isSelected ? styles.checkCircleSelected : styles.checkCircleUnselected,
                  ]}>
                  {isSelected && (
                    <Feather name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ─── 5. SOCIAL-PROOF PANEL ─── */}
        <View style={styles.socialProofPanel}>
          <View style={styles.socialProofAvatars}>
            <Image
              source={LOCAL_AVATARS.sophie}
              style={[styles.socialAvatar, { zIndex: 3 }]}
              contentFit="cover"
              transition={150}
            />
            <Image
              source={LOCAL_AVATARS.rohan}
              style={[styles.socialAvatar, styles.socialAvatarOverlap, { zIndex: 2 }]}
              contentFit="cover"
              transition={150}
            />
            <Image
              source={LOCAL_AVATARS.maya}
              style={[styles.socialAvatar, styles.socialAvatarOverlap, { zIndex: 1 }]}
              contentFit="cover"
              transition={150}
            />
            <View style={[styles.socialCountBadge, styles.socialAvatarOverlap]}>
              <Text style={styles.socialCountText}>+8</Text>
            </View>
          </View>
          <Text style={styles.socialProofText}>
            84% of close circles pick{' '}
            <Text style={styles.socialProofItalic}>Stay close</Text> and{' '}
            <Text style={styles.socialProofItalic}>Be present together.</Text>
          </Text>
        </View>

        {/* ─── 6. CONTINUE BUTTON ─── */}
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue">
          <Text style={styles.continueButtonText}>Continue  →</Text>
        </Pressable>

        {/* ─── 7. FOOTER ─── */}
        <View style={styles.footerRow}>
          <Feather name="lock" size={13} color="#9CA3AF" style={{ marginRight: 5 }} />
          <Text style={styles.footerText}>
            You can always change this later in Settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const ACCENT = '#10B981';
const ACCENT_BG = '#E6FAF2';
const ACCENT_BORDER = '#A7F3D0';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 22,
  },

  /* ── 1. Header ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: ACCENT,
  },
  topBarSpacer: {
    width: 40,
  },

  /* ── 2. Heading ── */
  headerSection: {
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_BG,
    borderColor: ACCENT_BORDER,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  heading: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#737B8C',
  },

  /* ── 3. Intention Cards ── */
  cardsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
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
  cardSelected: {
    backgroundColor: ACCENT_BG,
    borderColor: ACCENT_BORDER,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF0F3',
  },

  /* Icon circle */
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleSelected: {
    backgroundColor: '#D1FAE5',
  },
  iconCircleUnselected: {
    backgroundColor: '#F3F4F6',
  },

  /* Card text */
  cardTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  cardTitleSelected: {
    color: '#111113',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#737B8C',
    fontWeight: '400',
  },

  /* Primary badge */
  primaryBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  primaryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT,
  },

  /* Selection indicator */
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkCircleSelected: {
    backgroundColor: ACCENT,
  },
  checkCircleUnselected: {
    backgroundColor: '#E5E7EB',
  },

  /* ── 5. Social-Proof Panel ── */
  socialProofPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  socialProofAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  socialAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5F6F8',
    backgroundColor: '#E5E7EB',
  },
  socialAvatarOverlap: {
    marginLeft: -8,
  },
  socialCountBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#111113',
    borderWidth: 2,
    borderColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  socialProofText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    fontWeight: '400',
  },
  socialProofItalic: {
    fontStyle: 'italic',
    fontWeight: '500',
    color: '#374151',
  },

  /* ── 6. Continue Button ── */
  continueButton: {
    width: '100%',
    height: 58,
    borderRadius: Radii.pill,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Shadows.button,
  },
  continueButtonPressed: {
    backgroundColor: '#27272A',
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  /* ── 7. Footer ── */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
  },
});
