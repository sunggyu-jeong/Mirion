import type { WhaleMetadata, WhaleOnchainData } from '@entities/whale';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/whale', () => ({
  fetchWhales: jest.fn(),
  fetchWhaleProfile: jest.fn(),
  CHAIN_CONFIG: {
    ETH: { label: 'ETH', color: '#627EEA' },
    BTC: { label: 'BTC', color: '#F7931A' },
    SOL: { label: 'SOL', color: '#9945FF' },
    BNB: { label: 'BNB', color: '#F3BA2F' },
  },
}));

import { fetchWhaleProfile, fetchWhales } from '@entities/whale';

import { useWhaleFeed } from '../use-whale-feed';

const MOCK_WHALES: WhaleMetadata[] = [
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
];

const MOCK_ONCHAIN_DATA: WhaleOnchainData = {
  nativeBalance: BigInt('0xDE0B6B3A7640000'),
  totalValueUsd: 2450,
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
  (fetchWhales as jest.Mock).mockResolvedValue(MOCK_WHALES);
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

  it('calls fetchWhaleProfile for every whale with address and chain', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchWhaleProfile).toHaveBeenCalledTimes(3);
    expect(fetchWhaleProfile).toHaveBeenCalledWith(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      'ETH',
    );
    expect(fetchWhaleProfile).toHaveBeenCalledWith(
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'BTC',
    );
  });

  it('returns a WhaleProfile entry for every whale', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(3);
  });

  it('merges onchain totalValueUsd into the whale profile', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const vitalik = result.current.data?.find(w => w.id === 'vitalik');
    expect(vitalik?.totalValueUsd).toBe(2450);
  });

  it('preserves static metadata fields in returned profiles', async () => {
    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const vitalik = result.current.data?.find(w => w.id === 'vitalik');
    expect(vitalik?.name).toBe('Vitalik Buterin');
    expect(vitalik?.chain).toBe('ETH');
    expect(vitalik?.isLocked).toBe(false);
  });

  it('falls back to zero balances when fetchWhaleProfile rejects for a whale', async () => {
    (fetchWhaleProfile as jest.Mock).mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const vitalik = result.current.data?.find(w => w.id === 'vitalik');
    expect(vitalik?.nativeBalance).toBe(0n);
    expect(vitalik?.totalValueUsd).toBe(0);
  });

  it('sets isError true when fetchWhales rejects', async () => {
    (fetchWhales as jest.Mock).mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useWhaleFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
