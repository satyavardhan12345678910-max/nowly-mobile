/**
 * Nowly Pet System - Master Pet Catalogue
 * 
 * Reusable, typed catalogue of all companion pets spanning Normal, Uncommon, and Mythical tiers.
 * Each entry includes metadata, rarity, badge styling, descriptions, and extensible activity poses.
 */

import { PetCatalogueEntry, PetCategory } from '@/types/pet';

export const PET_CATEGORIES: { id: PetCategory; label: string; icon: string }[] = [
  { id: 'normal', label: 'Normal', icon: 'paw' },
  { id: 'uncommon', label: 'Uncommon', icon: 'star' },
  { id: 'mythical', label: 'Mythical', icon: 'ribbon' },
];

export const PET_CATALOGUE: PetCatalogueEntry[] = [
  // ─── NORMAL PETS (Common Tier) ──────────────────────────────────────────
  {
    id: 'axolotl',
    name: 'Axolotl',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Creative Soul',
    personalityTags: [
      { label: 'Creative', icon: 'edit-3' },
      { label: 'Calm', icon: 'droplet' },
      { label: 'Positive', icon: 'sun' },
    ],
    description: 'A curious and positive buddy for creative and chill souls.',
    badgeLabel: 'CREATIVE',
    accentColor: '#EC4899',
    image: require('@/../assets/images/pets/axolotl.png'),
    isActive: true,
  },
  {
    id: 'penguin',
    name: 'Penguin',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Loyal Friend',
    personalityTags: [
      { label: 'Friendly', icon: 'smile' },
      { label: 'Loyal', icon: 'users' },
      { label: 'Chill', icon: 'coffee' },
    ],
    description: 'A friendly companion for people who value loyalty and meaningful friendships.',
    badgeLabel: 'LOYAL',
    accentColor: '#3B82F6',
    image: require('@/../assets/images/pets/penguin.png'),
    isActive: true,
  },
  {
    id: 'bunny',
    name: 'Bunny',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Sweetheart',
    personalityTags: [
      { label: 'Kind', icon: 'heart' },
      { label: 'Cheerful', icon: 'sun' },
      { label: 'Caring', icon: 'smile' },
    ],
    description: 'A cheerful and caring buddy who loves spreading happiness.',
    badgeLabel: 'SWEET',
    accentColor: '#F472B6',
    image: require('@/../assets/images/pets/bunny.png'),
    isActive: true,
  },
  {
    id: 'deer',
    name: 'Deer',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Gentle Spirit',
    personalityTags: [
      { label: 'Gentle', icon: 'feather' },
      { label: 'Peaceful', icon: 'wind' },
      { label: 'Thoughtful', icon: 'book-open' },
    ],
    description: 'A gentle companion for thoughtful people who appreciate peaceful moments.',
    badgeLabel: 'GENTLE',
    accentColor: '#D97706',
    image: require('@/../assets/images/pets/deer.png'),
    isActive: true,
  },
  {
    id: 'husky',
    name: 'Husky',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Go-Getter',
    personalityTags: [
      { label: 'Adventurous', icon: 'mountain' },
      { label: 'Bold', icon: 'flash' },
      { label: 'Loyal', icon: 'people' },
    ],
    description: 'An energetic and loyal buddy for those who love adventures and new challenges.',
    badgeLabel: 'BOLD',
    accentColor: '#10B981',
    image: require('@/../assets/images/pets/husky.png'),
    heroImage: require('@/../assets/images/pets/husky.png'),
    isActive: true,
  },
  {
    id: 'red_panda',
    name: 'Red Panda',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Adventurer',
    personalityTags: [
      { label: 'Playful', icon: 'smile' },
      { label: 'Clever', icon: 'flash' },
      { label: 'Adventurous', icon: 'mountain' },
    ],
    description: 'A playful adventurer for people who enjoy exploring and trying new things.',
    badgeLabel: 'ADVENTUROUS',
    accentColor: '#EA580C',
    image: require('@/../assets/images/pets/red_panda.png'),
    isActive: true,
  },
  {
    id: 'cat',
    name: 'Cat',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Independent One',
    personalityTags: [
      { label: 'Independent', icon: 'moon' },
      { label: 'Smart', icon: 'cpu' },
      { label: 'Curious', icon: 'search' },
    ],
    description: 'An independent companion for curious minds who enjoy their own space.',
    badgeLabel: 'INDEPENDENT',
    accentColor: '#F59E0B',
    image: require('@/../assets/images/pets/cat.png'),
    isActive: true,
  },
  {
    id: 'fennec',
    name: 'Fennec Fox',
    category: 'normal',
    rarity: 'common',
    characterIdentity: 'The Curious Explorer',
    personalityTags: [
      { label: 'Clever', icon: 'flash' },
      { label: 'Curious', icon: 'search' },
      { label: 'Social', icon: 'people' },
    ],
    description: 'A clever and curious companion for social explorers who love discovering new things.',
    badgeLabel: 'CURIOUS',
    accentColor: '#F59E0B',
    image: require('@/../assets/images/pets/fennec.png'),
    isActive: true,
  },

  // ─── UNCOMMON PETS (Special Tier) ───────────────────────────────────────
  {
    id: 'lunar_fox',
    name: 'Lunar Fox',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Mystical guardian draped in celestial light and star energy.',
    badgeLabel: 'CELESTIAL',
    accentColor: '#38BDF8',
    image: require('@/../assets/images/pets/lunar_fox.png'),
    heroImage: require('@/../assets/images/pets/hero_lunar_fox.png'),
    isActive: true,
  },
  {
    id: 'snow_owl',
    name: 'Snow Owl',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Wise Arctic nocturnal watcher with piercing blue gaze and soft down.',
    badgeLabel: 'WISE',
    accentColor: '#60A5FA',
    image: require('@/../assets/images/pets/snow_owl.png'),
    isActive: true,
  },
  {
    id: 'cloud_cat',
    name: 'Cloud Cat',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Floats gracefully on pastel cumulus clouds with dreamy slumber vibes.',
    badgeLabel: 'DREAMY',
    accentColor: '#C084FC',
    image: require('@/../assets/images/pets/cloud_cat.png'),
    isActive: true,
  },
  {
    id: 'meerkat',
    name: 'Meerkat',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Vigilant lookout scout always checking in on streaks and friendly milestones.',
    badgeLabel: 'VIGILANT',
    accentColor: '#B45309',
    image: require('@/../assets/images/pets/meerkat.png'),
    isActive: true,
  },
  {
    id: 'arctic_wolf',
    name: 'Arctic Wolf',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Pristine frosty wolf adorned with glowing glimmers and quiet strength.',
    badgeLabel: 'RESOLUTE',
    accentColor: '#93C5FD',
    image: require('@/../assets/images/pets/arctic_wolf.png'),
    isActive: true,
  },
  {
    id: 'cherry_deer',
    name: 'Cherry Deer',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Enchanted spring fawn crowned with blooming sakura blossom antlers.',
    badgeLabel: 'BLOOMING',
    accentColor: '#F43F5E',
    image: require('@/../assets/images/pets/cherry_deer.png'),
    isActive: true,
  },
  {
    id: 'glow_turtle',
    name: 'Glow Turtle',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Ancient sea voyager with a radiant jade shell that pulses with calm energy.',
    badgeLabel: 'TRANQUIL',
    accentColor: '#34D399',
    image: require('@/../assets/images/pets/glow_turtle.png'),
    isActive: true,
  },
  {
    id: 'beefox',
    name: 'Beefox',
    category: 'uncommon',
    rarity: 'uncommon',
    description: 'Industrious hybrid with buzzing wings, fuzzy stripes, and cheerful buzz.',
    badgeLabel: 'ENERGETIC',
    accentColor: '#FBBF24',
    image: require('@/../assets/images/pets/beefox.png'),
    isActive: true,
  },

  // ─── MYTHICAL PETS (Legendary Tier) ─────────────────────────────────────
  {
    id: 'dragon',
    name: 'Dragon',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Noble baby emerald dragon radiating warmth, courage, and ancient protection.',
    badgeLabel: 'MYTHIC',
    accentColor: '#10B981',
    image: require('@/../assets/images/pets/dragon.png'),
    isActive: true,
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Eternal ember hatchling glowing with fiery gold plumage and resilient spirit.',
    badgeLabel: 'REBIRTH',
    accentColor: '#F97316',
    image: require('@/../assets/images/pets/phoenix.png'),
    isActive: true,
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Starlight steed with pearlescent spiral horn, spreading purity and joy.',
    badgeLabel: 'PRISMATIC',
    accentColor: '#A855F7',
    image: require('@/../assets/images/pets/unicorn.png'),
    isActive: true,
  },
  {
    id: 'griffin',
    name: 'Griffin',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Proud hybrid of golden lion and majestic sky eagle, fiercely loyal.',
    badgeLabel: 'VALIANT',
    accentColor: '#EAB308',
    image: require('@/../assets/images/pets/griffin.png'),
    isActive: true,
  },
  {
    id: 'moon_cat',
    name: 'Moon Cat',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Twilight feline glowing with cosmic lunar wisps and nebula-filled eyes.',
    badgeLabel: 'COSMIC',
    accentColor: '#8B5CF6',
    image: require('@/../assets/images/pets/moon_cat.png'),
    isActive: true,
  },
  {
    id: 'crystal_wolf',
    name: 'Crystal Wolf',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Shimmering guardian crested with translucent sapphire crystal spines.',
    badgeLabel: 'CRYSTAL',
    accentColor: '#06B6D4',
    image: require('@/../assets/images/pets/crystal_wolf.png'),
    isActive: true,
  },
  {
    id: 'forest_spirit',
    name: 'Forest Spirit',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Gentle woodland guardian crowned with moss, spring blossoms, and flora.',
    badgeLabel: 'NATURE',
    accentColor: '#22C55E',
    image: require('@/../assets/images/pets/forest_spirit.png'),
    isActive: true,
  },
  {
    id: 'celestial_kitsune',
    name: 'Celestial Kitsune',
    category: 'mythical',
    rarity: 'mythical',
    description: 'Legendary multi-tailed fox of the stars with ethereal auroras floating around.',
    badgeLabel: 'ASTRAL',
    accentColor: '#6366F1',
    image: require('@/../assets/images/pets/celestial_kitsune.png'),
    isActive: true,
  },
];

/**
 * Helper to fetch pets filtered by category
 */
export function getPetsByCategory(category: PetCategory): PetCatalogueEntry[] {
  return PET_CATALOGUE.filter((p) => p.category === category && p.isActive);
}

/**
 * Helper to lookup a pet by its unique ID
 */
export function getPetById(id: string): PetCatalogueEntry | undefined {
  return PET_CATALOGUE.find((p) => p.id === id);
}

/**
 * Default pet selection for first-time onboarding
 */
export const DEFAULT_PET_ID = 'husky';

