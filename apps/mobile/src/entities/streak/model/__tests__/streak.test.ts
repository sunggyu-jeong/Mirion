import { computeStreak } from '../streak';

const TODAY = '2026-04-09';
const YESTERDAY = '2026-04-08';
const TWO_DAYS_AGO = '2026-04-07';

describe('computeStreak', () => {
  it('starts streak at 1 when no prior data', () => {
    expect(computeStreak(null, TODAY)).toEqual({ count: 1, lastDate: TODAY });
  });

  it('returns same data if already recorded today', () => {
    const data = { count: 5, lastDate: TODAY };
    expect(computeStreak(data, TODAY)).toBe(data);
  });

  it('increments count when last visit was yesterday', () => {
    const data = { count: 3, lastDate: YESTERDAY };
    expect(computeStreak(data, TODAY)).toEqual({ count: 4, lastDate: TODAY });
  });

  it('resets to 1 when streak is broken', () => {
    const data = { count: 10, lastDate: TWO_DAYS_AGO };
    expect(computeStreak(data, TODAY)).toEqual({ count: 1, lastDate: TODAY });
  });

  it('resets to 1 when last visit was long ago', () => {
    const data = { count: 7, lastDate: '2026-01-01' };
    expect(computeStreak(data, TODAY)).toEqual({ count: 1, lastDate: TODAY });
  });

  it('increments correctly at month boundary', () => {
    const data = { count: 2, lastDate: '2026-03-31' };
    expect(computeStreak(data, '2026-04-01')).toEqual({ count: 3, lastDate: '2026-04-01' });
  });
});
