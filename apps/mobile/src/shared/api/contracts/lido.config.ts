import type { Address } from 'viem';
import { mainnet } from 'viem/chains';

import { lidoAbi } from './lido.abi';

export const CHAIN = mainnet;

export const LIDO_ADDRESS: Address = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';

export const LIDO_REFERRAL_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

export const lidoContract = {
  address: LIDO_ADDRESS,
  abi: lidoAbi,
  chainId: mainnet.id,
} as const;
