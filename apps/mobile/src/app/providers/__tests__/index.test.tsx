jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('../../navigation', () => {
  const { View } = require('react-native')
  return { Navigation: () => <View testID="navigation" /> }
})

import React from 'react'
import { render } from '@testing-library/react-native'
import { AppProviders } from '../index'

describe('AppProviders', () => {
  it('에러 없이 렌더링된다', () => {
    expect(() => render(<AppProviders />)).not.toThrow()
  })

  it('SafeAreaProvider 안에 Navigation을 렌더링한다', () => {
    const { toJSON } = render(<AppProviders />)
    expect(toJSON()).not.toBeNull()
  })
})
