/**
 * Nowly Pet System - Type Definitions
 * 
 * Defines pet identity, categorization, rarity, multi-activity scene models,
 * and user selection persistence records.
 */

export type PetCategory = 'normal' | 'uncommon' | 'mythical';

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';

/**
 * Extensible activity scenes for future Nowly companion experiences
 * (e.g. studying, watching movies, workout, etc.)
 */
export type PetActivityType =
  | 'idle'
  | 'movie'
  | 'cricket'
  | 'studying'
  | 'eating'
  | 'sleeping'
  | 'workout'
  | 'gaming'
  | 'travel';

export interface PetActivityPose {
  activity: PetActivityType;
  title: string;
  description: string;
  assetSource?: any;
}

export interface PetPersonalityTag {
  label: string;
  icon?: string;
}

export interface PetCatalogueEntry {
  id: string;
  name: string;
  category: PetCategory;
  rarity: PetRarity;
  characterIdentity?: string;
  personalityTags?: PetPersonalityTag[];
  description: string;
  badgeLabel?: string;
  accentColor: string;
  image: any;
  heroImage?: any;
  isActive: boolean;
  poses?: Partial<Record<PetActivityType, PetActivityPose>>;
}

export interface UserPetSelection {
  userId: string;
  selectedPetId: string;
  petSelectedAt: string;
  pet?: PetCatalogueEntry;
}

export interface SavePetResult {
  success: boolean;
  syncedWithDb: boolean;
  petId: string;
  error?: string;
}

