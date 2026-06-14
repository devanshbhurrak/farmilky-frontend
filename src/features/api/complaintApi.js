import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COMPLAINT_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/complaints`;

export const complaintApi = createApi({
  reducerPath: "complaintApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COMPLAINT_API,
    credentials: "include",
  }),
  tagTypes: ["Complaint"],

  endpoints: (builder) => ({
    createComplaint: builder.mutation({
      query: (data) => ({ url: "/", method: "POST", body: data }),
      invalidatesTags: ["Complaint"],
    }),

    getMyComplaints: builder.query({
      query: () => "/my",
      providesTags: ["Complaint"],
    }),

    getComplaintById: builder.query({
      query: (id) => `/my/${id}`,
      providesTags: ["Complaint"],
    }),
  }),
});

export const {
  useCreateComplaintMutation,
  useGetMyComplaintsQuery,
  useGetComplaintByIdQuery,
} = complaintApi;
