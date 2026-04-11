import type { Env, WhaleTxDTO } from "../types";
import { withCache } from "../lib/cache";
import { getWhaleTransfers } from "../lib/alchemy";
import { getBtcTransfers } from "../lib/blockstream";
import { getSolTransfers } from "../lib/solana";
import { getXrpTransfers } from "../lib/xrpl";
import { getTrxTransfers } from "../lib/trongrid";
import { getMultiCoinPrices } from "../lib/coingecko";
import { getWhaleList } from "./whales";
import type { WhaleEntry } from "./whales";

const RECENCY_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_MIN_VALUE_USD = 20_000;
const CACHE_TTL = 300; // 5분

async function fetchTransfersForWhale(
  whale: WhaleEntry,
  minValueUsd: number,
  prices: { eth: number; btc: number; sol: number; bnb: number; xrp: number; trx: number },
  env: Env,
): Promise<WhaleTxDTO[]> {
  switch (whale.chain) {
    case "ETH": {
      const minValueEth = minValueUsd / prices.eth;
      return getWhaleTransfers(whale.address, minValueEth, env, prices.eth);
    }
    case "BNB": {
      const minValueEth = minValueUsd / prices.bnb;
      return getWhaleTransfers(
        whale.address,
        minValueEth,
        { ...env, ALCHEMY_NETWORK: "bnb-mainnet" },
        prices.bnb,
      );
    }
    case "BTC":
      return getBtcTransfers(whale.address, minValueUsd, prices.btc);
    case "SOL":
      return getSolTransfers(whale.address, minValueUsd, prices.sol, env.HELIUS_API_KEY);
    case "XRP":
      return getXrpTransfers(whale.address, minValueUsd, prices.xrp);
    case "TRX":
      return getTrxTransfers(whale.address, minValueUsd, prices.trx, env.TRONGRID_API_KEY);
    default:
      return [];
  }
}

export async function handleRadar(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const chainsParam = url.searchParams.get("chains");
  const minValueUsd = Number(url.searchParams.get("min_value_usd") ?? DEFAULT_MIN_VALUE_USD);

  const requestedChains = chainsParam
    ? new Set(chainsParam.split(",").map((c) => c.toUpperCase()))
    : null;

  const cacheKey = `radar:${requestedChains ? [...requestedChains].sort().join(",") : "ALL"}:${minValueUsd}`;

  try {
    const data = await withCache(env.CACHE, cacheKey, CACHE_TTL, async () => {
      const [whales, prices] = await Promise.all([
        getWhaleList(env),
        getMultiCoinPrices(),
      ]);

      const fullPrices = {
        eth: prices.eth,
        btc: prices.btc,
        sol: prices.sol,
        bnb: prices.bnb,
        xrp: prices.xrp ?? 0.5,
        trx: prices.trx ?? 0.1,
      };

      const filtered = requestedChains
        ? whales.filter((w) => requestedChains.has(w.chain))
        : whales;

      const results = await Promise.allSettled(
        filtered.map((w) => fetchTransfersForWhale(w, minValueUsd, fullPrices, env)),
      );

      const cutoff = Date.now() - RECENCY_MS;
      const unique = new Map<string, WhaleTxDTO>();
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const tx of r.value) {
          if (tx.timestampMs >= cutoff) unique.set(tx.txHash, tx);
        }
      }

      return [...unique.values()].sort((a, b) => b.timestampMs - a.timestampMs);
    });

    return Response.json(data);
  } catch {
    return Response.json([]);
  }
}
