import { useQuery } from '@tanstack/react-query';

export const useEthPrice = () => {
    return useQuery({
        queryKey: ['eth-price'],
        queryFn: async () => {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=krw') 
            if (!response.ok) {
                throw new Error("요청이 실패했습니다.")
            }   

            const data = await response.json();
            return data.ethereum.krw as number;
        },
        refetchInterval: 3000
    })
}