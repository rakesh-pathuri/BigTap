import {
  isPlaceholderPhoneNumber,
  normalizePhoneNumber,
  resolveEmergencyRecipients,
} from '../utils/emergency';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
  PermissionsAndroid: {
    PERMISSIONS: { SEND_SMS: 'android.permission.SEND_SMS' },
    check: jest.fn(),
    request: jest.fn(),
    RESULTS: { GRANTED: 'granted' },
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 12.3456, longitude: 78.9101 },
  }),
  Accuracy: { Balanced: 3 },
}));

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../modules/direct-sms', () => ({
  sendDirectSmsAsync: jest.fn().mockResolvedValue(true),
  setTorchNativeAsync: jest.fn().mockResolvedValue(true),
}));

describe('normalizePhoneNumber', () => {
  it('removes non-dialable formatting characters (spaces, dashes, parens)', () => {
    expect(normalizePhoneNumber('(987) 654-3210')).toBe('9876543210');
    expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('+15551234567');
  });

  it('prepends + to 12-digit numbers starting with 91', () => {
    expect(normalizePhoneNumber('919876543210')).toBe('+919876543210');
  });

  it('strips leading zero from 11-digit numbers', () => {
    expect(normalizePhoneNumber('09876543210')).toBe('9876543210');
  });

  it('preserves valid already formatted numbers', () => {
    expect(normalizePhoneNumber('+919876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('112')).toBe('112');
  });

  it('returns empty string for empty or null inputs', () => {
    expect(normalizePhoneNumber('')).toBe('');
    expect(normalizePhoneNumber(null as unknown as string)).toBe('');
  });
});

describe('isPlaceholderPhoneNumber', () => {
  it('flags phone numbers containing masking characters like X', () => {
    expect(isPlaceholderPhoneNumber('+91 98765 XX123')).toBe(true);
    expect(isPlaceholderPhoneNumber('98765XXXX0')).toBe(true);
    expect(isPlaceholderPhoneNumber('XXX')).toBe(true);
  });

  it('flags numbers with fewer than 3 digits', () => {
    expect(isPlaceholderPhoneNumber('')).toBe(true);
    expect(isPlaceholderPhoneNumber('1')).toBe(true);
    expect(isPlaceholderPhoneNumber('12')).toBe(true);
    expect(isPlaceholderPhoneNumber('--')).toBe(true);
  });

  it('passes genuine phone numbers', () => {
    expect(isPlaceholderPhoneNumber('112')).toBe(false);
    expect(isPlaceholderPhoneNumber('911')).toBe(false);
    expect(isPlaceholderPhoneNumber('+91 98765 43210')).toBe(false);
    expect(isPlaceholderPhoneNumber('9876543210')).toBe(false);
  });
});

describe('resolveEmergencyRecipients', () => {
  it('parses a single string into an EmergencyRecipient list', () => {
    const list = resolveEmergencyRecipients('+919876543210');
    expect(list).toHaveLength(1);
    expect(list[0].phoneNumber).toBe('+919876543210');
  });

  it('filters out placeholders and invalid numbers', () => {
    const list = resolveEmergencyRecipients([
      { name: 'Demo Contact', phoneNumber: '+91 98765 XX123' },
      { name: 'Invalid', phoneNumber: '1' },
      { name: 'Mom', phoneNumber: '+91 98765 43210' },
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Mom');
    expect(list[0].phoneNumber).toBe('+919876543210');
  });

  it('deduplicates identical and formatting-variant phone numbers', () => {
    const list = resolveEmergencyRecipients([
      { name: 'Mom Mobile', phoneNumber: '09876543210' },
      { name: 'Mom Duplicate', phoneNumber: '9876543210' },
      { name: 'Dad', phoneNumber: '+15551234567' },
    ]);
    expect(list).toHaveLength(2);
    expect(list.map((r) => r.phoneNumber)).toEqual(['9876543210', '+15551234567']);
  });

  it('returns empty array when input is empty or has no valid recipients', () => {
    expect(resolveEmergencyRecipients([])).toEqual([]);
    expect(resolveEmergencyRecipients('')).toEqual([]);
  });
});
