import { fetchEthMarketChart, fetchEthMarketData, fetchEthPriceUsd } from '../index';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('fetchEthPriceUsd', () => {
  it('returns the ethereum usd price', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ethereum: { usd: 2500 } }),
    });

    const price = await fetchEthPriceUsd();
    expect(price).toBe(2500);
  });

  it('calls the correct CoinGecko endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ethereum: { usd: 2500 } }),
    });

    await fetchEthPriceUsd();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('simple/price?ids=ethereum&vs_currencies=usd'),
    );
  });

  it('throws when the response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 429 });

    await expect(fetchEthPriceUsd()).rejects.toThrow('CoinGecko HTTP 429');
  });
});

describe('fetchEthMarketChart', () => {
  const mockPrices: [number, number][] = [
    [1_700_000_000_000, 2400],
    [1_700_003_600_000, 2450],
    [1_700_007_200_000, 2430],
  ];

  it('maps raw prices array to PricePoint objects', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ prices: mockPrices }),
    });

    const points = await fetchEthMarketChart('1D');

    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({ timestampMs: 1_700_000_000_000, price: 2400 });
    expect(points[1]).toEqual({ timestampMs: 1_700_003_600_000, price: 2450 });
  });

  it('requests 1 day for 1D period', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ prices: mockPrices }),
    });

    await fetchEthMarketChart('1D');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('days=1'));
  });

  it('requests 7 days for 1W period', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ prices: mockPrices }),
    });

    await fetchEthMarketChart('1W');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('days=7'));
  });

  it('requests 30 days for 1M period', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ prices: mockPrices }),
    });

    await fetchEthMarketChart('1M');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('days=30'));
  });

  it('throws when the response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(fetchEthMarketChart('1W')).rejects.toThrow('CoinGecko HTTP 500');
  });
});

describe('fetchEthMarketData', () => {
  const mockResponse = {
    market_data: {
      current_price: { usd: 2451.5 },
      price_change_percentage_24h: 1.23,
      market_cap: { usd: 295_000_000_000 },
      total_volume: { usd: 12_000_000_000 },
    },
  };

  it('returns a structured EthMarketData object', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await fetchEthMarketData();

    expect(data).toEqual({
      priceUsd: 2451.5,
      change24h: 1.23,
      marketCapUsd: 295_000_000_000,
      volume24hUsd: 12_000_000_000,
    });
  });

  it('calls the coins/ethereum endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchEthMarketData();

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('coins/ethereum'));
  });

  it('throws when the response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(fetchEthMarketData()).rejects.toThrow('CoinGecko HTTP 503');
  });
});
