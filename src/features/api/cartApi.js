import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "../../app/baseQueryWithReauth";

const CART_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/cart`;

export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: createAuthBaseQuery(CART_API),
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
                            const resolvedVariantId = arg.variantId ?? null;
                            // Check if same product+variant already in cart
                            const existing = draft.items.find(i =>
                                (i.productId?._id || i.productId) === arg._product._id &&
                                String(i.variantId ?? null) === String(resolvedVariantId)
                            );
                            if (existing) {
                                existing.quantity += arg.quantity || 1;
                            } else {
                                const variantLabel = resolvedVariantId && arg._product.variants?.length > 0
                                    ? (arg._product.variants.find(v => String(v._id) === String(resolvedVariantId))?.label ?? null)
                                    : null;
                                draft.items.push({
                                    productId: arg._product,
                                    quantity: arg.quantity || 1,
                                    variantId: resolvedVariantId,
                                    variantLabel,
                                });
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
            invalidatesTags: ['Cart']
        }),

        updateCartItem: builder.mutation({
            query: (data) => ({
                url: "/update",
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted({ productId, quantity, variantId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft && draft.items) {
                            const normalizedVariantId = variantId ?? null;
                            const item = draft.items.find(i =>
                                (i.productId?._id || i.productId) === productId &&
                                String(i.variantId ?? null) === String(normalizedVariantId)
                            );
                            if (item) {
                                if (quantity <= 0) {
                                    draft.items = draft.items.filter(i =>
                                        !((i.productId?._id || i.productId) === productId &&
                                          String(i.variantId ?? null) === String(normalizedVariantId))
                                    );
                                } else {
                                    item.quantity = quantity;
                                }
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
            async onQueryStarted({ productId, variantId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft && draft.items) {
                            const normalizedVariantId = variantId ?? null;
                            draft.items = draft.items.filter(i =>
                                !((i.productId?._id || i.productId) === productId &&
                                  String(i.variantId ?? null) === String(normalizedVariantId))
                            );
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
