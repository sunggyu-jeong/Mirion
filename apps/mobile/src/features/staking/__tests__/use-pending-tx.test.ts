jest.mock('@shared/lib/web3/client', () => ({
  publicClient: { waitForTransactionReceipt: jest.fn() },
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return { ...actual, useQueryClient: jest.fn() };
});

jest.mock('../model/staking-utils', () => ({
  loadPendingTx: jest.fn(),
  clearPendingTx: jest.fn(),
  scheduleRefetch: jest.fn(),
  TX_RECOVERY_THRESHOLD_MS: 2 * 60 * 60 * 1000,
}));

import { publicClient } from '@shared/lib/web3/client';
import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { Address } from 'viem';

import { clearPendingTx, loadPendingTx, scheduleRefetch } from '../model/staking-utils';
import { usePendingTx } from '../model/use-pending-tx';

const TEST_ADDRESS = '0xUser0000000000000000000000000000000001' as Address;
const TEST_TX_HASH = '0xabc123' as `0x${string}`;
const mockQueryClient = { invalidateQueries: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQueryClient).mockReturnValue(mockQueryClient as never);
});

describe('usePendingTx', () => {
  describe('초기 조건', () => {
    it('address가 null이면 loadPendingTx를 호출하지 않는다', () => {
      renderHook(() => usePendingTx(null));
      expect(loadPendingTx).not.toHaveBeenCalled();
    });

    it('MMKV에 pending tx가 없으면 waitForTransactionReceipt를 호출하지 않는다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue(null);

      const { unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await Promise.resolve();
      });

      unmount();
      expect(publicClient.waitForTransactionReceipt).not.toHaveBeenCalled();
    });

    it('초기 pendingTx가 null이다', () => {
      jest.mocked(loadPendingTx).mockReturnValue(null);
      const { result } = renderHook(() => usePendingTx(TEST_ADDRESS));
      expect(result.current.pendingTx).toBeNull();
    });

    it('초기 isRecovering이 false이다', () => {
      jest.mocked(loadPendingTx).mockReturnValue(null);
      const { result } = renderHook(() => usePendingTx(TEST_ADDRESS));
      expect(result.current.isRecovering).toBe(false);
    });
  });

  describe('만료된 트랜잭션', () => {
    it('2시간 이상 지난 tx는 clearPendingTx를 호출하고 복구하지 않는다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 3 * 60 * 60 * 1000,
        status: 'pending',
      });

      const { unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await Promise.resolve();
      });

      unmount();
      expect(clearPendingTx).toHaveBeenCalledWith(TEST_ADDRESS);
      expect(publicClient.waitForTransactionReceipt).not.toHaveBeenCalled();
    });
  });

  describe('유효한 트랜잭션 복구', () => {
    it('유효한 pending tx가 있으면 waitForTransactionReceipt를 호출한다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 60_000,
        status: 'pending',
      });
      jest.mocked(publicClient.waitForTransactionReceipt).mockResolvedValue({} as never);

      const { unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await Promise.resolve();
      });

      unmount();
      expect(publicClient.waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: TEST_TX_HASH,
        retryCount: 10,
        pollingInterval: 6_000,
      });
    });

    it('복구 중에는 isRecovering이 true이다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 60_000,
        status: 'pending',
      });

      let resolveReceipt!: () => void;
      jest.mocked(publicClient.waitForTransactionReceipt).mockReturnValue(
        new Promise(resolve => {
          resolveReceipt = () => resolve({} as never);
        }),
      );

      const { result, unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isRecovering).toBe(true);

      await act(async () => {
        resolveReceipt();
        await Promise.resolve();
      });

      unmount();
    });

    it('receipt 성공 시 clearPendingTx를 호출한다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 60_000,
        status: 'pending',
      });
      jest.mocked(publicClient.waitForTransactionReceipt).mockResolvedValue({} as never);

      const { unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await new Promise<void>(r => setTimeout(r, 0));
      });

      unmount();
      expect(clearPendingTx).toHaveBeenCalledWith(TEST_ADDRESS);
    });

    it('receipt 성공 시 scheduleRefetch를 호출한다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 60_000,
        status: 'pending',
      });
      jest.mocked(publicClient.waitForTransactionReceipt).mockResolvedValue({} as never);

      const { unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await new Promise<void>(r => setTimeout(r, 0));
      });

      unmount();
      expect(scheduleRefetch).toHaveBeenCalledWith(mockQueryClient, TEST_ADDRESS);
    });

    it('receipt 실패 시 clearPendingTx를 호출하고 scheduleRefetch는 호출하지 않는다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 60_000,
        status: 'pending',
      });
      jest
        .mocked(publicClient.waitForTransactionReceipt)
        .mockRejectedValue(new Error('receipt timeout'));

      const { unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await new Promise<void>(r => setTimeout(r, 0));
      });

      unmount();
      expect(clearPendingTx).toHaveBeenCalledWith(TEST_ADDRESS);
      expect(scheduleRefetch).not.toHaveBeenCalled();
    });

    it('복구 완료 후 isRecovering이 false가 된다', async () => {
      jest.mocked(loadPendingTx).mockReturnValue({
        txHash: TEST_TX_HASH,
        type: 'deposit',
        timestamp: Date.now() - 60_000,
        status: 'pending',
      });
      jest.mocked(publicClient.waitForTransactionReceipt).mockResolvedValue({} as never);

      const { result, unmount } = renderHook(() => usePendingTx(TEST_ADDRESS));

      await act(async () => {
        await new Promise<void>(r => setTimeout(r, 0));
      });

      unmount();
      expect(result.current.isRecovering).toBe(false);
    });
  });
});
