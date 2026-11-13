/**
 * Nowly Activity System - Persistence & Supabase Integration
 * 
 * Provides robust offline-resilient storage for user activity selection.
 * 1. Synchronizes with Supabase public.profiles table (when authenticated).
 * 2. Mirrors to Supabase auth user_metadata for immediate session availability.
 * 3. Falls back to AsyncStorage for offline/pre-signup onboarding resilience.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { SaveActivityResult } from '@/types/activity';

const STORAGE_KEY_SELECTED_ACTIVITY = '@nowly_selected_activity_id';
const STORAGE_KEY_ACTIVITY_SELECTED_AT = '@nowly_activity_selected_at';

/**
 * Fetch the currently selected activity ID for the user.
 * Checks local cache first, then Supabase profiles and auth metadata.
 */
export async function fetchUserActivitySelection(userId?: string | null): Promise<string | null> {
  // 1. Local cache first for instant UI response
  let cachedActivityId: string | null = null;
  try {
    cachedActivityId = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_ACTIVITY);
  } catch {
    // Non-fatal if local cache read fails
  }

  if (!userId) {
    return cachedActivityId;
  }

  // 2. Fetch from Supabase profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('current_activity')
      .eq('id', userId)
      .maybeSingle();

    if (!error && (data as any)?.current_activity) {
      const actId = (data as any).current_activity;
      AsyncStorage.setItem(STORAGE_KEY_SELECTED_ACTIVITY, actId).catch(() => {});
      return actId;
    }
  } catch (err) {
    console.warn('Network error fetching activity from profiles:', err);
  }

  // 3. Fallback to auth metadata
  try {
    const { data: authData } = await supabase.auth.getUser();
    const metaActivityId = authData?.user?.user_metadata?.selected_activity_id;
    if (metaActivityId) {
      AsyncStorage.setItem(STORAGE_KEY_SELECTED_ACTIVITY, metaActivityId).catch(() => {});
      return metaActivityId;
    }
  } catch {
    // Fallback to local cache
  }

  return cachedActivityId;
}

/**
 * Save user activity selection.
 * Handles both authenticated and unauthenticated onboarding states.
 */
export async function saveUserActivitySelection(
  userId: string | null | undefined,
  activityId: string
): Promise<SaveActivityResult> {
  const trimmedId = activityId.trim();
  const selectedAtIso = new Date().toISOString();
  let syncedWithDb = false;
  let dbErrorMsg: string | undefined;

  // Always update local storage first so state is never lost
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SELECTED_ACTIVITY, trimmedId);
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVITY_SELECTED_AT, selectedAtIso);
  } catch (storageError) {
    console.warn('Failed to cache selected activity locally:', storageError);
  }

  // If unauthenticated (e.g. early onboarding), local persistence is sufficient
  if (!userId) {
    return {
      success: true,
      syncedWithDb: false,
      activityId: trimmedId,
    };
  }

  // Synchronize with Supabase Auth user_metadata
  try {
    await supabase.auth.updateUser({
      data: {
        selected_activity_id: trimmedId,
        activity_selected_at: selectedAtIso,
      },
    });
  } catch (authMetaError) {
    console.warn('Could not mirror activity to auth metadata:', authMetaError);
  }

  // Synchronize with Supabase public.profiles table
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        current_activity: trimmedId,
        activity_selected_at: selectedAtIso,
      } as any)
      .eq('id', userId);

    if (profileError) {
      console.warn('Supabase profile activity update warning:', profileError.message);
      dbErrorMsg = profileError.message;
    } else {
      syncedWithDb = true;
    }
  } catch (dbError: any) {
    console.warn('Network error updating profile activity in Supabase:', dbError);
    dbErrorMsg = dbError?.message || 'Database connection error';
  }

  return {
    success: true,
    syncedWithDb,
    activityId: trimmedId,
    error: dbErrorMsg,
  };
}

