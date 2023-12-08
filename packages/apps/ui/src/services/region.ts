import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RegionList } from './types';
import { Amplify } from 'aws-amplify';

export const regionApi = createApi({
	reducerPath: 'regionApi',
	tagTypes: ['Region', 'RegionList'],
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
		listRegions: builder.query<RegionList, { productCode: string, productAttributeName: string, productAttributeValue: string, startDate: string }>({
			query: ({
						startDate,
						productCode,
						productAttributeValue,
						productAttributeName
					}) => `regions?startDate=${startDate}&productCode=${productCode}&productAttributeName=${productAttributeName}&productAttributeValue=${productAttributeValue}`,
			providesTags: ['RegionList']
		})
	})
});

export const { useListRegionsQuery } = regionApi;
