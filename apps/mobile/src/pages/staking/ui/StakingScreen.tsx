import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { formatEther, parseEther } from 'viem'
import type { Address } from 'viem'

import { useWalletStore } from '@entities/wallet'
import { useLockStore } from '@entities/lock'
import {
  useDeposit,
  useWithdraw,
  useClaimInterest,
  useLockInfo,
  usePendingTx,
} from '@features/staking'

const TX_STATE_LABELS: Record<string, string> = {
  biometric: '생체 인증 중...',
  broadcasting: '트랜잭션 전송 중...',
  pending: '블록체인 처리 중...',
  success: '완료되었습니다.',
  error: '오류가 발생했습니다.',
}

export function StakingScreen() {
  const { address } = useWalletStore()
  const { balance, unlockTime, pendingReward } = useLockStore()

  const [amountInput, setAmountInput] = useState('')
  const [daysInput, setDaysInput] = useState('')

  const { deposit, txState: depositState, errorMessage: depositError, reset: resetDeposit } = useDeposit()
  const { withdraw, txState: withdrawState, errorMessage: withdrawError, reset: resetWithdraw } = useWithdraw()
  const { claimInterest, txState: claimState, errorMessage: claimError, reset: resetClaim } = useClaimInterest()

  const keyId = address ?? ''

  useLockInfo(address as Address | null)
  const { pendingTx, isRecovering } = usePendingTx(address as Address | null)

  const now = Math.floor(Date.now() / 1000)
  const isUnlocked = unlockTime > 0n && BigInt(now) >= unlockTime
  const hasBalance = balance > 0n
  const hasPendingReward = pendingReward > 0n
  const isBusy =
    depositState !== 'idle' ||
    withdrawState !== 'idle' ||
    claimState !== 'idle' ||
    isRecovering

  const handleDeposit = () => {
    const amount = parseFloat(amountInput)
    const days = parseInt(daysInput, 10)
    if (!amount || amount <= 0 || !days || days <= 0) {
      Alert.alert('입력 오류', '올바른 금액과 잠금 기간을 입력하세요.')
      return
    }
    const amountWei = parseEther(amountInput)
    const unlockTimestamp = BigInt(now + days * 86400)
    deposit(amountWei, unlockTimestamp, keyId)
  }

  const formatUnlockTime = (timestamp: bigint) => {
    if (timestamp === 0n) return '-'
    return new Date(Number(timestamp) * 1000).toLocaleString('ko-KR')
  }

  const activeTxLabel =
    depositState !== 'idle'
      ? TX_STATE_LABELS[depositState]
      : withdrawState !== 'idle'
        ? TX_STATE_LABELS[withdrawState]
        : claimState !== 'idle'
          ? TX_STATE_LABELS[claimState]
          : null

  return (
    <ScrollView className="flex-1 bg-gray-950">
      <View className="px-5 pt-12 pb-8">
        <Text className="text-2xl font-bold text-white mb-1">LockFi</Text>
        <Text className="text-xs text-gray-500 mb-6" numberOfLines={1}>
          {address ?? '지갑 미연결'}
        </Text>

        <View className="bg-gray-800 rounded-2xl p-5 mb-4">
          <Text className="text-sm text-gray-400 mb-3">내 잠금 현황</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">예치 잔액</Text>
            <Text className="text-white font-semibold">{formatEther(balance)} ETH</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">잠금 해제</Text>
            <Text className="text-white">{formatUnlockTime(unlockTime)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">누적 이자</Text>
            <Text className="text-green-400 font-semibold">{formatEther(pendingReward)} ETH</Text>
          </View>
        </View>

        {isRecovering && pendingTx && (
          <View className="bg-yellow-900/40 border border-yellow-700 rounded-xl p-4 mb-4 flex-row items-center gap-3">
            <ActivityIndicator color="#facc15" size="small" />
            <View className="flex-1">
              <Text className="text-yellow-300 text-sm font-medium">트랜잭션 복구 중</Text>
              <Text className="text-yellow-500 text-xs mt-0.5" numberOfLines={1}>
                {pendingTx.txHash}
              </Text>
            </View>
          </View>
        )}

        <View className="bg-gray-800 rounded-2xl p-5 mb-4">
          <Text className="text-sm text-gray-400 mb-4">ETH 예치</Text>
          <TextInput
            className="bg-gray-700 text-white rounded-xl px-4 py-3 mb-3"
            placeholder="예치할 ETH 금액"
            placeholderTextColor="#6b7280"
            keyboardType="decimal-pad"
            value={amountInput}
            onChangeText={setAmountInput}
            editable={!isBusy}
          />
          <TextInput
            className="bg-gray-700 text-white rounded-xl px-4 py-3 mb-4"
            placeholder="잠금 기간 (일)"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            value={daysInput}
            onChangeText={setDaysInput}
            editable={!isBusy}
          />
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${isBusy ? 'bg-blue-900' : 'bg-blue-600'}`}
            onPress={handleDeposit}
            disabled={isBusy}
          >
            {depositState === 'biometric' || depositState === 'broadcasting' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">예치하기</Text>
            )}
          </TouchableOpacity>
          {depositError && (
            <Text className="text-red-400 text-sm mt-2 text-center">{depositError}</Text>
          )}
          {depositState === 'success' && (
            <Text className="text-green-400 text-sm mt-2 text-center">예치 완료!</Text>
          )}
        </View>

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 items-center ${!hasBalance || !isUnlocked || isBusy ? 'bg-gray-700' : 'bg-purple-600'}`}
            onPress={() => withdraw(keyId)}
            disabled={!hasBalance || !isUnlocked || isBusy}
          >
            {withdrawState === 'biometric' || withdrawState === 'broadcasting' ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="items-center">
                <Text className="text-white font-semibold">출금하기</Text>
                {!isUnlocked && hasBalance && (
                  <Text className="text-gray-400 text-xs mt-0.5">잠금 중</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 items-center ${!hasPendingReward || isBusy ? 'bg-gray-700' : 'bg-green-700'}`}
            onPress={() => claimInterest(keyId)}
            disabled={!hasPendingReward || isBusy}
          >
            {claimState === 'biometric' || claimState === 'broadcasting' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">이자 수령</Text>
            )}
          </TouchableOpacity>
        </View>

        {withdrawError && (
          <Text className="text-red-400 text-sm text-center mb-2">{withdrawError}</Text>
        )}
        {claimError && (
          <Text className="text-red-400 text-sm text-center mb-2">{claimError}</Text>
        )}

        {activeTxLabel && (
          <View className="flex-row items-center justify-center gap-2 py-3">
            {depositState === 'pending' || withdrawState === 'pending' || claimState === 'pending' ? (
              <ActivityIndicator color="#60a5fa" size="small" />
            ) : null}
            <Text className="text-blue-400 text-sm">{activeTxLabel}</Text>
          </View>
        )}

        {(depositState === 'error' || withdrawState === 'error' || claimState === 'error') && (
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => {
              resetDeposit()
              resetWithdraw()
              resetClaim()
            }}
          >
            <Text className="text-gray-500 text-sm">닫기</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}
