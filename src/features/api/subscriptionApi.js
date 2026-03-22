import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SUBSCRIPTION_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/subscriptions`;

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SUBSCRIPTION_API,
    credentials: "include", // cookie-based auth
  }),
  tagTypes: ["Subscription"],

  endpoints: (builder) => ({
    // CREATE SUBSCRIPTION
    createSubscription: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),

    // GET USER SUBSCRIPTIONS
    getUserSubscriptions: builder.query({
      query: () => "/",
      providesTags: ["Subscription"],
    }),

    getSubscriptionById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Subscription"],
    }),

    // PAUSE
    pauseSubscription: builder.mutation({
      query: (id) => ({
        url: `/${id}/pause`,
        method: "PUT",
      }),
      invalidatesTags: ["Subscription"],
    }),

    // RESUME
    resumeSubscription: builder.mutation({
      query: (id) => ({
        url: `/${id}/resume`,
        method: "PUT",
      }),
      invalidatesTags: ["Subscription"],
    }),

    // CANCEL
    cancelSubscription: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useCreateSubscriptionMutation,
  useGetSubscriptionByIdQuery,
  useGetUserSubscriptionsQuery,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
