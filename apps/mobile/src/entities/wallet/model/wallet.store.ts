import { create } from 'zustand'

import { secureKey } from '../api/secure-key'

interface WalletState {
  address: string | null
  isInitialized: boolean
  generateKey: (keyId: string) => Promise<boolean>
  hasKey: (keyId: string) => boolean
  deleteKey: (keyId: string) => boolean
}

export const useWalletStore = create<WalletState>()((set) => ({
  address: null,
  isInitialized: false,

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
}))
