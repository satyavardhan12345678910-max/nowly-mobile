import { supabase } from './supabase';

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch a user's public profile from the `profiles` table.
 */
export async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Unexpected error fetching profile:', err);
    return null;
  }
}

/**
 * Upload an avatar image to the Supabase Storage 'avatars' bucket.
 * Uses ArrayBuffer for reliable cross-platform compatibility on Android, iOS, and Web.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAvatarPhoto(
  userId: string,
  localUri: string
): Promise<string> {
  const fileExt = localUri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatar-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType: fileExt === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export interface SaveProfileResult {
  success: boolean;
  syncedWithDb: boolean;
  avatarUrl: string | null;
  error?: string;
}

/**
 * Save user profile updates:
 * 1. Always synchronizes Supabase auth `user_metadata` (immediate availability in session).
 * 2. Upserts to `public.profiles` database table.
 */
export async function saveUserProfile(
  userId: string,
  params: {
    displayName: string;
    avatarUrl?: string | null;
  }
): Promise<SaveProfileResult> {
  const trimmedName = params.displayName.trim();
  const avatarUrlToSave = params.avatarUrl || null;
  let syncedWithDb = false;
  let dbErrorMessage: string | undefined;

  // 1. Update auth.users metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      display_name: trimmedName,
      full_name: trimmedName,
      avatar_url: avatarUrlToSave,
    },
  });

  if (authError) {
    console.warn('Auth user_metadata update notice:', authError.message);
  }

  // 2. Upsert to public.profiles table
  try {
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: trimmedName,
      avatar_url: avatarUrlToSave,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      console.warn('Profiles table upsert notice:', dbError.message);
      dbErrorMessage = dbError.message;
    } else {
      syncedWithDb = true;
    }
  } catch (err: any) {
    console.warn('Profiles upsert exception:', err);
    dbErrorMessage = err.message;
  }

  return {
    success: true,
    syncedWithDb,
    avatarUrl: avatarUrlToSave,
    error: dbErrorMessage,
  };
}
