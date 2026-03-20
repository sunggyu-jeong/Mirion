jest.mock('@shared/api/contracts', () => ({
  timeLockContract: { address: '0xContract', abi: [] },
}))

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: { readContract: jest.fn() },
}))

jest.mock('@entities/lock', () => ({
  useLockStore: jest.fn(),
}))

jest.mock('../model/staking-utils', () => ({
  withRetry: jest.fn((fn: () => unknown) => fn()),
}))

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return { ...actual, useQuery: jest.fn() }
})

import type { Address } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@shared/lib/web3/client'
import { useLockStore } from '@entities/lock'
import { useLockInfo } from '../model/use-lock-info'
import { renderHook } from '@testing-library/react-native'

const TEST_ADDRESS = '0xUser0000000000000000000000000000000001' as Address

const mockSetLockInfo = jest.fn()
const mockSetPendingReward = jest.fn()

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLockStore).mockReturnValue({
    setLockInfo: mockSetLockInfo,
    setPendingReward: mockSetPendingReward,
  } as never)
})

describe('useLockInfo', () => {
  describe('쿼리 설정', () => {
    it('address가 null이면 enabled를 false로 설정한다', () => {
      let capturedOptions: { enabled?: boolean } = {}
      jest.mocked(useQuery).mockImplementation(((opts: typeof capturedOptions) => {
        capturedOptions = opts
        return { data: null, isSuccess: false }
      }) as never)

      renderHook(() => useLockInfo(null))

      expect(capturedOptions.enabled).toBe(false)
    })

    it('address가 있으면 enabled를 true로 설정한다', () => {
      let capturedOptions: { enabled?: boolean } = {}
      jest.mocked(useQuery).mockImplementation(((opts: typeof capturedOptions) => {
        capturedOptions = opts
        return { data: null, isSuccess: false }
      }) as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(capturedOptions.enabled).toBe(true)
    })

    it('queryKey에 address가 포함된다', () => {
      let capturedOptions: { queryKey?: unknown[] } = {}
      jest.mocked(useQuery).mockImplementation(((opts: typeof capturedOptions) => {
        capturedOptions = opts
        return { data: null, isSuccess: false }
      }) as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(capturedOptions.queryKey).toEqual(['lockInfo', TEST_ADDRESS])
    })

    it('staleTime이 10_000ms이다', () => {
      let capturedOptions: { staleTime?: number } = {}
      jest.mocked(useQuery).mockImplementation(((opts: typeof capturedOptions) => {
        capturedOptions = opts
        return { data: null, isSuccess: false }
      }) as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(capturedOptions.staleTime).toBe(10_000)
    })

    it('refetchInterval이 15_000ms이다', () => {
      let capturedOptions: { refetchInterval?: number } = {}
      jest.mocked(useQuery).mockImplementation(((opts: typeof capturedOptions) => {
        capturedOptions = opts
        return { data: null, isSuccess: false }
      }) as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(capturedOptions.refetchInterval).toBe(15_000)
    })
  })

  describe('queryFn', () => {
    it('getLockInfo와 pendingReward를 순서대로 조회한다', async () => {
      let capturedQueryFn: (() => Promise<unknown>) | undefined
      jest.mocked(useQuery).mockImplementation(((opts: { queryFn: () => Promise<unknown> }) => {
        capturedQueryFn = opts.queryFn
        return { data: null, isSuccess: false }
      }) as never)
      jest.mocked(publicClient.readContract)
        .mockResolvedValueOnce([1000n, 9999999999n])
        .mockResolvedValueOnce(50n)

      renderHook(() => useLockInfo(TEST_ADDRESS))
      await capturedQueryFn!()

      expect(publicClient.readContract).toHaveBeenCalledTimes(2)
    })

    it('queryFn이 balance, unlockTime, pendingReward를 반환한다', async () => {
      let capturedQueryFn: (() => Promise<unknown>) | undefined
      jest.mocked(useQuery).mockImplementation(((opts: { queryFn: () => Promise<unknown> }) => {
        capturedQueryFn = opts.queryFn
        return { data: null, isSuccess: false }
      }) as never)
      jest.mocked(publicClient.readContract)
        .mockResolvedValueOnce([1000n, 9999999999n])
        .mockResolvedValueOnce(50n)

      renderHook(() => useLockInfo(TEST_ADDRESS))
      const result = await capturedQueryFn!()

      expect(result).toEqual({ balance: 1000n, unlockTime: 9999999999n, pendingReward: 50n })
    })
  })

  describe('스토어 동기화', () => {
    it('데이터 수신 시 setLockInfo를 호출한다', () => {
      jest.mocked(useQuery).mockReturnValue({
        data: { balance: 1000n, unlockTime: 9999999999n, pendingReward: 50n },
        isSuccess: true,
      } as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(mockSetLockInfo).toHaveBeenCalledWith(1000n, 9999999999n)
    })

    it('데이터 수신 시 setPendingReward를 호출한다', () => {
      jest.mocked(useQuery).mockReturnValue({
        data: { balance: 1000n, unlockTime: 9999999999n, pendingReward: 50n },
        isSuccess: true,
      } as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(mockSetPendingReward).toHaveBeenCalledWith(50n)
    })

    it('data가 null이면 스토어를 업데이트하지 않는다', () => {
      jest.mocked(useQuery).mockReturnValue({ data: null, isSuccess: false } as never)

      renderHook(() => useLockInfo(TEST_ADDRESS))

      expect(mockSetLockInfo).not.toHaveBeenCalled()
      expect(mockSetPendingReward).not.toHaveBeenCalled()
    })
  })
})
