jest.mock('@shared/api/worker', () => ({
  workerGet: jest.fn(),
}));

import { workerGet } from '@shared/api/worker';
import { asMock } from '@test/mocks';

import { fetchEthMarketChart, fetchEthMarketData, fetchEthPriceUsd } from '../index';

const MOCK_MARKET = {
  priceUsd: 2451.5,
  change24h: 1.23,
  marketCapUsd: 295_000_000_000,
  volume24hUsd: 12_000_000_000,
};

const MOCK_POINTS = [
  { timestampMs: 1_700_000_000_000, price: 2400 },
  { timestampMs: 1_700_003_600_000, price: 2450 },
];

beforeEach(() => {
  asMock(workerGet).mockResolvedValue(MOCK_MARKET);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchEthPriceUsd', () => {
  it('returns the priceUsd field from the eth-market endpoint', async () => {
    const price = await fetchEthPriceUsd();
    expect(price).toBe(2451.5);
  });

  it('calls the worker /api/eth-market path', async () => {
    await fetchEthPriceUsd();
    expect(workerGet).toHaveBeenCalledWith('/api/eth-market');
  });

  it('propagates error when the worker request fails', async () => {
    asMock(workerGet).mockRejectedValueOnce(new Error('Worker HTTP 429'));
    await expect(fetchEthPriceUsd()).rejects.toThrow('Worker HTTP 429');
  });
});

describe('fetchEthMarketData', () => {
  it('returns the full market data object', async () => {
    const data = await fetchEthMarketData();
    expect(data).toEqual(MOCK_MARKET);
  });

  it('calls the worker /api/eth-market path', async () => {
    await fetchEthMarketData();
    expect(workerGet).toHaveBeenCalledWith('/api/eth-market');
  });

  it('propagates error when the worker request fails', async () => {
    asMock(workerGet).mockRejectedValueOnce(new Error('Worker HTTP 503'));
    await expect(fetchEthMarketData()).rejects.toThrow('Worker HTTP 503');
  });
});

describe('fetchEthMarketChart', () => {
  beforeEach(() => {
    asMock(workerGet).mockResolvedValue(MOCK_POINTS);
  });

  it('returns price point array from the worker', async () => {
    const points = await fetchEthMarketChart('1W');
    expect(points).toEqual(MOCK_POINTS);
  });

  it('calls /api/eth-chart/1D for 1D period', async () => {
    await fetchEthMarketChart('1D');
    expect(workerGet).toHaveBeenCalledWith('/api/eth-chart/1D');
  });

  it('calls /api/eth-chart/1W for 1W period', async () => {
    await fetchEthMarketChart('1W');
    expect(workerGet).toHaveBeenCalledWith('/api/eth-chart/1W');
  });

  it('calls /api/eth-chart/1M for 1M period', async () => {
    await fetchEthMarketChart('1M');
    expect(workerGet).toHaveBeenCalledWith('/api/eth-chart/1M');
  });

  it('propagates error when the worker request fails', async () => {
    asMock(workerGet).mockRejectedValueOnce(new Error('Worker HTTP 500'));
    await expect(fetchEthMarketChart('1W')).rejects.toThrow('Worker HTTP 500');
  });
});
