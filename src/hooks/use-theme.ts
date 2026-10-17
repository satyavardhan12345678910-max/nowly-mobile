import {
  Borders,
  Colors,
  FontSizes,
  Radii,
  Shadows,
  Spacing,
  type ThemeColors,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Hook to access the current color scheme's semantic colors.
 */
export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}

/**
 * Hook to access complete design system tokens (colors, spacing, radii, borders, shadows, typography).
 */
export function useDesignTokens() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return {
    colors: Colors[theme],
    spacing: Spacing,
    radii: Radii,
    borders: Borders,
    shadows: Shadows,
    typography: Typography,
    fontSizes: FontSizes,
    colorScheme: theme,
    isDark: theme === 'dark',
  };
}

