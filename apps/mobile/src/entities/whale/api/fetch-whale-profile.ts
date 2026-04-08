import type { AlchemyClient } from '@shared/api/alchemy';
import type { AlchemyTokenBalancesResponse } from '@shared/api/alchemy';

import type { RawTokenBalance, WhaleOnchainData } from '../model/whale.types';

const WEI_PER_ETH = 1_000_000_000_000_000_000n;

export async function fetchWhaleProfile(
  address: string,
  client: AlchemyClient,
  ethPriceUsd: number,
): Promise<WhaleOnchainData> {
  const [balanceHex, tokenData] = await Promise.all([
    client.request<string>('eth_getBalance', [address, 'latest']),
    client.request<AlchemyTokenBalancesResponse>('alchemy_getTokenBalances', [address, 'erc20']),
  ]);

  const ethBalance = BigInt(balanceHex);
  const ethAmount = Number(ethBalance) / Number(WEI_PER_ETH);
  const totalValueUsd = ethAmount * ethPriceUsd;

  const tokens: RawTokenBalance[] = tokenData.tokenBalances
    .filter(t => BigInt(t.tokenBalance) !== 0n)
    .map(t => ({
      contractAddress: t.contractAddress,
      rawBalance: BigInt(t.tokenBalance),
    }));

  return { ethBalance, totalValueUsd, tokens };
}
