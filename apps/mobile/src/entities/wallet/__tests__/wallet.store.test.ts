jest.mock('../api/secure-key', () => ({
  secureKey: {
    has: jest.fn(),
    delete: jest.fn(),
    generate: jest.fn(),
    retrieve: jest.fn(),
  },
}))

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: { createHybridObject: jest.fn().mockReturnValue({}) },
}))

import { secureKey } from '../api/secure-key'
import { useWalletStore } from '../model/wallet.store'

const mockHas = secureKey.has as jest.Mock
const mockDelete = secureKey.delete as jest.Mock
const mockGenerate = secureKey.generate as jest.Mock

describe('useWalletStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useWalletStore.setState({ address: null, isInitialized: false })
  })

  describe('초기 상태', () => {
    it('address가 null이다', () => {
      expect(useWalletStore.getState().address).toBeNull()
    })

    it('초기화되지 않은 상태이다', () => {
      expect(useWalletStore.getState().isInitialized).toBe(false)
    })
  })

  describe('generateKey', () => {
    it('성공 시 isInitialized를 true로 설정한다', async () => {
      mockGenerate.mockResolvedValue(true)
      const result = await useWalletStore.getState().generateKey('wallet-1')
      expect(result).toBe(true)
      expect(useWalletStore.getState().isInitialized).toBe(true)
    })

    it('실패 시 isInitialized를 변경하지 않는다', async () => {
      mockGenerate.mockResolvedValue(false)
      await useWalletStore.getState().generateKey('wallet-1')
      expect(useWalletStore.getState().isInitialized).toBe(false)
    })

    it('keyId로 secureKey.generate를 호출한다', async () => {
      mockGenerate.mockResolvedValue(true)
      await useWalletStore.getState().generateKey('wallet-abc')
      expect(mockGenerate).toHaveBeenCalledWith('wallet-abc')
    })

    it('secureKey.generate의 에러를 전파한다', async () => {
      mockGenerate.mockRejectedValue(new Error('native error'))
      await expect(useWalletStore.getState().generateKey('wallet-1')).rejects.toThrow(
        'native error'
      )
    })
  })

  describe('hasKey', () => {
    it('secureKey.has에 위임한다', () => {
      mockHas.mockReturnValue(true)
      const result = useWalletStore.getState().hasKey('wallet-1')
      expect(mockHas).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('키가 존재하지 않으면 false를 반환한다', () => {
      mockHas.mockReturnValue(false)
      expect(useWalletStore.getState().hasKey('wallet-1')).toBe(false)
    })
  })

  describe('deleteKey', () => {
    it('address와 isInitialized를 초기화한다', () => {
      mockDelete.mockReturnValue(true)
      useWalletStore.setState({ address: '0xABC', isInitialized: true })
      useWalletStore.getState().deleteKey('wallet-1')
      expect(useWalletStore.getState().address).toBeNull()
      expect(useWalletStore.getState().isInitialized).toBe(false)
    })

    it('keyId로 secureKey.delete를 호출한다', () => {
      mockDelete.mockReturnValue(true)
      useWalletStore.getState().deleteKey('wallet-1')
      expect(mockDelete).toHaveBeenCalledWith('wallet-1')
    })

    it('삭제 결과를 반환한다', () => {
      mockDelete.mockReturnValue(false)
      expect(useWalletStore.getState().deleteKey('wallet-1')).toBe(false)
    })
  })
})
