import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';
import { useDesignTokens } from '@/hooks/use-theme';

export type BrandBackgroundBlobsProps = {
  style?: ViewStyle;
  variant?: 'auth' | 'subtle' | 'minimal';
};

/**
 * BrandBackgroundBlobs
 * Renders Nowly's signature calm mint background ambiance.
 * Positioned absolute with pointerEvents="none" so clicks pass through naturally.
 */
export function BrandBackgroundBlobs({
  style,
  variant = 'auth',
}: BrandBackgroundBlobsProps) {
  const { isDark } = useDesignTokens();

  // In dark mode, reduce opacity for subtle deep glow
  const opacityMultiplier = isDark ? 0.35 : 1;

  if (variant === 'minimal') {
    return (
      <View style={[StyleSheet.absoluteFill, styles.container, style]} pointerEvents="none">
        <View
          style={[
            styles.mintBlobTopLeft,
            { opacity: 0.5 * opacityMultiplier },
          ]}
        />
        <View
          style={[
            styles.mintBlobBottomRight,
            { opacity: 0.5 * opacityMultiplier },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.container, style]} pointerEvents="none">
      <View
        style={[
          styles.mintBlobTopLeft,
          { opacity: 0.6 * opacityMultiplier },
        ]}
      />
      <View
        style={[
          styles.mintBlobTopRight,
          { opacity: 0.7 * opacityMultiplier },
        ]}
      />
      {variant === 'auth' && (
        <View
          style={[
            styles.mintBlobMidRight,
            { opacity: 0.5 * opacityMultiplier },
          ]}
        />
      )}
      <View
        style={[
          styles.mintBlobBottomRight,
          { opacity: 0.65 * opacityMultiplier },
        ]}
      />
      <View
        style={[
          styles.mintBlobBottomLeft,
          { opacity: 0.55 * opacityMultiplier },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  mintBlobTopLeft: {
    position: 'absolute',
    top: -45,
    left: -45,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: Palette.mint100,
  },
  mintBlobTopRight: {
    position: 'absolute',
    top: 130,
    right: -70,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: Palette.mint50,
  },
  mintBlobMidRight: {
    position: 'absolute',
    top: 330,
    right: -55,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Palette.mint100,
  },
  mintBlobBottomRight: {
    position: 'absolute',
    bottom: -45,
    right: -35,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: Palette.mint100,
  },
  mintBlobBottomLeft: {
    position: 'absolute',
    bottom: 35,
    left: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Palette.mint50,
  },
});
