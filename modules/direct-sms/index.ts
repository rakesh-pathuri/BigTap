import { requireNativeModule } from 'expo-modules-core';

let DirectSmsNative: any = null;
try {
  DirectSmsNative = requireNativeModule('DirectSms');
} catch {
  // Gracefully handles environments where native module is not compiled yet (e.g. web, Expo Go)
}

/**
 * Sends a background SMS directly via Android SmsManager.
 * Waits for carrier broadcast confirmation (RESULT_OK) before reporting success.
 * Requires android.permission.SEND_SMS.
 */
export const sendDirectSmsAsync = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
  if (DirectSmsNative?.sendDirectSms) {
    try {
      const success = await DirectSmsNative.sendDirectSms(phoneNumber, message);
      return !!success;
    } catch (err) {
      console.warn('Native direct SMS error:', err);
    }
  }
  return false;
};

/**
 * Toggles Android device flashlight LED directly via CameraManager.setTorchMode
 * without opening the camera sensor, preventing Android from displaying the green camera dot.
 */
export const setTorchNativeAsync = async (enabled: boolean): Promise<boolean> => {
  if (DirectSmsNative?.setTorchMode) {
    try {
      const success = await DirectSmsNative.setTorchMode(enabled);
      return !!success;
    } catch (err) {
      console.warn('Native setTorchMode error:', err);
    }
  }
  return false;
};
