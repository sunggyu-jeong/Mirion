import type { CexTrade } from '@entities/cex-trade';
import { fetchCexTrades } from '@entities/cex-trade';
import { useQuery } from '@tanstack/react-query';

export function useCexTrades() {
  return useQuery<CexTrade[]>({
    queryKey: ['cex-trades'],
    queryFn: fetchCexTrades,
    staleTime: 120_000,
    refetchInterval: 120_000,
  });
}
