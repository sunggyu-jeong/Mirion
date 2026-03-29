import { useLidoStore } from '@entities/lido';
import { lidoContract } from '@shared/api/contracts';
import { publicClient } from '@shared/lib/web3/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Address } from 'viem';

const LIDO_APY_API = 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma';

async function fetchLidoApy(): Promise<number> {
  try {
    const res = await fetch(LIDO_APY_API);
    const json = await res.json();
    return json?.data?.smaApr ?? 0;
  } catch {
    return 0;
  }
}

export function useLidoInfo(address: Address | null) {
  const { setStakedBalance, setEstimatedApy } = useLidoStore();

  const balanceQuery = useQuery({
    queryKey: ['lidoBalance', address],
    queryFn: () =>
      publicClient.readContract({
        ...lidoContract,
        functionName: 'balanceOf',
        args: [address!],
      }),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const apyQuery = useQuery({
    queryKey: ['lidoApy'],
    queryFn: fetchLidoApy,
    staleTime: 60_000 * 5,
  });

  useEffect(() => {
    if (balanceQuery.data !== undefined) {
      setStakedBalance(balanceQuery.data);
    }
  }, [balanceQuery.data, setStakedBalance]);

  useEffect(() => {
    if (apyQuery.data !== undefined) {
      setEstimatedApy(apyQuery.data);
    }
  }, [apyQuery.data, setEstimatedApy]);

  return { balanceQuery, apyQuery };
}
