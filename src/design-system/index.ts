/**
 * Nowly Shared Design System
 * 
 * Centralized design tokens, layout metrics, and reusable UI components.
 * White-first interface with black typography, mint green highlights, and subtle neutral surfaces.
 */

// Design Tokens & Layout Constants
export {
  Borders,
  BottomTabInset,
  Colors,
  FontFamilies,
  Fonts,
  FontSizes,
  FontWeights,
  Layout,
  LineHeights,
  MaxContentWidth,
  Palette,
  Radii,
  Shadows,
  Spacing,
  Typography,
  type ThemeColor,
  type ThemeColorKey,
  type ThemeColors,
} from '@/constants/theme';

// Theme Hooks
export { useDesignTokens, useTheme } from '@/hooks/use-theme';

// Core UI Components
export {
  BrandBackgroundBlobs,
  type BrandBackgroundBlobsProps,
} from '@/components/brand-shapes';
export {
  Card,
  type CardProps,
  type CardVariant,
} from '@/components/card';
export {
  DividerWithText,
  type DividerWithTextProps,
} from '@/components/divider-with-text';
export {
  FeedbackBanner,
  type FeedbackBannerProps,
  type FeedbackBannerVariant,
} from '@/components/feedback-banner';
export {
  NowlyLogo,
  type NowlyLogoProps,
  type NowlyLogoSize,
} from '@/components/nowly-logo';
export {
  ScreenContainer,
  type ScreenContainerProps,
} from '@/components/screen-container';
export {
  SectionHeader,
  type SectionHeaderProps,
} from '@/components/section-header';
export {
  SegmentedControl,
  type SegmentOption,
  type SegmentedControlProps,
} from '@/components/segmented-control';
export {
  ButtonSize,
  ButtonVariant,
  ThemedButton,
  type ThemedButtonProps,
} from '@/components/themed-button';
export {
  ThemedText,
  type ThemedTextProps,
  type TypographyVariant,
} from '@/components/themed-text';
export {
  ThemedTextInput,
  type ThemedTextInputProps,
} from '@/components/themed-text-input';
export {
  ThemedView,
  type ThemedViewProps,
} from '@/components/themed-view';
