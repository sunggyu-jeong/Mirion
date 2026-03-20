import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ReactNativeBiometrics from 'react-native-biometrics'
import { UserRejectedRequestError } from 'viem'
import type { Address } from 'viem'

import { timeLockContract } from '@shared/api/contracts'
import { publicClient, createWalletClientFromKey } from '@shared/lib/web3/client'
import { secureKey } from '@entities/wallet'
import { useLockStore } from '@entities/lock'
import { useWalletStore } from '@entities/wallet'

import {
  savePendingTx,
  clearPendingTx,
  mapContractError,
  scheduleRefetch,
} from './staking-utils'
import type { TxState } from './staking-utils'

export function useWithdraw() {
  const [txState, setTxState] = useState<TxState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isSubmitting = useRef(false)
  const queryClient = useQueryClient()
  const { address } = useWalletStore()
  const { optimisticWithdraw } = useLockStore()

  const withdraw = async (keyId: string) => {
    if (isSubmitting.current || !address) return
    isSubmitting.current = true
    setErrorMessage(null)

    try {
      setTxState('biometric')
      const rnBiometrics = new ReactNativeBiometrics()
      const { available } = await rnBiometrics.isSensorAvailable()
      if (!available) throw new Error('biometric_unavailable')

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: '출금을 위해 생체 인증이 필요합니다',
      })
      if (!success) {
        setTxState('idle')
        return
      }

      setTxState('broadcasting')
      let privateKey: string | null = null
      try {
        privateKey = await secureKey.retrieve(keyId)
        if (!privateKey) throw new Error('key_not_found')

        const walletClient = createWalletClientFromKey(`0x${privateKey}`)
        const fees = await publicClient.estimateFeesPerGas()

        const txHash = await walletClient.writeContract({
          ...timeLockContract,
          functionName: 'withdraw',
          ...(fees.maxFeePerGas && { maxFeePerGas: (fees.maxFeePerGas * 110n) / 100n }),
          ...(fees.maxPriorityFeePerGas && {
            maxPriorityFeePerGas: (fees.maxPriorityFeePerGas * 110n) / 100n,
          }),
        })

        savePendingTx(address as Address, {
          txHash,
          type: 'withdraw',
          timestamp: Date.now(),
          status: 'pending',
        })

        optimisticWithdraw()
        setTxState('pending')

        try {
          await publicClient.waitForTransactionReceipt({
            hash: txHash,
            retryCount: 10,
            pollingInterval: 6_000,
          })
          clearPendingTx(address as Address)
          scheduleRefetch(queryClient, address as Address)
          setTxState('success')
        } catch {
          // receipt timeout - MMKV에 txHash 보관 중, use-pending-tx가 복구
        }
      } finally {
        privateKey = null
      }
    } catch (error) {
      if (error instanceof UserRejectedRequestError) {
        setTxState('idle')
        return
      }
      setTxState('error')
      setErrorMessage(mapContractError(error))
    } finally {
      isSubmitting.current = false
    }
  }

  const reset = () => {
    setTxState('idle')
    setErrorMessage(null)
  }

  return { withdraw, txState, errorMessage, reset }
}
