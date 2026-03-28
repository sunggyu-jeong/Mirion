import { useQuery } from '@tanstack/react-query';

async function fetchEthPriceHistory(): Promise<number[]> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=krw&days=7&interval=daily',
  );
  if (!res.ok) {
    throw new Error('ETH 차트 데이터 조회 실패');
  }
  const json = await res.json();
  return (json.prices as [number, number][]).map(([, price]) => price);
}

export function useEthPriceChart() {
  return useQuery({
    queryKey: ['ethPriceChart'],
    queryFn: fetchEthPriceHistory,
    staleTime: 5 * 60_000,
    retry: 2,
  });
}
