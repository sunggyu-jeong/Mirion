import { create } from 'zustand';

type WalletType = 'walletconnect' | 'coinbase' | null;

interface WalletState {
  address: string | null;
  isConnected: boolean;
  walletType: WalletType;
  setSession: (address: string, walletType: NonNullable<WalletType>) => void;
  clearSession: () => void;
}

export const useWalletStore = create<WalletState>()(set => ({
  address: null,
  isConnected: false,
  walletType: null,

  setSession: (address: string, walletType: NonNullable<WalletType>) => {
    set({ address, walletType, isConnected: true });
  },

  clearSession: () => {
    set({ address: null, walletType: null, isConnected: false });
  },
}));
