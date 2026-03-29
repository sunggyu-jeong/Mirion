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
});
