import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const PRODUCT_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/products`;

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({baseUrl: PRODUCT_API}),
    tagTypes: ["Products"],

    endpoints: (builder) => ({
        getAllProducts: builder.query({
            query: () => "/",
            providesTags: ["Products"]
        }),

        getProductById: builder.query({
            query: (id) => `/${id}`,
        }),

        createProduct: builder.mutation({
            query: (data) => ({
                url: '/',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ["Products"]
        })
    })
})

export const {
    useGetAllProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation
} = productApi
