import type { CexTrade } from '@entities/cex-trade';
import type { WhaleTx } from '@entities/whale-tx';
import { asMock } from '@test/mocks';
import { renderHook, waitFor } from '@testing-library/react-native';

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

beforeEach(() => {
  asMock(useWhaleMovements).mockReturnValue({ data: [], isLoading: false });
  asMock(useCexTrades).mockReturnValue({ data: [], isLoading: false });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useUnifiedActivity', () => {
  it('returns empty data when both sources are empty', () => {
    const { result } = renderHook(() => useUnifiedActivity());

    expect(result.current.data).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('merges onchain and cex events sorted by timestampMs descending', () => {
    const tx = makeTx({ txHash: '0xA', timestampMs: 1_000 });
    const trade = makeCex({ timestampMs: 2_000 });
    asMock(useWhaleMovements).mockReturnValue({ data: [tx], isLoading: false });
    asMock(useCexTrades).mockReturnValue({ data: [trade], isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity());

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].timestampMs).toBe(2_000);
    expect(result.current.data[1].timestampMs).toBe(1_000);
  });

  it('returns isLoading true when movements are loading', () => {
    asMock(useWhaleMovements).mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useUnifiedActivity());

    expect(result.current.isLoading).toBe(true);
  });

  it('returns isLoading true when cex trades are loading', () => {
    asMock(useCexTrades).mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useUnifiedActivity());

    expect(result.current.isLoading).toBe(true);
  });

  it('passes chainFilter to useWhaleMovements', () => {
    renderHook(() => useUnifiedActivity('ETH'));

    expect(useWhaleMovements).toHaveBeenCalledWith('ETH');
  });

  it('uses ALL as default chainFilter', () => {
    renderHook(() => useUnifiedActivity());

    expect(useWhaleMovements).toHaveBeenCalledWith('ALL');
  });

  it('handles undefined movements gracefully', () => {
    asMock(useWhaleMovements).mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity());

    expect(result.current.data).toHaveLength(0);
  });

  it('handles undefined cexTrades gracefully', () => {
    asMock(useCexTrades).mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity());

    expect(result.current.data).toHaveLength(0);
  });

  it('labels onchain events with source=onchain', async () => {
    const tx = makeTx({ txHash: '0xonchain' });
    asMock(useWhaleMovements).mockReturnValue({ data: [tx], isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity());

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data[0].source).toBe('onchain');
  });

  it('labels cex events with source=cex', async () => {
    const trade = makeCex();
    asMock(useCexTrades).mockReturnValue({ data: [trade], isLoading: false });

    const { result } = renderHook(() => useUnifiedActivity());

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data[0].source).toBe('cex');
  });
});
