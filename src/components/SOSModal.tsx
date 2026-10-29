import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import {
  dispatchEmergencyAlert,
  EmergencyResult,
  isPlaceholderPhoneNumber,
} from '../utils/emergency';

export const SOSModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    settings,
    contacts,
    fontScale,
    vibrate,
  } = useLauncher();

  const [countdown, setCountdown] = useState<number>(5);
  const [isAlerting, setIsAlerting] = useState<boolean>(false);
  const [result, setResult] = useState<EmergencyResult | null>(null);

  const recipients = React.useMemo(() => {
    const list: { name: string; phoneNumber: string }[] = [];
    const seen = new Set<string>();

    const add = (name: string, phone: string) => {
      if (isPlaceholderPhoneNumber(phone)) return;
      const clean = phone.replace(/[^0-9+*#]/g, '');
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        list.push({ name: name || 'Emergency Contact', phoneNumber: phone });
      }
    };

    if (settings.emergencyContacts && settings.emergencyContacts.length > 0) {
      settings.emergencyContacts.forEach((c) => add(c.name, c.phoneNumber));
    }

    contacts
      .filter((c) => c.isEmergency && c.enabled)
      .forEach((c) => add(c.name, c.phoneNumber));

    if (list.length === 0 && settings.emergencyNumber) {
      add(settings.emergencyContactName || 'Emergency Contact', settings.emergencyNumber);
    }

    return list;
  }, [settings.emergencyContacts, settings.emergencyNumber, settings.emergencyContactName, contacts]);

  const triggerEmergency = React.useCallback(async () => {
    setIsAlerting(true);
    vibrate('error');

    const res = await dispatchEmergencyAlert(
      recipients,
      settings.emergencyMessage
    );
    setResult(res);
    setIsAlerting(false);
  }, [recipients, settings.emergencyMessage, vibrate]);

  const handleCancel = () => {
    vibrate('light');
    setCountdown(5);
    setIsAlerting(false);
    setResult(null);
    closeModal();
  };

  useEffect(() => {
    if (activeModal !== 'sos' || isAlerting || result) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setCountdown(0);
          triggerEmergency();
        } else {
          setCountdown((prev) => prev - 1);
          vibrate('warning');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeModal, countdown, isAlerting, result, triggerEmergency, vibrate]);

  if (activeModal !== 'sos') {
    return null;
  }

  return (
    <Modal
      visible={activeModal === 'sos'}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={[styles.title, { fontSize: fontScale.sectionTitle * 1.15 }]}>
            Emergency SOS
          </Text>

          {!result ? (
            <>
              {/* Recipient Details Card */}
              <View style={styles.recipientCard}>
                <Text style={styles.recipientLabel}>
                  {recipients.length > 1
                    ? `ALERTING ${recipients.length} EMERGENCY CONTACTS`
                    : 'ALERT RECIPIENT'}
                </Text>
                {recipients.length === 0 ? (
                  <View style={styles.recipientItem}>
                    <Text style={styles.recipientName}>No Contacts Configured</Text>
                    <Text style={styles.recipientPhone}>Add emergency contacts in Settings</Text>
                  </View>
                ) : (
                  recipients.map((r, idx) => (
                    <View key={idx} style={styles.recipientItem}>
                      <Text style={styles.recipientName} numberOfLines={1}>
                        {r.name}
                      </Text>
                      <Text style={styles.recipientPhone}>{r.phoneNumber}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Countdown Gauge */}
              <View style={styles.countdownBox}>
                <Text style={styles.countdownNum}>{countdown}</Text>
                <Text style={styles.countdownLabel}>Auto-alerting in seconds</Text>
              </View>

              <Text style={styles.noticeText}>
                {recipients.length > 0
                  ? 'Sends automatic background SMS alerts with your live GPS location to all emergency contacts.'
                  : 'No custom contacts configured. Please add emergency contacts in Settings.'}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionsBox}>
                <TouchableOpacity
                  style={[styles.btn, styles.sendBtn]}
                  onPress={triggerEmergency}
                  activeOpacity={0.8}
                  disabled={isAlerting || recipients.length === 0}
                  accessibilityLabel="Send distress alert immediately"
                  accessibilityRole="button"
                >
                  <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                  <Text style={[styles.sendBtnText, { fontSize: fontScale.buttonLabel }]}>
                    {isAlerting ? 'Sending SMS...' : 'Send SMS Alert Now'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  accessibilityLabel="Cancel emergency alert"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={20} color="#E2E8F0" />
                  <Text style={[styles.cancelBtnText, { fontSize: fontScale.buttonLabel }]}>
                    Cancel (I Am Safe)
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Dispatched Confirmation Screen */
            <View style={styles.dispatchedBox}>
              <View style={styles.dispatchedIcon}>
                <Ionicons name="checkmark-circle" size={54} color="#16A34A" />
              </View>

              <Text style={[styles.dispatchedTitle, { fontSize: fontScale.sectionTitle }]}>
                Alert Dispatched
              </Text>

              <Text style={styles.dispatchedSub}>
                {result.smsSentCount > 0
                  ? `Automatic background SMS sent to ${result.smsSentCount} contact${result.smsSentCount > 1 ? 's' : ''}`
                  : result.error || 'Emergency alert completed.'}
              </Text>

              {result.locationString ? (
                <View style={styles.gpsRow}>
                  <Ionicons name="navigate" size={16} color="#059669" />
                  <Text style={styles.gpsText}>Live GPS location coordinates included</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.btn, styles.dismissBtn]}
                onPress={handleCancel}
                activeOpacity={0.75}
                accessibilityLabel="Close SOS"
                accessibilityRole="button"
              >
                <Text style={[styles.dismissBtnText, { fontSize: fontScale.buttonLabel }]}>
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 16,
  },
  recipientCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  recipientLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  recipientItem: {
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#334155',
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  recipientPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  noRecipientText: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 6,
  },
  countdownBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 6,
  },
  countdownNum: {
    fontSize: 56,
    fontWeight: '900',
    color: '#EF4444',
    lineHeight: 62,
  },
  countdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  noticeText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actionsBox: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: 16,
    gap: 8,
  },
  sendBtn: {
    backgroundColor: '#DC2626',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  dispatchedBox: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  dispatchedIcon: {
    marginBottom: 12,
  },
  dispatchedTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 6,
  },
  dispatchedSub: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  callText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  gpsText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  dismissBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
