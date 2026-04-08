import type { EthMarketData } from '@shared/api/coingecko';
import { fetchEthMarketData } from '@shared/api/coingecko';
import { useQuery } from '@tanstack/react-query';

export function useEthMarketData() {
  return useQuery<EthMarketData>({
    queryKey: ['eth-market-data'],
    queryFn: fetchEthMarketData,
    staleTime: 60_000,
  });
}
