jest.mock('@shared/lib/storage', () => ({
  storage: { getString: jest.fn(), set: jest.fn() },
}));

import { storage } from '@shared/lib/storage';
import { renderHook } from '@testing-library/react-native';

import { useStreakTracker } from '../use-streak-tracker';

const mockGetString = storage.getString as jest.Mock;
const mockSet = storage.set as jest.Mock;

describe('useStreakTracker', () => {
  beforeEach(() => {
    mockGetString.mockClear();
    mockSet.mockClear();
  });

  it('starts streak at 1 when no prior data', () => {
    mockGetString.mockReturnValue(undefined);
    const { result } = renderHook(() => useStreakTracker());
    expect(result.current).toBe(1);
    expect(mockSet).toHaveBeenCalledTimes(1);
  });

  it('returns existing count when already visited today', () => {
    const today = new Date().toISOString().split('T')[0];
    mockGetString.mockReturnValue(JSON.stringify({ count: 5, lastDate: today }));
    const { result } = renderHook(() => useStreakTracker());
    expect(result.current).toBe(5);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('increments streak when last visit was yesterday', () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
    mockGetString.mockReturnValue(JSON.stringify({ count: 3, lastDate: yesterday }));
    const { result } = renderHook(() => useStreakTracker());
    expect(result.current).toBe(4);
    expect(mockSet).toHaveBeenCalledTimes(1);
  });

  it('resets streak when broken', () => {
    mockGetString.mockReturnValue(JSON.stringify({ count: 10, lastDate: '2020-01-01' }));
    const { result } = renderHook(() => useStreakTracker());
    expect(result.current).toBe(1);
  });
});
