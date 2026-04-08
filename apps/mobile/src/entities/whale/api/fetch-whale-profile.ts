import { workerGet } from '@shared/api/worker';

import type { RawTokenBalance, WhaleOnchainData } from '../model/whale.types';

interface WhaleProfileDTO {
  ethBalance: string;
  totalValueUsd: number;
  tokens: { contractAddress: string; rawBalance: string }[];
}

export async function fetchWhaleProfile(address: string): Promise<WhaleOnchainData> {
  const dto = await workerGet<WhaleProfileDTO>('/api/whale-profile', { address });

  const tokens: RawTokenBalance[] = dto.tokens.map(t => ({
    contractAddress: t.contractAddress,
    rawBalance: BigInt(t.rawBalance),
  }));

  return {
    ethBalance: BigInt(dto.ethBalance),
    totalValueUsd: dto.totalValueUsd,
    tokens,
  };
}
