import { useLockStore } from '@entities/lock';
import { useWalletStore } from '@entities/wallet';
import { timeLockContract } from '@shared/api/contracts';
import type { Address } from 'viem';

import { savePendingTx } from './staking-utils';
import { useBiometricTransaction } from './use-biometric-transaction';

export function useDeposit() {
  const { address } = useWalletStore();
  const { optimisticDeposit } = useLockStore();
  const { execute, txState, errorMessage, reset } = useBiometricTransaction({
    biometricMessage: '예치를 위해 생체 인증이 필요합니다',
  });

  const deposit = (amountWei: bigint, unlockTime: bigint, keyId: string) =>
    execute({
      keyId,
      action: async (walletClient, feeOverrides) => {
        const txHash = await walletClient.writeContract({
          ...timeLockContract,
          functionName: 'deposit',
          args: [unlockTime],
          value: amountWei,
          ...feeOverrides,
        });
        savePendingTx(address as Address, {
          txHash,
          type: 'deposit',
          timestamp: Date.now(),
          status: 'pending',
        });
        optimisticDeposit(amountWei, unlockTime);
        return txHash;
      },
    });

  return { deposit, txState, errorMessage, reset };
}
