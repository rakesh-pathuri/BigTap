import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { useDeviceStatus } from '../utils/deviceStatus';

export const Header: React.FC = () => {
  const { theme, fontScale, openModal, vibrate, settings } = useLauncher();
  const deviceStatus = useDeviceStatus();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const timeString = `${displayHours}:${displayMinutes}`;

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayName = days[currentTime.getDay()];
  const monthName = months[currentTime.getMonth()];
  const dateNum = currentTime.getDate();
  const dateString = `${dayName}, ${monthName} ${dateNum}`;

  const handleSettingsTap = () => {
    vibrate('medium');
    openModal('settings');
  };

  const isWallpaperActive = settings.wallpaper && settings.wallpaper !== 'none';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isWallpaperActive ? 'transparent' : theme.headerBg },
      ]}
    >
      <View style={styles.timeSection}>
        <View style={styles.timeRow}>
          <Text
            style={[
              styles.timeText,
              {
                color: theme.textPrimary,
                fontSize: fontScale.time,
              },
            ]}
          >
            {timeString}
          </Text>
          <Text
            style={[
              styles.ampmText,
              {
                color: theme.textSecondary,
                fontSize: fontScale.time * 0.38,
              },
            ]}
          >
            {ampm}
          </Text>
        </View>

        <Text
          style={[
            styles.dateText,
            {
              color: theme.textSecondary,
              fontSize: fontScale.date,
            },
          ]}
        >
          {dateString}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.settingsIconButton}
          onPress={handleSettingsTap}
          activeOpacity={0.65}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={28} color={theme.textPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.batteryChipHorizontal,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Ionicons
            name={
              deviceStatus.isCharging
                ? 'battery-charging'
                : deviceStatus.batteryLevel > 70
                ? 'battery-full'
                : deviceStatus.batteryLevel > 20
                ? 'battery-half'
                : 'battery-dead'
            }
            size={16}
            color={deviceStatus.batteryLevel <= 20 ? theme.danger : theme.textPrimary}
          />
          <Text
            style={[
              styles.batteryNumber,
              {
                color: deviceStatus.batteryLevel <= 20 ? theme.danger : theme.textPrimary,
                fontSize: fontScale.caption * 1.05,
              },
            ]}
          >
            {deviceStatus.batteryLevel}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  timeSection: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeText: {
    fontWeight: '700',
    letterSpacing: -1,
  },
  ampmText: {
    fontWeight: '600',
    marginLeft: 6,
  },
  dateText: {
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 2,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryChipHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
    gap: 4,
  },
  batteryNumber: {
    fontWeight: '700',
  },
});
