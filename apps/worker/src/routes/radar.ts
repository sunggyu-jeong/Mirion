import type { Env, WhaleTxDTO } from "../types";
import { getEthFromBlock, getWhaleTransfers } from "../lib/alchemy";
import { getBtcTransfers } from "../lib/blockstream";
import { getBnbTransfers } from "../lib/bscscan";
import { getSolTransfers } from "../lib/solana";
import { getXrpTransfers } from "../lib/xrpl";
import { getTrxTransfers } from "../lib/trongrid";
import { getMultiCoinPrices } from "../lib/coingecko";
import { getWhaleList } from "./whales";
import type { WhaleEntry } from "./whales";

const CHAIN_ORDER = ["ETH", "BTC", "SOL", "BNB", "XRP", "TRX"] as const;
const CHAIN_CACHE_TTL = 5 * 60;
const PRICE_CACHE_TTL = 2 * 60;
const EMPTY_CACHE_TTL = 60;
const DEFAULT_MIN_VALUE_USD = 20_000;
const FETCH_TIMEOUT_MS = 10_000;
const RECENCY_MS = 90 * 24 * 60 * 60 * 1000;

type Prices = {
  eth: number; btc: number; sol: number;
  bnb: number; xrp: number; trx: number;
};

async function getCachedPrices(env: Env): Promise<Prices> {
  const cached = await env.CACHE.get<Prices>("coingecko:prices", "json");
  if (cached) return cached;
  const raw = await getMultiCoinPrices();
  const prices: Prices = {
    eth: raw.eth, btc: raw.btc, sol: raw.sol,
    bnb: raw.bnb, xrp: raw.xrp ?? 0.5, trx: raw.trx ?? 0.1,
  };
  await env.CACHE.put("coingecko:prices", JSON.stringify(prices), {
    expirationTtl: PRICE_CACHE_TTL,
  });
  return prices;
}

async function fetchTransfersForWhale(
  whale: WhaleEntry,
  minValueUsd: number,
  prices: Prices,
  env: Env,
  fromBlock?: string,
): Promise<WhaleTxDTO[]> {
  switch (whale.chain) {
    case "ETH": {
      const minValueEth = minValueUsd / prices.eth;
      return getWhaleTransfers(whale.address, minValueEth, env, prices.eth, fromBlock);
    }
    case "BNB":
      return getBnbTransfers(whale.address, minValueUsd, prices.bnb, env.MORALIS_API_KEY);
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

async function fetchChain(
  chain: string,
  whales: WhaleEntry[],
  minValueUsd: number,
  prices: Prices,
  env: Env,
): Promise<WhaleTxDTO[]> {
  const cutoff = Date.now() - RECENCY_MS;

  let fromBlock: string | undefined;
  if (chain === "ETH") {
    fromBlock = await getEthFromBlock(env);
  }

  const results = await Promise.allSettled(
    whales.map((w) =>
      Promise.race([
        fetchTransfersForWhale(w, minValueUsd, prices, env, fromBlock),
        new Promise<WhaleTxDTO[]>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: ${w.name}`)), FETCH_TIMEOUT_MS),
        ),
      ]),
    ),
  );

  const unique = new Map<string, WhaleTxDTO>();
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status !== "fulfilled") {
      console.error(`[radar] ${chain} ${whales[i]?.name}: ${r.reason}`);
      continue;
    }
    for (const tx of r.value) {
      if (tx.timestampMs >= cutoff) unique.set(tx.txHash, tx);
    }
  }

  return [...unique.values()].sort((a, b) => b.timestampMs - a.timestampMs);
}

export async function handleRadar(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const chainsParam = url.searchParams.get("chains");
  const minValueUsd = Number(url.searchParams.get("min_value_usd") ?? DEFAULT_MIN_VALUE_USD);

  const requestedChains = chainsParam
    ? new Set(chainsParam.split(",").map((c) => c.toUpperCase()))
    : null;

  const chainList = requestedChains
    ? CHAIN_ORDER.filter((c) => requestedChains.has(c))
    : [...CHAIN_ORDER];

  const whales = await getWhaleList(env);

  const allTxs: WhaleTxDTO[] = [];
  let fetchedFresh = false;
  let prices: Prices | null = null;

  for (const chain of chainList) {
    const cacheKey = `radar:v2:${chain}:${minValueUsd}`;
    const cached = await env.CACHE.get<WhaleTxDTO[]>(cacheKey, "json");

    if (cached !== null) {
      allTxs.push(...cached);
      continue;
    }

    if (fetchedFresh) continue;

    if (!prices) prices = await getCachedPrices(env);

    const chainWhales = whales.filter((w) => w.chain === chain);
    const txs = await fetchChain(chain, chainWhales, minValueUsd, prices, env);

    await env.CACHE.put(cacheKey, JSON.stringify(txs), {
      expirationTtl: txs.length > 0 ? CHAIN_CACHE_TTL : EMPTY_CACHE_TTL,
    });

    allTxs.push(...txs);
    fetchedFresh = true;
  }

  return Response.json(allTxs.sort((a, b) => b.timestampMs - a.timestampMs));
}
