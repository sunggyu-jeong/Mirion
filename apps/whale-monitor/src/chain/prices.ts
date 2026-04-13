import type { Prices } from '../types.js';

const BASE = 'https://api.coingecko.com/api/v3';
const TTL_MS = 5 * 60 * 1000;

let _cached: Prices | null = null;
let _cachedAt = 0;

export async function getPrices(): Promise<Prices> {
  const now = Date.now();
  if (_cached && now - _cachedAt < TTL_MS) return _cached;

  const apiKey = process.env['COINGECKO_API_KEY'];
  const headers: Record<string, string> = {};
  if (apiKey) headers['x-cg-demo-api-key'] = apiKey;

  const res = await fetch(
    `${BASE}/simple/price?ids=ethereum,bitcoin,solana,binancecoin,ripple,tron&vs_currencies=usd`,
    { headers },
  );
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);

  const json = (await res.json()) as Record<string, { usd: number }>;
  _cached = {
    eth: json['ethereum']?.usd ?? 0,
    btc: json['bitcoin']?.usd ?? 0,
    sol: json['solana']?.usd ?? 0,
    bnb: json['binancecoin']?.usd ?? 0,
    xrp: json['ripple']?.usd ?? 0,
    trx: json['tron']?.usd ?? 0,
  };
  _cachedAt = now;
  return _cached;
}
