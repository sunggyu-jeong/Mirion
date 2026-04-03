import { useQuery } from '@tanstack/react-query';

export function useEthPrice() {
  return useQuery({
    queryKey: ['eth-price'],
    queryFn: async () => {
      // Dummy data for simulation
      return {
        price: '$2,451.20',
        change: '+1.5% (24h)',
        isPositive: true,
      };
    },
  });
}
