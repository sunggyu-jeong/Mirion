import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { TAG_LIST } from './types';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),

  tagTypes: TAG_LIST,

  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});
