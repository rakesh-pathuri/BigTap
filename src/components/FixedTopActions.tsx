import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { openNativePhoneApp } from '../utils/nativeLauncher';

const TORCH_OFF_ICON = require('../../assets/torch_off.png');
const TORCH_ON_ICON = require('../../assets/torch_on.png');

/**
 * Top fixed quick actions: Flashlight, Phone, and SOS.
 * Named "Essentials" section with pure squircle icons.
 */
export const FixedTopActions: React.FC = () => {
  const {
    torchOn,
    toggleTorch,
    openModal,
    theme,
    fontScale,
    vibrate,
  } = useLauncher();

  const handleFlashPress = () => {
    vibrate('medium');
    toggleTorch();
  };

  const handlePhonePress = () => {
    vibrate('success');
    openNativePhoneApp().catch(() => {
      openModal('dialpad');
    });
  };

  const handleSOSPress = () => {
    vibrate('heavy');
    openModal('sos');
  };

  return (
    <View style={styles.container}>
      {/* Section Header: Essentials */}
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.textPrimary,
              fontSize: fontScale.sectionTitle * 0.95,
            },
          ]}
        >
          Essentials
        </Text>
      </View>

      <View style={styles.row}>
        {/* 1. Flashlight / Torch: Pure squircle icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleFlashPress}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Flashlight"
          accessibilityRole="button"
        >
          <Image
            source={torchOn ? TORCH_ON_ICON : TORCH_OFF_ICON}
            style={styles.actionSquircle}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 2. Phone Call Button: Matching green squircle */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePhonePress}
          activeOpacity={0.7}
          accessibilityLabel="Open Phone Keypad"
          accessibilityRole="button"
        >
          <View style={[styles.actionSquircle, styles.phoneSquircle]}>
            <Ionicons name="call" size={34} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* 3. SOS Emergency Button: Matching red squircle */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSOSPress}
          activeOpacity={0.7}
          accessibilityLabel="Emergency SOS"
          accessibilityRole="button"
        >
          <View style={[styles.actionSquircle, styles.sosSquircle]}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSquircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  phoneSquircle: {
    backgroundColor: '#16A34A',
  },
  sosSquircle: {
    backgroundColor: '#DC2626',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
