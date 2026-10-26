import { Linking, Share as RNShareCore } from 'react-native';
import { supabase } from './supabase';
import { ProfileRecord } from './profile';
import { NOWLY_INVITE_IMAGE_BASE64 } from './invite-image-base64';

export const NOWLY_INVITE_MESSAGE = `Hey! You should try this new app called Nowly ✨

It’s a private space to share what you’re doing right now with your close friends. Super fun and helps us stay connected throughout the day!

https://nowly.app/`;

export const NOWLY_INVITE_URL = 'https://nowly.app';

/**
 * Safely inspect whether react-native-share native module is linked in the running APK.
 * Uses TurboModuleRegistry.get / NativeModules to prevent getEnforcing crash.
 */
export function hasNativeShareModule(): boolean {
  try {
    const { NativeModules, TurboModuleRegistry } = require('react-native');
    if (NativeModules?.RNShare != null) return true;
    if (typeof TurboModuleRegistry?.get === 'function' && TurboModuleRegistry.get('RNShare') != null) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Share the official Nowly promotional image and message directly to WhatsApp or native share sheet.
 * Prioritizes WhatsApp where installed, attaching the promotional image and invitation caption.
 * Falls back gracefully to system share sheet, and safely handles older APKs without crashing.
 */
export async function shareNowlyInvite(
  options: { preferWhatsApp?: boolean } = {}
): Promise<{ completed: boolean; channel?: 'whatsapp' | 'system' | 'fallback' }> {
  const preferWhatsApp = options.preferWhatsApp ?? true;

  // 1. If react-native-share native module is compiled into the APK:
  if (hasNativeShareModule()) {
    try {
      const Share = require('react-native-share').default || require('react-native-share');

      if (preferWhatsApp) {
        let isWhatsAppAvailable = false;
        try {
          const res = await Share.isPackageInstalled('com.whatsapp');
          isWhatsAppAvailable = res?.isInstalled ?? false;
        } catch {
          isWhatsAppAvailable = await Linking.canOpenURL('whatsapp://send').catch(() => false);
        }

        if (isWhatsAppAvailable) {
          try {
            await Share.shareSingle({
              social: Share.Social?.WHATSAPP || 'whatsapp',
              url: NOWLY_INVITE_IMAGE_BASE64,
              message: NOWLY_INVITE_MESSAGE,
              type: 'image/png',
              filename: 'nowly-invite',
            });
            return { completed: true, channel: 'whatsapp' };
          } catch (whatsappErr: any) {
            // Check if user dismissed WhatsApp recipient selector
            const errMsg = String(whatsappErr?.message || whatsappErr || '').toLowerCase();
            if (errMsg.includes('user did not share') || errMsg.includes('dismissed') || errMsg.includes('cancel')) {
              return { completed: false };
            }
            console.warn('Direct WhatsApp share failed, falling back to system share sheet:', whatsappErr);
          }
        }
      }

      // Fallback to native system share sheet with promotional image and message
      try {
        await Share.open({
          title: 'Invite to Nowly',
          message: NOWLY_INVITE_MESSAGE,
          url: NOWLY_INVITE_IMAGE_BASE64,
          type: 'image/png',
          filename: 'nowly-invite',
        });
        return { completed: true, channel: 'system' };
      } catch (sheetErr: any) {
        const errMsg = String(sheetErr?.message || sheetErr || '').toLowerCase();
        if (errMsg.includes('user did not share') || errMsg.includes('dismissed') || errMsg.includes('cancel')) {
          return { completed: false };
        }
        console.warn('System share sheet failed:', sheetErr);
      }
    } catch (nativeErr) {
      console.warn('Error in native share module:', nativeErr);
    }
  }

  // 2. Fallback for builds without react-native-share compiled into APK:
  if (preferWhatsApp) {
    const canOpenWhatsApp = await Linking.canOpenURL('whatsapp://send').catch(() => false);
    if (canOpenWhatsApp) {
      try {
        await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(NOWLY_INVITE_MESSAGE)}`);
        return { completed: true, channel: 'whatsapp' };
      } catch (linkErr) {
        console.warn('Could not open WhatsApp URL:', linkErr);
      }
    }
  }

  // 3. General native share sheet fallback using React Native core Share
  try {
    const res = await RNShareCore.share({
      title: 'Join me on Nowly ✨',
      message: NOWLY_INVITE_MESSAGE,
      url: NOWLY_INVITE_URL,
    });
    if (res.action === RNShareCore.sharedAction) {
      return { completed: true, channel: 'fallback' };
    }
    return { completed: false };
  } catch (err) {
    console.warn('Core share fallback failed:', err);
    return { completed: false };
  }
}

export interface FriendRequestRecord {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  created_at: string;
  updated_at: string;
}

/**
 * Search registered Nowly profiles by display name or username.
 * Sanitizes input, applies case-insensitive ILIKE search with RLS,
 * excludes the current user, and deduplicates results.
 * Handles database schemas where `username` column may or may not be applied yet.
 */
export async function searchProfiles(
  query: string,
  excludeUserId?: string
): Promise<ProfileRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Sanitize ILIKE wildcard characters to prevent pattern injection
  const sanitized = trimmed.replace(/[%_\\]/g, '\\$&');

  try {
    // 1. Attempt searching both display_name and username
    let builder = supabase
      .from('profiles')
      .select('id, display_name, avatar_url, username, created_at, updated_at')
      .or(`display_name.ilike.%${sanitized}%,username.ilike.%${sanitized}%`)
      .limit(20);

    if (excludeUserId) {
      builder = builder.neq('id', excludeUserId);
    }

    const { data, error } = await builder;

    if (!error) {
      const seen = new Set<string>();
      return ((data as ProfileRecord[]) || []).filter((p) => {
        if (!p.id || p.id === excludeUserId || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    // 2. If username column is not yet present on remote DB, fallback to display_name only
    if (error.message.includes('username')) {
      let fallbackBuilder = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, created_at, updated_at')
        .ilike('display_name', `%${sanitized}%`)
        .limit(20);

      if (excludeUserId) {
        fallbackBuilder = fallbackBuilder.neq('id', excludeUserId);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackBuilder;
      if (!fallbackError) {
        const seen = new Set<string>();
        return ((fallbackData as ProfileRecord[]) || []).filter((p) => {
          if (!p.id || p.id === excludeUserId || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      }
    }

    console.warn('Error searching profiles:', error.message);
    return [];
  } catch (err) {
    console.warn('Unexpected error searching profiles:', err);
    return [];
  }
}

/**
 * Fetch suggested registered Nowly profiles from Supabase.
 * Excludes the currently authenticated user, prevents duplicates,
 * and handles schemas where `username` may or may not be applied yet.
 */
export async function fetchSuggestedProfiles(
  excludeUserId?: string
): Promise<ProfileRecord[]> {
  try {
    let builder = supabase
      .from('profiles')
      .select('id, display_name, avatar_url, username, created_at, updated_at')
      .not('display_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (excludeUserId) {
      builder = builder.neq('id', excludeUserId);
    }

    const { data, error } = await builder;

    if (!error) {
      const seen = new Set<string>();
      return ((data as ProfileRecord[]) || []).filter((p) => {
        if (!p.id || p.id === excludeUserId || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    // Fallback if username does not exist yet
    if (error.message.includes('username')) {
      let fallbackBuilder = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, created_at, updated_at')
        .not('display_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (excludeUserId) {
        fallbackBuilder = fallbackBuilder.neq('id', excludeUserId);
      }

      const { data: fallbackData } = await fallbackBuilder;
      const seen = new Set<string>();
      return ((fallbackData as ProfileRecord[]) || []).filter((p) => {
        if (!p.id || p.id === excludeUserId || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    console.warn('Error fetching suggested profiles:', error.message);
    return [];
  } catch (err) {
    console.warn('Unexpected error fetching suggested profiles:', err);
    return [];
  }
}

/**
 * Fetch all friend requests sent or received by the current user.
 * Returns a record mapping target user ID to request status.
 */
export async function fetchFriendRequestStatuses(
  userId: string
): Promise<Record<string, 'pending' | 'accepted' | 'rejected' | 'canceled'>> {
  if (!userId) return {};

  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('sender_id, receiver_id, status')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      return {};
    }

    const statusMap: Record<string, 'pending' | 'accepted' | 'rejected' | 'canceled'> = {};
    for (const req of (data || []) as { sender_id: string; receiver_id: string; status: any }[]) {
      const otherId = req.sender_id === userId ? req.receiver_id : req.sender_id;
      statusMap[otherId] = req.status;
    }

    return statusMap;
  } catch (err) {
    console.warn('Unexpected error fetching friend requests:', err);
    return {};
  }
}

/**
 * Send a friend request to a target user.
 * Prevents self-requests, handles reverse-direction requests, and prevents duplicate submissions.
 */
export async function sendFriendRequest(
  senderId: string,
  receiverId: string
): Promise<{ success: boolean; error?: string }> {
  if (!senderId || !receiverId) {
    return { success: false, error: 'Invalid user parameters' };
  }

  if (senderId === receiverId) {
    return { success: false, error: 'Cannot send friend request to yourself' };
  }

  try {
    // 1. Check if a request already exists between these two users in either direction
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .maybeSingle();

    if (existing) {
      if (existing.sender_id === senderId) {
        // Already sent by current user
        return { success: true };
      } else {
        // Reverse request: target user already sent a request to current user!
        // Automatically accept the pending request
        if (existing.status === 'pending') {
          await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .eq('id', existing.id);
        }
        return { success: true };
      }
    }

    // 2. Insert new friend request
    const { error } = await supabase.from('friend_requests').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
    });

    if (error) {
      // Duplicate constraint handling (code 23505)
      if (error.code === '23505') {
        return { success: true };
      }
      console.warn('Error sending friend request:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Unexpected error sending friend request:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
