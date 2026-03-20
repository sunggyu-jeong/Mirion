jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({ getString: jest.fn(), set: jest.fn(), remove: jest.fn() })),
}))

import { createMMKV } from 'react-native-mmkv'
import { storage } from '../mmkv'

describe('storage', () => {
  it('lockfi-storage id로 MMKV 인스턴스를 생성한다', () => {
    expect(createMMKV).toHaveBeenCalledWith({ id: 'lockfi-storage' })
  })

  it('생성된 MMKV 인스턴스를 노출한다', () => {
    expect(storage).toBe(jest.mocked(createMMKV).mock.results[0].value)
  })
})
