import type { PricePoint } from '@shared/api/coingecko';
import { asMock } from '@test/mocks';
import { renderQueryHook } from '@test/query';
import { waitFor } from '@testing-library/react-native';

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

beforeEach(() => {
  asMock(fetchEthMarketChart).mockResolvedValue(MOCK_POINTS);
  asMock(fetchEthMarketData).mockResolvedValue(MOCK_MARKET_DATA);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useMarketChart', () => {
  it('returns isLoading true initially', () => {
    const { result } = renderQueryHook(() => useMarketChart('1W'));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns price points after fetch resolves', async () => {
    const { result } = renderQueryHook(() => useMarketChart('1W'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(MOCK_POINTS);
  });

  it('calls fetchEthMarketChart with the given period', async () => {
    const { result } = renderQueryHook(() => useMarketChart('1M'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchEthMarketChart).toHaveBeenCalledWith('1M');
  });

  it('sets isError true when fetch fails', async () => {
    asMock(fetchEthMarketChart).mockRejectedValueOnce(new Error('network'));

    const { result } = renderQueryHook(() => useMarketChart('1D'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});

describe('useEthMarketData', () => {
  it('returns isLoading true initially', () => {
    const { result } = renderQueryHook(() => useEthMarketData());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns market data after fetch resolves', async () => {
    const { result } = renderQueryHook(() => useEthMarketData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(MOCK_MARKET_DATA);
  });

  it('sets isError true when fetch fails', async () => {
    asMock(fetchEthMarketData).mockRejectedValueOnce(new Error('rate limit'));

    const { result } = renderQueryHook(() => useEthMarketData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
