import { storage } from '@shared/lib/storage';
import { useQuery } from '@tanstack/react-query';

const CACHE_KEY = 'eth-price-cache';

type EthPriceResult = {
  price: string;
  change: string;
  isPositive: boolean;
};

async function fetchEthPrice(): Promise<EthPriceResult> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=krw&include_24hr_change=true',
    );
    if (!res.ok) {
      throw new Error('ETH 시세 조회 실패');
    }
    const json = await res.json();
    const krw: number = json.ethereum.krw;
    const change: number = json.ethereum.krw_24h_change;
    const isPositive = change >= 0;
    const result: EthPriceResult = {
      price: `₩${Math.round(krw).toLocaleString('ko-KR')}`,
      change: `${isPositive ? '▲' : '▼'} ${isPositive ? '+' : ''}${change.toFixed(1)}%`,
      isPositive,
    };
    storage.set(CACHE_KEY, JSON.stringify(result));
    return result;
  } catch {
    const cached = storage.getString(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as EthPriceResult;
    }
    throw new Error('ETH 시세를 불러올 수 없습니다');
  }
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
