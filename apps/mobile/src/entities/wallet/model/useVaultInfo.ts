import { timeLockContract } from '@/src/shared';
import { useAccount, useReadContracts } from 'wagmi';

export const useVaultInfo = () => {
  const { address } = useAccount();

  const { data, refetch, isLoading } = useReadContracts({
    contracts: [
      {
        ...timeLockContract,
        functionName: 'balances',
        args: [address as `0x${string}`],
      },
      {
        ...timeLockContract,
        functionName: 'getLockInfo',
        args: [address as `0x${string}`],
      },
    ],
    query: {
      enabled: !!address,
      select: data => ({
        balance: data[0].result as bigint | undefined,
        startDate: data[1].result?.[0]
          ? new Date(Number(data[1].result[0]) * 1000).toISOString()
          : '',
        unlockDate: data[1].result?.[1]
          ? new Date(Number(data[1].result[1]) * 1000).toISOString()
          : '',
      }),
    },
  });

  return {
    vaultBalance: data?.balance ?? 0n,
    startDate: data?.startDate ?? '',
    unlockDate: data?.unlockDate ?? '',
    hasAssets: (data?.balance ?? 0n) > 0n,
    isLoading,
    refetch,
  };
};
