import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Borders, Radii, Spacing } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type FeedbackBannerVariant = 'error' | 'success' | 'warning' | 'info';

export type FeedbackBannerProps = {
  variant: FeedbackBannerVariant;
  message: string;
  icon?: ReactNode;
  align?: 'center' | 'left';
  style?: ViewStyle;
};

/**
 * FeedbackBanner
 * Standardized status notification banners matching Nowly's alert styling.
 */
export function FeedbackBanner({
  variant,
  message,
  icon,
  align = 'center',
  style,
}: FeedbackBannerProps) {
  const { colors } = useDesignTokens();

  let backgroundColor: string = colors.backgroundNeutral;
  let borderColor: string = colors.border;
  let textColor: string = colors.textPrimary;

  switch (variant) {
    case 'error':
      backgroundColor = colors.errorBackground;
      borderColor = colors.errorBorder;
      textColor = colors.errorForeground;
      break;
    case 'success':
      backgroundColor = colors.successBackground;
      borderColor = colors.successBorder;
      textColor = colors.successForeground;
      break;
    case 'warning':
      backgroundColor = colors.warningBackground;
      borderColor = colors.warningBorder;
      textColor = colors.warningForeground;
      break;
    case 'info':
      backgroundColor = colors.accentLight;
      borderColor = colors.accentBorder;
      textColor = colors.accentDark;
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      accessibilityRole="alert">
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            textAlign: align,
          },
        ]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Borders.thin,
    borderRadius: Radii.card, // 14px
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    width: '100%',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
