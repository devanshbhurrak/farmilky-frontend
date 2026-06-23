import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logoutUser } from "../features/authSlice";

/**
 * Creates an authenticated base query that intercepts 401 responses.
 * If the backend returns 401 while a user is logged in (expired session),
 * the user is automatically logged out and the ProtectedRoute will redirect
 * them to the login page on the next render.
 */
export const createAuthBaseQuery = (baseUrl) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include",
  });

  return async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      const { auth } = api.getState();
      // Only log out if a user session was active (expired JWT, not wrong credentials)
      if (auth.user) {
        api.dispatch(logoutUser());
      }
    }

    return result;
  };
};
