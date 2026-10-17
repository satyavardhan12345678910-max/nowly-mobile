import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing, type ThemeColor } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
  withBottomTab?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: ThemeColor | string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}>;

export function ScreenContainer({
  children,
  scrollable = false,
  withBottomTab = false,
  padding = 'md',
  backgroundColor,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useDesignTokens();

  const resolvedBg = backgroundColor
    ? (colors[backgroundColor as ThemeColor] ?? backgroundColor)
    : colors.background;

  const horizontalPadding =
    padding === 'none'
      ? 0
      : padding === 'sm'
        ? Spacing.sm
        : padding === 'lg'
          ? Spacing.lg
          : Spacing.md;

  const bottomInset = withBottomTab
    ? insets.bottom + BottomTabInset + Spacing.sm
    : insets.bottom + Spacing.md;

  const basePaddingStyle: ViewStyle = {
    paddingTop: insets.top + (padding === 'none' ? 0 : Spacing.sm),
    paddingBottom: bottomInset,
    paddingLeft: Math.max(insets.left, horizontalPadding),
    paddingRight: Math.max(insets.right, horizontalPadding),
  };

  const innerContent = (
    <View style={[styles.innerContent, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: resolvedBg }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, basePaddingStyle]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}>
          {innerContent}
        </ScrollView>
      ) : (
        <View style={[styles.fixedContent, basePaddingStyle]}>
          {innerContent}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  fixedContent: {
    flex: 1,
    alignItems: 'center',
  },
  innerContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flex: 1,
  },
});
