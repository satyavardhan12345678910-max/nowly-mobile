import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { Borders, Radii, Shadows, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  variant?: ThemeColor;
  radius?: keyof typeof Radii | number;
  border?: boolean | keyof typeof Borders;
  borderColor?: ThemeColor | string;
  padding?: keyof typeof Spacing | number;
  elevation?: keyof typeof Shadows;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type,
  variant,
  radius,
  border,
  borderColor,
  padding,
  elevation,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();

  const bgKey = variant ?? type ?? 'background';
  const backgroundColor = theme[bgKey] ?? theme.background;

  const resolvedRadius =
    typeof radius === 'string' ? Radii[radius] : typeof radius === 'number' ? radius : undefined;

  const resolvedPadding =
    typeof padding === 'string'
      ? Spacing[padding]
      : typeof padding === 'number'
        ? padding
        : undefined;

  const borderWidth =
    border === true
      ? Borders.thin
      : typeof border === 'string'
        ? Borders[border]
        : undefined;

  const resolvedBorderColor = borderColor
    ? (theme[borderColor as ThemeColor] ?? borderColor)
    : borderWidth
      ? theme.border
      : undefined;

  const shadowStyle = elevation ? Shadows[elevation] : undefined;

  return (
    <View
      style={[
        { backgroundColor },
        resolvedRadius !== undefined && { borderRadius: resolvedRadius },
        resolvedPadding !== undefined && { padding: resolvedPadding },
        borderWidth !== undefined && { borderWidth, borderColor: resolvedBorderColor },
        shadowStyle,
        style,
      ]}
      {...otherProps}
    />
  );
}

