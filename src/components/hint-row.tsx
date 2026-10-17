import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View style={styles.stepRow}>
      <ThemedText variant="bodySmall" weight="medium">{title}</ThemedText>
      <ThemedView variant="surfaceSubtle" border="thin" radius="md" style={styles.codeSnippet}>
        <ThemedText variant="caption" themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeSnippet: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
});

