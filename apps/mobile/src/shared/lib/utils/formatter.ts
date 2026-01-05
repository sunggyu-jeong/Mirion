import { formatEther } from 'viem';

export const formatEthAmount = (wei: bigint | string): string => {
  return parseInt(formatEther(BigInt(wei))).toFixed(4);
};
