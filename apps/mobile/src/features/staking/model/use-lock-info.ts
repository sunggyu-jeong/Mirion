import { useLockStore } from '@entities/lock';
import { timeLockContract } from '@shared/api/contracts';
import { publicClient } from '@shared/lib/web3/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Address } from 'viem';

import { withRetry } from './staking-utils';

export function useLockInfo(address: Address | null) {
  const { setLockInfo, setPendingReward } = useLockStore();

  const query = useQuery({
    queryKey: ['lockInfo', address],
    queryFn: async () => {
      const [balance, unlockTime] = await withRetry(() =>
        publicClient.readContract({
          ...timeLockContract,
          functionName: 'getLockInfo',
          args: [address!],
        }),
      );
      const pendingReward = await withRetry(() =>
        publicClient.readContract({
          ...timeLockContract,
          functionName: 'pendingReward',
          args: [address!],
        }),
      );
      return { balance, unlockTime, pendingReward };
    },
    enabled: !!address,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (query.data) {
      setLockInfo(query.data.balance, query.data.unlockTime);
      setPendingReward(query.data.pendingReward);
    }
  }, [query.data, setLockInfo, setPendingReward]);

  return query;
}
