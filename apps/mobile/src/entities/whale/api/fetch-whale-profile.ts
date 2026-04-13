import { workerGet } from '@shared/api/worker';

import type { RawTokenBalance, WhaleOnchainData } from '../model/whale.types';

interface WhaleProfileDTO {
  nativeBalance: string;
  totalValueUsd: number;
  tokens: { contractAddress: string; rawBalance: string }[];
}

export async function fetchWhaleProfile(
  address: string,
  chain: string = 'ETH',
): Promise<WhaleOnchainData> {
  const dto = await workerGet<WhaleProfileDTO>('/api/whale-profile', { address, chain });

  const tokens: RawTokenBalance[] = dto.tokens.map(t => ({
    contractAddress: t.contractAddress,
    rawBalance: BigInt(t.rawBalance),
  }));

  return {
    nativeBalance: BigInt(dto.nativeBalance),
    totalValueUsd: dto.totalValueUsd,
    tokens,
  };
}
