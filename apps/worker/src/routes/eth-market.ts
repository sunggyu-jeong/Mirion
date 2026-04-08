import type { Env } from '../types';
import { withCache } from '../lib/cache';
import { getEthMarketData } from '../lib/coingecko';

export async function handleEthMarket(_request: Request, env: Env): Promise<Response> {
  const data = await withCache(env.CACHE, 'eth-market', 60, getEthMarketData);
  return Response.json(data);
}
