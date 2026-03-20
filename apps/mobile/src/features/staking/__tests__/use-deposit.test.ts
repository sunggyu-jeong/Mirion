jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('viem', () => {
  class UserRejectedRequestError extends Error {
    constructor() {
      super('User rejected the request.');
      this.name = 'UserRejectedRequestError';
    }
  }
  return { UserRejectedRequestError };
});

jest.mock('@entities/wallet', () => ({
  secureKey: { retrieve: jest.fn() },
  useWalletStore: jest.fn(),
}));

jest.mock('@entities/lock', () => ({
  useLockStore: jest.fn(),
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    estimateFeesPerGas: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
  },
  createWalletClientFromKey: jest.fn(),
}));

jest.mock('@shared/api/contracts', () => ({
  timeLockContract: { address: '0xContract', abi: [] },
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return { ...actual, useQueryClient: jest.fn() };
});

jest.mock('../model/staking-utils', () => ({
  savePendingTx: jest.fn(),
  clearPendingTx: jest.fn(),
  mapContractError: jest.fn().mockReturnValue('알 수 없는 오류가 발생했습니다.'),
  scheduleRefetch: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { UserRejectedRequestError } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { secureKey, useWalletStore } from '@entities/wallet';
import { useLockStore } from '@entities/lock';
import { publicClient, createWalletClientFromKey } from '@shared/lib/web3/client';
import { savePendingTx, clearPendingTx, scheduleRefetch } from '../model/staking-utils';
import { useDeposit } from '../model/use-deposit';

const TEST_ADDRESS = '0xUser0000000000000000000000000000000001';
const TEST_TX_HASH = '0xdeadbeef' as `0x${string}`;
const TEST_KEY_ID = 'wallet-key-1';
const AMOUNT_WEI = 1000000000000000000n;
const UNLOCK_TIME = 9999999999n;

const mockIsSensorAvailable = jest.fn();
const mockSimplePrompt = jest.fn();
const mockWriteContract = jest.fn();
const mockOptimisticDeposit = jest.fn();
const mockQueryClient = { invalidateQueries: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(ReactNativeBiometrics).mockImplementation(() => ({
    isSensorAvailable: mockIsSensorAvailable,
    simplePrompt: mockSimplePrompt,
  }) as unknown as ReactNativeBiometrics);
  mockIsSensorAvailable.mockResolvedValue({ available: true });
  mockSimplePrompt.mockResolvedValue({ success: true });
  jest.mocked(secureKey.retrieve).mockResolvedValue('deadbeef1234');
  jest.mocked(createWalletClientFromKey).mockReturnValue({ writeContract: mockWriteContract } as never);
  mockWriteContract.mockResolvedValue(TEST_TX_HASH);
  jest.mocked(publicClient.estimateFeesPerGas).mockResolvedValue({} as never);
  jest.mocked(publicClient.waitForTransactionReceipt).mockResolvedValue({} as never);
  jest.mocked(useWalletStore).mockReturnValue({ address: TEST_ADDRESS } as never);
  jest.mocked(useLockStore).mockReturnValue({ optimisticDeposit: mockOptimisticDeposit } as never);
  jest.mocked(useQueryClient).mockReturnValue(mockQueryClient as never);
});

describe('useDeposit', () => {
  describe('초기 상태', () => {
    it('txState가 idle이다', () => {
      const { result } = renderHook(() => useDeposit());
      expect(result.current.txState).toBe('idle');
    });

    it('errorMessage가 null이다', () => {
      const { result } = renderHook(() => useDeposit());
      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('address 미연결', () => {
    it('address가 null이면 아무 동작도 하지 않는다', async () => {
      jest.mocked(useWalletStore).mockReturnValue({ address: null } as never);

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(mockIsSensorAvailable).not.toHaveBeenCalled();
    });
  });

  describe('생체 인증', () => {
    it('생체 인증 불가 시 state가 error가 된다', async () => {
      mockIsSensorAvailable.mockResolvedValue({ available: false });

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.txState).toBe('error');
    });

    it('생체 인증 취소 시 state가 idle로 돌아온다', async () => {
      mockSimplePrompt.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.txState).toBe('idle');
      expect(mockWriteContract).not.toHaveBeenCalled();
    });

    it('생체 인증 취소 시 개인키 조회를 하지 않는다', async () => {
      mockSimplePrompt.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(secureKey.retrieve).not.toHaveBeenCalled();
    });
  });

  describe('개인키', () => {
    it('개인키가 null이면 state가 error가 된다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue(null);

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.txState).toBe('error');
    });

    it('올바른 keyId로 secureKey.retrieve를 호출한다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(secureKey.retrieve).toHaveBeenCalledWith(TEST_KEY_ID);
    });

    it('개인키에 0x prefix를 붙여 walletClient를 생성한다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue('deadbeef');

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(createWalletClientFromKey).toHaveBeenCalledWith('0xdeadbeef');
    });
  });

  describe('트랜잭션 전송 성공', () => {
    it('deposit 성공 후 state가 success가 된다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.txState).toBe('success');
    });

    it('writeContract에 올바른 args와 value를 전달한다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'deposit',
          args: [UNLOCK_TIME],
          value: AMOUNT_WEI,
        }),
      );
    });

    it('txHash를 MMKV에 저장한다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(savePendingTx).toHaveBeenCalledWith(
        TEST_ADDRESS,
        expect.objectContaining({ txHash: TEST_TX_HASH, type: 'deposit' }),
      );
    });

    it('optimisticDeposit을 즉시 호출한다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(mockOptimisticDeposit).toHaveBeenCalledWith(AMOUNT_WEI, UNLOCK_TIME);
    });

    it('receipt 확인 후 clearPendingTx를 호출한다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(clearPendingTx).toHaveBeenCalledWith(TEST_ADDRESS);
    });

    it('receipt 확인 후 scheduleRefetch를 호출한다', async () => {
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(scheduleRefetch).toHaveBeenCalledWith(mockQueryClient, TEST_ADDRESS);
    });
  });

  describe('중복 실행 방지', () => {
    it('이미 처리 중일 때 두 번째 호출은 무시된다', async () => {
      jest.mocked(publicClient.waitForTransactionReceipt).mockReturnValue(new Promise(() => {}) as never);

      const { result } = renderHook(() => useDeposit());

      act(() => {
        result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
        result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockIsSensorAvailable).toHaveBeenCalledTimes(1);
    });
  });

  describe('UserRejectedRequestError', () => {
    it('서명 거부 시 state가 idle로 돌아온다', async () => {
      mockWriteContract.mockRejectedValue(new UserRejectedRequestError(new Error()));

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.txState).toBe('idle');
    });

    it('서명 거부 시 errorMessage를 설정하지 않는다', async () => {
      mockWriteContract.mockRejectedValue(new UserRejectedRequestError(new Error()));

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('receipt timeout', () => {
    it('receipt 대기 실패 시 state가 pending으로 유지된다', async () => {
      jest.mocked(publicClient.waitForTransactionReceipt).mockRejectedValue(
        new Error('timeout exceeded'),
      );

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(result.current.txState).toBe('pending');
    });

    it('receipt timeout 시 MMKV의 txHash는 유지된다', async () => {
      jest.mocked(publicClient.waitForTransactionReceipt).mockRejectedValue(
        new Error('timeout exceeded'),
      );

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(clearPendingTx).not.toHaveBeenCalled();
    });
  });

  describe('가스비 적용', () => {
    it('maxFeePerGas에 110% 버퍼를 적용한다', async () => {
      jest.mocked(publicClient.estimateFeesPerGas).mockResolvedValue({
        maxFeePerGas: 100n,
        maxPriorityFeePerGas: 10n,
      } as never);

      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          maxFeePerGas: 110n,
          maxPriorityFeePerGas: 11n,
        }),
      );
    });
  });

  describe('reset', () => {
    it('reset 호출 후 state가 idle이 된다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue(null);
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });
      act(() => result.current.reset());

      expect(result.current.txState).toBe('idle');
    });

    it('reset 호출 후 errorMessage가 null이 된다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue(null);
      const { result } = renderHook(() => useDeposit());

      await act(async () => {
        await result.current.deposit(AMOUNT_WEI, UNLOCK_TIME, TEST_KEY_ID);
      });
      act(() => result.current.reset());

      expect(result.current.errorMessage).toBeNull();
    });
  });
});
