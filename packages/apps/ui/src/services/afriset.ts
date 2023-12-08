import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Amplify } from 'aws-amplify';

export const afrisetApi = createApi({
	reducerPath: 'afrisetApi',
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
		uploadFile: builder.mutation<{feedId: string}, Partial<{ dataRow: number; file: File; fileType: "json" | "csv" }>>({
			query(body) {
				return {
					url: `/feeds`,
					method: 'POST',
					body: {
                        dataRow: body.dataRow
						// requestType: 'upload',
						// expiration: 300
					}
				};
			},
			transformResponse: async (response: { url: string; feedId: string; }, _meta, arg): Promise<{feedId: string}> => {
				await fetch(response.url, {
					method: 'PUT',
					headers: {
						// 'Content-Type': arg.fileType === 'json' ? 'application/json' : 'text/csv'
                        'Content-Type': 'multipart/form-data'
					},
					body: arg.file
				});
                return {
                    feedId: response.feedId
                }
			},
			invalidatesTags: []
		}),
        getDownloadUrl: builder.query<string, {feedId: string}>({
            query(body) {
                return {
                    url: `/measurements`,
                    method: 'GET',
                    params: {
                        download: true,
                        feedId: body.feedId
                    }
                };
            },
            transformResponse: (response: {url: string}) => {
                return response.url;
            }
     
    }),
	})
});

export const { useUploadFileMutation, useLazyGetDownloadUrlQuery } = afrisetApi;
