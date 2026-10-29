import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useLauncher } from '../context/LauncherContext';
import { setTorchNativeAsync } from '../../modules/direct-sms';

export const NativeTorchController: React.FC = () => {
  const { torchOn } = useLauncher();

  useEffect(() => {
    if (Platform.OS === 'android') {
      setTorchNativeAsync(torchOn)
        .then((success) => {
          if (!success && torchOn) {
            console.warn('Torch toggle returned false (hardware may be busy or unavailable)');
          }
        })
        .catch((err) => {
          console.error('Failed to set native torch state:', err);
        });
    }
  }, [torchOn]);

  return null;
};

