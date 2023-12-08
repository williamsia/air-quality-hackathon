import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AccountList } from './types';
import { Amplify } from 'aws-amplify';

export const accountApi = createApi({
	reducerPath: 'accountApi',
	tagTypes: ['Account', 'AccountList'],
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
		listAccounts: builder.query<AccountList, void>({
			query: () => `accounts`, providesTags: ['AccountList']
		})
	})
});

export const { useListAccountsQuery } = accountApi;
