import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const params = useLocalSearchParams<{
    code?: string;
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    async function handleCallback() {
      if (params.code) {
        try {
          await supabase.auth.exchangeCodeForSession(params.code);
        } catch (e) {
          console.error('Failed to exchange auth code:', e);
        }
      } else if (params.access_token && params.refresh_token) {
        try {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
        } catch (e) {
          console.error('Failed to set session from callback:', e);
        }
      }
      router.replace('/');
    }

    handleCallback();
  }, [params.code, params.access_token, params.refresh_token]);


  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#111113" />
      <ThemedText
        variant="bodySmall"
        themeColor="textSecondary"
        style={styles.text}>
        Completing sign in...
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
  },
});
