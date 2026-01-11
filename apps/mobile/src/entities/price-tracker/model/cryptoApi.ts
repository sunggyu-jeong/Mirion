import { format } from 'date-fns';

import { baseApi, formatPrice } from '@/src/shared';

interface CoinGeckoResponse {
  ethereum: { krw: number };
}

export interface EthPriceResult {
  price: string;
  updatedAt: string;
}

export const cryptoApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getEthPrice: builder.query<EthPriceResult, void>({
      query: () => 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=krw',

      providesTags: ['ETH_PRICE'],

      transformResponse: (response: CoinGeckoResponse): EthPriceResult => {
        return {
          price: formatPrice(response.ethereum.krw),

          updatedAt: format(Date.now(), 'HH:mm:ss'),
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetEthPriceQuery } = cryptoApi;
