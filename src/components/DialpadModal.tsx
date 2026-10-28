import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { makePhoneCall } from '../utils/emergency';

export const DialpadModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    theme,
    fontScale,
    vibrate,
  } = useLauncher();

  const [inputNumber, setInputNumber] = useState<string>('');

  if (activeModal !== 'dialpad') {
    return null;
  }

  const keys = [
    { label: '1', sub: '' },
    { label: '2', sub: 'ABC' },
    { label: '3', sub: 'DEF' },
    { label: '4', sub: 'GHI' },
    { label: '5', sub: 'JKL' },
    { label: '6', sub: 'MNO' },
    { label: '7', sub: 'PQRS' },
    { label: '8', sub: 'TUV' },
    { label: '9', sub: 'WXYZ' },
    { label: '*', sub: '' },
    { label: '0', sub: '+' },
    { label: '#', sub: '' },
  ];

  const handleKeyPress = (char: string) => {
    vibrate('light');
    setInputNumber((prev) => prev + char);
  };

  const handleBackspace = () => {
    vibrate('light');
    if (inputNumber.length > 0) {
      setInputNumber((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    vibrate('medium');
    setInputNumber('');
  };

  const handleCall = async () => {
    if (!inputNumber) {
      return;
    }
    vibrate('success');
    closeModal();
    await makePhoneCall(inputNumber);
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
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: theme.textPrimary,
                  fontSize: fontScale.sectionTitle,
                },
              ]}
            >
              Phone Keypad
            </Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={closeModal}
              activeOpacity={0.7}
              accessibilityLabel="Close Keypad"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={26} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Number Display Box */}
          <View style={[styles.displayBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text
              style={[
                styles.displayText,
                {
                  color: inputNumber ? theme.textPrimary : theme.textMuted,
                  fontSize: fontScale.contactName * 1.3,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {inputNumber || 'Enter number...'}
            </Text>

            {inputNumber.length > 0 && (
              <TouchableOpacity
                onPress={handleBackspace}
                onLongPress={handleClear}
                style={styles.backspaceBtn}
                accessibilityLabel="Backspace"
                accessibilityRole="button"
              >
                <Ionicons name="backspace" size={32} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Keypad Grid */}
          <View style={styles.grid}>
            {keys.map((k) => (
              <TouchableOpacity
                key={k.label}
                style={[
                  styles.keyBtn,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
                onPress={() => handleKeyPress(k.label)}
                activeOpacity={0.65}
                accessibilityLabel={`Number ${k.label}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.keyLabel,
                    {
                      color: theme.textPrimary,
                      fontSize: fontScale.time * 0.7,
                    },
                  ]}
                >
                  {k.label}
                </Text>
                {k.sub ? (
                  <Text
                    style={[
                      styles.keySub,
                      {
                        color: theme.textMuted,
                        fontSize: fontScale.caption * 0.8,
                      },
                    ]}
                  >
                    {k.sub}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {/* Call Button */}
          <TouchableOpacity
            style={[
              styles.callBtn,
              {
                backgroundColor: theme.success,
              },
            ]}
            onPress={handleCall}
            activeOpacity={0.75}
            accessibilityLabel="Call dialed number"
            accessibilityRole="button"
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
            <Text
              style={[
                styles.callBtnText,
                {
                  fontSize: fontScale.buttonLabel * 1.2,
                },
              ]}
            >
              Call Number
            </Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 2,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    alignItems: 'center',
    maxHeight: '90%',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontWeight: '800',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayBox: {
    width: '100%',
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  displayText: {
    flex: 1,
    fontWeight: '800',
    letterSpacing: 1,
  },
  backspaceBtn: {
    padding: 8,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyBtn: {
    width: '30%',
    height: 68,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  keyLabel: {
    fontWeight: '800',
    lineHeight: 36,
  },
  keySub: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  callBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 20,
    elevation: 4,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 10,
  },
});
