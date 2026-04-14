import type { CexTrade } from '@entities/cex-trade';
import type { WhaleTx } from '@entities/whale-tx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@features/whale-movements', () => ({
  useWhaleMovements: jest.fn(),
}));
jest.mock('@features/cex-trades', () => ({
  useCexTrades: jest.fn(),
}));

import { useCexTrades } from '@features/cex-trades';
import { useWhaleMovements } from '@features/whale-movements';

import { useUnifiedActivity } from '../use-unified-activity';

function makeTx(overrides: Partial<WhaleTx> = {}): WhaleTx {
  return {
    txHash: '0xdefault',
    type: 'send',
    amountNative: 100,
    amountUsd: 245_000,
    fromAddress: '0xFrom',
    toAddress: '0xTo',
    timestampMs: 1_700_000_000_000,
    blockNumber: 20_000_000n,
    isLarge: true,
    asset: 'ETH',
    chain: 'ETH',
    ...overrides,
  };
}

function makeCex(overrides: Partial<CexTrade> = {}): CexTrade {
  return {
    symbol: 'ETHUSDT',
    side: 'buy',
    price: 3_000,
    amount: 100,
    valueUsd: 300_000,
    timestampMs: 1_700_000_002_000,
    ...overrides,
  };
}

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

beforeEach(() => {
  (useWhaleMovements as jest.Mock).mockReturnValue({ data: [], isLoading: false });
  (useCexTrades as jest.Mock).mockReturnValue({ data: [], isLoading: false });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useUnifiedActivity', () => {
  it('returns empty data when both sources are empty', () => {
    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(result.current.data).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('merges onchain and cex events sorted by timestampMs descending', () => {
    const tx = makeTx({ txHash: '0xA', timestampMs: 1_000 });
    const trade = makeCex({ timestampMs: 2_000 });
    (useWhaleMovements as jest.Mock).mockReturnValue({ data: [tx], isLoading: false });
    (useCexTrades as jest.Mock).mockReturnValue({ data: [trade], isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].timestampMs).toBe(2_000);
    expect(result.current.data[1].timestampMs).toBe(1_000);
  });

  it('returns isLoading true when movements are loading', () => {
    (useWhaleMovements as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns isLoading true when cex trades are loading', () => {
    (useCexTrades as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('passes chainFilter to useWhaleMovements', () => {
    renderHook(() => useUnifiedActivity('ETH'), { wrapper: createWrapper() });

    expect(useWhaleMovements).toHaveBeenCalledWith('ETH');
  });

  it('uses ALL as default chainFilter', () => {
    renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(useWhaleMovements).toHaveBeenCalledWith('ALL');
  });

  it('handles undefined movements gracefully', () => {
    (useWhaleMovements as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(result.current.data).toHaveLength(0);
  });

  it('handles undefined cexTrades gracefully', () => {
    (useCexTrades as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    expect(result.current.data).toHaveLength(0);
  });

  it('labels onchain events with source=onchain', async () => {
    const tx = makeTx({ txHash: '0xonchain' });
    (useWhaleMovements as jest.Mock).mockReturnValue({ data: [tx], isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data[0].source).toBe('onchain');
  });

  it('labels cex events with source=cex', async () => {
    const trade = makeCex();
    (useCexTrades as jest.Mock).mockReturnValue({ data: [trade], isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data[0].source).toBe('cex');
  });
});
