jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('viem', () => {
  class UserRejectedRequestError extends Error {
    constructor() {
      super('User rejected the request.')
      this.name = 'UserRejectedRequestError'
    }
  }
  return { UserRejectedRequestError }
})

jest.mock('@entities/wallet', () => ({
  secureKey: { retrieve: jest.fn() },
  useWalletStore: jest.fn(),
}))

jest.mock('@entities/lock', () => ({
  useLockStore: jest.fn(),
}))

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    estimateFeesPerGas: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
  },
  createWalletClientFromKey: jest.fn(),
}))

jest.mock('@shared/api/contracts', () => ({
  timeLockContract: { address: '0xContract', abi: [] },
}))

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return { ...actual, useQueryClient: jest.fn() }
})

jest.mock('../model/staking-utils', () => ({
  savePendingTx: jest.fn(),
  clearPendingTx: jest.fn(),
  mapContractError: jest.fn().mockReturnValue('아직 잠금 해제 시간이 되지 않았습니다.'),
  scheduleRefetch: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react-native'
import ReactNativeBiometrics from 'react-native-biometrics'
import { UserRejectedRequestError } from 'viem'
import { useQueryClient } from '@tanstack/react-query'
import { secureKey, useWalletStore } from '@entities/wallet'
import { useLockStore } from '@entities/lock'
import { publicClient, createWalletClientFromKey } from '@shared/lib/web3/client'
import { savePendingTx, clearPendingTx } from '../model/staking-utils'
import { useWithdraw } from '../model/use-withdraw'

const TEST_ADDRESS = '0xUser0000000000000000000000000000000001'
const TEST_TX_HASH = '0xdeadbeef' as `0x${string}`
const TEST_KEY_ID = 'wallet-key-1'

const mockIsSensorAvailable = jest.fn()
const mockSimplePrompt = jest.fn()
const mockWriteContract = jest.fn()
const mockOptimisticWithdraw = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ReactNativeBiometrics).mockImplementation(() => ({
    isSensorAvailable: mockIsSensorAvailable,
    simplePrompt: mockSimplePrompt,
  }) as unknown as ReactNativeBiometrics)
  mockIsSensorAvailable.mockResolvedValue({ available: true })
  mockSimplePrompt.mockResolvedValue({ success: true })
  jest.mocked(secureKey.retrieve).mockResolvedValue('deadbeef1234')
  jest.mocked(createWalletClientFromKey).mockReturnValue({ writeContract: mockWriteContract } as never)
  mockWriteContract.mockResolvedValue(TEST_TX_HASH)
  jest.mocked(publicClient.estimateFeesPerGas).mockResolvedValue({} as never)
  jest.mocked(publicClient.waitForTransactionReceipt).mockResolvedValue({} as never)
  jest.mocked(useWalletStore).mockReturnValue({ address: TEST_ADDRESS } as never)
  jest.mocked(useLockStore).mockReturnValue({ optimisticWithdraw: mockOptimisticWithdraw } as never)
  jest.mocked(useQueryClient).mockReturnValue({ invalidateQueries: jest.fn() } as never)
})

describe('useWithdraw', () => {
  describe('초기 상태', () => {
    it('txState가 idle이다', () => {
      const { result } = renderHook(() => useWithdraw())
      expect(result.current.txState).toBe('idle')
    })
  })

  describe('address 미연결', () => {
    it('address가 null이면 아무 동작도 하지 않는다', async () => {
      jest.mocked(useWalletStore).mockReturnValue({ address: null } as never)
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(mockIsSensorAvailable).not.toHaveBeenCalled()
    })
  })

  describe('생체 인증 불가', () => {
    it('생체 인증 불가 시 state가 error가 된다', async () => {
      mockIsSensorAvailable.mockResolvedValue({ available: false })
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(result.current.txState).toBe('error')
    })
  })

  describe('개인키', () => {
    it('개인키가 null이면 state가 error가 된다', async () => {
      jest.mocked(secureKey.retrieve).mockResolvedValue(null)
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(result.current.txState).toBe('error')
    })
  })

  describe('가스비 적용', () => {
    it('maxFeePerGas에 110% 버퍼를 적용한다', async () => {
      jest.mocked(publicClient.estimateFeesPerGas).mockResolvedValue({
        maxFeePerGas: 100n,
        maxPriorityFeePerGas: 10n,
      } as never)
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({ maxFeePerGas: 110n, maxPriorityFeePerGas: 11n }),
      )
    })
  })

  describe('생체 인증 취소', () => {
    it('취소 시 state가 idle로 돌아온다', async () => {
      mockSimplePrompt.mockResolvedValue({ success: false })
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(result.current.txState).toBe('idle')
      expect(mockWriteContract).not.toHaveBeenCalled()
    })
  })

  describe('출금 성공', () => {
    it('withdraw 성공 후 state가 success가 된다', async () => {
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(result.current.txState).toBe('success')
    })

    it('writeContract에 withdraw functionName을 전달한다', async () => {
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'withdraw' }),
      )
    })

    it('optimisticWithdraw를 즉시 호출한다', async () => {
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(mockOptimisticWithdraw).toHaveBeenCalled()
    })

    it('txHash를 MMKV에 저장한다', async () => {
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(savePendingTx).toHaveBeenCalledWith(
        TEST_ADDRESS,
        expect.objectContaining({ txHash: TEST_TX_HASH, type: 'withdraw' }),
      )
    })

    it('receipt 확인 후 clearPendingTx를 호출한다', async () => {
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(clearPendingTx).toHaveBeenCalledWith(TEST_ADDRESS)
    })
  })

  describe('컨트랙트 에러', () => {
    it('TimeLock__Locked 에러 시 state가 error가 되고 메시지를 설정한다', async () => {
      mockWriteContract.mockRejectedValue(new Error('TimeLock__Locked'))
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(result.current.txState).toBe('error')
      expect(result.current.errorMessage).toBe('아직 잠금 해제 시간이 되지 않았습니다.')
    })
  })

  describe('UserRejectedRequestError', () => {
    it('서명 거부 시 state가 idle로 돌아온다', async () => {
      mockWriteContract.mockRejectedValue(new UserRejectedRequestError(new Error()))
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })

      expect(result.current.txState).toBe('idle')
      expect(result.current.errorMessage).toBeNull()
    })
  })

  describe('reset', () => {
    it('reset 호출 후 state와 errorMessage가 초기화된다', async () => {
      mockWriteContract.mockRejectedValue(new Error('fail'))
      const { result } = renderHook(() => useWithdraw())

      await act(async () => {
        await result.current.withdraw(TEST_KEY_ID)
      })
      act(() => result.current.reset())

      expect(result.current.txState).toBe('idle')
      expect(result.current.errorMessage).toBeNull()
    })
  })
})
