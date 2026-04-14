import type { Env } from "../types";
import { withCache } from "../lib/cache";
import { getWhaleProfile } from "../lib/alchemy";
import { getBtcProfile } from "../lib/blockstream";
import { getSolProfile } from "../lib/solana";
import { getXrpProfile } from "../lib/xrpl";
import { getTrxProfile } from "../lib/trongrid";
import { getMultiCoinPrices } from "../lib/coingecko";

const FALLBACK_PROFILE = { nativeBalance: "0", totalValueUsd: 0, tokens: [] };

async function fetchProfile(chain: string, address: string, env: Env) {
  const prices = await withCache("prices:multi", 10 * 60, getMultiCoinPrices);
  if (chain === "BTC") return getBtcProfile(address, prices.btc);
  if (chain === "SOL") return getSolProfile(address, prices.sol, env.HELIUS_API_KEY);
  if (chain === "XRP") return getXrpProfile(address, prices.xrp);
  if (chain === "TRX") return getTrxProfile(address, prices.trx, env.TRONGRID_API_KEY);
  if (chain === "BNB") return getWhaleProfile(address, prices.bnb, { ...env, ALCHEMY_NETWORK: "bnb-mainnet" });
  return getWhaleProfile(address, prices.eth, env);
}

export async function handleWhaleProfile(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const chain = (url.searchParams.get("chain") ?? "ETH").toUpperCase();

  if (!address) {
    return Response.json({ error: "address required" }, { status: 400 });
  }

  try {
    const cacheKey = `whale-profile:${chain}:${address.toLowerCase()}`;
    const data = await withCache(cacheKey, 300, () =>
      fetchProfile(chain, address, env),
    );
    return Response.json(data);
  } catch {
    return Response.json(FALLBACK_PROFILE);
  }
}
