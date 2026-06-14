import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PASSBOOK_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/payments`;

export const passbookApi = createApi({
    reducerPath: "passbookApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: PASSBOOK_API,
        credentials: "include",
    }),
    tagTypes: ["Passbook"],
    endpoints: (builder) => ({
        getMyPassbook: builder.query({
            query: () => "/my-passbook",
            providesTags: ["Passbook"],
        }),
    }),
});

export const { useGetMyPassbookQuery } = passbookApi;
