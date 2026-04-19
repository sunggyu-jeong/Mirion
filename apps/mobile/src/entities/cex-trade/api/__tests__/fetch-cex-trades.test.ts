jest.mock('@shared/api/worker', () => ({
  workerGet: jest.fn(),
}));

import { workerGet } from '@shared/api/worker';
import { asMock } from '@test/mocks';

import { fetchCexTrades } from '../fetch-cex-trades';

const MOCK_TRADES = [
  {
    symbol: 'ETH',
    side: 'buy' as const,
    price: 3000,
    amount: 10,
    valueUsd: 30000,
    timestampMs: 1000,
  },
  {
    symbol: 'BTC',
    side: 'sell' as const,
    price: 60000,
    amount: 1,
    valueUsd: 60000,
    timestampMs: 2000,
  },
];

beforeEach(() => {
  asMock(workerGet).mockResolvedValue(MOCK_TRADES);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchCexTrades', () => {
  it('calls /api/cex-trades endpoint', async () => {
    await fetchCexTrades();
    expect(workerGet).toHaveBeenCalledWith('/api/cex-trades');
  });

  it('returns the trades from the worker', async () => {
    const trades = await fetchCexTrades();
    expect(trades).toHaveLength(2);
    expect(trades[0].symbol).toBe('ETH');
    expect(trades[1].side).toBe('sell');
  });

  it('returns empty array when worker returns none', async () => {
    asMock(workerGet).mockResolvedValueOnce([]);
    const trades = await fetchCexTrades();
    expect(trades).toHaveLength(0);
  });

  it('propagates worker errors', async () => {
    asMock(workerGet).mockRejectedValueOnce(new Error('Worker HTTP 503'));
    await expect(fetchCexTrades()).rejects.toThrow('Worker HTTP 503');
  });
});
