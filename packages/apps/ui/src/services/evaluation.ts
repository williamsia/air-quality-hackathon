import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Evaluation, EvaluationList, LineItem, LineItemList } from './types';
import { Amplify } from 'aws-amplify';
import { parse } from 'papaparse';

export const evaluationApi = createApi({
	reducerPath: 'evaluationApi',
	tagTypes: ['Evaluation', 'EvaluationList', 'Baseline'],
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
		getBaseline: builder.query<LineItemList, { id: string, expiration?: number, startDate: string, endDate: string }>({
			query: ({ id, ...body }) => ({
				url: `evaluations/${id}/baseline`,
				method: 'POST',
				body,
				providesTags: ['Baseline']
			}),
			transformResponse: async (response: { url: string }): Promise<LineItemList> => {
				const results = await fetch(response.url);
				const parsedResult = parse<LineItem>(await results.text(), { header: true, skipEmptyLines: true, dynamicTyping: true });
				return parsedResult.data;
			}
		}),
		updateEvaluation: builder.mutation<Evaluation, Partial<Evaluation>>({
			query({ id, ...body }) {
				return {
					url: `evaluations/${id}`,
					method: 'PATCH',
					body
				};
			},
			invalidatesTags: ['Evaluation', 'EvaluationList', 'Baseline']
		}),
		deleteEvaluation: builder.mutation<void, Partial<Evaluation>>({
			query({ id, name, description }) {
				return {
					url: `evaluations/${id}`,
					method: 'DELETE',
					body: {
						name, description
					}
				};
			},
			invalidatesTags: ['Evaluation', 'EvaluationList', 'Baseline']
		}),
		createEvaluation: builder.mutation<Evaluation, Partial<Evaluation>>({
			query(body) {
				return {
					url: `evaluations`,
					method: 'POST',
					body
				};
			},
			invalidatesTags: ['EvaluationList', 'Baseline']
		}),
		listEvaluations: builder.query<EvaluationList, void>({
			query: () => `evaluations`,
			providesTags: ['EvaluationList', 'Baseline']
		}),
		getEvaluation: builder.query<Evaluation, string>({
			query: (id: string) => `evaluations/${id}`,
			providesTags: ['Evaluation', 'Baseline']
		})
	})
});

export const { useDeleteEvaluationMutation, useGetEvaluationQuery, useUpdateEvaluationMutation, useListEvaluationsQuery, useCreateEvaluationMutation, useLazyGetBaselineQuery } = evaluationApi;
