import type { EthMarketDTO, PricePointDTO } from '../types';

const BASE = 'https://api.coingecko.com/api/v3';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getEthPriceUsd(): Promise<number> {
  const json = await getJson<{ ethereum: { usd: number } }>(
    `${BASE}/simple/price?ids=ethereum&vs_currencies=usd`,
  );
  return json.ethereum.usd;
}

const PERIOD_DAYS: Record<string, number> = { '1D': 1, '1W': 7, '1M': 30 };

export async function getEthMarketChart(period: string): Promise<PricePointDTO[]> {
  const days = PERIOD_DAYS[period];
  if (!days) throw new Error(`Invalid period: ${period}`);

  const json = await getJson<{ prices: [number, number][] }>(
    `${BASE}/coins/ethereum/market_chart?vs_currency=usd&days=${days}`,
  );
  return json.prices.map(([timestampMs, price]) => ({ timestampMs, price }));
}

export async function getEthMarketData(): Promise<EthMarketDTO> {
  const json = await getJson<{
    market_data: {
      current_price: { usd: number };
      price_change_percentage_24h: number;
      market_cap: { usd: number };
      total_volume: { usd: number };
    };
  }>(
    `${BASE}/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
  );
  return {
    priceUsd: json.market_data.current_price.usd,
    change24h: json.market_data.price_change_percentage_24h,
    marketCapUsd: json.market_data.market_cap.usd,
    volume24hUsd: json.market_data.total_volume.usd,
  };
}
