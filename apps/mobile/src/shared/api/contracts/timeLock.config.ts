import Config from 'react-native-config';
import type { Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

import { timeLockAbi } from './timeLock.abi';

export const CHAIN = Number(Config.CHAIN_ID) === 8453 ? base : baseSepolia;

export const TIMELOCK_ADDRESS = (Config.TIMELOCK_CONTRACT_ADDRESS ?? '0x') as Address;

export const timeLockContract = {
  address: TIMELOCK_ADDRESS,
  abi: timeLockAbi,
} as const;
