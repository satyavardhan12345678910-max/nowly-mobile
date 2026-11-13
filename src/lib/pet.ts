/**
 * Nowly Pet System - Persistence & Supabase Integration
 * 
 * Provides robust, offline-resilient storage for user pet selections.
 * 1. Synchronizes with Supabase public.profiles table (when authenticated).
 * 2. Mirrors to Supabase auth user_metadata for immediate session availability.
 * 3. Falls back to AsyncStorage for offline/pre-signup onboarding resilience.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { SavePetResult } from '@/types/pet';

const STORAGE_KEY_SELECTED_PET = '@nowly_selected_pet_id';
const STORAGE_KEY_SELECTED_AT = '@nowly_pet_selected_at';

/**
 * Fetch the currently selected pet ID for the user.
 * Checks Supabase DB first, then auth metadata, then local AsyncStorage.
 */
export async function fetchUserPetSelection(userId?: string | null): Promise<string | null> {
  // 1. Try local cache first for instant responsiveness
  let cachedPetId: string | null = null;
  try {
    cachedPetId = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_PET);
  } catch {
    // Non-fatal if local cache fails
  }

  if (!userId) {
    return cachedPetId;
  }

  // 2. Fetch from Supabase profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('selected_pet_id')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data?.selected_pet_id) {
      // Keep local cache synced
      AsyncStorage.setItem(STORAGE_KEY_SELECTED_PET, data.selected_pet_id).catch(() => {});
      return data.selected_pet_id;
    }
  } catch (err) {
    console.warn('Network error fetching pet selection from profiles:', err);
  }

  // 3. Fallback to auth metadata if profile query had an issue
  try {
    const { data: authData } = await supabase.auth.getUser();
    const metaPetId = authData?.user?.user_metadata?.selected_pet_id;
    if (metaPetId) {
      AsyncStorage.setItem(STORAGE_KEY_SELECTED_PET, metaPetId).catch(() => {});
      return metaPetId;
    }
  } catch {
    // Fallback to local cache
  }

  return cachedPetId;
}

/**
 * Save user pet selection.
 * Handles both authenticated and unauthenticated onboarding states.
 */
export async function saveUserPetSelection(
  userId: string | null | undefined,
  petId: string
): Promise<SavePetResult> {
  const trimmedPetId = petId.trim();
  const selectedAtIso = new Date().toISOString();
  let syncedWithDb = false;
  let dbErrorMsg: string | undefined;

  // Always update local storage first so the UI never loses state
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SELECTED_PET, trimmedPetId);
    await AsyncStorage.setItem(STORAGE_KEY_SELECTED_AT, selectedAtIso);
  } catch (storageError) {
    console.warn('Failed to cache selected pet locally:', storageError);
  }

  // If unauthenticated (e.g. early onboarding), local persistence is sufficient
  if (!userId) {
    return {
      success: true,
      syncedWithDb: false,
      petId: trimmedPetId,
    };
  }

  // Synchronize with Supabase Auth user_metadata
  try {
    await supabase.auth.updateUser({
      data: {
        selected_pet_id: trimmedPetId,
        pet_selected_at: selectedAtIso,
      },
    });
  } catch (authErr) {
    console.warn('Could not sync pet to auth metadata:', authErr);
  }

  // Synchronize with public.profiles table
  try {
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          selected_pet_id: trimmedPetId,
          pet_selected_at: selectedAtIso,
          updated_at: selectedAtIso,
        },
        { onConflict: 'id' }
      );

    if (dbError) {
      console.warn('Error saving pet to public.profiles:', dbError.message);
      dbErrorMsg = dbError.message;
    } else {
      syncedWithDb = true;
    }
  } catch (dbEx) {
    console.warn('Exception updating public.profiles with pet:', dbEx);
    dbErrorMsg = dbEx instanceof Error ? dbEx.message : 'Database update failed';
  }

  return {
    success: true, // true because local storage succeeded and state is preserved
    syncedWithDb,
    petId: trimmedPetId,
    error: dbErrorMsg,
  };
}

