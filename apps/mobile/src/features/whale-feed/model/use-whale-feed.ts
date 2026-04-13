import type { WhaleProfile } from '@entities/whale';
import { fetchWhaleProfile, fetchWhales } from '@entities/whale';
import { useQuery } from '@tanstack/react-query';

export function useWhaleFeed() {
  return useQuery<WhaleProfile[]>({
    queryKey: ['whale-feed'],
    queryFn: async () => {
      const whales = await fetchWhales();

      const results = await Promise.allSettled(
        whales.map(async (meta): Promise<WhaleProfile> => {
          const onchain = await fetchWhaleProfile(meta.address, meta.chain);
          return {
            ...meta,
            nativeBalance: onchain.nativeBalance,
            totalValueUsd: onchain.totalValueUsd,
            activityType: 'transfer',
          };
        }),
      );

      return results.map((result, i): WhaleProfile => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return {
          ...whales[i],
          nativeBalance: 0n,
          totalValueUsd: 0,
          activityType: 'transfer',
        };
      });
    },
    staleTime: 30_000,
  });
}
