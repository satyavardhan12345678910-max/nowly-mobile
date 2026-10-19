import * as Device from 'expo-device';
import { Platform, StyleSheet, View } from 'react-native';

import { AnimatedIcon } from '@/components/animated-icon';
import { Card } from '@/components/card';
import { HintRow } from '@/components/hint-row';
import { ProgressIndicator } from '@/components/progress-indicator';
import { ScreenContainer } from '@/components/screen-container';
import { SectionHeader } from '@/components/section-header';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { WebBadge } from '@/components/web-badge';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useDesignTokens } from '@/hooks/use-theme';


function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText variant="caption">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText variant="caption">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText variant="caption">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {

  const { colors } = useDesignTokens();
  const { user, signOut } = useAuth();

  return (
    <ScreenContainer scrollable withBottomTab padding="md">
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <AnimatedIcon />
          <SectionHeader
            title="Nowly"
            subtitle="A calmer social circle. White-first design with black typography and mint green highlights."
            size="lg"
            style={styles.header}
          />
        </View>

        {/* Brand System Status Card */}
        <Card variant="neutral" padding="md" radius="xl" style={styles.card}>
          <View style={styles.progressHeader}>
            <ThemedText variant="label">Design System Status</ThemedText>
            <ThemedText variant="caption" themeColor="accent" weight="semiBold">
              Ready
            </ThemedText>
          </View>
          <ProgressIndicator progress={100} height={6} />
          <ThemedText variant="bodySmall" themeColor="textSecondary">
            All brand design tokens, typography, radii, and core primitives are active.
          </ThemedText>
        </Card>

        {/* Account / Session Card */}
        {user && (
          <Card variant="neutral" padding="md" radius="xl" style={styles.card}>
            <View style={styles.progressHeader}>
              <ThemedText variant="label">Authenticated Account</ThemedText>
              <ThemedText variant="caption" themeColor="accent" weight="semiBold">
                Active
              </ThemedText>
            </View>
            <ThemedText variant="bodySmall" themeColor="textSecondary">
              Logged in as: <ThemedText weight="semiBold">{user.email ?? 'Google User'}</ThemedText>
            </ThemedText>
            <ThemedButton
              title="Sign Out"
              variant="outline"
              size="sm"
              onPress={() => signOut()}
            />
          </Card>
        )}


        {/* Development Environment Hints */}
        <Card variant="subtle" padding="md" radius="xl" style={styles.card}>
          <ThemedText variant="label" style={styles.cardTitle}>
            Development Setup
          </ThemedText>
          <View style={styles.stepContainer}>
            <HintRow
              title="Screen file"
              hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
            />
            <HintRow title="Dev tools" hint={getDevMenuHint()} />
            <HintRow
              title="Fresh start"
              hint={<ThemedText type="code">npm run reset-project</ThemedText>}
            />
          </View>
        </Card>

        {Platform.OS === 'web' && <WebBadge />}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  header: {
    alignItems: 'center',
  },
  card: {
    gap: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroup: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  stepContainer: {
    gap: Spacing.md,
  },
});

