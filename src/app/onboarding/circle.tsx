import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import {
  Borders,
  BrandBackgroundBlobs,
  Card,
  NowlyLogo,
  Radii,
  Shadows,
  ThemedButton,
  ThemedText,
} from '@/design-system';

export default function OnboardingCirclePlaceholderScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BrandBackgroundBlobs variant="subtle" />

      {/* Top Bar with Back Button */}
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top + 10, 24) },
        ]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to Manifesto">
          <Feather name="arrow-left" size={20} color="#111113" />
        </Pressable>
        <NowlyLogo size="xs" />
        <View style={styles.backSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Step Badge */}
        <View style={styles.stepBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.stepBadgeText}>STEP 2 OF 3 — INNER CIRCLE</Text>
        </View>

        <Text style={styles.title}>Your Inner Circle</Text>
        <Text style={styles.subtitle}>
          Select up to 8 of your closest people to share live, unedited updates and private orbits.
        </Text>

        {/* Orbit Placeholder Card */}
        <Card variant="mint" padding="lg" radius="xl" style={styles.card}>
          <View style={styles.orbitVisual}>
            <View style={styles.outerRing}>
              <View style={styles.innerRing}>
                <NowlyLogo size="md" />
              </View>
            </View>
          </View>

          <ThemedText variant="bodySmall" align="center" themeColor="textSecondary">
            Next onboarding screen placeholder. Contact sync and orbit selection will be configured here.
          </ThemedText>
        </Card>
      </View>

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom + 16, 28) },
        ]}>
        <ThemedButton
          title="Return to Manifesto"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => router.replace('/onboarding/manifesto')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  backSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF2',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#737B8C',
    marginBottom: 28,
  },
  card: {
    alignItems: 'center',
    gap: 20,
  },
  orbitVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  outerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6FAF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
});
