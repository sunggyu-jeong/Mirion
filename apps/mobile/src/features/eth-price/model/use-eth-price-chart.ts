import { useQuery } from '@tanstack/react-query';

export function useEthPriceChart() {
  return useQuery({
    queryKey: ['eth-price-chart'],
    queryFn: async () => {
      // Dummy data for simulation
      return [2400, 2420, 2410, 2440, 2435, 2451];
    },
  });
}
