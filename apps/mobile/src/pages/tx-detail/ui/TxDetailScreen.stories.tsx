import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { TxDetailScreen } from './TxDetailScreen';

const Stack = createNativeStackNavigator();
const TxDetailStackScreen = TxDetailScreen as React.ComponentType<any>;

const MOCK_TX_PARAMS = {
  txHash: '0xabc123def456',
  type: 'receive' as const,
  amountNative: 2500,
  amountUsd: 6_500_000,
  fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  toAddress: '0xabc123def456abc123def456abc123def456abc1',
  timestampMs: Date.now() - 300_000,
  blockNumber: '19000001',
  isLarge: true,
  asset: 'ETH',
  chain: 'ETH',
};

function TxDetailStory() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="TxDetail"
        component={TxDetailStackScreen}
        initialParams={MOCK_TX_PARAMS}
      />
    </Stack.Navigator>
  );
}

const meta: Meta = {
  title: 'Pages/TxDetail',
  component: TxDetailStory,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Send: Story = {
  render: () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="TxDetail"
        component={TxDetailStackScreen}
        initialParams={{
          ...MOCK_TX_PARAMS,
          type: 'send',
          amountUsd: 980_000,
          asset: 'BTC',
          chain: 'BTC',
        }}
      />
    </Stack.Navigator>
  ),
};
