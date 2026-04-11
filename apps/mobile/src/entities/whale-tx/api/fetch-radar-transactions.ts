import { workerGet } from '@shared/api/worker';

import type { WhaleTx } from '../model/whale-tx';

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

export async function fetchRadarTransactions(chains?: string[]): Promise<WhaleTx[]> {
  const params: Record<string, string> = {};
  if (chains && chains.length > 0) {
    params.chains = chains.join(',');
  }

  const dtos = await workerGet<WhaleTxDTO[]>('/api/radar', params);

  return dtos.map(dto => ({
    ...dto,
    blockNumber: BigInt(dto.blockNumber),
  }));
}
