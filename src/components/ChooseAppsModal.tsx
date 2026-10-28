import React, { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { ALL_AVAILABLE_PHONE_APPS } from '../constants/initialData';
import { QuickAppItem } from '../types';

export const ChooseAppsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    apps,
    setAppEnabled,
    addCustomApp,
    theme,
    fontScale,
    vibrate,
  } = useLauncher();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPackage, setCustomPackage] = useState('');
  const [customCategory, setCustomCategory] = useState<'communication' | 'media' | 'utility' | 'tools'>('utility');

  // Combine default catalog with any custom apps user has added
  const combinedCatalog = useMemo(() => {
    const list: QuickAppItem[] = [...ALL_AVAILABLE_PHONE_APPS];

    // Add any custom apps that exist in current state but not in standard catalog
    apps.forEach((app) => {
      if (!list.some((c) => c.id === app.id)) {
        list.push(app);
      }
    });

    return list;
  }, [apps]);

  // Filter based on search and category
  const filteredApps = useMemo(() => {
    return combinedCatalog.filter((item) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.packageName && item.packageName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [combinedCatalog, searchQuery, selectedCategory]);

  const isAppEnabled = (appId: string): boolean => {
    const current = apps.find((a) => a.id === appId);
    return current ? current.enabled : false;
  };

  const handleToggle = (appId: string, enabled: boolean) => {
    vibrate('light');
    setAppEnabled(appId, enabled);
  };

  const handleAddCustomApp = () => {
    if (!customName.trim()) return;

    vibrate('success');
    addCustomApp({
      title: customName.trim(),
      subtitle: customPackage.trim() || 'Installed App',
      icon: 'apps-outline',
      iconFamily: 'Ionicons',
      bgColor: '#3B82F6',
      textColor: '#FFFFFF',
      actionType: 'custom',
      packageName: customPackage.trim() || undefined,
      category: customCategory,
      enabled: true,
    });

    setCustomName('');
    setCustomPackage('');
    setShowAddCustom(false);
  };

  if (activeModal !== 'chooseApps') return null;

  return (
    <Modal
      visible={activeModal === 'chooseApps'}
      transparent={false}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.headerBg }]}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.headerBg, borderColor: theme.cardBorder }]}>
            <View style={styles.headerTitleWrap}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.textPrimary,
                    fontSize: fontScale.sectionTitle * 0.95,
                  },
                ]}
                numberOfLines={1}
              >
                Choose Apps
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={closeModal}
              activeOpacity={0.7}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary, fontSize: fontScale.body }]}
                placeholder="Search installed phone apps..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPillsRow}
            >
              {[
                { key: 'all', label: 'All Apps' },
                { key: 'communication', label: 'Communication' },
                { key: 'media', label: 'Media' },
                { key: 'utility', label: 'Utilities' },
                { key: 'tools', label: 'Tools' },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.card,
                        borderColor: isSelected ? theme.accent : theme.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      vibrate('light');
                      setSelectedCategory(cat.key);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                          fontSize: fontScale.caption,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Apps Toggle List */}
            <View style={[styles.listCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              {filteredApps.map((item, index) => {
                const enabled = isAppEnabled(item.id);
                const isLast = index === filteredApps.length - 1;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.appRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder },
                    ]}
                  >
                    {/* App Icon */}
                    <View style={[styles.appIconCircle, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                    </View>

                    {/* App Title & Subtitle */}
                    <View style={styles.appInfo}>
                      <Text
                        style={[
                          styles.appTitle,
                          {
                            color: theme.textPrimary,
                            fontSize: fontScale.buttonLabel,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.subtitle ? (
                        <Text
                          style={[
                            styles.appSubtitle,
                            {
                              color: theme.textSecondary,
                              fontSize: fontScale.caption * 0.95,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>

                    {/* Enable / Disable Switch */}
                    <Switch
                      value={enabled}
                      onValueChange={(val) => handleToggle(item.id, val)}
                      trackColor={{ false: theme.cardBorder, true: theme.accent }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}

              {filteredApps.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: fontScale.body }]}>
                    No apps match &ldquo;{searchQuery}&rdquo;
                  </Text>
                </View>
              )}
            </View>

            {/* Add Custom Installed App Card */}
            <View style={[styles.customAppCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <TouchableOpacity
                style={styles.customAppHeader}
                onPress={() => {
                  vibrate('light');
                  setShowAddCustom(!showAddCustom);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.customAppHeaderLeft}>
                  <Ionicons name="add-circle" size={24} color={theme.accent} />
                  <Text style={[styles.customAppTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                    Add Other Installed App
                  </Text>
                </View>
                <Ionicons
                  name={showAddCustom ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.textPrimary}
                />
              </TouchableOpacity>

              {showAddCustom && (
                <View style={styles.customForm}>
                  <Text style={[styles.customHint, { color: theme.textSecondary, fontSize: fontScale.caption }]}>
                    Enter the display name and Android package name of any application installed on this device (e.g. com.spotify.music or org.telegram.messenger).
                  </Text>

                  <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: fontScale.caption }]}>
                    App Name:
                  </Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.textPrimary }]}
                    placeholder="e.g. Spotify"
                    placeholderTextColor={theme.textMuted}
                    value={customName}
                    onChangeText={setCustomName}
                  />

                  <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: fontScale.caption }]}>
                    Android Package Name:
                  </Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.textPrimary }]}
                    placeholder="e.g. com.spotify.music"
                    placeholderTextColor={theme.textMuted}
                    value={customPackage}
                    onChangeText={setCustomPackage}
                    autoCapitalize="none"
                  />

                  <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: fontScale.caption }]}>
                    Category:
                  </Text>
                  <View style={styles.categoryButtonGroup}>
                    {(['communication', 'media', 'utility', 'tools'] as const).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catBtn,
                          {
                            backgroundColor: customCategory === cat ? theme.accent : theme.background,
                            borderColor: customCategory === cat ? theme.accent : theme.cardBorder,
                          },
                        ]}
                        onPress={() => setCustomCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.catBtnText,
                            {
                              color: customCategory === cat ? '#FFFFFF' : theme.textPrimary,
                              fontSize: fontScale.caption * 0.9,
                              fontWeight: customCategory === cat ? '700' : '500',
                            },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitCustomBtn,
                      {
                        backgroundColor: customName.trim() ? theme.accent : theme.cardBorder,
                      },
                    ]}
                    onPress={handleAddCustomApp}
                    disabled={!customName.trim()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.submitCustomBtnText}>Add to Home Grid</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Fixed Done Button at bottom */}
          <View style={[styles.footer, { backgroundColor: theme.headerBg, borderColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.accent }]}
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  pinnedBanner: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 8,
  },
  pinnedBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinnedBannerTitle: {
    fontWeight: '700',
  },
  pinnedBannerText: {
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    letterSpacing: -0.2,
  },
  listCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 18,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  appIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appInfo: {
    flex: 1,
    marginRight: 12,
  },
  appTitle: {
    fontWeight: '700',
  },
  appSubtitle: {
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  customAppCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
  },
  customAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customAppHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customAppTitle: {
    fontWeight: '700',
  },
  customForm: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    gap: 10,
  },
  customHint: {
    lineHeight: 18,
    marginBottom: 4,
  },
  inputLabel: {
    fontWeight: '600',
    marginTop: 4,
  },
  formInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  categoryButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  catBtnText: {
    textTransform: 'capitalize',
  },
  submitCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitCustomBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
});
