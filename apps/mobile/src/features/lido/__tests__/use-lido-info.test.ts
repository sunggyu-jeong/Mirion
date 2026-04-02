jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(),
}));

jest.mock('@shared/api/contracts', () => ({
  lidoContract: {
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    abi: [],
    chainId: 1,
  },
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    readContract: jest.fn(),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

import { useLidoStore } from '@entities/lido';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useLidoInfo } from '../model/use-lido-info';

const mockSetStakedBalance = jest.fn();
const mockSetEstimatedApy = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLidoStore).mockReturnValue({
    setStakedBalance: mockSetStakedBalance,
    setEstimatedApy: mockSetEstimatedApy,
  } as never);
  jest.mocked(useQuery).mockReturnValue({ data: undefined } as never);
});

describe('useLidoInfo', () => {
  it('address가 null이면 쿼리가 disabled 상태로 호출된다', () => {
    renderHook(() => useLidoInfo(null));
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('address가 있으면 쿼리가 enabled 상태로 호출된다', () => {
    renderHook(() => useLidoInfo('0xABC' as `0x${string}`));
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('balanceQuery.data가 있으면 setStakedBalance를 호출한다', () => {
    jest.mocked(useQuery).mockReturnValueOnce({ data: BigInt('1000000000000000000') } as never);
    jest.mocked(useQuery).mockReturnValueOnce({ data: undefined } as never);
    renderHook(() => useLidoInfo('0xABC' as `0x${string}`));
    expect(mockSetStakedBalance).toHaveBeenCalledWith(BigInt('1000000000000000000'));
  });

  it('apyQuery.data가 있으면 setEstimatedApy를 호출한다', () => {
    jest.mocked(useQuery).mockReturnValueOnce({ data: undefined } as never);
    jest.mocked(useQuery).mockReturnValueOnce({ data: 3.8 } as never);
    renderHook(() => useLidoInfo('0xABC' as `0x${string}`));
    expect(mockSetEstimatedApy).toHaveBeenCalledWith(3.8);
  });

  it('balanceQuery queryKey에 address를 포함한다', () => {
    renderHook(() => useLidoInfo('0xABC' as `0x${string}`));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['lidoBalance', '0xABC'] }),
    );
  });

  it('apyQuery queryKey가 lidoApy이다', () => {
    renderHook(() => useLidoInfo(null));
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['lidoApy'] }));
  });

  it('balanceQuery의 queryFn이 publicClient.readContract를 호출한다', async () => {
    const { publicClient } = require('@shared/lib/web3/client');
    publicClient.readContract.mockResolvedValue(BigInt('500000000000000000'));
    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation((options: any) => {
      if (options.queryKey[0] === 'lidoBalance') {
        capturedQueryFn = options.queryFn;
      }
      return { data: undefined } as never;
    });
    renderHook(() => useLidoInfo('0xABC' as `0x${string}`));
    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(publicClient.readContract).toHaveBeenCalled();
    expect(result).toEqual(BigInt('500000000000000000'));
  });

  it('fetchLidoApy가 성공 시 APY 값을 반환한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { smaApr: 4.2 } }),
    }) as jest.Mock;
    let capturedApyFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation((options: any) => {
      if (options.queryKey[0] === 'lidoApy') {
        capturedApyFn = options.queryFn;
      }
      return { data: undefined } as never;
    });
    renderHook(() => useLidoInfo(null));
    expect(capturedApyFn).toBeDefined();
    const result = await capturedApyFn!();
    expect(result).toBe(4.2);
  });

  it('fetchLidoApy가 실패 시 0을 반환한다', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as jest.Mock;
    let capturedApyFn: (() => Promise<unknown>) | undefined;
    jest.mocked(useQuery).mockImplementation((options: any) => {
      if (options.queryKey[0] === 'lidoApy') {
        capturedApyFn = options.queryFn;
      }
      return { data: undefined } as never;
    });
    renderHook(() => useLidoInfo(null));
    const result = await capturedApyFn!();
    expect(result).toBe(0);
  });
});
