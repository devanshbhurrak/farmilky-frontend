import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { cartApi } from "./cartApi";

const ORDER_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/order`;

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ORDER_API,
    credentials: "include", // send JWT cookie
  }),
  tagTypes: ["Orders"],

  endpoints: (builder) => ({
    // ======================
    // CREATE ORDER
    // ======================
    createOrder: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data, // { address, paymentMethod }
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            cartApi.util.updateQueryData("getCart", undefined, (draft) => {
              if (draft) {
                draft.items = [];
              }
            })
          );

          if (data?.order?._id) {
            dispatch(
              orderApi.util.upsertQueryData("getOrderById", data.order._id, data)
            );
          }
        } catch (error) {
          console.log(error);
        }
      },
      invalidatesTags: ["Orders"],
    }),

    // ======================
    // GET USER ORDERS
    // ======================
    getUserOrders: builder.query({
      query: () => "/",
      providesTags: ["Orders"],
    }),

    // ======================
    // GET ORDER BY ID
    // ======================
    getOrderById: builder.query({
      query: (id) => `/${id}`,
    }),

    // ======================
    // CANCEL ORDER
    // ======================
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Orders"],
    }),

    // ======================
    // ADMIN: GET ALL ORDERS
    // ======================
    getAllOrders: builder.query({
      query: () => "/admin/all",
      providesTags: ["Orders"],
    }),

    // ======================
    // ADMIN: UPDATE ORDER STATUS
    // ======================
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
