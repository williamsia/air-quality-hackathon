import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Amplify } from 'aws-amplify';
import { RatecardList } from './types.ts';

export const ratecardApi = createApi({
	reducerPath: 'ratecardApi',
	tagTypes: ['Ratecard', 'RatecardList'],
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
		listRatecards: builder.query<RatecardList, { regions: string[], usageTypes: string[], startDate: string, endDate: string }>({
			query: ({ regions, usageTypes, endDate, startDate }) => {
				let baseUrl = `ratecards?endDate=${endDate}&startDate=${startDate}`;
				if (regions.length > 0) {
					baseUrl += `&regions=${regions.join(',')}`;
				}
				if (usageTypes.length > 0) {
					baseUrl += `&usageTypes=${usageTypes.join(',')}`;
				}
				return baseUrl;
			},
			providesTags: ['RatecardList']
		})
	})
});

export const { useListRatecardsQuery } = ratecardApi;
