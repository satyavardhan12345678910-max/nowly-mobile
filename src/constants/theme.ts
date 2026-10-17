import '@/global.css';

import { Platform, StyleSheet } from 'react-native';

/**
 * Brand Identity Palette
 * White-first interface with black typography, mint green accents, and subtle neutral surfaces.
 */
export const Palette = {
  white: '#FFFFFF',
  black: '#111113',
  darkGray: '#2D2F36',
  midGray: '#737B8C',
  lightGray: '#E5E7EB',
  extraLightGray: '#F8F9FA',
  accentGreen: '#10B981',
  accentGreenLight: '#E8FDF5',
  accentGreenMuted: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
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
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceNeutral: '#F8F9FA',
    surfaceSubtle: '#F8F9FA',
    surfaceHighlighted: '#E8FDF5',

    // Text & Content
    text: '#111113',
    textPrimary: '#111113',
    textSecondary: '#737B8C',
    textTertiary: '#9CA3AF',
    textMuted: '#737B8C',
    textInverse: '#FFFFFF',
    textDisabled: '#9CA3AF',

    // Interactive & Brand
    primary: '#111113',
    primaryPressed: '#2D2F36',
    primaryForeground: '#FFFFFF',

    secondary: '#2D2F36',
    secondaryBackground: '#F8F9FA',
    secondaryForeground: '#111113',

    accent: '#10B981',
    accentForeground: '#FFFFFF',
    accentLight: '#E8FDF5',
    accentMuted: '#D1FAE5',

    // Borders & Dividers
    border: '#E5E7EB',
    borderSubtle: '#F3F4F6',
    borderFocused: '#111113',
    borderAccent: '#10B981',

    // Status & Feedback
    error: '#EF4444',
    errorBackground: '#FEE2E2',
    errorForeground: '#EF4444',
    warning: '#F59E0B',
    warningBackground: '#FEF3C7',
    warningForeground: '#D97706',
    success: '#10B981',
    successBackground: '#D1FAE5',
    successForeground: '#047857',

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

    // Borders & Dividers
    border: '#2E3138',
    borderSubtle: '#212226',
    borderFocused: '#FFFFFF',
    borderAccent: '#10B981',

    // Status & Feedback
    error: '#EF4444',
    errorBackground: '#451A1A',
    errorForeground: '#FCA5A5',
    warning: '#F59E0B',
    warningBackground: '#452A10',
    warningForeground: '#FCD34D',
    success: '#10B981',
    successBackground: '#064E3B',
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
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,
} as const;

export const LineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 28,
  xxl: 32,
  '3xl': 38,
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
  button: {
    fontSize: FontSizes.md,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.semiBold,
  },
} as const;

/**
 * Spacing scale (8pt grid convention with half and micro steps)
 */
export const Spacing = {
  // Named scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
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
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  pill: 9999,
  full: 9999,
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
  sm: {
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
