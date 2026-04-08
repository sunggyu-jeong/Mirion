import { useAppSettingsStore } from '@entities/app-settings';
import type { WhaleMetadata } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/whale', () => ({
  CURATED_WHALES: [
    {
      id: 'vitalik',
      name: 'Vitalik Buterin',
      address: '0xVitalik',
      chain: 'ETH',
      tag: 'ETH Creator',
      isLocked: false,
    },
    {
      id: 'jump',
      name: 'Jump Crypto',
      address: '0xJump',
      chain: 'ETH',
      tag: 'Hedge Fund',
      isLocked: true,
    },
    {
      id: 'microstrategy',
      name: 'MicroStrategy',
      address: 'bc1qMicro',
      chain: 'BTC',
      tag: 'Institution',
      isLocked: false,
    },
  ] satisfies WhaleMetadata[],
}));

jest.mock('@entities/whale-tx', () => ({
  fetchWhaleTransfers: jest.fn(),
}));

import { fetchWhaleTransfers } from '@entities/whale-tx';

import { useWhaleMovements } from '../use-whale-movements';

function makeTx(overrides: Partial<WhaleTx>): WhaleTx {
  return {
    txHash: '0xdefault',
    type: 'send',
    amountEth: 500,
    amountUsd: 1_225_000,
    fromAddress: '0xVitalik',
    toAddress: '0xOther',
    timestampMs: Date.now(),
    blockNumber: 20_000_000n,
    isLarge: true,
    asset: 'ETH',
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
  useAppSettingsStore.setState({ minDetectionEth: 100 });
  (fetchWhaleTransfers as jest.Mock).mockResolvedValue([]);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWhaleMovements', () => {
  it('returns isLoading true before data resolves', () => {
    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('calls fetchWhaleTransfers only for ETH-chain whale addresses', async () => {
    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchWhaleTransfers).toHaveBeenCalledTimes(2);

    const calledAddresses = (fetchWhaleTransfers as jest.Mock).mock.calls.map(
      (args: unknown[]) => args[0],
    );
    expect(calledAddresses).toContain('0xVitalik');
    expect(calledAddresses).toContain('0xJump');
    expect(calledAddresses).not.toContain('bc1qMicro');
  });

  it('passes minDetectionEth from the app-settings store', async () => {
    useAppSettingsStore.setState({ minDetectionEth: 500 });

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (fetchWhaleTransfers as jest.Mock).mock.calls.forEach((args: unknown[]) => {
      expect((args[1] as { minValueEth: number }).minValueEth).toBe(500);
    });
  });

  it('merges transfers from all ETH whale addresses', async () => {
    const vitalikTx = makeTx({ txHash: '0xAAA', fromAddress: '0xVitalik', timestampMs: 2000 });
    const jumpTx = makeTx({ txHash: '0xBBB', fromAddress: '0xJump', timestampMs: 1000 });

    (fetchWhaleTransfers as jest.Mock)
      .mockResolvedValueOnce([vitalikTx])
      .mockResolvedValueOnce([jumpTx]);

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
  });

  it('sorts merged transfers by timestampMs descending', async () => {
    const older = makeTx({ txHash: '0xOLD', timestampMs: 1000 });
    const newer = makeTx({ txHash: '0xNEW', timestampMs: 3000 });
    const mid = makeTx({ txHash: '0xMID', timestampMs: 2000 });

    (fetchWhaleTransfers as jest.Mock)
      .mockResolvedValueOnce([older, newer])
      .mockResolvedValueOnce([mid]);

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const hashes = result.current.data?.map(tx => tx.txHash);
    expect(hashes).toEqual(['0xNEW', '0xMID', '0xOLD']);
  });

  it('deduplicates transactions with identical txHash', async () => {
    const tx = makeTx({ txHash: '0xDUP', timestampMs: 1000 });

    (fetchWhaleTransfers as jest.Mock).mockResolvedValueOnce([tx]).mockResolvedValueOnce([tx]);

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(1);
  });

  it('returns an empty array when no whale has transactions above the threshold', async () => {
    (fetchWhaleTransfers as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(0);
  });

  it('re-fetches with updated minDetectionEth when the store value changes', async () => {
    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      useAppSettingsStore.setState({ minDetectionEth: 500 });
    });

    await waitFor(() => {
      const lastCalls = (fetchWhaleTransfers as jest.Mock).mock.calls;
      const latestOpts = lastCalls[lastCalls.length - 1][1] as { minValueEth: number };
      expect(latestOpts.minValueEth).toBe(500);
    });
  });

  it('sets isError true when all whale fetches fail', async () => {
    (fetchWhaleTransfers as jest.Mock).mockRejectedValue(new Error('api down'));

    const { result } = renderHook(() => useWhaleMovements(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
