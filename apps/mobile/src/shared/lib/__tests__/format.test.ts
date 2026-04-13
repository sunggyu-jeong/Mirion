import { formatEth, formatRelativeTime, formatUsd } from '../format';

describe('formatUsd', () => {
  it('formats billions', () => {
    expect(formatUsd(2_000_000_000)).toBe('$2B');
    expect(formatUsd(1_500_000_000)).toBe('$1.5B');
  });

  it('formats millions', () => {
    expect(formatUsd(847_000_000)).toBe('$847M');
    expect(formatUsd(1_200_000)).toBe('$1.2M');
  });

  it('formats thousands', () => {
    expect(formatUsd(5_000)).toBe('$5K');
    expect(formatUsd(2_500)).toBe('$2.5K');
  });

  it('formats sub-thousand', () => {
    expect(formatUsd(999)).toBe('$999');
    expect(formatUsd(0)).toBe('$0');
  });

  it('omits decimal when whole number in M', () => {
    expect(formatUsd(3_000_000)).toBe('$3M');
  });
});

describe('formatEth', () => {
  it('formats whole ETH', () => {
    expect(formatEth(500)).toBe('500 ETH');
  });

  it('formats decimal ETH', () => {
    expect(formatEth(1.5)).toBe('1.5 ETH');
  });

  it('formats small ETH with up to 2 decimals', () => {
    expect(formatEth(0.12345)).toBe('0.12 ETH');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.now();

  it('returns 방금 전 for < 60s', () => {
    expect(formatRelativeTime(now - 30_000)).toBe('방금 전');
  });

  it('returns minutes', () => {
    expect(formatRelativeTime(now - 5 * 60_000)).toBe('5분 전');
  });

  it('returns hours', () => {
    expect(formatRelativeTime(now - 3 * 3_600_000)).toBe('3시간 전');
  });

  it('returns 어제 for 1 day ago', () => {
    expect(formatRelativeTime(now - 25 * 3_600_000)).toBe('어제');
  });

  it('returns days for 2-6 days', () => {
    expect(formatRelativeTime(now - 3 * 86_400_000)).toBe('3일 전');
  });

  it('returns 1주 전 for 7 days', () => {
    expect(formatRelativeTime(now - 7 * 86_400_000)).toBe('1주 전');
  });

  it('returns weeks for 2+ weeks', () => {
    expect(formatRelativeTime(now - 14 * 86_400_000)).toBe('2주 전');
  });
});
