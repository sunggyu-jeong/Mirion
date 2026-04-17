import type { Env, WhaleTxDTO } from "../types";
import { getEthFromBlock, getWhaleTransfers } from "../lib/alchemy";
import { getBtcTransfers } from "../lib/blockstream";
import { getBnbTransfers } from "../lib/bscscan";
import { getSolTransfers } from "../lib/solana";
import { getXrpTransfers } from "../lib/xrpl";
import { getTrxTransfers } from "../lib/trongrid";
import { getMultiCoinPrices } from "../lib/coingecko";
import { kvGet, kvPut, withKvCache } from "../lib/cache";
import { getWhaleList } from "./whales";
import type { WhaleEntry } from "./whales";

const CHAIN_ORDER = ["ETH", "BTC", "SOL", "BNB", "XRP", "TRX"] as const;
const CHAIN_CACHE_TTL = 15 * 60;
const PRICE_CACHE_TTL = 10 * 60;
const EMPTY_CACHE_TTL = 60;
const DEFAULT_MIN_VALUE_USD = 20_000;
const FETCH_TIMEOUT_MS = 10_000;
const RECENCY_MS = 90 * 24 * 60 * 60 * 1000;

type Prices = {
  eth: number; btc: number; sol: number;
  bnb: number; xrp: number; trx: number;
};

async function getCachedPrices(env: Env): Promise<Prices> {
  const raw = await withKvCache(env.CACHE, "prices:multi", PRICE_CACHE_TTL, getMultiCoinPrices);
  return {
    eth: raw.eth, btc: raw.btc, sol: raw.sol,
    bnb: raw.bnb, xrp: raw.xrp ?? 0.5, trx: raw.trx ?? 0.1,
  };
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
  errors?: string[],
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
      const msg = `[radar] ${chain} ${whales[i]?.name}: ${r.reason}`;
      console.error(msg);
      errors?.push(msg);
      continue;
    }
    for (const tx of r.value) {
      if (tx.timestampMs >= cutoff) unique.set(tx.txHash, tx);
    }
  }

  return [...unique.values()].sort((a, b) => b.timestampMs - a.timestampMs);
}

export async function handleRadarDebug(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const chainsParam = url.searchParams.get("chains") ?? "ETH";
  const minValueUsd = Number(url.searchParams.get("min_value_usd") ?? DEFAULT_MIN_VALUE_USD);
  const chain = chainsParam.toUpperCase();

  const whales = await getWhaleList(env);
  const chainWhales = whales.filter((w) => w.chain === chain);
  const prices = await getCachedPrices(env);
  const errors: string[] = [];

  const txs = await fetchChain(chain, chainWhales, minValueUsd, prices, env, errors);

  return Response.json({
    chain,
    whaleCount: chainWhales.length,
    txCount: txs.length,
    minValueUsd,
    prices,
    errors,
    sample: txs.slice(0, 3),
  });
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

  const [whales, cacheEntries] = await Promise.all([
    getWhaleList(env),
    Promise.all(
      chainList.map(async (chain) => {
        const key = `radar:v2:${chain}:${minValueUsd}`;
        return { chain, key, data: await kvGet<WhaleTxDTO[]>(env.CACHE, key) };
      }),
    ),
  ]);

  const cachedTxs: WhaleTxDTO[] = [];
  const uncached: { chain: string; key: string }[] = [];

  for (const entry of cacheEntries) {
    if (entry.data !== null) {
      cachedTxs.push(...entry.data);
    } else {
      uncached.push({ chain: entry.chain, key: entry.key });
    }
  }

  if (uncached.length === 0) {
    return Response.json(cachedTxs.sort((a, b) => b.timestampMs - a.timestampMs));
  }

  const prices = await getCachedPrices(env);

  const freshTxs = (
    await Promise.all(
      uncached.map(async ({ chain, key }) => {
        const chainWhales = whales.filter((w) => w.chain === chain);
        const txs = await fetchChain(chain, chainWhales, minValueUsd, prices, env);
        await kvPut(env.CACHE, key, txs, txs.length > 0 ? CHAIN_CACHE_TTL : EMPTY_CACHE_TTL);
        return txs;
      }),
    )
  ).flat();

  return Response.json(
    [...cachedTxs, ...freshTxs].sort((a, b) => b.timestampMs - a.timestampMs),
  );
}
