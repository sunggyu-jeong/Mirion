jest.mock('@entities/tx', () => ({
  useTxStore: jest.fn(),
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: { waitForTransactionReceipt: jest.fn() },
}));

import { useTxStore } from '@entities/tx';
import { publicClient } from '@shared/lib/web3/client';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useTxTracker } from '../model/use-tx-tracker';

const mockSetSuccess = jest.fn();
const mockSetError = jest.fn();

function makeStore(overrides: Record<string, unknown> = {}) {
  return (selector?: (s: Record<string, unknown>) => unknown) => {
    const store = {
      txHash: null as string | null,
      status: 'pending',
      setSuccess: mockSetSuccess,
      setError: mockSetError,
      ...overrides,
    };
    return selector ? selector(store) : store;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useTxStore).mockImplementation(makeStore());
});

describe('useTxTracker', () => {
  it('txHash가 없으면 waitForTransactionReceipt를 호출하지 않는다', () => {
    renderHook(() => useTxTracker());
    expect(publicClient.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it('status가 pending이 아니면 waitForTransactionReceipt를 호출하지 않는다', () => {
    jest.mocked(useTxStore).mockImplementation(makeStore({ txHash: '0xabc', status: 'success' }));
    renderHook(() => useTxTracker());
    expect(publicClient.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it('txHash와 pending 상태에서 waitForTransactionReceipt를 호출한다', async () => {
    jest.mocked(useTxStore).mockImplementation(makeStore({ txHash: '0xpending' }));
    (publicClient.waitForTransactionReceipt as jest.Mock).mockResolvedValue({ status: 'success' });

    renderHook(() => useTxTracker());

    await waitFor(() => {
      expect(publicClient.waitForTransactionReceipt).toHaveBeenCalledWith(
        expect.objectContaining({ hash: '0xpending' }),
      );
    });
  });

  it('receipt status success이면 setSuccess를 호출한다', async () => {
    jest.mocked(useTxStore).mockImplementation(makeStore({ txHash: '0xsuccess' }));
    (publicClient.waitForTransactionReceipt as jest.Mock).mockResolvedValue({ status: 'success' });

    renderHook(() => useTxTracker());

    await waitFor(() => expect(mockSetSuccess).toHaveBeenCalled());
  });

  it('receipt status reverted이면 setError를 호출한다', async () => {
    jest.mocked(useTxStore).mockImplementation(makeStore({ txHash: '0xreverted' }));
    (publicClient.waitForTransactionReceipt as jest.Mock).mockResolvedValue({
      status: 'reverted',
    });

    renderHook(() => useTxTracker());

    await waitFor(() => expect(mockSetError).toHaveBeenCalledWith('트랜잭션이 실패했습니다'));
  });

  it('waitForTransactionReceipt 실패 시 setError를 호출한다', async () => {
    jest.mocked(useTxStore).mockImplementation(makeStore({ txHash: '0xfail' }));
    (publicClient.waitForTransactionReceipt as jest.Mock).mockRejectedValue(new Error('timeout'));

    renderHook(() => useTxTracker());

    await waitFor(() =>
      expect(mockSetError).toHaveBeenCalledWith('트랜잭션 확인 중 오류가 발생했습니다'),
    );
  });
});
