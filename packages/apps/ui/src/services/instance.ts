import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Amplify } from 'aws-amplify';
import { InstanceTypeList } from './types.ts';

export const instanceTypeApi = createApi({
	reducerPath: 'instanceTypeApi',
	tagTypes: ['InstanceType', 'InstanceTypeList'],
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_SCENARIO_API_BASE_URL,
		prepareHeaders: async (headers) => {
			const session = await Amplify.Auth.currentSession();
			headers.set('authorization', `Bearer ${session.getIdToken().getJwtToken()}`);
			headers.set('accept-version', `1.0.0`);
			return headers;
		}
	}),

	endpoints: (builder) => ({
		listInstanceTypeList: builder.query<InstanceTypeList, { startDate: string }>({
			query: ({ startDate }) => `instanceTypes?startDate=${startDate}`,
			providesTags: ['InstanceTypeList']
		})
	})
});

export const { useListInstanceTypeListQuery } = instanceTypeApi;
