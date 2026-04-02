import { addDays, formatDate, formatFullDate } from '../date';

describe('formatDate', () => {
  it('날짜를 YYYY.MM.DD 형식으로 반환한다', () => {
    expect(formatDate(new Date('2026-04-02'))).toBe('2026.04.02');
  });

  it('월과 일이 한 자리일 때 0을 붙인다', () => {
    expect(formatDate(new Date('2026-01-05'))).toBe('2026.01.05');
  });

  it('12월 31일을 올바르게 포맷한다', () => {
    expect(formatDate(new Date('2026-12-31'))).toBe('2026.12.31');
  });
});

describe('formatFullDate', () => {
  it('한국어 날짜 형식으로 반환한다', () => {
    const result = formatFullDate(new Date('2026-04-02'));
    expect(result).toContain('2026');
    expect(result).toContain('4');
    expect(result).toContain('2');
  });
});

describe('addDays', () => {
  it('날짜에 일수를 더한다', () => {
    const base = new Date('2026-04-01');
    const result = addDays(base, 7);
    expect(result.getDate()).toBe(8);
    expect(result.getMonth()).toBe(3);
  });

  it('월을 넘어가는 경우도 올바르게 계산한다', () => {
    const base = new Date('2026-03-30');
    const result = addDays(base, 5);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(4);
  });

  it('원본 날짜를 변경하지 않는다', () => {
    const base = new Date('2026-04-01');
    addDays(base, 10);
    expect(base.getDate()).toBe(1);
  });
});
