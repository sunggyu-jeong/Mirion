import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <Story />
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
