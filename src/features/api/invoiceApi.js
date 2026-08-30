import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "../../app/baseQueryWithReauth";

const INVOICE_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/invoices`;

export const invoiceApi = createApi({
    reducerPath: "invoiceApi",
    baseQuery: createAuthBaseQuery(INVOICE_API),
    tagTypes: ["Invoice"],
    endpoints: (builder) => ({
        getMyInvoices: builder.query({
            query: ({ month, year, page = 1 } = {}) => {
                const params = new URLSearchParams();
                if (month) params.set("month", month);
                if (year) params.set("year", year);
                params.set("page", page);
                params.set("limit", 12);
                return `/my?${params.toString()}`;
            },
            providesTags: ["Invoice"],
        }),
        getMyInvoiceDetail: builder.query({
            query: (id) => `/my/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Invoice", id }],
        }),
    }),
});

export const { useGetMyInvoicesQuery, useGetMyInvoiceDetailQuery } = invoiceApi;
