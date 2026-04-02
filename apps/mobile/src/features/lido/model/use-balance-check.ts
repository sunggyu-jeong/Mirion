import { publicClient } from '@shared/lib/web3/client';
import { useCallback } from 'react';
import type { Address } from 'viem';
import { parseEther } from 'viem';

export function useBalanceCheck() {
  return useCallback(async (address: string, amountEth: string): Promise<boolean> => {
    const balance = await publicClient.getBalance({ address: address as Address });
    return balance >= parseEther(amountEth);
  }, []);
}
