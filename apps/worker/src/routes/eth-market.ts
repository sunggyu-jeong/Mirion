import type { Env } from "../types";
import { withCache } from "../lib/cache";
import { getEthMarketData } from "../lib/coingecko";

export async function handleEthMarket(
  _request: Request,
  _env: Env,
): Promise<Response> {
  const data = await withCache("eth-market", 5 * 60, getEthMarketData);
  return Response.json(data);
}
