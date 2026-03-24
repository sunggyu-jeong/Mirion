import type { TxRecord } from '@entities/lock';
import { publicClient } from '@shared/lib/web3/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { Address } from 'viem';

import {
  clearPendingTx,
  loadPendingTx,
  scheduleRefetch,
  TX_RECOVERY_THRESHOLD_MS,
} from './staking-utils';

export function usePendingTx(address: Address | null) {
  const [pendingTx, setPendingTx] = useState<TxRecord | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!address) {
      return;
    }

    const record = loadPendingTx(address);
    if (!record) {
      return;
    }

    const isExpired = Date.now() - record.timestamp >= TX_RECOVERY_THRESHOLD_MS;
    if (isExpired) {
      clearPendingTx(address);
      return;
    }

    setPendingTx(record);
    setIsRecovering(true);

    publicClient
      .waitForTransactionReceipt({
        hash: record.txHash,
        retryCount: 10,
        pollingInterval: 6_000,
      })
      .then(() => {
        clearPendingTx(address);
        setPendingTx(null);
        scheduleRefetch(queryClient, address);
      })
      .catch(() => {
        clearPendingTx(address);
        setPendingTx(null);
      })
      .finally(() => setIsRecovering(false));
  }, [address, queryClient]);

  return { pendingTx, isRecovering };
}
