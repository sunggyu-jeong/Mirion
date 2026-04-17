import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  MOCK_CEX_TRADES,
  MOCK_ETH_MARKET_DATA,
  MOCK_WHALE_TXS,
  MOCK_WHALES,
  mockPriceChart,
} from './mock-data';

function buildQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  client.setQueryData(['whale-feed'], MOCK_WHALES);
  client.setQueryData(['radar'], MOCK_WHALE_TXS);
  client.setQueryData(['cex-trades'], MOCK_CEX_TRADES);
  client.setQueryData(['eth-market-data'], MOCK_ETH_MARKET_DATA);
  client.setQueryData(['eth-price'], MOCK_ETH_MARKET_DATA.priceUsd);
  client.setQueryData(['eth-price-chart'], mockPriceChart(48));
  client.setQueryData(['eth-market-chart', '1D'], mockPriceChart(24));
  client.setQueryData(['eth-market-chart', '1W'], mockPriceChart(48));
  client.setQueryData(['eth-market-chart', '1M'], mockPriceChart(60));

  return client;
}

const storyQueryClient = buildQueryClient();

export function StoryProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={storyQueryClient}>
      <SafeAreaProvider>
        <NavigationContainer>{children}</NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
