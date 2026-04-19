import { addDays, formatDate, formatFullDate } from '../date';

describe('formatDate', () => {
  it('formats a date as YYYY.MM.DD', () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe('2024.01.05');
  });

  it('pads month and day with leading zeros', () => {
    expect(formatDate(new Date(2024, 8, 9))).toBe('2024.09.09');
  });

  it('formats December 31', () => {
    expect(formatDate(new Date(2023, 11, 31))).toBe('2023.12.31');
  });
});

describe('formatFullDate', () => {
  it('returns a Korean locale date string', () => {
    const result = formatFullDate(new Date(2024, 0, 15));
    expect(result).toContain('2024');
    expect(result).toContain('1');
    expect(result).toContain('15');
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const base = new Date(2024, 0, 1);
    const result = addDays(base, 7);
    expect(result.getDate()).toBe(8);
    expect(result.getMonth()).toBe(0);
  });

  it('rolls over to next month', () => {
    const base = new Date(2024, 0, 28);
    const result = addDays(base, 5);
    expect(result.getMonth()).toBe(1);
  });

  it('does not mutate the original date', () => {
    const base = new Date(2024, 0, 1);
    addDays(base, 10);
    expect(base.getDate()).toBe(1);
  });

  it('adds negative days (subtracts)', () => {
    const base = new Date(2024, 0, 10);
    const result = addDays(base, -3);
    expect(result.getDate()).toBe(7);
  });
});
