import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { requireOptionalNativeModule } from 'expo';

import { useAuth } from '@/context/auth-context';
import { ProfileRecord } from '@/lib/profile';
import {
  fetchFriendRequestStatuses,
  NOWLY_INVITE_MESSAGE,
  NOWLY_INVITE_URL,
  searchProfiles,
  sendFriendRequest,
  shareNowlyInvite,
} from '@/lib/friends';

// ────────────────────────────────────────────────────────────────────────────
// Native Module Availability Checkers
// Uses requireOptionalNativeModule to inspect the APK binary without throwing
// ────────────────────────────────────────────────────────────────────────────

function hasClipboardModule(): boolean {
  try {
    return requireOptionalNativeModule('ExpoClipboard') != null;
  } catch {
    return false;
  }
}

function hasContactsModule(): boolean {
  try {
    return (
      requireOptionalNativeModule('ExpoContactsNext') != null ||
      requireOptionalNativeModule('ExpoContacts') != null
    );
  } catch {
    return false;
  }
}

interface ContactItem {
  id: string;
  name: string;
  phoneNumber?: string;
  initial: string;
  avatarBg: string;
  textColor: string;
  isInvited: boolean;
}

type ListItem =
  | { type: 'contact'; id: string; contact: ContactItem }
  | { type: 'profile'; id: string; profile: ProfileRecord }
  | { type: 'section_header'; id: string; title: string; count?: number; isLoading?: boolean }
  | { type: 'empty_nowly'; id: string; message: string }
  | { type: 'empty_all'; id: string; query: string };

const INITIAL_PALETTES = [
  { bg: '#FCE8E8', text: '#9C3838' }, // Blush peach
  { bg: '#E6EFFD', text: '#2563EB' }, // Soft blue
  { bg: '#E6FAF2', text: '#059669' }, // Soft mint
  { bg: '#F2ECFD', text: '#7C3AED' }, // Soft purple
  { bg: '#FEF3C7', text: '#D97706' }, // Amber
  { bg: '#FCE7F3', text: '#DB2777' }, // Pink
];

export default function FindYourPeopleScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const searchInputRef = useRef<any>(null);

  // Search state (manual search)
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Friend requests state (targetUserId -> status)
  const [requestStatusMap, setRequestStatusMap] = useState<
    Record<string, 'pending' | 'accepted' | 'rejected' | 'canceled'>
  >({});

  // Device contacts state (strictly retrieved from phone with user permission)
  const [contactsList, setContactsList] = useState<ContactItem[]>([]);
  const [hasLoadedDeviceContacts, setHasLoadedDeviceContacts] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Invitation tracking
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);

  // Hardware back button support for Android
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Fetch friend request statuses for current user
  useEffect(() => {
    let isMounted = true;

    async function loadFriendStatuses() {
      try {
        if (user?.id) {
          const statuses = await fetchFriendRequestStatuses(user.id);
          if (isMounted) setRequestStatusMap(statuses);
        }
      } catch (err) {
        console.warn('Error loading friend request statuses:', err);
      }
    }

    loadFriendStatuses();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Execute manual search on demand (only when Search is tapped or keyboard is submitted)
  const handleExecuteSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      handleClearSearch();
      return;
    }

    if (isSearching) return; // Prevent duplicate submissions

    Keyboard.dismiss();
    setSubmittedQuery(trimmed);
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchProfiles(trimmed, user?.id);
      setSearchResults(results);
    } catch (err: any) {
      console.warn('Error searching Nowly profiles:', err);
      setSearchError(err?.message || 'Error searching users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search input and restore full contact list
  const handleClearSearch = () => {
    setSearchQuery('');
    setSubmittedQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
  };

  // Handle typing: does NOT trigger any search or filter
  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    // If the input is completely erased, restore the full contact list
    if (text.trim().length === 0 && submittedQuery.length > 0) {
      setSubmittedQuery('');
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push('/onboarding/widget');
  };

  const handleSkip = () => {
    router.replace('/');
  };

  // Contacts Access Handler (retrieves all device contacts, never uploads to Supabase)
  const handleLoadContacts = async () => {
    Keyboard.dismiss();

    if (!hasContactsModule()) {
      Alert.alert(
        'New Build Required',
        'Direct contact reading requires an updated development APK with native modules compiled. In the meantime, you can invite your friends using "Invite with a link" or through the native share button below!',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoadingContacts(true);

    try {
      const Contacts = require('expo-contacts');

      // 1. Check existing permission status or request permission
      let permission = await Contacts.getPermissionsAsync();
      if (permission.status !== 'granted') {
        if (permission.canAskAgain) {
          permission = await Contacts.requestPermissionsAsync();
        } else {
          Alert.alert(
            'Contacts Permission Disabled',
            'Permission to access your contacts is currently disabled. To invite friends from your address book, please enable contacts in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings().catch(() => {});
                },
              },
            ]
          );
          setIsLoadingContacts(false);
          return;
        }
      }

      // 2. Handle permission denial gracefully - never proceed without explicit user consent
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Permission to access your contacts was not granted. You can still invite your close friends directly using the invite link below!',
          [{ text: 'OK' }]
        );
        setIsLoadingContacts(false);
        return;
      }

      // 3. Retrieve ALL contacts using Expo SDK 58 class-based API, with fallback to legacy
      let rawContactsList: { id: string; name: string; phone?: string }[] = [];

      if (Contacts.Contact && typeof Contacts.Contact.getAllDetails === 'function') {
        const fields = [
          Contacts.ContactField?.FULL_NAME || 'fullName',
          Contacts.ContactField?.GIVEN_NAME || 'givenName',
          Contacts.ContactField?.FAMILY_NAME || 'familyName',
          Contacts.ContactField?.PHONES || 'phones',
        ];

        // Retrieve all contacts without arbitrary limit
        const details = await Contacts.Contact.getAllDetails(fields, {
          sortOrder: Contacts.ContactsSortOrder?.GivenName || 'givenName',
        });

        if (Array.isArray(details)) {
          rawContactsList = details.map((c: any) => {
            const name = (
              c.fullName ||
              `${c.givenName || ''} ${c.familyName || ''}`.trim() ||
              c.name ||
              ''
            ).trim();
            const phone =
              c.phones?.[0]?.number ||
              c.phoneNumbers?.[0]?.number ||
              '';
            return {
              id: c.id,
              name,
              phone,
            };
          });
        }
      } else {
        // Fallback for legacy contacts module if present
        let data: any[] = [];
        try {
          const LegacyContacts = require('expo-contacts/legacy');
          const res = await LegacyContacts.getContactsAsync({
            fields: [LegacyContacts.Fields.PhoneNumbers, LegacyContacts.Fields.Name],
          });
          data = res.data || [];
        } catch {
          if (typeof Contacts.getContactsAsync === 'function') {
            const res = await Contacts.getContactsAsync({
              fields: [Contacts.Fields?.PhoneNumbers, Contacts.Fields?.Name],
            });
            data = res.data || [];
          }
        }

        rawContactsList = data.map((contact: any) => {
          const name = (
            contact.name ||
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
            ''
          ).trim();
          const phone =
            contact.phoneNumbers?.[0]?.number || '';
          return {
            id: contact.id,
            name,
            phone,
          };
        });
      }

      setHasLoadedDeviceContacts(true);

      if (rawContactsList.length > 0) {
        // Deduplicate contacts while preserving legitimate distinct contacts
        const seenIds = new Set<string>();
        const seenPhoneNumbers = new Set<string>();
        const mappedContacts: ContactItem[] = [];

        for (let i = 0; i < rawContactsList.length; i++) {
          const contact = rawContactsList[i];
          if (!contact.name) continue;

          // Prevent duplicate contact IDs
          if (contact.id && seenIds.has(contact.id)) continue;
          if (contact.id) seenIds.add(contact.id);

          const cleanPhone = contact.phone
            ? contact.phone.replace(/[\s\-\(\)\.]/g, '')
            : '';

          // Prevent duplicates caused by duplicate synced accounts with same phone and name
          const dedupeKey = cleanPhone
            ? `${cleanPhone}_${contact.name.toLowerCase()}`
            : `id_${contact.id}`;

          if (cleanPhone && seenPhoneNumbers.has(dedupeKey)) continue;
          if (cleanPhone) seenPhoneNumbers.add(dedupeKey);

          const initial = contact.name.charAt(0).toUpperCase() || '?';
          const palette =
            INITIAL_PALETTES[mappedContacts.length % INITIAL_PALETTES.length];

          mappedContacts.push({
            id: contact.id || `contact-${i}`,
            name: contact.name,
            phoneNumber: cleanPhone || contact.phone || undefined,
            initial,
            avatarBg: palette.bg,
            textColor: palette.text,
            isInvited: invitedIds.has(contact.id || contact.name),
          });
        }

        setContactsList(mappedContacts);
      } else {
        setContactsList([]);
      }
    } catch (err) {
      console.warn('Error reading device contacts:', err);
      Alert.alert(
        'Contacts Notice',
        'Could not access device contacts on this build. You can invite friends using the link below.'
      );
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Focus Search Bar
  const handleFindOnNowly = () => {
    searchInputRef.current?.focus();
  };

  // Native Promotional Image & Message Invitation Sharing (WhatsApp prioritized)
  const handleInviteContact = async (contactId: string, contactName: string) => {
    try {
      const result = await shareNowlyInvite({ preferWhatsApp: true });

      // Mark contact as invited if user proceeded with sharing
      if (result.completed) {
        setInvitedIds((prev) => new Set(prev).add(contactId).add(contactName));
        setContactsList((prev) =>
          prev.map((c) =>
            c.id === contactId || c.name === contactName
              ? { ...c, isInvited: true }
              : c
          )
        );
      }
    } catch (err) {
      console.warn('Error sharing invitation:', err);
    }
  };

  // General Invitation Sharing (WhatsApp & Share Sheet with image + text)
  const handleGeneralShare = async () => {
    try {
      await shareNowlyInvite({ preferWhatsApp: true });
    } catch (err) {
      console.warn('Error in general invitation share:', err);
    }
  };

  // Copy Invitation Link with Safe Fallback
  const handleCopyLink = async () => {
    if (hasClipboardModule()) {
      try {
        const Clipboard = require('expo-clipboard');
        await Clipboard.setStringAsync(NOWLY_INVITE_URL);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
        return;
      } catch (err) {
        console.warn('Error copying to native clipboard:', err);
      }
    }

    // Safe fallback if native clipboard module is missing from current APK:
    try {
      await shareNowlyInvite({ preferWhatsApp: false });
    } catch (err) {
      console.warn('Error sharing link:', err);
    }
  };

  // Send Friend Request
  const handleAddFriend = async (targetUserId: string) => {
    if (!user) {
      Alert.alert('Account Required', 'Please complete sign-in to send friend requests.');
      return;
    }

    if (user.id === targetUserId) {
      Alert.alert('Notice', 'You cannot add yourself as a friend.');
      return;
    }

    setRequestStatusMap((prev) => ({ ...prev, [targetUserId]: 'pending' }));
    const result = await sendFriendRequest(user.id, targetUserId);

    if (!result.success) {
      Alert.alert('Request Failed', result.error || 'Could not send friend request.');
      setRequestStatusMap((prev) => {
        const next = { ...prev };
        delete next[targetUserId];
        return next;
      });
    }
  };

  const isSearchActive = submittedQuery.trim().length > 0;

  // Filter device contacts based on submitted search query (searches name and phone number)
  const filteredContacts = useMemo(() => {
    const query = submittedQuery.trim().toLowerCase();
    if (!query) return contactsList;

    const cleanNumericQuery = query.replace(/\D/g, '');

    return contactsList.filter((contact) => {
      const nameMatch = contact.name.toLowerCase().includes(query);
      if (nameMatch) return true;

      if (cleanNumericQuery.length > 0 && contact.phoneNumber) {
        const cleanPhone = contact.phoneNumber.replace(/\D/g, '');
        if (cleanPhone.includes(cleanNumericQuery)) return true;
      }

      return false;
    });
  }, [contactsList, submittedQuery]);

  // Combined list data for FlatList
  const listData = useMemo<ListItem[]>(() => {
    if (!isSearchActive) {
      return contactsList.map((contact) => ({
        type: 'contact',
        id: contact.id,
        contact,
      }));
    }

    // In search mode:
    if (filteredContacts.length === 0 && searchResults.length === 0 && !isSearching) {
      return [
        {
          type: 'empty_all',
          id: 'empty-all-results',
          query: submittedQuery,
        },
      ];
    }

    const items: ListItem[] = [];

    // 1. Device Contacts matching submitted search query
    if (filteredContacts.length > 0) {
      items.push({
        type: 'section_header',
        id: 'header-device-contacts',
        title: `Device contacts (${filteredContacts.length})`,
      });
      for (const c of filteredContacts) {
        items.push({
          type: 'contact',
          id: `contact-search-${c.id}`,
          contact: c,
        });
      }
    }

    // 2. Nowly Users matching submitted search query
    items.push({
      type: 'section_header',
      id: 'header-nowly-users',
      title: 'Nowly users',
      count: searchResults.length,
      isLoading: isSearching,
    });

    if (searchResults.length > 0) {
      for (const p of searchResults) {
        items.push({
          type: 'profile',
          id: `profile-search-${p.id}`,
          profile: p,
        });
      }
    } else if (!isSearching) {
      items.push({
        type: 'empty_nowly',
        id: 'empty-nowly-results',
        message: `No Nowly accounts found for "${submittedQuery}"`,
      });
    }

    return items;
  }, [isSearchActive, contactsList, filteredContacts, searchResults, isSearching, submittedQuery]);

  // Render contact row item
  const renderContactRow = (contact: ContactItem) => {
    const isInvited = invitedIds.has(contact.id) || contact.isInvited;

    return (
      <View key={contact.id} style={styles.contactRow}>
        {/* Avatar Initial */}
        <View
          style={[
            styles.contactAvatarInitial,
            { backgroundColor: contact.avatarBg },
          ]}>
          <Text
            style={[
              styles.avatarInitialText,
              { color: contact.textColor },
            ]}>
            {contact.initial}
          </Text>
        </View>

        {/* Name & Phone */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.phoneNumber ? (
            <Text style={styles.contactPhone} numberOfLines={1}>
              {contact.phoneNumber}
            </Text>
          ) : null}
        </View>

        {/* Action: Invite or Invited */}
        {isInvited ? (
          <View style={styles.invitedPill}>
            <Feather
              name="check"
              size={14}
              color="#12C995"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.invitedPillText}>Invited</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => handleInviteContact(contact.id, contact.name)}
            style={({ pressed }) => [
              styles.invitePill,
              pressed && styles.invitePillPressed,
            ]}>
            <Text style={styles.invitePillText}>Invite</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // Render Nowly profile row item
  const renderProfileRow = (profile: ProfileRecord) => {
    const isFriend = requestStatusMap[profile.id] === 'accepted';
    const isRequested = requestStatusMap[profile.id] === 'pending';

    return (
      <View key={profile.id} style={styles.contactRow}>
        <View style={styles.userAvatarContainer}>
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.contactAvatarInitial,
                { backgroundColor: '#E6FAF2' },
              ]}>
              <Text style={[styles.avatarInitialText, { color: '#059669' }]}>
                {(profile.display_name || profile.username || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {profile.display_name || profile.username || 'Nowly User'}
          </Text>
          {profile.username && (
            <Text style={styles.contactUsername} numberOfLines={1}>
              @{profile.username}
            </Text>
          )}
        </View>

        {isFriend ? (
          <View style={styles.invitedPill}>
            <Feather name="check" size={13} color="#12C995" style={{ marginRight: 3 }} />
            <Text style={styles.invitedPillText}>Friends</Text>
          </View>
        ) : isRequested ? (
          <View style={styles.invitedPill}>
            <Feather name="check" size={13} color="#12C995" style={{ marginRight: 3 }} />
            <Text style={styles.invitedPillText}>Requested</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => handleAddFriend(profile.id)}
            style={styles.addFriendButton}>
            <Text style={styles.addFriendButtonText}>Add</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // FlatList renderItem dispatcher
  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'contact':
        return renderContactRow(item.contact);
      case 'profile':
        return renderProfileRow(item.profile);
      case 'section_header':
        return (
          <View
            style={[
              styles.sectionHeaderRow,
              item.id === 'header-nowly-users' && { marginTop: 18 },
            ]}>
            <Text style={styles.sectionHeader}>{item.title}</Text>
            {item.isLoading && (
              <ActivityIndicator
                size="small"
                color="#12C995"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        );
      case 'empty_nowly':
        return (
          <View style={styles.emptySubCategoryContainer}>
            <Text style={styles.emptySubCategoryText}>{item.message}</Text>
          </View>
        );
      case 'empty_all':
        return (
          <View style={styles.emptySearchContainer}>
            <Feather
              name="user-x"
              size={32}
              color="#CBD5E1"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptySearchTitle}>No results found</Text>
            <Text style={styles.emptySearchSubtitle}>
              No contacts or Nowly users matched &quot;{item.query}&quot;.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Header component: TopBar, Heading, SearchBar, ActionButtons, ContactsSectionHeader
  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* ─── 1. HEADER: Back Button, Progress & Step Badge ─── */}
      <View style={styles.topBar}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Feather name="chevron-left" size={22} color="#111113" />
        </Pressable>

        {/* 5 Green Segments (100% complete) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
        </View>

        {/* Step 6 of 6 Badge */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 6 of 6</Text>
        </View>
      </View>

      {/* ─── 2. HEADING & SUBTITLE ─── */}
      <View style={styles.headingSection}>
        <Text style={styles.title}>Find your people</Text>
        <Text style={styles.subtitle}>
          Add your friends to start sharing moments{'\n'}on Nowly.
        </Text>
      </View>

      {/* ─── 3. ROUNDED SEARCH FIELD (Manual Search Button) ─── */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#111113" style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search contacts or Nowly users"
          placeholderTextColor="#8E95A5"
          value={searchQuery}
          onChangeText={handleQueryChange}
          onSubmitEditing={handleExecuteSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={handleClearSearch}
            hitSlop={8}
            style={styles.clearSearchBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear search input">
            <Feather name="x" size={16} color="#8E95A5" />
          </Pressable>
        )}
        <Pressable
          onPress={handleExecuteSearch}
          disabled={isSearching || searchQuery.trim().length === 0}
          style={({ pressed }) => [
            styles.searchButton,
            searchQuery.trim().length === 0 && styles.searchButtonDisabled,
            pressed && styles.searchButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Submit search">
          {isSearching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.searchButtonText,
                searchQuery.trim().length === 0 && styles.searchButtonTextDisabled,
              ]}>
              Search
            </Text>
          )}
        </Pressable>
      </View>

      {/* ─── 4. TWO ACTION PILL BUTTONS (shown when not searching) ─── */}
      {!isSearchActive && (
        <>
          <View style={styles.actionButtonsRow}>
            {/* From contacts */}
            <Pressable
              onPress={handleLoadContacts}
              style={({ pressed }) => [
                styles.actionPillButton,
                pressed && styles.actionPillButtonPressed,
              ]}>
              {isLoadingContacts ? (
                <ActivityIndicator size="small" color="#111113" />
              ) : (
                <>
                  <View style={styles.contactsIconBadge}>
                    <Ionicons name="book" size={15} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionPillText}>From contacts</Text>
                </>
              )}
            </Pressable>

            {/* Find on Nowly */}
            <Pressable
              onPress={handleFindOnNowly}
              style={({ pressed }) => [
                styles.actionPillButton,
                pressed && styles.actionPillButtonPressed,
              ]}>
              <Ionicons
                name="person-add"
                size={18}
                color="#111113"
                style={{ marginRight: 2 }}
              />
              <Text style={styles.actionPillText}>Find on Nowly</Text>
            </Pressable>
          </View>

          {/* Contacts Section Header */}
          <View style={styles.contactsHeaderRow}>
            <Text style={styles.sectionHeader}>
              {hasLoadedDeviceContacts ? 'Device contacts' : 'Your contacts'}
            </Text>
            {hasLoadedDeviceContacts && contactsList.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{contactsList.length}</Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* When searching and device contacts not yet loaded: prompt banner */}
      {isSearchActive && !hasLoadedDeviceContacts && (
        <Pressable
          onPress={handleLoadContacts}
          style={styles.searchLoadContactsBanner}>
          <Ionicons
            name="book-outline"
            size={16}
            color="#12C995"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.searchLoadContactsText}>
            Tap to load device contacts and search them too
          </Text>
        </Pressable>
      )}
    </View>
  );

  // Footer component: Link Card, Continue Button, Skip Button
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      {/* ─── 5. INVITE WITH A LINK CARD ─── */}
      <View style={styles.linkCard}>
        <Pressable
          onPress={handleGeneralShare}
          style={({ pressed }) => [
            styles.linkCardLeft,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Share invitation with promotional image">
          <View style={styles.linkIconCircle}>
            <Feather name="link" size={19} color="#111113" />
          </View>
          <Text style={styles.linkCardTitle}>Invite with a link</Text>
        </Pressable>

        <Pressable
          onPress={handleCopyLink}
          style={({ pressed }) => [
            styles.copyLinkButton,
            pressed && styles.copyLinkButtonPressed,
          ]}>
          <Ionicons
            name={linkCopied ? 'checkmark-circle' : 'copy-outline'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.copyLinkText}>
            {linkCopied ? 'Copied! ✓' : 'Copy link'}
          </Text>
        </Pressable>
      </View>

      {/* ─── 6. CONTINUE BUTTON ─── */}
      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue">
          <Text style={styles.continueButtonText}>Continue</Text>
          <Feather
            name="arrow-right"
            size={20}
            color="#FFFFFF"
            style={styles.continueArrow}
          />
        </Pressable>

        {/* ─── 7. SKIP FOR NOW ─── */}
        <Pressable
          onPress={handleSkip}
          hitSlop={12}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip for now">
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );

  // Empty state for contacts (when not searching)
  const renderEmpty = () => {
    if (isSearchActive) {
      return null;
    }

    if (isLoadingContacts) {
      return (
        <View style={styles.contactsPromptCard}>
          <ActivityIndicator
            size="small"
            color="#12C995"
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.contactsPromptTitle}>Loading contacts...</Text>
          <Text style={styles.contactsPromptSubtitle}>
            Reading contacts from your device.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contactsPromptCard}>
        <Ionicons
          name="people-outline"
          size={24}
          color="#8E95A5"
          style={{ marginBottom: 6 }}
        />
        <Text style={styles.contactsPromptTitle}>
          {hasLoadedDeviceContacts
            ? 'No contacts found'
            : 'Connect your contacts'}
        </Text>
        <Text style={styles.contactsPromptSubtitle}>
          {hasLoadedDeviceContacts
            ? 'No contact records were found on this device.'
            : 'Tap "From contacts" above to find friends from your address book, or share your invite link below.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 8, 20),
              paddingBottom: Math.max(insets.bottom + 16, 28),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={25}
          maxToRenderPerBatch={30}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ErrorBoundary for Expo Router
// ────────────────────────────────────────────────────────────────────────────

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Unable to load screen</Text>
      <Text style={styles.errorMessage}>{error?.message || 'Unknown error occurred'}</Text>
      <Pressable onPress={retry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerWrapper: {
    marginBottom: 10,
  },

  // 1. Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressSegment: {
    width: 28,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: '#12C995',
  },
  stepBadge: {
    backgroundColor: '#F4F5F7',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111113',
  },

  // 2. Heading
  headingSection: {
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#8E95A5',
    fontWeight: '400',
  },

  // 3. Search Bar
  searchBar: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F5F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111113',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 6,
    marginRight: 6,
  },
  searchButton: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  searchButtonPressed: {
    backgroundColor: '#26282E',
  },
  searchButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  searchButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // 4. Action Buttons (From contacts / Find on Nowly)
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionPillButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F5F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPillButtonPressed: {
    backgroundColor: '#E9EAEE',
  },
  contactsIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111113',
    letterSpacing: -0.2,
  },

  // Search Load Contacts Banner
  searchLoadContactsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBFBF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
  },
  searchLoadContactsText: {
    fontSize: 13,
    color: '#12C995',
    fontWeight: '500',
    flex: 1,
  },

  // Contacts Section Header
  contactsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E95A5',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F0F2F5',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555B68',
  },

  // Contact / User Rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatarInitial: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userAvatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 14,
  },
  contactName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#111113',
    letterSpacing: -0.2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#8E95A5',
    marginTop: 1,
  },
  contactUsername: {
    fontSize: 13,
    color: '#8E95A5',
    marginTop: 1,
  },

  // Contacts Empty / Prompt Card
  contactsPromptCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  contactsPromptTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111113',
    marginBottom: 4,
  },
  contactsPromptSubtitle: {
    fontSize: 13,
    color: '#8E95A5',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },

  // Empty Subcategory / Search Info
  emptySubCategoryContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  emptySubCategoryText: {
    fontSize: 13,
    color: '#8E95A5',
    fontStyle: 'italic',
  },

  // Invite / Invited Buttons
  invitePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EBFBF5',
  },
  invitePillPressed: {
    backgroundColor: '#DCF7ED',
  },
  invitePillText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#12C995',
  },
  invitedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#D4F7E9',
  },
  invitedPillText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#12C995',
  },
  addFriendButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111113',
  },
  addFriendButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Empty Search Container
  emptySearchContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111113',
    marginBottom: 4,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    color: '#8E95A5',
    textAlign: 'center',
    lineHeight: 19,
  },

  // Footer Container
  footerContainer: {
    marginTop: 24,
  },

  // 5. Invite with a link card
  linkCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    marginBottom: 24,
  },
  linkCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  linkCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111113',
    letterSpacing: -0.2,
  },
  copyLinkButton: {
    backgroundColor: '#111113',
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyLinkButtonPressed: {
    backgroundColor: '#26282E',
  },
  copyLinkText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // 6. Continue & Skip
  bottomSection: {
    marginBottom: 10,
  },
  continueButton: {
    width: '100%',
    height: 66,
    borderRadius: 33,
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonPressed: {
    backgroundColor: '#232326',
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  continueArrow: {
    marginLeft: 2,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#8E95A5',
  },

  // Error Boundary Fallback Styles
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111113',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#8E95A5',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#111113',
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
