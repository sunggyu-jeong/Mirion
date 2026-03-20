jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn().mockReturnValue({
      hasPrivateKey: jest.fn(),
      deletePrivateKey: jest.fn(),
      generateAndStorePrivateKey: jest.fn(),
      retrievePrivateKey: jest.fn(),
      storeData: jest.fn(),
      retrieveData: jest.fn(),
    }),
  },
}))

import { NitroModules } from 'react-native-nitro-modules'
import { secureKey } from '../api/secure-key'

const getManager = () =>
  jest.mocked(NitroModules.createHybridObject).mock.results[0].value as {
    hasPrivateKey: jest.Mock
    deletePrivateKey: jest.Mock
    generateAndStorePrivateKey: jest.Mock
    retrievePrivateKey: jest.Mock
    storeData: jest.Mock
    retrieveData: jest.Mock
  }

beforeAll(() => {
  secureKey.has('__init__')
  getManager().hasPrivateKey.mockReturnValue(false)
})

describe('secureKey', () => {
  beforeEach(() => {
    const m = getManager()
    m.hasPrivateKey.mockReset()
    m.deletePrivateKey.mockReset()
    m.generateAndStorePrivateKey.mockReset()
    m.retrievePrivateKey.mockReset()
    m.storeData.mockReset()
    m.retrieveData.mockReset()
  })

  it('첫 메서드 호출 시 SecureKeyManager로 createHybridObject를 초기화한다', () => {
    expect(NitroModules.createHybridObject).toHaveBeenCalledWith('SecureKeyManager')
  })

  it('createHybridObject는 한 번만 호출된다', () => {
    secureKey.has('test')
    secureKey.has('test')
    expect(NitroModules.createHybridObject).toHaveBeenCalledTimes(1)
  })

  describe('has', () => {
    it('manager.hasPrivateKey에 위임한다', () => {
      getManager().hasPrivateKey.mockReturnValue(true)
      const result = secureKey.has('wallet-1')
      expect(getManager().hasPrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('키가 존재하지 않으면 false를 반환한다', () => {
      getManager().hasPrivateKey.mockReturnValue(false)
      expect(secureKey.has('wallet-1')).toBe(false)
    })
  })

  describe('delete', () => {
    it('manager.deletePrivateKey에 위임한다', () => {
      getManager().deletePrivateKey.mockReturnValue(true)
      const result = secureKey.delete('wallet-1')
      expect(getManager().deletePrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('삭제 실패 시 false를 반환한다', () => {
      getManager().deletePrivateKey.mockReturnValue(false)
      expect(secureKey.delete('wallet-1')).toBe(false)
    })
  })

  describe('generate', () => {
    it('manager.generateAndStorePrivateKey에 위임하고 Promise를 반환한다', async () => {
      getManager().generateAndStorePrivateKey.mockResolvedValue(true)
      const result = await secureKey.generate('wallet-1')
      expect(getManager().generateAndStorePrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(true)
    })

    it('생성 실패 시 false를 반환한다', async () => {
      getManager().generateAndStorePrivateKey.mockResolvedValue(false)
      expect(await secureKey.generate('wallet-1')).toBe(false)
    })

    it('에러를 전파한다', async () => {
      getManager().generateAndStorePrivateKey.mockRejectedValue(new Error('keychain error'))
      await expect(secureKey.generate('wallet-1')).rejects.toThrow('keychain error')
    })
  })

  describe('store', () => {
    it('manager.storeData에 위임하고 Promise를 반환한다', async () => {
      getManager().storeData.mockResolvedValue(true)
      const result = await secureKey.store('session-1', '0xABC123')
      expect(getManager().storeData).toHaveBeenCalledWith('session-1', '0xABC123')
      expect(result).toBe(true)
    })

    it('저장 실패 시 false를 반환한다', async () => {
      getManager().storeData.mockResolvedValue(false)
      expect(await secureKey.store('session-1', '0xABC123')).toBe(false)
    })

    it('에러를 전파한다', async () => {
      getManager().storeData.mockRejectedValue(new Error('keychain error'))
      await expect(secureKey.store('session-1', '0xABC123')).rejects.toThrow('keychain error')
    })
  })

  describe('retrieveData', () => {
    it('저장된 문자열 원본을 반환한다', async () => {
      getManager().retrieveData.mockResolvedValue('0xABC123')
      const result = await secureKey.retrieveData('session-1')
      expect(getManager().retrieveData).toHaveBeenCalledWith('session-1')
      expect(result).toBe('0xABC123')
    })

    it('데이터가 없으면 null을 반환한다', async () => {
      getManager().retrieveData.mockResolvedValue(null)
      expect(await secureKey.retrieveData('session-1')).toBeNull()
    })

    it('에러를 전파한다', async () => {
      getManager().retrieveData.mockRejectedValue(new Error('read error'))
      await expect(secureKey.retrieveData('session-1')).rejects.toThrow('read error')
    })
  })

  describe('retrieve', () => {
    it('키가 존재하면 hex 문자열을 반환한다', async () => {
      const hex = 'a'.repeat(64)
      getManager().retrievePrivateKey.mockResolvedValue(hex)
      const result = await secureKey.retrieve('wallet-1')
      expect(getManager().retrievePrivateKey).toHaveBeenCalledWith('wallet-1')
      expect(result).toBe(hex)
    })

    it('키가 존재하지 않으면 null을 반환한다', async () => {
      getManager().retrievePrivateKey.mockResolvedValue(null)
      expect(await secureKey.retrieve('wallet-1')).toBeNull()
    })

    it('에러를 전파한다', async () => {
      getManager().retrievePrivateKey.mockRejectedValue(new Error('read error'))
      await expect(secureKey.retrieve('wallet-1')).rejects.toThrow('read error')
    })
  })
})
