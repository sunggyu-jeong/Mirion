import type { WhaleTx } from '@entities/whale-tx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/whale-tx', () => ({
  fetchRadarTransactions: jest.fn(),
}));

import { fetchRadarTransactions } from '@entities/whale-tx';

import { useWhaleMovements } from '../use-whale-movements';

function makeTx(overrides: Partial<WhaleTx> = {}): WhaleTx {
  return {
    txHash: '0xdefault',
    type: 'send',
    amountNative: 500,
    amountUsd: 1_225_000,
    fromAddress: '0xVitalik',
    toAddress: '0xOther',
    timestampMs: Date.now(),
    blockNumber: 20_000_000n,
    isLarge: true,
    asset: 'ETH',
    chain: 'ETH',
    ...overrides,
  };
}

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
  (fetchRadarTransactions as jest.Mock).mockResolvedValue([]);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWhaleMovements', () => {
  it('returns isLoading true before data resolves', () => {
    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns isLoading false after data resolves', async () => {
    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('calls fetchRadarTransactions once', async () => {
    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchRadarTransactions).toHaveBeenCalledTimes(1);
  });

  it('returns all transactions when chainFilter is ALL', async () => {
    const txs = [makeTx({ chain: 'ETH' }), makeTx({ txHash: '0xBTC', chain: 'BTC' })];
    (fetchRadarTransactions as jest.Mock).mockResolvedValue(txs);

    const { result } = renderHook(() => useWhaleMovements('ALL'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
  });

  it('filters transactions by chain when chainFilter is set', async () => {
    const txs = [
      makeTx({ txHash: '0xETH', chain: 'ETH' }),
      makeTx({ txHash: '0xBTC', chain: 'BTC' }),
      makeTx({ txHash: '0xETH2', chain: 'ETH' }),
    ];
    (fetchRadarTransactions as jest.Mock).mockResolvedValue(txs);

    const { result } = renderHook(() => useWhaleMovements('ETH'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
    result.current.data?.forEach(tx => expect(tx.chain).toBe('ETH'));
  });

  it('returns empty array when no transactions match the chainFilter', async () => {
    const txs = [makeTx({ chain: 'ETH' }), makeTx({ txHash: '0xETH2', chain: 'ETH' })];
    (fetchRadarTransactions as jest.Mock).mockResolvedValue(txs);

    const { result } = renderHook(() => useWhaleMovements('BTC'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(0);
  });

  it('returns empty array when fetchRadarTransactions returns empty', async () => {
    (fetchRadarTransactions as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(0);
  });

  it('sets isError true when fetchRadarTransactions rejects', async () => {
    (fetchRadarTransactions as jest.Mock).mockRejectedValue(new Error('api down'));

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
