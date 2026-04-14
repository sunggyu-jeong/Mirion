import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { fetchRadarTransactions } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

export function useWhaleMovements(chainFilter: ChainFilter = 'ALL') {
  return useQuery<WhaleTx[], Error, WhaleTx[]>({
    queryKey: ['radar', chainFilter],
    queryFn: () => fetchRadarTransactions(chainFilter === 'ALL' ? undefined : [chainFilter]),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
