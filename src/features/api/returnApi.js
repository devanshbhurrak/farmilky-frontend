import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "../../app/baseQueryWithReauth";

const RETURN_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/returns`;

export const returnApi = createApi({
  reducerPath: "returnApi",
  baseQuery: createAuthBaseQuery(RETURN_API),
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
