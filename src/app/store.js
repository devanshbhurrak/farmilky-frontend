import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/authSlice'
import { authApi } from "../features/api/authApi";
import { productApi } from "../features/api/productApi";
import { cartApi } from "../features/api/cartApi";
import { orderApi } from "../features/api/orderApi";
import { subscriptionApi } from "../features/api/subscriptionApi";
import { invoiceApi } from "../features/api/invoiceApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [cartApi.reducerPath]: cartApi.reducer,
        [orderApi.reducerPath]: orderApi.reducer,
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
        [invoiceApi.reducerPath]: invoiceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(productApi.middleware)
            .concat(cartApi.middleware)
            .concat(orderApi.middleware)
            .concat(subscriptionApi.middleware)
            .concat(invoiceApi.middleware),
})