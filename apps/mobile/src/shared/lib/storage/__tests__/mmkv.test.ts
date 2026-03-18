jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({ getString: jest.fn(), set: jest.fn(), remove: jest.fn() })),
}))

import { createMMKV } from 'react-native-mmkv'
import { storage } from '../mmkv'

describe('storage', () => {
  it('creates MMKV instance with lockfi-storage id', () => {
    expect(createMMKV).toHaveBeenCalledWith({ id: 'lockfi-storage' })
  })

  it('exposes the MMKV instance', () => {
    expect(storage).toBe((createMMKV as jest.Mock).mock.results[0].value)
  })
})
