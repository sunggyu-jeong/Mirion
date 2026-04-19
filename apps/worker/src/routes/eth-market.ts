import type { Env } from "../types";
import { withKvCache } from "../lib/cache";
import { getEthMarketData } from "../lib/coingecko";

export async function handleEthMarket(
  _request: Request,
  env: Env,
): Promise<Response> {
  const data = await withKvCache(env.CACHE, "eth-market", 10 * 60, getEthMarketData);
  return Response.json(data);
}
