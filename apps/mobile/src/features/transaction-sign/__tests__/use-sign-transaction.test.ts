jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@entities/wallet', () => ({
  secureKey: {
    retrieve: jest.fn(),
  },
}));

jest.mock('viem/accounts', () => ({
  privateKeyToAccount: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { secureKey } from '@entities/wallet';
import { privateKeyToAccount } from 'viem/accounts';
import { useSignTransaction } from '../model/use-sign-transaction';

const mockIsSensorAvailable = jest.fn();
const mockSimplePrompt = jest.fn();
const mockSignMessage = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(ReactNativeBiometrics).mockImplementation(() => ({
    isSensorAvailable: mockIsSensorAvailable,
    simplePrompt: mockSimplePrompt,
  }) as unknown as ReactNativeBiometrics);
  mockIsSensorAvailable.mockResolvedValue({ available: true, biometryType: 'FaceID' });
  mockSimplePrompt.mockResolvedValue({ success: true });
  jest.mocked(secureKey.retrieve).mockResolvedValue('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
  jest.mocked(privateKeyToAccount).mockReturnValue({ signMessage: mockSignMessage } as never);
  mockSignMessage.mockResolvedValue('0xsignature');
});

describe('useSignTransaction', () => {
  describe('sign', () => {
    it('생체 인증 성공 후 서명값을 반환한다', async () => {
      const { result } = renderHook(() => useSignTransaction());
      let signature: string | undefined;

      await act(async () => {
        signature = await result.current.sign('test-key', '0x1234');
      });

      expect(signature).toBe('0xsignature');
    });

    it('생체 인증 센서 미지원 시 biometric_unavailable 에러를 던진다', async () => {
      mockIsSensorAvailable.mockResolvedValue({ available: false });

      const { result } = renderHook(() => useSignTransaction());

      await expect(
        act(async () => {
          await result.current.sign('test-key', '0x1234');
        }),
      ).rejects.toThrow('biometric_unavailable');
    });

    it('생체 인증 취소 시 biometric_cancelled 에러를 던진다', async () => {
      mockSimplePrompt.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useSignTransaction());

      await expect(
        act(async () => {
          await result.current.sign('test-key', '0x1234');
        }),
      ).rejects.toThrow('biometric_cancelled');
    });

    it('개인키가 null일 때 key_not_found 에러를 던진다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue(null);

      const { result } = renderHook(() => useSignTransaction());

      await expect(
        act(async () => {
          await result.current.sign('test-key', '0x1234');
        }),
      ).rejects.toThrow('key_not_found');
    });

    it('올바른 keyId로 secureKey.retrieve를 호출한다', async () => {
      const { result } = renderHook(() => useSignTransaction());

      await act(async () => {
        await result.current.sign('my-wallet-key', '0x1234');
      });

      expect(secureKey.retrieve).toHaveBeenCalledWith('my-wallet-key');
    });

    it('개인키에 0x prefix를 붙여 privateKeyToAccount를 호출한다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue('deadbeef');

      const { result } = renderHook(() => useSignTransaction());

      await act(async () => {
        await result.current.sign('test-key', '0x1234');
      });

      expect(privateKeyToAccount).toHaveBeenCalledWith('0xdeadbeef');
    });

    it('txHash를 raw 메시지로 signMessage를 호출한다', async () => {
      const { result } = renderHook(() => useSignTransaction());

      await act(async () => {
        await result.current.sign('test-key', '0xabcd');
      });

      expect(mockSignMessage).toHaveBeenCalledWith({ message: { raw: '0xabcd' } });
    });

    it('biometric_unavailable 시 secureKey.retrieve가 호출되지 않는다', async () => {
      mockIsSensorAvailable.mockResolvedValue({ available: false });

      const { result } = renderHook(() => useSignTransaction());

      await act(async () => {
        await result.current.sign('test-key', '0x1234').catch(() => {});
      });

      expect(secureKey.retrieve).not.toHaveBeenCalled();
    });

    it('biometric_cancelled 시 secureKey.retrieve가 호출되지 않는다', async () => {
      mockSimplePrompt.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useSignTransaction());

      await act(async () => {
        await result.current.sign('test-key', '0x1234').catch(() => {});
      });

      expect(secureKey.retrieve).not.toHaveBeenCalled();
    });

    it('secureKey.retrieve 에러 시 에러가 전파된다', async () => {
      jest.mocked(secureKey.retrieve).mockRejectedValue(new Error('Keychain 접근 실패'));

      const { result } = renderHook(() => useSignTransaction());

      await expect(
        act(async () => {
          await result.current.sign('test-key', '0x1234');
        }),
      ).rejects.toThrow('Keychain 접근 실패');
    });

    it('signMessage 에러 시 에러가 전파된다', async () => {
      mockSignMessage.mockRejectedValue(new Error('서명 실패'));

      const { result } = renderHook(() => useSignTransaction());

      await expect(
        act(async () => {
          await result.current.sign('test-key', '0x1234');
        }),
      ).rejects.toThrow('서명 실패');
    });

    it('signMessage 에러 후에도 finally 블록이 실행된다', async () => {
      mockSignMessage.mockRejectedValue(new Error('서명 실패'));

      const { result } = renderHook(() => useSignTransaction());

      await act(async () => {
        await result.current.sign('test-key', '0x1234').catch(() => {});
      });

      expect(mockSignMessage).toHaveBeenCalledTimes(1);
    });

    it('isSensorAvailable 에러 시 에러가 전파된다', async () => {
      mockIsSensorAvailable.mockRejectedValue(new Error('센서 오류'));

      const { result } = renderHook(() => useSignTransaction());

      await expect(
        act(async () => {
          await result.current.sign('test-key', '0x1234');
        }),
      ).rejects.toThrow('센서 오류');
    });
  });
});
