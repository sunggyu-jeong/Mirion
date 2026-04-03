import { create } from 'zustand';

interface LoadingState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

export const useLoadingStore = create<LoadingState>()(set => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));

export const loading = {
  show: () => useLoadingStore.getState().show(),
  hide: () => useLoadingStore.getState().hide(),
};
