import { create } from 'zustand'

import { secureKey } from '../api/secure-key'

type WalletType = 'walletconnect' | 'coinbase' | null

interface WalletState {
  address: string | null
  isInitialized: boolean
  isConnected: boolean
  walletType: WalletType
  generateKey: (keyId: string) => Promise<boolean>
  hasKey: (keyId: string) => boolean
  deleteKey: (keyId: string) => boolean
  setSession: (address: string, walletType: NonNullable<WalletType>) => void
  clearSession: () => void
  syncSession: (keyId: string) => Promise<void>
}

export const useWalletStore = create<WalletState>()((set) => ({
  address: null,
  isInitialized: false,
  isConnected: false,
  walletType: null,

  generateKey: async (keyId: string) => {
    const success = await secureKey.generate(keyId)
    if (success) set({ isInitialized: true })
    return success
  },

  hasKey: (keyId: string) => secureKey.has(keyId),

  deleteKey: (keyId: string) => {
    const result = secureKey.delete(keyId)
    set({ address: null, isInitialized: false })
    return result
  },

  setSession: (address: string, walletType: NonNullable<WalletType>) => {
    set({ address, walletType, isConnected: true, isInitialized: true })
  },

  clearSession: () => {
    set({ address: null, walletType: null, isConnected: false, isInitialized: false })
  },

  syncSession: async (keyId: string) => {
    const data = await secureKey.retrieveData(keyId)
    if (!data) {
      set({ address: null, walletType: null, isConnected: false, isInitialized: false })
    }
  },
}))
