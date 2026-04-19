import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { WhaleDetailScreen } from './WhaleDetailScreen';

const Stack = createNativeStackNavigator();

function WhaleDetailStory() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="WhaleDetail"
        component={WhaleDetailScreen}
        initialParams={{ whaleId: 'vitalik' }}
      />
    </Stack.Navigator>
  );
}

const meta: Meta = {
  title: 'Pages/WhaleDetail',
  component: WhaleDetailStory,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
