import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radii, Spacing, type ThemeColor } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type ProgressIndicatorProps = {
  /**
   * Progress value between 0 and 1 (or 0 and 100 if > 1)
   */
  progress?: number;
  /**
   * Total steps for segmented step indicators (e.g., onboarding)
   */
  steps?: number;
  /**
   * Current active step index (0-indexed or 1-indexed)
   */
  currentStep?: number;
  height?: number;
  color?: ThemeColor | string;
  trackColor?: ThemeColor | string;
  style?: ViewStyle;
};

export function ProgressIndicator({
  progress = 0,
  steps,
  currentStep = 0,
  height = 4,
  color,
  trackColor,
  style,
}: ProgressIndicatorProps) {
  const { colors } = useDesignTokens();

  const activeColor = color
    ? (colors[color as ThemeColor] ?? color)
    : colors.accent;

  const inactiveTrackColor = trackColor
    ? (colors[trackColor as ThemeColor] ?? trackColor)
    : colors.border;

  // Segmented Steps Mode (e.g. Onboarding progress)
  if (steps && steps > 1) {
    const activeIndex = currentStep;
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: steps, now: activeIndex }}
        style={[styles.stepsContainer, style]}>
        {Array.from({ length: steps }).map((_, index) => {
          const isCompleteOrActive = index <= activeIndex;
          return (
            <View
              key={index}
              style={[
                styles.stepSegment,
                {
                  height,
                  backgroundColor: isCompleteOrActive ? activeColor : inactiveTrackColor,
                  borderRadius: Radii.pill,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  // Continuous Bar Mode
  const normalizedProgress = progress > 1 ? Math.min(Math.max(progress / 100, 0), 1) : Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(normalizedProgress * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={[
        styles.track,
        {
          height,
          backgroundColor: inactiveTrackColor,
          borderRadius: Radii.pill,
        },
        style,
      ]}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            height,
            backgroundColor: activeColor,
            borderRadius: Radii.pill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  stepsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  stepSegment: {
    flex: 1,
  },
});
