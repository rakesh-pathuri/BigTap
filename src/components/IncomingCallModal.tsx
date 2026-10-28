import React, { useEffect, useState } from 'react';
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

export const IncomingCallModal: React.FC = () => {
  const {
    incomingCaller,
    isCallConnected,
    answerIncomingCall,
    declineIncomingCall,
    endActiveCall,
    fontScale,
    vibrate,
  } = useLauncher();

  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);

  // Timer for connected call
  useEffect(() => {
    if (!isCallConnected) {
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [isCallConnected]);

  if (!incomingCaller) {
    return null;
  }

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getInitialsOrDigits = (name?: string, phone?: string) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (phone) {
      const digits = phone.replace(/[^0-9]/g, '');
      return digits.slice(-2) || '#';
    }
    return '#';
  };

  const avatarSource = incomingCaller.photoUri ? { uri: incomingCaller.photoUri } : null;

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={declineIncomingCall}
    >
      <View style={styles.container}>
        {/* Top Status */}
        <View style={styles.topHeader}>
          <Text style={styles.callStatus}>
            {isCallConnected ? 'Call Connected' : 'Incoming Phone Call'}
          </Text>
          <Text style={styles.callTimer}>
            {isCallConnected ? formatDuration(callDuration) : 'Ringing...'}
          </Text>
        </View>

        {/* Big Prominent Caller Photo or Large Initials (Google Phone style) */}
        <View style={styles.photoContainer}>
          <View style={styles.photoFrame}>
            {avatarSource ? (
              <Image
                source={avatarSource}
                style={styles.callerPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.callerPhoto, styles.fallbackPhoto, { backgroundColor: incomingCaller.color || '#1A73E8' }]}>
                <Text style={styles.initialsText}>
                  {getInitialsOrDigits(incomingCaller.name, incomingCaller.phoneNumber)}
                </Text>
              </View>
            )}
          </View>

          {/* Caller Details: Name & Number only, NO tags */}
          <Text
            style={[
              styles.callerName,
              { fontSize: fontScale.contactName * 1.35 },
            ]}
            numberOfLines={1}
          >
            {incomingCaller.name}
          </Text>

          <Text style={styles.callerPhone}>{incomingCaller.phoneNumber}</Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomSection}>
          {!isCallConnected ? (
            /* Incoming Ringing Controls: Large Accept & Decline Buttons */
            <View style={styles.incomingControls}>
              {/* Decline Button */}
              <TouchableOpacity
                style={[styles.bigCallBtn, styles.declineBtn]}
                onPress={declineIncomingCall}
                activeOpacity={0.75}
                accessibilityLabel="Decline Call"
                accessibilityRole="button"
              >
                <Ionicons name="call" size={36} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                <Text style={styles.btnLabel}>Decline</Text>
              </TouchableOpacity>

              {/* Accept Button */}
              <TouchableOpacity
                style={[styles.bigCallBtn, styles.acceptBtn]}
                onPress={answerIncomingCall}
                activeOpacity={0.75}
                accessibilityLabel="Answer Call"
                accessibilityRole="button"
              >
                <Ionicons name="call" size={36} color="#FFFFFF" />
                <Text style={styles.btnLabel}>Answer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Connected Call Controls: Mute, Speaker, Hangup */
            <View style={styles.connectedControls}>
              <View style={styles.inCallToggles}>
                <TouchableOpacity
                  style={[styles.toolBtn, isMuted && styles.toolBtnActive]}
                  onPress={() => {
                    vibrate('light');
                    setIsMuted(!isMuted);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isMuted ? 'mic-off' : 'mic'}
                    size={28}
                    color="#FFFFFF"
                  />
                  <Text style={styles.toolLabel}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toolBtn, isSpeaker && styles.toolBtnActive]}
                  onPress={() => {
                    vibrate('light');
                    setIsSpeaker(!isSpeaker);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSpeaker ? 'volume-high' : 'volume-mute'}
                    size={28}
                    color="#FFFFFF"
                  />
                  <Text style={styles.toolLabel}>Speaker</Text>
                </TouchableOpacity>
              </View>

              {/* End Call Button */}
              <TouchableOpacity
                style={[styles.bigCallBtn, styles.endCallBtn]}
                onPress={endActiveCall}
                activeOpacity={0.75}
                accessibilityLabel="End Call"
                accessibilityRole="button"
              >
                <Ionicons name="call" size={36} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                <Text style={styles.btnLabel}>End Call</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2124',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  topHeader: {
    alignItems: 'center',
    paddingTop: 10,
  },
  callStatus: {
    color: '#9AA0A6',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  callTimer: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photoFrame: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 4,
    borderColor: '#4285F4',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    marginBottom: 20,
  },
  callerPhoto: {
    width: '100%',
    height: '100%',
  },
  fallbackPhoto: {
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: 2,
  },
  callerName: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  callerPhone: {
    color: '#BDC1C6',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bigCallBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  acceptBtn: {
    backgroundColor: '#1E8E3E',
  },
  declineBtn: {
    backgroundColor: '#D93025',
  },
  btnLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginTop: 6,
  },
  connectedControls: {
    alignItems: 'center',
    width: '100%',
  },
  inCallToggles: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  toolBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2D3035',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnActive: {
    backgroundColor: '#1A73E8',
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  endCallBtn: {
    backgroundColor: '#D93025',
  },
});
