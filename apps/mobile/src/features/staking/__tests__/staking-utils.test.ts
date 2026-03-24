jest.mock('viem', () => {
  class ContractFunctionRevertedError extends Error {
    data: { errorName: string };
    constructor(errorName: string) {
      super();
      this.data = { errorName };
    }
  }
  class ContractFunctionExecutionError extends Error {
    cause: InstanceType<typeof ContractFunctionRevertedError>;
    constructor(cause: InstanceType<typeof ContractFunctionRevertedError>) {
      super();
      this.cause = cause;
    }
  }
  return { ContractFunctionExecutionError, ContractFunctionRevertedError };
});

jest.mock('@shared/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import type { TxRecord } from '@entities/lock';
import { storage } from '@shared/lib/storage';
import type { Address } from 'viem';
import { ContractFunctionExecutionError, ContractFunctionRevertedError } from 'viem';

import {
  clearPendingTx,
  loadPendingTx,
  mapContractError,
  savePendingTx,
  scheduleRefetch,
  withRetry,
} from '../model/staking-utils';

const mockStorage = storage as unknown as {
  getString: jest.Mock;
  set: jest.Mock;
  remove: jest.Mock;
};

const TEST_ADDRESS = '0xUserAddress000000000000000000000000000001' as Address;
const TEST_TX_RECORD: TxRecord = {
  txHash: '0xabc123',
  type: 'deposit',
  timestamp: Date.now(),
  status: 'pending',
};

describe('savePendingTx', () => {
  beforeEach(() => jest.clearAllMocks());

  it('올바른 키로 JSON 문자열을 MMKV에 저장한다', () => {
    savePendingTx(TEST_ADDRESS, TEST_TX_RECORD);
    expect(mockStorage.set).toHaveBeenCalledWith(
      `pending_tx_${TEST_ADDRESS}`,
      JSON.stringify(TEST_TX_RECORD),
    );
  });
});

describe('loadPendingTx', () => {
  beforeEach(() => jest.clearAllMocks());

  it('저장된 TxRecord를 파싱하여 반환한다', () => {
    mockStorage.getString.mockReturnValue(JSON.stringify(TEST_TX_RECORD));
    const result = loadPendingTx(TEST_ADDRESS);
    expect(result).toEqual(TEST_TX_RECORD);
  });

  it('키가 없으면 null을 반환한다', () => {
    mockStorage.getString.mockReturnValue(undefined);
    expect(loadPendingTx(TEST_ADDRESS)).toBeNull();
  });

  it('JSON 파싱 실패 시 null을 반환한다', () => {
    mockStorage.getString.mockReturnValue('invalid-json{{{');
    expect(loadPendingTx(TEST_ADDRESS)).toBeNull();
  });

  it('올바른 키로 조회한다', () => {
    mockStorage.getString.mockReturnValue(null);
    loadPendingTx(TEST_ADDRESS);
    expect(mockStorage.getString).toHaveBeenCalledWith(`pending_tx_${TEST_ADDRESS}`);
  });
});

describe('clearPendingTx', () => {
  beforeEach(() => jest.clearAllMocks());

  it('올바른 키로 MMKV 항목을 삭제한다', () => {
    clearPendingTx(TEST_ADDRESS);
    expect(mockStorage.remove).toHaveBeenCalledWith(`pending_tx_${TEST_ADDRESS}`);
  });
});

const makeRevertedError = (errorName: string) =>
  Object.assign(Object.create(ContractFunctionRevertedError.prototype), {
    data: { errorName },
  }) as InstanceType<typeof ContractFunctionRevertedError>;

const makeExecError = (cause: unknown) =>
  Object.assign(Object.create(ContractFunctionExecutionError.prototype), {
    cause,
  }) as InstanceType<typeof ContractFunctionExecutionError>;

describe('mapContractError', () => {
  it('TimeLock__Locked 에러를 한국어 메시지로 변환한다', () => {
    const execError = makeExecError(makeRevertedError('TimeLock__Locked'));
    expect(mapContractError(execError)).toBe('아직 잠금 해제 시간이 되지 않았습니다.');
  });

  it('TimeLock__NoBalance 에러를 한국어 메시지로 변환한다', () => {
    const execError = makeExecError(makeRevertedError('TimeLock__NoBalance'));
    expect(mapContractError(execError)).toBe('예치된 잔액이 없습니다.');
  });

  it('TimeLock__NoReward 에러를 한국어 메시지로 변환한다', () => {
    const execError = makeExecError(makeRevertedError('TimeLock__NoReward'));
    expect(mapContractError(execError)).toBe('수령할 이자가 없습니다.');
  });

  it('알 수 없는 컨트랙트 에러는 기본 메시지를 반환한다', () => {
    const execError = makeExecError(makeRevertedError('TimeLock__Unknown'));
    expect(mapContractError(execError)).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('biometric_unavailable 에러를 한국어 메시지로 변환한다', () => {
    expect(mapContractError(new Error('biometric_unavailable'))).toBe(
      '생체 인증을 사용할 수 없습니다.',
    );
  });

  it('key_not_found 에러를 한국어 메시지로 변환한다', () => {
    expect(mapContractError(new Error('key_not_found'))).toBe('지갑 키를 찾을 수 없습니다.');
  });

  it('일반 Error는 기본 메시지를 반환한다', () => {
    expect(mapContractError(new Error('some random error'))).toBe(
      '알 수 없는 오류가 발생했습니다.',
    );
  });

  it('Error가 아닌 값은 기본 메시지를 반환한다', () => {
    expect(mapContractError('문자열 에러')).toBe('알 수 없는 오류가 발생했습니다.');
    expect(mapContractError(null)).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('ContractFunctionExecutionError이지만 cause가 ContractFunctionRevertedError가 아니면 기본 메시지를 반환한다', () => {
    const execError = makeExecError(new Error('unknown cause'));
    expect(mapContractError(execError)).toBe('알 수 없는 오류가 발생했습니다.');
  });
});

describe('withRetry', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('첫 번째 시도에서 성공하면 결과를 반환한다', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('재시도 가능한 에러(429)에서 재시도하고 성공 값을 반환한다', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('HTTP 429 Too Many Requests'))
      .mockResolvedValueOnce('success');

    const promise = withRetry(fn);
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe('success');
  });

  it('재시도 가능한 에러(timeout)에서 재시도한다', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('request timeout'))
      .mockResolvedValueOnce('ok');

    const promise = withRetry(fn);
    await jest.runAllTimersAsync();
    await promise;

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('최대 재시도 횟수 초과 시 에러를 던진다', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('429 rate limited'));

    const promise = withRetry(fn, 3);
    promise.catch(() => {});

    await jest.advanceTimersByTimeAsync(10_000);

    await expect(promise).rejects.toThrow('429 rate limited');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('재시도 불가능한 에러는 즉시 던진다', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('invalid abi'));

    await expect(withRetry(fn)).rejects.toThrow('invalid abi');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Error 인스턴스가 아닌 값이 throw되면 즉시 던진다', async () => {
    const fn = jest.fn().mockRejectedValue('문자열 에러');

    await expect(withRetry(fn)).rejects.toBe('문자열 에러');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('maxRetries가 0이면 함수를 호출하지 않고 max_retries_exceeded를 던진다', async () => {
    const fn = jest.fn();

    await expect(withRetry(fn, 0)).rejects.toThrow('max_retries_exceeded');
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('scheduleRefetch', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('즉시, 5초 후, 10초 후에 invalidateQueries를 총 3회 호출한다', () => {
    const mockQueryClient = { invalidateQueries: jest.fn() };

    scheduleRefetch(mockQueryClient as never, TEST_ADDRESS);

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5_000);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(5_000);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it('lockInfo queryKey로 invalidateQueries를 호출한다', () => {
    const mockQueryClient = { invalidateQueries: jest.fn() };

    scheduleRefetch(mockQueryClient as never, TEST_ADDRESS);

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lockInfo', TEST_ADDRESS],
    });
  });
});
