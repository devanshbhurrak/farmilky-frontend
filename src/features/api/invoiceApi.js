import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const INVOICE_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/invoices`;

export const invoiceApi = createApi({
    reducerPath: "invoiceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: INVOICE_API,
        prepareHeaders: (headers) => {
            // Assuming you might store token in localStorage or cookie handles it
            // Since cookie-parser is used, browser handles credentials: true
            return headers;
        },
    }),
    tagTypes: ["Invoice"],
    endpoints: (builder) => ({
        getMyInvoices: builder.query({
            query: () => "/my-invoices",
            providesTags: ["Invoice"],
        }),
    }),
});

export const { useGetMyInvoicesQuery } = invoiceApi;
