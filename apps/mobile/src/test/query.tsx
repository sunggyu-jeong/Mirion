import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderHookOptions } from '@testing-library/react-native';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function createQueryWrapper(queryClient = createTestQueryClient()) {
  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return QueryWrapper;
}

export function renderQueryHook<Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
) {
  return renderHook(hook, {
    ...options,
    wrapper: createQueryWrapper(),
  });
}
