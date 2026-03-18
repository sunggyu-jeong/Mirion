jest.mock('../mmkv', () => ({
  storage: { getString: jest.fn(), set: jest.fn(), remove: jest.fn() },
}))

import { storage } from '../mmkv'
import { zustandStorage } from '../zustand-storage'

const mockStorage = storage as jest.Mocked<typeof storage>

describe('zustandStorage', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getItem', () => {
    it('returns string value when key exists', () => {
      mockStorage.getString.mockReturnValue('stored-value')
      expect(zustandStorage.getItem('key')).toBe('stored-value')
      expect(mockStorage.getString).toHaveBeenCalledWith('key')
    })

    it('returns null when key does not exist', () => {
      mockStorage.getString.mockReturnValue(undefined)
      expect(zustandStorage.getItem('key')).toBeNull()
    })
  })

  describe('setItem', () => {
    it('delegates to storage.set', () => {
      zustandStorage.setItem('key', 'value')
      expect(mockStorage.set).toHaveBeenCalledWith('key', 'value')
    })
  })

  describe('removeItem', () => {
    it('delegates to storage.remove', () => {
      zustandStorage.removeItem('key')
      expect(mockStorage.remove).toHaveBeenCalledWith('key')
    })
  })
})
