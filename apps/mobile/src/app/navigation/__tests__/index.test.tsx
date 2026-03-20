jest.mock('@react-navigation/native', () => ({
  createStaticNavigation: jest.fn(() => () => null),
  StaticParamList: {},
}))

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({ screens: {} })),
}))

jest.mock('@pages/staking', () => ({
  StakingScreen: () => null,
}))

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Navigation } from '../index'

describe('Navigation', () => {
  it('네이티브 스택 네비게이터를 생성한다', () => {
    expect(createNativeStackNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screens: expect.objectContaining({ Staking: expect.any(Object) }),
      })
    )
  })

  it('스택으로부터 정적 네비게이션을 생성한다', () => {
    expect(createStaticNavigation).toHaveBeenCalled()
  })

  it('Navigation 컴포넌트를 export한다', () => {
    expect(Navigation).toBeDefined()
  })
})
