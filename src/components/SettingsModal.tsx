import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { exitToStandardLauncher, openDeviceSettings } from '../utils/nativeLauncher';
import { FontSizeMode, ThemeMode } from '../types';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    contacts,
    apps,
    settings,
    theme,
    fontScale,
    updateSettings,
    setFontSize,
    setThemeMode,
    addEmergencyContact,
    removeEmergencyContact,
    toggleAppVisibility,
    reorderApps,
    toggleContactEnabled,
    deleteContact,
    changeContactPhotoAsync,
    triggerIncomingCall,
    openModal,
    vibrate,
  } = useLauncher();

  const [newEmergencyName, setNewEmergencyName] = useState<string>('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState<string>('');
  const [emergencyMsgInput, setEmergencyMsgInput] = useState<string>(
    settings.emergencyMessage || 'EMERGENCY: I need help! Please check on me immediately.'
  );

  const emergencyContactsList =
    settings.emergencyContacts && settings.emergencyContacts.length > 0
      ? settings.emergencyContacts
      : settings.emergencyNumber
      ? [
          {
            id: 'emg-legacy',
            name: settings.emergencyContactName || 'Emergency Contact',
            phoneNumber: settings.emergencyNumber,
          },
        ]
      : [];

  if (activeModal !== 'settings') {
    return null;
  }

  const handleExitLauncher = async () => {
    vibrate('medium');
    closeModal();
    const success = await exitToStandardLauncher();
    if (!success) {
      Alert.alert(
        'Exit Launcher',
        'Press your phone Home button or open Settings > Apps > Default Apps > Home app to choose your launcher.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleOpenSystemSettings = async () => {
    vibrate('light');
    await openDeviceSettings();
  };

  const handleAddEmergency = async () => {
    if (!newEmergencyPhone.trim()) return;
    vibrate('success');
    await addEmergencyContact(
      newEmergencyName.trim() || 'Emergency Contact',
      newEmergencyPhone.trim()
    );
    setNewEmergencyName('');
    setNewEmergencyPhone('');
  };

  const handleRemoveEmergency = async (id: string) => {
    vibrate('light');
    await removeEmergencyContact(id);
  };

  const handleSaveEmergencyMsg = async () => {
    vibrate('success');
    await updateSettings({ emergencyMessage: emergencyMsgInput.trim() });
  };

  const handleTestIncomingCall = (contact?: any) => {
    vibrate('medium');
    closeModal();
    const caller = contact || (contacts.length > 0 ? contacts[0] : {
      id: 'test-caller',
      name: 'Family Member',
      phoneNumber: 'Incoming Call',
      order: 0,
      enabled: true,
    });
    setTimeout(() => {
      triggerIncomingCall(caller);
    }, 250);
  };

  const renderContactAvatar = (contact: any) => {
    if (contact.photoUri) {
      return { uri: contact.photoUri };
    }
    return null;
  };

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.headerBg }]}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header - Pinned at the very top */}
          <View style={[styles.header, { backgroundColor: theme.headerBg, borderColor: theme.cardBorder }]}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: theme.textPrimary,
                  fontSize: fontScale.sectionTitle,
                },
              ]}
            >
              Settings
            </Text>

            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.accent }]}
              onPress={closeModal}
              activeOpacity={0.7}
              accessibilityLabel="Done"
              accessibilityRole="button"
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section: Contacts */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                  Contacts
                </Text>
                <TouchableOpacity
                  style={styles.headerAddBtn}
                  onPress={() => openModal('chooseContacts')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={22} color={theme.accent} />
                  <Text style={[styles.headerAddText, { color: theme.accent }]}>Add</Text>
                </TouchableOpacity>
              </View>

              {contacts.length === 0 ? (
                <Text style={[styles.emptyContactsText, { color: theme.textMuted }]}>
                  No speed-dial contacts added. Tap Add to choose from your phone.
                </Text>
              ) : null}

              {contacts.map((c) => {
                const avatar = renderContactAvatar(c);

                return (
                  <View
                    key={c.id}
                    style={[
                      styles.contactItem,
                      {
                        borderColor: theme.cardBorder,
                        backgroundColor: theme.background,
                      },
                    ]}
                  >
                    {/* Photo with direct tap to change */}
                    <TouchableOpacity
                      style={styles.contactAvatarWrap}
                      onPress={() => changeContactPhotoAsync(c.id)}
                      activeOpacity={0.7}
                      accessibilityLabel="Change photo"
                    >
                      {avatar ? (
                        <Image source={avatar} style={styles.contactImg} />
                      ) : (
                        <View style={[styles.contactImg, styles.avatarFallback]}>
                          <Ionicons name="person" size={22} color="#FFFFFF" />
                        </View>
                      )}
                      <View style={[styles.cameraBadge, { backgroundColor: theme.accent }]}>
                        <Ionicons name="camera" size={11} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={styles.contactItemDetails}>
                      <Text
                        style={[
                          styles.contactItemName,
                          {
                            color: theme.textPrimary,
                            fontSize: fontScale.contactName * 0.85,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      <Text
                        style={[
                          styles.contactItemSub,
                          {
                            color: theme.textMuted,
                            fontSize: fontScale.caption * 0.95,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {c.phoneNumber}
                      </Text>
                    </View>

                    {/* Toggle and Delete */}
                    <View style={styles.contactActions}>
                      <Switch
                        value={c.enabled}
                        onValueChange={() => toggleContactEnabled(c.id)}
                        trackColor={{ false: theme.toggleInactive, true: theme.toggleActive }}
                        thumbColor="#FFFFFF"
                      />

                      <TouchableOpacity
                        style={styles.deleteContactBtn}
                        onPress={() => deleteContact(c.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Section: Incoming Call Screen Demo */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                  Incoming Call
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.accentBg, borderColor: theme.accent }]}
                onPress={() => handleTestIncomingCall(contacts[0])}
                activeOpacity={0.75}
              >
                <Ionicons name="call-outline" size={20} color={theme.accentText} />
                <Text style={[styles.actionBtnText, { color: theme.accentText }]}>
                  Test Incoming Call Screen
                </Text>
              </TouchableOpacity>
            </View>

            {/* Section: Apps */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                  Apps
                </Text>

                <TouchableOpacity
                  style={styles.headerAddBtn}
                  onPress={() => openModal('chooseApps')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={theme.accent} />
                  <Text style={[styles.headerAddText, { color: theme.accent }]}>Manage</Text>
                </TouchableOpacity>
              </View>

              {apps.map((app, index) => (
                <View
                  key={app.id}
                  style={[
                    styles.appToggleRow,
                    {
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={[styles.appToggleIcon, { backgroundColor: app.bgColor }]}>
                    <Ionicons name={app.icon as any} size={20} color="#FFFFFF" />
                  </View>

                  <Text
                    style={[
                      styles.appToggleTitle,
                      {
                        color: theme.textPrimary,
                        fontSize: fontScale.buttonLabel,
                      },
                    ]}
                  >
                    {app.title}
                  </Text>

                  {/* Reorder Buttons: Move Up/Down in Grid */}
                  <View style={styles.reorderBtnGroup}>
                    <TouchableOpacity
                      style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                      onPress={() => reorderApps(app.id, 'up')}
                      disabled={index === 0}
                      activeOpacity={0.7}
                      accessibilityLabel="Move up in grid"
                    >
                      <Ionicons
                        name="chevron-up"
                        size={18}
                        color={index === 0 ? theme.cardBorder : theme.textPrimary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.reorderBtn, index === apps.length - 1 && styles.reorderBtnDisabled]}
                      onPress={() => reorderApps(app.id, 'down')}
                      disabled={index === apps.length - 1}
                      activeOpacity={0.7}
                      accessibilityLabel="Move down in grid"
                    >
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={index === apps.length - 1 ? theme.cardBorder : theme.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>

                  <Switch
                    value={app.enabled}
                    onValueChange={() => toggleAppVisibility(app.id)}
                    trackColor={{ false: theme.toggleInactive, true: theme.toggleActive }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>

            {/* Section: Text Size */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                Text Size
              </Text>

              <View style={styles.fontSizeOptions}>
                {(['normal', 'large', 'xlarge'] as FontSizeMode[]).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOptionBtn,
                      settings.fontSize === size
                        ? { backgroundColor: theme.accent, borderColor: theme.accent }
                        : { backgroundColor: theme.background, borderColor: theme.cardBorder },
                    ]}
                    onPress={() => setFontSize(size)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sizeOptionText,
                        {
                          color: settings.fontSize === size ? '#FFFFFF' : theme.textPrimary,
                          fontSize: size === 'normal' ? 15 : size === 'large' ? 17 : 20,
                        },
                      ]}
                    >
                      {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section: Theme */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                Theme
              </Text>

              <View style={styles.themeOptions}>
                {[
                  { id: 'warm' as ThemeMode, name: 'Light' },
                  { id: 'dark' as ThemeMode, name: 'Dark' },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.themeOptionBtn,
                      settings.theme === t.id
                        ? { backgroundColor: theme.accentBg, borderColor: theme.accent, borderWidth: 2 }
                        : { backgroundColor: theme.background, borderColor: theme.cardBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setThemeMode(t.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={settings.theme === t.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={settings.theme === t.id ? theme.accent : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.themeName,
                        {
                          color: theme.textPrimary,
                          fontSize: fontScale.buttonLabel,
                        },
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section: Emergency Contacts */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                  Emergency Contacts
                </Text>
              </View>

              {/* List of configured emergency contacts */}
              {emergencyContactsList.length === 0 ? (
                <Text style={[styles.emptyContactsText, { color: theme.textMuted }]}>
                  No emergency contacts configured.
                </Text>
              ) : (
                emergencyContactsList.map((emg) => (
                  <View
                    key={emg.id}
                    style={[
                      styles.emergencyRow,
                      {
                        borderColor: theme.cardBorder,
                        backgroundColor: theme.background,
                      },
                    ]}
                  >
                    <View style={styles.emergencyDetails}>
                      <Text
                        style={[
                          styles.emergencyContactName,
                          { color: theme.textPrimary, fontSize: fontScale.buttonLabel },
                        ]}
                        numberOfLines={1}
                      >
                        {emg.name}
                      </Text>
                      <Text
                        style={[
                          styles.emergencyContactPhone,
                          { color: theme.textMuted, fontSize: fontScale.caption },
                        ]}
                        numberOfLines={1}
                      >
                        {emg.phoneNumber}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteContactBtn}
                      onPress={() => handleRemoveEmergency(emg.id)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Delete ${emg.name}`}
                    >
                      <Ionicons name="trash-outline" size={20} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add Emergency Contact Form */}
              <View style={styles.addEmergencyForm}>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.cardBorder,
                      color: theme.textPrimary,
                    },
                  ]}
                  value={newEmergencyName}
                  onChangeText={setNewEmergencyName}
                  placeholder="Contact Name"
                  placeholderTextColor={theme.textMuted}
                />

                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.cardBorder,
                      color: theme.textPrimary,
                      marginTop: 8,
                    },
                  ]}
                  value={newEmergencyPhone}
                  onChangeText={setNewEmergencyPhone}
                  keyboardType="phone-pad"
                  placeholder="Phone Number"
                  placeholderTextColor={theme.textMuted}
                />

                <TouchableOpacity
                  style={[
                    styles.saveEmergencyBtn,
                    { backgroundColor: theme.accent, marginTop: 10 },
                    !newEmergencyPhone.trim() && { opacity: 0.6 },
                  ]}
                  onPress={handleAddEmergency}
                  disabled={!newEmergencyPhone.trim()}
                  activeOpacity={0.75}
                >
                  <Text style={styles.saveEmergencyText}>+ Add Emergency Contact</Text>
                </TouchableOpacity>
              </View>

              {/* SMS Alert Message */}
              <View style={{ marginTop: 16 }}>
                <Text
                  style={[
                    styles.subSectionTitle,
                    { color: theme.textSecondary, fontSize: fontScale.caption },
                  ]}
                >
                  SMS Alert Message
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.cardBorder,
                      color: theme.textPrimary,
                      marginTop: 6,
                      minHeight: 56,
                      textAlignVertical: 'top',
                    },
                  ]}
                  value={emergencyMsgInput}
                  onChangeText={setEmergencyMsgInput}
                  multiline={true}
                  placeholder="Emergency message"
                  placeholderTextColor={theme.textMuted}
                />
                <TouchableOpacity
                  style={[
                    styles.saveEmergencyBtn,
                    {
                      backgroundColor: theme.accentBg,
                      borderColor: theme.accent,
                      borderWidth: 1,
                      marginTop: 8,
                    },
                  ]}
                  onPress={handleSaveEmergencyMsg}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.saveEmergencyText, { color: theme.accentText }]}>
                    Save Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section: Exit Launcher (Moved to bottom of settings) */}
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                Exit Launcher
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.accentBg, borderColor: theme.accent }]}
                  onPress={handleExitLauncher}
                  activeOpacity={0.75}
                >
                  <Ionicons name="phone-portrait-outline" size={20} color={theme.accentText} />
                  <Text style={[styles.actionBtnText, { color: theme.accentText }]}>
                    Standard Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                  onPress={handleOpenSystemSettings}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cog-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                    Phone Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  headerAddText: {
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  contactAvatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  contactImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  contactItemDetails: {
    flex: 1,
  },
  contactItemName: {
    fontWeight: '700',
  },
  contactItemSub: {
    fontWeight: '500',
    marginTop: 1,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteContactBtn: {
    padding: 6,
  },
  appToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appToggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appToggleTitle: {
    flex: 1,
    fontWeight: '600',
  },
  reorderBtnGroup: {
    flexDirection: 'row',
    gap: 2,
    marginRight: 8,
  },
  reorderBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOptionText: {
    fontWeight: '700',
  },
  themeOptions: {
    flexDirection: 'column',
    gap: 8,
  },
  themeOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },
  themeName: {
    fontWeight: '700',
    fontSize: 15,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  saveEmergencyBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveEmergencyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContactsText: {
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  emergencyDetails: {
    flex: 1,
    marginRight: 8,
  },
  emergencyContactName: {
    fontWeight: '700',
  },
  emergencyContactPhone: {
    fontWeight: '500',
    marginTop: 2,
  },
  addEmergencyForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.3)',
  },
  subSectionTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
});
