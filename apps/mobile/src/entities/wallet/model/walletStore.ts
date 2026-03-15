import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  walletType: 'metamask' | 'walletconnect' | 'coinbase' | null;
  isConnected: boolean;
  actions: {
    connect: (address: string, type: 'metamask' | 'walletconnect' | 'coinbase') => void;
    disconnect: () => void;
  };
}

export const useWalletStore = create<WalletState>()(
  persist(
    set => ({
      address: null,
      walletType: null,
      isConnected: false,
      actions: {
        connect: (address, type) => set({ address, walletType: type, isConnected: true }),
        disconnect: () => set({ address: null, walletType: null, isConnected: false }),
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        address: state.address,
        walletType: state.walletType,
        isConnected: state.isConnected,
      }),
    },
  ),
);

export const useWalletActions = () => useWalletStore(state => state.actions);
export const useWalletAddress = () => useWalletStore(state => state.address);
