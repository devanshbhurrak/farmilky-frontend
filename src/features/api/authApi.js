import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { resetUserScopedApiState } from '../../app/resetUserScopedApiState';
import { loginUser, logoutUser } from '../authSlice';

const USER_API = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/`;

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (data) => ({
                url: 'register',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled
                    resetUserScopedApiState(dispatch)
                    dispatch(loginUser(result.data.user))
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        loginUser: builder.mutation({
            query: (data) => ({
                url: 'login',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled
                    resetUserScopedApiState(dispatch)
                    dispatch(loginUser(result.data.user))
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: 'logout',
                method: 'POST'
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                try {
                    await queryFulfilled;
                    resetUserScopedApiState(dispatch)
                    dispatch(logoutUser())
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: 'profile',
                method: 'PUT',
                body: data
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled
                    dispatch(loginUser(result.data.user))
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        getUserProfile: builder.query({
            query: () => ({
                url: 'profile',
                method: 'GET',
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled
                    dispatch(loginUser(result.data.user))
                } catch (error) {
                    console.log(error)
                }
            }
        })
    })
})

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useUpdateProfileMutation,
    useGetUserProfileQuery,
} = authApi
