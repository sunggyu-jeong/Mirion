import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export type InterestSnapshot = {
  date: string;
  daily_interest: string;
  cumulative_interest: string;
};

export type InterestHistoryResponse = {
  snapshots: InterestSnapshot[];
};

export function useInterestHistory(address: string | null) {
  return useQuery<InterestHistoryResponse>({
    queryKey: ['interestHistory', address],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/interest/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interest history');
      }
      return response.json();
    },
    enabled: !!address,
    staleTime: 60_000,
  });
}
