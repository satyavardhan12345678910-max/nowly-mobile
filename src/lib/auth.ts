import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

function extractUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  // Extract query parameters (?...)
  const questionIndex = url.indexOf('?');
  if (questionIndex !== -1) {
    const hashIndex = url.indexOf('#', questionIndex);
    const queryString =
      hashIndex !== -1
        ? url.slice(questionIndex + 1, hashIndex)
        : url.slice(questionIndex + 1);
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
  }

  // Extract hash fragment parameters (#...)
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const hashString = url.slice(hashIndex + 1);
    const hashParams = new URLSearchParams(hashString);
    hashParams.forEach((val, key) => {
      if (!params[key]) {
        params[key] = val;
      }
    });
  }

  return params;
}

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
    return {
      success: false,
      cancelled: result.type === 'cancel' || result.type === 'dismiss',
    };
  }

  const params = extractUrlParams(result.url);
  const errorDescription =
    params.error_description || params.error;

  if (errorDescription) {
    throw new Error(String(errorDescription));
  }

  const code = params.code;

  if (typeof code === 'string' && code.length > 0) {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      throw sessionError;
    }

    return { success: true, session: sessionData.session };
  }

  // Fallback: Check if session tokens were returned directly in URL fragment
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (typeof accessToken === 'string' && typeof refreshToken === 'string') {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (sessionError) {
      throw sessionError;
    }

    return { success: true, session: sessionData.session };
  }

  throw new Error(
    'Google sign-in did not return an authorization code or session tokens.'
  );
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

export async function resetPasswordForEmail(email: string) {
  const redirectTo = Linking.createURL('auth/callback');
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}