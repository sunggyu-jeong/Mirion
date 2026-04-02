jest.mock('@shared/lib/web3/client', () => ({
  publicClient: { getBalance: jest.fn() },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useEthBalance } from '../model/use-eth-balance';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQuery).mockReturnValue({ data: undefined } as never);
});

describe('useEthBalance', () => {
  it('address가 없으면 enabled: false로 쿼리를 호출한다', () => {
    renderHook(() => useEthBalance(null));
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('address가 있으면 enabled: true로 쿼리를 호출한다', () => {
    renderHook(() => useEthBalance('0xTestAddress'));
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('queryKey에 address를 포함한다', () => {
    renderHook(() => useEthBalance('0xABC'));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['ethBalance', '0xABC'] }),
    );
  });

  it('useQuery 반환값을 그대로 반환한다', () => {
    jest.mocked(useQuery).mockReturnValue({ data: 1000n } as never);
    const { result } = renderHook(() => useEthBalance('0xABC'));
    expect(result.current).toEqual({ data: 1000n });
  });
});
