import type { Env } from '../types';
import { withCache } from '../lib/cache';
import { getWhaleProfile } from '../lib/alchemy';
import { getEthPriceUsd } from '../lib/coingecko';

export async function handleWhaleProfile(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');

  if (!address) {
    return Response.json({ error: 'address required' }, { status: 400 });
  }

  const cacheKey = `whale-profile:${address.toLowerCase()}`;
  const data = await withCache(env.CACHE, cacheKey, 300, async () => {
    const ethPriceUsd = await withCache(env.CACHE, 'eth-price', 60, getEthPriceUsd);
    return getWhaleProfile(address, ethPriceUsd, env);
  });

  return Response.json(data);
}
