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

      const profiles = results.map((result, i): WhaleProfile => {
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

      return profiles.sort((a, b) => (a.isLocked ? 1 : 0) - (b.isLocked ? 1 : 0));
    },
    staleTime: 30_000,
  });
}
