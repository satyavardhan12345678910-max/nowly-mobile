import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { Borders, Radii, Shadows, Spacing, type ThemeColor } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type CardVariant = 'elevated' | 'outlined' | 'neutral' | 'subtle' | 'mint';

export type CardProps = PropsWithChildren<
  Omit<ViewProps, 'style'> & {
    variant?: CardVariant;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    radius?: keyof typeof Radii;
    onPress?: PressableProps['onPress'];
    style?: ViewStyle;
    backgroundColor?: ThemeColor | string;
    borderColor?: ThemeColor | string;
  }
>;

export function Card({
  children,
  variant = 'outlined',
  padding = 'md',
  radius = 'xl',
  onPress,
  style,
  backgroundColor,
  borderColor,
  ...rest
}: CardProps) {
  const { colors } = useDesignTokens();

  const paddingValue =
    padding === 'none'
      ? 0
      : padding === 'sm'
        ? Spacing.sm
        : padding === 'lg'
          ? Spacing.lg
          : Spacing.md;

  let bg: string = colors.card;
  let borderW: number = Borders.thin;
  let borderC: string = colors.border;
  let shadowStyle: ViewStyle = Shadows.none;

  switch (variant) {
    case 'elevated':
      bg = colors.card;
      borderW = Borders.thin;
      borderC = colors.borderSubtle;
      shadowStyle = Shadows.sm;
      break;
    case 'neutral':
      bg = colors.backgroundNeutral;
      borderW = Borders.none;
      borderC = 'transparent';
      break;
    case 'subtle':
      bg = colors.backgroundNeutral;
      borderW = Borders.thin;
      borderC = colors.border;
      break;
    case 'mint':
      bg = colors.surfaceHighlighted;
      borderW = Borders.thin;
      borderC = colors.accentBorder;
      break;
    case 'outlined':
    default:
      bg = colors.card;
      borderW = Borders.thin;
      borderC = colors.border;
      break;
  }


  if (backgroundColor) {
    bg = colors[backgroundColor as ThemeColor] ?? backgroundColor;
  }
  if (borderColor) {
    borderC = colors[borderColor as ThemeColor] ?? borderColor;
  }

  const cardStyle: ViewStyle = {
    backgroundColor: bg,
    borderWidth: borderW,
    borderColor: borderC,
    borderRadius: Radii[radius],
    padding: paddingValue,
    ...shadowStyle,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.base, cardStyle, pressed && styles.pressed, style]}
        accessibilityRole="button">
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, cardStyle, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
});
