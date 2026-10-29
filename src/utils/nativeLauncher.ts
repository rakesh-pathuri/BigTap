import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Contacts from 'expo-contacts/legacy';
import * as ImagePicker from 'expo-image-picker';
import { DeviceContactPreview } from '../types';

/**
 * Exits the Ease Launcher to the device's default home screen or opens
 * Android's Default Home App chooser so the caregiver/user can use the rest of the phone.
 */
export const exitToStandardLauncher = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // 1. Open Android Home Settings so the user can choose standard launcher
      try {
        await IntentLauncher.startActivityAsync('android.settings.HOME_SETTINGS');
        return true;
      } catch {}

      // 2. Fallback to manage default apps
      try {
        await IntentLauncher.startActivityAsync('android.settings.MANAGE_DEFAULT_APPS_SETTINGS');
        return true;
      } catch {}

      // 3. Fallback to App Details page where user can tap 'Clear Defaults' or 'Set as Default'
      try {
        await IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
          data: 'package:com.ease.seniorlauncher',
        });
        return true;
      } catch {}

      // 4. Fallback to general settings
      try {
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SETTINGS);
        return true;
      } catch {}
    } else {
      // On iOS or Web, open system settings or show alert
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
        return true;
      }
    }
  } catch (err) {
    console.warn('Exit launcher error:', err);
  }
  return false;
};

/**
 * Opens general device settings (Wi-Fi, Bluetooth, Sound, Display).
 */
export const openDeviceSettings = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.SETTINGS
      );
      return true;
    } else if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
      return true;
    }
  } catch (err) {
    console.warn('Open device settings error:', err);
  }
  return false;
};

/**
 * Fetches contacts from the phone's existing contact book.
 */
export const fetchDeviceContacts = async (): Promise<DeviceContactPreview[]> => {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
            Contacts.Fields.Name,
          ],
          sort: Contacts.SortTypes.FirstName,
        });

        if (data && data.length > 0) {
          const formatted: DeviceContactPreview[] = [];
          for (const c of data) {
            const phone = c.phoneNumbers?.[0]?.number;
            if (phone && c.name) {
              formatted.push({
                id: c.id || `dev-${Math.random()}`,
                name: c.name,
                phone: phone,
                hasImage: !!c.imageAvailable && !!c.image?.uri,
                imageUri: c.image?.uri,
              });
            }
          }
          if (formatted.length > 0) {
            return formatted;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Device contacts fetch error:', err);
  }

  return [];
};

/**
 * Opens image picker to select or photograph a photo for a contact.
 */
export const pickContactPhoto = async (): Promise<string | null> => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
  } catch (err) {
    console.warn('Image picker error:', err);
  }
  return null;
};

/**
 * Launches external native applications by intent, package name, or URL.
 */
export const launchExternalApp = async (
  type: string,
  packageName?: string
): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // 1. Try launching by package name if provided
      if (packageName) {
        try {
          IntentLauncher.openApplication(packageName);
          return true;
        } catch {
          // Fall through to intent or URL
        }
      }

      // 2. Specific intent actions on Android
      switch (type) {
        case 'camera':
          try {
            await IntentLauncher.startActivityAsync(
              'android.media.action.STILL_IMAGE_CAMERA'
            );
            return true;
          } catch {}
          break;
        case 'gallery':
          try {
            await IntentLauncher.startActivityAsync(
              'android.intent.action.VIEW',
              { type: 'image/*' }
            );
            return true;
          } catch {}
          break;
        case 'clock':
          try {
            await IntentLauncher.startActivityAsync(
              'android.intent.action.SHOW_ALARMS'
            );
            return true;
          } catch {}
          break;
        case 'messages':
          try {
            await IntentLauncher.startActivityAsync(
              'android.intent.action.MAIN',
              { category: 'android.intent.category.APP_MESSAGING' }
            );
            return true;
          } catch {}
          break;
        case 'calculator':
          return await launchCalculatorApp();
      }
    }

    // 3. Fallback URL schemes
    let url = '';
    switch (type) {
      case 'youtube':
        url = 'https://www.youtube.com';
        break;
      case 'whatsapp':
        url = 'whatsapp://app';
        break;
      case 'messages':
        url = 'sms:';
        break;
      case 'browser':
        url = 'https://www.google.com';
        break;
      case 'gmail':
        url = 'mailto:';
        break;
      case 'maps':
        url = 'https://maps.google.com';
        break;
    }

    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen || Platform.OS === 'web') {
        await Linking.openURL(url);
        return true;
      }
    }
  } catch (err) {
    console.warn(`Failed to launch external app ${type}:`, err);
  }
  return false;
};

/**
 * Attempts to launch the device's native Calculator app across standard Android vendors
 * (Google, Samsung, Xiaomi, Oppo, Vivo, Huawei).
 */
export const launchCalculatorApp = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // 1. Try generic Android calculator intent
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          category: 'android.intent.category.APP_CALCULATOR',
        });
        return true;
      } catch {}

      // 2. Try common Android calculator packages across phone makers
      const calculatorPackages = [
        'com.google.android.calculator',
        'com.sec.android.app.popupcalculator',
        'com.miui.calculator',
        'com.coloros.calculator',
        'com.oneplus.calculator',
        'com.vivo.calculator',
        'com.huawei.calculator',
        'com.android.calculator2',
      ];

      for (const pkg of calculatorPackages) {
        try {
          IntentLauncher.openApplication(pkg);
          return true;
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Native calculator launch error:', err);
  }
  return false;
};

/**
 * Opens the device's real native Phone dialer application.
 */
export const openNativePhoneApp = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.DIAL');
        return true;
      } catch {
        await Linking.openURL('tel:');
        return true;
      }
    } else {
      await Linking.openURL('tel:');
      return true;
    }
  } catch (err) {
    console.warn('Failed to open native phone app:', err);
  }
  return false;
};
