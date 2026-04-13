import type { PriceChartPeriod, PricePoint } from '@shared/api/coingecko';
import { fetchEthMarketChart } from '@shared/api/coingecko';
import { useQuery } from '@tanstack/react-query';

export function useMarketChart(period: PriceChartPeriod) {
  return useQuery<PricePoint[]>({
    queryKey: ['eth-market-chart', period],
    queryFn: () => fetchEthMarketChart(period),
    staleTime: 5 * 60_000,
  });
}
