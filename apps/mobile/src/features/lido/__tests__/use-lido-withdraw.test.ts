jest.mock('@entities/tx', () => ({
  useTxStore: jest.fn(),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('viem', () => ({
  encodeFunctionData: jest.fn(() => '0xencodedData'),
}));

const mockProviderRef: { current: { request: jest.Mock } | null } = { current: null };

jest.mock('@metamask/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    getProvider: () => mockProviderRef.current,
  }));
});

import { useTxStore } from '@entities/tx';
import { useWalletStore } from '@entities/wallet';
import { act, renderHook } from '@testing-library/react-native';

import { useLidoWithdraw } from '../model/use-lido-withdraw';

const mockSetPending = jest.fn();
const mockSetError = jest.fn();
const mockReset = jest.fn();

const VALID_ADDRESS = '0x742d35Cc6634C0532925a3b8Bc454e4438f44e2D';

beforeEach(() => {
  jest.clearAllMocks();
  mockProviderRef.current = { request: jest.fn().mockResolvedValue('0xTxHash') };
  jest.mocked(useTxStore).mockReturnValue({
    setPending: mockSetPending,
    setError: mockSetError,
    reset: mockReset,
  } as never);
  jest
    .mocked(useWalletStore)
    .mockImplementation((selector: (s: { address: string }) => unknown) =>
      selector({ address: VALID_ADDRESS }),
    );
});

describe('useLidoWithdraw', () => {
  it('requestWithdrawal과 reset 함수를 반환한다', () => {
    const { result } = renderHook(() => useLidoWithdraw());
    expect(typeof result.current.requestWithdrawal).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('address가 없으면 requestWithdrawal을 호출해도 아무것도 하지 않는다', async () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: null }) => unknown) =>
        selector({ address: null }),
      );
    const { result } = renderHook(() => useLidoWithdraw());
    await act(async () => {
      await result.current.requestWithdrawal(BigInt('1000000000000000000'));
    });
    expect(mockSetPending).not.toHaveBeenCalled();
  });

  it('성공 시 setPending을 호출한다', async () => {
    const { result } = renderHook(() => useLidoWithdraw());
    await act(async () => {
      await result.current.requestWithdrawal(BigInt('1000000000000000000'));
    });
    expect(mockSetPending).toHaveBeenCalledWith('0xTxHash', 'unstake');
  });

  it('provider가 없으면 setError를 호출하고 예외를 던진다', async () => {
    mockProviderRef.current = null;
    const { result } = renderHook(() => useLidoWithdraw());
    await act(async () => {
      await expect(
        result.current.requestWithdrawal(BigInt('1000000000000000000')),
      ).rejects.toThrow();
    });
    expect(mockSetError).toHaveBeenCalled();
  });

  it('request 실패 시 setError를 호출하고 예외를 던진다', async () => {
    mockProviderRef.current = {
      request: jest.fn().mockRejectedValue(new Error('user rejected')),
    };
    const { result } = renderHook(() => useLidoWithdraw());
    await act(async () => {
      await expect(result.current.requestWithdrawal(BigInt('1000000000000000000'))).rejects.toThrow(
        'user rejected',
      );
    });
    expect(mockSetError).toHaveBeenCalledWith('user rejected');
  });
});
