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
  it('renders without crashing', () => {
    expect(() => render(<AppProviders />)).not.toThrow()
  })

  it('renders Navigation inside SafeAreaProvider', () => {
    const { toJSON } = render(<AppProviders />)
    expect(toJSON()).not.toBeNull()
  })
})
