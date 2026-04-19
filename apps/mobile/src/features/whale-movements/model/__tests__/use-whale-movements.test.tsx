import type { WhaleTx } from '@entities/whale-tx';
import { asMock } from '@test/mocks';
import { renderQueryHook } from '@test/query';
import { waitFor } from '@testing-library/react-native';

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

beforeEach(() => {
  asMock(fetchRadarTransactions).mockResolvedValue([]);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWhaleMovements', () => {
  it('returns isLoading true before data resolves', () => {
    const { result } = renderQueryHook(() => useWhaleMovements());

    expect(result.current.isLoading).toBe(true);
  });

  it('returns isLoading false after data resolves', async () => {
    const { result } = renderQueryHook(() => useWhaleMovements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('calls fetchRadarTransactions once', async () => {
    const { result } = renderQueryHook(() => useWhaleMovements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchRadarTransactions).toHaveBeenCalledTimes(1);
  });

  it('returns all transactions when chainFilter is ALL', async () => {
    const txs = [makeTx({ chain: 'ETH' }), makeTx({ txHash: '0xBTC', chain: 'BTC' })];
    asMock(fetchRadarTransactions).mockResolvedValue(txs);

    const { result } = renderQueryHook(() => useWhaleMovements('ALL'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
  });

  it('filters transactions by chain when chainFilter is set', async () => {
    const txs = [
      makeTx({ txHash: '0xETH', chain: 'ETH' }),
      makeTx({ txHash: '0xBTC', chain: 'BTC' }),
      makeTx({ txHash: '0xETH2', chain: 'ETH' }),
    ];
    asMock(fetchRadarTransactions).mockResolvedValue(txs);

    const { result } = renderQueryHook(() => useWhaleMovements('ETH'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
    result.current.data?.forEach(tx => expect(tx.chain).toBe('ETH'));
  });

  it('returns empty array when no transactions match the chainFilter', async () => {
    const txs = [makeTx({ chain: 'ETH' }), makeTx({ txHash: '0xETH2', chain: 'ETH' })];
    asMock(fetchRadarTransactions).mockResolvedValue(txs);

    const { result } = renderQueryHook(() => useWhaleMovements('BTC'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(0);
  });

  it('returns empty array when fetchRadarTransactions returns empty', async () => {
    asMock(fetchRadarTransactions).mockResolvedValue([]);

    const { result } = renderQueryHook(() => useWhaleMovements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(0);
  });

  it('sets isError true when fetchRadarTransactions rejects', async () => {
    asMock(fetchRadarTransactions).mockRejectedValue(new Error('api down'));

    const { result } = renderQueryHook(() => useWhaleMovements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
