import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('Google sign-in URL was not returned.');
  }

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectTo
  );

  if (result.type !== 'success' || !result.url) {
    return { success: false };
  }

  const code = Linking.parse(result.url).queryParams?.code;

  if (typeof code !== 'string') {
    throw new Error(
      'Google sign-in did not return an authorization code.'
    );
  }

  const { error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    throw sessionError;
  }

  return { success: true };
}

export async function signInWithEmail(
  email: string,
  password: string
) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(
  email: string,
  password: string
) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}