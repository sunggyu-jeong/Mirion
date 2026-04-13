import type { WhaleTxDTO } from '../types.js';

const BLOCKS_PER_DAY = 7200;
const LOOKBACK_DAYS = 30;

interface AlchemyRpcResponse<T> {
  result?: T;
  error?: { message: string };
}

interface AlchemyTransfer {
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  blockNum: string;
  metadata: { blockTimestamp: string };
}

interface AlchemyTransfersResponse {
  transfers: AlchemyTransfer[];
}

async function alchemyPost<T>(method: string, params: unknown[]): Promise<T> {
  const apiKey = process.env['ALCHEMY_API_KEY'] ?? '';
  const network = process.env['ALCHEMY_NETWORK'] ?? 'eth-mainnet';
  const res = await fetch(`https://${network}.g.alchemy.com/v2/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  });
  if (!res.ok) throw new Error(`Alchemy HTTP ${res.status}`);
  const json = (await res.json()) as AlchemyRpcResponse<T>;
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

export async function getEthFromBlock(): Promise<string> {
  const hex = await alchemyPost<string>('eth_blockNumber', []);
  return '0x' + Math.max(0, parseInt(hex, 16) - BLOCKS_PER_DAY * LOOKBACK_DAYS).toString(16);
}

export async function getEthTransfers(
  address: string,
  minValueUsd: number,
  ethPriceUsd: number,
  fromBlock: string,
): Promise<WhaleTxDTO[]> {
  const minValueEth = ethPriceUsd > 0 ? minValueUsd / ethPriceUsd : 0;
  const base = {
    category: ['external'],
    withMetadata: true,
    excludeZeroValue: true,
    maxCount: '0x32',
    fromBlock,
    order: 'desc',
  };

  const [outgoing, incoming] = await Promise.all([
    alchemyPost<AlchemyTransfersResponse>('alchemy_getAssetTransfers', [{ ...base, fromAddress: address }]),
    alchemyPost<AlchemyTransfersResponse>('alchemy_getAssetTransfers', [{ ...base, toAddress: address }]),
  ]);

  const merged = new Map<string, AlchemyTransfer>();
  for (const t of [...outgoing.transfers, ...incoming.transfers]) merged.set(t.hash, t);

  return [...merged.values()]
    .filter((t) => (t.value ?? 0) >= minValueEth)
    .map((raw): WhaleTxDTO => ({
      txHash: raw.hash,
      type: raw.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
      amountNative: raw.value ?? 0,
      amountUsd: (raw.value ?? 0) * ethPriceUsd,
      fromAddress: raw.from,
      toAddress: raw.to ?? '',
      timestampMs: new Date(raw.metadata.blockTimestamp).getTime(),
      blockNumber: raw.blockNum,
      isLarge: true,
      asset: raw.asset ?? 'ETH',
      chain: 'ETH',
    }));
}
