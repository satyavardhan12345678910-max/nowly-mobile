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
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

// ────────────────────────────────────────────────────────────────────────────
// Types & Demo Data
// ────────────────────────────────────────────────────────────────────────────

interface DayData {
  name: string;
  height: number;
  isWednesday?: boolean;
}

const WEEKLY_DAYS: DayData[] = [
  { name: 'Mon', height: 38 },
  { name: 'Tue', height: 44 },
  { name: 'Wed', height: 86, isWednesday: true },
  { name: 'Thu', height: 48 },
  { name: 'Fri', height: 32 },
  { name: 'Sat', height: 68 },
  { name: 'Sun', height: 46 },
];

interface ActivityRowData {
  id: string;
  name: string;
  duration: string;
  fillPercent: string;
  iconName: string;
  iconType: 'feather' | 'ionicons';
  iconColor: string;
  tileBg: string;
}

const ACTIVITIES: ActivityRowData[] = [
  {
    id: 'study',
    name: 'Study',
    duration: '12h 20m',
    fillPercent: '66%',
    iconName: 'book',
    iconType: 'ionicons',
    iconColor: '#12C995',
    tileBg: '#E2F8F0',
  },
  {
    id: 'work',
    name: 'Work',
    duration: '8h 10m',
    fillPercent: '44%',
    iconName: 'laptop',
    iconType: 'ionicons',
    iconColor: '#9464F5',
    tileBg: '#F0E9FF',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    duration: '5h 30m',
    fillPercent: '29%',
    iconName: 'game-controller',
    iconType: 'ionicons',
    iconColor: '#FF9A3C',
    tileBg: '#FFF0E1',
  },
  {
    id: 'social',
    name: 'Social',
    duration: '3h 40m',
    fillPercent: '20%',
    iconName: 'people',
    iconType: 'ionicons',
    iconColor: '#F472B6',
    tileBg: '#FCE8F0',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export default function WeeklyInsightsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ intentions?: string }>();

  // Hardware back button support for Android
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push({
      pathname: '/onboarding/people',
      params: { intentions: params.intentions },
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
        {/* ─── 1. HEADER: Back Button + 5-Segment Progress Bar ─── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#111113" />
          </Pressable>

          {/* Progress Indicator: 4 mint segments + 1 grey segment */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={styles.progressSegment} />
          </View>

          {/* Spacer to keep progress indicator centered */}
          <View style={styles.topBarSpacer} />
        </View>

        {/* ─── 2. SECTION BADGE, HEADING & FLOATING DECORATIVE TILES ─── */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextColumn}>
            {/* Pill Badge */}
            <View style={styles.badge}>
              <View style={styles.badgeIconBars}>
                <View style={[styles.badgeMiniBar, { height: 7 }]} />
                <View style={[styles.badgeMiniBar, { height: 12 }]} />
                <View style={[styles.badgeMiniBar, { height: 9 }]} />
              </View>
              <Text style={styles.badgeText}>YOUR WEEK</Text>
            </View>

            {/* Title */}
            <Text style={styles.heading}>Where did{'\n'}your week go?</Text>
          </View>

          {/* Decorative Floating Illustration */}
          <View style={styles.decorativeContainer} pointerEvents="none">
            {/* Ambient soft glow */}
            <View style={styles.ambientGlow} />

            {/* Upper Right Tile: Clock */}
            <View style={styles.clockTile}>
              <Feather name="clock" size={17} color="#8E95A5" />
            </View>

            {/* Main Center Tile: Mint Bar Chart */}
            <View style={styles.mainChartTile}>
              <View style={styles.tileBarChart}>
                <View style={[styles.tileBar, { height: 14 }]} />
                <View style={[styles.tileBar, { height: 23 }]} />
                <View style={[styles.tileBar, { height: 17 }]} />
              </View>
            </View>

            {/* Lower Right Tile: Target */}
            <View style={styles.targetTile}>
              <Feather name="target" size={18} color="#8E95A5" />
            </View>
          </View>
        </View>

        {/* ─── 3. WEEKLY SUMMARY CARD ─── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summarySubtitle}>Your week</Text>
          <Text style={styles.summaryTotal}>32h 40m</Text>

          {/* 7-Day Chart */}
          <View style={styles.chartContainer}>
            {WEEKLY_DAYS.map((day) => (
              <View key={day.name} style={styles.chartColumn}>
                <View style={styles.barTrackArea}>
                  <View
                    style={[
                      styles.chartBar,
                      day.isWednesday
                        ? styles.chartBarWednesday
                        : styles.chartBarNormal,
                      { height: day.height },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.chartDayLabel,
                    day.isWednesday && styles.chartDayLabelWednesday,
                  ]}>
                  {day.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 4. ACTIVITY BREAKDOWN CARD ─── */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Where your time went</Text>

          <View style={styles.activityList}>
            {ACTIVITIES.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityRow,
                  index === ACTIVITIES.length - 1 && styles.activityRowLast,
                ]}>
                {/* Tile */}
                <View style={[styles.activityTile, { backgroundColor: activity.tileBg }]}>
                  {activity.iconType === 'ionicons' ? (
                    <Ionicons
                      name={activity.iconName as any}
                      size={18}
                      color={activity.iconColor}
                    />
                  ) : (
                    <Feather
                      name={activity.iconName as any}
                      size={17}
                      color={activity.iconColor}
                    />
                  )}
                </View>

                {/* Name */}
                <Text style={styles.activityName} numberOfLines={1}>
                  {activity.name}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: activity.fillPercent as any },
                    ]}
                  />
                </View>

                {/* Duration */}
                <Text style={styles.activityDuration}>{activity.duration}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 5. TWO COMPACT INSIGHT CARDS (Side-by-side) ─── */}
        <View style={styles.insightsRow}>
          {/* Left Card: Biggest Time Block */}
          <View style={styles.insightCardMint}>
            <View style={styles.insightHeaderRow}>
              <View style={styles.insightIconBadgeMint}>
                <Ionicons name="bulb-outline" size={19} color="#12C995" />
              </View>
              <View style={styles.insightTextCol}>
                <Text style={styles.insightCardTitle}>Biggest time block</Text>
                <Text style={styles.insightCardHighlight}>Studying</Text>
              </View>
            </View>

            {/* Mini Bar Graphic aligned bottom right */}
            <View style={styles.miniBarContainer}>
              <View style={[styles.miniBar, { height: 11, backgroundColor: '#A7F3D0' }]} />
              <View style={[styles.miniBar, { height: 18, backgroundColor: '#12C995' }]} />
              <View style={[styles.miniBar, { height: 26, backgroundColor: '#A7F3D0' }]} />
            </View>
          </View>

          {/* Right Card: Intentional Days Ahead */}
          <View style={styles.insightCardLavender}>
            <View style={styles.insightHeaderRow}>
              <View style={styles.insightIconBadgeLavender}>
                <Feather name="target" size={17} color="#9464F5" />
              </View>
              <View style={styles.insightTextCol}>
                <Text style={styles.insightCardTitleLavender}>
                  More intentional{'\n'}days ahead
                </Text>
              </View>
            </View>

            {/* Upward Trending Line Graphic */}
            <View style={styles.trendGraphContainer}>
              {/* Segment 1: dip */}
              <View style={styles.trendSegment1} />
              {/* Segment 2: rise */}
              <View style={styles.trendSegment2} />
              {/* Segment 3: dip */}
              <View style={styles.trendSegment3} />
              {/* Segment 4: swoop up */}
              <View style={styles.trendSegment4} />
              {/* Endpoint Dot */}
              <View style={styles.trendDot} />
            </View>
          </View>
        </View>

        {/* ─── 6. CONTINUE BUTTON ─── */}
        <View style={styles.bottomContainer}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue">
            <Text style={styles.continueButtonText}>Continue</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.continueArrow} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  // 1. Header Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 16,
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
    width: 28,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: '#12C995',
  },
  topBarSpacer: {
    width: 44,
  },

  // 2. Hero Section
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    position: 'relative',
    minHeight: 110,
  },
  heroTextColumn: {
    flex: 1,
    maxWidth: '65%',
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F8F0',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeIconBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginRight: 6,
    height: 12,
  },
  badgeMiniBar: {
    width: 2.5,
    borderRadius: 1,
    backgroundColor: '#12C995',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: 0.6,
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.8,
  },

  // Decorative graphics floating on the right
  decorativeContainer: {
    position: 'absolute',
    right: 0,
    top: -6,
    width: 120,
    height: 120,
    zIndex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    right: -8,
    top: 4,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: '#EAFCF5',
    opacity: 0.9,
  },
  mainChartTile: {
    position: 'absolute',
    top: 24,
    left: 4,
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: {
        elevation: 2.5,
      },
    }),
  },
  tileBarChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 24,
  },
  tileBar: {
    width: 4.5,
    borderRadius: 2.2,
    backgroundColor: '#12C995',
  },
  clockTile: {
    position: 'absolute',
    top: -4,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  targetTile: {
    position: 'absolute',
    top: 52,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // 3. Weekly Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  summarySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111113',
    marginBottom: 4,
  },
  summaryTotal: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -1,
    marginBottom: 18,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 114,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrackArea: {
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 33,
    borderRadius: 10,
  },
  chartBarNormal: {
    backgroundColor: '#DDF7EE',
  },
  chartBarWednesday: {
    backgroundColor: '#12C995',
  },
  chartDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E95A5',
    marginTop: 8,
  },
  chartDayLabelWednesday: {
    color: '#555B68',
    fontWeight: '700',
  },

  // 4. Activity Breakdown Card
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  breakdownTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  activityList: {
    gap: 14,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityRowLast: {
    marginBottom: 0,
  },
  activityTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityName: {
    width: 58,
    fontSize: 15,
    fontWeight: '600',
    color: '#111113',
    letterSpacing: -0.2,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#EDF0F3',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#12C995',
  },
  activityDuration: {
    width: 62,
    fontSize: 14,
    fontWeight: '600',
    color: '#111113',
    textAlign: 'right',
  },

  // 5. Two Insight Cards
  insightsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  insightCardMint: {
    flex: 1,
    backgroundColor: '#F0FAF6',
    borderRadius: 22,
    padding: 14,
    minHeight: 114,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5F6EE',
  },
  insightCardLavender: {
    flex: 1,
    backgroundColor: '#F6F2FF',
    borderRadius: 22,
    padding: 14,
    minHeight: 114,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEE7FF',
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIconBadgeMint: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D8F7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  insightIconBadgeLavender: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E9DEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  insightTextCol: {
    flex: 1,
  },
  insightCardTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#111113',
    lineHeight: 15,
  },
  insightCardTitleLavender: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#111113',
    lineHeight: 15,
  },
  insightCardHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12C995',
    marginTop: 2,
  },

  // Mini Bar Chart in Left Card
  miniBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    gap: 4,
    height: 26,
  },
  miniBar: {
    width: 7,
    borderRadius: 2.5,
  },

  // Trend Graph in Right Card
  trendGraphContainer: {
    width: 74,
    height: 26,
    alignSelf: 'flex-end',
    position: 'relative',
  },
  trendSegment1: {
    position: 'absolute',
    left: 2,
    top: 15,
    width: 18,
    height: 8,
    borderBottomWidth: 2.2,
    borderLeftWidth: 1.5,
    borderColor: '#BFA0FA',
    borderBottomLeftRadius: 8,
  },
  trendSegment2: {
    position: 'absolute',
    left: 18,
    top: 9,
    width: 18,
    height: 9,
    borderTopWidth: 2.2,
    borderRightWidth: 1.5,
    borderColor: '#A780FA',
    borderTopRightRadius: 8,
  },
  trendSegment3: {
    position: 'absolute',
    left: 34,
    top: 11,
    width: 16,
    height: 7,
    borderBottomWidth: 2.2,
    borderColor: '#9A6CF9',
    borderBottomRightRadius: 7,
  },
  trendSegment4: {
    position: 'absolute',
    left: 48,
    top: 4,
    width: 18,
    height: 10,
    borderTopWidth: 2.2,
    borderColor: '#9464F5',
    borderTopRightRadius: 10,
  },
  trendDot: {
    position: 'absolute',
    right: 4,
    top: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#9464F5',
  },

  // 6. Continue Button
  bottomContainer: {
    marginBottom: 8,
  },
  continueButton: {
    width: '100%',
    height: 66,
    borderRadius: 33,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonPressed: {
    backgroundColor: '#232326',
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  continueArrow: {
    marginLeft: 2,
  },
});
