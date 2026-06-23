import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "../../app/baseQueryWithReauth";

const SUBSCRIPTION_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/subscriptions`;

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: createAuthBaseQuery(SUBSCRIPTION_API),
  tagTypes: ["Subscription"],

  endpoints: (builder) => ({
    createSubscription: builder.mutation({
      query: (data) => ({ url: "/", method: "POST", body: data }),
      invalidatesTags: ["Subscription"],
    }),

    getUserSubscriptions: builder.query({
      query: () => "/",
      providesTags: ["Subscription"],
    }),

    getSubscriptionById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Subscription"],
    }),

    pauseSubscription: builder.mutation({
      query: (id) => ({ url: `/${id}/pause`, method: "PUT" }),
      invalidatesTags: ["Subscription"],
    }),

    resumeSubscription: builder.mutation({
      query: (id) => ({ url: `/${id}/resume`, method: "PUT" }),
      invalidatesTags: ["Subscription"],
    }),

    cancelSubscription: builder.mutation({
      query: (id) => ({ url: `/${id}/cancel`, method: "PUT" }),
      invalidatesTags: ["Subscription"],
    }),

    updateSubscription: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Subscription"],
    }),

    scheduleQuantityChange: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/${id}/schedule-change`, method: "PUT", body: data }),
      invalidatesTags: ["Subscription"],
    }),

    cancelScheduledChange: builder.mutation({
      query: (id) => ({ url: `/${id}/schedule-change`, method: "DELETE" }),
      invalidatesTags: ["Subscription"],
    }),

    scheduleVacation: builder.mutation({
      query: ({ id, pauseFrom, pauseUntil }) => ({
        url: `/${id}/vacation`,
        method: "PUT",
        body: { pauseFrom, pauseUntil },
      }),
      invalidatesTags: ["Subscription"],
    }),

    cancelVacation: builder.mutation({
      query: (id) => ({ url: `/${id}/vacation`, method: "DELETE" }),
      invalidatesTags: ["Subscription"],
    }),

    skipDeliveryDate: builder.mutation({
      query: ({ id, date }) => ({ url: `/${id}/skip`, method: "PUT", body: { date } }),
      invalidatesTags: ["Subscription"],
    }),

    unskipDeliveryDate: builder.mutation({
      query: ({ id, date }) => ({ url: `/${id}/unskip`, method: "PUT", body: { date } }),
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
  useUpdateSubscriptionMutation,
  useScheduleQuantityChangeMutation,
  useCancelScheduledChangeMutation,
  useScheduleVacationMutation,
  useCancelVacationMutation,
  useSkipDeliveryDateMutation,
  useUnskipDeliveryDateMutation,
} = subscriptionApi;
