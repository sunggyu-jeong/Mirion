import { workerGet } from '@shared/api/worker';

export interface PricePoint {
  timestampMs: number;
  price: number;
}

export type PriceChartPeriod = '1D' | '1W' | '1M';

export interface EthMarketData {
  priceUsd: number;
  change24h: number;
  marketCapUsd: number;
  volume24hUsd: number;
}

export async function fetchEthPriceUsd(): Promise<number> {
  const data = await workerGet<EthMarketData>('/api/eth-market');
  return data.priceUsd;
}

export async function fetchEthMarketChart(period: PriceChartPeriod): Promise<PricePoint[]> {
  return workerGet<PricePoint[]>(`/api/eth-chart/${period}`);
}

export async function fetchEthMarketData(): Promise<EthMarketData> {
  return workerGet<EthMarketData>('/api/eth-market');
}
