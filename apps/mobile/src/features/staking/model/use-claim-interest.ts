import { useLockStore } from '@entities/lock';
import { useWalletStore } from '@entities/wallet';
import { timeLockContract } from '@shared/api/contracts';
import type { Address } from 'viem';

import { savePendingTx } from './staking-utils';
import { useBiometricTransaction } from './use-biometric-transaction';

export function useClaimInterest() {
  const { address } = useWalletStore();
  const { optimisticClaimInterest } = useLockStore();
  const { execute, txState, errorMessage, reset } = useBiometricTransaction({
    biometricMessage: '이자 수령을 위해 생체 인증이 필요합니다',
  });

  const claimInterest = (keyId: string) =>
    execute({
      keyId,
      action: async (walletClient, feeOverrides) => {
        const txHash = await walletClient.writeContract({
          ...timeLockContract,
          functionName: 'claimInterest',
          ...feeOverrides,
        });
        savePendingTx(address as Address, {
          txHash,
          type: 'claimInterest',
          timestamp: Date.now(),
          status: 'pending',
        });
        optimisticClaimInterest();
        return txHash;
      },
    });

  return { claimInterest, txState, errorMessage, reset };
}
