import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

export interface DeviceStatus {
  batteryLevel: number; // 0 to 100
  isCharging: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
  networkName: string;
}

export const useDeviceStatus = (): DeviceStatus => {
  const [status, setStatus] = useState<DeviceStatus>({
    batteryLevel: 85,
    isCharging: false,
    networkType: 'cellular',
    networkName: 'Mobile Signal',
  });

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        // Battery check
        if (Platform.OS !== 'web') {
          const level = await Battery.getBatteryLevelAsync();
          const state = await Battery.getBatteryStateAsync();
          const isCharging =
            state === Battery.BatteryState.CHARGING ||
            state === Battery.BatteryState.FULL;
          const batteryPercent = level >= 0 ? Math.round(level * 100) : 85;

          // Network check
          const netState = await Network.getNetworkStateAsync();
          let netType: 'wifi' | 'cellular' | 'none' = 'cellular';
          let netName = 'Mobile Signal';

          if (!netState.isConnected) {
            netType = 'none';
            netName = 'No Signal';
          } else if (netState.type === Network.NetworkStateType.WIFI) {
            netType = 'wifi';
            netName = 'Wi-Fi';
          } else {
            netType = 'cellular';
            netName = 'Mobile Signal';
          }

          if (isMounted) {
            setStatus({
              batteryLevel: batteryPercent,
              isCharging,
              networkType: netType,
              networkName: netName,
            });
          }
        } else {
          // Web battery API if available
          if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
            try {
              const navBattery: any = await (navigator as any).getBattery();
              if (isMounted) {
                setStatus((prev) => ({
                  ...prev,
                  batteryLevel: Math.round(navBattery.level * 100),
                  isCharging: navBattery.charging,
                  networkName: 'Mobile Signal',
                }));
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Device status lookup:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
};
