import { baseApi, formatPrice } from '@/src/shared';
import { format } from 'date-fns';

interface CoinGeckoResponse {
  ethereum: {
    krw: number;
    krwChange: number;
  };
}

export interface EthPriceResult {
  price: string;
  change: number;
  updatedAt: string;
}

export const cryptoApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getEthPrice: builder.query<EthPriceResult, void>({
      query: () =>
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=krw&include_24hr_change=true',

      providesTags: ['ETH_PRICE'],

      transformResponse: (response: CoinGeckoResponse): EthPriceResult => {
        return {
          price: formatPrice(response.ethereum.krw),
          change: response.ethereum.krwChange || 0,
          updatedAt: format(Date.now(), 'HH:mm:ss'),
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetEthPriceQuery } = cryptoApi;
