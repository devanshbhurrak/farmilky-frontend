import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const RETURN_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/returns`;

export const returnApi = createApi({
  reducerPath: "returnApi",
  baseQuery: fetchBaseQuery({
    baseUrl: RETURN_API,
    credentials: "include",
  }),
  tagTypes: ["Return"],

  endpoints: (builder) => ({
    requestReturn: builder.mutation({
      query: (data) => ({ url: "/", method: "POST", body: data }),
      invalidatesTags: ["Return"],
    }),

    getMyReturns: builder.query({
      query: () => "/my",
      providesTags: ["Return"],
    }),
  }),
});

export const { useRequestReturnMutation, useGetMyReturnsQuery } = returnApi;
