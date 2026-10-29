import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { QuickAppItem } from '../types';
import { launchCalculatorApp, launchExternalApp } from '../utils/nativeLauncher';

export const AppsGrid: React.FC = () => {
  const {
    apps,
    theme,
    fontScale,
    openModal,
    vibrate,
  } = useLauncher();

  const handleAppPress = async (item: QuickAppItem) => {
    vibrate('medium');

    switch (item.actionType) {
      case 'calculator': {
        const opened = await launchCalculatorApp();
        if (!opened) {
          openModal('calculator');
        }
        break;
      }

      case 'youtube':
        openModal('youtube');
        break;

      default:
        launchExternalApp(item.actionType, item.packageName);
        break;
    }
  };

  const handleAddAppPress = () => {
    vibrate('medium');
    openModal('chooseApps');
  };

  // Filter to enabled grid apps (excluding fixed top row actions)
  const enabledApps = apps.filter(
    (a) =>
      a.enabled &&
      a.actionType !== 'torch' &&
      a.actionType !== 'sos' &&
      a.actionType !== 'phone'
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
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
          Apps
        </Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddAppPress}
          activeOpacity={0.7}
          accessibilityLabel="Add or customize apps"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Grid of pure squircle icons (no card boxes, no titles below) */}
      <View style={styles.grid}>
        {enabledApps.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.iconWrapper}
              onPress={() => handleAppPress(item)}
              activeOpacity={0.72}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconSquircle,
                  {
                    backgroundColor: item.bgColor,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={32}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Pure squircle "+ Add App" button */}
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={handleAddAppPress}
          activeOpacity={0.72}
          accessibilityLabel="Add phone app"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.iconSquircle,
              styles.addIconSquircle,
              {
                borderColor: theme.accent,
                backgroundColor: theme.accentBg,
              },
            ]}
          >
            <Ionicons name="add" size={32} color={theme.accent} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 20,
  },
  iconWrapper: {
    width: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  addIconSquircle: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
});
