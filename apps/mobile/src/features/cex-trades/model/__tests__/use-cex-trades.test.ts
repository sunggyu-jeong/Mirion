import { asMock } from '@test/mocks';
import { renderQueryHook } from '@test/query';
import { waitFor } from '@testing-library/react-native';

jest.mock('@entities/cex-trade', () => ({
  fetchCexTrades: jest.fn(),
}));

import { fetchCexTrades } from '@entities/cex-trade';

import { useCexTrades } from '../use-cex-trades';

const MOCK_TRADES = [
  {
    symbol: 'ETH',
    side: 'buy' as const,
    price: 3000,
    amount: 5,
    valueUsd: 15000,
    timestampMs: 1000,
  },
];

beforeEach(() => {
  asMock(fetchCexTrades).mockResolvedValue(MOCK_TRADES);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useCexTrades', () => {
  it('returns trades data on success', async () => {
    const { result } = renderQueryHook(() => useCexTrades());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].symbol).toBe('ETH');
  });

  it('calls fetchCexTrades', async () => {
    renderQueryHook(() => useCexTrades());
    await waitFor(() => expect(fetchCexTrades).toHaveBeenCalled());
  });

  it('surfaces error when fetch fails', async () => {
    asMock(fetchCexTrades).mockRejectedValueOnce(new Error('network'));
    const { result } = renderQueryHook(() => useCexTrades());
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
