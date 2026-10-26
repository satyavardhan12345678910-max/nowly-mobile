import { useEffect } from 'react';
import { requireOptionalNativeModule } from 'expo';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthScreen } from '@/components/auth-screen';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { session } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const ExpoDevMenu = requireOptionalNativeModule('ExpoDevMenu') as
        | { setToolsButtonVisible?: (visible: boolean) => Promise<void> }
        | undefined;
      ExpoDevMenu?.setToolsButtonVisible?.(false);

      const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences') as
        | { setPreferencesAsync: (prefs: { showFloatingActionButton: boolean }) => Promise<void> }
        | undefined;
      DevMenuPreferences?.setPreferencesAsync({
        showFloatingActionButton: false,
      });
    } catch {
      // DevMenu not present in web or standard production builds
    }
  }, []);

  const isDedicatedRoute =
    pathname.startsWith('/onboarding') || pathname.startsWith('/auth');

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.textPrimary,
      border: theme.border,
      notification: theme.accent,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      {isDedicatedRoute ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding/manifesto" />
          <Stack.Screen name="onboarding/profile" />
          <Stack.Screen name="onboarding/circle" />
          <Stack.Screen name="onboarding/goals" />
          <Stack.Screen name="onboarding/streaks" />
          <Stack.Screen name="onboarding/rescue" />
          <Stack.Screen name="onboarding/intention" />
          <Stack.Screen name="onboarding/insights" />
          <Stack.Screen name="onboarding/people" />
          <Stack.Screen name="onboarding/widget" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="auth/callback" />
        </Stack>
      ) : session ? (
        <AppTabs />
      ) : (
        <AuthScreen />
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}



