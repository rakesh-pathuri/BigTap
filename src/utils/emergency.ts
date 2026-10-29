import { Linking, PermissionsAndroid, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import { sendDirectSmsAsync } from '../../modules/direct-sms';

export const isPlaceholderPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return true;
  return /x/i.test(phone) || phone.replace(/[^0-9]/g, '').length < 3;
};

export const normalizePhoneNumber = (rawNumber: string): string => {
  if (!rawNumber) return '';
  let cleaned = rawNumber.replace(/[^0-9+*#]/g, '');

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = `+${cleaned}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
};

export const requestSmsPermissionAsync = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.SEND_SMS
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: 'SMS Permission Required',
        message:
          'BigTap needs permission to send emergency SMS alerts with your GPS location to your family.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Failed to request SEND_SMS permission:', err);
    return false;
  }
};

export const getGPSLocation = async (): Promise<string | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    if (loc && loc.coords) {
      const { latitude, longitude } = loc.coords;
      return `https://maps.google.com/?q=${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    }
  } catch (err) {
    console.warn('GPS location lookup error:', err);
  }
  return null;
};

export const makePhoneCall = async (phoneNumber: string): Promise<boolean> => {
  if (!phoneNumber) return false;
  const cleanNumber = normalizePhoneNumber(phoneNumber);
  if (!cleanNumber) return false;

  const url = `tel:${cleanNumber}`;

  try {
    const supported = await Linking.canOpenURL(url).catch(() => true);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
  } catch (err) {
    console.warn('Linking openURL error:', err);
  }

  if (Platform.OS === 'android') {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.DIAL', {
        data: url,
      });
      return true;
    } catch {}
  }

  return false;
};

export interface EmergencyRecipient {
  name?: string;
  phoneNumber: string;
}

export interface EmergencyResult {
  success: boolean;
  smsSent: boolean;
  smsSentCount: number;
  totalRecipients: number;
  locationString?: string;
  recipientSummary: string;
  error?: string;
}

export const resolveEmergencyRecipients = (
  recipientsInput: EmergencyRecipient[] | string
): EmergencyRecipient[] => {
  const rawList: EmergencyRecipient[] = Array.isArray(recipientsInput)
    ? recipientsInput.filter((r) => r && r.phoneNumber)
    : recipientsInput
    ? [{ name: 'Emergency Contact', phoneNumber: recipientsInput }]
    : [];

  const seen = new Set<string>();
  const valid: EmergencyRecipient[] = [];

  for (const item of rawList) {
    if (!item.phoneNumber || isPlaceholderPhoneNumber(item.phoneNumber)) {
      continue;
    }
    const clean = normalizePhoneNumber(item.phoneNumber);
    if (!clean || seen.has(clean)) {
      continue;
    }
    seen.add(clean);
    valid.push({
      ...item,
      phoneNumber: clean,
    });
  }

  return valid;
};

export const dispatchEmergencyAlert = async (
  recipientsInput: EmergencyRecipient[] | string,
  baseMessage: string
): Promise<EmergencyResult> => {
  const validRecipients = resolveEmergencyRecipients(recipientsInput);

  if (validRecipients.length === 0) {
    return {
      success: false,
      smsSent: false,
      smsSentCount: 0,
      totalRecipients: 0,
      recipientSummary: 'No Contacts',
      error: 'No emergency contacts configured. Please set them in Settings.',
    };
  }

  let locationUrl: string | null = null;
  try {
    locationUrl = await getGPSLocation();
  } catch {}

  const fullMessage = locationUrl
    ? `${baseMessage}\n\nEmergency GPS Location:\n${locationUrl}`
    : `${baseMessage}\n\n(GPS location could not be determined)`;

  const hasSmsPermission = await requestSmsPermissionAsync();

  let directSentCount = 0;
  const phonesToFallback: string[] = [];

  for (const recipient of validRecipients) {
    const cleanPhone = normalizePhoneNumber(recipient.phoneNumber);
    if (!cleanPhone) continue;

    if (hasSmsPermission) {
      try {
        const sent = await sendDirectSmsAsync(cleanPhone, fullMessage);
        if (sent) {
          directSentCount++;
        } else {
          phonesToFallback.push(cleanPhone);
        }
      } catch {
        phonesToFallback.push(cleanPhone);
      }
    } else {
      phonesToFallback.push(cleanPhone);
    }
  }

  // Fallback to opening SMS composer if direct background SMS fails or lacks permission
  if (directSentCount === 0 && phonesToFallback.length > 0) {
    try {
      const separator = Platform.OS === 'ios' ? '&' : '?';
      const smsUrl = `sms:${phonesToFallback.join(',')}${separator}body=${encodeURIComponent(fullMessage)}`;
      await Linking.openURL(smsUrl);
      directSentCount = phonesToFallback.length;
    } catch (err) {
      console.warn('SMS fallback error:', err);
    }
  }

  const namesList = validRecipients
    .map((r) => r.name || r.phoneNumber)
    .filter(Boolean)
    .join(', ');

  return {
    success: directSentCount > 0,
    smsSent: directSentCount > 0,
    smsSentCount: directSentCount,
    totalRecipients: validRecipients.length,
    locationString: locationUrl || undefined,
    recipientSummary: namesList || 'Emergency Contact',
  };
};
