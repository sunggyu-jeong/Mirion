import { fetchUserHistory } from "@/entities/history/api/fetchTransaction";
import type { HistoryItem } from "@/entities/history/model";
import { baseApi } from "@/shared";

export const historyApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUserHistory: builder.query<HistoryItem[], string>({
      queryFn: async userAddress => {
        try {
          const data = await fetchUserHistory(userAddress as `0x${string}`);
          return { data };
        } catch (err: any) {
          console.log('>>>>>>>>> history Api Call Failed', err);
          return { error: err?.message ?? '알 수 없는 오류가 발생했습니다.' };
        }
      },
      providesTags: ['HISTORY'],
      keepUnusedDataFor: 180,
    }),
  }),
});

export const { useGetUserHistoryQuery } = historyApi;
