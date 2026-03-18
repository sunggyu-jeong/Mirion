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

  describe('initial state', () => {
    it('has null address', () => {
      expect(useWalletStore.getState().address).toBeNull()
    })

    it('is not initialized', () => {
      expect(useWalletStore.getState().isInitialized).toBe(false)
    })
  })

  describe('generateKey', () => {
    it('sets isInitialized to true on success', async () => {
      mockGenerate.mockResolvedValue(true)
      const result = await useWalletStore.getState().generateKey('wallet-1')
      expect(result).toBe(true)
      expect(useWalletStore.getState().isInitialized).toBe(true)
    })

    it('does not set isInitialized on failure', async () => {
      mockGenerate.mockResolvedValue(false)
      await useWalletStore.getState().generateKey('wallet-1')
      expect(useWalletStore.getState().isInitialized).toBe(false)
    })

    it('calls secureKey.generate with keyId', async () => {
      mockGenerate.mockResolvedValue(true)
      await useWalletStore.getState().generateKey('wallet-abc')
      expect(mockGenerate).toHaveBeenCalledWith('wallet-abc')
    })

    it('propagates errors from secureKey.generate', async () => {
      mockGenerate.mockRejectedValue(new Error('native error'))
      await expect(useWalletStore.getState().generateKey('wallet-1')).rejects.toThrow(
        'native error'
      )
    })
  })

  describe('hasKey', () => {
    it('delegates to secureKey.has', () => {
      mockHas.mockReturnValue(true)
      const result = useWalletStore.getState().hasKey('wallet-1')
      expect(mockHas).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('returns false when key does not exist', () => {
      mockHas.mockReturnValue(false)
      expect(useWalletStore.getState().hasKey('wallet-1')).toBe(false)
    })
  })

  describe('deleteKey', () => {
    it('resets address and isInitialized', () => {
      mockDelete.mockReturnValue(true)
      useWalletStore.setState({ address: '0xABC', isInitialized: true })
      useWalletStore.getState().deleteKey('wallet-1')
      expect(useWalletStore.getState().address).toBeNull()
      expect(useWalletStore.getState().isInitialized).toBe(false)
    })

    it('calls secureKey.delete with keyId', () => {
      mockDelete.mockReturnValue(true)
      useWalletStore.getState().deleteKey('wallet-1')
      expect(mockDelete).toHaveBeenCalledWith('wallet-1')
    })

    it('returns delete result', () => {
      mockDelete.mockReturnValue(false)
      expect(useWalletStore.getState().deleteKey('wallet-1')).toBe(false)
    })
  })
})
