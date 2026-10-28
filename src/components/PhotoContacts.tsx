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
import { SpeedContact } from '../types';
import { makePhoneCall } from '../utils/emergency';

export const PhotoContacts: React.FC = () => {
  const {
    contacts,
    theme,
    fontScale,
    openModal,
    changeContactPhotoAsync,
    vibrate,
  } = useLauncher();

  const enabledContacts = contacts.filter((c) => c.enabled);

  const handleDirectCall = async (contact: SpeedContact) => {
    vibrate('success');
    const numberToCall = contact.phoneNumber || (contact as any).phone;
    if (numberToCall) {
      await makePhoneCall(numberToCall);
    }
  };

  const handlePhotoLongPress = async (contact: SpeedContact) => {
    vibrate('medium');
    await changeContactPhotoAsync(contact.id);
  };

  const handleAddContactsPress = () => {
    vibrate('medium');
    openModal('chooseContacts');
  };

  const getContactInitials = (contact: SpeedContact) => {
    if (contact.name && contact.name.trim().length > 0) {
      const parts = contact.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (contact.phoneNumber) {
      const digits = contact.phoneNumber.replace(/[^0-9]/g, '');
      return digits.slice(-2) || '#';
    }
    return '#';
  };

  return (
    <View style={styles.container}>
      {/* Simple Clean Heading: Contacts */}
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
          Contacts
        </Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddContactsPress}
          activeOpacity={0.7}
          accessibilityLabel="Add contact"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Grid of Pure Photos or Initials (No names, no call buttons, 1-tap call) */}
      {enabledContacts.length === 0 ? (
        <TouchableOpacity
          style={[
            styles.emptyTile,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
          onPress={handleAddContactsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add-outline" size={32} color={theme.accent} />
          <Text style={[styles.emptyTileText, { color: theme.textPrimary, fontSize: fontScale.buttonLabel }]}>
            Add Contact
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.grid}>
          {enabledContacts.map((contact) => {
            const hasPhoto = !!contact.photoUri;

            return (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.photoTile,
                  {
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.card,
                  },
                ]}
                onPress={() => handleDirectCall(contact)}
                onLongPress={() => handlePhotoLongPress(contact)}
                activeOpacity={0.82}
                accessibilityLabel={`Call ${contact.name}`}
                accessibilityRole="button"
              >
                {hasPhoto ? (
                  <Image
                    source={{ uri: contact.photoUri }}
                    style={styles.fullImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.fullImage,
                      styles.fallbackAvatar,
                      { backgroundColor: contact.color || theme.accent },
                    ]}
                  >
                    <Text style={styles.tileInitialsText}>
                      {getContactInitials(contact)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    justifyContent: 'space-between',
  },
  photoTile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileInitialsText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  emptyTile: {
    width: '100%',
    paddingVertical: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTileText: {
    fontWeight: '700',
  },
});
