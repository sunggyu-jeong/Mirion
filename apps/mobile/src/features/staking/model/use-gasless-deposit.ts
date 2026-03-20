import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ReactNativeBiometrics from 'react-native-biometrics'
import { encodeFunctionData, hashMessage, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { timeLockContract } from '@shared/api/contracts'
import { publicClient } from '@shared/lib/web3/client'
import { secureKey, useWalletStore } from '@entities/wallet'
import { useLockStore } from '@entities/lock'

import { savePendingTx, clearPendingTx, mapContractError, scheduleRefetch } from './staking-utils'
import type { TxState } from './staking-utils'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

export function useGaslessDeposit() {
  const [txState, setTxState] = useState<TxState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isSubmitting = useRef(false)
  const queryClient = useQueryClient()
  const address = useWalletStore((s) => s.address)
  const optimisticDeposit = useLockStore((s) => s.optimisticDeposit)

  const gaslessDeposit = async (amountWei: bigint, unlockTime: bigint, keyId: string) => {
    if (isSubmitting.current || !address) return
    isSubmitting.current = true
    setErrorMessage(null)

    try {
      setTxState('biometric')
      const rnBiometrics = new ReactNativeBiometrics()
      const { available } = await rnBiometrics.isSensorAvailable()
      if (!available) throw new Error('biometric_unavailable')

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: '가스비 대납 예치를 위해 생체 인증이 필요합니다',
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

        const calldata = encodeFunctionData({
          abi: timeLockContract.abi,
          functionName: 'deposit',
          args: [unlockTime],
        })

        const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`)
        const signedHash = await account.signMessage({
          message: { raw: hashMessage(calldata) as `0x${string}` },
        })

        const fees = await publicClient.estimateFeesPerGas()

        const response = await fetch(`${BACKEND_URL}/api/relay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAddress: address,
            fnName: 'deposit',
            calldata,
            signedHash,
            value: amountWei.toString(),
            maxFeePerGas: fees.maxFeePerGas
              ? ((fees.maxFeePerGas * 110n) / 100n).toString()
              : undefined,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'relay failed')

        const txHash = data.txHash as `0x${string}`

        savePendingTx(address as Address, {
          txHash,
          type: 'deposit',
          timestamp: Date.now(),
          status: 'pending',
        })

        optimisticDeposit(amountWei, unlockTime)
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
        }
      } finally {
        privateKey = null
      }
    } catch (error) {
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

  return { gaslessDeposit, txState, errorMessage, reset }
}
