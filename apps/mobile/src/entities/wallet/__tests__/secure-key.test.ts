jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn().mockReturnValue({
      hasPrivateKey: jest.fn(),
      deletePrivateKey: jest.fn(),
      generateAndStorePrivateKey: jest.fn(),
      retrievePrivateKey: jest.fn(),
    }),
  },
}))

import { NitroModules } from 'react-native-nitro-modules'
import { secureKey } from '../api/secure-key'

const getManager = () =>
  (NitroModules.createHybridObject as jest.Mock).mock.results[0].value as {
    hasPrivateKey: jest.Mock
    deletePrivateKey: jest.Mock
    generateAndStorePrivateKey: jest.Mock
    retrievePrivateKey: jest.Mock
  }

describe('secureKey', () => {
  beforeEach(() => {
    const m = getManager()
    m.hasPrivateKey.mockReset()
    m.deletePrivateKey.mockReset()
    m.generateAndStorePrivateKey.mockReset()
    m.retrievePrivateKey.mockReset()
  })

  it('initializes by calling createHybridObject with SecureKeyManager', () => {
    expect(NitroModules.createHybridObject).toHaveBeenCalledWith('SecureKeyManager')
  })

  describe('has', () => {
    it('delegates to manager.hasPrivateKey', () => {
      getManager().hasPrivateKey.mockReturnValue(true)
      const result = secureKey.has('wallet-1')
      expect(getManager().hasPrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('returns false when key does not exist', () => {
      getManager().hasPrivateKey.mockReturnValue(false)
      expect(secureKey.has('wallet-1')).toBe(false)
    })
  })

  describe('delete', () => {
    it('delegates to manager.deletePrivateKey', () => {
      getManager().deletePrivateKey.mockReturnValue(true)
      const result = secureKey.delete('wallet-1')
      expect(getManager().deletePrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('returns false when delete fails', () => {
      getManager().deletePrivateKey.mockReturnValue(false)
      expect(secureKey.delete('wallet-1')).toBe(false)
    })
  })

  describe('generate', () => {
    it('delegates to manager.generateAndStorePrivateKey and returns promise', async () => {
      getManager().generateAndStorePrivateKey.mockResolvedValue(true)
      const result = await secureKey.generate('wallet-1')
      expect(getManager().generateAndStorePrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('returns false when generation fails', async () => {
      getManager().generateAndStorePrivateKey.mockResolvedValue(false)
      expect(await secureKey.generate('wallet-1')).toBe(false)
    })

    it('propagates rejection', async () => {
      getManager().generateAndStorePrivateKey.mockRejectedValue(new Error('keychain error'))
      await expect(secureKey.generate('wallet-1')).rejects.toThrow('keychain error')
    })
  })

  describe('retrieve', () => {
    it('returns hex string when key exists', async () => {
      const hex = 'a'.repeat(64)
      getManager().retrievePrivateKey.mockResolvedValue(hex)
      const result = await secureKey.retrieve('wallet-1')
      expect(getManager().retrievePrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(hex)
    })

    it('returns null when key does not exist', async () => {
      getManager().retrievePrivateKey.mockResolvedValue(null)
      expect(await secureKey.retrieve('wallet-1')).toBeNull()
    })

    it('propagates rejection', async () => {
      getManager().retrievePrivateKey.mockRejectedValue(new Error('read error'))
      await expect(secureKey.retrieve('wallet-1')).rejects.toThrow('read error')
    })
  })
})
