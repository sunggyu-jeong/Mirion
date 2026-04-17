import type { Env } from "../types";
import { kvPut } from "../lib/cache";
import { getMultiCoinPrices, getEthMarketData, getEthMarketChart } from "../lib/coingecko";

const TTL = 15 * 60;

export async function warmPricesAndMarket(env: Env): Promise<void> {
  await Promise.allSettled([
    getMultiCoinPrices().then((v) => kvPut(env.CACHE, "prices:multi", v, TTL)),
    getEthMarketData().then((v) => kvPut(env.CACHE, "eth-market", v, TTL)),
    getEthMarketChart("1D").then((v) => kvPut(env.CACHE, "eth-chart:1D", v, TTL)),
    getEthMarketChart("1W").then((v) => kvPut(env.CACHE, "eth-chart:1W", v, TTL)),
    getEthMarketChart("1M").then((v) => kvPut(env.CACHE, "eth-chart:1M", v, TTL)),
  ]);
}
