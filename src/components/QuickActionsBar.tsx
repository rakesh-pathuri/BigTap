import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { QuickAppItem } from '../types';
import { launchExternalApp, openNativePhoneApp } from '../utils/nativeLauncher';

const TORCH_OFF_ICON = require('../../assets/torch_off.png');
const TORCH_ON_ICON = require('../../assets/torch_on.png');

export const QuickActionsBar: React.FC = () => {
  const {
    apps,
    theme,
    fontScale,
    torchOn,
    toggleTorch,
    openModal,
    vibrate,
  } = useLauncher();

  const handleAppPress = (item: QuickAppItem) => {
    vibrate('medium');

    switch (item.actionType) {
      case 'torch':
        toggleTorch();
        break;

      case 'sos':
        openModal('sos');
        break;

      case 'phone':
      case 'dialpad':
        openNativePhoneApp();
        break;

      case 'youtube':
        openModal('youtube');
        break;



      case 'whatsapp':
        launchExternalApp('whatsapp');
        break;

      case 'camera':
        launchExternalApp('camera');
        break;

      case 'gallery':
        launchExternalApp('gallery');
        break;

      case 'messages':
        launchExternalApp('messages');
        break;

      case 'browser':
        launchExternalApp('browser');
        break;
    }
  };

  const enabledApps = apps.filter((a) => a.enabled);

  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.textPrimary,
              fontSize: fontScale.sectionTitle * 0.9,
            },
          ]}
        >
          Apps
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {enabledApps.map((item) => {
          const isTorch = item.actionType === 'torch';
          const isSOS = item.actionType === 'sos';

          let iconBg = item.bgColor;
          let iconColor = '#FFFFFF';

          if (isSOS) {
            iconBg = '#D93025';
          }

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.appIconWrapper}
              onPress={() => handleAppPress(item)}
              activeOpacity={0.7}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              {isTorch ? (
                /* User-provided custom squircle flashlight icon */
                <Image
                  source={torchOn ? TORCH_ON_ICON : TORCH_OFF_ICON}
                  style={styles.torchImage}
                  resizeMode="contain"
                />
              ) : (
                /* Standard circular app icons without cards */
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: iconBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={iconColor}
                  />
                </View>
              )}

              {/* Title below icon */}
              <Text
                style={[
                  styles.appTitle,
                  {
                    color: isTorch && torchOn ? '#E37400' : theme.textPrimary,
                    fontSize: fontScale.caption * 1.05,
                    fontWeight: isTorch && torchOn ? '800' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {isTorch && torchOn ? 'Torch On' : item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 16,
  },
  appIconWrapper: {
    alignItems: 'center',
    width: 72,
  },
  torchImage: {
    width: 62,
    height: 62,
    borderRadius: 18,
    marginBottom: 6,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  appTitle: {
    textAlign: 'center',
  },
});
