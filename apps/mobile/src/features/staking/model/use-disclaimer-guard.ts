import { useState } from 'react'
import ReactNativeBiometrics from 'react-native-biometrics'
import type { Address } from 'viem'

import { timeLockContract } from '@shared/api/contracts'
import { publicClient, createWalletClientFromKey } from '@shared/lib/web3/client'
import { storage } from '@shared/lib/storage'
import { secureKey } from '@entities/wallet'

const disclaimerKey = (address: string) => `disclaimer_accepted_${address}`

export function useDisclaimerGuard(address: string | null) {
  const stored = address ? storage.getString(disclaimerKey(address)) : null
  const [isAccepted, setIsAccepted] = useState(stored === 'true')

  const accept = async (keyId: string) => {
    if (!address) throw new Error('wallet not connected')

    const rnBiometrics = new ReactNativeBiometrics()
    const { available } = await rnBiometrics.isSensorAvailable()
    if (!available) throw new Error('biometric_unavailable')

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: '면책 조항 동의를 위해 생체 인증이 필요합니다',
    })
    if (!success) throw new Error('biometric_cancelled')

    let privateKey: string | null = null
    try {
      privateKey = await secureKey.retrieve(keyId)
      if (!privateKey) throw new Error('key_not_found')

      const walletClient = createWalletClientFromKey(`0x${privateKey}`)
      const txHash = await walletClient.writeContract({
        ...timeLockContract,
        functionName: 'acceptDisclaimer',
      })

      await publicClient.waitForTransactionReceipt({ hash: txHash })

      storage.set(disclaimerKey(address), 'true')
      setIsAccepted(true)
    } finally {
      privateKey = null
    }
  }

  return { isAccepted, accept }
}
