import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import { sendDirectSmsAsync } from '../../modules/direct-sms';

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

export const normalizePhoneNumber = (rawNumber: string): string => {
  if (!rawNumber) return '';
  // 1. Replace placeholder masking 'X' with '0' for safe dialer formatting
  let cleaned = rawNumber.replace(/X/gi, '0').replace(/[^0-9+*#]/g, '');

  // 2. If it's a 12-digit number starting with 91 without '+' (e.g. 919876543210), prepend '+'
  // Otherwise Indian carriers treat 91 as an invalid STD trunk code and say 'out of coverage area'
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = `+${cleaned}`;
  }

  // 3. If it's an 11-digit number starting with 0 (e.g. 09876543210), strip the trunk '0'
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
};

/**
 * Opens phone call cleanly using the native system Phone app.
 * Uses DIAL intent so no dangerous CALL_PHONE permissions or dialer conflicts are created.
 */
export const makePhoneCall = async (phoneNumber: string): Promise<boolean> => {
  if (!phoneNumber) return false;
  const cleanNumber = normalizePhoneNumber(phoneNumber);
  if (!cleanNumber) return false;

  const url = `tel:${cleanNumber}`;

  // 1. Cross-platform universal phone dialer launch via React Native Linking (never hangs)
  try {
    const supported = await Linking.canOpenURL(url).catch(() => true);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
  } catch (err) {
    console.warn('Linking openURL error:', err);
  }

  // 2. Direct intent launcher dial fallback
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
  callInitiated: boolean;
  locationString?: string;
  recipientSummary: string;
  error?: string;
}

export const dispatchEmergencyAlert = async (
  recipientsInput: EmergencyRecipient[] | string,
  baseMessage: string
): Promise<EmergencyResult> => {
  // Normalize recipients array
  const recipients: EmergencyRecipient[] = Array.isArray(recipientsInput)
    ? recipientsInput.filter((r) => r && r.phoneNumber)
    : recipientsInput
    ? [{ name: 'Emergency Contact', phoneNumber: recipientsInput }]
    : [];

  let locationUrl: string | null = null;
  try {
    locationUrl = await getGPSLocation();
  } catch {
    // Location failed, proceed with alert anyway
  }

  const fullMessage = locationUrl
    ? `${baseMessage}\n\nEmergency GPS Location:\n${locationUrl}`
    : `${baseMessage}\n\n(GPS location could not be determined)`;

  let directSentCount = 0;
  const phonesToFallback: string[] = [];

  // 1. Send automatic background SMS to all recipients without user interaction
  for (const recipient of recipients) {
    const cleanPhone = normalizePhoneNumber(recipient.phoneNumber);
    if (!cleanPhone) continue;

    try {
      const sentDirect = await sendDirectSmsAsync(cleanPhone, fullMessage);
      if (sentDirect) {
        directSentCount++;
      } else {
        phonesToFallback.push(cleanPhone);
      }
    } catch {
      phonesToFallback.push(cleanPhone);
    }
  }

  // 2. If native direct SMS wasn't available, trigger standard fallback via SMS URL
  if (directSentCount === 0 && phonesToFallback.length > 0) {
    try {
      const separator = Platform.OS === 'ios' ? '&' : '?';
      const smsUrl = `sms:${phonesToFallback.join(',')}${separator}body=${encodeURIComponent(fullMessage)}`;
      await Linking.openURL(smsUrl);
      directSentCount = phonesToFallback.length;
    } catch (err) {
      console.warn('SMS dispatch error:', err);
    }
  }

  // 3. Auto-dial the primary emergency contact
  const primaryPhone = recipients.length > 0 ? recipients[0].phoneNumber : '';
  const callInitiated = primaryPhone ? await makePhoneCall(primaryPhone) : false;

  const namesList = recipients
    .map((r) => r.name || r.phoneNumber)
    .filter(Boolean)
    .join(', ');

  return {
    success: directSentCount > 0 || callInitiated,
    smsSent: directSentCount > 0,
    smsSentCount: directSentCount,
    totalRecipients: recipients.length,
    callInitiated,
    locationString: locationUrl || undefined,
    recipientSummary: namesList || 'Emergency Services',
  };
};
