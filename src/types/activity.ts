import { ImageSourcePropType } from 'react-native';

/**
 * Activity definition in the master catalogue.
 */
export interface ActivityCatalogueEntry {
  id: string;
  name: string;
  description?: string;
  image: any;
  petId: string;
  isAvailable: boolean;
  category?: 'study' | 'leisure' | 'social' | 'wellness';
  icon?: string;
  iconFamily?: 'ionicons' | 'feather';
}

/**
 * Response shape for activity persistence operations.
 */
export interface SaveActivityResult {
  success: boolean;
  syncedWithDb: boolean;
  activityId: string;
  error?: string;
}
