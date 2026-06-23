import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CONTACT_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/contact`;

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({ baseUrl: CONTACT_API }),
  endpoints: (builder) => ({
    submitContactMessage: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSubmitContactMessageMutation } = contactApi;
