import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_CONTACTS, INITIAL_QUICK_APPS, INITIAL_SETTINGS } from '../constants/initialData';
import { LauncherSettings, QuickAppItem, SpeedContact } from '../types';

const CONTACTS_KEY = '@bigtap_contacts_v1';
const APPS_KEY = '@bigtap_apps_v1';
const SETTINGS_KEY = '@bigtap_settings_v1';

export const loadStoredContacts = async (): Promise<SpeedContact[]> => {
  try {
    const raw = await AsyncStorage.getItem(CONTACTS_KEY);
    if (!raw) return INITIAL_CONTACTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CONTACTS;
  } catch (err) {
    console.warn('Failed to load contacts from storage:', err);
    return INITIAL_CONTACTS;
  }
};

export const saveStoredContacts = async (contacts: SpeedContact[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.warn('Failed to save contacts:', err);
  }
};

export const loadStoredApps = async (): Promise<QuickAppItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(APPS_KEY);
    if (!raw) return INITIAL_QUICK_APPS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure fixed top row actions (torch, sos, phone) are not duplicated in grid
      const gridApps = parsed.filter(
        (a: QuickAppItem) =>
          a.actionType !== 'torch' &&
          a.actionType !== 'sos' &&
          a.actionType !== 'phone' &&
          a.actionType !== 'dialpad'
      );
      return gridApps.length > 0 ? gridApps : INITIAL_QUICK_APPS;
    }
    return INITIAL_QUICK_APPS;
  } catch (err) {
    console.warn('Failed to load apps from storage:', err);
    return INITIAL_QUICK_APPS;
  }
};

export const saveStoredApps = async (apps: QuickAppItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(APPS_KEY, JSON.stringify(apps));
  } catch (err) {
    console.warn('Failed to save apps:', err);
  }
};

export const loadStoredSettings = async (): Promise<LauncherSettings> => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load settings:', err);
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = async (settings: LauncherSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings:', err);
  }
};
