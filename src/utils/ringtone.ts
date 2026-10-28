import { Platform, Vibration } from 'react-native';

let audioCtx: any = null;
let ringInterval: any = null;

/**
 * Starts rhythmic phone call ringing feedback.
 * On Native: pulses the device's vibration motor with standard phone ring rhythm.
 * On Web: plays authentic dual-tone telephone ring cadenced audio.
 */
export const startIncomingCallRingtone = () => {
  try {
    // Standard phone incoming call pattern: vibrate 1s, silent 1s, repeat
    Vibration.vibrate([0, 1000, 1000], true);
  } catch (err) {
    console.warn('Phone ring vibration error:', err);
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioCtx || audioCtx.state === 'closed') {
          audioCtx = new AudioContextClass();
        }

        const playRingPulse = () => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          try {
            if (audioCtx.state === 'suspended') {
              audioCtx.resume();
            }

            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            // Dual tone multi-frequency standard telephone ring frequencies: 440 Hz + 480 Hz
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc2.frequency.setValueAtTime(480, audioCtx.currentTime);

            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.6);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc1.start();
            osc2.start();
            osc1.stop(audioCtx.currentTime + 1.6);
            osc2.stop(audioCtx.currentTime + 1.6);
          } catch (e) {
            console.warn('Ring pulse error:', e);
          }
        };

        playRingPulse();
        if (ringInterval) clearInterval(ringInterval);
        ringInterval = setInterval(playRingPulse, 3200);
      }
    } catch (err) {
      console.warn('Web ringtone error:', err);
    }
  }
};

/**
 * Stops incoming call ringtone audio and continuous vibration immediately.
 */
export const stopIncomingCallRingtone = () => {
  try {
    Vibration.cancel();
  } catch {}

  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }

  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {}
    audioCtx = null;
  }
};
