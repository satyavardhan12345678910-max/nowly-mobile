import { Image, type ImageStyle } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radii } from '@/constants/theme';

export type NowlyLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export type NowlyLogoProps = {
  size?: NowlyLogoSize;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
};

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', { dimension: number; radius: number }> = {
  xs: { dimension: 28, radius: 8 },
  sm: { dimension: 40, radius: 11 },
  md: { dimension: 56, radius: 15 },
  lg: { dimension: 76, radius: Radii.logo }, // 20px - matches auth screen standard
  xl: { dimension: 96, radius: 25 },
};

/**
 * Nowly Brand Logo
 * Renders the official Nowly application icon with responsive presets and smooth corners.
 */
export function NowlyLogo({
  size = 'lg',
  style,
  containerStyle,
  accessibilityLabel = 'Nowly Logo',
}: NowlyLogoProps) {
  let dimension: number;
  let radius: number;

  if (typeof size === 'number') {
    dimension = size;
    radius = Math.round(size * 0.26);
  } else {
    const config = SIZE_MAP[size] ?? SIZE_MAP.lg;
    dimension = config.dimension;
    radius = config.radius;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={require('@/assets/images/nowly-logo.png')}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
            borderRadius: radius,
          },
          style,
        ]}
        contentFit="contain"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    overflow: 'hidden',
  },
});
