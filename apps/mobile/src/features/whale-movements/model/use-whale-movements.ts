import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { fetchRadarTransactions } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

export function useWhaleMovements(chainFilter: ChainFilter = 'ALL') {
  return useQuery<WhaleTx[], Error, WhaleTx[]>({
    queryKey: ['radar'],
    queryFn: () => fetchRadarTransactions(),
    select: all => (chainFilter === 'ALL' ? all : all.filter(tx => tx.asset === chainFilter)),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
