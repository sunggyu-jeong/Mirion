import { useLockStore } from '@entities/lock';
import { useWalletStore } from '@entities/wallet';
import { timeLockContract } from '@shared/api/contracts';
import { useState } from 'react';
import type { Address } from 'viem';

import { savePendingTx } from './staking-utils';
import { useBiometricTransaction } from './use-biometric-transaction';

export function useWithdraw() {
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const { address } = useWalletStore();
  const { optimisticWithdraw } = useLockStore();
  const { execute, txState, errorMessage, reset: resetTx } = useBiometricTransaction({
    biometricMessage: '출금을 위해 생체 인증이 필요합니다',
  });

  const withdraw = (keyId: string, disclaimerAccepted: boolean) => {
    if (!disclaimerAccepted) {
      setNeedsDisclaimer(true);
      return;
    }
    return execute({
      keyId,
      action: async (walletClient, feeOverrides) => {
        const txHash = await walletClient.writeContract({
          ...timeLockContract,
          functionName: 'withdraw',
          ...feeOverrides,
        });
        savePendingTx(address as Address, {
          txHash,
          type: 'withdraw',
          timestamp: Date.now(),
          status: 'pending',
        });
        optimisticWithdraw();
        return txHash;
      },
    });
  };

  const reset = () => {
    resetTx();
    setNeedsDisclaimer(false);
  };

  return { withdraw, txState, errorMessage, needsDisclaimer, reset };
}
