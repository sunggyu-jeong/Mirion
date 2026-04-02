import { useLidoStore } from '@entities/lido';
import { act, renderHook } from '@testing-library/react-native';

jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(),
}));

const mockRequestWithdrawal = jest.fn();

jest.mock('../model/use-lido-withdraw', () => ({
  useLidoWithdraw: jest.fn(() => ({ requestWithdrawal: mockRequestWithdrawal, isPending: false })),
}));

import { useUnstake } from '../model/use-unstake';

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useLidoStore)
    .mockReturnValue({ stakedBalance: BigInt('2000000000000000000') } as never);
});

describe('useUnstake', () => {
  it('초기 상태: amount 빈 문자열, error 빈 문자열', () => {
    const { result } = renderHook(() => useUnstake());
    expect(result.current.amount).toBe('');
    expect(result.current.error).toBe('');
  });

  it('setAmount 호출 시 amount 업데이트 및 error 초기화', () => {
    const { result } = renderHook(() => useUnstake());
    act(() => result.current.setAmount('1.0'));
    expect(result.current.amount).toBe('1.0');
    expect(result.current.error).toBe('');
  });

  it('setMax 호출 시 stakedBalance 기준 최대 금액 설정', () => {
    const { result } = renderHook(() => useUnstake());
    act(() => result.current.setMax());
    expect(result.current.amount).toBe('2.000000');
  });

  it('금액 없이 submit 시 false 반환 및 에러 설정', async () => {
    const { result } = renderHook(() => useUnstake());
    let success = true;
    await act(async () => {
      success = await result.current.submit();
    });
    expect(success).toBe(false);
    expect(result.current.error).toBe('금액을 입력해주세요');
  });

  it('잔고 초과 금액 submit 시 false 반환 및 에러 설정', async () => {
    const { result } = renderHook(() => useUnstake());
    act(() => result.current.setAmount('3.0'));
    let success = true;
    await act(async () => {
      success = await result.current.submit();
    });
    expect(success).toBe(false);
    expect(result.current.error).toBe('스테이킹 잔고를 초과합니다');
  });

  it('유효한 금액 submit 시 true 반환 및 amount 초기화', async () => {
    mockRequestWithdrawal.mockResolvedValue(undefined);
    const { result } = renderHook(() => useUnstake());
    act(() => result.current.setAmount('1.0'));
    let success = false;
    await act(async () => {
      success = await result.current.submit();
    });
    expect(success).toBe(true);
    expect(result.current.amount).toBe('');
    expect(result.current.error).toBe('');
    expect(mockRequestWithdrawal).toHaveBeenCalled();
  });

  it('requestWithdrawal 실패 시 false 반환 및 에러 설정', async () => {
    mockRequestWithdrawal.mockRejectedValue(new Error('tx failed'));
    const { result } = renderHook(() => useUnstake());
    act(() => result.current.setAmount('1.0'));
    let success = true;
    await act(async () => {
      success = await result.current.submit();
    });
    expect(success).toBe(false);
    expect(result.current.error).toBe('출금 요청에 실패했습니다');
  });

  it('isPending은 useLidoWithdraw의 isPending을 반영한다', () => {
    const { useLidoWithdraw } = require('../model/use-lido-withdraw');
    jest.mocked(useLidoWithdraw).mockReturnValue({
      requestWithdrawal: mockRequestWithdrawal,
      isPending: true,
    });
    const { result } = renderHook(() => useUnstake());
    expect(result.current.isPending).toBe(true);
  });
});
