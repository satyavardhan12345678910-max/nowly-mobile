import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Radii, Shadows, Spacing } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type SegmentOption<T extends string = string> = {
  label: string;
  value: T;
  accessibilityLabel?: string;
};

export type SegmentedControlProps<T extends string = string> = {
  options: readonly SegmentOption<T>[] | SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
  disabled?: boolean;
};

/**
 * SegmentedControl
 * Clean, pill-shaped segmented tab control matching Nowly's authentication pattern.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  style,
  disabled = false,
}: SegmentedControlProps<T>) {
  const { colors } = useDesignTokens();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSegment },
        style,
      ]}
      accessibilityRole="tablist">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            style={[
              styles.segment,
              isSelected && [
                styles.segmentActive,
                { backgroundColor: colors.primary },
              ],
            ]}>
            <Text
              style={[
                styles.segmentText,
                { color: colors.textSecondary },
                isSelected && [
                  styles.segmentTextActive,
                  { color: colors.primaryForeground },
                ],
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radii.pill,
    padding: Spacing.xs,
    width: '100%',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '500',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
});
