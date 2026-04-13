import type { WhaleEntry, WhaleTxDTO, Prices } from '../types.js';
import { MIN_VALUE_USD, CHAIN_POLL_INTERVALS_MS } from '../config.js';
import { getPrices } from './prices.js';
import { getEthTransfers, getEthFromBlock } from './eth.js';
import { getBtcTransfers } from './btc.js';
import { getSolTransfers } from './sol.js';
import { getBnbTransfers } from './bnb.js';
import { getXrpTransfers } from './xrp.js';
import { getTrxTransfers } from './trx.js';
import { pushChainTxs } from '../notifier/chain.js';

const WHALE_LIST_TTL_MS = 24 * 60 * 60 * 1000;
const ETH_FROM_BLOCK_TTL_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15_000;

let _whaleList: WhaleEntry[] | null = null;
let _whaleFetchedAt = 0;
let _ethFromBlock = '0x0';
let _ethFromBlockFetchedAt = 0;
const _seen = new Map<string, Set<string>>();

async function fetchWhaleList(): Promise<WhaleEntry[]> {
  const now = Date.now();
  if (_whaleList && now - _whaleFetchedAt < WHALE_LIST_TTL_MS) return _whaleList;

  const workerUrl = process.env['WORKER_URL'] ?? '';
  if (!workerUrl) return _whaleList ?? [];

  const res = await fetch(`${workerUrl}/api/whales`);
  if (!res.ok) throw new Error(`Whales fetch HTTP ${res.status}`);
  _whaleList = (await res.json()) as WhaleEntry[];
  _whaleFetchedAt = now;
  return _whaleList;
}

async function refreshEthFromBlock(): Promise<string> {
  const now = Date.now();
  if (_ethFromBlock !== '0x0' && now - _ethFromBlockFetchedAt < ETH_FROM_BLOCK_TTL_MS) {
    return _ethFromBlock;
  }
  _ethFromBlock = await getEthFromBlock();
  _ethFromBlockFetchedAt = now;
  return _ethFromBlock;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms)),
  ]);
}

async function fetchForWhale(whale: WhaleEntry, prices: Prices, ethFromBlock: string): Promise<WhaleTxDTO[]> {
  switch (whale.chain) {
    case 'ETH': return getEthTransfers(whale.address, MIN_VALUE_USD, prices.eth, ethFromBlock);
    case 'BTC': return getBtcTransfers(whale.address, MIN_VALUE_USD, prices.btc);
    case 'SOL': return getSolTransfers(whale.address, MIN_VALUE_USD, prices.sol);
    case 'BNB': return getBnbTransfers(whale.address, MIN_VALUE_USD, prices.bnb);
    case 'XRP': return getXrpTransfers(whale.address, MIN_VALUE_USD, prices.xrp);
    case 'TRX': return getTrxTransfers(whale.address, MIN_VALUE_USD, prices.trx);
    default: return [];
  }
}

async function pollChain(chain: string): Promise<void> {
  const [whales, prices, ethFromBlock] = await Promise.all([
    fetchWhaleList(),
    getPrices(),
    chain === 'ETH' ? refreshEthFromBlock() : Promise.resolve(''),
  ]);

  const chainWhales = whales.filter((w) => w.chain === chain);
  if (chainWhales.length === 0) return;

  const seen = _seen.get(chain) ?? new Set<string>();
  const newTxs: WhaleTxDTO[] = [];

  const results = await Promise.allSettled(
    chainWhales.map((w) =>
      withTimeout(fetchForWhale(w, prices, ethFromBlock), FETCH_TIMEOUT_MS, `${chain}:${w.name}`),
    ),
  );

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status !== 'fulfilled') {
      console.error(`[poller] ${chain} ${chainWhales[i]?.name}: ${r.reason}`);
      continue;
    }
    for (const tx of r.value) {
      if (!seen.has(tx.txHash)) {
        seen.add(tx.txHash);
        newTxs.push(tx);
      }
    }
  }

  _seen.set(chain, seen);

  if (newTxs.length > 0) {
    await pushChainTxs(chain, newTxs);
    console.log(`[poller] ${chain}: pushed ${newTxs.length} new txs`);
  } else {
    console.log(`[poller] ${chain}: no new txs`);
  }
}

export function startChainPolling(): void {
  const chains = Object.keys(CHAIN_POLL_INTERVALS_MS) as (keyof typeof CHAIN_POLL_INTERVALS_MS)[];

  for (const chain of chains) {
    const interval = CHAIN_POLL_INTERVALS_MS[chain]!;

    pollChain(chain).catch((err) => console.error(`[poller] ${chain} initial poll error:`, err));

    setInterval(() => {
      pollChain(chain).catch((err) => console.error(`[poller] ${chain} poll error:`, err));
    }, interval);
  }
}
