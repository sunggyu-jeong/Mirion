import { useQuery } from '@tanstack/react-query';

type EthPriceResult = {
  price: string;
  change: string;
  isPositive: boolean;
};

async function fetchEthPrice(): Promise<EthPriceResult> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=krw&include_24hr_change=true',
  );
  if (!res.ok) throw new Error('ETH 시세 조회 실패');
  const json = await res.json();
  const krw: number = json.ethereum.krw;
  const change: number = json.ethereum.krw_24h_change;
  const isPositive = change >= 0;
  return {
    price: `₩${Math.round(krw).toLocaleString('ko-KR')}`,
    change: `${isPositive ? '▲' : '▼'} ${isPositive ? '+' : ''}${change.toFixed(1)}%`,
    isPositive,
  };
}

export function useEthPrice() {
  return useQuery({
    queryKey: ['ethPrice'],
    queryFn: fetchEthPrice,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 2,
  });
}
