import { createStaticNavigation, StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { StakingScreen } from '@pages/staking'

const RootStack = createNativeStackNavigator({
  screens: {
    Staking: {
      screen: StakingScreen,
      options: { headerShown: false },
    },
  },
})

export type RootStackParamList = StaticParamList<typeof RootStack>

export const Navigation = createStaticNavigation(RootStack)
