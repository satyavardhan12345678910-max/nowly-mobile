import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, FontWeights, type ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TypographyVariant =
  | 'wordmark'
  | 'heroHeading'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'bodySmall'
  | 'bodySmallMedium'
  | 'label'
  | 'caption'
  | 'captionSmall'
  | 'button'
  | 'buttonSm'
  | 'buttonLg'
  | 'input'
  | 'overline'
  | 'default'
  | 'title'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: TypographyVariant;
  variant?: TypographyVariant;
  themeColor?: ThemeColor;
  color?: string;
  weight?: keyof typeof FontWeights;
  align?: TextStyle['textAlign'];
};

export function ThemedText({
  style,
  type,
  variant,
  themeColor,
  color,
  weight,
  align,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const selectedVariant: TypographyVariant = variant ?? type ?? 'body';

  const textColor =
    color ??
    (selectedVariant === 'linkPrimary'
      ? theme.accent
      : theme[themeColor ?? 'textPrimary'] ?? theme.text);

  const customWeightStyle = weight ? { fontWeight: FontWeights[weight] } : undefined;
  const alignStyle = align ? { textAlign: align } : undefined;

  return (
    <Text
      style={[
        styles.base,
        styles[selectedVariant],
        { color: textColor },
        customWeightStyle,
        alignStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.sans,
  },
  // Nowly Typography Hierarchy
  wordmark: {
    fontSize: Typography.wordmark.fontSize,
    lineHeight: Typography.wordmark.lineHeight,
    fontWeight: Typography.wordmark.fontWeight,
    letterSpacing: Typography.wordmark.letterSpacing,
  },
  heroHeading: {
    fontSize: Typography.heroHeading.fontSize,
    lineHeight: Typography.heroHeading.lineHeight,
    fontWeight: Typography.heroHeading.fontWeight,
    letterSpacing: Typography.heroHeading.letterSpacing,
  },
  h1: {
    fontSize: Typography.h1.fontSize,
    lineHeight: Typography.h1.lineHeight,
    fontWeight: Typography.h1.fontWeight,
    letterSpacing: Typography.h1.letterSpacing,
  },
  h2: {
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    fontWeight: Typography.h2.fontWeight,
    letterSpacing: Typography.h2.letterSpacing,
  },
  h3: {
    fontSize: Typography.h3.fontSize,
    lineHeight: Typography.h3.lineHeight,
    fontWeight: Typography.h3.fontWeight,
    letterSpacing: Typography.h3.letterSpacing,
  },
  body: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: Typography.body.fontWeight,
  },
  bodyMedium: {
    fontSize: Typography.bodyMedium.fontSize,
    lineHeight: Typography.bodyMedium.lineHeight,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  bodySmall: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontWeight: Typography.bodySmall.fontWeight,
  },
  bodySmallMedium: {
    fontSize: Typography.bodySmallMedium.fontSize,
    lineHeight: Typography.bodySmallMedium.lineHeight,
    fontWeight: Typography.bodySmallMedium.fontWeight,
  },
  label: {
    fontSize: Typography.label.fontSize,
    lineHeight: Typography.label.lineHeight,
    fontWeight: Typography.label.fontWeight,
  },
  caption: {
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    fontWeight: Typography.caption.fontWeight,
  },
  captionSmall: {
    fontSize: Typography.captionSmall.fontSize,
    lineHeight: Typography.captionSmall.lineHeight,
    fontWeight: Typography.captionSmall.fontWeight,
  },
  button: {
    fontSize: Typography.button.fontSize,
    lineHeight: Typography.button.lineHeight,
    fontWeight: Typography.button.fontWeight,
  },
  buttonSm: {
    fontSize: Typography.buttonSm.fontSize,
    lineHeight: Typography.buttonSm.lineHeight,
    fontWeight: Typography.buttonSm.fontWeight,
  },
  buttonLg: {
    fontSize: Typography.buttonLg.fontSize,
    lineHeight: Typography.buttonLg.lineHeight,
    fontWeight: Typography.buttonLg.fontWeight,
  },
  input: {
    fontSize: Typography.input.fontSize,
    lineHeight: Typography.input.lineHeight,
    fontWeight: Typography.input.fontWeight,
  },
  overline: {
    fontSize: Typography.overline.fontSize,
    lineHeight: Typography.overline.lineHeight,
    fontWeight: Typography.overline.fontWeight,
    letterSpacing: Typography.overline.letterSpacing,
  },

  // Legacy variants maintained for compatibility
  default: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    lineHeight: Typography.h1.lineHeight,
    fontWeight: Typography.h1.fontWeight,
    letterSpacing: Typography.h1.letterSpacing,
  },
  subtitle: {
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    fontWeight: Typography.h2.fontWeight,
  },
  small: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontWeight: Typography.bodySmall.fontWeight,
  },
  smallBold: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontWeight: Typography.label.fontWeight,
  },
  link: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: 20,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  linkPrimary: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: 20,
    fontWeight: Typography.label.fontWeight,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' as const }) ?? ('500' as const),
    fontSize: 12,
  },
});

