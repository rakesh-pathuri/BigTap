import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { makePhoneCall } from '../utils/emergency';

export const CallConfirmModal: React.FC = () => {
  const {
    activeModal,
    selectedContactForCall,
    closeModal,
    theme,
    fontScale,
    vibrate,
  } = useLauncher();

  if (activeModal !== 'callConfirm' || !selectedContactForCall) {
    return null;
  }

  const contact = selectedContactForCall;

  const handleConfirmCall = async () => {
    vibrate('success');
    closeModal();
    await makePhoneCall(contact.phoneNumber);
  };

  const handleCancel = () => {
    vibrate('light');
    closeModal();
  };

  const getContactInitials = () => {
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

  const hasPhoto = !!contact.photoUri;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
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
          <Text
            style={[
              styles.heading,
              {
                color: theme.textSecondary,
                fontSize: fontScale.body,
              },
            ]}
          >
            Are you sure you want to call?
          </Text>

          {/* Large Photo or Initials */}
          <View style={styles.avatarWrapper}>
            {hasPhoto ? (
              <Image
                source={{ uri: contact.photoUri }}
                style={[styles.avatar, { borderColor: contact.color || theme.accent }]}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarFallback,
                  { backgroundColor: contact.color || theme.accent },
                ]}
              >
                <Text style={styles.fallbackLetter}>
                  {getContactInitials()}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.contactName,
              {
                color: theme.textPrimary,
                fontSize: fontScale.contactName * 1.25,
              },
            ]}
            numberOfLines={1}
          >
            {contact.name}
          </Text>

          <Text
            style={[
              styles.phoneText,
              {
                color: theme.textMuted,
                fontSize: fontScale.body,
              },
            ]}
          >
            {contact.phoneNumber}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.cancelBtn,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
              ]}
              onPress={handleCancel}
              activeOpacity={0.7}
              accessibilityLabel="Cancel Call"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={fontScale.iconSize} color={theme.textMuted} />
              <Text
                style={[
                  styles.btnText,
                  {
                    color: theme.textSecondary,
                    fontSize: fontScale.buttonLabel,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Confirm Call Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.callBtn,
                {
                  backgroundColor: theme.success,
                },
              ]}
              onPress={handleConfirmCall}
              activeOpacity={0.75}
              accessibilityLabel={`Call ${contact.name} now`}
              accessibilityRole="button"
            >
              <Ionicons name="call" size={fontScale.iconSize} color="#FFFFFF" />
              <Text
                style={[
                  styles.btnText,
                  styles.callBtnText,
                  {
                    fontSize: fontScale.buttonLabel * 1.1,
                  },
                ]}
              >
                Call Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 2.5,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heading: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLetter: {
    color: '#FFFFFF',
    fontSize: 50,
    fontWeight: '800',
  },
  contactName: {
    fontWeight: '800',
    textAlign: 'center',
  },
  relationBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  relationText: {
    fontWeight: '700',
  },
  phoneText: {
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  cancelBtn: {
    borderWidth: 2,
  },
  callBtn: {
    elevation: 3,
  },
  btnText: {
    fontWeight: '800',
    marginLeft: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
  },
});
