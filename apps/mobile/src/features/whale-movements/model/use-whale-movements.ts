import { useAppSettingsStore } from '@entities/app-settings';
import { CURATED_WHALES } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { fetchWhaleTransfers } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

export function useWhaleMovements() {
  const minValueEth = useAppSettingsStore(s => s.minDetectionEth);

  return useQuery<WhaleTx[]>({
    queryKey: ['whale-movements-global', minValueEth],
    queryFn: async () => {
      const ethAddresses = CURATED_WHALES.filter(w => w.chain === 'ETH').map(w => w.address);

      const results = await Promise.allSettled(
        ethAddresses.map(addr => fetchWhaleTransfers(addr, { minValueEth })),
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

      return [...unique.values()].sort((a, b) => b.timestampMs - a.timestampMs);
    },
    staleTime: 15_000,
  });
}
