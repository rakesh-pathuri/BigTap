import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LauncherProvider, useLauncher } from './src/context/LauncherContext';
import { Header } from './src/components/Header';
import { FixedTopActions } from './src/components/FixedTopActions';
import { PhotoContacts } from './src/components/PhotoContacts';
import { AppsGrid } from './src/components/AppsGrid';
import { CallConfirmModal } from './src/components/CallConfirmModal';
import { SOSModal } from './src/components/SOSModal';
import { DialpadModal } from './src/components/DialpadModal';
import { CalculatorModal } from './src/components/CalculatorModal';
import { YouTubeModal } from './src/components/YouTubeModal';
import { ChooseContactsModal } from './src/components/ChooseContactsModal';
import { ChooseAppsModal } from './src/components/ChooseAppsModal';
import { SettingsModal } from './src/components/SettingsModal';
import { IncomingCallModal } from './src/components/IncomingCallModal';
import { NativeTorchController } from './src/components/NativeTorchController';

const MainScreen: React.FC = () => {
  const { theme } = useLauncher();

  // Ensures the Android system top status bar (signal, wifi, battery) is never blocked or overlapped
  const androidTopInset = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.headerBg,
          paddingTop: androidTopInset,
        },
      ]}
    >
      <StatusBar style={theme.statusBar === 'dark' ? 'dark' : 'light'} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header: Time, Date, Battery %, Signal & Settings */}
        <Header />

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Fixed Quick Actions: Flashlight, Phone, SOS (Permanently pinned) */}
          <FixedTopActions />

          {/* Photo Contacts Speed-Dial Section */}
          <PhotoContacts />

          {/* Installed Phone Apps Grid (2 or 3 columns below contacts) */}
          <AppsGrid />
        </ScrollView>

        {/* Background hardware torch controller on Android */}
        <NativeTorchController />

        {/* Action Modals */}
        <CallConfirmModal />
        <SOSModal />
        <DialpadModal />
        <CalculatorModal />
        <YouTubeModal />
        <ChooseContactsModal />
        <ChooseAppsModal />
        <SettingsModal />
        <IncomingCallModal />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <LauncherProvider>
      <MainScreen />
    </LauncherProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 60,
  },
});
