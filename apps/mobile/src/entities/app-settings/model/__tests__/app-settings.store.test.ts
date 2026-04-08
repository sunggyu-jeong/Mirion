import { act, renderHook } from '@testing-library/react-native';

import { useAppSettingsStore } from '../app-settings.store';

beforeEach(() => {
  useAppSettingsStore.setState({
    refreshInterval: 30,
    minDetectionEth: 100,
    currency: 'USD',
    quietHoursEnabled: false,
    alertMinEth: 100,
    selectedChain: 'ALL',
  });
});

describe('useAppSettingsStore', () => {
  it('should have default selectedChain of ALL', () => {
    const { result } = renderHook(() => useAppSettingsStore(s => s.selectedChain));
    expect(result.current).toBe('ALL');
  });

  it('setSelectedChain should update selectedChain', () => {
    const { result } = renderHook(() => useAppSettingsStore());
    act(() => {
      result.current.setSelectedChain('ETH');
    });
    expect(result.current.selectedChain).toBe('ETH');
  });

  it('setSelectedChain should support all chain values', () => {
    const { result } = renderHook(() => useAppSettingsStore());
    const chains = ['ETH', 'BTC', 'SOL', 'BNB', 'ALL'] as const;
    chains.forEach(chain => {
      act(() => {
        result.current.setSelectedChain(chain);
      });
      expect(result.current.selectedChain).toBe(chain);
    });
  });

  it('should have default refreshInterval of 30', () => {
    const { result } = renderHook(() => useAppSettingsStore(s => s.refreshInterval));
    expect(result.current).toBe(30);
  });

  it('setRefreshInterval should update refreshInterval', () => {
    const { result } = renderHook(() => useAppSettingsStore());
    act(() => {
      result.current.setRefreshInterval(60);
    });
    expect(result.current.refreshInterval).toBe(60);
  });

  it('setCurrency should update currency', () => {
    const { result } = renderHook(() => useAppSettingsStore());
    act(() => {
      result.current.setCurrency('KRW');
    });
    expect(result.current.currency).toBe('KRW');
  });

  it('setQuietHours should toggle quietHoursEnabled', () => {
    const { result } = renderHook(() => useAppSettingsStore());
    act(() => {
      result.current.setQuietHours(true);
    });
    expect(result.current.quietHoursEnabled).toBe(true);
  });
});
