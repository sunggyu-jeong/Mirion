import { renderHook } from '@testing-library/react-native';
import { parseEther } from 'viem';

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: { getBalance: jest.fn() },
}));

import { publicClient } from '@shared/lib/web3/client';

import { useBalanceCheck } from '../model/use-balance-check';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useBalanceCheck', () => {
  it('잔액이 충분하면 true 반환', async () => {
    (publicClient.getBalance as jest.Mock).mockResolvedValue(parseEther('2.0'));
    const { result } = renderHook(() => useBalanceCheck());
    const ok = await result.current('0xabc123' as `0x${string}`, '1.0');
    expect(ok).toBe(true);
  });

  it('잔액이 정확히 같으면 true 반환', async () => {
    (publicClient.getBalance as jest.Mock).mockResolvedValue(parseEther('1.0'));
    const { result } = renderHook(() => useBalanceCheck());
    const ok = await result.current('0xabc123' as `0x${string}`, '1.0');
    expect(ok).toBe(true);
  });

  it('잔액 부족 시 false 반환', async () => {
    (publicClient.getBalance as jest.Mock).mockResolvedValue(parseEther('0.5'));
    const { result } = renderHook(() => useBalanceCheck());
    const ok = await result.current('0xabc123' as `0x${string}`, '1.0');
    expect(ok).toBe(false);
  });

  it('getBalance에 올바른 address 전달', async () => {
    (publicClient.getBalance as jest.Mock).mockResolvedValue(parseEther('5.0'));
    const { result } = renderHook(() => useBalanceCheck());
    await result.current('0xTestAddress' as `0x${string}`, '1.0');
    expect(publicClient.getBalance).toHaveBeenCalledWith({
      address: '0xTestAddress',
    });
  });
});
