import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type DividerWithTextProps = {
  text: string;
  style?: ViewStyle;
};

/**
 * DividerWithText
 * Subtle divider row with centered uppercase caption (e.g., "OR CONTINUE WITH").
 */
export function DividerWithText({ text, style }: DividerWithTextProps) {
  const { colors } = useDesignTokens();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.text, { color: colors.textPlaceholder }]}>
        {text}
      </Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginHorizontal: Spacing.compact,
    textTransform: 'uppercase',
  },
});
