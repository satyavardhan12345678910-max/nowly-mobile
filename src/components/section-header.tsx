import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
  size?: 'md' | 'lg';
};

export function SectionHeader({
  title,
  subtitle,
  action,
  style,
  size = 'md',
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <ThemedText variant={size === 'lg' ? 'h2' : 'h3'} style={styles.title}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="bodySmall" themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: Spacing.xs,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
  },
  actionContainer: {
    marginLeft: Spacing.md,
    alignSelf: 'center',
  },
});
