import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useLauncher } from '../context/LauncherContext';
import { setTorchNativeAsync } from '../../modules/direct-sms';

export const NativeTorchController: React.FC = () => {
  const { torchOn } = useLauncher();

  useEffect(() => {
    if (Platform.OS === 'android') {
      setTorchNativeAsync(torchOn).catch(() => {});
    }
  }, [torchOn]);

  return null;
};

