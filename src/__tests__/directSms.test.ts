describe('DirectSms Module Wrapper Contract', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('calls setTorchNative when available on native module', async () => {
    const mockSetTorchNative = jest.fn().mockResolvedValue(true);

    jest.doMock('expo-modules-core', () => ({
      requireNativeModule: () => ({
        setTorchNative: mockSetTorchNative,
      }),
    }));

    const { setTorchNativeAsync } = await import('../../modules/direct-sms');

    const result = await setTorchNativeAsync(true);
    expect(result).toBe(true);
    expect(mockSetTorchNative).toHaveBeenCalledWith(true);
  });

  it('falls back to setTorchMode when setTorchNative is not defined', async () => {
    const mockSetTorchMode = jest.fn().mockResolvedValue(true);

    jest.doMock('expo-modules-core', () => ({
      requireNativeModule: () => ({
        setTorchMode: mockSetTorchMode,
      }),
    }));

    const { setTorchNativeAsync } = await import('../../modules/direct-sms');

    const result = await setTorchNativeAsync(false);
    expect(result).toBe(true);
    expect(mockSetTorchMode).toHaveBeenCalledWith(false);
  });

  it('returns false and logs error when native torch method throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockFaultyTorch = jest.fn().mockRejectedValue(new Error('Camera hardware locked'));

    jest.doMock('expo-modules-core', () => ({
      requireNativeModule: () => ({
        setTorchNative: mockFaultyTorch,
      }),
    }));

    const { setTorchNativeAsync } = await import('../../modules/direct-sms');

    const result = await setTorchNativeAsync(true);
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('calls sendDirectSms with sanitized phone number and message', async () => {
    const mockSendSms = jest.fn().mockResolvedValue(true);

    jest.doMock('expo-modules-core', () => ({
      requireNativeModule: () => ({
        sendDirectSms: mockSendSms,
      }),
    }));

    const { sendDirectSmsAsync } = await import('../../modules/direct-sms');

    const result = await sendDirectSmsAsync('+919876543210', 'Emergency Help Needed');
    expect(result).toBe(true);
    expect(mockSendSms).toHaveBeenCalledWith('+919876543210', 'Emergency Help Needed');
  });

  it('returns false if native module is unavailable (e.g., Web/Expo Go)', async () => {
    jest.doMock('expo-modules-core', () => ({
      requireNativeModule: () => {
        throw new Error('Module not found');
      },
    }));

    const { setTorchNativeAsync, sendDirectSmsAsync } = await import(
      '../../modules/direct-sms'
    );

    expect(await setTorchNativeAsync(true)).toBe(false);
    expect(await sendDirectSmsAsync('+919876543210', 'Help')).toBe(false);
  });
});
