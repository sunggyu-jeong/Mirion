import { renderHook } from '@testing-library/react-native';

import { useCountUp } from '../index';

describe('useCountUp', () => {
  it('animates to target value', () => {
    const { result } = renderHook(() => useCountUp(1000));
    expect(result.current).toBe(1000);
  });

  it('animates to zero target', () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current).toBe(0);
  });

  it('updates when target changes', () => {
    const { result, rerender } = renderHook<number, { target: number }>(
      ({ target }) => useCountUp(target),
      { initialProps: { target: 100 } },
    );
    expect(result.current).toBe(100);

    rerender({ target: 500 });
    expect(result.current).toBe(500);
  });

  it('handles large values', () => {
    const { result } = renderHook(() => useCountUp(847_000_000));
    expect(result.current).toBe(847_000_000);
  });
});
