import type { WhaleMetadata, WhaleOnchainData } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
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
      id: 'microstrategy',
      name: 'MicroStrategy',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      chain: 'BTC',
      tag: 'Institution',
      isLocked: false,
    },
  ] satisfies WhaleMetadata[],
  fetchWhaleProfile: jest.fn(),
}));

jest.mock('@entities/whale-tx', () => ({
  fetchWhaleTransfers: jest.fn(),
}));

jest.mock('@shared/api/coingecko', () => ({
  fetchEthPriceUsd: jest.fn(),
}));

import { fetchWhaleProfile } from '@entities/whale';
import { fetchWhaleTransfers } from '@entities/whale-tx';
import { fetchEthPriceUsd } from '@shared/api/coingecko';

import { useWhaleDetail } from '../use-whale-detail';

const ETH_PRICE = 2450;

const MOCK_ONCHAIN: WhaleOnchainData = {
  ethBalance: BigInt('0xDE0B6B3A7640000'),
  totalValueUsd: 100_000,
  tokens: [
    {
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      rawBalance: BigInt('0x2386F26FC10000'),
    },
  ],
};

const MOCK_TX: WhaleTx = {
  txHash: '0xabc001',
  type: 'send',
  amountEth: 100,
  amountUsd: 245_000,
  fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  toAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  timestampMs: new Date('2024-06-01T10:00:00.000Z').getTime(),
  blockNumber: 20_000_000n,
  isLarge: false,
  asset: 'ETH',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  (fetchEthPriceUsd as jest.Mock).mockResolvedValue(ETH_PRICE);
  (fetchWhaleProfile as jest.Mock).mockResolvedValue(MOCK_ONCHAIN);
  (fetchWhaleTransfers as jest.Mock).mockResolvedValue([MOCK_TX]);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWhaleDetail', () => {
  it('returns isLoading true before data resolves', () => {
    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('calls fetchWhaleProfile with the whale address for an ETH whale', async () => {
    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchWhaleProfile).toHaveBeenCalledWith(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      expect.anything(),
      ETH_PRICE,
    );
  });

  it('calls fetchWhaleTransfers with the whale address for an ETH whale', async () => {
    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchWhaleTransfers).toHaveBeenCalledWith(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      expect.anything(),
      expect.anything(),
    );
  });

  it('returns totalValueUsd from onchain profile data', async () => {
    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.totalValueUsd).toBe(100_000);
  });

  it('returns tokens from onchain profile data', async () => {
    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.tokens).toHaveLength(1);
    expect(result.current.data?.tokens[0].contractAddress).toBe(
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    );
  });

  it('returns transactions from fetchWhaleTransfers', async () => {
    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.transactions).toHaveLength(1);
    expect(result.current.data?.transactions[0].txHash).toBe('0xabc001');
  });

  it('does not call fetchWhaleProfile for a non-ETH-chain whale', async () => {
    const { result } = renderHook(() => useWhaleDetail('microstrategy'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchWhaleProfile).not.toHaveBeenCalled();
  });

  it('returns data undefined for an unrecognised whaleId', async () => {
    const { result } = renderHook(() => useWhaleDetail('unknown-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
  });

  it('sets isError true when fetchWhaleProfile rejects', async () => {
    (fetchWhaleProfile as jest.Mock).mockRejectedValueOnce(new Error('profile failed'));

    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });

  it('sets isError true when fetchWhaleTransfers rejects', async () => {
    (fetchWhaleTransfers as jest.Mock).mockRejectedValueOnce(new Error('transfers failed'));

    const { result } = renderHook(() => useWhaleDetail('vitalik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
