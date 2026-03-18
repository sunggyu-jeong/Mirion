import { useEffect } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useConnect, useDisconnect, useAccount } from 'wagmi'

import { secureKey, useWalletStore } from '@entities/wallet'

const WALLET_KEY_ID = 'wc-session-key'

export function useWalletConnect() {
  const { connectAsync, connectors, isPending, error } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { address, isConnected } = useAccount()
  const setSession = useWalletStore(s => s.setSession)
  const clearSession = useWalletStore(s => s.clearSession)
  const syncSession = useWalletStore(s => s.syncSession)

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        syncSession(WALLET_KEY_ID)
      }
    })
    return () => sub.remove()
  }, [syncSession])

  const connectWallet = async () => {
    const connector = connectors[0]
    const result = await connectAsync({ connector })
    await secureKey.store(WALLET_KEY_ID, result.accounts[0])
    setSession(result.accounts[0], 'walletconnect')
    return result
  }

  const disconnectWallet = async () => {
    secureKey.delete(WALLET_KEY_ID)
    clearSession()
    await disconnectAsync()
  }

  return { connectWallet, disconnectWallet, address, isConnected, isPending, error }
}
