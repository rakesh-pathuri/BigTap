import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DeviceContactPreview,
  FontSizeMode,
  LauncherSettings,
  QuickAppItem,
  SpeedContact,
  ThemeMode,
} from '../types';
import {
  ALL_AVAILABLE_PHONE_APPS,
  INITIAL_CONTACTS,
  INITIAL_QUICK_APPS,
  INITIAL_SETTINGS,
} from '../constants/initialData';
import { FONT_SCALES, FontScale, THEMES, ThemeColors } from '../constants/themes';
import {
  loadStoredApps,
  loadStoredContacts,
  loadStoredSettings,
  saveStoredApps,
  saveStoredContacts,
  saveStoredSettings,
} from '../utils/storage';
import { triggerHaptic } from '../utils/soundFeedback';
import { pickContactPhoto } from '../utils/nativeLauncher';

type ModalType =
  | 'none'
  | 'sos'
  | 'settings'
  | 'callConfirm'
  | 'dialpad'
  | 'calculator'
  | 'youtube'
  | 'exitLauncherConfirm'
  | 'chooseContacts'
  | 'chooseApps';

interface LauncherContextType {
  // State
  contacts: SpeedContact[];
  apps: QuickAppItem[];
  settings: LauncherSettings;
  torchOn: boolean;
  activeModal: ModalType;
  selectedContactForCall: SpeedContact | null;
  theme: ThemeColors;
  fontScale: FontScale;
  isLoading: boolean;

  // Actions
  setTorchOn: (on: boolean) => void;
  toggleTorch: () => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setSelectedContactForCall: (c: SpeedContact | null) => void;

  // Contact actions
  updateContact: (c: SpeedContact) => Promise<void>;
  addContact: (c: Omit<SpeedContact, 'id' | 'order'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleContactEnabled: (id: string) => Promise<void>;
  changeContactPhotoAsync: (id: string) => Promise<boolean>;
  importDeviceContact: (deviceContact: DeviceContactPreview) => Promise<void>;

  // App actions
  toggleAppVisibility: (id: string) => Promise<void>;
  setAppEnabled: (id: string, enabled: boolean) => Promise<void>;
  addCustomApp: (app: Omit<QuickAppItem, 'id' | 'order'>) => Promise<void>;
  updateAllApps: (newApps: QuickAppItem[]) => Promise<void>;
  reorderApps: (appId: string, direction: 'up' | 'down') => Promise<void>;

  // Settings
  updateSettings: (partial: Partial<LauncherSettings>) => Promise<void>;
  setWallpaper: (wallpaperId: string) => Promise<void>;
  setFontSize: (size: FontSizeMode) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  addEmergencyContact: (name: string, phoneNumber: string) => Promise<void>;
  removeEmergencyContact: (id: string) => Promise<void>;
  toggleContactIsEmergency: (contactId: string) => Promise<void>;

  // Feedback
  speak: (text: string) => void;
  vibrate: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

const LauncherContext = createContext<LauncherContextType | null>(null);

export const LauncherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<SpeedContact[]>(INITIAL_CONTACTS);
  const [apps, setApps] = useState<QuickAppItem[]>(INITIAL_QUICK_APPS);
  const [settings, setSettings] = useState<LauncherSettings>(INITIAL_SETTINGS);
  const [torchOn, setTorchOnState] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedContactForCall, setSelectedContactForCall] = useState<SpeedContact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persisted state on startup
  useEffect(() => {
    const init = async () => {
      try {
        const [storedContacts, storedApps, storedSettings] = await Promise.all([
          loadStoredContacts(),
          loadStoredApps(),
          loadStoredSettings(),
        ]);
        setContacts(storedContacts);
        setApps(storedApps);
        setSettings(storedSettings);
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const theme: ThemeColors = THEMES[settings.theme] || THEMES.warm;
  const fontScale: FontScale = FONT_SCALES[settings.fontSize] || FONT_SCALES.large;

  const vibrate = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    triggerHaptic(type, settings.hapticFeedback);
  };

  const speak = (_text: string) => {
    // Voice speech completely removed per user preference
  };

  const setTorchOn = (on: boolean) => {
    setTorchOnState(on);
    vibrate(on ? 'success' : 'light');
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  const openModal = (modal: ModalType) => {
    vibrate('light');
    setActiveModal(modal);
  };

  const closeModal = () => {
    vibrate('light');
    setActiveModal('none');
    setSelectedContactForCall(null);
  };

  const updateContact = async (updated: SpeedContact) => {
    const next = contacts.map((c) => (c.id === updated.id ? updated : c));
    setContacts(next);
    await saveStoredContacts(next);
    vibrate('success');
  };

  const addContact = async (contactData: Omit<SpeedContact, 'id' | 'order'>) => {
    const newContact: SpeedContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      order: contacts.length,
    };
    const next = [...contacts, newContact];
    setContacts(next);
    await saveStoredContacts(next);
    vibrate('success');
  };

  const deleteContact = async (id: string) => {
    const next = contacts.filter((c) => c.id !== id);
    setContacts(next);
    await saveStoredContacts(next);
    vibrate('warning');
  };

  const toggleContactEnabled = async (id: string) => {
    const next = contacts.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setContacts(next);
    await saveStoredContacts(next);
    vibrate('light');
  };

  const changeContactPhotoAsync = async (id: string): Promise<boolean> => {
    const photoUri = await pickContactPhoto();
    if (photoUri) {
      const next = contacts.map((c) =>
        c.id === id ? { ...c, photoUri } : c
      );
      setContacts(next);
      await saveStoredContacts(next);
      vibrate('success');
      return true;
    }
    return false;
  };

  const importDeviceContact = async (deviceContact: DeviceContactPreview) => {
    const exists = contacts.some((c) => c.phoneNumber === deviceContact.phone);
    if (exists) {
      return;
    }

    const newContact: SpeedContact = {
      id: `dev-${Date.now()}`,
      name: deviceContact.name,
      phoneNumber: deviceContact.phone,
      photoUri: deviceContact.imageUri,
      color: '#1A73E8',
      isEmergency: false,
      order: contacts.length,
      enabled: true,
    };

    const next = [...contacts, newContact];
    setContacts(next);
    await saveStoredContacts(next);
    vibrate('success');
  };

  const toggleAppVisibility = async (id: string) => {
    const next = apps.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    setApps(next);
    await saveStoredApps(next);
    vibrate('light');
  };

  const setAppEnabled = async (id: string, enabled: boolean) => {
    const existing = apps.find((a) => a.id === id);
    let next: QuickAppItem[];
    if (existing) {
      next = apps.map((a) => (a.id === id ? { ...a, enabled } : a));
    } else {
      const catalogItem = ALL_AVAILABLE_PHONE_APPS.find((a) => a.id === id);
      if (catalogItem) {
        next = [...apps, { ...catalogItem, enabled, order: apps.length }];
      } else {
        return;
      }
    }
    setApps(next);
    await saveStoredApps(next);
    vibrate('light');
  };

  const addCustomApp = async (appData: Omit<QuickAppItem, 'id' | 'order'>) => {
    const newApp: QuickAppItem = {
      ...appData,
      id: `custom-app-${Date.now()}`,
      order: apps.length,
      enabled: true,
    };
    const next = [...apps, newApp];
    setApps(next);
    await saveStoredApps(next);
    vibrate('success');
  };

  const updateAllApps = async (newApps: QuickAppItem[]) => {
    setApps(newApps);
    await saveStoredApps(newApps);
    vibrate('light');
  };

  const reorderApps = async (appId: string, direction: 'up' | 'down') => {
    const index = apps.findIndex((a) => a.id === appId);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= apps.length) return;

    const newApps = [...apps];
    const temp = newApps[index];
    newApps[index] = newApps[targetIndex];
    newApps[targetIndex] = temp;

    const updated = newApps.map((a, idx) => ({ ...a, order: idx }));
    setApps(updated);
    await saveStoredApps(updated);
    vibrate('light');
  };

  const updateSettings = async (partial: Partial<LauncherSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveStoredSettings(next);
    vibrate('success');
  };

  const setFontSize = async (size: FontSizeMode) => {
    await updateSettings({ fontSize: size });
  };

  const setThemeMode = async (mode: ThemeMode) => {
    await updateSettings({ theme: mode });
  };

  const addEmergencyContact = async (name: string, phoneNumber: string) => {
    const newEmergency = {
      id: `emg-${Date.now()}`,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    };
    const currentList = settings.emergencyContacts || [];
    const nextList = [...currentList, newEmergency];
    await updateSettings({
      emergencyContacts: nextList,
      emergencyNumber: nextList[0].phoneNumber,
      emergencyContactName: nextList[0].name,
    });
  };

  const removeEmergencyContact = async (id: string) => {
    const currentList = settings.emergencyContacts || [];
    const nextList = currentList.filter((e) => e.id !== id);
    await updateSettings({
      emergencyContacts: nextList,
      emergencyNumber: nextList[0]?.phoneNumber || '',
      emergencyContactName: nextList[0]?.name || '',
    });
  };

  const toggleContactIsEmergency = async (contactId: string) => {
    const next = contacts.map((c) =>
      c.id === contactId ? { ...c, isEmergency: !c.isEmergency } : c
    );
    setContacts(next);
    await saveStoredContacts(next);
    vibrate('light');
  };

  const setWallpaper = async (wallpaperId: string) => {
    await updateSettings({ wallpaper: wallpaperId });
    vibrate('light');
  };

  return (
    <LauncherContext.Provider
      value={{
        contacts,
        apps,
        settings,
        torchOn,
        activeModal,
        selectedContactForCall,
        theme,
        fontScale,
        isLoading,
        setTorchOn,
        toggleTorch,
        openModal,
        closeModal,
        setSelectedContactForCall,
        updateContact,
        addContact,
        deleteContact,
        toggleContactEnabled,
        changeContactPhotoAsync,
        importDeviceContact,
        toggleAppVisibility,
        setAppEnabled,
        addCustomApp,
        updateAllApps,
        reorderApps,
        updateSettings,
        setWallpaper,
        setFontSize,
        setThemeMode,
        addEmergencyContact,
        removeEmergencyContact,
        toggleContactIsEmergency,
        speak,
        vibrate,
      }}
    >
      {children}
    </LauncherContext.Provider>
  );
};

export const useLauncher = () => {
  const context = useContext(LauncherContext);
  if (!context) {
    throw new Error('useLauncher must be used within a LauncherProvider');
  }
  return context;
};
