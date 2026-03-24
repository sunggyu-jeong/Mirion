import { secureKey, useWalletStore } from '@entities/wallet';
import { createWalletClientFromKey, publicClient } from '@shared/lib/web3/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import type { Account, Chain, Hash, Transport } from 'viem';
import type { WalletClient } from 'viem';
import { UserRejectedRequestError } from 'viem';
import type { Address } from 'viem';

import type { TxState } from './staking-utils';
import { clearPendingTx, mapContractError, scheduleRefetch } from './staking-utils';

type FeeOverrides = {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

type ActionFn = (
  walletClient: WalletClient<Transport, Chain, Account>,
  feeOverrides: FeeOverrides,
) => Promise<Hash>;

type ExecuteOptions = {
  keyId: string;
  action: ActionFn;
};

export function useBiometricTransaction({ biometricMessage }: { biometricMessage: string }) {
  const [txState, setTxState] = useState<TxState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmitting = useRef(false);
  const queryClient = useQueryClient();
  const { address } = useWalletStore();

  const execute = async ({ keyId, action }: ExecuteOptions) => {
    if (isSubmitting.current || !address) return;
    isSubmitting.current = true;
    setErrorMessage(null);

    try {
      setTxState('biometric');
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) throw new Error('biometric_unavailable');

      const { success } = await rnBiometrics.simplePrompt({ promptMessage: biometricMessage });
      if (!success) {
        setTxState('idle');
        return;
      }

      setTxState('broadcasting');
      let privateKey: string | null = null;
      try {
        privateKey = await secureKey.retrieve(keyId);
        if (!privateKey) throw new Error('key_not_found');

        const walletClient = createWalletClientFromKey(`0x${privateKey}`);
        const fees = await publicClient.estimateFeesPerGas();
        const feeOverrides: FeeOverrides = {
          ...(fees.maxFeePerGas && { maxFeePerGas: (fees.maxFeePerGas * 110n) / 100n }),
          ...(fees.maxPriorityFeePerGas && {
            maxPriorityFeePerGas: (fees.maxPriorityFeePerGas * 110n) / 100n,
          }),
        };

        const txHash = await action(walletClient, feeOverrides);
        setTxState('pending');

        try {
          await publicClient.waitForTransactionReceipt({
            hash: txHash,
            retryCount: 10,
            pollingInterval: 6_000,
          });
          clearPendingTx(address as Address);
          scheduleRefetch(queryClient, address as Address);
          setTxState('success');
        } catch {
          // receipt timeout — MMKV에 txHash 보관 중, use-pending-tx가 복구
        }
      } finally {
        privateKey = null;
      }
    } catch (error) {
      if (error instanceof UserRejectedRequestError) {
        setTxState('idle');
        return;
      }
      setTxState('error');
      setErrorMessage(mapContractError(error));
    } finally {
      isSubmitting.current = false;
    }
  };

  const reset = () => {
    setTxState('idle');
    setErrorMessage(null);
  };

  return { execute, txState, errorMessage, reset, address };
}
