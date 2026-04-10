import { useAppSettingsStore } from '@entities/app-settings';
import type { ChainFilter } from '@entities/whale';
import { fetchWhales } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { fetchWhaleTransfers } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

export function useWhaleMovements(chainFilter: ChainFilter = 'ALL') {
  const minValueEth = useAppSettingsStore(s => s.minDetectionEth);

  return useQuery<WhaleTx[]>({
    queryKey: ['whale-movements-global', minValueEth],
    queryFn: async () => {
      const whales = await fetchWhales();

      const results = await Promise.allSettled(
        whales.map(w => fetchWhaleTransfers(w.address, { minValueEth }, w.chain)),
      );

      const fulfilled = results.filter(
        (r): r is PromiseFulfilledResult<WhaleTx[]> => r.status === 'fulfilled',
      );

      if (fulfilled.length === 0 && results.length > 0) {
        throw new Error('All whale transfer fetches failed');
      }

      const unique = new Map<string, WhaleTx>();
      for (const tx of fulfilled.flatMap(r => r.value)) {
        unique.set(tx.txHash, tx);
      }

      const all = [...unique.values()].sort((a, b) => b.timestampMs - a.timestampMs);
      return chainFilter === 'ALL' ? all : all.filter(tx => tx.asset === chainFilter);
    },
    staleTime: 15_000,
  });
}
