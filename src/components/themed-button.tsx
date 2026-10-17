import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Borders, FontWeights, Radii, Spacing, Typography } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ThemedButtonProps = Omit<PressableProps, 'style'> & {
  children?: ReactNode;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function ThemedButton({
  children,
  title,
  variant = 'primary',
  size = 'md',
  pill = true,
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  ...pressableProps
}: ThemedButtonProps) {
  const { colors } = useDesignTokens();
  const isDisabled = disabled || loading;

  // Variant styling
  let backgroundColor: string = colors.primary;
  let pressedBackgroundColor: string = colors.primaryPressed;
  let textColor: string = colors.primaryForeground;
  let borderWidth: number = Borders.none;
  let borderColor: string = 'transparent';

  switch (variant) {
    case 'secondary':
      backgroundColor = colors.backgroundNeutral;
      pressedBackgroundColor = colors.border;
      textColor = colors.textPrimary;
      borderWidth = Borders.thin;
      borderColor = colors.border;
      break;
    case 'accent':
      backgroundColor = colors.accent;
      pressedBackgroundColor = colors.accentForeground === '#FFFFFF' ? '#0D9668' : colors.accentLight;
      textColor = colors.accentForeground;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      pressedBackgroundColor = colors.backgroundNeutral;
      textColor = colors.textPrimary;
      borderWidth = Borders.thin;
      borderColor = colors.border;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      pressedBackgroundColor = colors.backgroundNeutral;
      textColor = colors.textPrimary;
      break;
    case 'primary':
    default:
      backgroundColor = colors.primary;
      pressedBackgroundColor = colors.primaryPressed;
      textColor = colors.primaryForeground;
      break;
  }

  // Size styling
  let height: number = 48;
  let horizontalPadding: number = Spacing.md;
  let fontSize: number = Typography.button.fontSize;
  let iconGap: number = Spacing.sm;

  if (size === 'sm') {
    height = 36;
    horizontalPadding = Spacing.sm;
    fontSize = 13;
    iconGap = Spacing.xs;
  } else if (size === 'lg') {
    height = 54;
    horizontalPadding = Spacing.lg;
    fontSize = 17;
    iconGap = Spacing.sm;
  }

  const borderRadius = pill ? Radii.pill : Radii.lg;

  const content = title ? (
    <ThemedText
      style={[
        styles.text,
        {
          color: textColor,
          fontSize,
          fontWeight: FontWeights.semiBold,
        },
        textStyle,
      ]}>
      {title}
    </ThemedText>
  ) : typeof children === 'string' ? (
    <ThemedText
      style={[
        styles.text,
        {
          color: textColor,
          fontSize,
          fontWeight: FontWeights.semiBold,
        },
        textStyle,
      ]}>
      {children}
    </ThemedText>
  ) : (
    children
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof title === 'string' ? title : undefined)}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          height,
          paddingHorizontal: horizontalPadding,
          borderRadius,
          backgroundColor: pressed ? pressedBackgroundColor : backgroundColor,
          borderWidth,
          borderColor,
          gap: iconGap,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {leftIcon}
          {content}
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
