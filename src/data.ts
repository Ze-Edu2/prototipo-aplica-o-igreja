import { 
  Member, Announcement, Event, Study, PrayerRequest, 
  FinanceTransaction, PhotoAlbum, Photo, PushNotification, Settings 
} from "./types";

// Helper keys for LocalStorage
export const KEYS = {
  CURRENT_USER: 'church_current_user_v2',
  MEMBERS: 'church_members_v2',
  ANNOUNCEMENTS: 'church_announcements_v2',
  EVENTS: 'church_events_v2',
  STUDIES: 'church_studies_v2',
  PRAYERS: 'church_prayers_v2',
  FINANCE: 'church_finance_v2',
  ALBUMS: 'church_albums_v2',
  PHOTOS: 'church_photos_v2',
  NOTIFICATIONS: 'church_notifications_v2',
  SETTINGS: 'church_settings_v2'
};

// Initial Core Data
export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_EVENTS: Event[] = [];

export const INITIAL_STUDIES: Study[] = [];

export const INITIAL_PRAYERS: PrayerRequest[] = [];

export const INITIAL_FINANCE: FinanceTransaction[] = [];

export const INITIAL_ALBUMS: PhotoAlbum[] = [];

export const INITIAL_PHOTOS: Photo[] = [];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [];

export const INITIAL_SETTINGS: Settings = {
  whatsappPhone: "",
  whatsappApiKey: "",
  nativeNotificationsEnabled: false
};

/**
 * Loads specific key from Local Storage with structured fallback
 */
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(val) as T;
  } catch (e) {
    console.warn(`Erro ao ler localStorage para key ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Persists data to Local Storage helper
 */
export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erro ao escrever no localStorage para key ${key}:`, e);
  }
}
