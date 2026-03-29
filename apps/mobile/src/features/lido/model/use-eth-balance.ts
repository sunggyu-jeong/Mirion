import { publicClient } from '@shared/lib/web3/client';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

export function useEthBalance(address: string | null) {
  return useQuery({
    queryKey: ['ethBalance', address],
    queryFn: () => publicClient.getBalance({ address: address as Address }),
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
