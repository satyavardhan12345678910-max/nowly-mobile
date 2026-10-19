import '@/global.css';

import { Platform, StyleSheet } from 'react-native';

/**
 * Brand Identity Palette
 * White-first interface with black typography, mint green accents, and subtle neutral surfaces.
 */
export const Palette = {
  // Pure Neutrals
  white: '#FFFFFF',
  black: '#111113',
  darkGray: '#2D2F36',
  midGray: '#737B8C',
  lightGray: '#E5E7EB',
  extraLightGray: '#F8F9FA',
  slate: '#555B68',
  slateDark: '#1A1B1E',

  // Gray Tones
  gray50: '#F8F9FA',
  gray100: '#F5F6F8',
  gray150: '#EEF0F3',
  gray200: '#E8EAED',
  gray250: '#ECEEF2',
  gray300: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#737B8C',
  gray600: '#555B68',
  gray800: '#2D2F36',
  gray900: '#111113',

  // Brand Mint Scale (Signature Nowly Green)
  mint50: '#E6FAF2', // soft decorative blob, subtle tint
  mint100: '#D1FAE5', // mint blob, success banner background
  mint200: '#A7F3D0', // mint border, success banner border
  mint300: '#6EE7B7', // dark mode mint highlight
  mint500: '#10B981', // primary mint accent
  mint600: '#059669', // pressed mint
  mint700: '#047857', // deep mint text
  mint800: '#065F46', // success text, high-contrast dark mint
  mint900: '#064E3B', // dark surface mint highlight

  // Legacy Accent Aliases
  accentGreen: '#10B981',
  accentGreenLight: '#E8FDF5',
  accentGreenMuted: '#D1FAE5',

  // Status Colors
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorBorder: '#FECACA',
  errorDark: '#B91C1C',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningBorder: '#FDE68A',
  warningDark: '#B45309',

  success: '#10B981',
  successLight: '#D1FAE5',
  successBorder: '#A7F3D0',
  successDark: '#065F46',

  // Dark Mode Surfaces
  charcoal: '#1A1B1E',
  surfaceDark: '#212226',
  surfaceDarkElevated: '#2A2C31',
  borderDark: '#2E3138',
} as const;

export const Colors = {
  light: {
    // Canvas & Surfaces
    background: '#FFFFFF',
    backgroundNeutral: '#F8F9FA',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    backgroundInput: '#F5F6F8',
    backgroundSegment: '#EEF0F3',
    backgroundPressed: '#ECEEF2',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceNeutral: '#F8F9FA',
    surfaceSubtle: '#F8F9FA',
    surfaceHighlighted: '#E6FAF2',

    // Text & Content
    text: '#111113',
    textPrimary: '#111113',
    textSecondary: '#555B68',
    textTertiary: '#737B8C',
    textMuted: '#737B8C',
    textPlaceholder: '#9CA3AF',
    textInverse: '#FFFFFF',
    textDisabled: '#9CA3AF',

    // Interactive & Brand
    primary: '#111113',
    primaryPressed: '#2D2F36',
    primaryForeground: '#FFFFFF',

    secondary: '#2D2F36',
    secondaryBackground: '#F5F6F8',
    secondaryForeground: '#111113',

    accent: '#10B981',
    accentForeground: '#FFFFFF',
    accentLight: '#E6FAF2',
    accentMuted: '#D1FAE5',
    accentBorder: '#A7F3D0',
    accentDark: '#065F46',

    // Borders & Dividers
    border: '#E5E7EB',
    borderInput: '#E8EAED',
    borderSubtle: '#F3F4F6',
    borderFocused: '#111113',
    borderAccent: '#10B981',

    // Status & Feedback
    error: '#EF4444',
    errorBackground: '#FEE2E2',
    errorBorder: '#FECACA',
    errorForeground: '#B91C1C',
    warning: '#F59E0B',
    warningBackground: '#FEF3C7',
    warningBorder: '#FDE68A',
    warningForeground: '#B45309',
    success: '#10B981',
    successBackground: '#D1FAE5',
    successBorder: '#A7F3D0',
    successForeground: '#065F46',

    // Navigation & Tint
    tint: '#10B981',
    tabIconDefault: '#737B8C',
    tabIconSelected: '#111113',
    overlay: 'rgba(17, 17, 19, 0.4)',
  },
  dark: {
    // Canvas & Surfaces
    background: '#111113',
    backgroundNeutral: '#1A1B1E',
    backgroundElement: '#212226',
    backgroundSelected: '#2A2C31',
    backgroundInput: '#212226',
    backgroundSegment: '#1A1B1E',
    backgroundPressed: '#2D2F36',
    card: '#1A1B1E',
    surface: '#1A1B1E',
    surfaceNeutral: '#212226',
    surfaceSubtle: '#212226',
    surfaceHighlighted: '#064E3B',

    // Text & Content
    text: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A6B2',
    textTertiary: '#737B8C',
    textMuted: '#A0A6B2',
    textPlaceholder: '#737B8C',
    textInverse: '#111113',
    textDisabled: '#4B5563',

    // Interactive & Brand
    primary: '#FFFFFF',
    primaryPressed: '#E5E7EB',
    primaryForeground: '#111113',

    secondary: '#2D2F36',
    secondaryBackground: '#212226',
    secondaryForeground: '#FFFFFF',

    accent: '#10B981',
    accentForeground: '#FFFFFF',
    accentLight: '#064E3B',
    accentMuted: '#065F46',
    accentBorder: '#065F46',
    accentDark: '#6EE7B7',

    // Borders & Dividers
    border: '#2E3138',
    borderInput: '#2E3138',
    borderSubtle: '#212226',
    borderFocused: '#FFFFFF',
    borderAccent: '#10B981',

    // Status & Feedback
    error: '#EF4444',
    errorBackground: '#451A1A',
    errorBorder: '#7F1D1D',
    errorForeground: '#FCA5A5',
    warning: '#F59E0B',
    warningBackground: '#452A10',
    warningBorder: '#78350F',
    warningForeground: '#FCD34D',
    success: '#10B981',
    successBackground: '#064E3B',
    successBorder: '#065F46',
    successForeground: '#6EE7B7',

    // Navigation & Tint
    tint: '#10B981',
    tabIconDefault: '#737B8C',
    tabIconSelected: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type ThemeColorKey = keyof typeof Colors.light;
export type ThemeColors = Record<ThemeColorKey, string>;
export type ThemeColor = ThemeColorKey;

/**
 * Typography Constants
 * Primary typeface: Plus Jakarta Sans
 */
export const FontFamilies = {
  primary: 'PlusJakartaSans',
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'PlusJakartaSans-Regular',
    sansMedium: 'PlusJakartaSans-Medium',
    sansSemiBold: 'PlusJakartaSans-SemiBold',
    sansBold: 'PlusJakartaSans-Bold',
    fallback: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'PlusJakartaSans-Regular',
    sansMedium: 'PlusJakartaSans-Medium',
    sansSemiBold: 'PlusJakartaSans-SemiBold',
    sansBold: 'PlusJakartaSans-Bold',
    fallback: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'PlusJakartaSans-Regular',
    sansMedium: 'PlusJakartaSans-Medium',
    sansSemiBold: 'PlusJakartaSans-SemiBold',
    sansBold: 'PlusJakartaSans-Bold',
    fallback: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const FontSizes = {
  overline: 11,
  captionSmall: 12,
  xs: 12,
  sm: 14,
  input: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  heroHeading: 27,
  '3xl': 30,
  wordmark: 32,
  '4xl': 36,
  '5xl': 44,
} as const;

export const LineHeights = {
  overline: 14,
  captionSmall: 16,
  xs: 16,
  sm: 20,
  input: 20,
  md: 24,
  lg: 26,
  xl: 28,
  xxl: 32,
  heroHeading: 33,
  '3xl': 38,
  wordmark: 38,
  '4xl': 44,
  '5xl': 52,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const Typography = {
  wordmark: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: FontWeights.extraBold,
    letterSpacing: -0.6,
  },
  heroHeading: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: FontWeights.extraBold,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: FontSizes['4xl'],
    lineHeight: LineHeights['4xl'],
    fontWeight: FontWeights.bold,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSizes['3xl'],
    lineHeight: LineHeights['3xl'],
    fontWeight: FontWeights.bold,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: FontSizes.xxl,
    lineHeight: LineHeights.xxl,
    fontWeight: FontWeights.semiBold,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: FontSizes.md,
    lineHeight: LineHeights.md,
    fontWeight: FontWeights.regular,
  },
  bodyMedium: {
    fontSize: FontSizes.md,
    lineHeight: LineHeights.md,
    fontWeight: FontWeights.medium,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.regular,
  },
  bodySmallMedium: {
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.medium,
  },
  label: {
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.semiBold,
  },
  caption: {
    fontSize: FontSizes.xs,
    lineHeight: LineHeights.xs,
    fontWeight: FontWeights.medium,
  },
  captionSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeights.regular,
  },
  button: {
    fontSize: FontSizes.md,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.semiBold,
  },
  buttonSm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: FontWeights.semiBold,
  },
  buttonLg: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: FontWeights.semiBold,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: FontWeights.semiBold,
    letterSpacing: 0.8,
  },
} as const;

/**
 * Spacing scale (8pt grid convention with half and micro steps)
 */
export const Spacing = {
  // Named scale
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  compact: 12,
  md: 16,
  loose: 20,
  lg: 24,
  screen: 28,
  xl: 32,
  jumbo: 40,
  '2xl': 48,
  '3xl': 64,

  // Existing numeric aliases for backwards compatibility
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * Border Radii
 */
export const Radii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  card: 14,
  lg: 16,
  logo: 20,
  xl: 24,
  pill: 9999,
  full: 9999,
  round: 9999,
} as const;

/**
 * Border Widths
 */
export const Borders = {
  none: 0,
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  thick: 2,
} as const;

/**
 * Elevation & Restrained Shadows for iOS and Android
 */
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Standardized Layout Metrics
 */
export const Layout = {
  maxContentWidth: 800,
  maxFormWidth: 420,
  screenPaddingHorizontal: 28,
  screenPaddingVertical: 16,
  authPaddingTop: 12,
  authPaddingBottom: 16,
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSm: 36,
  buttonHeightMd: 48,
  bottomTabHeight: 60,
  bottomTabInset: BottomTabInset,
} as const;

