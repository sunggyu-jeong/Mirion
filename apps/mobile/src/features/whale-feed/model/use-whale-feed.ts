import type { WhaleProfile } from '@entities/whale';
import { CURATED_WHALES } from '@entities/whale';
import { useQuery } from '@tanstack/react-query';

export function useWhaleFeed() {
  return useQuery<WhaleProfile[]>({
    queryKey: ['whale-feed'],
    queryFn: async () => CURATED_WHALES,
    staleTime: 30_000,
  });
}
