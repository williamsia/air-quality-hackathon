import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Evaluation, Scenario, ScenarioList, LineItemDelta, LineItemDeltaList, LineItemSummary } from './types';
import { Amplify } from 'aws-amplify';
import { parse, unparse } from 'papaparse';

export const scenarioApi = createApi({
	reducerPath: 'scenarioApi',
	tagTypes: ['Scenario', 'ScenarioList'],
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
		updateScenario: builder.mutation<Scenario, Partial<Scenario>>({
			query({ evaluationId, id, ...body }) {
				return {
					url: `evaluations/${evaluationId}/scenarios/${id}`,
					method: 'PATCH',
					body
				};
			},
			invalidatesTags: ['Scenario', 'ScenarioList']
		}),
		deleteScenario: builder.mutation<void, Partial<Scenario>>({
			query({ evaluationId, id, name, description }) {
				return {
					url: `evaluations/${evaluationId}/scenarios/${id}`,
					method: 'DELETE',
					body: {
						name, description
					}
				};
			},
			invalidatesTags: ['Scenario', 'ScenarioList']
		}),
		getScenarioServiceItem: builder.mutation<LineItemDeltaList | LineItemSummary, Partial<{ scenarioId: string, itemType: 'items' | 'summary', evaluationId: string, service: string }>>({
			query(body) {
				return {
					url: `/evaluations/${body.evaluationId}/scenarios/${body.scenarioId}/items`,
					method: 'POST',
					body: {
						service: body.service,
						itemType: body.itemType,
						requestType: 'download',
						expiration: 300
					}
				};
			},
			transformResponse: async (response: { url: string }, _meta, arg): Promise<LineItemDeltaList | LineItemSummary> => {
				const results = await fetch(response.url);
				if (arg.itemType === 'summary') {
					return JSON.parse(await results.text());
				} else {
					return parse(await results.text(), { header: true, skipEmptyLines: true }).data as any;
				}
			},
			invalidatesTags: []
		}),
		createScenarioServiceItem: builder.mutation<void, Partial<{ scenarioId: string, itemType: 'items' | 'summary', evaluationId: string, service: string, items: LineItemDelta[] | LineItemSummary }>>({
			query(body) {
				return {
					url: `/evaluations/${body.evaluationId}/scenarios/${body.scenarioId}/items`,
					method: 'POST',
					body: {
						service: body.service,
						itemType: body.itemType,
						requestType: 'upload',
						expiration: 300
					}
				};
			},
			transformResponse: async (response: { url: string }, _meta, arg): Promise<void> => {
				const { items } = arg;
				await fetch(response.url, {
					method: 'PUT',
					headers: {
						'Content-Type': arg.itemType === 'summary' ? 'application/json' : 'text/csv'
					},
					body: arg.itemType == 'summary' ? JSON.stringify(items) : unparse(items as any)
				});
			},
			invalidatesTags: []
		}),
		createScenario: builder.mutation<Scenario, Partial<Scenario>>({
			query(body) {
				return {
					url: `evaluations/${body.evaluationId}/scenarios`,
					method: 'POST',
					body: {
						...body
					}
				};
			},

			invalidatesTags: ['ScenarioList']
		}),
		listScenarios: builder.query<ScenarioList, Partial<Evaluation>>({
			query: ({ id }) => `evaluations/${id}/scenarios`,
			providesTags: ['ScenarioList']
		}),
		getScenario: builder.query<Scenario, Partial<Scenario>>({
			query: ({ evaluationId, id }) => `evaluations/${evaluationId}/scenarios/${id}`,
			providesTags: ['Scenario']
		})
	})
});

export const { useDeleteScenarioMutation, useGetScenarioQuery, useUpdateScenarioMutation, useListScenariosQuery, useCreateScenarioMutation, useCreateScenarioServiceItemMutation, useGetScenarioServiceItemMutation } = scenarioApi;
