import { ActivityCatalogueEntry } from '@/types/activity';

export const DEFAULT_ACTIVITY_ID = 'gym';

/**
 * Red Panda Activity Catalogue.
 * 
 * Maps each activity to its supplied landscape illustration.
 * Configured with icons matching the approved reference design.
 */
export const RED_PANDA_ACTIVITIES: ActivityCatalogueEntry[] = [
  {
    id: 'gym',
    name: 'Gym',
    icon: 'barbell-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/red_panda/gym.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'wellness',
  },
  {
    id: 'movie',
    name: 'Watching a Movie',
    icon: 'play-circle',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/red_panda/movie.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: 'game-controller-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/red_panda/gaming.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'bored',
    name: "I'm Bored",
    icon: 'frown',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/red_panda/bored.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'studying',
    name: 'Studying',
    icon: 'book-open',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/red_panda/studying.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'study',
  },
  {
    id: 'sleeping',
    name: 'Sleeping',
    icon: 'moon',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/red_panda/sleeping.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'wellness',
  },
  {
    id: 'eating',
    name: 'Eating',
    icon: 'restaurant-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/red_panda/eating.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'wellness',
  },
  {
    id: 'music',
    name: 'Listening to Music',
    icon: 'headphones',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/red_panda/music.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'attending_classes',
    name: 'Attending Classes',
    icon: 'school-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/red_panda/attending_classes.png'),
    petId: 'red_panda',
    isAvailable: true,
    category: 'study',
  },
];

/**
 * Penguin Activity Catalogue.
 * 
 * Maps each activity to its supplied landscape illustration.
 * Configured with icons matching the approved reference design.
 */
export const PENGUIN_ACTIVITIES: ActivityCatalogueEntry[] = [
  {
    id: 'gym',
    name: 'Gym',
    icon: 'barbell-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/penguin/gym.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'wellness',
  },
  {
    id: 'movie',
    name: 'Watching a Movie',
    icon: 'play-circle',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/penguin/movie.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: 'game-controller-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/penguin/gaming.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'bored',
    name: "I'm Bored",
    icon: 'frown',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/penguin/bored.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'studying',
    name: 'Studying',
    icon: 'book-open',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/penguin/studying.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'study',
  },
  {
    id: 'sleeping',
    name: 'Sleeping',
    icon: 'moon',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/penguin/sleeping.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'wellness',
  },
  {
    id: 'eating',
    name: 'Eating',
    icon: 'restaurant-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/penguin/eating.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'wellness',
  },
  {
    id: 'music',
    name: 'Listening to Music',
    icon: 'headphones',
    iconFamily: 'feather',
    image: require('@/../assets/images/activities/penguin/music.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'leisure',
  },
  {
    id: 'attending_classes',
    name: 'Attending Classes',
    icon: 'school-outline',
    iconFamily: 'ionicons',
    image: require('@/../assets/images/activities/penguin/attending_classes.jpg'),
    petId: 'penguin',
    isAvailable: true,
    category: 'study',
  },
];

/**
 * Returns available activities dynamically for a given pet ID.
 * Ensures pet-specific assets are loaded without cross-contamination.
 */
export function getActivitiesForPet(petId: string = 'red_panda'): ActivityCatalogueEntry[] {
  const normalized = petId.toLowerCase().trim();
  if (normalized === 'penguin') {
    return PENGUIN_ACTIVITIES;
  }
  // Default to Red Panda activities for red_panda and any companion with Red Panda assets
  return RED_PANDA_ACTIVITIES;
}

/**
 * Reports which activity illustrations are missing for a given pet.
 */
export function getMissingAssetsForPet(petId: string): string[] {
  const activities = getActivitiesForPet(petId);
  return activities.filter((a) => !a.image).map((a) => a.name);
}
