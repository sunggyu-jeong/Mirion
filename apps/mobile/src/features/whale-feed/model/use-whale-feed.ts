import type { WhaleProfile } from '@entities/whale';
import { CURATED_WHALES, fetchWhaleProfile } from '@entities/whale';
import { useQuery } from '@tanstack/react-query';

export function useWhaleFeed() {
  return useQuery<WhaleProfile[]>({
    queryKey: ['whale-feed'],
    queryFn: async () => {
      return Promise.all(
        CURATED_WHALES.map(async (meta): Promise<WhaleProfile> => {
          if (meta.chain !== 'ETH') {
            return {
              ...meta,
              ethBalance: 0n,
              totalValueUsd: 0,
              activityType: 'transfer',
            };
          }

          const onchain = await fetchWhaleProfile(meta.address);

          return {
            ...meta,
            ethBalance: onchain.ethBalance,
            totalValueUsd: onchain.totalValueUsd,
            activityType: 'transfer',
          };
        }),
      );
    },
    staleTime: 30_000,
  });
}
