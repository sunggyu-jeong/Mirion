jest.mock('@react-navigation/native', () => ({
  createStaticNavigation: jest.fn(() => () => null),
  StaticParamList: {},
}))

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({ screens: {} })),
}))

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Navigation } from '../index'

describe('Navigation', () => {
  it('creates a native stack navigator', () => {
    expect(createNativeStackNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screens: expect.objectContaining({ Home: expect.any(Function) }),
      })
    )
  })

  it('creates static navigation from the stack', () => {
    expect(createStaticNavigation).toHaveBeenCalled()
  })

  it('exports Navigation component', () => {
    expect(Navigation).toBeDefined()
  })
})
