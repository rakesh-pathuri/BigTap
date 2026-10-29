export type FontSizeMode = 'normal' | 'large' | 'xlarge';

export type ThemeMode = 'warm' | 'dark';

export interface SpeedContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship?: string;
  photoUri?: string;
  color?: string;
  isEmergency?: boolean;
  order: number;
  enabled: boolean;
}

export type QuickAppAction =
  | 'torch'
  | 'sos'
  | 'phone'
  | 'youtube'
  | 'whatsapp'
  | 'camera'
  | 'dialpad'
  | 'messages'
  | 'gallery'
  | 'browser'
  | 'gmail'
  | 'maps'
  | 'clock'
  | 'calculator'
  | 'weather'
  | 'custom';

export interface QuickAppItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  bgColor: string;
  textColor: string;
  actionType: QuickAppAction;
  packageName?: string;
  category?: 'communication' | 'media' | 'utility' | 'tools';
  enabled: boolean;
  order: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface LauncherSettings {
  fontSize: FontSizeMode;
  theme: ThemeMode;
  hapticFeedback: boolean;
  emergencyNumber: string;
  emergencyContactName: string;
  emergencyContacts: EmergencyContact[];
  emergencyMessage: string;
  wallpaper?: string;
}

export interface DeviceContactPreview {
  id: string;
  name: string;
  phone: string;
  hasImage: boolean;
  imageUri?: string;
}
