import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { Borders, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

export type ThemedTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: 'filled' | 'outlined';
};

export function ThemedTextInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  variant = 'filled',
  onFocus,
  onBlur,
  editable = true,
  ...textInputProps
}: ThemedTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useDesignTokens();

  const hasError = Boolean(error);

  const borderColor = hasError
    ? colors.error
    : isFocused
      ? colors.borderFocused
      : colors.border;

  const backgroundColor =
    variant === 'filled' ? colors.backgroundNeutral : colors.background;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText variant="label" style={styles.label}>
          {label}
        </ThemedText>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor,
            borderColor,
            borderWidth: isFocused || hasError ? Borders.thick : Borders.thin,
            borderRadius: Radii.lg,
            opacity: editable ? 1 : 0.6,
          },
        ]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          accessibilityLabel={label}
          editable={editable}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontFamily: Fonts.sans,
              fontSize: FontSizes.md,
            },
            inputStyle,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...textInputProps}
        />

        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>

      {error ? (
        <ThemedText variant="caption" style={[styles.feedbackText, { color: colors.error }]}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="caption" style={[styles.feedbackText, { color: colors.textSecondary }]}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
