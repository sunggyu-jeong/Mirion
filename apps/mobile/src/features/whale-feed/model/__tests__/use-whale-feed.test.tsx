import type { WhaleMetadata, WhaleOnchainData } from '@entities/whale';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/whale', () => ({
  CURATED_WHALES: [
    {
      id: 'vitalik',
      name: 'Vitalik Buterin',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chain: 'ETH',
      tag: 'ETH Creator',
      isLocked: false,
    },
    {
      id: 'binance',
      name: 'Binance Hot Wallet',
      address: '0x28C6c06298d514Db089934071355E5743bf21d60',
      chain: 'ETH',
      tag: 'Exchange',
      isLocked: true,
    },
    {
      id: 'microstrategy',
      name: 'MicroStrategy',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      chain: 'BTC',
      tag: 'Institution',
      isLocked: false,
    },
  ] satisfies WhaleMetadata[],
  fetchWhaleProfile: jest.fn(),
  CHAIN_CONFIG: {
    ETH: { label: 'ETH', color: '#627EEA' },
    BTC: { label: 'BTC', color: '#F7931A' },
    SOL: { label: 'SOL', color: '#9945FF' },
    BNB: { label: 'BNB', color: '#F3BA2F' },
  },
}));

jest.mock('@shared/api/coingecko', () => ({
  fetchEthPriceUsd: jest.fn(),
}));

import { fetchWhaleProfile } from '@entities/whale';
import { fetchEthPriceUsd } from '@shared/api/coingecko';

import { useWhaleFeed } from '../use-whale-feed';

const ETH_PRICE = 2450;

const MOCK_ONCHAIN_DATA: WhaleOnchainData = {
  ethBalance: BigInt('0xDE0B6B3A7640000'),
  totalValueUsd: ETH_PRICE,
  tokens: [],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

beforeEach(() => {
  (fetchEthPriceUsd as jest.Mock).mockResolvedValue(ETH_PRICE);
  (fetchWhaleProfile as jest.Mock).mockResolvedValue(MOCK_ONCHAIN_DATA);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWhaleFeed', () => {
  it('returns isLoading true before data resolves', () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns isLoading false after data resolves', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('calls fetchEthPriceUsd once per query', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchEthPriceUsd).toHaveBeenCalledTimes(1);
  });

  it('calls fetchWhaleProfile only for ETH-chain whales', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchWhaleProfile).toHaveBeenCalledTimes(2);
  });

  it('does not call fetchWhaleProfile for non-ETH-chain whales', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const calledAddresses = (fetchWhaleProfile as jest.Mock).mock.calls.map(
      (args: unknown[]) => args[0],
    );
    expect(calledAddresses).not.toContain('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
  });

  it('returns a WhaleProfile entry for every curated whale', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(3);
  });

  it('merges onchain totalValueUsd into the ETH whale profile', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const vitalik = result.current.data?.find(w => w.id === 'vitalik');
    expect(vitalik?.totalValueUsd).toBe(ETH_PRICE);
  });

  it('preserves static metadata fields in returned profiles', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const vitalik = result.current.data?.find(w => w.id === 'vitalik');
    expect(vitalik?.name).toBe('Vitalik Buterin');
    expect(vitalik?.chain).toBe('ETH');
    expect(vitalik?.isLocked).toBe(false);
  });

  it('sets isError true when fetchEthPriceUsd rejects', async () => {
    (fetchEthPriceUsd as jest.Mock).mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
