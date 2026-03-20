import { ContractFunctionExecutionError, ContractFunctionRevertedError } from 'viem'
import type { Address, Hash } from 'viem'
import type { QueryClient } from '@tanstack/react-query'

import { storage } from '@shared/lib/storage'
import type { TxRecord } from '@entities/lock'

const PENDING_TX_KEY = (address: Address) => `pending_tx_${address}`

const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  TimeLock__ZeroAmount: '예치 금액은 0보다 커야 합니다.',
  TimeLock__InvalidUnlockTime: '잠금 해제 시간이 올바르지 않습니다.',
  TimeLock__CannotShortenDuration: '잠금 기간을 단축할 수 없습니다.',
  TimeLock__Locked: '아직 잠금 해제 시간이 되지 않았습니다.',
  TimeLock__NoBalance: '예치된 잔액이 없습니다.',
  TimeLock__NoReward: '수령할 이자가 없습니다.',
  TimeLock__InsufficientReserve: '컨트랙트 예비금이 부족합니다.',
  TimeLock__TransferFailed: '전송에 실패했습니다.',
}

export function savePendingTx(address: Address, record: TxRecord) {
  storage.set(PENDING_TX_KEY(address), JSON.stringify(record))
}

export function loadPendingTx(address: Address): TxRecord | null {
  const raw = storage.getString(PENDING_TX_KEY(address))
  if (!raw) return null
  try {
    return JSON.parse(raw) as TxRecord
  } catch {
    return null
  }
}

export function clearPendingTx(address: Address) {
  storage.remove(PENDING_TX_KEY(address))
}

export function mapContractError(error: unknown): string {
  if (error instanceof ContractFunctionExecutionError) {
    const cause = error.cause
    if (cause instanceof ContractFunctionRevertedError) {
      const errorName = cause.data?.errorName
      if (errorName && errorName in CONTRACT_ERROR_MESSAGES) {
        return CONTRACT_ERROR_MESSAGES[errorName]
      }
    }
  }
  if (error instanceof Error) {
    if (error.message === 'biometric_unavailable') return '생체 인증을 사용할 수 없습니다.'
    if (error.message === 'key_not_found') return '지갑 키를 찾을 수 없습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1 || !isRetryableError(error)) throw error
      await new Promise<void>((r) => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('max_retries_exceeded')
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes('429') ||
    msg.includes('timeout') ||
    msg.includes('etimedout') ||
    msg.includes('nonce too low') ||
    msg.includes('replacement fee too low')
  )
}

export function scheduleRefetch(queryClient: QueryClient, address: Address) {
  const key = { queryKey: ['lockInfo', address] }
  queryClient.invalidateQueries(key)
  setTimeout(() => queryClient.invalidateQueries(key), 5_000)
  setTimeout(() => queryClient.invalidateQueries(key), 10_000)
}

export const TX_RECOVERY_THRESHOLD_MS = 2 * 60 * 60 * 1000

export type TxState = 'idle' | 'biometric' | 'broadcasting' | 'pending' | 'success' | 'error'

export type PendingTxHash = Hash
