import { useQuery } from '@tanstack/react-query';
import { parseEther } from 'viem';

export function useEthBalance() {
  return useQuery({
    queryKey: ['eth-balance'],
    queryFn: async () => {
      // Dummy data for simulation
      return {
        balance: parseEther('124.5'),
        isLoading: false,
      };
    },
  });
}
