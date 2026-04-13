import type { RawTokenBalance } from '@entities/whale';
import { CURATED_WHALES, fetchWhaleProfile } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { fetchWhaleTransfers } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

export interface WhaleDetailData {
  totalValueUsd: number;
  tokens: RawTokenBalance[];
  transactions: WhaleTx[];
}

export function useWhaleDetail(whaleId: string) {
  return useQuery<WhaleDetailData | undefined>({
    queryKey: ['whale-detail', whaleId],
    queryFn: async () => {
      const meta = CURATED_WHALES.find(w => w.id === whaleId);
      if (!meta) {
        return undefined;
      }

      if (meta.chain !== 'ETH') {
        return { totalValueUsd: 0, tokens: [], transactions: [] };
      }

      const [onchain, transfers] = await Promise.all([
        fetchWhaleProfile(meta.address),
        fetchWhaleTransfers(meta.address, { minValueEth: 0 }),
      ]);

      return {
        totalValueUsd: onchain.totalValueUsd,
        tokens: onchain.tokens,
        transactions: transfers,
      };
    },
    staleTime: 30_000,
  });
}
