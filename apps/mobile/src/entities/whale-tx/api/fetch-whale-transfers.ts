import { workerGet } from '@shared/api/worker';

import type { WhaleTx } from '../model/whale-tx';

export interface FetchWhaleTransfersOptions {
  minValueEth: number;
}

interface WhaleTxDTO {
  txHash: string;
  type: WhaleTx['type'];
  amountNative: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: string;
  isLarge: boolean;
  asset: string;
}

export async function fetchWhaleTransfers(
  address: string,
  opts: FetchWhaleTransfersOptions,
  chain: string = 'ETH',
): Promise<WhaleTx[]> {
  const dtos = await workerGet<WhaleTxDTO[]>('/api/whale-transfers', {
    address,
    chain,
    minValueEth: String(opts.minValueEth),
  });

  return dtos.map(dto => ({
    ...dto,
    blockNumber: BigInt(dto.blockNumber),
  }));
}
