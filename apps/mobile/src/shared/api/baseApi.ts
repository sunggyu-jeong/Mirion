import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { TAG_LIST } from '@/src/shared/api/types';

const BASE_URL = '';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: () => ({}),
  tagTypes: [...TAG_LIST],
});
