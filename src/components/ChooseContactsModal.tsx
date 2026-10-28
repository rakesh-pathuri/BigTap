import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { fetchDeviceContacts } from '../utils/nativeLauncher';
import { DeviceContactPreview } from '../types';

export const ChooseContactsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    contacts,
    importDeviceContact,
    addContact,
    theme,
    fontScale,
    vibrate,
  } = useLauncher();

  const [deviceContacts, setDeviceContacts] = useState<DeviceContactPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);

  // Manual contact form state
  const [manualName, setManualName] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (activeModal === 'chooseContacts') {
      fetchDeviceContacts()
        .then((list) => {
          if (isMounted) {
            setDeviceContacts(list);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activeModal]);

  if (activeModal !== 'chooseContacts') {
    return null;
  }

  const filteredContacts = deviceContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const isAlreadyAdded = (phone: string) => {
    return contacts.some(
      (c) => c.phoneNumber.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
    );
  };

  const handleImport = async (c: DeviceContactPreview) => {
    vibrate('success');
    await importDeviceContact(c);
  };

  const handleManualSave = async () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      return;
    }
    vibrate('success');
    await addContact({
      name: manualName.trim(),
      phoneNumber: manualPhone.trim(),
      color: '#2563EB',
      isEmergency: false,
      enabled: true,
    });
    setManualName('');
    setManualPhone('');
    setIsManualMode(false);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.modalBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.textPrimary,
                    fontSize: fontScale.sectionTitle,
                  },
                ]}
                numberOfLines={1}
              >
                Add Contact
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

          {/* Mode Switcher */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                !isManualMode
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
              onPress={() => setIsManualMode(false)}
              activeOpacity={0.7}
              accessibilityRole="tab"
            >
              <Ionicons
                name="people"
                size={20}
                color={!isManualMode ? '#FFFFFF' : theme.textPrimary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: !isManualMode ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                From Phone Contacts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                isManualMode
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
              onPress={() => setIsManualMode(true)}
              activeOpacity={0.7}
              accessibilityRole="tab"
            >
              <Ionicons
                name="create"
                size={20}
                color={isManualMode ? '#FFFFFF' : theme.textPrimary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isManualMode ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                Type Manually
              </Text>
            </TouchableOpacity>
          </View>

          {!isManualMode ? (
            <>
              {/* Search Bar */}
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Ionicons name="search" size={22} color={theme.textMuted} />
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      color: theme.textPrimary,
                      fontSize: fontScale.body,
                    },
                  ]}
                  placeholder="Search contacts..."
                  placeholderTextColor={theme.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.accent} />
                  <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                    Reading phone contacts...
                  </Text>
                </View>
              ) : filteredContacts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={44} color={theme.textMuted} />
                  <Text style={[styles.emptyTitle, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                    No Contacts Found
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textMuted, fontSize: fontScale.caption }]}>
                    Tap &apos;Type Manually&apos; above to add a contact with their phone number.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
                  {filteredContacts.map((c) => {
                    const added = isAlreadyAdded(c.phone);

                    return (
                      <View
                        key={c.id}
                        style={[
                          styles.contactRow,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.cardBorder,
                          },
                        ]}
                      >
                        <View style={[styles.avatarLetter, { backgroundColor: theme.accentBg }]}>
                          <Text style={[styles.letterText, { color: theme.accentText }]}>
                            {c.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.contactDetails}>
                          <Text
                            style={[
                              styles.contactName,
                              {
                                color: theme.textPrimary,
                                fontSize: fontScale.contactName * 0.9,
                              },
                            ]}
                          >
                            {c.name}
                          </Text>
                          <Text
                            style={[
                              styles.contactPhone,
                              {
                                color: theme.textMuted,
                                fontSize: fontScale.caption,
                              },
                            ]}
                          >
                            {c.phone}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.importBtn,
                            added
                              ? { backgroundColor: theme.cardBorder }
                              : { backgroundColor: theme.success },
                          ]}
                          onPress={() => !added && handleImport(c)}
                          disabled={added}
                          activeOpacity={0.7}
                          accessibilityLabel={added ? 'Already added' : `Add ${c.name}`}
                          accessibilityRole="button"
                        >
                          <Ionicons
                            name={added ? 'checkmark' : 'add'}
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.importBtnText}>
                            {added ? 'Added' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </>
          ) : (
            /* Manual Contact Form: Name & Phone number only */
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                Full Name
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.textPrimary }]}
                placeholder="Name"
                placeholderTextColor={theme.textMuted}
                value={manualName}
                onChangeText={setManualName}
              />

              <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: fontScale.body }]}>
                Phone Number
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.textPrimary }]}
                placeholder="Phone Number"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={manualPhone}
                onChangeText={setManualPhone}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.success }]}
                onPress={handleManualSave}
                activeOpacity={0.75}
                accessibilityLabel="Save speed dial contact"
                accessibilityRole="button"
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={[styles.saveBtnText, { fontSize: fontScale.buttonLabel }]}>
                  Save to Contacts
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 2,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '800',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  tabText: {
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontWeight: '600',
  },
  contactList: {
    maxHeight: 380,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
  },
  avatarLetter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  letterText: {
    fontSize: 20,
    fontWeight: '800',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontWeight: '800',
  },
  contactPhone: {
    fontWeight: '600',
    marginTop: 2,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  importBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 4,
  },
  formContainer: {
    paddingVertical: 8,
  },
  inputLabel: {
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 20,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tagChipText: {
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    elevation: 3,
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
