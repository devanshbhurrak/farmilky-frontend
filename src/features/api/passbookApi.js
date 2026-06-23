import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "../../app/baseQueryWithReauth";

const PASSBOOK_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/payments`;

export const passbookApi = createApi({
    reducerPath: "passbookApi",
    baseQuery: createAuthBaseQuery(PASSBOOK_API),
    tagTypes: ["Passbook"],
    endpoints: (builder) => ({
        getMyPassbook: builder.query({
            query: () => "/my-passbook",
            providesTags: ["Passbook"],
        }),
    }),
});

export const { useGetMyPassbookQuery } = passbookApi;
