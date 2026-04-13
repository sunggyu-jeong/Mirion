import type { PricePoint } from '@shared/api/coingecko';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@shared/api/coingecko', () => ({
  fetchEthMarketChart: jest.fn(),
  fetchEthMarketData: jest.fn(),
}));

import { fetchEthMarketChart, fetchEthMarketData } from '@shared/api/coingecko';

import { useEthMarketData } from '../use-eth-market-data';
import { useMarketChart } from '../use-market-chart';

const MOCK_POINTS: PricePoint[] = [
  { timestampMs: 1_700_000_000_000, price: 2400 },
  { timestampMs: 1_700_003_600_000, price: 2450 },
  { timestampMs: 1_700_007_200_000, price: 2430 },
];

const MOCK_MARKET_DATA = {
  priceUsd: 2451.5,
  change24h: 1.23,
  marketCapUsd: 295_000_000_000,
  volume24hUsd: 12_000_000_000,
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
  (fetchEthMarketChart as jest.Mock).mockResolvedValue(MOCK_POINTS);
  (fetchEthMarketData as jest.Mock).mockResolvedValue(MOCK_MARKET_DATA);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useMarketChart', () => {
  it('returns isLoading true initially', () => {
    const { result } = renderHook(() => useMarketChart('1W'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns price points after fetch resolves', async () => {
    const { result } = renderHook(() => useMarketChart('1W'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(MOCK_POINTS);
  });

  it('calls fetchEthMarketChart with the given period', async () => {
    const { result } = renderHook(() => useMarketChart('1M'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchEthMarketChart).toHaveBeenCalledWith('1M');
  });

  it('sets isError true when fetch fails', async () => {
    (fetchEthMarketChart as jest.Mock).mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useMarketChart('1D'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});

describe('useEthMarketData', () => {
  it('returns isLoading true initially', () => {
    const { result } = renderHook(() => useEthMarketData(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns market data after fetch resolves', async () => {
    const { result } = renderHook(() => useEthMarketData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(MOCK_MARKET_DATA);
  });

  it('sets isError true when fetch fails', async () => {
    (fetchEthMarketData as jest.Mock).mockRejectedValueOnce(new Error('rate limit'));

    const { result } = renderHook(() => useEthMarketData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
