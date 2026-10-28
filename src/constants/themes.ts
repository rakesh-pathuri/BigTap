import { FontSizeMode, ThemeMode } from '../types';

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentText: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  success: string;
  successBg: string;
  headerBg: string;
  modalBg: string;
  modalOverlay: string;
  toggleActive: string;
  toggleInactive: string;
  statusBar: 'light' | 'dark';
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  warm: {
    // Google Material Light (Dignified, clean, high-contrast)
    background: '#F8F9FA',
    card: '#FFFFFF',
    cardBorder: '#E0E3E7',
    textPrimary: '#202124',
    textSecondary: '#3C4043',
    textMuted: '#5F6368',
    accent: '#1A73E8',
    accentBg: '#E8F0FE',
    accentText: '#174EA6',
    danger: '#D93025',
    dangerBg: '#FCE8E6',
    warning: '#E37400',
    warningBg: '#FEF7E0',
    success: '#1E8E3E',
    successBg: '#E6F4EA',
    headerBg: '#FFFFFF',
    modalBg: '#FFFFFF',
    modalOverlay: 'rgba(32, 33, 36, 0.72)',
    toggleActive: '#1A73E8',
    toggleInactive: '#DADCE0',
    statusBar: 'dark',
  },
  dark: {
    // Google Material Dark (Pure dark, elegant slate)
    background: '#121212',
    card: '#1E1E1E',
    cardBorder: '#2E2E2E',
    textPrimary: '#E8EAED',
    textSecondary: '#BDC1C6',
    textMuted: '#9AA0A6',
    accent: '#8AB4F8',
    accentBg: '#1E3A5F',
    accentText: '#D2E3FC',
    danger: '#F28B82',
    dangerBg: '#5C1D18',
    warning: '#FDD663',
    warningBg: '#4E3800',
    success: '#81C995',
    successBg: '#0D522C',
    headerBg: '#1E1E1E',
    modalBg: '#1E1E1E',
    modalOverlay: 'rgba(0, 0, 0, 0.88)',
    toggleActive: '#8AB4F8',
    toggleInactive: '#3C4043',
    statusBar: 'light',
  },
};

export interface FontScale {
  time: number;
  date: number;
  greeting: number;
  sectionTitle: number;
  contactName: number;
  contactSubtitle: number;
  buttonLabel: number;
  body: number;
  caption: number;
  iconSize: number;
}

export const FONT_SCALES: Record<FontSizeMode, FontScale> = {
  normal: {
    time: 46,
    date: 18,
    greeting: 16,
    sectionTitle: 20,
    contactName: 20,
    contactSubtitle: 15,
    buttonLabel: 16,
    body: 17,
    caption: 13,
    iconSize: 30,
  },
  large: {
    time: 54,
    date: 21,
    greeting: 18,
    sectionTitle: 23,
    contactName: 22,
    contactSubtitle: 17,
    buttonLabel: 18,
    body: 20,
    caption: 15,
    iconSize: 36,
  },
  xlarge: {
    time: 62,
    date: 24,
    greeting: 21,
    sectionTitle: 26,
    contactName: 25,
    contactSubtitle: 19,
    buttonLabel: 21,
    body: 23,
    caption: 17,
    iconSize: 42,
  },
};
