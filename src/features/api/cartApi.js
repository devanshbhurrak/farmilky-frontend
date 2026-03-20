import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const CART_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/cart`;

export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: fetchBaseQuery({
        baseUrl: CART_API,
        credentials: 'include',
    }),
    tagTypes: ["Cart"],

    endpoints: (builder) => ({
        getCart: builder.query({
            query: () => "/",
            providesTags: ["Cart"],
        }),

        addToCart: builder.mutation({
            query: (data) => {
                const { _product, ...body } = data;
                return {
                    url: '/add',
                    method: 'POST',
                    body: body,
                };
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft && draft.items && arg._product) {
                            draft.items.push({
                                productId: arg._product,
                                quantity: arg.quantity || 1
                            });
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ['Cart']
        }),
        updateCartItem: builder.mutation({
            query: (data) => ({
                url: "/update",
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft && draft.items) {
                            const item = draft.items.find(i => i.productId._id === productId);
                            if (item) {
                                item.quantity = quantity;
                            }
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ["Cart"]
        }),
        removeFromCart: builder.mutation({
            query: (data) => ({
                url: '/remove',
                method: 'DELETE',
                body: data,
            }),
            async onQueryStarted({ productId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft && draft.items) {
                            draft.items = draft.items.filter(i => i.productId._id !== productId);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ['Cart']
        }),
        clearCart: builder.mutation({
            query: () => ({
                url: '/clear',
                method: 'DELETE'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft) {
                            draft.items = [];
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ['Cart']
        })
    })
})

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = cartApi
