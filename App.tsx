import React, { useEffect, useRef } from 'react';
import {
  AppState,
  ImageBackground,
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
import { NativeTorchController } from './src/components/NativeTorchController';
import { WALLPAPER_OPTIONS } from './src/constants/wallpapers';

const MainScreen: React.FC = () => {
  const { theme, settings } = useLauncher();
  const scrollViewRef = useRef<any>(null);

  // Always reset homescreen scroll to top when coming back from other apps
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }
    });
    return () => sub.remove();
  }, []);

  // Ensures the Android system top status bar is never blocked or overlapped
  const androidTopInset = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

  const currentWallpaper = WALLPAPER_OPTIONS.find(
    (w) => w.id === (settings.wallpaper || 'mountain_sunrise')
  );
  const isWallpaperActive = !!currentWallpaper?.source;

  const content = (
    <View style={[styles.container, !isWallpaperActive && { backgroundColor: theme.background }]}>
      <Header />

      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FixedTopActions />
        <PhotoContacts />
        <AppsGrid />
      </ScrollView>

      <NativeTorchController />

      <CallConfirmModal />
      <SOSModal />
      <DialpadModal />
      <CalculatorModal />
      <YouTubeModal />
      <ChooseContactsModal />
      <ChooseAppsModal />
      <SettingsModal />
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isWallpaperActive
            ? currentWallpaper?.previewColor || theme.headerBg
            : theme.headerBg,
          paddingTop: androidTopInset,
        },
      ]}
    >
      <StatusBar style={theme.statusBar === 'dark' ? 'dark' : 'light'} />
      {isWallpaperActive ? (
        <ImageBackground
          source={currentWallpaper.source}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {content}
        </ImageBackground>
      ) : (
        content
      )}
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
