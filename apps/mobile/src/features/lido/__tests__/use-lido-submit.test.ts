jest.mock('@metamask/sdk', () =>
  jest.fn().mockImplementation(() => ({
    getProvider: jest.fn().mockReturnValue({ request: jest.fn() }),
  })),
);

jest.mock('@entities/tx', () => ({
  useTxStore: jest.fn(),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@shared/api/contracts', () => ({
  lidoContract: {
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    abi: [],
    chainId: 1,
  },
  LIDO_REFERRAL_ADDRESS: '0x0000000000000000000000000000000000000000',
}));

jest.mock('viem', () => ({
  encodeFunctionData: jest.fn().mockReturnValue('0xencoded'),
}));

import { useTxStore } from '@entities/tx';
import { useWalletStore } from '@entities/wallet';
import MetaMaskSDK from '@metamask/sdk';
import { act, renderHook } from '@testing-library/react-native';

import { useLidoSubmit } from '../model/use-lido-submit';

const mockSetPending = jest.fn();
const mockSetError = jest.fn();
const mockReset = jest.fn();
const mockRequest = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useTxStore).mockReturnValue({
    txHash: null,
    setPending: mockSetPending,
    setSuccess: jest.fn(),
    setError: mockSetError,
    reset: mockReset,
  } as never);
  jest
    .mocked(useWalletStore)
    .mockImplementation(((selector: (s: unknown) => unknown) =>
      selector({ address: '0xabc' })) as never);
  jest.mocked(MetaMaskSDK).mockImplementation(
    () =>
      ({
        getProvider: () => ({ request: mockRequest }),
      }) as never,
  );
});

describe('useLidoSubmit', () => {
  it('submit 성공 시 setPending이 txHash와 stake로 호출된다', async () => {
    mockRequest.mockResolvedValue('0xtxhash');

    const { result } = renderHook(() => useLidoSubmit());
    await act(async () => {
      await result.current.submit(1000000000000000000n);
    });

    expect(mockSetPending).toHaveBeenCalledWith('0xtxhash', 'stake');
  });

  it('submit 실패 시 setError가 호출된다', async () => {
    mockRequest.mockRejectedValue(new Error('사용자 거부'));

    const { result } = renderHook(() => useLidoSubmit());
    await act(async () => {
      await result.current.submit(1000000000000000000n).catch(() => {});
    });

    expect(mockSetError).toHaveBeenCalledWith('사용자 거부');
  });

  it('submit 실패 시 에러가 전파된다', async () => {
    mockRequest.mockRejectedValue(new Error('네트워크 오류'));

    const { result } = renderHook(() => useLidoSubmit());
    await expect(
      act(async () => {
        await result.current.submit(1000000000000000000n);
      }),
    ).rejects.toThrow('네트워크 오류');
  });

  it('비 Error 예외도 setError가 호출된다', async () => {
    mockRequest.mockRejectedValue('문자열 오류');

    const { result } = renderHook(() => useLidoSubmit());
    await act(async () => {
      await result.current.submit(1000000000000000000n).catch(() => {});
    });

    expect(mockSetError).toHaveBeenCalledWith('문자열 오류');
  });

  it('isPendingRef.current = true 상태에서 재호출 시 무시된다', async () => {
    let resolveRequest: (val: string) => void;
    mockRequest.mockReturnValue(
      new Promise(res => {
        resolveRequest = res;
      }),
    );

    const { result } = renderHook(() => useLidoSubmit());

    act(() => {
      result.current.submit(1000000000000000000n);
    });

    await act(async () => {
      await result.current.submit(500000000000000000n);
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest!('0xhash');
    });
  });
});
