import type { ChainFilter } from '@entities/whale';
import { create } from 'zustand';

type RefreshInterval = 15 | 30 | 60 | 300;
type MinDetectionEth = 100 | 500 | 1000;
type Currency = 'USD' | 'KRW';

interface AppSettingsState {
  refreshInterval: RefreshInterval;
  minDetectionEth: MinDetectionEth;
  currency: Currency;
  quietHoursEnabled: boolean;
  alertMinEth: MinDetectionEth;
  selectedChain: ChainFilter;
  setRefreshInterval: (v: RefreshInterval) => void;
  setMinDetectionEth: (v: MinDetectionEth) => void;
  setCurrency: (v: Currency) => void;
  setQuietHours: (v: boolean) => void;
  setAlertMinEth: (v: MinDetectionEth) => void;
  setSelectedChain: (v: ChainFilter) => void;
}

export const useAppSettingsStore = create<AppSettingsState>()(set => ({
  refreshInterval: 30,
  minDetectionEth: 100,
  currency: 'USD',
  quietHoursEnabled: false,
  alertMinEth: 100,
  selectedChain: 'ALL',
  setRefreshInterval: refreshInterval => set({ refreshInterval }),
  setMinDetectionEth: minDetectionEth => set({ minDetectionEth }),
  setCurrency: currency => set({ currency }),
  setQuietHours: quietHoursEnabled => set({ quietHoursEnabled }),
  setAlertMinEth: alertMinEth => set({ alertMinEth }),
  setSelectedChain: selectedChain => set({ selectedChain }),
}));
