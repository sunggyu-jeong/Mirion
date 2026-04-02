jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useEthPriceChart } from '../model/use-eth-price-chart';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQuery).mockReturnValue({ data: undefined } as never);
});

describe('useEthPriceChart', () => {
  it('useQuery를 올바른 queryKey로 호출한다', () => {
    renderHook(() => useEthPriceChart());
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['ethPriceChart'] }));
  });

  it('useQuery 반환값을 그대로 반환한다', () => {
    const prices = [3000000, 3100000, 3050000];
    jest.mocked(useQuery).mockReturnValue({ data: prices } as never);
    const { result } = renderHook(() => useEthPriceChart());
    expect(result.current.data).toEqual(prices);
  });

  it('queryFn이 fetch를 호출하고 prices 배열을 반환한다', async () => {
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation(options => {
      capturedQueryFn = options.queryFn as () => Promise<unknown>;
      return { data: undefined } as never;
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        prices: [
          [1700000000000, 3000000],
          [1700086400000, 3100000],
        ],
      }),
    }) as jest.Mock;

    renderHook(() => useEthPriceChart());
    const result = await capturedQueryFn!();
    expect(result).toEqual([3000000, 3100000]);
  });

  it('fetch 실패 시 에러를 던진다', async () => {
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation(options => {
      capturedQueryFn = options.queryFn as () => Promise<unknown>;
      return { data: undefined } as never;
    });

    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;

    renderHook(() => useEthPriceChart());
    await expect(capturedQueryFn!()).rejects.toThrow('ETH 차트 데이터 조회 실패');
  });
});
