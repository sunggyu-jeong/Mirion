import { create } from 'zustand';

interface SubscriptionState {
  isPro: boolean;
  notificationsEnabled: boolean;
  setPro: (isPro: boolean) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(set => ({
  isPro: false,
  notificationsEnabled: false,
  setPro: (isPro: boolean) => set({ isPro }),
  setNotifications: (enabled: boolean) => set({ notificationsEnabled: enabled }),
}));
