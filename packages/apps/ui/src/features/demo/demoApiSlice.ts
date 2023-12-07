import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { Auth } from "aws-amplify"

export const getToken: () => Promise<string> = async () => {
  const session = await Auth.currentSession()
  return session.getIdToken().getJwtToken()
}

const demoApiUrl = import.meta.env.VITE_BASE_API_URL
export const demoApiSlice = createApi({
  reducerPath: "demoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: demoApiUrl,
    prepareHeaders: async (headers) => {
      const accessToken = await getToken()
      headers.set("Authorization", `Bearer ${accessToken}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    getParts: builder.query<any, void>({
        query: () => ({
          url: `/parts`,
          mode: "cors",
          method: "GET",
        }),
      }),
  }),
})
export const { useGetPartsQuery } = demoApiSlice;
