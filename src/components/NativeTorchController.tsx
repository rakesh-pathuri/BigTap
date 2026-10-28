import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { useLauncher } from '../context/LauncherContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { setTorchNativeAsync } from '../../modules/direct-sms';

export const NativeTorchController: React.FC = () => {
  const { torchOn } = useLauncher();
  const [permission, requestPermission] = useCameraPermissions();
  const [usingNativeTorch, setUsingNativeTorch] = useState<boolean>(false);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    if (Platform.OS === 'android') {
      setTorchNativeAsync(torchOn).then((handled) => {
        if (!isCancelled && handled) {
          setUsingNativeTorch(true);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [torchOn]);

  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      !usingNativeTorch &&
      !hasRequestedRef.current &&
      permission &&
      !permission.granted
    ) {
      hasRequestedRef.current = true;
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission, usingNativeTorch]);

  // If native setTorchMode handled it without opening camera sensor, no CameraView needed
  if (usingNativeTorch) {
    return null;
  }

  // Fallback to CameraView only in dev environments where native module is not built
  if (Platform.OS !== 'android' || !permission?.granted || !torchOn) {
    return null;
  }

  return (
    <View
      style={{
        width: 1,
        height: 1,
        opacity: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      <CameraView
        style={{ width: 1, height: 1 }}
        facing="back"
        enableTorch={true}
      />
    </View>
  );
};
