import type { Env } from "../types";
import { withCache } from "../lib/cache";
import { getWhaleTransfers } from "../lib/alchemy";
import { getBtcTransfers } from "../lib/blockstream";
import { getSolTransfers } from "../lib/solana";
import { getXrpTransfers } from "../lib/xrpl";
import { getTrxTransfers } from "../lib/trongrid";
import { getMultiCoinPrices } from "../lib/coingecko";

async function fetchTransfers(
  chain: string,
  address: string,
  minValueEth: number,
  env: Env,
) {
  const prices = await withCache(env.CACHE, "multi-prices", 60, getMultiCoinPrices);
  const minValueUsd = minValueEth * prices.eth;

  if (chain === "BTC") return getBtcTransfers(address, minValueUsd, prices.btc);
  if (chain === "SOL") return getSolTransfers(address, minValueUsd, prices.sol, env.HELIUS_API_KEY);
  if (chain === "XRP") return getXrpTransfers(address, minValueUsd, prices.xrp);
  if (chain === "TRX") return getTrxTransfers(address, minValueUsd, prices.trx, env.TRONGRID_API_KEY);
  if (chain === "BNB") return getWhaleTransfers(address, minValueEth, { ...env, ALCHEMY_NETWORK: "bnb-mainnet" }, prices.bnb);
  return getWhaleTransfers(address, minValueEth, env, prices.eth);
}

export async function handleWhaleTransfers(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const chain = (url.searchParams.get("chain") ?? "ETH").toUpperCase();
  const minValueEth = Number(url.searchParams.get("minValueEth") ?? "100");

  if (!address) {
    return Response.json({ error: "address required" }, { status: 400 });
  }

  try {
    const cacheKey = `whale-transfers:${chain}:${address.toLowerCase()}:${minValueEth}`;
    const data = await withCache(env.CACHE, cacheKey, 300, () =>
      fetchTransfers(chain, address, minValueEth, env),
    );
    return Response.json(data);
  } catch {
    return Response.json([]);
  }
}
