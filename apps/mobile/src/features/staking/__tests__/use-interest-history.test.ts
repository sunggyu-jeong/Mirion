import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useInterestHistory } from '../model/use-interest-history';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
};

describe('useInterestHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty snapshots when no address provided', () => {
    const { result } = renderHook(() => useInterestHistory(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch interest history for given address', async () => {
    const mockSnapshots = [
      {
        date: '2026-03-20',
        daily_interest: '1000000000000000',
        cumulative_interest: '5000000000000000',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ snapshots: mockSnapshots }),
    });

    const { result } = renderHook(() => useInterestHistory('0xUserAddress'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.snapshots).toEqual(mockSnapshots);
  });

  it('should throw when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(() => useInterestHistory('0xUserAddress'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe('Failed to fetch interest history');
  });

  it('should have isError true when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useInterestHistory('0xUserAddress'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
