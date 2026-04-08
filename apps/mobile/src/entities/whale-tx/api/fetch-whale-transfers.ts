import type { AlchemyClient } from '@shared/api/alchemy';
import type { AlchemyAssetTransfersResponse, AlchemyTransferRaw } from '@shared/api/alchemy';

import type { WhaleTx, WhaleTxType } from '../model/whale-tx';

export interface FetchWhaleTransfersOptions {
  minValueEth: number;
  pageSize?: number;
}

function resolveType(raw: AlchemyTransferRaw, address: string): WhaleTxType {
  return raw.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive';
}

function toWhaleTx(raw: AlchemyTransferRaw, address: string, minValueEth: number): WhaleTx {
  const amountEth = raw.value ?? 0;
  return {
    txHash: raw.hash,
    type: resolveType(raw, address),
    amountEth,
    amountUsd: 0,
    fromAddress: raw.from,
    toAddress: raw.to ?? '',
    timestampMs: new Date(raw.metadata.blockTimestamp).getTime(),
    blockNumber: BigInt(raw.blockNum),
    isLarge: amountEth >= minValueEth,
    asset: raw.asset ?? 'ETH',
  };
}

export async function fetchWhaleTransfers(
  address: string,
  opts: FetchWhaleTransfersOptions,
  client: AlchemyClient,
): Promise<WhaleTx[]> {
  const maxCount = opts.pageSize ? `0x${opts.pageSize.toString(16)}` : '0x14';

  const params = {
    fromAddress: address,
    category: ['external', 'internal', 'erc20'],
    withMetadata: true,
    excludeZeroValue: true,
    maxCount,
  };

  const [outgoing, incoming] = await Promise.all([
    client.request<AlchemyAssetTransfersResponse>('alchemy_getAssetTransfers', [params]),
    client.request<AlchemyAssetTransfersResponse>('alchemy_getAssetTransfers', [
      { ...params, fromAddress: undefined, toAddress: address },
    ]),
  ]);

  const merged = new Map<string, AlchemyTransferRaw>();
  for (const t of [...outgoing.transfers, ...incoming.transfers]) {
    merged.set(t.hash, t);
  }

  return [...merged.values()]
    .filter(t => (t.value ?? 0) >= opts.minValueEth)
    .map(t => toWhaleTx(t, address, opts.minValueEth));
}
