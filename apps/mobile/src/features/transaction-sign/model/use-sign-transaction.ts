import { secureKey } from '@entities/wallet';
import ReactNativeBiometrics from 'react-native-biometrics';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export function useSignTransaction() {
  const sign = async (keyId: string, txHash: Hex): Promise<Hex> => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available } = await rnBiometrics.isSensorAvailable();
    if (!available) {
      throw new Error('biometric_unavailable');
    }

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: '트랜잭션 서명을 위해 생체 인증이 필요합니다',
    });
    if (!success) {
      throw new Error('biometric_cancelled');
    }

    let privateKey: string | null = null;
    try {
      privateKey = await secureKey.retrieve(keyId);
      if (!privateKey) {
        throw new Error('key_not_found');
      }
      const account = privateKeyToAccount(`0x${privateKey}` as Hex);
      return await account.signMessage({ message: { raw: txHash } });
    } finally {
      privateKey = null;
    }
  };

  return { sign };
}
