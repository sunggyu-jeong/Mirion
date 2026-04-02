jest.mock('@shared/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

import { storage } from '@shared/lib/storage';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useEthPrice } from '../model/use-eth-price';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQuery).mockReturnValue({ data: undefined } as never);
});

describe('useEthPrice', () => {
  it('useQuery를 올바른 queryKey로 호출한다', () => {
    renderHook(() => useEthPrice());
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['ethPrice'] }));
  });

  it('useQuery 반환값을 그대로 반환한다', () => {
    const mockData = { price: '₩4,000,000', change: '▲ +1.0%', isPositive: true };
    jest.mocked(useQuery).mockReturnValue({ data: mockData } as never);
    const { result } = renderHook(() => useEthPrice());
    expect(result.current.data).toEqual(mockData);
  });

  it('queryFn 성공 시 결과를 캐시에 저장한다', async () => {
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation(options => {
      capturedQueryFn = options.queryFn as () => Promise<unknown>;
      return { data: undefined } as never;
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ethereum: { krw: 4000000, krw_24h_change: 2.5 },
      }),
    }) as jest.Mock;

    renderHook(() => useEthPrice());
    const result = await capturedQueryFn!();

    expect(storage.set).toHaveBeenCalled();
    expect(result).toMatchObject({ isPositive: true });
  });

  it('fetch 실패 시 캐시에서 반환한다', async () => {
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation(options => {
      capturedQueryFn = options.queryFn as () => Promise<unknown>;
      return { data: undefined } as never;
    });

    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;
    jest
      .mocked(storage.getString)
      .mockReturnValue(
        JSON.stringify({ price: '₩3,000,000', change: '▼ -1.0%', isPositive: false }),
      );

    renderHook(() => useEthPrice());
    const result = await capturedQueryFn!();

    expect(result).toMatchObject({ price: '₩3,000,000' });
  });

  it('fetch 실패 + 캐시 없으면 에러를 던진다', async () => {
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation(options => {
      capturedQueryFn = options.queryFn as () => Promise<unknown>;
      return { data: undefined } as never;
    });

    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as jest.Mock;
    jest.mocked(storage.getString).mockReturnValue(undefined);

    renderHook(() => useEthPrice());
    await expect(capturedQueryFn!()).rejects.toThrow('ETH 시세를 불러올 수 없습니다');
  });

  it('음수 변화율은 isPositive: false로 반환한다', async () => {
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation(options => {
      capturedQueryFn = options.queryFn as () => Promise<unknown>;
      return { data: undefined } as never;
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ethereum: { krw: 3500000, krw_24h_change: -1.5 },
      }),
    }) as jest.Mock;

    renderHook(() => useEthPrice());
    const result = (await capturedQueryFn!()) as { isPositive: boolean };
    expect(result.isPositive).toBe(false);
  });
});
