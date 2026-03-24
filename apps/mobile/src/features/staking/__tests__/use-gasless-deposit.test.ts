jest.mock('@shared/api/contracts', () => ({
  timeLockContract: { address: '0xContract', abi: [] },
}));

jest.mock('../model/staking-utils', () => ({
  savePendingTx: jest.fn(),
  clearPendingTx: jest.fn(),
  mapContractError: jest.fn().mockReturnValue('오류가 발생했습니다.'),
  scheduleRefetch: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return { ...actual, useQueryClient: jest.fn() };
});

jest.mock('viem', () => {
  const actual = jest.requireActual('viem');
  return {
    ...actual,
    encodeFunctionData: jest.fn().mockReturnValue('0xencodedcalldata'),
    hashMessage: jest.fn().mockReturnValue('0xhashedmessage'),
  };
});

jest.mock('viem/accounts', () => ({
  privateKeyToAccount: jest.fn().mockReturnValue({
    signMessage: jest.fn().mockResolvedValue('0xsignature'),
  }),
}));

import { act, renderHook } from '@testing-library/react-native';

import { useGaslessDeposit } from '../model/use-gasless-deposit';

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { address: string | null }) => unknown) =>
    selector({ address: '0xUserAddress' }),
  ),
  secureKey: {
    retrieve: jest.fn().mockResolvedValue('abcdef1234567890'),
  },
}));

jest.mock('@entities/lock', () => ({
  useLockStore: jest.fn((selector: (s: { optimisticDeposit: jest.Mock }) => unknown) =>
    selector({ optimisticDeposit: jest.fn() }),
  ),
}));

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({ available: true }),
    simplePrompt: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    estimateFeesPerGas: jest.fn().mockResolvedValue({
      maxFeePerGas: BigInt('1000000000'),
      maxPriorityFeePerGas: BigInt('100000000'),
    }),
    waitForTransactionReceipt: jest.fn().mockResolvedValue({ status: 'success' }),
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useGaslessDeposit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ txHash: '0xmockhash' }),
    });
  });

  it('should start in idle state', () => {
    const { result } = renderHook(() => useGaslessDeposit());
    expect(result.current.txState).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('should transition through biometric → broadcasting → pending → success', async () => {
    const { result } = renderHook(() => useGaslessDeposit());

    await act(async () => {
      await result.current.gaslessDeposit(
        BigInt('1000000000000000000'),
        BigInt('9999999999'),
        'key-id',
      );
    });

    expect(result.current.txState).toBe('success');
  });

  it('should reset state on reset()', () => {
    const { result } = renderHook(() => useGaslessDeposit());

    act(() => {
      result.current.reset();
    });

    expect(result.current.txState).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('address가 null이면 아무 동작도 하지 않는다', async () => {
    const { useWalletStore } = jest.requireMock('@entities/wallet');
    useWalletStore.mockImplementationOnce((selector: (s: { address: string | null }) => unknown) =>
      selector({ address: null }),
    );

    const { result } = renderHook(() => useGaslessDeposit());

    await act(async () => {
      await result.current.gaslessDeposit(
        BigInt('1000000000000000000'),
        BigInt('9999999999'),
        'key-id',
      );
    });

    expect(result.current.txState).toBe('idle');
  });

  it('생체 인증 불가 시 error 상태가 된다', async () => {
    const { default: RNBiometrics } = jest.requireMock('react-native-biometrics');
    RNBiometrics.mockImplementationOnce(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({ available: false }),
      simplePrompt: jest.fn(),
    }));

    const { result } = renderHook(() => useGaslessDeposit());

    await act(async () => {
      await result.current.gaslessDeposit(
        BigInt('1000000000000000000'),
        BigInt('9999999999'),
        'key-id',
      );
    });

    expect(result.current.txState).toBe('error');
  });

  it('개인키가 null이면 error 상태가 된다', async () => {
    const { secureKey } = jest.requireMock('@entities/wallet');
    secureKey.retrieve.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useGaslessDeposit());

    await act(async () => {
      await result.current.gaslessDeposit(
        BigInt('1000000000000000000'),
        BigInt('9999999999'),
        'key-id',
      );
    });

    expect(result.current.txState).toBe('error');
  });

  it('should return to idle when biometric cancelled', async () => {
    const { default: RNBiometrics } = jest.requireMock('react-native-biometrics');
    RNBiometrics.mockImplementationOnce(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({ available: true }),
      simplePrompt: jest.fn().mockResolvedValue({ success: false }),
    }));

    const { result } = renderHook(() => useGaslessDeposit());

    await act(async () => {
      await result.current.gaslessDeposit(
        BigInt('1000000000000000000'),
        BigInt('9999999999'),
        'key-id',
      );
    });

    expect(result.current.txState).toBe('idle');
  });

  it('should set error state when relay fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'relay failed' }),
    });

    const { result } = renderHook(() => useGaslessDeposit());

    await act(async () => {
      await result.current.gaslessDeposit(
        BigInt('1000000000000000000'),
        BigInt('9999999999'),
        'key-id',
      );
    });

    expect(result.current.txState).toBe('error');
    expect(result.current.errorMessage).toBeTruthy();
  });
});
