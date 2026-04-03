jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(),
}));

import { useLidoStore } from '@entities/lido';
import { act, renderHook } from '@testing-library/react-native';

import { useSimulator } from '../model/useSimulator';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLidoStore).mockReturnValue({ estimatedApy: 3.8 } as never);
});

describe('useSimulator', () => {
  it('초기값: amountText "1", selectedMonths 12', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.amountText).toBe('1');
    expect(result.current.selectedMonths).toBe(12);
  });

  it('estimatedApy가 0이면 기본값 3.5 사용', () => {
    jest.mocked(useLidoStore).mockReturnValue({ estimatedApy: 0 } as never);
    const { result } = renderHook(() => useSimulator());
    expect(result.current.apy).toBe(3.5);
  });

  it('estimatedApy가 있으면 그 값을 사용', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.apy).toBe(3.8);
  });

  it('selectAmount 호출 시 amountText 변경', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.selectAmount('5'));
    expect(result.current.amountText).toBe('5');
  });

  it('setAmountText 직접 호출 시 amountText 변경', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.setAmountText('2.5'));
    expect(result.current.amountText).toBe('2.5');
  });

  it('selectMonths 호출 시 selectedMonths 변경', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.selectMonths(24));
    expect(result.current.selectedMonths).toBe(24);
  });

  it('principal이 양수이면 result가 null이 아니다', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.result).not.toBeNull();
  });

  it('principal이 0이면 result가 null이다', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.setAmountText('0'));
    expect(result.current.result).toBeNull();
  });

  it('결과의 finalBalance는 principal보다 크다', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.result!.finalBalance).toBeGreaterThan(1);
  });

  it('결과의 earned는 finalBalance - principal이다', () => {
    const { result } = renderHook(() => useSimulator());
    const { earned, finalBalance } = result.current.result!;
    expect(earned).toBeCloseTo(finalBalance - 1, 6);
  });

  it('xTicks 첫 항목 label이 "지금"이다', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.result!.xTicks[0].label).toBe('지금');
  });

  it('1개월 선택 시 xTicks 마지막 label이 "1개월"이다', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.selectMonths(1));
    const xTicks = result.current.result!.xTicks;
    expect(xTicks[xTicks.length - 1].label).toBe('1개월');
  });

  it('12개월 선택 시 xTicks 마지막 label이 "1년"이다', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.result!.xTicks[result.current.result!.xTicks.length - 1].label).toBe(
      '1년',
    );
  });

  it('24개월 선택 시 xTicks 마지막 label이 "2년"이다', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.selectMonths(24));
    const xTicks = result.current.result!.xTicks;
    expect(xTicks[xTicks.length - 1].label).toBe('2년');
  });

  it('durationOptions와 quickAmounts를 반환한다', () => {
    const { result } = renderHook(() => useSimulator());
    expect(result.current.durationOptions.length).toBeGreaterThan(0);
    expect(result.current.quickAmounts.length).toBeGreaterThan(0);
  });

  it('TICK_MAP에 없는 selectedMonths이면 기본 xTicks를 사용한다', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => result.current.selectMonths(2));
    expect(result.current.result!.xTicks).toBeDefined();
    expect(result.current.result!.xTicks[0].label).toBe('지금');
  });
});
